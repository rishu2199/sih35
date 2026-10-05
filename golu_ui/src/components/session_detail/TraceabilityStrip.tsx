import React from 'react';
import { CheckCircle2, AlertTriangle, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

interface TraceabilityStripProps {
  status: 'VALID' | 'EXPIRING' | 'LOCKED';
  weightSetId?: string;
  onResolveTraceability?: () => void;
}

export const TraceabilityStrip: React.FC<TraceabilityStripProps> = ({
  status,
  weightSetId = 'E2-014',
  onResolveTraceability,
}) => {
  if (status === 'LOCKED') {
    return (
      <div className="p-4 sm:p-5 rounded-3xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 text-red-900 dark:text-red-200 shadow-sm animate-in fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-2xl bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300 mt-0.5">
              <Lock className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-black text-sm uppercase tracking-wider text-red-700 dark:text-red-400">
                🔒 TESTING LOCKED · TRACEABILITY INVALID
              </div>
              <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed max-w-2xl">
                The assigned standard weight set (<strong className="font-mono">{weightSetId}</strong>) is no longer valid or calibration has expired. Test inputs are disabled under OIML R 76-1 statutory requirements until traceability is resolved.
              </p>
            </div>
          </div>

          {onResolveTraceability && (
            <button
              type="button"
              onClick={onResolveTraceability}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/30 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
            >
              <span>Resolve Traceability</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (status === 'EXPIRING') {
    return (
      <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300">
                ⚠ TRACEABILITY EXPIRING:
              </span>{' '}
              <span>
                Standard weight set <strong className="font-mono">{weightSetId}</strong> expires in 2 days. Complete current session or assign renewed standards.
              </span>
            </div>
          </div>

          {onResolveTraceability && (
            <button
              type="button"
              onClick={onResolveTraceability}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-400 dark:border-amber-700 bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors cursor-pointer self-start sm:self-center"
            >
              <span>Manage Standards</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    );
  }

  // Valid status
  return (
    <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-emerald-900 dark:text-emerald-200 shadow-xs">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <div className="text-xs">
            <span className="font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              ✓ TRACEABILITY VALID:
            </span>{' '}
            <span>
              Standard weight set <strong className="font-mono font-bold">{weightSetId}</strong> (Class E2 &amp; F1) · NPL / NABL calibration valid through 15 Nov 2026.
            </span>
          </div>
        </div>

        <div className="hidden sm:inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>OIML R 111-1</span>
        </div>
      </div>
    </div>
  );
};
