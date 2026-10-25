// Elimu Smart Notification System
// Intelligent, contextual, and deeply personalized teacher assistant
// Dispatches smart notifications to Native Lock Screen, Mobile Shade, and In-App Assistant.

export interface SmartNotificationSlot {
  id: string;
  hour: number;
  minute: number;
  focusTitle: string;
  category: 'lesson_plan' | 'reb_book' | 'streak' | 'question_bank' | 'converter' | 'motivation' | 'wrap_up';
  tab: 'generator' | 'reb_library' | 'question_bank' | 'converter' | 'guide' | 'library';
  // Dynamic generator function that produces varied, human, personal messages
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
function getSalutation(ctx: TeacherContext): string {
  if (ctx.teacherName && ctx.teacherName.trim().length > 0) {
    const cleanName = ctx.teacherName.trim();
    if (cleanName.toLowerCase().startsWith('mwarimu') || cleanName.toLowerCase().startsWith('teacher')) {
      return cleanName;
    }
    return `Mwarimu ${cleanName}`;
  }
  return "Mwarimu w'icyubahiro";
}

function getSchoolMention(ctx: TeacherContext): string {
  if (ctx.schoolName && ctx.schoolName.trim().length > 0) {
    return `muri ${ctx.schoolName.trim()}`;
  }
  return "mu ishuri ryawe";
}

// 12 Smart Teacher Milestones across the 24-hour cycle with rich contextual variety
export const ELIMU_SMART_SCHEDULE: SmartNotificationSlot[] = [
  // 1. Early Morning (06:45) - Personalized Wake-Up & Daily Readiness
  {
    id: 'smart_slot_0645',
    hour: 6,
    minute: 45,
    focusTitle: "Gutegura Umunsi n'Isomo rya Mbere",
    category: 'lesson_plan',
    tab: 'generator',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const school = getSchoolMention(ctx);
      const variants = [
        {
          title: `🌅 Umunsi mwiza, ${salutation}!`,
          body: `${ctx.dayNameRw} gitangiye neza! Tegura Lesson Plan yawe y'uyu munsi ${school} mu masegonda 30 gusa utazagira umunaniro mu ishuri.`
        },
        {
          title: `☀️ ${salutation}, uburere bw'u Rwanda buragushimiye!`,
          body: `Umunsi mushya w'amasomo utangiye neza. Gira ituze witegure hakiri kare ukoresheje Elimu Smart Assistant.`
        },
        {
          title: `✨ Gutangira neza ${ctx.dayNameRw}, ${salutation}!`,
          body: `Amasomo y'uyu munsi arakwiteguye. Kora Lesson Plan yujuje ibisabwa na REB CBC ubu uhe abanyeshuri ubumenyi bunoze.`
        }
      ];
      return variants[(ctx.dayOfWeek + ctx.streakDays) % variants.length];
    }
  },

