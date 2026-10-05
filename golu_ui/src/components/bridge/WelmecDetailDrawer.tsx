import React, { useState } from 'react';
import { X, ShieldCheck, Copy, Check, Cpu, CheckCircle2, Lock } from 'lucide-react';
import { WelmecSoftwareExamination } from './types';

interface WelmecDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  welmec: WelmecSoftwareExamination;
}

export const WelmecDetailDrawer: React.FC<WelmecDetailDrawerProps> = ({
  isOpen,
  onClose,
  welmec,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(welmec.firmwareHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foundation-900/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-foundation-200">
          {/* Header */}
          <div className="p-5 border-b border-foundation-200 bg-foundation-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Cpu size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
                  WELMEC 7.2 Software Examination
                </h3>
                <p className="text-[11px] text-foundation-500 font-mono">
                  Software Separation & Audit Counters
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200"
            >
              <X size={18} />
            </button>
          </div>

          {/* Drawer Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
            {/* Status callout */}
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3">
              <ShieldCheck size={20} className="text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold text-emerald-950 font-sans">
                  Software Integrity: VERIFIED
                </div>
                <div className="text-[11px] text-emerald-800 font-mono mt-0.5">
                  Firmware binary matches statutory type-approval digest
                </div>
              </div>
            </div>

            {/* Counters Detailed Explanation */}
            <div className="space-y-3">
              <span className="font-bold text-foundation-800 uppercase tracking-wider font-mono">
                Statutory Event Counters
              </span>

              <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foundation-900">Calibration Event Counter (C)</span>
                  <span className="font-mono text-sm font-extrabold text-brand-700">{welmec.counterC}</span>
                </div>
                <p className="text-[11px] text-foundation-500 leading-relaxed font-sans">
                  Increments whenever an authorized recalibration, turning-point reset, or hardware jumper adjustment occurs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-foundation-50 border border-foundation-200 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-foundation-900">Parameter Counter (P)</span>
                  <span className="font-mono text-sm font-extrabold text-brand-700">{welmec.counterP}</span>
                </div>
                <p className="text-[11px] text-foundation-500 leading-relaxed font-sans">
                  Increments whenever legally relevant parameters (e.g. Max capacity, verification interval e, filter constants) are modified.
                </p>
              </div>
            </div>

            {/* Full Firmware Hash */}
            <div className="space-y-2">
              <span className="font-bold text-foundation-800 uppercase tracking-wider font-mono">
                Full 256-Bit Firmware Digest
              </span>
              <div className="p-3.5 rounded-xl bg-slate-900 text-slate-200 font-mono text-[11px] border border-slate-800 space-y-2">
                <div className="break-all text-emerald-400 select-all leading-snug">
                  {welmec.firmwareHash}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-[10px] flex items-center gap-1"
                >
                  {copied ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                  <span>{copied ? 'Copied' : 'Copy Hash'}</span>
                </button>
              </div>
            </div>

            {/* WELMEC Compliance Badges */}
            <div className="p-4 rounded-xl bg-foundation-50 border border-foundation-200 space-y-2 font-sans">
              <div className="font-bold text-foundation-900">WELMEC 7.2 Guide Conformance</div>
              <div className="flex items-center gap-2 text-emerald-800 text-[11px]">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Risk Class C software separation enforced</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 text-[11px]">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Legally relevant parts isolated from user interface</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-800 text-[11px]">
                <CheckCircle2 size={14} className="text-emerald-600" />
                <span>Measurement transmission encrypted with checksum</span>
              </div>
            </div>
          </div>

          {/* Drawer Footer */}
          <div className="p-4 border-t border-foundation-200 bg-foundation-50 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-foundation-800 hover:bg-foundation-900 text-white text-xs font-bold transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
