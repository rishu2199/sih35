import React from 'react';
import { Check, Lock, AlertTriangle, ArrowRight } from 'lucide-react';

interface SessionStepperProps {
  currentTab: string;
  onNavigate: (tab: string) => void;
  isTraceabilityLocked?: boolean;
}

export type StepState = 'COMPLETED' | 'CURRENT' | 'UPCOMING' | 'BLOCKED' | 'LOCKED';

interface StepperStep {
  id: string;
  number: number;
  label: string;
  shortLabel: string;
  tab: string;
}

export const SESSION_STEPS: StepperStep[] = [
  { id: 'preflight', number: 1, label: 'Preflight', shortLabel: 'Preflight', tab: 'readiness' },
  { id: 'inspection', number: 2, label: 'Inspection', shortLabel: 'Inspection', tab: 'physical_inspection' },
  { id: 'weighing', number: 3, label: 'Weighing', shortLabel: 'Weighing', tab: 'weighing_linearity' },
  { id: 'eccentricity', number: 4, label: 'Eccentricity', shortLabel: 'Eccentricity', tab: 'eccentricity_workspace' },
  { id: 'repeatability', number: 5, label: 'Repeatability', shortLabel: 'Repeatability', tab: 'repeatability_workspace' },
  { id: 'environmental', number: 6, label: 'Environmental', shortLabel: 'Environmental', tab: 'environmental_workspace' },
  { id: 'review', number: 7, label: 'Review & Sign', shortLabel: 'Review', tab: 'review' },
];

export const SessionStepper: React.FC<SessionStepperProps> = ({
  currentTab,
  onNavigate,
  isTraceabilityLocked = false,
}) => {
  // Determine current active step index
  const getCurrentStepIndex = () => {
    switch (currentTab) {
      case 'readiness':
      case 'preflight':
        return 0;
      case 'physical_inspection':
        return 1;
      case 'weighing_linearity':
        return 2;
      case 'eccentricity_workspace':
        return 3;
      case 'repeatability_workspace':
        return 4;
      case 'environmental_workspace':
        return 5;
      case 'review':
      case 'review_workspace':
        return 6;
      default:
        return 0;
    }
  };

  const currentIndex = getCurrentStepIndex();

  const getStepState = (index: number): StepState => {
    if (isTraceabilityLocked && index >= 2 && index < 6) {
      return 'LOCKED';
    }
    if (index < currentIndex) return 'COMPLETED';
    if (index === currentIndex) return 'CURRENT';
    return 'UPCOMING';
  };

  return (
    <div className="w-full overflow-x-auto py-1">
      <div className="flex items-center justify-between min-w-[720px] max-w-5xl mx-auto">
        {SESSION_STEPS.map((step, index) => {
          const state = getStepState(index);
          const isCurrent = state === 'CURRENT';
          const isCompleted = state === 'COMPLETED';
          const isLocked = state === 'LOCKED';
          const isClickable = !isLocked;

          return (
            <React.Fragment key={step.id}>
              {/* Step Node */}
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => onNavigate(step.tab)}
                className={`flex items-center gap-2 group transition-all text-left ${
                  isClickable ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                }`}
              >
                {/* Node Circle */}
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold transition-all shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-100 dark:ring-emerald-950'
                      : isCurrent
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-xs'
                      : isLocked
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border border-rose-300'
                      : 'bg-white dark:bg-slate-800 text-slate-500 border border-slate-300 dark:border-slate-700 group-hover:border-blue-400'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : isLocked ? (
                    <Lock className="w-3 h-3 text-rose-600" />
                  ) : (
                    step.number
                  )}
                </div>

                {/* Step Label */}
                <span
                  className={`text-xs font-medium whitespace-nowrap transition-colors ${
                    isCurrent
                      ? 'font-bold text-blue-700 dark:text-blue-400'
                      : isCompleted
                      ? 'font-semibold text-slate-700 dark:text-slate-300'
                      : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-800'
                  }`}
                >
                  {step.shortLabel}
                </span>
              </button>

              {/* Connecting Line between steps */}
              {index < SESSION_STEPS.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2.5 transition-colors ${
                    index < currentIndex
                      ? 'bg-emerald-500 dark:bg-emerald-600'
                      : 'bg-slate-200 dark:bg-slate-800'
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
