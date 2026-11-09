import React, { useState } from 'react';
import { 
  X, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  RotateCcw, 
  User, 
  AlertCircle, 
  CheckSquare, 
  ShieldCheck, 
  Calendar,
  History,
  Check
} from 'lucide-react';
import { soundEngine } from '../audio';

export default function TaskDetailModal({ 
  task, 
  worker, 
  isOpen, 
  onClose, 
  onApproveTask, 
  onRequestRedoTask 
}) {
  const [isRedoMode, setIsRedoMode] = useState(false);
  const [redoFeedback, setRedoFeedback] = useState('');
  const [approvalRemarks, setApprovalRemarks] = useState('Inspected and verified satisfactory.');

  if (!isOpen || !task) return null;

  const steps = [
    { key: 'Assigned', label: '1. Assigned' },
    { key: 'Acknowledged', label: '2. Acknowledged' },
    { key: 'In Progress', label: '3. In Progress' },
    { key: 'Submitted', label: '4. Submitted' },
    { key: 'Approved', label: '5. Approved & Closed' }
  ];

  // Helper to determine step status
  const getStepIndex = (status) => {
    switch (status) {
      case 'Assigned': return 0;
      case 'Acknowledged': return 1;
      case 'In Progress': return 2;
      case 'Submitted': return 3;
      case 'Redo Requested': return 3;
      case 'Approved': return 4;
      default: return 0;
    }
  };

  const currentStepIdx = getStepIndex(task.status);

  const formatTimer = (seconds) => {
    if (!seconds && seconds !== 0) return '00:00';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}h ${mins}m ${secs}s`;
    }
    return `${mins}m ${secs}s`;
  };

  const handleApprove = () => {
    soundEngine.playCompleteChime();
    onApproveTask(task.id, approvalRemarks);
    onClose();
  };

  const handleRedo = (e) => {
    e.preventDefault();
    if (!redoFeedback.trim()) return;

    soundEngine.playAlertChime();
    onRequestRedoTask(task.id, redoFeedback);
    setIsRedoMode(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6 my-8">
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                {task.category}
              </span>
              <span
                className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                  task.priority === 'Urgent'
                    ? 'bg-red-500/20 text-red-400 border-red-500/40'
                    : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                }`}
              >
                {task.priority} Priority
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              {task.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 5-Step Lifecycle Visual Progress Bar */}
        <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-3">
            Verifiable Duty Lifecycle:
          </span>
          <div className="grid grid-cols-5 gap-1.5">
            {steps.map((step, idx) => {
              const isPast = idx < currentStepIdx;
              const isCurrent = idx === currentStepIdx;
              const isRedo = task.status === 'Redo Requested' && idx === 3;

              return (
                <div key={step.key} className="flex flex-col items-center text-center">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 transition-all ${
                      isPast
                        ? 'bg-emerald-500 text-white'
                        : isCurrent
                        ? isRedo
                          ? 'bg-red-500 text-white ring-2 ring-red-400'
                          : 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                        : 'bg-slate-800 text-slate-500'
                    }`}
                  >
                    {isPast ? <Check className="w-4 h-4 stroke-[3]" /> : idx + 1}
                  </div>
                  <span
                    className={`text-[10px] font-medium leading-tight ${
                      isCurrent ? 'text-amber-300 font-bold' : isPast ? 'text-emerald-400' : 'text-slate-500'
                    }`}
                  >
                    {step.label.split('. ')[1]}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Details Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="text-slate-500 text-[10px] block">Assigned Staff</span>
              <span className="font-semibold text-slate-200">
                {worker ? `${worker.name} (${worker.role.split('/')[0].trim()})` : 'Unassigned'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-500 text-[10px] block">Location</span>
              <span className="font-semibold text-slate-200">{task.room}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400 shrink-0" />
            <div>
              <span className="text-slate-500 text-[10px] block">Time Tracked</span>
              <span className="font-mono font-semibold text-amber-400">
                {formatTimer(task.elapsed_seconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Instructions / Description */}
        {task.description && (
          <div className="text-xs text-slate-300 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
              Delegation Instructions
            </span>
            <p className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/60 leading-relaxed">
              {task.description}
            </p>
          </div>
        )}

        {/* Checklist Progress */}
        {task.checklist && task.checklist.length > 0 && (
          <div className="space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
              <span>Checklist Verification:</span>
              <span className="text-emerald-400 font-mono">
                {task.checklist.filter(i => i.is_completed).length}/{task.checklist.length} Completed
              </span>
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {task.checklist.map(item => (
                <div
                  key={item.id}
                  className={`flex items-center gap-2.5 p-2 rounded-xl text-xs border ${
                    item.is_completed
                      ? 'bg-emerald-950/20 border-emerald-800/30 text-emerald-200'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <CheckCircle2
                    className={`w-4 h-4 shrink-0 ${
                      item.is_completed ? 'text-emerald-400' : 'text-slate-600'
                    }`}
                  />
                  <span className={item.is_completed ? 'line-through opacity-80' : 'font-medium'}>
                    {item.item_text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Worker Completion Remarks */}
        {task.worker_notes && (
          <div className="bg-purple-950/25 border border-purple-500/30 rounded-2xl p-4 space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Worker's Completion Remarks & Restock Log:
            </span>
            <p className="text-xs sm:text-sm text-purple-100 italic bg-purple-950/40 p-3 rounded-xl border border-purple-800/40">
              "{task.worker_notes}"
            </p>
          </div>
        )}

        {/* Redo Mode Form or Actions */}
        {isRedoMode ? (
          <form onSubmit={handleRedo} className="bg-red-950/40 border border-red-500/40 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-red-300 flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-400" />
                Request Redo with Specific Owner Feedback
              </span>
              <button
                type="button"
                onClick={() => setIsRedoMode(false)}
                className="text-xs text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            </div>
            <textarea
              required
              rows={2}
              placeholder="Explain exactly what needs improvement or was missed..."
              value={redoFeedback}
              onChange={(e) => setRedoFeedback(e.target.value)}
              className="w-full bg-slate-950 border border-red-500/40 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-400"
            />
            <button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-500 text-white font-bold text-xs py-2.5 rounded-xl transition-all shadow-md shadow-red-600/30"
            >
              Dispatch Redo Request to Staff Member
            </button>
          </form>
        ) : (
          <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div className="text-[11px] text-slate-500">
              Current Status: <span className="text-slate-200 font-bold">{task.status}</span>
            </div>

            <div className="flex items-center gap-2.5">
              {/* Only show Redo & Approve if Submitted or In Progress */}
              {task.status === 'Submitted' && (
                <>
                  <button
                    type="button"
                    onClick={() => setIsRedoMode(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-red-400 bg-red-950/40 hover:bg-red-900/60 border border-red-800/50 transition-all"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Request Redo</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleApprove}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-md shadow-emerald-600/30 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Close</span>
                  </button>
                </>
              )}

              {task.status === 'Approved' && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified & Officially Closed</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Audit Log Trail */}
        {task.audit_logs && task.audit_logs.length > 0 && (
          <div className="pt-2 border-t border-slate-800/70">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 mb-2">
              <History className="w-3.5 h-3.5" />
              Chronological Audit Trail
            </span>
            <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
              {task.audit_logs.map(log => (
                <div key={log.id} className="text-[11px] text-slate-400 flex items-start justify-between bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/60">
                  <div>
                    <span className="font-semibold text-slate-200">{log.action}</span>
                    <span className="text-slate-500"> by </span>
                    <span className="text-amber-400/90">{log.performed_by}</span>
                    {log.remarks && (
                      <span className="text-slate-400 block text-[10px] mt-0.5">{log.remarks}</span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 shrink-0 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

