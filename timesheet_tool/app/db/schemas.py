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

class ProjectCreate(ProjectBase):
    pass

class ProjectRead(ProjectBase):
    id: int
    owner_id: int

    class Config:
        orm_mode = True


# Time entry schemas

class BreakCreate(BaseModel):
    time_entry_id: int


class BreakRead(BaseModel):
    id: int
    start_time: datetime
    end_time: Optional[datetime]

    class Config:
        orm_mode = True
        
class TimeEntryCreate(BaseModel):
    project_id: int
    description: Optional[str] = Field(None, max_length=255)


class TimeEntryRead(BaseModel):
    id: int
    project_id: int
    user_id: int
    start_time: datetime
    end_time: Optional[datetime]
    description: Optional[str]
    status: TimeEntryStatusEnum
    breaks: List[BreakRead] = []

    class Config:
        orm_mode = True
