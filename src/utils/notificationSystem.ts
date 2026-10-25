// Duolingo & Phoenix Style High-Engagement Notification Engine for Elimu360
// Supports: Native OS Notifications, Service Worker Lock Screen alerts, Timed Daily Scheduling (10+ per day),
// Duolingo Streaks, Vibration, Custom Sound, and In-App Fallbacks.

export interface DailyNotificationSchedule {
  id: string;
  hour: number;
  minute: number;
  titleRw: string;
  bodyRw: string;
  titleEn: string;
  bodyEn: string;
  tab: 'generator' | 'reb_library' | 'question_bank' | 'converter' | 'guide' | 'library';
  category: 'lesson_plan' | 'reb_book' | 'streak' | 'question_bank' | 'converter' | 'motivation';
  icon?: string;
  badge?: string;
}

export interface NotificationLogItem {
  id: string;
  title: string;
  body: string;
  time: string;
  timestamp: number;
  tab: string;
  read: boolean;
}

export const DAILY_NOTIFICATION_SCHEDULE: DailyNotificationSchedule[] = [
  {
    id: 'notif_0645',
    hour: 6,
    minute: 45,
    titleRw: '🌅 Mwarimu, Umunsi Mwiza!',
    bodyRw: 'Umunsi mushya w’amasomo uratangiye! Kora Lesson Plan yawe y’uyu munsi mu masegonda 30 gusa.',
    titleEn: '🌅 Good Morning Teacher!',
    bodyEn: 'New teaching day has begun! Generate today\'s CBC Lesson Plan in just 30 seconds.',
    tab: 'generator',
    category: 'lesson_plan'
  },
  {
    id: 'notif_0800',
    hour: 8,
    minute: 0,
    titleRw: '📚 Ibitabo Bishya bya REB CBC!',
    bodyRw: 'Ibitabo 1,806 biri muri library bifite ikimenyetso n’igifuniko cy’ishuri ryawe. Manura ubu!',
    titleEn: '📚 Verified REB CBC Textbooks!',
    bodyEn: '1,806 textbooks & teacher guides ready with your school cover and QR verification.',
    tab: 'reb_library',
    category: 'reb_book'
  },
  {
    id: 'notif_0930',
    hour: 9,
    minute: 30,
    titleRw: '🔥 Duolingo Streak: Ntucikwe!',
    bodyRw: 'Mwarimu, streak yawe iracyari nzima! Kora isomo rimwe cyangwa usome igitabo ngo utazatakaza amanota.',
    titleEn: '🔥 Duolingo Streak Alert: Keep it burning!',
    bodyEn: 'Don\'t lose your teacher streak! Generate one lesson plan or explore a textbook now.',
    tab: 'generator',
    category: 'streak'
  },
  {
    id: 'notif_1100',
    hour: 11,
    minute: 0,
    titleRw: '💡 Ibibazo 3,200+ bya CBC Biteguye!',
    bodyRw: 'Ukeneye ibizamini cyangwa imikoro y’abanyeshuri? Koresha Question Bank yacu y’ubuntu ubu.',
    titleEn: '💡 3,200+ CBC Question Bank Ready!',
    bodyEn: 'Need quick classroom quizzes or exam questions? Browse by competence and sub-strand.',
    tab: 'question_bank',
    category: 'question_bank'
  },
  {
    id: 'notif_1230',
    hour: 12,
    minute: 30,
    titleRw: '☕ Break Time / Saa Sita Productivity!',
    bodyRw: 'Kora Schemes of Work z’igihembwe cyose mugihe uri kuruhuka. Byoroshye kandi byihuse!',
    titleEn: '☕ Lunch Productivity: Schemes of Work',
    bodyEn: 'Prepare weekly schemes of work while relaxing. Save hours of paperwork today.',
    tab: 'reb_library',
    category: 'lesson_plan'
  },
  {
    id: 'notif_1400',
    hour: 14,
    minute: 0,
    titleRw: '📄 Hindura Inyandiko (PDF to Word)!',
    bodyRw: 'Ufite notes cyangwa ibizamini bishaje? Bihindure muri Word cyangwa PDF ku buntu.',
    titleEn: '📄 Universal Converter: PDF to Word!',
    bodyEn: 'Convert your exam notes and curriculum PDFs into editable Word documents instantly.',
    tab: 'converter',
    category: 'converter'
  },
  {
    id: 'notif_1545',
    hour: 15,
    minute: 45,
    titleRw: '🎯 Amasomo yo ku Gicamunsi!',
    bodyRw: 'Koresha ubuhanga bugezweho bwa CBC urusheho gushimisha abanyeshuri bawe mu ishuri.',
    titleEn: '🎯 Afternoon Teaching Excellence!',
    bodyEn: 'Use active learning methods and competence-based assessment tools with Elimu360.',
    tab: 'guide',
    category: 'motivation'
  },
  {
    id: 'notif_1715',
    hour: 17,
    minute: 15,
    titleRw: '⏰ Phoenix Alert: Ejo uzigisha iki?',
    bodyRw: 'Ntukagere mu ishuri udateguye! Fata iminota 2 ukore Lesson Plan y’ejo hakiri kare.',
    titleEn: '⏰ Phoenix Alert: Prep Tomorrow\'s Lesson!',
    bodyEn: 'Never enter class unprepared. Spend 2 minutes now and secure tomorrow\'s lesson plan.',
    tab: 'generator',
    category: 'lesson_plan'
  },
  {
    id: 'notif_1900',
    hour: 19,
    minute: 0,
    titleRw: '📦 Manura Ibitabo Byose (Batch ZIP)!',
    bodyRw: 'Ushobora kumanura ibitabo by’umwaka wose (P1-S3) icyarimwe muri ZIP imwe yihuse!',
    titleEn: '📦 Download Whole Class Books (Batch ZIP)!',
    bodyEn: 'Grab complete sets of P1 to S3 books in a single branded ZIP file on your device.',
    tab: 'reb_library',
    category: 'reb_book'
  },
  {
    id: 'notif_2015',
    hour: 20,
    minute: 15,
    titleRw: '🏆 Mwarimu w’Indashyikirwa!',
    bodyRw: 'Abarimu barenga 24,000 bamaze gukoresha Elimu360 none. Wowe nawe koresha ubwenge bwawe!',
    titleEn: '🏆 Over 24,000 Teachers Prepared Today!',
    bodyEn: 'Join thousands of Rwandan educators elevating classroom standards with smart AI tools.',
    tab: 'library',
    category: 'motivation'
  },
  {
    id: 'notif_2130',
    hour: 21,
    minute: 30,
    titleRw: '🌙 Ryama Utekanye Mwarimu!',
    bodyRw: 'Gahunda z’ejo zimeze neza? Elimu360 irakwifuriza ijoro ryiza n’amasomo meza y’ejo.',
    titleEn: '🌙 Rest Well, Prepared Teacher!',
    bodyEn: 'Sleep peacefully knowing your lesson plans are ready. Good night from Elimu360!',
    tab: 'generator',
    category: 'motivation'
  },
  {
    id: 'notif_2245',
    hour: 22,
    minute: 45,
    titleRw: '⚡ Duolingo Late Nudge: Streak Saver!',
    bodyRw: 'Isaha irageze! Kora save ya lesson plan imwe gusa ngo ubike umurongo (streak) wawe!',
    titleEn: '⚡ Midnight Streak Saver!',
    bodyEn: 'Save a quick lesson plan draft to keep your daily streak alive before midnight!',
    tab: 'generator',
    category: 'streak'
  }
];

