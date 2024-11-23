from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.session import get_db
from app.core.security import create_access_token
from app.db.models import User, LoginRequest, RegisterRequest
from app.services.user_service import get_user_by_email, create_user, authenticate_user

router = APIRouter()

@router.post("/login")
async def login(request: LoginRequest, db: AsyncSession = Depends(get_db)):
    """
    Log in a user by validating their credentials.
    """ 
    # Authenticate the user by email and password (there is a condition in the authenticate_user function that checks if the user exists)
    newUser = await authenticate_user(request, db)

    if not newUser:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    
    # Create a new access token for the user
    access_token = create_access_token(data={"sub": newUser.email})
    return {"access_token": access_token, "token_type": "bearer"}


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


 