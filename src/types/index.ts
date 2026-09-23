export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'COORDINATOR'
  | 'REGISTER'
  | 'SCHOOL_ADMIN' 
  | 'DOS' 
  | 'DOD'
  | 'TEACHER' 
  | 'BURSAR' 
  | 'LIBRARIAN' 
  | 'PARENT' 
  | 'STUDENT';

export type CurriculumType = 'REB' | 'CAMBRIDGE' | 'IB';

export type EducationLevelType = 
  | 'PRE_PRIMARY' // Pre-Primary Education (Nursery School)
  | 'PRIMARY'     // Primary Education
  | 'O_LEVEL'     // Ordinary Level / O-Level
  | 'A_LEVEL';    // Upper Secondary Education (Advanced Level / A-Level)

export interface SchoolEducationLevel {
  id: string;
  school_id: string;
  level_type: EducationLevelType;
  name: string; // e.g. "Pre-Primary Education (Nursery School)", "Ordinary Level / O-Level"
  short_name: string; // e.g. "Nursery", "Primary", "O-Level", "A-Level"
  description?: string;
  order: number;
  is_enabled: boolean;
  grades: string[]; // e.g. ['Baby Class', 'Middle Class', 'Top Class'] or ['Senior 1', 'Senior 2', 'Senior 3']
}

export interface SchoolOnboardingSurvey {
  id?: string;
  school_id?: string;
  school_name?: string;
  conducted_by_id?: string;
  conducted_by_name?: string;
  conducted_by_role?: UserRole;
  conducted_at?: string;
  target_student_capacity?: number;
  computer_lab_available?: boolean;
  internet_connectivity?: string;
  primary_administrative_pain_point?: string;
  sms_broadcast_required?: boolean;
  notes?: string;
  decision_maker_reachability?: 'Very difficult' | 'Difficult' | 'Moderate' | 'Easy' | 'Very easy';
  school_interest_level?: 'Not interested' | 'Slightly interested' | 'Moderately interested' | 'Very interested' | 'Extremely interested';
  explaining_ease?: 'Very difficult' | 'Difficult' | 'Moderate' | 'Easy' | 'Very easy';
  attracting_features?: string[]; // e.g. ['Academics & Report Cards', 'Fee Management', ...]
  biggest_objection?: string;
  competitor_or_current_system?: string;
  requested_missing_features?: string;
  likelihood_to_join_pilot?: 'Unlikely' | 'Somewhat likely' | 'Likely' | 'Very likely' | 'Already committed';
  improvement_suggestions?: string;
  field_notes?: string;
}

export interface SchoolTermPaymentRecord {
  academic_year: string;
  term: string; // e.g. 'Term 1', 'Term 2', 'Term 3'
  is_paid: boolean;
  paid_amount_rwf?: number;
  paid_at?: string;
  recorded_by_id?: string;
  recorded_by_name?: string;
  notes?: string;
}

export interface School {
  id: string;
  name: string;
  code: string;
  curriculum_type: CurriculumType;
  ownership_type?: 'PUBLIC' | 'PRIVATE' | 'GOVERNMENT_AIDED';
  accommodation_type?: 'DAY' | 'BOARDING' | 'BOTH';
  country: string;
  city: string;
  district?: string;
  province?: string;
  contact_email: string;
  phone: string;
  motto: string;
  logo_url: string;
  national_coat_of_arms_url?: string;
  active_academic_year: string;
  active_term: string;
  currency: string;
  is_active: boolean;
  headteacher_name?: string;
  principal_name?: string;
  director_name?: string;
  director_email?: string;
  director_phone?: string;
  registered_by_id?: string;
  registered_by_name?: string;
  registered_by_role?: UserRole;
  coordinator_id?: string;
  coordinator_name?: string;
  approval_status?: 'PENDING' | 'APPROVED' | 'REJECTED';
  approved_by_id?: string;
  approved_by_name?: string;
  approved_at?: string;
  registry_code?: string;
  estimated_students?: number;
  pilot_status?: 'FIRST_TERM_PILOT' | 'LOYAL';
  pilot_started_at?: string;
  term_payment_records?: SchoolTermPaymentRecord[];
  onboarding_survey?: SchoolOnboardingSurvey;
  created_at?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  school_id: string;
  avatar_url: string;
  phone: string;
  national_id?: string;
  department?: string;
  subject_names?: string[];
  assigned_class_id?: string;
  is_class_teacher?: boolean;
  class_teacher_for_class_name?: string;
  linked_student_ids?: string[];
  title?: string;
  assigned_coordinator_id?: string;
  assigned_coordinator_name?: string;
  max_registrars_quota?: number; // max 15 for coordinators
  is_deleted_by_coordinator?: boolean;
  deleted_by_coordinator_id?: string;
  deleted_by_coordinator_name?: string;
  deleted_at?: string;
  is_claimed?: boolean;
  activation_token?: string;
  issued_activation_token?: string;
  token_used?: boolean;
  claimed_at?: string;
  password_hash?: string;
  must_setup_password?: boolean;
  security_question?: string;
  security_answer_hash?: string;
  created_by_role?: UserRole;
  created_by_id?: string;
  created_by_name?: string;
  created_at?: string;
  updated_at?: string;
  is_active?: boolean;
  has_passed_training?: boolean;
  training_score?: number;
  training_completed_at?: string;
}

