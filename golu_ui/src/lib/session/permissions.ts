import { UserRole, PermissionAction, UnifiedVerificationSession } from './types';

/**
 * Statutory Permission Matrix (§12)
 * Single source of truth for role-based authorization across METROLOGIX-76.
 *
 *                          METROLOGIST REVIEWER DIRECTOR AUDITOR ADMIN
 * Register Instrument          ✓          -        -       -       ✓
 * Enter Observations           ✓          -        -       -       -
 * Submit Review                ✓          -        -       -       -
 * Review Session               -          ✓        ✓       ✓       ✓
 * Remand                       -          ✓        -       -       -
 * Sign Certificate             -          -        ✓       -       -
 * Audit Trail                  -          ✓        ✓       ✓       ✓
 * Download Certificate         ✓          ✓        ✓       ✓       ✓
 * Manage Standards             -          -        -       -       ✓
 * System Settings              -          -        -       -       ✓
 */

type PermissionRule = (
  role: UserRole,
  session?: UnifiedVerificationSession,
  resource?: any
) => boolean;

const PERMISSION_MATRIX: Record<PermissionAction, Record<UserRole, boolean>> = {
  REGISTER_INSTRUMENT: {
    METROLOGIST: true,
    REVIEWER: false,
    DIRECTOR: false,
    AUDITOR: false,
    ADMIN: true,
  },
  ENTER_OBSERVATION: {
    METROLOGIST: true,
    REVIEWER: false,
    DIRECTOR: false,
    AUDITOR: false,
    ADMIN: false,
  },
  SUBMIT_REVIEW: {
    METROLOGIST: true,
    REVIEWER: false,
    DIRECTOR: false,
    AUDITOR: false,
    ADMIN: false,
  },
  REVIEW_SESSION: {
    METROLOGIST: false,
    REVIEWER: true,
    DIRECTOR: true,
    AUDITOR: true,
    ADMIN: true,
  },
  REMAND_SESSION: {
    METROLOGIST: false,
    REVIEWER: true,
    DIRECTOR: false,
    AUDITOR: false,
    ADMIN: false,
  },
  SIGN_CERTIFICATE: {
    METROLOGIST: false,
    REVIEWER: false,
    DIRECTOR: true,
    AUDITOR: false,
    ADMIN: false,
  },
  AUDIT_TRAIL: {
    METROLOGIST: false,
    REVIEWER: true,
    DIRECTOR: true,
    AUDITOR: true,
    ADMIN: true,
  },
  DOWNLOAD_CERTIFICATE: {
    METROLOGIST: true,
    REVIEWER: true,
    DIRECTOR: true,
    AUDITOR: true,
    ADMIN: true,
  },
  MANAGE_STANDARDS: {
    METROLOGIST: false,
    REVIEWER: false,
    DIRECTOR: false,
    AUDITOR: false,
    ADMIN: true,
  },
  SYSTEM_SETTINGS: {
    METROLOGIST: false,
    REVIEWER: false,
    DIRECTOR: false,
    AUDITOR: false,
    ADMIN: true,
  },
};

/**
 * Standard normalize role function supporting case-insensitive role strings
 */
export function normalizeUserRole(roleString?: string): UserRole {
  if (!roleString) return 'METROLOGIST';
  const clean = roleString.trim().toUpperCase();
  if (clean.includes('DIRECTOR')) return 'DIRECTOR';
  if (clean.includes('REVIEWER')) return 'REVIEWER';
  if (clean.includes('AUDITOR')) return 'AUDITOR';
  if (clean.includes('ADMIN')) return 'ADMIN';
  return 'METROLOGIST';
}

/**
 * Permission Engine (§11)
 * Centralized authorization check replacing ad-hoc role comparisons.
 */
export function can(
  userRole: UserRole | string,
  action: PermissionAction,
  session?: UnifiedVerificationSession,
  _resource?: any
): boolean {
  const role = typeof userRole === 'string' ? normalizeUserRole(userRole) : userRole;

  // 1. Base permission lookup from statutory matrix
  const matrixAllowed = PERMISSION_MATRIX[action]?.[role] ?? false;
  if (!matrixAllowed) return false;

  // 2. Session state overrides
  if (session) {
    // If session is APPROVED, observations can never be entered, nor can review be submitted
    if (session.reviewStatus === 'APPROVED') {
      if (action === 'ENTER_OBSERVATION' || action === 'SUBMIT_REVIEW' || action === 'REMAND_SESSION') {
        return false;
      }
    }

    // Only allow signing if session is in PENDING_REVIEW or approved
    if (action === 'SIGN_CERTIFICATE' && session.reviewStatus !== 'PENDING_REVIEW') {
      return false;
    }
  }

  return true;
}
