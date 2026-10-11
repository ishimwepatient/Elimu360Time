import React, { useState } from 'react';
import { MessageCircle, Phone, X, Check, Sparkles, Send, Copy, Clock, ShieldCheck, Heart } from 'lucide-react';

export const WhatsAppHelpWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const phoneNumber = '250792612139';
  const displayPhone = '+250 792 612 139';

  const quickQuestions = [
    { label: '📝 REB CBC Lesson Plans', text: 'Hello Elimu360, I need help generating Competency-Based Lesson Plans for my class.' },
    { label: '📄 PDF / Word Converter', text: 'Hello Elimu360, I have a question regarding formatting document conversion.' },
    { label: '📚 Term Scheme of Work', text: 'Hello, could you assist me with curriculum references and schemes of work?' },
    { label: '💡 Teacher Pedagogical Tips', text: 'Hello Palace Tech House, I want advice on differentiated learning activities.' }
  ];

  const handleOpenWhatsApp = (customText?: string) => {
    const text = customText || 'Hello Elimu360 & The Palace Tech House, I need assistance with my lesson plans and teaching tools.';
    const encoded = encodeURIComponent(text);
    const url = `https://wa.me/${phoneNumber}?text=${encoded}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(displayPhone);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end pointer-events-auto">
      
      {/* Expanded Support Card (Chinese Super-App VIP Customer Service Drawer) */}
      {isOpen && (
        <div 
          className="mb-3 w-80 sm:w-96 bg-slate-900 border border-emerald-500/40 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 text-left"
          onClick={e => e.stopPropagation()}
        >
          {/* Card Top Banner */}
          <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 p-4 text-white relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-black/20 hover:bg-black/30 text-white transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 text-white shadow-md">
                <MessageCircle className="w-6 h-6 fill-white" />
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                    The Palace Tech House
                  </span>
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-200"></span>
                  </span>
                </div>
                <h3 className="font-extrabold text-sm sm:text-base leading-tight mt-0.5">
                  24/7 Teacher WhatsApp Help
                </h3>
                <p className="text-[11px] text-emerald-100 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Live Response: Under 2 mins
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-4 space-y-3.5 bg-slate-900">
            <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Direct Line / WhatsApp:</span>
                <button
                  onClick={handleCopyPhone}
                  className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied!' : 'Copy Number'}</span>
                </button>
              </div>
              <div className="text-base font-black text-white tracking-wide flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400" />
                <span>{displayPhone}</span>
              </div>
              <p className="text-[10px] text-slate-400">
                Dedicated support for Rwandan and East African teachers using Elimu360.
              </p>
            </div>

            {/* Quick Prompt Chips */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Tap to Ask Directly on WhatsApp:
              </span>
              <div className="grid grid-cols-2 gap-2">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleOpenWhatsApp(q.text)}
                    className="p-2.5 rounded-xl bg-slate-800/90 hover:bg-emerald-950/60 hover:border-emerald-500/50 border border-slate-700/80 text-left text-[11px] font-bold text-slate-200 hover:text-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <span>{q.label}</span>
                    <span className="text-[9px] text-emerald-400 font-normal mt-1">Tap to Send →</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              onClick={() => handleOpenWhatsApp()}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase tracking-wider shadow-xl transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-slate-950" />
              <span>Start WhatsApp Chat (+250 792 612 139)</span>
            </button>
          </div>

        </div>
      )}

      {/* Floating Trigger Button (Always visible on all pages) */}
      <div className="relative group">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2.5 transition-all duration-300 active:scale-95 cursor-pointer border-2 border-emerald-300/40"
          title="24/7 Teacher WhatsApp Help: +250 792 612 139"
        >
          {/* Live Pulsing Dot */}
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
          </span>

          <MessageCircle className="w-5 h-5 fill-white" />
          <span className="hidden sm:inline font-black tracking-wide">
            WhatsApp Help: 250792612139
          </span>
          <span className="sm:hidden font-black">Help</span>
        </button>

        {/* Floating Tooltip Pill */}
        {!isOpen && (
          <div className="absolute bottom-full right-0 mb-2 hidden group-hover:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-[11px] font-bold whitespace-nowrap shadow-xl pointer-events-none">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>Chat 24/7 with Palace Tech House (+250 792 612 139)</span>
          </div>
        )}
      </div>

    </div>
  );
};
