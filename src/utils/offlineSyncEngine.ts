import { syncDocToFirestore, FIRESTORE_COLLECTIONS } from '../lib/firestoreService';
import { AttendanceRecord, GradeEntry, StudentConductRecord } from '../types';

export interface OfflineSyncAction {
  id: string;
  type: 'ATTENDANCE_BATCH' | 'GRADE_BATCH' | 'CONDUCT_UPDATE';
  collection: string;
  payload: any;
  timestamp: string;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = 'elimu360_offline_action_queue';

class OfflineSyncEngine {
  private queue: OfflineSyncAction[] = [];
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<(status: { isOnline: boolean; pendingCount: number; lastSyncedAt?: string }) => void> = new Set();
  private lastSyncedAt?: string;
  private isSyncing: boolean = false;

  constructor() {
    this.loadQueue();
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.notify();
        this.processQueue();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
        this.notify();
      });
    }
  }

  private loadQueue() {
    try {
      const saved = localStorage.getItem(QUEUE_STORAGE_KEY);
      if (saved) {
        this.queue = JSON.parse(saved);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveQueue() {
    try {
      localStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(this.queue));
    } catch (err) {
      console.warn('Failed to save offline sync queue:', err);
    }
  }

  public subscribe(listener: (status: { isOnline: boolean; pendingCount: number; lastSyncedAt?: string }) => void) {
    this.listeners.add(listener);
    listener({
      isOnline: this.isOnline,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt
    });
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    const status = {
      isOnline: this.isOnline,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt
    };
    this.listeners.forEach(l => l(status));
  }

  public getStatus() {
    return {
      isOnline: this.isOnline,
      pendingCount: this.queue.length,
      lastSyncedAt: this.lastSyncedAt
    };
  }

  /**
   * Enqueue an offline action (or upload directly if online)
   */
  public async enqueue(action: Omit<OfflineSyncAction, 'id' | 'timestamp' | 'retryCount'>): Promise<boolean> {
    const fullAction: OfflineSyncAction = {
      ...action,
      id: `sync-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.queue.push(fullAction);
    this.saveQueue();
    this.notify();

    if (this.isOnline) {
      return this.processQueue();
    }
    return true;
  }

  /**
   * Process all queued operations
   */
  public async processQueue(): Promise<boolean> {
    if (this.isSyncing || this.queue.length === 0) return true;
    if (typeof navigator !== 'undefined' && !navigator.onLine) {
      this.isOnline = false;
      this.notify();
      return false;
    }

    this.isSyncing = true;
    const remaining: OfflineSyncAction[] = [];

    for (const item of this.queue) {
      try {
        if (item.type === 'ATTENDANCE_BATCH' && Array.isArray(item.payload)) {
          const records = item.payload as AttendanceRecord[];
          for (const rec of records) {
            await syncDocToFirestore(FIRESTORE_COLLECTIONS.ATTENDANCE, rec.id, { ...rec, offline_synced: true });
          }
        } else if (item.type === 'GRADE_BATCH' && Array.isArray(item.payload)) {
          const gradeEntries = item.payload as GradeEntry[];
          for (const g of gradeEntries) {
            await syncDocToFirestore(FIRESTORE_COLLECTIONS.GRADES, g.id, { ...g, offline_synced: true });
          }
        } else if (item.type === 'CONDUCT_UPDATE' && item.payload && item.payload.id) {
          await syncDocToFirestore(FIRESTORE_COLLECTIONS.STUDENT_CONDUCTS, item.payload.id, item.payload);
        } else if (item.collection && item.payload && item.payload.id) {
          await syncDocToFirestore(item.collection, item.payload.id, item.payload);
        }
      } catch (err) {
        console.warn(`Sync queue processing warning for ${item.id}:`, err);
        item.retryCount = (item.retryCount || 0) + 1;
        if (item.retryCount < 5) {
          remaining.push(item);
        }
      }
    }

    this.queue = remaining;
    this.saveQueue();
    this.lastSyncedAt = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    this.isSyncing = false;
    this.notify();

    return this.queue.length === 0;
  }

  /**
   * Force manual sync
   */
  public async forceSyncNow(): Promise<{ success: boolean; pendingRemaining: number }> {
    await this.processQueue();
    return {
      success: this.queue.length === 0,
      pendingRemaining: this.queue.length
    };
  }
}

export const offlineSyncEngine = new OfflineSyncEngine();
