from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def list_users():
    """
    List all users.
    """
    return {"message": "List of users"}
