import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  getDoc,
  deleteDoc,
  writeBatch,
  query,
  where,
  limit,
  startAfter,
  orderBy,
  getDocsFromCache,
  getDocsFromServer,
  getDocFromCache,
  getDocFromServer,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  WhereFilterOp,
  QueryConstraint
} from 'firebase/firestore';
import { db } from './firebase';

const CACHE_PREFIX = 'elimu360_sims_v3_';

export interface FirestoreErrorDetail {
  collection: string;
  message: string;
  code?: string;
  timestamp: string;
}

let lastFirestoreError: FirestoreErrorDetail | null = null;
const errorListeners = new Set<(err: FirestoreErrorDetail | null) => void>();

export function getFirestoreLastError(): FirestoreErrorDetail | null {
  return lastFirestoreError;
}

export function subscribeFirestoreErrors(callback: (err: FirestoreErrorDetail | null) => void) {
  errorListeners.add(callback);
  callback(lastFirestoreError);
  return () => {
    errorListeners.delete(callback);
  };
}

export function setFirestoreLastError(err: FirestoreErrorDetail | null) {
  lastFirestoreError = err;
  errorListeners.forEach(cb => {
    try {
      cb(lastFirestoreError);
    } catch {
      // Ignore listener callback errors
    }
  });
}

export const FIRESTORE_COLLECTIONS = {
  SCHOOLS: 'schools',
  USERS: 'users',
  STUDENTS: 'students',
  CLASSES: 'classes',
  SUBJECTS: 'subjects',
  TIMETABLES: 'timetables',
  TIMETABLE_CONFIGS: 'timetable_configs',
  GRADES: 'grades',
  ATTENDANCE: 'attendance',
  FEE_STRUCTURES: 'fee_structures',
  PAYMENTS: 'payments',
  DISCIPLINE_INCIDENTS: 'discipline_incidents',
  BOOKS: 'books',
  BORROW_RECORDS: 'borrow_records',
  PERMISSIONS: 'permissions',
  MATERIALS: 'materials',
  ASSIGNMENTS: 'assignments',
  ASSIGNMENT_SUBMISSIONS: 'assignment_submissions',
  NOTIFICATIONS: 'notifications',
  COMMUNICATION_MESSAGES: 'communication_messages',
  AUDIT_LOGS: 'audit_logs',
  EDUCATION_LEVELS: 'education_levels',
  TEACHER_ASSIGNMENTS: 'teacher_assignments',
  STUDENT_CONDUCTS: 'student_conducts',
  SPECIAL_CASES: 'special_cases'
} as const;

/**
 * Real-time Telemetry & Read Cost Tracker
 * Tracks server billable reads vs zero-cost cache hits
 */
export interface FirestoreReadMetrics {
  serverReads: number;
  cachedReads: number;
  writesCount: number;
  cacheHitRatio: number;
  lastUpdated: string;
}

const readMetrics: FirestoreReadMetrics = {
  serverReads: 0,
  cachedReads: 0,
  writesCount: 0,
  cacheHitRatio: 100,
  lastUpdated: new Date().toISOString()
};

function recordMetric(type: 'server' | 'cached' | 'write', count: number = 1): void {
  if (type === 'server') {
    readMetrics.serverReads += count;
  } else if (type === 'cached') {
    readMetrics.cachedReads += count;
  } else if (type === 'write') {
    readMetrics.writesCount += count;
  }
  const totalReads = readMetrics.serverReads + readMetrics.cachedReads;
  readMetrics.cacheHitRatio = totalReads > 0 ? Number(((readMetrics.cachedReads / totalReads) * 100).toFixed(1)) : 100;
  readMetrics.lastUpdated = new Date().toISOString();
}

export function getFirestoreReadStats(): FirestoreReadMetrics {
  return { ...readMetrics };
}

export function resetFirestoreReadStats(): void {
  readMetrics.serverReads = 0;
  readMetrics.cachedReads = 0;
  readMetrics.writesCount = 0;
  readMetrics.cacheHitRatio = 100;
  readMetrics.lastUpdated = new Date().toISOString();
}

/**
 * Deep sanitizer to remove undefined properties before sending to Firestore.
 * Firestore setDoc throws runtime exception if any property is undefined.
 */
export function sanitizeForFirestore<T>(obj: T): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Local Storage High-Speed Caching Helpers
 */
export function getLocalCache<T>(key: string, fallback?: T): T | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (!raw) return fallback ?? null;
    return JSON.parse(raw) as T;
  } catch {
    return fallback ?? null;
  }
}

