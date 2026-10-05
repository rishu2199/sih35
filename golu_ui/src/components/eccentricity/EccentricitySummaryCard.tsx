import React from 'react';
import {
  Target,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  ArrowUpRight,
  Edit3,
  Lock,
} from 'lucide-react';
import { EccentricityPosition } from './PlatterVisualizer';

interface EccentricitySummaryCardProps {
  currentPosition: EccentricityPosition;
  positions: EccentricityPosition[];
  onCaptureCurrent: () => void;
  onOpenManualEntry: (position: EccentricityPosition) => void;
  onInspectTrace: (position: EccentricityPosition) => void;
  isScaleStable: boolean;
  liveWeight: string;
  isTraceabilityLocked: boolean;
  mpeGrams: number;
}

export const EccentricitySummaryCard: React.FC<EccentricitySummaryCardProps> = ({
  currentPosition,
  positions,
  onCaptureCurrent,
  onOpenManualEntry,
  onInspectTrace,
  isScaleStable,
  liveWeight,
  isTraceabilityLocked,
  mpeGrams,
}) => {
  // Find worst position per spec §12
  const evaluatedPositions = positions.filter((p) => p.status !== 'PENDING' && p.errorGrams !== undefined);
  const worstPos = evaluatedPositions.reduce<EccentricityPosition | null>((worst, cur) => {
    if (!worst) return cur;
    return Math.abs(cur.errorGrams || 0) > Math.abs(worst.errorGrams || 0) ? cur : worst;
  }, null);

  const errorAbs = Math.abs(currentPosition.errorGrams || 0);
  const marginGrams = Math.max(0, mpeGrams - errorAbs);
  const percentUsed = Math.min(100, Math.round((errorAbs / mpeGrams) * 100));

  const hasFailures = evaluatedPositions.some((p) => p.status === 'FAIL');
  const passedCount = evaluatedPositions.filter((p) => p.status === 'PASS').length;
  const failedCount = evaluatedPositions.filter((p) => p.status === 'FAIL').length;
  const isComplete = evaluatedPositions.length === positions.length;

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs space-y-4">
      {/* 1. Header & Current Position Technical Panel per spec §7 */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
          <div className="flex items-center gap-2">
            <Target size={15} className="text-brand-600" />
            <span className="text-[11px] font-bold text-foundation-500 uppercase font-mono tracking-wider">
              CURRENT POSITION: {currentPosition.name.toUpperCase()}
            </span>
          </div>

          <span
            className={`text-xs font-mono font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
              currentPosition.status === 'PASS'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : currentPosition.status === 'MARGINAL'
                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                : currentPosition.status === 'FAIL'
                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                : 'bg-foundation-100 text-foundation-600'
            }`}
          >
            {currentPosition.status === 'PASS' ? (
              <CheckCircle2 size={13} className="text-emerald-600" />
            ) : currentPosition.status === 'MARGINAL' ? (
              <AlertTriangle size={13} className="text-amber-600" />
            ) : currentPosition.status === 'FAIL' ? (
              <XCircle size={13} className="text-rose-600" />
            ) : (
              <span>○</span>
            )}
            <span>{currentPosition.status === 'MARGINAL' ? 'NEAR LIMIT' : currentPosition.status}</span>
          </span>
        </div>

        {/* Selected Position Technical Details Box per spec §7 */}
        <div className="mt-3 p-3.5 bg-foundation-50 rounded-xl border border-foundation-200 space-y-2 font-mono text-xs">
          <div className="flex justify-between items-center pb-2 border-b border-foundation-200/60">
            <span className="text-foundation-500 font-bold">Selected Load Zone</span>
            <span className="font-bold text-foundation-950 text-sm">{currentPosition.name}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Target Test Load</span>
            <span className="font-bold text-foundation-800">{currentPosition.targetLoad.toFixed(3)} kg</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Observed Reading</span>
            <span className="font-bold text-foundation-950 text-sm">
              {currentPosition.observedReading !== undefined
                ? `${currentPosition.observedReading.toFixed(3)} kg`
                : 'Awaiting load...'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Calculated Error (Ec)</span>
            <span
              className={`font-bold text-sm ${
                currentPosition.status === 'PASS'
                  ? 'text-emerald-700'
                  : currentPosition.status === 'MARGINAL'
                  ? 'text-amber-700'
                  : currentPosition.status === 'FAIL'
                  ? 'text-rose-700'
                  : 'text-foundation-400'
              }`}
            >
              {currentPosition.errorGrams !== undefined
                ? `${currentPosition.errorGrams > 0 ? '+' : ''}${currentPosition.errorGrams.toFixed(1)} g`
                : '—'}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Legal Tolerance (±MPE)</span>
            <span className="font-bold text-foundation-800">±{mpeGrams.toFixed(1)} g</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Safety Margin</span>
            <span className="font-bold text-foundation-700">
              {currentPosition.errorGrams !== undefined ? `${marginGrams.toFixed(1)} g` : '—'}
            </span>
          </div>

          {/* Tolerance Gauge */}
          {currentPosition.errorGrams !== undefined && (
            <div className="pt-2 border-t border-foundation-200/60">
              <div className="flex justify-between text-[10px] font-bold mb-1">
                <span className="text-foundation-500">Tolerance Consumed</span>
                <span
                  className={
                    percentUsed > 80
                      ? 'text-rose-600'
                      : percentUsed > 50
                      ? 'text-amber-700'
                      : 'text-emerald-700'
                  }
                >
                  {percentUsed}% of legal limit
                </span>
              </div>
              <div className="w-full h-1.5 bg-foundation-200 rounded-full overflow-hidden">
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
            </div>
          )}
        </div>

        {/* Live Indicator Chip & Capture Action per spec §8, §9, §25 */}
        <div className="mt-3 p-3 bg-foundation-50/70 rounded-xl border border-foundation-200 space-y-2.5">
          <div className="flex items-center justify-between font-mono text-xs">
            <div className="flex items-center gap-1.5 text-foundation-500">
              <Cpu size={13} className="text-brand-600" />
              <span>LIVE SCALE:</span>
            </div>
            <div className="font-bold text-foundation-900">
              {isScaleStable ? liveWeight : '10.001 ↕ 10.009 kg'}
            </div>
          </div>

          {!isScaleStable && (
            <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-mono">
              ⚠ SCALE UNSTABLE: Reading fluctuating. Wait for stability before capture.
            </div>
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={!isScaleStable || isTraceabilityLocked}
              onClick={onCaptureCurrent}
              title={
                isTraceabilityLocked
                  ? 'Traceability locked'
                  : !isScaleStable
                  ? 'Scale is unstable'
                  : `Capture reading for ${currentPosition.name}`
              }
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold font-mono shadow-sm flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                isScaleStable && !isTraceabilityLocked
                  ? 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white'
                  : 'bg-foundation-200 text-foundation-400 cursor-not-allowed'
              }`}
            >
              <Cpu size={14} />
              <span>Capture Position Reading</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenManualEntry(currentPosition)}
              title="Manual keyboard input"
              className="p-2 rounded-lg border border-foundation-200 bg-white hover:bg-foundation-100 text-foundation-700 text-xs font-semibold cursor-pointer shadow-2xs"
            >
              <Edit3 size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* 2. Worst Observed Position Card per spec §12 */}
      <div className="pt-3 border-t border-foundation-100">
        <span className="text-[11px] font-bold text-foundation-500 uppercase font-mono tracking-wider block mb-2">
          WORST OBSERVED POSITION
        </span>
        {worstPos && worstPos.errorGrams !== undefined ? (
          <div
            className={`p-3.5 rounded-xl border text-xs font-mono transition-all ${
              worstPos.status === 'FAIL'
                ? 'bg-rose-50/80 border-rose-300 text-rose-950'
                : worstPos.status === 'MARGINAL'
                ? 'bg-amber-50/80 border-amber-300 text-amber-950'
                : 'bg-emerald-50/80 border-emerald-300 text-emerald-950'
            }`}
          >
            <div className="flex items-center justify-between font-bold">
              <span className="text-sm font-sans">{worstPos.name}</span>
              <span className="text-[10px] px-1.5 py-0.2 rounded font-bold uppercase bg-white/80 border border-black/10">
                {worstPos.status === 'MARGINAL' ? '⚠ NEAR LIMIT' : worstPos.status}
              </span>
            </div>
            <div className="mt-1.5 flex items-baseline justify-between">
              <span className="text-foundation-600">Worst Error:</span>
              <span className="font-bold text-sm">
                {(worstPos.errorGrams > 0 ? '+' : '') + worstPos.errorGrams.toFixed(1)} g / ±{mpeGrams.toFixed(1)} g
              </span>
            </div>
            <div className="mt-2 pt-2 border-t border-black/10 flex items-center justify-between text-[11px]">
              <span className="text-foundation-500">
                Tolerance used: {Math.min(100, Math.round((Math.abs(worstPos.errorGrams) / mpeGrams) * 100))}%
              </span>
              <button
                type="button"
                onClick={() => onInspectTrace(worstPos)}
                className="text-xs font-bold underline hover:opacity-80 cursor-pointer"
              >
                Inspect Proof →
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 bg-foundation-50 rounded-lg text-xs font-mono text-foundation-400 text-center">
            Awaiting positional readings...
          </div>
        )}
      </div>

      {/* 3. Overall Eccentricity Summary Box per spec §16, §17, §18, §19 */}
      <div className="pt-3 border-t border-foundation-100 font-mono text-xs">
        <span className="text-[11px] font-bold text-foundation-500 uppercase tracking-wider block mb-2">
          ECCENTRICITY TEST SUMMARY
        </span>
        <div className="p-3 bg-foundation-50 rounded-xl border border-foundation-200 space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Positions Tested:</span>
            <span className="font-bold text-foundation-900">
              {evaluatedPositions.length} / {positions.length}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Positions Passed:</span>
            <span className="font-bold text-emerald-700">{passedCount}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Positions Failed:</span>
            <span className={`font-bold ${failedCount > 0 ? 'text-rose-700' : 'text-foundation-900'}`}>
              {failedCount}
            </span>
          </div>
          <div className="pt-2 border-t border-foundation-200/60 flex justify-between items-center font-bold">
            <span className="text-foundation-700">OVERALL VERDICT:</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] ${
                hasFailures
                  ? 'bg-rose-100 text-rose-800'
                  : !isComplete
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {hasFailures ? '✕ FAIL' : !isComplete ? '○ INCOMPLETE' : '✓ PASS'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
