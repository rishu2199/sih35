export interface TraceabilityState {
  standardSetId: string;

  calibrationValid: boolean;

  calibrationDate: string;
  expiryDate: string;

  daysRemaining: number;

  lockoutReason?: string;
}

export type StandardWeightClass = 'E1' | 'E2' | 'F1' | 'F2' | 'M1' | 'M2';

export interface StandardWeightSet {
  id: string;
  code: string;
  class: StandardWeightClass;
  nominalRange: string;
  calibrationLab: string;
  certificateNo: string;
  validUntil: string;
  status: 'VALID' | 'EXPIRING' | 'EXPIRED' | 'LOCKED';
  piecesCount: number;
}
