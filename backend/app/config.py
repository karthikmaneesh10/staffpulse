import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "StaffPulse API"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # PostgreSQL Configuration Details
    DB_USER: str = os.getenv("DB_USER", "postgres")
    DB_PASSWORD: str = os.getenv("DB_PASSWORD", "root")
    DB_HOST: str = os.getenv("DB_HOST", "localhost")
    DB_PORT: str = os.getenv("DB_PORT", "5432")
    DB_NAME: str = os.getenv("DB_NAME", "staffpulse_db")
    
    # Primary PostgreSQL Connection URL (using psycopg2 driver)
    @property
    def POSTGRES_URL(self) -> str:
        return f"postgresql+psycopg2://{self.DB_USER}:{self.DB_PASSWORD}@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
    
    # SQLite fallback connection URL
    SQLITE_URL: str = "sqlite:///./staffpulse.db"
    
    # Preferred database URL (checks env or defaults to postgres, with Render 'postgres://' compatibility)
    @property
    def DATABASE_URL(self) -> str:
        env_url = os.getenv("DATABASE_URL")
        if env_url:
            # Render PostgreSQL injects postgres:// which SQLAlchemy 2.0 requires as postgresql+psycopg2://
            if env_url.startswith("postgres://"):
                env_url = env_url.replace("postgres://", "postgresql+psycopg2://", 1)
            elif env_url.startswith("postgresql://") and not env_url.startswith("postgresql+psycopg2://"):
                env_url = env_url.replace("postgresql://", "postgresql+psycopg2://", 1)
            return env_url
        return self.POSTGRES_URL
    
    CORS_ORIGINS: list = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://localhost:8000",
        "*"
    ]

settings = Settings()
