import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "AI Voice Agent API"
    API_V1_STR: str = "/api"
    
    # JWT & Auth
    SECRET_KEY: str = os.getenv("JWT_SECRET_KEY", "your_super_secret_jwt_key_here_please_change_in_production")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 1 week
    
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL", "postgresql://ai_user:ai_password@localhost:5432/ai_voice_agent")
    
    # OpenAI config
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Audio Storage Settings
    AUDIO_STORAGE_PATH: str = os.getenv("AUDIO_STORAGE_PATH", "static/audio")
    DOCUMENT_STORAGE_PATH: str = os.getenv("DOCUMENT_STORAGE_PATH", "static/documents")

    class Config:
        case_sensitive = True

settings = Settings()

# Ensure directories exist
os.makedirs(settings.AUDIO_STORAGE_PATH, exist_ok=True)
os.makedirs(settings.DOCUMENT_STORAGE_PATH, exist_ok=True)