export function setLocalCache<T>(key: string, data: T): void {
  try {
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(data));
  } catch (err) {
    console.warn(`Local cache write warning for ${key}:`, err);
  }
}

export function clearAllLocalCache(): void {
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && (k.startsWith(CACHE_PREFIX) || k.startsWith('elimu360_') || k.includes('cache_first'))) {
        keysToRemove.push(k);
      }
    }
    keysToRemove.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  } catch (err) {
    console.warn('Cache clear error:', err);
  }
}

// -----------------------------------------------------------------------------------------
// STRATEGY 1 & 2: DEFENSIVE CACHE-FIRST QUERIES & ONE-TIME FETCHES
// -----------------------------------------------------------------------------------------

export interface CacheFirstOptions {
  forceServer?: boolean;
  schoolId?: string;
  queryLimit?: number;
}

/**
 * Strategy 2: Fetch Collections with Server Accuracy
 * Queries Firestore (or server directly) so any document deletions performed in
 * Firebase Console are immediately recognized and never resurrected from stale cache.
 * Falls back to offline cache ONLY when network connectivity is lost.
 */
export async function fetchCollectionCacheFirst<T>(
  collectionName: string,
  options: CacheFirstOptions = {}
): Promise<T[]> {
  try {
    const colRef = collection(db, collectionName);
    const constraints: QueryConstraint[] = [];

    if (options.schoolId && options.schoolId !== 'all') {
      constraints.push(where('school_id', 'in', [options.schoolId, 'all']));
    }
    if (options.queryLimit && options.queryLimit > 0) {
      constraints.push(limit(options.queryLimit));
    }

    const q = constraints.length > 0 ? query(colRef, ...constraints) : colRef;

    // Fetch from server. When online, getDocs(q) checks server and syncs local cache.
    // If forceServer is true, strictly queries getDocsFromServer(q).
    const snapshot = options.forceServer 
      ? await getDocsFromServer(q) 
      : await getDocs(q);

    if (snapshot.empty) {
      // Genuinely empty on server: clear local cache to prevent deleted documents from resurrecting
      setLocalCache(collectionName, []);
      recordMetric('server', 0);
      return [];
    }

    const items = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as unknown as T));
    recordMetric('server', items.length);
    setLocalCache(collectionName, items);
    return items;
  } catch (error: any) {
    const errorDetail: FirestoreErrorDetail = {
      collection: collectionName,
      message: error?.message || 'Database query failed or timed out',
      code: error?.code,
      timestamp: new Date().toISOString()
    };
    setFirestoreLastError(errorDetail);
    console.warn(`Firestore query notice for ${collectionName} (falling back to offline cache):`, error);
    
    // Offline resilience: only return local cache if network/server is genuinely unreachable
    const local = getLocalCache<T[]>(collectionName);
    return local || [];
  }
}

/**
 * Strategy 1: One-Time Fetch for a Single Document (Cache-First)
 * Hits the local persistent cache first; falls back to server if needed.
 */
export async function fetchDocCacheFirst<T>(
  collectionName: string, 
  docId: string,
  forceServer: boolean = false
): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);

    if (!forceServer) {
      try {
        const cacheSnap = await getDocFromCache(docRef);
        if (cacheSnap.exists()) {
          recordMetric('cached', 1);
          return { id: cacheSnap.id, ...cacheSnap.data() } as unknown as T;
        }
      } catch {
        // Cache miss
      }
    }

    const serverSnap = forceServer ? await getDocFromServer(docRef) : await getDoc(docRef);
    if (serverSnap.exists()) {
      recordMetric('server', 1);
      return { id: serverSnap.id, ...serverSnap.data() } as unknown as T;
    }
    return null;
  } catch (error) {
    console.warn(`Doc cache-first notice for ${collectionName}/${docId}:`, error);
    return null;
  }
}

// -----------------------------------------------------------------------------------------
// STRATEGY 3: STRICT AGGRESSIVE PAGINATION (limit + startAfter)
// -----------------------------------------------------------------------------------------

export interface PaginationFilter {
  field: string;
  op: WhereFilterOp;
  value: any;
}

export interface PaginationOptions {
  pageSize?: number;
  lastDoc?: DocumentSnapshot | QueryDocumentSnapshot | null;
  schoolId?: string;
  orderByField?: string;
  orderDirection?: 'asc' | 'desc';
  whereFilters?: PaginationFilter[];
  forceServer?: boolean;
}

