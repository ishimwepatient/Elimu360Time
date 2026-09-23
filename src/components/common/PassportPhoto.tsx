import React, { useState } from 'react';

interface PassportPhotoProps {
  src?: string | null;
  alt?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'custom';
  className?: string;
  shape?: 'rounded' | 'square' | 'circle';
  border?: boolean;
}

/**
 * Standard Institutional Passport Photo Component
 * Displays the student or staff member's official photograph.
 * If no photo exists (or an external placeholder was used), it renders
 * a crisp, official human silhouette bust (neutral biometric passport figure)
 * on a standard clean neutral background, strictly avoiding random photos or cartoon faces.
 */
export const PassportPhoto: React.FC<PassportPhotoProps> = ({
  src,
  alt = 'Passport Photo',
  size = 'md',
  className = '',
  shape = 'rounded',
  border = true
}) => {
  const [imageError, setImageError] = useState(false);

  // Filter out any unwanted external stock photo placeholders
  const isValidPhoto = Boolean(
    src &&
    typeof src === 'string' &&
    src.trim().length > 0 &&
    !src.includes('unsplash.com') &&
    !src.includes('placeholder.com') &&
    !imageError
  );

  const sizeStyles: Record<string, string> = {
    xs: 'w-7 h-8',
    sm: 'w-9 h-11',
    md: 'w-12 h-15',
    lg: 'w-16 h-20',
    xl: 'w-24 h-30',
    '2xl': 'w-32 h-40',
    custom: ''
  };

  const shapeStyles = {
    rounded: 'rounded-md',
    square: 'rounded-none',
    circle: 'rounded-full aspect-square'
  }[shape];

  const borderClass = border ? 'border border-slate-300 shadow-xs' : '';

  if (isValidPhoto && src) {
    return (
      <div 
        className={`relative overflow-hidden shrink-0 bg-slate-100 ${sizeStyles[size]} ${shapeStyles} ${borderClass} ${className}`}
        title={alt}
      >
        <img
          src={src}
          alt={alt}
          referrerPolicy="no-referrer"
          onError={() => setImageError(true)}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
      </div>
    );
  }

  // Official Biometric Passport Silhouette (Human Figure)
  return (
    <div 
      className={`relative overflow-hidden shrink-0 flex items-center justify-center bg-slate-100 text-slate-400 select-none ${sizeStyles[size]} ${shapeStyles} ${borderClass} ${className}`}
      title={`${alt} (No photo uploaded - Biometric figure)`}
      aria-label={`${alt} biometric silhouette placeholder`}
    >
      <svg 
        viewBox="0 0 100 125" 
        className="w-full h-full text-slate-300 fill-current"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Subtle background gradient to simulate passport background */}
        <rect width="100" height="125" fill="#f1f5f9" />
        
        {/* Human Head Contour */}
        <circle cx="50" cy="42" r="21" fill="#cbd5e1" />
        
        {/* Human Neck */}
        <path d="M43 60 L57 60 L58 72 L42 72 Z" fill="#94a3b8" />
        
        {/* Human Shoulders and Torso Contour */}
        <path 
          d="M18 116 C18 90 30 74 44 72 C46 72 54 72 56 72 C70 74 82 90 82 116 L18 116 Z" 
          fill="#94a3b8" 
        />
        
        {/* Subtle collar/suit line for formal passport silhouette */}
        <path 
          d="M44 72 L50 86 L56 72" 
          stroke="#f1f5f9" 
          strokeWidth="2.5" 
          fill="none" 
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};
