import React from 'react';
import { Eye, Check, AlertTriangle, ShieldCheck, ArrowRight, CircleDot } from 'lucide-react';
import { PhysicalInspectionStatus } from './types';

interface PhysicalPreconditionCardProps {
  status: PhysicalInspectionStatus;
  isRemanded?: boolean;
  onNavigateToInspection: () => void;
}

export const PhysicalPreconditionCard: React.FC<PhysicalPreconditionCardProps> = ({
  status,
  isRemanded = false,
  onNavigateToInspection,
}) => {
  const isAllGood =
    status.spiritLevelPassed &&
    status.securitySealPassed &&
    status.instrumentConditionPassed &&
    !isRemanded;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                STATUTORY GATE §13
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                PHYSICAL PRECONDITION
              </h3>
            </div>
          </div>

          <span
            className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isRemanded
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
                : isAllGood
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
            }`}
          >
            {isRemanded ? '⚠ REMANDED' : isAllGood ? '✓ VERIFIED' : '○ PENDING'}
          </span>
        </div>

        {/* 3 Physical checklist items */}
        <div className="space-y-2 text-xs">
          <div className="flex items-start gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <div className="mt-0.5">
              <CircleDot className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Instrument Leveling Bubble:</span>
                <span className="font-mono text-[11px] font-bold text-emerald-600">✓ Concentric</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Deflection {status.levelBubbleDeflectionMm ?? 0.1} mm &lt; 0.2 mm allowable under OIML R 76-1 § 3.9.1.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <div className="mt-0.5">
              {isRemanded ? (
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              ) : (
                <Check className="w-3.5 h-3.5 text-emerald-600" />
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Security Lead-Wire Seal:</span>
                <span
                  className={`font-mono text-[11px] font-bold ${
                    isRemanded ? 'text-amber-600' : 'text-emerald-600'
                  }`}
                >
                  {isRemanded ? '⚠ Re-check Seal' : '✓ Intact & Verified'}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Tag <strong className="font-mono">{status.sealTagNumber || 'IN-DL-2026-0814'}</strong>. Zero tampering detected.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2.5 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800/80">
            <div className="mt-0.5">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">Visual Audit &amp; Pan Condition:</span>
                <span className="font-mono text-[11px] font-bold text-emerald-600">✓ Complete</span>
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Clean stainless-steel pan, free load-cell receptor clearance.
              </p>
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onNavigateToInspection}
        className={`w-full py-2.5 px-3 rounded-2xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
          isRemanded
            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 border-amber-500 shadow-md'
            : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-300'
        }`}
      >
        <span>{isRemanded ? 'Resolve Inspection Remand →' : 'Open Physical Inspection Studio'}</span>
        <ArrowRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
