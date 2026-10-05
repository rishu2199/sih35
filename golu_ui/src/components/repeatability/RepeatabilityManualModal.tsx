import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, Scale } from 'lucide-react';
import { RepeatabilityReading } from './RepeatabilitySequenceTable';

interface RepeatabilityManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  reading: RepeatabilityReading | null;
  targetLoadKg: number;
  allowableLimitGrams: number;
  onSaveReading: (runNumber: number, observedReadingKg: number, zeroReturnConfirmed: boolean) => void;
}

export const RepeatabilityManualModal: React.FC<RepeatabilityManualModalProps> = ({
  isOpen,
  onClose,
  reading,
  targetLoadKg,
  allowableLimitGrams,
  onSaveReading,
}) => {
  if (!isOpen || !reading) return null;

  const [observedInput, setObservedInput] = useState<string>(
    reading.observedReading !== undefined ? reading.observedReading.toFixed(3) : targetLoadKg.toFixed(3)
  );
  const [zeroConfirmed, setZeroConfirmed] = useState<boolean>(reading.zeroReturnConfirmed);

  useEffect(() => {
    if (reading) {
      setObservedInput(
        reading.observedReading !== undefined ? reading.observedReading.toFixed(3) : targetLoadKg.toFixed(3)
      );
      setZeroConfirmed(reading.zeroReturnConfirmed);
    }
  }, [reading, targetLoadKg]);

  const observedVal = parseFloat(observedInput);
  const isValid = !isNaN(observedVal) && observedVal > 0;
  const calculatedErrorGrams = isValid ? Math.round((observedVal - targetLoadKg) * 1000 * 10) / 10 : 0;
  const isWithinLimit = Math.abs(calculatedErrorGrams) <= allowableLimitGrams;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    onSaveReading(reading.run, observedVal, zeroConfirmed);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foundation-950/40 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl border border-foundation-200 p-6 max-w-md w-full animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 text-brand-700 flex items-center justify-center">
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foundation-950 font-sans">
                Manual Entry · Run #{reading.run.toString().padStart(2, '0')}
              </h3>
              <span className="text-xs font-mono text-foundation-500">
                Fallback reading entry for unlinked test scale
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-foundation-400 hover:text-foundation-600 cursor-pointer p-1"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="space-y-4 mt-4 font-mono text-xs">
          <div>
            <label className="block text-foundation-600 font-bold uppercase text-[10px] mb-1">
              Nominal Test Load
            </label>
            <div className="px-3 py-2 bg-foundation-100/70 border border-foundation-200 rounded-lg text-foundation-800 font-bold">
              {targetLoadKg.toFixed(3)} kg
            </div>
          </div>

          <div>
            <label className="block text-foundation-600 font-bold uppercase text-[10px] mb-1">
              Observed Platter Indication (kg)
            </label>
            <input
              type="number"
              step="0.001"
              value={observedInput}
              onChange={(e) => setObservedInput(e.target.value)}
              className="w-full px-3 py-2 border border-foundation-300 rounded-lg font-bold text-foundation-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
              placeholder="e.g. 15.002"
              required
              autoFocus
            />
          </div>

          {/* Zero Return Checkbox */}
          <div className="p-3 bg-foundation-50 rounded-lg border border-foundation-200 flex items-center gap-3">
            <input
              type="checkbox"
              id="zeroConfirmInput"
              checked={zeroConfirmed}
              onChange={(e) => setZeroConfirmed(e.target.checked)}
              className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 cursor-pointer"
            />
            <label htmlFor="zeroConfirmInput" className="cursor-pointer">
              <span className="font-bold text-foundation-900 block text-xs">Confirm Zero Return (0.000 kg)</span>
              <span className="text-[11px] text-foundation-500 font-sans">
                Platter verified at 0.000 kg before this measurement.
              </span>
            </label>
          </div>

          {/* Realtime Error Preview */}
          {isValid && (
            <div
              className={`p-3 rounded-lg border flex items-center justify-between ${
                isWithinLimit
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-rose-50 border-rose-200 text-rose-900'
              }`}
            >
              <div>
                <span className="text-[10px] uppercase font-bold block opacity-70">
                  Calculated Error (Ec = IL − L)
                </span>
                <span className="text-sm font-extrabold">
                  {(calculatedErrorGrams > 0 ? '+' : '') + calculatedErrorGrams.toFixed(1)} g
                </span>
              </div>
              <span className="font-bold text-xs">
                {isWithinLimit ? '✓ WITHIN LIMIT' : '✕ EXCEEDS LIMIT'}
              </span>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-foundation-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-foundation-200 text-foundation-700 hover:bg-foundation-50 font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid}
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:bg-foundation-300 text-white font-bold cursor-pointer flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Apply Reading</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
