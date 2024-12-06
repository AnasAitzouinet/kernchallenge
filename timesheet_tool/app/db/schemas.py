from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional, List
from app.db.models import TimeEntryStatusEnum

# User schemas
class UserCreate(BaseModel):
    name: str
    email: str
    password: str

class UserRead(BaseModel):
    id: int
    name: str
    email: str

    class Config:
        orm_mode = True



class ProjectBase(BaseModel):
    name: str
    description: Optional[str] = None
    start_time: Optional[datetime] = Field(default_factory=datetime.now)
    end_time: Optional[datetime] = None
    status: Optional[TimeEntryStatusEnum] = TimeEntryStatusEnum.open
    redo: Optional[bool] = False

class ProjectCreate(ProjectBase):
    pass

class ProjectRead(ProjectBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True

