import React from 'react';
import { StatutoryTestItem } from './types';
import { CheckCircle2, Clock, AlertTriangle, Layers } from 'lucide-react';

interface ScopeSummaryCardProps {
  tests: StatutoryTestItem[];
}

export const ScopeSummaryCard: React.FC<ScopeSummaryCardProps> = ({ tests }) => {
  const applicableCount = tests.filter((t) => t.applicable).length;
  const requiredCount = tests.filter((t) => t.required).length;
  const completeCount = tests.filter((t) => t.status === 'COMPLETE').length;
  const pendingCount = tests.filter((t) => t.required && t.status !== 'COMPLETE').length;
  const notApplicableCount = tests.filter((t) => !t.applicable).length;

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs space-y-4 select-none font-mono">
      <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
        <span className="text-[11px] font-bold text-foundation-400 uppercase tracking-wider">
          SCOPE SUMMARY
        </span>
        <span className="text-[10px] px-2 py-0.5 rounded bg-foundation-100 text-foundation-700 font-bold">
          8 Tests Evaluated
        </span>
      </div>

      {/* 4 Metric Block Grid (Section 12) */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-200">
          <span className="text-[10px] text-foundation-500 uppercase block font-semibold">
            Applicable
          </span>
          <div className="text-2xl font-black text-foundation-950 mt-0.5">
            {applicableCount}
          </div>
          <span className="text-[10px] text-foundation-400 block mt-0.5">
            Tests relevant
          </span>
        </div>

        <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-200">
          <span className="text-[10px] text-foundation-500 uppercase block font-semibold">
            Required
          </span>
          <div className="text-2xl font-black text-brand-700 mt-0.5">
            {requiredCount}
          </div>
          <span className="text-[10px] text-foundation-400 block mt-0.5">
            Statutory mandate
          </span>
        </div>

        <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-200 text-emerald-950">
          <span className="text-[10px] text-emerald-700 uppercase block font-semibold flex items-center gap-1">
            <CheckCircle2 size={11} />
            <span>Complete</span>
          </span>
          <div className="text-2xl font-black text-emerald-800 mt-0.5">
            {completeCount}
          </div>
          <span className="text-[10px] text-emerald-600 block mt-0.5">
            Verified compliant
          </span>
        </div>

        <div className="p-3 rounded-lg bg-amber-50/70 border border-amber-200 text-amber-950">
          <span className="text-[10px] text-amber-700 uppercase block font-semibold flex items-center gap-1">
            <Clock size={11} />
            <span>Pending</span>
          </span>
          <div className="text-2xl font-black text-amber-800 mt-0.5">
            {pendingCount}
          </div>
          <span className="text-[10px] text-amber-600 block mt-0.5">
            Required tests left
          </span>
        </div>
      </div>

      <div className="pt-1 text-[11px] text-foundation-500 flex justify-between">
        <span>Not applicable tests:</span>
        <strong className="text-foundation-700">{notApplicableCount} tests excluded</strong>
      </div>
    </div>
  );
};
