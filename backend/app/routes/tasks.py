from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from ..database import get_db
from .. import crud, schemas, models
from ..seed_data import seed_database

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.get("", response_model=List[schemas.TaskResponse])
def read_tasks(
    worker_id: Optional[int] = Query(None, description="Filter by assigned worker ID"),
    status: Optional[str] = Query(None, description="Filter by task status"),
    priority: Optional[str] = Query(None, description="Filter by priority"),
    room: Optional[str] = Query(None, description="Filter by room/area"),
    search: Optional[str] = Query(None, description="Search in title or room"),
    db: Session = Depends(get_db)
):
    """Retrieve tasks with multi-parameter filtering for the Owner Kanban or Worker views."""
    return crud.get_tasks(db, worker_id=worker_id, status=status, priority=priority, room=room, search=search)

@router.post("", response_model=schemas.TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(task_in: schemas.TaskCreate, db: Session = Depends(get_db)):
    """Owner creates and assigns a new duty."""
    if not task_in.title.strip():
        raise HTTPException(status_code=400, detail="Task title cannot be empty")
    if not task_in.assigned_to_id:
        raise HTTPException(status_code=400, detail="Must assign task to a designated staff member")
    
    worker = crud.get_worker(db, task_in.assigned_to_id)
    if not worker:
        raise HTTPException(status_code=404, detail="Selected staff member does not exist")
        
    return crud.create_task(db, task_in)

@router.get("/{task_id}", response_model=schemas.TaskResponse)
def get_task_detail(task_id: int, db: Session = Depends(get_db)):
    task = crud.get_task(db, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/{task_id}/acknowledge", response_model=schemas.TaskResponse)
def acknowledge_task(task_id: int, ack_in: schemas.TaskAcknowledge = None, db: Session = Depends(get_db)):
    """Step 2: Designated worker views task modal -> status becomes 'Acknowledged'."""
    worker_id = ack_in.worker_id if ack_in else None
    task = crud.acknowledge_task(db, task_id, worker_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/{task_id}/start", response_model=schemas.TaskResponse)
def start_task(task_id: int, start_in: schemas.TaskStart = None, db: Session = Depends(get_db)):
    """Step 3: Worker starts task -> live timer starts, status becomes 'In Progress'."""
    worker_id = start_in.worker_id if start_in else None
    task = crud.start_task(db, task_id, worker_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/{task_id}/submit", response_model=schemas.TaskResponse)
def submit_task(task_id: int, submit_in: schemas.TaskSubmit, db: Session = Depends(get_db)):
    """Step 4: Worker submits remarks & completed checklist -> status becomes 'Submitted'."""
    if not submit_in.worker_notes or not submit_in.worker_notes.strip():
        raise HTTPException(status_code=400, detail="Completion remarks/notes are required")
    task = crud.submit_task(db, task_id, submit_in)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/{task_id}/approve", response_model=schemas.TaskResponse)
def approve_task(task_id: int, approve_in: schemas.TaskApprove, db: Session = Depends(get_db)):
    """Step 5: Owner verifies completion notes -> 'Approved' (Closed)."""
    task = crud.approve_task(db, task_id, approve_in)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/{task_id}/redo", response_model=schemas.TaskResponse)
def redo_task(task_id: int, redo_in: schemas.TaskRedo, db: Session = Depends(get_db)):
    """Step 5 Alternate: Owner requests redo with feedback -> 'Redo Requested'."""
    if not redo_in.feedback or not redo_in.feedback.strip():
        raise HTTPException(status_code=400, detail="Feedback is required when requesting a redo")
    task = crud.request_redo_task(db, task_id, redo_in)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task

@router.post("/checklist/{item_id}/toggle", response_model=schemas.ChecklistItemResponse)
def toggle_checklist(item_id: int, db: Session = Depends(get_db)):
    item = crud.toggle_checklist_item(db, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Checklist item not found")
    return item

