import re
from datetime import datetime
from typing import Dict, Any, Optional, List
import pytesseract
from PIL import Image
import pdf2image
import fitz  # PyMuPDF
import arabic_reshaper
from bidi.algorithm import get_display

class SmartDocumentExtractor:
    """نظام ذكي لاستخراج المعلومات من مستندات الشركة"""
    
    def __init__(self):
        self.license_patterns = {
            "commercial_license": {
                "patterns": [
                    r"رخصة\s*تجارية|تجاري|commercial\s*license",
                    r"رقم\s*الرخصة|license\s*number|License\s*No",
                    r"وزارة\s*التجارة|ministry\s*of\s*commerce",
                    r"غرفة\s*تجارية|chamber\s*of\s*commerce"
                ],
                "number_patterns": [
                    r"رقم\s*الرخصة[\s:]*(\d+[\d/\-]*)",
                    r"License\s*No[\s:]*(\d+[\d/\-]*)",
                    r"رقم[\s:]*(\d+[\d/\-]*)",
                    r"(\d{4}/\d+)",
                    r"(\d+/\d{4})"
                ],
                "date_patterns": [
                    r"تاريخ\s*الإصدار[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
                    r"Issue\s*Date[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
                    r"تاريخ\s*الانتهاء[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
                    r"Expiry\s*Date[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})"
                ]
            },
            "import_license": {
                "patterns": [
                    r"رخصة\s*استيراد|import\s*license",
                    r"استيراد|import",
                    r"جمارك|customs"
                ],
                "number_patterns": [
                    r"رقم\s*الرخصة[\s:]*(\d+[\d/\-]*)",
                    r"Import\s*License\s*No[\s:]*(\d+[\d/\-]*)",
                    r"(\d+/\d{4})"
                ]
            },
            "advertisement_license": {
                "patterns": [
                    r"رخصة\s*إعلان|advertisement\s*license",
                    r"إعلان|advertisement",
                    r"دعاية|publicity"
                ],
                "number_patterns": [
                    r"رقم\s*الرخصة[\s:]*(\d+[\d/\-]*)",
                    r"Advertisement\s*License\s*No[\s:]*(\d+[\d/\-]*)"
                ]
            },
            "health_certificate": {
                "patterns": [
                    r"شهادة\s*صحية|health\s*certificate",
                    r"وزارة\s*الصحة|ministry\s*of\s*health",
                    r"صحة|health"
                ]
            },
            "fire_safety_certificate": {
                "patterns": [
                    r"شهادة\s*سلامة|safety\s*certificate",
                    r"سلامة\s*من\s*الحريق|fire\s*safety",
                    r"إدارة\s*الإطفاء|fire\s*department"
                ]
            },
            "environmental_permit": {
                "patterns": [
                    r"تصريح\s*بيئي|environmental\s*permit",
                    r"هيئة\s*البيئة|environment\s*authority",
                    r"بيئة|environment"
                ]
            },
            "labor_permit": {
                "patterns": [
                    r"تصريح\s*عمالة|labor\s*permit",
                    r"استقدام\s*عمالة|labor\s*recruitment",
                    r"وزارة\s*العمل|ministry\s*of\s*labor"
                ]
            },
            "tax_certificate": {
                "patterns": [
                    r"شهادة\s*ضريبة|tax\s*certificate",
                    r"ضريبة|tax",
                    r"إدارة\s*الضرائب|tax\s*authority"
                ]
            }
        }
    
    def extract_text_from_file(self, file_path: str) -> str:
        """استخراج النص من الملف (PDF أو صورة)"""
        try:
            if file_path.lower().endswith('.pdf'):
                return self._extract_from_pdf(file_path)
            elif file_path.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp')):
                return self._extract_from_image(file_path)
            else:
                return ""
        except Exception as e:
            print(f"خطأ في استخراج النص: {e}")
            return ""
    
    def _extract_from_pdf(self, file_path: str) -> str:
        """استخراج النص من PDF"""
        text = ""
        try:
            # محاولة استخراج النص مباشرة
            doc = fitz.open(file_path)
            for page in doc:
                text += page.get_text()
            doc.close()
            
            # إذا لم نجد نص، نحول إلى صور ونستخدم OCR
            if not text.strip():
                images = pdf2image.convert_from_path(file_path)
                for image in images:
                    text += pytesseract.image_to_string(image, lang='ara+eng')
            
            return text
        except Exception as e:
            print(f"خطأ في استخراج النص من PDF: {e}")
            return ""
    
    def _extract_from_image(self, file_path: str) -> str:
        """استخراج النص من الصورة باستخدام OCR"""
        try:
            image = Image.open(file_path)
            text = pytesseract.image_to_string(image, lang='ara+eng')
            return text
        except Exception as e:
            print(f"خطأ في استخراج النص من الصورة: {e}")
            return ""
    
    def detect_document_type(self, text: str) -> str:
        """تحديد نوع المستند من النص"""
        text_lower = text.lower()
        
        # تسجيل نقاط لكل نوع مستند
        scores = {}
        
        for doc_type, config in self.license_patterns.items():
            score = 0
            for pattern in config["patterns"]:
                matches = re.findall(pattern, text_lower, re.IGNORECASE)
                score += len(matches)
            scores[doc_type] = score
        
        # إرجاع النوع الأعلى نقاطاً
        if scores:
            best_type = max(scores, key=scores.get)
            if scores[best_type] > 0:
                return best_type
        
        return "other"
    
    def extract_license_number(self, text: str, doc_type: str) -> Optional[str]:
        """استخراج رقم الرخصة"""
        if doc_type not in self.license_patterns:
            return None
        
        patterns = self.license_patterns[doc_type].get("number_patterns", [])
        
        for pattern in patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0]
        
        # أنماط عامة لرقم الرخصة
        general_patterns = [
            r"(\d{4}/\d+)",
            r"(\d+/\d{4})",
            r"رقم[\s:]*(\d+)",
            r"No[\s:]*(\d+)"
        ]
        
        for pattern in general_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0]
        
        return None
    
    def extract_dates(self, text: str) -> Dict[str, Any]:
        """استخراج التواريخ من النص"""
        dates = {}
        
        # أنماط التواريخ المختلفة
        date_patterns = [
            r"تاريخ\s*الإصدار[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
            r"Issue\s*Date[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
            r"تاريخ\s*الانتهاء[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
            r"Expiry\s*Date[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
            r"انتهاء[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
            r"صدر\s*في[\s:]*(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})",
            r"(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})"
        ]
        
        found_dates = []
        for pattern in date_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            for match in matches:
                try:
                    # تحويل النص إلى تاريخ
                    date_obj = self._parse_date(match)
                    if date_obj:
                        found_dates.append(date_obj)
                except:
                    continue
        
        # ترتيب التواريخ وتحديد الإصدار والانتهاء
        if found_dates:
            found_dates.sort()
            dates['issue_date'] = found_dates[0]
            if len(found_dates) > 1:
                dates['expiry_date'] = found_dates[-1]
            else:
                dates['expiry_date'] = found_dates[0]
        
        return dates
    
    def _parse_date(self, date_str: str) -> Optional[datetime]:
        """تحويل النص إلى تاريخ"""
        date_formats = [
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%Y/%m/%d",
            "%Y-%m-%d",
            "%d/%m/%y",
            "%d-%m-%y"
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(date_str, fmt).date()
            except:
                continue
        
        return None
    
    def extract_issuing_authority(self, text: str) -> Optional[str]:
        """استخراج جهة الإصدار"""
        authority_patterns = [
            r"(وزارة\s*التجارة[^.\n]*)",
            r"(وزارة\s*الصحة[^.\n]*)",
            r"(وزارة\s*العمل[^.\n]*)",
            r"(هيئة\s*البيئة[^.\n]*)",
            r"(إدارة\s*الإطفاء[^.\n]*)",
            r"(غرفة\s*تجارية[^.\n]*)",
            r"(جمارك[^.\n]*)",
            r"(Ministry\s*of\s*[^.\n]*)",
            r"(Chamber\s*of\s*Commerce[^.\n]*)",
            r"(Authority[^.\n]*)"
        ]
        
        for pattern in authority_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        return None
    
    def extract_status(self, text: str) -> Optional[str]:
        """استخراج حالة المستند"""
        status_patterns = [
            r"(ساري\s*المفعول|فعال|نشط)",
            r"(منتهي\s*الصلاحية|منتهي|expired)",
            r"(معلق|suspended)",
            r"(ملغي|cancelled)",
            r"(Active|Valid|Expired|Suspended|Cancelled)"
        ]
        
        for pattern in status_patterns:
            matches = re.findall(pattern, text, re.IGNORECASE)
            if matches:
                return matches[0].strip()
        
        return "غير محدد"
    
    def extract_all_info(self, file_path: str) -> Dict[str, Any]:
        """استخراج جميع المعلومات من الملف"""
        text = self.extract_text_from_file(file_path)
        
        if not text:
            return {}
        
        # تحديد نوع المستند
        doc_type = self.detect_document_type(text)
        
        # استخراج المعلومات
        info = {
            'extracted_text': text,
            'document_type': doc_type,
            'license_number': self.extract_license_number(text, doc_type),
            'issuing_authority': self.extract_issuing_authority(text),
            'license_status': self.extract_status(text)
        }
        
        # استخراج التواريخ
        dates = self.extract_dates(text)
        info.update(dates)
        
        return info

# إنشاء مثيل عام للاستخدام
document_extractor = SmartDocumentExtractor()
