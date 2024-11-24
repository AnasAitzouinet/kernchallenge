from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.schemas import TimeEntryCreate, TimeEntryRead
from app.services.time_entry_service import start_time_entry,end_time_entry, get_time_entry_by_id,start_break_time_entry,end_break_time_entry
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


@router.get("/{time_entry_id}", response_model=TimeEntryRead)
async def get_time_entry_handler(
    time_entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Get a time entry by ID.
    """
    return await get_time_entry_by_id(time_entry_id, current_user, db)
 

@router.post("/{time_entry_id}/break/start", response_model=TimeEntryRead)
async def start_break_time_entry_handler(
    time_entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Start a break for a time entry.
    """
    return await start_break_time_entry(time_entry_id, current_user, db)

@router.post("/{time_entry_id}/break/stop", response_model=TimeEntryRead)
async def end_break_time_entry_handler(
    time_entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    End a break for a time entry.
    """
    return await end_break_time_entry(time_entry_id, current_user, db)