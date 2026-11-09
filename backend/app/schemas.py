from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field

# --- Checklist Schemas ---
class ChecklistItemBase(BaseModel):
    item_text: str
    is_completed: bool = False

class ChecklistItemCreate(ChecklistItemBase):
    pass

class ChecklistItemResponse(ChecklistItemBase):
    id: int
    task_id: int

    class Config:
        from_attributes = True

# --- Audit Log Schemas ---
class AuditLogResponse(BaseModel):
    id: int
    action: str
    performed_by: str
    remarks: Optional[str] = None
    timestamp: datetime

    class Config:
        from_attributes = True

# --- Worker Schemas ---
class WorkerBase(BaseModel):
    name: str
    role: str
    phone: Optional[str] = None
    avatar_color: Optional[str] = "#059669"
    is_active: bool = True

class WorkerCreate(WorkerBase):
    pass

class WorkerResponse(WorkerBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True

# --- Task Schemas ---
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "General"
    room: str = "Main House"
    priority: str = "Normal"  # Urgent, Normal, Low
    due_time: Optional[str] = "Today 18:00"
    assigned_to_id: Optional[int] = None

class TaskCreate(TaskBase):
    checklist: Optional[List[str]] = Field(default_factory=list)

class TaskAcknowledge(BaseModel):
    worker_id: Optional[int] = None

class TaskStart(BaseModel):
    worker_id: Optional[int] = None

class TaskSubmit(BaseModel):
    worker_id: Optional[int] = None
    worker_notes: str
    elapsed_seconds: Optional[int] = None
    checklist_states: Optional[dict] = None  # map of checklist id -> bool

class TaskApprove(BaseModel):
    approver_name: Optional[str] = "Property Owner"
    remarks: Optional[str] = "Work inspected and approved"

class TaskRedo(BaseModel):
    approver_name: Optional[str] = "Property Owner"
    feedback: str

class TaskResponse(TaskBase):
    id: int
    status: str
    created_at: datetime
    started_at: Optional[datetime] = None
    submitted_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    elapsed_seconds: int = 0
    worker_notes: Optional[str] = None
    redo_feedback: Optional[str] = None
    worker: Optional[WorkerResponse] = None
    checklist: List[ChecklistItemResponse] = []
    audit_logs: List[AuditLogResponse] = []

    class Config:
        from_attributes = True

# --- Dashboard Stats Schemas ---
class DashboardStats(BaseModel):
    active_duties: int
    tasks_in_progress: int
    pending_verification: int
    completed_today: int
    total_workers: int
    total_tasks: int

