import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  Sun, 
  Moon, 
  Award, 
  Share2, 
  Menu, 
  X,
  RefreshCw,
  Heart,
  Home,
  MessageCircle,
  HelpCircle
} from 'lucide-react';
import { ElimuProvider, useElimu } from './context/ElimuContext';
import { ElimuLogo } from './components/brand/ElimuLogo';
import { ServicesOverviewHome } from './components/home/ServicesOverviewHome';
import { DocumentConverter } from './components/converter/DocumentConverter';
import { LessonPlanGeneratorHub } from './components/generator/LessonPlanGeneratorHub';
import { KinyarwandaQuestionBank } from './components/generator/KinyarwandaQuestionBank';
import { SavedPlansLibrary } from './components/library/SavedPlansLibrary';
import { REBCBCGuide } from './components/guide/REBCBCGuide';
import { FAQCenter } from './components/faq/FAQCenter';
import { LegalAndPrivacyCenter } from './components/legal/LegalAndPrivacyCenter';
import { PWAInstallModal } from './components/pwa/PWAInstallModal';
import { PWAInstallHeaderButton } from './components/pwa/PWAInstallHeaderButton';
import { ShareSystemModal } from './components/share/ShareSystemModal';
import { WhatsAppHelpWidget } from './components/support/WhatsAppHelpWidget';
import { LiveActivityTicker } from './components/common/LiveActivityTicker';
import { REBCourse1806Library } from './components/reb/REBCourse1806Library';
import { SchoolProfileModal } from './components/common/SchoolProfileModal';
import { SchoolProfileReminderBanner } from './components/common/SchoolProfileReminderBanner';
import { NotificationBellHeader } from './components/notifications/NotificationBellHeader';
import { NotificationCenterModal } from './components/notifications/NotificationCenterModal';
import { ElimuSmartNotificationBanner } from './components/notifications/ElimuSmartNotificationBanner';
import { InAppNotificationToast } from './components/notifications/InAppNotificationToast';

type ActiveTab = 'home' | 'converter' | 'generator' | 'question_bank' | 'reb_library' | 'library' | 'guide' | 'faq' | 'privacy';

