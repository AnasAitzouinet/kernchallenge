from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.db.schemas import TimeEntryCreate, TimeEntryRead, BreakRead
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models import User
from app.services.time_entry_service import TimeEntryService

from fastapi import HTTPException

router = APIRouter()

@router.post("/start", response_model=TimeEntryRead)
async def create_time_entry_handler(
    request: TimeEntryCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TimeEntryService(db, current_user)
    try:
        return await service.start_time_entry(request)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    

@router.post("/{time_entry_id}/stop", response_model=TimeEntryRead)
async def end_time_entry_handler(
    time_entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TimeEntryService(db, current_user)
    return await service.end_time_entry(time_entry_id)

@router.post("/{time_entry_id}/breaks/start", response_model=BreakRead)
async def start_break_handler(
    time_entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TimeEntryService(db, current_user)
    return await service.start_break(time_entry_id)

@router.post("/{time_entry_id}/breaks/{break_id}/end", response_model=BreakRead)
async def end_break_handler(
    time_entry_id: int,
    break_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TimeEntryService(db, current_user)
    return await service.end_break(time_entry_id, break_id)

@router.get("/{time_entry_id}", response_model=TimeEntryRead)
async def get_time_entry_handler(
    time_entry_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TimeEntryService(db, current_user)
    return await service.get_time_entry_by_id(time_entry_id)

@router.get("/", response_model=List[TimeEntryRead])
async def list_time_entries_handler(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    service = TimeEntryService(db, current_user)
    return await service.list_time_entries()
