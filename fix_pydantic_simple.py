#!/usr/bin/env python3
"""
سكريبت بسيط لإصلاح مشكلة Pydantic Config في ملفات Schema
"""
import os
import re

def fix_single_file(filepath):
    """إصلاح ملف واحد"""
    print(f"🔍 Processing: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # تحقق من وجود class Config
        if "class Config:" not in content:
            print(f"✅ No Config class found in {filepath}")
            return
        
        # البحث عن class Config وحذفها
        # Pattern للبحث عن class Config مع محتوياتها
        config_pattern = r'\s*class Config:\s*\n\s*orm_mode\s*=\s*True\s*\n?'
        
        if re.search(config_pattern, content):
            # حذف class Config
            content = re.sub(config_pattern, '', content)
            
            # إضافة model_config بدلاً منها
            # البحث عن آخر import أو بداية class
            if 'model_config' not in content:
                # إضافة model_config في بداية أول class
                class_pattern = r'(class\s+\w+\([^)]*\):)'
                def add_model_config(match):
                    return f'{match.group(1)}\n    model_config = {{"from_attributes": True}}\n'
                
                content = re.sub(class_pattern, add_model_config, content, count=1)
            
            # كتابة الملف المحدث
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            
            print(f"✅ Fixed: {filepath}")
        else:
            print(f"⚠️ Config pattern not found in {filepath}")
            
    except Exception as e:
        print(f"❌ Error processing {filepath}: {e}")

def main():
    """الدالة الرئيسية"""
    schema_files = [
        "app/schemas/deduction.py",
        "app/schemas/end_of_service.py",
        "app/schemas/leave.py",
        "app/schemas/license.py",
        "app/schemas/license_documents.py",
        "app/schemas/license_schema.py",
        "app/schemas/medical.py",
        "app/schemas/performance.py",
        "app/schemas/rewards.py",
        "app/schemas/training.py",
        "app/schemas/violation.py",
        "app/schemas/worker_document.py",
        "app/schemas/company_document.py"
    ]
    
    print("🚀 Starting Pydantic Config Fix...")
    
    for filepath in schema_files:
        if os.path.exists(filepath):
            fix_single_file(filepath)
        else:
            print(f"⚠️ File not found: {filepath}")
    
    print("✅ Done!")

if __name__ == "__main__":
    main()