class NotificationEngine {
  private listeners: Array<() => void> = [];
  private checkInterval: any = null;

  constructor() {
    this.updateStreak();
    this.startSchedulerLoop();
  }

  // Subscribe to changes (permission, log, streak)
  public subscribe(listener: () => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notifyListeners() {
    this.listeners.forEach(fn => fn());
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  public async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported()) return 'denied';
    try {
      const result = await Notification.requestPermission();
      this.notifyListeners();
      if (result === 'granted') {
        // Automatically send welcome Duolingo/Phoenix notification to verify lock screen
        this.sendLockScreenNotification({
          title: '🔥 Duolingo/Phoenix Mode Activated!',
          body: 'Ubutumwa bwa buri munsi (10+ notifications) bwatangiye gukora no kuri Lock Screen yawe!',
          tab: 'generator',
          tag: 'elimu-welcome'
        });
      }
      return result;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  // Duolingo Teacher Streak Management
  public getStreakCount(): number {
    if (typeof window === 'undefined') return 3;
    const streak = localStorage.getItem('elimu_teacher_streak');
    return streak ? parseInt(streak, 10) : 3;
  }

  public updateStreak() {
    if (typeof window === 'undefined') return;
    const today = new Date().toISOString().split('T')[0];
    const lastActive = localStorage.getItem('elimu_last_streak_date');
    let currentStreak = parseInt(localStorage.getItem('elimu_teacher_streak') || '3', 10);

    if (lastActive !== today) {
      if (lastActive) {
        const lastDate = new Date(lastActive);
        const diffDays = Math.round((new Date(today).getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          currentStreak += 1;
        } else if (diffDays > 1) {
          currentStreak = 1;
        }
      }
      localStorage.setItem('elimu_teacher_streak', currentStreak.toString());
      localStorage.setItem('elimu_last_streak_date', today);
    }
  }

  // Sent IDs for today
  public getDeliveredIdsToday(): string[] {
    if (typeof window === 'undefined') return [];
    const todayKey = 'elimu_delivered_' + new Date().toISOString().split('T')[0];
    try {
      return JSON.parse(localStorage.getItem(todayKey) || '[]');
    } catch {
      return [];
    }
  }

  private markDeliveredToday(id: string) {
    if (typeof window === 'undefined') return;
    const todayKey = 'elimu_delivered_' + new Date().toISOString().split('T')[0];
    const list = this.getDeliveredIdsToday();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(todayKey, JSON.stringify(list));
    }
  }

  // Notification history log
  public getNotificationLogs(): NotificationLogItem[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('elimu_notification_history') || '[]');
    } catch {
      return [];
    }
  }

