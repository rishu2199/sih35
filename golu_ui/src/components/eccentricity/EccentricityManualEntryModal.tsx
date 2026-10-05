import React, { useState, useEffect } from 'react';
import { X, Edit3, Check } from 'lucide-react';
import { EccentricityPosition } from './PlatterVisualizer';

interface EccentricityManualEntryModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: EccentricityPosition | null;
  onSaveReading: (positionId: string, observedKg: number) => void;
}

export const EccentricityManualEntryModal: React.FC<EccentricityManualEntryModalProps> = ({
  isOpen,
  onClose,
  position,
  onSaveReading,
}) => {
  if (!isOpen || !position) return null;

  const [observedReading, setObservedReading] = useState<string>(
    position.observedReading !== undefined ? position.observedReading.toFixed(3) : position.targetLoad.toFixed(3)
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (position) {
      setObservedReading(
        position.observedReading !== undefined ? position.observedReading.toFixed(3) : position.targetLoad.toFixed(3)
      );
      setErrorMsg(null);
    }
  }, [position]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(observedReading);
    if (isNaN(val) || val <= 0) {
      setErrorMsg('Please enter a valid positive observed reading in kilograms.');
      return;
    }
    onSaveReading(position.id, val);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foundation-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl border border-foundation-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
        <div className="p-4 border-b border-foundation-100 flex items-center justify-between bg-foundation-50/80">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-600">
              <Edit3 size={16} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
                RECORD POSITION READING
              </h3>
              <p className="text-[11px] font-mono text-foundation-500">
                {position.name} (Prescribed Target: {position.targetLoad.toFixed(3)} kg)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-foundation-400 hover:text-foundation-700 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div className="p-3 bg-foundation-50 rounded-lg border border-foundation-200 flex items-center justify-between text-xs font-mono">
            <span className="text-foundation-500">Standard Test Load (1/3 Max):</span>
            <span className="font-bold text-foundation-900 text-sm">{position.targetLoad.toFixed(3)} kg</span>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foundation-700 uppercase font-mono mb-1.5">
              Observed Scale Indication (I) <span className="text-brand-600">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                autoFocus
                value={observedReading}
                onChange={(e) => {
                  setObservedReading(e.target.value);
                  setErrorMsg(null);
                }}
                className="w-full text-base font-mono font-bold p-2.5 pl-3 pr-12 rounded-lg border border-foundation-300 bg-white text-foundation-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
                placeholder="10.000"
              />
              <span className="absolute right-3 top-2.5 text-xs font-mono text-foundation-400 font-bold">
                kg
              </span>
            </div>
            <p className="text-[10px] text-foundation-500 mt-1 font-mono">
              Raw digits displayed on the scale indicator with weight centered on {position.name}.
            </p>
          </div>

          {errorMsg && (
            <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-mono">
              {errorMsg}
            </div>
          )}

          <div className="pt-3 border-t border-foundation-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-lg border border-foundation-200 text-foundation-600 hover:bg-foundation-100 text-xs font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check size={14} />
              <span>Record Position Reading</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