  // 2. Morning Class Bell (08:00) - REB CBC Curriculum Textbooks & Guides
  {
    id: 'smart_slot_0800',
    hour: 8,
    minute: 0,
    focusTitle: "Ibitabo n'Imfashanyigisho bya REB",
    category: 'reb_book',
    tab: 'reb_library',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const subject = ctx.defaultSubject ? `ku isomo rya ${ctx.defaultSubject}` : "ku masomo yose";
      const variants = [
        {
          title: `📚 Ibitabo bya REB CBC biri ku buntu, ${salutation}`,
          body: `Waba ukeneye Textbook cyangwa Teacher's Guide ${subject}? Manura ibitabo 1,806 bifite ikimenyetso cy'ishuri ryawe ubu.`
        },
        {
          title: `📖 Imfashanyigisho zigezweho za REB 1806`,
          body: `${salutation}, ibitabo byose by'amashuri abanza n'ayisumbuye biri muri Library yacu. Bimanure mu minota mike gusa kuri telefoni.`
        }
      ];
      return variants[ctx.dayOfWeek % variants.length];
    }
  },

  // 3. Mid-Morning Engagement (09:30) - Teacher Dedication & Momentum
  {
    id: 'smart_slot_0930',
    hour: 9,
    minute: 30,
    focusTitle: "Ubwitange n'Umuhati w'Umwuga",
    category: 'streak',
    tab: 'generator',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const variants = [
        {
          title: `🔥 Iminsi ${ctx.streakDays} y'Ubwitange bwawe, ${salutation}!`,
          body: `Umuhati ugira mu burezi urigaragaza cyane. Komeza uyu murongo mwiza w'ubuhanga mu myigishirize yawe ya buri munsi.`
        },
        {
          title: `🌟 ${salutation}, urabikora neza cyane!`,
          body: `Abanyeshuri bawe bafite mwarimu w'indashyikirwa. Reba indi mirongo y'amasomo yiteguye neza muri Elimu360.`
        }
      ];
      return variants[(ctx.streakDays) % variants.length];
    }
  },

  // 4. Late Morning Evaluation (11:00) - Question Bank (3,200+ Questions)
  {
    id: 'smart_slot_1100',
    hour: 11,
    minute: 0,
    focusTitle: "Question Bank & Isuzumabumenyi",
    category: 'question_bank',
    tab: 'question_bank',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const variants = [
        {
          title: `💡 Urakeneye ibibazo by'isuzuma, ${salutation}?`,
          body: `Question Bank yacu ifite ibibazo birenga 3,200 bya CBC bifite ibisubizo n'akaraso k'ikosora. Manura ikizamini ako kanya!`
        },
        {
          title: `📝 Isuzumabumenyi ry'abanyeshuri uyu munsi`,
          body: `${salutation}, suzuma aho abanyeshuri bageze kuri competence-based indicators ukoresheje imyitozo iteguye muri Question Bank.`
        }
      ];
      return variants[ctx.dayOfWeek % variants.length];
    }
  },

  // 5. Lunch & Midday Rest (12:30) - Schemes of Work & Time-Saving Prep
  {
    id: 'smart_slot_1230',
    hour: 12,
    minute: 30,
    focusTitle: "Akaruhuko ka Saa Sita & Schemes of Work",
    category: 'lesson_plan',
    tab: 'reb_library',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const variants = [
        {
          title: `☕ Akaruhuko keza ka saa sita, ${salutation}!`,
          body: `Fata umwanya wo kuruhuka. Niba ukeneye Schemes of Work z'icyumweru cyose, uzisanga ziteguye muri library yacu.`
        },
        {
          title: `🍲 Saa sita nziza, ${salutation}!`,
          body: `Kwigisha bisaba imbaraga n'umutima mwiza. Ruhuka neza, amakuru n'amasomo byose bibitswe neza kuri konti yawe.`
        }
      ];
      return variants[(ctx.dayOfWeek + 1) % variants.length];
    }
  },

  // 6. Early Afternoon Tools (14:00) - Document Converter (PDF to Word)
  {
    id: 'smart_slot_1400',
    hour: 14,
    minute: 0,
    focusTitle: "Universal Document Converter",
    category: 'converter',
    tab: 'converter',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const variants = [
        {
          title: `📄 Hindura inyandiko zawe, ${salutation}!`,
          body: `Ufite ibizamini bishaje cyangwa notes za PDF ushaka gukosora muri Word? Koresha Universal Converter y'ubuntu ubu.`
        },
        {
          title: `⚡ Ubuhanga bwo guhindura PDF muri Word`,
          body: `${salutation}, ntugakenera kongera kwandika ibizamini bushya. Bishyire muri Converter bihinduke muri Word mu masegonda.`
        }
      ];
      return variants[ctx.dayOfWeek % variants.length];
    }
  },

  // 7. Afternoon Class Support (15:45) - Active Learning & CBC Guidance
  {
    id: 'smart_slot_1545',
    hour: 15,
    minute: 45,
    focusTitle: "Imyigishirize Ishingiye ku Bushobozi (CBC)",
    category: 'motivation',
    tab: 'guide',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const variants = [
        {
          title: `🎯 Amasomo yo ku gicamunsi, ${salutation}!`,
          body: `Ese abanyeshuri bishimiye isomo rya none? Reba inama z'uburyo bwo guhuza amasomo n'ubushobozi fatizo bwa CBC mu Guide yacu.`
        },
        {
          title: `🌱 Guteza imbere ubushobozi bw'abanyeshuri`,
          body: `${salutation}, buri munsi uha abana b'u Rwanda ubumenyi butagira igiciro. Elimu360 iri kumwe nawe mu rugendo rwose.`
        }
      ];
      return variants[(ctx.dayOfWeek + 2) % variants.length];
    }
  },

  // 8. End of School Day (17:15) - Relaxed Prep for Tomorrow
  {
    id: 'smart_slot_1715',
    hour: 17,
    minute: 15,
    focusTitle: "Gutegura Amasomo y'Ejo Hakiri Kare",
    category: 'lesson_plan',
    tab: 'generator',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const tomorrowName = RW_DAY_NAMES[(ctx.dayOfWeek + 1) % 7];
      const variants = [
        {
          title: `⏰ ${salutation}, ejo ${tomorrowName} uzigisha iki?`,
          body: `Ntuzatungurwe mu gitondo. Fata iminota 2 gusa ubu ukore Lesson Plan y'ejo, uze kurara utekanye 100%.`
        },
        {
          title: `🏡 Amasomo ararangiye, ${salutation}!`,
          body: `Ukoze neza uyu munsi. Mbere y'uko urangiza umunsi, tegura isomo ry'ejo hakiri kare kugira ngo ejo mu gitondo uzagere mu ishuri utuje.`
        }
      ];
      return variants[ctx.dayOfWeek % variants.length];
    }
  },

  // 9. Evening Library Access (19:00) - Whole Class Batch Downloads
  {
    id: 'smart_slot_1900',
    hour: 19,
    minute: 0,
    focusTitle: "Kumanura Ibitabo by'Ishuri Byose (ZIP)",
    category: 'reb_book',
    tab: 'reb_library',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const school = getSchoolMention(ctx);
      const variants = [
        {
          title: `📦 Manura ibitabo byose by'umwaka (Batch ZIP)`,
          body: `${salutation}, ushobora kumanura ibitabo bya P1 kugeza S3 byose icyarimwe muri ZIP imwe ifite ikimenyetso ${school}.`
        },
        {
          title: `📚 Isomero ryuzuye ry'ibitabo bya REB ku buntu`,
          body: `Gira isomero ryuzuye kuri telefoni cyangwa mudasobwa yawe udatakaje amafaranga na make. Sangiza n'abandi barimu!`
        }
      ];
      return variants[(ctx.dayOfWeek + 3) % variants.length];
    }
  },

  // 10. Community & Teacher Recognition (20:15) - Professional Esteem
  {
    id: 'smart_slot_2015',
    hour: 20,
    minute: 15,
    focusTitle: "Mwarimu w'Indashyikirwa",
    category: 'motivation',
    tab: 'library',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const variants = [
        {
          title: `🏆 Urakoze ku bwitange bwawe, ${salutation}!`,
          body: `Abarimu barenga 24,000 bakoresha Elimu360 bishimira umwuga w'uburezi. Amasomo wateguye abitswe neza muri Saved Plans.`
        },
        {
          title: `⭐ Mwarimu w'Icyitegererezo mu Burezi`,
          body: `${salutation}, kera byafataga amasaha gutegura amasomo, none ubikora mu masegonda. Komeza kuba indashyikirwa!`
        }
      ];
      return variants[ctx.dayOfWeek % variants.length];
    }
  },

  // 11. Peaceful Night Wind-Down (21:30) - Rest & Care
  {
    id: 'smart_slot_2130',
    hour: 21,
    minute: 30,
    focusTitle: "Kuryama Utekanye & Uruhushya",
    category: 'wrap_up',
    tab: 'generator',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const school = getSchoolMention(ctx);
      const variants = [
        {
          title: `🌙 Ijoro ryiza, ${salutation}!`,
          body: `Ukoze imirimo myiza ${school} uyu munsi. Ryama utekanye uzi ko ibyo gukora byose byateguwe neza. Ijoro ryiza cyane!`
        },
        {
          title: `✨ Kuruhuka neza Mwarimu dukunda`,
          body: `${salutation}, ubwonko n'umubiri birakeneye kuruhuka. Elimu360 irakwifuriza ijoro ryiza n'amasomo meza y'ejo.`
        }
      ];
      return variants[(ctx.dayOfWeek + 4) % variants.length];
    }
  },

  // 12. Gentle Late Safeguard (22:45) - Next Day Serenity
  {
    id: 'smart_slot_2245',
    hour: 22,
    minute: 45,
    focusTitle: "Gufunga Umunsi mu Mutuzo",
    category: 'wrap_up',
    tab: 'generator',
    generateMessage: (ctx) => {
      const salutation = getSalutation(ctx);
      const variants = [
        {
          title: `🌌 Umunsi urarangiye mu mahoro, ${salutation}`,
          body: `Gahunda zose z'ejo zimeze neza. Elimu Smart Assistant izakuburira ejo mu gitondo hakiri kare. Uruhuke neza!`
        },
        {
          title: `💤 Ryama utuje, ${salutation}`,
          body: `Elimu360 igushimiye umuhati ugira mu burezi bw'u Rwanda. Dusangiye urugendo rw'ubwenge buri munsi.`
        }
      ];
      return variants[ctx.dayOfWeek % variants.length];
    }
  }
];

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

