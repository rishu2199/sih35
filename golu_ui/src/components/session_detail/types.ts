export type SessionScenario = 'ACTIVE' | 'FRESH' | 'FINISHED' | 'APPROVED' | 'REMANDED' | 'BLOCKED' | 'FAILED';

export type StepState = 'COMPLETED' | 'IN_PROGRESS' | 'UPCOMING' | 'BLOCKED' | 'LOCKED';

export interface TestStepItem {
  id: number;
  stepNumber: string; // '01', '02', etc.
  name: string;
  shortName: string;
  targetView: string;
  state: StepState;
  badgeText: string;
  resultSummary: string;
  lockedReason?: string;
}

export interface TestResultModuleItem {
  id: string;
  testNumber: string; // 'Test 01', 'Test 02', etc.
  name: string;
  standardReference: string;
  state: 'COMPLETED' | 'IN_PROGRESS' | 'PENDING' | 'BLOCKED';
  verdict: 'PASS' | 'FAIL' | 'ACTIVE' | 'PENDING';
  observationsCount: string;
  details: string;
  targetView: string;
}

export interface InstrumentSpecs {
  manufacturer: string;
  model: string;
  serialNumber: string;
  tacNumber: string;
  accuracyClass: string;
  maxCapacity: string;
  minCapacity: string;
  interval: string; // e
  scaleInterval: string; // d
  divisionsCount: number; // n
  firmware: string;
  laboratory: string;
  verificationStage: string;
}

export interface SessionMeta {
  sessionId: string;
  stage: string;
  operator: string;
  startedAt: string;
  lastSavedAt: string;
  auditEventsCount: number;
  lastAction: string;
}

export interface StatutoryEvidenceItem {
  id: string;
  category: string;
  name: string;
  captured: boolean;
  timestamp: string;
  hash: string;
  iconName: string;
  notes: string;
}

export interface HardwareTelemetryReading {
  weight: string;
  unit: string;
  isStable: boolean;
  capturedAt: string;
  protocol: string;
}

export interface SessionTimelineEvent {
  step: string;
  title: string;
  status: 'COMPLETED' | 'CURRENT' | 'PENDING';
  timestamp?: string;
  actor?: string;
  detail: string;
}
