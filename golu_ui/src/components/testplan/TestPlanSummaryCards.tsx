import React from 'react';
import { Scale, Layers, CheckCircle2, AlertOctagon, ShieldCheck } from 'lucide-react';
import { VerificationStage } from './types';

interface TestPlanSummaryCardsProps {
  accuracyClass: string;
  verificationStage: VerificationStage;
  applicableCount: number;
  totalCount: number;
  isReady: boolean;
  blockerCount: number;
}

export const TestPlanSummaryCards: React.FC<TestPlanSummaryCardsProps> = ({
  accuracyClass,
  verificationStage,
  applicableCount,
  totalCount,
  isReady,
  blockerCount,
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono select-none">
      {/* Card 1 - Accuracy Class (§5) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider block">
            ACCURACY CLASS
          </span>
          <div className="text-xl sm:text-2xl font-black text-foundation-950 font-sans mt-1">
            {accuracyClass.toUpperCase()}
          </div>
        </div>
        <p className="text-[11px] text-foundation-500 font-sans mt-3 pt-2 border-t border-foundation-100">
          Determined from registered instrument specifications
        </p>
      </div>

      {/* Card 2 - Verification Stage (§5) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs flex flex-col justify-between">
        <div>
          <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider block">
            VERIFICATION STAGE
          </span>
          <div className="text-lg sm:text-xl font-black text-brand-700 font-sans mt-1 uppercase">
            {verificationStage}
          </div>
        </div>
        <p className="text-[11px] text-foundation-500 font-sans mt-3 pt-2 border-t border-foundation-100">
          Statutory inspection cycle under WELMEC 7.2 Guide
        </p>
      </div>

      {/* Card 3 - Test Plan Scope Status (§5) */}
      <div
        className={`rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-colors ${
          blockerCount > 0
            ? 'bg-rose-50/70 border-rose-300 ring-1 ring-rose-200'
            : isReady
            ? 'bg-emerald-50/60 border-emerald-300'
            : 'bg-white border-foundation-200'
        }`}
      >
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider block">
              TEST PLAN STATUS
            </span>
            {blockerCount > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 flex items-center gap-1">
                <AlertOctagon size={12} />
                <span>● {blockerCount} BLOCKER</span>
              </span>
            ) : isReady ? (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-700" />
                <span>● READY</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-900">
                ● IN PROGRESS
              </span>
            )}
          </div>

          <div className="text-xl sm:text-2xl font-black text-foundation-950 font-sans mt-1">
            {applicableCount} / {totalCount} APPLICABLE
          </div>
        </div>

        <p className="text-[11px] font-sans mt-3 pt-2 border-t border-foundation-200/60 font-medium">
          {blockerCount > 0
            ? `${blockerCount} prerequisite must be resolved before measurement capture`
            : '● Ready to start active verification testing'}
        </p>
      </div>
    </div>
  );
};
