#!/usr/bin/env python3
"""
سكريبت محسن لإصلاح مشكلة Pydantic Config في ملفات Schema
يتعامل مع ملفات بها أكثر من class Config
"""
import os
import re

def fix_single_file_advanced(filepath):
    """إصلاح ملف واحد - نسخة محسنة"""
    print(f"🔍 Processing: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # تحقق من وجود class Config
        if "class Config:" not in content:
            print(f"✅ No Config class found in {filepath}")
            return
        
        # البحث عن جميع class Config وحذفها
        # Pattern أكثر دقة للبحث عن class Config مع محتوياتها
        config_pattern = r'\s*class Config:\s*\n\s*orm_mode\s*=\s*True\s*\n?'
        
        # عد كم مرة موجود
        matches = re.findall(config_pattern, content)
        if matches:
            # حذف جميع class Config
            content = re.sub(config_pattern, '', content)
            print(f"   📝 Removed {len(matches)} Config classes")
            
            # إضافة model_config في كل class
            # البحث عن جميع الـ classes
            class_pattern = r'(class\s+\w+\([^)]*\):)(\s*\n)'
            
            def add_model_config(match):
                class_def = match.group(1)
                newline = match.group(2)
                return f'{class_def}{newline}    model_config = {{"from_attributes": True}}\n'
            
            # تطبيق التغيير على جميع الـ classes
            content = re.sub(class_pattern, add_model_config, content)
            
            # كتابة الملف المحدث
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Fixed: {filepath}")
        else:
            # جرب pattern أخرى للـ Config
            general_config_pattern = r'\s*class Config:\s*\n[^}]*?\n\s*(?=class|\Z)'
            
            if re.search(general_config_pattern, content, re.MULTILINE):
                # حذف class Config بشكل عام
                content = re.sub(general_config_pattern, '\n', content, flags=re.MULTILINE)
                
                # إضافة model_config
                class_pattern = r'(class\s+\w+\([^)]*\):)(\s*\n)'
                def add_model_config(match):
                    class_def = match.group(1)
                    newline = match.group(2)
                    return f'{class_def}{newline}    model_config = {{"from_attributes": True}}\n'
                
                content = re.sub(class_pattern, add_model_config, content)
                
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)
                
                print(f"✅ Fixed (general): {filepath}")
            else:
                print(f"⚠️ Config pattern not matched in {filepath}")
            
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")

def main():
    """الدالة الرئيسية"""
    schema_files = [
        "app/schemas/medical.py",
        "app/schemas/license_documents.py",
        "app/schemas/performance.py",
        "app/schemas/rewards.py",
        "app/schemas/training.py",
        "app/schemas/company_document.py"
    ]
    
    print("🚀 Starting Advanced Pydantic Config Fix...")
    
    for filepath in schema_files:
        if os.path.exists(filepath):
            fix_single_file_advanced(filepath)
        else:
            print(f"⚠️ File not found: {filepath}")
    
    print("✅ Done!")

if __name__ == "__main__":
    main()
