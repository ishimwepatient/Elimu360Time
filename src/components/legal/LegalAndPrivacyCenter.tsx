import React from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, Award, Clock } from 'lucide-react';
import { AdsterraNativeBanner } from '../ads/AdsterraNativeBanner';

export const LegalAndPrivacyCenter: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-10 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-3.5 h-3.5" /> Legal, Privacy & Compliance
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display">
          Privacy Policy & Terms of Use
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          Elimu360 Open System is committed to educator privacy, sovereign local data handling, intellectual transparency, and safe educational computing.
        </p>
        <p className="text-[11px] text-slate-500">
          Last revised: October 2026 • Published by The Palace, Inc — The Palace Tech House
        </p>
      </div>

      {/* Section 1: Privacy Policy */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">1. Comprehensive Privacy Policy</h2>
            <p className="text-xs text-slate-400">How your lesson data, converted documents, and teacher profiles are protected</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">A. Sovereign Client-Side Data Storage</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Elimu360 operates on a sovereign, client-first architecture. When you draft, generate, or save lesson plans, the records are stored directly within your device’s local browser storage (IndexedDB/LocalStorage). We do not collect, monetize, or harvest teacher personal identities, student names, or school gradebooks.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">B. Document Conversion Security</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              When converting PDF files to DOCX, PPT slides to PDF, or PNG images to PDF, all parsing is performed directly inside your web browser. Your uploaded classroom materials, examination sheets, and administrative slides remain confidential on your device.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">C. Cookies & Sponsored Content</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              To keep Elimu360 100% free for teachers without subscription fees, the system displays sponsored educational resources and digital opportunities. Third-party advertising partners may use non-personally identifiable cookies and anonymous browser identifiers to deliver relevant academic tools and career grants.
            </p>
          </div>
        </div>
      </div>

      {/* Inline Strategic Ad Banner */}
      <AdsterraNativeBanner badgeLabel="Educational Grants & Accredited Distance Programs" />

      {/* Section 2: Terms of Use */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-display">2. Terms of Use & Licensing</h2>
            <p className="text-xs text-slate-400">Rules governing usage of Elimu360 Open System</p>
          </div>
        </div>

        <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed">
          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">A. Free Educational License</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Educators, headteachers, and pedagogical inspectors are granted full permission to generate, modify, print, export, and distribute lesson plans created with Elimu360 without licensing fees or royalties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">B. Intellectual Property & System Ownership</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              The Elimu360 software platform, layout architecture, algorithms, pedagogical word bank, and source code are protected by international copyright laws. All rights are reserved by <strong className="text-white">The Palace, Inc — The Palace Tech House</strong>.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="font-bold text-white text-sm">C. Disclaimer of Pedagogical Accuracy</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              While generated lesson plans strictly follow REB CBC frameworks, teachers remain pedagogical professionals and are encouraged to review, adapt, and refine all lesson content to suit the unique cognitive needs of their specific classrooms.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};
