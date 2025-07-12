#!/usr/bin/env python3
"""
ملف تشغيل الباك إند بدون مهام خلفية لتجنب الأخطاء
"""
import uvicorn
import sys
import os

# إضافة مجلد backend للمسار
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    try:
        # تشغيل الباك إند بدون reload لتجنب مشاكل Unicode
        uvicorn.run(
            "app.main:app",
            host="0.0.0.0",
            port=8001,
            reload=False,  # تعطيل reload لتجنب مشاكل Unicode
            log_level="info"
        )
    except Exception as e:
        print(f"Error starting backend: {e}")
        # محاولة بدون أي مهام خلفية
        import app.simple_main as simple_app
        uvicorn.run(
            simple_app.app,
            host="0.0.0.0",
            port=8001,
            reload=False
        )
