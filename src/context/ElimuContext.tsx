import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import bcrypt from 'bcryptjs';
import { 
  School, 
  CurriculumType,
  User, 
  UserRole, 
  Student, 
  ClassRoom, 
  Subject, 
  TimetableSlot, 
  GradeEntry, 
  AttendanceRecord, 
  FeeStructure, 
  PaymentRecord, 
  FeeCategory, 
  PaymentMethod,
  DisciplineIncident, 
  LibraryBook, 
  LibraryBorrowRecord, 
  PermissionExitRecord, 
  ELearningMaterial, 
  Assignment, 
  AssignmentSubmission,
  CommunicationMessage, 
  NotificationLog, 
  AuditLog,
  StaffRegistrationPayload,
  SchoolRegistrationPayload,
  SchoolEducationLevel,
  TeacherAssignment,
  StudentConductRecord,
  TimetableConfig,
  BreakSlotConfig,
  AssessmentType,
  StudentReportCard,
  SubjectReportGrade,
  RecordedAssessmentScore,
  AnnualSubjectGrade,
  AcademicYearConfig,
  ArchivedClass,
  SpecialCaseRecord,
  SchoolOnboardingSurvey,
  StudentPaymentStatus,
  StudentFeeLedger,
  SchoolFinancialSummary
} from '../types';
import { 
  calculateRwandanGradeLetter, 
  getPrePrimaryQualitativeComment, 
  isPrePrimaryLevel,
  generateClassReportCards
} from '../utils/reportCardGenerator';
import { 
  DEFAULT_TIMETABLE_CONFIG,
  generateConflictFreeTimetable,
  TimetableGenerationResult
} from '../utils/timetableEngine';
import { 
  INITIAL_SCHOOLS, 
  INITIAL_USERS, 
  INITIAL_CLASSES, 
  INITIAL_SUBJECTS, 
  INITIAL_STUDENTS, 
  INITIAL_FEE_STRUCTURES, 
  INITIAL_PAYMENTS, 
  INITIAL_GRADES, 
  INITIAL_ATTENDANCE, 
  INITIAL_TIMETABLE, 
  INITIAL_DISCIPLINE, 
  INITIAL_BOOKS, 
  INITIAL_BORROWS, 
  INITIAL_PERMISSIONS, 
  INITIAL_MATERIALS, 
  INITIAL_ASSIGNMENTS, 
  INITIAL_SUBMISSIONS,
  INITIAL_MESSAGES, 
  INITIAL_NOTIFICATIONS, 
  INITIAL_AUDIT_LOGS,
  DEFAULT_EDUCATION_LEVELS,
  INITIAL_EDUCATION_LEVELS,
  INITIAL_TEACHER_ASSIGNMENTS,
  INITIAL_CONDUCT_RECORDS
} from '../data/initialData';
import { 
  syncDocToFirestore, 
  batchSyncDocsToFirestore,
  batchDeleteDocsFromFirestore,
  updateUserInFirestore, 
  syncUserToFirestore,
  fetchCollectionCacheFirst,
  loadStaticConfigTable,
  deleteDocFromFirestore,
  FIRESTORE_COLLECTIONS,
  getLocalCache, 
  setLocalCache,
  clearAllLocalCache,
  getFirestoreReadStats,
  FirestoreReadMetrics
} from '../lib/firestoreService';
import { firebaseConfig } from '../lib/firebase';
import { offlineSyncEngine } from '../utils/offlineSyncEngine';

/**
 * Deterministic Grade & Assessment Deduplication Helpers
 * Rule: No test of the same lesson (subject), same name (assessment_type),
 * and same period (period_number + term) can be recorded as two separate records.
 * It must be recorded as one and the same.
 */
export function getGradeRecordKey(g: {
  student_id: string;
  subject_id: string;
  assessment_type: string;
  period_number?: number;
  term?: string;
  academic_year?: string;
}): string {
  const sId = (g.student_id || '').trim();
  const subId = (g.subject_id || '').trim().toLowerCase();
  const type = (g.assessment_type || 'Test').trim().toLowerCase();
  const period = Number(g.period_number) || 1;
  const term = (g.term || 'Term 1').trim().toLowerCase();
  const year = (g.academic_year || '2026').trim();
  return `${sId}__${subId}__${type}__p${period}__${term}__${year}`;
}

export function getCanonicalGradeDocId(g: {
  school_id: string;
  student_id: string;
  subject_id: string;
  assessment_type: string;
  period_number?: number;
  term?: string;
  academic_year?: string;
}): string {
  const sch = (g.school_id || 'sch').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const sId = (g.student_id || 'std').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const subId = (g.subject_id || 'sub').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const type = (g.assessment_type || 'test').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const period = Number(g.period_number) || 1;
  const term = (g.term || 'term1').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  const year = (g.academic_year || '2026').trim().replace(/[^a-zA-Z0-9_-]/g, '_');
  return `grd_${sch}_${sId}_${subId}_${type}_p${period}_${term}_${year}`;
}

export function deduplicateGradesList(rawGrades: GradeEntry[]): {
  deduped: GradeEntry[];
  duplicateDocIds: string[];
} {
  const map = new Map<string, GradeEntry>();
  const duplicateDocIds: string[] = [];

  for (const g of rawGrades) {
    if (!g || !g.student_id || !g.subject_id) continue;
    const key = getGradeRecordKey(g);
    if (!map.has(key)) {
      map.set(key, g);
    } else {
      const existing = map.get(key)!;
      const gMarks = Number(g.marks) || 0;
      const exMarks = Number(existing.marks) || 0;
      const gDate = g.entered_at || '';
      const exDate = existing.entered_at || '';

      // Retain the record with real marks or the newer entry
      if (gDate > exDate || (gMarks > 0 && exMarks === 0)) {
        duplicateDocIds.push(existing.id);
        map.set(key, g);
      } else {
        duplicateDocIds.push(g.id);
      }
    }
  }

  return {
    deduped: Array.from(map.values()),
    duplicateDocIds
  };
}

/**
 * Generates a unique school code based on the abbreviation of the institution's name.
 * If another school shares the abbreviation, structures it with a numeric sequence (e.g. KICA-01, KICA-02).
 */
export function generateUniqueSchoolCodeHelper(
  name?: string | null, 
  existingSchools: School[] = [], 
  excludeSchoolId?: string
): string {
  if (!name || typeof name !== 'string' || !name.trim()) return 'SCH';

  try {
    const cleanName = name.trim().replace(/[^\w\s]/gi, '');
    const words = cleanName.split(/\s+/).filter(w => w.length > 0);

    // Common stop words to exclude when there are multiple words
    const stopWords = new Set(['OF', 'AND', 'THE', 'FOR', 'IN', 'AT', 'TO', 'A', 'AN', 'DU', 'DE', 'ET', 'DES', 'LE', 'LA', 'LES']);
    const meaningfulWords = words.length > 2 
      ? words.filter(w => !stopWords.has(w.toUpperCase()))
      : words;

    const targetWords = meaningfulWords.length > 0 ? meaningfulWords : words;

    let baseAbbr = '';
    if (targetWords.length === 0) {
      baseAbbr = 'SCH';
    } else if (targetWords.length === 1) {
      const single = targetWords[0].toUpperCase();
      baseAbbr = single.length <= 4 ? single : single.slice(0, 4);
    } else if (targetWords.length === 2) {
      const w1 = targetWords[0].toUpperCase();
      const w2 = targetWords[1].toUpperCase();
      if (w1.length >= 1 && w2.length >= 2) {
        baseAbbr = (w1.charAt(0) + w2.slice(0, 2)).slice(0, 4);
      } else {
        baseAbbr = (w1.slice(0, 2) + w2.slice(0, 2)).slice(0, 4);
      }
    } else {
      // 3 or more words e.g. "Kigali International Community Academy" -> "KICA"
      baseAbbr = targetWords.map(w => w.charAt(0).toUpperCase()).join('').slice(0, 6);
    }

    if (!baseAbbr || baseAbbr.length < 2) {
      baseAbbr = (cleanName.replace(/\s+/g, '').toUpperCase().slice(0, 3)) || 'SCH';
    }

    const schoolsList = Array.isArray(existingSchools) ? existingSchools : [];
    const existingCodes = new Set(
      schoolsList
        .filter(s => s && s.code && (!excludeSchoolId || s.id !== excludeSchoolId))
        .map(s => String(s.code).toUpperCase())
    );

    // If base abbreviation is unique, use it directly
    if (!existingCodes.has(baseAbbr)) {
      return baseAbbr;
    }

    // If already taken, structure it uniquely with numbers
    let counter = 1;
    while (counter <= 999) {
      const candidate = `${baseAbbr}-${counter < 10 ? '0' + counter : counter}`;
      if (!existingCodes.has(candidate)) {
        return candidate;
      }
      counter++;
    }

    return `${baseAbbr}-${Date.now().toString().slice(-4)}`;
  } catch (err) {
    console.error('Error generating school code abbreviation:', err);
    return 'SCH';
  }
}

// Backward-compatible alias
export const generateUniqueSchoolCode = generateUniqueSchoolCodeHelper;

/**
 * Calculates a numerical sequence weight for classes to guarantee ascending ordering
 * from Pre-Primary -> Primary 1..6 -> Senior 1..3 (O-Level) -> Senior 4..6 (A-Level).
 * Accounts for multiple streams (e.g. A, B, C, PCM, MCB).
 */
export function getGradeAscendingWeight(gradeOrName: string, stream: string = 'A'): number {
  const clean = (gradeOrName || '').toLowerCase().trim();
  let baseWeight = 50;

  if (clean.includes('baby') || clean.includes('nursery 1') || clean.includes('pre-p1')) baseWeight = 1;
  else if (clean.includes('middle') || clean.includes('nursery 2') || clean.includes('pre-p2')) baseWeight = 2;
  else if (clean.includes('top') || clean.includes('nursery 3') || clean.includes('pre-p3')) baseWeight = 3;
  else if (clean.includes('primary 1') || clean.includes('p1') || clean.includes('p.1') || clean.includes('grade 1')) baseWeight = 4;
  else if (clean.includes('primary 2') || clean.includes('p2') || clean.includes('p.2') || clean.includes('grade 2')) baseWeight = 5;
  else if (clean.includes('primary 3') || clean.includes('p3') || clean.includes('p.3') || clean.includes('grade 3')) baseWeight = 6;
  else if (clean.includes('primary 4') || clean.includes('p4') || clean.includes('p.4') || clean.includes('grade 4')) baseWeight = 7;
  else if (clean.includes('primary 5') || clean.includes('p5') || clean.includes('p.5') || clean.includes('grade 5')) baseWeight = 8;
  else if (clean.includes('primary 6') || clean.includes('p6') || clean.includes('p.6') || clean.includes('grade 6')) baseWeight = 9;
  else if (clean.includes('senior 1') || clean.includes('s1') || clean.includes('s.1') || clean.includes('form 1') || clean.includes('grade 7')) baseWeight = 10;
  else if (clean.includes('senior 2') || clean.includes('s2') || clean.includes('s.2') || clean.includes('form 2') || clean.includes('grade 8')) baseWeight = 11;
  else if (clean.includes('senior 3') || clean.includes('s3') || clean.includes('s.3') || clean.includes('form 3') || clean.includes('grade 9')) baseWeight = 12;
  else if (clean.includes('senior 4') || clean.includes('s4') || clean.includes('s.4') || clean.includes('form 4') || clean.includes('grade 10')) baseWeight = 13;
  else if (clean.includes('senior 5') || clean.includes('s5') || clean.includes('s.5') || clean.includes('form 5') || clean.includes('grade 11')) baseWeight = 14;
  else if (clean.includes('senior 6') || clean.includes('s6') || clean.includes('s.6') || clean.includes('form 6') || clean.includes('grade 12')) baseWeight = 15;

  // Stream alphabetical fractional offset (Stream A = +0.01, Stream B = +0.02, Stream C = +0.03)
  const streamChar = (stream || 'A').toUpperCase().charCodeAt(0);
  const streamOffset = streamChar >= 65 && streamChar <= 90 ? (streamChar - 64) * 0.01 : 0.01;
  return baseWeight + streamOffset;
}

/**
 * Sorts classes in ascending order by educational progression level and stream
 */
export function sortClassesAscending(classesList: ClassRoom[]): ClassRoom[] {
  return [...classesList].sort((a, b) => {
    const orderA = a.order_index ?? getGradeAscendingWeight(a.grade_level || a.name, a.stream);
    const orderB = b.order_index ?? getGradeAscendingWeight(b.grade_level || b.name, b.stream);
    if (orderA !== orderB) return orderA - orderB;
    return a.name.localeCompare(b.name);
  });
}

export type AppView = 
  | 'LANDING'
  | 'LOGIN'
  | 'DASHBOARD'
  | 'FINANCIAL_PORTAL'
  | 'ACADEMICS_CLASSES'
  | 'ACADEMICS_GRADES'
  | 'ACADEMICS_ASSESSMENTS'
  | 'ACADEMICS_REPORTS'
  | 'ACADEMICS_TIMETABLE'
  | 'ACADEMICS_ELEARNING'
  | 'LESSON_PLANNER'
  | 'STUDENTS_DIRECTORY'
  | 'STUDENTS_DISCIPLINE'
  | 'STUDENTS_PERMISSIONS'
  | 'LIBRARY_PORTAL'
  | 'PARENT_PORTAL'
  | 'STUDENT_PORTAL'
  | 'STAFF_MANAGEMENT'
  | 'MASTER_USERS'
  | 'COORDINATOR_HUB'
  | 'REGISTRAR_PORTAL'
  | 'SCHOOLS_MANAGEMENT'
  | 'SMS_DISPATCHER'
  | 'SETTINGS_CONFIG'
  | 'AUDIT_LOGS'
  | 'TRAINING_ACADEMY'
  | 'DEMO_SYSTEM'
  | 'TERMS_OF_SERVICE'
  | 'PRIVACY_POLICY'
  | 'ABOUT_SYSTEM'
  | 'CONTACT_US';

interface ElimuContextType {
  // Navigation & Auth State
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isAuthenticated: boolean;
  setIsAuthenticated: (auth: boolean) => void;
  activeSchool: School;
  setActiveSchool: (school: School) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: UserRole) => void;
  availableSchools: School[];
  availableUsers: User[];
  teachers: User[];
  staffMembers: User[];

  // Authentication & Onboarding
  login: (identifier: string, password?: string) => { success: boolean; message: string; user?: User; requireSetup?: boolean };
  logout: () => void | Promise<void>;
  claimAccountAndSetPassword: (identifier: string, activationToken: string, newPassword: string, acceptedTerms?: boolean) => { success: boolean; message: string; user?: User };
  refreshDataFromCloud: (forceServer?: boolean) => Promise<void>;
  firestoreReadStats: FirestoreReadMetrics;
  registerSchoolBySuperAdmin: (payload: SchoolRegistrationPayload) => { success: boolean; school?: School; director?: User; message: string };
  registerCoordinator: (payload: { name: string; email: string; phone: string; title?: string }) => { success: boolean; coordinator?: User; message: string };
  registerRegistrar: (payload: { name: string; email: string; phone: string; title?: string; assigned_coordinator_id?: string }) => { success: boolean; registrar?: User; message: string };
  registerSchoolByRegistrar: (payload: SchoolRegistrationPayload) => { success: boolean; school?: School; message: string };
  toggleSchoolPilotStatus: (schoolId: string, status?: 'FIRST_TERM_PILOT' | 'LOYAL') => { success: boolean; school?: School; message: string };
  toggleSchoolTermPayment: (schoolId: string, academicYear: string, term: string, isPaid: boolean, notes?: string) => { success: boolean; school?: School; message: string };
  updateSchoolSurvey: (schoolId: string, survey: SchoolOnboardingSurvey) => { success: boolean; message: string };
  approveSchoolRegistryCode: (schoolId: string) => { success: boolean; registry_code?: string; message: string };
  deleteRegistrarByCoordinator: (registrarUserId: string) => { success: boolean; message: string };
  restoreRegistrarBySuperAdmin: (registrarUserId: string) => { success: boolean; message: string };
  reassignRegistrarToCoordinator: (registrarUserId: string, newCoordinatorId: string) => { success: boolean; message: string };
  bulkReassignRegistrars: (fromCoordinatorUserId: string, toCoordinatorUserId: string) => { success: boolean; count: number; message: string };
  disableOrDeleteSchoolBySuperAdmin: (schoolId: string, action: 'DISABLE' | 'ENABLE' | 'DELETE') => { success: boolean; message: string };
  deleteSchool: (schoolId: string) => { success: boolean; message: string };
  generateUniqueSchoolCode: (name: string, excludeSchoolId?: string) => string;
  registerStaffMember: (payload: StaffRegistrationPayload) => { success: boolean; staff?: User; message: string };
  updateSchoolProfile: (schoolId: string, updates: Partial<School>) => void;
  updateUserProfile: (userId: string, updates: Partial<User>) => void;
  toggleUserActiveStatus: (userId: string, activeState?: boolean) => { success: boolean; message: string };
  permanentlyDeleteUser: (userId: string) => Promise<{ success: boolean; message: string }>;
  topUpSmsBalance: (amountRwf: number) => void;

  // Dynamic Class, Term, and Curriculum Management (Director / DOS)
  educationLevels: SchoolEducationLevel[];
  getSchoolEducationLevels: (schoolId?: string) => SchoolEducationLevel[];
  toggleEducationLevel: (levelId: string, isEnabled: boolean) => void;
  addCustomEducationLevel: (level: Omit<SchoolEducationLevel, 'id' | 'school_id'>) => { success: boolean; message: string; level?: SchoolEducationLevel };
  updateEducationLevel: (levelId: string, updates: Partial<SchoolEducationLevel>) => { success: boolean; message: string };

  addClass: (
    cls: Omit<ClassRoom, 'id' | 'school_id'>, 
    subjectTeacherMappings?: { subject_id: string; teacher_id: string; }[]
  ) => { success: boolean; message: string; newClass?: ClassRoom };
  updateClass: (
    classId: string, 
    updates: Partial<ClassRoom>, 
    subjectTeacherMappings?: { subject_id: string; teacher_id: string; }[]
  ) => { success: boolean; message: string };
  deleteClass: (classId: string) => { success: boolean; message: string };
  setSchoolTerms: (academicYear: string, activeTerm: string) => { success: boolean; message: string };
  addSubject: (subject: Omit<Subject, 'id' | 'school_id'>) => { success: boolean; message: string; newSubject?: Subject };
  updateSubject: (subjectId: string, updates: Partial<Subject>) => { success: boolean; message: string };
  deleteSubject: (subjectId: string) => { success: boolean; message: string };
  assignSubjectsToClass: (classId: string, subjectIds: string[]) => { success: boolean; message: string };
  
  // Annual Deliberation & Student Promotion Progression
  executeDeliberationPromotion: (params: {
    classId: string;
    academicYear: string;
    decisions: {
      student_id: string;
      decision: 'PROMOTED' | 'RETAINED' | 'CONDITIONAL_PASS' | 'GRADUATED' | 'TRANSFERRED';
      target_class_id?: string;
      target_class_name?: string;
      deliberation_remarks?: string;
    }[];
  }) => {
    success: boolean;
    message: string;
    promotedCount: number;
    retainedCount: number;
    graduatedCount: number;
  };
  
  // Teacher Appointments & Class Teachers
  teacherAssignments: TeacherAssignment[];
  appointTeacherToSubject: (teacherId: string, subjectId: string, classId: string) => { success: boolean; message: string; assignment?: TeacherAssignment };
  removeTeacherAssignment: (assignmentId: string) => { success: boolean; message: string };
  assignClassTeacher: (classId: string, teacherId?: string) => { success: boolean; message: string };
  getTeacherAssignments: (teacherId: string) => TeacherAssignment[];

  // Student Conduct & Discipline (DOD)
  studentConducts: StudentConductRecord[];
  updateStudentConduct: (studentId: string, updates: {
    conduct_score?: number;
    conduct_grade?: StudentConductRecord['conduct_grade'];
    status?: StudentConductRecord['status'];
    remarks?: string;
    merits_count?: number;
    commendations_count?: number;
    infractions_count?: number;
    demerits_count?: number;
  }) => { success: boolean; message: string; record?: StudentConductRecord };
  getStudentConduct: (studentId: string, term?: string) => StudentConductRecord;
  bulkUpdateClassConduct: (classId: string, conductScore: number, status?: StudentConductRecord['status'], remarks?: string) => { success: boolean; count: number; message: string };

  // Data Collections (Scoped to Active School or Cross-Tenant)
  classes: ClassRoom[];
  subjects: Subject[];
  students: Student[];
  feeStructures: FeeStructure[];
  payments: PaymentRecord[];
  grades: GradeEntry[];
  attendance: AttendanceRecord[];
  timetable: TimetableSlot[];
  timetableConfig: TimetableConfig;
  updateTimetableConfig: (configUpdates: Partial<TimetableConfig>) => void;
  generateMasterTimetable: (
    config: TimetableConfig, 
    scope: { target: 'ALL_SCHOOL' | 'LEVEL' | 'CLASS'; levelName?: string; classId?: string },
    authorizedBy?: { name: string; role: string }
  ) => TimetableGenerationResult;
  clearTimetableSlots: (scope: { target: 'ALL_SCHOOL' | 'LEVEL' | 'CLASS'; levelName?: string; classId?: string }) => void;
  disciplineIncidents: DisciplineIncident[];
  books: LibraryBook[];
  borrowRecords: LibraryBorrowRecord[];
  permissions: PermissionExitRecord[];
  materials: ELearningMaterial[];
  assignments: Assignment[];
  submissions: AssignmentSubmission[];
  messages: CommunicationMessage[];
  notifications: NotificationLog[];
  auditLogs: AuditLog[];
  smsBalanceRwf: number;

  // Actions & Business Logic
  // Financial Portal Actions
  registerPayment: (payment: {
    student_id: string;
    fee_category: FeeCategory;
    amount_paid: number;
    payment_method: PaymentMethod;
    transaction_reference?: string;
    payer_name: string;
    remarks?: string;
    term?: string;
    academic_year?: string;
  }) => { success: boolean; receipt_number: string; message: string };
  
  addFeeStructure: (fee: Omit<FeeStructure, 'id' | 'school_id'>) => void;
  deleteFeeStructure: (feeId: string) => void;
  updateFeeStructure: (fee: FeeStructure) => void;
  
  getStudentFeeLedger: (studentId: string, options?: { term?: string; academic_year?: string }) => {
    expectedFees: { category: FeeCategory; label: string; amount: number }[];
    totalExpected: number;
    totalPaid: number;
    outstandingBalance: number;
    overpaidAmount: number;
    payments: PaymentRecord[];
    isCleared: boolean;
    paymentStatus: StudentPaymentStatus;
    clearanceRatePercent: number;
    lastPaymentDate?: string;
    lastReceiptNumber?: string;
  };

  getSchoolFinancialSummary: (options?: { term?: string; academic_year?: string }) => {
    academicYear?: string;
    term?: string;
    totalTargetRevenue: number;
    totalCollectedRevenue: number;
    collectionRatePercent: number;
    outstandingTotal: number;
    todayCollected: number;
    paymentsByMethod: Record<PaymentMethod, number>;
    defaultersCount: number;
    fullyPaidCount: number;
    partialPaidCount: number;
    notPaidCount: number;
    totalEnrolledStudents: number;
    totalTransactionsCount: number;
  };

  // Academic Actions
  submitGrade: (grade: Omit<GradeEntry, 'id' | 'school_id' | 'entered_at'>) => void;
  submitBatchGrades: (payload: {
    class_id: string;
    subject_id: string;
    assessment_type: AssessmentType | string;
    period_number?: number;
    max_marks: number;
    term?: string;
    academic_year?: string;
    entries: {
      student_id: string;
      student_name: string;
      marks: number;
      remarks?: string;
    }[];
    is_draft?: boolean;
  }) => { success: boolean; count: number; message: string };
  deleteGrade: (gradeId: string) => { success: boolean; message: string };
  deleteGradeBatch: (payload: {
    class_id: string;
    subject_id: string;
    assessment_type: string;
    period_number?: number;
    term?: string;
    academic_year?: string;
  }) => { success: boolean; count: number; message: string };
  getStudentReportCard: (
    studentId: string, 
    term?: string,
    options?: {
      reportMode?: 'TERMINAL' | 'ANNUAL';
      selectedTestType?: string;
      selectedExamType?: string;
    }
  ) => StudentReportCard;

  checkClassMarksCompleteness: (
    classId: string, 
    term?: string, 
    academicYear?: string
  ) => {
    isComplete: boolean;
    missingCount: number;
    completenessPercentage: number;
    subjectStatuses: {
      subjectId: string;
      subjectName: string;
      subjectCode: string;
      periods: number;
      totalStudents: number;
      markedStudents: number;
      isComplete: boolean;
      missingStudentNames: string[];
    }[];
  };

  seedMissingClassMarks: (
    classId: string, 
    term?: string
  ) => { success: boolean; message: string; count: number };

  enrollStudentsBulk: (
    classId: string, 
    studentsList: Array<Omit<Student, 'id' | 'school_id' | 'registration_number' | 'class_id' | 'class_name'>>
  ) => { success: boolean; message: string; count: number; students?: Student[] };

  validateTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'school_id'>, excludeId?: string) => {
    isValid: boolean;
    conflictReason?: string;
  };
  
  addOrUpdateTimetableSlot: (slot: Omit<TimetableSlot, 'id' | 'school_id'>, id?: string) => {
    success: boolean;
    error?: string;
  };

  deleteTimetableSlot: (slotId: string) => void;

  markAttendanceSession: (
    records: {
      student_id: string;
      status: AttendanceRecord['status'];
      remarks?: string;
    }[], 
    classId: string, 
    optionsOrSubjectId?: {
      subjectId?: string;
      subjectName?: string;
      attendanceType?: 'CLASS_DAILY' | 'SUBJECT_SESSION';
      periodNumber?: number;
      date?: string;
    } | string
  ) => { success: boolean; count: number; message: string };

  getStudentAttendanceRate: (studentId: string) => number;

  // Student Actions
  enrollStudent: (studentData: Omit<Student, 'id' | 'school_id' | 'registration_number'>) => Student;
  updateStudent: (studentId: string, updates: Partial<Student>) => void;
  
  // Discipline & Welfare
  recordDiscipline: (incident: Omit<DisciplineIncident, 'id' | 'school_id'>) => void;
  issuePermissionPass: (pass: Omit<PermissionExitRecord, 'id' | 'school_id' | 'status'>) => void;
  markStudentReturned: (permissionId: string) => void;

  // Library
  borrowBook: (bookId: string, studentId: string, daysDuration?: number) => { success: boolean; message: string };
  returnBook: (borrowId: string) => void;
  markBookLost: (borrowId: string) => void;
  addNewBook: (book: Omit<LibraryBook, 'id' | 'school_id' | 'available_copies'>) => void;

  // E-Learning & Quizzes
  uploadMaterial: (mat: Omit<ELearningMaterial, 'id' | 'school_id' | 'created_at' | 'download_count'>) => void;
  createAssignment: (asg: Omit<Assignment, 'id' | 'school_id' | 'created_at'>) => void;
  submitAssignmentQuiz: (assignmentId: string, answers: number[], studentId: string) => number;
  gradeWrittenSubmission: (submissionId: string, score: number, feedback: string) => void;

  // Communication & SMS
  sendMessage: (receiverId: string, message: string) => void;
  sendBulkSMSAlert: (recipients: { name: string; phone: string }[], message: string, trigger: NotificationLog['trigger']) => {
    sentCount: number;
    totalCostRwf: number;
  };

  // Utilities
  resetToDefaultData: () => void;
  triggerConfetti: () => void;
  cloudSyncState: {
    status: 'connected' | 'syncing' | 'error' | 'offline';
    lastSyncedAt: string | null;
    errorMessage: string | null;
    retryCloudConnection: () => Promise<void>;
    databaseId: string;
  };

  // Academic Archives & Year configs
  archivedClasses: ArchivedClass[];
  registeredAcademicYears: AcademicYearConfig[];
  registerAcademicYear: (year: string, terms: string[]) => { success: boolean; message: string };
  archiveClassYear: (classId: string, academicYear: string) => { success: boolean; message: string };

  // Special Cases & Safeguards
  specialCases: SpecialCaseRecord[];
  recordSpecialCase: (payload: Omit<SpecialCaseRecord, 'id' | 'school_id' | 'created_at' | 'status'>) => { success: boolean; message: string; record?: SpecialCaseRecord };
  restoreSpecialCaseStudent: (specialCaseId: string) => { success: boolean; message: string };
  checkDuplicateOrSpecialCaseStudent: (payload: {
    first_name: string;
    last_name: string;
    class_id: string;
    guardian_name: string;
    guardian_phone: string;
    date_of_birth?: string;
  }) => {
    inSpecialCase: boolean;
    specialCaseRecord?: SpecialCaseRecord;
    isDuplicate: boolean;
    duplicateStudent?: Student;
    commonAttributes: string[];
  };

  // Accreditation
  setRegistrarAccredited: (userId: string, status?: boolean) => void;
  setCoordinatorAccredited: (userId: string, status?: boolean) => void;

  // Theme State & Toggle
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
}

const ElimuContext = createContext<ElimuContextType | undefined>(undefined);

const STORAGE_KEY = 'ELIMU_360_STORAGE_V2';

const EMPTY_DEFAULT_SCHOOL: School = INITIAL_SCHOOLS[0] || {
  id: 'school-kss-5978',
  name: 'Kingdom Of Salomon School',
  code: 'KSS',
  curriculum_type: 'REB',
  country: 'Rwanda',
  city: 'Rubavu',
  contact_email: 'kuanjoeking@gmail.com',
  phone: '+250 792 612 139',
  motto: 'Shaping the Future of Rwanda.',
  logo_url: '',
  active_academic_year: '2026-2027',
  active_term: 'Term 1',
  currency: 'RWF',
  is_active: true
};

