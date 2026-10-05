import React from 'react';
import {
  Check,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
} from 'lucide-react';
import { WeightReading, CapturedReadingLog } from './types';

interface LiveWeightIndicatorProps {
  reading: WeightReading;
  isConnected: boolean;
  onCapture: () => void;
  onZero: () => void;
  onTare: () => void;
  onToggleGrossNet: (mode: 'GROSS' | 'NET') => void;
  activeMode: 'GROSS' | 'NET';
  lastCaptured: CapturedReadingLog | null;
  onUseInTest?: () => void;
  autoCapture: boolean;
  onToggleAutoCapture: (val: boolean) => void;
  isReadOnly?: boolean;
}

export const LiveWeightIndicator: React.FC<LiveWeightIndicatorProps> = ({
  reading,
  isConnected,
  onCapture,
  onZero,
  onTare,
  onToggleGrossNet,
  activeMode,
  lastCaptured,
  onUseInTest,
  autoCapture,
  onToggleAutoCapture,
  isReadOnly = false,
}) => {
  const currentWeight = activeMode === 'GROSS' ? reading.grossWeight : reading.netWeight;
  const isZero = currentWeight === 0.0 || Math.abs(currentWeight) < 0.0005;

  return (
    <div className="bg-white border border-foundation-200 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between relative overflow-hidden h-full">
      {/* Subtle background glow */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-brand-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Controls: Gross/Net Segmented Pills + Stability Beacon */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-foundation-100 relative z-10">
        {/* Gross / Net Pills */}
        <div className="flex items-center gap-1 p-1 bg-foundation-100 rounded-xl border border-foundation-200">
          <button
            type="button"
            onClick={() => onToggleGrossNet('GROSS')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeMode === 'GROSS'
                ? 'bg-white text-foundation-900 shadow-xs border border-foundation-200'
                : 'text-foundation-500 hover:text-foundation-900'
            }`}
          >
            [ GROSS ]
          </button>
          <button
            type="button"
            onClick={() => onToggleGrossNet('NET')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
              activeMode === 'NET'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-foundation-500 hover:text-foundation-900'
            }`}
          >
            [ NET ]
          </button>
        </div>

        {/* Live Stability Beacon */}
        <div className="flex items-center gap-2">
          {!isConnected ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1 rounded-full bg-foundation-100 text-foundation-600 border border-foundation-200">
              <span className="w-2 h-2 rounded-full bg-foundation-400" />
              <span>○ DISCONNECTED</span>
            </span>
          ) : reading.isStable ? (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ring-4 ring-emerald-200" />
              <span>● STABLE</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold px-3 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300 shadow-xs">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
              <span>◌ UNSTABLE</span>
            </span>
          )}
        </div>
      </div>

      {/* Hero 7-Segment Weight Display Area */}
      <div className="my-6 py-6 text-center flex flex-col items-center justify-center relative z-10">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[11px] font-bold text-foundation-400 uppercase tracking-widest font-mono">
            LIVE WEIGHT
          </span>
          {isZero && isConnected && (
            <span className="inline-flex items-center font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">
              ZERO POSITION
            </span>
          )}
        </div>

        {/* 7-Segment Instrument Box with Dark Palette */}
        <div className="w-full max-w-lg inline-flex items-baseline justify-center gap-4 px-8 py-7 rounded-3xl bg-slate-900 text-emerald-400 border-4 border-slate-800 shadow-inner font-mono select-none">
          <span className="text-6xl sm:text-7xl font-extrabold tracking-tight font-mono-numbers">
            {isConnected ? currentWeight.toFixed(3) : '-------'}
          </span>
          <span className="text-2xl sm:text-3xl font-bold text-emerald-500/80 font-sans">
            {reading.unit}
          </span>
        </div>

        {/* Micro tare / gross status */}
        <div className="flex items-center gap-4 mt-3 text-xs font-mono text-foundation-500">
          <span>
            Tare: <strong className="text-foundation-800 font-bold">{reading.tareWeight.toFixed(3)} kg</strong>
          </span>
          <span>•</span>
          <span>
            Gross: <strong className="text-foundation-800 font-bold">{reading.grossWeight.toFixed(3)} kg</strong>
          </span>
        </div>
      </div>

      {/* Hardware Keypad Actions & Capture CTA */}
      <div className="space-y-4 pt-4 border-t border-foundation-100 relative z-10">
        {/* Zero and Tare buttons */}
        {!isReadOnly && (
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              disabled={!isConnected}
              onClick={onZero}
              className="py-2.5 px-4 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 disabled:opacity-40 text-xs font-mono font-bold text-foundation-800 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>&gt;0&lt; ZERO SCALE</span>
            </button>

            <button
              type="button"
              disabled={!isConnected}
              onClick={onTare}
              className="py-2.5 px-4 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 disabled:opacity-40 text-xs font-mono font-bold text-foundation-800 transition-all flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>&gt;T&lt; TARE LOAD</span>
            </button>
          </div>
        )}

        {/* Hero Capture Button */}
        {!isReadOnly && (
          <div>
            <button
              type="button"
              disabled={!isConnected || !reading.isStable}
              onClick={onCapture}
              className={`w-full py-4 px-6 rounded-2xl text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 ${
                !isConnected
                  ? 'bg-foundation-200 text-foundation-400 cursor-not-allowed'
                  : !reading.isStable
                  ? 'bg-amber-100 text-amber-900 border border-amber-300 cursor-not-allowed'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white hover:shadow-lg cursor-pointer'
              }`}
            >
              <CheckCircle2 size={18} />
              <span>
                {!isConnected
                  ? 'Scale Disconnected'
                  : !reading.isStable
                  ? 'Wait for a stable reading before capture.'
                  : `Capture Reading → (${currentWeight.toFixed(3)} ${reading.unit})`}
              </span>
            </button>
          </div>
        )}

        {/* Auto-Capture Toggle Banner */}
        {!isReadOnly && (
          <div className="p-3.5 rounded-2xl bg-foundation-50 border border-foundation-200 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-foundation-800">
                  AUTO-CAPTURE STABLE READINGS
                </span>
                {autoCapture && reading.isStable && isConnected && (
                  <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 animate-pulse">
                    ✓ Automatically captured
                  </span>
                )}
              </div>
              <p className="text-[11px] text-foundation-500 font-sans mt-0.5">
                Stable readings are automatically inserted into the active test row.
              </p>
            </div>

            <button
              type="button"
              onClick={() => onToggleAutoCapture(!autoCapture)}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all flex items-center gap-1.5 ${
                autoCapture
                  ? 'bg-brand-600 text-white shadow-xs'
                  : 'bg-foundation-200 text-foundation-700 hover:bg-foundation-300'
              }`}
            >
              <span>{autoCapture ? '[ ON ]' : '[ OFF ]'}</span>
            </button>
          </div>
        )}

        {/* Capture Confirmation Card */}
        {lastCaptured && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-fade-in shadow-xs">
            <div className="flex items-start gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-950 font-sans">
                    ✓ READING CAPTURED
                  </span>
                  <span className="font-mono text-xs font-extrabold text-emerald-800">
                    {lastCaptured.weight} {lastCaptured.unit}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-emerald-700 mt-0.5">
                  Source: Scale Bridge • Time: {lastCaptured.timestamp} • Mode: {lastCaptured.mode}
                </div>
              </div>
            </div>

            {onUseInTest && !isReadOnly && (
              <button
                type="button"
                onClick={onUseInTest}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shrink-0 shadow-xs cursor-pointer"
              >
                <span>Insert into active test</span>
                <ArrowRight size={13} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
