import React from 'react';
import { CheckCircle2, Circle, Clock, ShieldCheck, Lock, ExternalLink } from 'lucide-react';

interface SessionProgressWidgetProps {
  standardsValid: boolean;
  assignedStandardId?: string;
  assignedStandardClass?: string;
  daysRemaining?: number;
  validUntilDate?: string;
  onNavigateToStandards?: () => void;
}

export const SessionProgressWidget: React.FC<SessionProgressWidgetProps> = ({
  standardsValid,
  assignedStandardId = 'E2-014',
  assignedStandardClass = 'E2',
  daysRemaining = 42,
  validUntilDate = '12 Dec 2026',
  onNavigateToStandards,
}) => {
  const steps = [
    { title: 'Registration & Intake', status: 'COMPLETE' },
    { title: 'Preconditions & Baseline', status: 'COMPLETE' },
    { title: 'Test Plan & Scope Gate', status: 'CURRENT' },
    { title: 'Statutory Testing (OIML)', status: 'UPCOMING' },
    { title: 'Statutory Review', status: 'UPCOMING' },
    { title: 'Director Sign-Off', status: 'UPCOMING' },
    { title: 'Bilingual Certificate', status: 'UPCOMING' },
  ];

  return (
    <div className="space-y-4 font-mono select-none">
      {/* 1. Workflow Session Progress (§14) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs">
        <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider block mb-3">
          SESSION WORKFLOW PROGRESS
        </span>

        <div className="space-y-2 text-xs">
          {steps.map((st, idx) => {
            const isComplete = st.status === 'COMPLETE';
            const isCurrent = st.status === 'CURRENT';

            return (
              <div
                key={idx}
                className={`p-2 rounded-lg flex items-center justify-between transition-colors ${
                  isCurrent
                    ? 'bg-brand-50 border border-brand-200 font-bold text-brand-900'
                    : isComplete
                    ? 'text-foundation-700'
                    : 'text-foundation-400'
                }`}
              >
                <div className="flex items-center gap-2">
                  {isComplete ? (
                    <CheckCircle2 size={13} className="text-emerald-600 shrink-0" />
                  ) : isCurrent ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-brand-600 animate-pulse shrink-0" />
                  ) : (
                    <Circle size={10} className="text-foundation-300 shrink-0" />
                  )}
                  <span className="font-sans text-[11px]">{st.title}</span>
                </div>

                {isCurrent && (
                  <span className="text-[9px] font-black uppercase tracking-wider bg-brand-600 text-white px-1.5 py-0.5 rounded">
                    YOU ARE HERE
                  </span>
                )}
                {isComplete && (
                  <span className="text-[10px] font-bold text-emerald-700">✓</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Traceability Context Widget (§14) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-2 border-b border-foundation-100">
          <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider">
            ASSIGNED TRACEABILITY
          </span>
          {onNavigateToStandards && (
            <button
              type="button"
              onClick={onNavigateToStandards}
              className="text-[11px] text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage</span>
              <ExternalLink size={10} />
            </button>
          )}
        </div>

        <div className="mt-3 space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-foundation-500">Standard Set:</span>
            <div className="flex items-center gap-1.5">
              <span className="px-1.5 py-0.2 rounded bg-indigo-100 text-indigo-900 font-bold text-[10px]">
                Class {assignedStandardClass}
              </span>
              <strong className="text-foundation-950 font-bold">{assignedStandardId}</strong>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-foundation-500">Traceability:</span>
            {standardsValid ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <ShieldCheck size={12} className="text-emerald-600" />
                <span>✓ Valid & Traceable</span>
              </span>
            ) : (
              <span className="text-rose-700 font-bold flex items-center gap-1">
                <Lock size={12} className="text-rose-600" />
                <span>✕ Expired</span>
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-foundation-500">Calibration Validity:</span>
            <span className={standardsValid ? 'text-foundation-800 font-bold' : 'text-rose-700 font-bold'}>
              {standardsValid ? `${daysRemaining} days left` : 'Expired'}
            </span>
          </div>

          <div className="flex items-center justify-between text-[11px] text-foundation-400 pt-1 border-t border-foundation-100">
            <span>Valid Until:</span>
            <span className="font-semibold text-foundation-600">{validUntilDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
