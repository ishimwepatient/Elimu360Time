export interface LessonPlanStep {
  duration: string;
  teacherActivities: string[];
  learnerActivities: string[];
  competencesAndCrossCutting: string[];
}

export interface LessonPlanData {
  id: string;
  user_id?: string;
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
  customLogoUrl?: string;
  teacherSignatureTitle?: string;
}

export interface UserPerks {
  vipBatchingUnlocked: boolean; // Batch generate 10+ plans at once
  customBrandingUnlocked: boolean; // Custom school logo & signature stamp on exports
  schemeOfWorkUnlocked: boolean; // AI Scheme of Work Auto-Generator
  priorityProcessing: boolean; // Fast-track AI generation
  ambassadorBadge: boolean;
}

export interface UserProfile {
  id: string;
  email: string;
  name?: string;
  photoUrl?: string;
  schoolName?: string;
  referralCode?: string;
  sharesCount?: number;
  referralsCount?: number;
  unlockedPerks?: UserPerks;
  createdAt?: string;
}

export interface ExtractedUnit {
  unitNumber: string;
  unitTitle: string;
  keyUnitCompetence?: string;
  lessonTitles: string[];
}

export interface ExtractedBookData {
  bookTitle: string;
  subject: string;
  classLevel: string;
  units: ExtractedUnit[];
}

export interface GenerationParams {
  schoolName: string;
  teacherName: string;
  subject: string;
  classLevel: string;
  term: string;
  date: string;
  unitNumber: string;
  unitTitle: string;
  lessonTitles: string[];
  duration: string;
  classSize: number;
  location: string;
  specialNeeds: string;
  customCompetence?: string;
}
