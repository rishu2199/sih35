export * from './instrument';
export * from './observation';
export * from './review';
export * from './standards';
export * from './laboratory';
export * from './session';
export * from './scenario';

// Compatibility types for legacy UI components
export type SessionStatus =
  | 'PASS'
  | 'FAIL'
  | 'WARNING'
  | 'PENDING'
  | 'IN_TESTING'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'REMANDED';

export type StepStatus =
  | 'PASS'
  | 'FAIL'
  | 'IN_PROGRESS'
  | 'PENDING'
  | 'NOT_APPLICABLE';

export interface TestSession {
  id: string;
  sessionNumber: string;
  instrumentModel: string;
  manufacturer: string;
  serialNumber: string;
  accuracyClass: import('./instrument').AccuracyClass;
  maxCapacity: string;
  verificationInterval: string;
  currentStage: string;
  completedSteps: number;
  totalSteps: number;
  progressPercent: number;
  status: SessionStatus;
  statusLabel: string;
  operatorName: string;
  lastUpdated: string;
  notes?: string;
  steps: {
    visual: StepStatus;
    tare: StepStatus;
    eccentricity: StepStatus;
    weighing: StepStatus;
    repeatability: StepStatus;
    environment: StepStatus;
    review: StepStatus;
  };
}

export interface MetricData {
  activeVerifications: number;
  pendingSignOff: number;
  passRate24h: number;
  traceability: number;
}

export interface InstrumentPreset {
  id: string;
  name: string;
  brand: string;
  model: string;
  manufacturer: string;
  accuracyClass: import('./instrument').AccuracyClass;
  classLabel: string;
  maxCapacity: string;
  verificationInterval: string;
  applicableTestsCount: number;
  description: string;
  tag: string;
}

export interface DemoScenario {
  id: string;
  name: string;
  subtitle: string;
  expectedVerdict: 'PASS' | 'FAIL';
  classType: import('./instrument').AccuracyClass;
  description: string;
}

export interface AttentionItem {
  id: string;
  severity: 'warning' | 'fail' | 'RED' | 'AMBER' | 'YELLOW';
  title: string;
  instrument?: string;
  description: string;
  detail?: string;
  actionText?: string;
  sessionId?: string;
}

export interface ComplianceData {
  passRate: number;
  passCount: number;
  warningCount: number;
  failCount: number;
}
