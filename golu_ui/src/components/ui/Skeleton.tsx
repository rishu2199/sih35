import React from 'react';

interface SkeletonProps {
  className?: string;
  variant?: 'text' | 'rect' | 'circle' | 'table-row';
  lines?: number;
}

export const Skeleton: React.FC<SkeletonProps> = ({
  className = '',
  variant = 'rect',
  lines = 1,
}) => {
  if (variant === 'text') {
    return (
      <div className="space-y-2">
        {Array.from({ length: lines }).map((_, idx) => (
          <div
            key={idx}
            className={`h-3 rounded-md bg-slate-200 dark:bg-slate-800 animate-pulse ${
              idx === lines - 1 && lines > 1 ? 'w-3/4' : 'w-full'
            } ${className}`}
          />
        ))}
      </div>
    );
  }

  if (variant === 'circle') {
    return (
      <div
        className={`rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}
      />
    );
  }

  if (variant === 'table-row') {
    return (
      <div className="flex items-center gap-4 py-3 px-4 border-b border-slate-100 dark:border-slate-800/60 animate-pulse">
        <div className="h-3 w-16 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 flex-1 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-5 w-16 bg-slate-200 dark:bg-slate-800 rounded-md" />
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl bg-slate-200 dark:bg-slate-800 animate-pulse ${className}`}
    />
  );
};