  private addNotificationLog(item: Omit<NotificationLogItem, 'id' | 'timestamp' | 'read' | 'time'>) {
    if (typeof window === 'undefined') return;
    const history = this.getNotificationLogs();
    const now = new Date();
    const newItem: NotificationLogItem = {
      ...item,
      id: 'log_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    // Keep last 30 notifications
    const updated = [newItem, ...history].slice(0, 30);
    localStorage.setItem('elimu_notification_history', JSON.stringify(updated));
    this.notifyListeners();
  }

  public markAllLogsAsRead() {
    if (typeof window === 'undefined') return;
    const history = this.getNotificationLogs().map(item => ({ ...item, read: true }));
    localStorage.setItem('elimu_notification_history', JSON.stringify(history));
    this.notifyListeners();
  }

  public getUnreadCount(): number {
    return this.getNotificationLogs().filter(n => !n.read).length;
  }

  // Native Lock Screen & System Tray Dispatcher
  public async sendLockScreenNotification(payload: {
    title: string;
    body: string;
    tab?: 'generator' | 'reb_library' | 'question_bank' | 'converter' | 'guide' | 'library';
    tag?: string;
    delayMs?: number;
  }): Promise<boolean> {
    const perm = this.getPermission();
    const title = payload.title;
    const body = payload.body;
    const tab = payload.tab || 'generator';
    const tag = payload.tag || 'elimu-lockscreen-' + Date.now();

    // Log to internal history
    this.addNotificationLog({ title, body, tab });

    if (perm !== 'granted') {
      // Permission not yet granted, trigger in-app toast event
      this.dispatchInAppToast(title, body, tab);
      return false;
    }

    try {
      // Preferred Path: Through Service Worker registration (guarantees Lock Screen display on Android/iOS/Windows/Mac)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          if (payload.delayMs && payload.delayMs > 0) {
            // Schedule via Service Worker message or client timeout
            setTimeout(() => {
              registration.showNotification(title, {
                body,
                icon: '/pwa-icon.svg',
                badge: '/favicon.svg',
                tag,
                renotify: true,
                vibrate: [300, 150, 300, 150, 300],
                data: { tab, url: `/?tab=${tab}` }
              } as any);
            }, payload.delayMs);
          } else {
            await registration.showNotification(title, {
              body,
              icon: '/pwa-icon.svg',
              badge: '/favicon.svg',
              tag,
              renotify: true,
              vibrate: [250, 100, 250, 100, 250],
              data: { tab, url: `/?tab=${tab}` }
            } as any);
          }
          return true;
        }
      }

