import React from 'react';

export interface StepDefinition {
  id: string;
  stepNum: string;
  label: string;
  short: string;
}

export interface SessionStepperProps {
  steps: StepDefinition[];
  currentTab: string;
  currentStepNumber: number;
  isApproved?: boolean;
  onStepClick: (step: StepDefinition, stepIndex: number) => void;
  className?: string;
}

/**
 * SessionStepper (§23, §24, §25, §35)
 * Responsive 7-step OIML statutory workflow stepper
 */
export const SessionStepper: React.FC<SessionStepperProps> = ({
  steps,
  currentTab,
  currentStepNumber,
  isApproved = false,
  onStepClick,
  className = '',
}) => {
  const activeStepIdx = steps.findIndex((s) => s.id === currentTab);
  const currentStepObj = steps[activeStepIdx !== -1 ? activeStepIdx : 0] || steps[0];

  return (
    <div className={`px-4 sm:px-6 py-2.5 bg-slate-50/70 dark:bg-slate-900/60 overflow-x-auto scrollbar-none ${className}`}>
      
      {/* Mobile Selector (§25) */}
      <div className="md:hidden flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
            Step {currentStepObj.stepNum} / 07
          </span>
          <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs">
            {currentStepObj.label}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {steps.map((s, idx) => {
            const stepNum = idx + 1;
            const isCurrent = currentTab === s.id;
            const isCompleted = stepNum < currentStepNumber || isApproved;

            return (
              <button
                key={s.id}
                type="button"
                onClick={() => onStepClick(s, idx)}
                className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] cursor-pointer transition-colors ${
                  isCurrent
                    ? 'bg-blue-600 text-white font-bold'
                    : isCompleted
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
                }`}
                title={`${s.stepNum} ${s.short}`}
              >
                {isCompleted && !isCurrent ? '✓' : stepNum}
              </button>
            );
          })}
        </div>
      </div>

      {/* Desktop 7-Step horizontal stepper (§23, §24) */}
      <div className="hidden md:flex items-center justify-between min-w-[760px] gap-2">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCurrent = currentTab === step.id || (currentTab === 'review' && step.id === 'review_workspace');
          const isCompleted = stepNum < currentStepNumber || isApproved;
          const isNext = stepNum === currentStepNumber + 1;

          return (
            <React.Fragment key={step.id}>
              <button
                type="button"
                onClick={() => onStepClick(step, idx)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                  isCurrent
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : isCompleted
                    ? 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-blue-400'
                    : isNext
                    ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                    : 'text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 opacity-80'
                }`}
                title={
                  isCompleted
                    ? `Completed: Re-inspect Step ${step.stepNum}`
                    : isCurrent
                    ? `Current Step: ${step.label}`
                    : `Upcoming: Step ${step.stepNum}`
                }
              >
                <span
                  className={`font-mono text-[10px] w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    isCurrent
                      ? 'bg-white/20 text-white'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 font-bold'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted && !isCurrent ? '✓' : step.stepNum}
                </span>
                <span>{step.short}</span>
              </button>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-[2px] mx-1 max-w-[32px] transition-colors ${
                    isCompleted ? 'bg-emerald-400 dark:bg-emerald-600' : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
