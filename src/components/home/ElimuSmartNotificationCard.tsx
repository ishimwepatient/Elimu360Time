import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Flame, 
  Lock, 
  Zap, 
  Clock, 
  CheckCircle2, 
  Sparkles,
  UserCheck
} from 'lucide-react';
import { notificationEngine } from '../../utils/notificationSystem';

export const ElimuSmartNotificationCard: React.FC<{
  onOpenCenter: () => void;
  onNavigate: (tab: any) => void;
  onOpenSettings?: () => void;
}> = ({ onOpenCenter, onNavigate, onOpenSettings }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [streak, setStreak] = useState(3);
  const [context, setContext] = useState(() => notificationEngine.getTeacherContext());

  useEffect(() => {
    const update = () => {
      setPermission(notificationEngine.getPermission());
      setStreak(notificationEngine.getStreakCount());
      setContext(notificationEngine.getTeacherContext());
    };
    update();
    const unsub = notificationEngine.subscribe(update);
    return () => unsub();
  }, []);

  const handleEnable = async () => {
    await notificationEngine.requestPermission();
  };

  const displayName = context.teacherName 
    ? (context.teacherName.toLowerCase().startsWith('mwarimu') ? context.teacherName : `Mwarimu ${context.teacherName}`)
    : "Mwarimu w'Umwuga";

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 p-5 sm:p-8 shadow-2xl text-slate-950">
      <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
        <Sparkles className="w-64 h-64 fill-white" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider shadow-sm">
              <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
              Elimu Smart Notification System
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/30 text-slate-950 text-xs font-black backdrop-blur-md">
              <Lock className="w-3.5 h-3.5" />
              Lock Screen Assistant
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 text-xs font-extrabold">
              10+ Smart Milestones / Munsi
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Ubujyanama bw'Ubwenge bwa Mwarimu: Ntukongere Guhangayikira Amasomo!
          </h3>

          <p className="text-xs sm:text-sm font-semibold text-slate-900/90 leading-relaxed">
            Elimu Smart Notification System ni umufasha wihariye wa <strong>{displayName}</strong> ukuburira hakiri kare ku bihe by'amasomo, gutegura Lesson Plans z'umunsi, kumanura ibitabo bishya bya REB, no gukoresha Question Bank no kuri <strong>Lock Screen ya telefoni cyangwa mudasobwa yawe</strong>.
          </p>

          {/* Smart Capabilities Chips (No scheduled hours exposed) */}
          <div className="pt-1 flex flex-wrap gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">✨ Ubujyanama Butunguranye</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">📂 Intelligent File Watcher (Auto-Convert)</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">⏰ Ibyibutsa Byihariye (Custom Reminders)</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">📱 Lock Screen Push Alerts</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 sm:gap-3 shrink-0">
          {permission !== 'granted' ? (
            <button
              onClick={handleEnable}
              className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs sm:text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>Emera Ubutumwa (Enable Smart Assistant)</span>
            </button>
          ) : (
            <div className="py-2.5 px-4 rounded-2xl bg-slate-950/20 border border-slate-950/30 text-slate-950 font-black text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              <span>Ubujyanama bwa Lock Screen Burakora</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCenter}
              className="flex-1 py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
            >
              <Bell className="w-3.5 h-3.5" />
              <span>Ubutumwa Bwakiriwe (Inbox)</span>
            </button>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="py-2.5 px-3 rounded-2xl bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                title="Igenamiterere (Settings)"
              >
                <span>⚙️ Settings</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
