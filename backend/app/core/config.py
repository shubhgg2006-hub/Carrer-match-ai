import os
from pydantic import BaseModel

class Settings(BaseModel):
    APP_NAME: str = "CareerMatch AI"
    APP_VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    DATABASE_URL: str = "sqlite:///./careermatch.db"
    
    # File limits
    MAX_FILE_SIZE_MB: int = 10
    ALLOWED_EXTENSIONS: list[str] = [".pdf", ".docx"]
    
    # NLP Engine Settings
    DEFAULT_WEIGHTS: dict[str, float] = {
        "semantic_similarity": 0.35,
        "required_skills": 0.30,
        "preferred_skills": 0.15,
        "experience": 0.10,
        "education": 0.10,
    }
    
    # Sentence Transformer model name
    TRANSFORMER_MODEL_NAME: str = "all-MiniLM-L6-v2"
    
    # CORS
    CORS_ORIGINS: list[str] = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "*"
    ]

settings = Settings()
