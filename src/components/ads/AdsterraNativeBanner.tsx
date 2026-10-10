import React, { useEffect, useRef } from 'react';

interface AdsterraNativeBannerProps {
  className?: string;
  badgeLabel?: string;
}

/**
 * AdsterraNativeBanner Component
 * 
 * Embeds Adsterra Native Banner Unit:
 * Script: https://bellnewyork.org/21/fd1131f987b910e1fd08e29a38d84c85
 * Container: container-fd1131f987b910e1fd08e29a38d84c85
 * 
 * Styled with non-intrusive container formatting, subtle sponsored badge,
 * and seamless fallback so user experience remains clean and professional.
 */
export const AdsterraNativeBanner: React.FC<AdsterraNativeBannerProps> = ({ 
  className = '',
  badgeLabel = 'Sponsored Educational & Career Resources' 
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only load once per container if script is not already injected
    const scriptSrc = 'https://bellnewyork.org/21/fd1131f987b910e1fd08e29a38d84c85';
    
    // Check if script already exists globally
    const existingScript = document.querySelector(`script[src="${scriptSrc}"]`);
    if (!existingScript) {
      const script = document.createElement('script');
      script.async = true;
      script.setAttribute('data-cfasync', 'false');
      script.src = scriptSrc;
      document.body.appendChild(script);
    }
  }, []);

  return (
    <div className={`w-full my-6 overflow-hidden rounded-2xl bg-slate-900/60 border border-slate-800/80 p-3 sm:p-4 text-center transition hover:border-slate-700/80 ${className}`}>
      {/* Subtle, ethical transparency label */}
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
          {badgeLabel}
        </span>
        <span className="text-[10px] text-slate-600">
          Adsterra Native
        </span>
      </div>

      {/* Target Container required by Adsterra Native Banner */}
      <div className="min-h-[90px] flex items-center justify-center relative overflow-hidden rounded-xl bg-slate-950/40">
        <div id="container-fd1131f987b910e1fd08e29a38d84c85" className="w-full flex justify-center items-center"></div>
      </div>
    </div>
  );
};