export interface StaffRegistrationPayload {
  name: string;
  email: string;
  role: 'DOS' | 'DOD' | 'BURSAR' | 'TEACHER' | 'LIBRARIAN';
  phone: string;
  title?: string;
  subject_names?: string[];
  assigned_class_id?: string;
  is_class_teacher?: boolean;
}

export interface SchoolRegistrationPayload {
  name: string;
  code?: string;
  curriculum_type: CurriculumType;
  ownership_type?: 'PUBLIC' | 'PRIVATE' | 'GOVERNMENT_AIDED';
  accommodation_type?: 'DAY' | 'BOARDING' | 'BOTH';
  country: string;
  city: string;
  district?: string;
  province?: string;
  contact_email: string;
  phone: string;
  motto: string;
  logo_url?: string;
  director_name: string;
  director_email: string;
  director_phone: string;
  active_academic_year?: string;
  active_term?: string;
  estimated_students?: number;
  onboarding_survey?: SchoolOnboardingSurvey;
}

export interface Student {
  id: string;
  school_id: string;
  registration_number: string;
  first_name: string;
  last_name: string;
  gender: 'MALE' | 'FEMALE';
  date_of_birth: string;
  class_id: string;
  class_name: string;
  previous_class_name?: string;
  level_name?: string;
  enrollment_date: string;
  status: 'ACTIVE' | 'GRADUATED' | 'SUSPENDED' | 'TRANSFERRED' | 'RETAINED' | 'PROMOTED';
  guardian_name: string;
  guardian_phone: string;
  guardian_phone_secondary?: string;
  emergency_phone?: string;
  guardian_email: string;
  guardian_relation: string;
  address: string;
  medical_notes?: string;
  photo_url: string;
  avatar_url?: string;
  boarding_status: 'DAY' | 'BOARDING';
  conduct_score?: number; // default out of 40 (REB standard) or 100
  conduct_grade?: string;
  deliberation_decision?: 'PROMOTED' | 'RETAINED' | 'CONDITIONAL_PASS' | 'GRADUATED' | 'TRANSFERRED' | 'PENDING';
  deliberation_year?: string;
  deliberation_notes?: string;
}

export interface SpecialCaseRecord {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  student_reg: string;
  gender?: 'MALE' | 'FEMALE';
  date_of_birth?: string;
  former_class_id: string;
  former_class_name: string;
  new_class_id?: string;
  new_class_name?: string;
  action_type: 'PROMOTION' | 'DEMOTION' | 'DELETION';
  reason: string;
  administrative_notes?: string;
  academic_year: string;
  recorded_by_id: string;
  recorded_by_name: string;
  recorded_by_role: string;
  guardian_name: string;
  guardian_phone: string;
  guardian_email?: string;
  address?: string;
  created_at: string;
  status: 'ACTIVE_SPECIAL_CASE' | 'RESTORED' | 'ARCHIVED';
}

export interface ClassRoom {
  id: string;
  school_id: string;
  level_id?: string;
  level?: string; // Backward compatibility alias
  level_name: string; // e.g. "Ordinary Level / O-Level", "Primary Education"
  name: string; // e.g. "Senior 1 A", "Primary 5 B"
  grade_level?: string; // e.g. "Primary 5", "Senior 1"
  stream: string; // A, B, C, D, Science, Arts, PCM, MCB
  capacity: number;
  class_teacher_id?: string;
  class_teacher_name?: string;
  teacher_name?: string;
  room_number: string;
  subject_ids?: string[]; // IDs of subjects assigned specifically to this class
  order_index?: number; // Numeric sequence for ascending grade progression (e.g. 1 for Nursery, 4 for P1, 8 for P5, 10 for S1, etc.)
  next_class_id?: string; // ID of the default next class for deliberation promotion
}

