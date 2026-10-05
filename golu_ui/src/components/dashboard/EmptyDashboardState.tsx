import React from 'react';
import { Plus, Sparkles, Scale } from 'lucide-react';
import { InstrumentPreset } from '../../types';

interface EmptyDashboardStateProps {
  onRegisterInstrument: () => void;
  onLoadPreset: (preset: InstrumentPreset) => void;
  presets?: InstrumentPreset[];
  onOpenDemoCenter?: () => void;
}

export const EmptyDashboardState: React.FC<EmptyDashboardStateProps> = ({
  onRegisterInstrument,
  onLoadPreset,
  presets = [],
  onOpenDemoCenter,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 text-center max-w-xl mx-auto shadow-xs my-12 space-y-6">
      {/* Scale Illustration */}
      <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 rounded-3xl flex items-center justify-center mx-auto text-blue-600 dark:text-blue-400 shadow-sm">
        <Scale className="w-8 h-8 stroke-[1.75]" />
      </div>

      <div className="space-y-2">
        <h2 className="text-xl font-black text-slate-900 dark:text-white tracking-tight font-sans">
          No verification sessions yet
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
          Register an instrument or load a demonstration scenario to begin testing.
        </p>
      </div>

      {/* Primary Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onRegisterInstrument}
          className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-sm shadow-blue-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Register Instrument</span>
        </button>

        {onOpenDemoCenter && (
          <button
            type="button"
            onClick={onOpenDemoCenter}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Load Demo Scenario</span>
          </button>
        )}
      </div>

      {presets.length > 0 && (
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="text-[10px] uppercase font-mono font-bold tracking-wider text-slate-400 mb-3">
            Quick Demonstration Presets
          </div>
          <div className="grid grid-cols-2 gap-2 text-left">
            {presets.slice(0, 4).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => onLoadPreset(p)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-blue-400 hover:bg-blue-50/20 text-left transition-colors cursor-pointer"
              >
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">{p.name}</div>
                <div className="text-[10px] font-mono text-slate-500">{p.maxCapacity}</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
