import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Cpu,
  RotateCcw,
  Check,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  Info,
  Flag,
  Edit3,
} from 'lucide-react';

export interface RepeatabilityReading {
  run: number;
  targetLoad: number; // in kg
  observedReading?: number; // in kg
  zeroReturnConfirmed: boolean;
  errorGrams?: number; // in grams
  status: 'PASS' | 'MARGINAL' | 'FAIL' | 'PENDING';
  isOutlier?: boolean;
}

interface RepeatabilitySequenceTableProps {
  readings: RepeatabilityReading[];
  activeRun: number;
  targetLoadKg: number;
  selectedRunId?: number;
  onSelectRun: (runNumber: number) => void;
  onCaptureRun: (runNumber: number) => void;
  onConfirmZeroReturn: (runNumber: number) => void;
  onRecaptureRun: (runNumber: number) => void;
  onOpenRunDetail: (runNumber: number) => void;
  onOpenAuditModal: (runNumber: number) => void;
  onOpenManualModal?: (runNumber: number) => void;
  allowableLimitGrams: number;
  isScaleStable?: boolean;
  liveReadingKg?: number;
  userRole?: 'METROLOGIST' | 'REVIEWER' | 'DIRECTOR' | 'AUDITOR';
  isLocked?: boolean;
}

export const RepeatabilitySequenceTable: React.FC<RepeatabilitySequenceTableProps> = ({
  readings,
  activeRun,
  targetLoadKg,
  selectedRunId,
  onSelectRun,
  onCaptureRun,
  onConfirmZeroReturn,
  onRecaptureRun,
  onOpenRunDetail,
  onOpenAuditModal,
  onOpenManualModal,
  allowableLimitGrams,
  isScaleStable = true,
  liveReadingKg = 15.002,
  userRole = 'METROLOGIST',
  isLocked = false,
}) => {
  const [showZeroTooltip, setShowZeroTooltip] = useState(false);

  const completedCount = readings.filter(
    (r) => r.observedReading !== undefined && r.zeroReturnConfirmed
  ).length;
  const currentItem = readings.find((r) => r.run === activeRun);
  const isReadOnly = userRole !== 'METROLOGIST' || isLocked;

  return (
    <div className="bg-white rounded-xl border border-foundation-200 shadow-xs overflow-hidden select-none">
      {/* Header with Live-Scale Chip (§9) and Progress */}
      <div className="p-4 border-b border-foundation-100 flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-white">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
              10-CYCLE REPEATABILITY SEQUENCE
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-foundation-100 text-foundation-700 font-semibold">
              {completedCount} / 10 complete
            </span>
          </div>
          <p className="text-xs text-foundation-500 mt-0.5">
            Successive applications of the same standard load with inter-cycle tare zero verification.
          </p>
        </div>

        {/* Live Hardware Scale Chip (§9) */}
        <div className="flex items-center gap-2 font-mono text-xs self-start md:self-auto">
          <div
            className={`px-3 py-1.5 rounded-lg border flex items-center gap-2 ${
              isScaleStable
                ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900'
                : 'bg-amber-50/80 border-amber-300 text-amber-900'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isScaleStable ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="font-bold text-[10px] uppercase">
              {isScaleStable ? 'STABLE' : 'UNSTABLE'}
            </span>
            <span className="font-bold">
              {isScaleStable
                ? `${liveReadingKg.toFixed(3)} kg`
                : `${(liveReadingKg - 0.004).toFixed(3)} ↕ ${(liveReadingKg + 0.004).toFixed(3)} kg`}
            </span>
          </div>

          {activeRun <= 10 && currentItem && (
            <span className="px-2.5 py-1.5 rounded-lg bg-brand-50 text-brand-700 border border-brand-200 font-bold">
              RUN #{activeRun.toString().padStart(2, '0')}
            </span>
          )}
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="bg-foundation-50/75 border-b border-foundation-200 text-[11px] text-foundation-500 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-4">Run</th>
              <th className="py-2.5 px-3">
                <div className="flex items-center gap-1">
                  <span>Zero Return</span>
                  <div className="relative inline-block">
                    <button
                      type="button"
                      onMouseEnter={() => setShowZeroTooltip(true)}
                      onMouseLeave={() => setShowZeroTooltip(false)}
                      onClick={() => setShowZeroTooltip((p) => !p)}
                      className="text-foundation-400 hover:text-foundation-600 cursor-pointer"
                    >
                      <HelpCircle size={12} />
                    </button>
                    {showZeroTooltip && (
                      <div className="absolute left-0 top-5 z-30 w-52 p-2 bg-foundation-900 text-white text-[10px] rounded shadow-lg normal-case font-sans">
                        The instrument should return to its zero indication before the next repeated measurement.
                      </div>
                    )}
                  </div>
                </div>
              </th>
              <th className="py-2.5 px-3">Observed Reading</th>
              <th className="py-2.5 px-3">Error</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foundation-100">
            {readings.map((r) => {
              const isSelected = selectedRunId === r.run;
              const isCurrent = activeRun === r.run && activeRun <= 10;
              const isCaptured = r.observedReading !== undefined;
              const isZeroWaiting = isCaptured && !r.zeroReturnConfirmed;
              const isOutlier = r.isOutlier || (r.errorGrams !== undefined && Math.abs(r.errorGrams) > allowableLimitGrams);

              return (
                <tr
                  key={r.run}
                  onClick={() => onSelectRun(r.run)}
                  className={`transition-colors cursor-pointer ${
                    isOutlier
                      ? 'bg-rose-50/70 border-l-4 border-l-rose-600'
                      : isSelected
                      ? 'bg-brand-50/70 border-l-4 border-l-brand-600'
                      : isCurrent
                      ? 'bg-blue-50/40'
                      : 'hover:bg-foundation-50/50'
                  }`}
                >
                  {/* Run Number + Outlier Badge (§27) */}
                  <td className="py-2.5 px-4 font-bold text-foundation-900 flex items-center gap-2">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        isOutlier
                          ? 'bg-rose-600 text-white'
                          : r.status === 'PASS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : isCurrent
                          ? 'bg-brand-600 text-white'
                          : 'bg-foundation-100 text-foundation-400'
                      }`}
                    >
                      {r.run.toString().padStart(2, '0')}
                    </span>
                    {isOutlier && (
                      <span className="text-[9px] font-bold text-rose-700 bg-rose-100 px-1.5 py-0.2 rounded border border-rose-300">
                        🔴 OUTLIER
                      </span>
                    )}
                    {isCurrent && !isOutlier && (
                      <span className="text-[9px] font-bold text-brand-600 bg-brand-50 px-1 rounded">
                        CURRENT
                      </span>
                    )}
                  </td>

                  {/* Zero Return State (§7) */}
                  <td className="py-2.5 px-3">
                    {r.zeroReturnConfirmed ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                        <Check size={12} />
                        <span>0.000 kg ✓</span>
                      </span>
                    ) : isZeroWaiting ? (
                      <button
                        type="button"
                        disabled={isReadOnly}
                        onClick={(e) => {
                          e.stopPropagation();
                          onConfirmZeroReturn(r.run);
                        }}
                        className={`px-2 py-0.5 rounded bg-amber-100 hover:bg-amber-200 text-amber-900 text-[10px] font-bold border border-amber-300 flex items-center gap-1 transition-colors cursor-pointer ${
                          isReadOnly ? 'opacity-60 cursor-not-allowed' : ''
                        }`}
                      >
                        <RotateCcw size={11} />
                        <span>Confirm 0.000 kg</span>
                      </button>
                    ) : isCurrent ? (
                      <span className="text-foundation-400 text-[11px]">Awaiting Load</span>
                    ) : (
                      <span className="text-foundation-300">—</span>
                    )}
                  </td>

                  {/* Observed Reading or Capture Button (§8) */}
                  <td className="py-2.5 px-3">
                    {isCaptured ? (
                      <span
                        className={`font-bold ${
                          isOutlier ? 'text-rose-700 font-extrabold' : 'text-foundation-900'
                        }`}
                      >
                        {r.observedReading?.toFixed(3)} kg
                      </span>
                    ) : isCurrent ? (
                      <button
                        type="button"
                        disabled={isReadOnly || !isScaleStable}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCaptureRun(r.run);
                        }}
                        title={
                          !isScaleStable
                            ? 'Scale reading unstable. Settle platter.'
                            : isReadOnly
                            ? 'Read-only mode active'
                            : `Capture reading for ${targetLoadKg.toFixed(3)} kg`
                        }
                        className={`px-3 py-1 rounded-md text-[11px] font-bold shadow-xs flex items-center gap-1.5 transition-colors cursor-pointer ${
                          !isScaleStable || isReadOnly
                            ? 'bg-foundation-300 text-foundation-500 cursor-not-allowed'
                            : 'bg-brand-600 hover:bg-brand-700 text-white'
                        }`}
                      >
                        <Cpu size={12} />
                        <span>Capture {targetLoadKg.toFixed(3)} kg</span>
                      </button>
                    ) : (
                      <span className="text-foundation-400">—</span>
                    )}
                  </td>

                  {/* Corrected Error */}
                  <td className="py-2.5 px-3 font-bold">
                    {r.errorGrams !== undefined ? (
                      <span
                        className={
                          isOutlier
                            ? 'text-rose-700 font-extrabold'
                            : r.status === 'PASS'
                            ? 'text-emerald-700'
                            : r.status === 'MARGINAL'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }
                      >
                        {(r.errorGrams > 0 ? '+' : '') + r.errorGrams.toFixed(1)} g
                      </span>
                    ) : (
                      <span className="text-foundation-300">—</span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="py-2.5 px-3">
                    {isOutlier ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle size={12} className="text-rose-600" />
                        <span>FAIL</span>
                      </span>
                    ) : r.status === 'PASS' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>PASS</span>
                      </span>
                    ) : r.status === 'MARGINAL' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        <AlertTriangle size={12} className="text-amber-600" />
                        <span>MARGINAL</span>
                      </span>
                    ) : r.status === 'FAIL' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <XCircle size={12} className="text-rose-600" />
                        <span>FAIL</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-foundation-100 text-foundation-500">
                        <span>○ PENDING</span>
                      </span>
                    )}
                  </td>

                  {/* Actions Column (ⓘ Detail, ⚑ Audit, Edit) */}
                  <td className="py-2.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                      {onOpenManualModal && !isReadOnly && (
                        <button
                          type="button"
                          onClick={() => onOpenManualModal(r.run)}
                          className="p-1 rounded text-foundation-400 hover:text-foundation-700 hover:bg-foundation-100 transition-colors cursor-pointer"
                          title={`Manually edit Run #${r.run}`}
                        >
                          <Edit3 size={13} />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => onOpenRunDetail(r.run)}
                        className="p-1 rounded text-foundation-400 hover:text-brand-600 hover:bg-brand-50 transition-colors cursor-pointer"
                        title={`View Run #${r.run} Details (OIML trace)`}
                      >
                        <Info size={13} />
                      </button>

                      <button
                        type="button"
                        onClick={() => onOpenAuditModal(r.run)}
                        className="p-1 rounded text-foundation-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                        title={`Add Audit Flag / Comment on Run #${r.run}`}
                      >
                        <Flag size={13} />
                      </button>
                    </div>
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
