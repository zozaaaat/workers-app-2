#!/usr/bin/env python3
"""
سكريبت لإصلاح أخطاء الـ syntax في ملفات schema بعد تطبيق model_config
"""
import os
import re

def fix_syntax_errors(filepath):
    """إصلاح أخطاء الـ syntax في ملف واحد"""
    print(f"🔧 Fixing syntax in: {filepath}")
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # إصلاح المشاكل الشائعة
        # 1. إصلاح "Nonefrom_attributes = True" 
        content = re.sub(r'= Nonefrom_attributes = True', '= None', content)
        
        # 2. إصلاح "field_namefrom_attributes = True"
        content = re.sub(r'(\w+)\s*from_attributes = True', r'\1', content)
        
        # 3. إصلاح "field_nameclass NextClass"
        content = re.sub(r'(\w+)\s*class\s+(\w+)', r'\1\n\nclass \2', content)
        
        # 4. إصلاح ": Optional[type]class"
        content = re.sub(r'(:\s*Optional\[[^\]]+\])\s*class\s+(\w+)', r'\1\n\nclass \2', content)
        
        # 5. إصلاح "field: typeclass"
        content = re.sub(r'(:\s*\w+)\s*class\s+(\w+)', r'\1\n\nclass \2', content)
        
        # كتابة الملف
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed syntax in: {filepath}")
        return True
        
    except Exception as e:
        print(f"❌ Error fixing {filepath}: {e}")
        return False

def main():
    """الدالة الرئيسية"""
    schema_files = [
        "app/schemas/user.py",
        "app/schemas/worker.py",
        "app/schemas/absence.py",
        "app/schemas/notification.py",
        "app/schemas/license.py",
        "app/schemas/license_schema.py",
        "app/schemas/worker_document.py",
        "app/schemas/medical.py",
        "app/schemas/license_documents.py",
        "app/schemas/performance.py",
        "app/schemas/rewards.py",
        "app/schemas/training.py",
        "app/schemas/company_document.py"
    ]
    
    print("🚀 Starting syntax fixes...")
    
    fixed_count = 0
    for filepath in schema_files:
        if os.path.exists(filepath):
            if fix_syntax_errors(filepath):
                fixed_count += 1
        else:
            print(f"⚠️ File not found: {filepath}")
    
    print(f"\n✅ Fixed {fixed_count} files!")

if __name__ == "__main__":
    main()
