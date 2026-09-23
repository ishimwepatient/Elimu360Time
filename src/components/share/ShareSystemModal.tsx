import React, { useState } from 'react';
import { X, Share2, Copy, Check, Heart, MessageSquare, Sparkles, Globe, Users } from 'lucide-react';

interface ShareSystemModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ShareSystemModal: React.FC<ShareSystemModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;
  const shareText = `🌟 Discover Elimu360 Open System: Free AI REB Lesson Plan Generator & Universal Document Converter for Educators! Check it out here: ${appUrl}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch {
      // Fallback
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Elimu360 Open System for Educators',
          text: 'Free REB CBC AI Lesson Plan Generator & Document Converter for Teachers',
          url: appUrl
        });
      } catch {
        // Share cancelled or unavailable
      }
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden space-y-6">
        
        {/* Decorative Background Mesh */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Heart className="w-3.5 h-3.5 fill-emerald-400" /> Share Educator Empowerment
          </div>

          <h2 className="text-2xl font-extrabold text-white font-display">
            Empower Fellow Teachers
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
            Elimu360 Open System is free, sovereign, and open for all educators. Share this tool with your school colleagues, staffroom WhatsApp groups, and teacher networks to help everyone save hours on lesson planning!
          </p>
        </div>

        {/* Impact Highlights */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4" /> Save 5+ Hours
            </span>
            <p className="text-slate-400 text-[11px]">Instant inspectorate-ready REB CBC lesson plans</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-emerald-400 flex items-center gap-1.5">
              <Globe className="w-4 h-4" /> 100% Free
            </span>
            <p className="text-slate-400 text-[11px]">Open access for all schools & educators</p>
          </div>
        </div>

        {/* Share Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleNativeShare}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
          >
            <Share2 className="w-5 h-5" />
            <span>Share via WhatsApp / Messaging Apps</span>
          </button>

          <div className="relative flex items-center">
            <input
              type="text"
              readOnly
              value={appUrl}
              className="w-full pl-3.5 pr-24 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="absolute right-1.5 px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-slate-950" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  <span>Copy Link</span>
                </>
              )}
            </button>
          </div>

          {copied && (
            <p className="text-center text-xs text-emerald-400 font-medium animate-fade-in">
              ✓ Link copied to clipboard! Share it in your teachers' staffroom group.
            </p>
          )}
        </div>

        {/* Footer note */}
        <div className="text-center pt-2 border-t border-slate-800 text-[11px] text-slate-500">
          Together we strengthen education and teacher well-being across Rwanda & Africa.
        </div>

      </div>
    </div>
  );
};
