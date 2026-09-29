import React from 'react';

interface MetricCardProps {
  title: string;
  value: string | number;
  unit?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  change?: string;
  status?: 'success' | 'danger' | 'warning' | 'info';
  className?: string;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  unit,
  subtitle,
  icon,
  change,
  status = 'info',
  className = '',
}) => {
  const statusBorder = {
    info: 'hover:border-slate-300 dark:hover:border-slate-700',
    success: 'hover:border-emerald-300 dark:hover:border-emerald-800',
    danger: 'hover:border-rose-300 dark:hover:border-rose-800',
    warning: 'hover:border-amber-300 dark:hover:border-amber-800',
  };

  const statusText = {
    info: 'text-slate-600 dark:text-slate-400',
    success: 'text-emerald-700 dark:text-emerald-400',
    danger: 'text-rose-700 dark:text-rose-400',
    warning: 'text-amber-700 dark:text-amber-400',
  };

  return (
    <div
      className={`rounded-lg border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c121e] p-4 sm:p-5 transition-all duration-150 ${statusBorder[status]} ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        {icon && (
          <div className="text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-slate-50 font-mono tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-normal text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
              {subtitle}
            </span>
          )}
          {change && (
            <span className={`text-[11px] font-medium shrink-0 ml-2 ${statusText[status]}`}>
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

