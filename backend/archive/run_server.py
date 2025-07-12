#!/usr/bin/env python
"""
Backend server startup script
يشغل خادم FastAPI للباك اند
"""

import os
import sys
import uvicorn

# إضافة المجلد الحالي إلى path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    # استيراد التطبيق
    from app.main import app
    
    # تشغيل الخادم
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        reload=True,
        reload_dirs=["app"],
        log_level="info"
    )
