import React, { useState } from 'react';
import {
  ShieldCheck,
  Copy,
  Check,
  ArrowUpRight,
  Cpu,
  AlertTriangle,
  Play,
  RotateCcw,
  CheckCircle2,
  Loader2,
} from 'lucide-react';
import { WelmecSoftwareExamination } from './types';

interface WelmecExaminationCardProps {
  welmec: WelmecSoftwareExamination;
  onOpenDrawer: () => void;
  onShowToast: (msg: string) => void;
  onSimulateTamper: () => void;
  onResetTamper: () => void;
  isTampered?: boolean;
}

export const WelmecExaminationCard: React.FC<WelmecExaminationCardProps> = ({
  welmec,
  onOpenDrawer,
  onShowToast,
  onSimulateTamper,
  onResetTamper,
  isTampered = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [isExamining, setIsExamining] = useState(false);
  const [examStep, setExamStep] = useState(0);
  const [examComplete, setExamComplete] = useState(false);

  const handleCopyHash = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(welmec.firmwareHash);
    setCopied(true);
    onShowToast('Firmware hash copied.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRunExamination = () => {
    setIsExamining(true);
    setExamStep(0);
    setExamComplete(false);

    // Sequence of 4 examination steps per §18
    setTimeout(() => setExamStep(1), 500); // Firmware identity
    setTimeout(() => setExamStep(2), 1100); // Calibration data
    setTimeout(() => setExamStep(3), 1700); // Telemetry state
    setTimeout(() => setExamStep(4), 2300); // Integrity check
    setTimeout(() => {
      setIsExamining(false);
      setExamComplete(true);
      onShowToast('Software examination completed successfully.');
    }, 2800);
  };

  return (
    <div className="bg-white border border-foundation-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between space-y-5">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-foundation-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Cpu size={16} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-widest font-mono">
                WELMEC 7.2
              </span>
              <h3 className="text-xs font-bold text-foundation-900 font-sans uppercase">
                SOFTWARE EXAMINATION
              </h3>
            </div>
          </div>

          {isTampered ? (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-300">
              <AlertTriangle size={11} />
              <span>ATTENTION</span>
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
              <ShieldCheck size={11} />
              <span>VERIFIED</span>
            </span>
          )}
        </div>

        {/* Counter C & P Display (§16: strict "Calibration C" & "Calibration P") */}
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3.5 rounded-2xl bg-foundation-50 border border-foundation-200">
            <span className="text-[11px] font-bold text-foundation-500 uppercase tracking-wider font-mono">
              Calibration C
            </span>
            <div className="font-mono text-2xl font-extrabold text-foundation-900 mt-1">
              {welmec.counterC}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-foundation-50 border border-foundation-200">
            <span className="text-[11px] font-bold text-foundation-500 uppercase tracking-wider font-mono">
              Calibration P
            </span>
            <div className="font-mono text-2xl font-extrabold text-foundation-900 mt-1">
              {welmec.counterP}
            </div>
          </div>
        </div>

        {/* Firmware Hash Card (§17) */}
        <div className="p-3.5 rounded-2xl bg-slate-900 text-slate-200 text-xs font-mono border border-slate-800 space-y-2 mb-4">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-bold uppercase tracking-wider">
              FIRMWARE HASH
            </span>
            <button
              type="button"
              onClick={handleCopyHash}
              className="text-slate-300 hover:text-white px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 flex items-center gap-1 transition-colors"
            >
              {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>

          <div className="break-all text-[11px] text-emerald-400 select-all font-mono">
            {welmec.firmwareHash.slice(0, 16)}...{welmec.firmwareHash.slice(-12)}
          </div>

          <div className="text-[10px] text-slate-400 pt-1.5 border-t border-slate-800 flex items-center justify-between">
            <span>Telemetry</span>
            <span className="text-emerald-400 font-bold">✓ Available</span>
          </div>
        </div>

        {/* Examination Execution Box (§18) */}
        {isExamining ? (
          <div className="p-3.5 rounded-2xl bg-brand-50 border border-brand-200 text-xs font-mono space-y-2 animate-fade-in">
            <div className="flex items-center gap-2 text-brand-900 font-bold font-sans">
              <Loader2 size={14} className="animate-spin text-brand-600" />
              <span>Running software examination...</span>
            </div>
            <div className="space-y-1 text-[11px] pt-1 border-t border-brand-200/60">
              <div className="flex items-center justify-between">
                <span>Firmware identity</span>
                <span>{examStep >= 1 ? '✓' : '...'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Calibration data</span>
                <span>{examStep >= 2 ? '✓' : '...'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Telemetry state</span>
                <span>{examStep >= 3 ? '✓' : '...'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Integrity check</span>
                <span>{examStep >= 4 ? '✓' : '...'}</span>
              </div>
            </div>
          </div>
        ) : examComplete ? (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-emerald-900 font-bold font-sans">
              <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
              <span>✓ EXAMINATION COMPLETE</span>
            </div>
            <button
              type="button"
              onClick={handleRunExamination}
              className="text-[11px] font-mono text-emerald-800 underline hover:text-emerald-950"
            >
              Re-run
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleRunExamination}
            className="w-full py-2.5 px-4 rounded-xl bg-foundation-900 hover:bg-black text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck size={14} />
            <span>Run Examination</span>
          </button>
        )}

        {/* Tamper Alert State (§19) */}
        {isTampered && (
          <div className="mt-3 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-xs space-y-2 animate-shake">
            <div className="flex items-center gap-2 text-rose-900 font-bold font-sans">
              <AlertTriangle size={16} className="text-rose-600 shrink-0" />
              <span>✕ SOFTWARE EXAMINATION ATTENTION</span>
            </div>
            <p className="text-[11px] text-rose-700 leading-snug">
              Firmware integrity result requires review. Statutory event counters mismatch registered certificate.
            </p>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={onOpenDrawer}
                className="text-rose-800 font-bold underline hover:text-rose-950 text-[11px]"
              >
                [ View Details ]
              </button>
              <button
                type="button"
                onClick={onResetTamper}
                className="text-foundation-500 hover:text-foundation-800 text-[11px] flex items-center gap-1"
              >
                <RotateCcw size={11} />
                <span>Reset Demo</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Demo Mode / Drawer Link Footer */}
      <div className="pt-3 border-t border-foundation-100 flex items-center justify-between text-xs">
        <button
          type="button"
          onClick={onOpenDrawer}
          className="text-brand-600 hover:text-brand-700 font-bold flex items-center gap-1 text-[11px] transition-colors"
        >
          <span>Examine Proof</span>
          <ArrowUpRight size={13} />
        </button>

        {/* Demo Mode Tamper Trigger (§19) */}
        <div className="text-right">
          <span className="text-[10px] text-foundation-400 block font-mono">Demo Mode</span>
          {!isTampered ? (
            <button
              type="button"
              onClick={onSimulateTamper}
              className="text-[11px] font-mono text-foundation-500 hover:text-rose-600 transition-colors"
            >
              [ Simulate Integrity Issue ]
            </button>
          ) : (
            <button
              type="button"
              onClick={onResetTamper}
              className="text-[11px] font-mono text-emerald-700 font-semibold"
            >
              [ Restore State ]
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
