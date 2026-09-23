import React, { useState } from 'react';
import { 
  FileText, 
  Download, 
  Search, 
  BookOpen, 
  Zap, 
  CheckCircle2, 
  Printer, 
  Sparkles,
  ChevronRight,
  Send,
  HelpCircle
} from 'lucide-react';
import { MASTER_12_PILLARS, FIELD_TRAINING_MODULES, TrainingPillar, TrainingModule } from './trainingData';
import { 
  generateIndividualPillarPdf, 
  generateIndividualModulePdf, 
  generateMasterManualPdf 
} from './pdfGenerator';

interface TrainingPdfResourceHubProps {
  defaultCategory?: 'MODULES' | 'PILLARS' | 'ALL';
  compactView?: boolean;
}

export const TrainingPdfResourceHub: React.FC<TrainingPdfResourceHubProps> = ({ 
  defaultCategory = 'ALL',
  compactView = false 
}) => {
  const [activeTab, setActiveTab] = useState<'MODULES' | 'PILLARS' | 'ALL'>(defaultCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filteredModules = FIELD_TRAINING_MODULES.filter(m => 
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.objective.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.coreConcepts.some(c => c.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredPillars = MASTER_12_PILLARS.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.subtitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.summary.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDownloadModule = (mod: TrainingModule) => {
    setDownloadingId(`mod-${mod.id}`);
    setTimeout(() => {
      generateIndividualModulePdf(mod);
      setDownloadingId(null);
    }, 200);
  };

  const handleDownloadPillar = (pillar: TrainingPillar) => {
    setDownloadingId(`pillar-${pillar.id}`);
    setTimeout(() => {
      generateIndividualPillarPdf(pillar);
      setDownloadingId(null);
    }, 200);
  };

  const handleDownloadMaster = () => {
    setDownloadingId('master');
    setTimeout(() => {
      generateMasterManualPdf(MASTER_12_PILLARS, FIELD_TRAINING_MODULES);
      setDownloadingId(null);
    }, 200);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 space-y-6 text-white shadow-xl">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">
            <FileText className="w-4 h-4 text-amber-400" />
            <span>Field Training & Core Topics PDF Resource Library</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Individual Training Manuals & Core Topic PDFs
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Download individual PDF manuals for each of the 7 Field Modules and 12 Core Knowledge Pillars, or export the complete master handbook.
          </p>
        </div>

        <button
          onClick={handleDownloadMaster}
          disabled={downloadingId === 'master'}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center gap-2 transition cursor-pointer shadow-lg shrink-0 disabled:opacity-50"
        >
          <Printer className="w-4 h-4" />
          <span>{downloadingId === 'master' ? 'Generating PDF...' : 'Download Master Manual PDF'}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Category Tabs */}
        <div className="flex items-center bg-slate-950 p-1 rounded-2xl border border-slate-800/80 text-xs font-bold">
          <button
            onClick={() => setActiveTab('ALL')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer ${
              activeTab === 'ALL' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            All Files (19 PDFs)
          </button>
          <button
            onClick={() => setActiveTab('MODULES')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'MODULES' ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>7 Training Modules</span>
          </button>
          <button
            onClick={() => setActiveTab('PILLARS')}
            className={`px-3.5 py-1.5 rounded-xl transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PILLARS' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>12 Core Topics</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topic or module..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>
      </div>

      {/* MODULES SECTION */}
      {(activeTab === 'ALL' || activeTab === 'MODULES') && (
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>1. Field Training Modules (7 Dedicated PDFs)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Individual PDF for each module</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredModules.map((mod) => {
              const isDownloading = downloadingId === `mod-${mod.id}`;
              return (
                <div 
                  key={mod.id} 
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-amber-500/40 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-bold">
                        Module #{mod.id} · {mod.duration}
                      </span>
                      <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Complete Script
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-white leading-snug">
                      {mod.title}
                    </h4>

                    <p className="text-xs text-slate-300/90 leading-relaxed line-clamp-2">
                      <strong className="text-amber-400">Objective:</strong> {mod.objective}
                    </p>

                    <div className="space-y-1 pt-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase">Core Concepts Covered:</div>
                      <ul className="space-y-1 text-[11px] text-slate-300">
                        {mod.coreConcepts.slice(0, 2).map((concept, cIdx) => (
                          <li key={cIdx} className="flex items-start gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                            <span className="truncate">{concept}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadModule(mod)}
                    disabled={isDownloading}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-amber-500/10 hover:bg-amber-500 text-amber-300 hover:text-slate-950 font-extrabold text-xs border border-amber-500/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'Generating Module PDF...' : `Download Module #${mod.id} PDF`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* PILLARS / CORE TOPICS SECTION */}
      {(activeTab === 'ALL' || activeTab === 'PILLARS') && (
        <div className="space-y-3 pt-4 border-t border-slate-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold uppercase tracking-wider text-blue-400 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-400" />
              <span>2. Core Knowledge Pillars & System Topics (12 Dedicated PDFs)</span>
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Individual PDF for each topic</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredPillars.map((pillar) => {
              const isDownloading = downloadingId === `pillar-${pillar.id}`;
              return (
                <div 
                  key={pillar.id} 
                  className="p-4 rounded-2xl bg-slate-950 border border-slate-800/90 hover:border-blue-500/40 transition space-y-3 flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 text-[10px] font-bold">
                        Topic #{pillar.id} of 12
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {pillar.detailedContent.length} Detailed Sub-Sections
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-white leading-snug">
                      {pillar.title}
                    </h4>

                    <p className="text-[11px] font-semibold text-amber-400">
                      {pillar.subtitle}
                    </p>

                    <p className="text-[11px] text-slate-300/80 line-clamp-2 leading-relaxed">
                      {pillar.summary}
                    </p>
                  </div>

                  <button
                    onClick={() => handleDownloadPillar(pillar)}
                    disabled={isDownloading}
                    className="w-full mt-2 py-2 px-3 rounded-xl bg-blue-500/10 hover:bg-blue-600 text-blue-300 hover:text-white font-extrabold text-xs border border-blue-500/30 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{isDownloading ? 'Generating Topic PDF...' : `Download Core Topic #${pillar.id} PDF`}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
