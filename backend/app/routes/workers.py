from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas

router = APIRouter(prefix="/workers", tags=["Workers"])

@router.get("", response_model=List[schemas.WorkerResponse])
def get_all_workers(db: Session = Depends(get_db)):
    """Retrieve all domestic staff members."""
    return crud.get_workers(db)

@router.post("", response_model=schemas.WorkerResponse, status_code=status.HTTP_201_CREATED)
def add_custom_worker(worker_in: schemas.WorkerCreate, db: Session = Depends(get_db)):
    """Add a custom staff member with name, role title, phone number, and avatar color."""
    if not worker_in.name.strip():
        raise HTTPException(status_code=400, detail="Staff name is required")
    if not worker_in.role.strip():
        raise HTTPException(status_code=400, detail="Staff role is required")
        
    return crud.create_worker(db, worker_in)

@router.get("/{worker_id}", response_model=schemas.WorkerResponse)
def get_worker_by_id(worker_id: int, db: Session = Depends(get_db)):
    worker = crud.get_worker(db, worker_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Staff member not found")
    return worker

