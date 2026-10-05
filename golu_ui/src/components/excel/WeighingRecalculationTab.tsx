import React, { useState } from 'react';
import { Scale, CheckCircle2, XCircle, Calculator, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { WeighingRecalcRow } from './types';

interface WeighingRecalculationTabProps {
  rows: WeighingRecalcRow[];
}

export const WeighingRecalculationTab: React.FC<WeighingRecalculationTabProps> = ({ rows }) => {
  const [selectedLoad, setSelectedLoad] = useState<string>('10.000 kg');
  const [showFormulaProof, setShowFormulaProof] = useState<boolean>(false);

  const selectedRow = rows.find((r) => r.load === selectedLoad) || rows[1] || rows[0];

  return (
    <div className="space-y-6">
      {/* 1. Hero Side-by-Side Comparison Card (§14, §29) */}
      <div className="bg-white rounded-3xl border border-foundation-200 shadow-xs overflow-hidden">
        <div className="p-5 sm:p-6 bg-foundation-50/70 border-b border-foundation-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Scale size={20} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-widest font-mono">
                WEIGHING RECALCULATION
              </span>
              <h3 className="text-base font-bold text-foundation-900 font-sans">
                Side-by-Side Methodology Comparison
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-foundation-500">Inspect Load:</span>
            <div className="flex flex-wrap gap-1">
              {rows.map((r) => (
                <button
                  key={r.load}
                  type="button"
                  onClick={() => setSelectedLoad(r.load)}
                  className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                    r.load === selectedLoad
                      ? 'bg-foundation-900 text-white shadow-xs'
                      : 'bg-white border border-foundation-200 text-foundation-700 hover:bg-foundation-100'
                  }`}
                >
                  {r.load}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Side-by-Side Split (§14, §29) */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 divide-y md:divide-y-0 md:divide-x divide-foundation-200">
          {/* Column 1: LEGACY EXCEL (§29) */}
          <div className="space-y-4 md:pr-6">
            <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-foundation-700">
                  LEGACY EXCEL
                </span>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>PASS</span>
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between py-2 px-3 rounded-xl bg-foundation-50 border border-foundation-100">
                <span className="text-foundation-500">Formula:</span>
                <span className="font-bold text-foundation-800">I - L</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-xl bg-foundation-50 border border-foundation-100">
                <span className="text-foundation-500">Error:</span>
                <span className="font-bold text-foundation-800">{selectedRow.legacyError}</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-xl bg-foundation-50 border border-foundation-100">
                <span className="text-foundation-500">Evaluation:</span>
                <span className="font-bold text-emerald-700">PASS</span>
              </div>
            </div>

            <p className="text-xs text-foundation-500 leading-relaxed font-sans pt-1">
              Legacy workbook evaluated compliance through naive display subtraction without testing turning point fractional boundaries.
            </p>
          </div>

          {/* Column 2: DIGITAL VERIFICATION (§29) */}
          <div className="space-y-4 md:pl-6 pt-4 md:pt-0">
            <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600" />
                <span className="text-xs font-bold uppercase tracking-wider font-mono text-rose-800">
                  DIGITAL VERIFICATION
                </span>
              </div>
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-mono font-bold ${
                  selectedRow.oimlResult === 'FAIL'
                    ? 'bg-rose-100 text-rose-900 border border-rose-300'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                {selectedRow.oimlResult === 'FAIL' ? (
                  <XCircle size={13} className="text-rose-600" />
                ) : (
                  <CheckCircle2 size={13} className="text-emerald-600" />
                )}
                <span>{selectedRow.oimlResult}</span>
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="flex justify-between py-2 px-3 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-foundation-500">Turning Point:</span>
                <span className="font-bold text-foundation-900">P = I + 0.5e - ΔL</span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-foundation-500">Error:</span>
                <span
                  className={`font-bold ${
                    selectedRow.oimlResult === 'FAIL' ? 'text-rose-700 font-extrabold' : 'text-foundation-900'
                  }`}
                >
                  {selectedRow.digitalError}
                </span>
              </div>
              <div className="flex justify-between py-2 px-3 rounded-xl bg-rose-50/50 border border-rose-100">
                <span className="text-foundation-500">Legal Limit:</span>
                <span className="font-bold text-foundation-900">{selectedRow.oimlLimit}</span>
              </div>
            </div>

            <p className="text-xs text-foundation-500 leading-relaxed font-sans pt-1">
              At {selectedRow.load}, statutory OIML R 76-1 turning point calculation unmasks true continuous error.
            </p>
          </div>
        </div>

        {/* Expandable Calculation Proof Drawer (§15) */}
        <div className="border-t border-foundation-100 bg-foundation-50/70 p-4 sm:p-5">
          <button
            type="button"
            onClick={() => setShowFormulaProof(!showFormulaProof)}
            className="w-full flex items-center justify-between text-xs font-bold text-foundation-800 hover:text-brand-600 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Calculator size={15} className="text-brand-600" />
              <span>View Calculation Proof &amp; Mathematical Derivation</span>
            </span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-foundation-500 font-normal">
              <span>{showFormulaProof ? 'Hide proof' : 'Show proof'}</span>
              {showFormulaProof ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </span>
          </button>

          {showFormulaProof && (
            <div className="mt-3 pt-3 border-t border-foundation-200 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono animate-fade-in">
              <div className="p-3.5 bg-white rounded-2xl border border-foundation-200 space-y-1">
                <span className="font-sans font-bold text-foundation-600 text-[11px]">
                  1. Turning Point Determination:
                </span>
                <div className="text-brand-700 font-bold">P = I + 0.5e - ΔL</div>
                <div className="text-foundation-600 text-[11px]">
                  P = 10.005 + (0.5 × 0.005) - 0.0047 = 10.0053 kg
                </div>
              </div>

              <div className="p-3.5 bg-white rounded-2xl border border-foundation-200 space-y-1">
                <span className="font-sans font-bold text-foundation-600 text-[11px]">
                  2. Corrected Error &amp; Statutory Limits:
                </span>
                <div className="text-brand-700 font-bold">E = P - L = 10.0053 - 10.000 = +5.3 g</div>
                <div className="text-rose-700 font-bold text-[11px]">
                  |E| (5.3 g) &gt; MPE (±5.0 g) ➔ STATUTORY FAIL
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Recalculation Comparison Table (§16, §29) */}
      <div className="bg-white border border-foundation-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-foundation-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-foundation-900 uppercase tracking-wider font-mono">
              Recalculation Comparison Table
            </h4>
            <p className="text-xs text-foundation-500 font-sans mt-0.5">
              Side-by-side verification error analysis across all workbook test loads.
            </p>
          </div>
          <span className="font-mono text-xs text-foundation-500">
            {rows.length} Verification Loads
          </span>
        </div>

        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-foundation-50/80 border-b border-foundation-100 font-mono text-[11px] text-foundation-500 uppercase tracking-wider">
              <th className="py-3 px-4">Target Load</th>
              <th className="py-3 px-4 text-right font-mono">Legacy Reading</th>
              <th className="py-3 px-4 text-right font-mono">Legacy Error</th>
              <th className="py-3 px-4 text-right font-mono">Digital Error</th>
              <th className="py-3 px-4 text-center">Result</th>
              <th className="py-3 px-4">Analysis Findings</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foundation-100 font-mono">
            {rows.map((row) => {
              const isSelected = row.load === selectedLoad;
              const isFail = row.oimlResult === 'FAIL';

              return (
                <tr
                  key={row.load}
                  onClick={() => setSelectedLoad(row.load)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-50/70'
                      : isFail
                      ? 'bg-rose-50/50 hover:bg-rose-50'
                      : 'hover:bg-foundation-50/60'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-foundation-900 flex items-center gap-2">
                    {isFail && <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />}
                    <span>{row.load}</span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-foundation-700">
                    {row.legacyReading}
                  </td>

                  <td className="py-3.5 px-4 text-right text-foundation-700">
                    {row.legacyError}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold text-foundation-900">
                    <span className={isFail ? 'text-rose-700 font-extrabold' : 'text-foundation-900'}>
                      {row.digitalError}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        isFail
                          ? 'bg-rose-100 text-rose-900 border border-rose-300 font-black'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {row.oimlResult}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-xs text-foundation-600">
                    {isFail ? (
                      <span className="font-bold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle size={13} className="shrink-0" />
                        <span>{row.differenceNotes}</span>
                      </span>
                    ) : (
                      <span>{row.differenceNotes}</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
