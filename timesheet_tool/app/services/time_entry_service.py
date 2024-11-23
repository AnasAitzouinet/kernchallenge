from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import TimeEntry, User, TimeEntryStatusEnum
from app.db.schemas import TimeEntryCreate
from fastapi import HTTPException, status, Depends
from datetime import datetime
from app.db.session import get_db

def start_time_entry(current_user: User, project_id: int, db: AsyncSession = Depends(get_db)):
    """
    Start a new time entry for a specific user and project.
    
    Args:
    - user (User): The current user starting the time entry.
    - project_id (int): The ID of the project associated with the time entry.
    - db (AsyncSession): The async database session.
    """

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated."
        )

    # Check if there's an open time entry
    open_entry = db.query(TimeEntry).filter(
        TimeEntry.user_id == current_user.id,
        TimeEntry.status == TimeEntryStatusEnum.open
    ).first()
    if open_entry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An active time entry already exists."
        )
    # Create new time entry
    new_entry = TimeEntry(
        user_id=current_user.id,
        project_id=project_id,
        start_time=datetime.now(),
        status=TimeEntryStatusEnum.open
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry

async def start_break_time_entry(time_entry_id: int, current_user: User, db: AsyncSession = Depends(get_db)):
    """"
    Start a break time entry for a specific time entry.
    
    Args:
    - time_entry_id (int): The ID of the time entry to start the break for.
    - current_user (User): The current user starting the break.
    - db (AsyncSession): The async database session.
    """

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated."
        )

    # Retrieve time entry
    entry = await db.get(TimeEntry, time_entry_id)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found or not authorized."
        )
    # Check if time entry is already closed
    if entry.status != TimeEntryStatusEnum.open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time entry is already closed."
        )
    # Update time entry
    entry.status = TimeEntryStatusEnum.break_
    entry.start_break_time = datetime.now()
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

async def end_time_entry(time_entry_id: int, current_user: User, db: AsyncSession = Depends(get_db)):

    if not current_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated."
        )

    # Retrieve time entry
    entry = await db.get(TimeEntry, time_entry_id)
    if not entry or entry.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Time entry not found or not authorized."
        )
    # Check if time entry is already closed
    if entry.status != TimeEntryStatusEnum.open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Time entry is already closed."
        )
    # Update time entry
    entry.end_time = datetime.now()
    entry.status = TimeEntryStatusEnum.submitted
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

async def get_time_entries_by_user(user: User, db: AsyncSession = Depends(get_db)):
    """
    Retrieve all time entries for a specific user.
    """
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not authenticated."
        )

    query = select(TimeEntry).where(TimeEntry.user_id == user.id)
    result = await db.execute(query)
    return result.scalars().all()
