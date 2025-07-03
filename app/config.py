import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./workers.db")
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # أسبوع
ALGORITHM = "HS256"
