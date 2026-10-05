import React, { useState } from 'react';
import {
  Lock,
  AlertOctagon,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  HelpCircle,
  Scale,
} from 'lucide-react';
import { StandardWeightSet } from './types';

interface HardLockoutModalProps {
  isOpen: boolean;
  expiredStandard: StandardWeightSet;
  assignedSessionId?: string;
  availableStandards: StandardWeightSet[];
  onSelectReplacement: (newStandard: StandardWeightSet) => void;
}

export const HardLockoutModal: React.FC<HardLockoutModalProps> = ({
  isOpen,
  expiredStandard,
  assignedSessionId = 'VR-2026-00418',
  availableStandards,
  onSelectReplacement,
}) => {
  const [selectedNewStandardId, setSelectedNewStandardId] = useState<string>('E2-014');
  const [showExplanation, setShowExplanation] = useState<boolean>(false);

  if (!isOpen) return null;

  const validOptions = availableStandards.filter(
    (s) => s.status === 'VALID' || s.status === 'EXPIRING'
  );
  const currentlySelectedStandard = availableStandards.find(
    (s) => s.id === selectedNewStandardId
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="lockout-dialog-title"
      className="fixed inset-0 z-50 bg-foundation-950/80 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full border-2 border-rose-500 shadow-2xl overflow-hidden">
        {/* Header: Hard Gate Warning (§16) */}
        <div className="bg-rose-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-rose-700/80 flex items-center justify-center shadow-inner">
              <Lock size={20} className="stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black tracking-widest bg-rose-800/80 px-2 py-0.5 rounded uppercase">
                  Statutory Hard Lockout
                </span>
                <span className="text-rose-200 text-xs">•</span>
                <span className="font-mono text-xs text-rose-100 font-semibold">
                  OIML R 76-1 Cl. 3.7.1
                </span>
              </div>
              <h2 id="lockout-dialog-title" className="text-lg font-black tracking-tight mt-0.5">
                🔒 TESTING LOCKED
              </h2>
            </div>
          </div>
          {/* Note: §16 explicitly mandates NON-DISMISSIBLE modal - NO CLOSE BUTTON */}
        </div>

        {/* Content Body (§16, §17) */}
        <div className="p-6 font-mono space-y-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-950">
            <p className="text-sm font-bold leading-snug">
              Session <span className="underline font-mono">{assignedSessionId}</span> is assigned to expired standard <span className="text-rose-700 font-extrabold">{expiredStandard.id}</span> ({expiredStandard.accuracyClass}).
            </p>
            <p className="text-xs text-rose-800 mt-2 font-sans font-medium">
              Measurement capture has been strictly disabled across all test workspaces. Replace the reference weight set with a valid, certified standard before testing can continue.
            </p>
          </div>

          {/* Toggle Why is testing locked? (§17) */}
          <div>
            <button
              type="button"
              onClick={() => setShowExplanation(!showExplanation)}
              className="text-xs text-foundation-600 hover:text-brand-600 font-sans font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <HelpCircle size={14} />
              <span>{showExplanation ? 'Hide statutory explanation' : 'Why is testing locked?'}</span>
            </button>

            {showExplanation && (
              <div className="mt-2.5 p-3.5 bg-foundation-50 rounded-lg border border-foundation-200 text-xs text-foundation-800 font-mono space-y-2 animate-in fade-in duration-150">
                <div className="flex justify-between border-b border-foundation-200 pb-1">
                  <span className="text-foundation-500">Traceability Requirement:</span>
                  <span className="font-bold text-foundation-900">Legal Metrology Act 2009 § 15</span>
                </div>
                <div className="flex justify-between border-b border-foundation-200 pb-1">
                  <span className="text-foundation-500">Assigned Standard:</span>
                  <span className="font-bold text-rose-700">{expiredStandard.id} ({expiredStandard.accuracyClass})</span>
                </div>
                <div className="flex justify-between border-b border-foundation-200 pb-1">
                  <span className="text-foundation-500">Calibration Expiry:</span>
                  <span className="font-bold text-rose-700">{expiredStandard.validUntilDate} (Expired)</span>
                </div>
                <div className="flex justify-between border-b border-foundation-200 pb-1">
                  <span className="text-foundation-500">Testing Status:</span>
                  <span className="font-bold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">BLOCKED</span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-foundation-500">Statutory Resolution:</span>
                  <span className="font-bold text-emerald-700">Assign a currently valid traceable standard.</span>
                </div>
              </div>
            )}
          </div>

          {/* Replacement Standard Picker (§18, §19) */}
          <div className="pt-2">
            <label className="block text-xs font-bold text-foundation-900 uppercase tracking-wider mb-2 font-sans">
              Select Replacement Standard (Valid standards only):
            </label>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {availableStandards.map((std) => {
                const isItemExpired = std.status === 'EXPIRED';
                const isSelected = std.id === selectedNewStandardId;

                return (
                  <div
                    key={std.id}
                    onClick={() => {
                      if (!isItemExpired) {
                        setSelectedNewStandardId(std.id);
                      }
                    }}
                    className={`p-3 rounded-lg border flex items-center justify-between transition-all ${
                      isItemExpired
                        ? 'bg-foundation-100/60 border-foundation-200 opacity-60 cursor-not-allowed'
                        : isSelected
                        ? 'bg-brand-50/80 border-brand-500 ring-2 ring-brand-100 cursor-pointer'
                        : 'bg-white border-foundation-200 hover:border-foundation-300 hover:bg-foundation-50/50 cursor-pointer'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="replacement-standard"
                        checked={isSelected}
                        disabled={isItemExpired}
                        onChange={() => setSelectedNewStandardId(std.id)}
                        className="text-brand-600 focus:ring-brand-500 h-4 w-4 disabled:cursor-not-allowed"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-foundation-950 font-sans">
                            {std.id}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-foundation-100 text-foundation-700 font-bold">
                            Class {std.accuracyClass}
                          </span>
                          <span className="text-xs text-foundation-500">
                            {std.massRange}
                          </span>
                        </div>
                        <div className="text-[11px] text-foundation-500 mt-0.5">
                          Cert: {std.certificateNumber} ({std.laboratory})
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      {isItemExpired ? (
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                          <XCircle size={11} />
                          <span>✕ Expired</span>
                        </span>
                      ) : std.status === 'EXPIRING' ? (
                        <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                          <AlertTriangle size={11} />
                          <span>⚠ {std.daysRemaining}d left</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[10px] font-bold flex items-center gap-1">
                          <CheckCircle2 size={11} />
                          <span>✓ Valid · {std.daysRemaining}d</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions (§18, §19: NO 'CONTINUE ANYWAY' BUTTON EVER) */}
        <div className="bg-foundation-50 px-6 py-4 border-t border-foundation-200 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono">
          <div className="text-xs text-foundation-500 flex items-center gap-1.5 font-sans">
            <ShieldAlert size={14} className="text-amber-600 shrink-0" />
            <span>Statutory bypass prohibited by WELMEC 7.2 & ISO 17025.</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              disabled={!currentlySelectedStandard || currentlySelectedStandard.status === 'EXPIRED'}
              onClick={() => {
                if (currentlySelectedStandard && currentlySelectedStandard.status !== 'EXPIRED') {
                  onSelectReplacement(currentlySelectedStandard);
                }
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-foundation-300 disabled:cursor-not-allowed text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Assign {currentlySelectedStandard?.id || 'Standard'} & Unlock</span>
              <ArrowRight size={14} className="stroke-[2.5]" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
