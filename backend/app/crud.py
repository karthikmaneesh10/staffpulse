from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import func
from . import models, schemas

# --- Worker CRUD ---
def get_workers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Worker).filter(models.Worker.is_active == True).offset(skip).limit(limit).all()

def get_worker(db: Session, worker_id: int):
    return db.query(models.Worker).filter(models.Worker.id == worker_id).first()

def create_worker(db: Session, worker_in: schemas.WorkerCreate):
    db_worker = models.Worker(
        name=worker_in.name,
        role=worker_in.role,
        phone=worker_in.phone,
        avatar_color=worker_in.avatar_color or "#059669",
        is_active=worker_in.is_active
    )
    db.add(db_worker)
    db.commit()
    db.refresh(db_worker)
    return db_worker

# --- Task CRUD & Lifecycle Transitions ---
def get_tasks(
    db: Session, 
    worker_id: int = None, 
    status: str = None, 
    priority: str = None, 
    room: str = None,
    search: str = None
):
    query = db.query(models.Task)
    if worker_id:
        query = query.filter(models.Task.assigned_to_id == worker_id)
    if status:
        query = query.filter(models.Task.status == status)
    if priority:
        query = query.filter(models.Task.priority == priority)
    if room:
        query = query.filter(models.Task.room.ilike(f"%{room}%"))
    if search:
        search_pattern = f"%{search}%"
        query = query.filter(
            (models.Task.title.ilike(search_pattern)) | 
            (models.Task.category.ilike(search_pattern)) |
            (models.Task.room.ilike(search_pattern))
        )
    return query.order_by(models.Task.id.desc()).all()

def get_task(db: Session, task_id: int):
    return db.query(models.Task).filter(models.Task.id == task_id).first()

def create_task(db: Session, task_in: schemas.TaskCreate):
    # Step 1: ASSIGNED
    db_task = models.Task(
        title=task_in.title,
        description=task_in.description,
        category=task_in.category,
        room=task_in.room,
        priority=task_in.priority,
        due_time=task_in.due_time,
        assigned_to_id=task_in.assigned_to_id,
        status="Assigned",
        created_at=datetime.utcnow()
    )
    db.add(db_task)
    db.flush()  # get db_task.id

    # Create checklist items
    if task_in.checklist:
        for item_text in task_in.checklist:
            if item_text.strip():
                item = models.ChecklistItem(
                    task_id=db_task.id,
                    item_text=item_text.strip(),
                    is_completed=False
                )
                db.add(item)

    # Add audit log
    worker = db.query(models.Worker).filter(models.Worker.id == task_in.assigned_to_id).first()
    worker_name = worker.name if worker else "Unassigned"
    audit = models.AuditLog(
        task_id=db_task.id,
        action="Assigned",
        performed_by="Owner / Master Admin",
        remarks=f"Task assigned to {worker_name} ({task_in.priority} priority, room: {task_in.room})"
    )
    db.add(audit)

    db.commit()
    db.refresh(db_task)
    return db_task

def acknowledge_task(db: Session, task_id: int, worker_id: int = None):
    # Step 2: RECEIVED & OPENED -> updates to "Acknowledged"
    task = get_task(db, task_id)
    if not task:
        return None
    
    # Only transition if it's currently Assigned or Redo Requested
    if task.status in ["Assigned", "Redo Requested"]:
        task.status = "Acknowledged"
        worker_name = task.worker.name if task.worker else "Designated Worker"
        audit = models.AuditLog(
            task_id=task.id,
            action="Acknowledged",
            performed_by=worker_name,
            remarks=f"Task opened and acknowledged on mobile device"
        )
        db.add(audit)
        db.commit()
        db.refresh(task)
    return task

