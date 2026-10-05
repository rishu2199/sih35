import React from 'react';
import {
  X,
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  ShieldCheck,
  FileText,
  Activity,
  ArrowRight,
} from 'lucide-react';
import { RepeatabilityReading } from './RepeatabilitySequenceTable';

interface RunDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  reading: RepeatabilityReading | null;
  targetLoadKg: number;
  allowableLimitGrams: number;
}

export const RunDetailDrawer: React.FC<RunDetailDrawerProps> = ({
  isOpen,
  onClose,
  reading,
  targetLoadKg,
  allowableLimitGrams,
}) => {
  if (!isOpen || !reading) return null;

  const errorGrams = reading.errorGrams ?? 0;
  const isPass = reading.status === 'PASS';
  const isFail = reading.status === 'FAIL';
  const isCaptured = reading.observedReading !== undefined;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-950/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl border-l border-foundation-200 flex flex-col justify-between">
          {/* Header */}
          <div className="p-5 border-b border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center font-mono font-bold text-sm">
                #{reading.run.toString().padStart(2, '0')}
              </div>
              <div>
                <h3 className="text-base font-bold text-foundation-950 font-sans tracking-tight">
                  Repeatability Run #{reading.run.toString().padStart(2, '0')}
                </h3>
                <span className="text-xs font-mono text-foundation-500">
                  OIML R 76-1 CL 3.6.1 Cycle Detail
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1 font-sans">
            {/* Status Hero */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between font-mono ${
                !isCaptured
                  ? 'bg-foundation-50 border-foundation-200 text-foundation-700'
                  : isFail
                  ? 'bg-rose-50 border-rose-300 text-rose-950'
                  : isPass
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-amber-50 border-amber-300 text-amber-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    !isCaptured
                      ? 'bg-foundation-300 text-white'
                      : isFail
                      ? 'bg-rose-600 text-white'
                      : isPass
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-600 text-white'
                  }`}
                >
                  {!isCaptured ? (
                    <Clock size={18} />
                  ) : isFail ? (
                    <XCircle size={18} />
                  ) : isPass ? (
                    <CheckCircle2 size={18} />
                  ) : (
                    <AlertTriangle size={18} />
                  )}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {!isCaptured ? 'Awaiting Capture' : reading.status}
                  </span>
                  <span className="text-[11px] opacity-80">
                    {!isCaptured
                      ? 'Measurement pending execution'
                      : isPass
                      ? 'Reading within allowable tolerance'
                      : 'Reading exceeds allowable tolerance'}
                  </span>
                </div>
              </div>
              {isCaptured && (
                <span className="text-lg font-extrabold">
                  {(errorGrams > 0 ? '+' : '') + errorGrams.toFixed(1)} g
                </span>
              )}
            </div>

            {/* Metrological Telemetry Specs */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-foundation-500 uppercase font-mono tracking-wider">
                Cycle Telemetry & Indications
              </h4>

              <div className="rounded-xl border border-foundation-200 divide-y divide-foundation-100 text-xs font-mono bg-foundation-50/50">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Zero Return (I₀)</span>
                  <span
                    className={`font-bold px-2 py-0.5 rounded ${
                      reading.zeroReturnConfirmed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {reading.zeroReturnConfirmed ? '0.000 kg ✓' : 'Pending Verification'}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Test Load Target</span>
                  <span className="font-bold text-foundation-900">
                    {targetLoadKg.toFixed(3)} kg
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Observed Indication (IL)</span>
                  <span className="font-bold text-foundation-900">
                    {reading.observedReading !== undefined
                      ? `${reading.observedReading.toFixed(3)} kg`
                      : '—'}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Calculated Error (Ec)</span>
                  <span className="font-bold text-foundation-900">
                    {reading.errorGrams !== undefined
                      ? `${(reading.errorGrams > 0 ? '+' : '') + reading.errorGrams.toFixed(1)} g`
                      : '—'}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Statutory MPE Limit</span>
                  <span className="font-bold text-foundation-700">
                    ±{allowableLimitGrams.toFixed(1)} g
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Recorded Timestamp</span>
                  <span className="text-foundation-600 text-[11px]">
                    {isCaptured ? '04 Oct 2026 · 15:36:22 IST' : '—'}
                  </span>
                </div>
              </div>
            </div>

            {/* Standard Weight Traceability Reference */}
            <div className="p-4 rounded-xl bg-foundation-50 border border-foundation-200 space-y-2">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} className="text-emerald-600" />
                <span className="text-xs font-bold text-foundation-800 font-mono">
                  Applied Traceable Working Standard
                </span>
              </div>
              <p className="text-xs text-foundation-600 leading-relaxed font-sans">
                Standard Set: <strong className="font-mono text-foundation-900">STD-F1-2026-004</strong> (OIML R 111-1 Class F1).
                Certificate valid through <strong>15 Dec 2026</strong>.
              </p>
            </div>

            {/* Statutory Standard Citation */}
            <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 font-mono">
                <FileText size={14} className="text-blue-700" />
                <span>OIML R 76-1 CL 3.6.1 &amp; Clause A.4.10</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                The difference between the results of several weighings of the same load shall not exceed the absolute value of the maximum permissible error of the instrument for that load.
              </p>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-foundation-900 hover:bg-foundation-800 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              Close Detail
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
