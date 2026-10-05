import React from 'react';
import {
  Sparkles,
  PlayCircle,
  ShieldAlert,
  AlertTriangle,
  CheckCircle2,
  Lock,
  ExternalLink,
  Laptop,
  Flame,
  Radio,
  FileCode,
} from 'lucide-react';
import { DemoModeConfig } from '../types';

interface DemoModeTabProps {
  config: DemoModeConfig;
  onChange: (updated: DemoModeConfig) => void;
  onOpenJuryDemo?: () => void;
  readOnly?: boolean;
}

export const DemoModeTab: React.FC<DemoModeTabProps> = ({
  config,
  onChange,
  onOpenJuryDemo,
  readOnly = false,
}) => {
  const toggleScenario = (id: string) => {
    if (readOnly) return;
    const updated = {
      ...config,
      availableScenarios: config.availableScenarios.map((sc) =>
        sc.id === id ? { ...sc, enabled: !sc.enabled } : sc
      ),
    };
    onChange(updated);
  };

  return (
    <div className="space-y-6">
      {/* Main Demo Config Header (§22) */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                SECTION §22
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Demo Mode
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Configure synthetic scenarios and presentation behavior.
            </p>
          </div>

          {readOnly && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3" />
              🔒 Managed by Administrator
            </span>
          )}
        </div>

        {/* 4 Primary Hackathon Capabilities (§22) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {/* 1. Jury Demo Assistant */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span>Jury Demo Assistant</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                10-minute guided evaluation flow with walkthrough drawer &amp; timeline.
              </div>
              <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                ● {config.juryDemoAssistantEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={config.juryDemoAssistantEnabled}
                onChange={(e) => onChange({ ...config, juryDemoAssistantEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* 2. Synthetic Scenarios */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <PlayCircle className="w-4 h-4 text-blue-500" />
                <span>Synthetic Scenarios</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Pre-packaged verification test cases showcasing PASS, FAIL, and MPE edge cases.
              </div>
              <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                ● {config.syntheticScenariosEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={config.syntheticScenariosEnabled}
                onChange={(e) => onChange({ ...config, syntheticScenariosEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* 3. Virtual Scale Simulator */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Radio className="w-4 h-4 text-emerald-500" />
                <span>Virtual Scale Simulator</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Software emulation of RS-232 / TCP continuous weight telemetries.
              </div>
              <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                ● {config.virtualScaleSimulatorEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={config.virtualScaleSimulatorEnabled}
                onChange={(e) => onChange({ ...config, virtualScaleSimulatorEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* 4. Tamper Simulation */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                <Flame className="w-4 h-4 text-rose-500" />
                <span>Tamper Simulation</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">
                Injects intentional byte corruption into audit blocks to demo hash mismatch detection.
              </div>
              <div className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 pt-1">
                ● {config.tamperSimulationEnabled ? 'Enabled' : 'Disabled'}
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                disabled={readOnly}
                checked={config.tamperSimulationEnabled}
                onChange={(e) => onChange({ ...config, tamperSimulationEnabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
            </label>
          </div>
        </div>

        {/* Section §22: Open Jury Demo Assistant Button */}
        {config.juryDemoAssistantEnabled && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenJuryDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Open Jury Demo Assistant</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </button>
          </div>
        )}

        {/* Section §23: Demo-Only Warnings */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          {/* Warning 1: Demo Environment */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/80 px-2 py-0.5 rounded">
                DEMO ENVIRONMENT
              </span>
            </div>
            <p className="text-xs font-semibold text-amber-900 dark:text-amber-200 mt-1">
              Synthetic scenarios do not represent real statutory records.
            </p>
            <p className="text-[11px] text-amber-700/80 dark:text-amber-400/80 leading-relaxed">
              All generated test readings and certificates created in demo mode are digitally tagged as non-statutory simulations.
            </p>
          </div>

          {/* Warning 2: Simulation Only */}
          <div className="p-4 rounded-2xl bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-900/80 px-2 py-0.5 rounded">
                SIMULATION ONLY
              </span>
            </div>
            <p className="text-xs font-semibold text-rose-900 dark:text-rose-200 mt-1">
              Integrity simulation affects demo state, not production audit records.
            </p>
            <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80 leading-relaxed">
              Cryptographic tamper injections only alter ephemeral in-memory blocks to demonstrate the auditor verification failure flow.
            </p>
          </div>
        </div>

        {/* 5 Canonical Demonstration Stress Scenarios */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              Canonical Stress Scenarios (Statutory Test Cases)
            </label>
            <span className="text-[11px] font-mono text-slate-400">
              {config.availableScenarios.filter((s) => s.enabled).length} / {config.availableScenarios.length} active
            </span>
          </div>

          <div className="space-y-2.5">
            {config.availableScenarios.map((sc, index) => {
              return (
                <div
                  key={sc.id}
                  onClick={() => toggleScenario(sc.id)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                    sc.enabled
                      ? 'border-indigo-200 dark:border-indigo-900/60 bg-indigo-50/20 dark:bg-indigo-950/20 text-slate-900 dark:text-white'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 opacity-60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-mono font-bold text-xs mt-0.5 ${
                        sc.enabled
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-xs font-bold flex items-center gap-2">
                        {sc.name}
                        {sc.enabled ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-semibold">
                            ACTIVE
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 font-semibold">
                            DISABLED
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                        {sc.description}
                      </div>
                    </div>
                  </div>

                  <div className="shrink-0">
                    <input
                      type="checkbox"
                      disabled={readOnly}
                      checked={sc.enabled}
                      onChange={() => {}}
                      className="w-4 h-4 text-indigo-600 rounded border-slate-300 pointer-events-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