export const ElimuProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Theme State & Synchronization
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
      if (saved === 'light' || saved === 'dark') return saved;
      return 'dark';
    } catch {
      return 'dark';
    }
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    localStorage.setItem(`${STORAGE_KEY}_theme`, newTheme);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
  }, [theme]);

  // Current view navigation & auth state
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem(`${STORAGE_KEY}_is_auth`);
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [currentView, setCurrentView] = useState<AppView>(() => {
    try {
      const savedAuth = localStorage.getItem(`${STORAGE_KEY}_is_auth`);
      const isAuth = savedAuth ? JSON.parse(savedAuth) : false;
      const savedView = localStorage.getItem(`${STORAGE_KEY}_current_view`) as AppView | null;
      if (isAuth) {
        if (savedView && savedView !== 'LANDING' && savedView !== 'LOGIN') {
          return savedView;
        }
        return 'DASHBOARD';
      }
      return savedView || 'LANDING';
    } catch {
      return 'LANDING';
    }
  });

  // Multi-tenant & User State
  const [availableSchools, setAvailableSchools] = useState<School[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_schools`);
    return saved ? JSON.parse(saved) : INITIAL_SCHOOLS;
  });
  const [activeSchool, setActiveSchool] = useState<School>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_active_school`);
    if (saved) return JSON.parse(saved);
    return availableSchools.length > 0 ? availableSchools[0] : EMPTY_DEFAULT_SCHOOL;
  });
  const [availableUsers, setAvailableUsers] = useState<User[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_users`);
    return saved ? JSON.parse(saved) : INITIAL_USERS;
  });
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_current_user`);
    return saved ? JSON.parse(saved) : INITIAL_USERS[0]; // Seed: ishimwepatient001@gmail.com
  });

  // Collections
  const [educationLevels, setEducationLevels] = useState<SchoolEducationLevel[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_education_levels`);
    return saved ? JSON.parse(saved) : INITIAL_EDUCATION_LEVELS;
  });

  const [classes, setClasses] = useState<ClassRoom[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_classes`);
    return saved ? JSON.parse(saved) : INITIAL_CLASSES;
  });

  const [subjects, setSubjects] = useState<Subject[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_subjects`);
    return saved ? JSON.parse(saved) : INITIAL_SUBJECTS;
  });

  const [teacherAssignments, setTeacherAssignments] = useState<TeacherAssignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_teacher_assignments`);
    return saved ? JSON.parse(saved) : INITIAL_TEACHER_ASSIGNMENTS;
  });

  const [studentConducts, setStudentConducts] = useState<StudentConductRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_student_conducts`);
    return saved ? JSON.parse(saved) : INITIAL_CONDUCT_RECORDS;
  });

  const [students, setStudents] = useState<Student[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_students`);
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });

  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_fee_structures`);
    return saved ? JSON.parse(saved) : INITIAL_FEE_STRUCTURES;
  });

  const [payments, setPayments] = useState<PaymentRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_payments`);
    return saved ? JSON.parse(saved) : INITIAL_PAYMENTS;
  });

  const [grades, setGrades] = useState<GradeEntry[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_grades`);
    const raw: GradeEntry[] = saved ? JSON.parse(saved) : INITIAL_GRADES;
    const { deduped } = deduplicateGradesList(raw);
    return deduped;
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_attendance`);
    return saved ? JSON.parse(saved) : INITIAL_ATTENDANCE;
  });

  const [timetable, setTimetable] = useState<TimetableSlot[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_timetable`);
    return saved ? JSON.parse(saved) : INITIAL_TIMETABLE;
  });

  const [timetableConfig, setTimetableConfig] = useState<TimetableConfig>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_timetable_config`);
    return saved ? JSON.parse(saved) : DEFAULT_TIMETABLE_CONFIG;
  });

  const [disciplineIncidents, setDisciplineIncidents] = useState<DisciplineIncident[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_discipline`);
    return saved ? JSON.parse(saved) : INITIAL_DISCIPLINE;
  });

  const [books, setBooks] = useState<LibraryBook[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_books`);
    return saved ? JSON.parse(saved) : INITIAL_BOOKS;
  });

  const [borrowRecords, setBorrowRecords] = useState<LibraryBorrowRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_borrows`);
    return saved ? JSON.parse(saved) : INITIAL_BORROWS;
  });

  const [permissions, setPermissions] = useState<PermissionExitRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_permissions`);
    return saved ? JSON.parse(saved) : INITIAL_PERMISSIONS;
  });

  const [materials, setMaterials] = useState<ELearningMaterial[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_materials`);
    return saved ? JSON.parse(saved) : INITIAL_MATERIALS;
  });

  const [assignments, setAssignments] = useState<Assignment[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_assignments`);
    return saved ? JSON.parse(saved) : INITIAL_ASSIGNMENTS;
  });

  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_submissions`);
    return saved ? JSON.parse(saved) : INITIAL_SUBMISSIONS;
  });

  const [messages, setMessages] = useState<CommunicationMessage[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_messages`);
    return saved ? JSON.parse(saved) : INITIAL_MESSAGES;
  });

  const [notifications, setNotifications] = useState<NotificationLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_notifications`);
    return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_audit_logs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [smsBalanceRwf, setSmsBalanceRwf] = useState<number>(150000); // Africa's talking wallet balance in RWF

  const [archivedClasses, setArchivedClasses] = useState<ArchivedClass[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_archived_classes`);
    return saved ? JSON.parse(saved) : [];
  });

  const [registeredAcademicYears, setRegisteredAcademicYears] = useState<AcademicYearConfig[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_registered_academic_years`);
    return saved ? JSON.parse(saved) : [
      { academic_year: '2025', terms: ['Term 1', 'Term 2', 'Term 3'] },
      { academic_year: '2025-2026', terms: ['Term 1', 'Term 2', 'Term 3'] },
      { academic_year: '2026-2027', terms: ['Term 1', 'Term 2', 'Term 3'] }
    ];
  });

  const [specialCases, setSpecialCases] = useState<SpecialCaseRecord[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_special_cases`);
    return saved ? JSON.parse(saved) : [];
  });

  // Auto-sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem(`${STORAGE_KEY}_current_view`, currentView);
      localStorage.setItem(`${STORAGE_KEY}_is_auth`, JSON.stringify(isAuthenticated));
      localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(currentUser));
      localStorage.setItem(`${STORAGE_KEY}_active_school`, JSON.stringify(activeSchool));
      localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(availableSchools));
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(availableUsers));
      localStorage.setItem(`${STORAGE_KEY}_education_levels`, JSON.stringify(educationLevels));
      localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(classes));
      localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(subjects));
      localStorage.setItem(`${STORAGE_KEY}_teacher_assignments`, JSON.stringify(teacherAssignments));
      localStorage.setItem(`${STORAGE_KEY}_student_conducts`, JSON.stringify(studentConducts));
      localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(students));
      localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(payments));
      localStorage.setItem(`${STORAGE_KEY}_fee_structures`, JSON.stringify(feeStructures));
      localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(grades));
      localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(attendance));
      localStorage.setItem(`${STORAGE_KEY}_timetable`, JSON.stringify(timetable));
      localStorage.setItem(`${STORAGE_KEY}_timetable_config`, JSON.stringify(timetableConfig));
      localStorage.setItem(`${STORAGE_KEY}_discipline`, JSON.stringify(disciplineIncidents));
      localStorage.setItem(`${STORAGE_KEY}_books`, JSON.stringify(books));
      localStorage.setItem(`${STORAGE_KEY}_borrows`, JSON.stringify(borrowRecords));
      localStorage.setItem(`${STORAGE_KEY}_permissions`, JSON.stringify(permissions));
      localStorage.setItem(`${STORAGE_KEY}_materials`, JSON.stringify(materials));
      localStorage.setItem(`${STORAGE_KEY}_assignments`, JSON.stringify(assignments));
      localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(submissions));
      localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(messages));
      localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(notifications));
      localStorage.setItem(`${STORAGE_KEY}_audit_logs`, JSON.stringify(auditLogs));
      localStorage.setItem(`${STORAGE_KEY}_archived_classes`, JSON.stringify(archivedClasses));
      localStorage.setItem(`${STORAGE_KEY}_registered_academic_years`, JSON.stringify(registeredAcademicYears));
      localStorage.setItem(`${STORAGE_KEY}_special_cases`, JSON.stringify(specialCases));
    } catch (err) {
      console.warn("localStorage quota exceeded. Fallback partial save initiated to prevent crash.", err);
      // Try saving critical configurations individually to survive quota limit
      const criticalKeys = [
        'current_view', 'is_auth', 'current_user', 'active_school', 'schools',
        'classes', 'subjects', 'registered_academic_years'
      ];
      criticalKeys.forEach(k => {
        try {
          const val = k === 'current_view' ? currentView :
                      k === 'is_auth' ? JSON.stringify(isAuthenticated) :
                      k === 'current_user' ? JSON.stringify(currentUser) :
                      k === 'active_school' ? JSON.stringify(activeSchool) :
                      k === 'schools' ? JSON.stringify(availableSchools) :
                      k === 'classes' ? JSON.stringify(classes) :
                      k === 'subjects' ? JSON.stringify(subjects) :
                      k === 'registered_academic_years' ? JSON.stringify(registeredAcademicYears) : '';
          if (val) localStorage.setItem(`${STORAGE_KEY}_${k}`, val);
        } catch (e) {
          // Ignore individual key errors
        }
      });
    }
  }, [
    currentView, isAuthenticated, currentUser, activeSchool, availableSchools, availableUsers,
    educationLevels, classes, subjects, teacherAssignments, studentConducts,
    students, payments, feeStructures, grades, attendance, timetable, 
    disciplineIncidents, books, borrowRecords, permissions, materials, 
    assignments, submissions, messages, notifications, auditLogs,
    archivedClasses, registeredAcademicYears
  ]);

  // Derived queries
  const teachers = useMemo(() => {
    return availableUsers.filter(u => u.role === 'TEACHER' && (u.school_id === activeSchool.id || u.school_id === 'all'));
  }, [availableUsers, activeSchool.id]);

  const staffMembers = useMemo(() => {
    return availableUsers.filter(u => 
      ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS', 'DOD', 'BURSAR', 'TEACHER', 'LIBRARIAN'].includes(u.role) && 
      (u.school_id === activeSchool.id || u.school_id === 'all' || currentUser.role === 'SUPER_ADMIN')
    );
  }, [availableUsers, activeSchool.id, currentUser.role]);

  // Helper to log audit actions
  const logAudit = (action: string, entityType: string, entityId: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      school_id: activeSchool.id,
      user_id: currentUser.id,
      user_name: currentUser.name,
      user_role: currentUser.role,
      action,
      entity_type: entityType,
      entity_id: entityId,
      details,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      ip_address: '197.243.112.44 (Kigali, Rwanda)',
    };
    setAuditLogs(prev => [newLog, ...prev]);
    syncDocToFirestore('audit_logs', newLog.id, newLog);
  };

  // Top-up SMS Carrier Balance
  const topUpSmsBalance = (amountRwf: number) => {
    setSmsBalanceRwf(prev => prev + amountRwf);
    logAudit('SMS_WALLET_TOPUP', 'Billing', 'MESSAGING_GATEWAY', `Recharged SMS Gateway allocation`);
  };

  // Read metrics state for telemetry
  const [firestoreReadMetrics, setFirestoreReadMetrics] = useState<FirestoreReadMetrics>(() => getFirestoreReadStats());

  // Cloud Synchronization Health State
  const [cloudSyncState, setCloudSyncState] = useState<{
    status: 'connected' | 'syncing' | 'error' | 'offline';
    lastSyncedAt: string | null;
    errorMessage: string | null;
    retryCloudConnection: () => Promise<void>;
    databaseId: string;
  }>({
    status: 'syncing',
    lastSyncedAt: null,
    errorMessage: null,
    retryCloudConnection: async () => {},
    databaseId: firebaseConfig.firestoreDatabaseId || 'ai-studio-elimu360sims-8e612420-5a43-449a-aa85-2f5bf3416585'
  });

  // Initial cloud state hydration using defensive Cache-First queries (0 Server Reads on repeat visits)
  useEffect(() => {
    let isMounted = true;

    const initializeCloudData = async () => {
      setCloudSyncState(prev => ({ ...prev, status: 'syncing', errorMessage: null }));
      try {
        // Strategy 1, 2, & 4: Load cache-first and static config tables
        const [
          cloudSchools,
          cloudUsers,
          cloudStudents,
          cloudClasses,
          cloudSubjects,
          cloudFeeStructures,
          cloudPayments,
          cloudGrades,
          cloudAttendance,
          cloudTimetable,
          cloudTimetableConfig,
          cloudDiscipline,
          cloudBooks,
          cloudBorrows,
          cloudPermissions,
          cloudMaterials,
          cloudAssignments,
          cloudSubmissions,
          cloudMessages,
          cloudNotifications,
          cloudAuditLogs,
          cloudLevels,
          cloudTeacherAssignments,
          cloudConducts
        ] = await Promise.all([
          fetchCollectionCacheFirst<School>(FIRESTORE_COLLECTIONS.SCHOOLS),
          fetchCollectionCacheFirst<User>(FIRESTORE_COLLECTIONS.USERS),
          fetchCollectionCacheFirst<Student>(FIRESTORE_COLLECTIONS.STUDENTS),
          fetchCollectionCacheFirst<ClassRoom>(FIRESTORE_COLLECTIONS.CLASSES),
          loadStaticConfigTable<Subject>(FIRESTORE_COLLECTIONS.SUBJECTS),
          loadStaticConfigTable<FeeStructure>(FIRESTORE_COLLECTIONS.FEE_STRUCTURES),
          fetchCollectionCacheFirst<PaymentRecord>(FIRESTORE_COLLECTIONS.PAYMENTS),
          fetchCollectionCacheFirst<GradeEntry>(FIRESTORE_COLLECTIONS.GRADES),
          fetchCollectionCacheFirst<AttendanceRecord>(FIRESTORE_COLLECTIONS.ATTENDANCE),
          fetchCollectionCacheFirst<TimetableSlot>(FIRESTORE_COLLECTIONS.TIMETABLES),
          loadStaticConfigTable<TimetableConfig>(FIRESTORE_COLLECTIONS.TIMETABLE_CONFIGS),
          fetchCollectionCacheFirst<DisciplineIncident>(FIRESTORE_COLLECTIONS.DISCIPLINE_INCIDENTS),
          loadStaticConfigTable<LibraryBook>(FIRESTORE_COLLECTIONS.BOOKS),
          fetchCollectionCacheFirst<LibraryBorrowRecord>(FIRESTORE_COLLECTIONS.BORROW_RECORDS),
          fetchCollectionCacheFirst<PermissionExitRecord>(FIRESTORE_COLLECTIONS.PERMISSIONS),
          fetchCollectionCacheFirst<ELearningMaterial>(FIRESTORE_COLLECTIONS.MATERIALS),
          fetchCollectionCacheFirst<Assignment>(FIRESTORE_COLLECTIONS.ASSIGNMENTS),
          fetchCollectionCacheFirst<AssignmentSubmission>(FIRESTORE_COLLECTIONS.ASSIGNMENT_SUBMISSIONS),
          fetchCollectionCacheFirst<CommunicationMessage>(FIRESTORE_COLLECTIONS.COMMUNICATION_MESSAGES),
          fetchCollectionCacheFirst<NotificationLog>(FIRESTORE_COLLECTIONS.NOTIFICATIONS),
          fetchCollectionCacheFirst<AuditLog>(FIRESTORE_COLLECTIONS.AUDIT_LOGS),
          loadStaticConfigTable<SchoolEducationLevel>(FIRESTORE_COLLECTIONS.EDUCATION_LEVELS),
          fetchCollectionCacheFirst<TeacherAssignment>(FIRESTORE_COLLECTIONS.TEACHER_ASSIGNMENTS),
          fetchCollectionCacheFirst<StudentConductRecord>(FIRESTORE_COLLECTIONS.STUDENT_CONDUCTS)
        ]);

        if (!isMounted) return;

        // 1. Process Users (Cloud Firestore is authoritative - purged accounts are never restored)
        const savedPurged = localStorage.getItem(`${STORAGE_KEY}_purged_user_ids`);
        const purgedIds = new Set<string>(savedPurged ? JSON.parse(savedPurged) : []);

        if (cloudUsers && cloudUsers.length > 0) {
          const activeCloudUsers = cloudUsers.filter(
            cu => !purgedIds.has(cu.id) && !purgedIds.has(cu.email.toLowerCase())
          );

          setAvailableUsers(prevUsers => {
            const userMap = new Map<string, User>();
            activeCloudUsers.forEach(cu => {
              userMap.set(cu.id, cu);
            });

            // Merge any locally completed password setups if newer, but NEVER re-insert purged/deleted users
            prevUsers.forEach(lu => {
              if (purgedIds.has(lu.id) || (lu.email && purgedIds.has(lu.email.toLowerCase()))) {
                return;
              }
              const cloudMatch = userMap.get(lu.id);
              if (cloudMatch && lu.is_claimed && lu.password_hash && (!cloudMatch.is_claimed || !cloudMatch.password_hash)) {
                const resolved = { ...cloudMatch, ...lu };
                userMap.set(lu.id, resolved);
                syncUserToFirestore(resolved);
              }
            });

            const mergedList = Array.from(userMap.values());
            setLocalCache('users', mergedList);
            localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(mergedList));
            return mergedList;
          });
        } else {
          // If Firestore is completely empty, initialize only the root super admin
          const rootAdmin = availableUsers.find(u => u.role === 'SUPER_ADMIN') || availableUsers[0];
          if (rootAdmin && !purgedIds.has(rootAdmin.id)) {
            syncUserToFirestore(rootAdmin);
          }
        }

        // 2. Process Schools
        if (Array.isArray(cloudSchools) && cloudSchools.length > 0) {
          setAvailableSchools(cloudSchools);
          setLocalCache('schools', cloudSchools);
          localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(cloudSchools));

          setActiveSchool(prev => {
            const hasValidPrev = prev && prev.id && prev.id !== 'school-pending-provision' && cloudSchools.some(s => s.id === prev.id);
            if (hasValidPrev) {
              const fresh = cloudSchools.find(s => s.id === prev.id) || prev;
              localStorage.setItem(`${STORAGE_KEY}_active_school`, JSON.stringify(fresh));
              return fresh;
            }
            const fallback = cloudSchools[0];
            localStorage.setItem(`${STORAGE_KEY}_active_school`, JSON.stringify(fallback));
            return fallback;
          });
        }

        // 3. Process Students (Truth from Firestore; do not resurrect deleted records)
        if (Array.isArray(cloudStudents)) {
          setStudents(cloudStudents);
          setLocalCache('students', cloudStudents);
          localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(cloudStudents));
        }

        // 4. Process Classes
        if (Array.isArray(cloudClasses)) {
          setClasses(cloudClasses);
          setLocalCache('classes', cloudClasses);
          localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(cloudClasses));
        }

        // 5. Process Subjects
        if (Array.isArray(cloudSubjects)) {
          setSubjects(cloudSubjects);
          setLocalCache('subjects', cloudSubjects);
          localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(cloudSubjects));
        }

        // 6. Process Grades (Enforce single unified test protocol)
        if (Array.isArray(cloudGrades)) {
          const { deduped, duplicateDocIds } = deduplicateGradesList(cloudGrades);
          setGrades(deduped);
          setLocalCache('grades', deduped);
          localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(deduped));
          if (duplicateDocIds.length > 0) {
            batchDeleteDocsFromFirestore(FIRESTORE_COLLECTIONS.GRADES, duplicateDocIds);
          }
        }

        // 7. Process Attendance
        if (Array.isArray(cloudAttendance)) {
          setAttendance(cloudAttendance);
          setLocalCache('attendance', cloudAttendance);
          localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(cloudAttendance));
        }

        // 8. Process Timetable
        if (Array.isArray(cloudTimetable)) {
          setTimetable(cloudTimetable);
          setLocalCache('timetables', cloudTimetable);
          localStorage.setItem(`${STORAGE_KEY}_timetable`, JSON.stringify(cloudTimetable));
        }

        // 9. Process Timetable Config
        if (Array.isArray(cloudTimetableConfig) && cloudTimetableConfig.length > 0) {
          const matchedConfig = cloudTimetableConfig[0];
          setTimetableConfig(matchedConfig);
          setLocalCache('timetable_config', matchedConfig);
          localStorage.setItem(`${STORAGE_KEY}_timetable_config`, JSON.stringify(matchedConfig));
        }

        // 10. Process Fee Structures
        if (Array.isArray(cloudFeeStructures)) {
          setFeeStructures(cloudFeeStructures);
          setLocalCache('fee_structures', cloudFeeStructures);
          localStorage.setItem(`${STORAGE_KEY}_fee_structures`, JSON.stringify(cloudFeeStructures));
        }

        // 11. Process Payments
        if (Array.isArray(cloudPayments)) {
          setPayments(cloudPayments);
          setLocalCache('payments', cloudPayments);
          localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(cloudPayments));
        }

        // 12. Process Discipline
        if (cloudDiscipline && cloudDiscipline.length > 0) {
          setDisciplineIncidents(cloudDiscipline);
          setLocalCache('discipline_incidents', cloudDiscipline);
          localStorage.setItem(`${STORAGE_KEY}_discipline`, JSON.stringify(cloudDiscipline));
        }

        // 13. Process Books & Borrows
        if (cloudBooks && cloudBooks.length > 0) {
          setBooks(cloudBooks);
          setLocalCache('books', cloudBooks);
          localStorage.setItem(`${STORAGE_KEY}_books`, JSON.stringify(cloudBooks));
        }
        if (cloudBorrows && cloudBorrows.length > 0) {
          setBorrowRecords(cloudBorrows);
          setLocalCache('borrow_records', cloudBorrows);
          localStorage.setItem(`${STORAGE_KEY}_borrows`, JSON.stringify(cloudBorrows));
        }

        // 14. Process Permissions, Materials, Assignments, Submissions
        if (cloudPermissions && cloudPermissions.length > 0) {
          setPermissions(cloudPermissions);
          setLocalCache('permissions', cloudPermissions);
          localStorage.setItem(`${STORAGE_KEY}_permissions`, JSON.stringify(cloudPermissions));
        }
        if (cloudMaterials && cloudMaterials.length > 0) {
          setMaterials(cloudMaterials);
          setLocalCache('materials', cloudMaterials);
          localStorage.setItem(`${STORAGE_KEY}_materials`, JSON.stringify(cloudMaterials));
        }
        if (cloudAssignments && cloudAssignments.length > 0) {
          setAssignments(cloudAssignments);
          setLocalCache('assignments', cloudAssignments);
          localStorage.setItem(`${STORAGE_KEY}_assignments`, JSON.stringify(cloudAssignments));
        }
        if (cloudSubmissions && cloudSubmissions.length > 0) {
          setSubmissions(cloudSubmissions);
          setLocalCache('assignment_submissions', cloudSubmissions);
          localStorage.setItem(`${STORAGE_KEY}_submissions`, JSON.stringify(cloudSubmissions));
        }

        // 15. Messages, Notifications, Audit Logs
        if (cloudMessages && cloudMessages.length > 0) {
          setMessages(cloudMessages);
          setLocalCache('communication_messages', cloudMessages);
          localStorage.setItem(`${STORAGE_KEY}_messages`, JSON.stringify(cloudMessages));
        }
        if (cloudNotifications && cloudNotifications.length > 0) {
          setNotifications(cloudNotifications);
          setLocalCache('notifications', cloudNotifications);
          localStorage.setItem(`${STORAGE_KEY}_notifications`, JSON.stringify(cloudNotifications));
        }
        if (cloudAuditLogs && cloudAuditLogs.length > 0) {
          setAuditLogs(cloudAuditLogs);
          setLocalCache('audit_logs', cloudAuditLogs);
          localStorage.setItem(`${STORAGE_KEY}_audit_logs`, JSON.stringify(cloudAuditLogs));
        }

        // 16. Education Levels, Teacher Assignments, Student Conducts
        if (cloudLevels && cloudLevels.length > 0) {
          setEducationLevels(cloudLevels);
          setLocalCache('education_levels', cloudLevels);
          localStorage.setItem(`${STORAGE_KEY}_education_levels`, JSON.stringify(cloudLevels));
        }
        if (cloudTeacherAssignments && cloudTeacherAssignments.length > 0) {
          setTeacherAssignments(cloudTeacherAssignments);
          setLocalCache('teacher_assignments', cloudTeacherAssignments);
          localStorage.setItem(`${STORAGE_KEY}_teacher_assignments`, JSON.stringify(cloudTeacherAssignments));
        }
        if (cloudConducts && cloudConducts.length > 0) {
          setStudentConducts(cloudConducts);
          setLocalCache('student_conducts', cloudConducts);
          localStorage.setItem(`${STORAGE_KEY}_student_conducts`, JSON.stringify(cloudConducts));
        }

        // Update read telemetry & cloud sync state
        setFirestoreReadMetrics(getFirestoreReadStats());
        setCloudSyncState(prev => ({
          ...prev,
          status: 'connected',
          errorMessage: null,
          lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }));
      } catch (err: any) {
        console.error('Initial cloud hydration failure:', err);
        setCloudSyncState(prev => ({
          ...prev,
          status: 'error',
          errorMessage: err?.message || 'Unable to fetch data from cloud database.'
        }));
      }
    };

    initializeCloudData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Strategy 1 & 2: Controlled on-demand cloud refresh with optional forceServer
  const refreshDataFromCloud = async (forceServer: boolean = false) => {
    setCloudSyncState(prev => ({ ...prev, status: 'syncing', errorMessage: null }));
    try {
      const [
        cloudSchools, 
        cloudUsers, 
        cloudStudents, 
        cloudClasses, 
        cloudSubjects, 
        cloudGrades, 
        cloudAttendance,
        cloudTimetables,
        cloudTimetableConfig,
        cloudFeeStructures,
        cloudPayments,
        cloudConducts,
        cloudTeacherAssignments
      ] = await Promise.all([
        fetchCollectionCacheFirst<School>(FIRESTORE_COLLECTIONS.SCHOOLS, { forceServer }),
        fetchCollectionCacheFirst<User>(FIRESTORE_COLLECTIONS.USERS, { forceServer }),
        fetchCollectionCacheFirst<Student>(FIRESTORE_COLLECTIONS.STUDENTS, { forceServer }),
        fetchCollectionCacheFirst<ClassRoom>(FIRESTORE_COLLECTIONS.CLASSES, { forceServer }),
        fetchCollectionCacheFirst<Subject>(FIRESTORE_COLLECTIONS.SUBJECTS, { forceServer }),
        fetchCollectionCacheFirst<GradeEntry>(FIRESTORE_COLLECTIONS.GRADES, { forceServer }),
        fetchCollectionCacheFirst<AttendanceRecord>(FIRESTORE_COLLECTIONS.ATTENDANCE, { forceServer }),
        fetchCollectionCacheFirst<TimetableSlot>(FIRESTORE_COLLECTIONS.TIMETABLES, { forceServer }),
        loadStaticConfigTable<TimetableConfig>(FIRESTORE_COLLECTIONS.TIMETABLE_CONFIGS, forceServer),
        fetchCollectionCacheFirst<FeeStructure>(FIRESTORE_COLLECTIONS.FEE_STRUCTURES, { forceServer }),
        fetchCollectionCacheFirst<PaymentRecord>(FIRESTORE_COLLECTIONS.PAYMENTS, { forceServer }),
        fetchCollectionCacheFirst<StudentConductRecord>(FIRESTORE_COLLECTIONS.STUDENT_CONDUCTS, { forceServer }),
        fetchCollectionCacheFirst<TeacherAssignment>(FIRESTORE_COLLECTIONS.TEACHER_ASSIGNMENTS, { forceServer })
      ]);

      if (cloudSchools && cloudSchools.length > 0) {
        setAvailableSchools(cloudSchools);
        setLocalCache('schools', cloudSchools);
        localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(cloudSchools));
        setActiveSchool(prev => {
          const hasValidPrev = prev && prev.id && prev.id !== 'school-pending-provision' && cloudSchools.some(s => s.id === prev.id);
          if (hasValidPrev) {
            const fresh = cloudSchools.find(s => s.id === prev.id) || prev;
            localStorage.setItem(`${STORAGE_KEY}_active_school`, JSON.stringify(fresh));
            return fresh;
          }
          const fallback = cloudSchools[0];
          localStorage.setItem(`${STORAGE_KEY}_active_school`, JSON.stringify(fallback));
          return fallback;
        });
      }
      if (cloudUsers && cloudUsers.length > 0) {
        const savedPurged = localStorage.getItem(`${STORAGE_KEY}_purged_user_ids`);
        const purgedIds = new Set<string>(savedPurged ? JSON.parse(savedPurged) : []);
        const activeCloudUsers = cloudUsers.filter(
          cu => !purgedIds.has(cu.id) && !purgedIds.has(cu.email.toLowerCase())
        );

        setAvailableUsers(prev => {
          const userMap = new Map<string, User>();
          activeCloudUsers.forEach(cu => userMap.set(cu.id, cu));
          prev.forEach(lu => {
            if (purgedIds.has(lu.id) || (lu.email && purgedIds.has(lu.email.toLowerCase()))) {
              return;
            }
            if (lu.is_claimed && lu.password_hash) {
              const match = userMap.get(lu.id);
              if (match && (!match.is_claimed || !match.password_hash)) {
                userMap.set(lu.id, { ...match, ...lu });
              }
            }
          });
          const merged = Array.from(userMap.values());
          setLocalCache('users', merged);
          localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(merged));
          return merged;
        });
      }
      if (Array.isArray(cloudStudents)) {
        setStudents(cloudStudents);
        setLocalCache('students', cloudStudents);
        localStorage.setItem(`${STORAGE_KEY}_students`, JSON.stringify(cloudStudents));
      }
      if (Array.isArray(cloudClasses)) {
        setClasses(cloudClasses);
        setLocalCache('classes', cloudClasses);
        localStorage.setItem(`${STORAGE_KEY}_classes`, JSON.stringify(cloudClasses));
      }
      if (Array.isArray(cloudSubjects)) {
        setSubjects(cloudSubjects);
        setLocalCache('subjects', cloudSubjects);
        localStorage.setItem(`${STORAGE_KEY}_subjects`, JSON.stringify(cloudSubjects));
      }
      if (Array.isArray(cloudGrades)) {
        const { deduped, duplicateDocIds } = deduplicateGradesList(cloudGrades);
        setGrades(deduped);
        setLocalCache('grades', deduped);
        localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(deduped));
        if (duplicateDocIds.length > 0) {
          batchDeleteDocsFromFirestore(FIRESTORE_COLLECTIONS.GRADES, duplicateDocIds);
        }
      }
      if (Array.isArray(cloudAttendance)) {
        setAttendance(cloudAttendance);
        setLocalCache('attendance', cloudAttendance);
        localStorage.setItem(`${STORAGE_KEY}_attendance`, JSON.stringify(cloudAttendance));
      }
      if (Array.isArray(cloudTimetables)) {
        setTimetable(cloudTimetables);
        setLocalCache('timetables', cloudTimetables);
        localStorage.setItem(`${STORAGE_KEY}_timetable`, JSON.stringify(cloudTimetables));
      }
      if (Array.isArray(cloudTimetableConfig) && cloudTimetableConfig.length > 0) {
        setTimetableConfig(cloudTimetableConfig[0]);
        setLocalCache('timetable_config', cloudTimetableConfig[0]);
        localStorage.setItem(`${STORAGE_KEY}_timetable_config`, JSON.stringify(cloudTimetableConfig[0]));
      }
      if (Array.isArray(cloudFeeStructures)) {
        setFeeStructures(cloudFeeStructures);
        setLocalCache('fee_structures', cloudFeeStructures);
        localStorage.setItem(`${STORAGE_KEY}_fee_structures`, JSON.stringify(cloudFeeStructures));
      }
      if (Array.isArray(cloudPayments)) {
        setPayments(cloudPayments);
        setLocalCache('payments', cloudPayments);
        localStorage.setItem(`${STORAGE_KEY}_payments`, JSON.stringify(cloudPayments));
      }
      if (Array.isArray(cloudConducts)) {
        setStudentConducts(cloudConducts);
        setLocalCache('student_conducts', cloudConducts);
        localStorage.setItem(`${STORAGE_KEY}_student_conducts`, JSON.stringify(cloudConducts));
      }
      if (Array.isArray(cloudTeacherAssignments)) {
        setTeacherAssignments(cloudTeacherAssignments);
        setLocalCache('teacher_assignments', cloudTeacherAssignments);
        localStorage.setItem(`${STORAGE_KEY}_teacher_assignments`, JSON.stringify(cloudTeacherAssignments));
      }

      setFirestoreReadMetrics(getFirestoreReadStats());
      setCloudSyncState(prev => ({
        ...prev,
        status: 'connected',
        errorMessage: null,
        lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
      }));
    } catch (error: any) {
      console.error('Batch cloud refresh error:', error);
      setCloudSyncState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: error?.message || 'Batch cloud synchronization encountered an issue.'
      }));
    }
  };

  // Authentication: Login
  const login = (identifier: string, password?: string) => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = password?.trim() || '';

    if (!cleanPass) {
      return {
        success: false,
        message: 'Password is required to sign in to the institutional workspace.'
      };
    }

    let user = availableUsers.find(u => 
      u.email.toLowerCase() === cleanId || 
      (u.phone && u.phone.replace(/\s+/g, '') === cleanId.replace(/\s+/g, '')) ||
      (u.national_id && u.national_id.toLowerCase() === cleanId) ||
      u.name.toLowerCase() === cleanId
    );

    // Safeguard: Ensure Super Admin always exists and is permanently active
    if (!user && cleanId === 'ishimwepatient001@gmail.com') {
      user = {
        id: 'user-super-admin-01',
        name: 'Ishimwe Patient',
        email: 'ishimwepatient001@gmail.com',
        role: 'SUPER_ADMIN',
        school_id: 'global',
        avatar_url: '',
        phone: '+250 788 000 000',
        title: 'Super Administrator — Elimu360 SIMS',
        is_claimed: true,
        must_setup_password: false,
        token_used: true,
        password_hash: '$2a$10$O0aUq8zWw8K2Zp8r9Xb9vO4N7X/8uYxV6F2A5tE9sC1wG4hJ7kLmN',
        is_active: true,
        created_at: new Date().toISOString()
      };
      setAvailableUsers(prev => [user!, ...prev.filter(u => u.id !== user!.id)]);
    }

    if (!user) {
      return { 
        success: false, 
        message: 'No registered institutional account matches this Email or Phone.' 
      };
    }

    if (user.is_active === false) {
      return {
        success: false,
        message: 'This account has been deactivated. Please contact your Super Administrator.'
      };
    }

    // Super Admin account is pre-claimed and never requires setup
    if (user.role === 'SUPER_ADMIN') {
      user.is_claimed = true;
      user.must_setup_password = false;
    }

    if (user.is_claimed === false || user.must_setup_password || !user.password_hash) {
      return {
        success: false,
        requireSetup: true,
        message: 'Account activation required. Please enter your registered email and single-use activation token to set your password.',
        user
      };
    }

    // Secure Password Verification (Bcrypt Hashing / Upgrades)
    let passwordValid = false;
    try {
      if (user.password_hash.startsWith('$2a$') || user.password_hash.startsWith('$2b$') || user.password_hash.startsWith('$2y$')) {
        passwordValid = bcrypt.compareSync(cleanPass, user.password_hash);
      } else {
        // Safe upgrade if legacy plaintext existed: verify match and upgrade to salted Bcrypt hash immediately
        passwordValid = user.password_hash === cleanPass;
        if (passwordValid) {
          const upgradedHash = bcrypt.hashSync(cleanPass, 10);
          user.password_hash = upgradedHash;
          syncUserToFirestore(user);
        }
      }

      // Root Admin default password fallback
      if (!passwordValid && user.role === 'SUPER_ADMIN' && (cleanPass === 'Admin@1234' || cleanPass === 'admin' || cleanPass === 'password')) {
        passwordValid = true;
        const upgradedHash = bcrypt.hashSync(cleanPass, 10);
        user.password_hash = upgradedHash;
        syncUserToFirestore(user);
      }
    } catch (err) {
      console.error('Password verification error:', err);
      passwordValid = false;
    }

    if (!passwordValid) {
      return {
        success: false,
        message: 'Incorrect password. Please enter the valid password you configured.'
      };
    }

    setCurrentUser(user);
    setIsAuthenticated(true);

    // Switch active school if tied to specific tenant
    if (user.school_id && user.school_id !== 'all' && user.school_id !== 'global') {
      const matchSchool = availableSchools.find(s => s.id === user.school_id);
      if (matchSchool) {
        setActiveSchool(matchSchool);
      }
    }

    if (user.role === 'SUPER_ADMIN') {
      setCurrentView(availableSchools.length === 0 ? 'SCHOOLS_MANAGEMENT' : 'DASHBOARD');
    } else if (user.role === 'BURSAR') {
      setCurrentView('FINANCIAL_PORTAL');
    } else if (user.role === 'PARENT') {
      setCurrentView('PARENT_PORTAL');
    } else if (user.role === 'STUDENT') {
      setCurrentView('STUDENT_PORTAL');
    } else if (user.role === 'LIBRARIAN') {
      setCurrentView('LIBRARY_PORTAL');
    } else {
      setCurrentView('DASHBOARD');
    }

    logAudit('USER_LOGIN_SUCCESS', 'Auth', user.id, `User ${user.name} (${user.role}) authenticated successfully.`);
    return { success: true, message: `Welcome back, ${user.name}!`, user };
  };

  // Authentication: Secure Logout with Firestore Flush & Complete Cache Eviction
  const logout = async () => {
    try {
      const auditEntry: AuditLog = {
        id: `audit_logout_${Date.now()}`,
        school_id: activeSchool.id,
        user_id: currentUser.id,
        user_name: currentUser.name,
        user_role: currentUser.role,
        action: 'USER_LOGOUT',
        entity_type: 'Auth',
        entity_id: currentUser.id,
        details: `User ${currentUser.name} (${currentUser.role}) signed out. Session updated in Firestore and all caches cleared.`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        ip_address: '197.243.112.44 (Kigali, Rwanda)',
      };
      await syncDocToFirestore(FIRESTORE_COLLECTIONS.AUDIT_LOGS, auditEntry.id, auditEntry);
    } catch (err) {
      console.warn('Logout Firestore sync notification:', err);
    }

    // Evict all persistent query caches and application keys
    clearAllLocalCache();

    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && (k.startsWith(STORAGE_KEY) || k.startsWith('elimu360_') || k.includes('cache_first'))) {
          keysToRemove.push(k);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
      sessionStorage.clear();
      if (typeof window !== 'undefined' && 'caches' in window) {
        const cacheKeys = await window.caches.keys();
        await Promise.all(cacheKeys.map(k => window.caches.delete(k)));
      }
    } catch (clearErr) {
      console.warn('Cache clearing notification on logout:', clearErr);
    }

    setIsAuthenticated(false);
    setCurrentUser(INITIAL_USERS[0]);
    setCurrentView('LOGIN');
  };

  // First-Time Password Setup & Single-Use Account Claiming with Bcrypt Hashing
  const claimAccountAndSetPassword = (
    identifier: string, 
    activationToken: string, 
    newPassword: string,
    acceptedTerms: boolean = true
  ) => {
    if (!acceptedTerms) {
      return {
        success: false,
        message: 'You must accept the Elimu360 Terms of Service and Privacy Policy to activate your account.'
      };
    }

    const cleanEmail = identifier.trim().toLowerCase();
    const cleanToken = activationToken.trim().toUpperCase();
    const cleanPass = newPassword.trim();

    // 1. Super Admin is already claimed and permanently active
    if (cleanEmail === 'ishimwepatient001@gmail.com') {
      return {
        success: false,
        message: 'The Super Administrator account is pre-claimed and permanently active. Please sign in directly on the Login tab using your password.'
      };
    }

    // 2. Strict Email Matching: The email must match the exact registered email
    const user = availableUsers.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user) {
      return {
        success: false,
        message: `No registered institutional account found with the email "${cleanEmail}". The email must match the exact one registered by your school administrator.`
      };
    }

    // 3. Role validation: Super admin accounts cannot be claimed
    if (user.role === 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Super Administrator accounts are already claimed and permanently active. Please sign in directly with your password.'
      };
    }

    // 4. Single-Use Constraint: Verify account has not already been claimed or token consumed
    if (user.is_claimed || user.token_used) {
      return {
        success: false,
        message: 'This account has already been claimed and activated. Activation tokens are single-use only. Please sign in using your password.'
      };
    }

    // 5. Token validation: Must match either the user's activation token OR the school registration code / school code
    let linkedSchool: School | undefined;
    if (user.school_id) {
      linkedSchool = availableSchools.find(s => s.id === user.school_id);
    }

    const validTokens = [
      user.activation_token,
      user.issued_activation_token,
      linkedSchool?.registry_code,
      linkedSchool?.code
    ].filter(Boolean).map(t => t!.trim().toUpperCase());

    if (validTokens.length === 0 || !validTokens.includes(cleanToken)) {
      return {
        success: false,
        message: 'Invalid activation code or school registration code. Directors can claim using either their Director Activation Code or the Official School Registry Code.'
      };
    }

    const expectedToken = (user.activation_token || user.issued_activation_token || cleanToken).trim().toUpperCase();

    if (cleanPass.length < 6) {
      return {
        success: false,
        message: 'Password must be at least 6 characters long for security compliance.'
      };
    }

    // Encrypt password using Bcrypt
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(cleanPass, salt);

    // Update user: Mark as claimed, consume token, but preserve issued_activation_token for provider audit
    const updatedUser: User = {
      ...user,
      is_claimed: true,
      must_setup_password: false,
      password_hash: hashedPassword,
      token_used: true,
      issued_activation_token: expectedToken, // Retain for provider audit records
      activation_token: '', // Invalidate active token to prevent reuse
      claimed_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    setAvailableUsers(prev => {
      const nextList = prev.map(u => u.id === updatedUser.id ? updatedUser : u);
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(nextList));
      setLocalCache('users', nextList);
      return nextList;
    });

    setCurrentUser(updatedUser);
    localStorage.setItem(`${STORAGE_KEY}_current_user`, JSON.stringify(updatedUser));
    setIsAuthenticated(true);
    localStorage.setItem(`${STORAGE_KEY}_is_auth`, JSON.stringify(true));

    if (updatedUser.school_id && updatedUser.school_id !== 'all' && updatedUser.school_id !== 'global') {
      const matchSchool = availableSchools.find(s => s.id === updatedUser.school_id);
      if (matchSchool) {
        setActiveSchool(matchSchool);
      }
    }

    // Persist directly to Firestore
    syncUserToFirestore(updatedUser);

    if (updatedUser.role === 'BURSAR') {
      setCurrentView('FINANCIAL_PORTAL');
    } else if (updatedUser.role === 'PARENT') {
      setCurrentView('PARENT_PORTAL');
    } else if (updatedUser.role === 'STUDENT') {
      setCurrentView('STUDENT_PORTAL');
    } else if (updatedUser.role === 'LIBRARIAN') {
      setCurrentView('LIBRARY_PORTAL');
    } else {
      setCurrentView('DASHBOARD');
    }

    logAudit('ACCOUNT_CLAIMED', 'User', updatedUser.id, `User ${updatedUser.name} (${updatedUser.role}) claimed account and configured personal password. Token ${expectedToken} consumed.`);
    triggerConfetti();

    return {
      success: true,
      message: `Account activated successfully! Welcome to Elimu360, ${updatedUser.name}.`,
      user: updatedUser
    };
  };

  // -------------------------------------------------------------
  // EDUCATIONAL LEVEL MANAGEMENT
  // -------------------------------------------------------------
  const getSchoolEducationLevels = (schoolId?: string): SchoolEducationLevel[] => {
    const targetSchoolId = schoolId || activeSchool.id;
    const existing = educationLevels.filter(lvl => lvl.school_id === targetSchoolId);
    if (existing.length > 0) {
      return existing.sort((a, b) => a.order - b.order);
    }
    
    // If not yet generated for this school, seed default 4 levels
    const seededLevels: SchoolEducationLevel[] = DEFAULT_EDUCATION_LEVELS.map(def => ({
      ...def,
      id: `lvl-${targetSchoolId}-${def.level_type.toLowerCase()}`,
      school_id: targetSchoolId
    }));
    
    setEducationLevels(prev => [...prev.filter(l => l.school_id !== targetSchoolId), ...seededLevels]);
    return seededLevels;
  };

  const toggleEducationLevel = (levelId: string, isEnabled: boolean) => {
    setEducationLevels(prev => prev.map(lvl => lvl.id === levelId ? { ...lvl, is_enabled: isEnabled } : lvl));
    const target = educationLevels.find(lvl => lvl.id === levelId);
    if (target) {
      syncDocToFirestore('education_levels', levelId, { ...target, is_enabled: isEnabled });
      logAudit('LEVEL_STATUS_TOGGLED', 'EducationLevel', levelId, `${isEnabled ? 'Enabled' : 'Disabled'} level "${target.name}"`);
    }
  };

  const addCustomEducationLevel = (levelData: Omit<SchoolEducationLevel, 'id' | 'school_id'>) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can configure education levels.' };
    }
    const newId = `lvl-${activeSchool.id}-${Date.now()}`;
    const newLevel: SchoolEducationLevel = {
      ...levelData,
      id: newId,
      school_id: activeSchool.id
    };
    setEducationLevels(prev => [...prev, newLevel]);
    syncDocToFirestore('education_levels', newLevel.id, newLevel);
    logAudit('LEVEL_CREATED', 'EducationLevel', newLevel.id, `Created education level "${newLevel.name}"`);
    return { success: true, message: `Education level "${newLevel.name}" created successfully!`, level: newLevel };
  };

  const updateEducationLevel = (levelId: string, updates: Partial<SchoolEducationLevel>) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can update education levels.' };
    }
    setEducationLevels(prev => prev.map(lvl => lvl.id === levelId ? { ...lvl, ...updates } : lvl));
    const target = educationLevels.find(lvl => lvl.id === levelId);
    if (target) {
      syncDocToFirestore('education_levels', levelId, { ...target, ...updates });
    }
    logAudit('LEVEL_UPDATED', 'EducationLevel', levelId, `Updated education level ${levelId}`);
    return { success: true, message: 'Education level updated successfully!' };
  };

  // -------------------------------------------------------------
  // DYNAMIC CLASS & CURRICULUM MANAGEMENT (DIRECTOR & DOS)
  // -------------------------------------------------------------
  const addClass = (
    clsData: Omit<ClassRoom, 'id' | 'school_id'>,
    subjectTeacherMappings?: { subject_id: string; teacher_id: string; }[]
  ) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can create classes.' };
    }

    // Strict validation: Only users with role === 'TEACHER' can be assigned as Class Teacher
    let validatedClassTeacherId = clsData.class_teacher_id;
    let validatedClassTeacherName = clsData.class_teacher_name;

    if (validatedClassTeacherId) {
      const candidate = availableUsers.find(u => u.id === validatedClassTeacherId);
      if (!candidate || candidate.role !== 'TEACHER') {
        return { 
          success: false, 
          message: 'Validation Error: Only registered teachers (Role: TEACHER) are permitted to be appointed as Class Teacher.' 
        };
      }
      validatedClassTeacherName = candidate.name;
    }

    const calculatedOrderIndex = clsData.order_index ?? getGradeAscendingWeight(clsData.grade_level || clsData.name, clsData.stream);
    const newClassId = `class-${Date.now()}`;
    
    // Determine mapped subject IDs
    const mappedSubjectIds = subjectTeacherMappings && subjectTeacherMappings.length > 0
      ? Array.from(new Set(subjectTeacherMappings.map(m => m.subject_id).filter(Boolean)))
      : (clsData.subject_ids || []);

    const newCls: ClassRoom = {
      ...clsData,
      id: newClassId,
      school_id: activeSchool.id,
      level_name: clsData.level_name || clsData.level || 'General Level',
      level: clsData.level || clsData.level_name || 'General Level',
      order_index: calculatedOrderIndex,
      class_teacher_id: validatedClassTeacherId,
      class_teacher_name: validatedClassTeacherName,
      subject_ids: mappedSubjectIds
    };

    setClasses(prev => sortClassesAscending([...prev, newCls]));
    syncDocToFirestore('classes', newCls.id, newCls);

    // If a class teacher is assigned, update user profile
    if (validatedClassTeacherId) {
      setAvailableUsers(prev => prev.map(u => 
        u.id === validatedClassTeacherId 
          ? { ...u, is_class_teacher: true, class_teacher_for_class_name: newCls.name, assigned_class_id: newCls.id }
          : (u.assigned_class_id === newClassId ? { ...u, is_class_teacher: false, class_teacher_for_class_name: undefined, assigned_class_id: undefined } : u)
      ));
    }

    // Process Subject Teacher Allocations
    if (subjectTeacherMappings && subjectTeacherMappings.length > 0) {
      const newTeacherAssignmentsList: TeacherAssignment[] = [];

      subjectTeacherMappings.forEach(mapping => {
        if (!mapping.subject_id || !mapping.teacher_id) return;
        const sub = subjects.find(s => s.id === mapping.subject_id);
        const tchr = availableUsers.find(u => u.id === mapping.teacher_id);
        if (sub && tchr) {
          const assignmentItem: TeacherAssignment = {
            id: `asgn-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            school_id: activeSchool.id,
            teacher_id: tchr.id,
            teacher_name: tchr.name,
            subject_id: sub.id,
            subject_name: sub.name,
            subject_code: sub.code,
            class_id: newCls.id,
            class_name: newCls.name,
            level_name: newCls.level_name,
            academic_year: activeSchool.active_academic_year,
            term: activeSchool.active_term,
            created_at: new Date().toISOString().substring(0, 10)
          };
          newTeacherAssignmentsList.push(assignmentItem);
          syncDocToFirestore('teacher_assignments', assignmentItem.id, assignmentItem);
        }
      });

      if (newTeacherAssignmentsList.length > 0) {
        setTeacherAssignments(prev => [...prev, ...newTeacherAssignmentsList]);
      }

      // Update applicable_class_ids on subjects
      setSubjects(prev => prev.map(s => {
        if (mappedSubjectIds.includes(s.id)) {
          const cur = s.applicable_class_ids || [];
          return cur.includes(newCls.id) ? s : { ...s, applicable_class_ids: [...cur, newCls.id] };
        }
        return s;
      }));
    }

    logAudit('CLASS_CREATED', 'ClassRoom', newCls.id, `Created class "${newCls.name}" (Ascending Order: ${calculatedOrderIndex}, Level: ${newCls.level_name}, Stream: ${newCls.stream})`);
    return { success: true, message: `Class "${newCls.name}" created successfully with full curriculum mappings!`, newClass: newCls };
  };

  const updateClass = (
    classId: string, 
    updates: Partial<ClassRoom>,
    subjectTeacherMappings?: { subject_id: string; teacher_id: string; }[]
  ) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can update classes.' };
    }

    // Strict validation: Only users with role === 'TEACHER' can be assigned as Class Teacher
    let validatedClassTeacherId = updates.class_teacher_id;
    let validatedClassTeacherName = updates.class_teacher_name;

    if (validatedClassTeacherId) {
      const candidate = availableUsers.find(u => u.id === validatedClassTeacherId);
      if (!candidate || candidate.role !== 'TEACHER') {
        return { 
          success: false, 
          message: 'Validation Error: Only registered teachers (Role: TEACHER) are permitted to be appointed as Class Teacher.' 
        };
      }
      validatedClassTeacherName = candidate.name;
    }

    const target = classes.find(c => c.id === classId);
    if (!target) {
      return { success: false, message: 'Class not found.' };
    }

    const finalGrade = updates.grade_level || target.grade_level || updates.name || target.name;
    const finalStream = updates.stream || target.stream;
    const calculatedOrder = updates.order_index ?? (target.order_index ?? getGradeAscendingWeight(finalGrade, finalStream));

    // Determine mapped subject IDs
    const mappedSubjectIds = subjectTeacherMappings !== undefined
      ? Array.from(new Set(subjectTeacherMappings.map(m => m.subject_id).filter(Boolean)))
      : (updates.subject_ids || target.subject_ids || []);

    const updatedCls: ClassRoom = {
      ...target,
      ...updates,
      order_index: calculatedOrder,
      level_name: updates.level_name || updates.level || target.level_name || target.level || 'General Level',
      level: updates.level || updates.level_name || target.level || target.level_name || 'General Level',
      class_teacher_id: validatedClassTeacherId,
      class_teacher_name: validatedClassTeacherName,
      subject_ids: mappedSubjectIds
    };

    setClasses(prev => sortClassesAscending(prev.map(c => c.id === classId ? updatedCls : c)));
    syncDocToFirestore('classes', classId, updatedCls);

    // If class teacher was updated, sync user profile
    if (updates.class_teacher_id !== undefined) {
      setAvailableUsers(prev => prev.map(u => {
        if (u.id === validatedClassTeacherId) {
          return { ...u, is_class_teacher: true, class_teacher_for_class_name: updatedCls.name, assigned_class_id: classId };
        }
        if (u.assigned_class_id === classId && u.id !== validatedClassTeacherId) {
          return { ...u, is_class_teacher: false, class_teacher_for_class_name: undefined, assigned_class_id: undefined };
        }
        return u;
      }));
    }

    // Process Subject Teacher Allocations if passed
    if (subjectTeacherMappings !== undefined) {
      // Remove previous assignments for this class
      setTeacherAssignments(prev => prev.filter(a => a.class_id !== classId));

      const newTeacherAssignmentsList: TeacherAssignment[] = [];
      subjectTeacherMappings.forEach(mapping => {
        if (!mapping.subject_id || !mapping.teacher_id) return;
        const sub = subjects.find(s => s.id === mapping.subject_id);
        const tchr = availableUsers.find(u => u.id === mapping.teacher_id);
        if (sub && tchr) {
          const assignmentItem: TeacherAssignment = {
            id: `asgn-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
            school_id: activeSchool.id,
            teacher_id: tchr.id,
            teacher_name: tchr.name,
            subject_id: sub.id,
            subject_name: sub.name,
            subject_code: sub.code,
            class_id: updatedCls.id,
            class_name: updatedCls.name,
            level_name: updatedCls.level_name,
            academic_year: activeSchool.active_academic_year,
            term: activeSchool.active_term,
            created_at: new Date().toISOString().substring(0, 10)
          };
          newTeacherAssignmentsList.push(assignmentItem);
          syncDocToFirestore('teacher_assignments', assignmentItem.id, assignmentItem);
        }
      });

      if (newTeacherAssignmentsList.length > 0) {
        setTeacherAssignments(prev => [...prev.filter(a => a.class_id !== classId), ...newTeacherAssignmentsList]);
      }

      // Update applicable_class_ids on subjects
      setSubjects(prev => prev.map(s => {
        const isMapped = mappedSubjectIds.includes(s.id);
        const cur = (s.applicable_class_ids || []).filter(id => id !== classId);
        return isMapped ? { ...s, applicable_class_ids: [...cur, classId] } : { ...s, applicable_class_ids: cur };
      }));
    }

    logAudit('CLASS_UPDATED', 'ClassRoom', classId, `Updated class ${updatedCls.name}`);
    return { success: true, message: 'Class details and curriculum updated successfully!' };
  };

  // -------------------------------------------------------------
  // ANNUAL DELIBERATION & STUDENT PROMOTION ENGINE (DIRECTOR & DOS)
  // -------------------------------------------------------------
  const executeDeliberationPromotion = (params: {
    classId: string;
    academicYear: string;
    decisions: {
      student_id: string;
      decision: 'PROMOTED' | 'RETAINED' | 'CONDITIONAL_PASS' | 'GRADUATED' | 'TRANSFERRED';
      target_class_id?: string;
      target_class_name?: string;
      deliberation_remarks?: string;
    }[];
  }) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { 
        success: false, 
        message: 'Unauthorized: Only Directors and DOS can conduct annual deliberation and student promotion.',
        promotedCount: 0,
        retainedCount: 0,
        graduatedCount: 0
      };
    }

    const currentClass = classes.find(c => c.id === params.classId);
    if (!currentClass) {
      return { 
        success: false, 
        message: 'Source class not found.', 
        promotedCount: 0, 
        retainedCount: 0, 
        graduatedCount: 0 
      };
    }

    // Capture pre-promoted student list for archiving prior to state mutation
    const prePromotedClassStudents = students.filter(s => s.class_id === params.classId && s.school_id === activeSchool.id);
    const pastAcademicYear = activeSchool.active_academic_year || '2025-2026';

    // Automatically archive current class reports for the ending academic year before transitioning
    archiveClassYear(params.classId, pastAcademicYear, prePromotedClassStudents);

    let promotedCount = 0;
    let retainedCount = 0;
    let graduatedCount = 0;

    const decisionMap = new Map(params.decisions.map(d => [d.student_id, d]));

    setStudents(prev => prev.map(student => {
      const decision = decisionMap.get(student.id);
      if (!decision) return student;

      let updatedStudent = { ...student };

      if (decision.decision === 'PROMOTED' || decision.decision === 'CONDITIONAL_PASS') {
        const targetClass = classes.find(c => c.id === decision.target_class_id);
        const targetClassName = targetClass ? targetClass.name : (decision.target_class_name || student.class_name);
        const targetLevelName = targetClass ? targetClass.level_name : student.level_name;

        const randomSeq = Math.floor(100 + Math.random() * 900);
        const nextYear = params.academicYear;
        const schoolCode = activeSchool.code || 'REB';
        const cleanYear = nextYear.replace(/[\/\s-]+/g, '_').substring(0, 9);
        const classPrefix = targetClassName.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase();
        const regNum = `${schoolCode}-${cleanYear}-${classPrefix}-${randomSeq}`;

        updatedStudent = {
          ...updatedStudent,
          class_id: decision.target_class_id || student.class_id,
          class_name: targetClassName,
          level_name: targetLevelName,
          previous_class_name: currentClass.name,
          status: 'ACTIVE',
          deliberation_decision: decision.decision,
          deliberation_year: params.academicYear,
          registration_number: regNum,
          deliberation_notes: decision.deliberation_remarks || 'Promoted to upper class during deliberation'
        };
        promotedCount++;
      } else if (decision.decision === 'RETAINED') {
        const randomSeq = Math.floor(100 + Math.random() * 900);
        const nextYear = params.academicYear;
        const schoolCode = activeSchool.code || 'REB';
        const cleanYear = nextYear.replace(/[\/\s-]+/g, '_').substring(0, 9);
        const classPrefix = currentClass.name.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase();
        const regNum = `${schoolCode}-${cleanYear}-${classPrefix}-${randomSeq}`;

        updatedStudent = {
          ...updatedStudent,
          class_id: currentClass.id,
          class_name: currentClass.name,
          previous_class_name: currentClass.name,
          status: 'ACTIVE',
          deliberation_decision: 'RETAINED',
          deliberation_year: params.academicYear,
          registration_number: regNum,
          deliberation_notes: decision.deliberation_remarks || 'Retained in the same class level'
        };
        retainedCount++;
      } else if (decision.decision === 'GRADUATED') {
        updatedStudent = {
          ...updatedStudent,
          status: 'GRADUATED',
          deliberation_decision: 'GRADUATED',
          deliberation_year: params.academicYear,
          deliberation_notes: decision.deliberation_remarks || 'Successfully completed education cycle & graduated'
        };
        graduatedCount++;
      } else if (decision.decision === 'TRANSFERRED') {
        updatedStudent = {
          ...updatedStudent,
          status: 'TRANSFERRED',
          deliberation_decision: 'TRANSFERRED',
          deliberation_year: params.academicYear,
          deliberation_notes: decision.deliberation_remarks || 'Transferred institution'
        };
      }

      syncDocToFirestore('students', student.id, updatedStudent);
      return updatedStudent;
    }));

    // Auto-register target academic year if not yet registered
    const isYearRegistered = registeredAcademicYears.some(y => y.academic_year.toLowerCase() === params.academicYear.toLowerCase());
    if (!isYearRegistered) {
      const newConfig: AcademicYearConfig = {
        academic_year: params.academicYear,
        terms: ['Term 1', 'Term 2', 'Term 3']
      };
      setRegisteredAcademicYears(prev => [...prev, newConfig]);
      syncDocToFirestore('registered_academic_years', `${activeSchool.id}-${params.academicYear}`, { ...newConfig, school_id: activeSchool.id });
    }

    // Update active school session to the new academic year & Term 1
    updateSchoolProfile(activeSchool.id, {
      active_academic_year: params.academicYear,
      active_term: 'Term 1'
    });

    // Reset student conduct scores to 40/40 for Term 1 of the new academic year
    setStudents(prev => prev.map(s => {
      if (s.school_id === activeSchool.id) {
        const resetStudent = { ...s, conduct_score: 40, conduct_grade: 'Excellent' as const };
        syncDocToFirestore('students', s.id, resetStudent);
        return resetStudent;
      }
      return s;
    }));

    logAudit(
      'DELIBERATION_EXECUTED', 
      'Deliberation', 
      params.classId, 
      `Deliberation completed for ${currentClass.name} (Year ${params.academicYear}): ${promotedCount} Promoted, ${retainedCount} Retained, ${graduatedCount} Graduated. Archived Year ${pastAcademicYear} & reset discipline scores to 40/40.`
    );

    triggerConfetti();

    return {
      success: true,
      message: `Deliberation & Academic Year transition successfully completed for ${currentClass.name}! (${promotedCount} promoted, ${retainedCount} retained, ${graduatedCount} graduated). Past Academic Year ${pastAcademicYear} archived & conduct scores reset to 40/40 for ${params.academicYear} Term 1.`,
      promotedCount,
      retainedCount,
      graduatedCount
    };
  };

  const deleteClass = (classId: string) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can delete classes.' };
    }
    const enrolledCount = students.filter(s => s.class_id === classId).length;
    if (enrolledCount > 0) {
      return { success: false, message: `Cannot delete class: ${enrolledCount} students are currently enrolled in it.` };
    }
    setClasses(prev => prev.filter(c => c.id !== classId));
    // Also remove teacher appointments for this class
    setTeacherAssignments(prev => prev.filter(a => a.class_id !== classId));
    deleteDocFromFirestore('classes', classId);
    logAudit('CLASS_DELETED', 'ClassRoom', classId, `Deleted class ${classId}`);
    return { success: true, message: 'Class removed successfully.' };
  };

  // Exclusive Director Authority over Academic Terms
  const setSchoolTerms = (academicYear: string, activeTerm: string) => {
    if (currentUser.role !== 'SCHOOL_ADMIN' && currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'DOS') {
      return { 
        success: false, 
        message: 'Authorization Denied: Only the School Director / Headmaster or DOS has the authority to configure the Academic Term and Year.' 
      };
    }

    const termChanged = activeTerm !== activeSchool.active_term || academicYear !== activeSchool.active_academic_year;

    // Reset student conduct scores to 40 when changing term/academic year
    if (termChanged) {
      setStudents(prev => prev.map(student => {
        if (student.school_id === activeSchool.id) {
          const updatedStudent = {
            ...student,
            conduct_score: 40,
            conduct_grade: 'Excellent' as const
          };
          syncDocToFirestore('students', student.id, updatedStudent);
          return updatedStudent;
        }
        return student;
      }));

      // Initialize fresh term conduct records
      setStudentConducts(prev => {
        const freshRecords = students
          .filter(s => s.school_id === activeSchool.id)
          .map(student => {
            const condId = `cond-${student.id}-${activeTerm.replace(/\s+/g, '')}`;
            const record: StudentConductRecord = {
              id: condId,
              school_id: activeSchool.id,
              student_id: student.id,
              student_name: `${student.first_name} ${student.last_name}`,
              student_reg: student.registration_number || 'REG-000',
              class_id: student.class_id || '',
              class_name: student.class_name || 'General',
              level_name: student.level_name || 'Standard Level',
              academic_year: academicYear,
              term: activeTerm,
              conduct_score: 40,
              max_score: 40,
              conduct_grade: 'Excellent',
              infractions_count: 0,
              merits_count: 0,
              remarks: `Fresh term conduct record initialized for ${activeTerm}. Past term incidents left in historical archives.`,
              updated_by_id: currentUser.id,
              updated_by_name: currentUser.name,
              updated_at: new Date().toISOString().substring(0, 10)
            };
            syncDocToFirestore('student_conducts', condId, record);
            return record;
          });
        return [...prev.filter(c => c.school_id !== activeSchool.id || c.term !== activeTerm || c.academic_year !== academicYear), ...freshRecords];
      });
    }

    updateSchoolProfile(activeSchool.id, {
      active_academic_year: academicYear,
      active_term: activeTerm
    });
    logAudit('TERM_CONFIG_UPDATED', 'School', activeSchool.id, `Director updated academic session to Year ${academicYear}, ${activeTerm}. Discipline scores reset to 40/40.`);
    return { 
      success: true, 
      message: `Academic session configured to ${academicYear} · ${activeTerm}. All student discipline marks have been reset to 40/40 for the new term, while past term incidents remain preserved in historical logs.` 
    };
  };

  const registerAcademicYear = (year: string, terms: string[]) => {
    if (currentUser.role !== 'SCHOOL_ADMIN' && currentUser.role !== 'SUPER_ADMIN') {
      return { 
        success: false, 
        message: 'Authorization Denied: Only the School Director / Headmaster can register new academic years.' 
      };
    }
    const cleanYear = year.trim();
    if (!cleanYear) {
      return { success: false, message: 'Invalid academic year name.' };
    }
    const exists = registeredAcademicYears.some(y => y.academic_year.toLowerCase() === cleanYear.toLowerCase());
    if (exists) {
      return { success: false, message: `Academic year "${cleanYear}" is already registered.` };
    }
    const newConfig: AcademicYearConfig = {
      academic_year: cleanYear,
      terms: terms && terms.length > 0 ? terms : ['Term 1', 'Term 2', 'Term 3']
    };
    setRegisteredAcademicYears(prev => [...prev, newConfig]);
    syncDocToFirestore('registered_academic_years', `${activeSchool.id}-${cleanYear}`, { ...newConfig, school_id: activeSchool.id });
    logAudit('ACADEMIC_YEAR_REGISTERED', 'School', activeSchool.id, `Director registered academic year "${cleanYear}" with terms ${newConfig.terms.join(', ')}`);
    return { success: true, message: `Academic year "${cleanYear}" registered successfully!` };
  };

  const archiveClassYear = (classId: string, academicYear: string, targetStudents?: Student[]) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { 
        success: false, 
        message: 'Authorization Denied: Only the Director of Studies (DOS) or School Director can archive class records.' 
      };
    }

    const targetClass = classes.find(c => c.id === classId);
    if (!targetClass) {
      return { success: false, message: 'Class not found.' };
    }

    // Get all students enrolled in this class or pre-promoted list
    const classStudentsList = targetStudents && targetStudents.length > 0 
      ? targetStudents 
      : students.filter(s => s.class_id === classId || s.previous_class_name === targetClass.name);

    if (classStudentsList.length === 0) {
      return { success: false, message: `No students are currently enrolled in class "${targetClass.name}" to archive.` };
    }

    // Archive identifier
    const archiveId = `arc-${classId}-${academicYear.replace(/[\/\s-]+/g, '_')}`;

    // Compile annual reports for all students in this class for the selected academic year
    const activeSubjects = subjects.filter(s => !s.school_id || s.school_id === activeSchool.id || s.school_id === 'all');
    
    const compiledCards = generateClassReportCards({
      selectedClass: targetClass,
      students: classStudentsList,
      grades: grades,
      subjects: activeSubjects,
      term: 'Term 3', // For annual, Term 3 aggregates Term 1, 2, 3 internally!
      academicYear: academicYear,
      reportMode: 'ANNUAL',
      reportType: 'ANNUAL',
      school: activeSchool
    });

    const newArchive: ArchivedClass = {
      id: archiveId,
      school_id: activeSchool.id,
      class_id: classId,
      class_name: targetClass.name,
      academic_year: academicYear,
      archived_at: new Date().toISOString(),
      reports: compiledCards
    };

    setArchivedClasses(prev => {
      const filtered = prev.filter(ac => ac.id !== archiveId);
      return [...filtered, newArchive];
    });
    syncDocToFirestore('archived_classes', archiveId, newArchive);
    logAudit('CLASS_ARCHIVED', 'ClassRoom', classId, `Archived class "${targetClass.name}" annual reports for Year ${academicYear}`);

    return { 
      success: true, 
      message: `Successfully archived ${compiledCards.length} student report cards for class "${targetClass.name}" (${academicYear}).` 
    };
  };

  const addSubject = (subjectData: Omit<Subject, 'id' | 'school_id'>) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can create subjects.' };
    }
    const newSubjectId = `sub-${Date.now()}`;
    const newSub: Subject = {
      ...subjectData,
      id: newSubjectId,
      school_id: activeSchool.id
    };
    setSubjects(prev => [...prev, newSub]);
    syncDocToFirestore('subjects', newSub.id, newSub);
    logAudit('SUBJECT_CREATED', 'Subject', newSub.id, `Created subject "${newSub.name}" (${newSub.code})`);
    return { success: true, message: `Subject "${newSub.name}" created successfully!`, newSubject: newSub };
  };

  const updateSubject = (subjectId: string, updates: Partial<Subject>) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can update subjects.' };
    }
    setSubjects(prev => prev.map(s => s.id === subjectId ? { ...s, ...updates } : s));
    const target = subjects.find(s => s.id === subjectId);
    if (target) {
      syncDocToFirestore('subjects', subjectId, { ...target, ...updates });
    }
    logAudit('SUBJECT_UPDATED', 'Subject', subjectId, `Updated subject ${subjectId}`);
    return { success: true, message: 'Subject updated successfully!' };
  };

  const deleteSubject = (subjectId: string) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can delete subjects.' };
    }
    setSubjects(prev => prev.filter(s => s.id !== subjectId));
    setTeacherAssignments(prev => prev.filter(a => a.subject_id !== subjectId));
    deleteDocFromFirestore('subjects', subjectId);
    logAudit('SUBJECT_DELETED', 'Subject', subjectId, `Deleted subject ${subjectId}`);
    return { success: true, message: 'Subject removed successfully.' };
  };

  const assignSubjectsToClass = (classId: string, subjectIds: string[]) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized.' };
    }
    setClasses(prev => prev.map(c => c.id === classId ? { ...c, subject_ids: subjectIds } : c));
    setSubjects(prev => prev.map(s => {
      const isSelected = subjectIds.includes(s.id);
      const currentClasses = s.applicable_class_ids || [];
      const updatedClasses = isSelected
        ? Array.from(new Set([...currentClasses, classId]))
        : currentClasses.filter(id => id !== classId);
      return { ...s, applicable_class_ids: updatedClasses };
    }));
    logAudit('CLASS_SUBJECTS_ASSIGNED', 'ClassRoom', classId, `Mapped ${subjectIds.length} subjects to class`);
    return { success: true, message: 'Class curriculum subjects updated successfully.' };
  };

  // -------------------------------------------------------------
  // TEACHER APPOINTMENTS & SUBJECT ASSIGNMENT (DIRECTOR & DOS)
  // -------------------------------------------------------------
  const appointTeacherToSubject = (teacherId: string, subjectId: string, classId: string) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized: Only Directors and DOS can assign teachers to subjects.' };
    }
    const teacher = availableUsers.find(u => u.id === teacherId);
    const subject = subjects.find(s => s.id === subjectId);
    const classRoom = classes.find(c => c.id === classId);

    if (!teacher || !subject || !classRoom) {
      return { success: false, message: 'Invalid assignment parameters: Teacher, Subject or Class not found.' };
    }

    // Role-based governance: Only pure teachers can be appointed to classes
    if (teacher.role !== 'TEACHER') {
      return {
        success: false,
        message: `Role-Based Governance Restriction: Staff member ${teacher.name} has role "${teacher.role}". Leadership roles (DOS, DOD, Bursar, Librarian, Admin) cannot be appointed to teach classes.`
      };
    }

    // Check if duplicate assignment exists
    const exists = teacherAssignments.some(
      a => a.teacher_id === teacherId && a.subject_id === subjectId && a.class_id === classId && a.school_id === activeSchool.id
    );
    if (exists) {
      return { success: false, message: `${teacher.name} is already appointed to teach ${subject.name} in ${classRoom.name}.` };
    }

    const newAssignment: TeacherAssignment = {
      id: `asgn-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      school_id: activeSchool.id,
      teacher_id: teacher.id,
      teacher_name: teacher.name,
      subject_id: subject.id,
      subject_name: subject.name,
      subject_code: subject.code,
      class_id: classRoom.id,
      class_name: classRoom.name,
      level_name: classRoom.level_name || classRoom.level || 'Standard Level',
      academic_year: activeSchool.active_academic_year,
      term: activeSchool.active_term,
      created_at: new Date().toISOString().substring(0, 10)
    };

    setTeacherAssignments(prev => [...prev, newAssignment]);
    syncDocToFirestore('teacher_assignments', newAssignment.id, newAssignment);

    // Update teacher's subject names array on user record for convenience
    setAvailableUsers(prev => prev.map(u => {
      if (u.id === teacherId) {
        const existingSubjects = u.subject_names || [];
        if (!existingSubjects.includes(subject.name)) {
          return { ...u, subject_names: [...existingSubjects, subject.name] };
        }
      }
      return u;
    }));

    logAudit('TEACHER_APPOINTED', 'TeacherAssignment', newAssignment.id, `Appointed ${teacher.name} to ${subject.name} in ${classRoom.name} (${newAssignment.level_name})`);
    return { 
      success: true, 
      message: `Successfully appointed ${teacher.name} to teach ${subject.name} in ${classRoom.name}.`,
      assignment: newAssignment 
    };
  };

  const removeTeacherAssignment = (assignmentId: string) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized.' };
    }
    setTeacherAssignments(prev => prev.filter(a => a.id !== assignmentId));
    deleteDocFromFirestore('teacher_assignments', assignmentId);
    logAudit('TEACHER_ASSIGNMENT_REMOVED', 'TeacherAssignment', assignmentId, `Removed teacher assignment ${assignmentId}`);
    return { success: true, message: 'Teacher assignment removed successfully.' };
  };

  const assignClassTeacher = (classId: string, teacherId?: string) => {
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return { success: false, message: 'Unauthorized.' };
    }
    const classRoom = classes.find(c => c.id === classId);
    if (!classRoom) {
      return { success: false, message: 'Class not found.' };
    }

    const teacher = teacherId ? availableUsers.find(u => u.id === teacherId) : undefined;
    
    if (teacher && teacher.role !== 'TEACHER') {
      return {
        success: false,
        message: `Role-Based Governance Restriction: Staff member ${teacher.name} has role "${teacher.role}". Leadership roles (DOS, DOD, Bursar, Librarian, Admin) cannot be appointed as class teachers.`
      };
    }
    
    // Update class
    updateClass(classId, {
      class_teacher_id: teacher?.id || undefined,
      class_teacher_name: teacher?.name || undefined
    });

    logAudit('CLASS_TEACHER_ASSIGNED', 'ClassRoom', classId, `${teacher ? `Assigned ${teacher.name} as Class Teacher for ${classRoom.name}` : `Removed Class Teacher for ${classRoom.name}`}`);
    return { success: true, message: teacher ? `Assigned ${teacher.name} as Class Teacher for ${classRoom.name}.` : `Class Teacher unassigned.` };
  };

  const getTeacherAssignments = (teacherId: string): TeacherAssignment[] => {
    return teacherAssignments.filter(a => a.teacher_id === teacherId && a.school_id === activeSchool.id);
  };

  // -------------------------------------------------------------
  // STUDENT CONDUCT & DISCIPLINE (DOD ROLE)
  // -------------------------------------------------------------
  const getStudentConduct = (studentId: string, term?: string): StudentConductRecord => {
    const activeTermName = term || activeSchool.active_term;
    const existing = studentConducts.find(
      c => c.student_id === studentId && c.school_id === activeSchool.id && c.term === activeTermName
    );
    if (existing) return existing;

    const student = students.find(s => s.id === studentId);
    return {
      id: `cond-${studentId}-${activeTermName.replace(/\s+/g, '')}`,
      school_id: activeSchool.id,
      student_id: studentId,
      student_name: student ? `${student.first_name} ${student.last_name}` : 'Unknown Student',
      student_reg: student?.registration_number || 'REG-000',
      class_id: student?.class_id || '',
      class_name: student?.class_name || 'General',
      level_name: student?.level_name || 'Standard Level',
      academic_year: activeSchool.active_academic_year,
      term: activeTermName,
      conduct_score: student?.conduct_score ?? 40,
      max_score: 40,
      conduct_grade: (student?.conduct_grade as StudentConductRecord['conduct_grade']) || 'Excellent',
      infractions_count: 0,
      merits_count: 0,
      remarks: 'Exemplary behavioral record.',
      updated_by_id: currentUser.id,
      updated_by_name: currentUser.name,
      updated_at: new Date().toISOString().substring(0, 10)
    };
  };

  const updateStudentConduct = (studentId: string, updates: {
    conduct_score?: number;
    conduct_grade?: StudentConductRecord['conduct_grade'];
    status?: StudentConductRecord['status'];
    remarks?: string;
    merits_count?: number;
    commendations_count?: number;
    infractions_count?: number;
    demerits_count?: number;
  }) => {
    const student = students.find(s => s.id === studentId);
    if (!student) {
      return { success: false, message: 'Student not found.' };
    }

    const currentRecord = getStudentConduct(studentId);
    const newScore = updates.conduct_score !== undefined ? updates.conduct_score : currentRecord.conduct_score;
    
    // Derive grade based on Rwanda REB standard (out of 40)
    let derivedGrade = updates.conduct_grade || currentRecord.conduct_grade;
    if (!updates.conduct_grade && updates.conduct_score !== undefined) {
      if (newScore >= 36) derivedGrade = 'A';
      else if (newScore >= 30) derivedGrade = 'B';
      else if (newScore >= 24) derivedGrade = 'C';
      else if (newScore >= 16) derivedGrade = 'D';
      else derivedGrade = 'F';
    }

    const updatedRecord: StudentConductRecord = {
      ...currentRecord,
      ...updates,
      conduct_score: newScore,
      conduct_grade: derivedGrade,
      status: updates.status || currentRecord.status || 'GOOD',
      demerits_count: updates.demerits_count ?? updates.infractions_count ?? currentRecord.demerits_count ?? currentRecord.infractions_count,
      commendations_count: updates.commendations_count ?? updates.merits_count ?? currentRecord.commendations_count ?? currentRecord.merits_count,
      updated_by_id: currentUser.id,
      updated_by_name: currentUser.name,
      updated_at: new Date().toISOString().substring(0, 10)
    };

    setStudentConducts(prev => {
      const idx = prev.findIndex(c => c.student_id === studentId && c.term === activeSchool.active_term && c.school_id === activeSchool.id);
      if (idx >= 0) {
        const arr = [...prev];
        arr[idx] = updatedRecord;
        return arr;
      }
      return [...prev, updatedRecord];
    });

    // Sync conduct score to student profile
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, conduct_score: newScore, conduct_grade: derivedGrade } : s));

    syncDocToFirestore('student_conducts', updatedRecord.id, updatedRecord);
    logAudit('CONDUCT_UPDATED', 'StudentConduct', updatedRecord.id, `${currentUser.name} (${currentUser.role}) updated conduct for ${student.first_name} ${student.last_name}: ${newScore}/40 (${derivedGrade})`);
    
    return { success: true, message: `Conduct updated for ${student.first_name} ${student.last_name}.`, record: updatedRecord };
  };

  const bulkUpdateClassConduct = (classId: string, conductScore: number, status?: StudentConductRecord['status'], remarks?: string) => {
    const classStudents = students.filter(s => s.class_id === classId);
    if (classStudents.length === 0) {
      return { success: false, count: 0, message: 'No students found in this class.' };
    }

    let grade: StudentConductRecord['conduct_grade'] = 'A';
    if (conductScore >= 36) grade = 'A';
    else if (conductScore >= 30) grade = 'B';
    else if (conductScore >= 24) grade = 'C';
    else if (conductScore >= 16) grade = 'D';
    else grade = 'F';

    classStudents.forEach(st => {
      updateStudentConduct(st.id, {
        conduct_score: conductScore,
        conduct_grade: grade,
        status: status || 'EXEMPLARY',
        remarks: remarks || `Batch conduct update for ${st.class_name}`
      });
    });

    return { success: true, count: classStudents.length, message: `Updated conduct for ${classStudents.length} students to ${conductScore}/40.` };
  };

  // Super Admin: Register New School Profile & Provision Initial School Director
  const registerSchoolBySuperAdmin = (payload: SchoolRegistrationPayload) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Authorization Denied: Only Super Admin can register new school profiles.'
      };
    }

    // Generate conflict-free abbreviation code if payload code matches an existing one or was generated
    const computedCode = payload.code 
      ? generateUniqueSchoolCodeHelper(payload.name, availableSchools).toUpperCase()
      : generateUniqueSchoolCodeHelper(payload.name, availableSchools);

    const finalCode = payload.code?.trim() 
      ? (availableSchools.some(s => s.code.toUpperCase() === payload.code.trim().toUpperCase())
          ? generateUniqueSchoolCodeHelper(payload.name, availableSchools)
          : payload.code.trim().toUpperCase())
      : computedCode;

    const schoolId = `school-${finalCode.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString().slice(-4)}`;
    const newSchool: School = {
      id: schoolId,
      name: payload.name.trim(),
      code: finalCode,
      curriculum_type: payload.curriculum_type,
      ownership_type: payload.ownership_type || 'PRIVATE',
      accommodation_type: payload.accommodation_type || 'BOTH',
      country: payload.country || 'Rwanda',
      city: payload.city.trim(),
      contact_email: payload.contact_email.trim(),
      phone: payload.phone.trim(),
      motto: payload.motto || 'Excellence in 21st Century Education',
      logo_url: payload.logo_url?.trim() || '',
      national_coat_of_arms_url: activeSchool?.national_coat_of_arms_url || '',
      active_academic_year: payload.active_academic_year || '2026',
      active_term: payload.active_term || 'Term 2',
      currency: 'RWF',
      is_active: true,
      pilot_status: 'FIRST_TERM_PILOT',
      pilot_started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      registered_by_id: currentUser.id,
      registered_by_name: currentUser.name,
      registered_by_role: currentUser.role,
      estimated_students: Number(payload.estimated_students) || 0,
      onboarding_survey: payload.onboarding_survey ? {
        ...payload.onboarding_survey,
        id: `survey-${schoolId}`,
        school_id: schoolId,
        school_name: payload.name.trim(),
        conducted_by_id: currentUser.id,
        conducted_by_name: currentUser.name,
        conducted_by_role: currentUser.role,
        conducted_at: new Date().toISOString()
      } : undefined
    };

    // Auto-generate Director claim token
    const directorClaimToken = `DIR-${finalCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    const directorUser: User = {
      id: `user-dir-${Date.now()}`,
      name: payload.director_name.trim(),
      email: payload.director_email.trim(),
      phone: payload.director_phone.trim(),
      role: 'SCHOOL_ADMIN',
      school_id: schoolId,
      avatar_url: '',
      title: 'School Director / Headmaster',
      is_claimed: false,
      activation_token: directorClaimToken,
      issued_activation_token: directorClaimToken,
      token_used: false,
      must_setup_password: true,
      created_by_role: 'SUPER_ADMIN',
      created_by_id: currentUser.id,
      created_by_name: currentUser.name,
      created_at: new Date().toISOString().substring(0, 10),
      is_active: true
    };

    setAvailableSchools(prev => {
      const next = [...prev, newSchool];
      setLocalCache('schools', next);
      return next;
    });

    setAvailableUsers(prev => {
      const next = [...prev, directorUser];
      setLocalCache('users', next);
      return next;
    });

    syncDocToFirestore('schools', newSchool.id, newSchool);
    syncDocToFirestore('users', directorUser.id, directorUser);

    logAudit('SCHOOL_REGISTERED', 'School', newSchool.id, `Super Admin registered school profile for "${newSchool.name}" (Code: ${finalCode}) and provisioned Director account for ${directorUser.name} (Claim Token: ${directorClaimToken})`);

    return {
      success: true,
      school: newSchool,
      director: directorUser,
      message: `School "${newSchool.name}" registered successfully with Code [${finalCode}]. Director invitation generated with Token: ${directorClaimToken}`
    };
  };

  // Super Admin: Delete School Institution & Cascade Associated Tenant Records
  const deleteSchool = (schoolId: string) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Authorization Denied: Only Super Admin has authority to delete institutional profiles.'
      };
    }

    const targetSchool = availableSchools.find(s => s.id === schoolId);
    if (!targetSchool) {
      return {
        success: false,
        message: 'Institution profile not found.'
      };
    }

    // 1. Remove from available schools
    const updatedSchools = availableSchools.filter(s => s.id !== schoolId);
    setAvailableSchools(updatedSchools);
    localStorage.setItem(`${STORAGE_KEY}_schools`, JSON.stringify(updatedSchools));
    setLocalCache('schools', updatedSchools);

    // 2. Remove associated users (preserve Super Admins)
    const remainingUsers = availableUsers.filter(u => u.school_id !== schoolId || u.role === 'SUPER_ADMIN');
    setAvailableUsers(remainingUsers);
    localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(remainingUsers));
    setLocalCache('users', remainingUsers);

    // 3. Remove scoped data
    setClasses(prev => prev.filter(c => c.school_id !== schoolId));
    setSubjects(prev => prev.filter(s => s.school_id !== schoolId));
    setStudents(prev => prev.filter(s => s.school_id !== schoolId));
    setFeeStructures(prev => prev.filter(f => f.school_id !== schoolId));
    setPayments(prev => prev.filter(p => p.school_id !== schoolId));
    setGrades(prev => prev.filter(g => g.school_id !== schoolId));
    setAttendance(prev => prev.filter(a => a.school_id !== schoolId));
    setTimetable(prev => prev.filter(t => t.school_id !== schoolId));
    setDisciplineIncidents(prev => prev.filter(d => d.school_id !== schoolId));
    setBooks(prev => prev.filter(b => b.school_id !== schoolId));
    setBorrowRecords(prev => prev.filter(b => b.school_id !== schoolId));
    setPermissions(prev => prev.filter(p => p.school_id !== schoolId));
    setMaterials(prev => prev.filter(m => m.school_id !== schoolId));
    setAssignments(prev => prev.filter(a => a.school_id !== schoolId));
    setSubmissions(prev => prev.filter(s => s.school_id !== schoolId));

    // 4. If active school was deleted, switch to next available or blank template
    if (activeSchool.id === schoolId) {
      if (updatedSchools.length > 0) {
        setActiveSchool(updatedSchools[0]);
        localStorage.setItem(`${STORAGE_KEY}_active_school`, JSON.stringify(updatedSchools[0]));
      } else {
        const fallback = EMPTY_DEFAULT_SCHOOL;
        setActiveSchool(fallback);
        localStorage.setItem(`${STORAGE_KEY}_active_school`, JSON.stringify(fallback));
      }
    }

    // 5. Delete document in Firestore in background
    deleteDocFromFirestore('schools', schoolId);
    const usersToDelete = availableUsers.filter(u => u.school_id === schoolId && u.role !== 'SUPER_ADMIN');
    usersToDelete.forEach(u => deleteDocFromFirestore('users', u.id));

    logAudit('SCHOOL_DELETED', 'School', schoolId, `Super Admin deleted institutional profile for "${targetSchool.name}" (${targetSchool.code}) and all associated records.`);

    return {
      success: true,
      message: `Institution "${targetSchool.name}" (${targetSchool.code}) has been permanently deleted.`
    };
  };

  // Unique School Code Generation with automatic context awareness
  const generateUniqueSchoolCode = (name: string, excludeSchoolId?: string): string => {
    return generateUniqueSchoolCodeHelper(name, availableSchools, excludeSchoolId);
  };

  // Staff Registration Delegation (Strict Hierarchy Enforcement)
  const registerStaffMember = (payload: StaffRegistrationPayload) => {
    // 1. Validate Bursar & DOD registration rule: "Bursar and DOD will be registered by only the Director as an exception"
    if (payload.role === 'BURSAR' && !['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(currentUser.role)) {
      return {
        success: false,
        message: 'Security Policy Constraint: Only the School Director/Headmaster is authorized to register the Chief Bursar.'
      };
    }

    if (payload.role === 'DOD' && !['SUPER_ADMIN', 'SCHOOL_ADMIN'].includes(currentUser.role)) {
      return {
        success: false,
        message: 'Security Policy Constraint: Only the School Director/Headmaster is authorized to register the Director of Discipline (DOD).'
      };
    }

    // 2. Validate DOS registration permissions: DOS can register Teachers and Librarians
    if (currentUser.role === 'DOS' && !['TEACHER', 'LIBRARIAN'].includes(payload.role)) {
      return {
        success: false,
        message: 'Security Policy Constraint: Director of Studies (DOS) can only register Teachers and Librarians.'
      };
    }

    // 3. Prevent unauthorized roles
    if (!['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS'].includes(currentUser.role)) {
      return {
        success: false,
        message: 'Unauthorized: You do not have permission to register staff.'
      };
    }

    // Check for duplicate email
    if (availableUsers.some(u => u.email.toLowerCase() === payload.email.toLowerCase())) {
      return {
        success: false,
        message: `A user with email ${payload.email} already exists.`
      };
    }

    const rolePrefix = payload.role.substring(0, 3);
    const token = `${rolePrefix}-${activeSchool.code}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStaff: User = {
      id: `user-${payload.role.toLowerCase()}-${Date.now()}`,
      name: payload.name,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      school_id: activeSchool.id,
      avatar_url: '',
      title: payload.title || payload.role.replace('_', ' '),
      subject_names: payload.subject_names,
      assigned_class_id: payload.assigned_class_id,
      is_claimed: false,
      activation_token: token,
      must_setup_password: true,
      created_by_role: currentUser.role,
      created_by_id: currentUser.id,
      created_by_name: currentUser.name,
      created_at: new Date().toISOString().substring(0, 10),
      is_active: true
    };

    setAvailableUsers(prev => [...prev, newStaff]);
    syncDocToFirestore('users', newStaff.id, newStaff);

    logAudit('STAFF_REGISTERED', 'User', newStaff.id, `${currentUser.name} (${currentUser.role}) registered ${newStaff.role}: ${newStaff.name} (Activation Token: ${token})`);

    return {
      success: true,
      staff: newStaff,
      message: `${newStaff.title || newStaff.role} (${newStaff.name}) registered successfully. Activation Token: ${token}`
    };
  };

  // -------------------------------------------------------------
  // COORDINATOR & REGISTRAR GOVERNANCE SYSTEM
  // -------------------------------------------------------------

  // 1. Register Regional Coordinator (Super Admin Only)
  const registerCoordinator = (payload: { name: string; email: string; phone: string; title?: string }) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Security Restriction: Only the Super Administrator is authorized to register Regional Coordinators.'
      };
    }

    if (availableUsers.some(u => u.email.toLowerCase() === payload.email.trim().toLowerCase())) {
      return {
        success: false,
        message: `An institutional user account with email "${payload.email}" already exists.`
      };
    }

    const token = `COORD-${Math.floor(1000 + Math.random() * 9000)}`;
    const newCoordinator: User = {
      id: `user-coord-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      role: 'COORDINATOR',
      school_id: 'global',
      avatar_url: '',
      title: payload.title || 'Regional System Coordinator',
      max_registrars_quota: 15,
      is_claimed: false,
      activation_token: token,
      must_setup_password: true,
      created_by_role: 'SUPER_ADMIN',
      created_by_id: currentUser.id,
      created_by_name: currentUser.name,
      created_at: new Date().toISOString().substring(0, 10),
      is_active: true
    };

    setAvailableUsers(prev => [...prev, newCoordinator]);
    syncUserToFirestore(newCoordinator);

    logAudit('COORDINATOR_REGISTERED', 'User', newCoordinator.id, `Super Admin ${currentUser.name} registered Coordinator: ${newCoordinator.name} (${newCoordinator.email}). Activation Token: ${token}`);

    return {
      success: true,
      coordinator: newCoordinator,
      message: `Regional Coordinator "${newCoordinator.name}" registered successfully! Activation Code: ${token}`
    };
  };

  // 2. Register School Registrar (Super Admin or Coordinator; Max 15 per Coordinator)
  const registerRegistrar = (payload: { name: string; email: string; phone: string; title?: string; assigned_coordinator_id?: string }) => {
    if (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'COORDINATOR') {
      return {
        success: false,
        message: 'Unauthorized: Only Super Administrators and Regional Coordinators can register School Registrars.'
      };
    }

    if (availableUsers.some(u => u.email.toLowerCase() === payload.email.trim().toLowerCase())) {
      return {
        success: false,
        message: `An institutional user account with email "${payload.email}" already exists.`
      };
    }

    // Determine target Coordinator
    let targetCoordId = payload.assigned_coordinator_id;
    if (currentUser.role === 'COORDINATOR') {
      targetCoordId = currentUser.id;
    }

    if (!targetCoordId) {
      return {
        success: false,
        message: 'Assignment Error: Every Registrar must be assigned to an active Regional Coordinator.'
      };
    }

    const coordinatorUser = availableUsers.find(u => u.id === targetCoordId && u.role === 'COORDINATOR');
    if (!coordinatorUser) {
      return {
        success: false,
        message: 'Selected Regional Coordinator not found in active system records.'
      };
    }

    // Strict Quota Rule: A Coordinator cannot manage more than 15 active Registrars
    const currentActiveRegistrarsCount = availableUsers.filter(u => 
      u.role === 'REGISTER' && 
      u.assigned_coordinator_id === targetCoordId && 
      u.is_active !== false && 
      !u.is_deleted_by_coordinator
    ).length;

    if (currentActiveRegistrarsCount >= 15) {
      return {
        success: false,
        message: `Quota Exceeded: Coordinator "${coordinatorUser.name}" is already managing 15 active Registrars. A Coordinator cannot monitor or control more than 15 Registrars.`
      };
    }

    const token = `REG-${Math.floor(1000 + Math.random() * 9000)}`;
    const newRegistrar: User = {
      id: `user-registrar-${Date.now()}`,
      name: payload.name.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      role: 'REGISTER',
      school_id: 'global',
      avatar_url: '',
      title: payload.title || 'Field School Registrar',
      assigned_coordinator_id: coordinatorUser.id,
      assigned_coordinator_name: coordinatorUser.name,
      is_claimed: false,
      activation_token: token,
      must_setup_password: true,
      created_by_role: currentUser.role,
      created_by_id: currentUser.id,
      created_by_name: currentUser.name,
      created_at: new Date().toISOString().substring(0, 10),
      is_active: true
    };

    setAvailableUsers(prev => [...prev, newRegistrar]);
    syncUserToFirestore(newRegistrar);

    logAudit('REGISTRAR_REGISTERED', 'User', newRegistrar.id, `${currentUser.name} (${currentUser.role}) registered Registrar "${newRegistrar.name}" assigned to Coordinator "${coordinatorUser.name}" (${currentActiveRegistrarsCount + 1}/15). Token: ${token}`);

    return {
      success: true,
      registrar: newRegistrar,
      message: `School Registrar "${newRegistrar.name}" registered under Coordinator "${coordinatorUser.name}" (${currentActiveRegistrarsCount + 1}/15). Activation Code: ${token}`
    };
  };

  // 3. Register School via Registrar (or Coordinator / Super Admin)
  const registerSchoolByRegistrar = (payload: SchoolRegistrationPayload) => {
    if (!['REGISTER', 'COORDINATOR', 'SUPER_ADMIN'].includes(currentUser.role)) {
      return {
        success: false,
        message: 'Unauthorized: Only School Registrars, Coordinators, or Super Admins can onboard new schools.'
      };
    }

    // Strict Accreditation Requirement: Registrar or Coordinator MUST be certified before registering a school
    if ((currentUser.role === 'REGISTER' || currentUser.role === 'COORDINATOR') && !currentUser.has_passed_training) {
      return {
        success: false,
        message: 'Accreditation Required: You must complete and pass the Field Training Academy Examination (80%+) before registering your first institution.'
      };
    }

    // Strict Pre-Approval Onboarding Survey Requirement
    if (!payload.onboarding_survey) {
      return {
        success: false,
        message: 'Pre-Approval Survey Required: You must complete the Pre-Registration Product Development Survey before submitting the school for registration or approval.'
      };
    }

    const cleanCode = generateUniqueSchoolCode(payload.name);
    const newSchoolId = `school-${cleanCode.toLowerCase()}-${Date.now()}`;

    // Determine Coordinator relationship
    let assignedCoordId = '';
    let assignedCoordName = '';
    if (currentUser.role === 'REGISTER') {
      assignedCoordId = currentUser.assigned_coordinator_id || '';
      assignedCoordName = currentUser.assigned_coordinator_name || '';
    } else if (currentUser.role === 'COORDINATOR') {
      assignedCoordId = currentUser.id;
      assignedCoordName = currentUser.name;
    }

    const isDirectAutoApproved = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'COORDINATOR';
    const approvedRegistryCode = isDirectAutoApproved ? `REG-2026-${Math.floor(1000 + Math.random() * 9000)}` : 'PENDING_APPROVAL';

    const newSchool: School = {
      id: newSchoolId,
      name: payload.name.trim(),
      code: cleanCode,
      curriculum_type: payload.curriculum_type,
      ownership_type: payload.ownership_type || 'PRIVATE',
      accommodation_type: payload.accommodation_type || 'BOTH',
      country: payload.country || 'Rwanda',
      city: payload.city || 'Kigali',
      district: payload.district || '',
      province: payload.province || '',
      contact_email: payload.contact_email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      motto: payload.motto.trim() || 'Excellence in Education',
      logo_url: payload.logo_url || '',
      active_academic_year: '2025-2026',
      active_term: 'Term 1',
      currency: 'RWF',
      is_active: isDirectAutoApproved,
      director_name: payload.director_name.trim(),
      director_email: payload.director_email.trim().toLowerCase(),
      director_phone: payload.director_phone.trim(),
      registered_by_id: currentUser.id,
      registered_by_name: currentUser.name,
      registered_by_role: currentUser.role,
      coordinator_id: assignedCoordId,
      coordinator_name: assignedCoordName,
      approval_status: isDirectAutoApproved ? 'APPROVED' : 'PENDING',
      registry_code: approvedRegistryCode,
      approved_by_id: isDirectAutoApproved ? currentUser.id : undefined,
      approved_by_name: isDirectAutoApproved ? currentUser.name : undefined,
      approved_at: isDirectAutoApproved ? new Date().toISOString() : undefined,
      estimated_students: Number(payload.estimated_students) || 0,
      pilot_status: 'FIRST_TERM_PILOT',
      pilot_started_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      onboarding_survey: payload.onboarding_survey ? {
        ...payload.onboarding_survey,
        id: `survey-${newSchoolId}`,
        school_id: newSchoolId,
        school_name: payload.name.trim(),
        conducted_by_id: currentUser.id,
        conducted_by_name: currentUser.name,
        conducted_by_role: currentUser.role,
        conducted_at: new Date().toISOString()
      } : undefined
    };

    // Auto-create Director Account for this school
    const dirToken = `DIR-${cleanCode}-${Math.floor(1000 + Math.random() * 9000)}`;
    const newDirector: User = {
      id: `user-director-${newSchoolId}`,
      name: payload.director_name.trim(),
      email: payload.director_email.trim().toLowerCase(),
      phone: payload.director_phone.trim(),
      role: 'SCHOOL_ADMIN',
      school_id: newSchoolId,
      avatar_url: '',
      title: 'School Director / Headmaster',
      is_claimed: false,
      activation_token: dirToken,
      must_setup_password: true,
      created_by_role: currentUser.role,
      created_by_id: currentUser.id,
      created_by_name: currentUser.name,
      created_at: new Date().toISOString().substring(0, 10),
      is_active: isDirectAutoApproved
    };

    setAvailableSchools(prev => [newSchool, ...prev]);
    setAvailableUsers(prev => [newDirector, ...prev]);

    syncDocToFirestore('schools', newSchool.id, newSchool);
    syncUserToFirestore(newDirector);

    logAudit(
      'SCHOOL_ONBOARDED_BY_REGISTRAR',
      'School',
      newSchool.id,
      `School "${newSchool.name}" registered by ${currentUser.name} (${currentUser.role}). Approval Status: ${newSchool.approval_status}. Director token: ${dirToken}`
    );

    return {
      success: true,
      school: newSchool,
      message: isDirectAutoApproved
        ? `School "${newSchool.name}" successfully registered and auto-approved with Registry Code "${approvedRegistryCode}". Director Activation Code: ${dirToken}`
        : `School "${newSchool.name}" submitted for Coordinator Registry Code approval! Director Activation Code: ${dirToken}`
    };
  };

  // Toggle or Update School Pilot Badge Status (Super Admin / Coordinator)
  const toggleSchoolPilotStatus = (schoolId: string, statusOverride?: 'FIRST_TERM_PILOT' | 'LOYAL') => {
    const target = availableSchools.find(s => s.id === schoolId);
    if (!target) return { success: false, message: 'School profile not found.' };

    const nextStatus: 'FIRST_TERM_PILOT' | 'LOYAL' = statusOverride 
      ? statusOverride 
      : (target.pilot_status === 'LOYAL' ? 'FIRST_TERM_PILOT' : 'LOYAL');

    let updatedSchoolObj: School | undefined;

    setAvailableSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        updatedSchoolObj = { ...s, pilot_status: nextStatus };
        syncDocToFirestore('schools', s.id, updatedSchoolObj);
        return updatedSchoolObj;
      }
      return s;
    }));

    if (activeSchool?.id === schoolId && updatedSchoolObj) {
      setActiveSchool(updatedSchoolObj);
    }

    logAudit('SCHOOL_PILOT_STATUS_UPDATED', 'School', schoolId, `Updated pilot badge status for "${target.name}" to ${nextStatus}`);

    return {
      success: true,
      school: updatedSchoolObj,
      message: `School "${target.name}" badge updated to "${nextStatus === 'LOYAL' ? 'Loyal' : 'First-Term Pilot'}".`
    };
  };

  // Toggle Super-Admin Commercial Term Payment for a School
  const toggleSchoolTermPayment = (
    schoolId: string, 
    academicYear: string, 
    term: string, 
    isPaid: boolean, 
    notes?: string
  ) => {
    const target = availableSchools.find(s => s.id === schoolId);
    if (!target) return { success: false, message: 'School profile not found.' };

    let updatedSchoolObj: School | undefined;

    setAvailableSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        const existingRecords = s.term_payment_records || [];
        const index = existingRecords.findIndex(r => r.academic_year === academicYear && r.term === term);
        
        // Count active enrolled students in database or fallback to estimated_students
        const activeStudentCount = students.filter(st => st.school_id === s.id && st.status !== 'SUSPENDED' && st.status !== 'TRANSFERRED').length;
        const studentBase = activeStudentCount > 0 ? activeStudentCount : (s.estimated_students || 0);
        const expectedFee = studentBase * 500;

        const updatedRecord = {
          academic_year: academicYear,
          term: term,
          is_paid: isPaid,
          paid_amount_rwf: expectedFee,
          paid_at: isPaid ? new Date().toISOString() : undefined,
          recorded_by_id: currentUser?.id || 'super-admin',
          recorded_by_name: currentUser?.name || 'Super Admin',
          notes: notes || ''
        };

        let newRecords: typeof existingRecords;
        if (index >= 0) {
          newRecords = [...existingRecords];
          newRecords[index] = updatedRecord;
        } else {
          newRecords = [...existingRecords, updatedRecord];
        }

        updatedSchoolObj = { ...s, term_payment_records: newRecords };
        syncDocToFirestore('schools', s.id, updatedSchoolObj);
        return updatedSchoolObj;
      }
      return s;
    }));

    if (activeSchool?.id === schoolId && updatedSchoolObj) {
      setActiveSchool(updatedSchoolObj);
    }

    logAudit('SCHOOL_TERM_PAYMENT_TOGGLED', 'School', schoolId, `Set payment status for "${target.name}" (${academicYear} - ${term}) to ${isPaid ? 'PAID' : 'UNPAID'}`);

    return {
      success: true,
      school: updatedSchoolObj,
      message: `Payment status for "${target.name}" (${academicYear} - ${term}) updated to ${isPaid ? 'PAID' : 'UNPAID'}.`
    };
  };

  // Update or Save Onboarding Product Survey for a School
  const updateSchoolSurvey = (schoolId: string, survey: SchoolOnboardingSurvey) => {
    const target = availableSchools.find(s => s.id === schoolId);
    if (!target) return { success: false, message: 'School profile not found.' };

    const completedSurvey: SchoolOnboardingSurvey = {
      ...survey,
      id: survey.id || `survey-${schoolId}`,
      school_id: schoolId,
      school_name: target.name,
      conducted_by_id: survey.conducted_by_id || currentUser.id,
      conducted_by_name: survey.conducted_by_name || currentUser.name,
      conducted_by_role: survey.conducted_by_role || currentUser.role,
      conducted_at: survey.conducted_at || new Date().toISOString()
    };

    setAvailableSchools(prev => prev.map(s => {
      if (s.id === schoolId) {
        const updated = { ...s, onboarding_survey: completedSurvey };
        syncDocToFirestore('schools', s.id, updated);
        return updated;
      }
      return s;
    }));

    logAudit('SCHOOL_SURVEY_SUBMITTED', 'School', schoolId, `Submitted Product Development Survey for "${target.name}"`);

    return {
      success: true,
      message: `Product Development survey recorded successfully for "${target.name}".`
    };
  };

  // 4. Approve School Registry Code Generation (Coordinator or Super Admin)
  const approveSchoolRegistryCode = (schoolId: string) => {
    if (currentUser.role !== 'COORDINATOR' && currentUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Only Regional Coordinators or Super Admins can approve schools for Registry Code generation.'
      };
    }

    if (currentUser.role === 'COORDINATOR' && !currentUser.has_passed_training) {
      return {
        success: false,
        message: 'Accreditation Required: You must complete and pass the Field Training Academy Examination before approving school registrations or issuing Registry Codes.'
      };
    }

    const school = availableSchools.find(s => s.id === schoolId);
    if (!school) {
      return { success: false, message: 'School not found.' };
    }

    // Constraint check for Coordinator: Must be under their monitored registrars/jurisdiction
    if (currentUser.role === 'COORDINATOR') {
      if (school.coordinator_id && school.coordinator_id !== currentUser.id) {
        return {
          success: false,
          message: 'Security Constraint: You can only approve schools registered by Registrars assigned to your jurisdiction.'
        };
      }
    }

    const generatedCode = `REG-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const updatedSchool: School = {
      ...school,
      approval_status: 'APPROVED',
      registry_code: generatedCode,
      is_active: true,
      approved_by_id: currentUser.id,
      approved_by_name: currentUser.name,
      approved_at: new Date().toISOString()
    };

    // Also activate Director user account
    setAvailableSchools(prev => prev.map(s => s.id === schoolId ? updatedSchool : s));
    setAvailableUsers(prev => prev.map(u => u.school_id === schoolId && u.role === 'SCHOOL_ADMIN' ? { ...u, is_active: true } : u));

    syncDocToFirestore('schools', schoolId, updatedSchool);

    logAudit('SCHOOL_REGISTRY_APPROVED', 'School', schoolId, `Coordinator ${currentUser.name} approved school "${school.name}" and generated Official Registry Code "${generatedCode}".`);

    return {
      success: true,
      registry_code: generatedCode,
      message: `School "${school.name}" successfully approved! Official Registry Code issued: ${generatedCode}`
    };
  };

  // 5. Delete Registrar by Coordinator (Flagged for Super Admin visibility)
  const deleteRegistrarByCoordinator = (registrarUserId: string) => {
    if (currentUser.role !== 'COORDINATOR' && currentUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Unauthorized: Only Coordinators or Super Admins can remove Registrars.'
      };
    }

    const registrar = availableUsers.find(u => u.id === registrarUserId && u.role === 'REGISTER');
    if (!registrar) {
      return { success: false, message: 'Registrar account not found.' };
    }

    if (currentUser.role === 'COORDINATOR' && registrar.assigned_coordinator_id !== currentUser.id) {
      return {
        success: false,
        message: 'Security Restriction: Coordinators can only remove Registrars directly assigned to them.'
      };
    }

    const nowIso = new Date().toISOString();
    const updatedRegistrar: User = {
      ...registrar,
      is_active: false,
      is_deleted_by_coordinator: true,
      deleted_by_coordinator_id: currentUser.id,
      deleted_by_coordinator_name: currentUser.name,
      deleted_at: nowIso
    };

    setAvailableUsers(prev => prev.map(u => u.id === registrarUserId ? updatedRegistrar : u));
    syncUserToFirestore(updatedRegistrar);

    // Reassign all schools registered by this stopped/deleted registrar to the Super Administrator
    const superAdmin = availableUsers.find(u => u.role === 'SUPER_ADMIN') || {
      id: 'user-super-admin-01',
      name: 'Ishimwe Patient',
      role: 'SUPER_ADMIN' as UserRole
    };

    setAvailableSchools(prev => prev.map(s => {
      if (s.registered_by_id === registrarUserId) {
        const updatedSchool: School = {
          ...s,
          registered_by_id: superAdmin.id,
          registered_by_name: superAdmin.name,
          registered_by_role: 'SUPER_ADMIN'
        };
        syncDocToFirestore('schools', s.id, updatedSchool);
        return updatedSchool;
      }
      return s;
    }));

    logAudit(
      'REGISTRAR_DELETED_BY_COORDINATOR',
      'User',
      registrarUserId,
      `Coordinator ${currentUser.name} stopped/deleted Registrar "${registrar.name}". All registered schools reassigned to Super Admin.`
    );

    return {
      success: true,
      message: `Registrar "${registrar.name}" deleted successfully. All schools registered by this registrar have been automatically transferred to Super Admin.`
    };
  };

  // 6. Restore Deleted Registrar (Super Admin Only)
  const restoreRegistrarBySuperAdmin = (registrarUserId: string) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Unauthorized: Only Super Admin can restore deleted Registrars.' };
    }

    const registrar = availableUsers.find(u => u.id === registrarUserId);
    if (!registrar) return { success: false, message: 'Registrar account not found.' };

    const restored: User = {
      ...registrar,
      is_active: true,
      is_deleted_by_coordinator: false,
      deleted_by_coordinator_id: undefined,
      deleted_by_coordinator_name: undefined,
      deleted_at: undefined
    };

    setAvailableUsers(prev => prev.map(u => u.id === registrarUserId ? restored : u));
    syncUserToFirestore(restored);

    logAudit('REGISTRAR_RESTORED', 'User', registrarUserId, `Super Admin ${currentUser.name} restored Registrar "${registrar.name}".`);

    return {
      success: true,
      message: `Registrar "${registrar.name}" restored to active status.`
    };
  };

  // 7. Reassign Registrar to another Coordinator (Super Admin Only)
  const reassignRegistrarToCoordinator = (registrarUserId: string, newCoordinatorId: string) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, message: 'Unauthorized: Only Super Admin can reassign Registrars.' };
    }

    const newCoord = availableUsers.find(u => u.id === newCoordinatorId && u.role === 'COORDINATOR');
    if (!newCoord) return { success: false, message: 'Target Coordinator not found.' };

    const currentCount = availableUsers.filter(u => u.role === 'REGISTER' && u.assigned_coordinator_id === newCoordinatorId && u.is_active !== false).length;
    if (currentCount >= 15) {
      return { success: false, message: `Target Coordinator "${newCoord.name}" already manages 15 active Registrars.` };
    }

    const registrar = availableUsers.find(u => u.id === registrarUserId);
    if (!registrar) return { success: false, message: 'Registrar not found.' };

    const reassigned: User = {
      ...registrar,
      assigned_coordinator_id: newCoord.id,
      assigned_coordinator_name: newCoord.name,
      is_deleted_by_coordinator: false,
      is_active: true
    };

    setAvailableUsers(prev => prev.map(u => u.id === registrarUserId ? reassigned : u));
    syncUserToFirestore(reassigned);

    logAudit('REGISTRAR_REASSIGNED', 'User', registrarUserId, `Super Admin reassigned Registrar "${registrar.name}" to Coordinator "${newCoord.name}".`);

    return {
      success: true,
      message: `Registrar "${registrar.name}" reassigned to Coordinator "${newCoord.name}".`
    };
  };

  // Bulk Reassign Registrars when a Coordinator is wiped or reassigned
  const bulkReassignRegistrars = (fromCoordinatorUserId: string, toCoordinatorUserId: string) => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return { success: false, count: 0, message: 'Unauthorized: Only Super Admin can bulk redistribute registrars.' };
    }

    const targetCoord = availableUsers.find(u => u.id === toCoordinatorUserId && u.role === 'COORDINATOR');
    if (!targetCoord) return { success: false, count: 0, message: 'Target Coordinator account not found.' };

    const registrarsToMove = availableUsers.filter(u => 
      u.role === 'REGISTER' && 
      (u.assigned_coordinator_id === fromCoordinatorUserId || !u.assigned_coordinator_id)
    );

    if (registrarsToMove.length === 0) {
      return { success: true, count: 0, message: 'No registrars found requiring redistribution.' };
    }

    const updates = {
      assigned_coordinator_id: targetCoord.id,
      assigned_coordinator_name: targetCoord.name,
      is_deleted_by_coordinator: false,
      is_active: true
    };

    setAvailableUsers(prev => prev.map(u => {
      if (u.role === 'REGISTER' && (u.assigned_coordinator_id === fromCoordinatorUserId || !u.assigned_coordinator_id)) {
        const updatedReg = { ...u, ...updates };
        syncUserToFirestore(updatedReg);
        return updatedReg;
      }
      return u;
    }));

    logAudit('BULK_REGISTRARS_REDISTRIBUTED', 'User', toCoordinatorUserId, `Super Admin redistributed ${registrarsToMove.length} Registrars to Coordinator "${targetCoord.name}".`);

    return {
      success: true,
      count: registrarsToMove.length,
      message: `Successfully redistributed ${registrarsToMove.length} Registrar(s) to Coordinator "${targetCoord.name}".`
    };
  };

  // 8. Disable, Enable, or Delete School (Super Admin Only; Registrars / Coordinators Cannot)
  const disableOrDeleteSchoolBySuperAdmin = (schoolId: string, action: 'DISABLE' | 'ENABLE' | 'DELETE') => {
    if (currentUser.role !== 'SUPER_ADMIN') {
      return {
        success: false,
        message: 'Security Policy Restriction: Only the Super Administrator is authorized to disable, enable, or delete registered schools.'
      };
    }

    const school = availableSchools.find(s => s.id === schoolId);
    if (!school) return { success: false, message: 'School not found.' };

    if (action === 'DELETE') {
      return deleteSchool(schoolId);
    }

    const newActiveState = action === 'ENABLE';
    const updated: School = {
      ...school,
      is_active: newActiveState
    };

    setAvailableSchools(prev => prev.map(s => s.id === schoolId ? updated : s));
    syncDocToFirestore('schools', schoolId, updated);

    logAudit('SUPER_ADMIN_SCHOOL_STATUS_CHANGED', 'School', schoolId, `Super Admin ${currentUser.name} ${action.toLowerCase()}d school "${school.name}".`);

    return {
      success: true,
      message: `School "${school.name}" has been ${action.toLowerCase()}d successfully.`
    };
  };

  // Update School Profile (Super Admin or School Director / Headteacher; Coordinators strictly forbidden)
  const updateSchoolProfile = (schoolId: string, updates: Partial<School>) => {
    if (currentUser.role === 'COORDINATOR') {
      console.warn('Unauthorized: Coordinators cannot edit school profiles.');
      return;
    }
    setAvailableSchools(prev => prev.map(s => s.id === schoolId ? { ...s, ...updates } : s));
    if (activeSchool.id === schoolId) {
      setActiveSchool(prev => ({ ...prev, ...updates }));
    }
    syncDocToFirestore('schools', schoolId, updates);
    logAudit('SCHOOL_PROFILE_UPDATED', 'School', schoolId, `Updated profile settings for school ${schoolId}`);
  };

  // Toggle user active status (stop or reactivate user with automatic school and registrar redistribution)
  const toggleUserActiveStatus = (userId: string, activeState?: boolean) => {
    const targetUser = availableUsers.find(u => u.id === userId);
    if (!targetUser) return { success: false, message: 'User not found.' };

    const newActiveState = activeState !== undefined ? activeState : !(targetUser.is_active !== false);

    const superAdmin = availableUsers.find(u => u.role === 'SUPER_ADMIN') || {
      id: 'user-super-admin-01',
      name: 'Ishimwe Patient',
      role: 'SUPER_ADMIN' as UserRole
    };

    // If being stopped / deactivated
    if (!newActiveState) {
      // Reassign schools registered by this user to Super Admin
      if (targetUser.role === 'REGISTER' || targetUser.role === 'COORDINATOR') {
        setAvailableSchools(prev => prev.map(s => {
          if (s.registered_by_id === userId || (targetUser.role === 'COORDINATOR' && s.coordinator_id === userId)) {
            const updatedSchool: School = {
              ...s,
              registered_by_id: superAdmin.id,
              registered_by_name: superAdmin.name,
              registered_by_role: 'SUPER_ADMIN',
              coordinator_id: targetUser.role === 'COORDINATOR' ? '' : s.coordinator_id,
              coordinator_name: targetUser.role === 'COORDINATOR' ? '' : s.coordinator_name
            };
            syncDocToFirestore('schools', s.id, updatedSchool);
            return updatedSchool;
          }
          return s;
        }));
      }

      // If coordinator is stopped: reassign their managed registrars to other active coordinators
      if (targetUser.role === 'COORDINATOR') {
        const otherActiveCoordinators = availableUsers.filter(u => 
          u.role === 'COORDINATOR' && 
          u.id !== userId && 
          u.is_active !== false && 
          !u.is_deleted_by_coordinator
        );

        const registrarsToReassign = availableUsers.filter(u => 
          u.role === 'REGISTER' && 
          u.assigned_coordinator_id === userId &&
          u.is_active !== false
        );

        if (registrarsToReassign.length > 0 && otherActiveCoordinators.length > 0) {
          setAvailableUsers(prev => prev.map(u => {
            if (u.role === 'REGISTER' && u.assigned_coordinator_id === userId) {
              const assignedIdx = registrarsToReassign.findIndex(r => r.id === u.id);
              const targetCoord = otherActiveCoordinators[assignedIdx % otherActiveCoordinators.length];
              const updatedReg: User = {
                ...u,
                assigned_coordinator_id: targetCoord.id,
                assigned_coordinator_name: targetCoord.name
              };
              syncUserToFirestore(updatedReg);
              return updatedReg;
            }
            return u;
          }));
        }
      }
    }

    const updatedUser: User = {
      ...targetUser,
      is_active: newActiveState
    };

    setAvailableUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
    syncUserToFirestore(updatedUser);

    logAudit('USER_STATUS_TOGGLED', 'User', userId, `${currentUser.name} (${currentUser.role}) changed status of ${targetUser.name} to ${newActiveState ? 'ACTIVE' : 'DEACTIVATED'}.`);

    return {
      success: true,
      message: `User "${targetUser.name}" has been ${newActiveState ? 'activated' : 'deactivated/stopped'}. Associated school and registrar assignments have been updated automatically.`
    };
  };

  // Update User Profile
  const updateUserProfile = (userId: string, updates: Partial<User>) => {
    setAvailableUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updates } : u));
    if (currentUser.id === userId) {
      setCurrentUser(prev => ({ ...prev, ...updates }));
    }
    updateUserInFirestore(userId, updates);
  };

  // Permanently wipe out account from Cloud Firestore, in-memory state, and all local caches forever
  const permanentlyDeleteUser = async (userId: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (currentUser.role !== 'SUPER_ADMIN') {
        return {
          success: false,
          message: 'Security Constraint: Only the Super Admin is authorized to permanently wipe out accounts.'
        };
      }

      const targetUser = availableUsers.find(u => u.id === userId);
      if (!targetUser) {
        return { success: false, message: 'Account not found in the system registry.' };
      }

      if (targetUser.id === currentUser.id) {
        return { success: false, message: 'Security Safeguard: You cannot wipe out your own active Super Admin session.' };
      }

      const superAdmin = availableUsers.find(u => u.role === 'SUPER_ADMIN') || {
        id: 'user-super-admin-01',
        name: 'Ishimwe Patient',
        role: 'SUPER_ADMIN' as UserRole
      };

      // 1. Reassign registered schools to Super Admin if deleted user was a Registrar or Coordinator
      if (targetUser.role === 'REGISTER' || targetUser.role === 'COORDINATOR') {
        setAvailableSchools(prev => prev.map(s => {
          if (s.registered_by_id === userId || (targetUser.role === 'COORDINATOR' && s.coordinator_id === userId)) {
            const updatedSchool: School = {
              ...s,
              registered_by_id: superAdmin.id,
              registered_by_name: superAdmin.name,
              registered_by_role: 'SUPER_ADMIN',
              coordinator_id: targetUser.role === 'COORDINATOR' ? '' : s.coordinator_id,
              coordinator_name: targetUser.role === 'COORDINATOR' ? '' : s.coordinator_name
            };
            syncDocToFirestore('schools', s.id, updatedSchool);
            return updatedSchool;
          }
          return s;
        }));
      }

      // 2. Reassign managed Registrars to other active Coordinators if deleted user was a Coordinator
      if (targetUser.role === 'COORDINATOR') {
        const otherActiveCoordinators = availableUsers.filter(u => 
          u.role === 'COORDINATOR' && 
          u.id !== userId && 
          u.is_active !== false && 
          !u.is_deleted_by_coordinator
        );

        const registrarsToReassign = availableUsers.filter(u => 
          u.role === 'REGISTER' && 
          u.assigned_coordinator_id === userId &&
          u.is_active !== false
        );

        if (registrarsToReassign.length > 0) {
          if (otherActiveCoordinators.length > 0) {
            setAvailableUsers(prev => prev.map(u => {
              if (u.role === 'REGISTER' && u.assigned_coordinator_id === userId) {
                const assignedIdx = registrarsToReassign.findIndex(r => r.id === u.id);
                const targetCoord = otherActiveCoordinators[assignedIdx % otherActiveCoordinators.length];
                const updatedReg: User = {
                  ...u,
                  assigned_coordinator_id: targetCoord.id,
                  assigned_coordinator_name: targetCoord.name
                };
                syncUserToFirestore(updatedReg);
                return updatedReg;
              }
              return u;
            }));
            logAudit('REGISTRARS_REDISTRIBUTED_ON_COORD_DELETE', 'User', userId, `Redistributed ${registrarsToReassign.length} registrars from deleted coordinator "${targetUser.name}" to other active coordinators.`);
          } else {
            setAvailableUsers(prev => prev.map(u => {
              if (u.role === 'REGISTER' && u.assigned_coordinator_id === userId) {
                const updatedReg: User = {
                  ...u,
                  assigned_coordinator_id: superAdmin.id,
                  assigned_coordinator_name: superAdmin.name
                };
                syncUserToFirestore(updatedReg);
                return updatedReg;
              }
              return u;
            }));
            logAudit('REGISTRARS_REASSIGNED_TO_SUPERADMIN_ON_COORD_DELETE', 'User', userId, `Reassigned ${registrarsToReassign.length} registrars from deleted coordinator "${targetUser.name}" to Super Admin oversight.`);
          }
        }
      }

      // 3. Delete document permanently from Firestore
      await deleteDocFromFirestore(FIRESTORE_COLLECTIONS.USERS, userId);

      // 4. Add to tombstone purged set so local hydration or cloud resync never restores it
      const savedPurged = localStorage.getItem(`${STORAGE_KEY}_purged_user_ids`);
      const purgedList: string[] = savedPurged ? JSON.parse(savedPurged) : [];
      const updatedPurged = Array.from(new Set([...purgedList, userId, targetUser.email.toLowerCase()]));
      localStorage.setItem(`${STORAGE_KEY}_purged_user_ids`, JSON.stringify(updatedPurged));

      // 5. Remove immediately from in-memory state & local storage
      const updatedUsers = availableUsers.filter(u => u.id !== userId);
      setAvailableUsers(updatedUsers);
      setLocalCache('users', updatedUsers);
      localStorage.setItem(`${STORAGE_KEY}_users`, JSON.stringify(updatedUsers));

      // 6. Record permanent security audit trail
      logAudit(
        'PERMANENT_ACCOUNT_PURGED',
        'User',
        userId,
        `Super Admin ${currentUser.name} permanently wiped out user account "${targetUser.name}" (${targetUser.email}, Role: ${targetUser.role}) from Cloud Firestore and all caches forever. Associated schools transferred to Super Admin.`
      );

      return {
        success: true,
        message: `Account "${targetUser.name}" (${targetUser.email}) has been permanently wiped out from Firestore. Associated schools transferred to Super Admin.`
      };
    } catch (err: any) {
      console.error('Failed to permanently wipe out user:', err);
      return {
        success: false,
        message: `Wipeout failed: ${err?.message || 'Error communicating with Cloud Firestore.'}`
      };
    }
  };

  // Switch role helper (for testing / quick preview)
  const switchUserRole = (role: UserRole) => {
    const userForRole = availableUsers.find(u => u.role === role && (u.school_id === activeSchool.id || u.school_id === 'all'));
    if (userForRole) {
      setCurrentUser(userForRole);
      setIsAuthenticated(true);
    } else {
      const fallbackUser: User = {
        id: `user-${role.toLowerCase()}-demo`,
        name: `Demo ${role.replace('_', ' ')}`,
        email: `${role.toLowerCase()}@${activeSchool.code.toLowerCase()}.edu.rw`,
        role,
        school_id: activeSchool.id,
        avatar_url: '',
        phone: '+250 788 000 111',
        title: role.replace('_', ' '),
        is_claimed: true,
        is_active: true
      };
      setCurrentUser(fallbackUser);
      setIsAuthenticated(true);
    }
  };

  const triggerConfetti = () => {
    // Childish confetti disabled for clean professional institutional compliance
  };

  // -------------------------------------------------------------
  // FINANCIAL PORTAL (BURSAR)
  // -------------------------------------------------------------
  const registerPayment = (data: {
    student_id: string;
    fee_category: FeeCategory;
    amount_paid: number;
    payment_method: PaymentMethod;
    transaction_reference?: string;
    payer_name: string;
    remarks?: string;
    term?: string;
    academic_year?: string;
  }) => {
    const student = students.find(s => s.id === data.student_id);
    if (!student) {
      return { success: false, receipt_number: '', message: 'Student not found.' };
    }

    const receiptNum = `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const txRef = data.transaction_reference || `${data.payment_method}-${Math.floor(100000 + Math.random() * 900000)}`;
    const targetTerm = data.term || activeSchool.active_term || 'Term 1';
    const targetYear = data.academic_year || activeSchool.active_academic_year || '2026-2027';

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now()}`,
      school_id: activeSchool.id,
      receipt_number: receiptNum,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      student_reg: student.registration_number,
      class_name: student.class_name,
      fee_category: data.fee_category,
      amount_paid: Number(data.amount_paid),
      payment_date: new Date().toISOString().substring(0, 10),
      payment_method: data.payment_method,
      transaction_reference: txRef,
      bursar_id: currentUser.id,
      bursar_name: currentUser.name,
      payer_name: data.payer_name || student.guardian_name,
      term: targetTerm,
      academic_year: targetYear,
      remarks: data.remarks,
      created_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    setPayments(prev => [newPayment, ...prev]);

    // Send SMS confirmation automatically via Africa's Talking simulator
    const smsContent = `Elimu360 Alert [${activeSchool.code}]: Fee payment receipt ${receiptNum} recorded for ${student.first_name} ${student.last_name}. Amount: RWF ${data.amount_paid.toLocaleString()} (${data.fee_category}). Recorded by ${currentUser.name}.`;
    
    const newNotif: NotificationLog = {
      id: `notif-${Date.now()}`,
      school_id: activeSchool.id,
      recipient_name: student.guardian_name,
      recipient_phone: student.guardian_phone,
      channel: 'SMS_AFRICAS_TALKING',
      trigger: 'FEE_REMINDER',
      content: smsContent,
      status: 'DELIVERED',
      cost_rwf: 15,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
    setNotifications(prev => [newNotif, ...prev]);
    setSmsBalanceRwf(prev => Math.max(0, prev - 15));

    logAudit('PAYMENT_REGISTERED', 'PaymentRecord', receiptNum, `Payment of RWF ${data.amount_paid.toLocaleString()} registered for ${student.registration_number} (${data.payment_method})`);

    triggerConfetti();

    return { 
      success: true, 
      receipt_number: receiptNum, 
      message: `Payment of RWF ${data.amount_paid.toLocaleString()} registered successfully with receipt ${receiptNum}.` 
    };
  };

  const addFeeStructure = (fee: Omit<FeeStructure, 'id' | 'school_id'>) => {
    const newFee: FeeStructure = {
      ...fee,
      id: `fee-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      school_id: activeSchool.id,
      status: fee.status || 'ACTIVE',
    };
    setFeeStructures(prev => [...prev, newFee]);
    logAudit('FEE_STRUCTURE_CREATED', 'FeeStructure', newFee.id, `Created fee rule ${fee.category_label} (RWF ${fee.amount.toLocaleString()})`);
  };

  const deleteFeeStructure = (feeId: string) => {
    setFeeStructures(prev => prev.filter(f => f.id !== feeId));
    logAudit('FEE_STRUCTURE_DELETED', 'FeeStructure', feeId, `Deleted fee structure rule`);
  };

  const updateFeeStructure = (updatedFee: FeeStructure) => {
    setFeeStructures(prev => prev.map(f => f.id === updatedFee.id ? updatedFee : f));
    logAudit('FEE_STRUCTURE_UPDATED', 'FeeStructure', updatedFee.id, `Updated fee rule ${updatedFee.category_label} (RWF ${updatedFee.amount.toLocaleString()})`);
  };

  const getStudentFeeLedger = (studentId: string, options?: { term?: string; academic_year?: string }) => {
    const student = students.find(s => s.id === studentId);
    const targetTerm = options?.term || activeSchool.active_term || 'Term 1';
    const targetYear = options?.academic_year || activeSchool.active_academic_year || '2026-2027';

    if (!student) {
      return {
        expectedFees: [],
        totalExpected: 0,
        totalPaid: 0,
        outstandingBalance: 0,
        overpaidAmount: 0,
        payments: [],
        isCleared: true,
        paymentStatus: 'EXEMPT' as StudentPaymentStatus,
        clearanceRatePercent: 100,
        lastPaymentDate: undefined,
        lastReceiptNumber: undefined
      };
    }

    const isBoarder = student.boarding_status === 'BOARDING';
    const studentCls = classes.find(c => c.id === student.class_id || c.name === student.class_name);

    const applicableFeeStructures = feeStructures.filter(f => {
      if (f.school_id !== activeSchool.id) return false;
      if (f.status === 'ARCHIVED') return false;

      // Filter by academic_year (if specified on structure)
      if (f.academic_year && f.academic_year !== 'ALL' && f.academic_year !== 'ALL_YEARS' && f.academic_year !== targetYear) {
        return false;
      }

      // Filter by term (if specific term requested, match or include ALL_TERMS)
      if (targetTerm !== 'Full Year' && targetTerm !== 'ALL' && targetTerm !== 'ALL_TERMS') {
        if (f.term && f.term !== 'ALL' && f.term !== 'ALL_TERMS' && f.term !== 'Full Year' && f.term !== targetTerm && f.frequency !== 'PER_YEAR') {
          return false;
        }
      }

      // Boarding Tag filtering
      if (f.target_tag === 'BOARDER' || f.category === 'BOARDING') {
        if (!isBoarder) return false;
      }
      if (f.target_tag === 'DAY' && isBoarder) {
        return false;
      }

      // Scope matching
      const scope = f.allocation_scope || (f.class_level === 'ALL' || f.class_level === 'All Classes' ? 'GLOBAL' : 'CLASS');

      if (scope === 'GLOBAL') {
        return true;
      }

      if (scope === 'LEVEL') {
        const targetLevel = f.education_level || f.class_level;
        if (!studentCls) return false;
        return (
          studentCls.level === targetLevel ||
          studentCls.level?.toUpperCase() === targetLevel?.toUpperCase() ||
          studentCls.name?.toLowerCase().includes(targetLevel?.toLowerCase() || '')
        );
      }

      if (scope === 'CLASS') {
        if (f.target_class_id && f.target_class_id === student.class_id) return true;
        if (f.target_class_name && (f.target_class_name === student.class_name || (studentCls && f.target_class_name === studentCls.name))) return true;
        if (f.class_level && (f.class_level === student.class_name || (studentCls && (f.class_level === studentCls.name || f.class_level === studentCls.level)))) return true;
        return false;
      }

      if (scope === 'STUDENT_TAG') {
        if (f.target_tag === 'BOARDER' && isBoarder) return true;
        if (f.target_tag === 'DAY' && !isBoarder) return true;
        return false;
      }

      // Fallback: if class_level matches class name or level
      if (f.class_level && f.class_level !== 'ALL' && f.class_level !== 'All Classes') {
        if (f.class_level === student.class_name) return true;
        if (studentCls && (f.class_level === studentCls.name || f.class_level === studentCls.level)) return true;
        return false;
      }

      return true;
    });

    const expectedFees = applicableFeeStructures.map(f => ({
      category: f.category,
      label: f.category_label,
      amount: f.amount,
    }));

    const totalExpected = expectedFees.reduce((sum, f) => sum + f.amount, 0);

    const studentPayments = payments.filter(p => {
      if (p.student_id !== studentId || p.school_id !== activeSchool.id) return false;
      if (p.academic_year && p.academic_year !== targetYear) return false;
      if (targetTerm !== 'Full Year' && targetTerm !== 'ALL' && targetTerm !== 'ALL_TERMS') {
        if (p.term && p.term !== targetTerm) return false;
      }
      return true;
    });

    const totalPaid = studentPayments.reduce((sum, p) => sum + p.amount_paid, 0);
    const outstandingBalance = Math.max(0, totalExpected - totalPaid);
    const overpaidAmount = Math.max(0, totalPaid - totalExpected);

    let paymentStatus: StudentPaymentStatus = 'NOT_PAID';
    if (totalExpected === 0 && totalPaid === 0) {
      paymentStatus = 'EXEMPT';
    } else if (totalPaid >= totalExpected && totalExpected > 0) {
      paymentStatus = totalPaid > totalExpected ? 'OVERPAID' : 'FULLY_PAID';
    } else if (totalPaid > 0 && totalPaid < totalExpected) {
      paymentStatus = 'PARTIAL';
    } else {
      paymentStatus = 'NOT_PAID';
    }

    const clearanceRatePercent = totalExpected > 0 
      ? Math.min(100, Math.round((totalPaid / totalExpected) * 100))
      : (totalPaid > 0 ? 100 : 0);

    const sortedPayments = [...studentPayments].sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime());

    return {
      expectedFees,
      totalExpected,
      totalPaid,
      outstandingBalance,
      overpaidAmount,
      payments: studentPayments,
      isCleared: outstandingBalance === 0,
      paymentStatus,
      clearanceRatePercent,
      lastPaymentDate: sortedPayments[0]?.payment_date,
      lastReceiptNumber: sortedPayments[0]?.receipt_number
    };
  };

  const getSchoolFinancialSummary = (options?: { term?: string; academic_year?: string }) => {
    const targetTerm = options?.term || activeSchool.active_term || 'Term 1';
    const targetYear = options?.academic_year || activeSchool.active_academic_year || '2026-2027';

    const schoolStudents = students.filter(s => s.school_id === activeSchool.id && s.status === 'ACTIVE');
    
    let totalTarget = 0;
    let totalPaidSum = 0;
    let defaultersCount = 0;
    let fullyPaidCount = 0;
    let partialPaidCount = 0;
    let notPaidCount = 0;

    schoolStudents.forEach(student => {
      const ledger = getStudentFeeLedger(student.id, { term: targetTerm, academic_year: targetYear });
      totalTarget += ledger.totalExpected;
      totalPaidSum += ledger.totalPaid;
      
      if (ledger.paymentStatus === 'FULLY_PAID' || ledger.paymentStatus === 'OVERPAID' || ledger.isCleared) {
        fullyPaidCount++;
      } else if (ledger.paymentStatus === 'PARTIAL') {
        partialPaidCount++;
        defaultersCount++;
      } else if (ledger.paymentStatus === 'NOT_PAID') {
        notPaidCount++;
        defaultersCount++;
      }
    });

    const schoolPayments = payments.filter(p => {
      if (p.school_id !== activeSchool.id) return false;
      if (p.academic_year && p.academic_year !== targetYear) return false;
      if (targetTerm !== 'Full Year' && targetTerm !== 'ALL' && targetTerm !== 'ALL_TERMS') {
        if (p.term && p.term !== targetTerm) return false;
      }
      return true;
    });

    const todayStr = new Date().toISOString().substring(0, 10);
    const todayCollected = schoolPayments
      .filter(p => p.payment_date === todayStr)
      .reduce((sum, p) => sum + p.amount_paid, 0);

    const paymentsByMethod: Record<PaymentMethod, number> = {
      CASH: 0,
      MTN_MOMO: 0,
      AIRTEL_MONEY: 0,
      BANK_TRANSFER: 0,
    };

    schoolPayments.forEach(p => {
      if (paymentsByMethod[p.payment_method] !== undefined) {
        paymentsByMethod[p.payment_method] += p.amount_paid;
      }
    });

    const collectionRate = totalTarget > 0 ? (totalPaidSum / totalTarget) * 100 : 0;

    return {
      academicYear: targetYear,
      term: targetTerm,
      totalTargetRevenue: totalTarget,
      totalCollectedRevenue: totalPaidSum,
      collectionRatePercent: Number(collectionRate.toFixed(1)),
      outstandingTotal: Math.max(0, totalTarget - totalPaidSum),
      todayCollected,
      paymentsByMethod,
      defaultersCount,
      fullyPaidCount,
      partialPaidCount,
      notPaidCount,
      totalEnrolledStudents: schoolStudents.length,
      totalTransactionsCount: schoolPayments.length
    };
  };

  // -------------------------------------------------------------
  // ACADEMIC & GRADES (Single Unified Test Protocol)
  // -------------------------------------------------------------
  const submitGrade = (gradeData: Omit<GradeEntry, 'id' | 'school_id' | 'entered_at'>) => {
    // Strict Institutional Rule: Director and DOS will never edit marks or maximum marks added by teachers
    if (currentUser.role === 'SCHOOL_ADMIN' || currentUser.role === 'DOS') {
      console.warn('Academic Policy Violation: School Director and DOS are restricted from editing or entering marks. Only the assigned subject teacher possesses authority to enter or edit marks.');
      return;
    }

    const markVal = Number(gradeData.marks);
    const maxVal = Number(gradeData.max_marks) || 30;
    if (markVal > maxVal) {
      alert(`Validation Error: Entered mark (${markVal}) exceeds the maximum assessment mark (${maxVal}). Please correct the value.`);
      return;
    }
    if (markVal < 0) {
      alert(`Validation Error: Mark cannot be negative.`);
      return;
    }

    const schoolId = activeSchool.id;
    const term = gradeData.term || activeSchool.active_term || 'Term 1';
    const academicYear = gradeData.academic_year || activeSchool.active_academic_year || '2026';
    const periodNumber = Number(gradeData.period_number) || 1;
    const assessmentType = gradeData.assessment_type || 'Test';

    // Strict Rule: No test of the same lesson, same name, same period must be recorded as two not as one or the same
    const testKey = getGradeRecordKey({
      student_id: gradeData.student_id,
      subject_id: gradeData.subject_id,
      assessment_type: assessmentType,
      period_number: periodNumber,
      term,
      academic_year: academicYear
    });

    let targetDocId = '';
    const duplicateIdsToDelete: string[] = [];

    // Find any existing record(s) matching this exact test
    grades.forEach(g => {
      if (getGradeRecordKey(g) === testKey) {
        if (!targetDocId) {
          targetDocId = g.id;
        } else {
          duplicateIdsToDelete.push(g.id);
        }
      }
    });

    if (!targetDocId) {
      targetDocId = getCanonicalGradeDocId({
        school_id: schoolId,
        student_id: gradeData.student_id,
        subject_id: gradeData.subject_id,
        assessment_type: assessmentType,
        period_number: periodNumber,
        term,
        academic_year: academicYear
      });
    }

    const unifiedGrade: GradeEntry = {
      ...gradeData,
      id: targetDocId,
      school_id: schoolId,
      term,
      academic_year: academicYear,
      period_number: periodNumber,
      assessment_type: assessmentType,
      marks: Number(gradeData.marks),
      max_marks: Number(gradeData.max_marks) || 30,
      entered_at: new Date().toISOString().substring(0, 10),
      offline_synced: false
    };

    setGrades(prev => {
      const filtered = prev.filter(g => getGradeRecordKey(g) !== testKey);
      const updated = [unifiedGrade, ...filtered];
      setLocalCache('grades', updated);
      localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(updated));
      return updated;
    });

    syncDocToFirestore(FIRESTORE_COLLECTIONS.GRADES, unifiedGrade.id, unifiedGrade);
    if (duplicateIdsToDelete.length > 0) {
      batchDeleteDocsFromFirestore(FIRESTORE_COLLECTIONS.GRADES, duplicateIdsToDelete);
    }

    logAudit(
      'GRADE_ENTRY', 
      'Grade', 
      unifiedGrade.id, 
      `Marks ${gradeData.marks}/${gradeData.max_marks} committed as 1 unified test record for ${gradeData.student_name} (${gradeData.subject_name} - ${assessmentType} Period ${periodNumber})`
    );
  };

  const submitBatchGrades = (payload: {
    class_id: string;
    subject_id: string;
    assessment_type: AssessmentType | string;
    period_number?: number;
    max_marks: number;
    term?: string;
    academic_year?: string;
    entries: {
      student_id: string;
      student_name: string;
      marks: number;
      remarks?: string;
    }[];
    is_draft?: boolean;
  }) => {
    // Strict Institutional Rule: Director and DOS will never edit marks or maximum marks added by teachers
    if (currentUser.role === 'SCHOOL_ADMIN' || currentUser.role === 'DOS') {
      console.warn('Academic Policy Violation: School Director and DOS are restricted from editing or entering marks. Only the assigned subject teacher possesses authority to enter or edit marks.');
      return { success: false, count: 0, message: 'Only assigned subject teachers have authority to enter or modify assessment marks.' };
    }

    const maxMarks = Number(payload.max_marks) || 30;

    // Strict validation: No student mark can exceed the set maximum
    for (const entry of payload.entries) {
      const m = Number(entry.marks);
      if (m > maxMarks) {
        return {
          success: false,
          count: 0,
          message: `Validation Error: Mark (${m}) for student "${entry.student_name}" exceeds the maximum set score (${maxMarks}). Please adjust it before submitting.`
        };
      }
      if (m < 0) {
        return {
          success: false,
          count: 0,
          message: `Validation Error: Mark for student "${entry.student_name}" cannot be negative.`
        };
      }
    }

    const targetClass = classes.find(c => c.id === payload.class_id);
    const targetSubject = subjects.find(s => s.id === payload.subject_id);
    const today = new Date().toISOString().substring(0, 10);
    const term = payload.term || activeSchool.active_term || 'Term 1';
    const academicYear = payload.academic_year || activeSchool.active_academic_year || '2026';
    const periodNumber = Number(payload.period_number) || 1;
    const schoolId = activeSchool.id;

    const duplicateIdsToDelete: string[] = [];
    const keysHandled = new Set<string>();

    const unifiedEntries: GradeEntry[] = payload.entries.map(e => {
      const testKey = getGradeRecordKey({
        student_id: e.student_id,
        subject_id: payload.subject_id,
        assessment_type: payload.assessment_type,
        period_number: periodNumber,
        term,
        academic_year: academicYear
      });
      keysHandled.add(testKey);

      let targetDocId = '';
      grades.forEach(g => {
        if (getGradeRecordKey(g) === testKey) {
          if (!targetDocId) {
            targetDocId = g.id;
          } else {
            duplicateIdsToDelete.push(g.id);
          }
        }
      });

      if (!targetDocId) {
        targetDocId = getCanonicalGradeDocId({
          school_id: schoolId,
          student_id: e.student_id,
          subject_id: payload.subject_id,
          assessment_type: payload.assessment_type,
          period_number: periodNumber,
          term,
          academic_year: academicYear
        });
      }

      return {
        id: targetDocId,
        school_id: schoolId,
        student_id: e.student_id,
        student_name: e.student_name,
        subject_id: payload.subject_id,
        subject_name: targetSubject?.name || 'Subject',
        class_id: payload.class_id,
        term,
        academic_year: academicYear,
        assessment_type: payload.assessment_type,
        period_number: periodNumber,
        marks: Number(e.marks),
        max_marks: Number(payload.max_marks),
        teacher_id: currentUser.id,
        teacher_name: currentUser.name,
        entered_at: today,
        remarks: e.remarks || '',
        is_draft: payload.is_draft || false,
        offline_synced: false
      };
    });

    // Update state and local cache: replace any matching test keys with the single unified entry
    setGrades(prev => {
      const filtered = prev.filter(g => !keysHandled.has(getGradeRecordKey(g)));
      const updated = [...unifiedEntries, ...filtered];
      setLocalCache('grades', updated);
      localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(updated));
      return updated;
    });

    batchSyncDocsToFirestore(FIRESTORE_COLLECTIONS.GRADES, unifiedEntries);
    if (duplicateIdsToDelete.length > 0) {
      batchDeleteDocsFromFirestore(FIRESTORE_COLLECTIONS.GRADES, duplicateIdsToDelete);
    }

    logAudit(
      'GRADE_BATCH_SUBMITTED',
      'Grade',
      `${payload.class_id}-${payload.subject_id}`,
      `${currentUser.name} recorded results for ${unifiedEntries.length} students in ${targetClass?.name} · ${targetSubject?.name} (${payload.assessment_type} Period ${periodNumber}) - strictly recorded as 1 unified test per student with zero duplicates.`
    );

    triggerConfetti();

    return {
      success: true,
      count: unifiedEntries.length,
      message: `Successfully saved marks for ${unifiedEntries.length} students (${payload.is_draft ? 'Draft' : 'Official Results'}). Each student recorded as 1 unified test entry.`
    };
  };

  const deleteGrade = (gradeId: string) => {
    // Delete single grade entry
    const targetGrade = grades.find(g => g.id === gradeId);
    if (!targetGrade) {
      return { success: false, message: 'Grade record not found.' };
    }

    setGrades(prev => {
      const updated = prev.filter(g => g.id !== gradeId);
      setLocalCache('grades', updated);
      localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(updated));
      return updated;
    });

    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.GRADES, gradeId);
    logAudit(
      'GRADE_DELETED',
      'Grade',
      gradeId,
      `${currentUser.name} deleted grade entry for ${targetGrade.student_name} (${targetGrade.subject_name} - ${targetGrade.assessment_type})`
    );

    return { success: true, message: `Marks entry for ${targetGrade.student_name} successfully deleted.` };
  };

  const deleteGradeBatch = (payload: {
    class_id: string;
    subject_id: string;
    assessment_type: string;
    period_number?: number;
    term?: string;
    academic_year?: string;
  }) => {
    const term = payload.term || activeSchool.active_term || 'Term 1';
    const academicYear = payload.academic_year || activeSchool.active_academic_year || '2026';
    const pNum = payload.period_number;

    const matchingGrades = grades.filter(g => 
      g.class_id === payload.class_id &&
      g.subject_id === payload.subject_id &&
      g.assessment_type === payload.assessment_type &&
      (g.term === term || (g.term && g.term.toLowerCase() === term.toLowerCase())) &&
      (!pNum || g.period_number === pNum)
    );

    if (matchingGrades.length === 0) {
      return { success: false, count: 0, message: 'No matching recorded marks found to delete.' };
    }

    const deleteIds = matchingGrades.map(g => g.id);

    setGrades(prev => {
      const updated = prev.filter(g => !deleteIds.includes(g.id));
      setLocalCache('grades', updated);
      localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(updated));
      return updated;
    });

    batchDeleteDocsFromFirestore(FIRESTORE_COLLECTIONS.GRADES, deleteIds);
    logAudit(
      'GRADE_BATCH_DELETED',
      'Grade',
      `${payload.class_id}-${payload.subject_id}`,
      `${currentUser.name} deleted ${matchingGrades.length} recorded marks for ${payload.assessment_type} in class ${payload.class_id}`
    );

    return {
      success: true,
      count: matchingGrades.length,
      message: `Successfully deleted ${matchingGrades.length} recorded mark(s) for this assessment.`
    };
  };

  const checkClassMarksCompleteness = (
    classId: string, 
    term?: string, 
    academicYear?: string
  ) => {
    const targetTerm = term || activeSchool.active_term || 'Term 1';
    const classRoom = classes.find(c => c.id === classId);
    const classStudents = students.filter(s => s.class_id === classId && (s.school_id === activeSchool.id || s.school_id === 'all'));
    
    // Get class subjects
    let classSubjects: Subject[] = [];
    if (classRoom && classRoom.subject_ids && classRoom.subject_ids.length > 0) {
      classSubjects = subjects.filter(s => classRoom.subject_ids!.includes(s.id));
    }
    if (classSubjects.length === 0) {
      classSubjects = subjects.filter(s => s.school_id === activeSchool.id || s.school_id === 'all').slice(0, 7);
    }

    // Deduplicate subjects by ID
    const uniqueSubjectsMap = new Map<string, Subject>();
    classSubjects.forEach(s => uniqueSubjectsMap.set(s.id, s));
    const dedupedSubjects = Array.from(uniqueSubjectsMap.values());

    let totalMissing = 0;
    const subjectStatuses = dedupedSubjects.map(sub => {
      const periods = sub.periods_per_week || sub.credits || 4;
      const subGrades = grades.filter(g => 
        g.class_id === classId && 
        g.subject_id === sub.id && 
        (g.term === targetTerm || g.term.toLowerCase() === targetTerm.toLowerCase())
      );

      const markedStudentIds = new Set(subGrades.map(g => g.student_id));
      const missingStudentNames: string[] = [];

      classStudents.forEach(st => {
        if (!markedStudentIds.has(st.id)) {
          missingStudentNames.push(`${st.first_name} ${st.last_name}`);
        }
      });

      const isComplete = classStudents.length > 0 && missingStudentNames.length === 0;
      if (!isComplete) {
        totalMissing += missingStudentNames.length;
      }

      return {
        subjectId: sub.id,
        subjectName: sub.name,
        subjectCode: sub.code,
        periods,
        totalStudents: classStudents.length,
        markedStudents: markedStudentIds.size,
        isComplete,
        missingStudentNames
      };
    });

    const isAllComplete = classStudents.length > 0 && subjectStatuses.every(s => s.isComplete);
    const totalSlots = classStudents.length * dedupedSubjects.length;
    const filledSlots = totalSlots - totalMissing;
    const completenessPercentage = totalSlots > 0 ? Math.round((filledSlots / totalSlots) * 100) : 100;

    return {
      isComplete: isAllComplete,
      missingCount: totalMissing,
      completenessPercentage,
      subjectStatuses
    };
  };

  const seedMissingClassMarks = (classId: string, term?: string) => {
    const targetTerm = term || activeSchool.active_term || 'Term 1';
    const targetYear = activeSchool.active_academic_year || '2026';
    const classRoom = classes.find(c => c.id === classId);
    if (!classRoom) return { success: false, message: 'Class not found', count: 0 };

    const classStudents = students.filter(s => s.class_id === classId && (s.school_id === activeSchool.id || s.school_id === 'all'));
    let classSubjects: Subject[] = [];
    if (classRoom.subject_ids && classRoom.subject_ids.length > 0) {
      classSubjects = subjects.filter(s => classRoom.subject_ids!.includes(s.id));
    }
    if (classSubjects.length === 0) {
      classSubjects = subjects.filter(s => s.school_id === activeSchool.id || s.school_id === 'all').slice(0, 7);
    }

    const uniqueSubjectsMap = new Map<string, Subject>();
    classSubjects.forEach(s => uniqueSubjectsMap.set(s.id, s));
    const dedupedSubjects = Array.from(uniqueSubjectsMap.values());

    const newGradeEntries: GradeEntry[] = [];
    const allTerms = ['Term 1', 'Term 2', 'Term 3'];

    allTerms.forEach(tName => {
      dedupedSubjects.forEach((sub, subIdx) => {
        const periods = sub.periods_per_week || sub.credits || 4;
        const testMax = (periods * 10) / 2;
        const examMax = (periods * 10) / 2;

        classStudents.forEach((st, stIdx) => {
          const baseFactor = 0.62 + ((stIdx % 6) * 0.06) + ((subIdx % 4) * 0.03);
          const clampedFactor = Math.min(0.96, Math.max(0.48, baseFactor));

          const testExists = grades.some(g => 
            g.student_id === st.id && 
            g.subject_id === sub.id && 
            (g.term === tName || g.term.toLowerCase() === tName.toLowerCase()) &&
            (g.assessment_type === 'Test' || g.assessment_type === 'CAT' || g.assessment_type === 'Mid term test' || g.assessment_type === 'End of Unit Test')
          );

          if (!testExists) {
            const testScore = Number((testMax * clampedFactor).toFixed(1));
            newGradeEntries.push({
              id: getCanonicalGradeDocId({
                school_id: activeSchool.id,
                student_id: st.id,
                subject_id: sub.id,
                assessment_type: 'Test',
                period_number: 1,
                term: tName,
                academic_year: targetYear
              }),
              school_id: activeSchool.id,
              student_id: st.id,
              student_name: `${st.first_name} ${st.last_name}`,
              subject_id: sub.id,
              subject_name: sub.name,
              class_id: classId,
              term: tName,
              academic_year: targetYear,
              assessment_type: 'Test',
              period_number: 1,
              marks: testScore,
              max_marks: testMax,
              teacher_id: currentUser.id,
              teacher_name: currentUser.name,
              remarks: testScore >= testMax * 0.8 ? 'Excellent comprehension of competencies.' : 'Good progressive effort.',
              entered_at: new Date().toISOString()
            });
          }

          const examExists = grades.some(g => 
            g.student_id === st.id && 
            g.subject_id === sub.id && 
            (g.term === tName || g.term.toLowerCase() === tName.toLowerCase()) &&
            (g.assessment_type === 'Final Exam' || g.assessment_type === 'END_OF_TERM')
          );

          if (!examExists) {
            const examScore = Number((examMax * (clampedFactor + 0.02)).toFixed(1));
            newGradeEntries.push({
              id: getCanonicalGradeDocId({
                school_id: activeSchool.id,
                student_id: st.id,
                subject_id: sub.id,
                assessment_type: 'Final Exam',
                period_number: 2,
                term: tName,
                academic_year: targetYear
              }),
              school_id: activeSchool.id,
              student_id: st.id,
              student_name: `${st.first_name} ${st.last_name}`,
              subject_id: sub.id,
              subject_name: sub.name,
              class_id: classId,
              term: tName,
              academic_year: targetYear,
              assessment_type: 'Final Exam',
              period_number: 2,
              marks: examScore,
              max_marks: examMax,
              teacher_id: currentUser.id,
              teacher_name: currentUser.name,
              remarks: examScore >= examMax * 0.8 ? 'Superb performance in final evaluation.' : 'Competent achievement.',
              entered_at: new Date().toISOString()
            });
          }
        });
      });
    });

    if (newGradeEntries.length > 0) {
      setGrades(prev => {
        const { deduped } = deduplicateGradesList([...newGradeEntries, ...prev]);
        setLocalCache('grades', deduped);
        localStorage.setItem(`${STORAGE_KEY}_grades`, JSON.stringify(deduped));
        return deduped;
      });
      batchSyncDocsToFirestore(FIRESTORE_COLLECTIONS.GRADES, newGradeEntries);
      logAudit('MARKS_AUTO_SEEDED', 'GradeEntry', classId, `Auto-seeded ${newGradeEntries.length} missing marks for ${classRoom.name} across terms to complete Rwandan report criteria.`);
    }

    return {
      success: true,
      message: `Completed marks register: ${newGradeEntries.length} assessment records synchronized.`,
      count: newGradeEntries.length
    };
  };

  const enrollStudentsBulk = (
    classId: string, 
    studentsList: Array<Omit<Student, 'id' | 'school_id' | 'registration_number' | 'class_id' | 'class_name'>>
  ) => {
    const classRoom = classes.find(c => c.id === classId);
    if (!classRoom) {
      return { success: false, message: 'Selected class does not exist.', count: 0 };
    }

    const currentYear = activeSchool.active_academic_year || '2026';
    const classPrefix = classRoom.name.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase();
    const startNum = students.filter(s => s.class_id === classId).length + 1;

    const newStudents: Student[] = studentsList.map((st, idx) => {
      const regNum = `REB-${currentYear}-${classPrefix}-${String(startNum + idx).padStart(3, '0')}`;
      const genderVal: 'MALE' | 'FEMALE' = (st.gender === 'FEMALE' || (typeof st.gender === 'string' && st.gender.toUpperCase().startsWith('F'))) ? 'FEMALE' : 'MALE';
      const newStudent: Student = {
        id: `std-bulk-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        school_id: activeSchool.id,
        first_name: st.first_name.trim(),
        last_name: st.last_name.trim(),
        registration_number: regNum,
        gender: genderVal,
        date_of_birth: st.date_of_birth || '2010-05-15',
        class_id: classRoom.id,
        class_name: classRoom.name,
        level_name: classRoom.level_name || classRoom.level || 'Standard Level',
        guardian_name: st.guardian_name || 'Guardian',
        guardian_phone: st.guardian_phone || '+250 788 000 000',
        guardian_phone_secondary: st.guardian_phone_secondary,
        emergency_phone: st.emergency_phone,
        guardian_email: st.guardian_email || '',
        guardian_relation: st.guardian_relation || 'Parent',
        boarding_status: st.boarding_status || 'DAY',
        photo_url: st.photo_url || '',
        address: st.address || 'Kigali, Rwanda',
        enrollment_date: new Date().toISOString().substring(0, 10),
        status: 'ACTIVE',
        conduct_score: 40,
        conduct_grade: 'A'
      };
      return newStudent;
    });

    setStudents(prev => [...prev, ...newStudents]);
    newStudents.forEach(st => syncDocToFirestore('students', st.id, st));

    logAudit('STUDENTS_BULK_ENROLLED', 'Student', classId, `Bulk enrolled ${newStudents.length} students into ${classRoom.name}`);
    return {
      success: true,
      message: `Successfully enrolled ${newStudents.length} students into ${classRoom.name}.`,
      count: newStudents.length,
      students: newStudents
    };
  };

  const getStudentReportCard = (
    studentId: string, 
    term?: string,
    options?: {
      reportMode?: 'TERMINAL' | 'ANNUAL';
      selectedTestType?: string;
      selectedExamType?: string;
    }
  ): StudentReportCard => {
    const student = students.find(s => s.id === studentId) || students[0];
    const targetTerm = term || activeSchool.active_term || 'Term 1';
    const targetAcademicYear = activeSchool.active_academic_year || '2026';
    const reportMode = options?.reportMode || 'TERMINAL';

    if (!student) {
      return {
        student: {} as Student,
        term: targetTerm,
        academicYear: targetAcademicYear,
        reportMode,
        subjectGrades: [],
        totalMarksObtained: 0,
        totalMaxPossible: 0,
        overallAveragePercentage: 0,
        classRank: 1,
        totalStudentsInClass: 1,
        attendancePercentage: 100,
        conductRemark: 'No remarks recorded.'
      };
    }

    const classInfo = classes.find(c => c.id === student.class_id);
    const isPrePrimary = isPrePrimaryLevel(classInfo);

    // Get relevant subjects for this student's class (Deduplicated)
    let classSubjects: Subject[] = [];
    if (classInfo && classInfo.subject_ids && classInfo.subject_ids.length > 0) {
      classSubjects = subjects.filter(s => classInfo.subject_ids!.includes(s.id));
    }
    if (classSubjects.length === 0) {
      classSubjects = subjects.filter(s => s.school_id === activeSchool.id || s.school_id === 'all').slice(0, 8);
    }

    const dedupedSubjectsMap = new Map<string, Subject>();
    classSubjects.forEach(s => dedupedSubjectsMap.set(s.id, s));
    const activeSubjects = Array.from(dedupedSubjectsMap.values());

    // Helper: calculate scaled test, exam, and total for a subject in a given term
    // Rwandan standard: 1 period = 10 marks total on report card.
    // Test is scaled to (periods * 10) / 2. Exam is scaled to (periods * 10) / 2.
    const calculateSubjectTermMarks = (sub: Subject, targetStudentId: string, termName: string) => {
      const periods = Math.max(1, sub.periods_per_week || sub.credits || 4);
      const subjectReportMax = periods * 10;
      const testMax = subjectReportMax / 2;
      const examMax = subjectReportMax / 2;

      const termGrades = grades.filter(g => 
        g.student_id === targetStudentId && 
        g.subject_id === sub.id && 
        (g.term === termName || g.term.toLowerCase() === termName.toLowerCase())
      );

      // Find test assessment
      const testAssessment = termGrades.find(g => 
        (options?.selectedTestType && g.assessment_type === options.selectedTestType) ||
        g.assessment_type === 'Test' || 
        g.assessment_type === 'CAT' || 
        g.assessment_type === 'Mid term test' ||
        g.assessment_type === 'End of Unit Test' ||
        g.assessment_type.toLowerCase().includes('test') ||
        g.assessment_type.toLowerCase().includes('cat') ||
        g.assessment_type.toLowerCase().includes('quiz')
      ) || termGrades[0];

      // Find exam assessment
      const examAssessment = termGrades.find(g => 
        (options?.selectedExamType && g.assessment_type === options.selectedExamType) ||
        g.assessment_type === 'Final Exam' || 
        g.assessment_type === 'END_OF_TERM' ||
        g.assessment_type.toLowerCase().includes('exam') ||
        g.assessment_type.toLowerCase().includes('end')
      ) || (termGrades.length > 1 ? termGrades[1] : undefined);

      let scaledTest: number | undefined = undefined;
      let scaledExam: number | undefined = undefined;

      if (testAssessment) {
        const rawMark = Number(testAssessment.marks) || 0;
        const rawMax = Number(testAssessment.max_marks) || 30;
        scaledTest = Number(((rawMark / (rawMax > 0 ? rawMax : 30)) * testMax).toFixed(1));
      }

      if (examAssessment) {
        const rawMark = Number(examAssessment.marks) || 0;
        const rawMax = Number(examAssessment.max_marks) || 40;
        scaledExam = Number(((rawMark / (rawMax > 0 ? rawMax : 40)) * examMax).toFixed(1));
      }

      const totalMarks = Number(((scaledTest || 0) + (scaledExam || 0)).toFixed(1));
      const percentage = subjectReportMax > 0 ? Number(((totalMarks / subjectReportMax) * 100).toFixed(1)) : 0;

      return {
        periods,
        subjectReportMax,
        testMax,
        examMax,
        scaledTest,
        scaledExam,
        totalMarks,
        percentage,
        assessments: termGrades
      };
    };

    // Calculate Subject Grades for current target term
    const subjectGrades: SubjectReportGrade[] = activeSubjects.map((sub, idx) => {
      const termCalc = calculateSubjectTermMarks(sub, student.id, targetTerm);
      const gradeLetter = calculateRwandanGradeLetter(termCalc.percentage);
      const latestRemark = termCalc.assessments.find(a => a.remarks && a.remarks.trim())?.remarks;
      const defaultRemark = termCalc.percentage >= 80 
        ? 'Distinction - Excellent mastery of competencies' 
        : termCalc.percentage >= 65 
        ? 'Satisfactory - Solid effort and engagement' 
        : termCalc.percentage >= 50 
        ? 'Average - Needs consistent revision' 
        : 'Remedial reinforcement required';

      const assessments: RecordedAssessmentScore[] = termCalc.assessments.map(g => ({
        id: g.id,
        assessment_type: g.assessment_type,
        period_number: g.period_number,
        marks: Number(g.marks) || 0,
        max_marks: Number(g.max_marks) || 30,
        percentage: Number(g.max_marks) > 0 ? Number(((Number(g.marks) / Number(g.max_marks)) * 100).toFixed(1)) : 0,
        entered_at: g.entered_at,
        remarks: g.remarks,
        teacher_name: g.teacher_name
      }));

      return {
        subject: sub,
        assessments,
        cat: termCalc.scaledTest,
        mid: undefined,
        end: termCalc.scaledExam,
        testMark: termCalc.scaledTest,
        examMark: termCalc.scaledExam,
        periods_per_week: termCalc.periods,
        total: termCalc.totalMarks,
        totalMarks: termCalc.totalMarks,
        totalMaxMarks: termCalc.subjectReportMax,
        percentage: termCalc.percentage,
        gradeLetter,
        remarks: latestRemark || defaultRemark,
        positionInSubject: (idx % 3) + 1
      };
    });

    const totalMarksObtained = Number(subjectGrades.reduce((sum, s) => sum + s.totalMarks, 0).toFixed(1));
    const totalMaxPossible = Number(subjectGrades.reduce((sum, s) => sum + s.totalMaxMarks, 0).toFixed(1));
    const overallAvg = totalMaxPossible > 0 ? Number(((totalMarksObtained / totalMaxPossible) * 100).toFixed(1)) : 0;

    // ANNUAL CALCULATION (Term 1, Term 2, Term 3 combined weighed out of 100 with letters A-F, S)
    let annualSubjectGrades: AnnualSubjectGrade[] | undefined = undefined;
    let annualSummary: StudentReportCard['annualSummary'] | undefined = undefined;

    annualSubjectGrades = activeSubjects.map(sub => {
      const t1 = calculateSubjectTermMarks(sub, student.id, 'Term 1');
      const t2 = calculateSubjectTermMarks(sub, student.id, 'Term 2');
      const t3 = calculateSubjectTermMarks(sub, student.id, 'Term 3');

      const annualAvgOutOf100 = Number((((t1.totalMarks + t2.totalMarks + t3.totalMarks) / (3 * t1.subjectReportMax)) * 100).toFixed(1));
      const gradeLetter = calculateRwandanGradeLetter(annualAvgOutOf100);

      return {
        subject: sub,
        periods_per_week: t1.periods,
        totalMaxMarks: t1.subjectReportMax,
        term1Test: t1.scaledTest,
        term1Exam: t1.scaledExam,
        term1Total: t1.totalMarks,
        term2Test: t2.scaledTest,
        term2Exam: t2.scaledExam,
        term2Total: t2.totalMarks,
        term3Test: t3.scaledTest,
        term3Exam: t3.scaledExam,
        term3Total: t3.totalMarks,
        annualAverageOutOf100: annualAvgOutOf100,
        gradeLetter,
        remarks: annualAvgOutOf100 >= 80 ? 'Distinction achieved' : annualAvgOutOf100 >= 60 ? 'Credit pass' : annualAvgOutOf100 >= 50 ? 'General pass' : 'Requires improvement'
      };
    });

    // Classmate scores and rankings per term & annual
    const classmates = students.filter(s => s.class_id === student.class_id && (s.school_id === activeSchool.id || s.school_id === 'all'));

    // Helper to calculate classmate average in a given term
    const getClasmmateTermAvg = (cmId: string, tName: string) => {
      let obtained = 0;
      let possible = 0;
      activeSubjects.forEach(sub => {
        const c = calculateSubjectTermMarks(sub, cmId, tName);
        obtained += c.totalMarks;
        possible += c.subjectReportMax;
      });
      return possible > 0 ? (obtained / possible) * 100 : 0;
    };

    const cmTerm1 = classmates.map(c => ({ id: c.id, avg: getClasmmateTermAvg(c.id, 'Term 1') })).sort((a, b) => b.avg - a.avg);
    const cmTerm2 = classmates.map(c => ({ id: c.id, avg: getClasmmateTermAvg(c.id, 'Term 2') })).sort((a, b) => b.avg - a.avg);
    const cmTerm3 = classmates.map(c => ({ id: c.id, avg: getClasmmateTermAvg(c.id, 'Term 3') })).sort((a, b) => b.avg - a.avg);
    const cmAnnual = classmates.map(c => {
      const a1 = getClasmmateTermAvg(c.id, 'Term 1');
      const a2 = getClasmmateTermAvg(c.id, 'Term 2');
      const a3 = getClasmmateTermAvg(c.id, 'Term 3');
      return { id: c.id, avg: (a1 + a2 + a3) / 3 };
    }).sort((a, b) => b.avg - a.avg);

    const t1RankIndex = cmTerm1.findIndex(c => c.id === student.id);
    const t2RankIndex = cmTerm2.findIndex(c => c.id === student.id);
    const t3RankIndex = cmTerm3.findIndex(c => c.id === student.id);
    const annualRankIndex = cmAnnual.findIndex(c => c.id === student.id);

    const studentT1Avg = Number(getClasmmateTermAvg(student.id, 'Term 1').toFixed(1));
    const studentT2Avg = Number(getClasmmateTermAvg(student.id, 'Term 2').toFixed(1));
    const studentT3Avg = Number(getClasmmateTermAvg(student.id, 'Term 3').toFixed(1));
    const studentAnnualAvg = Number(((studentT1Avg + studentT2Avg + studentT3Avg) / 3).toFixed(1));

    const t1Rank = isPrePrimary ? getPrePrimaryQualitativeComment(studentT1Avg) : (t1RankIndex >= 0 ? t1RankIndex + 1 : 1);
    const t2Rank = isPrePrimary ? getPrePrimaryQualitativeComment(studentT2Avg) : (t2RankIndex >= 0 ? t2RankIndex + 1 : 1);
    const t3Rank = isPrePrimary ? getPrePrimaryQualitativeComment(studentT3Avg) : (t3RankIndex >= 0 ? t3RankIndex + 1 : 1);
    const annualRank = isPrePrimary ? getPrePrimaryQualitativeComment(studentAnnualAvg) : (annualRankIndex >= 0 ? annualRankIndex + 1 : 1);

    annualSummary = {
      term1Total: Number((totalMaxPossible * (studentT1Avg / 100)).toFixed(1)),
      term1Max: totalMaxPossible,
      term1Percentage: studentT1Avg,
      term1Rank: t1Rank,
      term2Total: Number((totalMaxPossible * (studentT2Avg / 100)).toFixed(1)),
      term2Max: totalMaxPossible,
      term2Percentage: studentT2Avg,
      term2Rank: t2Rank,
      term3Total: Number((totalMaxPossible * (studentT3Avg / 100)).toFixed(1)),
      term3Max: totalMaxPossible,
      term3Percentage: studentT3Avg,
      term3Rank: t3Rank,
      annualTotalMarks: Number(((totalMaxPossible * (studentAnnualAvg / 100)) * 3).toFixed(1)),
      annualMaxMarks: totalMaxPossible * 3,
      annualAveragePercentage: studentAnnualAvg,
      annualRank: annualRank,
      deliberationDecision: studentAnnualAvg >= 50 ? 'PROMOTED TO NEXT LEVEL' : 'RETAINED FOR REMEDIATION'
    };

    // Current Term Rank
    const currentTermRankIndex = targetTerm === 'Term 2' ? t2RankIndex : targetTerm === 'Term 3' ? t3RankIndex : t1RankIndex;
    const classRank = isPrePrimary 
      ? getPrePrimaryQualitativeComment(overallAvg) 
      : (currentTermRankIndex >= 0 ? currentTermRankIndex + 1 : 1);

    const prePrimaryComment = isPrePrimary ? getPrePrimaryQualitativeComment(reportMode === 'ANNUAL' ? studentAnnualAvg : overallAvg) : undefined;

    // Student attendance
    const studentAttendance = attendance.filter(a => 
      a.student_id === student.id && 
      (a.school_id === activeSchool.id || !a.school_id)
    );
    const presentCount = studentAttendance.filter(a => a.status === 'PRESENT').length;
    const attendancePercentage = studentAttendance.length > 0
      ? Number(((presentCount / studentAttendance.length) * 100).toFixed(1))
      : 97.5;

    // Student conduct
    const conductRecord = studentConducts.find(c => 
      c.student_id === student.id && 
      (c.term === targetTerm || c.term.toLowerCase() === targetTerm.toLowerCase())
    );

    return {
      student,
      term: targetTerm,
      academicYear: targetAcademicYear,
      reportMode,
      isPrePrimary,
      prePrimaryComment,
      subjectGrades,
      annualSubjectGrades,
      annualSummary,
      totalMarksObtained,
      totalMaxPossible,
      overallAveragePercentage: reportMode === 'ANNUAL' ? studentAnnualAvg : overallAvg,
      classRank: reportMode === 'ANNUAL' ? annualRank : classRank,
      totalStudentsInClass: classmates.length || 35,
      attendancePercentage,
      conductScore: conductRecord ? conductRecord.conduct_score : (student.conduct_score || 38),
      conductMaxScore: conductRecord ? conductRecord.max_score : 40,
      conductGrade: conductRecord ? conductRecord.conduct_grade : (student.conduct_grade || 'A'),
      conductRemark: conductRecord ? conductRecord.remarks : (student.deliberation_notes || 'Exemplary character, disciplined, and an active participant in school life.'),
      headmasterRemark: overallAvg >= 75 ? 'Outstanding academic achievement. Promoted with honors.' : overallAvg >= 50 ? 'Good progression. Encourage sustained academic discipline.' : 'Requires targeted revision before subsequent term.'
    };
  };

  // -------------------------------------------------------------
  // TIMETABLE & CONFLICT VALIDATOR
  // -------------------------------------------------------------
  const validateTimetableSlot = (slot: Omit<TimetableSlot, 'id' | 'school_id'>, excludeId?: string) => {
    // Check 0: Leader role restriction (DOS/DOD/Bursar/Librarian can NEVER be on timetables)
    if (slot.teacher_id && !slot.is_break && !slot.is_free) {
      const assignedUser = availableUsers.find(u => u.id === slot.teacher_id);
      if (assignedUser && assignedUser.role !== 'TEACHER') {
        return {
          isValid: false,
          conflictReason: `Role Policy Violation: Staff member ${assignedUser.name} has leadership role "${assignedUser.role}". Leaders (DOS, DOD, Bursar, Librarian, Admin) are strictly prohibited from being scheduled on timetables.`,
        };
      }
    }

    // Check 1: Teacher double-booking (Teacher cannot be in two places at same time on same day)
    const teacherConflict = timetable.find(t => 
      t.id !== excludeId &&
      t.school_id === activeSchool.id &&
      t.teacher_id === slot.teacher_id &&
      t.day_of_week === slot.day_of_week &&
      t.term === slot.term &&
      t.start_time === slot.start_time
    );

    if (teacherConflict) {
      return {
        isValid: false,
        conflictReason: `Teacher Conflict: ${slot.teacher_name} is already assigned to ${teacherConflict.class_name} in ${teacherConflict.room} at ${slot.start_time} on ${slot.day_of_week}.`,
      };
    }

    // Check 2: Room double-booking (Room cannot host two classes simultaneously)
    const roomConflict = timetable.find(t => 
      t.id !== excludeId &&
      t.school_id === activeSchool.id &&
      t.room.toLowerCase().trim() === slot.room.toLowerCase().trim() &&
      t.day_of_week === slot.day_of_week &&
      t.term === slot.term &&
      t.start_time === slot.start_time
    );

    if (roomConflict) {
      return {
        isValid: false,
        conflictReason: `Room Double-Booking: Room ${slot.room} is already booked for ${roomConflict.class_name} (${roomConflict.subject_name}) at ${slot.start_time}.`,
      };
    }

    return { isValid: true };
  };

  const addOrUpdateTimetableSlot = (slot: Omit<TimetableSlot, 'id' | 'school_id'>, id?: string) => {
    const validation = validateTimetableSlot(slot, id);
    if (!validation.isValid) {
      return { success: false, error: validation.conflictReason };
    }

    if (id) {
      const updatedSlot: TimetableSlot = { ...slot, id, school_id: activeSchool.id };
      setTimetable(prev => prev.map(t => t.id === id ? updatedSlot : t));
      syncDocToFirestore(FIRESTORE_COLLECTIONS.TIMETABLES, id, updatedSlot);
      logAudit('TIMETABLE_UPDATED', 'TimetableSlot', id, `Updated timetable slot for ${slot.class_name} - ${slot.subject_name}`);
    } else {
      const newSlot: TimetableSlot = {
        ...slot,
        id: `tt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        school_id: activeSchool.id,
      };
      setTimetable(prev => [...prev, newSlot]);
      syncDocToFirestore(FIRESTORE_COLLECTIONS.TIMETABLES, newSlot.id, newSlot);
      logAudit('TIMETABLE_CREATED', 'TimetableSlot', newSlot.id, `Created timetable slot for ${slot.class_name} - ${slot.subject_name} (${slot.day_of_week} ${slot.start_time})`);
    }

    return { success: true };
  };

  const deleteTimetableSlot = (slotId: string) => {
    setTimetable(prev => prev.filter(t => t.id !== slotId));
    deleteDocFromFirestore(FIRESTORE_COLLECTIONS.TIMETABLES, slotId);
    logAudit('TIMETABLE_DELETED', 'TimetableSlot', slotId, `Removed timetable slot ${slotId}`);
  };

  const updateTimetableConfig = (configUpdates: Partial<TimetableConfig>) => {
    setTimetableConfig(prev => {
      const updated = { ...prev, ...configUpdates };
      syncDocToFirestore(FIRESTORE_COLLECTIONS.TIMETABLE_CONFIGS, `${activeSchool.id}-config`, { ...updated, id: `${activeSchool.id}-config`, school_id: activeSchool.id });
      return updated;
    });
  };

  const clearTimetableSlots = (scope: { target: 'ALL_SCHOOL' | 'LEVEL' | 'CLASS'; levelName?: string; classId?: string }) => {
    const slotsToDelete: string[] = [];
    setTimetable(prev => {
      let remaining: TimetableSlot[] = [];
      if (scope.target === 'ALL_SCHOOL') {
        prev.forEach(s => { if (s.school_id === activeSchool.id) slotsToDelete.push(s.id); });
        remaining = prev.filter(s => s.school_id !== activeSchool.id);
      } else if (scope.target === 'LEVEL' && scope.levelName) {
        const targetClassIds = new Set(
          classes.filter(c => c.school_id === activeSchool.id && (c.level_name === scope.levelName || c.level === scope.levelName)).map(c => c.id)
        );
        prev.forEach(s => { if (s.school_id === activeSchool.id && targetClassIds.has(s.class_id)) slotsToDelete.push(s.id); });
        remaining = prev.filter(s => s.school_id !== activeSchool.id || !targetClassIds.has(s.class_id));
      } else if (scope.target === 'CLASS' && scope.classId) {
        prev.forEach(s => { if (s.school_id === activeSchool.id && s.class_id === scope.classId) slotsToDelete.push(s.id); });
        remaining = prev.filter(s => s.school_id !== activeSchool.id || s.class_id !== scope.classId);
      } else {
        remaining = prev;
      }
      localStorage.setItem(`${STORAGE_KEY}_timetable`, JSON.stringify(remaining));
      setLocalCache('timetables', remaining);
      return remaining;
    });

    if (slotsToDelete.length > 0) {
      batchDeleteDocsFromFirestore(FIRESTORE_COLLECTIONS.TIMETABLES, slotsToDelete);
    }
    logAudit('TIMETABLE_CLEARED', 'Timetable', activeSchool.id, `Cleared ${slotsToDelete.length} timetable slots for ${activeSchool.name} (scope: ${scope.target})`);
  };

  const generateMasterTimetable = (
    config: TimetableConfig,
    scope: { target: 'ALL_SCHOOL' | 'LEVEL' | 'CLASS'; levelName?: string; classId?: string },
    authorizedBy?: { name: string; role: string }
  ): TimetableGenerationResult => {
    let targetClassList: ClassRoom[] = [];
    const schoolClasses = classes.filter(c => c.school_id === activeSchool.id);

    if (scope.target === 'ALL_SCHOOL') {
      targetClassList = schoolClasses;
    } else if (scope.target === 'LEVEL' && scope.levelName) {
      targetClassList = schoolClasses.filter(c => c.level_name === scope.levelName || c.level === scope.levelName);
    } else if (scope.target === 'CLASS' && scope.classId) {
      targetClassList = schoolClasses.filter(c => c.id === scope.classId);
    }

    if (targetClassList.length === 0) {
      return {
        success: false,
        slots: timetable.filter(s => s.school_id === activeSchool.id),
        stats: {
          totalSlotsCreated: 0,
          classesScheduledCount: 0,
          teacherConflictsCount: 0,
          roomConflictsCount: 0,
          coveragePercentage: 0,
          diagnostics: ['No target classes found for scheduling.']
        },
        error: 'No classes found for the selected scope.'
      };
    }

    // Identify and delete previous timetable slots completely to avoid collisions
    const oldSchoolSlots = timetable.filter(s => s.school_id === activeSchool.id);
    const slotsToDelete = scope.target === 'ALL_SCHOOL'
      ? oldSchoolSlots
      : oldSchoolSlots.filter(s => targetClassList.some(c => c.id === s.class_id));
    const slotsToDeleteIds = slotsToDelete.map(s => s.id);

    if (slotsToDeleteIds.length > 0) {
      batchDeleteDocsFromFirestore(FIRESTORE_COLLECTIONS.TIMETABLES, slotsToDeleteIds);
    }

    const schoolTeachers = availableUsers.filter(u => 
      u.role === 'TEACHER' && 
      (u.school_id === activeSchool.id || u.school_id === 'all')
    );

    // Retain existing slots that are outside the current wipe scope
    const retainedSlots = timetable.filter(s => !slotsToDeleteIds.includes(s.id));

    const result = generateConflictFreeTimetable({
      schoolId: activeSchool.id,
      academicYear: activeSchool.active_academic_year || '2026',
      term: activeSchool.active_term || 'Term 1',
      targetClasses: targetClassList,
      subjects,
      teacherAssignments,
      teachers: schoolTeachers,
      config,
      existingSlots: retainedSlots,
      clearExistingTarget: true
    });

    if (result.slots) {
      // Ensure all newly generated slots explicitly have this school's ID
      const newSchoolSlots = result.slots.map(s => ({
        ...s,
        school_id: activeSchool.id
      }));

      const allMergedSlots = [...retainedSlots.filter(s => s.school_id !== activeSchool.id), ...newSchoolSlots];
      setTimetable(allMergedSlots);
      setTimetableConfig(config);
      setLocalCache('timetables', allMergedSlots);
      localStorage.setItem(`${STORAGE_KEY}_timetable`, JSON.stringify(allMergedSlots));

      batchSyncDocsToFirestore(FIRESTORE_COLLECTIONS.TIMETABLES, newSchoolSlots);
      syncDocToFirestore(FIRESTORE_COLLECTIONS.TIMETABLE_CONFIGS, `${activeSchool.id}-config`, { 
        ...config, 
        id: `${activeSchool.id}-config`, 
        school_id: activeSchool.id 
      });

      logAudit(
        'TIMETABLE_AUTO_GENERATED', 
        'Timetable', 
        activeSchool.id, 
        `Master Timetable Generated: ${result.stats.totalSlotsCreated} slots for ${activeSchool.name}. Previous ${slotsToDeleteIds.length} slots deleted entirely to prevent collisions. Authorized by ${authorizedBy?.name || currentUser.name} (${authorizedBy?.role || currentUser.role}).`
      );
    }

    return result;
  };

  // -------------------------------------------------------------
  // ATTENDANCE
  // -------------------------------------------------------------
  const markAttendanceSession = (
    records: { student_id: string; status: AttendanceRecord['status']; remarks?: string }[],
    classId: string,
    optionsOrSubjectId?: {
      subjectId?: string;
      subjectName?: string;
      attendanceType?: 'CLASS_DAILY' | 'SUBJECT_SESSION';
      periodNumber?: number;
      date?: string;
    } | string
  ) => {
    const isOptionsObj = typeof optionsOrSubjectId === 'object' && optionsOrSubjectId !== null;
    const subjectId = isOptionsObj ? optionsOrSubjectId.subjectId : optionsOrSubjectId;
    const attendanceType = isOptionsObj ? (optionsOrSubjectId.attendanceType || (subjectId ? 'SUBJECT_SESSION' : 'CLASS_DAILY')) : (subjectId ? 'SUBJECT_SESSION' : 'CLASS_DAILY');
    const periodNumber = isOptionsObj ? optionsOrSubjectId.periodNumber : undefined;
    const sessionDate = isOptionsObj && optionsOrSubjectId.date ? optionsOrSubjectId.date : new Date().toISOString().substring(0, 10);
    
    const targetClass = classes.find(c => c.id === classId);
    const targetSubject = subjects.find(s => s.id === subjectId);
    const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);

    const newRecords: AttendanceRecord[] = records.map(r => {
      const student = students.find(s => s.id === r.student_id);
      return {
        id: `att-${Date.now()}-${r.student_id}`,
        school_id: activeSchool.id,
        student_id: r.student_id,
        student_name: student ? `${student.first_name} ${student.last_name}` : 'Student',
        class_id: classId,
        class_name: targetClass ? targetClass.name : 'Class',
        attendance_type: attendanceType,
        subject_id: typeof subjectId === 'string' ? subjectId : undefined,
        subject_name: targetSubject?.name || (isOptionsObj ? optionsOrSubjectId.subjectName : undefined),
        period_number: periodNumber,
        date: sessionDate,
        status: r.status,
        marked_by_id: currentUser.id,
        marked_by_name: currentUser.name,
        marked_by_role: currentUser.role,
        marked_at: nowStr,
        remarks: r.remarks,
        offline_synced: false
      };
    });

    setAttendance(prev => {
      // Filter out duplicate attendance for same student, class, date, and subject/period
      const studentIds = new Set(newRecords.map(nr => nr.student_id));
      const filtered = prev.filter(a => {
        if (!studentIds.has(a.student_id)) return true;
        if (a.date !== sessionDate) return true;
        if (a.class_id !== classId) return true;
        if (attendanceType === 'CLASS_DAILY' && a.attendance_type === 'CLASS_DAILY') return false;
        if (attendanceType === 'SUBJECT_SESSION' && a.subject_id === subjectId && (periodNumber === undefined || a.period_number === periodNumber)) return false;
        return true;
      });
      const updated = [...newRecords, ...filtered];
      setLocalCache('attendance', updated);
      return updated;
    });

    // Enqueue to offline sync engine (handles both offline storage and instant cloud push when online)
    offlineSyncEngine.enqueue({
      type: 'ATTENDANCE_BATCH',
      collection: 'attendance',
      payload: newRecords
    });

    // Check for absent students to trigger automated SMS Alert
    const absentees = records.filter(r => r.status === 'ABSENT');
    absentees.forEach(a => {
      const st = students.find(s => s.id === a.student_id);
      if (st && st.guardian_phone) {
        const sessionLabel = attendanceType === 'SUBJECT_SESSION' && targetSubject ? `for ${targetSubject.name}` : `for full day`;
        const alertContent = `Elimu360 Attendance Notice [${activeSchool.code}]: ${st.first_name} ${st.last_name} was marked ABSENT ${sessionLabel} on ${sessionDate} in class ${st.class_name}. Please contact the school if this is unexpected.`;
        const alertNotif: NotificationLog = {
          id: `notif-att-${Date.now()}-${st.id}`,
          school_id: activeSchool.id,
          recipient_name: st.guardian_name,
          recipient_phone: st.guardian_phone,
          channel: 'SMS_AFRICAS_TALKING',
          trigger: 'ATTENDANCE_BREACH',
          content: alertContent,
          status: 'DELIVERED',
          cost_rwf: 15,
          timestamp: nowStr,
        };
        setNotifications(prev => [alertNotif, ...prev]);
        setSmsBalanceRwf(prev => Math.max(0, prev - 15));
      }
    });

    logAudit('ATTENDANCE_MARKED', 'Attendance', `${classId}-${sessionDate}`, `Marked ${attendanceType} attendance for ${records.length} students in ${targetClass?.name || classId}`);
    return { success: true, count: records.length, message: `Attendance for ${records.length} students recorded successfully.` };
  };

  const getStudentAttendanceRate = (studentId: string) => {
    const studentRecords = attendance.filter(a => a.student_id === studentId);
    if (studentRecords.length === 0) return 96.0;
    const presentCount = studentRecords.filter(a => a.status === 'PRESENT' || a.status === 'EXCUSED').length;
    return Number(((presentCount / studentRecords.length) * 100).toFixed(1));
  };

  // -------------------------------------------------------------
  // STUDENT ENROLMENT & WELFARE
  // -------------------------------------------------------------
  const enrollStudent = (studentData: Omit<Student, 'id' | 'school_id' | 'registration_number'>) => {
    const randomSeq = Math.floor(100 + Math.random() * 900);
    const schoolCode = activeSchool.code || 'REB';
    const currentYear = activeSchool.active_academic_year || '2026';
    const cleanYear = currentYear.replace(/[\/\s-]+/g, '_').substring(0, 9);
    const classPrefix = studentData.class_name.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase();
    const regNum = `${schoolCode}-${cleanYear}-${classPrefix}-${randomSeq}`;
    
    const newStudent: Student = {
      ...studentData,
      id: `stud-${Date.now()}`,
      school_id: activeSchool.id,
      registration_number: regNum,
    };

    setStudents(prev => [newStudent, ...prev]);
    logAudit('STUDENT_ENROLLED', 'Student', regNum, `Enrolled new student ${studentData.first_name} ${studentData.last_name} into ${studentData.class_name}`);
    triggerConfetti();
    return newStudent;
  };

  const updateStudent = (studentId: string, updates: Partial<Student>) => {
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === studentId) {
          let updated = { ...s, ...updates };
          if (updates.class_id && updates.class_id !== s.class_id) {
            const randomSeq = Math.floor(100 + Math.random() * 900);
            const schoolCode = activeSchool.code || 'REB';
            const currentYear = activeSchool.active_academic_year || '2026';
            const cleanYear = currentYear.replace(/[\/\s-]+/g, '_').substring(0, 9);
            const className = updates.class_name || s.class_name;
            const classPrefix = className.replace(/[^A-Za-z0-9]/g, '').substring(0, 3).toUpperCase();
            updated.registration_number = `${schoolCode}-${cleanYear}-${classPrefix}-${randomSeq}`;
          }
          return updated;
        }
        return s;
      });
      const updatedStudent = next.find(s => s.id === studentId);
      if (updatedStudent) {
        syncDocToFirestore(FIRESTORE_COLLECTIONS.STUDENTS, studentId, updatedStudent);
      }
      return next;
    });
    logAudit('STUDENT_UPDATED', 'Student', studentId, `Updated profile attributes for student ID ${studentId}`);
  };

  const recordDiscipline = (incident: Omit<DisciplineIncident, 'id' | 'school_id'>) => {
    const newInc: DisciplineIncident = {
      ...incident,
      id: `disc-${Date.now()}`,
      school_id: activeSchool.id,
    };
    setDisciplineIncidents(prev => [newInc, ...prev]);

    // Send SMS alert to parent
    const student = students.find(s => s.id === incident.student_id);
    if (student && incident.parent_notified) {
      const smsMsg = `Elimu360 Student Welfare [${activeSchool.code}]: A discipline incident (${incident.category} - ${incident.severity} Severity) was recorded for ${student.first_name}. Action taken: ${incident.action_taken}. Log into parent portal for details.`;
      const notif: NotificationLog = {
        id: `notif-disc-${Date.now()}`,
        school_id: activeSchool.id,
        recipient_name: student.guardian_name,
        recipient_phone: student.guardian_phone,
        channel: 'SMS_AFRICAS_TALKING',
        trigger: 'DISCIPLINE_ALERT',
        content: smsMsg,
        status: 'DELIVERED',
        cost_rwf: 15,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setNotifications(prev => [notif, ...prev]);
      setSmsBalanceRwf(prev => Math.max(0, prev - 15));
    }

    logAudit('DISCIPLINE_LOGGED', 'DisciplineIncident', newInc.id, `Logged ${incident.severity} discipline case for ${incident.student_name} (${incident.category})`);
  };

  const issuePermissionPass = (pass: Omit<PermissionExitRecord, 'id' | 'school_id' | 'status'>) => {
    const newPass: PermissionExitRecord = {
      ...pass,
      id: `perm-${Date.now()}`,
      school_id: activeSchool.id,
      status: 'OUT',
    };
    setPermissions(prev => [newPass, ...prev]);

    const student = students.find(s => s.id === pass.student_id);
    if (student) {
      const notifMsg = `Elimu360 Gate Pass [${activeSchool.code}]: ${student.first_name} ${student.last_name} has checked out of school premises at ${pass.departure_time} for: ${pass.reason}. Authorized by ${pass.authorized_by}.`;
      const notif: NotificationLog = {
        id: `notif-perm-${Date.now()}`,
        school_id: activeSchool.id,
        recipient_name: student.guardian_name,
        recipient_phone: student.guardian_phone,
        channel: 'SMS_AFRICAS_TALKING',
        trigger: 'PERMISSION_EXIT',
        content: notifMsg,
        status: 'DELIVERED',
        cost_rwf: 15,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      };
      setNotifications(prev => [notif, ...prev]);
      setSmsBalanceRwf(prev => Math.max(0, prev - 15));
    }

    logAudit('GATE_PASS_ISSUED', 'PermissionExitRecord', newPass.id, `Issued exit pass for ${pass.student_name} to ${pass.destination}`);
  };

  const markStudentReturned = (permissionId: string) => {
    const timeNow = new Date().toTimeString().substring(0, 5);
    setPermissions(prev => prev.map(p => p.id === permissionId ? {
      ...p,
      status: 'RETURNED',
      actual_return_time: `${new Date().toISOString().substring(0, 10)} ${timeNow}`,
    } : p));
    logAudit('GATE_PASS_CLOSED', 'PermissionExitRecord', permissionId, `Student returned and checked back in at gate.`);
  };

  // -------------------------------------------------------------
  // LIBRARY
  // -------------------------------------------------------------
  const borrowBook = (bookId: string, studentId: string, daysDuration = 14) => {
    const book = books.find(b => b.id === bookId);
    const student = students.find(s => s.id === studentId);
    if (!book || !student) {
      return { success: false, message: 'Invalid book or student identifier.' };
    }
    if (book.available_copies <= 0) {
      return { success: false, message: `No copies of "${book.title}" are currently available.` };
    }

    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + daysDuration);

    const newBorrow: LibraryBorrowRecord = {
      id: `bor-${Date.now()}`,
      school_id: activeSchool.id,
      book_id: book.id,
      book_title: book.title,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      student_reg: student.registration_number,
      borrow_date: today.toISOString().substring(0, 10),
      due_date: dueDate.toISOString().substring(0, 10),
      status: 'BORROWED',
      fine_amount_rwf: 0,
    };

    setBorrowRecords(prev => [newBorrow, ...prev]);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, available_copies: b.available_copies - 1 } : b));
    logAudit('BOOK_BORROWED', 'Library', newBorrow.id, `Borrowed "${book.title}" to ${student.registration_number}`);
    return { success: true, message: `"${book.title}" issued to ${student.first_name}. Due on ${dueDate.toISOString().substring(0, 10)}.` };
  };

  const returnBook = (borrowId: string) => {
    const record = borrowRecords.find(r => r.id === borrowId);
    if (!record) return;

    setBorrowRecords(prev => prev.map(r => r.id === borrowId ? {
      ...r,
      status: 'RETURNED',
      return_date: new Date().toISOString().substring(0, 10),
    } : r));

    setBooks(prev => prev.map(b => b.id === record.book_id ? { ...b, available_copies: b.available_copies + 1 } : b));
    logAudit('BOOK_RETURNED', 'Library', borrowId, `Returned "${record.book_title}" from ${record.student_name}`);
  };

  const markBookLost = (borrowId: string) => {
    const record = borrowRecords.find(r => r.id === borrowId);
    if (!record) return;
    const book = books.find(b => b.id === record.book_id);
    const fee = book ? book.replacement_fee_rwf : 25000;

    setBorrowRecords(prev => prev.map(r => r.id === borrowId ? {
      ...r,
      status: 'LOST',
      fine_amount_rwf: fee,
    } : r));

    logAudit('BOOK_LOST_FINED', 'Library', borrowId, `Marked "${record.book_title}" lost by ${record.student_name}. Replacement fine of RWF ${fee.toLocaleString()} linked to Bursar ledger.`);
  };

  const addNewBook = (book: Omit<LibraryBook, 'id' | 'school_id' | 'available_copies'>) => {
    const newBook: LibraryBook = {
      ...book,
      id: `bk-${Date.now()}`,
      school_id: activeSchool.id,
      available_copies: book.total_copies,
    };
    setBooks(prev => [...prev, newBook]);
    logAudit('BOOK_CATALOGUED', 'Library', newBook.id, `Catalogued new book "${book.title}" (${book.total_copies} copies)`);
  };

  // -------------------------------------------------------------
  // E-LEARNING & QUIZZES
  // -------------------------------------------------------------
  const uploadMaterial = (mat: Omit<ELearningMaterial, 'id' | 'school_id' | 'created_at' | 'download_count'>) => {
    const newMat: ELearningMaterial = {
      ...mat,
      id: `mat-${Date.now()}`,
      school_id: activeSchool.id,
      created_at: new Date().toISOString().substring(0, 10),
      download_count: 1,
    };
    setMaterials(prev => [newMat, ...prev]);
    logAudit('MATERIAL_UPLOADED', 'ELearning', newMat.id, `Uploaded "${mat.title}" for ${mat.subject_name}`);
  };

  const createAssignment = (asg: Omit<Assignment, 'id' | 'school_id' | 'created_at'>) => {
    const newAsg: Assignment = {
      ...asg,
      id: `asg-${Date.now()}`,
      school_id: activeSchool.id,
      created_at: new Date().toISOString().substring(0, 10),
    };
    setAssignments(prev => [newAsg, ...prev]);
    logAudit('ASSIGNMENT_CREATED', 'ELearning', newAsg.id, `Created assignment "${asg.title}" for ${asg.class_name}`);
  };

  const submitAssignmentQuiz = (assignmentId: string, answers: number[], studentId: string) => {
    const assignment = assignments.find(a => a.id === assignmentId);
    const student = students.find(s => s.id === studentId) || students[0];
    if (!assignment || !assignment.questions) return 0;

    let correctCount = 0;
    assignment.questions.forEach((q, idx) => {
      if (answers[idx] === q.correct_index) {
        correctCount++;
      }
    });

    const score = Math.round((correctCount / assignment.questions.length) * assignment.total_points);

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      assignment_id: assignmentId,
      student_id: student.id,
      student_name: `${student.first_name} ${student.last_name}`,
      submitted_at: new Date().toISOString().replace('T', ' ').substring(0, 19),
      answers,
      score,
      teacher_feedback: `Auto-graded quiz: ${correctCount}/${assignment.questions.length} questions correct (${Math.round((score / assignment.total_points) * 100)}%).`,
      status: 'GRADED',
    };

    setSubmissions(prev => [newSub, ...prev]);
    logAudit('QUIZ_SUBMITTED', 'ELearning', newSub.id, `Quiz auto-graded for ${student.first_name}: ${score}/${assignment.total_points} pts`);
    triggerConfetti();
    return score;
  };

  const gradeWrittenSubmission = (submissionId: string, score: number, feedback: string) => {
    setSubmissions(prev => prev.map(s => s.id === submissionId ? {
      ...s,
      score,
      teacher_feedback: feedback,
      status: 'GRADED',
    } : s));
    logAudit('SUBMISSION_GRADED', 'ELearning', submissionId, `Graded student submission with score ${score}`);
  };

  // -------------------------------------------------------------
  // COMMUNICATION & SMS
  // -------------------------------------------------------------
  const sendMessage = (receiverId: string, messageText: string) => {
    const receiver = availableUsers.find(u => u.id === receiverId) || availableUsers[1];
    const conversationId = `conv-${[currentUser.id, receiver.id].sort().join('-')}`;

    const newMsg: CommunicationMessage = {
      id: `msg-${Date.now()}`,
      school_id: activeSchool.id,
      conversation_id: conversationId,
      sender_id: currentUser.id,
      sender_name: currentUser.name,
      sender_role: currentUser.role,
      receiver_id: receiver.id,
      receiver_name: receiver.name,
      message: messageText,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      read: false,
    };

    setMessages(prev => [...prev, newMsg]);
  };

  const sendBulkSMSAlert = (recipients: { name: string; phone: string }[], messageContent: string, trigger: NotificationLog['trigger']) => {
    const costPerSms = 15; // 15 RWF per Africa's Talking local SMS unit
    const totalCost = recipients.length * costPerSms;

    const newLogs: NotificationLog[] = recipients.map((r, i) => ({
      id: `notif-bulk-${Date.now()}-${i}`,
      school_id: activeSchool.id,
      recipient_name: r.name,
      recipient_phone: r.phone,
      channel: 'SMS_AFRICAS_TALKING',
      trigger,
      content: messageContent,
      status: 'DELIVERED',
      cost_rwf: costPerSms,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
    }));

    setNotifications(prev => [...newLogs, ...prev]);
    setSmsBalanceRwf(prev => Math.max(0, prev - totalCost));
    logAudit('BULK_SMS_DISPATCHED', 'Notification', `BULK-${recipients.length}`, `Dispatched ${recipients.length} SMS via Elimu360 Direct Gateway.`);

    return { sentCount: recipients.length, totalCostRwf: totalCost };
  };

  // Special Cases & Safeguards Logic
  const recordSpecialCase = (payload: Omit<SpecialCaseRecord, 'id' | 'school_id' | 'created_at' | 'status'>) => {
    const newRecord: SpecialCaseRecord = {
      ...payload,
      id: `spc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      school_id: activeSchool.id,
      created_at: new Date().toISOString(),
      status: 'ACTIVE_SPECIAL_CASE'
    };

    setSpecialCases(prev => [newRecord, ...prev]);
    syncDocToFirestore(FIRESTORE_COLLECTIONS.SPECIAL_CASES, newRecord.id, newRecord);

    // Update target student in state
    setStudents(prev => prev.map(s => {
      if (s.id === payload.student_id) {
        if (payload.action_type === 'PROMOTION') {
          return {
            ...s,
            class_id: payload.new_class_id || s.class_id,
            class_name: payload.new_class_name || s.class_name,
            status: 'PROMOTED'
          };
        } else if (payload.action_type === 'DEMOTION') {
          return {
            ...s,
            class_id: payload.new_class_id || s.class_id,
            class_name: payload.new_class_name || s.class_name,
            status: 'ACTIVE'
          };
        } else if (payload.action_type === 'DELETION') {
          return {
            ...s,
            status: 'SUSPENDED'
          };
        }
      }
      return s;
    }));

    logAudit('SPECIAL_CASE_RECORDED', 'Student', payload.student_id, `Special Case action [${payload.action_type}] recorded for ${payload.student_name}. Reason: ${payload.reason}`);

    return { success: true, message: `Special case recorded successfully for ${payload.student_name}.`, record: newRecord };
  };

  const restoreSpecialCaseStudent = (specialCaseId: string) => {
    const targetCase = specialCases.find(sc => sc.id === specialCaseId);
    if (!targetCase) {
      return { success: false, message: 'Special case record not found.' };
    }

    const currentActiveYear = activeSchool.active_academic_year || '2025-2026';
    if (targetCase.academic_year !== currentActiveYear) {
      return { 
        success: false, 
        message: `Cannot restore student from a past academic year (${targetCase.academic_year}). The student must be re-registered.` 
      };
    }

    // Restore student
    setStudents(prev => prev.map(s => {
      if (s.id === targetCase.student_id) {
        return {
          ...s,
          status: 'ACTIVE',
          class_id: targetCase.former_class_id,
          class_name: targetCase.former_class_name
        };
      }
      return s;
    }));

    // Update special case status
    setSpecialCases(prev => prev.map(sc => {
      if (sc.id === specialCaseId) {
        const updated = { ...sc, status: 'RESTORED' as const };
        syncDocToFirestore(FIRESTORE_COLLECTIONS.SPECIAL_CASES, updated.id, updated);
        return updated;
      }
      return sc;
    }));

    logAudit('SPECIAL_CASE_STUDENT_RESTORED', 'Student', targetCase.student_id, `Restored student ${targetCase.student_name} from special cases back to active class roster (${targetCase.former_class_name}).`);

    return { success: true, message: `Student ${targetCase.student_name} restored to active roster in ${targetCase.former_class_name}.` };
  };

  const checkDuplicateOrSpecialCaseStudent = (payload: {
    first_name: string;
    last_name: string;
    class_id: string;
    guardian_name: string;
    guardian_phone: string;
    date_of_birth?: string;
  }) => {
    const cleanFirst = (payload.first_name || '').trim().toLowerCase();
    const cleanLast = (payload.last_name || '').trim().toLowerCase();
    const cleanFullName = `${cleanFirst} ${cleanLast}`;
    const cleanGuardianName = (payload.guardian_name || '').trim().toLowerCase();
    const cleanGuardianPhone = (payload.guardian_phone || '').replace(/[^0-9]/g, '');

    // 1. Check Special Cases
    const specialMatch = specialCases.find(sc => {
      if (sc.status !== 'ACTIVE_SPECIAL_CASE') return false;
      const scName = (sc.student_name || '').trim().toLowerCase();
      const scPhone = (sc.guardian_phone || '').replace(/[^0-9]/g, '');
      return scName === cleanFullName || (cleanGuardianPhone && scPhone === cleanGuardianPhone);
    });

    if (specialMatch) {
      return {
        inSpecialCase: true,
        specialCaseRecord: specialMatch,
        isDuplicate: false,
        commonAttributes: []
      };
    }

    // 2. Check Active Student Roster for Duplicates
    const duplicateMatch = students.find(st => {
      if (st.school_id !== activeSchool.id && st.school_id !== 'all') return false;
      const stFirst = (st.first_name || '').trim().toLowerCase();
      const stLast = (st.last_name || '').trim().toLowerCase();
      const stName = `${stFirst} ${stLast}`;
      const stGuardianName = (st.guardian_name || '').trim().toLowerCase();
      const stGuardianPhone = (st.guardian_phone || '').replace(/[^0-9]/g, '');

      const nameMatches = stName === cleanFullName || (stFirst === cleanFirst && stLast === cleanLast);
      const sameClass = st.class_id === payload.class_id;
      const guardianMatches = Boolean(cleanGuardianName && stGuardianName === cleanGuardianName);
      const phoneMatches = Boolean(cleanGuardianPhone && stGuardianPhone === cleanGuardianPhone);
      const dobMatches = Boolean(payload.date_of_birth && st.date_of_birth && st.date_of_birth === payload.date_of_birth);

      return nameMatches && (sameClass || guardianMatches || phoneMatches || dobMatches);
    });

    if (duplicateMatch) {
      const commonAttributes: string[] = [];
      if (`${duplicateMatch.first_name} ${duplicateMatch.last_name}`.toLowerCase() === cleanFullName) {
        commonAttributes.push('Full Student Name');
      }
      if (duplicateMatch.class_id === payload.class_id) {
        commonAttributes.push('Target Class');
      }
      if (cleanGuardianName && duplicateMatch.guardian_name.toLowerCase() === cleanGuardianName) {
        commonAttributes.push('Guardian Name');
      }
      if (cleanGuardianPhone && duplicateMatch.guardian_phone.replace(/[^0-9]/g, '') === cleanGuardianPhone) {
        commonAttributes.push('Guardian Contact Number');
      }
      if (payload.date_of_birth && duplicateMatch.date_of_birth === payload.date_of_birth) {
        commonAttributes.push('Date of Birth / Age');
      }

      return {
        inSpecialCase: false,
        isDuplicate: true,
        duplicateStudent: duplicateMatch,
        commonAttributes
      };
    }

    return {
      inSpecialCase: false,
      isDuplicate: false,
      commonAttributes: []
    };
  };

  // Reset demo data
  const resetToDefaultData = () => {
    setStudents(INITIAL_STUDENTS);
    setPayments(INITIAL_PAYMENTS);
    setFeeStructures(INITIAL_FEE_STRUCTURES);
    setGrades(INITIAL_GRADES);
    setAttendance(INITIAL_ATTENDANCE);
    setTimetable(INITIAL_TIMETABLE);
    setDisciplineIncidents(INITIAL_DISCIPLINE);
    setBooks(INITIAL_BOOKS);
    setBorrowRecords(INITIAL_BORROWS);
    setPermissions(INITIAL_PERMISSIONS);
    setMaterials(INITIAL_MATERIALS);
    setAssignments(INITIAL_ASSIGNMENTS);
    setSubmissions(INITIAL_SUBMISSIONS);
    setMessages(INITIAL_MESSAGES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSmsBalanceRwf(150000);
    localStorage.clear();
  };

  const setRegistrarAccredited = (userId: string, status = true) => {
    setAvailableUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, has_passed_training: status };
        syncUserToFirestore(updated);
        return updated;
      }
      return u;
    }));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, has_passed_training: status }));
    }
  };

  const setCoordinatorAccredited = (userId: string, status = true) => {
    setAvailableUsers(prev => prev.map(u => {
      if (u.id === userId) {
        const updated = { ...u, has_passed_training: status };
        syncUserToFirestore(updated);
        return updated;
      }
      return u;
    }));
    if (currentUser?.id === userId) {
      setCurrentUser(prev => ({ ...prev, has_passed_training: status }));
    }
  };

  const value = {
    currentView,
    setCurrentView,
    isAuthenticated,
    setIsAuthenticated,
    activeSchool,
    setActiveSchool,
    currentUser,
    setCurrentUser,
    switchUserRole,
    availableSchools,
    availableUsers,
    teachers,
    staffMembers,
    login,
    logout,
    claimAccountAndSetPassword,
    refreshDataFromCloud,
    firestoreReadStats: firestoreReadMetrics,
    registerSchoolBySuperAdmin,
    registerCoordinator,
    registerRegistrar,
    registerSchoolByRegistrar,
    toggleSchoolPilotStatus,
    toggleSchoolTermPayment,
    updateSchoolSurvey,
    approveSchoolRegistryCode,
    deleteRegistrarByCoordinator,
    restoreRegistrarBySuperAdmin,
    reassignRegistrarToCoordinator,
    bulkReassignRegistrars,
    disableOrDeleteSchoolBySuperAdmin,
    deleteSchool,
    generateUniqueSchoolCode,
    registerStaffMember,
    updateSchoolProfile,
    updateUserProfile,
    toggleUserActiveStatus,
    permanentlyDeleteUser,
    topUpSmsBalance,
    educationLevels,
    getSchoolEducationLevels,
    toggleEducationLevel,
    addCustomEducationLevel,
    updateEducationLevel,
    addClass,
    updateClass,
    deleteClass,
    executeDeliberationPromotion,
    setSchoolTerms,
    addSubject,
    updateSubject,
    deleteSubject,
    assignSubjectsToClass,
    teacherAssignments,
    appointTeacherToSubject,
    removeTeacherAssignment,
    assignClassTeacher,
    getTeacherAssignments,
    studentConducts,
    updateStudentConduct,
    getStudentConduct,
    bulkUpdateClassConduct,
    classes,
    subjects,
    students,
    feeStructures,
    payments,
    grades,
    attendance,
    timetable,
    timetableConfig,
    updateTimetableConfig,
    generateMasterTimetable,
    clearTimetableSlots,
    disciplineIncidents,
    books,
    borrowRecords,
    permissions,
    materials,
    assignments,
    submissions,
    messages,
    notifications,
    auditLogs,
    smsBalanceRwf,
    registerPayment,
    addFeeStructure,
    deleteFeeStructure,
    updateFeeStructure,
    getStudentFeeLedger,
    getSchoolFinancialSummary,
    submitGrade,
    submitBatchGrades,
    deleteGrade,
    deleteGradeBatch,
    getStudentReportCard,
    checkClassMarksCompleteness,
    seedMissingClassMarks,
    enrollStudentsBulk,
    validateTimetableSlot,
    addOrUpdateTimetableSlot,
    deleteTimetableSlot,
    markAttendanceSession,
    getStudentAttendanceRate,
    enrollStudent,
    updateStudent,
    recordDiscipline,
    issuePermissionPass,
    markStudentReturned,
    borrowBook,
    returnBook,
    markBookLost,
    addNewBook,
    uploadMaterial,
    createAssignment,
    submitAssignmentQuiz,
    gradeWrittenSubmission,
    sendMessage,
    sendBulkSMSAlert,
    resetToDefaultData,
    triggerConfetti,
    cloudSyncState,
    archivedClasses,
    registeredAcademicYears,
    registerAcademicYear,
    archiveClassYear,
    specialCases,
    recordSpecialCase,
    restoreSpecialCaseStudent,
    checkDuplicateOrSpecialCaseStudent,
    setRegistrarAccredited,
    setCoordinatorAccredited,
    theme,
    setTheme,
    toggleTheme,
  };

  return <ElimuContext.Provider value={value}>{children}</ElimuContext.Provider>;
};

export const useElimu = () => {
  const context = useContext(ElimuContext);
  if (!context) {
    throw new Error('useElimu must be used within an ElimuProvider');
  }
  return context;
};
