from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.schemas import ProjectCreate, ProjectRead
from app.services.project_service import ProjectService
from app.core.dependencies import get_current_user
from app.db.session import get_db
from app.db.models import User

router = APIRouter()

@router.post("/")
async def create_project_handler(
    project: ProjectCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Create a new project for the current user.
    """
    service = ProjectService(db, current_user)
    try:
        return await service.create_project(project, current_user)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/", response_model=list[ProjectRead])
async def list_projects_handler(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    List all projects owned by the current user.
    """
    service = ProjectService(db, current_user)
    return await service.get_projects()

@router.delete("/{project_id}")
async def remove_project_handler(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Remove a project by its ID.
    """
    service = ProjectService(db, current_user)
    try:
        await service.remove_project_by_id(project_id)
        return {"message": "Project removed successfully"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{project_id}/start_break")
async def start_break_handler(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Start a break for a specific project.
    """
    service = ProjectService(db, current_user)
    try:
        new_break = await service.start_break(project_id)
        return new_break
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/{project_id}/end_break")
async def end_break_handler(
    project_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    End the current break for a specific project.
    """
    service = ProjectService(db, current_user)
    try:
        ended_break = await service.end_break(project_id)
        return ended_break
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
