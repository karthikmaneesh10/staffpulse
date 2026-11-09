import React, { useState } from 'react';
import StatsCards from './StatsCards';
import { 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  CheckSquare, 
  AlertCircle, 
  CheckCircle2, 
  RotateCcw, 
  User, 
  ArrowRight,
  Eye,
  Plus
} from 'lucide-react';

export default function OwnerDashboard({ 
  tasks, 
  workers, 
  onInspectTask, 
  onOpenCreateTask,
  onQuickApprove,
  onQuickRedo
}) {
  const [selectedWorkerId, setSelectedWorkerId] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedRoom, setSelectedRoom] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Extract unique rooms for the room filter
  const uniqueRooms = Array.from(new Set(tasks.map(t => t.room).filter(Boolean)));

  // Filter tasks based on the active filters
  const filteredTasks = tasks.filter(task => {
    // Worker filter
    if (selectedWorkerId !== 'ALL' && task.assigned_to_id !== Number(selectedWorkerId)) {
      return false;
    }
    // Priority filter
    if (selectedPriority !== 'ALL' && task.priority !== selectedPriority) {
      return false;
    }
    // Room filter
    if (selectedRoom !== 'ALL' && task.room !== selectedRoom) {
      return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const titleMatch = task.title?.toLowerCase().includes(q);
      const descMatch = task.description?.toLowerCase().includes(q);
      const roomMatch = task.room?.toLowerCase().includes(q);
      const categoryMatch = task.category?.toLowerCase().includes(q);
      const worker = workers.find(w => w.id === task.assigned_to_id);
      const workerMatch = worker?.name.toLowerCase().includes(q);
      if (!titleMatch && !descMatch && !roomMatch && !categoryMatch && !workerMatch) {
        return false;
      }
    }
    return true;
  });

  // Kanban Columns
  const columns = [
    {
      id: 'assigned',
      title: 'Assigned',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      description: 'Dispatched to domestic staff',
      tasks: filteredTasks.filter(t => t.status === 'Assigned' || t.status === 'Acknowledged')
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      description: 'Staff actively working & timers running',
      tasks: filteredTasks.filter(t => t.status === 'In Progress')
    },
    {
      id: 'needs_review',
      title: 'Needs Review',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      description: 'Work submitted for Owner verification',
      tasks: filteredTasks.filter(t => t.status === 'Submitted' || t.status === 'Redo Requested')
    },
    {
      id: 'completed',
      title: 'Completed',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      description: 'Inspected and verified closed',
      tasks: filteredTasks.filter(t => t.status === 'Approved')
    }
  ];

  const formatTimer = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    const hrs = Math.floor(mins / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins % 60}m`;
    }
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="space-y-6">
      {/* Real-time Stat Cards */}
      <StatsCards tasks={tasks} workers={workers} />

      {/* Filter and Search Bar Toolbar */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 backdrop-blur-md space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Real-time Search Input */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, room, staff name, or instructions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400/50 transition-all"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>

          {/* New Assignment Quick Button */}
          <button
            onClick={onOpenCreateTask}
            className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Assignment</span>
          </button>
        </div>

        {/* Filter Dropdowns Row */}
        <div className="flex flex-wrap items-center gap-2.5 pt-2 border-t border-slate-800/60 text-xs">
          <div className="flex items-center gap-1.5 text-slate-400 font-medium">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter By:</span>
          </div>

          {/* Worker Filter */}
          <select
            value={selectedWorkerId}
            onChange={(e) => setSelectedWorkerId(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-400/40"
          >
            <option value="ALL">All Domestic Staff</option>
            {workers.map(w => (
              <option key={w.id} value={w.id}>
                {w.name} ({w.role.split('/')[0].trim()})
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-400/40"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent Only</option>
            <option value="Normal">Normal</option>
            <option value="Low">Low</option>
          </select>

          {/* Room Filter */}
          <select
            value={selectedRoom}
            onChange={(e) => setSelectedRoom(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-300 focus:outline-none focus:border-amber-400/40"
          >
            <option value="ALL">All Rooms / Grounds</option>
            {uniqueRooms.map(r => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>

          {/* Reset Filters */}
          {(selectedWorkerId !== 'ALL' || selectedPriority !== 'ALL' || selectedRoom !== 'ALL' || searchQuery) && (
            <button
              onClick={() => {
                setSelectedWorkerId('ALL');
                setSelectedPriority('ALL');
                setSelectedRoom('ALL');
                setSearchQuery('');
              }}
              className="ml-auto text-amber-400 hover:text-amber-300 underline font-medium cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Kanban Board Columns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {columns.map((col) => {
          return (
            <div
              key={col.id}
              className="flex flex-col bg-slate-900/50 border border-slate-800/80 rounded-2xl p-3.5 sm:p-4 min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800/80">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-sm tracking-wide text-slate-200 uppercase">
                    {col.title}
                  </h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-bold border ${col.badgeColor}`}>
                    {col.tasks.length}
                  </span>
                </div>
              </div>

              {/* Column Task Cards */}
              <div className="flex-1 space-y-3 overflow-y-auto max-h-[calc(100vh-320px)] pr-1">
                {col.tasks.length === 0 ? (
                  <div className="h-44 border-2 border-dashed border-slate-800/70 rounded-xl flex flex-col items-center justify-center text-center p-4">
                    <p className="text-xs text-slate-500 font-medium">No tasks in this stage</p>
                    <span className="text-[11px] text-slate-600 mt-1">{col.description}</span>
                  </div>
                ) : (
                  col.tasks.map((task) => {
                    const assignedWorker = workers.find(w => w.id === task.assigned_to_id);
                    const completedChecklistCount = task.checklist ? task.checklist.filter(i => i.is_completed).length : 0;
                    const totalChecklistCount = task.checklist ? task.checklist.length : 0;
                    const isUrgent = task.priority === 'Urgent';

                    return (
                      <div
                        key={task.id}
                        onClick={() => onInspectTask(task)}
                        className={`group relative rounded-xl p-3.5 transition-all cursor-pointer bg-slate-800/60 hover:bg-slate-800 border ${
                          isUrgent ? 'border-red-500/40 hover:border-red-500/70' : 'border-slate-700/60 hover:border-slate-600'
                        } shadow-sm hover:shadow-lg`}
                      >
                        {/* Redo Requested Alert Pill */}
                        {task.status === 'Redo Requested' && (
                          <div className="mb-2 bg-red-950/60 border border-red-500/30 rounded-lg p-2 text-[11px] text-red-300 flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 text-red-400 shrink-0 mt-0.5" />
                            <span>Redo Requested: {task.redo_feedback}</span>
                          </div>
                        )}

                        {/* Top Badges: Category & Priority */}
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[11px] font-semibold text-slate-400 bg-slate-900/70 px-2 py-0.5 rounded border border-slate-800">
                            {task.category}
                          </span>
                          <span
                            className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full border ${
                              isUrgent
                                ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                                : task.priority === 'Normal'
                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                : 'bg-slate-700/40 text-slate-300 border-slate-600'
                            }`}
                          >
                            {task.priority}
                          </span>
                        </div>

                        {/* Task Title */}
                        <h4 className="text-sm font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 mb-1.5">
                          {task.title}
                        </h4>

                        {/* Room Location & Due Time */}
                        <div className="space-y-1 mb-3 text-xs text-slate-400">
                          <div className="flex items-center gap-1 text-[11px]">
                            <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
                            <span className="truncate">{task.room}</span>
                          </div>
                          {task.due_time && (
                            <div className="flex items-center gap-1 text-[11px] text-amber-400/90 font-mono">
                              <Clock className="w-3 h-3 shrink-0" />
                              <span>Due: {task.due_time}</span>
                            </div>
                          )}
                        </div>

                        {/* Checklist progress bar */}
                        {totalChecklistCount > 0 && (
                          <div className="mb-3 bg-slate-900/80 rounded-lg p-2 border border-slate-800/80">
                            <div className="flex items-center justify-between text-[11px] mb-1 text-slate-400">
                              <span className="flex items-center gap-1 font-medium">
                                <CheckSquare className="w-3 h-3 text-emerald-400" />
                                Checklist
                              </span>
                              <span className="font-mono text-slate-300 font-bold">
                                {completedChecklistCount}/{totalChecklistCount}
                              </span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-500 transition-all duration-300"
                                style={{
                                  width: `${(completedChecklistCount / totalChecklistCount) * 100}%`
                                }}
                              />
                            </div>
                          </div>
                        )}

                        {/* Worker remarks snippet in Needs Review column */}
                        {task.status === 'Submitted' && task.worker_notes && (
                          <div className="mb-3 p-2 rounded-lg bg-purple-950/30 border border-purple-800/40 text-[11px] text-purple-200">
                            <span className="font-semibold block text-purple-300">Staff Remarks:</span>
                            <p className="italic line-clamp-2">"{task.worker_notes}"</p>
                          </div>
                        )}

                        {/* Footer: Assignee & Action */}
                        <div className="flex items-center justify-between pt-2 border-t border-slate-700/40 text-xs">
                          {/* Worker Avatar & Name */}
                          <div className="flex items-center gap-1.5">
                            {assignedWorker ? (
                              <>
                                <div
                                  className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                                  style={{ backgroundColor: assignedWorker.avatar_color || '#10b981' }}
                                >
                                  {assignedWorker.name[0]}
                                </div>
                                <span className="text-slate-300 font-medium text-[11px]">
                                  {assignedWorker.name}
                                </span>
                              </>
                            ) : (
                              <span className="text-slate-500 italic text-[11px]">Unassigned</span>
                            )}
                          </div>

                          {/* Live Timer or Action indicator */}
                          {task.status === 'In Progress' ? (
                            <div className="flex items-center gap-1 font-mono text-[11px] font-semibold text-amber-400 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                              <span>{formatTimer(task.elapsed_seconds)}</span>
                            </div>
                          ) : task.status === 'Submitted' ? (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-purple-400 hover:text-purple-300">
                              <Eye className="w-3.5 h-3.5" />
                              <span>Verify</span>
                            </span>
                          ) : (
                            <span className="text-[11px] text-slate-500 group-hover:text-slate-300 flex items-center gap-0.5">
                              <span>Inspect</span>
                              <ArrowRight className="w-3 h-3" />
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

