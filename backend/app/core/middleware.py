from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response
import logging
import time
import traceback
from datetime import datetime

# إعداد logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

class ErrorHandlingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        try:
            response = await call_next(request)
            
            # تسجيل الطلب
            process_time = time.time() - start_time
            logger.info(
                f"{request.method} {request.url.path} - "
                f"Status: {response.status_code} - "
                f"Time: {process_time:.4f}s"
            )
            
            return response
            
        except HTTPException as e:
            logger.warning(f"HTTP Exception: {e.status_code} - {e.detail}")
            return JSONResponse(
                status_code=e.status_code,
                content={
                    "error": True,
                    "message": e.detail,
                    "status_code": e.status_code,
                    "timestamp": datetime.now().isoformat()
                }
            )
            
        except Exception as e:
            logger.error(f"Unhandled exception: {str(e)}")
            logger.error(traceback.format_exc())
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": True,
                    "message": "حدث خطأ داخلي في الخادم",
                    "status_code": 500,
                    "timestamp": datetime.now().isoformat()
                }
            )

class RequestLoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # تسجيل تفاصيل الطلب
        client_ip = request.client.host if request.client else "unknown"
        user_agent = request.headers.get("user-agent", "unknown")
        
        logger.info(
            f"Request: {request.method} {request.url.path} - "
            f"IP: {client_ip} - "
            f"User-Agent: {user_agent}"
        )
        
        response = await call_next(request)
        return response
