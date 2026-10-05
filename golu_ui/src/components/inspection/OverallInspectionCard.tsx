import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, ShieldCheck } from 'lucide-react';

interface OverallInspectionCardProps {
  status: 'PASS' | 'WARNING' | 'FAIL';
  passedCount: number;
  totalCount: number;
  evidenceCount: number;
  failureReason?: string;
  onReviewFinding?: () => void;
}

export const OverallInspectionCard: React.FC<OverallInspectionCardProps> = ({
  status,
  passedCount,
  totalCount,
  evidenceCount,
  failureReason = 'Security seal integrity failed. Testing cannot continue.',
  onReviewFinding,
}) => {
  if (status === 'FAIL') {
    return (
      <div className="bg-red-50/90 dark:bg-red-950/40 rounded-3xl border-2 border-red-300 dark:border-red-900 p-6 sm:p-7 shadow-sm text-red-950 dark:text-red-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600 text-white flex items-center justify-center shadow-lg shadow-red-600/30 flex-shrink-0">
            <XCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-red-700 dark:text-red-400 bg-red-100 dark:bg-red-900/60 px-2 py-0.5 rounded-md">
              OVERALL INSPECTION (§21)
            </span>
            <h3 className="text-xl font-black text-red-900 dark:text-red-200 tracking-tight">
              ✕ FAIL · INSPECTION FAILED
            </h3>
            <p className="text-xs text-red-800 dark:text-red-300 leading-relaxed max-w-xl">
              {failureReason} Testing cannot continue under OIML R 76-1 statutory requirements until the physical defect is resolved.
            </p>
          </div>
        </div>

        {onReviewFinding && (
          <button
            type="button"
            onClick={onReviewFinding}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            <span>View Finding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  if (status === 'WARNING') {
    return (
      <div className="bg-amber-50/90 dark:bg-amber-950/40 rounded-3xl border-2 border-amber-300 dark:border-amber-900 p-6 sm:p-7 shadow-sm text-amber-950 dark:text-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
            <AlertTriangle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-amber-800 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-md">
              OVERALL INSPECTION (§20)
            </span>
            <h3 className="text-xl font-black text-amber-900 dark:text-amber-200 tracking-tight">
              ⚠ NEEDS ATTENTION
            </h3>
            <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed max-w-xl">
              {passedCount} of {totalCount} checks passed. 1 observation requires review before continuing to Weighing Error &amp; Linearity.
            </p>
          </div>
        </div>

        {onReviewFinding && (
          <button
            type="button"
            onClick={onReviewFinding}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md shadow-amber-500/20 transition-all cursor-pointer whitespace-nowrap self-start sm:self-center"
          >
            <span>Review Finding</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    );
  }

  // PASS (§19)
  return (
    <div className="bg-emerald-50/90 dark:bg-emerald-950/40 rounded-3xl border-2 border-emerald-300 dark:border-emerald-900 p-6 sm:p-7 shadow-sm text-emerald-950 dark:text-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-6 animate-in fade-in">
      <div className="flex items-start sm:items-center gap-4">
        <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/30 flex-shrink-0">
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
        </div>
        <div className="space-y-1">
          <span className="text-[10px] font-mono font-black uppercase tracking-widest text-emerald-800 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-md">
            OVERALL INSPECTION (§19)
          </span>
          <h3 className="text-xl font-black text-emerald-900 dark:text-emerald-200 tracking-tight">
            ✓ PASS · PHYSICAL AUDIT COMPLETE
          </h3>
          <p className="text-xs text-emerald-800 dark:text-emerald-300 leading-relaxed max-w-xl">
            All {totalCount} required physical checks passed. {evidenceCount} evidence photos captured and verified against statutory criteria.
          </p>
        </div>
      </div>

      <div className="font-mono text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/40 px-3.5 py-1.5 rounded-xl border border-emerald-300 dark:border-emerald-800 self-start sm:self-center">
        OIML R 76-1 CL 3.9
      </div>
    </div>
  );
};
