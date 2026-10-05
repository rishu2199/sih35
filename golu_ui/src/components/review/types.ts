export type ReviewStatus =
  | 'PENDING_REVIEW'
  | 'PENDING_DIRECTOR'
  | 'APPROVED'
  | 'REMANDED'
  | 'IN_TESTING';

export type ReviewTestResult = 'PASS' | 'MARGINAL' | 'FAIL' | 'PENDING';

export type ReviewFindingSeverity = 'FLAG' | 'NOTE' | 'BLOCKER';

export interface ReviewFinding {
  id: string;
  observationIndex: string;
  testName: string;
  severity: ReviewFindingSeverity;
  title: string;
  author: string;
  text: string;
  timestamp: string;
  resolved: boolean;
}

export interface ReviewTestItem {
  id: string;
  name: string;
  code: string;
  status: ReviewTestResult;
  summary: string;
  detail: string;
  observationsCount: string;
  targetView?: string;
}

export interface AuditTrailEntry {
  id: string;
  time: string;
  iconType: 'complete' | 'forward' | 'open' | 'flag' | 'sign' | 'remand';
  action: string;
  actor: string;
}

export interface CertificateInfo {
  id: string;
  signedBy: string;
  signedRole: string;
  signTimestamp: string;
  sha256Digest: string;
  verificationUrl: string;
  qrPayload: string;
  directorPinUsed: string;
}

export interface ReviewSessionCase {
  id: string;
  sessionNumber: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  maxCapacity: string;
  interval: string;
  verificationStage: string;
  completedSteps: number;
  totalSteps: number;
  status: ReviewStatus;
  overallVerdict: 'PASS' | 'FAIL' | 'MARGINAL';
  tests: ReviewTestItem[];
  findings: ReviewFinding[];
  auditTrail: AuditTrailEntry[];
  remandReason?: string;
  remandedBy?: string;
  remandDate?: string;
  certificate?: CertificateInfo;
  updatedAt: string;
}
