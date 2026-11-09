import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import PersonaSwitcher from './components/PersonaSwitcher';
import OwnerDashboard from './components/OwnerDashboard';
import WorkerMobileView from './components/WorkerMobileView';
import CreateTaskModal from './components/CreateTaskModal';
import AddWorkerModal from './components/AddWorkerModal';
import TaskDetailModal from './components/TaskDetailModal';
import { DEFAULT_WORKERS, DEFAULT_TASKS } from './defaultData';
import { soundEngine } from './audio';
import { API_BASE_URL } from './config';
import { Database, ShieldCheck, Wifi, WifiOff } from 'lucide-react';

const STORAGE_KEY_WORKERS = 'staffpulse_workers_v1';
const STORAGE_KEY_TASKS = 'staffpulse_tasks_v1';

export default function App() {
  // 1. Initial State from LocalStorage or Default Seeds
  const [workers, setWorkers] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_WORKERS);
      return saved ? JSON.parse(saved) : DEFAULT_WORKERS;
    } catch {
      return DEFAULT_WORKERS;
    }
  });

  const [tasks, setTasks] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_TASKS);
      return saved ? JSON.parse(saved) : DEFAULT_TASKS;
    } catch {
      return DEFAULT_TASKS;
    }
  });

  const [currentPersona, setCurrentPersona] = useState('owner'); // 'owner' or worker id
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [backendDialect, setBackendDialect] = useState('Local Browser');

  // Modals state
  const [isCreateTaskOpen, setIsCreateTaskOpen] = useState(false);
  const [isAddWorkerOpen, setIsAddWorkerOpen] = useState(false);
  const [inspectingTask, setInspectingTask] = useState(null);

  // 2. Persist to LocalStorage whenever state updates
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(workers));
    } catch (e) {
      console.error('Failed to save workers to localStorage:', e);
    }
  }, [workers]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
    } catch (e) {
      console.error('Failed to save tasks to localStorage:', e);
    }
  }, [tasks]);

  // 3. Try connecting to FastAPI backend & sync latest data if available
  useEffect(() => {
    async function checkBackend() {
      try {
        const res = await fetch(`${API_BASE_URL}/api/health`);
        if (res.ok) {
          const data = await res.json();
          setIsBackendConnected(true);
          setBackendDialect(data.database_dialect || 'PostgreSQL');

          // Pull real-time data from PostgreSQL backend
          try {
            const [wRes, tRes] = await Promise.all([
              fetch(`${API_BASE_URL}/api/workers`),
              fetch(`${API_BASE_URL}/api/tasks`)
            ]);
            if (wRes.ok && tRes.ok) {
              const bWorkers = await wRes.json();
              const bTasks = await tRes.json();
              if (bWorkers && bWorkers.length > 0) {
                setWorkers(bWorkers);
              }
              if (bTasks && bTasks.length > 0) {
                setTasks(bTasks);
              }
            }
          } catch (syncErr) {
            console.info('Using local cache data:', syncErr);
          }
        }
      } catch {
        setIsBackendConnected(false);
      }
    }
    checkBackend();
  }, []);

  // Handlers for Task Lifecycle Transitions:

  // STEP 1: ASSIGNED (Owner creates duty)
  const handleCreateTask = async (taskData) => {
    const newTask = {
      id: Date.now(),
      title: taskData.title,
      description: taskData.description,
      category: taskData.category,
      room: taskData.room,
      priority: taskData.priority,
      due_time: taskData.due_time,
      assigned_to_id: taskData.assigned_to_id,
      status: 'Assigned',
      created_at: new Date().toISOString(),
      started_at: null,
      submitted_at: null,
      completed_at: null,
      elapsed_seconds: 0,
      worker_notes: '',
      redo_feedback: '',
      checklist: (taskData.checklist || []).map((text, idx) => ({
        id: Date.now() + idx,
        item_text: text,
        is_completed: false
      })),
      audit_logs: [
        {
          id: Date.now() + 99,
          action: 'Assigned',
          performed_by: 'Owner / Master Admin',
          remarks: `Assigned with ${taskData.priority} priority for ${taskData.room}`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    setTasks(prev => [newTask, ...prev]);

    // Optional background sync to backend
    if (isBackendConnected) {
      try {
        await fetch(`${API_BASE_URL}/api/tasks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: newTask.title,
            description: newTask.description,
            category: newTask.category,
            room: newTask.room,
            priority: newTask.priority,
            due_time: newTask.due_time,
            assigned_to_id: newTask.assigned_to_id,
            checklist: (taskData.checklist || [])
          })
        });
      } catch (err) {
        console.warn('Backend sync error:', err);
      }
    }
  };

  // STEP 2: RECEIVED & OPENED -> Acknowledged
  const handleAcknowledgeTask = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const workerObj = workers.find(w => w.id === t.assigned_to_id);
        const workerName = workerObj ? workerObj.name : 'Worker';
        const newLogs = [
          ...(t.audit_logs || []),
          {
            id: Date.now(),
            action: 'Acknowledged',
            performed_by: workerName,
            remarks: 'Opened and acknowledged in mobile view',
            timestamp: new Date().toISOString()
          }
        ];
        return {
          ...t,
          status: 'Acknowledged',
          audit_logs: newLogs
        };
      }
      return t;
    }));
  };

  // STEP 3: IN PROGRESS -> Worker starts task, timer begins
  const handleStartTask = (taskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const workerObj = workers.find(w => w.id === t.assigned_to_id);
        const workerName = workerObj ? workerObj.name : 'Worker';
        const newLogs = [
          ...(t.audit_logs || []),
          {
            id: Date.now(),
            action: 'Started',
            performed_by: workerName,
            remarks: 'Live timer running on worker mobile interface',
            timestamp: new Date().toISOString()
          }
        ];
        return {
          ...t,
          status: 'In Progress',
          started_at: t.started_at || new Date().toISOString(),
          audit_logs: newLogs
        };
      }
      return t;
    }));
  };

  // STEP 4: SUBMITTED / COMPLETED -> Worker marks items, adds remarks, submits
  const handleSubmitTask = (taskId, notes, elapsed) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const workerObj = workers.find(w => w.id === t.assigned_to_id);
        const workerName = workerObj ? workerObj.name : 'Worker';
        const newLogs = [
          ...(t.audit_logs || []),
          {
            id: Date.now(),
            action: 'Submitted',
            performed_by: workerName,
            remarks: `Work submitted for Owner review. Notes: "${notes}"`,
            timestamp: new Date().toISOString()
          }
        ];
        return {
          ...t,
          status: 'Submitted',
          submitted_at: new Date().toISOString(),
          worker_notes: notes,
          elapsed_seconds: elapsed || t.elapsed_seconds || 0,
          audit_logs: newLogs
        };
      }
      return t;
    }));
  };

  // STEP 5: OWNER VERIFICATION -> Approve & Close
  const handleApproveTask = (taskId, remarks) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newLogs = [
          ...(t.audit_logs || []),
          {
            id: Date.now(),
            action: 'Approved',
            performed_by: 'Property Owner',
            remarks: remarks || 'Verified and officially closed',
            timestamp: new Date().toISOString()
          }
        ];
        return {
          ...t,
          status: 'Approved',
          completed_at: new Date().toISOString(),
          audit_logs: newLogs
        };
      }
      return t;
    }));
  };

  // STEP 5 ALTERNATIVE: OWNER VERIFICATION -> Request Redo with Feedback
  const handleRequestRedoTask = (taskId, feedback) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const newLogs = [
          ...(t.audit_logs || []),
          {
            id: Date.now(),
            action: 'Redo Requested',
            performed_by: 'Property Owner',
            remarks: `Redo requested. Feedback: "${feedback}"`,
            timestamp: new Date().toISOString()
          }
        ];
        return {
          ...t,
          status: 'Redo Requested',
          redo_feedback: feedback,
          audit_logs: newLogs
        };
      }
      return t;
    }));
  };

  // Toggle checklist item
  const handleToggleChecklist = (taskId, itemId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        const updatedChecklist = t.checklist.map(item => {
          if (item.id === itemId) {
            return { ...item, is_completed: !item.is_completed };
          }
          return item;
        });
        return { ...t, checklist: updatedChecklist };
      }
      return t;
    }));
  };

  // Add Custom Worker
  const handleAddWorker = (workerData) => {
    const newWorker = {
      id: Date.now(),
      name: workerData.name,
      role: workerData.role,
      phone: workerData.phone,
      avatar_color: workerData.avatar_color
    };
    setWorkers(prev => [...prev, newWorker]);
  };

  // Reset Demo Data
  const handleResetDemoData = () => {
    if (window.confirm('Reset all tasks and staff to the pristine demo estate dataset?')) {
      soundEngine.playAcceptChime();
      setWorkers(DEFAULT_WORKERS);
      setTasks(DEFAULT_TASKS);
      localStorage.setItem(STORAGE_KEY_WORKERS, JSON.stringify(DEFAULT_WORKERS));
      localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(DEFAULT_TASKS));
    }
  };

  const activeWorkerObj = workers.find(w => w.id === currentPersona);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* 1. Persona Switcher Sticky Header */}
      <PersonaSwitcher
        workers={workers}
        currentPersona={currentPersona}
        onSelectPersona={(persona) => {
          soundEngine.playAcknowledgeChime();
          setCurrentPersona(persona);
        }}
        onOpenAddWorker={() => setIsAddWorkerOpen(true)}
      />

      {/* 2. Top Header & Estate Brand */}
      <Header
        onOpenCreateTask={() => setIsCreateTaskOpen(true)}
        onResetDemoData={handleResetDemoData}
        isOwner={currentPersona === 'owner'}
        tasksCount={tasks.length}
        isBackendConnected={isBackendConnected}
      />

      {/* 3. Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 py-6">
        {currentPersona === 'owner' ? (
          /* OWNER / MASTER ADMIN VIEW (Desktop-optimized Kanban & Metrics) */
          <OwnerDashboard
            tasks={tasks}
            workers={workers}
            onInspectTask={(task) => setInspectingTask(task)}
            onOpenCreateTask={() => setIsCreateTaskOpen(true)}
          />
        ) : (
          /* DOMESTIC WORKER VIEW (Single-thumb mobile optimized) */
          activeWorkerObj ? (
            <WorkerMobileView
              worker={activeWorkerObj}
              tasks={tasks}
              onAcknowledgeTask={handleAcknowledgeTask}
              onStartTask={handleStartTask}
              onSubmitTask={handleSubmitTask}
              onToggleChecklist={handleToggleChecklist}
            />
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-400">Worker not found. Switch to Master Admin or another staff member.</p>
            </div>
          )
        )}
      </main>

      {/* 4. Footer System Bar */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-slate-300">StaffPulse</span>
            <span>—</span>
            <span>Estate & Household Task Delegation</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              <span>Storage: LocalStorage + PostgreSQL Engine</span>
            </span>
            <span className="flex items-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>5-Stage Verifiable Workflow</span>
            </span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CreateTaskModal
        workers={workers}
        isOpen={isCreateTaskOpen}
        onClose={() => setIsCreateTaskOpen(false)}
        onCreateTask={handleCreateTask}
      />

      <AddWorkerModal
        isOpen={isAddWorkerOpen}
        onClose={() => setIsAddWorkerOpen(false)}
        onAddWorker={handleAddWorker}
      />

      <TaskDetailModal
        task={inspectingTask}
        worker={workers.find(w => w.id === inspectingTask?.assigned_to_id)}
        isOpen={!!inspectingTask}
        onClose={() => setInspectingTask(null)}
        onApproveTask={handleApproveTask}
        onRequestRedoTask={handleRequestRedoTask}
      />
    </div>
  );
}

