import React from 'react';
import type { AccuracyClass, VerificationStage } from '../../types';

interface StatusPillProps {
  type: 'class' | 'stage' | 'status' | 'custom';
  value: AccuracyClass | VerificationStage | string;
  label?: string;
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  type,
  value,
  label,
  className = '',
}) => {
  let displayLabel = label || value;
  let styleClasses = 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/80 dark:text-slate-300 dark:border-slate-700';

  if (type === 'class') {
    switch (value) {
      case 'CLASS_I':
        displayLabel = label || 'Class I';
        styleClasses =
          'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60';
        break;
      case 'CLASS_II':
        displayLabel = label || 'Class II';
        styleClasses =
          'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300 border-sky-200 dark:border-sky-800/60';
        break;
      case 'CLASS_III':
        displayLabel = label || 'Class III';
        styleClasses =
          'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/60';
        break;
      case 'CLASS_IIII':
        displayLabel = label || 'Class IIII';
        styleClasses =
          'bg-slate-100 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200 dark:border-slate-700/60';
        break;
    }
  } else if (type === 'stage') {
    switch (value) {
      case 'INITIAL_TYPE_APPROVAL':
        displayLabel = label || 'Type Approval';
        styleClasses =
          'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-700/60';
        break;
      case 'SUBSEQUENT_VERIFICATION':
        displayLabel = label || 'Subsequent';
        styleClasses =
          'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300 border-slate-200 dark:border-slate-700/60';
        break;
      case 'IN_SERVICE_INSPECTION':
        displayLabel = label || 'In-Service';
        styleClasses =
          'bg-amber-50 text-amber-800 dark:bg-amber-950/30 dark:text-amber-300 border-amber-200 dark:border-amber-800/50';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] font-mono tracking-tight border font-medium select-none ${styleClasses} ${className}`}
    >
      {displayLabel}
    </span>
  );
};
