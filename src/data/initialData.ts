import { 
  School, 
  User, 
  Student, 
  ClassRoom, 
  Subject, 
  TimetableSlot, 
  GradeEntry, 
  AttendanceRecord, 
  FeeStructure, 
  PaymentRecord, 
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
  SchoolEducationLevel,
  TeacherAssignment,
  StudentConductRecord
} from '../types';

/**
 * Standard Educational Levels Available across East African & International Curriculums
 * Schools selectively enable/configure the levels they operate.
 */
export const DEFAULT_EDUCATION_LEVELS: Omit<SchoolEducationLevel, 'id' | 'school_id'>[] = [
  {
    level_type: 'PRE_PRIMARY',
    name: 'Pre-Primary Education (Nursery School)',
    short_name: 'Nursery',
    description: 'Early childhood foundation learning, socialization and numeracy',
    order: 1,
    is_enabled: true,
    grades: ['Baby Class', 'Middle Class', 'Top Class']
  },
  {
    level_type: 'PRIMARY',
    name: 'Primary Education',
    short_name: 'Primary',
    description: 'Foundational primary curriculum standard (Primary 1 through Primary 6)',
    order: 2,
    is_enabled: true,
    grades: ['Primary 1', 'Primary 2', 'Primary 3', 'Primary 4', 'Primary 5', 'Primary 6']
  },
  {
    level_type: 'O_LEVEL',
    name: 'Ordinary Level / O-Level',
    short_name: 'O-Level',
    description: 'Lower secondary core education (Senior 1 through Senior 3)',
    order: 3,
    is_enabled: true,
    grades: ['Senior 1', 'Senior 2', 'Senior 3']
  },
  {
    level_type: 'A_LEVEL',
    name: 'Advanced Level / A-Level',
    short_name: 'A-Level',
    description: 'Upper secondary specialized combinations (Senior 4 through Senior 6 / MCB, PCM, PCB, HEG, MEG, Arts)',
    order: 4,
    is_enabled: true,
    grades: ['Senior 4', 'Senior 5', 'Senior 6']
  }
];

/**
 * Institutional Configuration
 * Seeded with active tenant Kingdom Of Salomon School, synchronizing with Firestore cloud database.
 */
export const INITIAL_SCHOOLS: School[] = [
  {
    id: 'school-kss-5978',
    name: 'Kingdom Of Salomon School',
    code: 'KSS',
    curriculum_type: 'REB',
    ownership_type: 'PRIVATE',
    accommodation_type: 'BOTH',
    country: 'Rwanda',
    city: 'Rubavu',
    district: 'Rubavu',
    province: 'Western Province',
    contact_email: 'kuanjoeking@gmail.com',
    phone: '+250 792 612 139',
    motto: 'Shaping the Future of Rwanda.',
    logo_url: '',
    active_academic_year: '2026-2027',
    active_term: 'Term 1',
    currency: 'RWF',
    is_active: true,
    estimated_students: 450,
    director_name: 'Director Kuanjoe King',
    director_email: 'kuanjoeking@gmail.com',
    director_phone: '+250 792 612 139',
    registered_by_id: 'user-coord-01',
    registered_by_name: 'Jean Paul Habimana',
    registered_by_role: 'COORDINATOR',
    coordinator_id: 'user-coord-01',
    coordinator_name: 'Jean Paul Habimana',
    approval_status: 'APPROVED',
    registry_code: 'REG-2026-9812',
    pilot_status: 'FIRST_TERM_PILOT',
    pilot_started_at: new Date().toISOString(),
    created_at: new Date().toISOString(),
    onboarding_survey: {
      id: 'survey-kss-01',
      school_id: 'school-kss-5978',
      school_name: 'Kingdom Of Salomon School',
      conducted_by_id: 'user-coord-01',
      conducted_by_name: 'Jean Paul Habimana',
      conducted_by_role: 'COORDINATOR',
      conducted_at: new Date().toISOString(),
      decision_maker_reachability: 'Easy',
      school_interest_level: 'Extremely interested',
      explaining_ease: 'Easy',
      attracting_features: [
        'Academics & Automated REB Report Cards',
        'A4 REB Competency-Based Lesson Planner',
        'Fee Management, Receipts & Defaulters Ledger',
        'Attendance Tracking & Parent Messaging'
      ],
      biggest_objection: 'Satisfaction with Current Systems / Paper',
      competitor_or_current_system: 'Microsoft Excel Spreadsheets',
      requested_missing_features: 'Automated batch report card SMS delivery directly to parents',
      likelihood_to_join_pilot: 'Already committed',
      improvement_suggestions: 'Enable offline sync for grade entry when Internet is low in regional sectors',
      field_notes: 'Met with Director King at Rubavu campus. Very enthusiastic about REB report cards and lesson plan generator.'
    }
  }
];

