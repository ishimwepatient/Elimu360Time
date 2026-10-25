import React, { useState, useEffect } from 'react';
import { Bell, Flame, X, Zap, Smartphone, CheckCircle } from 'lucide-react';
import { notificationEngine } from '../../utils/notificationSystem';

export const DuolingoNotificationPromptBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);
  const [streak, setStreak] = useState(3);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('elimu_notif_banner_dismissed') === '1';
    if (isDismissed) setDismissed(true);

    const update = () => {
      setPermission(notificationEngine.getPermission());
      setStreak(notificationEngine.getStreakCount());
    };

    update();
    const unsubscribe = notificationEngine.subscribe(update);
    return () => unsubscribe();
  }, []);

  if (permission === 'granted' || dismissed) {
    return null;
  }

  const handleEnable = async () => {
    setActivating(true);
    await notificationEngine.requestPermission();
    setActivating(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem('elimu_notif_banner_dismissed', '1');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-4 rounded-3xl shadow-2xl border border-amber-300 animate-bounce-subtle">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-slate-950 text-amber-400 rounded-xl shadow-md">
            <Flame className="w-5 h-5 fill-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950">
                Duolingo / Phoenix Alerts
              </span>
              <span className="bg-slate-950 text-amber-300 text-[9px] font-black px-1.5 py-0.2 rounded-full">
                {streak}d Streak
              </span>
            </div>
            <h4 className="text-sm font-black leading-tight mt-0.5">
              Ntukibagirwe Lesson Plans zawe!
            </h4>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs font-medium text-slate-950/90 mt-2 leading-relaxed">
        Akira ubutumwa bugera ku <strong>10+ ku munsi</strong> bukuburira kuri <strong>Lock Screen</strong> gutegura amasomo, gukoresha Question Bank, no kumanura ibitabo bya REB ku buntu!
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleEnable}
          disabled={activating}
          className="flex-1 py-2 px-3 bg-slate-950 hover:bg-slate-900 text-amber-400 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>{activating ? 'Gufungura...' : 'Emera Ubutumwa (10+/Day)'}</span>
        </button>

        <button
          onClick={handleDismiss}
          className="py-2 px-3 bg-slate-950/15 hover:bg-slate-950/25 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Nyuma
        </button>
      </div>
    </div>
  );
};