const MainAppContent: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    savedLessonPlans,
    shareModalOpen,
    openShareModal,
    closeShareModal
  } = useElimu();

  // App starts from Home / Services Overview as explicitly requested
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedQuestionForPlan, setSelectedQuestionForPlan] = useState<any>(null);
  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Handle direct notification clicks and service worker navigation
  React.useEffect(() => {
    // Check URL query parameters (e.g. ?tab=reb_library)
    try {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab') as ActiveTab | null;
      if (tabParam && ['home', 'converter', 'generator', 'question_bank', 'reb_library', 'library', 'guide', 'faq', 'privacy'].includes(tabParam)) {
        setActiveTab(tabParam);
      }
    } catch (e) {
      // Ignore URL parsing errors
    }

    // Listen for Service Worker messages when user taps lock screen notifications
    const handleServiceWorkerMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TAB' && event.data.tab) {
        setActiveTab(event.data.tab);
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleServiceWorkerMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleServiceWorkerMessage);
      }
    };
  }, []);


  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
            <ElimuLogo size="md" />
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'generator'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Lesson Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('question_bank')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'question_bank'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <HelpCircle className="w-4 h-4" />
              <span>Question Bank</span>
            </button>

            <button
              onClick={() => setActiveTab('reb_library')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'reb_library'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4 text-blue-600 dark:text-sky-300" />
              <span>REB Books (1806)</span>
            </button>

            <button
              onClick={() => setActiveTab('converter')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'converter'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Converter</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'library'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Saved Plans ({savedLessonPlans.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3 py-2 rounded-xl font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>CBC Guide</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-2.5">
            
            {/* Elimu Smart Notification System & Teacher Streak */}
            <NotificationBellHeader onOpenCenter={() => setNotificationCenterOpen(true)} />

            {/* School Profile Persistent Quick Reminder Button */}
            <SchoolProfileReminderBanner compact />

            {/* Install PWA Button */}
            <PWAInstallHeaderButton />

            {/* Encourage Sharing Button */}
            <button
              onClick={openShareModal}
              className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-sm cursor-pointer shrink-0"
            >
              <Heart className="w-3.5 h-3.5 fill-slate-950" />
              <span>Share System</span>
            </button>

            {/* Theme Toggle Button (Light mode default, Dark mode opt-in) */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white transition cursor-pointer shadow-xs"
              title={theme === 'dark' ? 'Hindura ujye muri Light Mode' : 'Hindura ujye muri Dark Mode'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
            <NotificationBellHeader onOpenCenter={() => setNotificationCenterOpen(true)} />
            <PWAInstallHeaderButton />
            <button
              onClick={openShareModal}
              className="p-2 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold flex items-center gap-1"
            >
              <Share2 className="w-4 h-4" />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Menu Dropdown */}
        {mobileMenuOpen && (
          <div className="xl:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 space-y-3 animate-fade-in shadow-xl">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'home' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <Home className="w-4 h-4" /> Services Overview
              </button>

              <button
                onClick={() => { setActiveTab('generator'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'generator' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" /> AI Lesson Plan Generator
              </button>

              <button
                onClick={() => { setActiveTab('question_bank'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'question_bank' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <HelpCircle className="w-4 h-4" /> Question Bank (3,200+ Questions)
              </button>

              <button
                onClick={() => { setActiveTab('reb_library'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'reb_library' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4 text-blue-500" /> REB Books & Schemes (1806)
              </button>

              <button
                onClick={() => { setActiveTab('converter'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'converter' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <RefreshCw className="w-4 h-4" /> Documents Converter
              </button>

              <button
                onClick={() => { setActiveTab('library'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'library' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Saved Plans ({savedLessonPlans.length})
              </button>

              <button
                onClick={() => { setActiveTab('guide'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'guide' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <Award className="w-4 h-4" /> CBC Standards Guide
              </button>

              <button
                onClick={() => { setActiveTab('faq'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'faq' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <Award className="w-4 h-4" /> FAQ & Answers
              </button>

              <button
                onClick={() => { setActiveTab('privacy'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 cursor-pointer ${
                  activeTab === 'privacy' ? 'bg-amber-500 text-slate-950' : 'text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-900'
                }`}
              >
                <Award className="w-4 h-4" /> Privacy & Terms of Use
              </button>

              <button
                onClick={() => { openShareModal(); setMobileMenuOpen(false); }}
                className="p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 bg-emerald-500 text-slate-950 cursor-pointer"
              >
                <Heart className="w-4 h-4 fill-slate-950" /> Share Elimu360 with Fellow Teachers
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Live Activity Ticker (Real-Time Educator Social Proof) */}
      <LiveActivityTicker />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && (
          <ServicesOverviewHome 
            onNavigate={tab => setActiveTab(tab)} 
            onOpenNotificationCenter={() => setNotificationCenterOpen(true)}
          />
        )}
        {activeTab === 'converter' && <DocumentConverter />}
        {activeTab === 'generator' && (
          <LessonPlanGeneratorHub 
            onNavigate={tab => setActiveTab(tab)} 
            initialQuestion={selectedQuestionForPlan}
          />
        )}
        {activeTab === 'question_bank' && (
          <KinyarwandaQuestionBank
            onSelectForLessonPlan={(q) => {
              setSelectedQuestionForPlan(q);
              setActiveTab('generator');
            }}
            onNavigate={tab => setActiveTab(tab)}
          />
        )}
        {activeTab === 'reb_library' && <REBCourse1806Library />}
        {activeTab === 'library' && <SavedPlansLibrary onNavigateToGenerator={() => setActiveTab('generator')} />}
        {activeTab === 'guide' && <REBCBCGuide />}
        {activeTab === 'faq' && <FAQCenter />}
        {activeTab === 'privacy' && <LegalAndPrivacyCenter />}
      </main>

      {/* Universal 24/7 Teacher WhatsApp Help Widget (Leads to 250792612139 everywhere) */}
      <WhatsAppHelpWidget />

      {/* School Structure Information Reminder Modal */}
      <SchoolProfileModal />

      {/* Share System Modal */}
      <ShareSystemModal
        isOpen={shareModalOpen}
        onClose={closeShareModal}
      />

      {/* PWA Install Promotion Modal (Auto on First Load & Offline Support) */}
      <PWAInstallModal />

      {/* Elimu Smart Notification System Center Modal */}
      <NotificationCenterModal
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        onNavigateTab={(tab) => {
          setActiveTab(tab);
          setNotificationCenterOpen(false);
        }}
      />

      {/* Elimu Smart Notification Opt-In Banner */}
      <ElimuSmartNotificationBanner />

      {/* Active In-App Notification Toast */}
      <InAppNotificationToast onNavigateTab={(tab) => setActiveTab(tab)} />

      {/* Global Footer with All Rights Copyright Attribution */}
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950 py-10 px-4 text-center text-xs text-slate-600 dark:text-slate-400 space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2 font-medium">
          <span className="font-bold text-slate-800 dark:text-slate-200">
            The Palace, Inc — The Palace Tech House
          </span>
          <span className="text-slate-400 dark:text-slate-600 hidden sm:inline">•</span>
          <span className="text-amber-600 dark:text-amber-400 font-semibold">
            All Rights Reserved Copyright © {new Date().getFullYear()}
          </span>
        </div>

        {/* Footer Navigation Links */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-400">
          <button 
            onClick={() => setActiveTab('home')} 
            className="hover:text-amber-400 transition cursor-pointer"
          >
            Overview
          </button>
          <span>•</span>
          <button 
            onClick={() => setActiveTab('generator')} 
            className="hover:text-amber-400 transition cursor-pointer"
          >
            AI Lesson Plans
          </button>
          <span>•</span>
          <button 
            onClick={() => setActiveTab('converter')} 
            className="hover:text-amber-400 transition cursor-pointer"
          >
            Document Converter
          </button>
          <span>•</span>
          <button 
            onClick={() => setActiveTab('faq')} 
            className="hover:text-amber-400 transition cursor-pointer"
          >
            FAQ & Answers
          </button>
          <span>•</span>
          <button 
            onClick={() => setActiveTab('privacy')} 
            className="hover:text-amber-400 transition cursor-pointer"
          >
            Privacy Policy & Terms of Use
          </button>
        </div>

        <p className="text-slate-400 max-w-2xl mx-auto text-[11px] leading-relaxed">
          Elimu360 Open System is an advanced educational technology platform providing sovereign AI Lesson Plan Generation, CBC curriculum alignment, and universal document conversion.
        </p>

        {/* 24/7 Teacher WhatsApp Help Line */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-emerald-400 font-bold pt-1">
          <MessageCircle className="w-3.5 h-3.5" />
          <span>24/7 Teacher WhatsApp Support:</span>
          <a 
            href="https://wa.me/250792612139?text=Hello%20Elimu360%20Tech%20House%2C%20I%20need%20assistance%20with%20teaching%20tools" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="underline hover:text-emerald-300 transition"
          >
            +250 792 612 139 (The Palace Tech House)
          </a>
        </div>

        <p className="text-[10px] text-slate-600 pt-1">
          The Palace, Inc — The Palace Tech House. All Rights Reserved. Sovereign Educational Technology Division.
        </p>
      </footer>

    </div>
  );
};

export default function App() {
  return (
    <ElimuProvider>
      <MainAppContent />
    </ElimuProvider>
  );
}
