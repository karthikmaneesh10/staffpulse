import React, { useState, useEffect } from 'react';
import { 
  Play, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  CheckSquare, 
  Square, 
  AlertCircle, 
  Send, 
  ChevronRight, 
  Sparkles,
  Inbox,
  Flame,
  Volume2
} from 'lucide-react';
import { soundEngine } from '../audio';

export default function WorkerMobileView({
  worker,
  tasks,
  onAcknowledgeTask,
  onStartTask,
  onSubmitTask,
  onToggleChecklist
}) {
  const [activeTab, setActiveTab] = useState('active'); // 'active' | 'incoming' | 'completed'
  const [submittingTaskId, setSubmittingTaskId] = useState(null);
  const [workerNotes, setWorkerNotes] = useState('');
  const [localTimers, setLocalTimers] = useState({});

  // Worker-specific tasks
  const workerTasks = tasks.filter(t => t.assigned_to_id === worker.id);

  const incomingTasks = workerTasks.filter(t => t.status === 'Assigned');
  const activeTasks = workerTasks.filter(t => t.status === 'Acknowledged' || t.status === 'In Progress' || t.status === 'Redo Requested');
  const completedTasks = workerTasks.filter(t => t.status === 'Submitted' || t.status === 'Approved');

  // Real-time ticking timer for any task with status === 'In Progress'
  useEffect(() => {
    const timerInterval = setInterval(() => {
      setLocalTimers(prev => {
        const next = { ...prev };
        workerTasks.forEach(task => {
          if (task.status === 'In Progress') {
            next[task.id] = (next[task.id] || task.elapsed_seconds || 0) + 1;
          }
        });
        return next;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, [workerTasks]);

  const formatTimer = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
    }
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleStart = (taskId) => {
    soundEngine.playAcceptChime();
    onStartTask(taskId);
  };

  const handleAcknowledge = (taskId) => {
    soundEngine.playAcknowledgeChime();
    onAcknowledgeTask(taskId);
  };

  const handleOpenSubmitModal = (task) => {
    setSubmittingTaskId(task.id);
    setWorkerNotes(task.worker_notes || '');
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!workerNotes.trim()) return;

    soundEngine.playCompleteChime();
    const currentElapsed = localTimers[submittingTaskId] || 0;
    onSubmitTask(submittingTaskId, workerNotes, currentElapsed);
    setSubmittingTaskId(null);
    setWorkerNotes('');
  };

  return (
    <div className="max-w-md mx-auto pb-24 px-3 sm:px-4">
      {/* 1. Worker Greeting Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-5 mb-5 shadow-xl">
        <div className="flex items-center gap-3.5 mb-2">
          <div
            className="w-13 h-13 rounded-2xl flex items-center justify-center text-xl text-white font-extrabold shadow-lg"
            style={{ backgroundColor: worker.avatar_color || '#10b981' }}
          >
            {worker.name[0]}
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Staff Member Active
            </span>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Hello {worker.name}
            </h2>
            <p className="text-xs text-slate-300 font-medium">
              {worker.role}
            </p>
          </div>
        </div>

        {/* Quick status counters */}
        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-700/50 text-center">
          <div className="bg-slate-950/40 rounded-xl py-1.5 px-2">
            <span className="text-[10px] text-slate-400 block font-medium">New</span>
            <span className="text-sm font-extrabold text-amber-400">{incomingTasks.length}</span>
          </div>
          <div className="bg-slate-950/40 rounded-xl py-1.5 px-2">
            <span className="text-[10px] text-slate-400 block font-medium">Active</span>
            <span className="text-sm font-extrabold text-blue-400">{activeTasks.length}</span>
          </div>
          <div className="bg-slate-950/40 rounded-xl py-1.5 px-2">
            <span className="text-[10px] text-slate-400 block font-medium">Done</span>
            <span className="text-sm font-extrabold text-emerald-400">{completedTasks.length}</span>
          </div>
        </div>
      </div>

      {/* 2. Segmented Navigation Tabs (Optimized for single thumb) */}
      <div className="flex bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 mb-5 sticky top-14 z-30 backdrop-blur-md shadow-md">
        <button
          onClick={() => setActiveTab('active')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'active'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Active</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'active' ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
            {activeTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('incoming')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'incoming'
              ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Incoming</span>
          {incomingTasks.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping"></span>
          )}
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'incoming' ? 'bg-white text-blue-900' : 'bg-slate-800 text-slate-400'}`}>
            {incomingTasks.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'completed'
              ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span>Completed</span>
          <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-extrabold ${activeTab === 'completed' ? 'bg-white text-emerald-950' : 'bg-slate-800 text-slate-400'}`}>
            {completedTasks.length}
          </span>
        </button>
      </div>

      {/* 3. Task List Section */}
      <div className="space-y-4">
        {/* ACTIVE TAB */}
        {activeTab === 'active' && (
          activeTasks.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No active tasks right now</h3>
              <p className="text-xs text-slate-500 mt-1">
                Check the "Incoming" tab for new assignments dispatched by the Owner.
              </p>
            </div>
          ) : (
            activeTasks.map(task => {
              const isUrgent = task.priority === 'Urgent';
              const isInProgress = task.status === 'In Progress';
              const isRedo = task.status === 'Redo Requested';
              const secondsElapsed = localTimers[task.id] ?? (task.elapsed_seconds || 0);

              return (
                <div
                  key={task.id}
                  className={`relative rounded-3xl bg-slate-900/90 border ${
                    isUrgent ? 'border-red-500/50 shadow-lg shadow-red-950/20' : isRedo ? 'border-amber-500/50' : 'border-slate-800'
                  } p-5 shadow-md space-y-4`}
                >
                  {/* Redo Warning Alert */}
                  {isRedo && (
                    <div className="bg-red-950/70 border border-red-500/40 rounded-2xl p-3 text-xs text-red-200 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-red-300 block">Owner Requested Redo:</span>
                        <p className="mt-0.5">{task.redo_feedback}</p>
                      </div>
                    </div>
                  )}

                  {/* Header: Area & Priority */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-300 bg-slate-800 px-3 py-1 rounded-full flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-amber-400" />
                      {task.room}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isUrgent
                          ? 'bg-red-500/20 text-red-400 border-red-500/40 animate-pulse'
                          : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                      }`}
                    >
                      {task.priority} Priority
                    </span>
                  </div>

                  {/* Title & Description */}
                  <div>
                    <h3 className="text-base font-bold text-white mb-1.5">
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {task.description}
                      </p>
                    )}
                  </div>

                  {/* Live Timer Display if In Progress */}
                  {isInProgress && (
                    <div className="bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping"></div>
                        <span className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                          Work In Progress
                        </span>
                      </div>
                      <div className="font-mono text-lg font-extrabold text-amber-300 tracking-wider">
                        {formatTimer(secondsElapsed)}
                      </div>
                    </div>
                  )}

                  {/* Interactive Checklist (Single-Thumb Tap to Check) */}
                  {task.checklist && task.checklist.length > 0 && (
                    <div className="bg-slate-950/70 rounded-2xl p-3.5 border border-slate-800/80 space-y-2">
                      <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                        <span>Checklist Steps:</span>
                        <span className="text-emerald-400 font-mono">
                          {task.checklist.filter(c => c.is_completed).length}/{task.checklist.length}
                        </span>
                      </div>
                      {task.checklist.map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            soundEngine.playAcknowledgeChime();
                            onToggleChecklist(task.id, item.id);
                          }}
                          className={`flex items-start gap-3 p-2.5 rounded-xl transition-all cursor-pointer select-none active:scale-98 ${
                            item.is_completed ? 'bg-emerald-950/20 text-slate-400' : 'bg-slate-900/80 hover:bg-slate-850 text-slate-200'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {item.is_completed ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800"></div>
                            )}
                          </div>
                          <span className={`text-xs ${item.is_completed ? 'line-through opacity-70' : 'font-medium'}`}>
                            {item.item_text}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Primary Action Button */}
                  <div className="pt-2">
                    {!isInProgress ? (
                      <button
                        onClick={() => handleStart(task.id)}
                        className="w-full min-h-[50px] bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-98 transition-all"
                      >
                        <Play className="w-4 h-4 fill-slate-950" />
                        <span>Start Task (Begin Timer)</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => handleOpenSubmitModal(task)}
                        className="w-full min-h-[50px] bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 active:scale-98 transition-all"
                      >
                        <Send className="w-4 h-4" />
                        <span>Submit Work Done</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )
        )}

        {/* INCOMING TAB */}
        {activeTab === 'incoming' && (
          incomingTasks.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
              <Inbox className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No new incoming tasks</h3>
              <p className="text-xs text-slate-500 mt-1">
                All duties have been acknowledged and are in your active tab.
              </p>
            </div>
          ) : (
            incomingTasks.map(task => (
              <div
                key={task.id}
                className="rounded-3xl bg-slate-900/90 border border-blue-500/40 p-5 shadow-lg space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/30">
                    New Assignment
                  </span>
                  <span className="text-xs font-mono text-slate-400">
                    {task.room}
                  </span>
                </div>

                <h3 className="text-base font-bold text-white">
                  {task.title}
                </h3>

                {task.description && (
                  <p className="text-xs text-slate-400 line-clamp-3">
                    {task.description}
                  </p>
                )}

                {task.due_time && (
                  <div className="text-xs text-amber-400/90 flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Due: {task.due_time}</span>
                  </div>
                )}

                <button
                  onClick={() => handleAcknowledge(task.id)}
                  className="w-full min-h-[48px] bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/30 active:scale-98 transition-all"
                >
                  <span>Accept & Acknowledge Duty</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ))
          )
        )}

        {/* COMPLETED TAB */}
        {activeTab === 'completed' && (
          completedTasks.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No completed tasks yet</h3>
              <p className="text-xs text-slate-500 mt-1">
                Completed work will appear here once submitted or approved.
              </p>
            </div>
          ) : (
            completedTasks.map(task => {
              const isApproved = task.status === 'Approved';
              return (
                <div
                  key={task.id}
                  className={`rounded-3xl bg-slate-900/80 border ${
                    isApproved ? 'border-emerald-500/30' : 'border-purple-500/30'
                  } p-4 space-y-2.5`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : 'bg-purple-500/10 text-purple-400 border-purple-500/30'
                      }`}
                    >
                      {isApproved ? 'Approved & Closed' : 'Submitted (Under Review)'}
                    </span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {formatTimer(task.elapsed_seconds)}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-200">
                    {task.title}
                  </h4>

                  {task.worker_notes && (
                    <div className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800 text-xs text-slate-300">
                      <span className="text-slate-500 text-[10px] block font-semibold uppercase">Your Remarks:</span>
                      <p className="italic mt-0.5">"{task.worker_notes}"</p>
                    </div>
                  )}
                </div>
              );
            })
          )
        )}
      </div>

      {/* 4. Completion & Remarks Modal (Bottom Sheet style) */}
      {submittingTaskId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                Submit Work Done
              </h3>
              <button
                onClick={() => setSubmittingTaskId(null)}
                className="text-slate-400 hover:text-white text-sm"
              >
                Cancel
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Provide brief remarks for the Property Owner verifying what was accomplished.
            </p>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 uppercase tracking-wider">
                  Completion Remarks / Notes *
                </label>
                <textarea
                  rows={3}
                  required
                  value={workerNotes}
                  onChange={(e) => setWorkerNotes(e.target.value)}
                  placeholder="e.g., Cleaned all windows, guest room restocked, silver polished..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={!workerNotes.trim()}
                className="w-full min-h-[50px] bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 disabled:opacity-50 text-white font-extrabold text-sm rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Confirm & Submit for Review</span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

