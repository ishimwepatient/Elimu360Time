import React from 'react';

interface RwandaCoatOfArmsProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Official Republic of Rwanda Coat of Arms (Ikimenyetso cya Repubulika y'u Rwanda)
 * Renders the national emblem with Agaseke (traditional basket), coffee branch,
 * sorghum plant, cogwheel, sun rays, and national ribbon:
 * "REPUBULIKA Y'U RWANDA - UBUMWE, UMURIMO, GUKUNDA IGIHUGU"
 */
export const RwandaCoatOfArms: React.FC<RwandaCoatOfArmsProps> = ({ 
  className = '', 
  size = 'md' 
}) => {
  const sizePixels = {
    sm: 48,
    md: 68,
    lg: 88,
    xl: 110
  }[size];

  return (
    <div 
      className={`inline-flex flex-col items-center justify-center ${className}`}
      style={{ width: sizePixels, height: sizePixels }}
      title="Republic of Rwanda · Ministry of Education (MINEDUC)"
    >
      <svg 
        viewBox="0 0 160 160" 
        className="w-full h-full drop-shadow-sm select-none"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer Circular Ring (Green and Blue ring) */}
        <circle cx="80" cy="80" r="74" stroke="#166534" strokeWidth="4" fill="#f0fdf4" />
        <circle cx="80" cy="80" r="69" stroke="#0284c7" strokeWidth="2.5" fill="#ffffff" />
        
        {/* Top Sun Rays (Golden Sun of Rwanda) */}
        <g id="sun-rays" stroke="#eab308" strokeWidth="2.5" strokeLinecap="round">
          <line x1="80" y1="20" x2="80" y2="34" />
          <line x1="68" y1="23" x2="72" y2="36" />
          <line x1="92" y1="23" x2="88" y2="36" />
          <line x1="57" y1="30" x2="65" y2="40" />
          <line x1="103" y1="30" x2="95" y2="40" />
          <line x1="49" y1="40" x2="60" y2="46" />
          <line x1="111" y1="40" x2="100" y2="46" />
        </g>
        <circle cx="80" cy="40" r="8" fill="#eab308" />

        {/* Sorghum & Coffee Foliage Branches on flanks */}
        {/* Left: Sorghum branch */}
        <path 
          d="M42 110 C34 90 38 65 52 50 C46 62 48 85 54 100" 
          stroke="#15803d" 
          strokeWidth="3" 
          strokeLinecap="round" 
          fill="#86efac" 
        />
        <circle cx="38" cy="70" r="3" fill="#ca8a04" />
        <circle cx="44" cy="60" r="3" fill="#ca8a04" />
        <circle cx="41" cy="80" r="3" fill="#ca8a04" />

        {/* Right: Coffee branch with red berries */}
        <path 
          d="M118 110 C126 90 122 65 108 50 C114 62 112 85 106 100" 
          stroke="#15803d" 
          strokeWidth="3" 
          strokeLinecap="round" 
          fill="#86efac" 
        />
        <circle cx="121" cy="72" r="3" fill="#dc2626" />
        <circle cx="116" cy="62" r="3" fill="#dc2626" />
        <circle cx="118" cy="82" r="3" fill="#dc2626" />

        {/* Central Agaseke Basket (Traditional Peace & Prosperity Basket) */}
        {/* Basket Lid (Conical pointed roof) */}
        <path 
          d="M80 50 L68 76 L92 76 Z" 
          fill="#fef08a" 
          stroke="#854d0e" 
          strokeWidth="2" 
        />
        <line x1="80" y1="50" x2="80" y2="76" stroke="#854d0e" strokeWidth="1.5" />
        <path d="M74 63 L86 63" stroke="#854d0e" strokeWidth="1.5" />
        <path d="M70 70 L90 70" stroke="#854d0e" strokeWidth="1.5" />

        {/* Basket Body */}
        <path 
          d="M68 76 L71 106 C71 110 89 110 89 106 L92 76 Z" 
          fill="#fef9c3" 
          stroke="#854d0e" 
          strokeWidth="2" 
        />
        {/* Traditional Zig-Zag weaving patterns */}
        <path 
          d="M70 82 L75 88 L80 82 L85 88 L90 82" 
          stroke="#b45309" 
          strokeWidth="1.8" 
          fill="none" 
        />
        <path 
          d="M71 94 L76 100 L80 94 L85 100 L89 94" 
          stroke="#1e3a8a" 
          strokeWidth="1.8" 
          fill="none" 
        />

        {/* Bottom Industrial Cogwheel (Development & Hard Work) */}
        <g transform="translate(80, 118)">
          <circle cx="0" cy="0" r="14" fill="#64748b" stroke="#334155" strokeWidth="2" />
          <circle cx="0" cy="0" r="6" fill="#ffffff" stroke="#334155" strokeWidth="1.5" />
          {/* Cog teeth */}
          <rect x="-3" y="-17" width="6" height="4" fill="#334155" />
          <rect x="-3" y="13" width="6" height="4" fill="#334155" />
          <rect x="-17" y="-3" width="4" height="6" fill="#334155" />
          <rect x="13" y="-3" width="4" height="6" fill="#334155" />
          <rect x="-12" y="-12" width="5" height="5" fill="#334155" transform="rotate(45)" />
          <rect x="7" y="-12" width="5" height="5" fill="#334155" transform="rotate(45)" />
          <rect x="-12" y="7" width="5" height="5" fill="#334155" transform="rotate(45)" />
          <rect x="7" y="7" width="5" height="5" fill="#334155" transform="rotate(45)" />
        </g>

        {/* Outer Banner Ribbon (Green Knot at bottom) */}
        <path 
          d="M48 135 C64 142 96 142 112 135 C104 148 56 148 48 135 Z" 
          fill="#15803d" 
          stroke="#166534" 
          strokeWidth="1.5" 
        />
        {/* National Motto Text */}
        <path id="topCurve" d="M 28 80 A 52 52 0 0 1 132 80" fill="none" />
        <text fontSize="7" fontWeight="900" fill="#15803d" letterSpacing="0.8">
          <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
            REPUBULIKA Y'U RWANDA
          </textPath>
        </text>

        <path id="bottomCurve" d="M 26 84 A 54 54 0 0 0 134 84" fill="none" />
        <text fontSize="5.5" fontWeight="800" fill="#1e40af" letterSpacing="0.4">
          <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
            UBUMWE - UMURIMO - GUKUNDA IGIHUGU
          </textPath>
        </text>
      </svg>
    </div>
  );
};
