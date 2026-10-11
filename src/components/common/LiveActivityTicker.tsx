import React, { useState, useEffect } from 'react';
import { Flame, Sparkles, CheckCircle2, Users, FileText, RefreshCw } from 'lucide-react';

const RECENT_ACTIVITIES = [
  { teacher: 'Teacher Emmanuel (Kigali)', action: 'generated 5 P6 English CBC Lesson Plans', time: '1m ago', type: 'plan' },
  { teacher: 'Teacher Divine (Huye)', action: 'converted Biology notes from PDF to Word (.docx)', time: '3m ago', type: 'doc' },
  { teacher: 'Teacher Jean-Paul (Musanze)', action: 'exported Unit 4 Mathematics directly to folder', time: '5m ago', type: 'plan' },
  { teacher: 'Teacher Claudine (Rubavu)', action: 'saved 8 Chemistry lesson plans to offline archive', time: '7m ago', type: 'plan' },
  { teacher: 'Teacher Innocent (Nyagatare)', action: 'connected to 24/7 Teacher WhatsApp Support', time: '9m ago', type: 'help' }
];

export const LiveActivityTicker: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % RECENT_ACTIVITIES.length);
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const active = RECENT_ACTIVITIES[currentIndex];

  return (
    <div className="w-full bg-slate-900/90 border-y border-slate-800/80 px-4 py-2 text-xs flex items-center justify-between overflow-hidden">
      <div className="flex items-center gap-2 max-w-full truncate">
        {/* Chinese-app style pulsing HOT indicator */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 font-black text-[10px] uppercase shrink-0">
          <Flame className="w-3 h-3 fill-red-400 animate-pulse" />
          <span>Live Activity</span>
        </div>

        <div className="flex items-center gap-2 truncate text-slate-300">
          <span className="font-bold text-white shrink-0">{active.teacher}:</span>
          <span className="truncate text-slate-400">{active.action}</span>
          <span className="text-[10px] text-slate-500 shrink-0">({active.time})</span>
        </div>
      </div>

      <div className="hidden md:flex items-center gap-3 shrink-0 text-[11px] text-slate-400 font-semibold pl-4">
        <span className="flex items-center gap-1 text-emerald-400">
          <Users className="w-3 h-3" />
          <span>1,540+ Teachers Active Today</span>
        </span>
        <span className="text-slate-600">•</span>
        <span className="text-amber-400">
          100% Free Sovereign CBC
        </span>
      </div>
    </div>
  );
};
