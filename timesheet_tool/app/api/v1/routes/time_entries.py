from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.schemas import TimeEntryCreate, TimeEntryRead
from app.services.time_entry_service import start_time_entry,end_time_entry, get_time_entries_by_user
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models import User

router = APIRouter()

@router.post("/start", response_model=TimeEntryRead)
async def create_time_entry_handler(
    project_id: TimeEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a time entry for the current user.
    """
    return await start_time_entry(current_user,project_id,db)



@router.post("/{time_entry_id}/stop", response_model=TimeEntryRead)
async def end_time_entry_handler(
    time_entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    End a time entry for the current user.
    """
    return await end_time_entry(time_entry_id,current_user, db)



@router.get("/", response_model=list[TimeEntryRead])
async def list_time_entries_handler(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all time entries for the current user.
    """
    return await get_time_entries_by_user(current_user, db)
