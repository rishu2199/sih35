import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MetricCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  icon?: LucideIcon;
  badge?: string;
  badgeColor?: string;
  className?: string;
  onClick?: () => void;
}

/**
 * METROLOGIX-76 Standard MetricCard Primitive (§18)
 * Dedicated for operational KPIs and lab volume stats.
 */
export const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  unit,
  trend,
  trendType = 'neutral',
  icon: Icon,
  badge,
  badgeColor = 'bg-slate-100 text-slate-700',
  className = '',
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-2xs flex flex-col justify-between transition-all ${
        onClick ? 'hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer' : ''
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {label}
        </span>
        {badge && (
          <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {badge}
          </span>
        )}
        {Icon && !badge && (
          <div className="w-8 h-8 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <Icon className="w-4 h-4" />
          </div>
        )}
      </div>

      <div className="my-3 flex items-baseline gap-2">
        <span className="font-mono text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight tabular-nums">
          {value}
        </span>
        {unit && (
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {unit}
          </span>
        )}
      </div>

      {trend && (
        <div className="text-[11px] font-medium flex items-center gap-1">
          <span
            className={
              trendType === 'positive'
                ? 'text-emerald-600 dark:text-emerald-400'
                : trendType === 'negative'
                ? 'text-rose-600 dark:text-rose-400'
                : 'text-slate-500'
            }
          >
            {trend}
          </span>
        </div>
      )}
    </div>
  );
};
