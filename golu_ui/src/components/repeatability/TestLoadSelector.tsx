import React, { useState } from 'react';
import { Scale, CheckCircle2, AlertTriangle, Layers, X, ArrowRight } from 'lucide-react';

export type RepeatabilityLoadOption = '0.5_max' | '0.8_max' | '1.0_max';

interface TestLoadSelectorProps {
  maxCapacityKg: number;
  selectedOption: RepeatabilityLoadOption;
  onSelectOption: (option: RepeatabilityLoadOption) => void;
  disabled?: boolean;
  loadCompletedCounts?: Record<RepeatabilityLoadOption, number>;
  activeLoadRecordedCount?: number;
}

export const TestLoadSelector: React.FC<TestLoadSelectorProps> = ({
  maxCapacityKg,
  selectedOption,
  onSelectOption,
  disabled = false,
  loadCompletedCounts = { '0.5_max': 10, '0.8_max': 0, '1.0_max': 0 },
  activeLoadRecordedCount = 0,
}) => {
  const [pendingOption, setPendingOption] = useState<RepeatabilityLoadOption | null>(null);

  const options = [
    {
      id: '0.5_max' as RepeatabilityLoadOption,
      multiplier: 0.5,
      label: '0.5 Max',
      weightKg: maxCapacityKg * 0.5,
      clause: 'OIML CL 3.6.1 Standard',
      recommended: true,
    },
    {
      id: '0.8_max' as RepeatabilityLoadOption,
      multiplier: 0.8,
      label: '0.8 Max',
      weightKg: maxCapacityKg * 0.8,
      clause: 'High Range Consistency',
      recommended: false,
    },
    {
      id: '1.0_max' as RepeatabilityLoadOption,
      multiplier: 1.0,
      label: '1.0 Max',
      weightKg: maxCapacityKg * 1.0,
      clause: 'Full Capacity Verification',
      recommended: false,
    },
  ];

  const activeOpt = options.find((o) => o.id === selectedOption) || options[0];

  const handleOptionClick = (optId: RepeatabilityLoadOption) => {
    if (optId === selectedOption) return;

    // Check if there is existing data recorded in current load (§22)
    if (activeLoadRecordedCount > 0) {
      setPendingOption(optId);
    } else {
      onSelectOption(optId);
    }
  };

  const handleConfirmSwitch = () => {
    if (pendingOption) {
      onSelectOption(pendingOption);
      setPendingOption(null);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs">
      {/* Top Header & Multi-Load Progress Strip (Section 23) */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between pb-3 border-b border-foundation-100 gap-2">
        <div className="flex items-center gap-2">
          <Scale size={16} className="text-brand-600" />
          <span className="text-[11px] font-bold text-foundation-400 uppercase font-mono tracking-wider">
            REPEATABILITY TEST LOAD (OIML R 76-1 CL 3.6.1)
          </span>
        </div>

        {/* Multi-Load Status Strip (§23) */}
        <div className="flex items-center gap-3 text-xs font-mono bg-foundation-50 px-2.5 py-1 rounded-lg border border-foundation-200">
          <span className="text-foundation-400 text-[10px] font-bold uppercase">Multi-Load Status:</span>
          {options.map((opt, idx) => {
            const count = loadCompletedCounts[opt.id] || 0;
            const isDone = count >= 10;
            const isCurrent = opt.id === selectedOption;

            return (
              <React.Fragment key={opt.id}>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-bold ${
                      isDone
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-brand-600 text-white animate-pulse'
                        : 'bg-foundation-200 text-foundation-600'
                    }`}
                  >
                    {isDone ? '✓' : isCurrent ? '●' : '○'}
                  </span>
                  <span
                    className={`${
                      isCurrent
                        ? 'font-bold text-foundation-900'
                        : isDone
                        ? 'text-emerald-700 font-semibold'
                        : 'text-foundation-400'
                    }`}
                  >
                    {opt.label} ({count}/10)
                  </span>
                </div>
                {idx < options.length - 1 && (
                  <span className="text-foundation-300">·</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Load Selection Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-3.5">
        {options.map((opt) => {
          const isSelected = selectedOption === opt.id;
          const count = loadCompletedCounts[opt.id] || 0;

          return (
            <button
              key={opt.id}
              type="button"
              disabled={disabled}
              onClick={() => handleOptionClick(opt.id)}
              className={`p-3.5 rounded-xl border text-left transition-all relative cursor-pointer ${
                isSelected
                  ? 'bg-brand-50/70 border-brand-500 ring-2 ring-brand-100 shadow-xs'
                  : 'bg-foundation-50/60 border-foundation-200 hover:bg-foundation-100/70'
              } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold font-mono text-foundation-700 uppercase">
                  {opt.label}
                </span>
                <div className="flex items-center gap-1.5">
                  {count >= 10 && (
                    <span className="text-[9px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                      ✓ 10/10 COMPLETE
                    </span>
                  )}
                  {opt.recommended && (
                    <span className="text-[9px] font-mono font-bold bg-brand-100 text-brand-800 px-1.5 py-0.2 rounded">
                      RECOMMENDED
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-foundation-950">
                  {opt.weightKg.toFixed(3)} kg
                </span>
                <span className="text-[10px] text-foundation-500 block font-mono mt-0.5">
                  {opt.clause}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Load Context (§4) */}
      <div className="mt-3.5 p-3 rounded-lg bg-foundation-50 border border-foundation-200 flex flex-col sm:flex-row sm:items-center sm:justify-between text-xs font-mono gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-600" />
          <span className="text-foundation-600">Selected Load:</span>
          <span className="text-sm font-bold text-foundation-950">
            {activeOpt.weightKg.toFixed(3)} kg
          </span>
          <span className="text-foundation-400">({activeOpt.label})</span>
          <span className="text-foundation-300">•</span>
          <span className="text-foundation-500">Capacity: 30.000 kg</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-foundation-600 font-semibold">Runs Required:</span>
          <span className="px-2 py-0.5 rounded bg-foundation-200 font-bold text-foundation-900">
            10 Sequential Runs
          </span>
        </div>
      </div>

      {/* Load Switching Confirmation Modal (§22) */}
      {pendingOption && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foundation-950/40 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-foundation-200 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-amber-600 mb-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-bold text-foundation-950 font-sans">
                  Switch Test Load?
                </h3>
                <span className="text-xs font-mono text-foundation-500">
                  Target: {options.find((o) => o.id === pendingOption)?.label} ({options.find((o) => o.id === pendingOption)?.weightKg.toFixed(1)} kg)
                </span>
              </div>
            </div>

            <p className="text-xs text-foundation-600 font-sans leading-relaxed mb-4">
              You have already recorded <strong>{activeLoadRecordedCount} reading(s)</strong> under the currently active <strong>{activeOpt.label}</strong> load dataset. Switching will preserve your existing dataset and open the run set for <strong>{options.find((o) => o.id === pendingOption)?.label}</strong>.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-foundation-100 font-mono text-xs">
              <button
                type="button"
                onClick={() => setPendingOption(null)}
                className="px-4 py-2 rounded-lg border border-foundation-200 text-foundation-700 hover:bg-foundation-50 font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSwitch}
                className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Switch Load</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
