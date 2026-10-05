import React from 'react';

export type StatusPillType =
  | 'DRAFT'
  | 'IN_TESTING'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REMANDED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'VALID'
  | 'EXPIRED'
  | 'RETIRED';

interface StatusPillProps {
  status: StatusPillType | string;
  size?: 'sm' | 'md';
  className?: string;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  size = 'md',
  className = '',
}) => {
  const getStyles = () => {
    switch (status.toUpperCase()) {
      case 'APPROVED':
      case 'VALID':
      case 'ACTIVE':
        return 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'IN_TESTING':
        return 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'PENDING_REVIEW':
        return 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'REMANDED':
      case 'EXPIRED':
      case 'INACTIVE':
        return 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'RETIRED':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700';
      case 'DRAFT':
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const sizeClass = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-0.5';

  return (
    <span
      className={`inline-flex items-center font-mono font-bold uppercase rounded-full border ${getStyles()} ${sizeClass} ${className}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
};
