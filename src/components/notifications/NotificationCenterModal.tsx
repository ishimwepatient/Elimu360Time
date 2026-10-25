import React, { useState, useEffect } from 'react';
import { 
  Bell, 
  Flame, 
  X, 
  CheckCircle2, 
  Clock, 
  Sparkles, 
  Lock, 
  Smartphone, 
  Zap, 
  BookOpen, 
  HelpCircle, 
  FileText,
  AlertTriangle,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import { 
  notificationEngine, 
  ELIMU_SMART_SCHEDULE, 
  NotificationLogItem, 
  TeacherContext 
} from '../../utils/notificationSystem';

interface NotificationCenterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateTab: (tab: any) => void;
}

export const NotificationCenterModal: React.FC<NotificationCenterModalProps> = ({
  isOpen,
  onClose,
  onNavigateTab
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [streak, setStreak] = useState(3);
  const [logs, setLogs] = useState<NotificationLogItem[]>([]);
  const [activeView, setActiveView] = useState<'schedule' | 'history'>('schedule');
  const [context, setContext] = useState<TeacherContext>(() => notificationEngine.getTeacherContext());

  useEffect(() => {
    const update = () => {
      setPermission(notificationEngine.getPermission());
      setStreak(notificationEngine.getStreakCount());
      setLogs(notificationEngine.getNotificationLogs());
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

            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition cursor-pointer shrink-0"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Teacher Dedication & Stats Bar */}
          <div className="mt-3 sm:mt-4 grid grid-cols-3 gap-2 bg-slate-950/15 backdrop-blur-md rounded-2xl p-2 sm:p-2.5 text-center text-xs font-bold text-slate-950">
            <div>
              <div className="text-sm sm:text-base font-black flex items-center justify-center gap-1">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 text-amber-500" />
                {streak} Iminsi
              </div>
              <div className="text-[9px] sm:text-[10px] uppercase font-extrabold opacity-85">Ubwitange (Streak)</div>
            </div>
            <div>
              <div className="text-sm sm:text-base font-black">12 / Munsi</div>
              <div className="text-[9px] sm:text-[10px] uppercase font-extrabold opacity-85">Amasaha y'Amasomo</div>
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
                <span className="font-bold">Ubutumwa bwa Lock Screen ntiburakora:</span> Kanda "Kwemerera" ngo ubone ubutumwa bugufasha ku masomo no kuri Lock Screen ya telefoni.
              </div>
            </div>
            <button
              onClick={handleRequestPermission}
              className="w-full sm:w-auto px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-xl shadow-md transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
            >
              <Zap className="w-3.5 h-3.5 fill-slate-950" />
              <span>Emera Ubutumwa (Enable)</span>
            </button>
          </div>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-950/30 border-b border-emerald-200 dark:border-emerald-900/50 px-4 py-2.5 shrink-0 flex items-center justify-between gap-2 text-emerald-800 dark:text-emerald-300 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span className="font-semibold">Ubujyanama bwa Elimu Smart Assistant burakora kuri Lock Screen</span>
            </div>
            <span className="text-[10px] uppercase font-black px-2 py-0.5 rounded-full bg-emerald-600/20 text-emerald-700 dark:text-emerald-300">
              Active
            </span>
          </div>
        )}

        {/* View Switcher Tabs: Daily Milestones vs History */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2.5 shrink-0">
          <button
            onClick={() => setActiveView('schedule')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition ${
              activeView === 'schedule'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Gahunda y'Umunsi (12 Milestones)</span>
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition ${
              activeView === 'history'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Ubutumwa Bwakiriwe ({logs.length})</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-3 sm:p-4 overflow-y-auto space-y-2.5 flex-1 text-slate-800 dark:text-slate-200">
          {activeView === 'schedule' ? (
            <div className="space-y-2">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2 flex items-center justify-between">
                <span>Gahunda y'amasaha y'ubujyanama (Elimu Smart Milestones):</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">10+ alerts ziteganyijwe</span>
              </div>

              {ELIMU_SMART_SCHEDULE.map((slot) => {
                const timeString = `${String(slot.hour).padStart(2, '0')}:${String(slot.minute).padStart(2, '0')}`;
                const previewMsg = slot.generateMessage(context);

                return (
                  <div
                    key={slot.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 dark:hover:border-amber-500/50 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-2.5 sm:gap-3 min-w-0">
                      <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-black text-xs rounded-lg font-mono shrink-0">
                        {timeString}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 truncate">
                          {slot.focusTitle}
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {previewMsg.body}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleOpenItem(slot.tab)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500/15 hover:bg-amber-500 text-amber-700 hover:text-slate-950 dark:text-amber-300 dark:hover:text-slate-950 transition text-xs font-bold cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <span>Fungura</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Nta butumwa bwa kera burabikwa. Ubutumwa bwawe bwa buri munsi buzaza kuri telefoni yawe uko amasaha yagenwe ageze.
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {log.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {log.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-2">
                        {log.body}
                      </p>
                    </div>

                    <button
                      onClick={() => handleOpenItem(log.tab)}
                      className="px-3 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition cursor-pointer shrink-0"
                    >
                      Kora
                    </button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer with Professional Educator Guidance */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5 text-center sm:text-left">
            <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Elimu Smart Notification System itegura amasomo yawe hakiri kare kugira ngo uhe abanyeshuri uburere bunoze.</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer shrink-0"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
};
