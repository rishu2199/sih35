import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ShieldCheck,
  Lock,
  ArrowRight,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { StatutoryTestItem } from './types';

interface VerificationReadinessPanelProps {
  tests: StatutoryTestItem[];
  standardsValid: boolean;
  onStartTesting: () => void;
  onResolveBlocker?: () => void;
  baselineRecorded?: boolean;
}

export const VerificationReadinessPanel: React.FC<VerificationReadinessPanelProps> = ({
  tests,
  standardsValid,
  onStartTesting,
  onResolveBlocker,
  baselineRecorded = true,
}) => {
  const applicableTests = tests.filter((t) => t.applicable);
  const requiredTests = tests.filter((t) => t.required);
  const completedTests = tests.filter((t) => t.status === 'COMPLETE');
  const isAllPrereqsMet = standardsValid && baselineRecorded;
  const isTestingBlocked = !standardsValid || !baselineRecorded;

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Hard Blocked Warning Box (§12) */}
      {isTestingBlocked ? (
        <div className="bg-rose-50 border-2 border-rose-500 rounded-xl p-5 shadow-xs text-rose-950 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-lg bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <Lock size={18} className="stroke-[2.5]" />
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] font-black uppercase tracking-wider text-rose-700 bg-rose-100 px-2 py-0.5 rounded">
                  TESTING BLOCKED
                </span>
                <span className="text-rose-500">•</span>
                <span className="text-xs text-rose-700 font-bold">
                  Prerequisite Gate Active
                </span>
              </div>

              <h4 className="text-sm font-bold text-rose-950 mt-1 font-sans">
                1 prerequisite needs attention before testing starts.
              </h4>

              <div className="mt-2 space-y-1.5 text-xs">
                {!standardsValid && (
                  <p className="text-rose-900 flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                    <span>Standard weight set <strong>M1-003</strong> has expired. Measurement capture disabled.</span>
                  </p>
                )}
                {!baselineRecorded && (
                  <p className="text-rose-900 flex items-center gap-1.5 font-sans">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 shrink-0" />
                    <span>Environmental laboratory baseline not recorded. Chamber telemetry required.</span>
                  </p>
                )}
              </div>

              <div className="mt-3.5">
                <button
                  type="button"
                  onClick={onResolveBlocker}
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Resolve Traceability Gate →</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Ready Banner */
        <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                STATUTORY GATE CLEARED
              </span>
              <span className="text-xs font-bold text-emerald-950 font-sans">
                All Metrological Preconditions Satisfied
              </span>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-900 text-[11px] font-bold">
            ● READY
          </span>
        </div>
      )}

      {/* 2. Readiness Checklist Card (§11) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs space-y-3.5">
        <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
          <div>
            <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider block">
              PRE-TESTING CHECKLIST
            </span>
            <h4 className="text-sm font-bold text-foundation-950 font-sans">
              Readiness Verification Gate
            </h4>
          </div>
          <span className="text-xs text-foundation-500 font-bold">
            {isAllPrereqsMet ? '6 / 6 Checked' : '5 / 6 Checked'}
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
            <span className="text-foundation-700 font-sans">Instrument registered & serial verified</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 shrink-0">
              <CheckCircle2 size={13} />
              <span>✓ Validated</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
            <span className="text-foundation-700 font-sans">Metrological specifications validated (Max 30kg, e 5g)</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 shrink-0">
              <CheckCircle2 size={13} />
              <span>✓ Certified</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
            <span className="text-foundation-700 font-sans">Verification stage selected & protocol mapped</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 shrink-0">
              <CheckCircle2 size={13} />
              <span>✓ Stage Mapped</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
            <span className="text-foundation-700 font-sans">Applicable procedures determined (8 tests evaluated)</span>
            <span className="font-bold text-emerald-700 flex items-center gap-1 shrink-0">
              <CheckCircle2 size={13} />
              <span>✓ {applicableTests.length} Applicable</span>
            </span>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
            <span className="text-foundation-700 font-sans">Standard weights validity & NABL certification</span>
            {standardsValid ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                <CheckCircle2 size={13} />
                <span>✓ Valid (E2-014)</span>
              </span>
            ) : (
              <span className="font-bold text-rose-700 flex items-center gap-1 shrink-0">
                <Lock size={13} />
                <span>✕ Expired Standard</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-lg bg-foundation-50 border border-foundation-200">
            <span className="text-foundation-700 font-sans">Laboratory climatic baseline recorded (23.4°C, 48% RH)</span>
            {baselineRecorded ? (
              <span className="font-bold text-emerald-700 flex items-center gap-1 shrink-0">
                <CheckCircle2 size={13} />
                <span>✓ Recorded</span>
              </span>
            ) : (
              <span className="font-bold text-amber-700 flex items-center gap-1 shrink-0">
                <AlertTriangle size={13} />
                <span>⚠ Missing</span>
              </span>
            )}
          </div>
        </div>

        {/* Primary CTA: Start Testing (§11, §12) */}
        <div className="pt-2 border-t border-foundation-100">
          <button
            type="button"
            disabled={isTestingBlocked}
            onClick={onStartTesting}
            className={`w-full py-3 px-6 rounded-xl font-bold text-sm tracking-wide transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer ${
              isTestingBlocked
                ? 'bg-foundation-300 text-foundation-500 cursor-not-allowed shadow-none'
                : 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-brand-200'
            }`}
          >
            <span>Start Testing →</span>
            <ArrowRight size={16} className="stroke-[2.5]" />
          </button>

          {isTestingBlocked && (
            <p className="text-[11px] text-center text-rose-600 mt-2 font-medium font-sans">
              Resolve statutory blocker above before proceeding to test workflow.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
