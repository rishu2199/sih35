import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

interface SpotlightOverlayProps {
  activeStepTitle: string;
  triggerKey: string | number;
}

export const SpotlightOverlay: React.FC<SpotlightOverlayProps> = ({
  activeStepTitle,
  triggerKey,
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
    }, 1400);

    return () => clearTimeout(timer);
  }, [triggerKey]);

  if (!visible) return null;

  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-40 pointer-events-none animate-in fade-in zoom-in-95 duration-200">
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/90 text-white backdrop-blur-md border border-amber-400/60 shadow-2xl">
        <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
        <span className="text-xs font-bold text-amber-300">Spotlight Target:</span>
        <span className="text-xs font-semibold text-slate-100">{activeStepTitle}</span>
      </div>
    </div>
  );
};
