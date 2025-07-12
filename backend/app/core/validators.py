from pydantic import validator, BaseModel
from typing import Optional
import re
from datetime import datetime, date

class BaseValidator(BaseModel):
    """Base validator with common validations"""
    
    @validator('phone', pre=True, always=True)
    def validate_phone(cls, v):
        if v is None:
            return v
        
        # إزالة المسافات والرموز
        phone = re.sub(r'[^\d+]', '', str(v))
        
        # التحقق من تنسيق الهاتف السعودي
        saudi_pattern = r'^(\+966|966|05|5)\d{8}$'
        if not re.match(saudi_pattern, phone):
            raise ValueError('رقم الهاتف غير صحيح. يجب أن يكون رقم سعودي صحيح')
        
        # تطبيع الرقم
        if phone.startswith('+966'):
            return phone
        elif phone.startswith('966'):
            return '+' + phone
        elif phone.startswith('05'):
            return '+966' + phone[1:]
        elif phone.startswith('5'):
            return '+966' + phone
        
        return phone
    
    @validator('email', pre=True, always=True)
    def validate_email(cls, v):
        if v is None:
            return v
        
        email_pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        if not re.match(email_pattern, str(v)):
            raise ValueError('البريد الإلكتروني غير صحيح')
        
        return str(v).lower()

class NameValidator(BaseModel):
    """Validator for names (Arabic and English)"""
    
    @validator('*', pre=True, always=True)
    def validate_name(cls, v, field):
        if v is None:
            return v
        
        # التحقق من وجود النص
        name = str(v).strip()
        if not name:
            raise ValueError(f'{field.name} مطلوب')
        
        # التحقق من الطول
        if len(name) < 2:
            raise ValueError(f'{field.name} يجب أن يكون على الأقل حرفين')
        
        if len(name) > 100:
            raise ValueError(f'{field.name} طويل جداً')
        
        # التحقق من الأحرف المسموحة (عربي وإنجليزي ومسافات)
        allowed_pattern = r'^[\u0600-\u06FFa-zA-Z\s\-\.]+$'
        if not re.match(allowed_pattern, name):
            raise ValueError(f'{field.name} يحتوي على أحرف غير مسموحة')
        
        return name

class DateValidator(BaseModel):
    """Validator for dates"""
    
    @validator('*', pre=True, always=True)
    def validate_date(cls, v, field):
        if v is None:
            return v
        
        # إذا كان التاريخ string، تحويله
        if isinstance(v, str):
            try:
                # محاولة تحليل التاريخ بصيغ مختلفة
                formats = ['%Y-%m-%d', '%d/%m/%Y', '%m/%d/%Y', '%Y-%m-%d %H:%M:%S']
                
                for fmt in formats:
                    try:
                        parsed_date = datetime.strptime(v, fmt)
                        return parsed_date.date() if 'date' in field.name else parsed_date
                    except ValueError:
                        continue
                
                raise ValueError(f'تنسيق التاريخ غير صحيح في {field.name}')
                
            except Exception:
                raise ValueError(f'تنسيق التاريخ غير صحيح في {field.name}')
        
        return v

class BusinessValidator(BaseModel):
    """Validator for business-related fields"""
    
    @validator('registration_number', pre=True, always=True)
    def validate_registration_number(cls, v):
        if v is None:
            return v
        
        reg_num = str(v).strip()
        
        # التحقق من رقم السجل التجاري السعودي (10 أرقام)
        if not re.match(r'^\d{10}$', reg_num):
            raise ValueError('رقم السجل التجاري يجب أن يكون 10 أرقام')
        
        return reg_num
    
    @validator('tax_number', pre=True, always=True)
    def validate_tax_number(cls, v):
        if v is None:
            return v
        
        tax_num = str(v).strip()
        
        # التحقق من الرقم الضريبي السعودي (15 رقم)
        if not re.match(r'^\d{15}$', tax_num):
            raise ValueError('الرقم الضريبي يجب أن يكون 15 رقم')
        
        return tax_num

class SecurityValidator(BaseModel):
    """Validator for security-related fields"""
    
    @validator('password', pre=True, always=True)
    def validate_password(cls, v):
        if v is None:
            return v
        
        password = str(v)
        
        # التحقق من طول كلمة المرور
        if len(password) < 8:
            raise ValueError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
        
        # التحقق من وجود أحرف كبيرة وصغيرة وأرقام
        if not re.search(r'[A-Z]', password):
            raise ValueError('كلمة المرور يجب أن تحتوي على حرف كبير واحد على الأقل')
        
        if not re.search(r'[a-z]', password):
            raise ValueError('كلمة المرور يجب أن تحتوي على حرف صغير واحد على الأقل')
        
        if not re.search(r'\d', password):
            raise ValueError('كلمة المرور يجب أن تحتوي على رقم واحد على الأقل')
        
        return password
