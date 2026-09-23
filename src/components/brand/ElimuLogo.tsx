import React, { useRef, useState } from 'react';
import { Download, Sparkles, Check, Copy, ExternalLink, ShieldCheck, X } from 'lucide-react';

interface ElimuLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  variant?: 'full' | 'icon-only' | 'badge';
  theme?: 'dark' | 'light' | 'gold';
  className?: string;
  subtitle?: string;
  showMeaning?: boolean;
}

export const ElimuLogo: React.FC<ElimuLogoProps> = ({
  size = 'md',
  variant = 'full',
  theme = 'dark',
  className = '',
  subtitle = 'School Information Management System',
}) => {
  const getDimensions = () => {
    switch (size) {
      case 'xs': return { iconSize: 20, fontSize: 'text-sm', subSize: 'text-[8px]', ringSize: 24 };
      case 'sm': return { iconSize: 28, fontSize: 'text-base', subSize: 'text-[9px]', ringSize: 32 };
      case 'md': return { iconSize: 36, fontSize: 'text-xl', subSize: 'text-[10px]', ringSize: 42 };
      case 'lg': return { iconSize: 48, fontSize: 'text-2xl', subSize: 'text-xs', ringSize: 56 };
      case 'xl': return { iconSize: 64, fontSize: 'text-4xl', subSize: 'text-sm', ringSize: 76 };
      case 'hero': return { iconSize: 96, fontSize: 'text-5xl', subSize: 'text-base', ringSize: 112 };
      default: return { iconSize: 36, fontSize: 'text-xl', subSize: 'text-[10px]', ringSize: 42 };
    }
  };

  const dim = getDimensions();

  // Pure SVG Emblem containing 360-degree orbital compass + academic crest & torch
  const LogoEmblem = () => (
    <svg 
      width={dim.ringSize} 
      height={dim.ringSize} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0 transition-transform duration-300 group-hover:scale-105"
    >
      <defs>
        {/* Academic Royal Blue Gradient */}
        <linearGradient id="elimuBlueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="50%" stopColor="#2563EB" />
          <stop offset="100%" stopColor="#1D4ED8" />
        </linearGradient>

        {/* 360 Gold Radial Gradient */}
        <linearGradient id="elimuGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FDE047" />
          <stop offset="50%" stopColor="#F59E0B" />
          <stop offset="100%" stopColor="#D97706" />
        </linearGradient>

        {/* Outer Glow */}
        <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* 360 Degree Orbital Circle / Compass Ring */}
      <circle 
        cx="50" 
        cy="50" 
        r="44" 
        stroke="url(#elimuGoldGrad)" 
        strokeWidth="2.5" 
        strokeDasharray="4 2.5" 
        className="opacity-80"
      />

      {/* 4 Cardinal 360° Axis Markers */}
      <circle cx="50" cy="6" r="3" fill="#F59E0B" filter="url(#goldGlow)" />
      <circle cx="94" cy="50" r="3" fill="#F59E0B" />
      <circle cx="50" cy="94" r="3" fill="#F59E0B" />
      <circle cx="6" cy="50" r="3" fill="#F59E0B" />

      {/* Inner Academic Crest Shield */}
      <rect 
        x="18" 
        y="18" 
        width="64" 
        height="64" 
        rx="16" 
        fill="url(#elimuBlueGrad)" 
        stroke="#F59E0B" 
        strokeWidth="1.5"
      />

      {/* Open Book of Knowledge */}
      <path 
        d="M28 62C34 58 42 58 50 62C58 58 66 58 72 62V38C66 34 58 34 50 38C42 34 34 34 28 38V62Z" 
        fill="#0F172A" 
        stroke="#FDE047" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
      <line x1="50" y1="38" x2="50" y2="62" stroke="#FDE047" strokeWidth="2" strokeLinecap="round" />

      {/* Radiant Torch of Wisdom & Leadership */}
      <path 
        d="M50 24V32M45 27L50 22L55 27" 
        stroke="#FDE047" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />

      {/* Degree Symbol at the center top */}
      <circle cx="50" cy="22" r="1.5" fill="#FDE047" />
    </svg>
  );

  if (variant === 'icon-only') {
    return (
      <div className={`inline-flex items-center justify-center ${className}`}>
        <LogoEmblem />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-3 select-none ${className}`}>
      <LogoEmblem />
      
      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          {/* ELIMU Typography */}
          <span className={`font-black tracking-tight font-display ${dim.fontSize} ${
            theme === 'light' ? 'text-slate-900' : 'text-white'
          }`}>
            Elimu
          </span>

          {/* 360° Badge */}
          <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 flex items-center">
            360<span className="text-[0.65em] -mt-2 font-black">°</span>
          </span>

          {/* SIMS Micro-Pill */}
          <span className="text-[9px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded bg-blue-900/70 text-blue-300 border border-blue-700/50">
            SIMS
          </span>
        </div>

        {/* Subtitle */}
        {subtitle && (
          <span className={`${dim.subSize} text-slate-400 font-medium tracking-wide mt-0.5 hidden sm:block`}>
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};

/**
 * Interactive Brand Asset Studio & PNG / SVG Exporter Modal
 * Allows downloading the Elimu360 official logo rendered to HTML5 Canvas as PNG
 */
export const LogoExportStudioModal: React.FC<{ isOpen?: boolean; onClose: () => void }> = ({ isOpen = true, onClose }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [resolution, setResolution] = useState<number>(1024);
  const [bgChoice, setBgChoice] = useState<'transparent' | 'dark' | 'light' | 'royal'>('dark');
  const [downloadSuccess, setDownloadSuccess] = useState(false);
  const [renderedDataUrl, setRenderedDataUrl] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);

  if (!isOpen) return null;

  const renderLogoToCanvas = (width: number, height: number, bg: string): HTMLCanvasElement => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return canvas;

    // 1. Background Fill
    if (bg === 'dark') {
      ctx.fillStyle = '#020617'; // slate-950
      ctx.fillRect(0, 0, width, height);
    } else if (bg === 'royal') {
      const grad = ctx.createLinearGradient(0, 0, width, height);
      grad.addColorStop(0, '#0F172A');
      grad.addColorStop(1, '#1E1B4B');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);
    } else if (bg === 'light') {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.clearRect(0, 0, width, height);
    }

    // 2. Draw 360 Compass & Emblem
    const centerX = width * 0.28;
    const centerY = height * 0.5;
    const radius = Math.min(width, height) * 0.32;

    // Orbital Ring
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.setLineDash([width * 0.02, width * 0.015]);
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = width * 0.008;
    ctx.stroke();
    ctx.setLineDash([]);

    // Cardinal 360° Axis Markers
    const dots = [
      { x: centerX, y: centerY - radius },
      { x: centerX + radius, y: centerY },
      { x: centerX, y: centerY + radius },
      { x: centerX - radius, y: centerY }
    ];
    dots.forEach(d => {
      ctx.beginPath();
      ctx.arc(d.x, d.y, width * 0.012, 0, Math.PI * 2);
      ctx.fillStyle = '#F59E0B';
      ctx.fill();
    });

    // Shield
    const shieldSize = radius * 1.4;
    const shieldX = centerX - shieldSize / 2;
    const shieldY = centerY - shieldSize / 2;
    const shieldRadius = shieldSize * 0.2;

    ctx.save();
    ctx.beginPath();
    ctx.roundRect(shieldX, shieldY, shieldSize, shieldSize, shieldRadius);
    const shieldGrad = ctx.createLinearGradient(shieldX, shieldY, shieldX + shieldSize, shieldY + shieldSize);
    shieldGrad.addColorStop(0, '#1E3A8A');
    shieldGrad.addColorStop(1, '#1D4ED8');
    ctx.fillStyle = shieldGrad;
    ctx.fill();
    ctx.strokeStyle = '#F59E0B';
    ctx.lineWidth = width * 0.006;
    ctx.stroke();
    ctx.restore();

    // Open Book (Elimu)
    ctx.save();
    ctx.strokeStyle = '#FDE047';
    ctx.lineWidth = width * 0.009;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.fillStyle = '#0F172A';

    const bX = centerX;
    const bY = centerY + shieldSize * 0.08;
    const bW = shieldSize * 0.32;
    const bH = shieldSize * 0.28;

    ctx.beginPath();
    ctx.moveTo(bX - bW, bY + bH);
    ctx.bezierCurveTo(bX - bW * 0.5, bY + bH * 0.8, bX - bW * 0.2, bY + bH * 0.8, bX, bY + bH);
    ctx.bezierCurveTo(bX + bW * 0.2, bY + bH * 0.8, bX + bW * 0.5, bY + bH * 0.8, bX + bW, bY + bH);
    ctx.lineTo(bX + bW, bY);
    ctx.bezierCurveTo(bX + bW * 0.5, bY - bH * 0.2, bX + bW * 0.2, bY - bH * 0.2, bX, bY);
    ctx.bezierCurveTo(bX - bW * 0.2, bY - bH * 0.2, bX - bW * 0.5, bY - bH * 0.2, bX - bW, bY);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Book Center Spine
    ctx.beginPath();
    ctx.moveTo(bX, bY);
    ctx.lineTo(bX, bY + bH);
    ctx.stroke();

    // Torch of Wisdom
    ctx.beginPath();
    ctx.moveTo(bX, bY - shieldSize * 0.22);
    ctx.lineTo(bX, bY - shieldSize * 0.06);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(bX - shieldSize * 0.06, bY - shieldSize * 0.16);
    ctx.lineTo(bX, bY - shieldSize * 0.24);
    ctx.lineTo(bX + shieldSize * 0.06, bY - shieldSize * 0.16);
    ctx.stroke();
    ctx.restore();

    // 3. Typography
    const textStartX = width * 0.54;
    ctx.fillStyle = bg === 'light' ? '#0F172A' : '#FFFFFF';
    ctx.font = `bold ${height * 0.22}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText('Elimu', textStartX, centerY + height * 0.03);

    // 360 Gold
    const elimuWidth = ctx.measureText('Elimu').width;
    ctx.fillStyle = '#F59E0B';
    ctx.font = `900 ${height * 0.22}px 'Plus Jakarta Sans', system-ui, sans-serif`;
    ctx.fillText('360°', textStartX + elimuWidth + width * 0.015, centerY + height * 0.03);

    // Subtitle
    ctx.fillStyle = bg === 'light' ? '#475569' : '#94A3B8';
    ctx.font = `500 ${height * 0.055}px system-ui, sans-serif`;
    ctx.fillText('School Information Management System', textStartX, centerY + height * 0.12);

    return canvas;
  };

  const handleDownloadPNG = () => {
    setDownloading(true);
    setDownloadSuccess(false);
    try {
      const canvas = renderLogoToCanvas(resolution, Math.round(resolution * 0.45), bgChoice);
      const fileName = `elimu360_official_logo_${resolution}x${Math.round(resolution * 0.45)}_${bgChoice}.png`;

      // Method 1: Blob URL download
      canvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            setDownloading(false);
            setDownloadSuccess(true);
          }, 300);
        } else {
          // Method 2: DataURL fallback
          const dataUrl = canvas.toDataURL('image/png');
          setRenderedDataUrl(dataUrl);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = dataUrl;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          setDownloading(false);
          setDownloadSuccess(true);
        }
      }, 'image/png');
    } catch (err) {
      console.error('Error generating logo PNG:', err);
      setDownloading(false);
    }
  };

  const handleCopySvgCode = () => {
    const svgContent = `<svg width="512" height="230" viewBox="0 0 512 230" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Elimu360 Official Logo -->
  <circle cx="115" cy="115" r="85" stroke="#F59E0B" stroke-width="4" stroke-dasharray="8 6"/>
  <rect x="55" y="55" width="120" height="120" rx="30" fill="#1D4ED8" stroke="#F59E0B" stroke-width="3"/>
  <path d="M75 138C87 130 103 130 115 138C127 130 143 130 155 138V95C143 87 127 87 115 95C103 87 87 87 75 95V138Z" fill="#0F172A" stroke="#FDE047" stroke-width="4"/>
  <line x1="115" y1="95" x2="115" y2="138" stroke="#FDE047" stroke-width="4"/>
  <text x="230" y="125" fill="#FFFFFF" font-size="52" font-weight="bold" font-family="sans-serif">Elimu</text>
  <text x="375" y="125" fill="#F59E0B" font-size="52" font-weight="900" font-family="sans-serif">360°</text>
  <text x="230" y="158" fill="#94A3B8" font-size="14" font-family="sans-serif">School Information Management System</text>
</svg>`;
    navigator.clipboard.writeText(svgContent);
    setCopiedSvg(true);
    setTimeout(() => setCopiedSvg(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-950 border border-blue-800 text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Elimu360 Brand & Logo Studio</h3>
              <p className="text-xs text-slate-400">
                Official institutional brand identity — HTML Canvas PNG Exporter
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Logo Preview Box */}
        <div className="p-6 space-y-6">
          
          <div className={`p-8 rounded-xl border flex flex-col items-center justify-center transition-colors ${
            bgChoice === 'dark' ? 'bg-slate-950 border-slate-800 text-white' :
            bgChoice === 'royal' ? 'bg-gradient-to-br from-slate-900 to-indigo-950 border-indigo-800 text-white' :
            bgChoice === 'light' ? 'bg-white border-slate-300 text-slate-900 shadow-inner' :
            'bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:16px_16px] bg-slate-900 border-slate-800'
          }`}>
            <ElimuLogo 
              size="hero" 
              theme={bgChoice === 'light' ? 'light' : 'dark'} 
            />
          </div>

          {/* System Overview Card */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs space-y-2">
            <div className="font-bold text-amber-400 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Institutional Identity</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              <strong className="text-white">Elimu360 SIMS</strong> delivers comprehensive 360-degree governance across all school operations: Academics, Financial Portals, Student 360 Records, Discipline, Gate Security, Library, Direct Multi-Carrier SMS, and Parent-Teacher Collaboration.
            </p>
          </div>

          {/* Export Controls */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Background Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Background Palette</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setBgChoice('dark')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    bgChoice === 'dark' ? 'bg-slate-800 border-amber-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Dark Navy
                </button>
                <button
                  type="button"
                  onClick={() => setBgChoice('royal')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    bgChoice === 'royal' ? 'bg-indigo-950 border-amber-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Royal Indigo
                </button>
                <button
                  type="button"
                  onClick={() => setBgChoice('light')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    bgChoice === 'light' ? 'bg-slate-100 border-amber-500 text-slate-900 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Pure White
                </button>
                <button
                  type="button"
                  onClick={() => setBgChoice('transparent')}
                  className={`px-3 py-2 rounded-lg text-xs font-medium border transition cursor-pointer ${
                    bgChoice === 'transparent' ? 'bg-slate-800 border-amber-400 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                  }`}
                >
                  Transparent
                </button>
              </div>
            </div>

            {/* Resolution Selector */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">PNG Output Resolution</label>
              <div className="grid grid-cols-3 gap-2">
                {[512, 1024, 2048].map(res => (
                  <button
                    key={res}
                    type="button"
                    onClick={() => setResolution(res)}
                    className={`px-2 py-2 rounded-lg text-xs font-mono font-medium border transition cursor-pointer ${
                      resolution === res ? 'bg-blue-900/60 border-blue-500 text-white font-bold' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {res}px
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-400 mt-2">
                High-DPI rasterized output suitable for official letterheads, school badges, and banners.
              </p>
            </div>

          </div>

        </div>

        {/* Modal Footer Actions */}
        {downloadSuccess && (
          <div className="mx-6 p-3 rounded-xl bg-emerald-950/90 border border-emerald-700/70 text-emerald-300 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>PNG logo generated and downloaded to your device successfully!</span>
            </div>
            {renderedDataUrl && (
              <a
                href={renderedDataUrl}
                target="_blank"
                rel="noreferrer"
                className="text-[11px] font-bold text-amber-400 hover:underline flex items-center gap-1"
              >
                <span>View Fullscreen</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}

        <div className="p-6 border-t border-slate-800 bg-slate-950 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopySvgCode}
            className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-semibold transition flex items-center gap-2 cursor-pointer"
          >
            {copiedSvg ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copiedSvg ? 'SVG Vector Copied!' : 'Copy Vector SVG'}</span>
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleDownloadPNG}
              disabled={downloading}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{downloading ? 'Rendering Canvas...' : downloadSuccess ? 'Download Again' : 'Download PNG'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
