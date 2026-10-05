import { ComplianceStatus } from './instrument';

export interface ObservationRow {
  stepIndex: number;
  nominalLoad: number;
  scaleReading: number;

  auxiliaryDeltaL?: number;

  turningPointP: number;

  errorE: number;

  correctedErrorEc: number;

  mpeLimit: number;

  status: ComplianceStatus;

  hasComment?: boolean;

  // Convenience / backwards compatibility fields
  id?: string;
  stepNumber?: number;
  loadNominal?: number;
  indicationI?: number;
  turningPointDeltaL?: number;
  calculatedP?: number;
  mpe?: number;
  direction?: 'ASCENDING' | 'DESCENDING';
  timestamp?: string;
  source?: 'MANUAL' | 'LIVE_SCALE';
  comment?: string;
}

export interface WeighingTest {
  ascending: ObservationRow[];
  descending: ObservationRow[];

  completed: boolean;

  overallStatus: ComplianceStatus;

  maxObservedError?: number;
  minObservedError?: number;

  // Convenience aliases for existing components
  observations?: ObservationRow[];
  maxError?: number;
  status?: ComplianceStatus;
  notes?: string;
}

export interface EccentricityPoint {
  id: string;
  label: string;
  load: number;
  observedValue: number;
  deviation: number;
  mpeLimit: number;
  status: ComplianceStatus;

  // Compatibility
  positionNumber?: number;
  name?: string;
  position?: 'CENTER' | 'FRONT_LEFT' | 'FRONT_RIGHT' | 'REAR_LEFT' | 'REAR_RIGHT' | string;
  indication?: number;
  turningPointDeltaL?: number;
  error?: number;
  mpe?: number;
}

export interface EccentricityTest {
  geometry: 'SQUARE' | 'ROUND' | 'ROLLING_LOAD';

  points: EccentricityPoint[];

  overallStatus: ComplianceStatus;

  completed: boolean;

  // Compatibility
  testLoad?: number;
  centerReading?: number;
  locations?: EccentricityPoint[];
  maxSpread?: number;
  status?: ComplianceStatus;
  notes?: string;
}

export interface RepeatabilityReading {
  runIndex: number;
  load: number;
  reading: number;
  zeroReturn: number;
  deltaL?: number;
  timestamp: string;

  // Compatibility
  runNumber?: number;
  indication?: number;
  turningPointDeltaL?: number;
}

export interface RepeatabilityTest {
  targetLoad: number;

  readings: RepeatabilityReading[];

  observedSpread: number;
  allowableLimit: number;

  status: ComplianceStatus;

  completed: boolean;

  // Compatibility
  overallStatus?: ComplianceStatus;
  testLoad?: number;
  runs?: RepeatabilityReading[];
  maxDifference?: number;
  mpe?: number;
  notes?: string;
}

export interface TareTest {
  tareType: 'SUBTRACTIVE' | 'ADDITIVE';
  tareValue: number;
  scaleIndication: number;
  error: number;
  status: ComplianceStatus;
}

export interface TemperatureDriftTest {
  tempStart: number;
  tempEnd: number;
  driftPpmPerK: number;
  mpeLimit: number;
  status: ComplianceStatus;
}

export interface ChamberState {
  temperatureC: number;
  relativeHumidityPercent: number;
  pressureHpa: number;
  dewPointC: number;
  lastUpdated: string;
}

export interface EnvironmentTest {
  baseline: {
    temperature: number;
    humidity: number;
    pressure: number;
  };

  tare: TareTest;

  temperatureDrift: TemperatureDriftTest;

  chamber: ChamberState;

  status: ComplianceStatus;

  completed: boolean;

  // Compatibility
  tareSubtractive?: boolean;
  zeroTareAccuracy?: number;
  thermalDriftPpmPerK?: number;
  temperatureStartC?: number;
  temperatureEndC?: number;
  notes?: string;
}
