import React, { useState, useEffect } from 'react';
import { ShieldCheck, Check, ArrowRight, X, Play, Loader2, Sparkles, Cpu } from 'lucide-react';
import { PreflightSummary } from './types';

interface PreflightConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  summary: PreflightSummary;
}

const PHASES = [
  { id: 1, label: 'INITIALIZING TEST SESSION', desc: 'Instantiating session state & cryptographic audit nonce' },
  { id: 2, label: 'LOADING TEST PLAN', desc: 'Configuring 31 observation loads & OIML Table 3 MPE thresholds' },
  { id: 3, label: 'VERIFYING TRACEABILITY', desc: 'Binding reference standard F1 • FW-24-018 to session chain' },
  { id: 4, label: 'OPENING FIRST PROCEDURE', desc: 'Navigating to TEST_01 Weighing Error & Linearity workspace' },
];

export const PreflightConfirmationModal: React.FC<PreflightConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  summary,
}) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [activePhaseIndex, setActivePhaseIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setIsInitializing(false);
      setActivePhaseIndex(0);
      setProgressPct(0);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (isInitializing) {
      if (activePhaseIndex < PHASES.length) {
        timer = setTimeout(() => {
          setActivePhaseIndex((prev) => prev + 1);
          setProgressPct((prev) => Math.min(100, prev + 25));
        }, 550);
      } else {
        // All phases complete, fire onConfirm after a brief moment
        timer = setTimeout(() => {
          onConfirm();
        }, 400);
      }
    }
    return () => clearTimeout(timer);
  }, [isInitializing, activePhaseIndex, onConfirm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in select-none">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-in zoom-in-95">
        {/* Header (§19) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold shadow-xs">
              <Play className="w-4 h-4 fill-current ml-0.5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider block">
                GATE PASS CONFIRMATION §19
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
                {isInitializing ? 'Launching Measurement Session...' : 'Ready to Begin Testing?'}
              </h3>
            </div>
          </div>

          {!isInitializing && (
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Content body */}
        {!isInitializing ? (
          <div className="space-y-4 font-mono text-xs">
            {/* Instrument Summary */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 space-y-1">
              <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">
                Instrument Under Verification
              </span>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {summary.manufacturer} {summary.model} · {summary.serialNumber}
              </div>
              <div className="text-slate-500 font-sans text-xs">
                {summary.accuracyClass} · Max {summary.maxCapacity} · e = {summary.verificationInterval} · n = {summary.scaleDivisions.toLocaleString()}
              </div>
            </div>

            {/* Preflight Pillars Status */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Test Plan Scope
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  8 / 8 Applicable
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
                <span className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                  Traceability Chain
                </span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-mono">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  F1 Valid (18 Mar 2027)
                </span>
              </div>
            </div>

            <p className="text-xs font-sans text-slate-500 leading-relaxed pt-1">
              Clicking <strong className="text-slate-800 dark:text-slate-200 font-bold">Initialize Testing</strong> will lock preflight evidence, record the cryptographic entry event, and route directly to the first active measurement procedure (<strong className="text-blue-600 font-mono">TEST_01 Weighing Error &amp; Linearity</strong>).
            </p>

            {/* Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsInitializing(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <span>Initialize Testing</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Live 4-Phase Transition Sequence (§19) */
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-slate-700 dark:text-slate-300">
                  SESSION START SEQUENCE
                </span>
                <span className="text-blue-600 dark:text-blue-400">
                  {Math.min(100, progressPct)}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${Math.min(100, progressPct)}%` }}
                />
              </div>
            </div>

            {/* 4 Phases List */}
            <div className="space-y-2.5 font-mono text-xs">
              {PHASES.map((ph, idx) => {
                const isPassed = activePhaseIndex > idx;
                const isCurrent = activePhaseIndex === idx;

                return (
                  <div
                    key={ph.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isPassed
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200'
                        : isCurrent
                        ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700 text-blue-950 dark:text-blue-200 shadow-xs'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] ${
                          isPassed
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-blue-600 text-white animate-pulse'
                            : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                        }`}
                      >
                        {isPassed ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : ph.id}
                      </div>

                      <div>
                        <div className="font-bold text-[11px] tracking-wide">
                          {ph.label}
                        </div>
                        <div className="text-[10px] font-sans text-slate-500">
                          {ph.desc}
                        </div>
                      </div>
                    </div>

                    <div>
                      {isPassed && (
                        <span className="text-[10px] font-bold text-emerald-600 uppercase">
                          ✓ Done
                        </span>
                      )}
                      {isCurrent && (
                        <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
