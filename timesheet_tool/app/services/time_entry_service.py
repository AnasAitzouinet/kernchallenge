# time_entry_service.py

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from app.db.models import TimeEntry, User, TimeEntryStatusEnum, Break
from app.db.schemas import TimeEntryCreate
from fastapi import HTTPException
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError

 
class TimeEntryService:
    def __init__(self, db: AsyncSession, user: User):
        self.db = db
        self.user = user

    async def check_active_entry(self):
        """
        Check for an active time entry for the current user.
        """
        query = select(TimeEntry).where(
            TimeEntry.user_id == self.user.id,
            TimeEntry.status != TimeEntryStatusEnum.finished
        )
        result = await self.db.execute(query)
        return result.scalars().first()

    async def start_time_entry(self, request: TimeEntryCreate):
        # Check for an active entry
        open_entry = await self.check_active_entry()

        if open_entry:
            raise HTTPException(status_code=400, detail="An active time entry already exists.")

        # Create new entry
        new_entry = TimeEntry(
            user_id=self.user.id,
            project_id=request.project_id,
            start_time=datetime.now(timezone.utc),
            status=TimeEntryStatusEnum.open,
            description=request.description or None,
        )
        

        self.db.add(new_entry)
        await self.db.commit()
        await self.db.refresh(new_entry, ["project", "user", "breaks"])
        return new_entry


    async def end_time_entry(self, time_entry_id: int):
        """
        End the current time entry.
        """
        entry = await self.get_time_entry_by_id(time_entry_id)

        if not entry:
            raise HTTPException(status_code=404, detail="Time entry not found.")

        if entry.status == TimeEntryStatusEnum.finished:
            raise HTTPException(status_code=400, detail="Time entry is already finished.")

        entry.end_time = datetime.now(timezone.utc)
        entry.status = TimeEntryStatusEnum.finished

        self.db.add(entry)
        await self.db.commit()
        await self.db.refresh(entry)
        return entry

    async def start_break(self, time_entry_id: int):
        """
        Start a break within the time entry.
        """
        entry = await self.get_time_entry_by_id(time_entry_id)

        if entry.status != TimeEntryStatusEnum.open:
            raise HTTPException(status_code=400, detail="Cannot start a break now.")

        # Update time entry status
        entry.status = TimeEntryStatusEnum.breaktime
        self.db.add(entry)

        # Create new Break
        new_break = Break(
            time_entry_id=entry.id,
            start_time=datetime.now(timezone.utc)
        )
        self.db.add(new_break)

        await self.db.commit()
        await self.db.refresh(new_break)
        return new_break

    async def end_break(self, time_entry_id: int, break_id: int):
        """
        End a break within the time entry.
        """
        entry = await self.get_time_entry_by_id(time_entry_id)

        if entry.status != TimeEntryStatusEnum.breaktime:
            raise HTTPException(status_code=400, detail="No break to end.")

        # Retrieve the specific break
        query = select(Break).where(
            Break.id == break_id,
            Break.time_entry_id == entry.id,
            Break.end_time.is_(None)
        )
        result = await self.db.execute(query)
        brk = result.scalars().first()

        if not brk:
            raise HTTPException(status_code=404, detail="Break not found or already ended.")

        # Update break end time
        brk.end_time = datetime.now(timezone.utc)
        self.db.add(brk)

        # Update time entry status
        entry.status = TimeEntryStatusEnum.open
        self.db.add(entry)

        await self.db.commit()
        await self.db.refresh(brk)
        return brk

    async def get_time_entry_by_id(self, time_entry_id: int):
        """
        Get a time entry by ID for the current user.
        """
        query = select(TimeEntry).where(
            TimeEntry.id == time_entry_id,
            TimeEntry.user_id == self.user.id
        ).options(
            selectinload(TimeEntry.breaks)
        )
        result = await self.db.execute(query)
        entry = result.scalars().first()

        if not entry:
            raise HTTPException(status_code=404, detail="Time entry not found.")

        return entry

    async def list_time_entries(self):
        """
        List all time entries for the current user.
        """
        query = select(TimeEntry).where(
            TimeEntry.user_id == self.user.id
        ).options(
            selectinload(TimeEntry.breaks)
        )
        result = await self.db.execute(query)
        return result.scalars().all()
