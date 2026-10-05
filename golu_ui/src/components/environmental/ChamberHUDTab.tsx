import React, { useState, useEffect } from 'react';
import {
  Thermometer,
  Gauge,
  Activity,
  Flame,
  Snowflake,
  Clock,
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Cpu,
  Sliders,
  Sparkles,
  Target,
  WifiOff,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

export type ChamberOperationalStatus =
  | 'IDLE'
  | 'PREPARING'
  | 'HEATING'
  | 'COOLING'
  | 'TARGET_REACHED'
  | 'SOAKING'
  | 'STABLE_HOLDING'
  | 'CAPTURE';

interface ChamberHUDTabProps {
  currentTempC?: number;
  targetTempC?: number;
  humidityPercent?: number;
  pressureHpa?: number;
  isDisconnected?: boolean;
  onReconnect?: () => void;
  onSimulateStage?: (tempC: number) => void;
  disabled?: boolean;
}

export const ChamberHUDTab: React.FC<ChamberHUDTabProps> = ({
  currentTempC: initialTemp = 39.8,
  targetTempC: initialTarget = 40.0,
  humidityPercent: initialHumidity = 41,
  pressureHpa: initialPressure = 1011,
  isDisconnected = false,
  onReconnect,
  onSimulateStage,
  disabled = false,
}) => {
  const [currentTemp, setCurrentTemp] = useState<number>(initialTemp);
  const [targetTemp, setTargetTemp] = useState<number>(initialTarget);
  const [humidity, setHumidity] = useState<number>(initialHumidity);
  const [pressure, setPressure] = useState<number>(initialPressure);
  const [status, setStatus] = useState<ChamberOperationalStatus>('SOAKING');
  const [soakSeconds, setSoakSeconds] = useState<number>(1122); // 18m 42s
  const [hasAnomaly, setHasAnomaly] = useState<boolean>(false);

  // Live soak timer ticker (§21)
  useEffect(() => {
    if (isDisconnected) return;
    const timer = setInterval(() => {
      setSoakSeconds((prev) => Math.min(1200, prev + 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [isDisconnected]);

  const formatTimer = (totalSecs: number) => {
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const isSoakComplete = soakSeconds >= 1200;
  const soakPercent = Math.min(100, Math.round((soakSeconds / 1200) * 100));

  // Demo controls (§24)
  const handleSelectSimulateTemp = (temp: number) => {
    setTargetTemp(temp);
    if (temp > currentTemp) {
      setStatus('HEATING');
      setCurrentTemp(temp - 0.2);
    } else if (temp < currentTemp) {
      setStatus('COOLING');
      setCurrentTemp(temp + 0.2);
    } else {
      setStatus('SOAKING');
    }
    setSoakSeconds(1122);
    if (onSimulateStage) onSimulateStage(temp);
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'HEATING':
        return {
          label: '🔥 HEATING TO TARGET',
          color: 'bg-rose-50 text-rose-800 border-rose-300',
          dot: 'bg-rose-500 animate-pulse',
        };
      case 'COOLING':
        return {
          label: '❄ COOLING TO TARGET',
          color: 'bg-cyan-50 text-cyan-800 border-cyan-300',
          dot: 'bg-cyan-500 animate-pulse',
        };
      case 'TARGET_REACHED':
        return {
          label: '◎ TARGET REACHED',
          color: 'bg-indigo-50 text-indigo-800 border-indigo-300',
          dot: 'bg-indigo-500',
        };
      case 'SOAKING':
        return {
          label: '◌ SOAKING IN PROGRESS',
          color: 'bg-amber-50 text-amber-800 border-amber-300',
          dot: 'bg-amber-500 animate-pulse',
        };
      case 'STABLE_HOLDING':
      case 'CAPTURE':
      default:
        return {
          label: '✓ TARGET STABLE · HOLDING',
          color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          dot: 'bg-emerald-500',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-6 select-none font-mono">
      {/* 1. Chamber Disconnected Alert (§23) */}
      {isDisconnected ? (
        <div className="p-4 sm:p-5 rounded-xl bg-amber-50 border border-amber-300 text-amber-950 font-mono text-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-600 text-white flex items-center justify-center shrink-0">
              <WifiOff size={18} />
            </div>
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-900">
                ⚠ CHAMBER DISCONNECTED (§23)
              </h4>
              <p className="text-[11px] text-amber-800 font-sans mt-0.5">
                Live environmental data unavailable. Last received: +38.9°C · 42% RH · 1012 hPa.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onReconnect}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors cursor-pointer self-start sm:self-auto shrink-0 flex items-center gap-1.5"
          >
            <RefreshCw size={12} />
            <span>Reconnect Chamber</span>
          </button>
        </div>
      ) : null}

      {/* 2. Environmental Anomaly Alert (§32) */}
      {hasAnomaly && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-300 text-rose-950 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={16} className="text-rose-600 shrink-0" />
            <div>
              <span className="font-bold">⚠ ENVIRONMENTAL ANOMALY: </span>
              <span>Temperature overshoot +40.8°C (Target: +40.0°C).</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setHasAnomaly(false)}
            className="px-2.5 py-1 bg-white border border-rose-300 text-rose-900 font-bold rounded hover:bg-rose-100 cursor-pointer"
          >
            Acknowledge
          </button>
        </div>
      )}

      {/* 3. Demo Simulator Preset Bar (§24) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-3 shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-brand-100 text-brand-900 px-2 py-0.5 rounded uppercase">
              ● DEMO SIMULATOR (§24)
            </span>
            <span className="text-xs text-foundation-500 font-sans">
              Climatic stage switcher:
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <button
              type="button"
              onClick={() => handleSelectSimulateTemp(20.0)}
              className="px-2.5 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-semibold cursor-pointer"
            >
              Simulate +20°C
            </button>
            <button
              type="button"
              onClick={() => handleSelectSimulateTemp(40.0)}
              className="px-2.5 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-semibold cursor-pointer"
            >
              Simulate +40°C
            </button>
            <button
              type="button"
              onClick={() => handleSelectSimulateTemp(-10.0)}
              className="px-2.5 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-semibold cursor-pointer"
            >
              Simulate −10°C
            </button>
            <button
              type="button"
              onClick={() => handleSelectSimulateTemp(20.0)}
              className="px-2.5 py-1 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-semibold cursor-pointer"
            >
              Simulate Recovery
            </button>
            <button
              type="button"
              onClick={() => setHasAnomaly((p) => !p)}
              className="px-2 py-1 rounded bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-semibold cursor-pointer text-[11px]"
            >
              Toggle Anomaly (§32)
            </button>
          </div>
        </div>
      </div>

      {/* 4. Chamber Status & Live Environment (§20) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CHAMBER STATUS */}
        <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-foundation-100">
            <span className="font-bold text-foundation-900 uppercase text-xs">
              CHAMBER STATUS (§20)
            </span>
            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border flex items-center gap-1.5 ${statusBadge.color}`}>
              <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
              <span>{statusBadge.label}</span>
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Target Temperature:</span>
              <span className="font-bold text-foundation-900">{targetTemp > 0 ? `+${targetTemp.toFixed(1)}` : targetTemp.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Actual Chamber Temperature:</span>
              <span className="font-bold text-foundation-900">{currentTemp > 0 ? `+${currentTemp.toFixed(1)}` : currentTemp.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Soak Time Recorded:</span>
              <span className="font-bold text-foundation-900">{formatTimer(soakSeconds)}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Required Soak Window:</span>
              <span className="font-bold text-foundation-700">20:00 min</span>
            </div>
          </div>
        </div>

        {/* LIVE ENVIRONMENT */}
        <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-foundation-100">
            <span className="font-bold text-foundation-900 uppercase text-xs">
              LIVE ENVIRONMENT (§20)
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
              ✓ Stable Sensor Stream
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Temperature (Chamber):</span>
              <span className="font-bold text-foundation-900">+{currentTemp.toFixed(1)} °C</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Relative Humidity:</span>
              <span className="font-bold text-foundation-900">{humidity} % RH</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Atmospheric Pressure:</span>
              <span className="font-bold text-foundation-900">{pressure} hPa</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-foundation-50 border border-foundation-100">
              <span className="text-foundation-500">Chamber Model ID:</span>
              <span className="font-bold text-foundation-700">ESPEC-PL-3KP-2026</span>
            </div>
          </div>
        </div>
      </div>

      {/* 5. Large Visual Soak Timer (§21) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs text-center space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-foundation-100">
          <span className="text-xs font-bold text-foundation-500 uppercase tracking-wider">
            SOAK TIMER &amp; THERMAL EQUILIBRIUM (§21)
          </span>
          <span className="text-xs font-bold text-brand-700">
            {isSoakComplete ? '✓ SOAK COMPLETE' : 'IN PROGRESS'}
          </span>
        </div>

        <div className="py-2">
          <div className="text-5xl font-extrabold text-foundation-950 tracking-tight">
            {formatTimer(soakSeconds)}
          </div>
          <span className="text-xs text-foundation-500 mt-1 block">
            of 20:00 Required Thermal Soak Window (OIML CL 3.9.2.1)
          </span>
        </div>

        {/* Progress Bar (§21) */}
        <div className="max-w-md mx-auto space-y-1.5 text-left">
          <div className="flex justify-between text-[11px] font-bold">
            <span className="text-foundation-600">Soak Equilibrium Progress</span>
            <span className={isSoakComplete ? 'text-emerald-700' : 'text-brand-700'}>
              {soakPercent}%
            </span>
          </div>
          <div className="w-full bg-foundation-200 h-3 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                isSoakComplete ? 'bg-emerald-500' : 'bg-brand-600'
              }`}
              style={{ width: `${soakPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-foundation-400">
            <span>00:00 Start</span>
            <span>10:00 Halfway</span>
            <span>20:00 Soak Complete</span>
          </div>
        </div>
      </div>
    </div>
  );
};
