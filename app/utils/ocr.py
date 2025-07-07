import pytesseract
from pdf2image import convert_from_path
from PIL import Image
import docx2txt
import os
import tempfile

def extract_text_from_pdf(pdf_path):
    images = convert_from_path(pdf_path)
    text = ""
    for img in images:
        text += pytesseract.image_to_string(img, lang='ara+eng')
    return text

def extract_text_from_image(image_path):
    img = Image.open(image_path)
    return pytesseract.image_to_string(img, lang='ara+eng')

def extract_text_from_docx(docx_path):
    return docx2txt.process(docx_path)

def extract_text_from_file(filepath):
    ext = os.path.splitext(filepath)[1].lower()
    if ext == '.pdf':
        return extract_text_from_pdf(filepath)
    elif ext in ['.jpg', '.jpeg', '.png', '.bmp']:
        return extract_text_from_image(filepath)
    elif ext in ['.docx']:
        return extract_text_from_docx(filepath)
    else:
        return ""
