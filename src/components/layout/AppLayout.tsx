import React, { useState } from 'react';
import { 
  GraduationCap, 
  Wallet, 
  Calendar, 
  Users, 
  MessageSquare, 
  BookOpen, 
  FileText, 
  ShieldCheck, 
  LayoutDashboard, 
  LogOut, 
  ChevronDown, 
  Bell, 
  Search, 
  Sparkles, 
  Smartphone, 
  DoorOpen, 
  AlertCircle, 
  Building2,
  Menu,
  X,
  ExternalLink,
  Laptop,
  RefreshCw,
  Globe,
  Info,
  Compass,
  Camera,
  Award,
  ClipboardList,
  Sun,
  Moon
} from 'lucide-react';
import { useElimu, AppView } from '../../context/ElimuContext';
import { UserRole } from '../../types';
import { ElimuLogo, LogoExportStudioModal } from '../brand/ElimuLogo';
import { PassportPhoto } from '../common/PassportPhoto';
import { StaffPhotoUploadModal } from '../staff/StaffPhotoUploadModal';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const { 
    currentView, 
    setCurrentView, 
    activeSchool, 
    setActiveSchool, 
    availableSchools,
    currentUser, 
    smsBalanceRwf,
    notifications,
    refreshDataFromCloud,
    switchUserRole,
    logout,
    theme,
    toggleTheme
  } = useElimu();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifDrawer, setShowNotifDrawer] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showLogoStudio, setShowLogoStudio] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const navigationItems: {
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
    roles: UserRole[];
  }[] = [
    { 
      id: 'COORDINATOR_HUB', 
      label: 'Regional Governance & Oversight', 
      icon: ShieldCheck, 
      badge: 'Regional Vice',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
      roles: ['COORDINATOR'] 
    },
    { 
      id: 'REGISTRAR_PORTAL', 
      label: 'Field Onboarding Portal', 
      icon: Building2, 
      badge: 'Registrar',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      roles: ['REGISTER'] 
    },
    { 
      id: 'TRAINING_ACADEMY', 
      label: 'Field Academy & PDF Manuals', 
      icon: Award, 
      badge: 'Training',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
      roles: ['REGISTER', 'COORDINATOR'] 
    },
    { 
      id: 'DEMO_SYSTEM', 
      label: 'Live Pitch & Demo System', 
      icon: Sparkles, 
      badge: 'Pitch Sandbox',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
      roles: ['COORDINATOR', 'REGISTER'] 
    },
    { 
      id: 'SCHOOLS_MANAGEMENT', 
      label: 'Institutions & Directors', 
      icon: Building2, 
      badge: 'Super Admin',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-700',
      roles: ['SUPER_ADMIN', 'COORDINATOR'] 
    },
    { 
      id: 'DASHBOARD', 
      label: currentUser.role === 'SUPER_ADMIN' ? 'Platform Console' : currentUser.role === 'COORDINATOR' ? 'Regional Overview' : currentUser.role === 'REGISTER' ? 'Registrar Overview' : 'Campus Overview', 
      icon: LayoutDashboard, 
      roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'DOS', 'DOD', 'TEACHER', 'LIBRARIAN', 'COORDINATOR', 'REGISTER'] 
    },
    { 
      id: 'LANDING', 
      label: 'Showcase Page', 
      icon: Globe, 
      badge: 'Public',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
      roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'DOS', 'DOD', 'TEACHER', 'LIBRARIAN', 'PARENT', 'STUDENT', 'COORDINATOR', 'REGISTER'] 
    },
    { 
      id: 'SCHOOLS_MANAGEMENT', 
      label: 'Institutions Directorate', 
      icon: Building2, 
      badge: 'Multi-Tenant',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
      roles: ['SUPER_ADMIN'] 
    },
    { 
      id: 'MASTER_USERS', 
      label: 'Master Accounts & Purge', 
      icon: Users, 
      badge: 'Security',
      badgeColor: 'bg-red-950 text-red-300 border-red-700',
      roles: ['SUPER_ADMIN'] 
    },
    { 
      id: 'ACADEMICS_CLASSES', 
      label: 'Classes & Curriculum', 
      icon: BookOpen, 
      badge: 'Director / DOS',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-700',
      roles: ['SCHOOL_ADMIN', 'DOS'] 
    },
    { 
      id: 'FINANCIAL_PORTAL', 
      label: 'Financial Ledger & Fees', 
      icon: Wallet, 
      badge: 'Bursar Hub',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-700',
      roles: ['BURSAR', 'SCHOOL_ADMIN'] 
    },
    { 
      id: 'ACADEMICS_ASSESSMENTS', 
      label: 'Assessments Tracking', 
      icon: BookOpen, 
      badge: 'Evaluations',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
      roles: ['DOS', 'SCHOOL_ADMIN'] 
    },
    { 
      id: 'ACADEMICS_REPORTS', 
      label: 'Official Reports Generator', 
      icon: FileText, 
      badge: 'MINEDUC A4',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-700',
      roles: ['DOS', 'SCHOOL_ADMIN'] 
    },
    { 
      id: 'ACADEMICS_GRADES', 
      label: 'Marks Entry & Evaluation', 
      icon: ClipboardList, 
      roles: ['DOS', 'SCHOOL_ADMIN'] 
    },
    { 
      id: 'ACADEMICS_TIMETABLE', 
      label: 'Timetable & Conflict Engine', 
      icon: Calendar, 
      roles: ['DOS', 'TEACHER', 'STUDENT'] 
    },
    { 
      id: 'ACADEMICS_ELEARNING', 
      label: 'E-Learning & Quizzes', 
      icon: Laptop, 
      roles: ['TEACHER', 'STUDENT'] 
    },
    { 
      id: 'LESSON_PLANNER', 
      label: 'A4 Lesson Plan Creator', 
      icon: FileText, 
      badge: 'Gemini AI',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
      roles: ['SUPER_ADMIN', 'SCHOOL_ADMIN', 'DOS', 'TEACHER'] 
    },
    { 
      id: 'STUDENTS_DIRECTORY', 
      label: 'Student 360 Records', 
      icon: Users, 
      roles: ['SCHOOL_ADMIN', 'DOS', 'DOD'] 
    },
    { 
      id: 'STUDENTS_DISCIPLINE', 
      label: 'Discipline & Conduct', 
      icon: AlertCircle, 
      badge: 'DOD Hub',
      badgeColor: 'bg-rose-950 text-rose-300 border-rose-700',
      roles: ['DOD'] 
    },
    { 
      id: 'STUDENTS_PERMISSIONS', 
      label: 'Gate & Permission Passes', 
      icon: DoorOpen, 
      roles: ['DOD'] 
    },
    { 
      id: 'LIBRARY_PORTAL', 
      label: 'Library & Fines', 
      icon: BookOpen, 
      roles: ['LIBRARIAN'] 
    },
    { 
      id: 'PARENT_PORTAL', 
      label: 'Parent Portal & Fees', 
      icon: MessageSquare, 
      roles: ['PARENT'] 
    },
    { 
      id: 'STUDENT_PORTAL', 
      label: 'Student Learning Space', 
      icon: GraduationCap, 
      roles: ['STUDENT'] 
    },
    { 
      id: 'STAFF_MANAGEMENT', 
      label: 'Staff & Role Delegation', 
      icon: ShieldCheck, 
      badge: 'RBAC',
      badgeColor: 'bg-blue-950 text-blue-300 border-blue-700',
      roles: ['SCHOOL_ADMIN', 'DOS'] 
    },
    { 
      id: 'SMS_DISPATCHER', 
      label: 'School Messaging', 
      icon: Smartphone, 
      roles: ['SCHOOL_ADMIN', 'DOS', 'SUPER_ADMIN'] 
    },
    { 
      id: 'SETTINGS_CONFIG', 
      label: currentUser.role === 'SUPER_ADMIN' 
        ? 'Platform Config & Emblems' 
        : currentUser.role === 'SCHOOL_ADMIN' 
          ? 'School Setup & Settings' 
          : 'Account & Security Settings', 
      icon: Building2, 
      roles: ['SCHOOL_ADMIN', 'SUPER_ADMIN', 'DOS', 'DOD', 'BURSAR', 'TEACHER', 'LIBRARIAN', 'PARENT'] 
    },
    { 
      id: 'AUDIT_LOGS', 
      label: 'System Audit & Survey Reports', 
      icon: ShieldCheck, 
      roles: ['SUPER_ADMIN'] 
    },
  ];

  const visibleNavItems = navigationItems.filter(item => 
    item.roles.includes(currentUser.role)
  );

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshDataFromCloud();
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* =========================================================================
          TOP APP HEADER
          ========================================================================= */}
      <header className="no-print min-h-[3.25rem] sm:min-h-[4rem] border-b border-slate-800 bg-slate-950/95 backdrop-blur-md px-1.5 xs:px-2 sm:px-4 md:px-6 py-1 xs:py-1.5 sm:py-2 flex items-center justify-between sticky top-0 z-40 gap-1 xs:gap-1.5 sm:gap-3 w-full max-w-full">
        
        {/* Left: Mobile Toggle & Brand & School Selector */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2.5 shrink min-w-0">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-1.5 sm:p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white shrink-0 active:scale-95 transition cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-4 h-4 text-amber-400" /> : <Menu className="w-4 h-4" />}
          </button>

          <div 
            onClick={() => setCurrentView('LANDING')}
            className="flex items-center gap-1 cursor-pointer group shrink-0"
            title="Elimu360 SIMS · Return to Showcase"
          >
            <ElimuLogo size="sm" showMeaning={false} />
          </div>

          <div className="h-4 w-px bg-slate-800 hidden sm:block shrink-0" />

          {/* Multi-Tenant Ribbon Control: Super-Admin, Coordinator & Registrar see school numbers without loading private school profiles */}
          {currentUser.role === 'SUPER_ADMIN' ? (
            <div 
              title="National Network Overview"
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:py-1.5 rounded-lg bg-purple-950/80 border border-purple-800/80 text-xs font-semibold text-purple-200 shrink min-w-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-400 shrink-0" />
              <span className="text-[10px] xs:text-[11px] sm:text-xs">
                Network: <strong className="font-mono text-amber-300 font-bold">{availableSchools.length}</strong> Schools
              </span>
            </div>
          ) : currentUser.role === 'COORDINATOR' ? (
            <div 
              title="Regional Oversight Overview"
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:py-1.5 rounded-lg bg-amber-950/80 border border-amber-800/80 text-xs font-semibold text-amber-200 shrink min-w-0"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="text-[10px] xs:text-[11px] sm:text-xs">
                Regional: <strong className="font-mono text-amber-300 font-bold">{availableSchools.length}</strong> Assigned
              </span>
            </div>
          ) : currentUser.role === 'REGISTER' ? (
            <div 
              title="Field Registrar Network Overview"
              className="flex items-center gap-1 sm:gap-1.5 px-2 py-1 sm:py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-xs font-semibold text-emerald-200 shrink min-w-0"
            >
              <Building2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span className="text-[10px] xs:text-[11px] sm:text-xs">
                Registrar: <strong className="font-mono text-emerald-300 font-bold">{availableSchools.length}</strong> Enrolled
              </span>
            </div>
          ) : (
            <div 
              title={`Active Campus: ${activeSchool.name}`}
              className="flex items-center gap-1 sm:gap-1.5 px-1.5 xs:px-2 sm:px-2.5 py-1 sm:py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs font-semibold text-slate-200 shrink min-w-0 max-w-[75px] xs:max-w-[105px] sm:max-w-[190px]"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span className="truncate text-[10px] xs:text-[11px] sm:text-xs">{activeSchool.name}</span>
            </div>
          )}

          {/* Academic Year and Term pill */}
          {['SUPER_ADMIN', 'COORDINATOR', 'REGISTER'].includes(currentUser.role) ? (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-slate-300 shrink-0">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Network Isolation Active</span>
            </div>
          ) : (
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-950/80 border border-blue-800/50 text-[11px] font-mono text-blue-300 shrink-0">
              <span>{activeSchool.active_academic_year}</span>
              <span>·</span>
              <span>{activeSchool.active_term}</span>
            </div>
          )}
        </div>

        {/* Right: SMS Gateway Balance, Sync / Refresh & User Info */}
        <div className="flex items-center gap-1 xs:gap-1.5 sm:gap-2 shrink-0">
          
          {/* Refresh Data From Cloud Button (High-Caching Architecture) */}
          <button
            onClick={handleRefresh}
            title="Refresh cache from secure Cloud database"
            disabled={isRefreshing}
            className="flex items-center gap-1.5 p-1.5 xs:p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 transition cursor-pointer disabled:opacity-50 active:scale-95 shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline text-[11px] font-medium">Refresh</span>
          </button>

          {/* School Pilot / Loyal Status Badge (Visible ONLY to Super Admin, Coordinator, Registrar) */}
          {['SUPER_ADMIN', 'COORDINATOR', 'REGISTER'].includes(currentUser.role) && activeSchool && (
            (() => {
              const isLoyal = activeSchool.pilot_status === 'LOYAL' || (
                activeSchool.created_at && (Date.now() - new Date(activeSchool.created_at).getTime() > 90 * 24 * 60 * 60 * 1000)
              );
              return (
                <div 
                  title={`Institutional Lifecycle Badge: ${isLoyal ? 'Loyal Institution' : 'First-Term Pilot Institution'}`}
                  className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-extrabold shadow-sm shrink-0 ${
                    isLoyal 
                      ? 'bg-emerald-950/80 text-emerald-300 border-emerald-700/80' 
                      : 'bg-amber-950/80 text-amber-300 border-amber-700/80'
                  }`}
                >
                  <Award className={`w-3.5 h-3.5 ${isLoyal ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <span>{isLoyal ? 'Loyal' : 'First-Term Pilot'}</span>
                </div>
              );
            })()
          )}

          {/* LIGHT / DARK MODE TOGGLE BUTTON */}
          <button
            onClick={toggleTheme}
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
            className="flex items-center gap-1.5 p-1.5 xs:p-2 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 hover:border-slate-700 transition cursor-pointer active:scale-95 shrink-0"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="hidden lg:inline text-[11px] font-semibold text-slate-300">Light</span>
              </>
            ) : (
              <>
                <Moon className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                <span className="hidden lg:inline text-[11px] font-semibold text-slate-300">Dark</span>
              </>
            )}
          </button>

          {/* Notifications Drawer Toggle */}
          <button
            onClick={() => setShowNotifDrawer(!showNotifDrawer)}
            title="System Alerts & SMS Delivery Log"
            className="relative p-1.5 xs:p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition cursor-pointer active:scale-95 shrink-0"
          >
            <Bell className="w-3.5 h-3.5" />
            {notifications.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            )}
          </button>

          {/* User Account Menu */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-1 sm:gap-2 p-1 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition cursor-pointer active:scale-95"
            >
              <PassportPhoto 
                src={currentUser.avatar_url} 
                alt={currentUser.name} 
                shape="rounded" 
                border={false}
                className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg border border-slate-700 shrink-0" 
              />
              <div className="hidden md:block text-left text-xs max-w-[110px] lg:max-w-[140px] truncate">
                <div className="font-bold text-white leading-none truncate">{currentUser.name}</div>
                <div className="text-[10px] text-amber-400 font-semibold mt-0.5 truncate">{currentUser.role.replace('_', ' ')}</div>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 hidden md:block shrink-0" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-64 rounded-xl bg-slate-900 border border-slate-800 shadow-2xl p-2 z-50">
                <div className="p-2 border-b border-slate-800 mb-1">
                  <div className="font-bold text-xs text-white">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400">{currentUser.email}</div>
                  <span className="inline-block mt-1 px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                </div>

                <div className="space-y-1">
                  <button
                    onClick={() => {
                      setShowPhotoModal(true);
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Upload / Change Photo</span>
                  </button>

                  <button
                    onClick={() => {
                      setCurrentView('ABOUT_SYSTEM');
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800 flex items-center gap-2 transition cursor-pointer"
                  >
                    <Info className="w-3.5 h-3.5 text-blue-400" />
                    <span>About Elimu360 System</span>
                  </button>

                  {currentUser.role === 'SUPER_ADMIN' && (
                    <button
                      onClick={() => {
                        setShowLogoStudio(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-lg text-xs text-amber-300 hover:bg-slate-800 flex items-center gap-2 transition"
                    >
                      <Compass className="w-3.5 h-3.5 text-amber-400" />
                      <span>Elimu360 Logo PNG Studio</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      logout();
                      setShowUserMenu(false);
                    }}
                    className="w-full text-left p-2 rounded-lg text-xs text-amber-400 hover:bg-amber-950/30 flex items-center gap-2 font-semibold transition cursor-pointer border-t border-slate-800/80 pt-2"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </header>

      {/* =========================================================================
          MAIN BODY LAYOUT (SIDEBAR + CONTENT)
          ========================================================================= */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* SIDEBAR NAVIGATION (DESKTOP) */}
        <aside className="no-print hidden md:flex flex-col w-64 border-r border-slate-800/80 bg-slate-950 p-4 shrink-0 overflow-y-auto">
          
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3 mb-2">
            Institutional Modules
          </div>

          <nav className="space-y-1">
            {visibleNavItems.map(item => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Legal & Information Links */}
          <div className="mt-auto pt-6 border-t border-slate-800/60">
            <div className="flex flex-col gap-1 text-[11px] text-slate-400">
              <button 
                onClick={() => setCurrentView('ABOUT_SYSTEM')}
                className="text-left px-2 py-1 rounded hover:text-amber-400 hover:bg-slate-900 transition flex items-center gap-2 cursor-pointer"
              >
                <Info className="w-3.5 h-3.5" />
                <span>About Elimu 360</span>
              </button>
              <button 
                onClick={() => setCurrentView('TERMS_OF_SERVICE')}
                className="text-left px-2 py-1 rounded hover:text-amber-400 hover:bg-slate-900 transition flex items-center gap-2 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Terms of Service</span>
              </button>
              <button 
                onClick={() => setCurrentView('PRIVACY_POLICY')}
                className="text-left px-2 py-1 rounded hover:text-amber-400 hover:bg-slate-900 transition flex items-center gap-2 cursor-pointer"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Privacy Policy</span>
              </button>
            </div>

            <div className="mt-4 p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[10px] text-slate-400">
              <div className="font-semibold text-slate-200">The Palace Tech House</div>
              <div>REB & East Africa Compliant SIMS</div>
            </div>
          </div>

        </aside>

        {/* MOBILE SIDEBAR / FULL WORKSPACE DRAWER */}
        {mobileMenuOpen && (
          <div className="no-print md:hidden fixed inset-0 bg-slate-950/95 backdrop-blur-md z-50 p-4 sm:p-6 overflow-y-auto flex flex-col transition-all">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4 shrink-0">
              <div 
                onClick={() => {
                  setCurrentView('LANDING');
                  setMobileMenuOpen(false);
                }}
                className="cursor-pointer"
              >
                <ElimuLogo size="sm" showMeaning={false} />
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleTheme}
                  title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 cursor-pointer"
                >
                  {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-indigo-400" />}
                </button>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5 text-amber-400" />
                </button>
              </div>
            </div>

            {/* Active User Banner in Mobile Drawer */}
            <div className="p-3 rounded-2xl bg-slate-900/90 border border-slate-800 mb-4 shrink-0 shadow-lg">
              <div className="flex items-center gap-3">
                <PassportPhoto 
                  src={currentUser.avatar_url} 
                  alt={currentUser.name} 
                  shape="rounded" 
                  border={false}
                  className="w-10 h-10 rounded-xl border border-slate-700 shrink-0" 
                />
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-sm text-white truncate">{currentUser.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      {currentUser.role.replace('_', ' ')}
                    </span>
                    {activeSchool && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {activeSchool.active_academic_year} · {activeSchool.active_term}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Quick Actions Row */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/80">
                <button
                  onClick={() => {
                    setShowPhotoModal(true);
                    setMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition"
                >
                  <Camera className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Update Photo</span>
                </button>
                <button
                  onClick={() => {
                    handleRefresh();
                  }}
                  disabled={isRefreshing}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 text-xs flex items-center justify-center gap-1.5 hover:bg-slate-800 transition disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isRefreshing ? 'animate-spin' : ''}`} />
                  <span>Sync Cloud</span>
                </button>
              </div>
            </div>

            {/* Active School Identity / Switcher in Mobile Drawer */}
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 mb-4 shrink-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
                <span>Current Institution</span>
                <span className="text-blue-400 font-mono">{activeSchool.curriculum_type}</span>
              </div>
              <div className="text-xs font-bold text-white flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="truncate">{activeSchool.name}</span>
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {activeSchool.city}, {activeSchool.district || activeSchool.country}
              </div>

              {/* Super Admin School Switcher inside Mobile Drawer */}
              {currentUser.role === 'SUPER_ADMIN' && availableSchools.length > 1 && (
                <div className="mt-2.5 pt-2 border-t border-slate-800/80">
                  <label className="text-[9px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    Switch School Tenant:
                  </label>
                  <select
                    value={activeSchool.id}
                    onChange={(e) => {
                      const selected = availableSchools.find(s => s.id === e.target.value);
                      if (selected) {
                        setActiveSchool(selected);
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-amber-400"
                  >
                    {availableSchools.map(sch => (
                      <option key={sch.id} value={sch.id}>
                        {sch.name} ({sch.city})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Navigation Modules */}
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
              Assigned Directorate Modules
            </div>

            <nav className="space-y-1.5 flex-1">
              {visibleNavItems.map(item => {
                const Icon = item.icon;
                const isActive = currentView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setCurrentView(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-xs sm:text-sm font-semibold transition cursor-pointer ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' 
                        : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider shrink-0 ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Mobile Footer & Utility Links */}
            <div className="mt-6 pt-4 border-t border-slate-800 space-y-2 shrink-0">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setCurrentView('LANDING');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 text-center font-bold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                >
                  <Globe className="w-3.5 h-3.5 text-amber-400" />
                  <span>Showcase Page</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentView('ABOUT_SYSTEM');
                    setMobileMenuOpen(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 text-center font-semibold text-xs hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                >
                  <Info className="w-3.5 h-3.5 text-blue-400" />
                  <span>About System</span>
                </button>
              </div>

              <div className="flex items-center justify-between px-2 pt-2 text-[11px] text-slate-400">
                <button
                  onClick={() => {
                    setCurrentView('PRIVACY_POLICY');
                    setMobileMenuOpen(false);
                  }}
                  className="hover:text-amber-400 transition"
                >
                  Privacy Policy
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    setCurrentView('TERMS_OF_SERVICE');
                    setMobileMenuOpen(false);
                  }}
                  className="hover:text-amber-400 transition"
                >
                  Terms of Service
                </button>
                <span>·</span>
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-rose-400 font-bold hover:underline"
                >
                  Sign Out
                </button>
              </div>
            </div>

          </div>
        )}

        {/* =========================================================================
            NOTIFICATION DRAWER (SLIDE OVER)
            ========================================================================= */}
        {showNotifDrawer && (
          <div className="no-print fixed inset-y-0 right-0 w-80 sm:w-96 bg-slate-950 border-l border-slate-800 shadow-2xl z-50 p-5 flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-amber-400" />
                <span className="font-bold text-white text-sm">Automated Alerts Log</span>
              </div>
              <button 
                onClick={() => setShowNotifDrawer(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  No automated alerts generated yet.
                </div>
              ) : (
                notifications.map(n => (
                  <div key={n.id} className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1 font-mono">
                      <span>{n.channel === 'SMS_AFRICAS_TALKING' ? 'Institutional SMS' : 'Email'}</span>
                      <span className="text-emerald-400">{n.status}</span>
                    </div>
                    <div className="font-semibold text-slate-200 mb-1">{n.recipient_name} ({n.recipient_phone})</div>
                    <p className="text-slate-300 text-[11px] leading-relaxed">{n.content}</p>
                    <div className="mt-2 text-[10px] text-slate-400 flex justify-between">
                      <span>Cost: RWF {n.cost_rwf}</span>
                      <span>{n.timestamp}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            MAIN WORKSPACE CONTENT CONTAINER
            ========================================================================= */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8 flex flex-col justify-between">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>

          {/* GLOBAL SYSTEM FOOTER WITH COPYRIGHT & POLICY LINKS */}
          <footer className="no-print mt-12 pt-6 border-t border-slate-800/80 text-xs text-slate-400 max-w-7xl mx-auto w-full flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <ElimuLogo size="xs" showMeaning={false} />
              <div>
                <div className="font-semibold text-slate-300">© 2026 Elimu360 SIMS. Built by The Palace Tech House.</div>
                <div className="text-[10px] text-slate-500">Sovereign Institutional SIMS · All Rights Reserved</div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-4 text-[11px] text-slate-400">
              <button 
                onClick={() => setCurrentView('LANDING')}
                className="hover:text-amber-400 transition cursor-pointer font-medium"
              >
                Showcase Page
              </button>
              <span>·</span>
              <button 
                onClick={() => setCurrentView('PRIVACY_POLICY')}
                className="hover:text-amber-400 transition cursor-pointer font-medium"
              >
                Privacy Policy
              </button>
              <span>·</span>
              <button 
                onClick={() => setCurrentView('TERMS_OF_SERVICE')}
                className="hover:text-amber-400 transition cursor-pointer font-medium"
              >
                Terms of Service
              </button>
              <span>·</span>
              <button 
                onClick={() => setCurrentView('ABOUT_SYSTEM')}
                className="hover:text-amber-400 transition cursor-pointer font-medium"
              >
                About System
              </button>
              <span>·</span>
              <button 
                onClick={() => setCurrentView('CONTACT_US')}
                className="hover:text-amber-400 transition cursor-pointer font-medium text-emerald-400"
              >
                Contact Us
              </button>
            </div>
          </footer>
        </main>

      </div>

      {/* Logo Export Studio Modal */}
      {showLogoStudio && (
        <LogoExportStudioModal onClose={() => setShowLogoStudio(false)} />
      )}

      {/* Staff Photo Upload Modal */}
      {showPhotoModal && (
        <StaffPhotoUploadModal
          userToUpdate={currentUser}
          onClose={() => setShowPhotoModal(false)}
        />
      )}

    </div>
  );
};
