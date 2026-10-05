import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Lock,
} from 'lucide-react';

export type ComplianceType = 'PASS' | 'FAIL' | 'MARGINAL' | 'PENDING' | 'LOCKED_OUT';

interface ComplianceBadgeProps {
  status: ComplianceType;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  label?: string;
  className?: string;
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  status,
  size = 'md',
  showIcon = true,
  label,
  className = '',
}) => {
  const getBadgeConfig = () => {
    switch (status) {
      case 'PASS':
        return {
          bg: 'bg-emerald-50 dark:bg-emerald-950/40',
          border: 'border-emerald-200 dark:border-emerald-800',
          text: 'text-emerald-700 dark:text-emerald-400',
          icon: CheckCircle2,
          defaultLabel: 'PASS',
          ariaLabel: 'Compliant within Maximum Permissible Error tolerance',
        };
      case 'FAIL':
        return {
          bg: 'bg-rose-50 dark:bg-rose-950/40',
          border: 'border-rose-200 dark:border-rose-800',
          text: 'text-rose-700 dark:text-rose-400',
          icon: XCircle,
          defaultLabel: 'FAIL',
          ariaLabel: 'Non-compliant: exceeds statutory Maximum Permissible Error',
        };
      case 'MARGINAL':
        return {
          bg: 'bg-amber-50 dark:bg-amber-950/40',
          border: 'border-amber-200 dark:border-amber-800',
          text: 'text-amber-700 dark:text-amber-400',
          icon: AlertTriangle,
          defaultLabel: 'WARNING',
          ariaLabel: 'Near statutory tolerance threshold or thermal drift warning',
        };
      case 'PENDING':
        return {
          bg: 'bg-indigo-50 dark:bg-indigo-950/40',
          border: 'border-indigo-200 dark:border-indigo-800',
          text: 'text-indigo-700 dark:text-indigo-400',
          icon: Clock,
          defaultLabel: 'PENDING',
          ariaLabel: 'Awaiting observation input or review verification',
        };
      case 'LOCKED_OUT':
        return {
          bg: 'bg-slate-100 dark:bg-slate-800',
          border: 'border-slate-300 dark:border-slate-700',
          text: 'text-slate-700 dark:text-slate-300',
          icon: Lock,
          defaultLabel: 'LOCKED',
          ariaLabel: 'Action blocked by statutory preflight gate or expired traceability',
        };
    }
  };

  const config = getBadgeConfig();
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  }[size];

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  }[size];

  return (
    <span
      role="status"
      aria-label={config.ariaLabel}
      className={`inline-flex items-center font-mono font-bold uppercase rounded-lg border ${config.bg} ${config.border} ${config.text} ${sizeClasses} ${className}`}
    >
      {showIcon && <Icon className={`${iconSizes} shrink-0`} />}
      <span>{label || config.defaultLabel}</span>
    </span>
  );
};
