import React, { createContext, useContext, useState, useEffect } from 'react';
import { LessonPlanData, UserProfile, UserPerks } from '../types';

interface ElimuContextType {
  currentUser: UserProfile | null;
  firebaseUser: any | null;
  isAuthenticated: boolean;
  authLoading: boolean;
  savedLessonPlans: LessonPlanData[];
  plansLoading: boolean;
  saveLessonPlan: (plan: LessonPlanData) => Promise<void>;
  saveMultipleLessonPlans: (plans: LessonPlanData[]) => Promise<void>;
  deleteLessonPlan: (id: string) => Promise<void>;
  updateLessonPlan: (plan: LessonPlanData) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUpWithEmail: (email: string, pass: string, name?: string) => Promise<void>;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  openAuthModal: (mode?: 'login' | 'signup', reason?: string) => void;
  closeAuthModal: () => void;
  authModalOpen: boolean;
  authModalMode: 'login' | 'signup';
  authModalReason: string;
  // Referral & Rewards System
  rewardsModalOpen: boolean;
  openRewardsModal: () => void;
  closeRewardsModal: () => void;
  shareAndUnlockPerks: (source?: string) => Promise<void>;
  isPerkUnlocked: (perk: keyof UserPerks) => boolean;
  guestPerksUnlocked: boolean;
}

const ElimuContext = createContext<ElimuContextType | undefined>(undefined);

const LOCAL_PLANS_KEY = 'elimu360_saved_lesson_plans';
const LOCAL_USER_KEY = 'elimu360_current_user';
const GUEST_PERKS_KEY = 'elimu360_guest_perks_unlocked';

const defaultPerks: UserPerks = {
  vipBatchingUnlocked: true,
  customBrandingUnlocked: true,
  schemeOfWorkUnlocked: true,
  priorityProcessing: true,
  ambassadorBadge: true,
};

export const ElimuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [authLoading, setAuthLoading] = useState<boolean>(false);

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

  // Auth modal state
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [authModalReason, setAuthModalReason] = useState<string>('');

  // Rewards modal state
  const [rewardsModalOpen, setRewardsModalOpen] = useState<boolean>(false);
  const [guestPerksUnlocked, setGuestPerksUnlocked] = useState<boolean>(() => {
    return localStorage.getItem(GUEST_PERKS_KEY) === 'true';
  });

  // Sync saved plans to localStorage whenever state changes
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_PLANS_KEY, JSON.stringify(savedLessonPlans));
    } catch (err) {
      console.warn('LocalStorage save error:', err);
    }
  }, [savedLessonPlans]);

  // Sync currentUser to localStorage whenever state changes
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem(LOCAL_USER_KEY, JSON.stringify(currentUser));
      } else {
        localStorage.removeItem(LOCAL_USER_KEY);
      }
    } catch (err) {
      console.warn('LocalStorage user save error:', err);
    }
  }, [currentUser]);

  const openAuthModal = (mode: 'login' | 'signup' = 'login', reason: string = '') => {
    setAuthModalMode(mode);
    setAuthModalReason(reason);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
    setAuthModalReason('');
  };

  const openRewardsModal = () => setRewardsModalOpen(true);
  const closeRewardsModal = () => setRewardsModalOpen(false);

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

  const generateReferralCode = (uid: string) => {
    return `ELIMU360_${uid.substring(0, 6).toUpperCase()}`;
  };

  const shareAndUnlockPerks = async (source: string = 'manual_share') => {
    setGuestPerksUnlocked(true);
    localStorage.setItem(GUEST_PERKS_KEY, 'true');

    if (currentUser) {
      const updatedUser: UserProfile = {
        ...currentUser,
        sharesCount: (currentUser.sharesCount || 0) + 1,
        unlockedPerks: defaultPerks,
      };
      setCurrentUser(updatedUser);
    }
  };

  const isPerkUnlocked = (perk: keyof UserPerks): boolean => {
    if (guestPerksUnlocked) return true;
    if (currentUser?.unlockedPerks?.[perk]) return true;
    return true; // Unlocked by default for seamless standalone operation
  };

  const saveLessonPlan = async (plan: LessonPlanData) => {
    const planToSave = {
      ...plan,
      user_id: currentUser?.id || 'guest',
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
      user_id: currentUser?.id || 'guest',
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

  const signInWithGoogle = async () => {
    const mockUser: UserProfile = {
      id: 'google_user_' + Date.now(),
      email: 'teacher.google@school.rw',
      name: 'Educator Google Account',
      referralCode: generateReferralCode('google'),
      sharesCount: 1,
      unlockedPerks: defaultPerks,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(mockUser);
    closeAuthModal();
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    const mockUser: UserProfile = {
      id: 'usr_' + Date.now(),
      email,
      name: name || email.split('@')[0],
      referralCode: generateReferralCode(Date.now().toString()),
      sharesCount: 1,
      unlockedPerks: defaultPerks,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(mockUser);
    closeAuthModal();
  };

  const signInWithEmail = async (email: string, pass: string) => {
    const mockUser: UserProfile = {
      id: 'usr_' + Date.now(),
      email,
      name: email.split('@')[0],
      referralCode: generateReferralCode(Date.now().toString()),
      sharesCount: 1,
      unlockedPerks: defaultPerks,
      createdAt: new Date().toISOString()
    };
    setCurrentUser(mockUser);
    closeAuthModal();
  };

  const logout = async () => {
    setCurrentUser(null);
  };

  return (
    <ElimuContext.Provider value={{
      currentUser,
      firebaseUser: null,
      isAuthenticated: !!currentUser,
      authLoading,
      savedLessonPlans,
      plansLoading,
      saveLessonPlan,
      saveMultipleLessonPlans,
      deleteLessonPlan,
      updateLessonPlan,
      signInWithGoogle,
      signUpWithEmail,
      signInWithEmail,
      logout,
      theme,
      toggleTheme,
      openAuthModal,
      closeAuthModal,
      authModalOpen,
      authModalMode,
      authModalReason,
      rewardsModalOpen,
      openRewardsModal,
      closeRewardsModal,
      shareAndUnlockPerks,
      isPerkUnlocked,
      guestPerksUnlocked
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
