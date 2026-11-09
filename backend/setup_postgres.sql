-- ========================================================
-- StaffPulse - PostgreSQL Database Initialization Script
-- ========================================================

-- Step 1: Create Database (Run as postgres superuser if database doesn't exist)
-- CREATE DATABASE staffpulse_db;

-- Step 2: Connect to database
-- \c staffpulse_db;

-- Step 3: Create Domestic Staff Workers Table
CREATE TABLE IF NOT EXISTS workers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(100) NOT NULL,
    phone VARCHAR(30),
    avatar_color VARCHAR(30) DEFAULT '#10b981',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- Step 4: Create Tasks Table with 5-Stage Lifecycle
CREATE TABLE IF NOT EXISTS tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category VARCHAR(100) DEFAULT 'General',
    room VARCHAR(100) DEFAULT 'Main House',
    priority VARCHAR(20) DEFAULT 'Normal',
    status VARCHAR(30) DEFAULT 'Assigned', -- 'Assigned', 'Acknowledged', 'In Progress', 'Submitted', 'Approved', 'Redo Requested'
    assigned_to_id INTEGER REFERENCES workers(id) ON DELETE SET NULL,
    due_time VARCHAR(100),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc'),
    started_at TIMESTAMP WITHOUT TIME ZONE,
    submitted_at TIMESTAMP WITHOUT TIME ZONE,
    completed_at TIMESTAMP WITHOUT TIME ZONE,
    elapsed_seconds INTEGER DEFAULT 0,
    worker_notes TEXT,
    redo_feedback TEXT
);

-- Step 5: Create Checklist Items Table
CREATE TABLE IF NOT EXISTS checklist_items (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    item_text VARCHAR(255) NOT NULL,
    is_completed BOOLEAN DEFAULT FALSE
);

-- Step 6: Create Chronological Audit Trail Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    task_id INTEGER NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    action VARCHAR(50) NOT NULL,
    performed_by VARCHAR(100) DEFAULT 'System',
    remarks TEXT,
    timestamp TIMESTAMP WITHOUT TIME ZONE DEFAULT (NOW() AT TIME ZONE 'utc')
);

-- Step 7: Create Performance Indexes
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_priority ON tasks(priority);
CREATE INDEX IF NOT EXISTS idx_checklist_task ON checklist_items(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_task ON audit_logs(task_id);

