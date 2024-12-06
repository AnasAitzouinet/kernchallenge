from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.db.models import Project, User, Break, TimeEntryStatusEnum
from app.db.schemas import ProjectCreate
from sqlalchemy.exc import SQLAlchemyError
from fastapi import HTTPException
from sqlalchemy.orm import selectinload
from datetime import datetime
from app.db.session import get_db
import asyncio

class ProjectService:
    def __init__(self, db: AsyncSession, user: User):
        self.db = db
        self.user = user

    async def create_project(self, project_data: ProjectCreate, user: User):
        """
        Create a new project for the current user.
        """
        new_project = Project(
            name=project_data.name,
            description=project_data.description,
            owner_id=user.id,  # Retaining the user parameter for flexibility
            start_time=project_data.start_time,
            end_time=project_data.end_time,
            redo=project_data.redo,
        )

        try:
            self.db.add(new_project)
            await self.db.commit()
            await self.db.refresh(new_project)
            return new_project
        except SQLAlchemyError as e:
            await self.db.rollback()
            error_message = {
                "message": "Failed to create the project",
                "error": str(e),
            }
            raise HTTPException(status_code=500, detail=error_message)

    async def get_projects(self):
        """
        Get all projects owned by the current user, including their time entries.
        """
        query = select(Project).where(
            Project.owner_id == self.user.id
        )

        result = await self.db.execute(query)
        projects = result.scalars().all()

        return projects

    async def remove_project_by_id(self, project_id: int):
        """
        Remove a project by its ID.
        """
        query = select(Project).where(Project.id == project_id, Project.owner_id == self.user.id)
        result = await self.db.execute(query)
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        try:
            await self.db.delete(project)
            await self.db.commit()
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def start_break(self, project_id: int):
        """
        Start a break for a project.
        """
        # Ensure the project exists and is owned by the user
        query = select(Project).where(Project.id == project_id, Project.owner_id == self.user.id)
        result = await self.db.execute(query)
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Check if there is already an ongoing break
        query = select(Break).where(Break.project_id == project_id, Break.end_time == None)
        result = await self.db.execute(query)
        ongoing_break = result.scalar_one_or_none()

        if ongoing_break:
            raise HTTPException(status_code=400, detail="There is already an ongoing break")

        # Create a new Break with start_time
        new_break = Break(
            project_id=project_id,
            start_time=datetime.utcnow()
        )

        try:
            self.db.add(new_break)
            await self.db.commit()
            await self.db.refresh(new_break)
            return new_break
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

    async def end_break(self, project_id: int):
        """
        End the current break for a project.
        """
        # Ensure the project exists and is owned by the user
        query = select(Project).where(Project.id == project_id, Project.owner_id == self.user.id)
        result = await self.db.execute(query)
        project = result.scalar_one_or_none()

        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        # Find the break that has no end_time
        query = select(Break).where(Break.project_id == project_id, Break.end_time == None).order_by(Break.start_time.desc())
        result = await self.db.execute(query)
        ongoing_break = result.scalar_one_or_none()

        if not ongoing_break:
            raise HTTPException(status_code=400, detail="No ongoing break found")

        # Update the break's end_time
        ongoing_break.end_time = datetime.now()

        try:
            self.db.add(ongoing_break)
            await self.db.commit()
            await self.db.refresh(ongoing_break)
            return ongoing_break
        except SQLAlchemyError as e:
            await self.db.rollback()
            raise HTTPException(status_code=500, detail=str(e))

async def check_and_update_project_status():
    """
    Cron job to check every 30 minutes for projects whose end_time has passed,
    change their status to 'finished', and send a notification to the user.
    """
    while True:
        try:
            async with get_db() as db:
                current_time = datetime.now()

                # Select projects where end_time <= current_time and status != 'finished'
                query = select(Project).where(
                    Project.end_time <= current_time,
                    Project.status != TimeEntryStatusEnum.finished
                )
                result = await db.execute(query)
                projects = result.scalars().all()

                for project in projects:
                    project.status = TimeEntryStatusEnum.finished
                    # Send notification to the user
                    # Implement your notification logic here

                await db.commit()
        except SQLAlchemyError as e:
            # Handle exceptions and possibly log them
            print(f"Error updating project statuses: {e}")
            await db.rollback()
        except Exception as e:
            # Handle other exceptions
            print(f"Unexpected error: {e}")

        # Sleep for 30 minutes
        await asyncio.sleep(1800)

