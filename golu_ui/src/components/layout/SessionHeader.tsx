import React from 'react';
import { ShieldCheck, AlertTriangle, Lock, CheckCircle2, Scale } from 'lucide-react';

interface SessionHeaderProps {
  session?: any;
  standardsStatus?: 'VALID' | 'EXPIRING' | 'EXPIRED';
  isTraceabilityLocked?: boolean;
  isApproved?: boolean;
  onNavigateToStandards?: () => void;
  children?: React.ReactNode;
}

export const SessionHeader: React.FC<SessionHeaderProps> = ({
  session,
  standardsStatus = 'VALID',
  isTraceabilityLocked = false,
  isApproved = false,
  onNavigateToStandards,
  children,
}) => {
  const serial = session?.serialNumber || 'AV-2026-8812';
  const model = session?.model || 'Avery ZM201 Retail Platform';
  const accuracyClass = session?.accuracyClass || 'Class III';
  const maxCapacity = session?.maxCapacity || '30.000 kg';
  const interval = session?.interval || 'e = 0.005 kg';

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors shrink-0">
      {/* Top Banner if Approved (Section 14) */}
      {isApproved && (
        <div className="bg-slate-900 text-white px-6 py-2 flex items-center justify-between text-xs font-mono">
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-bold text-amber-300">APPROVED · READ ONLY</span>
            <span className="text-slate-400 hidden sm:inline">— This verification session has been digitally signed by the Laboratory Director.</span>
          </div>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
            Schedule X Sealed
          </span>
        </div>
      )}

      {/* Main Persistent Instrument & Traceability Status Strip (Section 5) */}
      <div className="px-6 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 font-mono font-bold text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700">
            <Scale className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>{serial}</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-semibold text-slate-800 dark:text-slate-200">{model}</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono text-slate-600 dark:text-slate-400">{accuracyClass}</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono text-slate-600 dark:text-slate-400">{maxCapacity}</span>
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">{interval}</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Standards Status Pill */}
          {standardsStatus === 'EXPIRED' || isTraceabilityLocked ? (
            <button
              onClick={onNavigateToStandards}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
            >
              <Lock className="w-3.5 h-3.5 text-rose-600" />
              <span>Standards Expired (Locked)</span>
            </button>
          ) : standardsStatus === 'EXPIRING' ? (
            <button
              onClick={onNavigateToStandards}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 transition-colors cursor-pointer"
            >
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              <span>Standards Expiring Soon</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Standards Valid (F1-2026-04)</span>
            </div>
          )}

          {/* Verification Progress Badge */}
          <div className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800">
            {isApproved ? '● COMPLETED' : '● IN PROGRESS'}
          </div>
        </div>
      </div>

      {/* 7-Step Stepper Slot (Section 6) */}
      {children && <div className="px-6 py-2.5 bg-slate-50/60 dark:bg-slate-900/50">{children}</div>}
    </div>
  );
};
