import React from 'react';
import { X, BookOpen, Calculator, CheckCircle2, ShieldCheck } from 'lucide-react';

interface CalculationProofModalProps {
  isOpen: boolean;
  onClose: () => void;
  load?: string | number;
  reading?: string | number;
  turningPointP?: string | number;
  errorE?: string | number;
  toleranceMPE?: string | number;
  deltaL?: string | number;
  verificationScaleIntervalE?: string | number;
  clauseReference?: string;
}

export const CalculationProofModal: React.FC<CalculationProofModalProps> = ({
  isOpen,
  onClose,
  load = '10.000 kg',
  reading = '10.005 kg',
  turningPointP = '10.005 kg',
  errorE = '-5.3 g',
  toleranceMPE = '±5.0 g',
  deltaL = '0.0025 kg',
  verificationScaleIntervalE = '0.005 kg',
  clauseReference = 'OIML R 76-1:2006 Clause A.4.4.3 & Clause 3.5.1',
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-mono font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950 px-2 py-0.5 rounded">
                SECTION §30
              </span>
              <h3 className="text-base font-black text-slate-900 dark:text-white font-mono uppercase tracking-tight">
                CALCULATION PROOF
              </h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Step-by-Step Derivation */}
        <div className="space-y-3.5">
          {/* 1. Turning Point */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              1. Turning Point &amp; Corrected Indication (P)
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              P = I + 0.5e - ΔL
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1">
              <div>= {reading} + (0.5 × {verificationScaleIntervalE}) - {deltaL}</div>
              <div className="font-bold text-slate-900 dark:text-white">= {turningPointP}</div>
            </div>
          </div>

          {/* 2. Error Calculation */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 space-y-2">
            <div className="text-[11px] font-mono uppercase font-bold text-slate-500 tracking-wider">
              2. Calculated Error (E)
            </div>
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
              E = P - L
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-300 font-mono space-y-1">
              <div>= {turningPointP} - {load}</div>
              <div className="font-black text-rose-600 dark:text-rose-400">= {errorE}</div>
            </div>
          </div>

          {/* 3. Statutory Tolerance Comparison */}
          <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono font-bold uppercase text-amber-700 dark:text-amber-400">
                Statutory Table 6 MPE Limit
              </div>
              <div className="text-sm font-black font-mono text-amber-900 dark:text-amber-200 mt-0.5">
                {toleranceMPE}
              </div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-mono font-bold uppercase text-slate-500">
                Statutory Verdict
              </div>
              <div className="text-xs font-black font-mono text-rose-600 dark:text-rose-400">
                EXCEEDS MPE (FAIL)
              </div>
            </div>
          </div>
        </div>

        {/* Legal Metrology Reference */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>Statutory Authority: {clauseReference}</span>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-bold transition-colors cursor-pointer"
          >
            Close Proof
          </button>
        </div>
      </div>
    </div>
  );
};
