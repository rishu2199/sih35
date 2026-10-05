export type ReadinessStatus = 'READY' | 'PENDING' | 'BLOCKED' | 'WARNING';

export type PreflightState = 'READY' | 'ATTENTION' | 'BLOCKED' | 'APPROVED' | 'REMANDED';

export type CheckSeverity = 'MANDATORY' | 'OPTIONAL' | 'INFORMATIONAL';

export interface ReadinessCheckItem {
  id: string;
  category: 'REGISTRATION' | 'IDENTITY' | 'SPECIFICATIONS' | 'PHYSICAL' | 'EVIDENCE' | 'TRACEABILITY' | 'TEST_PLAN' | 'ENVIRONMENT';
  title: string;
  description: string;
  status: ReadinessStatus;
  severity?: CheckSeverity;
  detail: string;
  statutoryRef: string;
  blockerReason?: string;
  whyItMatters?: string;
  requiredAction?: string;
  resolutionActionText?: string;
  resolutionTargetTab?: string;
  specDetails?: Record<string, string>;
}

export interface EnvironmentalBaseline {
  temperatureC: number;
  temperatureValid: boolean;
  humidityPercent: number;
  humidityValid: boolean;
  pressureHpa: number;
  pressureValid: boolean;
  timestamp: string;
  sensorNode: string;
}

export interface PhysicalInspectionStatus {
  spiritLevelPassed: boolean;
  securitySealPassed: boolean;
  instrumentConditionPassed: boolean;
  tamperProofVerified: boolean;
  remainingChecksCount: number;
  levelBubbleDeflectionMm?: number;
  sealTagNumber?: string;
  opticalPhotoCount?: number;
}

export interface NextTestPreview {
  testCode: string;
  name: string;
  standardClause: string;
  loadPointsCount: number;
  mpeLimits: string;
  targetView: string;
  requiredEvidence: string[];
}

export interface HardwareTelemetry {
  port: string;
  baudRate: number;
  mode: 'LIVE' | 'SIMULATOR' | 'DISCONNECTED';
  weightKg: number;
  unit: string;
  isStable: boolean;
}

export interface PreflightLifecycleStep {
  stepNumber: string;
  name: string;
  shortName: string;
  status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  targetTab?: string;
}

export interface PreflightSummary {
  sessionNumber: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  maxCapacity: string;
  minCapacity: string;
  verificationInterval: string;
  scaleDivisions: number;
  verificationStage: string;
  selectedWeightSet: string;
  weightSetStatus: 'VALID' | 'EXPIRING' | 'EXPIRED';
  weightSetDaysRemaining: number;
  requiredTestCount: number;
  environmentalBaseline: EnvironmentalBaseline;
  physicalInspection: PhysicalInspectionStatus;
  nextTest?: NextTestPreview;
  hardwareTelemetry?: HardwareTelemetry;
}
