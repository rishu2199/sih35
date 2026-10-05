import React, { useState } from 'react';
import { AlertTriangle, X, RotateCcw } from 'lucide-react';

interface RemandModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionNumber: string;
  onConfirmRemand: (reason: string) => void;
}

const QUICK_REASONS = [
  'Missing Evidence / Calibration Certificate',
  'Result Requires Review / Borderline MPE',
  'Calculation Concern / Turning Point Discrepancy',
  'Physical Inspection Issue / Seal Integrity Damaged',
  'Eccentricity Corner Tolerance Exceeded',
];

export const RemandModal: React.FC<RemandModalProps> = ({
  isOpen,
  onClose,
  sessionNumber,
  onConfirmRemand,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleSelectQuickReason = (qr: string) => {
    setReason((prev) => (prev ? `${prev}. ${qr}` : qr));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirmRemand(reason.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-foundation-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-foundation-200 bg-rose-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
              <RotateCcw size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foundation-900 tracking-tight font-sans">
                Remand Session for Re-Testing
              </h3>
              <p className="text-xs text-foundation-500 font-mono">
                Case {sessionNumber} · Statutory Justification Mandatory
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-100"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-foundation-800 uppercase tracking-wider mb-1.5">
              Statutory Justification / Technical Grounds <span className="text-rose-600">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain the statutory, metrological, or physical reason for returning this verification case to the testing officer..."
              className="w-full p-3 text-xs rounded-xl border border-foundation-200 bg-white placeholder-foundation-400 focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 font-sans"
            />
            <p className="text-[11px] text-foundation-500 mt-1">
              This note will be recorded permanently in the immutable audit trail and sent to the testing officer.
            </p>
          </div>

          {/* Quick reason chips */}
          <div>
            <span className="block text-[11px] font-bold text-foundation-600 uppercase tracking-wider mb-2">
              Quick Reason Presets:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_REASONS.map((qr) => (
                <button
                  key={qr}
                  type="button"
                  onClick={() => handleSelectQuickReason(qr)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-sans border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 text-foundation-700 text-left transition-colors"
                >
                  + {qr}
                </button>
              ))}
            </div>
          </div>

          {/* Footer actions */}
          <div className="pt-4 border-t border-foundation-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-foundation-200 text-xs font-semibold text-foundation-700 hover:bg-foundation-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!reason.trim()}
              className="px-5 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <RotateCcw size={14} />
              <span>Confirm & Remand Session</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
