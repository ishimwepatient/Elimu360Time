import React from 'react';
import { ExternalLink, Sparkles, Award, BookOpen, GraduationCap, Laptop, Compass } from 'lucide-react';

export interface TacticalAdData {
  id: number;
  badge: string;
  badgeColor: string;
  title: string;
  desc: string;
  actionText: string;
  icon: 'award' | 'book' | 'cap' | 'laptop' | 'compass';
  destinationUrl: string;
}

export const TACTICAL_ADS: TacticalAdData[] = [
  {
    id: 0,
    badge: 'Teacher Fellowship',
    badgeColor: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    title: 'Cambridge & Oxford Online Pedagogical Diplomas',
    desc: 'Accredited international continuing education certifications and pedagogy workshops open for African educators.',
    actionText: 'View Fellowships',
    icon: 'cap',
    destinationUrl: 'https://www.coursera.org/search?query=teacher%20training'
  },
  {
    id: 1,
    badge: 'Academic Grant',
    badgeColor: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
    title: 'Global Classroom Tech & STEM Curriculum Grants',
    desc: 'Apply for classroom technology subsidies, interactive digital lab licenses, and teaching equipment for schools.',
    actionText: 'Explore Grants',
    icon: 'award',
    destinationUrl: 'https://www.edx.org/search?q=curriculum+development'
  },
  {
    id: 2,
    badge: 'EdTech Tools',
    badgeColor: 'text-sky-400 bg-sky-500/10 border-sky-500/20',
    title: 'Cloud Document Formatting & Classroom Utilities',
    desc: 'High-speed cloud conversions, AI-assisted grading assistants, and school digital administration software.',
    actionText: 'Access Utilities',
    icon: 'laptop',
    destinationUrl: 'https://www.unesco.org/en/education'
  },
  {
    id: 3,
    badge: 'Teaching Resources',
    badgeColor: 'text-purple-400 bg-purple-500/10 border-purple-500/20',
    title: 'Digital STEM Interactive Simulators & CBC Kits',
    desc: 'Interactive virtual science labs, mathematics graphing modules, and CBC-compliant practical activities.',
    actionText: 'Explore Kits',
    icon: 'compass',
    destinationUrl: 'https://phet.colorado.edu/'
  },
  {
    id: 4,
    badge: 'Publishing Royalty',
    badgeColor: 'text-amber-300 bg-amber-500/10 border-amber-500/20',
    title: 'Educational Textbook Publishing & Author Royalty',
    desc: 'Publish your pedagogical lesson notes, subject guides, and academic work with sovereign international distribution.',
    actionText: 'Publish Notes',
    icon: 'book',
    destinationUrl: 'https://www.openstax.org/'
  }
];

interface TacticalAdCardProps {
  slotIndex: number; // 0 to 4
  className?: string;
  compact?: boolean;
}

export const TacticalAdCard: React.FC<TacticalAdCardProps> = ({ 
  slotIndex, 
  className = '',
  compact = false
}) => {
  const ad = TACTICAL_ADS[slotIndex % TACTICAL_ADS.length];

  const handleAdClick = () => {
    // 1. Trigger document interaction so Popunder triggers naturally upon user click gesture
    try {
      const clickEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true
      });
      document.body.dispatchEvent(clickEvent);
    } catch {
      // Ignored
    }

    // 2. Open high-value educational landing destination (never opens raw JS script strings!)
    if (ad.destinationUrl) {
      window.open(ad.destinationUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const renderIcon = () => {
    switch (ad.icon) {
      case 'cap': return <GraduationCap className="w-4 h-4 text-amber-400" />;
      case 'award': return <Award className="w-4 h-4 text-emerald-400" />;
      case 'laptop': return <Laptop className="w-4 h-4 text-sky-400" />;
      case 'compass': return <Compass className="w-4 h-4 text-purple-400" />;
      default: return <BookOpen className="w-4 h-4 text-amber-400" />;
    }
  };

  if (compact) {
    return (
      <div 
        onClick={handleAdClick}
        className={`group p-3 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all cursor-pointer shadow-md flex items-center justify-between gap-3 ${className}`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
            {renderIcon()}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className={`text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border ${ad.badgeColor}`}>
                {ad.badge}
              </span>
              <span className="text-[9px] font-semibold text-slate-500">Sponsored</span>
            </div>
            <h4 className="text-xs font-bold text-slate-200 group-hover:text-amber-400 truncate mt-0.5">
              {ad.title}
            </h4>
          </div>
        </div>

        <button 
          type="button"
          className="shrink-0 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center gap-1 transition pointer-events-none"
        >
          <span>{ad.actionText}</span>
          <ExternalLink className="w-2.5 h-2.5" />
        </button>
      </div>
    );
  }

  return (
    <div 
      onClick={handleAdClick}
      className={`group p-4 rounded-2xl bg-gradient-to-br from-slate-900/95 via-slate-900/80 to-slate-950 border border-slate-800/90 hover:border-amber-500/50 hover:shadow-amber-500/5 transition-all duration-300 cursor-pointer shadow-lg relative overflow-hidden ${className}`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-amber-500/10 transition-colors"></div>

      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-slate-800/90 border border-slate-700/80 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform">
            {renderIcon()}
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${ad.badgeColor}`}>
                {ad.badge}
              </span>
              <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Sponsored Educational Partner
              </span>
            </div>

            <h4 className="text-xs sm:text-sm font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
              {ad.title}
            </h4>
            <p className="text-[11px] text-slate-400 max-w-xl leading-relaxed">
              {ad.desc}
            </p>
          </div>
        </div>

        <div className="w-full sm:w-auto shrink-0 flex items-center justify-end">
          <div className="px-4 py-2 rounded-xl bg-slate-800/90 group-hover:bg-amber-500 group-hover:text-slate-950 text-slate-200 border border-slate-700 group-hover:border-amber-400 font-bold text-xs flex items-center gap-1.5 transition-all shadow-md">
            <span>{ad.actionText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};
