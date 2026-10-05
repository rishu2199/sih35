import React from 'react';
import {
  Sun,
  Moon,
  LayoutGrid,
  Rows3,
  Check,
  Palette,
  Type,
  Activity,
  Lock,
  ShieldCheck,
  AlertCircle,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { AppearanceConfig } from '../types';

interface AppearanceTabProps {
  config: AppearanceConfig;
  onChange: (updated: AppearanceConfig) => void;
  readOnly?: boolean;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({
  config,
  onChange,
  readOnly = false,
}) => {
  const themes = [
    {
      id: 'LIGHT' as const,
      label: 'Light (Recommended)',
      desc: 'Optimized for high-illuminance laboratory inspection benches and official printout fidelity.',
      icon: Sun,
    },
    {
      id: 'DARK' as const,
      label: 'Dark',
      desc: 'High contrast dark canvas reducing eye strain during extended nighttime shift verifications.',
      icon: Moon,
    },
  ];

  const densities = [
    {
      id: 'COMFORTABLE' as const,
      label: 'Comfortable',
      desc: 'Generous padding and larger touch targets for touchscreen weighing terminals.',
      icon: LayoutGrid,
    },
    {
      id: 'COMPACT' as const,
      label: 'Compact (Default)',
      desc: 'Dense tabular views showing maximum data points without vertical scrolling.',
      icon: Rows3,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-3xl p-6 lg:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                SECTION §20
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Appearance &amp; UI Ergonomics
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Laboratory workstation display preferences and accessibility configuration.
            </p>
          </div>

          {readOnly && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
              <Lock className="w-3 h-3" />
              🔒 Managed by Administrator
            </span>
          )}
        </div>

        {/* Theme Picker (§20) */}
        <div className="space-y-3 pt-2">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
            Theme
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {themes.map((th) => {
              const Icon = th.icon;
              const isSelected = config.theme === th.id;
              return (
                <button
                  key={th.id}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onChange({ ...config, theme: th.id })}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        <Check className="w-3.5 h-3.5" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold">{th.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {th.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Density Picker (§20) */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
            Density
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {densities.map((den) => {
              const Icon = den.icon;
              const isSelected = config.density === den.id;
              return (
                <button
                  key={den.id}
                  type="button"
                  disabled={readOnly}
                  onClick={() => onChange({ ...config, density: den.id })}
                  className={`p-4 rounded-2xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                  } ${readOnly ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`p-2 rounded-xl ${
                        isSelected
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    {isSelected && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 font-mono">
                        <Check className="w-3.5 h-3.5" /> ACTIVE
                      </span>
                    )}
                  </div>
                  <div className="text-sm font-bold">{den.label}</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {den.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Technical Font & Reduced Motion (§20) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800/80">
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-indigo-600 border border-slate-200 dark:border-slate-700">
                <Type className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Technical Font
                </div>
                <div className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                  IBM Plex Mono (Numeric Alignment)
                </div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold">
              LOCKED
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                <Activity className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  Reduced Motion
                </div>
                <div className="text-[11px] text-slate-500">
                  Minimize micro-animations for low-spec terminals
                </div>
              </div>
            </div>
            <button
              type="button"
              disabled={readOnly}
              onClick={() => onChange({ ...config, reducedMotion: !config.reducedMotion })}
              className={`px-3 py-1.5 rounded-xl font-mono text-xs font-bold transition-all cursor-pointer ${
                config.reducedMotion
                  ? 'bg-indigo-600 text-white'
                  : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              } disabled:opacity-60 disabled:cursor-not-allowed`}
            >
              {config.reducedMotion ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Section §21: Status Semantic Colors Invariance Guarantee */}
        <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                SECTION §21
              </span>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-mono">
                Statutory Status Semantic Preservation
              </h4>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> INVARIANT ACROSS THEMES
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
            Regardless of whether Light or Dark theme is selected, statutory legal metrology status colors maintain exact chromatic meaning throughout all inspection screens:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center">
              <div className="text-xs font-black font-mono text-emerald-700 dark:text-emerald-400 flex items-center justify-center gap-1">
                <Check className="w-3.5 h-3.5" /> PASS
              </div>
              <div className="text-[10px] text-emerald-600 dark:text-emerald-300 mt-0.5 font-medium">
                Within Table 6 MPE
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center">
              <div className="text-xs font-black font-mono text-rose-700 dark:text-rose-400 flex items-center justify-center gap-1">
                <XCircle className="w-3.5 h-3.5" /> FAIL
              </div>
              <div className="text-[10px] text-rose-600 dark:text-rose-300 mt-0.5 font-medium">
                Exceeds Statutory MPE
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center">
              <div className="text-xs font-black font-mono text-amber-700 dark:text-amber-400 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> WARNING
              </div>
              <div className="text-[10px] text-amber-600 dark:text-amber-300 mt-0.5 font-medium">
                Tolerance Alert / Drift
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-center">
              <div className="text-xs font-black font-mono text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1">
                <Lock className="w-3.5 h-3.5" /> LOCKED
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                Preflight Gate Block
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