export interface Subject {
  id: string;
  school_id: string;
  name: string;
  code: string;
  department: string;
  level_id?: string;
  level_name?: string; // e.g. "Ordinary Level / O-Level", "All Levels"
  applicable_class_ids?: string[]; // Specific classes that study this subject
  credits: number;
  periods_per_week?: number; // Number of periods per week allocated for this subject
  pass_mark: number;
}

export interface TeacherAssignment {
  id: string;
  school_id: string;
  teacher_id: string;
  teacher_name: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  class_id: string;
  class_name: string;
  level_name: string;
  academic_year: string;
  term: string;
  created_at: string;
}

export interface StudentConductRecord {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  student_reg: string;
  class_id: string;
  class_name: string;
  level_name: string;
  academic_year: string;
  term: string;
  conduct_score: number; // e.g. 40 max
  max_score: number; // 40
  conduct_grade: 'A' | 'B' | 'C' | 'D' | 'F' | 'Excellent' | 'Very Good' | 'Good' | 'Fair' | 'Poor';
  status?: 'EXEMPLARY' | 'GOOD' | 'WARNING' | 'PROBATION' | 'SUSPENSION';
  infractions_count: number;
  demerits_count?: number;
  merits_count: number;
  commendations_count?: number;
  remarks: string;
  updated_by_id: string;
  updated_by_name: string;
  updated_at: string;
}

export interface BreakSlotConfig {
  id: string;
  name: string; // e.g. "Morning Break (20 min)", "Lunch Break (60 min)", "Afternoon Break (20 min)"
  duration_mins: number; // e.g. 20, 60
  after_period: number; // After period 3, after period 5, etc.
  type: 'MORNING' | 'LUNCH' | 'AFTERNOON' | 'CUSTOM';
  enabled: boolean;
  start_time?: string;
  end_time?: string;
}

export interface TimetableConfig {
  school_start_time: string; // e.g. "08:00"
  period_duration_mins: number; // e.g. 40
  periods_per_day: number; // e.g. 8 or 9
  breaks: BreakSlotConfig[];
  free_periods_per_week: number; // e.g. 2
  allow_double_periods: boolean; // e.g. true
  include_assembly: boolean; // Monday Morning Assembly
  include_sports: boolean; // Friday Afternoon Sports & Clubs
}

export interface TimetableSlot {
  id: string;
  school_id: string;
  class_id: string;
  class_name: string;
  level_name?: string;
  subject_id: string;
  subject_name: string;
  subject_code: string;
  teacher_id: string;
  teacher_name: string;
  room: string;
  day_of_week: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  period_number?: number; // 1, 2, 3...
  start_time: string; // "08:00"
  end_time: string; // "08:40"
  is_break?: boolean;
  is_free?: boolean;
  is_special?: boolean;
  term: string;
  academic_year?: string;
}

export type AssessmentType = 
  | 'End of Unit Test' 
  | 'Mid term test' 
  | 'Quiz' 
  | 'Test' 
  | '2nd Sitting' 
  | 'Final Exam'
  | 'CAT' 
  | 'MID_TERM' 
  | 'END_OF_TERM';

export interface GradeEntry {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  subject_id: string;
  subject_name: string;
  class_id: string;
  term: string;
  academic_year: string;
  assessment_type: AssessmentType | string;
  period_number?: number; // Period number from 1 to 10
  marks: number;
  max_marks: number;
  teacher_id: string;
  teacher_name: string;
  entered_at: string;
  remarks?: string;
  is_draft?: boolean;
  offline_synced?: boolean;
}

export type AttendanceStatus = 
  | 'NOT_RECORDED' 
  | 'PRESENT' 
  | 'ABSENT' 
  | 'EXCUSED_ABSENT' 
  | 'EXCUSED' 
  | 'LATE' 
  | 'SICK';

export interface AttendanceRecord {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  class_id: string;
  class_name: string;
  attendance_type?: 'CLASS_DAILY' | 'SUBJECT_SESSION';
  subject_id?: string;
  subject_name?: string;
  period_number?: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  marked_by_id: string;
  marked_by_name: string;
  marked_by_role?: string;
  marked_at: string;
  remarks?: string;
  offline_synced?: boolean;
}

export type FeeCategory = 
  | 'TUITION' 
  | 'ACTIVITY' 
  | 'BOARDING' 
  | 'UNIFORM' 
  | 'LIBRARY' 
  | 'EXAMINATION' 
  | 'OTHER';

