#!/usr/bin/env python3
"""
Project Cleanup Script - Remove Duplicate and Temporary Files
مسح الملفات المكررة والزائدة من المشروع
"""

import os
import shutil
import json
from pathlib import Path

def cleanup_project():
    """تنظيف المشروع من الملفات المكررة والزائدة"""
    
    base_path = Path("c:/Users/hp/Desktop/zeyad/workers-app")
    removed_files = []
    
    # قائمة الملفات المؤقتة والمكررة لحذفها
    files_to_remove = [
        # Python Test Files - ملفات الاختبار المؤقتة
        "check_users_database.py",
        "check_users_structure.py", 
        "comprehensive_frontend_fixer.py",
        "comprehensive_project_cleaner.py",
        "comprehensive_project_fixer.py",
        "comprehensive_test.py",
        "comprehensive_ui_fixer.py",
        "comprehensive_ui_test.py",
        "create_admin_user.py",
        "create_missing_tables.py",
        "detailed_frontend_analysis.py",
        "final_fix.py",
        "fix_frontend_issues.py",
        "fix_users_table.py",
        "fix_worker_documents_table.py",
        "frontend_critical_fixes.py",
        "frontend_fixes_test.py",
        "live_comprehensive_test.py",
        "meta_env_fixes_test.py",
        "project_cleaner.py",
        "project_status_report.py",
        "quick_fixes_test.py",
        "simple_api.py",
        "simple_test.py",
        "system_status_report.py",
        "test_login.py",
        "test_login_debug.py",
        "test_login_detailed.py",
        
        # Report Files - ملفات التقارير المؤقتة
        "CLEANUP_SUMMARY.md",
        "COMPREHENSIVE_FIXES_REPORT.md",
        "FINAL_COMPLETION_REPORT_COMPREHENSIVE.md",
        "FINAL_COMPREHENSIVE_TESTING_REPORT.md",
        "FINAL_PROJECT_COMPLETION_REPORT.md",
        "FRONTEND_FIXES_SUMMARY.md",
        "META_ENV_FIXES_SUMMARY.md",
        "TESTING_COMPLETE_REPORT.md",
        
        # JSON Report Files - ملفات التقارير JSON
        "COMPREHENSIVE_FIX_REPORT_20250710_155709.json",
        "DATABASE_USERS_REPORT_20250710_154140.json",
        "FRONTEND_FIXES_REPORT_20250710_152746.json",
        "META_ENV_FIXES_REPORT_20250710_153213.json",
        "PROJECT_CLEANUP_REPORT.json",
        "PROJECT_STATUS_REPORT_20250710_152039.json",
        
        # Log Files - ملفات السجل
        "comprehensive_fix.log",
        "FINAL_SYSTEM_TEST_REPORT.txt",
        
        # HTML Test Files - ملفات HTML الاختبار
        "test_connection.html",
        
        # Batch Files - ملفات الدُفعات
        "start.bat",
        "start.sh",
    ]
    
    # مجلدات للحذف
    dirs_to_remove = [
        "backup_20250710_135732",
        "__pycache__",
        ".pytest_cache",
        "venv" if os.path.exists(base_path / "venv") and input("حذف مجلد venv؟ (y/n): ").lower() == 'y' else None
    ]
    
    # Frontend duplicate files - ملفات الواجهة المكررة
    frontend_files_to_remove = [
        "frontend/API_USAGE_GUIDE.md",
        "frontend/DASHBOARD_MIGRATION_GUIDE.md", 
        "frontend/FINAL_DECISION.md",
        "frontend/FRONTEND_REFACTORING.md",
        "frontend/TYPESCRIPT_ERROR_RESOLUTION.md",
    ]
    
    print("🧹 بدء تنظيف المشروع...")
    print("=" * 50)
    
    # حذف الملفات
    for file_name in files_to_remove:
        file_path = base_path / file_name
        if file_path.exists():
            try:
                if file_path.is_file():
                    file_path.unlink()
                    removed_files.append(str(file_path))
                    print(f"✅ تم حذف: {file_name}")
                else:
                    print(f"⚠️ ليس ملف: {file_name}")
            except Exception as e:
                print(f"❌ خطأ في حذف {file_name}: {e}")
    
    # حذف ملفات الواجهة
    for file_name in frontend_files_to_remove:
        file_path = base_path / file_name
        if file_path.exists():
            try:
                file_path.unlink()
                removed_files.append(str(file_path))
                print(f"✅ تم حذف: {file_name}")
            except Exception as e:
                print(f"❌ خطأ في حذف {file_name}: {e}")
    
    # حذف المجلدات
    for dir_name in dirs_to_remove:
        if dir_name is None:
            continue
        dir_path = base_path / dir_name
        if dir_path.exists():
            try:
                shutil.rmtree(dir_path)
                removed_files.append(str(dir_path))
                print(f"✅ تم حذف المجلد: {dir_name}")
            except Exception as e:
                print(f"❌ خطأ في حذف المجلد {dir_name}: {e}")
    
    # حذف ملفات __pycache__ من جميع المجلدات
    for pycache_dir in base_path.rglob("__pycache__"):
        try:
            shutil.rmtree(pycache_dir)
            removed_files.append(str(pycache_dir))
            print(f"✅ تم حذف: {pycache_dir}")
        except Exception as e:
            print(f"❌ خطأ في حذف {pycache_dir}: {e}")
    
    # حذف ملفات .pyc
    for pyc_file in base_path.rglob("*.pyc"):
        try:
            pyc_file.unlink()
            removed_files.append(str(pyc_file))
            print(f"✅ تم حذف: {pyc_file}")
        except Exception as e:
            print(f"❌ خطأ في حذف {pyc_file}: {e}")
    
    # إنشاء تقرير التنظيف
    cleanup_report = {
        "cleanup_date": "2025-07-10",
        "total_files_removed": len(removed_files),
        "removed_files": removed_files,
        "summary": {
            "python_test_files": len([f for f in removed_files if f.endswith('.py')]),
            "report_files": len([f for f in removed_files if f.endswith(('.md', '.json', '.txt', '.log'))]),
            "cache_dirs": len([f for f in removed_files if '__pycache__' in f]),
            "backup_dirs": len([f for f in removed_files if 'backup' in f])
        }
    }
    
    with open(base_path / "cleanup_report.json", "w", encoding="utf-8") as f:
        json.dump(cleanup_report, f, indent=2, ensure_ascii=False)
    
    print("\n" + "=" * 50)
    print("🎉 تم تنظيف المشروع بنجاح!")
    print(f"📊 إجمالي الملفات المحذوفة: {len(removed_files)}")
    print(f"🐍 ملفات Python: {cleanup_report['summary']['python_test_files']}")
    print(f"📋 ملفات التقارير: {cleanup_report['summary']['report_files']}")
    print(f"🗂️ مجلدات التخزين المؤقت: {cleanup_report['summary']['cache_dirs']}")
    print(f"💾 مجلدات النسخ الاحتياطي: {cleanup_report['summary']['backup_dirs']}")
    print(f"📄 تقرير التنظيف: cleanup_report.json")
    
    # الملفات المتبقية المهمة
    print("\n📂 الملفات المهمة المتبقية:")
    important_files = [
        "README.md",
        "QUICK_START.md", 
        "SETUP_GUIDE.md",
        "requirements.txt",
        "alembic.ini",
        "workers.db"
    ]
    
    for file_name in important_files:
        file_path = base_path / file_name
        if file_path.exists():
            print(f"✅ {file_name}")
        else:
            print(f"⚠️ {file_name} - غير موجود")

if __name__ == "__main__":
    cleanup_project()
