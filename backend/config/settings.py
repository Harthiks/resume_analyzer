"""
Application settings loaded from .env using Pydantic Settings.
"""
from pydantic_settings import BaseSettings
from typing import List

class Settings(BaseSettings):
    # MongoDB
    MONGODB_URL: str = "mongodb://localhost:27017"
    DATABASE_NAME: str = "resume_ai"

    # JWT
    SECRET_KEY: str = "fallback-secret-key"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 10080  # 7 days

    # Admin seed
    ADMIN_EMAIL: str = "admin@resumeai.com"
    ADMIN_PASSWORD: str = "Admin@123"

    # Gemini AI
    GEMINI_API_KEY: str = ""

    # CORS
    CORS_ORIGINS: str = "http://localhost:5173,http://localhost:3000"

    # File upload
    MAX_FILE_SIZE_MB: int = 10
    UPLOAD_DIR: str = "uploads"

    @property
    def cors_origins_list(self) -> List[str]:
        return [origin.strip() for origin in self.CORS_ORIGINS.split(",")]

    @property
    def gemini_enabled(self) -> bool:
        return bool(self.GEMINI_API_KEY and self.GEMINI_API_KEY.strip())

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
