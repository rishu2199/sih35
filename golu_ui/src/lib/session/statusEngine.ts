import React from 'react';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Lock,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import { ComplianceStatus, ReviewStatus, AccuracyClass } from './types';

export interface VisualToken {
  status: ComplianceStatus | ReviewStatus;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  textClass: string;
  bgClass: string;
  borderClass: string;
  icon: React.ComponentType<{ className?: string }>;
}

/**
 * Standard Status Visual Engine (§10)
 * Centralized mapping for all compliance and review states.
 */
export function getComplianceVisual(status: ComplianceStatus | ReviewStatus | string): VisualToken {
  switch (status) {
    case 'PASS':
    case 'APPROVED':
      return {
        status: status as any,
        label: status === 'APPROVED' ? 'APPROVED' : 'PASS',
        badgeBg: 'bg-emerald-50 dark:bg-emerald-950/40',
        badgeText: 'text-emerald-700 dark:text-emerald-400',
        badgeBorder: 'border-emerald-200 dark:border-emerald-800',
        textClass: 'text-emerald-600 dark:text-emerald-400',
        bgClass: 'bg-emerald-500',
        borderClass: 'border-emerald-500',
        icon: CheckCircle,
      };

    case 'FAIL':
      return {
        status: 'FAIL',
        label: 'FAIL',
        badgeBg: 'bg-rose-50 dark:bg-rose-950/40',
        badgeText: 'text-rose-700 dark:text-rose-400',
        badgeBorder: 'border-rose-200 dark:border-rose-800',
        textClass: 'text-rose-600 dark:text-rose-400',
        bgClass: 'bg-rose-500',
        borderClass: 'border-rose-500',
        icon: XCircle,
      };

    case 'MARGINAL':
      return {
        status: 'MARGINAL',
        label: 'MARGINAL',
        badgeBg: 'bg-amber-50 dark:bg-amber-950/40',
        badgeText: 'text-amber-700 dark:text-amber-400',
        badgeBorder: 'border-amber-200 dark:border-amber-800',
        textClass: 'text-amber-600 dark:text-amber-400',
        bgClass: 'bg-amber-500',
        borderClass: 'border-amber-500',
        icon: AlertTriangle,
      };

    case 'PENDING':
    case 'IN_TESTING':
    case 'PENDING_REVIEW':
      return {
        status: status as any,
        label: status === 'PENDING_REVIEW' ? 'PENDING REVIEW' : status === 'IN_TESTING' ? 'IN TESTING' : 'PENDING',
        badgeBg: 'bg-indigo-50 dark:bg-indigo-950/40',
        badgeText: 'text-indigo-700 dark:text-indigo-400',
        badgeBorder: 'border-indigo-200 dark:border-indigo-800',
        textClass: 'text-indigo-600 dark:text-indigo-400',
        bgClass: 'bg-indigo-500',
        borderClass: 'border-indigo-500',
        icon: Clock,
      };

    case 'LOCKED_OUT':
      return {
        status: 'LOCKED_OUT',
        label: 'LOCKED OUT',
        badgeBg: 'bg-red-950/20 dark:bg-red-950/60',
        badgeText: 'text-red-800 dark:text-red-300',
        badgeBorder: 'border-red-600/40',
        textClass: 'text-red-700 dark:text-red-400',
        bgClass: 'bg-red-700',
        borderClass: 'border-red-700',
        icon: Lock,
      };

    case 'REMANDED':
      return {
        status: 'REMANDED',
        label: 'REMANDED',
        badgeBg: 'bg-orange-50 dark:bg-orange-950/40',
        badgeText: 'text-orange-700 dark:text-orange-400',
        badgeBorder: 'border-orange-200 dark:border-orange-800',
        textClass: 'text-orange-600 dark:text-orange-400',
        bgClass: 'bg-orange-500',
        borderClass: 'border-orange-500',
        icon: RotateCcw,
      };

    default:
      return {
        status: 'PENDING',
        label: 'PENDING',
        badgeBg: 'bg-slate-100 dark:bg-slate-800',
        badgeText: 'text-slate-600 dark:text-slate-400',
        badgeBorder: 'border-slate-200 dark:border-slate-700',
        textClass: 'text-slate-600 dark:text-slate-400',
        bgClass: 'bg-slate-400',
        borderClass: 'border-slate-400',
        icon: Clock,
      };
  }
}

/**
 * Statutory Maximum Permissible Error (MPE) under OIML R 76-1 Table 6 (§16)
 * Initial verification values:
 * Class I:   0-50,000e: 0.5e, 50,000-200,000e: 1.0e, >200,000e: 1.5e
 * Class II:  0-5,000e:  0.5e, 5,000-20,000e:   1.0e, 20,000-100,000e: 1.5e
 * Class III: 0-500e:    0.5e, 500-2,000e:      1.0e, 2,000-10,000e:  1.5e
 * Class IIII:0-50e:     0.5e, 50-200e:         1.0e, 200-1,000e:     1.5e
 */
export function calculateMPE(
  load: number,
  e: number,
  accuracyClass: AccuracyClass,
  isServiceVerification = false
): number {
  if (e <= 0) return 0;
  const m = load / e; // load expressed in verification scale intervals (e)
  let factor = 0.5;

  switch (accuracyClass) {
    case 'CLASS_I':
      if (m <= 50000) factor = 0.5;
      else if (m <= 200000) factor = 1.0;
      else factor = 1.5;
      break;

    case 'CLASS_II':
      if (m <= 5000) factor = 0.5;
      else if (m <= 20000) factor = 1.0;
      else factor = 1.5;
      break;

    case 'CLASS_III':
      if (m <= 500) factor = 0.5;
      else if (m <= 2000) factor = 1.0;
      else factor = 1.5;
      break;

    case 'CLASS_IIII':
      if (m <= 50) factor = 0.5;
      else if (m <= 200) factor = 1.0;
      else factor = 1.5;
      break;
  }

  // In-service verification allows 2x initial MPE (Schedule X / Clause 3.5.2)
  const multiplier = isServiceVerification ? 2 : 1;
  return Number((factor * e * multiplier).toFixed(5));
}

/**
 * Statutory Turning Point Indication (§16, §30)
 * P = I + 0.5e - delta L
 */
export function calculateTurningPointP(
  indicationI: number,
  turningPointDeltaL: number,
  e: number
): number {
  return Number((indicationI + 0.5 * e - turningPointDeltaL).toFixed(5));
}

/**
 * Statutory Error Calculation (§16, §30)
 * E = P - L
 */
export function calculateErrorE(
  calculatedP: number,
  loadNominal: number
): number {
  return Number((calculatedP - loadNominal).toFixed(5));
}
