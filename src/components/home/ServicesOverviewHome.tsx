import React from 'react';
import { 
  Sparkles, 
  FileText, 
  RefreshCw, 
  BookOpen, 
  Award, 
  CheckCircle2, 
  ArrowRight, 
  Heart, 
  Presentation, 
  Image as ImageIcon, 
  ShieldCheck, 
  Clock, 
  Download, 
  Zap,
  Globe,
  Users,
  Check
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';

interface ServicesOverviewHomeProps {
  onNavigate: (tab: 'generator' | 'converter' | 'library' | 'guide') => void;
}

export const ServicesOverviewHome: React.FC<ServicesOverviewHomeProps> = ({ onNavigate }) => {
  const { openShareModal, savedLessonPlans } = useElimu();

  return (
    <div className="space-y-12 animate-fade-in pb-12">
      
      {/* Hero Banner Section */}
      <div className="relative overflow-hidden rounded-3xl bg-slate-900 border border-slate-800 p-8 sm:p-12 shadow-2xl">
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
              AI Lesson Plans & Document Converter
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
            Sovereign, fast, and free toolkit for educators in Rwanda and across Africa. Draft inspectorate-ready REB Competency-Based lesson plans in seconds and convert teaching documents (PDF to DOCX, PPT to PDF/DOCX, PNG to PDF) with layout preservation.
          </p>

          {/* Core Call to Action Buttons */}
          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => onNavigate('generator')}
              className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-sm shadow-xl transition flex items-center gap-3 cursor-pointer group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              <span>Create Lesson Plans Now</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => onNavigate('converter')}
              className="px-6 py-4 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-black text-sm border border-slate-700 shadow-xl transition flex items-center gap-3 cursor-pointer group"
            >
              <RefreshCw className="w-5 h-5 text-amber-400 group-hover:rotate-180 transition-transform duration-500" />
              <span>Open Document Converter</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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
              <span>Works Offline Locally</span>
            </div>
          </div>
        </div>
      </div>

      {/* Services Grid Section */}
      <div className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
            Our Free Educator Services
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            Everything you need for teaching preparation, lesson planning, and document formatting in one unified open workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Service 1: AI REB Lesson Plan Generator */}
          <div className="bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-3xl p-6 space-y-4 transition group flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                <Sparkles className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white font-display group-hover:text-amber-300 transition">
                AI REB CBC Lesson Plan Generator
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Draft official Rwanda Education Board (REB) Competency-Based Curriculum lesson plans for Nursery, Primary, Secondary, and TVET levels. Includes 3-step lesson steps, generic competences, and cross-cutting issues.
              </p>

              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Bulk batch lesson generation</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Sequential weekday date calculator</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>High-res vector PDF & ZIP downloads</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>A4 Blank Unfilled Sheet generator</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('generator')}
                className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Launch Lesson Generator</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Service 2: Universal Document Converter */}
          <div className="bg-slate-900 border border-slate-800 hover:border-emerald-500/50 rounded-3xl p-6 space-y-4 transition group flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-bold">
                <RefreshCw className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white font-display group-hover:text-emerald-300 transition">
                Universal Document Converter
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Convert lesson documents and teaching materials effortlessly with strict layout preservation and proper word spacing.
              </p>

              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>PDF to DOCX</strong> with styled headings & word spacing</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>PPT to PDF or DOCX</strong> slide deck extraction</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span><strong>PNG/JPG to PDF</strong> photo worksheet compiler</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>100% private, client-side processing</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('converter')}
                className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Launch Document Converter</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Service 3: REB CBC Standards Guide */}
          <div className="bg-slate-900 border border-slate-800 hover:border-sky-500/50 rounded-3xl p-6 space-y-4 transition group flex flex-col justify-between shadow-xl">
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>

              <h3 className="text-lg font-bold text-white font-display group-hover:text-sky-300 transition">
                REB CBC Pedagogical Guide
              </h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                Comprehensive guide to Rwanda Education Board Competency-Based Curriculum standards, Bloom's Taxonomy verbs, and assessment rules.
              </p>

              <ul className="space-y-2 text-xs text-slate-400">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Bloom's Taxonomy active verb dictionary</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Generic Competences integration rules</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Cross-cutting issues & inclusivity guide</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                  <span>Inspectorate checklist reference</span>
                </li>
              </ul>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => onNavigate('guide')}
                className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
              >
                <span>Read CBC Standards Guide</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Local Saved Plans & Share Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
              <BookOpen className="w-4 h-4" /> Local Saved Library
            </div>

            <h3 className="text-xl font-bold text-white font-display">
              Access & Edit Your Saved Lesson Plans ({savedLessonPlans.length})
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Every lesson plan created on Elimu360 is saved directly to your device storage. You can search, filter by subject, modify text, print, or download PDF/Word copies anytime offline.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onNavigate('library')}
              className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs border border-slate-700 transition flex items-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Open Saved Plans Library ({savedLessonPlans.length})</span>
            </button>

            <button
              onClick={() => onNavigate('generator')}
              className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs transition flex items-center gap-2 cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Lesson Plan</span>
            </button>
          </div>
        </div>

        {/* Community Share Card */}
        <div className="bg-gradient-to-br from-emerald-500/15 via-slate-900 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 space-y-4 flex flex-col justify-between shadow-xl">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
              <Heart className="w-4 h-4 fill-emerald-400" /> Community Empowerment
            </div>

            <h3 className="text-lg font-bold text-white font-display">
              Spread the Goodness to Fellow Teachers
            </h3>

            <p className="text-xs text-slate-300 leading-relaxed">
              Help make teaching preparation stress-free for your colleagues. Share Elimu360 with teachers in your school and staffroom WhatsApp groups!
            </p>
          </div>

          <button
            onClick={openShareModal}
            className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Heart className="w-4 h-4 fill-slate-950" />
            <span>Share Elimu360 with Colleagues</span>
          </button>
        </div>

      </div>

    </div>
  );
};
