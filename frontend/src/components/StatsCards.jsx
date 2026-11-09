import React from 'react';
import { ClipboardList, PlayCircle, Eye, CheckCircle2, AlertTriangle, Users } from 'lucide-react';

export default function StatsCards({ tasks, workers }) {
  const activeDuties = tasks.filter(t => t.status === 'Assigned' || t.status === 'Acknowledged').length;
  const inProgress = tasks.filter(t => t.status === 'In Progress').length;
  const pendingReview = tasks.filter(t => t.status === 'Submitted' || t.status === 'Redo Requested').length;
  const completedToday = tasks.filter(t => t.status === 'Approved').length;

  const cards = [
    {
      title: "Active Duties",
      value: activeDuties,
      label: "Pending Start",
      icon: ClipboardList,
      gradient: "from-blue-500/10 to-indigo-500/5",
      border: "border-blue-500/20",
      textColor: "text-blue-400",
      accentBg: "bg-blue-500/10"
    },
    {
      title: "Tasks In Progress",
      value: inProgress,
      label: "Live Timers Running",
      icon: PlayCircle,
      gradient: "from-amber-500/10 to-orange-500/5",
      border: "border-amber-500/20",
      textColor: "text-amber-400",
      accentBg: "bg-amber-500/10",
      pulse: inProgress > 0
    },
    {
      title: "Pending Verification",
      value: pendingReview,
      label: "Needs Owner Review",
      icon: Eye,
      gradient: "from-purple-500/10 to-pink-500/5",
      border: "border-purple-500/20",
      textColor: "text-purple-400",
      accentBg: "bg-purple-500/10",
      pulse: pendingReview > 0
    },
    {
      title: "Completed Today",
      value: completedToday,
      label: "Verified & Closed",
      icon: CheckCircle2,
      gradient: "from-emerald-500/10 to-teal-500/5",
      border: "border-emerald-500/20",
      textColor: "text-emerald-400",
      accentBg: "bg-emerald-500/10"
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${card.gradient} bg-slate-900/60 border ${card.border} p-4 sm:p-5 backdrop-blur-sm transition-all hover:border-slate-600`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.accentBg} ${card.textColor}`}>
                <Icon className={`w-4 h-4 ${card.pulse ? 'animate-pulse' : ''}`} />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <div className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {card.value}
              </div>
              <span className="text-[11px] font-medium text-slate-400">
                {card.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

