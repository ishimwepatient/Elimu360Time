// Elimu Smart Notification System
// Intelligent, contextual, and deeply personalized teacher assistant
// Dispatches hundreds of smart notifications to Native Lock Screen, Mobile Shade, and In-App Assistant.
// Fully resilient offline with CacheStorage and LocalStorage fallback.

export interface SmartNotificationItem {
  id: string;
  category: 'lesson_plan' | 'reb_book' | 'streak' | 'question_bank' | 'converter' | 'motivation' | 'wrap_up';
  title: string;
  body: string;
  timeWindow: 'morning' | 'mid_morning' | 'noon' | 'afternoon' | 'evening' | 'night' | 'anytime';
  tab: 'generator' | 'reb_library' | 'question_bank' | 'converter' | 'guide' | 'library' | 'home';
}

export interface SmartNotificationSlot {
  id: string;
  hour: number;
  minute: number;
  focusTitle: string;
  category: 'lesson_plan' | 'reb_book' | 'streak' | 'question_bank' | 'converter' | 'motivation' | 'wrap_up';
  tab: 'generator' | 'reb_library' | 'question_bank' | 'converter' | 'guide' | 'library' | 'home';
  generateMessage: (context: TeacherContext) => { title: string; body: string };
}

export interface TeacherContext {
  teacherName: string;
  schoolName: string;
  defaultSubject: string;
  defaultClass: string;
  streakDays: number;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday ... 6 = Saturday
  dayNameRw: string;
  dayNameEn: string;
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

export interface TeacherCustomReminder {
  id: string;
  title: string;
  body?: string;
  time: string; // "HH:MM"
  hour: number;
  minute: number;
  days: number[]; // [1,2,3,4,5] = weekdays, [] = daily
  enabled: boolean;
  category: 'meeting' | 'duty' | 'exam' | 'lesson' | 'general';
  tab?: 'generator' | 'reb_library' | 'question_bank' | 'converter' | 'guide' | 'library' | 'home';
}

export interface ElimuAppSettings {
  lessonPlanAlerts: boolean;
  rebBooksAlerts: boolean;
  questionBankAlerts: boolean;
  converterAlerts: boolean;
  soundEnabled: boolean;
  vibrationEnabled: boolean;
  streakEnabled: boolean;
  fileWatcherEnabled: boolean;
  language: 'rw' | 'en' | 'both';
}

const RW_DAY_NAMES = [
  'Ku Cyumweru',
  'Kuwa Mbere',
  'Kuwa Kabiri',
  'Kuwa Gatatu',
  'Kuwa Kane',
  'Kuwa Gatanu',
  'Kuwa Gatandatu'
];

const EN_DAY_NAMES = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday'
];

// Helper to get respectful personalized salutation
export function getSalutation(ctx: TeacherContext): string {
  if (ctx.teacherName && ctx.teacherName.trim().length > 0) {
    const cleanName = ctx.teacherName.trim();
    if (cleanName.toLowerCase().startsWith('mwarimu') || cleanName.toLowerCase().startsWith('teacher')) {
      return cleanName;
    }
    return `Mwarimu ${cleanName}`;
  }
  return "Mwarimu w'icyubahiro";
}

export function getSchoolMention(ctx: TeacherContext): string {
  if (ctx.schoolName && ctx.schoolName.trim().length > 0) {
    return `muri ${ctx.schoolName.trim()}`;
  }
  return "mu ishuri ryawe";
}

const DEFAULT_SETTINGS: ElimuAppSettings = {
  lessonPlanAlerts: true,
  rebBooksAlerts: true,
  questionBankAlerts: true,
  converterAlerts: true,
  soundEnabled: true,
  vibrationEnabled: true,
  streakEnabled: true,
  fileWatcherEnabled: true,
  language: 'rw'
};

const SETTINGS_STORAGE_KEY = 'elimu_smart_settings';
const CUSTOM_REMINDERS_STORAGE_KEY = 'elimu_custom_teacher_reminders';
const OFFLINE_POOL_STORAGE_KEY = 'elimu_cached_notifications_pool';
const LAST_DISPATCH_TIME_KEY = 'elimu_last_smart_dispatch_time';

