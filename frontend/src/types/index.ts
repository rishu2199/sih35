/**
 * METROLOGIX-76 — Domain Types & Data Contracts for Legal Metrology.
 *
 * Statutory References:
 * - OIML R 76-1:2006 & OIML R 76-2:2007
 * - Legal Metrology Act, 2009 & Legal Metrology (General) Rules, 2011
 */

export type AccuracyClass = 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IIII';

export type VerificationStage =
  | 'INITIAL_TYPE_APPROVAL'
  | 'SUBSEQUENT_VERIFICATION'
  | 'IN_SERVICE_INSPECTION';

export type ComplianceStatus = 'PASS' | 'FAIL' | 'MARGINAL' | 'PENDING';

export type TraceabilityStatus = 'VERIFIED' | 'WARNING' | 'LOCKED_OUT';

export type UnitOfMeasure = 'MILLIGRAM' | 'GRAM' | 'KILOGRAM' | 'TONNE';

export type UserRole =
  | 'METROLOGIST'
  | 'REVIEWER'
  | 'DIRECTOR'
  | 'AUDITOR'
  | 'ADMIN';

export type LabType = 'RRSL' | 'GATC' | 'STATE_LM_CENTRAL' | 'STANDARDS_LAB';

export interface Laboratory {
  id: string;
  code: string;
  name: string;
  city: string;
  state: string;
  labType: LabType;
  nablAccreditationNo?: string;
}

export interface UserProfile {
  id: string;
  username: string;
  fullName: string;
  designation: string;
  email: string;
  role: UserRole;
  laboratoryId: string;
  laboratoryName: string;
}

export interface TestSessionSummary {
  id: string;
  sessionNumber: string;
  instrumentModel: string;
  manufacturer: string;
  serialNumber: string;
  accuracyClass: AccuracyClass;
  maxCapacity: string;
  verificationInterval: string;
  unit: UnitOfMeasure;
  stage: VerificationStage;
  status: 'DRAFT' | 'IN_PROGRESS' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED';
  complianceStatus: ComplianceStatus;
  operatorName: string;
  isLocked: boolean;
  createdAt: string;
}

export interface MetricItem {
  id: string;
  title: string;
  value: string;
  unit?: string;
  change?: string;
  trend?: 'up' | 'down' | 'neutral';
  status?: 'success' | 'warning' | 'danger' | 'info';
  description?: string;
}

export type LoadReceptorType =
  | 'PLATFORM'
  | 'HANGING'
  | 'WEIGHBRIDGE'
  | 'TANK'
  | 'SUSPENDED_HOPPER';

export type InstrumentMobility = 'FIXED' | 'PORTABLE' | 'MOBILE_VEHICLE';

export type SoftwareSeparationType = 'TYPE_P' | 'TYPE_U';

export interface NameplateOcrParameters {
  manufacturer?: string;
  model_name?: string;
  serial_number?: string;
  approval_number?: string;
  accuracy_class?: AccuracyClass;
  max_capacity?: string;
  min_capacity?: string;
  e?: string;
  d?: string;
  unit?: UnitOfMeasure;
  receptor_type?: LoadReceptorType;
}

export interface NameplateSoftwareAudit {
  firmware_version?: string;
  sha256_checksum?: string;
  calibration_event_counter?: number;
  software_separation?: string;
}

export interface NameplateExtractionResult {
  parameters: NameplateOcrParameters;
  software_audit: NameplateSoftwareAudit;
  confidence_score: number;
  raw_text: string;
  detected_fields: string[];
}

export interface TestBatteryPreviewItem {
  test_type: string;
  test_name: string;
  statutory_clause: string;
  is_applicable: boolean;
  target_loads_count: number;
  acceptance_criteria: string;
  sample_loads: string[];
}

export interface ValidateSpecsResponse {
  is_valid: boolean;
  accuracy_class: AccuracyClass;
  max_capacity: string;
  min_capacity: string;
  e: string;
  d: string;
  unit: string;
  n: string;
  n_min: string | null;
  n_max: string | null;
  ratio_e_d: string;
  min_in_e: string;
  matched_tier: string;
  violations: string[];
  warnings: string[];
  applicable_tests_count: number;
  test_suite_preview: TestBatteryPreviewItem[];
}

export interface RegisterInstrumentRequest {
  manufacturer: string;
  model_name: string;
  serial_number: string;
  approval_number?: string;
  accuracy_class: AccuracyClass;
  max_capacity: number | string;
  min_capacity: number | string;
  e: number | string;
  d?: number | string;
  unit: UnitOfMeasure;
  receptor_type: LoadReceptorType;
  num_supports: number;
  mobility: InstrumentMobility;
  has_tare_device: boolean;
  has_level_indicator: boolean;
  firmware_version?: string;
  sha256_checksum?: string;
  calibration_event_counter?: number;
  software_separation?: string;
  laboratory_id?: string;
  operator_id: string;
  verification_stage: VerificationStage;
  notes?: string;
}

