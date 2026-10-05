import React from 'react';
import { Check, Clock, AlertTriangle, ArrowRight } from 'lucide-react';
import { PreflightLifecycleStep } from './types';
import { CANONICAL_PREFLIGHT_STEPS } from './mockReadinessData';

interface PreflightStepperProps {
  steps?: PreflightLifecycleStep[];
  onNavigateToTab: (tabId: string) => void;
}

export const PreflightStepper: React.FC<PreflightStepperProps> = ({
  steps = CANONICAL_PREFLIGHT_STEPS,
  onNavigateToTab,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
            STATUTORY WORKFLOW §23
          </span>
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
            Seven-Stage Verification Stepper
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] font-semibold text-slate-500">
            Stage 04 of 07 · <strong className="text-blue-600 dark:text-blue-400 font-bold">Preflight Gate</strong>
          </span>
        </div>
      </div>

      {/* Stepper track */}
      <div className="pt-4 overflow-x-auto pb-1">
        <div className="flex items-start justify-between min-w-[700px] relative px-2">
          {/* Horizontal track line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-100 dark:bg-slate-800 -z-0" />

          {steps.map((st) => {
            const isCompleted = st.status === 'COMPLETED';
            const isActive = st.status === 'ACTIVE';

            let nodeStyles = 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700';
            if (isCompleted) {
              nodeStyles = 'bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-950/60 shadow-xs cursor-pointer hover:bg-emerald-500';
            } else if (isActive) {
              nodeStyles = 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/80 shadow-md animate-pulse';
            }

            return (
              <div
                key={st.stepNumber}
                onClick={() => {
                  if (st.targetTab && isCompleted) {
                    onNavigateToTab(st.targetTab);
                  }
                }}
                className={`flex flex-col items-center z-10 text-center max-w-[95px] select-none ${
                  isCompleted ? 'cursor-pointer group' : ''
                }`}
                title={`${st.stepNumber} ${st.name}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono font-bold text-xs transition-all ${nodeStyles}`}
                >
                  {isCompleted ? (
                    <Check className="w-4 h-4 stroke-[3]" />
                  ) : (
                    <span>{st.stepNumber}</span>
                  )}
                </div>

                <span
                  className={`text-[11px] font-bold mt-2 leading-tight transition-colors ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 font-black'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200 group-hover:text-blue-600'
                      : 'text-slate-400'
                  }`}
                >
                  {st.shortName}
                </span>

                <span
                  className={`text-[9px] font-mono mt-0.5 px-1.5 py-0.2 rounded font-semibold ${
                    isCompleted
                      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : isActive
                      ? 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {isCompleted ? '✓ Done' : isActive ? '● Current' : '○ Upcoming'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
