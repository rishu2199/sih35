import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Calculator,
  X,
  Info,
} from 'lucide-react';
import { AccuracyClass } from '../../types';

interface MetrologicalValidationHUDProps {
  accuracyClass: AccuracyClass;
  onClassChange: (c: AccuracyClass) => void;
  maxCapacity: number;
  minCapacity: number;
  verificationInterval: number;
  scaleInterval: number;
  unit: string;
  onFieldChange: (field: string, val: any) => void;
  isReadOnly?: boolean;
}

export const MetrologicalValidationHUD: React.FC<MetrologicalValidationHUDProps> = ({
  accuracyClass,
  onClassChange,
  maxCapacity,
  minCapacity,
  verificationInterval,
  scaleInterval,
  unit,
  onFieldChange,
  isReadOnly = false,
}) => {
  const [showCalculationModal, setShowCalculationModal] = useState<boolean>(false);
  const [showTooltipE, setShowTooltipE] = useState<boolean>(false);

  // Live metrological calculation: n = Max / e (§15)
  const n = verificationInterval > 0 ? Math.round(maxCapacity / verificationInterval) : 0;

  // Table 3 OIML R 76-1 statutory criteria
  let nMin = 100;
  let nMax = 10000;
  let minIntervalValid = true;

  if (accuracyClass === 'CLASS_I') {
    nMin = 50000;
    nMax = 1000000;
    minIntervalValid = verificationInterval >= 0.000001; // >= 1 mg
  } else if (accuracyClass === 'CLASS_II') {
    nMin = 100;
    nMax = 100000;
    minIntervalValid = verificationInterval >= 0.000001;
  } else if (accuracyClass === 'CLASS_III') {
    nMin = 100;
    nMax = 10000;
    minIntervalValid = verificationInterval >= 0.0001; // >= 0.1 g
  } else if (accuracyClass === 'CLASS_IIII') {
    nMin = 100;
    nMax = 1000;
    minIntervalValid = verificationInterval >= 0.005; // >= 5 g
  }

  const isMaxGreaterThanMin = maxCapacity > minCapacity;
  const isScaleIntervalValid = scaleInterval <= verificationInterval && scaleInterval > 0;
  const isNValid = n >= nMin && n <= nMax;
  const isValid = isMaxGreaterThanMin && isScaleIntervalValid && isNValid && minIntervalValid;
  const hasWarning = !isValid && isMaxGreaterThanMin && n > 0;

  const classDisplayMap: Record<AccuracyClass, string> = {
    CLASS_I: 'Class I',
    CLASS_II: 'Class II',
    CLASS_III: 'Class III',
    CLASS_IIII: 'Class IIII',
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-6">
      {/* Header (§10) */}
      <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400">
            03 METROLOGICAL SPECIFICATIONS
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Define how the instrument is legally evaluated under OIML R 76-1.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-semibold">
          OIML R 76-1 Table 3
        </span>
      </div>

      {/* Accuracy Class Segmented Controls (§11) */}
      <div>
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-2">
          Accuracy Class
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(['CLASS_I', 'CLASS_II', 'CLASS_III', 'CLASS_IIII'] as AccuracyClass[]).map((c) => {
            const isSelected = accuracyClass === c;
            return (
              <button
                key={c}
                type="button"
                disabled={isReadOnly}
                onClick={() => onClassChange(c)}
                className={`py-3 px-4 rounded-2xl border text-center transition-all cursor-pointer font-sans ${
                  isSelected
                    ? 'border-blue-600 bg-blue-50/80 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 shadow-xs ring-2 ring-blue-500/20'
                    : 'border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-white dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="text-xs font-black">{classDisplayMap[c]}</div>
                <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                  {c === 'CLASS_I'
                    ? 'Special'
                    : c === 'CLASS_II'
                    ? 'High'
                    : c === 'CLASS_III'
                    ? 'Medium'
                    : 'Ordinary'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Capacity & Interval Fields Row (§12, §13, §14) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Maximum Capacity */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Maximum Capacity
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              disabled={isReadOnly}
              value={maxCapacity}
              onChange={(e) => onFieldChange('maxCapacity', parseFloat(e.target.value) || 0)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="absolute right-3 top-2.5 text-[11px] font-mono font-semibold text-slate-400">
              {unit}
            </span>
          </div>
        </div>

        {/* Minimum Capacity */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Minimum Capacity
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              disabled={isReadOnly}
              value={minCapacity}
              onChange={(e) => onFieldChange('minCapacity', parseFloat(e.target.value) || 0)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="absolute right-3 top-2.5 text-[11px] font-mono font-semibold text-slate-400">
              {unit}
            </span>
          </div>
        </div>

        {/* Verification Interval (e) with tooltip */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
              Verification Interval (e)
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowTooltipE(!showTooltipE)}
                className="text-slate-400 hover:text-blue-600 cursor-pointer"
                title="What is e?"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {showTooltipE && (
                <div className="absolute right-0 bottom-6 w-48 p-2 rounded-xl bg-slate-900 text-white text-[10px] z-30 shadow-xl border border-slate-700 font-sans">
                  <strong>What is e?</strong>
                  <p className="mt-0.5 text-slate-300 leading-tight">
                    The verification scale interval used for statutory evaluation.
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type="number"
              step="any"
              disabled={isReadOnly}
              value={verificationInterval}
              onChange={(e) => onFieldChange('verificationInterval', parseFloat(e.target.value) || 0)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="absolute right-3 top-2.5 text-[11px] font-mono font-semibold text-slate-400">
              {unit}
            </span>
          </div>
        </div>

        {/* Scale Interval (d) */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Scale Interval (d)
          </label>
          <div className="relative">
            <input
              type="number"
              step="any"
              disabled={isReadOnly}
              value={scaleInterval}
              onChange={(e) => onFieldChange('scaleInterval', parseFloat(e.target.value) || 0)}
              className="w-full pl-3 pr-8 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-mono text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
            <span className="absolute right-3 top-2.5 text-[11px] font-mono font-semibold text-slate-400">
              {unit}
            </span>
          </div>
        </div>

        {/* Base Unit */}
        <div>
          <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
            Base Unit
          </label>
          <select
            disabled={isReadOnly}
            value={unit}
            onChange={(e) => onFieldChange('unit', e.target.value)}
            className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
          >
            <option value="kg">kg (Kilogram)</option>
            <option value="g">g (Gram)</option>
            <option value="mg">mg (Milligram)</option>
            <option value="t">t (Tonne)</option>
          </select>
        </div>
      </div>

      {/* Live Table 3 Validator HUD (§15 & §16) */}
      <div
        className={`p-4 rounded-2xl border transition-all ${
          isValid
            ? 'bg-emerald-50/60 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-900/60'
            : hasWarning
            ? 'bg-amber-50/60 dark:bg-amber-950/30 border-amber-300 dark:border-amber-900/60'
            : 'bg-rose-50/60 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900/60'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Calculator
              className={`w-4 h-4 ${
                isValid
                  ? 'text-emerald-600'
                  : hasWarning
                  ? 'text-amber-600'
                  : 'text-rose-600'
              }`}
            />
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">
              SPECIFICATION VALIDATION
            </span>
          </div>

          <span
            className={`text-xs font-mono font-bold px-3 py-0.5 rounded-full flex items-center gap-1.5 self-start sm:self-auto ${
              isValid
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/80 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800'
                : hasWarning
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/80 dark:text-amber-200 border border-amber-300 dark:border-amber-800'
                : 'bg-rose-100 text-rose-800 dark:bg-rose-900/80 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isValid ? 'bg-emerald-600' : hasWarning ? 'bg-amber-600' : 'bg-rose-600'
              }`}
            />
            <span>
              {isValid
                ? '✓ SPECIFICATION VALID'
                : hasWarning
                ? '⚠ CHECK SPECIFICATION'
                : '✕ SPECIFICATION INVALID'}
            </span>
          </span>
        </div>

        {/* HUD Data Grid (§32, §33) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-3 text-xs">
          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
              Verification Interval
            </span>
            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
              {verificationInterval} {unit}
            </div>
            <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 mt-0.5 block">
              ✓ Verified scale interval (e)
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
              Scale Divisions
            </span>
            <div className="text-sm font-mono font-extrabold text-slate-900 dark:text-white mt-0.5">
              {n.toLocaleString()}
            </div>
            <span
              className={`text-[10px] font-mono font-semibold mt-0.5 block ${
                isNValid ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
              }`}
            >
              {isNValid ? '✓ Consistent with Max / e' : '✕ Out of allowable range'} ({nMin.toLocaleString()} – {nMax.toLocaleString()})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block">
              Capacity Range Check
            </span>
            <div className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5">
              {maxCapacity} {unit} Max &gt; {minCapacity} {unit} Min
            </div>
            <span
              className={`text-[10px] font-mono font-semibold mt-0.5 block ${
                isMaxGreaterThanMin ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
              }`}
            >
              {isMaxGreaterThanMin ? '✓ Capacity hierarchy valid' : '✕ Maximum must exceed minimum'}
            </span>
          </div>
        </div>

        {/* Human-friendly specification status message (§32, §46) */}
        <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="text-xs">
            {isValid ? (
              <span className="text-emerald-700 dark:text-emerald-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                Specification appears valid — n = {n.toLocaleString()} consistent with entered Max / e relationship.
              </span>
            ) : (
              <span className="text-rose-700 dark:text-rose-300 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-600" />
                Specification check failed — The entered interval/capacity combination requires review before registration.
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowCalculationModal(true)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer shrink-0 ml-2"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Inspect Specification</span>
          </button>
        </div>
      </div>

      {/* Calculation Proof Modal (§17) */}
      {showCalculationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-blue-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Calculation Proof
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowCalculationModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 font-mono text-xs space-y-2 text-slate-800 dark:text-slate-200">
              <div className="text-slate-400 text-[10px] uppercase font-bold">
                Formula
              </div>
              <div className="text-sm font-bold text-blue-600 dark:text-blue-400">
                n = Max Capacity ÷ Verification Interval
              </div>
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                n = {maxCapacity} {unit} ÷ {verificationInterval} {unit}
              </div>
              <div className="text-base font-extrabold text-slate-900 dark:text-white">
                n = {n.toLocaleString()}
              </div>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
              According to OIML R 76-1 Table 3 for <strong>{classDisplayMap[accuracyClass]}</strong>, the allowable scale intervals range from {nMin.toLocaleString()} to {nMax.toLocaleString()}.
            </p>

            <button
              type="button"
              onClick={() => setShowCalculationModal(false)}
              className="w-full py-2.5 bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
