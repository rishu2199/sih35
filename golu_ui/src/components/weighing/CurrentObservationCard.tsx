import React from 'react';
import { Target, CheckCircle2, AlertTriangle, XCircle, Info } from 'lucide-react';
import { WeighingPoint } from './ErrorCorridorChart';

interface CurrentObservationCardProps {
  point?: WeighingPoint | null;
  verificationStageMultiplier: number;
  onInspectTrace: (point: WeighingPoint) => void;
}

export const CurrentObservationCard: React.FC<CurrentObservationCardProps> = ({
  point,
  verificationStageMultiplier,
  onInspectTrace,
}) => {
  if (!point || point.observedReading === undefined) {
    return (
      <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs flex flex-col justify-between h-full">
        <div>
          <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
            <span className="text-[11px] font-bold text-foundation-400 tracking-wider uppercase font-mono">
              CURRENT OBSERVATION
            </span>
          </div>
          <div className="py-12 text-center text-foundation-400 font-mono text-xs">
            <Target size={28} className="mx-auto mb-2 text-foundation-300" />
            <p>Select or capture a test point to inspect real-time metrological tolerance.</p>
          </div>
        </div>
      </div>
    );
  }

  const effectiveMpe = point.mpeGrams * verificationStageMultiplier;
  const errorAbs = Math.abs(point.errorGrams || 0);
  const percentUsed = Math.min(100, Math.round((errorAbs / effectiveMpe) * 100));

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs flex flex-col justify-between h-full">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-brand-600" />
            <span className="text-[11px] font-bold text-foundation-400 tracking-wider uppercase font-mono">
              CURRENT OBSERVATION (#{point.stepIndex} · {point.series})
            </span>
          </div>

          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
              point.status === 'PASS'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : point.status === 'MARGINAL'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}
          >
            {point.status === 'PASS' ? (
              <CheckCircle2 size={13} className="text-emerald-600" />
            ) : point.status === 'MARGINAL' ? (
              <AlertTriangle size={13} className="text-amber-600" />
            ) : (
              <XCircle size={13} className="text-rose-600" />
            )}
            <span>{point.status}</span>
          </span>
        </div>

        {/* Observation Data Grid */}
        <div className="mt-4 space-y-3 font-mono text-xs">
          <div className="flex justify-between items-center py-1.5 border-b border-foundation-100">
            <span className="text-foundation-500">Target Load (L)</span>
            <span className="font-bold text-foundation-900 text-sm">
              {point.targetLoad.toFixed(3)} kg
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-foundation-100">
            <span className="text-foundation-500">Observed Reading (I)</span>
            <span className="font-bold text-foundation-900 text-sm">
              {point.observedReading?.toFixed(3)} kg
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-foundation-100">
            <span className="text-foundation-500">Corrected Error (Ec)</span>
            <span
              className={`font-bold text-sm ${
                point.status === 'PASS'
                  ? 'text-emerald-700'
                  : point.status === 'MARGINAL'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {(point.errorGrams! > 0 ? '+' : '') + point.errorGrams?.toFixed(1)} g
            </span>
          </div>

          <div className="flex justify-between items-center py-1.5 border-b border-foundation-100">
            <span className="text-foundation-500">Legal Tolerance (±MPE)</span>
            <span className="font-bold text-foundation-800">
              ±{effectiveMpe.toFixed(1)} g
            </span>
          </div>
        </div>

        {/* Tolerance Gauge Usage Bar */}
        <div className="mt-4 p-3 bg-foundation-50 rounded-lg border border-foundation-200">
          <div className="flex justify-between text-[11px] font-mono font-bold mb-1.5">
            <span className="text-foundation-600">Tolerance Used</span>
            <span
              className={
                percentUsed > 80
                  ? 'text-rose-600'
                  : percentUsed > 50
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }
            >
              {percentUsed}% of legal MPE
            </span>
          </div>
          <div className="w-full h-2 bg-foundation-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                percentUsed > 80
                  ? 'bg-rose-500'
                  : percentUsed > 50
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${percentUsed}%` }}
            />
          </div>
          <p className="text-[10px] text-foundation-500 mt-2">
            {point.status === 'MARGINAL'
              ? 'Observation is within legal MPE but exceeds 50% threshold. Verify platform stability.'
              : point.status === 'FAIL'
              ? 'Tolerance exceeded. Statutory failure recorded.'
              : 'Observation well within legally allowable error corridor.'}
          </p>
        </div>
      </div>

      {/* Action Footer */}
      <div className="pt-3 border-t border-foundation-100 flex items-center justify-between">
        <button
          type="button"
          onClick={() => onInspectTrace(point)}
          className="text-xs font-semibold text-brand-600 hover:text-brand-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>⌁ Inspect Calculation Proof</span>
        </button>
        <span className="text-[10px] font-mono text-foundation-400">
          Clause 3.5.3
        </span>
      </div>
    </div>
  );
};
