from pydantic import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str  # Asynchronous URL
    DATABASE_URL_SYNC: str  # Synchronous URL for Alembic
    DATABASE_URL_TEST: str
    SECRET_KEY: str = "g4s0G7eMZcc7ZQSYuYfmw1W7+8Ylh/wc1bwWoym4XA0="
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 3600  # 1 hour

    class Config:
        env_file = ".env"

settings = Settings()
