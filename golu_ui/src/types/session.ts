import {
  AccuracyClass,
  VerificationStage,
  ReviewStatus,
  ComplianceStatus,
  Instrument,
} from './instrument';
import {
  WeighingTest,
  EccentricityTest,
  RepeatabilityTest,
  EnvironmentTest,
} from './observation';
import { ReviewRecord, SignatureRecord } from './review';
import { TraceabilityState } from './standards';

export interface ReadinessCheck {
  id: string;
  label: string;
  category: 'INSTRUMENT' | 'TRACEABILITY' | 'TEST_PLAN' | 'ENVIRONMENT';

  required: boolean;

  status: 'READY' | 'ATTENTION' | 'BLOCKED';

  message?: string;

  action?: {
    label: string;
    route: string;
  };
}

export interface TestReadiness {
  overallStatus: 'READY' | 'ATTENTION' | 'BLOCKED';

  checks: ReadinessCheck[];

  score: number;

  blockingIssues: string[];

  checkedAt: string;

  // Compatibility
  environmentStable?: boolean;
  powerWarmupComplete?: boolean;
  scaleLevelCentered?: boolean;
  standardWeightsValid?: boolean;
  standardWeightsId?: string;
  ambientTemperatureC?: number;
  relativeHumidityPercent?: number;
  atmosphericPressureHpa?: number;
  isReady?: boolean;
  notes?: string;
}

export interface TestProcedure {
  key:
    | 'PHYSICAL'
    | 'WEIGHING'
    | 'ECCENTRICITY'
    | 'REPEATABILITY'
    | 'ENVIRONMENT';

  label: string;

  applicable: boolean;

  required: boolean;

  status: ComplianceStatus | 'NOT_APPLICABLE';
}

export interface TestPlan {
  verificationStage: VerificationStage;

  procedures: TestProcedure[];

  allRequiredComplete: boolean;

  // Compatibility
  applicableSteps?: string[];
  weighingTestPoints?: number[];
  repeatabilityTestLoads?: number[];
  eccentricityTestLoad?: number;
  mpeTier1?: number;
  mpeTier2?: number;
  mpeTier3?: number;
}

export interface PhysicalInspection {
  markingsLegible: boolean;
  levelingIndicatorPresent: boolean;
  stampingSealsIntact: boolean;
  securityLockHardwareSecure: boolean;
  auditTrailVerified: boolean;
  status: ComplianceStatus;
  inspectorName?: string;
  inspectedAt?: string;
  notes?: string;
}

export interface VerificationSession {
  id: string;
  sessionNumber: string;

  instrumentId: string;

  verificationStage: VerificationStage;
  reviewStatus: ReviewStatus;
  complianceStatus: ComplianceStatus;

  readiness: TestReadiness;
  testPlan: TestPlan;

  physicalInspection: PhysicalInspection;
  weighing: WeighingTest;
  eccentricity: EccentricityTest;
  repeatability: RepeatabilityTest;
  environment: EnvironmentTest;

  reviewer?: ReviewRecord;
  directorSignature?: SignatureRecord;

  traceability: TraceabilityState;

  createdAt: string;
  updatedAt: string;

  // Immutability flag (§35)
  isImmutable?: boolean;

  // Backward compatibility / convenience properties for views
  instrument?: string | Instrument;
  procedure?: string;
  progressText?: string;
  updated?: string;
  actionText?: string;
  activeStep?: number;
  operatorName?: string;
  laboratory?: string;
  notes?: string;
  serialNumber?: string;
  model?: string;
  manufacturer?: string;
  accuracyClass?: AccuracyClass | string;
  maxCapacity?: string | number;
  interval?: string;
  currentProcedure?: string;
  completedSteps?: number;
  totalSteps?: number;
  progressPercent?: number;
  status?: string;
  steps?: Array<{ num: number; label: string; status: 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING' }>;
}

export interface DashboardSessionSummary {
  id: string;
  sessionNumber: string;
  instrument: string;
  model: string;
  manufacturer: string;
  accuracyClass: string;
  maxCapacity: string;
  interval: string;
  procedure: string;
  progressText: string;
  status: 'PASS' | 'FAIL' | 'WARNING' | 'PENDING';
  updated: string;
  actionText: 'View' | 'Review' | 'Continue' | string;
}
