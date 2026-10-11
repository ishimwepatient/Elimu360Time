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
  MessageCircle
} from 'lucide-react';
import { ElimuProvider, useElimu } from './context/ElimuContext';
import { ElimuLogo } from './components/brand/ElimuLogo';
import { ServicesOverviewHome } from './components/home/ServicesOverviewHome';
import { DocumentConverter } from './components/converter/DocumentConverter';
import { LessonPlanGeneratorHub } from './components/generator/LessonPlanGeneratorHub';
import { SavedPlansLibrary } from './components/library/SavedPlansLibrary';
import { REBCBCGuide } from './components/guide/REBCBCGuide';
import { FAQCenter } from './components/faq/FAQCenter';
import { LegalAndPrivacyCenter } from './components/legal/LegalAndPrivacyCenter';
import { PWAInstallModal } from './components/pwa/PWAInstallModal';
import { PWAInstallHeaderButton } from './components/pwa/PWAInstallHeaderButton';
import { ShareSystemModal } from './components/share/ShareSystemModal';
import { WhatsAppHelpWidget } from './components/support/WhatsAppHelpWidget';
import { LiveActivityTicker } from './components/common/LiveActivityTicker';

type ActiveTab = 'home' | 'converter' | 'generator' | 'library' | 'guide' | 'faq' | 'privacy';

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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => setActiveTab('home')}>
            <ElimuLogo size="md" />
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 text-xs">
            <button
              onClick={() => setActiveTab('home')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'home'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'generator'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Lesson Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('converter')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'converter'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Document Converter</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'library'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Saved Plans ({savedLessonPlans.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('guide')}
              className={`px-3.5 py-2 rounded-xl font-bold transition flex items-center gap-1.5 ${
                activeTab === 'guide'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>CBC Standards</span>
            </button>
          </nav>

          {/* Right Header Actions */}
          <div className="hidden md:flex items-center gap-3">
            
            {/* Install PWA Button */}
            <PWAInstallHeaderButton />

            {/* Encourage Sharing Button */}
            <button
              onClick={openShareModal}
              className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition shadow-lg cursor-pointer"
            >
              <Heart className="w-4 h-4 fill-slate-950" />
              <span>Share System for Teachers</span>
            </button>

            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
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
          <div className="md:hidden border-t border-slate-800 bg-slate-950 p-4 space-y-3 animate-fade-in">
            <nav className="flex flex-col space-y-2">
              <button
                onClick={() => { setActiveTab('home'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'home' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <Home className="w-4 h-4" /> Services Overview
              </button>

              <button
                onClick={() => { setActiveTab('generator'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'generator' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" /> AI Lesson Plan Generator
              </button>

              <button
                onClick={() => { setActiveTab('converter'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'converter' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <RefreshCw className="w-4 h-4" /> Documents Converter
              </button>

              <button
                onClick={() => { setActiveTab('library'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'library' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <BookOpen className="w-4 h-4" /> Saved Plans ({savedLessonPlans.length})
              </button>

              <button
                onClick={() => { setActiveTab('guide'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'guide' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <Award className="w-4 h-4" /> CBC Standards Guide
              </button>

              <button
                onClick={() => { setActiveTab('faq'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'faq' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <Award className="w-4 h-4" /> FAQ & Answers
              </button>

              <button
                onClick={() => { setActiveTab('privacy'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'privacy' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <Award className="w-4 h-4" /> Privacy & Terms of Use
              </button>

              <button
                onClick={() => { openShareModal(); setMobileMenuOpen(false); }}
                className="p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 bg-emerald-500 text-slate-950"
              >
                <Heart className="w-4 h-4 fill-slate-950" /> Share Elimu360 with Fellow Teachers
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Live Activity Ticker (Chinese Super-App Style Real-Time Educator Social Proof) */}
      <LiveActivityTicker />

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'home' && <ServicesOverviewHome onNavigate={tab => setActiveTab(tab)} />}
        {activeTab === 'converter' && <DocumentConverter />}
        {activeTab === 'generator' && <LessonPlanGeneratorHub onNavigate={tab => setActiveTab(tab)} />}
        {activeTab === 'library' && <SavedPlansLibrary onNavigateToGenerator={() => setActiveTab('generator')} />}
        {activeTab === 'guide' && <REBCBCGuide />}
        {activeTab === 'faq' && <FAQCenter />}
        {activeTab === 'privacy' && <LegalAndPrivacyCenter />}
      </main>

      {/* Universal 24/7 Teacher WhatsApp Help Widget (Leads to 250792612139 everywhere) */}
      <WhatsAppHelpWidget />

      {/* Share System Modal */}
      <ShareSystemModal
        isOpen={shareModalOpen}
        onClose={closeShareModal}
      />

      {/* PWA Install Promotion Modal (Auto on First Load & Offline Support) */}
      <PWAInstallModal />

      {/* Global Footer with All Rights Copyright Attribution */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-10 px-4 text-center text-xs text-slate-500 space-y-4">
        <div className="flex flex-wrap items-center justify-center gap-2 font-medium">
          <span className="font-bold text-slate-300">
            The Palace, Inc — The Palace Tech House
          </span>
          <span className="text-slate-600 hidden sm:inline">•</span>
          <span className="text-amber-400 font-semibold">
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