class NotificationEngine {
  private listeners: Array<() => void> = [];
  private checkInterval: any = null;

  constructor() {
    this.updateStreak();
    this.startSchedulerLoop();
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
    const updated = [newItem, ...history].slice(0, 30);
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

  // Background Loop: Checks if any of the 12 daily schedule slots matches current time
  private startSchedulerLoop() {
    if (typeof window === 'undefined') return;
    if (this.checkInterval) clearInterval(this.checkInterval);

    this.checkSchedule();
    this.checkInterval = setInterval(() => {
      this.checkSchedule();
    }, 30000);
  }

  private checkSchedule() {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentDay = now.getDay();
    const delivered = this.getDeliveredIdsToday();
    const settings = this.getSettings();

    // 1. Process Elimu Smart Timetable (12 slots)
    for (const slot of ELIMU_SMART_SCHEDULE) {
      // Check feature settings toggles
      if (slot.category === 'lesson_plan' && !settings.lessonPlanAlerts) continue;
      if (slot.category === 'reb_book' && !settings.rebBooksAlerts) continue;
      if (slot.category === 'question_bank' && !settings.questionBankAlerts) continue;
      if (slot.category === 'converter' && !settings.converterAlerts) continue;

      const slotMinutes = slot.hour * 60 + slot.minute;
      const currentMinutes = currentHour * 60 + currentMinute;
      const diff = currentMinutes - slotMinutes;

      if (diff >= 0 && diff <= 15 && !delivered.includes(slot.id)) {
        this.markDeliveredToday(slot.id);
        const ctx = this.getTeacherContext();
        const msg = slot.generateMessage(ctx);

        this.sendLockScreenNotification({
          title: msg.title,
          body: msg.body,
          tab: slot.tab,
          tag: slot.id
        });
      }
    }

    // 2. Process Teacher Custom Reminders (Staff meetings, grading, duty, etc.)
    const customReminders = this.getCustomReminders();
    for (const rem of customReminders) {
      if (!rem.enabled) continue;

      // Check day matching
      const matchesDay = rem.days.length === 0 || rem.days.includes(currentDay);
      if (!matchesDay) continue;

      const remMinutes = rem.hour * 60 + rem.minute;
      const currentMinutes = currentHour * 60 + currentMinute;
      const diff = currentMinutes - remMinutes;
      const customDeliveredKey = 'custom_' + rem.id;

      if (diff >= 0 && diff <= 15 && !delivered.includes(customDeliveredKey)) {
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
  }
}

export const notificationEngine = new NotificationEngine();