export interface RegisterInstrumentResponse {
  instrument_id: string;
  serial_number: string;
  session_id: string;
  session_number: string;
  status: string;
  compliance_status: string;
  audit_event_id: string;
  audit_hash: string;
  message: string;
}

export interface ObservationRow {
  id: string;
  step: number;
  direction: 'ASCENDING' | 'DESCENDING' | 'REPEATABILITY' | 'ECCENTRICITY';
  targetLoad: number;
  indication: number | null;
  auxiliaryLoad: number | null;
  trueIndication: number | null;
  uncorrectedError: number | null;
  zeroError: number;
  correctedError: number | null;
  mpeLimit: number | null;
  mpeInE: string | null;
  margin: number | null;
  status: ComplianceStatus;
  isZeroPoint: boolean;
  notes?: string;
}

export interface WeighingCalculationTrace {
  step: number;
  direction: 'ASCENDING' | 'DESCENDING' | 'REPEATABILITY' | 'ECCENTRICITY';
  load: number;
  indication: number;
  e: number;
  d: number;
  unit: UnitOfMeasure;
  auxiliaryLoad: number;
  roundingCorrection: number;
  trueIndication: number;
  uncorrectedError: number;
  zeroError: number;
  correctedError: number;
  stage: VerificationStage;
  stageMultiplier: number;
  mRatio: number;
  bracketName: string;
  mpeInE: string;
  mpeValue: number;
  margin: number;
  marginPercentage: number;
  isCompliant: boolean;
  statutoryCitation: string;
}

export type CornerPosition =
  | 'CENTER'
  | 'FRONT_LEFT'
  | 'BACK_LEFT'
  | 'BACK_RIGHT'
  | 'FRONT_RIGHT';

export type PlatterGeometry = 'RECTANGLE' | 'CIRCLE' | 'WEIGHBRIDGE_TRACK';

export interface EccentricityObservation {
  position: CornerPosition;
  positionNumber: number;
  label: string;
  targetLoad: number;
  indication: number | null;
  auxiliaryLoad: number | null;
  trueIndication: number | null;
  uncorrectedError: number | null;
  zeroError: number;
  correctedError: number | null;
  mpeLimit: number;
  mpeInE: string;
  margin: number | null;
  status: ComplianceStatus;
  notes?: string;
}

export interface EccentricitySummaryStats {
  overallStatus: ComplianceStatus;
  maxAbsoluteError: number;
  interCornerSpread: number;
  mpeLimit: number;
  dominantQuadrant: CornerPosition | null;
  deflectionAngle: number | null;
  deflectionMagnitude: number;
}

export type ReviewStatus = 'IN_TESTING' | 'PENDING_REVIEW' | 'APPROVED' | 'REMANDED';

export type AuditCommentSeverity = 'NOTE' | 'FLAG' | 'REJECT_REASON';

export interface RowAuditComment {
  id: string;
  sessionId: string;
  stepIndex: number;
  testType: 'WEIGHING' | 'ECCENTRICITY' | 'REPEATABILITY' | 'TARE_TEMP';
  targetLoad: number;
  unit: string;
  authorName: string;
  authorRole: UserRole;
  authorEmail: string;
  comment: string;
  severity: AuditCommentSeverity;
  timestamp: string;
  resolved: boolean;
}

export interface ReviewSession {
  id: string;
  sessionNumber: string;
  instrumentModel: string;
  manufacturer: string;
  serialNumber: string;
  accuracyClass: AccuracyClass;
  maxCapacity: number;
  e: number;
  d: number;
  unit: UnitOfMeasure;
  stage: VerificationStage;
  status: ReviewStatus;
  complianceStatus: ComplianceStatus;
  operatorName: string;
  operatorEmail: string;
  reviewerName?: string;
  reviewerEmail?: string;
  directorName?: string;
  directorEmail?: string;
  isLocked: boolean;
  signedAt?: string;
  signatureDigest?: string;
  signatureBase64?: string;
  verificationUrl?: string;
  qrCodeBase64?: string;
  commentsCount: number;
  flaggedRowCount: number;
  createdAt: string;
  submittedAt?: string;
  reviewedAt?: string;
  remandReason?: string;
  weighingObservations: ObservationRow[];
  eccentricityObservations: EccentricityObservation[];
}

