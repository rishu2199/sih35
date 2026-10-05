import React from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCheck2,
  Calendar,
  Layers,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface PhysicalInspectionSummaryCardProps {
  sessionNumber: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  maxCapacity: string;
  verificationInterval: string;
  isTiltValid: boolean;
  tiltValue: number;
  securityStatus: 'PASS' | 'FAIL' | 'PENDING';
  isCameraVerified: boolean;
}

export const PhysicalInspectionSummaryCard: React.FC<PhysicalInspectionSummaryCardProps> = ({
  sessionNumber,
  manufacturer,
  model,
  serialNumber,
  accuracyClass,
  maxCapacity,
  verificationInterval,
  isTiltValid,
  tiltValue,
  securityStatus,
  isCameraVerified,
}) => {
  // 7-step test readiness workflow
  const testStages = [
    { id: 1, name: 'Intake & Registration', status: 'COMPLETED' },
    { id: 2, name: 'Physical Audit', status: 'CURRENT' },
    { id: 3, name: 'Weighing Error', status: 'PENDING' },
    { id: 4, name: 'Eccentricity', status: 'PENDING' },
    { id: 5, name: 'Repeatability', status: 'PENDING' },
    { id: 6, name: 'Environmental Check', status: 'PENDING' },
    { id: 7, name: 'Review & Sign-Off', status: 'PENDING' },
  ];

  return (
    <div className="bg-white rounded-xl border border-foundation-200 shadow-xs p-5 space-y-5 sticky top-6">
      {/* 1. Instrument Card Identity */}
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
          <span className="text-[11px] font-bold text-foundation-400 tracking-wider uppercase font-mono">
            INSTRUMENT
          </span>
          <span className="text-[10px] font-mono font-bold bg-brand-50 text-brand-700 px-2 py-0.5 rounded border border-brand-200">
            {accuracyClass}
          </span>
        </div>

        <div className="mt-3 flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-foundation-100 border border-foundation-200 flex items-center justify-center text-foundation-600 shrink-0">
            <Scale size={20} className="text-brand-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foundation-950 leading-tight">
              {manufacturer}
            </h3>
            <p className="text-xs text-foundation-600 font-medium">
              {model}
            </p>
            <p className="text-[11px] font-mono text-foundation-400 mt-1">
              SN: {serialNumber}
            </p>
          </div>
        </div>

        {/* Metrological Specs Matrix */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-foundation-100 text-xs font-mono">
          <div className="bg-foundation-50 rounded p-2 border border-foundation-100">
            <span className="text-[10px] text-foundation-400 block uppercase">Max Capacity</span>
            <span className="font-bold text-foundation-800">{maxCapacity}</span>
          </div>
          <div className="bg-foundation-50 rounded p-2 border border-foundation-100">
            <span className="text-[10px] text-foundation-400 block uppercase">Interval e</span>
            <span className="font-bold text-foundation-800">{verificationInterval}</span>
          </div>
        </div>
      </div>

      {/* 2. Session Context (Section 15) */}
      <div className="pt-3 border-t border-foundation-100">
        <span className="text-[11px] font-bold text-foundation-400 tracking-wider uppercase font-mono block mb-2">
          SESSION CONTEXT
        </span>
        <div className="bg-foundation-50 rounded-lg p-2.5 border border-foundation-200 space-y-1.5 text-xs font-mono">
          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Case ID:</span>
            <span className="font-bold text-foundation-900">{sessionNumber}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Opened:</span>
            <span className="text-foundation-700">04 Oct 2026 · 15:40</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-foundation-500">Laboratory:</span>
            <span className="text-foundation-700">RRSL Node 04</span>
          </div>
        </div>
      </div>

      {/* 3. Physical Inspection Checklist (Section 2 & 15) */}
      <div className="pt-3 border-t border-foundation-100">
        <span className="text-[11px] font-bold text-foundation-400 tracking-wider uppercase font-mono block mb-2.5">
          INSPECTION PROGRESS
        </span>

        <div className="space-y-2">
          {/* Check 1: Instrument View */}
          <div className="flex items-center justify-between p-2 rounded-lg bg-foundation-50 border border-foundation-100 text-xs">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-600" />
              <span className="font-medium text-foundation-800">Instrument View</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">
              VERIFIED
            </span>
          </div>

          {/* Check 2: Spirit Level */}
          <div
            className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
              isTiltValid
                ? 'bg-foundation-50 border-foundation-100'
                : 'bg-rose-50/70 border-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {isTiltValid ? (
                <CheckCircle2 size={14} className="text-emerald-600" />
              ) : (
                <AlertTriangle size={14} className="text-rose-600" />
              )}
              <span className="font-medium text-foundation-800">Spirit Level</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                isTiltValid
                  ? 'text-emerald-700 bg-emerald-50'
                  : 'text-rose-700 bg-rose-100'
              }`}
            >
              {tiltValue.toFixed(2)}° · {isTiltValid ? 'PASS' : 'FAIL'}
            </span>
          </div>

          {/* Check 3: Security Seals */}
          <div
            className={`flex items-center justify-between p-2 rounded-lg border text-xs transition-colors ${
              securityStatus === 'PASS'
                ? 'bg-foundation-50 border-foundation-100'
                : securityStatus === 'FAIL'
                ? 'bg-rose-50/70 border-rose-200'
                : 'bg-amber-50/70 border-amber-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {securityStatus === 'PASS' ? (
                <CheckCircle2 size={14} className="text-emerald-600" />
              ) : securityStatus === 'FAIL' ? (
                <XCircle size={14} className="text-rose-600" />
              ) : (
                <AlertTriangle size={14} className="text-amber-600" />
              )}
              <span className="font-medium text-foundation-800">Security Seals</span>
            </div>
            <span
              className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${
                securityStatus === 'PASS'
                  ? 'text-emerald-700 bg-emerald-50'
                  : securityStatus === 'FAIL'
                  ? 'text-rose-700 bg-rose-100'
                  : 'text-amber-700 bg-amber-100'
              }`}
            >
              {securityStatus === 'PASS' ? 'INTACT' : securityStatus === 'FAIL' ? 'DAMAGED' : 'PENDING'}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Test Readiness 7-Step Tracker (Section 15) */}
      <div className="pt-3 border-t border-foundation-100">
        <span className="text-[11px] font-bold text-foundation-400 tracking-wider uppercase font-mono block mb-2.5">
          TEST READINESS RAIL
        </span>

        <div className="space-y-1.5">
          {testStages.map((stage) => {
            const isCompleted = stage.status === 'COMPLETED';
            const isCurrent = stage.status === 'CURRENT';

            return (
              <div
                key={stage.id}
                className={`flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs font-medium ${
                  isCurrent
                    ? 'bg-brand-50 text-brand-900 border border-brand-200 font-semibold'
                    : isCompleted
                    ? 'text-foundation-700'
                    : 'text-foundation-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-mono font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCurrent
                        ? 'bg-brand-600 text-white'
                        : 'bg-foundation-100 text-foundation-400'
                    }`}
                  >
                    {isCompleted ? '✓' : stage.id}
                  </span>
                  <span>{stage.name}</span>
                </div>

                {isCurrent && (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-600 animate-pulse" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
