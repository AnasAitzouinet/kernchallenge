from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Initialize database engine
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Session maker for database transactions
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

# Dependency to inject database session
async def get_db():
    async with SessionLocal() as session:
        yield session
