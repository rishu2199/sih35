import React, { useState, useEffect } from 'react';
import { X, Edit3, Check, Scale } from 'lucide-react';
import { WeighingPoint } from './ErrorCorridorChart';

interface ManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  point: WeighingPoint | null;
  onSaveManualReading: (pointId: string, observedKg: number, deltaLKg: number) => void;
  verificationIntervalKg?: number;
}

export const ManualEntryModal: React.FC<ManualEntryModalProps> = ({
  isOpen,
  onClose,
  point,
  onSaveManualReading,
  verificationIntervalKg = 0.005,
}) => {
  if (!isOpen || !point) return null;

  const [observedReading, setObservedReading] = useState<string>(
    point.observedReading !== undefined ? point.observedReading.toFixed(3) : point.targetLoad.toFixed(3)
  );
  const [deltaL, setDeltaL] = useState<string>('0.0025'); // default 0.5e
  const [inputError, setInputError] = useState<string | null>(null);

  useEffect(() => {
    if (point) {
      setObservedReading(
        point.observedReading !== undefined ? point.observedReading.toFixed(3) : point.targetLoad.toFixed(3)
      );
      setDeltaL('0.0025');
      setInputError(null);
    }
  }, [point]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const obsVal = parseFloat(observedReading);
    const dVal = parseFloat(deltaL);

    if (isNaN(obsVal) || obsVal < 0) {
      setInputError('Please enter a valid positive observed reading in kilograms.');
      return;
    }
    if (isNaN(dVal) || dVal < 0) {
      setInputError('Please enter a valid fractional weight ΔL in kilograms.');
      return;
    }

    onSaveManualReading(point.id, obsVal, dVal);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foundation-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl border border-foundation-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-foundation-100 flex items-center justify-between bg-foundation-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foundation-900 tracking-tight">
                MANUAL OBSERVATION ENTRY
              </h3>
              <p className="text-[11px] font-mono text-foundation-500">
                Observation #{point.stepIndex} · {point.series.toUpperCase()} (Target: {point.targetLoad.toFixed(3)} kg)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-foundation-400 hover:text-foundation-700 p-1 rounded-lg"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-foundation-50 rounded-lg border border-foundation-200 flex items-center justify-between text-xs font-mono">
            <span className="text-foundation-500">Target Test Load (L):</span>
            <span className="font-bold text-foundation-900 text-sm">{point.targetLoad.toFixed(3)} kg</span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foundation-700 uppercase font-mono mb-1.5">
              Observed Display Reading (I) <span className="text-brand-600">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                autoFocus
                value={observedReading}
                onChange={(e) => {
                  setObservedReading(e.target.value);
                  setInputError(null);
                }}
                className="w-full text-sm font-mono font-bold p-2.5 pl-3 pr-12 rounded-lg border border-foundation-300 bg-white text-foundation-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="0.000"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-foundation-400 font-bold">
                kg
              </span>
            </div>
            <p className="text-[10px] text-foundation-500 mt-1 font-mono">
              Raw digital readout displayed on instrument indicator.
            </p>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foundation-700 uppercase font-mono mb-1.5">
              Additional Fractional Load (ΔL)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.0001"
                value={deltaL}
                onChange={(e) => {
                  setDeltaL(e.target.value);
                  setInputError(null);
                }}
                className="w-full text-xs font-mono p-2.5 pl-3 pr-12 rounded-lg border border-foundation-200 bg-white text-foundation-900 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="0.0025"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-foundation-400 font-bold">
                kg
              </span>
            </div>
            <p className="text-[10px] text-foundation-500 mt-1 font-mono">
              Weights added until indication flickers to $I + e$ (OIML A.4.4.3). Default: $0.5e = {(0.5 * verificationIntervalKg).toFixed(4)}$ kg.
            </p>
          </div>

          {inputError && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
              {inputError}
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-foundation-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-foundation-200 text-foundation-600 hover:bg-foundation-50 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check size={14} className="stroke-[2.5]" />
              <span>Record Observation</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
