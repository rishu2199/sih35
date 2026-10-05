import React from 'react';
import {
  X,
  Thermometer,
  Droplets,
  Gauge,
  Clock,
  Activity,
  ShieldCheck,
  FileText,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { TemperatureStage } from './TemperatureDriftTab';
import { EnvironmentalConditions } from './LaboratoryConditionsCard';

interface EnvironmentalTraceDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conditions: EnvironmentalConditions;
  stage: TemperatureStage | null;
  allowableMpeGrams?: number;
}

export const EnvironmentalTraceDrawer: React.FC<EnvironmentalTraceDrawerProps> = ({
  isOpen,
  onClose,
  conditions,
  stage,
  allowableMpeGrams = 2.0,
}) => {
  if (!isOpen || !stage) return null;

  const errorVal = stage.errorGrams ?? 0;
  const isPass = Math.abs(errorVal) <= allowableMpeGrams;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden font-sans">
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
              <div className="w-8 h-8 rounded-lg bg-brand-100 text-brand-700 flex items-center justify-center">
                <Thermometer size={18} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foundation-950 tracking-tight">
                  Environmental Trace Log
                </h3>
                <span className="text-xs font-mono text-foundation-500">
                  {stage.label} Thermal Stage Telemetry
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
          <div className="p-6 space-y-6 overflow-y-auto flex-1 text-xs">
            {/* Stage Hero Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between font-mono ${
                isPass
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                  : 'bg-rose-50 border-rose-300 text-rose-950'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                    isPass ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
                  }`}
                >
                  {isPass ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                </div>
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider block">
                    {stage.label} — {isPass ? 'COMPLIANT' : 'LIMIT EXCEEDED'}
                  </span>
                  <span className="text-[11px] opacity-80 font-sans">
                    Observed error: {(errorVal > 0 ? '+' : '') + errorVal.toFixed(1)} g (Limit: ±{allowableMpeGrams.toFixed(1)} g)
                  </span>
                </div>
              </div>
            </div>

            {/* Environmental Trace Technical Table (§33) */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-foundation-500 uppercase font-mono tracking-wider">
                Chamber Telemetry Snapshot
              </h4>

              <div className="rounded-xl border border-foundation-200 divide-y divide-foundation-100 font-mono bg-foundation-50/50">
                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Timestamp</span>
                  <span className="font-bold text-foundation-900">04 Oct 2026 · 17:04:21 IST</span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Target Temperature</span>
                  <span className="font-bold text-foundation-900">{stage.nominalTempC > 0 ? `+${stage.nominalTempC.toFixed(1)}` : stage.nominalTempC.toFixed(1)} °C</span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Chamber Measured Temperature</span>
                  <span className="font-bold text-foundation-900">{stage.actualTempC > 0 ? `+${stage.actualTempC.toFixed(1)}` : stage.actualTempC.toFixed(1)} °C</span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Relative Humidity (RH)</span>
                  <span className="font-bold text-foundation-900">41.2 %</span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Barometric Pressure</span>
                  <span className="font-bold text-foundation-900">1011.4 hPa</span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Target Standard Load</span>
                  <span className="font-bold text-foundation-900">{stage.targetLoadKg.toFixed(3)} kg</span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Observed Indication</span>
                  <span className="font-bold text-foundation-900">
                    {stage.observedReadingKg ? `${stage.observedReadingKg.toFixed(3)} kg` : '—'}
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Calculated Thermal Drift Error</span>
                  <span className={`font-bold ${isPass ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {(errorVal > 0 ? '+' : '') + errorVal.toFixed(1)} g
                  </span>
                </div>

                <div className="p-3 flex items-center justify-between">
                  <span className="text-foundation-500">Thermal Soak Duration</span>
                  <span className="font-bold text-foundation-900">{stage.soakTimeMinutes} min (Req: 20 min)</span>
                </div>
              </div>
            </div>

            {/* Ambient Laboratory Baseline Contrast (§29) */}
            <div className="p-4 rounded-xl bg-foundation-50 border border-foundation-200 space-y-2">
              <span className="text-xs font-bold text-foundation-700 uppercase font-mono tracking-wider block">
                Lab Baseline vs Chamber Delta
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2 bg-white rounded border border-foundation-200">
                  <span className="text-[10px] text-foundation-400 block">LAB BASELINE</span>
                  <span className="font-bold text-foundation-900">{conditions.temperatureC.toFixed(1)} °C</span>
                </div>
                <div className="p-2 bg-white rounded border border-foundation-200">
                  <span className="text-[10px] text-foundation-400 block">CHAMBER TEMP</span>
                  <span className="font-bold text-foundation-900">{stage.actualTempC.toFixed(1)} °C</span>
                </div>
              </div>
            </div>

            {/* Standard Legal Citation */}
            <div className="p-3.5 rounded-lg bg-blue-50/60 border border-blue-200 text-xs text-blue-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 font-mono">
                <FileText size={14} className="text-blue-700" />
                <span>OIML R 76-1 CL 3.9.2.1 Statutory Requirement</span>
              </div>
              <p className="text-[11px] leading-relaxed text-blue-800">
                The instrument shall comply with the metrological requirements at all temperatures within the limits of the operating temperature range (−10°C to +40°C for Class III).
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-foundation-900 hover:bg-foundation-800 text-white font-mono text-xs font-bold transition-colors cursor-pointer"
            >
              Close Trace
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
