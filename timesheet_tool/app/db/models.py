from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import relationship, DeclarativeBase
from sqlalchemy.ext.declarative import declarative_base
from pydantic import BaseModel
from sqlalchemy import CheckConstraint
import enum

# Base class for database models
class Base(DeclarativeBase):
    pass


# Enum for user roles
class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default="user")  # user or admin

    # Relationship with Project
    projects = relationship("Project", back_populates="owner", lazy="raise")  # Links to 'owner' in Project
    time_entries = relationship("TimeEntry", back_populates="user", lazy="raise")  # Links to 'user' in TimeEntry

# Project Model
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Bidirectional relationship with User
    owner = relationship("User", back_populates="projects", lazy="raise")

    # Relationship with TimeEntry
    time_entries = relationship("TimeEntry", back_populates="project", lazy="raise")  # Links to 'project' in TimeEntry

# TimeEntry Model
class TimeEntryStatusEnum(str, enum.Enum):
    open = "open"
    breaktime = "breaktime"
    finished = "finished"


class Break(Base):
    __tablename__ = "breaks"

    id = Column(Integer, primary_key=True, index=True)
    time_entry_id = Column(Integer, ForeignKey("time_entries.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)

    time_entry = relationship("TimeEntry", back_populates="breaks", lazy="raise")

class TimeEntry(Base):
    __tablename__ = "time_entries"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False, default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    description = Column(String)
    status = Column(Enum(TimeEntryStatusEnum), default="open")
    price = Column(Integer, nullable=True)

    # stay_duration = Column(Integer, nullable=True)
    
    breaks = relationship("Break", back_populates="time_entry", lazy="raise")


    # Relationship with Project
    project = relationship("Project", back_populates="time_entries", lazy="raise")  # Links to 'time_entries' in Project
    user = relationship("User", back_populates="time_entries", lazy="raise")  # Links to 'time_entries' in User
    __table_args__ = (
        CheckConstraint('end_time > start_time', name='check_end_time'),
    )


# Pydantic models for request validation
class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
