from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from . import models

def seed_database(db: Session):
    # Check if workers already exist
    existing_workers = db.query(models.Worker).count()
    if existing_workers > 0:
        return  # Already seeded

    # Seed Default Personas
    maya = models.Worker(
        name="Maya",
        role="Housekeeping / Maid",
        phone="+91 98765 43210",
        avatar_color="#10b981"
    )
    anita = models.Worker(
        name="Anita",
        role="Chef / Cook",
        phone="+91 98765 43211",
        avatar_color="#f59e0b"
    )
    rahul = models.Worker(
        name="Rahul",
        role="Driver / Errands",
        phone="+91 98765 43212",
        avatar_color="#3b82f6"
    )
    suresh = models.Worker(
        name="Suresh",
        role="Gardener / Maintenance",
        phone="+91 98765 43213",
        avatar_color="#84cc16"
    )

    db.add_all([maya, anita, rahul, suresh])
    db.flush()

    # Seed initial tasks across the 5 stages of the verifiable lifecycle
    # Task 1: In Progress with Maya
    t1 = models.Task(
        title="Deep Clean Master Suite & Balcony Glass",
        description="Vacuum rugs, sanitize ensuite bathroom, replace linen with Egyptian cotton set, clean balcony sliding door glass.",
        category="Housekeeping",
        room="Master Suite (2nd Floor)",
        priority="Urgent",
        due_time="14:00 Today",
        status="In Progress",
        assigned_to_id=maya.id,
        created_at=datetime.utcnow() - timedelta(hours=2),
        started_at=datetime.utcnow() - timedelta(minutes=45),
        elapsed_seconds=2700
    )
    db.add(t1)
    db.flush()

    db.add_all([
        models.ChecklistItem(task_id=t1.id, item_text="Vacuum master bedroom & dressing area", is_completed=True),
        models.ChecklistItem(task_id=t1.id, item_text="Sanitize ensuite bathroom & restock fresh towels", is_completed=True),
        models.ChecklistItem(task_id=t1.id, item_text="Change bed linens to Egyptian cotton set", is_completed=False),
        models.ChecklistItem(task_id=t1.id, item_text="Streak-free wipe on balcony glass doors", is_completed=False),
        models.AuditLog(task_id=t1.id, action="Assigned", performed_by="Owner / Master Admin", remarks="Assigned to Maya with Urgent priority"),
        models.AuditLog(task_id=t1.id, action="Acknowledged", performed_by="Maya", remarks="Task opened and acknowledged on mobile view"),
        models.AuditLog(task_id=t1.id, action="Started", performed_by="Maya", remarks="Commenced deep cleaning with live elapsed timer")
    ])

    # Task 2: Submitted / Verification Needed with Anita
    t2 = models.Task(
        title="Prepare 4-Course French Riviera Dinner",
        description="VIP guests arriving at 20:00. Prepare Bouillabaisse, Herb Roasted Lamb, Truffle Dauphinoise, and Crème Brûlée.",
        category="Culinary",
        room="Main Kitchen & Pantry",
        priority="Urgent",
        due_time="19:30 Today",
        status="Submitted",
        assigned_to_id=anita.id,
        created_at=datetime.utcnow() - timedelta(hours=4),
        started_at=datetime.utcnow() - timedelta(hours=3),
        submitted_at=datetime.utcnow() - timedelta(minutes=15),
        elapsed_seconds=10200,
        worker_notes="Appetizers and bouillabaisse base completed. Lamb is marinating in rosemary and garlic. Table setting is laid out with silver cutlery."
    )
    db.add(t2)
    db.flush()

    db.add_all([
        models.ChecklistItem(task_id=t2.id, item_text="Inventory organic produce from pantry", is_completed=True),
        models.ChecklistItem(task_id=t2.id, item_text="Simmer Bouillabaisse seafood broth", is_completed=True),
        models.ChecklistItem(task_id=t2.id, item_text="Prep Herb-crusted Lamb rack", is_completed=True),
        models.ChecklistItem(task_id=t2.id, item_text="Bake and chill crème brûlée ramekins", is_completed=True),
        models.AuditLog(task_id=t2.id, action="Assigned", performed_by="Owner / Master Admin", remarks="VIP dinner instructions dispatched"),
        models.AuditLog(task_id=t2.id, action="Acknowledged", performed_by="Anita", remarks="Menu ingredients reviewed"),
        models.AuditLog(task_id=t2.id, action="Started", performed_by="Anita", remarks="Kitchen prep begun"),
        models.AuditLog(task_id=t2.id, action="Submitted", performed_by="Anita", remarks="Submitted for Owner review and tasting approval")
    ])

    # Task 3: Assigned (New) with Rahul
    t3 = models.Task(
        title="Airport VIP Pickup & Dry Cleaning Retrieval",
        description="Mercedes S-Class must be fueled and detailed. Collect dry cleaning from Park Avenue Cleaners, then meet Flight BA-142 at Terminal 3 at 16:15.",
        category="Errands & Transport",
        room="North Gate & Garage",
        priority="Normal",
        due_time="15:45 Today",
        status="Assigned",
        assigned_to_id=rahul.id,
        created_at=datetime.utcnow() - timedelta(minutes=30)
    )
    db.add(t3)
    db.flush()

    db.add_all([
        models.ChecklistItem(task_id=t3.id, item_text="Wash and interior vacuum Mercedes S-Class", is_completed=False),
        models.ChecklistItem(task_id=t3.id, item_text="Verify tire pressures and windshield fluid", is_completed=False),
        models.ChecklistItem(task_id=t3.id, item_text="Pick up 6 garments from Park Avenue Cleaners", is_completed=False),
        models.ChecklistItem(task_id=t3.id, item_text="Arrive at Terminal 3 VIP Arrivals parking by 16:15", is_completed=False),
        models.AuditLog(task_id=t3.id, action="Assigned", performed_by="Owner / Master Admin", remarks="Assigned to Rahul")
    ])

    # Task 4: Approved / Completed with Suresh
    t4 = models.Task(
        title="Trim Boxwood Hedges & Inspect Sprinklers",
        description="Formal English garden hedging needs precision squaring. Calibrate zone 4 drip irrigation timers.",
        category="Landscape & Grounds",
        room="Formal Garden & South Courtyard",
        priority="Low",
        due_time="12:00 Today",
        status="Approved",
        assigned_to_id=suresh.id,
        created_at=datetime.utcnow() - timedelta(days=1),
        started_at=datetime.utcnow() - timedelta(hours=6),
        submitted_at=datetime.utcnow() - timedelta(hours=2),
        completed_at=datetime.utcnow() - timedelta(hours=1),
        elapsed_seconds=14400,
        worker_notes="All perimeter hedges leveled with laser guide. Drip zone 4 nozzle 3 replaced due to calcium clogging. All clean."
    )
    db.add(t4)
    db.flush()

    db.add_all([
        models.ChecklistItem(task_id=t4.id, item_text="Prune rose garden deadheads", is_completed=True),
        models.ChecklistItem(task_id=t4.id, item_text="Laser-trim boxwood perimeter", is_completed=True),
        models.ChecklistItem(task_id=t4.id, item_text="Flush irrigation line 4 & test pressure", is_completed=True),
        models.AuditLog(task_id=t4.id, action="Assigned", performed_by="Owner / Master Admin", remarks="Regular landscape maintenance"),
        models.AuditLog(task_id=t4.id, action="Acknowledged", performed_by="Suresh", remarks="Tools and fuel prepared"),
        models.AuditLog(task_id=t4.id, action="Started", performed_by="Suresh", remarks="Hedging and irrigation work in progress"),
        models.AuditLog(task_id=t4.id, action="Submitted", performed_by="Suresh", remarks="Grounds trimmed and clippings composted"),
        models.AuditLog(task_id=t4.id, action="Approved", performed_by="Property Owner", remarks="Grounds inspected via CCTV & terrace walk. Approved.")
    ])

    db.commit()

