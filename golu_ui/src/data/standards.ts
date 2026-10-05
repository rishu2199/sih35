import { StandardWeightSet, TraceabilityState } from '../types/standards';

export const STANDARD_SET_M1_VALID: StandardWeightSet = {
  id: 'set-m1-2024-009',
  code: 'M1-2024-009',
  class: 'M1',
  nominalRange: '100 g to 50 kg',
  calibrationLab: 'RRSL Bengaluru',
  certificateNo: 'RRSL-BLR-CAL-2025-041',
  validUntil: '2026-12-31',
  status: 'VALID',
  piecesCount: 16,
};

export const STANDARD_SET_E2_VALID: StandardWeightSet = {
  id: 'set-e2-2025-001',
  code: 'E2-2025-001',
  class: 'E2',
  nominalRange: '1 mg to 500 g',
  calibrationLab: 'National Physical Laboratory (NPL)',
  certificateNo: 'NPL-IND-CAL-2025-992',
  validUntil: '2027-04-15',
  status: 'VALID',
  piecesCount: 24,
};

export const STANDARD_SET_F1_EXPIRED: StandardWeightSet = {
  id: 'set-f1-2024-018',
  code: 'F1-2024-018',
  class: 'F1',
  nominalRange: '1 g to 10 kg',
  calibrationLab: 'Regional Standards Lab',
  certificateNo: 'RRSL-DEL-2024-118',
  validUntil: '2026-03-18',
  status: 'EXPIRED',
  piecesCount: 18,
};

export const CANONICAL_STANDARDS: StandardWeightSet[] = [
  STANDARD_SET_M1_VALID,
  STANDARD_SET_E2_VALID,
  STANDARD_SET_F1_EXPIRED,
];

export const DEFAULT_TRACEABILITY_VALID: TraceabilityState = {
  standardSetId: STANDARD_SET_M1_VALID.id,
  calibrationValid: true,
  calibrationDate: '2025-01-10',
  expiryDate: '2026-12-31',
  daysRemaining: 87,
};

export const LOCKED_OUT_TRACEABILITY: TraceabilityState = {
  standardSetId: STANDARD_SET_F1_EXPIRED.id,
  calibrationValid: false,
  calibrationDate: '2024-03-18',
  expiryDate: '2026-03-18',
  daysRemaining: -17,
  lockoutReason: 'Standard weight set F1-2024-018 expired on 18 Mar 2026. Testing cannot continue until a valid set is selected.',
};
