import React from 'react';
import { Lock, Eye } from 'lucide-react';

export type MetrologyAction =
  | 'CREATE_INSTRUMENT'
  | 'ENTER_OBSERVATION'
  | 'CAPTURE_READING'
  | 'SUBMIT_REVIEW'
  | 'ADD_COMMENT'
  | 'APPROVE_DOSSIER'
  | 'REMAND_DOSSIER'
  | 'SIGN_CERTIFICATE'
  | 'MODIFY_SETTINGS';

export const canRolePerform = (role: string, action: MetrologyAction): boolean => {
  const normRole = role.toUpperCase();

  switch (normRole) {
    case 'ADMIN':
      return true;

    case 'METROLOGIST':
      return (
        action === 'CREATE_INSTRUMENT' ||
        action === 'ENTER_OBSERVATION' ||
        action === 'CAPTURE_READING' ||
        action === 'SUBMIT_REVIEW' ||
        action === 'ADD_COMMENT'
      );

    case 'REVIEWER':
      return (
        action === 'ADD_COMMENT' ||
        action === 'APPROVE_DOSSIER' ||
        action === 'REMAND_DOSSIER'
      );

    case 'DIRECTOR':
      return (
        action === 'ADD_COMMENT' ||
        action === 'APPROVE_DOSSIER' ||
        action === 'SIGN_CERTIFICATE'
      );

    case 'AUDITOR':
      return false; // Strictly Read-Only

    default:
      return false;
  }
};

interface RoleGuardProps {
  role: string;
  action: MetrologyAction;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  disabledMode?: boolean; // if true, clones children with disabled=true rather than hiding
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  role,
  action,
  children,
  fallback = null,
  disabledMode = false,
}) => {
  const allowed = canRolePerform(role, action);

  if (allowed) {
    return <>{children}</>;
  }

  if (disabledMode) {
    return (
      <div className="relative group inline-block">
        <div className="pointer-events-none opacity-50 cursor-not-allowed">
          {children}
        </div>
        <div className="hidden group-hover:flex items-center gap-1.5 absolute -top-8 left-1/2 -translate-x-1/2 px-2.5 py-1 bg-slate-900 text-white text-[10px] font-mono rounded shadow-lg whitespace-nowrap z-30">
          <Lock className="w-3 h-3 text-amber-400" />
          <span>Restricted for {role}</span>
        </div>
      </div>
    );
  }

  return <>{fallback}</>;
};

export const RoleBadge: React.FC<{ role: string }> = ({ role }) => {
  const norm = role.toUpperCase();

  const badgeStyles: Record<string, string> = {
    METROLOGIST: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-200',
    REVIEWER: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-200',
    DIRECTOR: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200',
    AUDITOR: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border-purple-200',
    ADMIN: 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-700',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase border ${
        badgeStyles[norm] || 'bg-slate-100 text-slate-700'
      }`}
    >
      {norm === 'AUDITOR' && <Eye className="w-3 h-3" />}
      {norm}
    </span>
  );
};
