import React from 'react';
import { CheckCircle2, X, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { ReviewSessionCase } from './types';

interface ApproveForwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseItem: ReviewSessionCase;
  onConfirmApprove: () => void;
}

export const ApproveForwardModal: React.FC<ApproveForwardModalProps> = ({
  isOpen,
  onClose,
  caseItem,
  onConfirmApprove,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-900/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-foundation-200 overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-foundation-200 bg-brand-50/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-100 text-brand-700 flex items-center justify-center">
              <UserCheck size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foundation-900 tracking-tight font-sans">
                Approve & Forward to Director
              </h3>
              <p className="text-xs text-foundation-500 font-mono">
                Verification Case {caseItem.sessionNumber}
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

        <div className="p-6 space-y-4">
          <p className="text-xs text-foundation-700 leading-relaxed font-sans">
            You are approving this verification case as <strong>Technical Reviewer</strong>. The dossier will advance to the Laboratory Director's signing queue for final cryptographic sealing.
          </p>

          <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>All 7 statutory test stages completed</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>No blocking statutory tolerances exceeded</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-800 font-semibold">
              <CheckCircle2 size={15} className="text-emerald-600" />
              <span>Observation notes and margin checks recorded</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50/60 border border-blue-200 text-blue-900 text-xs font-mono">
            <span>Next Stage:</span>
            <span className="font-bold">PENDING DIRECTOR SIGN-OFF</span>
          </div>

          {/* Footer actions */}
          <div className="pt-3 border-t border-foundation-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-foundation-200 text-xs font-semibold text-foundation-700 hover:bg-foundation-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirmApprove();
                onClose();
              }}
              className="px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5"
            >
              <span>Approve & Forward →</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
