print("=== MAIN.PY LOADED ===")
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from fastapi_utils.tasks import repeat_every
print("=== IMPORTED FASTAPI & CORS ===")
try:
    from app.routers import companies, licenses, workers, leaves, deductions, violations, end_of_service, auth, activity_log, users, notifications
    print("=== IMPORTED app.routers.* ===")
except Exception as e:
    print(f"IMPORT ERROR routers: {e}")
try:
    from .routers import absences, worker_documents
    print("=== IMPORTED .routers.absences & worker_documents ===")
except Exception as e:
    print(f"IMPORT ERROR .routers: {e}")
try:
    from app import models
    print("=== IMPORTED app.models ===")
except Exception as e:
    print(f"IMPORT ERROR models: {e}")
try:
    from app.database import engine
    print("=== IMPORTED app.database.engine ===")
except Exception as e:
    print(f"IMPORT ERROR database: {e}")

# إنشاء جميع الجداول حسب الـ models المعرفة
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Workers Management API")

# إعدادات CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
        "*"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("=== قبل include_router companies ===")
try:
    app.include_router(companies.router, prefix="/companies", tags=["Companies"])
    print("=== بعد include_router companies ===")
except Exception as e:
    print("[ROUTER companies] Exception:", e)

print("=== قبل include_router licenses ===")
try:
    app.include_router(licenses.router, prefix="/licenses", tags=["Licenses"])
    print("=== بعد include_router licenses ===")
except Exception as e:
    print("[ROUTER licenses] Exception:", e)

print("=== قبل include_router workers ===")
try:
    app.include_router(workers.router, prefix="/workers", tags=["Workers"])
    print("=== بعد include_router workers ===")
except Exception as e:
    print("[ROUTER workers] Exception:", e)

print("=== قبل include_router leaves ===")
try:
    app.include_router(leaves.router, prefix="/leaves", tags=["Leaves"])
    print("=== بعد include_router leaves ===")
except Exception as e:
    print("[ROUTER leaves] Exception:", e)

print("=== قبل include_router deductions ===")
try:
    app.include_router(deductions.router, prefix="/deductions", tags=["Deductions"])
    print("=== بعد include_router deductions ===")
except Exception as e:
    print("[ROUTER deductions] Exception:", e)

print("=== قبل include_router violations ===")
try:
    app.include_router(violations.router, prefix="/violations", tags=["Violations"])
    print("=== بعد include_router violations ===")
except Exception as e:
    print("[ROUTER violations] Exception:", e)

print("=== قبل include_router end_of_service ===")
try:
    app.include_router(end_of_service.router, prefix="/endofservice", tags=["EndOfService"])
    print("=== بعد include_router end_of_service ===")
except Exception as e:
    print("[ROUTER end_of_service] Exception:", e)

print("=== قبل include_router activity_log ===")
try:
    app.include_router(activity_log.router)
    print("=== بعد include_router activity_log ===")
except Exception as e:
    print("[ROUTER activity_log] Exception:", e)

print("=== قبل include_router auth ===")
try:
    app.include_router(auth.router)
    print("=== بعد include_router auth ===")
except Exception as e:
    print("[ROUTER auth] Exception:", e)

print("=== قبل include_router absences ===")
try:
    app.include_router(absences.router, prefix="/absences", tags=["Absences"])
    print("=== بعد include_router absences ===")
except Exception as e:
    print("[ROUTER absences] Exception:", e)

print("=== قبل include_router worker_documents ===")
try:
    app.include_router(worker_documents.router)
    print("=== بعد include_router worker_documents ===")
except Exception as e:
    print("[ROUTER worker_documents] Exception:", e)

print("=== قبل include_router users ===")
try:
    app.include_router(users.router, prefix="/users", tags=["Users"])
    print("=== بعد include_router users ===")
except Exception as e:
    print("[ROUTER users] Exception:", e)

print("=== قبل include_router notifications ===")
try:
    app.include_router(notifications.router, tags=["Notifications"])
    print("=== بعد include_router notifications ===")
except Exception as e:
    print("[ROUTER notifications] Exception:", e)

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            await connection.send_text(message)

manager = ConnectionManager()

@app.websocket("/ws/notifications")
async def websocket_notifications(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()  # مجرد إبقاء الاتصال حي
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
def read_root():
    return {"message": "Welcome to Workers Management API"}

@app.get("/test-root")
def test_root():
    return {"status": "ok"}

@app.get("/ping")
def ping():
    return {"pong": True}

@app.get("/hello")
def hello():
    return {"msg": "hello"}

@app.on_event("startup")
@repeat_every(seconds=60)  # كل دقيقة
def process_scheduled_notifications_task() -> None:
    from app.database import SessionLocal
    db = SessionLocal()
    from app.crud.notifications import send_scheduled_notifications
    send_scheduled_notifications(db)
    db.close()
