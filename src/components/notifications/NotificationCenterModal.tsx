import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Flame, 
  X, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Lock, 
  Settings, 
  BookOpen, 
  HelpCircle, 
  FileText,
  AlertTriangle,
  UserCheck,
  ChevronRight,
  Plus,
  Trash2
} from 'lucide-react';
import { 
  notificationEngine, 
  NotificationLogItem, 
  TeacherContext,
  TeacherCustomReminder 
} from '../../utils/notificationSystem';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
  onOpenSettings: () => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab,
  onOpenSettings
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [streak, setStreak] = useState(3);
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [customReminders, setCustomReminders] = useState<TeacherCustomReminder[]>([]);
  const [context, setContext] = useState<TeacherContext>(() => notificationEngine.getTeacherContext());

  useEffect(() => {
    const update = () => {
      setPermission(notificationEngine.getPermission());
      setStreak(notificationEngine.getStreakCount());
      setLogs(notificationEngine.getNotificationLogs());
      setCustomReminders(notificationEngine.getCustomReminders());
      setContext(notificationEngine.getTeacherContext());
    };

    update();
    const unsubscribe = notificationEngine.subscribe(update);
    return () => unsubscribe();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRequestPermission = async () => {
    const res = await notificationEngine.requestPermission();
    setPermission(res);
  };

  const handleOpenItem = (tab: any) => {
    onNavigateTab(tab);
    onClose();
  };

  const displayName = context.teacherName 
    ? (context.teacherName.toLowerCase().startsWith('mwarimu') ? context.teacherName : `Mwarimu ${context.teacherName}`)
    : "Mwarimu w'Umwuga";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Elimu Smart Notification System */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-4 sm:p-6 text-slate-950 relative overflow-hidden shrink-0">
          <div className="absolute -right-6 -bottom-8 opacity-10 pointer-events-none">
            <Flame className="w-40 h-40 fill-white" />
          </div>

          <div className="flex items-start justify-between relative z-10 gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2 sm:p-2.5 bg-slate-950 text-amber-400 rounded-2xl shadow-md shrink-0">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                  <h2 className="text-lg sm:text-xl font-black tracking-tight text-slate-950">
                    Elimu Smart Notification System
                  </h2>
                </div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] sm:text-xs font-bold text-slate-900/90 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    {displayName} {context.schoolName ? `• ${context.schoolName}` : ''}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="p-2 rounded-full bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition cursor-pointer"
                title="Igenamiterere (Settings)"
              >
                <Settings className="w-4 h-4" />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Teacher Dedication & Stats Bar */}
          <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 bg-slate-950/15 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 text-center text-xs font-bold text-slate-950">
            <div>
              <div className="text-sm sm:text-base font-black flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-500" />
                {streak} Iminsi
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase font-extrabold opacity-85">Ubwitange bwa Mwarimu</div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-950" />
                Ubwenge
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase font-extrabold opacity-85">Smart Assistant</div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black flex items-center justify-center gap-1">
                <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-950" />
                {permission === 'granted' ? 'Burakora' : 'Itegerejwe'}
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase font-extrabold opacity-85">Lock Screen</div>
            </div>
          </div>
        </div>

        {/* Permission Call-To-Action if not granted */}
        {permission !== 'granted' ? (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 p-3 sm:p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Ubutumwa bwa Lock Screen ntiburakora:</span> Kanda "Kwemerera" ngo ubone ubujyanama kuri Lock Screen ya telefoni cyangwa mudasobwa.
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Bell className="w-3.5 h-3.5 fill-slate-950" />
              <span>Emera Ubutumwa</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/50 px-4 py-2.5 shrink-0 flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Ubujyanama bwa Elimu Smart Assistant burakora kuri Lock Screen</span>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenSettings();
              }}
              className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 underline hover:opacity-80 cursor-pointer"
            >
              Hindura Igenamiterere
            </button>
          </div>
        )}

        {/* Content Body: Recent Received Smart Messages + Custom Reminders */}
        <div className="p-3 sm:p-5 overflow-y-auto space-y-4 flex-1 text-slate-800 dark:text-slate-200">
          
          {/* Quick Custom Reminders Preview */}
          <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Ibyibutsa Byihariye bya Mwarimu ({customReminders.length})
              </span>
              <button
                onClick={() => {
                  onClose();
                  onOpenSettings();
                }}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                <span>Ongeraho Bishya</span>
              </button>
            </div>

            {customReminders.length > 0 ? (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {customReminders.slice(0, 3).map((rem) => (
                  <span
                    key={rem.id}
                    className="px-2.5 py-1 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5"
                  >
                    <span>{rem.title}</span>
                    <span className="text-amber-600 font-mono text-[10px]">({rem.time})</span>
                  </span>
                ))}
                {customReminders.length > 3 && (
                  <span className="text-[11px] text-slate-400 self-center">
                    +{customReminders.length - 3} bindi...
                  </span>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Ushobora kongeramo ibyibutsa by'inama, igihe cyo gukosora, cyangwa zamu ry'ishuri muri Settings.
              </p>
            )}
          </div>

          {/* Inbox / Ubutumwa Bwakiriwe (Smart Personal Surprises) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Ubutumwa Bwakiriwe (Inbox)
              </h3>
              {logs.length > 0 && (
                <button
                  onClick={() => notificationEngine.markAllLogsAsRead()}
                  className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline cursor-pointer"
                >
                  Bika Byose Nka Bisomye
                </button>
              )}
            </div>

            {logs.length === 0 ? (
              <div className="text-center py-12 px-4 rounded-2xl bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-200 dark:border-slate-800 text-slate-400 text-xs space-y-2">
                <Sparkles className="w-8 h-8 mx-auto text-amber-500/50" />
                <div className="font-bold text-slate-700 dark:text-slate-300">
                  Ubutumwa bwa mbere burakugeraho mu kanya!
                </div>
                <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                  Elimu Smart Assistant izajya igutungura iguha ubutumwa bukwiye bujyanye n'igihe cy'umunsi n'amasomo yawe.
                </p>
              </div>
            ) : (
              logs.map((log) => (
                <div
                  key={log.id}
                  className={`p-3.5 rounded-2xl border transition flex items-start justify-between gap-3 ${
                    !log.read 
                      ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60' 
                      : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {log.title}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {log.time}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 leading-snug">
                      {log.body}
                    </p>
                  </div>

                  <button
                    onClick={() => handleOpenItem(log.tab)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition cursor-pointer shrink-0 flex items-center gap-1 shadow-xs"
                  >
                    <span>Fungura</span>
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <button
            onClick={() => {
              onClose();
              onOpenSettings();
            }}
            className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-500 flex items-center gap-1.5 cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Fungura Igenamiterere (Settings)</span>
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer shrink-0"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
};
