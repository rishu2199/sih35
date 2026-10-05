import React from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Play,
  RotateCcw,
  Sparkles,
  Calculator,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface RepeatabilitySummaryCardProps {
  minError: number;
  maxError: number;
  spread: number;
  allowableLimitGrams: number;
  completedCount: number;
  onInspectSpread: () => void;
  targetLoadKg: number;
}

export const RepeatabilitySummaryCard: React.FC<RepeatabilitySummaryCardProps> = ({
  minError,
  maxError,
  spread,
  allowableLimitGrams,
  completedCount,
  onInspectSpread,
  targetLoadKg,
}) => {
  const isComplete = completedCount === 10;
  const isPass = spread <= allowableLimitGrams;
  const isWarning = isPass && spread >= allowableLimitGrams * 0.85; // e.g. >= 1.7g when limit is 2.0g
  const marginGrams = Math.max(0, allowableLimitGrams - spread);
  const percentUsed = Math.min(100, Math.round((spread / allowableLimitGrams) * 100));

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs space-y-4">
      {/* 1. Header with Verdict Status */}
      <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
        <span className="text-[11px] font-bold text-foundation-400 uppercase font-mono tracking-wider">
          REPEATABILITY SUMMARY (OIML 3.6.1)
        </span>
        {isComplete && (
          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
              !isPass
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : isWarning
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
            }`}
          >
            {!isPass ? (
              <>
                <XCircle size={13} className="text-rose-600" />
                <span>✕ FAIL</span>
              </>
            ) : isWarning ? (
              <>
                <AlertTriangle size={13} className="text-amber-600" />
                <span>⚠ NEAR LIMIT</span>
              </>
            ) : (
              <>
                <CheckCircle2 size={13} className="text-emerald-600" />
                <span>✓ PASS</span>
              </>
            )}
          </span>
        )}
      </div>

      {/* 2. Hero Spread Display - Largest Numerical Card on Page (§13) */}
      <div
        className={`p-5 rounded-2xl border text-center font-mono transition-all ${
          !isComplete
            ? 'bg-foundation-50 border-foundation-200'
            : !isPass
            ? 'bg-rose-50/80 border-rose-300'
            : isWarning
            ? 'bg-amber-50/80 border-amber-300'
            : 'bg-emerald-50/80 border-emerald-300'
        }`}
      >
        <span className="text-[11px] font-bold uppercase tracking-wider block text-foundation-500">
          Total Observed Spread (Δ)
        </span>
        <div
          className={`text-5xl font-extrabold my-2 tracking-tight ${
            !isComplete
              ? 'text-foundation-950'
              : !isPass
              ? 'text-rose-700'
              : isWarning
              ? 'text-amber-700'
              : 'text-emerald-700'
          }`}
        >
          {spread.toFixed(1)} g
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-foundation-600 font-medium">
          <span>Allowable Limit:</span>
          <span className="font-bold text-foundation-900">{allowableLimitGrams.toFixed(1)} g</span>
          <span className="text-foundation-300">•</span>
          <span>Margin:</span>
          <span
            className={`font-bold ${
              !isPass
                ? 'text-rose-600'
                : isWarning
                ? 'text-amber-600'
                : 'text-emerald-700'
            }`}
          >
            {marginGrams.toFixed(1)} g
          </span>
        </div>

        {/* Status Verdict Text */}
        <div className="mt-3 pt-3 border-t border-black/5 text-xs font-semibold">
          {!isComplete ? (
            <span className="text-foundation-500">
              {completedCount} / 10 readings recorded. Test in progress.
            </span>
          ) : !isPass ? (
            <span className="text-rose-700 font-bold">
              ✕ FAIL — Spread exceeds allowable limit of {allowableLimitGrams.toFixed(1)} g.
            </span>
          ) : isWarning ? (
            <span className="text-amber-800 font-bold">
              ⚠ NEAR LIMIT — Review measurement consistency. Margin is under 15%.
            </span>
          ) : (
            <span className="text-emerald-800 font-bold">
              ✓ PASS — Spread within OIML Clause A.4.10 limit.
            </span>
          )}
        </div>

        {/* Horizontal Spread Consumption Meter (§13) */}
        <div className="mt-4 pt-3 border-t border-black/5 text-left">
          <div className="flex justify-between text-[11px] font-bold mb-1.5">
            <span className="text-foundation-600">Spread Consumption</span>
            <span
              className={
                percentUsed > 100
                  ? 'text-rose-600'
                  : percentUsed >= 85
                  ? 'text-amber-600'
                  : 'text-emerald-700'
              }
            >
              {percentUsed}% of Limit
            </span>
          </div>
          <div className="w-full h-2.5 bg-foundation-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                percentUsed > 100
                  ? 'bg-rose-500'
                  : percentUsed >= 85
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, percentUsed)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-foundation-400 mt-1">
            <span>0.0 g</span>
            <span>1.0 g</span>
            <span>2.0 g MPE Limit</span>
          </div>
        </div>
      </div>

      {/* 3. Technical Matrix (§14) */}
      <div className="grid grid-cols-3 gap-2 text-center font-mono text-xs">
        <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-100">
          <span className="text-[9px] text-foundation-400 block uppercase font-bold">Min Error (Emin)</span>
          <span className="font-bold text-foundation-900 mt-0.5 block">
            {(minError > 0 ? '+' : '') + minError.toFixed(1)} g
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-100">
          <span className="text-[9px] text-foundation-400 block uppercase font-bold">Max Error (Emax)</span>
          <span className="font-bold text-foundation-900 mt-0.5 block">
            {(maxError > 0 ? '+' : '') + maxError.toFixed(1)} g
          </span>
        </div>
        <div className="p-2.5 rounded-lg bg-brand-50 border border-brand-200">
          <span className="text-[9px] text-brand-700 block uppercase font-bold">Spread Δ</span>
          <span className="font-bold text-brand-900 mt-0.5 block">
            {spread.toFixed(1)} g
          </span>
        </div>
      </div>

      {/* 4. Statutory Formula Trace Box (§14) */}
      <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-200 text-xs font-mono text-foundation-600 space-y-1">
        <div className="text-[10px] font-bold uppercase text-foundation-400 tracking-wider">
          OIML R 76-1 Clause A.4.10 Formula
        </div>
        <div className="font-bold text-foundation-800">
          Δ = Emax − Emin = {maxError.toFixed(1)} g − ({minError.toFixed(1)} g) = {spread.toFixed(1)} g
        </div>
        <div className="text-[11px] text-foundation-500">
          Condition: Δ ≤ |mpe| ({spread.toFixed(1)} g ≤ {allowableLimitGrams.toFixed(1)} g) →{' '}
          <strong className={isPass ? 'text-emerald-700' : 'text-rose-700'}>
            {isPass ? 'SATISFIED' : 'VIOLATED'}
          </strong>
        </div>
      </div>

      {/* 5. Proof Slide-over Trigger */}
      <button
        type="button"
        onClick={onInspectSpread}
        className="w-full py-2.5 px-3 rounded-lg border border-foundation-200 hover:border-brand-300 bg-white hover:bg-brand-50 text-xs font-semibold font-mono text-brand-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
      >
        <Calculator size={14} />
        <span>Inspect Metrological Calculation Proof</span>
      </button>
    </div>
  );
};
