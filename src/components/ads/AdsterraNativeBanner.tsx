import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';
import { TacticalAdCard } from './TacticalAdCard';

interface EducationalAdProps {
  className?: string;
  badgeLabel?: string;
  slotIndex?: number;
}

export const AdsterraNativeBanner: React.FC<EducationalAdProps> = ({ 
  className = '',
  badgeLabel = 'Sponsored Educational & Career Opportunities',
  slotIndex = 3
}) => {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const containerId = 'container-fd1131f987b910e1fd08e29a38d84c85';

  useEffect(() => {
    // Dynamic injection of the native banner script
    const scriptSrc = 'https://bellnewyork.org/21/fd1131f987b910e1fd08e29a38d84c85';
    let script = document.querySelector(`script[src="${scriptSrc}"]`) as HTMLScriptElement;
    
    if (!script) {
      script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = scriptSrc;
      script.onload = () => setScriptLoaded(true);
      document.body.appendChild(script);
    } else {
      setScriptLoaded(true);
    }
  }, []);

  return (
    <section className={`w-full my-6 overflow-hidden rounded-2xl bg-slate-900/80 border border-slate-800 p-4 transition-all hover:border-slate-700 shadow-lg ${className}`}>
      {/* Discrete Header Label */}
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
      <div className="min-h-[70px] relative overflow-hidden rounded-xl bg-slate-950/60 p-2">
        <div id={containerId} className="w-full flex justify-center items-center"></div>

        {/* Separated Single Tactical Ad Placement: Clean, interactive, loads ad destination without raw code strings */}
        <div className="mt-2">
          <TacticalAdCard slotIndex={slotIndex} />
        </div>
      </div>
    </section>
  );
};
