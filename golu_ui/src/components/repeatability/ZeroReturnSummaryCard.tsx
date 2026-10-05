import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
} from 'lucide-react';
import { RepeatabilityReading } from './RepeatabilitySequenceTable';

interface ZeroReturnSummaryCardProps {
  readings: RepeatabilityReading[];
}

export const ZeroReturnSummaryCard: React.FC<ZeroReturnSummaryCardProps> = ({
  readings,
}) => {
  const [showTooltip, setShowTooltip] = useState(false);

  // Completed cycles are those where reading was taken
  const completedReadings = readings.filter((r) => r.observedReading !== undefined);
  const completedCycles = completedReadings.length;

  // Anomalies are completed runs where zeroReturnConfirmed is false, or reading is not 0.000
  // In demo data, runs with non-zero zero return or unconfirmed zero
  const zeroAnomalies = readings.filter(
    (r) => r.observedReading !== undefined && !r.zeroReturnConfirmed
  );

  const correctlyReturned = completedCycles - zeroAnomalies.length;
  const hasExceptions = zeroAnomalies.length > 0;

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs relative select-none">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
        <div className="flex items-center gap-2">
          <RotateCcw size={15} className="text-brand-600" />
          <h3 className="text-xs font-bold text-foundation-900 uppercase font-mono tracking-wider">
            ZERO-RETURN TRACKING (OIML A.4.10)
          </h3>
        </div>

        <div className="relative">
          <button
            type="button"
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
            onClick={() => setShowTooltip((p) => !p)}
            className="text-foundation-400 hover:text-foundation-600 cursor-pointer p-0.5"
            title="Zero return information"
          >
            <HelpCircle size={14} />
          </button>

          {showTooltip && (
            <div className="absolute right-0 top-6 z-20 w-64 p-3 bg-foundation-900 text-white text-[11px] rounded-lg shadow-xl leading-relaxed border border-foundation-700">
              <strong className="block text-brand-300 font-mono mb-1">Zero Return Integrity</strong>
              The instrument should return to its true zero indication before each repeated measurement cycle to prevent creeping tare bias.
            </div>
          )}
        </div>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-3 gap-3 my-3 font-mono text-center">
        <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-100">
          <span className="text-[10px] text-foundation-500 uppercase block font-medium">
            Completed Cycles
          </span>
          <span className="text-base font-bold text-foundation-900 mt-0.5 block">
            {completedCycles} / 10
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-foundation-50 border border-foundation-100">
          <span className="text-[10px] text-foundation-500 uppercase block font-medium">
            True Zero (0.000 kg)
          </span>
          <span className="text-base font-bold text-emerald-700 mt-0.5 block">
            {correctlyReturned}
          </span>
        </div>

        <div
          className={`p-2.5 rounded-lg border ${
            hasExceptions
              ? 'bg-amber-50 border-amber-200'
              : 'bg-foundation-50 border-foundation-100'
          }`}
        >
          <span
            className={`text-[10px] uppercase block font-medium ${
              hasExceptions ? 'text-amber-700 font-bold' : 'text-foundation-500'
            }`}
          >
            Zero Exceptions
          </span>
          <span
            className={`text-base font-bold mt-0.5 block ${
              hasExceptions ? 'text-amber-700' : 'text-foundation-900'
            }`}
          >
            {zeroAnomalies.length}
          </span>
        </div>
      </div>

      {/* Bottom Status Banner */}
      <div
        className={`p-2.5 rounded-lg border flex items-center gap-2 text-xs font-mono ${
          hasExceptions
            ? 'bg-amber-50/80 border-amber-300 text-amber-900'
            : completedCycles === 10
            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
            : 'bg-foundation-50 border-foundation-200 text-foundation-600'
        }`}
      >
        {hasExceptions ? (
          <>
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <div className="text-[11px] leading-tight">
              <span className="font-bold">⚠ {zeroAnomalies.length} zero-return anomaly detected: </span>
              <span>
                {zeroAnomalies.map((a) => `Run ${a.run.toString().padStart(2, '0')}`).join(', ')}
              </span>
            </div>
          </>
        ) : completedCycles === 10 ? (
          <>
            <CheckCircle2 size={15} className="text-emerald-600 shrink-0" />
            <span className="text-[11px] font-semibold">
              ✓ Zero returned correctly across all 10 completed cycles.
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-foundation-400 shrink-0" />
            <span className="text-[11px]">
              {completedCycles} of 10 cycles verified. Inter-cycle zero checks in progress.
            </span>
          </>
        )}
      </div>
    </div>
  );
};
