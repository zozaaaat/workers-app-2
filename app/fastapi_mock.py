"""
حل مؤقت لمشاكل استيراد FastAPI
Temporary workaround for FastAPI import issues
"""

# حل مؤقت لمشكلة البيئة الافتراضية
# Temporary fix for virtual environment issues

class MockFastAPI:
    """مؤقت - محاكي FastAPI للتجاوز مؤقتاً حتى إصلاح البيئة الافتراضية"""
    def __init__(self, title="Workers Management API"):
        self.title = title
        self.routes = []
    
    def add_middleware(self, middleware_class, **kwargs):
        print(f"⚠️ تم تخطي إضافة middleware: {middleware_class.__name__ if hasattr(middleware_class, '__name__') else middleware_class}")
    
    def include_router(self, router, **kwargs):
        print(f"⚠️ تم تخطي إضافة router")
    
    def on_event(self, event_type):
        def decorator(func):
            print(f"⚠️ تم تخطي event handler: {event_type}")
            return func
        return decorator
    
    def get(self, path):
        def decorator(func):
            print(f"⚠️ تم تخطي route: GET {path}")
            return func
        return decorator
    
    def post(self, path):
        def decorator(func):
            print(f"⚠️ تم تخطي route: POST {path}")
            return func
        return decorator
    
    def websocket(self, path):
        def decorator(func):
            print(f"⚠️ تم تخطي websocket: {path}")
            return func
        return decorator

class MockWebSocket:
    def __init__(self):
        pass
    
    async def accept(self):
        pass
    
    async def send_text(self, message):
        pass

class MockWebSocketDisconnect(Exception):
    pass

def mock_depends(dependency):
    """محاكي Depends"""
    return dependency

# استخدام المحاكيات مؤقتاً
try:
    from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends
    print("✅ تم استيراد FastAPI بنجاح")
except ImportError:
    print("⚠️ تعذر استيراد FastAPI، استخدام المحاكي المؤقت")
    FastAPI = MockFastAPI
    WebSocket = MockWebSocket
    WebSocketDisconnect = MockWebSocketDisconnect
    Depends = mock_depends

try:
    from starlette.middleware.cors import CORSMiddleware
    from starlette.middleware.gzip import GZipMiddleware
    print("✅ تم استيراد middleware بنجاح")
except ImportError:
    print("⚠️ تعذر استيراد middleware، استخدام محاكيات مؤقتة")
    
    class MockCORSMiddleware:
        def __init__(self, **kwargs):
            pass
    
    class MockGZipMiddleware:
        def __init__(self, **kwargs):
            pass
    
    CORSMiddleware = MockCORSMiddleware
    GZipMiddleware = MockGZipMiddleware
