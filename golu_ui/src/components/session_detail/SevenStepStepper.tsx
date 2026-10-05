import React from 'react';
import { Check, ArrowRight, Lock, AlertTriangle, Play, Sparkles } from 'lucide-react';
import { TestStepItem } from './types';

interface SevenStepStepperProps {
  steps: TestStepItem[];
  currentStepIndex: number;
  onStepClick: (step: TestStepItem) => void;
  onContinueCurrentStep: () => void;
  isTraceabilityLocked?: boolean;
}

export const SevenStepStepper: React.FC<SevenStepStepperProps> = ({
  steps,
  currentStepIndex,
  onStepClick,
  onContinueCurrentStep,
  isTraceabilityLocked = false,
}) => {
  const currentStep = steps[currentStepIndex] || steps[0];
  const completedCount = steps.filter((s) => s.state === 'COMPLETED').length;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
      {/* Stepper Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-black text-slate-900 dark:text-white tracking-tight">
            Seven-Step Verification Workflow
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            OIML R 76-1 statutory verification sequence. Complete each test in sequential order.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            {completedCount} / 7 Completed
          </span>
        </div>
      </div>

      {/* Desktop Visual Track (§6 & §7) */}
      <div className="relative pt-3 pb-4 overflow-x-auto">
        <div className="flex items-start justify-between min-w-[720px] relative px-4">
          {/* Background Connecting Track Line */}
          <div className="absolute top-5 left-8 right-8 h-1 bg-slate-100 dark:bg-slate-800 -z-0" />

          {steps.map((st, idx) => {
            const isCompleted = st.state === 'COMPLETED';
            const isInProgress = st.state === 'IN_PROGRESS';
            const isBlocked = st.state === 'BLOCKED';
            const isLocked = st.state === 'LOCKED';
            const isUpcoming = st.state === 'UPCOMING';

            let nodeClass = 'bg-white dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-slate-400';
            if (isCompleted) {
              nodeClass = 'bg-emerald-600 text-white ring-4 ring-emerald-100 dark:ring-emerald-950/80 shadow-xs';
            } else if (isInProgress) {
              nodeClass = 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950/80 shadow-md animate-pulse';
            } else if (isBlocked) {
              nodeClass = 'bg-red-600 text-white ring-4 ring-red-100 dark:ring-red-950/80 shadow-xs';
            } else if (isLocked) {
              nodeClass = 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700';
            }

            return (
              <div
                key={st.id}
                onClick={() => onStepClick(st)}
                className="flex flex-col items-center cursor-pointer group z-10 text-center max-w-[90px] transition-transform hover:-translate-y-0.5"
                title={`${st.stepNumber} ${st.name} (${st.badgeText})`}
              >
                {/* Node circle */}
                <div
                  className={`w-10 h-10 rounded-2xl flex items-center justify-center font-mono font-bold text-xs transition-all duration-200 ${nodeClass}`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isBlocked ? (
                    <AlertTriangle className="w-4 h-4 stroke-[2.5]" />
                  ) : isLocked ? (
                    <Lock className="w-4 h-4" />
                  ) : (
                    <span>{st.stepNumber}</span>
                  )}
                </div>

                {/* Step label */}
                <span
                  className={`text-xs font-bold mt-2 leading-tight transition-colors ${
                    isInProgress
                      ? 'text-blue-600 dark:text-blue-400 font-black'
                      : isCompleted
                      ? 'text-slate-800 dark:text-slate-200'
                      : 'text-slate-500 group-hover:text-slate-800 dark:group-hover:text-slate-200'
                  }`}
                >
                  {st.shortName}
                </span>

                {/* Status indicator tag */}
                <span
                  className={`text-[10px] font-mono font-semibold mt-1 px-1.5 py-0.5 rounded ${
                    isCompleted
                      ? 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : isInProgress
                      ? 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 dark:text-blue-300 font-bold'
                      : isBlocked
                      ? 'text-red-700 bg-red-50 dark:bg-red-950/60 dark:text-red-300'
                      : 'text-slate-400'
                  }`}
                >
                  {st.badgeText}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Prominent Current-Step Callout (§8) */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50/80 dark:from-slate-800/80 dark:to-indigo-950/40 border border-blue-200 dark:border-indigo-900/60 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-950/80 px-2 py-0.5 rounded-md">
              CURRENT STEP
            </span>
            <span className="font-mono text-xs font-bold text-slate-500">
              STAGE {currentStep.stepNumber} OF 07
            </span>
          </div>

          <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
            {currentStep.name}
          </h3>

          <p className="text-xs text-slate-600 dark:text-slate-300 max-w-xl">
            {currentStep.resultSummary || 'Record observations and evaluate legal metrology compliance under OIML R 76-1.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onContinueCurrentStep}
          disabled={isTraceabilityLocked}
          className={`inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs shadow-md transition-all self-start md:self-center cursor-pointer ${
            isTraceabilityLocked
              ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 hover:scale-[1.02]'
          }`}
        >
          <span>{currentStep.state === 'COMPLETED' ? 'Review Current Test' : 'Continue Testing'}</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
