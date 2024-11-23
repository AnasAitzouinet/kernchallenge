from fastapi import APIRouter

router = APIRouter()

@router.get("/")
async def generate_report():
    """
    Generate a report.
    """
    return {"message": "Report generated"}
