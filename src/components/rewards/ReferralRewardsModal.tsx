import React, { useState } from 'react';
import { 
  X, 
  Share2, 
  Copy, 
  Check, 
  Sparkles, 
  Zap, 
  Gift, 
  Award, 
  CheckCircle2, 
  Layers, 
  FileCheck, 
  ShieldCheck, 
  ArrowRight,
  ExternalLink
} from 'lucide-react';
import { useElimu } from '../../context/ElimuContext';

export const ReferralRewardsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { currentUser, shareAndUnlockPerks, isPerkUnlocked } = useElimu();
  const [copied, setCopied] = useState(false);
  const [sharing, setSharing] = useState(false);

  if (!isOpen) return null;

  const referralCode = currentUser?.referralCode || 'ELIMU360_TEACHER';
  const shareUrl = `${window.location.origin}/?ref=${referralCode}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      // Automatically unlock perks upon sharing link
      await shareAndUnlockPerks('link_copy');
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      console.error(e);
    }
  };

  const handleShareWhatsApp = async () => {
    setSharing(true);
    const text = encodeURIComponent(
      `📚 Hello fellow educators! I use Elimu360 Open System to generate official REB Competency-Based Curriculum (CBC) lesson plans for free in seconds! Create yours here: ${shareUrl}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
    await shareAndUnlockPerks('whatsapp_share');
    setSharing(false);
  };

  const handleShareSocial = async (platform: string) => {
    setSharing(true);
    let url = '';
    const text = encodeURIComponent('Elimu360 Open System — Free AI Lesson Plan Generator for Teachers & REB Curriculum');
    if (platform === 'twitter') {
      url = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'facebook') {
      url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    } else if (platform === 'telegram') {
      url = `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${text}`;
    }
    if (url) window.open(url, '_blank');
    await shareAndUnlockPerks(`${platform}_share`);
    setSharing(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-100 overflow-hidden my-auto">
        
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="space-y-3 mb-6">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <Gift className="w-4 h-4 text-amber-400" />
            <span>Elimu360 Ambassador & Sharing Rewards Program</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
            Share Link & Unlock <span className="text-amber-400">Extra Sovereign Services</span>
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Invite fellow teachers to Elimu360 Open System! Every time you share your link, you instantly unlock premium educator privileges for free.
          </p>
        </div>

        {/* Share Link Box */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 mb-6">
          <label className="block text-xs font-bold text-amber-300 flex items-center justify-between">
            <span>Your Personal Sharing Referral Link</span>
            <span className="text-[10px] text-slate-400 font-normal">Shares: {currentUser?.sharesCount || 0}</span>
          </label>

          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-amber-200 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopyLink}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shrink-0 shadow-md"
            >
              {copied ? <Check className="w-4 h-4 text-slate-950" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Link Copied & Perk Unlocked!' : 'Copy Link'}</span>
            </button>
          </div>

          {/* Social Share Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
            <button
              onClick={handleShareWhatsApp}
              className="flex-1 py-2 px-3 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 border border-emerald-500/40 text-emerald-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            <button
              onClick={() => handleShareSocial('telegram')}
              className="py-2 px-3 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/40 border border-cyan-500/40 text-cyan-300 font-bold text-[11px] flex items-center gap-1 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Telegram</span>
            </button>

            <button
              onClick={() => handleShareSocial('twitter')}
              className="py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-[11px] flex items-center gap-1 transition"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>X / Twitter</span>
            </button>
          </div>
        </div>

        {/* Perks Grid */}
        <div className="space-y-3">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Extra Services & Rewards Unlocked by Sharing</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            
            {/* Perk 1 */}
            <div className={`p-3.5 rounded-2xl border transition ${
              isPerkUnlocked('vipBatchingUnlocked') 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-amber-400" /> VIP Unlimited Batching
                </span>
                {isPerkUnlocked('vipBatchingUnlocked') ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Share to Unlock</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Generate 10+ lesson plans simultaneously in a single click instead of 3.
              </p>
            </div>

            {/* Perk 2 */}
            <div className={`p-3.5 rounded-2xl border transition ${
              isPerkUnlocked('customBrandingUnlocked') 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-amber-400" /> Custom School Header
                </span>
                {isPerkUnlocked('customBrandingUnlocked') ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Share to Unlock</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Add custom school crests, inspectorate seal & signature stamps on exported PDFs.
              </p>
            </div>

            {/* Perk 3 */}
            <div className={`p-3.5 rounded-2xl border transition ${
              isPerkUnlocked('schemeOfWorkUnlocked') 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" /> Term Scheme of Work
                </span>
                {isPerkUnlocked('schemeOfWorkUnlocked') ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Share to Unlock</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Auto-generate full 12-week Term Schemes of Work aligned with REB syllabi.
              </p>
            </div>

            {/* Perk 4 */}
            <div className={`p-3.5 rounded-2xl border transition ${
              isPerkUnlocked('ambassadorBadge') 
                ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-200' 
                : 'bg-slate-950 border-slate-800 text-slate-300'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-400" /> Sovereign Ambassador Badge
                </span>
                {isPerkUnlocked('ambassadorBadge') ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> UNLOCKED
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-500">Share to Unlock</span>
                )}
              </div>
              <p className="text-[11px] text-slate-400 leading-normal">
                Official Ambassador badge displayed on your portal profile & PDF documents.
              </p>
            </div>

          </div>
        </div>

        {/* Footer Action */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
          >
            Start Using Unlocked Features
          </button>
        </div>

      </div>
    </div>
  );
};
