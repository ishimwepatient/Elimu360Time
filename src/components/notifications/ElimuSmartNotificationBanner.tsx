import React, { useState, useEffect } from 'react';
import { Bell, Flame, X, Zap, Sparkles } from 'lucide-react';
import { notificationEngine } from '../../utils/notificationSystem';

export const ElimuSmartNotificationBanner: React.FC = () => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [dismissed, setDismissed] = useState(false);
  const [streak, setStreak] = useState(3);
  const [activating, setActivating] = useState(false);

  useEffect(() => {
    const isDismissed = sessionStorage.getItem('elimu_smart_banner_dismissed') === '1';
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
    sessionStorage.setItem('elimu_smart_banner_dismissed', '1');
  };

  return (
    <div className="fixed bottom-4 left-3 right-3 sm:left-auto sm:right-6 sm:w-96 z-40 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 p-4 rounded-3xl shadow-2xl border border-amber-300 animate-fade-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-950 text-amber-400 rounded-2xl shadow-md shrink-0">
            <Bell className="w-5 h-5 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-950">
                Elimu Smart Notification System
              </span>
            </div>
            <h4 className="text-sm font-black leading-tight mt-0.5">
              Ubujyanama bwa Mwarimu kuri Lock Screen
            </h4>
          </div>
        </div>

        <button
          onClick={handleDismiss}
          className="p-1.5 rounded-full bg-slate-950/20 hover:bg-slate-950/40 text-slate-950 transition cursor-pointer shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      <p className="text-xs font-semibold text-slate-950/90 mt-2 leading-relaxed">
        Akira ubutumwa bw'ubwenge bugufasha gutegura Lesson Plans z'uyu munsi, kubona ibitabo bishya bya REB, no gukoresha Question Bank no kuri <strong>Lock Screen ya telefoni yawe</strong>.
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={handleEnable}
          disabled={activating}
          className="flex-1 py-2.5 px-3 bg-slate-950 hover:bg-slate-900 text-amber-400 font-black text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Zap className="w-3.5 h-3.5 fill-amber-400" />
          <span>{activating ? 'Gufungura...' : 'Emera Ubutumwa (Smart Assistant)'}</span>
        </button>

        <button
          onClick={handleDismiss}
          className="py-2.5 px-3 bg-slate-950/15 hover:bg-slate-950/25 text-slate-950 font-bold text-xs rounded-xl transition cursor-pointer"
        >
          Nyuma
        </button>
      </div>
    </div>
  );
};
