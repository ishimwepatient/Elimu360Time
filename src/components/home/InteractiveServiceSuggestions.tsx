import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Download, 
  BookOpen, 
  RefreshCw, 
  School, 
  ChevronRight, 
  ChevronLeft, 
  X, 
  MessageCircle, 
  ArrowRight,
  HelpCircle,
  FileText,
  Flame,
  CheckCircle2,
  Bell
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';

interface InteractiveServiceSuggestionsProps {
  onNavigate: (tab: 'home' | 'converter' | 'generator' | 'question_bank' | 'reb_library' | 'library' | 'guide' | 'faq' | 'privacy') => void;
  onOpenQuickQuestionModal: () => void;
}

interface ServiceTip {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  description: string;
  actionText: string;
  actionIcon: React.ReactNode;
  onClick: () => void;
  highlightClass: string;
}

export const InteractiveServiceSuggestions: React.FC<InteractiveServiceSuggestionsProps> = ({
  onNavigate,
  onOpenQuickQuestionModal
}) => {
  const { openSchoolProfileModal, schoolProfile } = useElimu();
  const [currentTipIndex, setCurrentTipIndex] = useState(0);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [assistantModalOpen, setAssistantModalOpen] = useState(false);
  const [pulseCount, setPulseCount] = useState(1);

  const tips: ServiceTip[] = [
    {
      id: 'tip_questions',
      badge: '🇷🇼 360,000+ CBC Questions',
      badgeColor: 'bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border-emerald-500/30',
      title: 'Manura Ikizamini Cyuzuye Ako Kanya',
      description: 'Hitamo gusa umwaka (P1 kugeza kuri S6) n\'isomo, umanure ikizamini gifite ibisubizo n\'ikosora muri Word cyangwa PDF!',
      actionText: 'Manura Ibibazo Ako Kanya 📥',
      actionIcon: <Download className="w-3.5 h-3.5" />,
      onClick: onOpenQuickQuestionModal,
      highlightClass: 'from-emerald-500/10 via-amber-500/10 to-emerald-500/10'
    },
    {
      id: 'tip_reb_books',
      badge: '📚 REB Course 1806 Revised',
      badgeColor: 'bg-blue-500/20 text-blue-800 dark:text-blue-300 border-blue-500/30',
      title: 'Ibitabo Byavuguruwe bya REB muri PDF',
      description: 'Manura ibitabo byose by\'umunyeshuri (Student Books) n\'umuyoboro w\'umwarimu (Teacher Guides) bitagusabye kujya kuri REB!',
      actionText: 'Reba Ibitabo bya REB 📚',
      actionIcon: <BookOpen className="w-3.5 h-3.5" />,
      onClick: () => onNavigate('reb_library'),
      highlightClass: 'from-blue-500/10 via-sky-500/10 to-blue-500/10'
    },
    {
      id: 'tip_lesson_plan',
      badge: '✨ AI Lesson Generator',
      badgeColor: 'bg-amber-500/20 text-amber-800 dark:text-amber-300 border-amber-500/30',
      title: 'Tegura Isomo Ryawe mu Masegonda 5',
      description: 'Hitamo umutwe w\'isomo, iteguriro ryose ryikore 100% mu Kinyarwanda cyangwa mu Cyongereza rifite amagambo n\'inshinga za REB!',
      actionText: 'Tegura Amasomo Ako Kanya ✨',
      actionIcon: <Sparkles className="w-3.5 h-3.5" />,
      onClick: () => onNavigate('generator'),
      highlightClass: 'from-amber-500/10 via-yellow-500/10 to-amber-500/10'
    },
    {
      id: 'tip_converter',
      badge: '🔄 Universal Converter',
      badgeColor: 'bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border-indigo-500/30',
      title: 'Hindura Dosiye (PDF to Word)',
      description: 'Hindura dosiye zawe (PDF muri Word .docx, cyangwa PPT muri PDF) bitangije imiterere, imbonerahamwe cyangwa amafoto!',
      actionText: 'Fungura Converter 🔄',
      actionIcon: <RefreshCw className="w-3.5 h-3.5" />,
      onClick: () => onNavigate('converter'),
      highlightClass: 'from-indigo-500/10 via-purple-500/10 to-indigo-500/10'
    },
    {
      id: 'tip_school_profile',
      badge: '🏫 School Structure Profile',
      badgeColor: 'bg-teal-500/20 text-teal-800 dark:text-teal-300 border-teal-500/30',
      title: 'Bika Amakuru y\'Ishuri na Mwarimu',
      description: 'Shyiramo izina ry\'ishuri n\'irya mwarimu rimwe gusa, bizajya byikoresha mu mateguriro no mu bizamini byose utongeye kubyandika!',
      actionText: 'Kuzuza Amakuru y\'Ishuri 🏫',
      actionIcon: <School className="w-3.5 h-3.5" />,
      onClick: openSchoolProfileModal,
      highlightClass: 'from-teal-500/10 via-emerald-500/10 to-teal-500/10'
    }
  ];

  // Auto-cycle through tips every 8 seconds if not paused and not dismissed
  useEffect(() => {
    if (isDismissed || isPaused) return;

    const interval = setInterval(() => {
      setCurrentTipIndex((prev) => (prev + 1) % tips.length);
      setPulseCount((c) => c + 1);
    }, 8000);

    return () => clearInterval(interval);
  }, [isDismissed, isPaused, tips.length]);

  const currentTip = tips[currentTipIndex];

  const handleNext = () => {
    setCurrentTipIndex((prev) => (prev + 1) % tips.length);
  };

  const handlePrev = () => {
    setCurrentTipIndex((prev) => (prev - 1 + tips.length) % tips.length);
  };

  return (
    <>
      {/* 1. FLOATING ANIMATED SERVICE RECOMMENDATION TOAST (Bottom-Right) */}
      {!isDismissed && (
        <aside
          aria-label="Service Suggestions"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="fixed bottom-6 right-6 z-40 max-w-sm sm:max-w-md w-[calc(100vw-3rem)] animate-slide-up transition-all duration-300"
        >
          <div className="relative overflow-hidden bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-2 border-amber-500/40 dark:border-amber-500/30 rounded-3xl p-5 shadow-2xl space-y-3">
            
            {/* Ambient Animated Shimmer Background */}
            <div className={`absolute -top-12 -right-12 w-48 h-48 bg-gradient-to-br ${currentTip.highlightClass} rounded-full blur-2xl pointer-events-none transition-all duration-500`}></div>

            {/* Header / Badge Bar */}
            <div className="relative z-10 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${currentTip.badgeColor}`}>
                  {currentTip.badge}
                </span>
              </div>

              <div className="flex items-center gap-1">
                {/* Dots Indicator */}
                <div className="flex items-center gap-1 mr-2">
                  {tips.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentTipIndex(idx)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentTipIndex === idx ? 'w-4 bg-amber-500' : 'w-1.5 bg-slate-300 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>

                {/* Dismiss Button */}
                <button
                  onClick={() => setIsDismissed(true)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  title="Funga (Dismiss)"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content Body with subtle fade animation */}
            <div className="relative z-10 space-y-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white font-display flex items-center gap-1.5">
                <span>{currentTip.title}</span>
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                {currentTip.description}
              </p>
            </div>

            {/* Action Bar */}
            <div className="relative z-10 pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1">
                <button
                  onClick={handlePrev}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Previous tip"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                  title="Next tip"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={currentTip.onClick}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-1.5 cursor-pointer transform hover:scale-102 active:scale-98"
              >
                {currentTip.actionIcon}
                <span>{currentTip.actionText}</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. RE-OPEN TOAST BUTTON (When dismissed, subtle floating badge on bottom right) */}
      {isDismissed && (
        <button
          onClick={() => setIsDismissed(false)}
          className="fixed bottom-6 right-6 z-40 px-3.5 py-2.5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 shadow-xl text-slate-900 dark:text-white text-xs font-bold flex items-center gap-2 hover:bg-amber-50 dark:hover:bg-slate-800 transition cursor-pointer group animate-fade-in"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <Sparkles className="w-4 h-4 text-amber-500 group-hover:rotate-12 transition-transform" />
          <span>Ibyo Ugiriwe Inama (5 Services)</span>
        </button>
      )}

      {/* 3. INTERACTIVE FLOATING EDUCATOR ASSISTANT BUBBLE (Bottom-Left) */}
      <div className="fixed bottom-6 left-6 z-40">
        <button
          onClick={() => setAssistantModalOpen(true)}
          className="relative group p-3.5 rounded-2xl bg-gradient-to-br from-amber-500 via-amber-400 to-emerald-500 text-slate-950 shadow-2xl hover:shadow-amber-500/30 transition transform hover:-translate-y-1 active:translate-y-0 cursor-pointer flex items-center gap-2.5 font-black text-xs"
          title="Fungura Umuyoboro w'Abarimu (Elimu Assistant)"
        >
          <div className="w-6 h-6 rounded-xl bg-slate-950/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-slate-950 group-hover:rotate-45 transition-transform" />
          </div>
          <span className="hidden sm:inline">Ukeneye Iki Uyu Munsi? (Services Hub)</span>
          <span className="px-1.5 py-0.5 rounded-full bg-slate-950 text-white text-[10px] font-black">
            🇷🇼 REB
          </span>
        </button>
      </div>

      {/* 4. INTERACTIVE ASSISTANT MODAL (SERVICE DISCOVERY WHEEL) */}
      {assistantModalOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-fade-in"
          onClick={() => setAssistantModalOpen(false)}
        >
          <div 
            className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900 dark:text-white font-display">
                    Muraho Mwarimu! Ukeneye Gukora Iki?
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Hitamo serivisi yose wifuza, ihita ifunguka ako kanya nta gutinda
                  </p>
                </div>
              </div>

              <button
                onClick={() => setAssistantModalOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* 6 Quick Action Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              
              {/* Option 1: Download Questions */}
              <button
                type="button"
                onClick={() => {
                  setAssistantModalOpen(false);
                  onOpenQuickQuestionModal();
                }}
                className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 hover:border-emerald-500 text-left transition group cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
                    <Download className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400">
                    360,000+ Q&A
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                  Manura Ikizamini cy'Isomo
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Hitamo umwaka n'isomo umanure ikizamini gifite ibisubizo muri Word cyangwa PDF.
                </p>
              </button>

              {/* Option 2: Download REB Book */}
              <button
                type="button"
                onClick={() => {
                  setAssistantModalOpen(false);
                  onNavigate('reb_library');
                }}
                className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 hover:border-blue-500 text-left transition group cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-blue-700 dark:text-blue-400">
                    Course 1806
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  Ibitabo Byavuguruwe bya REB
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Manura ibitabo by'abanyeshuri na Teacher Guides muri PDF utavuye muri sisitemu.
                </p>
              </button>

              {/* Option 3: Draft Lesson Plan */}
              <button
                type="button"
                onClick={() => {
                  setAssistantModalOpen(false);
                  onNavigate('generator');
                }}
                className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 hover:border-amber-500 text-left transition group cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400">
                    100% Kinyarwanda
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  Tegura Amasomo (AI Plans)
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Iteguriro ry'amasomo ry'umunsi cyangwa icyumweru ryujuje ibipimo by'ubugenzuzi bwa REB.
                </p>
              </button>

              {/* Option 4: Document Converter */}
              <button
                type="button"
                onClick={() => {
                  setAssistantModalOpen(false);
                  onNavigate('converter');
                }}
                className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/20 border border-indigo-200 dark:border-indigo-800/40 hover:border-indigo-500 text-left transition group cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                    <RefreshCw className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-indigo-700 dark:text-indigo-400">
                    DOCX, PDF, PPT
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                  Hindura Amadosiye (Converter)
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Hindura PDF ujye muri Word cyangwa PowerPoint bitabangamiye imiterere.
                </p>
              </button>

              {/* Option 5: School Profile */}
              <button
                type="button"
                onClick={() => {
                  setAssistantModalOpen(false);
                  openSchoolProfileModal();
                }}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-amber-500 text-left transition group cursor-pointer shadow-xs"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                    <School className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-slate-500">
                    Profile
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-amber-600">
                  Amakuru y'Ishuri na Mwarimu
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Bika izina ry'ishuri n'irya mwarimu (Bikoreshwa mu mateguriro yose).
                </p>
              </button>

              {/* Option 6: WhatsApp Support */}
              <a
                href="https://wa.me/250792612139?text=Muraho%2C%20nkeneye%20ubufasha%20kuri%20Elimu360"
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 hover:border-emerald-500 text-left transition group cursor-pointer shadow-xs block"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-500 text-slate-950 flex items-center justify-center font-bold">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400">
                    24/7 Help
                  </span>
                </div>
                <h4 className="text-xs font-black text-slate-900 dark:text-white group-hover:text-emerald-500">
                  Ubufasha bwa WhatsApp
                </h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                  Vugana n'itsinda rya tekiniki ako kanya kuri +250 792 612 139.
                </p>
              </a>

            </div>

            {/* Footer with reassurance */}
            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400">
              🇷🇼 Elimu360: Sisitemu y'ubuntu 100% yagenewe gufasha abarimu mu Rwanda.
            </div>
          </div>
        </div>
      )}
    </>
  );
};
