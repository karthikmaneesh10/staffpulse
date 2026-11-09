import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Enum
from sqlalchemy.orm import relationship
from .database import Base

class PriorityEnum(str, enum.Enum):
    URGENT = "Urgent"
    NORMAL = "Normal"
    LOW = "Low"

class TaskStatusEnum(str, enum.Enum):
    ASSIGNED = "Assigned"
    ACKNOWLEDGED = "Acknowledged"
    IN_PROGRESS = "In Progress"
    SUBMITTED = "Submitted"
    APPROVED = "Approved"
    REDO_REQUESTED = "Redo Requested"

class Worker(Base):
    __tablename__ = "workers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    role = Column(String(100), nullable=False)
    phone = Column(String(30), nullable=True)
    avatar_color = Column(String(30), default="#059669")  # Emerald default
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    tasks = relationship("Task", back_populates="worker", cascade="all, delete-orphan")

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, default="General")
    room = Column(String(100), nullable=False, default="Main House")
    priority = Column(String(20), default="Normal")  # Urgent, Normal, Low
    status = Column(String(30), default="Assigned")   # Assigned, Acknowledged, In Progress, Submitted, Approved, Redo Requested
    
    assigned_to_id = Column(Integer, ForeignKey("workers.id", ondelete="SET NULL"), nullable=True)
    
    due_time = Column(String(100), nullable=True)     # e.g., "14:00 Today" or ISO string
    created_at = Column(DateTime, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    submitted_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    
    elapsed_seconds = Column(Integer, default=0)
    worker_notes = Column(Text, nullable=True)
    redo_feedback = Column(Text, nullable=True)

    # Relationships
    worker = relationship("Worker", back_populates="tasks")
    checklist = relationship("ChecklistItem", back_populates="task", cascade="all, delete-orphan", order_by="ChecklistItem.id")
    audit_logs = relationship("AuditLog", back_populates="task", cascade="all, delete-orphan", order_by="AuditLog.timestamp.desc()")

class ChecklistItem(Base):
    __tablename__ = "checklist_items"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    item_text = Column(String(255), nullable=False)
    is_completed = Column(Boolean, default=False)

    task = relationship("Task", back_populates="checklist")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False)
    action = Column(String(50), nullable=False)  # Created, Acknowledged, Started, Submitted, Approved, Redo Requested
    performed_by = Column(String(100), default="System")
    remarks = Column(Text, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)

    task = relationship("Task", back_populates="audit_logs")

