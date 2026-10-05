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
  const statusColors = {
    info: 'text-slate-600 dark:text-slate-400',
    success: 'text-emerald-700 dark:text-emerald-400',
    danger: 'text-rose-700 dark:text-rose-400',
    warning: 'text-amber-700 dark:text-amber-400',
  };

  return (
    <div
      className={`rounded-xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#111827] p-4 sm:p-5 transition-all hover:border-slate-300 dark:hover:border-slate-700 ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon && (
          <div className="text-slate-400 dark:text-slate-500">
            {icon}
          </div>
        )}
      </div>

      <div className="mt-2.5 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-mono tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {(subtitle || change) && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-xs">
          {subtitle && (
            <span className="text-slate-500 dark:text-slate-400 text-xs truncate">
              {subtitle}
            </span>
          )}
          {change && (
            <span className={`text-xs font-semibold shrink-0 ml-2 ${statusColors[status]}`}>
              {change}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
