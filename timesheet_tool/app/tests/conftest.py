import pytest
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.db.models import Base
from app.db.session import get_db
from app.core.config import settings

# Use pytest-asyncio for async tests
pytest_plugins = ["pytest_asyncio"]

# Create a separate engine for the test database
engine = create_async_engine(settings.DATABASE_URL_TEST, future=True)
TestSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine, class_=AsyncSession)


@pytest.fixture(scope="function")
async def db_session():
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)  # Clean slate
        await conn.run_sync(Base.metadata.create_all)

    async with TestSessionLocal() as session:
        yield session  # Yield the session for the test

@pytest.fixture(scope="function")
def client(db_session):
    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    # Use standard TestClient
    with TestClient(app) as c:
        yield c
