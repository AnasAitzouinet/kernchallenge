from pydantic import BaseModel
from datetime import datetime
from typing import Optional

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

class TimeEntryBase(BaseModel):
    start_time: datetime
    end_time: Optional[datetime] = None
    description: Optional[str] = None

class TimeEntryCreate(TimeEntryBase):
    project_id: int

class TimeEntryRead(TimeEntryBase):
    id: int
    user_id: int
    project_id: int

    class Config:
        orm_mode = True
