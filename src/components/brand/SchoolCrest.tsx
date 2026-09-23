import React from 'react';
import { School } from '../../types';

interface SchoolCrestProps {
  school: School;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * High-fidelity School Crest / Emblem Component
 * Supports custom uploaded school logo (ImageKit / URL) with automatic fallback
 * to an authentic institutional shield crest with the school's abbreviation,
 * gold laurels, open book, and banner.
 */
export const SchoolCrest: React.FC<SchoolCrestProps> = ({
  school,
  size = 'md',
  className = ''
}) => {
  const [imageFailed, setImageFailed] = React.useState(false);

  const dimensionClass = {
    sm: 'w-12 h-12 text-xs',
    md: 'w-20 h-20 text-sm',
    lg: 'w-28 h-28 text-base',
    xl: 'w-36 h-36 text-lg'
  }[size];

  const hasValidCustomLogo = school.logo_url && 
    school.logo_url.trim().length > 0 && 
    !school.logo_url.includes('unsplash.com') && 
    !imageFailed;

  if (hasValidCustomLogo) {
    return (
      <div className={`relative flex items-center justify-center shrink-0 ${dimensionClass} ${className}`}>
        <img
          src={school.logo_url}
          alt={`${school.name} Logo`}
          referrerPolicy="no-referrer"
          onError={() => setImageFailed(true)}
          className="w-full h-full object-contain rounded-xl drop-shadow-md"
        />
      </div>
    );
  }

  // Authentic Institutional Crest
  const initials = school.code || (school.name ? school.name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase() : 'KSS');

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dimensionClass} ${className}`}>
      <svg 
        viewBox="0 0 160 160" 
        className="w-full h-full drop-shadow-md select-none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Shield with Gold Rim */}
        <path 
          d="M80 14 C120 14 138 28 138 60 C138 108 80 148 80 148 C80 148 22 108 22 60 C22 28 40 14 80 14 Z" 
          fill="#1e3a8a" 
          stroke="#ca8a04" 
          strokeWidth="5" 
        />
        
        {/* Inner Shield Lining */}
        <path 
          d="M80 22 C114 22 130 33 130 60 C130 100 80 138 80 138 C80 138 30 100 30 60 C30 33 46 22 80 22 Z" 
          fill="#0f172a" 
          stroke="#facc15" 
          strokeWidth="1.5" 
        />

        {/* Heraldic Crossed Lines / Chevron */}
        <path d="M40 76 L80 106 L120 76" stroke="#ca8a04" strokeWidth="2.5" fill="none" opacity="0.6" />

        {/* Open Academic Book at Top */}
        <g transform="translate(80, 50)">
          <path d="M-22 0 C-10 -4 0 0 0 0 C0 0 10 -4 22 0 L22 18 C10 14 0 18 0 18 C0 18 -10 14 -22 18 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
          <line x1="0" y1="0" x2="0" y2="18" stroke="#cbd5e1" strokeWidth="1.5" />
          <line x1="-18" y1="5" x2="-4" y2="3" stroke="#94a3b8" strokeWidth="1" />
          <line x1="-18" y1="10" x2="-4" y2="8" stroke="#94a3b8" strokeWidth="1" />
          <line x1="4" y1="3" x2="18" y2="5" stroke="#94a3b8" strokeWidth="1" />
          <line x1="4" y1="8" x2="18" y2="10" stroke="#94a3b8" strokeWidth="1" />
        </g>

        {/* Torch / Flame of Enlightenment */}
        <path d="M80 32 C77 36 76 39 80 43 C84 39 83 36 80 32 Z" fill="#ea580c" />
        <path d="M80 34 C78 37 78 39 80 41 C82 39 82 37 80 34 Z" fill="#facc15" />

        {/* Large School Initials in Shield Heart */}
        <text 
          x="80" 
          y="92" 
          textAnchor="middle" 
          fill="#ffffff" 
          fontSize="22" 
          fontWeight="900" 
          fontFamily="system-ui, sans-serif" 
          letterSpacing="1.5"
        >
          {initials}
        </text>

        {/* Star in Center Bottom */}
        <polygon 
          points="80,108 83,114 90,114 85,118 87,125 80,121 73,125 75,118 70,114 77,114" 
          fill="#facc15" 
        />

        {/* Ribbon Motto at Bottom */}
        <path 
          d="M32 140 Q80 155 128 140 L122 150 Q80 162 38 150 Z" 
          fill="#ca8a04" 
          stroke="#a16207" 
          strokeWidth="1" 
        />
        <text 
          x="80" 
          y="149" 
          textAnchor="middle" 
          fill="#0f172a" 
          fontSize="6.5" 
          fontWeight="900" 
          letterSpacing="0.8"
        >
          EXCELLENCE · DISCIPLINE
        </text>
      </svg>
    </div>
  );
};
