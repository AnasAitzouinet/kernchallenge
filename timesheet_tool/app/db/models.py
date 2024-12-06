from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Enum,
    Boolean,
    func,
    CheckConstraint,
)
from sqlalchemy.orm import relationship, declarative_base
import enum
from pydantic import BaseModel

Base = declarative_base()

# Enums
class UserRole(str, enum.Enum):
    user = "user"
    admin = "admin"

class TimeEntryStatusEnum(str, enum.Enum):
    open = "open"
    finished = "finished"
    breaktime = "breaktime"

# User Model
class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.user)

    # Relationships
    projects = relationship("Project", back_populates="owner", lazy="raise")

# Project Model
class Project(Base):
    __tablename__ = "projects"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(String, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False, server_default=func.now())
    end_time = Column(DateTime(timezone=True), nullable=True)
    status = Column(Enum(TimeEntryStatusEnum), default=TimeEntryStatusEnum.open)
    redo = Column(Boolean, default=False)

    # Relationships
    owner = relationship("User", back_populates="projects", lazy="raise")
    breaks = relationship(
        "Break",
        back_populates="project",
        lazy="raise",
        cascade="all, delete-orphan",
        passive_deletes=True
    )

    __table_args__ = (
        CheckConstraint('end_time > start_time', name='check_end_time'),
    )

# Break Model
class Break(Base):
    __tablename__ = "breaks"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    start_time = Column(DateTime(timezone=True), nullable=False)
    end_time = Column(DateTime(timezone=True), nullable=True)

    # Relationships
    project = relationship("Project", back_populates="breaks", lazy="raise")

    __table_args__ = (
        CheckConstraint('end_time >= start_time', name='check_break_end_time'),
    )

class LoginRequest(BaseModel):
    email: str
    password: str

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str
