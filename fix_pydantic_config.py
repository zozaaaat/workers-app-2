#!/usr/bin/env python3
"""
Fix Pydantic v2 configuration issues
This script replaces old Config class with new model_config approach
"""
import os
import glob
import re

def fix_pydantic_config_file(filepath):
    """Fix Pydantic config in a single file"""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Track if we made changes
        original_content = content
        
        # Pattern to match class definitions with both model_config and Config
        pattern = r'(class\s+\w+\([^)]+\):\s*\n(?:\s*[^#\n]+\n)*?\s*model_config\s*=\s*\{[^}]*\})\s*\n\s*class\s+Config:\s*\n\s*orm_mode\s*=\s*True'
        
        # Replace pattern - remove the Config class
        content = re.sub(pattern, r'\1', content, flags=re.MULTILINE)
        
        # Pattern to match classes that only have Config class (no model_config)
        config_only_pattern = r'(class\s+\w+\([^)]+\):\s*\n(?:\s*[^#\n]+\n)*?)\s*class\s+Config:\s*\n\s*orm_mode\s*=\s*True'
        
        # Replace with model_config
        def replace_config_only(match):
            class_def = match.group(1)
            # Add model_config before the Config class
            return f'{class_def}    model_config = {{"from_attributes": True}}'
        
        content = re.sub(config_only_pattern, replace_config_only, content, flags=re.MULTILINE)
        
        # Write back if changes were made
        if content != original_content:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.write(content)
            print(f"✅ Fixed: {filepath}")
            return True
        else:
            print(f"⚪ No changes needed: {filepath}")
            return False
            
    except Exception as e:
        print(f"❌ Error processing {filepath}: {str(e)}")
        return False

def main():
    """Main function to fix all schema files"""
    print("🔧 Fixing Pydantic v2 configuration issues...")
    
    # Find all Python files in schemas directory
    schema_files = glob.glob("app/schemas/*.py")
    
    if not schema_files:
        print("❌ No schema files found in app/schemas/")
        return
    
    fixed_count = 0
    
    for filepath in schema_files:
        if fix_pydantic_config_file(filepath):
            fixed_count += 1
    
    print(f"\n✅ Fixed {fixed_count} files out of {len(schema_files)} total files")

if __name__ == "__main__":
    main()
