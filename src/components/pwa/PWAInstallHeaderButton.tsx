import React, { useState } from 'react';
import { Download, Smartphone, Share } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

export const PWAInstallHeaderButton: React.FC = () => {
  const { isInstalled, isIOS, triggerInstall } = usePWAInstall();
  const [showTooltip, setShowTooltip] = useState(false);

  if (isInstalled) {
    return null;
  }

  const handleClick = () => {
    if (isIOS) {
      alert('To install on iOS Safari: Tap the Share button at the bottom of the screen, then choose "Add to Home Screen".');
    } else {
      triggerInstall();
    }
  };

  return (
    <button
      onClick={handleClick}
      className="px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md shadow-amber-500/10 cursor-pointer animate-pulse"
      title="Install Elimu360 on your phone or PC for offline use"
    >
      <Download className="w-3.5 h-3.5" />
      <span className="hidden sm:inline">Install App</span>
      <span className="sm:hidden">Install</span>
    </button>
  );
};
