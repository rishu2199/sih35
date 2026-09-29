import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Zap,
  Radio,
  SlidersHorizontal,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { SerialTelemetryPacket } from './webserial_client';
import { WebSerialScaleClient } from './webserial_client';

interface VirtualScaleSimulatorProps {
  isActive: boolean;
  onToggleActive: (active: boolean) => void;
  onEmitPacket: (packet: SerialTelemetryPacket) => void;
  onCaptureReading?: (weight: number, isStable: boolean) => void;
  className?: string;
}

export const VirtualScaleSimulator: React.FC<VirtualScaleSimulatorProps> = ({
  isActive,
  onToggleActive,
  onEmitPacket,
  onCaptureReading,
  className = '',
}) => {
  // Instrument Specifications
  const [protocol, setProtocol] = useState<'CAS' | 'METTLER_TOLEDO_SICS' | 'AVERY_SMA'>('CAS');
  const e = 5; // 5 g interval
  const unit: 'g' | 'kg' = 'g';

  // Mechanical state
  const [appliedLoad, setAppliedLoad] = useState<number>(10000); // Default 10 kg (2000e boundary)
  const [auxiliaryLoad, setAuxiliaryLoad] = useState<number>(0); // ΔL fractional weights
  const [tareWeight, setTareWeight] = useState<number>(0);
  const [zeroOffset, setZeroOffset] = useState<number>(0);

  // Dynamic Telemetry State
  const [instantWeight, setInstantWeight] = useState<number>(10000);
  const [isStable, setIsStable] = useState<boolean>(true);
  const [settlingProgress, setSettlingProgress] = useState<number>(100);
  const [streamRateHz, setStreamRateHz] = useState<number>(5); // 5 packets/sec

  // Physics animation ref
  const loadChangeTimestamp = useRef<number>(Date.now());
  const settlingDurationMs = 1200; // 1.2s settling time

  // Change applied load with realistic physical settling transition
  const handleApplyWeight = useCallback((targetWeight: number) => {
    setAppliedLoad(targetWeight);
    loadChangeTimestamp.current = Date.now();
    setIsStable(false);
    setSettlingProgress(0);
  }, []);

  // Tare platter
  const handleTare = useCallback(() => {
    setTareWeight(appliedLoad + auxiliaryLoad);
    loadChangeTimestamp.current = Date.now();
    setIsStable(false);
    setSettlingProgress(0);
  }, [appliedLoad, auxiliaryLoad]);

  // Re-Zero pan
  const handleZero = useCallback(() => {
    setZeroOffset(appliedLoad + auxiliaryLoad - tareWeight);
    loadChangeTimestamp.current = Date.now();
    setIsStable(false);
    setSettlingProgress(0);
  }, [appliedLoad, auxiliaryLoad, tareWeight]);

  // Continuous physics simulation ticker loop
  useEffect(() => {
    if (!isActive) return;

    const intervalMs = Math.round(1000 / streamRateHz);
    const timer = setInterval(() => {
      const now = Date.now();
      const elapsed = now - loadChangeTimestamp.current;
      const netTarget = (appliedLoad + auxiliaryLoad) - tareWeight - zeroOffset;

      let currentVal: number;
      let stableNow: boolean;

      if (elapsed < settlingDurationMs) {
        // Damped harmonic oscillation + Gaussian noise
        const progress = elapsed / settlingDurationMs;
        setSettlingProgress(Math.round(progress * 100));

        const omega = 18.0; // Rad/s oscillation
        const damping = Math.exp(-progress * 4.0);
        const oscillation = damping * Math.cos(omega * (elapsed / 1000));
        const noise = (Math.random() - 0.5) * (e * 1.5 * damping);

        currentVal = netTarget * (1.0 - oscillation) + noise;
        stableNow = false;
      } else {
        // Settled state: small ambient air jitter ±0.1e
        setSettlingProgress(100);
        const ambientNoise = (Math.random() - 0.5) * (e * 0.1);
        currentVal = netTarget + ambientNoise;
        stableNow = true;
      }

      // Quantize to scale interval e for digital indicator display
      const quantized = Math.round(currentVal / e) * e;
      setInstantWeight(quantized);
      setIsStable(stableNow);

      // Generate raw ASCII packet per protocol
      let rawLine = '';
      const modeStr = tareWeight > 0 ? 'NT' : 'GS';
      const absVal = Math.abs(quantized);
      const signStr = quantized >= 0 ? '+' : '-';
      const isKg = (unit as string) === 'kg';

      if (protocol === 'CAS') {
        const statusStr = stableNow ? 'ST' : 'US';
        const formattedVal = (absVal / (isKg ? 1000 : 1)).toFixed(isKg ? 3 : 1).padStart(8, '0');
        rawLine = `${statusStr},${modeStr},${signStr}${formattedVal}${unit}\r\n`;
      } else if (protocol === 'METTLER_TOLEDO_SICS') {
        const statusStr = stableNow ? 'S' : 'D';
        const formattedVal = (quantized / (isKg ? 1000 : 1)).toFixed(isKg ? 3 : 1);
        rawLine = `S ${statusStr} ${formattedVal} ${unit}\r\n`;
      } else {
        // AVERY_SMA
        const motionFlag = stableNow ? ' ' : 'M';
        const formattedVal = (quantized / (isKg ? 1000 : 1)).toFixed(isKg ? 3 : 1);
        rawLine = `SMA: ${formattedVal} ${unit.toUpperCase()} ${modeStr[0]}${motionFlag}\r\n`;
      }

      // Parse and broadcast packet to application bus
      const packet = WebSerialScaleClient.parseLine(rawLine);
      onEmitPacket(packet);
    }, intervalMs);

    return () => clearInterval(timer);
  }, [
    isActive,
    streamRateHz,
    appliedLoad,
    auxiliaryLoad,
    tareWeight,
    zeroOffset,
    e,
    protocol,
    unit,
    onEmitPacket,
  ]);

  const presetWeights = [
    { label: 'Zero Load', sub: '0e Platter', value: 0 },
    { label: 'Min Capacity', sub: '20e Minimum', value: 100 },
    { label: 'Calibration Load', sub: '100e Mid-step', value: 500 },
    { label: '1st MPE Boundary', sub: '500e (±0.5e)', value: 2500 },
    { label: '2nd MPE Boundary', sub: '2000e (±1.0e)', value: 10000, highlight: true },
    { label: 'Max Capacity', sub: '3000e (±1.5e)', value: 15000 },
  ];

  return (
    <div
      className={`rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs dark:shadow-card card-sheen relative overflow-hidden transition-all ${className}`}
    >
      {/* Header bar with toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <Radio className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                Virtual Scale Simulator
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                RS-232 / USB Emulation
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Continuous telemetry stream with simulated load cell damping and OIML R 76 motion flags.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
            Simulator Engine:
          </span>
          <button
            type="button"
            onClick={() => onToggleActive(!isActive)}
            className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 ${
              isActive ? 'bg-emerald-600' : 'bg-slate-300 dark:bg-slate-700'
            }`}
            role="switch"
            aria-checked={isActive}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                isActive ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Simulator Active Workspace */}
      <div className="p-5 space-y-5">
        {/* Top Controls: Protocol, Baud/Rate, and Settling Indicator */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Emulated Indicator Protocol
            </label>
            <select
              value={protocol}
              onChange={(e) => setProtocol(e.target.value as any)}
              className="w-full text-xs font-mono rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-brand-500"
            >
              <option value="CAS">CAS CI-Series (Continuous Stream)</option>
              <option value="METTLER_TOLEDO_SICS">Mettler-Toledo SICS (Command/Response)</option>
              <option value="AVERY_SMA">Avery Weigh-Tronix / SMA Standard</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              Telemetry Stream Rate
            </label>
            <div className="flex items-center gap-2">
              {[2, 5, 10].map((hz) => (
                <button
                  key={hz}
                  onClick={() => setStreamRateHz(hz)}
                  className={`flex-1 py-1.5 text-xs font-mono font-medium rounded-lg border transition-all cursor-pointer ${
                    streamRateHz === hz
                      ? 'bg-brand-50 border-brand-500 text-brand-700 dark:bg-brand-950/80 dark:border-brand-400 dark:text-brand-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {hz} Hz
                </button>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5">
              <span>Mechanical Settling Status</span>
              <span className="font-mono text-slate-500">{settlingProgress}%</span>
            </div>
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden border border-slate-200 dark:border-slate-700">
              <div
                className={`h-full transition-all duration-150 ${
                  isStable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
                }`}
                style={{ width: `${settlingProgress}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-1 text-[10px] font-mono">
              <span className={`whitespace-nowrap ${isStable ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-amber-500 font-bold'}`}>
                {isStable ? '● STABLE (LOCKED)' : '◌ MOTION DETECTED (US)'}
              </span>
              <span className="text-slate-400">1.2s Damping Curve</span>
            </div>
          </div>
        </div>

        {/* Preset Weights Selector Ribbon */}
        <div>
          <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
            Quick Standard Weights (Place on Virtual Platter)
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {presetWeights.map((w) => (
              <button
                key={w.value}
                onClick={() => handleApplyWeight(w.value)}
                className={`flex flex-col items-center justify-center p-2.5 rounded-lg border text-left transition-all cursor-pointer ${
                  appliedLoad === w.value
                    ? 'border-brand-500 bg-brand-50/80 dark:bg-brand-950/70 text-brand-900 dark:text-brand-100 ring-2 ring-brand-500/20 shadow-sm'
                    : w.highlight
                    ? 'border-amber-300 dark:border-amber-700 bg-amber-50/40 dark:bg-amber-950/20 text-slate-800 dark:text-slate-200 hover:border-amber-400'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-xs font-mono font-bold">{w.value.toLocaleString()} g</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 truncate w-full text-center">
                  {w.sub}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Fine Tuning Auxiliary Weights (ΔL) for Changeover Testing */}
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/30 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-brand-500" />
              Auxiliary Weights (ΔL) Fine Adjustment — Clause A.4.4.3 Changeover Points
            </span>
            <span className="font-mono font-bold text-brand-600 dark:text-brand-400">
              +{auxiliaryLoad.toFixed(1)} g
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={e * 2}
            step={0.1}
            value={auxiliaryLoad}
            onChange={(e) => {
              const val = parseFloat(e.target.value);
              setAuxiliaryLoad(val);
              loadChangeTimestamp.current = Date.now();
              setIsStable(false);
            }}
            className="w-full accent-brand-600 cursor-pointer"
          />
          <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
            <span>0.0 g (No Fractional Aux)</span>
            <span>0.5e = {(e * 0.5).toFixed(1)} g</span>
            <span>1.0e = {e.toFixed(1)} g</span>
            <span>2.0e = {(e * 2).toFixed(1)} g</span>
          </div>
        </div>

        {/* Action Controls: Tare, Re-Zero, Manual Weight Input, and Capture */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleZero}
              className="text-xs font-mono"
            >
              Re-Zero (Z)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTare}
              className="text-xs font-mono"
            >
              Tare (T)
            </Button>
            {tareWeight > 0 && (
              <span className="text-xs font-mono px-2 py-1 rounded bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                Tare Active: {tareWeight} g
              </span>
            )}
          </div>

          {onCaptureReading && (
            <Button
              variant="primary"
              size="sm"
              disabled={!isStable}
              onClick={() => onCaptureReading(instantWeight, isStable)}
              className={`text-xs font-semibold cursor-pointer ${
                isStable
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                  : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5 mr-1 text-amber-400" />
              {isStable ? 'Capture Stable Reading to Grid (Spacebar)' : 'Waiting for Stability...'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
