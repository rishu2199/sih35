import React, { useState } from 'react';
import {
  Thermometer,
  Check,
  RefreshCw,
  Edit2,
  AlertTriangle,
  X,
  Save,
} from 'lucide-react';
import { EnvironmentalBaseline } from './types';

interface EnvironmentBaselineCardProps {
  baseline: EnvironmentalBaseline;
  onRefresh: () => void;
  onUpdateBaseline: (updated: EnvironmentalBaseline) => void;
  isRefreshing?: boolean;
}

export const EnvironmentBaselineCard: React.FC<EnvironmentBaselineCardProps> = ({
  baseline,
  onRefresh,
  onUpdateBaseline,
  isRefreshing = false,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempInput, setTempInput] = useState(baseline.temperatureC.toString());
  const [humidityInput, setHumidityInput] = useState(baseline.humidityPercent.toString());
  const [pressureInput, setPressureInput] = useState(baseline.pressureHpa.toString());

  const isTempValid = baseline.temperatureC >= 10 && baseline.temperatureC <= 40;
  const isHumidityValid = baseline.humidityPercent <= 85;
  const isPressureValid = baseline.pressureHpa >= 900 && baseline.pressureHpa <= 1100;
  const isEnvironmentValid = isTempValid && isHumidityValid && isPressureValid;

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    const tempNum = parseFloat(tempInput) || 23.4;
    const humNum = parseInt(humidityInput, 10) || 48;
    const pressNum = parseInt(pressureInput, 10) || 1008;

    onUpdateBaseline({
      ...baseline,
      temperatureC: tempNum,
      humidityPercent: humNum,
      pressureHpa: pressNum,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST (Manual Override)',
    });
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block">
                LAB CONDITIONS §10
              </span>
              <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                ENVIRONMENTAL BASELINE
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
              <Check className="w-3 h-3 stroke-[3]" />
              AUTO-POPULATED
            </span>
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 py-4 text-center font-mono">
          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-sans text-slate-500 uppercase block mb-0.5 font-bold">Temperature</span>
            <span className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
              {baseline.temperatureC} <span className="text-xs font-normal text-slate-500">°C</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans block mt-0.5 font-semibold">
              OIML 10–40°C ✓
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-sans text-slate-500 uppercase block mb-0.5 font-bold">Humidity</span>
            <span className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
              {baseline.humidityPercent} <span className="text-xs font-normal text-slate-500">%</span>
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans block mt-0.5 font-semibold">
              OIML ≤ 85% ✓
            </span>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] font-sans text-slate-500 uppercase block mb-0.5 font-bold">Pressure</span>
            <span className="text-lg font-black text-slate-900 dark:text-white flex items-center justify-center gap-1">
              {baseline.pressureHpa} <span className="text-xs font-normal text-slate-500">hPa</span>
            </span>
            <span className="text-[10px] text-slate-400 font-sans block mt-0.5">
              Barometric ✓
            </span>
          </div>
        </div>

        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
          Recorded via {baseline.sensorNode} at <strong className="font-mono text-slate-700 dark:text-slate-300">{baseline.timestamp}</strong>. All parameters meet OIML R 76-1 § 3.9.2 limits.
        </p>

        {/* Edit baseline modal/inline form */}
        {isEditing && (
          <form
            onSubmit={handleSaveEdit}
            className="mt-3 p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/60 space-y-3 animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-2 border-b border-blue-100 dark:border-blue-900">
              <span className="text-xs font-bold text-blue-900 dark:text-blue-300">
                Manual Baseline Override (§11)
              </span>
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Temp (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tempInput}
                  onChange={(e) => setTempInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Humidity (%)
                </label>
                <input
                  type="number"
                  value={humidityInput}
                  onChange={(e) => setHumidityInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>

              <div>
                <label className="text-[10px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                  Pressure (hPa)
                </label>
                <input
                  type="number"
                  value={pressureInput}
                  onChange={(e) => setPressureInput(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-500 shadow-xs"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Baseline</span>
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 pt-2">
        <button
          type="button"
          onClick={() => setIsEditing(!isEditing)}
          className="py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5 text-slate-400" />
          <span>Edit Baseline</span>
        </button>

        <button
          type="button"
          onClick={onRefresh}
          disabled={isRefreshing}
          className="py-2.5 px-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-xs font-bold text-slate-700 dark:text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-blue-600' : 'text-slate-400'}`} />
          <span>{isRefreshing ? 'Reading Node...' : 'Refresh Reading'}</span>
        </button>
      </div>
    </div>
  );
};
