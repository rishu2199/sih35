import React from 'react';
import { Check, AlertTriangle, Lock } from 'lucide-react';

export type StepperState = 'completed' | 'current' | 'available' | 'locked' | 'blocked';

export interface StepItem {
  id?: string;
  number: string | number;
  label: string;
  state: StepperState;
  onClick?: () => void;
}

export interface StepperProps {
  steps: StepItem[];
  className?: string;
}

/**
 * METROLOGIX-76 Standard Stepper Primitive (§27, §28)
 * Core product identity component:
 * 01 ─── 02 ─── 03 ─── 04 ─── 05 ─── 06 ─── 07
 *  ✓      ✓      ●      ○      ○      ○      ○
 */
export const Stepper: React.FC<StepperProps> = ({ steps, className = '' }) => {
  return (
    <div className={`w-full overflow-x-auto py-2 ${className}`}>
      <div className="flex items-center justify-between min-w-[640px] max-w-4xl mx-auto">
        {steps.map((step, idx) => {
          const isCompleted = step.state === 'completed';
          const isCurrent = step.state === 'current';
          const isBlocked = step.state === 'blocked';
          const isLocked = step.state === 'locked';
          const isClickable = !!step.onClick && !isLocked;

          return (
            <React.Fragment key={step.id || idx}>
              <div className="flex flex-col items-center gap-1.5 relative group">
                <button
                  type="button"
                  disabled={!isClickable}
                  onClick={step.onClick}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all select-none ${
                    isCompleted
                      ? 'bg-emerald-600 text-white ring-2 ring-emerald-100 dark:ring-emerald-950'
                      : isCurrent
                      ? 'bg-[#2563EB] text-white ring-4 ring-blue-100 dark:ring-blue-950 shadow-xs'
                      : isBlocked
                      ? 'bg-rose-600 text-white ring-2 ring-rose-200'
                      : isLocked
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-300 dark:border-slate-700'
                      : 'bg-white dark:bg-slate-800 text-slate-600 border border-slate-300 dark:border-slate-600'
                  } ${isClickable ? 'cursor-pointer' : 'cursor-default'}`}
                >
                  {isCompleted ? (
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  ) : isCurrent ? (
                    <span className="text-[10px]">●</span>
                  ) : isBlocked ? (
                    <span>!</span>
                  ) : (
                    <span className="text-[11px] font-mono">{step.number}</span>
                  )}
                </button>

                <div className="text-center">
                  <div
                    className={`text-[11px] font-medium leading-none ${
                      isCurrent
                        ? 'text-blue-600 dark:text-blue-400 font-bold'
                        : isCompleted
                        ? 'text-slate-700 dark:text-slate-300'
                        : isBlocked
                        ? 'text-rose-600 font-bold'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </div>
                  {isCurrent && (
                    <span className="text-[9px] font-mono text-blue-500 uppercase tracking-wider block mt-0.5">
                      ● Current
                    </span>
                  )}
                </div>
              </div>

              {idx < steps.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-2 transition-colors ${
                    isCompleted
                      ? 'bg-emerald-500'
                      : isCurrent
                      ? 'bg-blue-300 dark:bg-blue-900'
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