export interface PaginatedResult<T> {
  items: T[];
  lastDoc: QueryDocumentSnapshot | null;
  hasMore: boolean;
  count: number;
}

/**
 * Strategy 3: Paginated Query to prevent unbounded collection downloads.
 * Strictly limits read count to pageSize per user request.
 */
export async function fetchPaginatedCollection<T>(
  collectionName: string,
  options: PaginationOptions = {}
): Promise<PaginatedResult<T>> {
  const pageSize = options.pageSize || 25;
  const colRef = collection(db, collectionName);
  const constraints: QueryConstraint[] = [];

  // Filter by school if specified
  if (options.schoolId && options.schoolId !== 'all') {
    constraints.push(where('school_id', 'in', [options.schoolId, 'all']));
  }

  // Add custom where filters
  if (options.whereFilters && options.whereFilters.length > 0) {
    for (const f of options.whereFilters) {
      constraints.push(where(f.field, f.op, f.value));
    }
  }

  // Ordering
  if (options.orderByField) {
    constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
  }

  // Pagination cursor
  if (options.lastDoc) {
    constraints.push(startAfter(options.lastDoc));
  }

  // Strict page size limit (fetch + 1 to detect if there's a next page)
  constraints.push(limit(pageSize + 1));

  const q = query(colRef, ...constraints);

  try {
    let snapshot;
    if (!options.forceServer) {
      try {
        snapshot = await getDocsFromCache(q);
        if (snapshot.empty) {
          snapshot = await getDocs(q);
          recordMetric('server', snapshot.docs.length);
        } else {
          recordMetric('cached', snapshot.docs.length);
        }
      } catch {
        snapshot = await getDocs(q);
        recordMetric('server', snapshot.docs.length);
      }
    } else {
      snapshot = await getDocsFromServer(q);
      recordMetric('server', snapshot.docs.length);
    }

    const docs = snapshot.docs;
    const hasMore = docs.length > pageSize;
    const pageDocs = hasMore ? docs.slice(0, pageSize) : docs;
    const items = pageDocs.map(d => ({ id: d.id, ...d.data() } as unknown as T));
    const newLastDoc = pageDocs.length > 0 ? pageDocs[pageDocs.length - 1] : null;

    return {
      items,
      lastDoc: newLastDoc,
      hasMore,
      count: items.length
    };
  } catch (error) {
    console.warn(`Pagination query notice for ${collectionName}:`, error);
    return {
      items: [],
      lastDoc: null,
      hasMore: false,
      count: 0
    };
  }
}

// -----------------------------------------------------------------------------------------
// STRATEGY 4: DATA BUNDLE & SHARED CONFIG CACHING (Zero Reads for Global Tables)
// -----------------------------------------------------------------------------------------

const staticConfigMemoryCache = new Map<string, { data: any; cachedAt: number }>();
const STATIC_CACHE_TTL_MS = 1000 * 60 * 60; // 1 hour TTL for static configuration

/**
 * Strategy 4: High-efficiency Static Config Loader
 * Eliminates redundant reads for global tables (education levels, grading scales, subjects)
 */
export async function loadStaticConfigTable<T>(
  collectionName: string,
  forceRefresh: boolean = false
): Promise<T[]> {
  const now = Date.now();
  const cached = staticConfigMemoryCache.get(collectionName);

  if (!forceRefresh && cached && (now - cached.cachedAt) < STATIC_CACHE_TTL_MS) {
    recordMetric('cached', Array.isArray(cached.data) ? cached.data.length : 1);
    return cached.data as T[];
  }

  // Load cache-first
  const items = await fetchCollectionCacheFirst<T>(collectionName, { forceServer: forceRefresh });
  if (items && items.length > 0) {
    staticConfigMemoryCache.set(collectionName, { data: items, cachedAt: now });
  }
  return items;
}

// -----------------------------------------------------------------------------------------
// STRATEGY 5: DATA SPLITTING & ON-DEMAND SUB-DOCUMENT RETRIEVAL
// -----------------------------------------------------------------------------------------

/**
 * Strategy 5: On-Demand Detailed Record Fetcher
 * Loads sub-records (e.g. extensive student grades or discipline incident details) only when selected
 */
