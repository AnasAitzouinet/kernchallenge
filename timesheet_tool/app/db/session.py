from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings
from app.db.models import Base
from sqlalchemy.ext.asyncio import AsyncSession

# Initialize database engine
engine = create_async_engine(settings.DATABASE_URL,pool_size=10, 
    max_overflow=20)

# Session maker for database transactions
SessionLocal = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)

# Dependency to inject database session
async def get_db():
    async with SessionLocal() as db:
        try:
            yield db
        finally:
            await db.close()
