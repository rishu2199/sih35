import React from 'react';
import { ShieldCheck, AlertTriangle, XCircle, Clock } from 'lucide-react';

export interface TraceabilityBadgeProps {
  status: 'VALID' | 'EXPIRING' | 'EXPIRED';
  className?: string;
}

/**
 * METROLOGIX-76 Standard TraceabilityBadge Primitive (§16)
 * Explicit status indicator for statutory reference standard weight sets.
 */
export const TraceabilityBadge: React.FC<TraceabilityBadgeProps> = ({
  status,
  className = '',
}) => {
  const configs = {
    VALID: {
      label: 'TRACEABILITY VALID',
      icon: ShieldCheck,
      classes:
        'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    },
    EXPIRING: {
      label: 'EXPIRING SOON',
      icon: Clock,
      classes:
        'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    },
    EXPIRED: {
      label: 'TRACEABILITY LOCKED',
      icon: XCircle,
      classes:
        'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold',
    },
  };

  const current = configs[status] || configs.VALID;
  const Icon = current.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold border ${current.classes} ${className}`}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span>{current.label}</span>
    </span>
  );
};
