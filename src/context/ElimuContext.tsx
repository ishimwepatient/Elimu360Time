import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { LessonPlanData, UserProfile, UserPerks } from '../types';

interface ElimuContextType {
  currentUser: UserProfile | null;
  firebaseUser: FirebaseUser | null;
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

const LOCAL_STORAGE_KEY = 'elimu360_guest_plans';
const GUEST_PERKS_KEY = 'elimu360_guest_perks_unlocked';

export const ElimuProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);

  const [savedLessonPlans, setSavedLessonPlans] = useState<LessonPlanData[]>([]);
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

  // Helper to generate a unique teacher referral code
  const generateReferralCode = (uid: string) => {
    return `ELIMU360_${uid.substring(0, 6).toUpperCase()}`;
  };

  const defaultPerks: UserPerks = {
    vipBatchingUnlocked: true,
    customBrandingUnlocked: true,
    schemeOfWorkUnlocked: true,
    priorityProcessing: true,
    ambassadorBadge: true,
  };

  // Share and unlock perks
  const shareAndUnlockPerks = async (source: string = 'manual_share') => {
    setGuestPerksUnlocked(true);
    localStorage.setItem(GUEST_PERKS_KEY, 'true');

    if (currentUser) {
      const updatedShares = (currentUser.sharesCount || 0) + 1;
      const updatedUser: UserProfile = {
        ...currentUser,
        sharesCount: updatedShares,
        unlockedPerks: defaultPerks,
      };

      setCurrentUser(updatedUser);

      try {
        const userRef = doc(db, 'users', currentUser.id);
        await updateDoc(userRef, {
          sharesCount: updatedShares,
          unlockedPerks: defaultPerks,
        });
      } catch (e) {
        console.warn('Error updating Firestore sharesCount:', e);
      }
    }
  };

  const isPerkUnlocked = (perk: keyof UserPerks): boolean => {
    if (guestPerksUnlocked) return true;
    if (currentUser?.unlockedPerks?.[perk]) return true;
    // Default unlocked for all registered users who interact or share
    if (currentUser) return true;
    return false;
  };

  // 1. Firebase Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        const refCode = generateReferralCode(user.uid);
        let userProfile: UserProfile = {
          id: user.uid,
          email: user.email || '',
          name: user.displayName || user.email?.split('@')[0] || 'Teacher',
          photoUrl: user.photoURL || '',
          referralCode: refCode,
          sharesCount: guestPerksUnlocked ? 1 : 0,
          unlockedPerks: defaultPerks,
          createdAt: new Date().toISOString()
        };

        // Save/Sync user profile doc in Firestore
        try {
          const userRef = doc(db, 'users', user.uid);
          const userSnap = await getDoc(userRef);
          if (userSnap.exists()) {
            const data = userSnap.data();
            userProfile = {
              ...userProfile,
              ...data,
              referralCode: data.referralCode || refCode,
              unlockedPerks: data.unlockedPerks || defaultPerks
            };
          } else {
            await setDoc(userRef, userProfile);
          }
        } catch (err) {
          console.warn('Error fetching/writing user profile doc:', err);
        }

        setCurrentUser(userProfile);

        // Fetch user's Firestore saved plans
        fetchUserLessonPlans(user.uid);
      } else {
        setCurrentUser(null);
        // Load local guest plans
        loadGuestPlans();
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, [guestPerksUnlocked]);

  const loadGuestPlans = () => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        setSavedLessonPlans(Array.isArray(parsed) ? parsed : []);
      } else {
        setSavedLessonPlans([]);
      }
    } catch {
      setSavedLessonPlans([]);
    }
  };

  const saveGuestPlansToStorage = (plans: LessonPlanData[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(plans));
    } catch (err) {
      console.warn('Error saving guest plans to localStorage:', err);
    }
  };

  const fetchUserLessonPlans = async (userId: string) => {
    setPlansLoading(true);
    try {
      const q = query(collection(db, 'lesson_plans'), where('user_id', '==', userId));
      const querySnapshot = await getDocs(q);
      const fetched: LessonPlanData[] = [];
      querySnapshot.forEach((docSnap) => {
        fetched.push({ id: docSnap.id, ...docSnap.data() } as LessonPlanData);
      });

      // Combine with local guest plans
      const rawGuest = localStorage.getItem(LOCAL_STORAGE_KEY);
      const guestPlans: LessonPlanData[] = rawGuest ? JSON.parse(rawGuest) : [];

      if (guestPlans.length > 0) {
        for (const plan of guestPlans) {
          try {
            const planRef = doc(db, 'lesson_plans', plan.id);
            await setDoc(planRef, { ...plan, user_id: userId, createdAt: new Date().toISOString() });
            fetched.push({ ...plan, user_id: userId });
          } catch (e) {
            console.warn('Failed migrating guest plan to firestore:', e);
          }
        }
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      }

      fetched.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
      setSavedLessonPlans(fetched);
    } catch (err) {
      console.warn('Error fetching Firestore lesson plans:', err);
      loadGuestPlans();
    } finally {
      setPlansLoading(false);
    }
  };

  const saveLessonPlan = async (plan: LessonPlanData) => {
    const planToSave = {
      ...plan,
      user_id: currentUser?.id || undefined,
      createdAt: plan.createdAt || new Date().toISOString()
    };

    if (currentUser) {
      try {
        const planRef = doc(db, 'lesson_plans', plan.id);
        await setDoc(planRef, planToSave);
      } catch (err) {
        console.error('Error saving plan to Firestore:', err);
      }
    }

    setSavedLessonPlans(prev => {
      const exists = prev.some(p => p.id === plan.id);
      const nextList = exists
        ? prev.map(p => p.id === plan.id ? planToSave : p)
        : [planToSave, ...prev];
      if (!currentUser) saveGuestPlansToStorage(nextList);
      return nextList;
    });
  };

  const saveMultipleLessonPlans = async (plans: LessonPlanData[]) => {
    const formattedPlans = plans.map(p => ({
      ...p,
      user_id: currentUser?.id || undefined,
      createdAt: p.createdAt || new Date().toISOString()
    }));

    if (currentUser) {
      for (const p of formattedPlans) {
        try {
          const planRef = doc(db, 'lesson_plans', p.id);
          await setDoc(planRef, p);
        } catch (err) {
          console.error('Error saving batch plan to Firestore:', err);
        }
      }
    }

    setSavedLessonPlans(prev => {
      const nextList = [...formattedPlans, ...prev.filter(p => !formattedPlans.some(fp => fp.id === p.id))];
      if (!currentUser) saveGuestPlansToStorage(nextList);
      return nextList;
    });
  };

  const updateLessonPlan = async (plan: LessonPlanData) => {
    await saveLessonPlan(plan);
  };

  const deleteLessonPlan = async (id: string) => {
    if (currentUser) {
      try {
        await deleteDoc(doc(db, 'lesson_plans', id));
      } catch (err) {
        console.error('Error deleting plan from Firestore:', err);
      }
    }

    setSavedLessonPlans(prev => {
      const nextList = prev.filter(p => p.id !== id);
      if (!currentUser) saveGuestPlansToStorage(nextList);
      return nextList;
    });
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      closeAuthModal();
    } catch (err) {
      console.error('Google Sign In Error:', err);
      throw err;
    }
  };

  const signUpWithEmail = async (email: string, pass: string, name?: string) => {
    try {
      // Firebase Authentication hashes passwords using scrypt/bcrypt algorithms on Google's cloud servers
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      if (res.user) {
        const refCode = generateReferralCode(res.user.uid);
        const userProfile: UserProfile = {
          id: res.user.uid,
          email,
          name: name || email.split('@')[0],
          referralCode: refCode,
          sharesCount: guestPerksUnlocked ? 1 : 0,
          unlockedPerks: defaultPerks,
          createdAt: new Date().toISOString()
        };
        await setDoc(doc(db, 'users', res.user.uid), userProfile);
        setCurrentUser(userProfile);
      }
      closeAuthModal();
    } catch (err) {
      console.error('Sign Up Error:', err);
      throw err;
    }
  };

  const signInWithEmail = async (email: string, pass: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      closeAuthModal();
    } catch (err) {
      console.error('Sign In Error:', err);
      throw err;
    }
  };

  const logout = async () => {
    await signOut(auth);
    setCurrentUser(null);
    setFirebaseUser(null);
    loadGuestPlans();
  };

  return (
    <ElimuContext.Provider value={{
      currentUser,
      firebaseUser,
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
