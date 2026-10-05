import React from 'react';
import { Scale, ShieldCheck, Lock, AlertTriangle, Layers, Cpu, Award } from 'lucide-react';
import { VerificationStage } from './types';

interface ActiveInstrumentCardProps {
  manufacturer: string;
  model: string;
  serialNumber: string;
  sessionNumber: string;
  accuracyClass: string;
  maxCapacity: string;
  interval: string;
  verificationStage: VerificationStage;
  onSelectStage: (stage: VerificationStage) => void;
  standardsValid: boolean;
  disabled?: boolean;
}

export const ActiveInstrumentCard: React.FC<ActiveInstrumentCardProps> = ({
  manufacturer,
  model,
  serialNumber,
  sessionNumber,
  accuracyClass,
  maxCapacity,
  interval,
  verificationStage,
  onSelectStage,
  standardsValid,
  disabled = false,
}) => {
  const stages: { label: string; value: VerificationStage; sublabel: string }[] = [
    {
      label: 'INITIAL TYPE APPROVAL',
      value: 'Initial Type Approval',
      sublabel: 'Full 8-Test Protocol (OIML R 76-1)',
    },
    {
      label: 'SUBSEQUENT VERIFICATION',
      value: 'Subsequent Verification',
      sublabel: 'Periodic Re-verification (WELMEC 7.2)',
    },
    {
      label: 'IN-SERVICE',
      value: 'In-Service Inspection',
      sublabel: 'Field Routine Inspection Protocol',
    },
  ];

  return (
    <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs space-y-4 select-none font-mono">
      {/* 1. Identity & Metrological Ribbon (§3) */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-4 border-b border-foundation-100 gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-brand-50 border border-brand-200 flex items-center justify-center text-brand-700 shrink-0 shadow-2xs">
            <Scale size={22} />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-foundation-500 uppercase tracking-wider">
                {manufacturer}
              </span>
              <span className="text-foundation-300">•</span>
              <span className="text-xs font-mono font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                {serialNumber}
              </span>
              <span className="text-foundation-300">•</span>
              <span className="text-xs text-foundation-500">
                Session {sessionNumber}
              </span>
            </div>

            <h2 className="text-lg sm:text-xl font-black text-foundation-950 font-sans tracking-tight mt-0.5">
              {model}
            </h2>

            {/* Compact Metrological Data Bar (§3: Class III  Max 30 kg  Min 100 g  e 5 g  d 5 g) */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs font-mono text-foundation-700 mt-2">
              <span className="bg-foundation-100 px-2 py-0.5 rounded font-bold text-foundation-900">
                {accuracyClass}
              </span>
              <span>Max: <strong>{maxCapacity}</strong></span>
              <span>•</span>
              <span>Min: <strong>100 g</strong></span>
              <span>•</span>
              <span>e = <strong>{interval.replace('e = ', '')}</strong></span>
              <span>•</span>
              <span>d = <strong>5 g</strong></span>
            </div>
          </div>
        </div>

        {/* Traceability Health Quick Pill */}
        <div className="flex items-center gap-2 font-mono text-xs self-start lg:self-center">
          <span className="text-foundation-500">Traceability:</span>
          {standardsValid ? (
            <span className="px-2.5 py-1 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold flex items-center gap-1.5 shadow-2xs">
              <ShieldCheck size={13} className="text-emerald-600" />
              <span>✓ VALID (E2-014 Assigned)</span>
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded bg-rose-50 text-rose-800 border border-rose-300 font-bold flex items-center gap-1.5 shadow-2xs">
              <Lock size={13} className="text-rose-600" />
              <span>✕ LOCKED (M1-003 Expired)</span>
            </span>
          )}
        </div>
      </div>

      {/* 2. Verification Stage Segmented Selector (§3) */}
      <div>
        <label className="block text-[11px] font-bold text-foundation-500 uppercase tracking-wider mb-2 font-sans">
          Select Verification Stage (Determines Applicable Scope):
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {stages.map((stg) => {
            const isSelected = verificationStage === stg.value;

            return (
              <button
                key={stg.value}
                type="button"
                disabled={disabled}
                onClick={() => onSelectStage(stg.value)}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-brand-900 text-white border-brand-950 shadow-sm ring-2 ring-brand-300'
                    : 'bg-foundation-50/70 border-foundation-200 text-foundation-800 hover:bg-foundation-100 hover:border-foundation-300'
                } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-xs font-black tracking-tight uppercase ${
                      isSelected ? 'text-white' : 'text-foundation-900'
                    }`}
                  >
                    {stg.label}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-brand-400 animate-pulse" />
                  )}
                </div>
                <p
                  className={`text-[11px] mt-1 font-sans ${
                    isSelected ? 'text-brand-200' : 'text-foundation-500'
                  }`}
                >
                  {stg.sublabel}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
