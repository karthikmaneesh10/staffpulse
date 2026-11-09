import React, { useState } from 'react';
import { X, Plus, Trash2, CheckSquare, Clock, MapPin, User, AlertCircle, Sparkles } from 'lucide-react';
import { soundEngine } from '../audio';

export default function CreateTaskModal({ workers, isOpen, onClose, onCreateTask }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Housekeeping');
  const [room, setRoom] = useState('Master Suite (2nd Floor)');
  const [priority, setPriority] = useState('Normal');
  const [dueTime, setDueTime] = useState('18:00 Today');
  const [assignedToId, setAssignedToId] = useState(workers[0]?.id || '');
  const [checklistItems, setChecklistItems] = useState(['']);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    setChecklistItems([...checklistItems, '']);
  };

  const handleUpdateChecklistItem = (index, value) => {
    const updated = [...checklistItems];
    updated[index] = value;
    setChecklistItems(updated);
  };

  const handleRemoveChecklistItem = (index) => {
    setChecklistItems(checklistItems.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Validation
    if (!title.trim()) {
      setErrorMessage('Please enter a task title');
      return;
    }
    if (!assignedToId) {
      setErrorMessage('Please select a designated domestic staff member');
      return;
    }

    const filteredChecklist = checklistItems
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      category,
      room,
      priority,
      due_time: dueTime.trim() || 'Today',
      assigned_to_id: Number(assignedToId),
      checklist: filteredChecklist
    };

    soundEngine.playAcceptChime();
    onCreateTask(newTask);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-7 shadow-2xl space-y-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                New Duty Assignment
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Delegate responsibilities with precision instructions and tracking
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Validation Alert */}
        {errorMessage && (
          <div className="bg-red-950/60 border border-red-500/40 rounded-xl p-3 text-xs text-red-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Deep Clean Master Suite & Balcony Glass"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
              Description / Special Instructions
            </label>
            <textarea
              rows={2}
              placeholder="Provide specific guidelines, safety cautions, or material care rules..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-400 transition-all"
            />
          </div>

          {/* Row: Assigned Staff & Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Assign Staff Member *
              </label>
              <select
                required
                value={assignedToId}
                onChange={(e) => setAssignedToId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="">Select Domestic Staff...</option>
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.name} — {w.role}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Urgency Level
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Urgent">🚨 Urgent (Immediate Attention)</option>
                <option value="Normal">⚡ Normal (Today)</option>
                <option value="Low">🌿 Low (Routine / Flexible)</option>
              </select>
            </div>
          </div>

          {/* Row: Room Location & Due Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                Room / Estate Area
              </label>
              <select
                value={room}
                onChange={(e) => setRoom(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
              >
                <option value="Master Suite (2nd Floor)">Master Suite (2nd Floor)</option>
                <option value="Main Kitchen & Pantry">Main Kitchen & Pantry</option>
                <option value="Formal Dining Room">Formal Dining Room</option>
                <option value="Living Pavilion">Living Pavilion</option>
                <option value="North Gate & Garage">North Gate & Garage</option>
                <option value="Formal Garden & Grounds">Formal Garden & Grounds</option>
                <option value="South Courtyard & Pool">South Courtyard & Pool</option>
                <option value="Guest Villa #1">Guest Villa #1</option>
                <option value="Wine Cellar">Wine Cellar</option>
                <option value="Security Post & Perimeter">Security Post & Perimeter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Target Due Time
              </label>
              <input
                type="text"
                placeholder="e.g., 14:00 Today, 18:30 Tonight"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-white focus:outline-none focus:border-emerald-400"
              />
            </div>
          </div>

          {/* Bullet Checklist Builder */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                Checklist Steps (Actionable Bullets)
              </label>
              <button
                type="button"
                onClick={handleAddChecklistItem}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Step</span>
              </button>
            </div>

            <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
              {checklistItems.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-500 w-4 text-right">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    placeholder={`e.g., Step ${idx + 1} requirement...`}
                    value={item}
                    onChange={(e) => handleUpdateChecklistItem(idx, e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-400"
                  />
                  {checklistItems.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveChecklistItem(idx)}
                      className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Submit Action */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-bold px-5 py-2.5 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-700/20 transition-all"
            >
              Dispatch Assignment
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

