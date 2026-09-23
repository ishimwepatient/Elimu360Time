import React, { useState } from 'react';
import { 
  GraduationCap, 
  ShieldCheck, 
  Wallet, 
  Calendar, 
  Users, 
  MessageSquare, 
  BookOpen, 
  CheckCircle2, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  Database, 
  Cpu, 
  Smartphone, 
  Download, 
  Receipt, 
  Lock, 
  Globe2, 
  Award, 
  Zap,
  Info,
  FileText,
  KeyRound,
  Calculator,
  Compass,
  Sun,
  Moon,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { ElimuLogo } from '../brand/ElimuLogo';

export const LandingPage: React.FC = () => {
  const { 
    setCurrentView,
    isAuthenticated,
    currentUser,
    theme,
    toggleTheme
  } = useElimu();

  const [menuOpen, setMenuOpen] = useState(false);

  const handlePortalAccess = () => {
    if (isAuthenticated) {
      if (currentUser?.role === 'BURSAR') {
        setCurrentView('FINANCIAL_PORTAL');
      } else if (currentUser?.role === 'COORDINATOR') {
        setCurrentView('COORDINATOR_HUB');
      } else if (currentUser?.role === 'REGISTER') {
        setCurrentView('REGISTRAR_PORTAL');
      } else {
        setCurrentView('DASHBOARD');
      }
    } else {
      setCurrentView('LOGIN');
    }
  };

  const [activeTab, setActiveTab] = useState<'financial' | 'academic' | 'student360' | 'parent' | 'dos' | 'security'>('financial');
  const [calcClass, setCalcClass] = useState<'S1-3' | 'S4-6'>('S4-6');
  const [calcBoarding, setCalcBoarding] = useState<boolean>(true);
  const [calcActivities, setCalcActivities] = useState<boolean>(true);

  // Calculated fees for live institutional fee calculator widget
  const baseTuition = calcClass === 'S4-6' ? 380000 : 320000;
  const boardingFee = calcBoarding ? 220000 : 0;
  const activityFee = calcActivities ? 35000 : 0;
  const libraryFee = 15000;
  const totalCalcExpected = baseTuition + boardingFee + activityFee + libraryFee;

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-400 selection:text-slate-950 font-sans overflow-x-hidden">
      
      {/* =========================================================================
          TOP ANNOUNCEMENT RIBBON
          ========================================================================= */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 border-b border-emerald-500/30 text-slate-200 text-xs py-2 px-4 relative z-40">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-extrabold text-[10px] uppercase border border-emerald-500/40 tracking-wider">
              2026-2027 Onboarding Open
            </span>
            <span className="text-slate-200 font-medium text-xs">
              1st-Term Free Pilot for Accredited Schools in Rwanda & East Africa
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs shrink-0">
            <a
              href="https://wa.me/250792612139?text=Hello%20Elimu360!%20Our%20school%20is%20interested%20in%20working%20with%20your%20system."
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-bold font-mono transition flex items-center gap-1"
            >
              <MessageSquare className="w-3.5 h-3.5 fill-emerald-400/20" />
              <span>WhatsApp: +250 792 612 139</span>
            </a>
            <span className="text-slate-600 hidden sm:inline">|</span>
            <button
              onClick={() => setCurrentView('CONTACT_US')}
              className="text-amber-400 hover:text-amber-300 font-bold transition underline cursor-pointer"
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CINEMAGRAPH / PARALLAX AMBIENT BACKGROUND
          ========================================================================= */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Deep Academic Navy Gradient Spheres */}
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-blue-900/20 blur-[140px] cinemagraph-pulse" />
        <div className="absolute top-1/3 -right-40 w-[550px] h-[550px] rounded-full bg-indigo-900/20 blur-[150px] cinemagraph-pulse" style={{ animationDelay: '3s' }} />
        <div className="absolute bottom-10 left-1/4 w-[700px] h-[700px] rounded-full bg-sky-950/30 blur-[160px] cinemagraph-pulse" style={{ animationDelay: '6s' }} />
        
        {/* Subtle Geometric Overlay Grid */}
        <div 
          className="absolute inset-0 opacity-[0.03]" 
          style={{ 
            backgroundImage: `radial-gradient(#93c5fd 1px, transparent 1px)`, 
            backgroundSize: '32px 32px' 
          }} 
        />
      </div>

      {/* =========================================================================
          TOP NAVIGATION BAR
          ========================================================================= */}
      <header className="relative z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-3">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-3">
            <ElimuLogo size="md" showMeaning={false} />
            <div className="hidden md:block">
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                360° SIMS Platform
              </span>
            </div>
          </div>

          {/* Minimal Controls: Theme + Sign In + Dropdown Menu Trigger */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="p-2 sm:p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-1.5"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-slate-300 hidden sm:inline">Light</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-slate-300 hidden sm:inline">Dark</span>
                </>
              )}
            </button>

            <button
              onClick={handlePortalAccess}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-700/25 transition-all cursor-pointer shrink-0"
            >
              <Lock className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{isAuthenticated ? 'Workspace' : 'Portal Sign In'}</span>
              <span className="sm:hidden">{isAuthenticated ? 'Workspace' : 'Sign In'}</span>
            </button>

            {/* Dropdown Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-white text-xs font-bold transition cursor-pointer shadow-md"
                aria-expanded={menuOpen}
              >
                {menuOpen ? <X className="w-4 h-4 text-rose-400" /> : <Menu className="w-4 h-4 text-amber-400" />}
                <span className="hidden sm:inline">Menu</span>
                <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${menuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Minimal Dropdown Menu */}
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-2xl backdrop-blur-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <div className="p-2 border-b border-slate-800 mb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Platform Navigation
                  </div>

                  <a
                    href="#financial-differentiator"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition"
                  >
                    <Wallet className="w-4 h-4 text-emerald-400" />
                    <span>Fee Tracking</span>
                  </a>

                  <a
                    href="#modules"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition"
                  >
                    <Layers className="w-4 h-4 text-blue-400" />
                    <span>Core Modules</span>
                  </a>

                  <a
                    href="#calculator"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition"
                  >
                    <Calculator className="w-4 h-4 text-amber-400" />
                    <span>Fee Simulator</span>
                  </a>

                  <a
                    href="#architecture"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span>Security & 3G</span>
                  </a>

                  <div className="my-1 border-t border-slate-800" />

                  <button
                    onClick={() => { setMenuOpen(false); setCurrentView('ABOUT_SYSTEM'); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-200 hover:bg-slate-800 hover:text-amber-400 transition cursor-pointer"
                  >
                    <Info className="w-4 h-4 text-purple-400" />
                    <span>About Elimu360</span>
                  </button>

                  <button
                    onClick={() => { setMenuOpen(false); setCurrentView('CONTACT_US'); }}
                    className="w-full text-left flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-emerald-300 hover:bg-slate-800 hover:text-emerald-400 transition cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-emerald-400" />
                    <span>Contact Us</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION
          ========================================================================= */}
      <section className="relative z-10 pt-12 pb-20 md:pt-20 md:pb-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/90 border border-blue-800/60 text-xs text-blue-300 shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Engineered for Private & Academic Institutions in Rwanda & East Africa</span>
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-xs text-slate-300">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>By The Palace Tech House · High-Caching & Secure Cloud Architecture</span>
          </div>
        </div>

        {/* Main Headline */}
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-white leading-tight font-display">
            The 360° Comprehensive <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-amber-300">
              School Management System
            </span>
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-300 font-normal leading-relaxed max-w-3xl mx-auto">
            Digitize every dimension of institutional administration. Built for seamless 
            <strong className="text-white font-semibold"> Student Enrollment</strong>, 
            <strong className="text-white font-semibold"> Fee Tracking</strong> with automated MTN MoMo & Airtel reconciliation, 
            instant <strong className="text-white font-semibold">Report Cards</strong>, and 
            <strong className="text-white font-semibold"> Teacher-Parent Communication</strong> via Direct Multi-Carrier SMS.
          </p>
        </div>

        {/* Primary Call to Actions */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={handlePortalAccess}
            className="px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 shadow-xl shadow-amber-500/20 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2.5"
          >
            <Lock className="w-4 h-4" />
            <span>{isAuthenticated ? 'Open My Workspace' : 'Sign In to Institutional Portal'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href="https://wa.me/250792612139?text=Hello%20Elimu360!%20Our%20school%20is%20interested%20in%20working%20with%20your%20system."
            target="_blank"
            rel="noopener noreferrer"
            className="px-6 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/20 border border-emerald-400/40 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2.5"
          >
            <MessageSquare className="w-4 h-4 fill-white/20" />
            <span>Partner With Us on WhatsApp (+250 792 612 139)</span>
          </a>

          <button
            onClick={handlePortalAccess}
            className="px-6 py-3.5 rounded-xl text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition cursor-pointer flex items-center gap-2"
          >
            <KeyRound className="w-4 h-4 text-amber-400" />
            <span>{isAuthenticated ? 'Workspace Console' : 'Claim Invited Staff Account'}</span>
          </button>
        </div>

        {/* Feature Highlights Bento Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Automated Fee Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Multi-channel payment recording (MTN MoMo, Airtel Money, Bank of Kigali, Cash) with instant serial receipting and defaulter tracking.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
              <GraduationCap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Rwanda Education Board SIMS</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Complete grade capture for Continuous Assessment (CAT 30%), Mid-Term (30%), and End-of-Term (40%) with print-ready report cards.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 backdrop-blur-xl">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <MessageSquare className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Teacher-Parent Communication</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Threaded messaging hub and direct automated SMS alerts routed via high-speed telecom gateway for attendance, discipline, and fee updates.
            </p>
          </div>
        </div>

      </section>

      {/* =========================================================================
          FINANCIAL DIFFERENTIATOR SECTION
          ========================================================================= */}
      <section id="financial-differentiator" className="relative z-10 py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Wallet className="w-4 h-4" />
              <span>Native Bursar Module</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Autonomous School Accounting & Fee Collection
            </h2>
            <p className="text-slate-300 text-sm mt-3 leading-relaxed">
              Eliminate manual reconciliation errors. Elimu360 provides school directors and bursars with real-time visibility into collection rates, arrears, and classroom revenue distributions.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Instant Serialized Receipts</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Every transaction generates an official institutional receipt code (e.g. REC-2026-0841) with print and SMS notification triggers.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Automated Defaulters Ledger</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Filter students with overdue balances by class stream, with 1-click batch SMS fee reminder dispatch.
                  </p>
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 shrink-0">
                  <Download className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Board-Ready Financial Reports</h4>
                  <p className="text-xs text-slate-400 mt-1">
                    Export complete term revenue summaries, breakdown by tuition, boarding, and development levies formatted for school board reviews.
                  </p>
                </div>
              </div>
            </div>

            {/* Fee Calculator Preview Widget */}
            <div id="calculator" className="p-6 sm:p-8 rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div>
                  <div className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Calculator className="w-3.5 h-3.5" />
                    <span>Interactive Fee Structure Simulator</span>
                  </div>
                  <h4 className="text-base font-bold text-white mt-0.5">Simulate Term Fees</h4>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-800/60">
                  Currency: RWF
                </span>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1.5">Academic Section:</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setCalcClass('S1-3')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                        calcClass === 'S1-3'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      O-Level (S1 - S3)
                    </button>
                    <button
                      onClick={() => setCalcClass('S4-6')}
                      className={`p-2.5 rounded-xl border text-center font-semibold transition cursor-pointer ${
                        calcClass === 'S4-6'
                          ? 'bg-blue-600 text-white border-blue-500'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                      }`}
                    >
                      A-Level (S4 - S6)
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="font-semibold text-white">Boarding Accommodations</div>
                    <div className="text-slate-400 text-[11px]">Dormitory, meals, and laundry services</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={calcBoarding}
                    onChange={(e) => setCalcBoarding(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0 cursor-pointer h-4 w-4"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <div>
                    <div className="font-semibold text-white">Co-Curricular & Sports Levy</div>
                    <div className="text-slate-400 text-[11px]">Robotics, STEM competitions, and sports trips</div>
                  </div>
                  <input
                    type="checkbox"
                    checked={calcActivities}
                    onChange={(e) => setCalcActivities(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-950 text-blue-500 focus:ring-0 cursor-pointer h-4 w-4"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-blue-950/40 border border-blue-800/60 mt-4">
                  <div className="flex justify-between items-center text-slate-300 mb-1 text-xs">
                    <span>Base Tuition:</span>
                    <span className="font-mono text-white">RWF {baseTuition.toLocaleString()}</span>
                  </div>
                  {calcBoarding && (
                    <div className="flex justify-between items-center text-slate-300 mb-1 text-xs">
                      <span>Boarding Fee:</span>
                      <span className="font-mono text-white">RWF {boardingFee.toLocaleString()}</span>
                    </div>
                  )}
                  {calcActivities && (
                    <div className="flex justify-between items-center text-slate-300 mb-1 text-xs">
                      <span>Co-Curricular:</span>
                      <span className="font-mono text-white">RWF {activityFee.toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-slate-300 mb-2 text-xs">
                    <span>Library & IT Fee:</span>
                    <span className="font-mono text-white">RWF {libraryFee.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-blue-800/80 flex justify-between items-center">
                    <span className="font-bold text-white text-sm">Total Term Fee:</span>
                    <span className="text-lg font-extrabold text-amber-400 font-mono">
                      RWF {totalCalcExpected.toLocaleString()}
                    </span>
                  </div>
                </div>

              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          MODULES DETAIL TABBED SHOWCASE
          ========================================================================= */}
      <section id="modules" className="relative z-10 py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
            <Layers className="w-4 h-4" />
            <span>Comprehensive Academic Engine</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
            Built for Every Institutional Stakeholder
          </h2>
          <p className="text-slate-400 text-sm mt-2">
            Explore how Elimu360 coordinates Directors, Directors of Studies, Teachers, Bursars, Librarians, and Parents in one unified workspace.
          </p>
        </div>

        {/* Module Switcher Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          <button
            onClick={() => setActiveTab('financial')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'financial'
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Fee Tracking & Bursar</span>
          </button>

          <button
            onClick={() => setActiveTab('academic')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'academic'
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <GraduationCap className="w-4 h-4" />
            <span>Grades & REB Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('student360')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'student360'
                ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Student 360 Records</span>
          </button>

          <button
            onClick={() => setActiveTab('parent')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'parent'
                ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Parent SMS & Messaging</span>
          </button>

          <button
            onClick={() => setActiveTab('dos')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'dos'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <Calendar className="w-4 h-4" />
            <span>Timetable Conflict Solver</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/30'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Multi-Tenancy & Audit</span>
          </button>
        </div>

        {/* Tab Content Panel */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800/80 shadow-2xl">
          
          {activeTab === 'financial' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Bursar Workspace</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 font-display">
                  Autonomous Accounting Sheets & Receipting
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Say goodbye to fragmented spreadsheets and manual reconciliations. Bursars issue instant official receipts, 
                  track payment modes (MTN MoMo, Airtel Money, Bank Transfer, Cash), and generate school-wide revenue charts.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300"><strong className="text-white">Daily Cash Register:</strong> Complete audit trail of all transactions with receipt numbers and bursar verification.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300"><strong className="text-white">Defaulters List:</strong> Real-time tracking of overdue fees by class with days overdue and automated SMS reminder dispatch.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300"><strong className="text-white">Export to Excel & PDF:</strong> Formatted tables with class aggregates ready for board meetings.</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-white">Payment Receipts Ledger Preview</span>
                  <span className="text-[10px] text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded">Auto-Reconciled</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-white">Divine Keza Gasana (S4 PCM)</div>
                      <div className="text-[11px] text-slate-400 font-mono">REC-2026-0841 · MTN MoMo</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-emerald-400 font-mono">RWF 380,000</div>
                      <div className="text-[10px] text-slate-500">Cleared Full Tuition</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'academic' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">Director of Studies & Teachers</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 font-display">
                  Grade Capture & On-Demand Report Cards
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Teachers enter Continuous Assessment (CAT 30%), Mid-Term (30%), and End-of-Term (40%) marks. The system 
                  instantly computes class averages, student ranks, and produces print-ready Rwanda Education Board report cards.
                </p>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300"><strong className="text-white">Dynamic Reports:</strong> Report cards are rendered dynamically on demand directly from verified marks.</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <span className="text-xs text-slate-300"><strong className="text-white">E-Learning & Quizzes:</strong> Auto-graded multiple choice assessments with instant student feedback.</span>
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="font-bold text-white">REB Competency Grade Preview</span>
                  <span className="text-amber-400 font-mono font-bold">Grade A</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Mathematics (MTH-401)</span>
                    <span className="font-mono text-emerald-400 font-semibold">93.5% (Grade A)</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-300">Physics (PHY-401)</span>
                    <span className="font-mono text-emerald-400 font-semibold">91.3% (Grade A)</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'student360' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">Student Lifecycle & Welfare</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 font-display">
                  Student 360 Permanent Records & Safety
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Maintain an immutable permanent record per student from enrollment to graduation. Capture discipline logs, 
                  medical conditions, gate exit permission passes, and library borrowings.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center gap-3 mb-4 pb-3 border-b border-slate-800">
                  <div className="w-10 h-10 rounded-full bg-purple-900/60 border border-purple-500 flex items-center justify-center font-bold text-white">
                    DK
                  </div>
                  <div>
                    <div className="font-bold text-white">Permanent Student Portfolio</div>
                    <div className="text-slate-400 text-[11px]">Enrollment, Discipline & Permissions</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'parent' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Parent Engagement</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 font-display">
                  Direct Parent Hub & Multi-Carrier SMS
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Bridge the gap between home and classroom. Parents log in to view live academic grades, attendance, 
                  fee balances, and communicate directly with teachers through threaded messaging.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <span className="font-bold text-white">Automated SMS Dispatches</span>
                  <span className="text-emerald-400 text-[10px] font-mono">System Funded</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <p className="text-slate-200 text-xs font-mono">
                    &ldquo;Elimu360 Alert: Fee receipt confirmed for Divine Keza (RWF 380,000 Tuition). Outstanding balance: RWF 0.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'dos' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Director of Studies</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 font-display">
                  Intelligent Timetable Conflict Solver
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Construct term timetables with automated collision checking. The system guarantees that no teacher 
                  is double-booked across different rooms, and no classroom hosts overlapping sessions.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="font-bold text-white">Collision Validation Engine</span>
                  <span className="text-emerald-400 text-[10px]">Zero Conflicts</span>
                </div>
                <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                  <div className="font-semibold text-white">Senior 4 PCM · Mathematics</div>
                  <div className="text-slate-400 text-[11px]">Room: Block C - Lab 3 · Verified No Collision</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
              <div>
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Enterprise Architecture</span>
                <h3 className="text-2xl sm:text-3xl font-bold text-white mt-1 mb-4 font-display">
                  Multi-Tenant Isolation & Audit Logging
                </h3>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  Strict school-level data scoping (<code className="text-rose-300 font-mono">school_id</code>) ensures that no tenant 
                  can ever read or alter records belonging to another institution. Every single write operation is immutably audited.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-mono">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                  <span className="font-bold text-white font-sans">Audit Trail Engine</span>
                  <span className="text-rose-400 text-[10px]">TLS 1.2+ Enforced</span>
                </div>
                <div className="p-2.5 rounded bg-slate-900 border border-slate-800 text-slate-300 text-[11px]">
                  [AUDIT] Action: PAYMENT_REGISTERED · School: KAIA · IP: 197.243.112.44
                </div>
              </div>
            </div>
          )}

        </div>

      </section>

      {/* =========================================================================
          TECHNICAL SPECIFICATIONS / ARCHITECTURE HIGHLIGHTS
          ========================================================================= */}
      <section id="architecture" className="relative z-10 py-20 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Cpu className="w-4 h-4" />
              <span>Production Architecture & Engineering</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white font-display">
              Engineered by The Palace Tech House
            </h2>
            <p className="text-slate-400 text-sm mt-3">
              Built in compliance with international and Rwandan academic standards. Designed for ultra-high availability, 
              robust multi-tenancy, and rapid on-demand rendering.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-blue-950 flex items-center justify-center text-blue-400 mb-4">
                <Database className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Cloud Database & Multi-Tenancy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Document database model with strict security rule isolation. All academic, financial, and attendance 
                data is rigorously partitioned by <code className="text-blue-300 font-mono">school_id</code>.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-emerald-950 flex items-center justify-center text-emerald-400 mb-4">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">High-Caching Architecture</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Eliminates expensive continuous socket polling. Loads state in batches into high-speed local caches and refreshes on demand.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
              <div className="w-10 h-10 rounded-lg bg-amber-950 flex items-center justify-center text-amber-400 mb-4">
                <Smartphone className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white mb-2">Direct Telecommunications Gateway</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct SMS routing to Rwandan mobile telecom providers (MTN Rwanda & Airtel Rwanda) with system-managed delivery tracking and automated dispatch queues.
              </p>
            </div>

          </div>

          {/* Banner Call to Action */}
          <div className="mt-16 p-8 md:p-12 rounded-3xl bg-gradient-to-r from-blue-950/80 via-indigo-950/80 to-slate-900 border border-blue-800/60 text-center shadow-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl mx-auto">
              <h3 className="text-3xl font-extrabold text-white font-display mb-3">
                Want Your School to Work With Elimu360?
              </h3>
              <p className="text-slate-300 text-sm mb-6 leading-relaxed">
                Reach out directly to our institutional onboarding team on WhatsApp or access your school&apos;s dedicated workspace.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-4">
                <a
                  href="https://wa.me/250792612139?text=Hello%20Elimu360!%20Our%20school%20would%20like%20to%20work%20with%20your%20system."
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 rounded-xl text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xl shadow-emerald-600/25 border border-emerald-400/40 transition-all transform hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                >
                  <MessageSquare className="w-4 h-4 fill-white/20" />
                  <span>Contact Onboarding Team: +250 792 612 139</span>
                </a>

                <button
                  onClick={() => setCurrentView('LOGIN')}
                  className="px-8 py-3.5 rounded-xl text-sm font-bold uppercase tracking-wider bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 shadow-xl shadow-amber-500/20 transition-all transform hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  <span>Sign In to Institutional Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* =========================================================================
          FOOTER
          ========================================================================= */}
      <footer className="relative z-10 border-t border-slate-800 bg-slate-950 text-slate-400 text-xs py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <ElimuLogo size="sm" showMeaning={false} />
            <div>
              <div className="text-white font-bold text-sm">Elimu360 SIMS</div>
              <div className="text-[11px] text-slate-500">The Palace Tech House · Sovereign Institutional Platform</div>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-slate-400 text-[11px]">
            <button 
              onClick={() => setCurrentView('ABOUT_SYSTEM')} 
              className="hover:text-amber-400 transition cursor-pointer"
            >
              About System
            </button>
            <span>·</span>
            <button 
              onClick={() => setCurrentView('CONTACT_US')} 
              className="hover:text-amber-400 transition cursor-pointer font-bold text-emerald-400"
            >
              Contact Us
            </button>
            <span>·</span>
            <button 
              onClick={() => setCurrentView('TERMS_OF_SERVICE')} 
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Terms of Service
            </button>
            <span>·</span>
            <button 
              onClick={() => setCurrentView('PRIVACY_POLICY')} 
              className="hover:text-amber-400 transition cursor-pointer"
            >
              Privacy Policy
            </button>
          </div>

          <div className="text-slate-500 text-right text-[11px]">
            <div>© 2026 The Palace Tech House. All Rights Reserved.</div>
            <div>Confidential Institutional Multi-Tenant System</div>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Quick Action Button */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3">
        <a
          href="https://wa.me/250792612139?text=Hello%20Elimu360!%20Our%20school%20would%20like%20to%20get%20started."
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with Elimu360 Onboarding on WhatsApp"
          className="group relative flex items-center justify-center p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-2xl shadow-emerald-500/50 ring-4 ring-emerald-500/30 transition-all transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          {/* Animated Radar Pulse Ring */}
          <span className="absolute -inset-1 rounded-full bg-emerald-400/40 animate-ping pointer-events-none" />
          
          <MessageSquare className="w-6 h-6 fill-slate-950 relative z-10" />

          {/* Hover Floating Tooltip */}
          <span className="absolute right-full mr-3 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs font-bold whitespace-nowrap shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chat on WhatsApp (+250 792 612 139)</span>
          </span>
        </a>
      </div>
    </div>
  );
};
