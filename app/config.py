import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./workers.db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # أسبوع
ALGORITHM = "HS256"

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.example.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "user@example.com")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "password")
SMTP_FROM = os.getenv("SMTP_FROM", SMTP_USER)

SMS_API_KEY = os.getenv("SMS_API_KEY", "demo-key")
SMS_SENDER = os.getenv("SMS_SENDER", "WorkersApp")
