import React, { useState } from 'react';
import { Target, AlertTriangle, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { EccentricityComparisonRow } from './types';

interface EccentricityComparisonTabProps {
  rows: EccentricityComparisonRow[];
}

export const EccentricityComparisonTab: React.FC<EccentricityComparisonTabProps> = ({ rows }) => {
  const [selectedCorner, setSelectedCorner] = useState<number>(4);

  const selectedRow = rows.find((r) => r.cornerNumber === selectedCorner) || rows[3];

  return (
    <div className="space-y-6">
      {/* 1. Dual Platter Static Comparison Hero (§17, §18) */}
      <div className="bg-white rounded-3xl border border-foundation-200 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-foundation-100">
          <div>
            <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-widest font-mono">
              ECCENTRICITY COMPARISON
            </span>
            <h3 className="text-base font-bold text-foundation-900 font-sans mt-0.5">
              Legacy Spreadsheet vs. Digital Platter Recalculation
            </h3>
          </div>
          <span className="text-xs font-mono text-foundation-500 bg-foundation-100 px-3 py-1 rounded-xl">
            Applied Test Load: 10.000 kg (1/3 Max)
          </span>
        </div>

        {/* Dual Visual Platters: LEGACY vs DIGITAL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          {/* Legacy Platter */}
          <div className="p-5 rounded-2xl bg-foundation-50 border border-foundation-200 text-center space-y-3">
            <span className="font-mono text-xs font-bold text-foundation-600 uppercase tracking-wider block">
              LEGACY SPREADSHEET PLATTER
            </span>

            {/* Static 4-corner SVG Diagram */}
            <div className="relative mx-auto w-56 h-36 bg-white rounded-2xl border-2 border-foundation-300 flex items-center justify-center p-3 shadow-inner">
              {/* Corner 1 Top Left */}
              <div className="absolute top-3 left-4 text-center">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center justify-center border border-emerald-300">
                  1
                </span>
                <span className="text-[9px] font-mono text-foundation-600 block mt-0.5">+1.2g</span>
              </div>

              {/* Corner 2 Top Right */}
              <div className="absolute top-3 right-4 text-center">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center justify-center border border-emerald-300">
                  2
                </span>
                <span className="text-[9px] font-mono text-foundation-600 block mt-0.5">+0.8g</span>
              </div>

              {/* Center */}
              <div className="w-4 h-4 rounded-full bg-foundation-300 border border-foundation-400" />

              {/* Corner 3 Bottom Right */}
              <div className="absolute bottom-3 right-4 text-center">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center justify-center border border-emerald-300">
                  3
                </span>
                <span className="text-[9px] font-mono text-foundation-600 block mt-0.5">+1.5g</span>
              </div>

              {/* Corner 4 Bottom Left */}
              <div className="absolute bottom-3 left-4 text-center">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center justify-center border border-emerald-300">
                  4
                </span>
                <span className="text-[9px] font-mono text-foundation-600 block mt-0.5">-4.1g</span>
              </div>
            </div>

            <p className="text-[11px] font-sans text-foundation-500">
              Legacy formula calculated all 4 corners as compliant PASS.
            </p>
          </div>

          {/* Digital Recalculation Platter */}
          <div className="p-5 rounded-2xl bg-rose-50/40 border-2 border-rose-200 text-center space-y-3">
            <span className="font-mono text-xs font-bold text-rose-800 uppercase tracking-wider block">
              DIGITAL VERIFICATION PLATTER
            </span>

            {/* Static 4-corner SVG Diagram with Red Deflection */}
            <div className="relative mx-auto w-56 h-36 bg-white rounded-2xl border-2 border-rose-300 flex items-center justify-center p-3 shadow-inner">
              {/* Corner 1 Top Left */}
              <div className="absolute top-3 left-4 text-center">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-mono font-bold flex items-center justify-center border border-emerald-300">
                  1
                </span>
                <span className="text-[9px] font-mono text-foundation-600 block mt-0.5">+1.2g</span>
              </div>

              {/* Corner 2 Top Right */}
              <div className="absolute top-3 right-4 text-center">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold flex items-center justify-center border border-amber-300">
                  2
                </span>
                <span className="text-[9px] font-mono text-foundation-600 block mt-0.5">+0.9g</span>
              </div>

              {/* Center */}
              <div className="w-4 h-4 rounded-full bg-foundation-300 border border-foundation-400" />

              {/* Corner 3 Bottom Right */}
              <div className="absolute bottom-3 right-4 text-center">
                <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-[10px] font-mono font-bold flex items-center justify-center border border-amber-300">
                  3
                </span>
                <span className="text-[9px] font-mono text-foundation-600 block mt-0.5">+1.4g</span>
              </div>

              {/* Corner 4 Bottom Left (Failing Deflection) */}
              <div className="absolute bottom-3 left-4 text-center">
                <span className="w-6 h-6 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold flex items-center justify-center border border-rose-400 animate-pulse">
                  4
                </span>
                <span className="text-[9px] font-mono text-rose-700 font-extrabold block mt-0.5">-6.2g</span>
              </div>
            </div>

            <p className="text-[11px] font-sans text-rose-700 font-bold">
              Corner 4 deflection unmasks illegal mechanical error (-6.2 g &gt; ±5.0 g).
            </p>
          </div>
        </div>

        {/* 2. Worst Difference Callout (§19) */}
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-sans">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold shrink-0">
              <AlertTriangle size={18} />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-amber-800 uppercase tracking-widest">
                WORST DIFFERENCE CALLOUT
              </span>
              <h4 className="text-sm font-bold text-foundation-900">
                Corner 4 (Bottom-Left Support): Difference of -2.1 g
              </h4>
              <div className="flex flex-wrap items-center gap-3 font-mono text-xs text-amber-900 mt-1">
                <span>Legacy: <strong>-4.1 g</strong></span>
                <span>•</span>
                <span>Recalculated: <strong className="text-rose-700">-6.2 g</strong></span>
                <span>•</span>
                <span className="text-rose-700 font-bold">⚠ Requires immediate review</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setSelectedCorner(4)}
            className="px-4 py-2 rounded-xl bg-foundation-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
          >
            Inspect Corner 4
          </button>
        </div>
      </div>

      {/* 3. Corner Deviation Comparison Table (§17) */}
      <div className="bg-white border border-foundation-200 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 sm:p-5 border-b border-foundation-100 flex items-center justify-between">
          <h4 className="text-xs font-bold text-foundation-900 uppercase tracking-wider font-mono">
            Corner-by-Corner Deviation Table
          </h4>
          <span className="font-mono text-xs text-foundation-500">4 Platter Quadrants</span>
        </div>

        <table className="w-full border-collapse text-left text-xs font-sans">
          <thead>
            <tr className="bg-foundation-50/80 border-b border-foundation-100 font-mono text-[11px] text-foundation-500 uppercase tracking-wider">
              <th className="py-3 px-4">Corner</th>
              <th className="py-3 px-4">Position</th>
              <th className="py-3 px-4 text-right font-mono">Legacy Deviation</th>
              <th className="py-3 px-4 text-right font-mono">Digital Recalculation</th>
              <th className="py-3 px-4 text-right font-mono">Variance</th>
              <th className="py-3 px-4 text-center">Status</th>
              <th className="py-3 px-4">Forensic Notes</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foundation-100 font-mono">
            {rows.map((row) => {
              const isSelected = row.cornerNumber === selectedCorner;
              const isHighRisk = row.status === 'HIGH-RISK';

              return (
                <tr
                  key={row.cornerNumber}
                  onClick={() => setSelectedCorner(row.cornerNumber)}
                  className={`cursor-pointer transition-colors ${
                    isSelected
                      ? 'bg-brand-50/70'
                      : isHighRisk
                      ? 'bg-rose-50/50 hover:bg-rose-50'
                      : 'hover:bg-foundation-50/60'
                  }`}
                >
                  <td className="py-3.5 px-4 font-bold text-foundation-900">
                    Corner {row.cornerNumber}
                  </td>

                  <td className="py-3.5 px-4 font-sans font-medium text-foundation-800">
                    {row.label}
                  </td>

                  <td className="py-3.5 px-4 text-right text-foundation-700">
                    {row.legacyDeviation}
                  </td>

                  <td className="py-3.5 px-4 text-right font-bold">
                    <span className={isHighRisk ? 'text-rose-700 font-extrabold' : 'text-foundation-900'}>
                      {row.digitalDeviation}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right text-foundation-600">
                    {row.difference}
                  </td>

                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${
                        row.status === 'HIGH-RISK'
                          ? 'bg-rose-100 text-rose-900 border border-rose-300'
                          : row.status === 'DIFFERENCE'
                          ? 'bg-amber-100 text-amber-900 border border-amber-300'
                          : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 font-sans text-xs text-foundation-600">
                    {row.notes}
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
