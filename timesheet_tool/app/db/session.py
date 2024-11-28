from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from sqlalchemy.exc import SQLAlchemyError

# Initialize database engine
engine = create_async_engine(settings.DATABASE_URL, echo=True)

# Session maker for database transactions
SessionLocal = sessionmaker(
    autocommit=False, autoflush=False, bind=engine, class_=AsyncSession
)

# Dependency to inject database session
async def get_db():
    session = SessionLocal()
    try:
        yield session
    except SQLAlchemyError as e:
        # Handle SQLAlchemy errors
        print(f"Database error occurred: {e}")
        raise
    finally:
        await session.close()
