import React, { createContext, useContext, useState, useEffect } from 'react';
import { LessonPlanData } from '../types';

export interface SchoolProfile {
  schoolName: string;
  teacherName: string;
  district?: string;
  sector?: string;
  defaultLevel?: string;
  defaultClass?: string;
  defaultSubject?: string;
  academicYear?: string;
  phoneOrEmail?: string;
}

interface ElimuContextType {
  savedLessonPlans: LessonPlanData[];
  plansLoading: boolean;
  saveLessonPlan: (plan: LessonPlanData) => Promise<void>;
  saveMultipleLessonPlans: (plans: LessonPlanData[]) => Promise<void>;
  deleteLessonPlan: (id: string) => Promise<void>;
  updateLessonPlan: (plan: LessonPlanData) => Promise<void>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  shareModalOpen: boolean;
  openShareModal: () => void;
  closeShareModal: () => void;
  // School Structure & Teacher Profile persistence
  schoolProfile: SchoolProfile;
  updateSchoolProfile: (profile: Partial<SchoolProfile>) => void;
  isProfileConfigured: boolean;
  schoolProfileModalOpen: boolean;
  openSchoolProfileModal: () => void;
  closeSchoolProfileModal: () => void;
}

const ElimuContext = createContext<ElimuContextType | undefined>(undefined);

const LOCAL_PLANS_KEY = 'elimu360_saved_lesson_plans';
const LOCAL_PROFILE_KEY = 'elimu360_school_profile';

const DEFAULT_PROFILE: SchoolProfile = {
  schoolName: '',
  teacherName: '',
  district: '',
  sector: '',
  defaultLevel: 'PRIMARY',
  defaultClass: 'Primary 1 (P1)',
  defaultSubject: 'Ikinyarwanda',
  academicYear: '2025 - 2026',
  phoneOrEmail: ''
};

export const ElimuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedLessonPlans, setSavedLessonPlans] = useState<LessonPlanData[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_PLANS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [plansLoading, setPlansLoading] = useState<boolean>(false);
  
  // Light mode as default, dark mode as an optional user choice
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const stored = localStorage.getItem('elimu_theme');
      return (stored === 'dark' || stored === 'light') ? stored : 'light';
    } catch {
      return 'light';
    }
  });

  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);
  const [schoolProfileModalOpen, setSchoolProfileModalOpen] = useState<boolean>(false);

  // School profile stored persistently across sessions
  const [schoolProfile, setSchoolProfile] = useState<SchoolProfile>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_PROFILE_KEY);
      if (stored) {
        return { ...DEFAULT_PROFILE, ...JSON.parse(stored) };
      }
    } catch {
      // fallback
    }
    return DEFAULT_PROFILE;
  });

  // Apply theme to document element
  useEffect(() => {
    try {
      localStorage.setItem('elimu_theme', theme);
      if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    } catch (err) {
      console.warn('Theme save error:', err);
    }
  }, [theme]);

  // Sync saved plans to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(savedLessonPlans));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }, [savedLessonPlans]);

  // Sync school profile to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(schoolProfile));
    } catch (err) {
      console.warn('LocalStorage profile save error:', err);
    }
  }, [schoolProfile]);

  const updateSchoolProfile = (profileUpdate: Partial<SchoolProfile>) => {
    setSchoolProfile(prev => {
      const updated = { ...prev, ...profileUpdate };
      try {
        localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));
      } catch (e) {
        console.warn('Could not persist school profile:', e);
      }
      return updated;
    });
  };

  const isProfileConfigured = Boolean(
    schoolProfile.schoolName.trim().length > 0 &&
    schoolProfile.teacherName.trim().length > 0
  );

  const openShareModal = () => setShareModalOpen(true);
  const closeShareModal = () => setShareModalOpen(false);

  const openSchoolProfileModal = () => setSchoolProfileModalOpen(true);
  const closeSchoolProfileModal = () => setSchoolProfileModalOpen(false);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  };

  const saveLessonPlan = async (plan: LessonPlanData) => {
    // If the plan has teacher or school names, automatically retain them in profile
    if (plan.schoolName && plan.schoolName.trim() && !plan.schoolName.includes('...')) {
      updateSchoolProfile({ schoolName: plan.schoolName.trim() });
    }
    if (plan.teacherName && plan.teacherName.trim() && !plan.teacherName.includes('...')) {
      updateSchoolProfile({ teacherName: plan.teacherName.trim() });
    }

    const planToSave = {
      ...plan,
      id: plan.id || `lp_${Date.now()}`,
      createdAt: plan.createdAt || new Date().toISOString()
    };

    setSavedLessonPlans(prev => {
      const exists = prev.some(p => p.id === plan.id);
      return exists
        ? prev.map(p => p.id === plan.id ? planToSave : p)
        : [planToSave, ...prev];
    });
  };

  const saveMultipleLessonPlans = async (plans: LessonPlanData[]) => {
    if (plans.length > 0) {
      const p = plans[0];
      if (p.schoolName && p.schoolName.trim() && !p.schoolName.includes('...')) {
        updateSchoolProfile({ schoolName: p.schoolName.trim() });
      }
      if (p.teacherName && p.teacherName.trim() && !p.teacherName.includes('...')) {
        updateSchoolProfile({ teacherName: p.teacherName.trim() });
      }
    }

    const formattedPlans = plans.map(p => ({
      ...p,
      id: p.id || `lp_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      createdAt: p.createdAt || new Date().toISOString()
    }));

    setSavedLessonPlans(prev => {
      const filterOutExisting = prev.filter(p => !formattedPlans.some(fp => fp.id === p.id));
      return [...formattedPlans, ...filterOutExisting];
    });
  };

  const updateLessonPlan = async (plan: LessonPlanData) => {
    await saveLessonPlan(plan);
  };

  const deleteLessonPlan = async (id: string) => {
    setSavedLessonPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <ElimuContext.Provider value={{
      savedLessonPlans,
      plansLoading,
      saveLessonPlan,
      saveMultipleLessonPlans,
      deleteLessonPlan,
      updateLessonPlan,
      theme,
      toggleTheme,
      shareModalOpen,
      openShareModal,
      closeShareModal,
      schoolProfile,
      updateSchoolProfile,
      isProfileConfigured,
      schoolProfileModalOpen,
      openSchoolProfileModal,
      closeSchoolProfileModal
    }}>
      {children}
    </ElimuContext.Provider>
  );
};

export const useElimu = () => {
  const context = useContext(ElimuContext);
  if (!context) {
    throw new Error('useElimu must be used within an ElimuProvider');
  }
  return context;
};
