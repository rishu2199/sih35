import React from 'react';
import { Lock, ArrowRight, AlertOctagon } from 'lucide-react';

interface LockoutBannerProps {
  title?: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const LockoutBanner: React.FC<LockoutBannerProps> = ({
  title = 'TRACEABILITY LOCKED',
  message = 'Standard weight set F1-2024-018 expired on 18 Mar 2026. Statutory testing cannot continue until a certified valid standard weight set is selected.',
  actionLabel = 'View Standard Weights Registry',
  onAction,
  className = '',
}) => {
  return (
    <div
      role="alert"
      className={`rounded-2xl border border-rose-300 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/60 p-4 sm:p-5 shadow-xs ${className}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0 shadow-xs">
            <Lock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/80 px-2 py-0.5 rounded">
                STATUTORY GATE
              </span>
              <h3 className="text-sm font-black font-mono tracking-tight text-rose-950 dark:text-rose-100 uppercase">
                {title}
              </h3>
            </div>
            <p className="text-xs text-rose-800/90 dark:text-rose-300/90 leading-relaxed max-w-2xl">
              {message}
            </p>
          </div>
        </div>

        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            <span>{actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};
