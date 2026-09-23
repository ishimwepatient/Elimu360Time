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
  FileText,
  RefreshCw,
  Heart
} from 'lucide-react';
import { ElimuProvider, useElimu } from './context/ElimuContext';
import { ElimuLogo } from './components/brand/ElimuLogo';
import { DocumentConverter } from './components/converter/DocumentConverter';
import { LessonPlanGeneratorHub } from './components/generator/LessonPlanGeneratorHub';
import { SavedPlansLibrary } from './components/library/SavedPlansLibrary';
import { REBCBCGuide } from './components/guide/REBCBCGuide';
import { ShareSystemModal } from './components/share/ShareSystemModal';

type ActiveTab = 'converter' | 'generator' | 'library' | 'guide';

const MainAppContent: React.FC = () => {
  const { 
    theme, 
    toggleTheme, 
    savedLessonPlans,
    shareModalOpen,
    openShareModal,
    closeShareModal
  } = useElimu();

  // App starts from Documents Converter as requested
  const [activeTab, setActiveTab] = useState<ActiveTab>('converter');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => setActiveTab('converter')}>
            <ElimuLogo size="md" />
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('converter')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'converter'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <RefreshCw className="w-4 h-4 text-slate-950" />
              <span>Documents Converter</span>
            </button>

            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'generator'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Lesson Plan Generator</span>
            </button>

            <button
              onClick={() => setActiveTab('library')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
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
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
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
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
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
                onClick={() => { setActiveTab('converter'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'converter' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <RefreshCw className="w-4 h-4" /> Documents Converter
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
                onClick={() => { openShareModal(); setMobileMenuOpen(false); }}
                className="p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 bg-emerald-500 text-slate-950"
              >
                <Heart className="w-4 h-4 fill-slate-950" /> Share Elimu360 with Fellow Teachers
              </button>
            </nav>
          </div>
        )}
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'converter' && <DocumentConverter />}
        {activeTab === 'generator' && <LessonPlanGeneratorHub />}
        {activeTab === 'library' && <SavedPlansLibrary onNavigateToGenerator={() => setActiveTab('generator')} />}
        {activeTab === 'guide' && <REBCBCGuide />}
      </main>

      {/* Share System Modal */}
      <ShareSystemModal
        isOpen={shareModalOpen}
        onClose={closeShareModal}
      />

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          Elimu360 Open System — Sovereign AI Lesson Plan Generator & Universal Document Converter
        </p>
        <p className="text-[11px]">
          Free, sovereign, and open for all educators • Grounded in REB & Competency-Based Curriculum Standards
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
