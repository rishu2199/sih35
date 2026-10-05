import { UnifiedVerificationSession, SessionLockState } from './types';

export interface LockStateInfo {
  lockState: SessionLockState;
  isLocked: boolean;
  canEditObservations: boolean;
  canSubmitReview: boolean;
  canSignCertificate: boolean;
  bannerMessage?: string;
  badgeLabel: string;
  isGoldenPadlock: boolean;
}

/**
 * Lock-State Engine (§13) & Traceability Gate (§14)
 * Deterministic calculation of session immutability and statutory lockout.
 */
export function getSessionLockState(
  session: UnifiedVerificationSession | null | undefined,
  standardsValid = true
): LockStateInfo {
  // If no session exists, default to EDITABLE
  if (!session) {
    return {
      lockState: 'EDITABLE',
      isLocked: false,
      canEditObservations: true,
      canSubmitReview: false,
      canSignCertificate: false,
      badgeLabel: 'EDITABLE',
      isGoldenPadlock: false,
    };
  }

  // 1. Traceability Gate Check (§14)
  // Hard statutory lockout when standard weights are expired or uncertified
  if (!standardsValid || !session.readiness.standardWeightsValid) {
    return {
      lockState: 'TRACEABILITY_LOCKED',
      isLocked: true,
      canEditObservations: false,
      canSubmitReview: false,
      canSignCertificate: false,
      bannerMessage: 'STATUTORY SAFETY GATE: Working standards calibration expired. All test input prohibited under Legal Metrology Act.',
      badgeLabel: 'TRACEABILITY LOCKED',
      isGoldenPadlock: false,
    };
  }

  // 2. Approved Immutability Check (§13, §35)
  // Permanent read-only golden padlock once Director digitally signs Form VI/VII
  if (session.reviewStatus === 'APPROVED') {
    return {
      lockState: 'APPROVED_LOCKED',
      isLocked: true,
      canEditObservations: false,
      canSubmitReview: false,
      canSignCertificate: false,
      bannerMessage: 'IMMUTABLE RECORD: Session certified and digitally sealed. All test observations and parameters are permanently frozen.',
      badgeLabel: 'SEALED & APPROVED',
      isGoldenPadlock: true,
    };
  }

  // 3. Review Locked Check
  // Under supervisory review; metrologists cannot alter observations during inspection
  if (session.reviewStatus === 'PENDING_REVIEW') {
    return {
      lockState: 'REVIEW_LOCKED',
      isLocked: true,
      canEditObservations: false,
      canSubmitReview: false,
      canSignCertificate: true, // Director can sign
      bannerMessage: 'UNDER SUPERVISORY REVIEW: Testing submitted for verification approval. Observation editing paused.',
      badgeLabel: 'UNDER REVIEW',
      isGoldenPadlock: false,
    };
  }

  // 4. Otherwise session is active and editable
  return {
    lockState: 'EDITABLE',
    isLocked: false,
    canEditObservations: true,
    canSubmitReview: true,
    canSignCertificate: false,
    badgeLabel: 'ACTIVE',
    isGoldenPadlock: false,
  };
}

/**
 * Fast helper to check if session observations are strictly editable
 */
export function isSessionEditable(
  session: UnifiedVerificationSession | null | undefined,
  standardsValid = true
): boolean {
  return getSessionLockState(session, standardsValid).canEditObservations;
}
