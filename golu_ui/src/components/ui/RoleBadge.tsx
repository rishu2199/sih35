import React from 'react';
import { ShieldCheck, UserCheck, Eye, Award, Settings } from 'lucide-react';

export type UserRoleType = 'METROLOGIST' | 'REVIEWER' | 'DIRECTOR' | 'AUDITOR' | 'ADMIN';

interface RoleBadgeProps {
  role: UserRoleType;
  showIcon?: boolean;
  className?: string;
}

export const RoleBadge: React.FC<RoleBadgeProps> = ({
  role,
  showIcon = true,
  className = '',
}) => {
  const getRoleConfig = () => {
    switch (role) {
      case 'METROLOGIST':
        return {
          icon: UserCheck,
          label: 'METROLOGIST',
          classes: 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
        };
      case 'REVIEWER':
        return {
          icon: Eye,
          label: 'REVIEWER',
          classes: 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800',
        };
      case 'DIRECTOR':
        return {
          icon: Award,
          label: 'DIRECTOR',
          classes: 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold',
        };
      case 'AUDITOR':
        return {
          icon: ShieldCheck,
          label: 'AUDITOR',
          classes: 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
        };
      case 'ADMIN':
        return {
          icon: Settings,
          label: 'ADMIN',
          classes: 'bg-slate-900 text-white dark:bg-slate-800 dark:text-slate-100 border-slate-700 font-bold',
        };
    }
  };

  const config = getRoleConfig();
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${config.classes} ${className}`}
    >
      {showIcon && <Icon className="w-3.5 h-3.5" />}
      <span>{config.label}</span>
    </span>
  );
};
