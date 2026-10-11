import React, { useState } from 'react';
import { Download, Smartphone, X, Sparkles, CheckCircle2, ShieldCheck, Share, PlusSquare } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallModal: React.FC = () => {
  const { isInstalled, isIOS, triggerInstall, showAutoModal, dismissModal, isInstallable } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled || !showAutoModal) {
    return null;
  }

  const handleInstallClick = () => {
    if (isIOS) {
      setShowIOSGuide(true);
    } else {
      triggerInstall();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 relative overflow-hidden">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -translate-y-24 translate-x-24"></div>

        {/* Close Button */}
        <button
          onClick={dismissModal}
          className="absolute top-4 right-4 p-2 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          title="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Smartphone className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 text-[10px] font-bold uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Quick 1-Tap Installation
            </span>
            <h3 className="text-xl font-extrabold text-white font-display">
              Install Elimu360 App on Your Device
            </h3>
            <p className="text-xs text-slate-300">
              Get 100% offline access to REB lesson planning & document conversion directly from your home screen.
            </p>
          </div>
        </div>

        {/* Value Proposition List */}
        <div className="space-y-2.5 bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 text-xs text-slate-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Works Offline</strong>: Plan lessons with zero or low internet connection</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Instant Launch</strong>: Opens in full screen with native app performance</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span><strong>Zero Storage Cost</strong>: Ultra-lightweight Progressive Web App (under 2MB)</span>
          </div>
        </div>

        {/* iOS Guided Instructions If iOS */}
        {showIOSGuide && (
          <div className="p-4 rounded-2xl bg-sky-950/40 border border-sky-500/30 text-xs text-slate-200 space-y-2 animate-fade-in">
            <p className="font-bold text-sky-400 flex items-center gap-1.5">
              <Share className="w-4 h-4" /> Instructions for Safari on iPhone / iPad:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-300">
              <li>Tap the <strong>Share</strong> button at the bottom of your Safari browser.</li>
              <li>Scroll down the menu and tap <strong>"Add to Home Screen"</strong>.</li>
              <li>Tap <strong>"Add"</strong> in the top right corner. Elimu360 is ready!</li>
            </ol>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={handleInstallClick}
            className="flex-1 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs transition shadow-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isIOS ? 'Show iOS Install Instructions' : 'Install App Now (100% Free)'}</span>
          </button>
          <button
            onClick={dismissModal}
            className="py-3.5 px-5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition cursor-pointer"
          >
            Later
          </button>
        </div>

      </div>
    </div>
  );
};