export interface FeeStructure {
  id: string;
  school_id: string;
  academic_year: string;
  term: string;
  class_level: string; // e.g. "ALL", "PRIMARY", "Senior 1 General"
  category: FeeCategory;
  category_label: string;
  amount: number;
  currency: string;
  due_date: string;
  mandatory: boolean;
  allocation_scope?: 'GLOBAL' | 'LEVEL' | 'CLASS' | 'STUDENT_TAG';
  education_level?: string;
  target_class_id?: string;
  target_class_name?: string;
  target_tag?: string; // e.g. 'BOARDER', 'DAY'
  frequency?: 'PER_TERM' | 'PER_YEAR' | 'ONE_TIME';
  status?: 'ACTIVE' | 'ARCHIVED';
}

export type PaymentMethod = 'CASH' | 'MTN_MOMO' | 'AIRTEL_MONEY' | 'BANK_TRANSFER';

export type StudentPaymentStatus = 'FULLY_PAID' | 'PARTIAL' | 'NOT_PAID' | 'OVERPAID' | 'EXEMPT';

export interface StudentFeeLedger {
  studentId: string;
  studentName?: string;
  studentReg?: string;
  className?: string;
  academicYear: string;
  term: string;
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
}

export interface SchoolFinancialSummary {
  academicYear: string;
  term: string;
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
}

export interface PaymentRecord {
  id: string;
  school_id: string;
  receipt_number: string;
  student_id: string;
  student_name: string;
  student_reg: string;
  class_name: string;
  fee_structure_id?: string;
  fee_category: FeeCategory;
  amount_paid: number;
  payment_date: string;
  payment_method: PaymentMethod;
  transaction_reference: string;
  bursar_id: string;
  bursar_name: string;
  payer_name: string;
  term: string;
  academic_year: string;
  remarks?: string;
  created_at: string;
}

export interface DisciplineIncident {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  class_name: string;
  date: string;
  category: 'Lateness' | 'Misconduct' | 'Uniform Violation' | 'Academic Dishonesty' | 'Skipping Class' | 'Bullying' | 'Other';
  severity: 'Low' | 'Medium' | 'High' | 'Severe';
  description: string;
  action_taken: string;
  recorded_by_name: string;
  term: string;
  parent_notified: boolean;
}

export interface LibraryBook {
  id: string;
  school_id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  total_copies: number;
  available_copies: number;
  location_shelf: string;
  replacement_fee_rwf: number;
}

export interface LibraryBorrowRecord {
  id: string;
  school_id: string;
  book_id: string;
  book_title: string;
  student_id: string;
  student_name: string;
  student_reg: string;
  borrow_date: string;
  due_date: string;
  return_date?: string;
  status: 'BORROWED' | 'RETURNED' | 'OVERDUE' | 'LOST';
  fine_amount_rwf: number;
}

export interface PermissionExitRecord {
  id: string;
  school_id: string;
  student_id: string;
  student_name: string;
  student_reg: string;
  class_name: string;
  departure_time: string;
  expected_return_time: string;
  actual_return_time?: string;
  reason: string;
  destination: string;
  authorized_by: string;
  parent_notified: boolean;
  status: 'OUT' | 'RETURNED' | 'OVERSTAYED';
}

export interface ELearningMaterial {
  id: string;
  school_id: string;
  class_id: string;
  subject_id: string;
  subject_name: string;
  title: string;
  description: string;
  file_type: 'PDF' | 'VIDEO' | 'DOC' | 'LINK';
  file_url: string;
  uploaded_by_name: string;
  created_at: string;
  download_count: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correct_index: number;
}

export interface Assignment {
  id: string;
  school_id: string;
  class_id: string;
  class_name: string;
  subject_id: string;
  subject_name: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  is_quiz: boolean;
  questions?: QuizQuestion[];
  created_by_name: string;
  created_at: string;
}

export interface AssignmentSubmission {
  id: string;
  school_id?: string;
  assignment_id: string;
  student_id: string;
  student_name: string;
  submitted_at: string;
  answers?: number[]; // indices of chosen options for quizzes
  text_response?: string;
  file_name?: string;
  score?: number;
  teacher_feedback?: string;
  status: 'PENDING' | 'GRADED';
}

