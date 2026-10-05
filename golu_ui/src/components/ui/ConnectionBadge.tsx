import React from 'react';
import { Radio, WifiOff } from 'lucide-react';

export interface ConnectionBadgeProps {
  connected: boolean;
  portOrProtocol?: string;
  isStable?: boolean;
  className?: string;
}

/**
 * METROLOGIX-76 Standard ConnectionBadge Primitive (§16)
 * Indicates hardware scale RS-232 / TCP-IP bridge connectivity and motion stability.
 */
export const ConnectionBadge: React.FC<ConnectionBadgeProps> = ({
  connected,
  portOrProtocol = 'RS-232 COM3',
  isStable = true,
  className = '',
}) => {
  if (!connected) {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700 ${className}`}
      >
        <WifiOff className="w-3.5 h-3.5 shrink-0" />
        <span>DISCONNECTED</span>
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 ${className}`}
    >
      <span className="relative flex h-2 w-2">
        <span
          className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            isStable ? 'bg-emerald-400' : 'bg-amber-400'
          }`}
        />
        <span
          className={`relative inline-flex rounded-full h-2 w-2 ${
            isStable ? 'bg-emerald-500' : 'bg-amber-500'
          }`}
        />
      </span>
      <span>{portOrProtocol}</span>
      <span className="text-[10px] opacity-75 font-normal">
        ({isStable ? 'STABLE' : 'MOTION'})
      </span>
    </span>
  );
};