def start_task(db: Session, task_id: int, worker_id: int = None):
    # Step 3: IN PROGRESS -> Worker taps "Start Task", timer begins
    task = get_task(db, task_id)
    if not task:
        return None
    
    task.status = "In Progress"
    if not task.started_at:
        task.started_at = datetime.utcnow()
    
    worker_name = task.worker.name if task.worker else "Designated Worker"
    audit = models.AuditLog(
        task_id=task.id,
        action="Started",
        performed_by=worker_name,
        remarks=f"Worker commenced task. Live timer started."
    )
    db.add(audit)
    db.commit()
    db.refresh(task)
    return task

def submit_task(db: Session, task_id: int, submit_in: schemas.TaskSubmit):
    # Step 4: SUBMITTED / COMPLETED -> marks checklist, adds remarks, submits work done
    task = get_task(db, task_id)
    if not task:
        return None
    
    task.status = "Submitted"
    task.submitted_at = datetime.utcnow()
    task.worker_notes = submit_in.worker_notes
    if submit_in.elapsed_seconds is not None:
        task.elapsed_seconds = submit_in.elapsed_seconds
    
    # Update checklist states if provided
    if submit_in.checklist_states:
        for item in task.checklist:
            if str(item.id) in submit_in.checklist_states:
                item.is_completed = bool(submit_in.checklist_states[str(item.id)])

    worker_name = task.worker.name if task.worker else "Designated Worker"
    audit = models.AuditLog(
        task_id=task.id,
        action="Submitted",
        performed_by=worker_name,
        remarks=f"Worker submitted task for review. Notes: '{submit_in.worker_notes}'"
    )
    db.add(audit)
    db.commit()
    db.refresh(task)
    return task

def approve_task(db: Session, task_id: int, approve_in: schemas.TaskApprove):
    # Step 5: OWNER VERIFICATION -> Approve & Close
    task = get_task(db, task_id)
    if not task:
        return None
    
    task.status = "Approved"
    task.completed_at = datetime.utcnow()
    
    audit = models.AuditLog(
        task_id=task.id,
        action="Approved",
        performed_by=approve_in.approver_name or "Property Owner",
        remarks=approve_in.remarks or "Task inspected, verified, and officially closed."
    )
    db.add(audit)
    db.commit()
    db.refresh(task)
    return task

def request_redo_task(db: Session, task_id: int, redo_in: schemas.TaskRedo):
    # Step 5 Alternative: OWNER VERIFICATION -> Request Redo with feedback
    task = get_task(db, task_id)
    if not task:
        return None
    
    task.status = "Redo Requested"
    task.redo_feedback = redo_in.feedback
    
    audit = models.AuditLog(
        task_id=task.id,
        action="Redo Requested",
        performed_by=redo_in.approver_name or "Property Owner",
        remarks=f"Owner requested redo. Feedback: '{redo_in.feedback}'"
    )
    db.add(audit)
    db.commit()
    db.refresh(task)
    return task

def toggle_checklist_item(db: Session, item_id: int):
    item = db.query(models.ChecklistItem).filter(models.ChecklistItem.id == item_id).first()
    if item:
        item.is_completed = not item.is_completed
        db.commit()
        db.refresh(item)
    return item

def get_stats(db: Session):
    total_workers = db.query(models.Worker).filter(models.Worker.is_active == True).count()
    total_tasks = db.query(models.Task).count()
    
    # Active Duties: Assigned or Acknowledged
    active_duties = db.query(models.Task).filter(models.Task.status.in_(["Assigned", "Acknowledged"])).count()
    
    # Tasks In Progress
    tasks_in_progress = db.query(models.Task).filter(models.Task.status == "In Progress").count()
    
    # Pending Verification: Submitted
    pending_verification = db.query(models.Task).filter(models.Task.status.in_(["Submitted", "Redo Requested"])).count()
    
    # Completed Today: Approved
    completed_today = db.query(models.Task).filter(models.Task.status == "Approved").count()
    
    return schemas.DashboardStats(
        active_duties=active_duties,
        tasks_in_progress=tasks_in_progress,
        pending_verification=pending_verification,
        completed_today=completed_today,
        total_workers=total_workers,
        total_tasks=total_tasks
    )

