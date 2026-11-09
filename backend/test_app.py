import sys
from app.database import DB_DIALECT, SessionLocal, Base, engine
from app.seed_data import seed_database
from app import crud, schemas, models

print(f"--- StaffPulse Comprehensive Lifecycle Test ---")
print(f"Database dialect: {DB_DIALECT}")

# Create tables in the active database (PostgreSQL)
Base.metadata.create_all(bind=engine)

with SessionLocal() as db:
    seed_database(db)
    # 1. Verify Workers
    workers = crud.get_workers(db)
    print(f"Initial Workers count: {len(workers)}")
    for w in workers:
        print(f"  • {w.name} ({w.role}) - Theme: {w.avatar_color}")

    # 2. Add Custom Worker
    custom_worker = crud.create_worker(db, schemas.WorkerCreate(
        name="Vikram",
        role="Butler / Estate Concierge",
        phone="+91 98765 43299",
        avatar_color="#a855f7"
    ))
    print(f"\n[PASS] Added Custom Staff Member: {custom_worker.name} (ID: {custom_worker.id})")

    # 3. Step 1: ASSIGNED
    task_in = schemas.TaskCreate(
        title="Decant 1982 Vintage Bordeaux & Set Cigar Lounge",
        description="Aerate wine 2 hours prior to VIP dinner. Maintain humidor at 70% humidity.",
        category="Hospitality & Butler",
        room="Wine Cellar & Library",
        priority="Urgent",
        due_time="19:00 Today",
        assigned_to_id=custom_worker.id,
        checklist=[
            "Inspect wine cellar temperature",
            "Decant 1982 Bordeaux Chateau Margaux",
            "Prepare humidors in library"
        ]
    )
    t = crud.create_task(db, task_in)
    print(f"[PASS] Step 1: ASSIGNED -> Task #{t.id} '{t.title}', Status: {t.status}")
    assert t.status == "Assigned"
    assert len(t.checklist) == 3

    # 4. Step 2: ACKNOWLEDGED (Worker views inbox and taps open)
    t = crud.acknowledge_task(db, t.id, custom_worker.id)
    print(f"[PASS] Step 2: ACKNOWLEDGED -> Status: {t.status}")
    assert t.status == "Acknowledged"

    # 5. Step 3: IN PROGRESS (Worker starts task; live timer starts)
    t = crud.start_task(db, t.id, custom_worker.id)
    print(f"[PASS] Step 3: IN PROGRESS -> Status: {t.status}, Started at: {t.started_at}")
    assert t.status == "In Progress"
    assert t.started_at is not None

    # 6. Step 4: SUBMITTED (Worker checks items and submits completion remarks)
    submit_in = schemas.TaskSubmit(
        worker_id=custom_worker.id,
        worker_notes="Bordeaux decanted in crystal carafe. Humidor verified at 70%. Library fireplace lit.",
        elapsed_seconds=1850,
        checklist_states={str(t.checklist[0].id): True, str(t.checklist[1].id): True}
    )
    t = crud.submit_task(db, t.id, submit_in)
    print(f"[PASS] Step 4: SUBMITTED -> Status: {t.status}, Elapsed: {t.elapsed_seconds}s")
    print(f"       Worker Notes: '{t.worker_notes}'")
    assert t.status == "Submitted"
    assert t.worker_notes == submit_in.worker_notes

    # 7. Step 5 Alternate: REDO REQUESTED (Owner inspects and sends feedback)
    redo_in = schemas.TaskRedo(
        approver_name="Property Owner",
        feedback="Please ensure temperature reads exactly 17.5C and polish crystal rim."
    )
    t = crud.request_redo_task(db, t.id, redo_in)
    print(f"[PASS] Step 5 Alternate: REDO REQUESTED -> Status: {t.status}")
    print(f"       Owner Feedback: '{t.redo_feedback}'")
    assert t.status == "Redo Requested"

    # Re-submit
    t = crud.submit_task(db, t.id, schemas.TaskSubmit(
        worker_id=custom_worker.id,
        worker_notes="Crystal rim polished with microfibre. Thermometer calibrated to 17.5C.",
        elapsed_seconds=2100
    ))

    # 8. Step 5 Final: APPROVED & CLOSED (Owner approves)
    approve_in = schemas.TaskApprove(
        approver_name="Property Owner",
        remarks="Inspected in person. Pristine execution."
    )
    t = crud.approve_task(db, t.id, approve_in)
    print(f"[PASS] Step 5: APPROVED & CLOSED -> Status: {t.status}, Completed at: {t.completed_at}")
    assert t.status == "Approved"
    assert t.completed_at is not None

    # 9. Verify Audit Trail
    print(f"\nChronological Audit Trail for Task #{t.id}:")
    for log in t.audit_logs:
        print(f"  [{log.action}] by {log.performed_by}: {log.remarks} ({log.timestamp.strftime('%H:%M:%S')})")

    # 10. Dashboard Stats
    stats = crud.get_stats(db)
    print(f"\nEstate Stats: Active={stats.active_duties}, InProgress={stats.tasks_in_progress}, Review={stats.pending_verification}, Completed={stats.completed_today}")

print("\n--- ALL TESTS COMPLETED SUCCESSFULLY! ---")
