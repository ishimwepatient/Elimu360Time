import React, { useState, useEffect } from 'react';
import { Bell, Flame, X, ArrowRight } from 'lucide-react';

interface ToastData {
  title: string;
  body: string;
  tab: string;
}

export const InAppNotificationToast: React.FC<{ onNavigateTab: (tab: any) => void }> = ({ onNavigateTab }) => {
  const [toast, setToast] = useState<ToastData | null>(null);

  const playChime = () => {
    try {
      if (typeof window !== 'undefined' && 'AudioContext' in window) {
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, audioCtx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      }
    } catch {
      // Audio not supported or blocked
    }
  };

  useEffect(() => {
    const handleToast = (e: any) => {
      if (e.detail) {
        setToast(e.detail);
        playChime();

        // Auto hide after 6 seconds
        const timer = setTimeout(() => {
          setToast(null);
        }, 6500);
        return () => clearTimeout(timer);
      }
    };

    window.addEventListener('elimu_inapp_toast', handleToast);
    return () => window.removeEventListener('elimu_inapp_toast', handleToast);
  }, []);

  if (!toast) return null;

  return (
    <div className="fixed top-24 right-4 sm:right-6 z-50 max-w-sm w-full bg-slate-900/95 dark:bg-slate-950/95 border-2 border-amber-400 text-white p-4 rounded-3xl shadow-2xl backdrop-blur-md animate-slide-in">
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl text-slate-950 shrink-0 shadow-md">
            <Flame className="w-5 h-5 fill-slate-950 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-wider text-amber-400">
              <span>Duolingo/Phoenix Reminder</span>
            </div>
            <h5 className="text-xs font-black text-white mt-0.5">
              {toast.title}
            </h5>
            <p className="text-[11px] text-slate-300 mt-1 leading-snug">
              {toast.body}
            </p>
          </div>
        </div>

        <button
          onClick={() => setToast(null)}
          className="p-1 rounded-full text-slate-400 hover:text-white transition cursor-pointer shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={() => {
            onNavigateTab(toast.tab);
            setToast(null);
          }}
          className="px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition flex items-center gap-1 shadow-md cursor-pointer"
        >
          <span>Fungura Ubu</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
