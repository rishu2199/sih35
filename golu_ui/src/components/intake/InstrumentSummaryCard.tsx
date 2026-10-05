import React from 'react';
import { Scale, Check, AlertTriangle, ShieldCheck, FileCheck2 } from 'lucide-react';
import { AccuracyClass } from '../../types';

interface InstrumentSummaryCardProps {
  manufacturer: string;
  model: string;
  serialNumber: string;
  approvalNumber: string;
  accuracyClass: AccuracyClass;
  maxCapacity: number;
  verificationInterval: number;
  scaleInterval: number;
  unit: string;
  evidenceCount: number;
  isConfigurationValid: boolean;
}

export const InstrumentSummaryCard: React.FC<InstrumentSummaryCardProps> = ({
  manufacturer,
  model,
  serialNumber,
  approvalNumber,
  accuracyClass,
  maxCapacity,
  verificationInterval,
  scaleInterval,
  unit,
  evidenceCount,
  isConfigurationValid,
}) => {
  const isIdentified = !!manufacturer && !!model && !!serialNumber;
  const isReady = isIdentified && isConfigurationValid && evidenceCount >= 4;

  return (
    <div className="bg-white border border-[#E4E8EF] rounded-2xl p-6 shadow-xs space-y-5 sticky top-20">
      {/* Header */}
      <div className="flex items-center justify-between pb-3.5 border-b border-[#E4E8EF]">
        <span className="text-xs font-bold tracking-wider uppercase text-foundation-600">
          Instrument Preview
        </span>
        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-foundation-100 text-foundation-600">
          Case Draft
        </span>
      </div>

      {/* Simulated Scale Visual Illustration */}
      <div className="w-full h-36 rounded-xl bg-foundation-50 border border-[#E4E8EF] flex flex-col items-center justify-center p-4 relative overflow-hidden">
        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 text-brand-600 flex items-center justify-center mb-2 shadow-xs">
          <Scale size={26} />
        </div>
        <div className="text-xs font-mono font-bold text-foundation-800">
          {manufacturer || 'Instrument'} {model || 'Model'}
        </div>
        <div className="text-[11px] font-mono text-foundation-500 mt-0.5">
          {accuracyClass.replace('_', ' ')} · Max {maxCapacity} {unit}
        </div>
      </div>

      {/* Core Metrological Identity */}
      <div>
        <h4 className="text-sm font-extrabold text-foundation-950 font-sans">
          {manufacturer || 'Unspecified'} {model || 'Instrument'}
        </h4>
        <div className="text-xs font-mono text-foundation-600 mt-1">
          {accuracyClass.replace('_', ' ')} <span className="text-foundation-300">•</span> Max {maxCapacity} {unit}
        </div>
        <div className="text-[11px] font-mono text-foundation-500 mt-0.5">
          e = {verificationInterval} {unit} <span className="text-foundation-300">•</span> d = {scaleInterval} {unit}
        </div>
      </div>

      {/* Status Pill */}
      <div className="p-3 rounded-xl border bg-foundation-50/70 border-[#E4E8EF] flex items-center justify-between">
        <span className="text-xs font-medium text-foundation-600">Status</span>
        <div className="flex items-center gap-1.5 text-xs font-bold">
          <span className={`w-2 h-2 rounded-full ${isReady ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
          <span className={isReady ? 'text-emerald-700' : 'text-amber-700'}>
            {isReady ? 'Registration valid' : 'Pending evidence'}
          </span>
        </div>
      </div>

      {/* Identity Metadata */}
      <div className="pt-2 border-t border-[#E4E8EF] space-y-2 text-xs font-mono">
        <div className="text-[10px] font-sans font-bold uppercase tracking-wider text-foundation-400">
          Statutory Identity
        </div>
        <div className="flex justify-between py-1 border-b border-[#E4E8EF]/60">
          <span className="text-foundation-500 font-sans">Serial No.</span>
          <span className="font-bold text-foundation-900">{serialNumber || '—'}</span>
        </div>
        <div className="flex justify-between py-1 border-b border-[#E4E8EF]/60">
          <span className="text-foundation-500 font-sans">Approval No.</span>
          <span className="font-bold text-foundation-900">{approvalNumber || '—'}</span>
        </div>
        <div className="flex justify-between py-1">
          <span className="text-foundation-500 font-sans">Verification Case</span>
          <span className="text-brand-700 font-semibold">Will generate</span>
        </div>
      </div>

      {/* READINESS Checklist (Section 15) */}
      <div className="pt-2 border-t border-[#E4E8EF] space-y-2">
        <div className="text-[10px] font-bold uppercase tracking-wider text-foundation-400">
          Readiness Checklist
        </div>

        <div className="space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-foundation-600">Identification</span>
            {isIdentified ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                <Check size={12} className="stroke-[3]" /> Valid
              </span>
            ) : (
              <span className="text-amber-600 text-[11px]">Required</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-foundation-600">Specifications</span>
            <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
              <Check size={12} className="stroke-[3]" /> Set
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-foundation-600">Configuration HUD</span>
            {isConfigurationValid ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                <Check size={12} className="stroke-[3]" /> Valid
              </span>
            ) : (
              <span className="text-rose-600 font-semibold text-[11px]">Invalid</span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-foundation-600">Evidence Dossier</span>
            {evidenceCount >= 4 ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1 text-[11px]">
                <Check size={12} className="stroke-[3]" /> {evidenceCount}/5 complete
              </span>
            ) : (
              <span className="text-amber-600 text-[11px] flex items-center gap-1">
                <AlertTriangle size={11} /> {evidenceCount}/5
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
