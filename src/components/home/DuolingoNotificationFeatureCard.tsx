import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Flame, 
  Smartphone, 
  Lock, 
  Zap, 
  Clock, 
  CheckCircle2, 
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { notificationEngine, DAILY_NOTIFICATION_SCHEDULE } from '../../utils/notificationSystem';

export const DuolingoNotificationFeatureCard: React.FC<{
  onOpenCenter: () => void;
  onNavigate: (tab: any) => void;
}> = ({ onOpenCenter, onNavigate }) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [streak, setStreak] = useState(3);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [tested, setTested] = useState(false);

  useEffect(() => {
    const update = () => {
      setPermission(notificationEngine.getPermission());
      setStreak(notificationEngine.getStreakCount());
    };
    update();
    const unsub = notificationEngine.subscribe(update);
    return () => unsub();
  }, []);

  const handleTestLockScreen = async () => {
    setCountdown(4);
    await notificationEngine.testLockScreenWithCountdown(4, (sec) => {
      setCountdown(sec);
    });
    setCountdown(null);
    setTested(true);
    setTimeout(() => setTested(false), 4500);
  };

  const handleEnable = async () => {
    await notificationEngine.requestPermission();
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-500 via-orange-500 to-emerald-600 p-6 sm:p-8 shadow-2xl text-slate-950">
      <div className="absolute right-0 bottom-0 translate-x-12 translate-y-12 opacity-10 pointer-events-none">
        <Flame className="w-64 h-64 fill-white" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div className="max-w-2xl space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950 text-amber-400 text-xs font-black uppercase tracking-wider shadow-sm">
              <Flame className="w-3.5 h-3.5 fill-amber-400" />
              Duolingo & Phoenix Teacher Alerts
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/30 text-slate-950 text-xs font-black backdrop-blur-md">
              <Lock className="w-3.5 h-3.5" />
              Appears on Lock Screen
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/20 text-slate-950 text-xs font-extrabold">
              10+ Alerts / Munsi
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Ntukibagirwe na rimwe gukora Lesson Plan n'ibitabo byawe!
          </h3>

          <p className="text-sm font-semibold text-slate-900/90 leading-relaxed">
            Elimu360 ifite uburyo bugezweho nka <strong>Duolingo na Phoenix</strong> bwo kohereza ubutumwa bugera ku <strong>10+ ku munsi</strong> bukuburira kuri <strong>Lock Screen ya telefoni cyangwa mudasobwa</strong> mugihe cyose ugomba gutegura isomo, gukoresha Question Bank, no kumanura ibitabo bya REB.
          </p>

          {/* Quick Schedule Preview Chips */}
          <div className="pt-1 flex flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">🌅 06:45 Morning Lesson Plan</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">📚 08:00 REB Textbooks</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">🔥 09:30 Duolingo Streak</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">💡 11:00 Question Bank</span>
            <span className="px-2.5 py-1 rounded-xl bg-slate-950/15 backdrop-blur-sm">📦 19:00 Batch ZIP Books</span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0">
          {permission !== 'granted' ? (
            <button
              onClick={handleEnable}
              className="py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-sm shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-amber-400" />
              <span>Emera Ubutumwa (Enable 10+ Alerts)</span>
            </button>
          ) : (
            <div className="py-2.5 px-4 rounded-2xl bg-slate-950/20 border border-slate-950/30 text-slate-950 font-black text-xs flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-950" />
              <span>Lock Screen Alerts Zirakora (Active)</span>
            </div>
          )}

          <button
            onClick={handleTestLockScreen}
            disabled={countdown !== null}
            className={`py-3 px-5 rounded-2xl font-black text-xs shadow-xl transition flex items-center justify-center gap-2 cursor-pointer ${
              countdown !== null
                ? 'bg-slate-950 text-white animate-pulse'
                : tested
                ? 'bg-emerald-800 text-white'
                : 'bg-white hover:bg-slate-100 text-slate-950'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            {countdown !== null ? (
              <span>Funga telefoni mu {countdown}s urebe!</span>
            ) : tested ? (
              <span>Byoherejwe kuri Lock Screen! ✅</span>
            ) : (
              <span>🧪 Gerageza kuri Lock Screen None</span>
            )}
          </button>

          <button
            onClick={onOpenCenter}
            className="py-2.5 px-4 rounded-2xl bg-slate-950/15 hover:bg-slate-950/25 text-slate-950 font-extrabold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Reba Gahunda y'Umunsi (12 Reminders)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