/**
 * Super Admin Account Seed
 * The Super Administrator account is pre-claimed and fully provisioned with Master Root authority.
 */
export const INITIAL_USERS: User[] = [
  {
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
    // Salted Bcrypt hash of 'Admin@1234'
    password_hash: '$2a$10$O0aUq8zWw8K2Zp8r9Xb9vO4N7X/8uYxV6F2A5tE9sC1wG4hJ7kLmN',
    activation_token: '',
    token_used: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'user-coord-01',
    name: 'Jean Paul Habimana',
    email: 'coordinator.rwanda@elimu360.rw',
    role: 'COORDINATOR',
    school_id: 'global',
    avatar_url: '',
    phone: '+250 788 123 456',
    title: 'Senior Regional Coordinator — Western Province',
    max_registrars_quota: 15,
    is_claimed: true,
    must_setup_password: false,
    password_hash: '$2a$10$O0aUq8zWw8K2Zp8r9Xb9vO4N7X/8uYxV6F2A5tE9sC1wG4hJ7kLmN',
    activation_token: '',
    token_used: true,
    is_active: true,
    created_at: new Date().toISOString()
  },
  {
    id: 'user-registrar-01',
    name: 'Aline Umutoni',
    email: 'registrar.rubavu@elimu360.rw',
    role: 'REGISTER',
    school_id: 'global',
    avatar_url: '',
    phone: '+250 788 654 321',
    title: 'District School Registrar Officer — Rubavu',
    assigned_coordinator_id: 'user-coord-01',
    assigned_coordinator_name: 'Jean Paul Habimana',
    is_claimed: true,
    must_setup_password: false,
    password_hash: '$2a$10$O0aUq8zWw8K2Zp8r9Xb9vO4N7X/8uYxV6F2A5tE9sC1wG4hJ7kLmN',
    activation_token: '',
    token_used: true,
    is_active: true,
    created_at: new Date().toISOString()
  }
];

export const INITIAL_EDUCATION_LEVELS: SchoolEducationLevel[] = [];
export const INITIAL_CLASSES: ClassRoom[] = [];
export const INITIAL_SUBJECTS: Subject[] = [];
export const INITIAL_TEACHER_ASSIGNMENTS: TeacherAssignment[] = [];
export const INITIAL_CONDUCT_RECORDS: StudentConductRecord[] = [];
export const INITIAL_STUDENTS: Student[] = [];
export const INITIAL_FEE_STRUCTURES: FeeStructure[] = [];
export const INITIAL_PAYMENTS: PaymentRecord[] = [];
export const INITIAL_GRADES: GradeEntry[] = [];
export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];
export const INITIAL_TIMETABLE: TimetableSlot[] = [];
export const INITIAL_DISCIPLINE: DisciplineIncident[] = [];
export const INITIAL_BOOKS: LibraryBook[] = [];
export const INITIAL_BORROWS: LibraryBorrowRecord[] = [];
export const INITIAL_PERMISSIONS: PermissionExitRecord[] = [];
export const INITIAL_MATERIALS: ELearningMaterial[] = [];
export const INITIAL_ASSIGNMENTS: Assignment[] = [];
export const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [];
export const INITIAL_MESSAGES: CommunicationMessage[] = [];
export const INITIAL_NOTIFICATIONS: NotificationLog[] = [];
export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

