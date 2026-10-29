import React, { useState } from 'react';
import { 
  Sparkles, 
  FileText, 
  RefreshCw, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Heart, 
  ShieldCheck, 
  Download, 
  HelpCircle,
  Layers,
  Calendar,
  Check,
  Globe
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';
import { AdsterraNativeBanner } from '../ads/AdsterraNativeBanner';
import { SchoolProfileReminderBanner } from '../common/SchoolProfileReminderBanner';
import { QuickQuestionDownloadPopup } from './QuickQuestionDownloadPopup';
import { InteractiveServiceSuggestions } from './InteractiveServiceSuggestions';
import { getQuickClassSubjectQuestions } from '../../utils/kinyarwandaQuestionBankData';
import { exportQuestionsToDocx, exportQuestionsToPdf } from '../../utils/quizExportHelper';
import { ElimuSmartNotificationCard } from './ElimuSmartNotificationCard';

interface ServicesOverviewHomeProps {
  onNavigate: (tab: 'home' | 'generator' | 'converter' | 'library' | 'question_bank' | 'reb_library' | 'guide' | 'faq' | 'privacy') => void;
  onOpenNotificationCenter?: () => void;
  onOpenSettings?: () => void;
  onOpenLegalPolicy?: (tab: 'terms' | 'privacy' | 'sovereignty') => void;
}

export const ServicesOverviewHome: React.FC<ServicesOverviewHomeProps> = ({ 
  onNavigate, 
  onOpenNotificationCenter,
  onOpenSettings,
  onOpenLegalPolicy
}) => {
  const { openShareModal, savedLessonPlans, schoolProfile } = useElimu();
  const [quickDownloadModalOpen, setQuickDownloadModalOpen] = useState(false);

  // In-card fast class question downloader state
  const [cardSelectedClass, setCardSelectedClass] = useState('P6');
  const [cardSelectedSubject, setCardSelectedSubject] = useState('Ikinyarwanda');
  const [cardDownloading, setCardDownloading] = useState(false);
  const [cardMessage, setCardMessage] = useState<string | null>(null);

  const handleCardFastDownload = async (format: 'docx' | 'pdf') => {
    setCardDownloading(true);
    setCardMessage(null);
    try {
      const questions = getQuickClassSubjectQuestions(cardSelectedClass, cardSelectedSubject, '2025', 20);
      if (questions.length === 0) {
        setCardMessage('Nta bibazo byabonetse kuri iri somo. Hitamo irindi somo.');
        setCardDownloading(false);
        return;
      }

      const options = {
        schoolName: schoolProfile.schoolName || 'GS Rwanda Amahoro',
        examTitle: `ISUZUMABUMENYI RYA ${cardSelectedSubject.toUpperCase()} (${cardSelectedClass})`,
        subject: cardSelectedSubject,
        classLevel: cardSelectedClass,
        term: 'Igihembwe cya 1 (Term 1)',
        duration: 'Iminota 60 (1h 00min)',
        includeAnswers: true
      };

      if (format === 'docx') {
        await exportQuestionsToDocx(questions, options);
        setCardMessage(`Wamanuye neza ikizamini cya ${cardSelectedSubject} (${cardSelectedClass}) muri Word (.docx)!`);
      } else {
        exportQuestionsToPdf(questions, options);
        setCardMessage(`Wamanuye neza ikizamini cya ${cardSelectedSubject} (${cardSelectedClass}) muri PDF!`);
      }
    } catch (e) {
      console.error(e);
      setCardMessage('Habaye ikosa mu kumanura. Ongera ugerageze.');
    } finally {
      setCardDownloading(false);
    }
  };

  return (
    <div className="space-y-10 animate-fade-in pb-12">

      {/* School Profile Persistent Reminder Banner at the very top */}
      <SchoolProfileReminderBanner />
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl text-white">
        <div className="absolute top-0 right-0 -translate-y-16 translate-x-16 w-[500px] h-[500px] bg-gradient-to-br from-amber-500/20 via-emerald-500/10 to-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> 100% Free & Open Educator Platform
            </span>
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> REB CBC Compliant
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold text-white font-display tracking-tight leading-tight">
            Elimu360 Open System: <br />
            <span className="bg-gradient-to-r from-amber-400 via-emerald-400 to-sky-400 bg-clip-text text-transparent">
              AI Lesson Plans, Questions & REB Books
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Sovereign, fast, and free toolkit for educators in Rwanda and across Africa. Draft inspectorate-ready REB Competency-Based lesson plans, download exam questions and answers by class, browse revised REB textbooks and schemes of work, and convert teaching documents with layout preservation.
          </p>

          {/* Core Call to Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('generator')}
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl transition flex items-center gap-2.5 cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Create Lesson Plans</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => setQuickDownloadModalOpen(true)}
              className="px-5 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm shadow-xl transition flex items-center gap-2 cursor-pointer group"
            >
              <Download className="w-5 h-5 text-slate-950" />
              <span>📥 Download Questions by Class</span>
            </button>

            <button
              onClick={() => onNavigate('reb_library')}
              className="px-5 py-3.5 rounded-2xl bg-blue-600/90 hover:bg-blue-600 text-white font-black text-sm shadow-xl transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-sky-300" />
              <span>📚 REB Books & Schemes (1806)</span>
            </button>

            <button
              onClick={() => onNavigate('converter')}
              className="px-5 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border border-slate-700 shadow-xl transition flex items-center gap-2 cursor-pointer group"
            >
              <RefreshCw className="w-4 h-4 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>Document Converter</span>
            </button>
          </div>

          {/* Quick Stats Bar */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>No Sign-Up Needed</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>100% Free Forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Direct PDF & Word Exports</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Retains School & Teacher Profile</span>
            </div>
          </div>
        </div>
      </div>

      {/* Elimu Smart Notification System & Lock Screen Assistant Feature Card */}
      <ElimuSmartNotificationCard 
        onOpenCenter={onOpenNotificationCenter || (() => {})} 
        onNavigate={onNavigate} 
        onOpenSettings={onOpenSettings}
      />

      {/* Featured Quick Class-Based Question Downloader Section with Nearby Ad Integration */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-700 dark:text-amber-400">
                Instant Exam Papers & Questions
              </span>
              <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">• 360,000+ REB CBC Questions (P1 - S6)</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-display">
              🇷🇼 Manura Ibibazo n'Ibizamini ku Masomo Atandukanye
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Hitamo gusa umwaka w'amashuri n'isomo, maze umanure ikizamini cyuzuye gifite ibisubizo n'akaraso k'ikosora ako kanya!
            </p>
          </div>

          <button
            onClick={() => setQuickDownloadModalOpen(true)}
            className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition flex items-center gap-2 cursor-pointer shrink-0 self-start md:self-auto"
          >
            <Download className="w-4 h-4" />
            <span>Fungura Idirishya ryo Kumanura (Popup)</span>
          </button>
        </div>

        {cardMessage && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{cardMessage}</span>
          </div>
        )}

        {/* 2-Column Layout: Left = Quick Selector & Download, Right = Educational Sponsor Ad */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Controls (8 cols) */}
          <div className="lg:col-span-8 space-y-4">
            {/* Step 1: Subject Selection */}
            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-amber-500" />
                1. Hitamo Isomo (Subject):
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  'Ikinyarwanda', 
                  'Imibare (Mathematics)', 
                  'Science & Elementary Technology (SET)', 
                  'English Language', 
                  'Physics', 
                  'Chemistry', 
                  'Biology', 
                  'Social & Religious Studies (SRS / SST)'
                ].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setCardSelectedSubject(s)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      cardSelectedSubject === s
                        ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Class Selection */}
            <div>
              <label className="block text-xs font-black text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-emerald-500" />
                2. Hitamo Umwaka w'Amashuri (Class Level):
              </label>

              {/* Primary */}
              <div className="mb-2">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Amashuri Abanza (Primary):
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {['P1', 'P2', 'P3', 'P4', 'P5', 'P6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCardSelectedClass(c)}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                        cardSelectedClass === c
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Secondary */}
              <div>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                  Amashuri Yisumbuye (Secondary O/A-Level):
                </span>
                <div className="grid grid-cols-6 gap-1.5">
                  {['S1', 'S2', 'S3', 'S4', 'S5', 'S6'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCardSelectedClass(c)}
                      className={`py-2 rounded-xl text-xs font-black transition cursor-pointer text-center ${
                        cardSelectedClass === c
                          ? 'bg-emerald-600 text-white shadow-md'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Direct Download Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                disabled={cardDownloading}
                onClick={() => handleCardFastDownload('docx')}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <FileText className="w-4 h-4" />
                <span>Manura Ikizamini cya {cardSelectedSubject} ({cardSelectedClass}) muri Word (.docx)</span>
              </button>

              <button
                type="button"
                disabled={cardDownloading}
                onClick={() => handleCardFastDownload('pdf')}
                className="flex-1 py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                <span>Manura muri PDF Doc</span>
              </button>
            </div>
          </div>

          {/* Right Sponsor Ad Banner (Must be near the download form as requested) */}
          <div className="lg:col-span-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-3xl border border-slate-200 dark:border-slate-700/60">
            <span className="text-[10px] font-extrabold uppercase text-slate-500 tracking-wider block mb-2 text-center">
              Educational Sponsor & Ad Banner
            </span>
            <AdsterraNativeBanner />
          </div>

        </div>
      </div>

      {/* Services Grid Section */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white font-display">
            Our Free Educator Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
            Everything you need for teaching preparation, lesson planning, and document formatting in one unified open workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Service 1: AI REB Lesson Plan Generator */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 space-y-4 transition group flex flex-col justify-between shadow-sm hover:shadow-md">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-amber-500 transition">
                AI REB CBC Lesson Generator
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Draft official REB Competency-Based Curriculum lesson plans with 100% Kinyarwanda option, sequential dates, and direct PDF/Word exports.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
              <button
                onClick={() => onNavigate('generator')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Launch Generator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {savedLessonPlans.length > 0 && (
                <button
                  onClick={() => onNavigate('library')}
                  className="w-full py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-amber-600 dark:text-amber-400 font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                  title="Reach already created lesson plans"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Reach Saved Plans ({savedLessonPlans.length})</span>
                </button>
              )}
            </div>
          </div>

          {/* Service 2: Question Bank (🇷🇼 Ikigega) */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 space-y-4 transition group flex flex-col justify-between shadow-sm hover:shadow-md">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center font-bold">
                <HelpCircle className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-amber-500 transition">
                🇷🇼 Question Bank (3,000+)
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Over 3,000 CBC examination questions with answers, marking schemes, and multi-year coverage (2020 - 2026) across P1 to S6.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onNavigate('question_bank')}
                className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Browse Question Bank</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Service 3: REB Course 1806 Revised Books & Schemes of Work */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 rounded-3xl p-6 space-y-4 transition group flex flex-col justify-between shadow-sm hover:shadow-md">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center font-bold">
                <BookOpen className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-blue-500 transition">
                REB Books & Schemes (1806)
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Direct access to revised REB textbooks, Teacher Guides, syllabi, and downloadable Scheme of Work Word (.docx) templates.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onNavigate('reb_library')}
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Open REB Library (1806)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Service 4: Universal Document Converter */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 space-y-4 transition group flex flex-col justify-between shadow-sm hover:shadow-md">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center font-bold">
                <RefreshCw className="w-6 h-6" />
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white font-display group-hover:text-emerald-500 transition">
                Document Converter
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Convert lesson documents (PDF to DOCX, PPT to PDF/Word, PNG to PDF) with layout preservation and zero formatting loss.
              </p>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                onClick={() => onNavigate('converter')}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs transition flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <span>Launch Converter</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Quick Legal & Privacy Policy Popup Strip (Terms & Policies Popups on Home Screen) */}
      <div className="p-4 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 shadow-sm">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
          <span className="font-bold text-slate-700 dark:text-slate-300">
            Amategeko n'Uburenganzira bwa Mwarimu:
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenLegalPolicy && onOpenLegalPolicy('privacy')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-500 hover:text-white dark:hover:bg-emerald-600 transition font-bold text-xs cursor-pointer"
          >
            Politiki y'Ubuzima Bwite (Privacy)
          </button>
          <button
            onClick={() => onOpenLegalPolicy && onOpenLegalPolicy('terms')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-500 hover:text-white dark:hover:bg-blue-600 transition font-bold text-xs cursor-pointer"
          >
            Amabwiriza y'Imikoreshereze (Terms)
          </button>
          <button
            onClick={() => onOpenLegalPolicy && onOpenLegalPolicy('sovereignty')}
            className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-amber-500 hover:text-slate-950 dark:hover:bg-amber-600 transition font-bold text-xs cursor-pointer"
          >
            Umutekano w'Inyandiko (Data Safety)
          </button>
        </div>
      </div>

      {/* Quick Question Download Popup Dialog */}
      <QuickQuestionDownloadPopup
        isOpen={quickDownloadModalOpen}
        onClose={() => setQuickDownloadModalOpen(false)}
        onOpenFullQuestionBank={() => onNavigate('question_bank')}
      />

      {/* Interactive Moving Service Suggestions & Floating Educator Assistant */}
      <InteractiveServiceSuggestions 
        onNavigate={onNavigate} 
        onOpenQuickQuestionModal={() => setQuickDownloadModalOpen(true)} 
      />

    </div>
  );
};
