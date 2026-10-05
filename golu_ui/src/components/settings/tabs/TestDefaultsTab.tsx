import React, { useState } from 'react';
import { Sliders, Save, AlertTriangle, Check, ShieldAlert, Lock } from 'lucide-react';
import { TestDefaultsConfig } from '../types';

interface TestDefaultsTabProps {
  config: TestDefaultsConfig;
  onSave: (updated: TestDefaultsConfig) => void;
  canEdit?: boolean;
}

export const TestDefaultsTab: React.FC<TestDefaultsTabProps> = ({
  config,
  onSave,
  canEdit = true,
}) => {
  const [formData, setFormData] = useState<TestDefaultsConfig>(config);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                SECTION §15
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Test Defaults &amp; Operational Preferences
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure laboratory defaults used when creating new verification sessions.
            </p>
          </div>

          {!canEdit && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3" />
              🔒 Managed by Administrator
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Default Verification Stage (§15) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Default Verification Stage
            </label>
            <select
              disabled={!canEdit}
              value={formData.defaultVerificationStage}
              onChange={(e) => setFormData({ ...formData, defaultVerificationStage: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              <option value="Subsequent Verification">Subsequent Verification (Routine Annual Stamping)</option>
              <option value="Initial Verification">Initial Verification (First Factory Commissioning)</option>
              <option value="Re-verification">Re-verification (Post-Repair / Maintenance Audit)</option>
            </select>
          </div>

          {/* Default Unit (§15) */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Default Measurement Unit
            </label>
            <select
              disabled={!canEdit}
              value={formData.defaultUnit}
              onChange={(e) => setFormData({ ...formData, defaultUnit: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              <option value="kg">kg (Kilograms - Industrial &amp; Retail Platforms)</option>
              <option value="g">g (Grams - High Precision Balances)</option>
            </select>
          </div>

          {/* Default Observation Layout */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Default Observation Entry Layout
            </label>
            <select
              disabled={!canEdit}
              value={formData.defaultObservationLayout}
              onChange={(e) => setFormData({ ...formData, defaultObservationLayout: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              <option value="SPLIT_VIEW">Split View (Observation Grid + Realtime Corridor Chart)</option>
              <option value="TABULAR">High-Density Tabular (Fast Numeric Keypad Entry)</option>
              <option value="CHART_FOCUS">Chart Focus (Visual Tolerance Corridor Emphasis)</option>
            </select>
          </div>

          {/* Calculation Proof Visibility */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Statutory Calculation Proof Trace
            </label>
            <select
              disabled={!canEdit}
              value={formData.showCalculationProof}
              onChange={(e) => setFormData({ ...formData, showCalculationProof: e.target.value as any })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-60"
            >
              <option value="ON_DEMAND">Expandable on Demand (Clean Laboratory Default)</option>
              <option value="ALWAYS">Always Expanded (Technical Training Mode)</option>
              <option value="NEVER">Collapsed Only</option>
            </select>
          </div>
        </div>

        {/* Operational Toggles (§15) */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Auto-Save Observations (IndexedDB Sync)
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Automatically stores captured load points to client-side cache every 3 seconds to protect against power interruption or accidental tab closure.
              </p>
            </div>

            <input
              type="checkbox"
              disabled={!canEdit}
              checked={formData.autoSaveObservations}
              onChange={(e) => setFormData({ ...formData, autoSaveObservations: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-1 cursor-pointer"
            />
          </div>

          <div className="flex items-start justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
            <div className="space-y-0.5">
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Auto-Capture Stable Telemetry Readings
              </div>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                Automatically records the current weight when the scale telemetry signal reports 3 consecutive identical stable readouts.
              </p>
            </div>

            <input
              type="checkbox"
              disabled={!canEdit}
              checked={formData.autoCaptureStableReadings}
              onChange={(e) => setFormData({ ...formData, autoCaptureStableReadings: e.target.checked })}
              className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 mt-1 cursor-pointer"
            />
          </div>
        </div>

        {/* Critical Distinction Notice (§16) */}
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800/80 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs text-amber-950 dark:text-amber-200 space-y-1">
            <div className="font-bold">Critical Distinction: Operational Defaults vs. Statutory Rules (§16)</div>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
              Operational defaults configure workflow convenience (e.g. units and auto-save). In contrast, <strong>Statutory Rules</strong> (OIML R 76-1 Table 6 MPE limits, turning-point mathematical formula <em>P = I + 0.5e - ΔL</em>, and Table 3 scale division boundaries) are legally mandated and cannot be modified by any administrative setting.
            </p>
          </div>
        </div>

        {canEdit && (
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Testing Defaults</span>
            </button>
          </div>
        )}
      </div>
    </form>
  );
};
