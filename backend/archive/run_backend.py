#!/usr/bin/env python3
"""
ملف تشغيل الباك إند
"""
import uvicorn
import sys
import os

# إضافة مجلد backend للمسار
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    try:
        # تشغيل الباك إند
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8001,
            reload=True,
            reload_dirs=["app"]
        )
    except Exception as e:
        print(f"خطأ في تشغيل الباك إند: {e}")
        # محاولة أخرى بدون reload
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8001,
            reload=False
        )
