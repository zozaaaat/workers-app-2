#!/usr/bin/env python
"""
Main entry point for the backend application
نقطة الدخول الرئيسية لتطبيق الباك اند
"""

import sys
import os

# إضافة مجلد backend إلى path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)

# استيراد التطبيق من app.main
from app.main import app

if __name__ == "__main__":
    import uvicorn
    
    print("🚀 بدء تشغيل خادم FastAPI...")
    print("📍 العنوان: http://localhost:8000")
    print("📚 التوثيق: http://localhost:8000/docs")
    
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=[current_dir],
        log_level="info"
    )