      // Fallback: Standard window Notification constructor
      new Notification(title, {
        body,
        icon: '/pwa-icon.svg',
        tag,
        badge: '/favicon.svg'
      });
      return true;
    } catch (e) {
      console.warn('Native notification failed, falling back to toast:', e);
      this.dispatchInAppToast(title, body, tab);
      return false;
    }
  }

  // Dispatch an in-app visual toast if the user has the browser tab active
  private dispatchInAppToast(title: string, body: string, tab: string) {
    if (typeof window === 'undefined') return;
    const event = new CustomEvent('elimu_inapp_toast', {
      detail: { title, body, tab }
    });
    window.dispatchEvent(event);
  }

  // Background Loop: Checks if any of the 12 daily schedule slots matches current time
  private startSchedulerLoop() {
    if (typeof window === 'undefined') return;
    if (this.checkInterval) clearInterval(this.checkInterval);

    // Initial check on load
    this.checkSchedule();

    // Run check every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkSchedule();
    }, 30000);
  }

  private checkSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const delivered = this.getDeliveredIdsToday();

    for (const item of DAILY_NOTIFICATION_SCHEDULE) {
      // If within 15 minutes of scheduled time and not yet delivered today
      const itemMinutes = item.hour * 60 + item.minute;
      const currentMinutes = currentHour * 60 + currentMinute;
      const diff = currentMinutes - itemMinutes;

      if (diff >= 0 && diff <= 15 && !delivered.includes(item.id)) {
        this.markDeliveredToday(item.id);
        const streak = this.getStreakCount();
        const title = item.titleRw.replace('{streak}', streak.toString());
        const body = item.bodyRw.replace('{streak}', streak.toString());

        this.sendLockScreenNotification({
          title,
          body,
          tab: item.tab,
          tag: item.id
        });
      }
    }
  }

  // Trigger a fast test countdown so the user can lock their phone right away to see it!
  public testLockScreenWithCountdown(countdownSeconds = 4, onTick?: (sec: number) => void): Promise<void> {
    return new Promise((resolve) => {
      let remaining = countdownSeconds;
      if (onTick) onTick(remaining);

      const interval = setInterval(() => {
        remaining -= 1;
        if (onTick) onTick(remaining);

        if (remaining <= 0) {
          clearInterval(interval);
          const streak = this.getStreakCount();
          this.sendLockScreenNotification({
            title: '🔥 Duolingo/Phoenix Lock Screen Alert!',
            body: `Mwarimu, ubutumwa bwawe bwa Lock Screen burakora 100%! Streak yawe ni iminsi ${streak}. Tegura isomo rya none!`,
            tab: 'generator',
            tag: 'lockscreen-test-' + Date.now()
          });
          resolve();
        }
      }, 1000);
    });
  }
}

export const notificationEngine = new NotificationEngine();
