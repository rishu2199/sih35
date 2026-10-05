import React from 'react';
import { Sparkles, Check } from 'lucide-react';
import { InstrumentPreset } from '../../types';

interface PresetStripProps {
  selectedPresetId?: string;
  onSelectPreset: (preset: InstrumentPreset) => void;
}

export const CANONICAL_INTAKE_PRESETS: InstrumentPreset[] = [
  {
    id: 'preset-avery',
    name: 'Avery ZM201 Retail',
    brand: 'Avery Weigh-Tronix',
    model: 'ZM201 Retail Platform',
    manufacturer: 'Avery Weigh-Tronix',
    accuracyClass: 'CLASS_III',
    classLabel: 'Avery Class III',
    maxCapacity: '30 kg',
    verificationInterval: 'e = 0.005 kg',
    applicableTestsCount: 7,
    description: 'Class III commercial counter scale with 6,000 verification intervals.',
    tag: 'Retail Commercial',
  },
  {
    id: 'preset-mettler',
    name: 'Mettler XPR 120 Analytical',
    brand: 'Mettler Toledo',
    model: 'XPR Analytical Micro-Balance',
    manufacturer: 'Mettler Toledo',
    accuracyClass: 'CLASS_I',
    classLabel: 'Mettler Class I',
    maxCapacity: '120 g',
    verificationInterval: 'e = 1 mg',
    applicableTestsCount: 7,
    description: 'Class I analytical balance requiring Class E2 mass standards.',
    tag: 'High Precision Lab',
  },
  {
    id: 'preset-sansui',
    name: 'Sansui Gold Balance 600',
    brand: 'Sansui Electronics',
    model: 'GoldMaster 600 Precision',
    manufacturer: 'Sansui Electronics',
    accuracyClass: 'CLASS_II',
    classLabel: 'Sansui Class II',
    maxCapacity: '6000 g',
    verificationInterval: 'e = 0.1 g',
    applicableTestsCount: 7,
    description: 'Class II precision balance for bullion and jewelry verification.',
    tag: 'Bullion & Jewelry',
  },
  {
    id: 'preset-essae',
    name: 'Essae Platform Pro 150',
    brand: 'Essae-Teraoka',
    model: 'DS-215 Heavy Platform',
    manufacturer: 'Essae-Teraoka',
    accuracyClass: 'CLASS_IIII',
    classLabel: 'Essae Class IIII',
    maxCapacity: '150 kg',
    verificationInterval: 'e = 50 g',
    applicableTestsCount: 6,
    description: 'Class IIII ordinary accuracy industrial platform bench.',
    tag: 'Heavy Industrial',
  },
];

export const PresetStrip: React.FC<PresetStripProps> = ({
  selectedPresetId = 'preset-avery',
  onSelectPreset,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div className="space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            QUICK START
          </span>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-800">
            Synthetic Profiles
          </span>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Load a realistic instrument profile to see the complete verification workflow.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2.5">
        {CANONICAL_INTAKE_PRESETS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => onSelectPreset(preset)}
              className={`px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
              }`}
            >
              {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
              <span>{preset.classLabel}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
