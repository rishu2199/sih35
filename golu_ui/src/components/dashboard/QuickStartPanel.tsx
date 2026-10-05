import React, { useState } from 'react';
import { ArrowRight, Loader2, Scale, Zap } from 'lucide-react';

export interface QuickStartPresetItem {
  id: string;
  presetKey: string;
  brand: string;
  name: string;
  model: string;
  accuracyClass: string;
  classLabel: string;
  maxCapacity: string;
  verificationInterval: string;
  divisionCount: string;
}

export const CANONICAL_QUICK_PRESETS: QuickStartPresetItem[] = [
  {
    id: 'preset-avery',
    presetKey: 'avery',
    brand: 'AVERY WEIGH-TRONIX',
    name: 'Avery Class III',
    model: 'ZM201 Retail Platform',
    accuracyClass: 'CLASS_III',
    classLabel: 'Class III',
    maxCapacity: '30 kg Max',
    verificationInterval: '5 g e',
    divisionCount: '6,000 divisions',
  },
  {
    id: 'preset-mettler',
    presetKey: 'mettler',
    brand: 'METTLER-TOLEDO',
    name: 'Mettler Class I',
    model: 'XPR Analytical Micro-Balance',
    accuracyClass: 'CLASS_I',
    classLabel: 'Class I',
    maxCapacity: '120 g Max',
    verificationInterval: '1 mg e',
    divisionCount: '120,000 divisions',
  },
  {
    id: 'preset-sansui',
    presetKey: 'sansui',
    brand: 'SANSUI PRECISION',
    name: 'Sansui Class II',
    model: 'GoldMaster-6K',
    accuracyClass: 'CLASS_II',
    classLabel: 'Class II',
    maxCapacity: '6000 g Max',
    verificationInterval: '0.1 g e',
    divisionCount: '60,000 divisions',
  },
  {
    id: 'preset-essae',
    presetKey: 'essae',
    brand: 'ESSAE-TERAOKA',
    name: 'Essae Class IIII',
    model: 'DS-215 Heavy Platform',
    accuracyClass: 'CLASS_IIII',
    classLabel: 'Class IIII',
    maxCapacity: '150 kg Max',
    verificationInterval: '50 g e',
    divisionCount: '3,000 divisions',
  },
];

interface QuickStartPanelProps {
  presets?: any[];
  onSelectPreset: (preset: QuickStartPresetItem | any) => void;
  onOpenDemoCenter?: () => void;
}

export const QuickStartPanel: React.FC<QuickStartPanelProps> = ({
  presets,
  onSelectPreset,
  onOpenDemoCenter,
}) => {
  const [loadingPresetId, setLoadingPresetId] = useState<string | null>(null);

  const handleStart = (preset: QuickStartPresetItem) => {
    setLoadingPresetId(preset.id);
    // Short tick for smooth tactile feedback (§11)
    setTimeout(() => {
      setLoadingPresetId(null);
      onSelectPreset(preset);
    }, 200);
  };

  const getClassBadgeStyle = (accClass: string) => {
    switch (accClass) {
      case 'CLASS_I':
        return 'bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'CLASS_II':
        return 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'CLASS_III':
        return 'bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'CLASS_IIII':
      default:
        return 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-mono font-bold tracking-wider uppercase mb-0.5">
            <Zap className="w-3.5 h-3.5" />
            Quick Start Presets
          </div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
            Start Verification with Realistic Instrument Preset
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            One-click preset initialization. Prefills instrument, creates verification session and opens session overview.
          </p>
        </div>

        {onOpenDemoCenter && (
          <button
            type="button"
            onClick={onOpenDemoCenter}
            className="text-xs font-bold text-slate-600 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 flex items-center gap-1 transition-colors cursor-pointer self-start sm:self-auto"
          >
            <span>Explore All Scenarios →</span>
          </button>
        )}
      </div>

      {/* 4 Supplied Presets (§10, §11) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
        {CANONICAL_QUICK_PRESETS.map((preset) => {
          const isLoading = loadingPresetId === preset.id;

          return (
            <div
              key={preset.id}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-xs transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold tracking-wider text-slate-400 uppercase">
                    {preset.brand}
                  </span>
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${getClassBadgeStyle(
                      preset.accuracyClass
                    )}`}
                  >
                    {preset.classLabel}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">
                  {preset.name}
                </h3>
                <div className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                  {preset.model}
                </div>

                {/* Specs (§11) */}
                <div className="mt-3.5 space-y-1.5 py-2.5 px-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs font-mono">
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 text-[11px]">Capacity</span>
                    <span className="font-bold">{preset.maxCapacity}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 text-[11px]">Interval (e)</span>
                    <span className="font-bold">{preset.verificationInterval}</span>
                  </div>
                </div>
              </div>

              {/* Action Button (§11) */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => handleStart(preset)}
                  className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-blue-600 dark:bg-slate-800 dark:hover:bg-blue-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>Creating Session...</span>
                    </>
                  ) : (
                    <>
                      <span>Start Verification</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
