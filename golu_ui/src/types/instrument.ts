export type AccuracyClass =
  | 'CLASS_I'
  | 'CLASS_II'
  | 'CLASS_III'
  | 'CLASS_IIII';

export type VerificationStage =
  | 'INITIAL_TYPE_APPROVAL'
  | 'SUBSEQUENT_VERIFICATION'
  | 'IN_SERVICE_INSPECTION'
  | 'INITIAL'
  | 'SUBSEQUENT'
  | 'RE_VERIFICATION';

export type ReviewStatus =
  | 'DRAFT'
  | 'IN_TESTING'
  | 'PENDING_REVIEW'
  | 'APPROVED'
  | 'REMANDED';

export type ComplianceStatus =
  | 'PASS'
  | 'FAIL'
  | 'MARGINAL'
  | 'PENDING'
  | 'LOCKED_OUT';

export type UserRole =
  | 'METROLOGIST'
  | 'REVIEWER'
  | 'DIRECTOR'
  | 'AUDITOR'
  | 'ADMIN';

export interface Instrument {
  id: string;

  manufacturer: string;
  modelName: string;
  serialNumber: string;
  approvalNumber: string;

  accuracyClass: AccuracyClass;

  maxCapacity: number;
  minCapacity: number;

  e: number;
  d: number;
  unit: string;

  n: number;

  receptorType: string;
  numSupports: number;

  verificationStage: VerificationStage;

  firmwareVersion?: string;
  calibrationCounter?: number;

  status: ReviewStatus;
  complianceStatus: ComplianceStatus;
}
