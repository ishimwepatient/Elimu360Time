import React, { useState } from 'react';
import { Sparkles, Globe, Cpu, ShieldCheck, BookOpen, Layers, CheckCircle2, ArrowLeft, Heart, Compass, Download, Shield } from 'lucide-react';
import { ElimuLogo, LogoExportStudioModal } from '../brand/ElimuLogo';

interface AboutProps {
  onBack?: () => void;
  onOpenLogoStudio?: () => void;
}

export const AboutElimu360: React.FC<AboutProps> = ({ onBack, onOpenLogoStudio }) => {
  const [internalStudioOpen, setInternalStudioOpen] = useState(false);

  const handleOpenStudio = () => {
    if (onOpenLogoStudio) {
      onOpenLogoStudio();
    } else {
      setInternalStudioOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
      
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(30,58,138,0.25),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b08_1px,transparent_1px),linear-gradient(to_bottom,#1e293b08_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-5xl mx-auto space-y-12 relative z-10">
        
        {/* Top Header */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-800/80">
          <div className="flex items-center gap-4">
            <ElimuLogo size="md" showMeaning={false} />
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenStudio}
              className="px-3.5 py-2 rounded-xl bg-blue-950/80 hover:bg-blue-900 border border-blue-800 text-xs font-semibold text-amber-400 hover:text-amber-300 transition cursor-pointer flex items-center gap-2 shadow-lg shadow-blue-950/50"
            >
              <Download className="w-4 h-4" />
              <span>Export Brand Logo</span>
            </button>

            {onBack && (
              <button
                onClick={onBack}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
            )}
          </div>
        </div>

        {/* Hero Concept Section with Large Logo Display */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="flex justify-center mb-2">
            <ElimuLogo size="hero" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Sparkles className="w-4 h-4" />
            <span>360° Panoramic School Information Management Ecosystem</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white font-display tracking-tight">
            The Official Architecture of <span className="text-amber-400">Elimu360</span> SIMS
          </h1>
          <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
            Elimu360 is an industrial-grade School Information Management System (SIMS) architected 
            for modern educational institutions. Built for maximum speed, strict logical tenant isolation, 
            and offline-first resilience.
          </p>
        </div>

        {/* Official Brand Identity & Emblem Anatomy Card */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Visual Identity & System Emblem</h2>
                <p className="text-xs text-amber-400 font-medium">Design Anatomy of the Elimu360 Emblem</p>
              </div>
            </div>

            <button
              onClick={handleOpenStudio}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold transition cursor-pointer flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <Sparkles className="w-4 h-4" />
              <span>Launch Logo Exporter Studio</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center text-xs font-bold font-mono">01</div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">360° Orbital Compass</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The outer golden ring with four cardinal coordinates signifies total 360-degree governance over every school operation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center text-xs font-bold font-mono">02</div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Knowledge & Pedagogy</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Represents comprehensive curriculum execution, student assessment, and academic excellence.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xs font-bold font-mono">03</div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Academic Crest</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The deep royal blue shield represents institution-grade security, enterprise stability, and zero-trust role isolation.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800/80 space-y-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center text-xs font-bold font-mono">04</div>
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Radiant Torch</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The ascending torch of wisdom symbolizes student achievement, moral character, and lifelong leadership.
              </p>
            </div>
          </div>
        </div>

        {/* The Institutional Scope of Elimu360 Card */}
        <div className="p-8 rounded-3xl bg-gradient-to-br from-blue-950/70 via-slate-900 to-indigo-950/70 border border-blue-800/60 shadow-xl space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">The Comprehensive Scope of &ldquo;Elimu360&rdquo;</h2>
              <p className="text-xs text-amber-300/90 font-medium">Unified Institutional Intelligence & Multi-Tenant Operations</p>
            </div>
          </div>

          <p className="text-slate-200 text-sm leading-relaxed">
            The <strong>&ldquo;360°&rdquo;</strong> represents a complete, spherical, panoramic integration of every dimension of institutional operations. 
            Traditional school management systems fragment academic grading, bursar ledgers, library loans, student discipline, and parent communication into disconnected silos. 
            Elimu360 unifies all 360 degrees into one cohesive institutional engine.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-blue-900/60">
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-amber-400 font-bold text-xs uppercase mb-1">01. Academic 360</div>
              <p className="text-[11px] text-slate-400">CBC & Cambridge grading, conflict-free timetables, and report cards.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-emerald-400 font-bold text-xs uppercase mb-1">02. Financial 360</div>
              <p className="text-[11px] text-slate-400">Multi-installment fee ledgers, MTN MoMo reconciliation, and receipt generation.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-purple-400 font-bold text-xs uppercase mb-1">03. Student 360</div>
              <p className="text-[11px] text-slate-400">Permanent biometric records, discipline severity logs, and gate exit passes.</p>
            </div>
            <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div className="text-blue-400 font-bold text-xs uppercase mb-1">04. Parent 360</div>
              <p className="text-[11px] text-slate-400">Direct Multi-Carrier SMS alerts, fee inspection, and teacher chats.</p>
            </div>
          </div>
        </div>

        {/* Architectural Principles */}
        <div className="space-y-6">
          <div className="text-center">
            <h3 className="text-2xl font-bold text-white font-display">Core Architectural Principles</h3>
            <p className="text-xs text-slate-400 mt-1">Engineered for 10-year durability, enterprise security, and African bandwidth realities</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-blue-950 flex items-center justify-center text-blue-400 mb-4">
                <Cpu className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">High-Speed Local Caching</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Elimu360 eliminates continuous heavy real-time polling. All institutional data is loaded once in an optimized batch payload 
                and cached locally. Updates write through cleanly, and fresh state is loaded upon browser refresh.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-emerald-950 flex items-center justify-center text-emerald-400 mb-4">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Multi-Tenant Isolation</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every query and write operation is bound to the school&apos;s unique identifier. Super Admins provision institutions, 
                Directors govern their staff, and Bursars manage fees in strict isolation.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="w-10 h-10 rounded-xl bg-amber-950 flex items-center justify-center text-amber-400 mb-4">
                <Globe className="w-5 h-5" />
              </div>
              <h4 className="font-bold text-white text-base mb-2">Institutional Telecom Integration</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Integrated with high-speed SMS gateways for direct carrier routing across MTN, Airtel, and regional networks with instant delivery confirmation.
              </p>
            </div>
          </div>
        </div>

        {/* Version Control & Release Documentation */}
        <div className="p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-blue-400">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">System Version Control & Release</h3>
                <p className="text-xs text-blue-300 font-medium">Sovereign SIMS Release Engineering</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/80 border border-blue-700/60 text-xs font-bold text-blue-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Sovereign SIMS v2.0 (Active Release)</span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-slate-300 leading-relaxed">
              <strong>Sovereign SIMS v2.0</strong> designates the autonomous multi-tenant release architecture of Elimu360. 
              Under this version specification, each educational institution operates with sovereign authority over its academic records, 
              custom abbreviation codes, and staff provisioning hierarchies, backed by salted Bcrypt credentials and single-use activation tokens.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Version Build</div>
                <div className="text-sm font-extrabold text-white font-mono">v2.0.4-SOVEREIGN</div>
                <div className="text-[10px] text-emerald-400">Stable Production Build</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Security Core</div>
                <div className="text-sm font-extrabold text-amber-400 font-mono">BCRYPT-SALT-10</div>
                <div className="text-[10px] text-slate-400">Zero Plaintext Storage</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-1">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Tenant Protocol</div>
                <div className="text-sm font-extrabold text-blue-400 font-mono">DYNAMIC-ABBR-CODE</div>
                <div className="text-[10px] text-slate-400">Conflict-Free Collision Logic</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Credit */}
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-2">
          <div className="text-white font-bold text-sm">Elimu360 SIMS Enterprise Edition · Sovereign SIMS v2.0</div>
          <p className="text-xs text-slate-400">
            Engineered by <strong className="text-slate-200">The Palace Tech House</strong> · Rwanda & International Education Architecture
          </p>
        </div>

      </div>

      {/* Embedded Logo Studio Modal */}
      {internalStudioOpen && (
        <LogoExportStudioModal
          isOpen={internalStudioOpen}
          onClose={() => setInternalStudioOpen(false)}
        />
      )}

    </div>
  );
};
