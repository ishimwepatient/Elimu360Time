import React, { createContext, useContext, useState, useEffect } from 'react';
import { LessonPlanData } from '../types';

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
}

const ElimuContext = createContext<ElimuContextType | undefined>(undefined);

const LOCAL_PLANS_KEY = 'elimu360_saved_lesson_plans';

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
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [shareModalOpen, setShareModalOpen] = useState<boolean>(false);

  // Sync saved plans to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(savedLessonPlans));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }, [savedLessonPlans]);

  const openShareModal = () => setShareModalOpen(true);
  const closeShareModal = () => setShareModalOpen(false);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
  };

  const saveLessonPlan = async (plan: LessonPlanData) => {
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
      closeShareModal
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
