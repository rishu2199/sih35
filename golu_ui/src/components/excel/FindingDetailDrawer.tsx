import React, { useState } from 'react';
import { X, AlertOctagon, AlertTriangle, FileText, ArrowRight, Code } from 'lucide-react';
import { AuditDiscrepancy } from './types';

interface FindingDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  discrepancy: AuditDiscrepancy | null;
  onViewRecalculation?: () => void;
}

export const FindingDetailDrawer: React.FC<FindingDetailDrawerProps> = ({
  isOpen,
  onClose,
  discrepancy,
  onViewRecalculation,
}) => {
  const [showFormulaDetails, setShowFormulaDetails] = useState(false);

  if (!isOpen || !discrepancy) return null;

  const isHigh = discrepancy.severity === 'HIGH';

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-foundation-200">
          {/* Header */}
          <div className="p-5 border-b border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className={`w-9 h-9 rounded-2xl flex items-center justify-center font-bold shadow-xs ${
                  isHigh ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                }`}
              >
                {isHigh ? <AlertOctagon size={18} /> : <AlertTriangle size={18} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-foundation-900 tracking-tight">
                  FINDING DETAILS
                </h3>
                <p className="text-[11px] text-foundation-500 font-mono">
                  Finding #{discrepancy.findingNumber} • Row {discrepancy.rowNumber} ({discrepancy.sheetName})
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body (§13) */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* Finding Severity Strip */}
            <div
              className={`p-3.5 rounded-2xl border ${
                isHigh
                  ? 'bg-rose-50 border-rose-200 text-rose-900'
                  : 'bg-amber-50 border-amber-200 text-amber-900'
              }`}
            >
              <span className="font-mono text-[10px] font-bold uppercase tracking-wider block">
                {discrepancy.severity}-RISK DISCREPANCY
              </span>
              <h4 className="text-sm font-bold mt-0.5 font-sans">
                {discrepancy.title}
              </h4>
            </div>

            {/* Structured Details: Finding, Workbook Row, Legacy vs Recalc, Difference */}
            <div className="space-y-3">
              <div className="p-3.5 rounded-2xl bg-foundation-50 border border-foundation-200 space-y-1">
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Finding
                </span>
                <div className="font-bold text-foundation-900 text-xs">
                  {discrepancy.title}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-foundation-50 border border-foundation-200 space-y-1">
                <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                  Workbook Row
                </span>
                <div className="font-mono text-sm font-bold text-foundation-900">
                  Row {discrepancy.rowNumber}
                </div>
              </div>

              {/* Side-by-side Results */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-foundation-50 border border-foundation-200 space-y-1">
                  <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                    Legacy Result
                  </span>
                  <div
                    className={`font-mono text-base font-extrabold ${
                      discrepancy.legacyResult === 'PASS' ? 'text-emerald-700' : 'text-rose-700'
                    }`}
                  >
                    {discrepancy.legacyResult}
                  </div>
                  <div className="text-[11px] font-mono text-foundation-500">
                    {discrepancy.legacyError}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-foundation-50 border border-foundation-200 space-y-1">
                  <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider font-mono">
                    Recalculated Result
                  </span>
                  <div
                    className={`font-mono text-base font-extrabold ${
                      discrepancy.recalculatedResult === 'FAIL' ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {discrepancy.recalculatedResult}
                  </div>
                  <div className="text-[11px] font-mono text-foundation-500">
                    {discrepancy.correctedError}
                  </div>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-950 flex items-center justify-between font-mono text-xs">
                <span className="text-rose-700 font-bold">Difference:</span>
                <span className="font-extrabold text-rose-900">{discrepancy.difference}</span>
              </div>
            </div>

            {/* Action Buttons to View Legacy Formula & Recalculation (§13) */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={() => setShowFormulaDetails(!showFormulaDetails)}
                className="w-full py-2.5 px-4 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-800 transition-colors flex items-center justify-between shadow-xs cursor-pointer"
              >
                <span className="flex items-center gap-1.5">
                  <Code size={14} className="text-foundation-500" />
                  <span>View Legacy Formula</span>
                </span>
                <span className="font-mono text-[10px] text-foundation-400">
                  {showFormulaDetails ? 'Hide' : 'Inspect'}
                </span>
              </button>

              {showFormulaDetails && discrepancy.legacyFormula && (
                <div className="p-3 bg-slate-900 text-slate-200 font-mono text-[11px] rounded-2xl border border-slate-800 space-y-1 animate-fade-in">
                  <div className="text-[10px] text-slate-400">Raw cell expression in row {discrepancy.rowNumber}:</div>
                  <div className="text-emerald-400 font-bold">{discrepancy.legacyFormula}</div>
                  <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                    Digital replacement: {discrepancy.digitalFormula}
                  </div>
                </div>
              )}
            </div>

            {/* Why it Matters */}
            <div className="space-y-1.5">
              <span className="font-bold text-foundation-900 uppercase tracking-wider font-mono text-[11px]">
                Forensic Analysis
              </span>
              <p className="text-foundation-700 leading-relaxed bg-foundation-50 p-3 rounded-2xl border border-foundation-200">
                {discrepancy.whyItMatters}
              </p>
            </div>

            {/* Calculation Snippet */}
            <div className="space-y-1.5">
              <span className="font-bold text-foundation-900 uppercase tracking-wider font-mono text-[11px]">
                Turning Point Mathematical Proof
              </span>
              <div className="p-3 rounded-2xl bg-slate-900 text-emerald-400 font-mono text-[11px] border border-slate-800 break-all select-all leading-snug">
                {discrepancy.calculationSnippet}
              </div>
            </div>

            {/* Legal Citation */}
            <div className="p-3 rounded-2xl bg-blue-50/70 border border-blue-200 text-blue-900 text-xs flex items-start gap-2">
              <FileText size={15} className="text-blue-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold font-mono text-[11px] block">Statutory Reference:</span>
                <span className="text-[11px] mt-0.5 block">{discrepancy.statutoryReference}</span>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 flex items-center justify-between gap-3">
            {onViewRecalculation && (
              <button
                type="button"
                onClick={onViewRecalculation}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>View Recalculation</span>
                <ArrowRight size={13} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-foundation-800 hover:bg-foundation-900 text-white text-xs font-bold transition-colors ml-auto cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
