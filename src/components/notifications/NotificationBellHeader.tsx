import React, { useState, useEffect } from 'react';
import { Bell, Flame } from 'lucide-react';
import { notificationEngine } from '../../utils/notificationSystem';

interface NotificationBellHeaderProps {
  onOpenCenter: () => void;
}

export const NotificationBellHeader: React.FC<NotificationBellHeaderProps> = ({ onOpenCenter }) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const [streak, setStreak] = useState(3);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    const update = () => {
      setUnreadCount(notificationEngine.getUnreadCount());
      setStreak(notificationEngine.getStreakCount());
      setPermission(notificationEngine.getPermission());
    };

    update();
    const unsubscribe = notificationEngine.subscribe(update);
    return () => unsubscribe();
  }, []);

  return (
    <div className="flex items-center gap-1.5">
      {/* Teacher Dedication Streak Badge */}
      <button
        onClick={onOpenCenter}
        title={`Ubwitange bwa Mwarimu (Teacher Streak): Iminsi ${streak} ikurikirana! Kanda urebe ubutumwa bwawe bwa Elimu Smart Assistant.`}
        className="px-2.5 py-1.5 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/20 hover:from-orange-500/20 hover:to-amber-500/30 border border-orange-500/30 text-orange-600 dark:text-orange-400 font-extrabold text-xs flex items-center gap-1 transition cursor-pointer shadow-xs"
      >
        <Flame className="w-4 h-4 fill-orange-500 text-orange-600 animate-pulse" />
        <span className="font-mono">{streak}d</span>
      </button>

      {/* Bell Notification Button */}
      <button
        onClick={onOpenCenter}
        title="Ubutumwa bwa buri munsi (10+ daily alerts & Lock Screen)"
        className="relative p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-500 text-slate-700 dark:text-slate-200 hover:text-amber-500 transition cursor-pointer shadow-xs"
      >
        <Bell className="w-4 h-4" />

        {/* Dynamic Badge counter (shows 10+ scheduled or unread) */}
        <span className="absolute -top-1 -right-1 px-1.5 py-0.5 rounded-full bg-red-600 text-[10px] font-black text-white shadow-sm flex items-center justify-center leading-none">
          {unreadCount > 0 ? unreadCount : '10+'}
        </span>

        {/* Pulsing indicator if permissions not granted yet */}
        {permission !== 'granted' && (
          <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-amber-500 animate-ping" />
        )}
      </button>
    </div>
  );
};
