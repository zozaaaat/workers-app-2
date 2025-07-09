"""
Git Status and Change Summary Script
نص فحص حالة Git وملخص التغيرات
"""

import subprocess
import os
import json
from pathlib import Path
from datetime import datetime

class GitManager:
    def __init__(self):
        self.root_dir = Path(__file__).parent.parent
        
    def run_git_command(self, command: str) -> str:
        """تشغيل أمر Git وإرجاع النتيجة"""
        try:
            result = subprocess.run(
                f"git {command}",
                shell=True,
                cwd=self.root_dir,
                capture_output=True,
                text=True
            )
            return result.stdout.strip() if result.returncode == 0 else ""
        except Exception as e:
            print(f"خطأ في تشغيل git {command}: {e}")
            return ""
    
    def get_git_status(self):
        """الحصول على حالة Git"""
        print("📊 فحص حالة Git...")
        
        # فحص الفرع الحالي
        current_branch = self.run_git_command("branch --show-current")
        print(f"🌿 الفرع الحالي: {current_branch}")
        
        # فحص التغيرات غير المحفوظة
        status = self.run_git_command("status --porcelain")
        if status:
            print("📝 ملفات محدّثة غير محفوظة:")
            for line in status.split('\n'):
                if line.strip():
                    status_code = line[:2]
                    filename = line[3:]
                    if status_code == "??":
                        print(f"   ➕ جديد: {filename}")
                    elif status_code == " M":
                        print(f"   ✏️  محدّث: {filename}")
                    elif status_code == "A ":
                        print(f"   📁 مُضاف: {filename}")
                    else:
                        print(f"   🔄 {status_code}: {filename}")
        else:
            print("✅ لا توجد تغيرات غير محفوظة")
        
        return status
    
    def get_changed_files(self):
        """الحصول على قائمة الملفات المُحدّثة"""
        # الملفات المُحدّثة منذ آخر commit
        changed_files = self.run_git_command("diff --name-only HEAD").split('\n')
        
        # الملفات الجديدة غير المتتبعة
        untracked_files = []
        status_output = self.run_git_command("status --porcelain")
        for line in status_output.split('\n'):
            if line.startswith('??'):
                untracked_files.append(line[3:])
        
        return {
            "modified": [f for f in changed_files if f.strip()],
            "untracked": untracked_files
        }
    
    def categorize_changes(self):
        """تصنيف التغيرات حسب النوع"""
        files = self.get_changed_files()
        all_files = files["modified"] + files["untracked"]
        
        categories = {
            "backend": [],
            "frontend": [],
            "scripts": [],
            "documentation": [],
            "configuration": [],
            "database": []
        }
        
        for file in all_files:
            if not file.strip():
                continue
                
            if file.startswith("app/"):
                categories["backend"].append(file)
            elif file.startswith("frontend/"):
                categories["frontend"].append(file)
            elif file.startswith("scripts/"):
                categories["scripts"].append(file)
            elif file.startswith("alembic/"):
                categories["database"].append(file)
            elif file.endswith(".md") or file.endswith(".txt"):
                categories["documentation"].append(file)
            elif file.endswith(".json") or file.endswith(".conf") or "config" in file.lower():
                categories["configuration"].append(file)
            else:
                categories["configuration"].append(file)  # Default category
        
        return categories
    
    def create_commit_summary(self):
        """إنشاء ملخص للتغيرات المطلوب حفظها"""
        print("\n📋 ملخص التغيرات المطلوب حفظها:")
        print("=" * 50)
        
        categories = self.categorize_changes()
        total_files = sum(len(files) for files in categories.values())
        
        if total_files == 0:
            print("✅ لا توجد تغيرات جديدة للحفظ")
            return
        
        print(f"📁 إجمالي الملفات: {total_files}")
        print()
        
        for category, files in categories.items():
            if files:
                category_names = {
                    "backend": "🔧 Backend",
                    "frontend": "🎨 Frontend", 
                    "scripts": "🛠️ نصوص الأتمتة",
                    "documentation": "📋 التوثيق",
                    "configuration": "⚙️ ملفات التكوين",
                    "database": "🗄️ قاعدة البيانات"
                }
                
                print(f"{category_names.get(category, category)}:")
                for file in files[:10]:  # أول 10 ملفات فقط
                    print(f"   • {file}")
                
                if len(files) > 10:
                    print(f"   ... و {len(files) - 10} ملف آخر")
                print()
    
    def suggest_commit_message(self):
        """اقتراح رسالة commit"""
        categories = self.categorize_changes()
        
        # تحديد النوع الرئيسي للتغيرات
        main_changes = []
        if categories["backend"]:
            main_changes.append("Backend optimizations")
        if categories["frontend"]:
            main_changes.append("Frontend enhancements")
        if categories["database"]:
            main_changes.append("Database improvements")
        if categories["scripts"]:
            main_changes.append("Automation scripts")
        
        if main_changes:
            title = f"🚀 {' + '.join(main_changes)}"
        else:
            title = "🔄 General updates"
        
        return f"{title}\n\nImplemented performance optimizations and improvements\nDate: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
    
    def check_git_config(self):
        """فحص تكوين Git"""
        print("⚙️ فحص تكوين Git...")
        
        user_name = self.run_git_command("config user.name")
        user_email = self.run_git_command("config user.email")
        
        if user_name and user_email:
            print(f"👤 المستخدم: {user_name} <{user_email}>")
        else:
            print("⚠️ تكوين Git غير مكتمل. قم بتعيين الاسم والبريد الإلكتروني:")
            print("   git config --global user.name 'Your Name'")
            print("   git config --global user.email 'your.email@example.com'")
    
    def generate_commit_commands(self):
        """إنشاء أوامر Git للتنفيذ"""
        print("\n🚀 أوامر Git المقترحة:")
        print("-" * 30)
        
        categories = self.categorize_changes()
        
        if any(categories.values()):
            print("# إضافة جميع التغيرات")
            print("git add .")
            print()
            
            print("# أو إضافة تدريجية حسب النوع:")
            for category, files in categories.items():
                if files:
                    category_names = {
                        "backend": "Backend files",
                        "frontend": "Frontend files",
                        "scripts": "Scripts",
                        "documentation": "Documentation",
                        "configuration": "Configuration",
                        "database": "Database"
                    }
                    print(f"# {category_names.get(category, category)}")
                    for file in files[:5]:  # أول 5 ملفات فقط
                        print(f"git add \"{file}\"")
                    if len(files) > 5:
                        print(f"# ... و {len(files) - 5} ملف آخر")
                    print()
            
            suggested_message = self.suggest_commit_message()
            print("# حفظ التغيرات")
            print(f"git commit -m \"{suggested_message.split(chr(10))[0]}\"")
            print()
            print("# رفع إلى GitHub")
            print("git push origin main")
        else:
            print("✅ لا توجد تغيرات للحفظ")

def main():
    """الدالة الرئيسية"""
    print("🔍 فحص حالة Git وإعداد التغيرات للحفظ")
    print("=" * 50)
    
    git_manager = GitManager()
    
    # فحص تكوين Git
    git_manager.check_git_config()
    print()
    
    # فحص حالة Git
    status = git_manager.get_git_status()
    print()
    
    # عرض ملخص التغيرات
    git_manager.create_commit_summary()
    
    # عرض الأوامر المقترحة
    git_manager.generate_commit_commands()
    
    print("\n💡 نصائح:")
    print("• استخدم git-commit-performance.bat (Windows) أو git-commit-performance.sh (Linux/Mac)")
    print("• أو نفذ الأوامر أعلاه يدوياً")
    print("• تأكد من مراجعة التغيرات قبل الحفظ")

if __name__ == "__main__":
    main()