// Standby default items in case initial fetch hasn't completed yet
const STANDBY_POOL: SmartNotificationItem[] = [
  {
    id: "lp_standby_1",
    category: "lesson_plan",
    timeWindow: "morning",
    tab: "generator",
    title: "🌅 Umunsi mwiza, {name}!",
    body: "Tegura Lesson Plan y'uyu munsi {school} mu masegonda 30 gusa ukoresheje REB CBC Assistant."
  },
  {
    id: "reb_standby_1",
    category: "reb_book",
    timeWindow: "mid_morning",
    tab: "reb_library",
    title: "📚 Ibitabo bya REB CBC biri ku buntu, {name}",
    body: "Manura ibitabo 1,806 n'amapaji ya REB y'ubuntu afite ikimenyetso cy'ishuri ryawe ako kanya."
  },
  {
    id: "qb_standby_1",
    category: "question_bank",
    timeWindow: "afternoon",
    tab: "question_bank",
    title: "💡 Urakeneye ibibazo by'isuzuma, {name}?",
    body: "Question Bank ifite ibibazo birenga 3,200 bya CBC bifite ibisubizo n'akaraso k'ikosora."
  },
  {
    id: "conv_standby_1",
    category: "converter",
    timeWindow: "afternoon",
    tab: "converter",
    title: "⚡ Hindura inyandiko zawe muri Word, {name}!",
    body: "Ufite ibizamini bishaje cyangwa notes za PDF? Bishyire muri Universal Converter bihinduke muri Word ako kanya."
  },
  {
    id: "wrap_standby_1",
    category: "wrap_up",
    timeWindow: "night",
    tab: "generator",
    title: "🌙 Ijoro ryiza, {name}!",
    body: "Ukoze imirimo myiza {school} uyu munsi. Ryama utekanye uzi ko amasomo y'ejo yateguwe neza."
  }
];

class NotificationEngine {
  private listeners: Array<() => void> = [];
  private checkInterval: any = null;
  private notificationPool: SmartNotificationItem[] = [];
  private isPoolLoaded = false;

  constructor() {
    this.updateStreak();
    this.loadOfflineNotificationPool();
    this.startSchedulerLoop();
    this.setupNetworkAndWorkerSync();
  }

  // Load and cache offline notification pool
  private async loadOfflineNotificationPool() {
    if (typeof window === 'undefined') return;

    // 1. First hydrate instantly from local storage cache
    try {
      const cached = localStorage.getItem(OFFLINE_POOL_STORAGE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.notificationPool = parsed;
          this.isPoolLoaded = true;
        }
      }
    } catch (e) {
      console.warn('[ElimuSmart] LocalStorage cache read error:', e);
    }

    if (this.notificationPool.length === 0) {
      this.notificationPool = [...STANDBY_POOL];
    }

