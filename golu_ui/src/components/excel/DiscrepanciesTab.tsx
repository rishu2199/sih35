import React, { useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  ArrowRight,
  ArrowUpRight,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  FileText,
} from 'lucide-react';
import { AuditDiscrepancy } from './types';

interface DiscrepanciesTabProps {
  discrepancies: AuditDiscrepancy[];
  onSelectDiscrepancy: (item: AuditDiscrepancy) => void;
  onExportAuditReport?: () => void;
  onViewCalculationProof?: () => void;
}

export const DiscrepanciesTab: React.FC<DiscrepanciesTabProps> = ({
  discrepancies,
  onSelectDiscrepancy,
  onExportAuditReport,
  onViewCalculationProof,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const filtered = discrepancies.filter((d) => {
    if (filterSeverity === 'ALL') return true;
    return d.severity === filterSeverity;
  });

  // Hero High-Risk Discrepancy (Finding #01 - Rounding Discrepancy Trap per §11, §12)
  const heroFinding = discrepancies.find((d) => d.severity === 'HIGH') || discrepancies[0];

  return (
    <div className="space-y-6">
      {/* 1. Audit Summary Banner (§10) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-white border border-foundation-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-widest font-mono">
            AUDIT SUMMARY
          </span>
          <div className="text-base font-bold text-foundation-900 font-sans mt-0.5">
            3 discrepancies found • 1 requires immediate review
          </div>
          <p className="text-xs text-foundation-500 font-sans mt-0.5">
            Recalculated observations reveal potential compliance divergence from statutory tolerance corridors.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => (
            <button
              key={sev}
              type="button"
              onClick={() => setFilterSeverity(sev)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                filterSeverity === sev
                  ? 'bg-foundation-900 text-white shadow-xs'
                  : 'bg-foundation-100 text-foundation-600 hover:bg-foundation-200'
              }`}
            >
              {sev === 'ALL' ? 'All (3)' : sev === 'HIGH' ? 'High Risk (1)' : sev === 'MEDIUM' ? 'Review (1)' : 'Info (1)'}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Hero High-Risk Finding Card (§11, §12, §36) */}
      {heroFinding && (
        <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-rose-50/70 via-white to-amber-50/40 border-2 border-rose-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-rose-100">
            <div className="flex items-center gap-2.5">
              <span className="w-8 h-8 rounded-xl bg-rose-600 text-white flex items-center justify-center font-mono font-bold text-xs shadow-xs">
                !
              </span>
              <div>
                <span className="text-[10px] font-mono font-bold text-rose-800 uppercase tracking-widest">
                  HIGH-RISK DISCREPANCY
                </span>
                <h3 className="text-base font-bold text-foundation-900 font-sans">
                  {heroFinding.title}
                </h3>
              </div>
            </div>

            <span className="font-mono text-xs text-foundation-500">
              Evidence: Workbook Row {heroFinding.rowNumber} ({heroFinding.sheetName})
            </span>
          </div>

          {/* Side-by-Side Comparison Hero (§12, §36) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Legacy Spreadsheet Card */}
            <div className="p-4 rounded-2xl bg-white border border-foundation-200 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-foundation-500 uppercase tracking-wider">
                  LEGACY EXCEL
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-emerald-100 text-emerald-900 border border-emerald-300">
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>PASS</span>
                </span>
              </div>
              <div className="font-mono text-xs space-y-1 text-foundation-700 pt-1">
                <div>Observed error: <strong className="text-foundation-900 font-bold">0.00 g</strong></div>
                <div>Formula applied: <code className="text-[11px] bg-foundation-100 px-1.5 py-0.5 rounded text-foundation-700">=ROUND(C17-B17, 2)</code></div>
              </div>
            </div>

            {/* Digital Re-calculation Card */}
            <div className="p-4 rounded-2xl bg-white border-2 border-rose-300 shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-rose-700 uppercase tracking-wider">
                  DIGITAL RE-CALCULATION
                </span>
                <span className="inline-flex items-center gap-1 font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-rose-100 text-rose-900 border border-rose-300">
                  <XCircle size={13} className="text-rose-600" />
                  <span>FAIL</span>
                </span>
              </div>
              <div className="font-mono text-xs space-y-1 text-foundation-700 pt-1">
                <div>Unrounded error: <strong className="text-rose-700 font-bold">-5.3 g</strong></div>
                <div>Legal statutory limit: <strong className="text-foundation-900 font-bold">±5.0 g</strong></div>
              </div>
            </div>
          </div>

          {/* Rounding Discrepancy Callout (§12) */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
            <div>
              <div className="font-bold flex items-center gap-1.5 text-amber-900">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span>⚠ ROUNDING DISCREPANCY</span>
              </div>
              <p className="text-amber-800 mt-1 leading-relaxed">
                The legacy result appears compliant after rounding, while the recalculated result exceeds the configured tolerance corridor.
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              {onViewCalculationProof && (
                <button
                  type="button"
                  onClick={onViewCalculationProof}
                  className="px-3.5 py-2 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 font-semibold text-xs transition-colors"
                >
                  View Calculation
                </button>
              )}
              <button
                type="button"
                onClick={() => onSelectDiscrepancy(heroFinding)}
                className="px-4 py-2 rounded-xl bg-foundation-900 hover:bg-black text-white font-bold text-xs transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <span>Inspect Finding →</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Findings Table (§10) */}
      <div className="bg-white border border-foundation-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-foundation-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-foundation-900 uppercase tracking-wider font-mono">
            Audited Discrepancies Table
          </h4>
          <span className="font-mono text-xs text-foundation-500">
            {filtered.length} Findings
          </span>
        </div>

        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-foundation-50/80 border-b border-foundation-100 font-mono text-[11px] text-foundation-500 uppercase tracking-wider">
              <th className="py-3 px-4 w-12 text-center">#</th>
              <th className="py-3 px-4">Finding</th>
              <th className="py-3 px-4 w-28">Severity</th>
              <th className="py-3 px-4">Legacy Result</th>
              <th className="py-3 px-4">Recalculated</th>
              <th className="py-3 px-4">Evidence</th>
              <th className="py-3 px-4 w-28 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foundation-100 font-sans">
            {filtered.map((item) => (
              <tr
                key={item.id}
                onClick={() => onSelectDiscrepancy(item)}
                className="hover:bg-foundation-50/60 transition-colors cursor-pointer group"
              >
                <td className="py-3.5 px-4 font-mono font-bold text-foundation-400 text-center">
                  {item.findingNumber}
                </td>

                <td className="py-3.5 px-4">
                  <div className="font-bold text-foundation-900 group-hover:text-brand-600 transition-colors">
                    {item.title}
                  </div>
                  <div className="text-[11px] text-foundation-500 line-clamp-1 mt-0.5">
                    {item.summary}
                  </div>
                </td>

                <td className="py-3.5 px-4 font-mono">
                  <span
                    className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded ${
                      item.severity === 'HIGH'
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : item.severity === 'MEDIUM'
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}
                  >
                    {item.severity}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-mono">
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                    {item.legacyResult}
                  </span>
                  <span className="text-[11px] text-foundation-400 block mt-0.5 truncate">
                    {item.legacyError}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-mono">
                  <span
                    className={`font-bold px-2 py-0.5 rounded border text-[11px] ${
                      item.recalculatedResult === 'FAIL'
                        ? 'text-rose-700 bg-rose-50 border-rose-200'
                        : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                    }`}
                  >
                    {item.recalculatedResult}
                  </span>
                  <span className="text-[11px] text-foundation-500 block mt-0.5 truncate">
                    {item.correctedError}
                  </span>
                </td>

                <td className="py-3.5 px-4 font-mono text-[11px] text-foundation-600">
                  Row {item.rowNumber} • {item.sheetName}
                </td>

                <td className="py-3.5 px-4 text-right">
                  <span className="text-brand-600 group-hover:text-brand-700 font-bold text-xs inline-flex items-center gap-1 font-mono">
                    <span>Inspect</span>
                    <ArrowUpRight size={13} />
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
