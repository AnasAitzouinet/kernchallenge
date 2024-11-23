from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.schemas import ProjectCreate, ProjectRead
from app.services.project_service import create_project, get_projects_by_user
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models import User
from fastapi import HTTPException

router = APIRouter()

@router.post("/", response_model=ProjectRead)
async def create_project_handler(
    project: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new project for the current user.
    """
    return await create_project(project, current_user, db)

@router.get("/", response_model=list[ProjectRead])
async def list_projects_handler(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all projects owned by the current user.
    """
    projects = await get_projects_by_user(current_user, db)
    if not projects:
        raise HTTPException(status_code=404, detail="No projects found")
    return projects