    // 2. Fetch fresh pool from public asset (CacheStorage / Network)
    try {
      const res = await fetch('/elimu_notifications_pool.json');
      if (res.ok) {
        const freshPool: SmartNotificationItem[] = await res.json();
        if (Array.isArray(freshPool) && freshPool.length > 0) {
          this.notificationPool = freshPool;
          this.isPoolLoaded = true;
          localStorage.setItem(OFFLINE_POOL_STORAGE_KEY, JSON.stringify(freshPool));
          this.syncProfileWithServiceWorker();
        }
      }
    } catch (e) {
      console.log('[ElimuSmart] Running offline mode with cached notifications pool (' + this.notificationPool.length + ' items)');
    }
  }

  // Network online listener & Service Worker background sync
  private setupNetworkAndWorkerSync() {
    if (typeof window === 'undefined') return;

    // Refresh when device comes online
    window.addEventListener('online', () => {
      this.loadOfflineNotificationPool();
      this.syncProfileWithServiceWorker();
      this.registerPeriodicBackgroundSync();
    });

    // Send profile sync once service worker is ready
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(() => {
        this.syncProfileWithServiceWorker();
        this.registerPeriodicBackgroundSync();
      }).catch(() => {});
    }
  }

  // Synchronize teacher identity to Service Worker for autonomous offline lock screen alerts
  public syncProfileWithServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    try {
      const ctx = this.getTeacherContext();
      const payload = {
        type: 'SYNC_TEACHER_PROFILE',
        profile: {
          teacherName: getSalutation(ctx),
          schoolName: ctx.schoolName || '',
          streak: ctx.streakDays
        }
      };

      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage(payload);
      }
      navigator.serviceWorker.ready.then(reg => {
        if (reg.active) {
          reg.active.postMessage(payload);
        }
      });
    } catch (e) {
      // SW message safe fallback
    }
  }

  // Register Periodic Background Sync (runs in background without browser opened)
  public async registerPeriodicBackgroundSync() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return;
    try {
      const registration: any = await navigator.serviceWorker.ready;
      if (registration && 'periodicSync' in registration) {
        // Request min interval ~35 mins
        await registration.periodicSync.register('elimu-smart-notifications', {
          minInterval: 35 * 60 * 1000
        });
      }
    } catch (e) {
      // Periodic sync not permitted on some browsers
    }
  }

  // Settings Management
  public getSettings(): ElimuAppSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    try {
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      return stored ? { ...DEFAULT_SETTINGS, ...JSON.parse(stored) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  public updateSettings(partial: Partial<ElimuAppSettings>) {
    if (typeof window === 'undefined') return;
    const current = this.getSettings();
    const updated = { ...current, ...partial };
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    this.notifyListeners();
  }

  // Teacher Custom Reminders Management
  public getCustomReminders(): TeacherCustomReminder[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(CUSTOM_REMINDERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  public saveCustomReminder(item: Omit<TeacherCustomReminder, 'id'>): TeacherCustomReminder {
    const list = this.getCustomReminders();
    const newReminder: TeacherCustomReminder = {
      ...item,
      id: 'rem_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4)
    };
    list.unshift(newReminder);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_REMINDERS_STORAGE_KEY, JSON.stringify(list));
    }
    this.notifyListeners();
    return newReminder;
  }

  public updateCustomReminder(item: TeacherCustomReminder) {
    const list = this.getCustomReminders().map(r => r.id === item.id ? item : r);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_REMINDERS_STORAGE_KEY, JSON.stringify(list));
    }
    this.notifyListeners();
  }

  public deleteCustomReminder(id: string) {
    const list = this.getCustomReminders().filter(r => r.id !== id);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_REMINDERS_STORAGE_KEY, JSON.stringify(list));
    }
    this.notifyListeners();
  }

  public toggleCustomReminder(id: string) {
    const list = this.getCustomReminders().map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CUSTOM_REMINDERS_STORAGE_KEY, JSON.stringify(list));
    }
    this.notifyListeners();
  }

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
        const ctx = this.getTeacherContext();
        const salutation = getSalutation(ctx);
        // Automatically send a warm, personal welcome confirmation directly to lock screen
        this.sendLockScreenNotification({
          title: `✨ Murakaza neza kuri Elimu Smart Assistant, ${salutation}!`,
          body: `Ubutumwa bw'ubwenge bwa buri munsi buzatangira kukugeraho no kuri Lock Screen ya telefoni yawe ugire umwuga unoze.`,
          tab: 'generator',
          tag: 'elimu-smart-welcome'
        });
        this.syncProfileWithServiceWorker();
        this.registerPeriodicBackgroundSync();
      }
      return result;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return 'denied';
    }
  }

  // Teacher Dedication Streak Tracking
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

  // Build real-time intelligent Teacher Context
  public getTeacherContext(): TeacherContext {
    let teacherName = '';
    let schoolName = '';
    let defaultSubject = '';
    let defaultClass = '';

    if (typeof window !== 'undefined') {
      try {
        const raw = localStorage.getItem('elimu360_school_profile');
        if (raw) {
          const profile = JSON.parse(raw);
          teacherName = profile.teacherName || '';
          schoolName = profile.schoolName || '';
          defaultSubject = profile.defaultSubject || '';
          defaultClass = profile.defaultClass || '';
        }
      } catch (e) {
        // Fallback gracefully
      }
    }

    const now = new Date();
    const dayOfWeek = now.getDay();

    return {
      teacherName,
      schoolName,
      defaultSubject,
      defaultClass,
      streakDays: this.getStreakCount(),
      dayOfWeek,
      dayNameRw: RW_DAY_NAMES[dayOfWeek],
      dayNameEn: EN_DAY_NAMES[dayOfWeek]
    };
  }

  // Delivery tracker for today
  public getDeliveredIdsToday(): string[] {
    if (typeof window === 'undefined') return [];
    const todayKey = 'elimu_smart_delivered_' + new Date().toISOString().split('T')[0];
    try {
      return JSON.parse(localStorage.getItem(todayKey) || '[]');
    } catch {
      return [];
    }
  }

  private markDeliveredToday(id: string) {
    if (typeof window === 'undefined') return;
    const todayKey = 'elimu_smart_delivered_' + new Date().toISOString().split('T')[0];
    const list = this.getDeliveredIdsToday();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(todayKey, JSON.stringify(list));
    }
    localStorage.setItem(LAST_DISPATCH_TIME_KEY, Date.now().toString());
  }

  // Notification history log
  public getNotificationLogs(): NotificationLogItem[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(localStorage.getItem('elimu_smart_history') || '[]');
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
      id: 'smart_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
      timestamp: Date.now(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    const updated = [newItem, ...history].slice(0, 40);
    localStorage.setItem('elimu_smart_history', JSON.stringify(updated));
    this.notifyListeners();
  }

  public markAllLogsAsRead() {
    if (typeof window === 'undefined') return;
    const history = this.getNotificationLogs().map(item => ({ ...item, read: true }));
    localStorage.setItem('elimu_smart_history', JSON.stringify(history));
    this.notifyListeners();
  }

  public getUnreadCount(): number {
    return this.getNotificationLogs().filter(n => !n.read).length;
  }

  // Native Lock Screen & System Tray Dispatcher
  public async sendLockScreenNotification(payload: {
    title: string;
    body: string;
    tab?: 'generator' | 'reb_library' | 'question_bank' | 'converter' | 'guide' | 'library' | 'home';
    tag?: string;
  }): Promise<boolean> {
    const perm = this.getPermission();
    const title = payload.title;
    const body = payload.body;
    const tab = payload.tab || 'generator';
    const tag = payload.tag || 'elimu-smart-' + Date.now();

    // Log to internal history
    this.addNotificationLog({ title, body, tab });

    if (perm !== 'granted') {
      // Permission not yet granted, trigger in-app toast
      this.dispatchInAppToast(title, body, tab);
      return false;
    }

    try {
      // Preferred Path: Through Service Worker registration (shows on lock screen on Android/iOS PWA/Windows/Mac)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (registration && registration.showNotification) {
          await registration.showNotification(title, {
            body,
            icon: '/pwa-icon.svg',
            badge: '/favicon.svg',
            tag,
            renotify: true,
            vibrate: [250, 100, 250, 100, 250],
            data: { tab, url: `/?tab=${tab}` }
          } as any);
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
      console.warn('Native notification fallback:', e);
      this.dispatchInAppToast(title, body, tab);
      return false;
    }
  }

  private dispatchInAppToast(title: string, body: string, tab: string) {
    if (typeof window === 'undefined') return;
    const event = new CustomEvent('elimu_inapp_toast', {
      detail: { title, body, tab }
    });
    window.dispatchEvent(event);
  }

  // Background Loop: Evaluates teacher reminders and spaced pool notifications
  private startSchedulerLoop() {
    if (typeof window === 'undefined') return;
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.checkSchedule();
    // Run checks every 30 seconds
    this.checkInterval = setInterval(() => {
      this.checkSchedule();
    }, 30000);
  }

  public checkSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    const delivered = this.getDeliveredIdsToday();
    const settings = this.getSettings();

    // 1. Process Teacher Custom Reminders (Exact matching on scheduled minute)
    const customReminders = this.getCustomReminders();
    for (const rem of customReminders) {
      if (!rem.enabled) continue;

      const matchesDay = rem.days.length === 0 || rem.days.includes(currentDay);
      if (!matchesDay) continue;

      const remMinutes = rem.hour * 60 + rem.minute;
      const currentMinutes = currentHour * 60 + currentMinute;
      const diff = currentMinutes - remMinutes;
      const customDeliveredKey = 'custom_' + rem.id;

      if (diff >= 0 && diff <= 10 && !delivered.includes(customDeliveredKey)) {
        this.markDeliveredToday(customDeliveredKey);
        this.sendLockScreenNotification({
          title: `⏰ ${rem.title}`,
          body: rem.body && rem.body.trim().length > 0 
            ? rem.body 
            : `Mwarimu, ni igihe cya ${rem.title}. Urwibutso rwawe bwa Elimu Smart Assistant.`,
          tab: rem.tab || 'home',
          tag: 'custom-rem-' + rem.id
        });
      }
    }

    // 2. Process Autonomous Spaced Notifications from the 240+ Pool
    // Restrict between 06:00 and 22:30 (Quiet hours: 22:30 to 06:00 to never disturb educator sleep)
    if (currentHour >= 23 || currentHour < 6) {
      return;
    }

    const lastDispatchRaw = localStorage.getItem(LAST_DISPATCH_TIME_KEY);
    const lastDispatchTime = lastDispatchRaw ? parseInt(lastDispatchRaw, 10) : 0;
    const timeSinceLastMs = Date.now() - lastDispatchTime;

    // Minimum interval between autonomous notifications: 35 minutes (2,100,000 ms)
    const MIN_INTERVAL_MS = 35 * 60 * 1000;
    if (timeSinceLastMs < MIN_INTERVAL_MS) {
      return;
    }

    // Determine current time window
    let windowKey: 'morning' | 'mid_morning' | 'noon' | 'afternoon' | 'evening' | 'night' = 'morning';
    if (currentHour >= 6 && currentHour < 9) windowKey = 'morning';
    else if (currentHour >= 9 && currentHour < 12) windowKey = 'mid_morning';
    else if (currentHour >= 12 && currentHour < 14) windowKey = 'noon';
    else if (currentHour >= 14 && currentHour < 18) windowKey = 'afternoon';
    else if (currentHour >= 18 && currentHour < 21) windowKey = 'evening';
    else windowKey = 'night';

    // Filter available pool by time window & category settings
    const pool = this.notificationPool.length > 0 ? this.notificationPool : STANDBY_POOL;
    const filtered = pool.filter(item => {
      // Feature toggles
      if (item.category === 'lesson_plan' && !settings.lessonPlanAlerts) return false;
      if (item.category === 'reb_book' && !settings.rebBooksAlerts) return false;
      if (item.category === 'question_bank' && !settings.questionBankAlerts) return false;
      if (item.category === 'converter' && !settings.converterAlerts) return false;
      if (item.category === 'streak' && !settings.streakEnabled) return false;

      // Window check
      return item.timeWindow === windowKey || item.timeWindow === 'anytime';
    });

    if (filtered.length === 0) return;

    // Filter out items already delivered today to prevent repetitive prompts
    let candidates = filtered.filter(item => !delivered.includes(item.id));
    if (candidates.length === 0) {
      // If all have been sent in this window, pick least recently delivered
      candidates = filtered;
    }

    const chosen = candidates[Math.floor(Math.random() * candidates.length)];
    if (!chosen) return;

    this.markDeliveredToday(chosen.id);

    const ctx = this.getTeacherContext();
    const salutation = getSalutation(ctx);
    const school = getSchoolMention(ctx);

    const title = chosen.title
      .replace(/{name}/g, salutation)
      .replace(/{school}/g, school)
      .replace(/{streak}/g, ctx.streakDays.toString());

    const body = chosen.body
      .replace(/{name}/g, salutation)
      .replace(/{school}/g, school)
      .replace(/{streak}/g, ctx.streakDays.toString());

    this.sendLockScreenNotification({
      title,
      body,
      tab: chosen.tab,
      tag: chosen.id
    });
  }

  // Get count of total pool notifications loaded
  public getPoolCount(): number {
    return this.notificationPool.length;
  }
}

export const notificationEngine = new NotificationEngine();

// Legacy compatibility export
export const ELIMU_SMART_SCHEDULE: SmartNotificationSlot[] = [
  {
    id: 'smart_slot_morning',
    hour: 7,
    minute: 0,
    focusTitle: "Gutegura Umunsi n'Isomo rya Mbere",
    category: 'lesson_plan',
    tab: 'generator',
    generateMessage: (ctx) => ({
      title: `🌅 Umunsi mwiza, ${getSalutation(ctx)}!`,
      body: `Amasomo y'uyu munsi arakwiteguye. Kora Lesson Plan yujuje ibisabwa na REB CBC ubu.`
    })
  }
];
