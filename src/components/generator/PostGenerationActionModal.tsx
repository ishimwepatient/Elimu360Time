import React, { useEffect } from 'react';
import { 
  CheckCircle2, 
  Sparkles, 
  RefreshCw, 
  BookOpen, 
  FileDown, 
  MessageCircle, 
  X, 
  ArrowRight, 
  Award,
  Layers,
  ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TacticalAdCard } from '../ads/TacticalAdCard';

interface PostGenerationActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  planCount: number;
  unitNumber: string;
  unitTitle: string;
  onNavigateToConverter: () => void;
  onNavigateToLibrary: () => void;
  onOpenExportModal: () => void;
}

export const PostGenerationActionModal: React.FC<PostGenerationActionModalProps> = ({
  isOpen,
  onClose,
  planCount,
  unitNumber,
  unitTitle,
  onNavigateToConverter,
  onNavigateToLibrary,
  onOpenExportModal
}) => {
  useEffect(() => {
    if (isOpen) {
      // Fire festive celebratory confetti like Chinese super-apps (Taobao/WeChat celebration style)
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch {
        // Fallback gracefully
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(`Hello Elimu360 Team, I just generated ${planCount} lesson plans for Unit ${unitNumber} (${unitTitle}) and I would like extra advice/CBC alignment assistance.`);
    window.open(`https://wa.me/250792612139?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
      <div 
        className="w-full max-w-2xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl p-6 sm:p-8 relative space-y-6 my-8 text-left"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Celebration Banner */}
        <div className="space-y-2 pr-8">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-md">
              <Sparkles className="w-3.5 h-3.5 fill-slate-950" /> Generation Complete!
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[11px] font-bold">
              {planCount} Plans Ready
            </span>
          </div>

          <h3 className="text-xl sm:text-2xl font-black text-white font-display">
            Your Lesson Plans Are Ready! What's Next?
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Unit {unitNumber}: <strong>"{unitTitle || 'Lesson Topic'}"</strong> has been formulated according to REB CBC criteria. Choose your next step below to keep your teaching workflow smooth:
          </p>
        </div>

        {/* 4 Interactive Super-App Next Step Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          
          {/* Card 1: Convert Documents */}
          <div 
            onClick={() => { onClose(); onNavigateToConverter(); }}
            className="group p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-amber-500/60 hover:bg-slate-800/80 transition-all cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <RefreshCw className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">
                  1. Convert Documents
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Convert PDFs to editable Microsoft Word (.docx), PPT slides, or images for your school binder.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Open Document Converter</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Check Saved Plans Library */}
          <div 
            onClick={() => { onClose(); onNavigateToLibrary(); }}
            className="group p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/80 transition-all cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                  2. Check Saved Plans Library
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Inspect your saved archive, organize your units, and access all historical plans even completely offline.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-emerald-400">
              <span>View Saved Plans</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Export All in 1 File (Each on its own page) */}
          <div 
            onClick={() => { onClose(); onOpenExportModal(); }}
            className="group p-4 rounded-2xl bg-slate-950/80 border border-slate-800 hover:border-sky-500/60 hover:bg-slate-800/80 transition-all cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white group-hover:text-sky-400 transition-colors">
                  3. Export All in 1 File
                </h4>
                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  Download all {planCount} plans in a single combined document (each on its own page) or native folder.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-bold text-sky-400">
              <span>Choose Export Format</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: 24/7 WhatsApp Teacher Support (250792612139) */}
          <div 
            onClick={handleOpenWhatsApp}
            className="group p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 hover:border-emerald-400 hover:bg-emerald-900/40 transition-all cursor-pointer shadow-md flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/30 text-emerald-400 flex items-center justify-center group-hover:scale-105 transition-transform">
                <MessageCircle className="w-5 h-5 fill-emerald-400" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors">
                    4. WhatsApp Teacher Help
                  </h4>
                  <span className="text-[9px] bg-emerald-500/30 text-emerald-300 font-extrabold px-1.5 py-0.2 rounded">
                    HOT
                  </span>
                </div>
                <p className="text-[11px] text-emerald-200 mt-1 leading-snug">
                  Need CBC syllabus advice or custom lesson plans? Chat directly with Palace Tech House specialists at <strong>+250 792 612 139</strong>.
                </p>
              </div>
            </div>
            <div className="mt-3 pt-2.5 border-t border-emerald-800/60 flex items-center justify-between text-xs font-bold text-emerald-300">
              <span>Chat on WhatsApp (+250 792 612 139)</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Tactical Ad Placement 2: High value, separated sponsor offer */}
        <div className="pt-1">
          <TacticalAdCard slotIndex={1} compact={false} />
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800">
          <span className="text-xs text-slate-500">
            Elimu360 Open Sovereign System
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            Continue Inspecting Plans
          </button>
        </div>

      </div>
    </div>
  );
};
