from pydantic_settings import BaseSettings
from typing import Optional
import os

class Settings(BaseSettings):
    # Database settings
    DATABASE_URL: str = "sqlite:///./workers.db"
    
    # Security settings
    SECRET_KEY: str = "your-secret-key-here-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    # API settings
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "نظام إدارة العمال والرخص"
    
    # CORS settings
    BACKEND_CORS_ORIGINS: list = ["http://localhost:3000", "http://localhost:8080"]
    
    # File upload settings
    UPLOAD_FOLDER: str = "uploaded_files"
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: set = {
        'pdf', 'doc', 'docx', 'xls', 'xlsx', 
        'jpg', 'jpeg', 'png', 'gif', 'txt'
    }
    
    # Email settings (optional)
    SMTP_TLS: bool = True
    SMTP_PORT: Optional[int] = None
    SMTP_HOST: Optional[str] = None
    SMTP_USER: Optional[str] = None
    SMTP_PASSWORD: Optional[str] = None
    EMAILS_FROM_EMAIL: Optional[str] = None
    EMAILS_FROM_NAME: Optional[str] = None
    
    # Additional email settings
    EMAIL_HOST: Optional[str] = None
    EMAIL_PORT: Optional[int] = None
    EMAIL_USER: Optional[str] = None
    EMAIL_PASSWORD: Optional[str] = None
    
    # CORS settings - additional format
    CORS_ORIGINS: Optional[str] = None
    
    # Redis settings (for caching - optional)
    REDIS_URL: Optional[str] = None
    
    # Application settings
    DEBUG: bool = False
    TESTING: bool = False
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # تجاهل الحقول الإضافية

# Create settings instance
settings = Settings()

# Create upload directories if they don't exist
os.makedirs(os.path.join(settings.UPLOAD_FOLDER, "companies"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_FOLDER, "workers"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_FOLDER, "licenses"), exist_ok=True)
os.makedirs(os.path.join(settings.UPLOAD_FOLDER, "archive"), exist_ok=True)
