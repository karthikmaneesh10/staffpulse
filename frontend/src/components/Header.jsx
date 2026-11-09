import React, { useState, useEffect } from 'react';
import { Plus, RotateCcw, Building2, Clock, CheckCircle2, Database } from 'lucide-react';

export default function Header({ 
  onOpenCreateTask, 
  onResetDemoData, 
  isOwner, 
  tasksCount,
  isBackendConnected 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-lg px-4 sm:px-8 py-5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Estate Title & Branding */}
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 via-slate-800 to-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg shadow-amber-950/30">
            <Building2 className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2 font-serif">
                StaffPulse
              </h1>
              <span className="text-[11px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Estate Edition
              </span>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
              <span>Aura Crest Residences & Grounds</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">Master Operations Hub</span>
            </p>
          </div>
        </div>

        {/* Right: Real-time Clock & Header Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
          {/* Live Date/Time Badge */}
          <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>{formattedDate}</span>
            <span className="text-slate-600">|</span>
            <span className="font-mono text-emerald-400 font-semibold">{formattedTime}</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={onResetDemoData}
            title="Reset Tasks & Staff to Clean Demo State"
            className="flex items-center gap-1.5 bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* New Assignment Button (always prominent for Owner) */}
          {isOwner && (
            <button
              onClick={onOpenCreateTask}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-semibold px-4 py-2 rounded-xl text-xs sm:text-sm shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>+ New Assignment</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

