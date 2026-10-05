export type ScaleProtocol = 'CAS' | 'METTLER_SICS' | 'AVERY_SMA';

export type ConnectionType = 'PHYSICAL_SERIAL' | 'VIRTUAL_SIMULATOR' | 'DISCONNECTED';

export interface WeightReading {
  grossWeight: number;
  netWeight: number;
  tareWeight: number;
  unit: 'kg' | 'g';
  displayWeight: string;
  isStable: boolean;
  isZero: boolean;
  timestamp: string;
  rawString: string;
}

export interface WelmecSoftwareExamination {
  counterC: string; // e.g. "12"
  counterP: string; // e.g. "08"
  firmwareHash: string;
  state: 'VERIFIED' | 'ATTENTION_REQUIRED';
  version: string;
  lastChecked: string;
  welmecClause: string;
  isExamining?: boolean;
}

export interface ScaleDevice {
  name: string;
  manufacturer: string;
  model: string;
  serialNumber: string;
  port: string;
  protocol: ScaleProtocol;
  baudRate: number;
  isConnected: boolean;
  connectionType: ConnectionType;
  connectedDuration: string;
  packetsReceived: number;
  latencyMs: number;
  welmec: WelmecSoftwareExamination;
}

export interface SerialTelemetryPacket {
  id: string;
  timestamp: string;
  direction: 'RX' | 'TX';
  protocol: ScaleProtocol;
  raw: string;
  parsedSummary: string;
  weight: number;
  stable: boolean;
  unit: 'kg' | 'g';
}

export interface CapturedReadingLog {
  id: string;
  weight: string;
  unit: string;
  mode: 'GROSS' | 'NET';
  isStable: boolean;
  timestamp: string;
  protocol: ScaleProtocol;
  device: string;
}
