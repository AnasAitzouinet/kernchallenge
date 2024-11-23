from passlib.context import CryptContext
from datetime import datetime, timedelta
from jose import JWTError, jwt
from app.core.config import settings
from app.db.models import User
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException, status, Depends

# Context for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
 
def get_password_hash(password: str) -> str:
    """
    Hashes a plain text password using bcrypt.
    
    Args:
        password (str): The plain text password.
    
    Returns:
        str: The hashed password.
    """
    if not password:
        raise ValueError("Password cannot be empty.")

    return pwd_context.hash(password)
 
def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain text password against a hashed password.
    
    Args:
        plain_password (str): The plain text password.
        hashed_password (str): The hashed password.
    
    Returns:
        bool: True if the password matches, False otherwise.
    """
    if not plain_password or not hashed_password:
        return ValueError("Password cannot be empty.")

    return pwd_context.verify(plain_password, hashed_password)
 
def create_access_token(data: dict, expires_delta: timedelta = None) -> str:
    """
    Creates a JSON Web Token (JWT) for user authentication.
    
    Args:
        data (dict): Data to encode in the JWT.
        expires_delta (timedelta, optional): Token expiration delta.
    
    Returns:
        str: Encoded JWT token.
    """
    to_encode = data.copy()
    expire = datetime.now() + (expires_delta if expires_delta else timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt
 