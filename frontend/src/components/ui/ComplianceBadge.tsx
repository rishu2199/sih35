import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';
import type { ComplianceStatus, TraceabilityStatus } from '../../types';

export type BadgeStatus = ComplianceStatus | TraceabilityStatus | 'LOCKED' | 'COMPLIANT' | 'NON_COMPLIANT';

interface ComplianceBadgeProps {
  status: BadgeStatus;
  label?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const ComplianceBadge: React.FC<ComplianceBadgeProps> = ({
  status,
  label,
  showIcon = true,
  size = 'md',
  className = '',
}) => {
  const normalized = status.toUpperCase();

  const isPass = normalized === 'PASS' || normalized === 'VERIFIED' || normalized === 'COMPLIANT';
  const isFail = normalized === 'FAIL' || normalized === 'NON_COMPLIANT';
  const isMarginal = normalized === 'MARGINAL' || normalized === 'WARNING';
  const isLocked = normalized === 'LOCKED_OUT' || normalized === 'LOCKED';

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1 font-semibold tracking-wide',
    md: 'text-xs px-2.5 py-0.5 gap-1.5 font-semibold tracking-wide',
    lg: 'text-sm px-3.5 py-1 gap-2 font-bold tracking-wider',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  let colorClasses = '';
  let IconComponent = Clock;
  let defaultLabel = 'PENDING';

  if (isPass) {
    colorClasses =
      'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/25 shadow-xs';
    IconComponent = CheckCircle2;
    defaultLabel = normalized === 'VERIFIED' ? 'VERIFIED' : 'PASS';
  } else if (isFail) {
    colorClasses =
      'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 shadow-xs';
    IconComponent = XCircle;
    defaultLabel = 'FAIL';
  } else if (isMarginal) {
    colorClasses =
      'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/25 shadow-xs';
    IconComponent = AlertTriangle;
    defaultLabel = normalized === 'WARNING' ? 'WARNING' : 'MARGINAL';
  } else if (isLocked) {
    colorClasses =
      'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/25 shadow-xs';
    IconComponent = ShieldAlert;
    defaultLabel = 'LOCKED OUT';
  } else {
    colorClasses =
      'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-500/20';
    IconComponent = Clock;
    defaultLabel = 'PENDING';
  }

  const displayText = label || defaultLabel;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full border font-mono select-none transition-colors duration-150 ${sizeClasses[size]} ${colorClasses} ${className}`}
    >
      {showIcon && <IconComponent className={`${iconSizes[size]} shrink-0`} />}
      <span>{displayText}</span>
    </span>
  );
};
