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
  Play, 
  Volume2, 
  BookOpen, 
  HelpCircle, 
  FileText,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { 
  notificationEngine, 
  DAILY_NOTIFICATION_SCHEDULE, 
  NotificationLogItem, 
  DailyNotificationSchedule 
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
  const [countdown, setCountdown] = useState<number | null>(null);
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    const update = () => {
      setPermission(notificationEngine.getPermission());
      setStreak(notificationEngine.getStreakCount());
      setLogs(notificationEngine.getNotificationLogs());
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

  const handleTestLockScreen = async () => {
    setCountdown(4);
    await notificationEngine.testLockScreenWithCountdown(4, (sec) => {
      setCountdown(sec);
    });
    setCountdown(null);
    setTestSent(true);
    setTimeout(() => setTestSent(false), 4000);
  };

  const handleSendSingle = (item: DailyNotificationSchedule) => {
    notificationEngine.sendLockScreenNotification({
      title: item.titleRw,
      body: item.bodyRw,
      tab: item.tab,
      tag: 'manual-' + item.id + '-' + Date.now()
    });
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  const handleOpenItem = (tab: any) => {
    onNavigateTab(tab);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Duolingo / Phoenix Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-emerald-600 p-5 sm:p-6 text-slate-950 relative overflow-hidden shrink-0">
          <div className="absolute -right-6 -bottom-8 opacity-15 pointer-events-none">
            <Flame className="w-40 h-40 fill-white" />
          </div>

          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/90 rounded-2xl shadow-md text-amber-600">
                <Bell className="w-6 h-6 animate-bounce" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950">
                    Duolingo & Phoenix Alerts
                  </h2>
                  <span className="bg-slate-950 text-amber-400 text-[10px] font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                    <Flame className="w-3 h-3 fill-amber-400" />
                    {streak} Days Streak!
                  </span>
                </div>
                <p className="text-xs sm:text-sm font-semibold text-slate-900/80 mt-0.5">
                  Ubutumwa bwa buri munsi (10+ daily reminders) no kuri Lock Screen
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-950/20 hover:bg-slate-950/30 text-slate-950 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Streak & Delivery Stats Bar */}
          <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-950/15 backdrop-blur-md rounded-2xl p-2.5 text-center text-xs font-bold text-slate-950">
            <div>
              <div className="text-base sm:text-lg font-black flex items-center justify-center gap-1">
                <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
                {streak}
              </div>
              <div className="text-[10px] uppercase font-bold opacity-80">Teacher Streak</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black">12 / Umunsi</div>
              <div className="text-[10px] uppercase font-bold opacity-80">Daily Target</div>
            </div>
            <div>
              <div className="text-base sm:text-lg font-black flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-950" />
                {permission === 'granted' ? 'Active' : 'Pending'}
              </div>
              <div className="text-[10px] uppercase font-bold opacity-80">Lock Screen</div>
            </div>
          </div>
        </div>

        {/* Permission Call-To-Action if not granted */}
        {permission !== 'granted' && (
          <div className="bg-amber-50 dark:bg-amber-950/40 border-b border-amber-200 dark:border-amber-900/60 p-4 shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3 text-amber-900 dark:text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
              <div className="text-xs">
                <span className="font-bold">Ubutumwa bwa Lock Screen ntiburakora:</span> Kanda "Kwemerera" (Allow) ngo telefoni yawe yakire ubutumwa n'ubwo yaba ifunze!
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
        )}

        {/* Lock Screen Live Interactive Test Section */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 flex items-center justify-center shrink-0">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Gerageza kuri Lock Screen yawe (Test Lock Screen)
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Kanda hano uhite ukinga (lock) telefoni yawe mu masegonda 4 urebe ubutumwa bwadutse!
                </p>
              </div>
            </div>

            <button
              onClick={handleTestLockScreen}
              disabled={countdown !== null}
              className={`w-full sm:w-auto px-4 py-2 text-xs font-black rounded-xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer ${
                countdown !== null
                  ? 'bg-amber-500 text-slate-950 animate-pulse'
                  : testSent
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 hover:opacity-90'
              }`}
            >
              {countdown !== null ? (
                <>
                  <Clock className="w-3.5 h-3.5 animate-spin" />
                  <span>Funga telefoni mu masegonda {countdown}s...</span>
                </>
              ) : testSent ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Byoherejwe kuri Lock Screen!</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Gerageza None (Test Now)</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* View Switcher Tabs: Daily Schedule vs History */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 shrink-0">
          <button
            onClick={() => setActiveView('schedule')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition ${
              activeView === 'schedule'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Gahunda y'Umunsi (12 Timed Reminders)</span>
          </button>
          <button
            onClick={() => setActiveView('history')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition ${
              activeView === 'history'
                ? 'border-amber-500 text-amber-600 dark:text-amber-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Ibyohererejwe ({logs.length})</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-slate-800 dark:text-slate-200">
          {activeView === 'schedule' ? (
            <div className="space-y-2.5">
              <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-1 flex items-center justify-between">
                <span>Gahunda y'amasaha (Daily Duolingo/Phoenix Schedule):</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">10+ alerts ziteganyijwe</span>
              </div>

              {DAILY_NOTIFICATION_SCHEDULE.map((item) => {
                const timeString = `${String(item.hour).padStart(2, '0')}:${String(item.minute).padStart(2, '0')}`;
                
                return (
                  <div
                    key={item.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 hover:border-amber-400/50 dark:hover:border-amber-500/50 transition flex items-center justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="px-2 py-1 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 font-black text-xs rounded-lg font-mono shrink-0">
                        {timeString}
                      </div>
                      <div>
                        <div className="text-xs font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span>{item.titleRw}</span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                          {item.bodyRw}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => handleSendSingle(item)}
                        title="Ohereza aka kanya kuri telefoni cyangwa mudasobwa"
                        className="p-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-amber-500 hover:text-slate-950 text-slate-700 dark:text-slate-300 transition text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Zap className="w-3 h-3" />
                        <span className="hidden sm:inline">Ohereza</span>
                      </button>
                      <button
                        onClick={() => handleOpenItem(item.tab)}
                        className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-600 hover:text-slate-950 transition text-[11px] font-bold cursor-pointer"
                      >
                        Fungura
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="space-y-2">
              {logs.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  Nta butumwa bwa kera burabikwa. Kanda "Gerageza None" hejuru urebe uko biza!
                </div>
              ) : (
                logs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                          {log.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {log.time}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
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

        {/* Footer with Duolingo Motivation */}
        <div className="p-3 sm:p-4 bg-slate-100 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2 shrink-0">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
            <span><strong>Duolingo / Phoenix Engine:</strong> Buri munsi woherezwa ubutumwa 10+ kugirango utazibagirwa na rimwe amasomo yawe!</span>
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            Funga
          </button>
        </div>
      </div>
    </div>
  );
};
