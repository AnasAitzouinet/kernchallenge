from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum, func
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from typing import List, Optional
from pydantic import BaseModel
import enum
from sqlalchemy import CheckConstraint

# Base class for database models
Base = declarative_base()


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
    projects = relationship("Project", back_populates="owner")  # Links to 'owner' in Project
    time_entries = relationship("TimeEntry", back_populates="user")  # Links to 'user' in TimeEntry

# Project Model
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    # Bidirectional relationship with User
    owner = relationship("User", back_populates="projects")

    # Relationship with TimeEntry
    time_entries = relationship("TimeEntry", back_populates="project")  # Links to 'project' in TimeEntry

# TimeEntry Model
class TimeEntryStatusEnum(str, enum.Enum):
    open = "open"
    submitted = "submitted"
    approved = "approved"
    rejected = "rejected"
    breaktime = "breaktime"

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

    start_break_time = Column(DateTime(timezone=True), nullable=True)
    end_break_time = Column(DateTime(timezone=True), nullable=True)


    # Relationship with Project
    project = relationship("Project", back_populates="time_entries")  # Links to 'time_entries' in Project
    user = relationship("User", back_populates="time_entries")
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
