import React from 'react';

interface TechnicalValueProps {
  value: string | number;
  unit?: string;
  prefix?: string;
  sign?: boolean;
  status?: 'PASS' | 'FAIL' | 'WARNING' | 'NEUTRAL';
  size?: 'sm' | 'md' | 'lg' | 'hero';
  className?: string;
}

export const TechnicalValue: React.FC<TechnicalValueProps> = ({
  value,
  unit,
  prefix,
  sign = false,
  status = 'NEUTRAL',
  size = 'md',
  className = '',
}) => {
  const formattedValue = (() => {
    if (typeof value === 'number' && sign && value > 0) {
      return `+${value}`;
    }
    return String(value);
  })();

  const sizeStyles = {
    sm: 'text-xs',
    md: 'text-sm font-semibold',
    lg: 'text-base font-bold',
    hero: 'text-2xl sm:text-3xl font-black tracking-tight',
  }[size];

  const statusStyles = {
    PASS: 'text-emerald-600 dark:text-emerald-400',
    FAIL: 'text-rose-600 dark:text-rose-400',
    WARNING: 'text-amber-600 dark:text-amber-400',
    NEUTRAL: 'text-slate-900 dark:text-slate-100',
  }[status];

  return (
    <span className={`inline-flex items-baseline font-mono tabular-nums ${statusStyles} ${sizeStyles} ${className}`}>
      {prefix && <span className="mr-0.5 text-slate-400 font-sans font-normal text-xs">{prefix}</span>}
      <span>{formattedValue}</span>
      {unit && (
        <span className="ml-1 text-slate-500 dark:text-slate-400 font-sans font-medium text-[0.8em]">
          {unit}
        </span>
      )}
    </span>
  );
};
