from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from ..database import get_db, DB_DIALECT, ACTIVE_DB_URL, Base, engine
from .. import crud, schemas, models
from ..seed_data import seed_database

router = APIRouter(tags=["Stats & System"])

@router.get("/stats", response_model=schemas.DashboardStats)
def get_dashboard_metrics(db: Session = Depends(get_db)):
    """Provides real-time estate operational metrics for the Owner dashboard."""
    return crud.get_stats(db)

@router.post("/reset-demo")
def reset_demo_data(db: Session = Depends(get_db)):
    """Resets tasks and staff members back to default luxury estate demo state."""
    db.query(models.AuditLog).delete()
    db.query(models.ChecklistItem).delete()
    db.query(models.Task).delete()
    db.query(models.Worker).delete()
    db.commit()

    seed_database(db)
    return {"status": "success", "message": "Demo estate data reloaded successfully"}

@router.get("/health")
def health_check():
    """Returns system status and active database dialect (PostgreSQL / SQLite)."""
    return {
        "status": "healthy",
        "service": "StaffPulse Backend API",
        "database_dialect": DB_DIALECT,
        "active_database": ACTIVE_DB_URL.split("@")[-1] if "@" in ACTIVE_DB_URL else ACTIVE_DB_URL
    }

