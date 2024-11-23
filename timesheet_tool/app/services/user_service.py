from app.db.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.core.security import get_password_hash, verify_password
from app.db.models import LoginRequest, RegisterRequest
from app.db.session import get_db
from fastapi import  Depends 


async def get_user_by_email(email: str, db: AsyncSession = Depends(get_db)) -> User:
    """
    Fetch a user by email.
    """
    query = select(User).where(User.email == email)
    result = await db.execute(query)
    return result.scalars().first()


async def get_user_by_id(user_id: int, db: AsyncSession = Depends(get_db)) -> User:
    """
    Fetch a user by ID.
    """
    query = select(User).where(User.id == user_id)
    result = await db.execute(query)
    return result.scalars().first()


async def create_user(request: RegisterRequest, db: AsyncSession = Depends(get_db)) -> User:
    """
    Create a new user.
    """
    new_user = User(
        name=request.name,
        email=request.email,
        hashed_password=get_password_hash(request.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user


async def authenticate_user(request: LoginRequest, db: AsyncSession =  Depends(get_db)) -> User:
    """
    Authenticate a user by email and password.
    """
    user = await get_user_by_email(request.email, db)
    if not user or not verify_password(request.password, user.hashed_password):
        return None
    return user
