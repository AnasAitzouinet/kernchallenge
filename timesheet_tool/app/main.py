from fastapi import FastAPI
from app.api.v1.routes import auth, projects, time_entries
from app.db.session import engine
from app.db.models import Base
from contextlib import asynccontextmanager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Lifespan event handler for startup and shutdown.
    """
    # Startup: Initialize the database
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield  # Control will pass here during the application's lifetime
    # Shutdown: You can add cleanup tasks here if needed


# Initialize FastAPI app with lifespan
app = FastAPI(title="Timesheet Tool API", version="1.0", lifespan=lifespan)


# Include routers
app.include_router(auth.router, prefix="/api/v1/auth", tags=["Authentication"])
app.include_router(projects.router, prefix="/api/v1/projects", tags=["Projects"])
app.include_router(time_entries.router, prefix="/api/v1/time_entries", tags=["Time Entries"])


@app.get("/")
def read_root():
    return {"message": "Welcome to the Timesheet Tool API"}
