import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ShieldCheck, Check, Clock, AlertOctagon, FileCheck2 } from 'lucide-react';
import { ReviewSessionCase } from './types';

interface VerificationSummaryCardProps {
  caseItem: ReviewSessionCase;
  onViewFlagged?: () => void;
}

export const VerificationSummaryCard: React.FC<VerificationSummaryCardProps> = ({
  caseItem,
  onViewFlagged,
}) => {
  const isPass = caseItem.overallVerdict === 'PASS';
  const isFail = caseItem.overallVerdict === 'FAIL';
  const hasFlags = caseItem.findings.some((f) => !f.resolved && f.severity === 'FLAG');
  const unresolvedFindingsCount = caseItem.findings.filter((f) => !f.resolved).length;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Overall Decision Banner (§7) */}
      {isFail ? (
        <div className="p-5 rounded-2xl bg-rose-50 border-2 border-rose-500 shadow-sm text-rose-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <XCircle size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded border border-rose-300">
                ✕ CERTIFICATION BLOCKED
              </span>
              <h3 className="text-base font-bold text-rose-950 font-sans mt-1">
                One or more applicable procedures have failed statutory tolerances.
              </h3>
              <p className="text-xs text-rose-800 font-sans mt-0.5">
                Verification certificate issuance is legally prohibited under OIML R 76-1 until corrective actions are taken.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewFlagged}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 self-end sm:self-center shadow-xs"
          >
            View failed result →
          </button>
        </div>
      ) : hasFlags || unresolvedFindingsCount > 0 ? (
        <div className="p-5 rounded-2xl bg-amber-50 border-2 border-amber-400 shadow-sm text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <AlertTriangle size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded border border-amber-300">
                ⚠ REVIEW REQUIRES ATTENTION
              </span>
              <h3 className="text-base font-bold text-amber-950 font-sans mt-1">
                {unresolvedFindingsCount} observation row{unresolvedFindingsCount !== 1 ? 's contain' : ' contains'} reviewer flags.
              </h3>
              <p className="text-xs text-amber-900 font-sans mt-0.5">
                Technical exceptions require reviewer evaluation before forward approval to Laboratory Director.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewFlagged}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shrink-0 self-end sm:self-center shadow-xs"
          >
            View flagged observations →
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-300 shadow-sm text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <CheckCircle2 size={22} className="stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300">
                ✓ VERIFICATION READY FOR APPROVAL
              </span>
              <h3 className="text-base font-bold text-emerald-950 font-sans mt-1">
                All applicable procedures completed successfully.
              </h3>
              <p className="text-xs text-emerald-900 font-sans mt-0.5">
                No unresolved audit comments. Laboratory evidence satisfies OIML R 76-1 statutory criteria.
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 rounded-xl bg-white border border-emerald-200 text-emerald-800 font-bold text-xs shadow-2xs shrink-0 self-end sm:self-center">
            ● READY FOR DIRECTOR SIGN-OFF
          </div>
        </div>
      )}

      {/* 2. Audit Summary Triad (§2, §1112) */}
      <div className="bg-white border border-foundation-200 rounded-xl p-4 shadow-2xs grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        <div className="flex items-center gap-2 p-2 rounded-lg bg-foundation-50 border border-foundation-200">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <div>
            <span className="text-foundation-500 text-[10px] block">Test Evidence</span>
            <strong className="text-foundation-900 font-sans">✓ Complete & Verified</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-foundation-50 border border-foundation-200">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <div>
            <span className="text-foundation-500 text-[10px] block">Calculations (OIML)</span>
            <strong className="text-foundation-900 font-sans">✓ P = I + 0.5e - ΔL</strong>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2 rounded-lg bg-foundation-50 border border-foundation-200">
          <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
          <div>
            <span className="text-foundation-500 text-[10px] block">Standard Traceability</span>
            <strong className="text-foundation-900 font-sans">✓ NABL / NPL Valid</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
