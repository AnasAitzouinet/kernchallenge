from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.core.security import create_access_token
from app.db.models import User, LoginRequest, RegisterRequest
from app.services.user_service import get_user_by_email, create_user, authenticate_user
from app.core.logging import logger
router = APIRouter()

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Log in a user by validating their credentials.
    """
    try:
        # Authenticate the user
        user = await authenticate_user(request, db)

        # Handle invalid credentials
        if not user:
            logger.warning(f"Login failed for email: {request.email}")
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials",
            )

        # Create a new access token
        access_token = create_access_token(data={"sub": user.email})
        logger.info(f"User {user.email} successfully logged in.")
        
        # set the access token in the cookie
        return {"access_token": access_token, "token_type": "bearer"}

    except HTTPException as e:
        # Log known HTTP errors
        logger.error(f"HTTPException during login: {e.detail}")
        raise

    except Exception as e:
        # Catch unexpected errors for better debugging
        logger.exception(f"Unexpected error during login: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An unexpected error occurred. Please try again later.",
        )

@router.post("/register")
async def register(request: RegisterRequest, db: AsyncSession = Depends(get_db)):
    """
    Register a new user if they do not already exist in the database.
    """
    isUser = await get_user_by_email(request.email, db)

    if isUser:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User already exists")
    
    await create_user(request, db)

    return {"message": "User registered successfully"}


 