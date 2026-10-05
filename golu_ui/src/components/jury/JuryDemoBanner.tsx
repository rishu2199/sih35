import React from 'react';
import { Sparkles, ChevronRight, Play, Clock, ArrowRight } from 'lucide-react';

interface JuryDemoBannerProps {
  isActive: boolean;
  isOpen: boolean;
  currentStepNumber: number;
  totalSteps: number;
  currentStepTitle: string;
  timeRemaining?: string;
  onOpenAssistant: () => void;
}

export const JuryDemoBanner: React.FC<JuryDemoBannerProps> = ({
  isActive,
  isOpen,
  currentStepNumber,
  totalSteps,
  currentStepTitle,
  timeRemaining = '08:42',
  onOpenAssistant,
}) => {
  // If drawer is already open or demo is not active, don't show the floating collapsed pill
  if (!isActive || isOpen) return null;

  return (
    <div
      onClick={onOpenAssistant}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onOpenAssistant()}
      className="fixed bottom-6 right-6 z-40 bg-[#172554] text-white p-3 rounded-2xl shadow-2xl border border-blue-400/50 hover:border-amber-400 hover:scale-105 transition-all cursor-pointer select-none group flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4 duration-300"
      title="Click to expand 10-minute Jury Presentation Assistant"
    >
      <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm shadow-xs shrink-0">
        🎬
      </div>
      <div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-black tracking-tight text-white">
            Jury Demo
          </span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </div>
        <div className="text-[11px] font-mono text-blue-200">
          {timeRemaining} remaining
        </div>
      </div>
      <div className="pl-1 text-slate-400 group-hover:text-amber-300 transition-colors">
        <ChevronRight className="w-4 h-4" />
      </div>
    </div>
  );
};
