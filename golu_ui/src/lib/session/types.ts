export * from '../../types';

export type PermissionAction =
  | 'REGISTER_INSTRUMENT'
  | 'ENTER_OBSERVATION'
  | 'SUBMIT_REVIEW'
  | 'REVIEW_SESSION'
  | 'REMAND_SESSION'
  | 'SIGN_CERTIFICATE'
  | 'AUDIT_TRAIL'
  | 'DOWNLOAD_CERTIFICATE'
  | 'MANAGE_STANDARDS'
  | 'SYSTEM_SETTINGS';

export type SessionLockState =
  | 'EDITABLE'
  | 'REVIEW_LOCKED'
  | 'APPROVAL_LOCKED'
  | 'APPROVED_LOCKED'
  | 'TRACEABILITY_LOCKED';

export type EccentricityLocation = import('../../types').EccentricityPoint;
export type RepeatabilityRun = import('../../types').RepeatabilityReading;

export type UnifiedVerificationSession = import('../../types').VerificationSession;