export async function fetchDocumentSubDetailsOnDemand<T>(
  parentCollection: string,
  parentId: string,
  subCollectionName: string
): Promise<T[]> {
  try {
    const subColRef = collection(db, parentCollection, parentId, subCollectionName);
    const snap = await getDocs(subColRef);
    recordMetric('server', snap.docs.length);
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as unknown as T));
  } catch (err) {
    console.warn(`Sub-collection fetch notice for ${parentCollection}/${parentId}/${subCollectionName}:`, err);
    return [];
  }
}

// -----------------------------------------------------------------------------------------
// WRITE & MUTATION OPERATIONS (Strict Sanitization + Targeted Single Writes)
// -----------------------------------------------------------------------------------------

/**
 * High-caching document sync helper
 * Saves immediately to local state and performs single targeted write to Firestore.
 */
export async function syncDocToFirestore(collectionName: string, docId: string, data: any): Promise<void> {
  try {
    const sanitized = sanitizeForFirestore({
      ...data,
      id: docId,
      updated_at: new Date().toISOString()
    });
    const docRef = doc(db, collectionName, docId);
    await setDoc(docRef, sanitized, { merge: true });
    recordMetric('write', 1);
  } catch (error) {
    console.warn(`Firestore sync warning for ${collectionName}/${docId}:`, error);
  }
}

/**
 * High-performance Batch Sync for multiple records using writeBatch
 */
export async function batchSyncDocsToFirestore(
  collectionName: string, 
  items: Array<{ id: string; [key: string]: any }>
): Promise<void> {
  if (!items || items.length === 0) return;
  try {
    const CHUNK_SIZE = 400; // Firestore maximum limit is 500 ops per commit
    for (let i = 0; i < items.length; i += CHUNK_SIZE) {
      const chunk = items.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const item of chunk) {
        if (!item || !item.id) continue;
        const sanitized = sanitizeForFirestore({
          ...item,
          updated_at: new Date().toISOString()
        });
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, sanitized, { merge: true });
      }
      await batch.commit();
      recordMetric('write', chunk.length);
    }
  } catch (error) {
    console.error(`Firestore batch sync error for ${collectionName}:`, error);
  }
}

/**
 * Batch delete helper using writeBatch
 */
export async function batchDeleteDocsFromFirestore(
  collectionName: string, 
  docIds: string[]
): Promise<void> {
  if (!docIds || docIds.length === 0) return;
  try {
    const CHUNK_SIZE = 400;
    for (let i = 0; i < docIds.length; i += CHUNK_SIZE) {
      const chunk = docIds.slice(i, i + CHUNK_SIZE);
      const batch = writeBatch(db);
      for (const id of chunk) {
        if (!id) continue;
        const docRef = doc(db, collectionName, id);
        batch.delete(docRef);
      }
      await batch.commit();
      recordMetric('write', chunk.length);
    }
  } catch (error) {
    console.error(`Firestore batch delete error for ${collectionName}:`, error);
  }
}

/**
 * Backward compatibility alias for one-time collection fetch (Cache-First by default)
 */
export async function fetchCollectionFromFirestore<T>(collectionName: string, forceServer: boolean = false): Promise<T[]> {
  return fetchCollectionCacheFirst<T>(collectionName, { forceServer });
}

export async function fetchSingleDocFromFirestore<T>(collectionName: string, docId: string, forceServer: boolean = false): Promise<T | null> {
  return fetchDocCacheFirst<T>(collectionName, docId, forceServer);
}

export async function updateUserInFirestore(userId: string, updates: Record<string, any>): Promise<void> {
  try {
    const sanitized = sanitizeForFirestore({
      ...updates,
      updated_at: new Date().toISOString()
    });
    const userRef = doc(db, 'users', userId);
    await setDoc(userRef, sanitized, { merge: true });
    recordMetric('write', 1);
  } catch (error) {
    console.warn(`Firestore user update warning for ${userId}:`, error);
  }
}

export async function syncUserToFirestore(user: Record<string, any>): Promise<void> {
  try {
    const sanitized = sanitizeForFirestore({
      ...user,
      id: user.id,
      updated_at: new Date().toISOString()
    });
    const userRef = doc(db, 'users', user.id);
    await setDoc(userRef, sanitized, { merge: true });
    recordMetric('write', 1);
  } catch (error) {
    console.warn(`Firestore user sync warning for ${user.id}:`, error);
  }
}

export async function deleteDocFromFirestore(collectionName: string, docId: string): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
    recordMetric('write', 1);
  } catch (error) {
    console.warn(`Firestore delete warning for ${collectionName}/${docId}:`, error);
  }
}
