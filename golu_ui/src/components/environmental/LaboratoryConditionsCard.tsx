import React, { useState } from 'react';
import {
  Thermometer,
  Droplets,
  Gauge,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Cpu,
  Clock,
} from 'lucide-react';

export interface EnvironmentalConditions {
  temperatureC: number;
  relativeHumidityPercent: number;
  pressureHpa: number;
  recorded: boolean;
  isStale?: boolean;
  staleMinutes?: number;
  timestamp: string;
  source: string;
  sensorId: string;
}

interface LaboratoryConditionsCardProps {
  conditions: EnvironmentalConditions;
  onUpdateConditions: (newConditions: EnvironmentalConditions) => void;
  disabled?: boolean;
}

export const LaboratoryConditionsCard: React.FC<LaboratoryConditionsCardProps> = ({
  conditions,
  onUpdateConditions,
  disabled = false,
}) => {
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const handleCaptureBaseline = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      onUpdateConditions({
        temperatureC: 23.4,
        relativeHumidityPercent: 48,
        pressureHpa: 1013,
        recorded: true,
        isStale: false,
        staleMinutes: 0,
        timestamp: '04 Oct 2026 · 16:12',
        source: 'Central Laboratory Sensor Network (OIML Environmental Unit)',
        sensorId: 'LM-ENV-2026-99',
      });
      setIsRefreshing(false);
    }, 400);
  };

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs select-none">
      {/* Top Header & Baseline State (§3, §4) */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-foundation-100 gap-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              !conditions.recorded
                ? 'bg-rose-500'
                : conditions.isStale
                ? 'bg-amber-500 animate-pulse'
                : 'bg-emerald-500'
            }`}
          />
          <span className="text-xs font-bold text-foundation-900 uppercase font-mono tracking-wider">
            AMBIENT LABORATORY CONDITIONS (LAB BASELINE)
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-foundation-100 text-foundation-600 font-semibold">
            METROLOGICAL DATUM
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Baseline State Badges (§4) */}
          {!conditions.recorded ? (
            <span className="text-xs font-mono font-bold text-rose-700 bg-rose-50 border border-rose-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <XCircle size={13} className="text-rose-600" />
              <span>✕ BASELINE NOT RECORDED</span>
            </span>
          ) : conditions.isStale ? (
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <AlertTriangle size={13} className="text-amber-600" />
              <span>⚠ BASELINE STALE ({conditions.staleMinutes || 26} min ago)</span>
            </span>
          ) : (
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-emerald-600" />
              <span>✓ BASELINE CAPTURED</span>
            </span>
          )}

          <button
            type="button"
            disabled={disabled || isRefreshing}
            onClick={handleCaptureBaseline}
            title={conditions.recorded ? 'Refresh Ambient Reading' : 'Capture Ambient Baseline'}
            className="text-xs font-mono text-foundation-700 hover:text-brand-600 flex items-center gap-1.5 px-3 py-1 rounded-md border border-foundation-200 hover:bg-foundation-50 transition-colors cursor-pointer bg-white"
          >
            <RefreshCw size={12} className={isRefreshing ? 'animate-spin text-brand-600' : ''} />
            <span>{conditions.recorded ? 'Refresh Reading' : 'Capture Baseline'}</span>
          </button>
        </div>
      </div>

      {/* Warning/Alert Banner if Baseline is Missing or Stale (§4) */}
      {!conditions.recorded && (
        <div className="mt-3 p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs font-mono text-rose-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <XCircle size={15} className="text-rose-600 shrink-0" />
            <span>Environmental testing cannot begin until baseline laboratory conditions are recorded.</span>
          </div>
          <button
            type="button"
            onClick={handleCaptureBaseline}
            className="px-2.5 py-1 bg-rose-600 text-white rounded font-bold hover:bg-rose-700 cursor-pointer"
          >
            Capture Now
          </button>
        </div>
      )}

      {conditions.recorded && conditions.isStale && (
        <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs font-mono text-amber-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle size={15} className="text-amber-600 shrink-0" />
            <span>Ambient conditions last captured {conditions.staleMinutes || 26} min ago. Statutory baseline should be refreshed before thermal testing.</span>
          </div>
          <button
            type="button"
            onClick={handleCaptureBaseline}
            className="px-2.5 py-1 bg-amber-600 text-white rounded font-bold hover:bg-amber-700 cursor-pointer"
          >
            Refresh
          </button>
        </div>
      )}

      {/* 3 Metric Parameter Cards (§3) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-3.5">
        {/* Metric 1: Ambient Temperature */}
        <div className="p-3.5 rounded-xl border border-foundation-200 bg-foundation-50/70 hover:bg-foundation-50 transition-colors">
          <div className="flex items-center justify-between text-foundation-500 mb-1">
            <span className="text-xs font-bold font-sans">Ambient Temperature</span>
            <Thermometer size={16} className="text-brand-600" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-black text-foundation-950">
              {conditions.temperatureC.toFixed(1)}
            </span>
            <span className="text-sm font-semibold text-foundation-500">°C</span>
          </div>
          <div className="text-[10px] text-foundation-500 font-mono mt-1 flex items-center justify-between">
            <span>Permissible Range:</span>
            <span className="font-bold text-foundation-700">10.0°C – 30.0°C</span>
          </div>
        </div>

        {/* Metric 2: Relative Humidity */}
        <div className="p-3.5 rounded-xl border border-foundation-200 bg-foundation-50/70 hover:bg-foundation-50 transition-colors">
          <div className="flex items-center justify-between text-foundation-500 mb-1">
            <span className="text-xs font-bold font-sans">Relative Humidity</span>
            <Droplets size={16} className="text-cyan-600" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-black text-foundation-950">
              {conditions.relativeHumidityPercent}
            </span>
            <span className="text-sm font-semibold text-foundation-500">% RH</span>
          </div>
          <div className="text-[10px] text-foundation-500 font-mono mt-1 flex items-center justify-between">
            <span>Permissible Range:</span>
            <span className="font-bold text-foundation-700">30% – 70% RH</span>
          </div>
        </div>

        {/* Metric 3: Atmospheric Pressure */}
        <div className="p-3.5 rounded-xl border border-foundation-200 bg-foundation-50/70 hover:bg-foundation-50 transition-colors">
          <div className="flex items-center justify-between text-foundation-500 mb-1">
            <span className="text-xs font-bold font-sans">Atmospheric Pressure</span>
            <Gauge size={16} className="text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-1.5 font-mono">
            <span className="text-2xl font-black text-foundation-950">
              {conditions.pressureHpa}
            </span>
            <span className="text-sm font-semibold text-foundation-500">hPa</span>
          </div>
          <div className="text-[10px] text-foundation-500 font-mono mt-1 flex items-center justify-between">
            <span>Standard Datum:</span>
            <span className="font-bold text-foundation-700">1013.25 ± 25 hPa</span>
          </div>
        </div>
      </div>

      {/* Sensor Baseline Source Footnote (§3, §29) */}
      <div className="mt-3.5 pt-3 border-t border-foundation-100 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-mono text-foundation-500 gap-1.5">
        <div className="flex items-center gap-2">
          <Cpu size={13} className="text-foundation-400" />
          <span>
            Lab Baseline Sensor: <strong className="text-foundation-700">{conditions.source}</strong> ({conditions.sensorId})
          </span>
        </div>
        <div className="text-[11px] text-foundation-400">
          Last Recorded: <span className="text-foundation-600 font-bold">{conditions.timestamp}</span>
        </div>
      </div>
    </div>
  );
};
