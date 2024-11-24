from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.session import get_db 
from app.db.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Depends
from jose import JWTError, jwt
from app.core.config import settings
from app.services.user_service import get_user_by_email
from fastapi.security import OAuth2PasswordBearer

# Example of a dependency for getting the current database session
async def get_db_session(db: AsyncSession = Depends(get_db)):
    """
    Dependency to get the database session.
    """
    return db


 
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")  # Adjust to your login route
async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)) -> User:
    """
    Dependency to get the current authenticated user from the token.
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        email: str = payload.get("sub")
        if not email:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        user = await get_user_by_email(email, db)
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token is invalid or expired")
