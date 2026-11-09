import React from 'react';
import { Crown, User, Plus, ShieldCheck } from 'lucide-react';

export default function PersonaSwitcher({ workers, currentPersona, onSelectPersona, onOpenAddWorker }) {
  return (
    <div className="w-full bg-slate-900/90 border-b border-slate-800/80 sticky top-0 z-40 backdrop-blur-md px-3 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        {/* Left: Persona Switcher Label */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-xs font-semibold tracking-wider text-slate-400 uppercase">
            Active Persona:
          </span>
          <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {currentPersona === 'owner' ? 'Master Admin' : 'Worker Mobile View'}
          </span>
        </div>

        {/* Personas Carousel / Button List */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 no-scrollbar">
          {/* Owner / Master Admin */}
          <button
            onClick={() => onSelectPersona('owner')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 ${
              currentPersona === 'owner'
                ? 'bg-gradient-to-r from-amber-600 to-amber-500 text-white shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30'
                : 'bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700/60'
            }`}
          >
            <Crown className="w-3.5 h-3.5 text-amber-200" />
            <span>Owner / Master Admin</span>
          </button>

          <div className="h-4 w-[1px] bg-slate-700/60 mx-1 shrink-0"></div>

          {/* Domestic Staff Members */}
          {workers.map((worker) => {
            const isSelected = currentPersona === worker.id;
            return (
              <button
                key={worker.id}
                onClick={() => onSelectPersona(worker.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all shrink-0 ${
                  isSelected
                    ? 'bg-slate-100 text-slate-950 font-bold shadow-md shadow-white/10 ring-2 ring-emerald-400'
                    : 'bg-slate-800/70 hover:bg-slate-700/70 text-slate-300 border border-slate-700/50'
                }`}
              >
                <div
                  className="w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold"
                  style={{ backgroundColor: worker.avatar_color || '#10b981' }}
                >
                  {worker.name[0]}
                </div>
                <span>{worker.name}</span>
                <span className="text-[10px] opacity-75 hidden sm:inline">
                  ({worker.role.split('/')[0].trim()})
                </span>
              </button>
            );
          })}

          {/* Add Custom Worker Button */}
          <button
            onClick={onOpenAddWorker}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium text-emerald-400 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-800/50 transition-all shrink-0"
            title="Add Custom Domestic Staff Member"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add Staff</span>
          </button>
        </div>
      </div>
    </div>
  );
}

