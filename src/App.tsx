import React, { useState } from 'react';
import { 
  Sparkles, 
  BookOpen, 
  User, 
  LogOut, 
  Sun, 
  Moon, 
  Layers, 
  Award, 
  Lock, 
  Menu, 
  X,
  ChevronDown
} from 'lucide-react';
import { ElimuProvider, useElimu } from './context/ElimuContext';
import { ElimuLogo } from './components/brand/ElimuLogo';
import { AuthModal } from './components/auth/AuthModal';
import { LessonPlanGeneratorHub } from './components/generator/LessonPlanGeneratorHub';
import { SavedPlansLibrary } from './components/library/SavedPlansLibrary';
import { REBCBCGuide } from './components/guide/REBCBCGuide';

type ActiveTab = 'generator' | 'library' | 'guide';

const MainAppContent: React.FC = () => {
  const { currentUser, isAuthenticated, logout, theme, toggleTheme, openAuthModal, savedLessonPlans } = useElimu();
  const [activeTab, setActiveTab] = useState<ActiveTab>('generator');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans transition-colors duration-300">
      
      {/* Top Header Navbar */}
      <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Logo */}
          <div className="cursor-pointer" onClick={() => setActiveTab('generator')}>
            <ElimuLogo size="md" />
          </div>

          {/* Desktop Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                activeTab === 'generator'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>AI Generator</span>
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
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Auth Button / Profile Dropdown */}
            {isAuthenticated && currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-bold text-white transition"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center font-black">
                    {currentUser.name?.[0]?.toUpperCase() || 'T'}
                  </div>
                  <span className="line-clamp-1 max-w-[120px]">{currentUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 text-xs space-y-1 animate-fade-in">
                    <div className="p-2.5 border-b border-slate-800/80">
                      <p className="font-bold text-white line-clamp-1">{currentUser.name}</p>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{currentUser.email}</p>
                    </div>
                    <button
                      onClick={() => { logout(); setUserDropdownOpen(false); }}
                      className="w-full text-left px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 font-medium flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => openAuthModal('login')}
                className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-2 transition shadow-lg"
              >
                <User className="w-4 h-4" />
                <span>Sign In / Sign Up</span>
              </button>
            )}

          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden gap-2">
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
                onClick={() => { setActiveTab('generator'); setMobileMenuOpen(false); }}
                className={`p-3 rounded-xl text-xs font-bold text-left flex items-center gap-2.5 ${
                  activeTab === 'generator' ? 'bg-amber-500 text-slate-950' : 'text-slate-300 bg-slate-900'
                }`}
              >
                <Sparkles className="w-4 h-4" /> AI Generator
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
            </nav>

            <div className="pt-2 border-t border-slate-800">
              {isAuthenticated && currentUser ? (
                <div className="flex items-center justify-between p-2">
                  <span className="text-xs font-bold text-white">{currentUser.name}</span>
                  <button
                    onClick={() => { logout(); setMobileMenuOpen(false); }}
                    className="text-xs font-bold text-rose-400 flex items-center gap-1"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => { openAuthModal('login'); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-2"
                >
                  <User className="w-4 h-4" /> Sign In / Sign Up
                </button>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'generator' && <LessonPlanGeneratorHub />}
        {activeTab === 'library' && <SavedPlansLibrary onNavigateToGenerator={() => setActiveTab('generator')} />}
        {activeTab === 'guide' && <REBCBCGuide />}
      </main>

      {/* Global Auth Modal */}
      <AuthModal />

      {/* Global Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-8 text-center text-xs text-slate-500 space-y-2">
        <p className="font-semibold text-slate-400">
          Elimu360 Open System — Sovereign AI Lesson Plan Generator
        </p>
        <p className="text-[11px]">
          Free and open for all educators • Grounded in REB & Competency-Based Curriculum Standards
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
