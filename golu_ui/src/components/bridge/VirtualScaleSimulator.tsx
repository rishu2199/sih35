import React from 'react';
import { Activity, Play, Square, Sparkles, RefreshCw } from 'lucide-react';
import { ScaleProtocol } from './types';

interface VirtualScaleSimulatorProps {
  activeProtocol: ScaleProtocol;
  onChangeProtocol: (proto: ScaleProtocol) => void;
  targetWeight: number;
  onSetTargetWeight: (wt: number) => void;
  isSimulatingUnstable: boolean;
  onToggleUnstable: () => void;
  isSimulatingActive: boolean;
  onToggleSimulatorActive: () => void;
  onResetZero: () => void;
}

export const VirtualScaleSimulator: React.FC<VirtualScaleSimulatorProps> = ({
  activeProtocol,
  onChangeProtocol,
  targetWeight,
  onSetTargetWeight,
  isSimulatingUnstable,
  onToggleUnstable,
  isSimulatingActive,
  onToggleSimulatorActive,
  onResetZero,
}) => {
  const PRESET_LOADS = [
    { label: '0.000 kg (Zero)', value: 0.0 },
    { label: '5.000 kg (1/6 Max)', value: 5.0 },
    { label: '15.005 kg (1/2 Max)', value: 15.005 },
    { label: '30.000 kg (Full Scale)', value: 30.0 },
  ];

  return (
    <div className="bg-gradient-to-r from-foundation-900 to-slate-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg space-y-5">
      {/* Simulator Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center ring-1 ring-indigo-500/30">
            <Sparkles size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/30 text-indigo-300 border border-indigo-500/40">
                {isSimulatingActive ? 'VIRTUAL SCALE ● ACTIVE' : 'VIRTUAL SCALE [ OFF ]'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Status: {isSimulatingActive ? 'Receiving simulated packets' : 'Simulator Paused'}
              </span>
            </div>
            <h3 className="text-base font-bold tracking-tight font-sans text-white mt-0.5">
              Zero-Hardware Scale Simulator
            </h3>
          </div>
        </div>

        {/* Start / Stop Toggle */}
        <button
          type="button"
          onClick={onToggleSimulatorActive}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm cursor-pointer ${
            isSimulatingActive
              ? 'bg-rose-600 hover:bg-rose-700 text-white'
              : 'bg-emerald-600 hover:bg-emerald-700 text-white'
          }`}
        >
          {isSimulatingActive ? <Square size={13} /> : <Play size={13} />}
          <span>{isSimulatingActive ? 'Stop Simulator' : 'Load Simulator'}</span>
        </button>
      </div>

      {/* Protocol Selector & Stability Toggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-xs">
        {/* Protocol Selector (§21) */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            PROTOCOL
          </span>
          <div className="grid grid-cols-3 gap-2">
            {(['CAS', 'METTLER_SICS', 'AVERY_SMA'] as ScaleProtocol[]).map((proto) => (
              <button
                key={proto}
                type="button"
                onClick={() => onChangeProtocol(proto)}
                className={`py-2 px-2.5 rounded-xl text-center font-mono font-bold transition-all truncate border cursor-pointer ${
                  activeProtocol === proto
                    ? 'bg-brand-600 text-white border-brand-500 shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'
                }`}
              >
                {proto === 'CAS' ? 'CAS' : proto === 'METTLER_SICS' ? 'Mettler SICS' : 'Avery SMA'}
              </button>
            ))}
          </div>
        </div>

        {/* Load Stability Simulation */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            SIMULATE STABILITY
          </span>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                if (isSimulatingUnstable) onToggleUnstable();
              }}
              className={`py-2 px-3 rounded-xl font-bold transition-all border cursor-pointer ${
                !isSimulatingUnstable
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'
              }`}
            >
              ● Force Stable
            </button>

            <button
              type="button"
              onClick={() => {
                if (!isSimulatingUnstable) onToggleUnstable();
              }}
              className={`py-2 px-3 rounded-xl font-bold transition-all border cursor-pointer ${
                isSimulatingUnstable
                  ? 'bg-amber-600 text-white border-amber-500 animate-pulse'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'
              }`}
            >
              ◌ Fluctuate / Unstable
            </button>
          </div>
        </div>
      </div>

      {/* Applied Load Slider & Quick Presets */}
      <div className="space-y-3 pt-3 border-t border-slate-800">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
            Simulated Applied Load
          </span>
          <span className="font-mono text-base font-extrabold text-emerald-400 font-mono-numbers">
            {targetWeight.toFixed(3)} kg
          </span>
        </div>

        {/* Range Slider */}
        <input
          type="range"
          min="0"
          max="30"
          step="0.005"
          value={targetWeight}
          onChange={(e) => onSetTargetWeight(parseFloat(e.target.value))}
          className="w-full accent-emerald-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
        />

        {/* Quick Presets */}
        <div className="flex flex-wrap gap-2 pt-1">
          {PRESET_LOADS.map((load) => (
            <button
              key={load.label}
              type="button"
              onClick={() => onSetTargetWeight(load.value)}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-semibold transition-colors border cursor-pointer ${
                Math.abs(targetWeight - load.value) < 0.001
                  ? 'bg-slate-700 text-white border-emerald-400'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
              }`}
            >
              {load.label}
            </button>
          ))}

          <button
            type="button"
            onClick={onResetZero}
            className="px-3 py-1 rounded-lg text-xs font-mono font-semibold text-rose-400 bg-rose-950/40 hover:bg-rose-900/50 border border-rose-800 transition-colors ml-auto cursor-pointer"
          >
            Reset Zero (0.000 kg)
          </button>
        </div>
      </div>
    </div>
  );
};
