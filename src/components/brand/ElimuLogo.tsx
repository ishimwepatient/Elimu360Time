import React from 'react';
import { Sparkles, BookOpen } from 'lucide-react';

export const ElimuLogo: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-3xl'
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-amber-500 via-emerald-500 to-cyan-500 blur-sm opacity-70 animate-pulse"></div>
        <div className={`relative ${iconSizes[size]} rounded-2xl bg-slate-900 border border-slate-700/80 flex items-center justify-center text-amber-400 shadow-xl`}>
          <BookOpen className="w-1/2 h-1/2" />
        </div>
      </div>
      <div>
        <div className={`font-extrabold tracking-tight font-display ${textSizes[size]} flex items-center gap-1.5 text-white`}>
          <span>Elimu<span className="text-amber-400">360</span></span>
          <span className="bg-amber-500/20 text-amber-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-500/30 uppercase tracking-widest flex items-center gap-1">
            <Sparkles className="w-2.5 h-2.5" /> OPEN
          </span>
        </div>
        <p className="text-[10px] text-slate-400 font-medium tracking-wide">
          Sovereign AI Lesson Plan Generator
        </p>
      </div>
    </div>
  );
};
