import React, { useState, useEffect } from 'react';
import { ShieldCheck, Lock, FileText, CheckCircle2, X, ExternalLink, Scale, Sparkles } from 'lucide-react';

interface LegalPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'terms' | 'privacy' | 'sovereignty';
}

export const LegalPolicyModal: React.FC<LegalPolicyModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'privacy'
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'sovereignty'>(initialTab);

  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white relative flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 sm:p-2.5 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-black font-display">
                Amategeko, Uburenganzira n'Ubuzima Bwite
              </h2>
              <p className="text-xs text-white/80 mt-0.5">
                Elimu360 Open System • The Palace, Inc
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 pt-2 shrink-0 bg-slate-50 dark:bg-slate-950/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'privacy'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Politiki y'Ubuzima Bwite (Privacy)</span>
          </button>

          <button
            onClick={() => setActiveTab('terms')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'terms'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            <span>Amabwiriza y'Imikoreshereze (Terms)</span>
          </button>

          <button
            onClick={() => setActiveTab('sovereignty')}
            className={`pb-2.5 px-3 text-xs font-bold flex items-center gap-1.5 border-b-2 cursor-pointer transition whitespace-nowrap ${
              activeTab === 'sovereignty'
                ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 font-black'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Umutekano w'Inyandiko (Data Safety)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1 text-slate-700 dark:text-slate-300 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 rounded-2xl flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <p className="text-xs text-emerald-900 dark:text-emerald-200">
                  <strong>Icyemezo Cyuzuye:</strong> Elimu360 ntishobora na rimwe kugurisha cyangwa gutanga amakuru yawe, amazina y'abanyeshuri, cyangwa ibizamini by'ishuri ku bandi bantu.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  1. Kubika Amakuru ku Mashini yawe (Client-Side Storage)
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Inyandiko zose z'amasomo (Lesson Plans, Schemes of Work, Ibizamini) zibikwa mu buryo bwite kuri telefoni cyangwa mudasobwa yawe (muri IndexedDB na LocalStorage). Ibi bituma ubona amasomo yawe n'iyo waba utari kuri internet.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  2. Guhindura Inyandiko (Document Converter Safety)
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Guhindura PDF muri Word cyangwa amashusho muri PDF bikorwa n'ubwenge bwa mudasobwa yawe. Nta kopi y'ibizamini byawe ibikwa ku maseriveri y'amahanga.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  3. Amatangazo n'Abafatanyabikorwa (Sponsors & Monetization)
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Kugira ngo iyi gahunda ikomeze kubera ubuntu burundu abarimu b'u Rwanda, dukoresha amatangazo y'uburezi (Adsterra Units). Nta makuru y'umwirondoro atangwa muri aya matangazo.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  1. Imikoreshereze Yemewe (Permitted Educational Use)
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Elimu360 yemerewe gukoreshwa n'abarimu, abarezi, n'abayobozi b'ibigo by'amashuri mu Rwanda no muri Afurika yose mu gutegura amasomo, gukora ibizamini, no kumanura imfashanyigisho z'uburezi za REB.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  2. Uburenganzira bw'Ibihangano n'Ibitabo bya REB (Curriculum Alignment)
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Ibitabo n'integanyanyigisho bikomoka ku Rwego rw'Igihugu rushinzwe Uburezi (REB). Iki kigo cyubatse iyi sisitemu kugirango cyorohereze abarimu kugera ku nteganyanyigisho y'ubushobozi (Competency-Based Curriculum) nta kiguzi.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  3. Inshingano za Mwarimu (Educator Responsibility)
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Mwarimu agomba gusuzuma neza ko isomo ryateguwe rihuye neza n'ubushobozi bw'abanyeshuri n'igihembwe cy'amashuri kigezweho mbere yo kuryigisha mu ishuri.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'sovereignty' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-2xl flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-900 dark:text-amber-200">
                  <strong>Elimu Smart File Watcher & Privacy:</strong> Uruhushya uhereza sisitemu rwo kureba ububiko bw'inyandiko (folder access) rukurikiza amategeko mpuzamahanga ya Web File System Sandbox. Sisitemu isoma gusa inyandiko zo guhindura ntiyigera isoma amakuru yihariye.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-extrabold text-slate-900 dark:text-white text-sm">
                  Umutekano w'Uburezi bw'u Rwanda
                </h4>
                <p className="text-slate-500 dark:text-slate-400 text-xs leading-relaxed">
                  Sovereign educational computing ishingiye ku kurinda amakuru y'uburezi bw'igihugu. Byose bikorwa mu mutuzo no mu bwigenge busesuye.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 shrink-0">
          <span className="text-[11px] text-slate-500">
            The Palace, Inc — Kigali, Rwanda
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 font-black text-xs transition cursor-pointer shadow-md"
          >
            Ndasobanukiwe (Understood)
          </button>
        </div>
      </div>
    </div>
  );
};