export interface CommunicationMessage {
  id: string;
  school_id: string;
  conversation_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  receiver_id: string;
  receiver_name: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface NotificationLog {
  id: string;
  school_id: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email?: string;
  channel: 'SMS_AFRICAS_TALKING' | 'EMAIL_TRANSACTIONAL';
  trigger: 'ATTENDANCE_BREACH' | 'FEE_REMINDER' | 'DISCIPLINE_ALERT' | 'REPORT_CARD_PUBLISHED' | 'ANNOUNCEMENT' | 'PERMISSION_EXIT';
  content: string;
  status: 'DELIVERED' | 'QUEUED' | 'FAILED';
  cost_rwf: number;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  school_id: string;
  user_id: string;
  user_name: string;
  user_role: UserRole;
  action: string;
  entity_type: string;
  entity_id: string;
  details: string;
  timestamp: string;
  ip_address: string;
}

export interface RecordedAssessmentScore {
  id: string;
  assessment_type: string;
  period_number?: number;
  marks: number;
  max_marks: number;
  percentage: number;
  entered_at?: string;
  remarks?: string;
  teacher_name?: string;
}

export interface SubjectReportGrade {
  subject: Subject;
  assessments: RecordedAssessmentScore[];
  periods_per_week?: number;
  testMark?: number;
  testMax?: number;
  examMark?: number;
  examMax?: number;
  cat?: number;
  mid?: number;
  end?: number;
  totalMarks: number;
  totalMaxMarks: number;
  percentage: number;
  gradeLetter: string;
  remarks: string;
  positionInSubject?: number;
}

export interface AnnualSubjectGrade {
  subject: Subject;
  periods_per_week: number;
  totalMaxMarks: number; // periods * 10
  term1Test?: number;
  term1Exam?: number;
  term1Total?: number;
  term2Test?: number;
  term2Exam?: number;
  term2Total?: number;
  term3Test?: number;
  term3Exam?: number;
  term3Total?: number;
  annualAverageOutOf100: number;
  gradeLetter: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'S';
  remarks: string;
}

export interface StudentReportCard {
  student: Student;
  term: string;
  academicYear: string;
  reportMode?: 'TERMINAL' | 'ANNUAL';
  reportType?: 'PROGRESSIVE' | 'MIDTERM' | 'ANNUAL' | 'SPECIAL';
  specialAssessmentType?: string;
  isPrePrimary?: boolean;
  prePrimaryComment?: string;
  subjectGrades: SubjectReportGrade[];
  annualSubjectGrades?: AnnualSubjectGrade[];
  annualSummary?: {
    term1Total: number;
    term1Max: number;
    term1Percentage: number;
    term1Rank: number | string;
    term2Total: number;
    term2Max: number;
    term2Percentage: number;
    term2Rank: number | string;
    term3Total: number;
    term3Max: number;
    term3Percentage: number;
    term3Rank: number | string;
    annualTotalMarks: number;
    annualMaxMarks: number;
    annualAveragePercentage: number;
    annualRank: number | string;
    deliberationDecision?: string;
    term1Conduct?: { score: number; grade: string; remark: string };
    term2Conduct?: { score: number; grade: string; remark: string };
    term3Conduct?: { score: number; grade: string; remark: string };
  };
  totalMarksObtained: number;
  totalMaxPossible: number;
  overallAveragePercentage: number;
  classRank: number | string;
  totalStudentsInClass: number;
  attendancePercentage: number;
  conductScore?: number;
  conductMaxScore?: number;
  conductGrade?: string;
  conductRemark: string;
  headmasterRemark?: string;
  includeDecisions?: boolean;
  hideDecisions?: boolean;
  deliberationDetails?: {
    promotionCutoff: number;
    secondSittingEnabled: boolean;
    secondSittingMinCutoff: number;
    decisionCode: 'PROMOTED' | '2ND_SITTING' | 'REPEAT' | 'PROMOTE_ANYWHERE' | 'REPEAT_ANYWHERE';
    decisionLabel: string;
    criteriaSummary: string;
    isOverride?: boolean;
    overrideType?: 'PROMOTE_ANYWHERE' | 'REPEAT_ANYWHERE';
    overrideReason?: string;
  };
}

export interface AcademicYearConfig {
  academic_year: string;
  terms: string[];
}

export interface ArchivedClass {
  id: string;
  school_id: string;
  class_id: string;
  class_name: string;
  academic_year: string;
  archived_at: string;
  reports: StudentReportCard[];
}

export interface LessonPlanStep {
  duration: string;
  teacherActivities: string[];
  learnerActivities: string[];
  competencesAndCrossCutting: string[];
}

export interface LessonPlanData {
  id: string;
  schoolName: string;
  teacherName: string;
  term: string;
  date: string;
  subject: string;
  classLevel: string;
  unitNumber: string;
  lessonNumber: string; // e.g. "1 Out of 5"
  duration: string;
  classSize: number;
  specialNeeds: string;
  unitTitle: string;
  keyUnitCompetence: string;
  lessonTitle: string;
  instructionalObjective: string;
  location: string;
  learningMaterials: string;
  references: string;
  activitySummary: string;
  steps: {
    introduction: LessonPlanStep;
    development: LessonPlanStep;
    conclusion: LessonPlanStep;
  };
  selfEvaluation?: string;
  createdAt?: string;
}



