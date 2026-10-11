import React, { useEffect, useRef, useState } from 'react';
import { ExternalLink, Sparkles, TrendingUp, Award, Compass, BookOpen } from 'lucide-react';

interface EducationalAdProps {
  className?: string;
  badgeLabel?: string;
  variant?: 'banner' | 'card' | 'multi';
}

// Curated high-relevance fallback sponsor cards when ad network script is still loading or offline/slow network
const FALLBACK_SPONSORS = [
  {
    title: 'Cambridge & Oxford Teacher Training Diplomas',
    desc: 'Accredited international online diplomas and professional pedagogy certifications for African educators.',
    tag: 'Teacher Certifications',
    url: 'https://bellnewyork.org/21/fd1131f987b910e1fd08e29a38d84c85'
  },
  {
    title: 'Global University Scholarships & Grant Programs',
    desc: 'Fully-funded master’s and PhD programs open for educators, STEM researchers, and curriculum innovators.',
    tag: 'Academic Grants',
    url: 'https://accountut.com/1/2b6844eb3c2d84e42e2abfd50d951de8'
  },
  {
    title: 'Classroom Tech & High-Speed School Internet Deals',
    desc: 'Low-cost school projectors, interactive tablets, and subsidized educational connectivity.',
    tag: 'EdTech Tools',
    url: 'https://bellnewyork.org/14/4a0007dc4f19a6c1c1b7a5cfca2c473c'
  },
  {
    title: 'Online STEM Teaching Kits & Interactive Simulators',
    desc: 'Physics, Chemistry, and Mathematics digital laboratory kits aligned with Competency-Based Curriculums.',
    tag: 'STEM Resources',
    url: 'https://bellnewyork.org/21/fd1131f987b910e1fd08e29a38d84c85'
  },
  {
    title: 'Professional Educational Publishing & Authorship',
    desc: 'Publish your lesson notes, school textbooks, and academic research with global distribution royalty.',
    tag: 'Publishing',
    url: 'https://accountut.com/1/2b6844eb3c2d84e42e2abfd50d951de8'
  }
];

export const AdsterraNativeBanner: React.FC<EducationalAdProps> = ({ 
  className = '',
  badgeLabel = 'Sponsored Educational & Career Opportunities',
  variant = 'banner'
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [offlineOrSlow, setOfflineOrSlow] = useState(!navigator.onLine);
  const containerId = 'container-fd1131f987b910e1fd08e29a38d84c85';

  useEffect(() => {
    const handleOnline = () => setOfflineOrSlow(false);
    const handleOffline = () => setOfflineOrSlow(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Dynamic injection of the native banner script
    const scriptSrc = 'https://bellnewyork.org/21/fd1131f987b910e1fd08e29a38d84c85';
    let script = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = scriptSrc;
      script.onload = () => setScriptLoaded(true);
      script.onerror = () => setOfflineOrSlow(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleInteraction = (targetUrl?: string) => {
    // Open destination in new window / trigger popunder naturally
    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className={`w-full my-6 overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-4 transition-all hover:border-slate-700 shadow-lg ${className}`}>
      {/* Top Header Label - Discrete and Professional */}
      <div className="flex items-center justify-between mb-3 px-1 border-b border-slate-800/60 pb-2">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            {badgeLabel}
          </span>
        </div>
        <span className="text-[10px] font-medium text-slate-500 bg-slate-800/80 px-2 py-0.5 rounded-full">
          Featured
        </span>
      </div>

      {/* Target Container for Network Native Unit */}
      <div className="min-h-[100px] relative overflow-hidden rounded-xl bg-slate-950/60 p-2">
        <div id={containerId} className="w-full flex justify-center items-center"></div>

        {/* Fallback Educational & Career Deals Grid: Guarantees 5 high-impact visual spots even on slow networks */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {FALLBACK_SPONSORS.map((sponsor, idx) => (
            <div
              key={idx}
              onClick={() => handleInteraction(sponsor.url)}
              className="group p-3 rounded-xl bg-slate-900/90 border border-slate-800/90 hover:border-amber-500/50 hover:bg-slate-800/80 transition-all cursor-pointer flex flex-col justify-between text-left relative overflow-hidden"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase tracking-wider text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                    {sponsor.tag}
                  </span>
                  <ExternalLink className="w-3 h-3 text-slate-500 group-hover:text-amber-400 transition" />
                </div>
                <h4 className="text-xs font-bold text-slate-200 group-hover:text-white line-clamp-2 leading-snug">
                  {sponsor.title}
                </h4>
                <p className="text-[10px] text-slate-400 line-clamp-2 leading-normal">
                  {sponsor.desc}
                </p>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px] font-bold text-sky-400 group-hover:text-sky-300">
                <span>Explore Offer</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
