import React from 'react';
import { Lock, AlertTriangle, CheckCircle2 } from 'lucide-react';

export interface TraceabilityIndicatorProps {
  status: 'VALID' | 'EXPIRING' | 'EXPIRED';
  isLocked?: boolean;
  onNavigateToStandards?: () => void;
  className?: string;
}

/**
 * TraceabilityIndicator (§35)
 * Displays statutory calibration status for standard weight sets
 */
export const TraceabilityIndicator: React.FC<TraceabilityIndicatorProps> = ({
  status = 'VALID',
  isLocked = false,
  onNavigateToStandards,
  className = '',
}) => {
  if (isLocked || status === 'EXPIRED') {
    return (
      <button
        type="button"
        onClick={onNavigateToStandards}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-300 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800 hover:bg-rose-100 transition-colors cursor-pointer ${className}`}
        title="Standard weights expired. Click to resolve traceability."
      >
        <Lock className="w-3.5 h-3.5 text-rose-600 animate-pulse" />
        <span>Traceability Locked</span>
      </button>
    );
  }

  if (status === 'EXPIRING') {
    return (
      <button
        type="button"
        onClick={onNavigateToStandards}
        className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-300 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 hover:bg-amber-100 transition-colors cursor-pointer ${className}`}
        title="Standards certificate expiring soon"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Standards Expiring</span>
      </button>
    );
  }

  return (
    <div
      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 ${className}`}
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span>Traceability Valid</span>
    </div>
  );
};
