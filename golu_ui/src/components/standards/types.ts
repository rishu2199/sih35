export type WeightAccuracyClass = 'E1' | 'E2' | 'F1' | 'M1';

export type StandardValidityStatus = 'VALID' | 'EXPIRING' | 'EXPIRED' | 'RETIRED';

export interface AssignedSessionInfo {
  sessionId: string;
  stage: string;
  status: 'ACTIVE' | 'REVIEW' | 'READ_ONLY';
  operator: string;
}

export interface UsageHistoryEntry {
  date: string;
  sessionId: string;
  operator: string;
  result: 'PASS' | 'FAIL';
}

export interface StandardWeightSet {
  id: string; // e.g. E2-014
  accuracyClass: WeightAccuracyClass;
  setName: string;
  massRange: string;
  piecesCount: number;
  piecesList: string[];
  certificateNumber: string;
  calibrationDate: string;
  validUntilDate: string;
  daysRemaining: number;
  status: StandardValidityStatus;
  laboratory: string;
  accreditationBody: string;
  expandedUncertainty: string;
  isCurrentlyAssigned?: boolean;
  assignedToSessionId?: string;
  assignedSessionsCount: number;
  assignedSessionsList: AssignedSessionInfo[];
  usageHistory: UsageHistoryEntry[];
}

export const CANONICAL_STANDARDS: StandardWeightSet[] = [
  {
    id: 'E2-014',
    accuracyClass: 'E2',
    setName: 'Class E2 Standard Weight Set',
    massRange: '1 mg – 20 kg',
    piecesCount: 24,
    piecesList: [
      '1 mg', '2 mg', '2 mg*', '5 mg', '10 mg', '20 mg', '20 mg*', '50 mg',
      '100 mg', '200 mg', '200 mg*', '500 mg', '1 g', '2 g', '2 g*', '5 g',
      '10 g', '20 g', '20 g*', '50 g', '100 g', '200 g', '500 g', '1 kg', '2 kg', '5 kg', '10 kg', '20 kg'
    ],
    certificateNumber: 'NABL-2026-01482',
    calibrationDate: '12 Aug 2026',
    validUntilDate: '12 Dec 2026',
    daysRemaining: 42,
    status: 'VALID',
    laboratory: 'Regional Reference Standards Laboratory (RRSL Bengaluru)',
    accreditationBody: 'NABL ISO/IEC 17025 (CC-1104)',
    expandedUncertainty: 'U = 0.03 mg (k = 2)',
    isCurrentlyAssigned: true,
    assignedToSessionId: 'VR-2026-00418',
    assignedSessionsCount: 4,
    assignedSessionsList: [
      { sessionId: 'VR-2026-00418', stage: 'Weighing & Linearity', status: 'ACTIVE', operator: 'Metrologist' },
      { sessionId: 'SES-0044', stage: 'Repeatability Test', status: 'ACTIVE', operator: 'Metrologist' },
      { sessionId: 'SES-0042', stage: 'Statutory Review', status: 'REVIEW', operator: 'Reviewer' },
      { sessionId: 'SES-0039', stage: 'Director Sign-Off', status: 'READ_ONLY', operator: 'Director' },
    ],
    usageHistory: [
      { date: '03 Oct', sessionId: 'SES-0041', operator: 'Metrologist', result: 'PASS' },
      { date: '02 Oct', sessionId: 'SES-0038', operator: 'Metrologist', result: 'PASS' },
      { date: '30 Sep', sessionId: 'SES-0031', operator: 'Metrologist', result: 'PASS' },
      { date: '28 Sep', sessionId: 'SES-0027', operator: 'Reviewer', result: 'PASS' },
    ],
  },
  {
    id: 'E1-002',
    accuracyClass: 'E1',
    setName: 'Class E1 Primary Reference Standard',
    massRange: '1 mg – 500 g',
    piecesCount: 20,
    piecesList: [
      '1 mg', '2 mg', '2 mg*', '5 mg', '10 mg', '20 mg', '20 mg*', '50 mg',
      '100 mg', '200 mg', '200 mg*', '500 mg', '1 g', '2 g', '5 g', '10 g',
      '20 g', '50 g', '100 g', '200 g', '500 g'
    ],
    certificateNumber: 'NPL-2026-E1-002',
    calibrationDate: '28 May 2026',
    validUntilDate: '10 Feb 2027',
    daysRemaining: 129,
    status: 'VALID',
    laboratory: 'National Physical Laboratory (NPL India)',
    accreditationBody: 'BIPM Key Comparison Traceable',
    expandedUncertainty: 'U = 0.005 mg (k = 2)',
    isCurrentlyAssigned: false,
    assignedSessionsCount: 1,
    assignedSessionsList: [
      { sessionId: 'SES-0035', stage: 'High Precision Intake', status: 'READ_ONLY', operator: 'Senior Metrologist' },
    ],
    usageHistory: [
      { date: '25 Sep', sessionId: 'SES-0035', operator: 'Metrologist', result: 'PASS' },
      { date: '18 Sep', sessionId: 'SES-0022', operator: 'Metrologist', result: 'PASS' },
    ],
  },
  {
    id: 'E2-018',
    accuracyClass: 'E2',
    setName: 'Class E2 Analytical Secondary Set',
    massRange: '1 mg – 1 kg',
    piecesCount: 22,
    piecesList: [
      '1 mg', '2 mg', '5 mg', '10 mg', '20 mg', '50 mg',
      '100 mg', '200 mg', '500 mg', '1 g', '2 g', '5 g', '10 g',
      '20 g', '50 g', '100 g', '200 g', '500 g', '1 kg'
    ],
    certificateNumber: 'NABL-2026-01491',
    calibrationDate: '25 Jul 2026',
    validUntilDate: '14 Dec 2026',
    daysRemaining: 71,
    status: 'VALID',
    laboratory: 'Regional Reference Standards Laboratory (RRSL Ahmedabad)',
    accreditationBody: 'NABL ISO/IEC 17025 (CC-2891)',
    expandedUncertainty: 'U = 0.04 mg (k = 2)',
    isCurrentlyAssigned: false,
    assignedSessionsCount: 2,
    assignedSessionsList: [
      { sessionId: 'SES-0043', stage: 'Corner Load', status: 'ACTIVE', operator: 'Metrologist' },
      { sessionId: 'SES-0037', stage: 'Archive', status: 'READ_ONLY', operator: 'Auditor' },
    ],
    usageHistory: [
      { date: '01 Oct', sessionId: 'SES-0043', operator: 'Metrologist', result: 'PASS' },
      { date: '22 Sep', sessionId: 'SES-0029', operator: 'Metrologist', result: 'PASS' },
    ],
  },
  {
    id: 'F1-008',
    accuracyClass: 'F1',
    setName: 'Class F1 Precision Reference Set',
    massRange: '1 g – 10 kg',
    piecesCount: 16,
    piecesList: [
      '1 g', '2 g', '2 g*', '5 g', '10 g', '20 g', '20 g*', '50 g',
      '100 g', '200 g', '200 g*', '500 g', '1 kg', '2 kg', '5 kg', '10 kg'
    ],
    certificateNumber: 'NABL-2025-F1-008',
    calibrationDate: '09 Oct 2025',
    validUntilDate: '09 Oct 2026',
    daysRemaining: 5,
    status: 'EXPIRING',
    laboratory: 'State Legal Metrology Standards Lab',
    accreditationBody: 'NABL ISO/IEC 17025 (CC-3412)',
    expandedUncertainty: 'U = 0.25 mg (k = 2)',
    isCurrentlyAssigned: false,
    assignedSessionsCount: 1,
    assignedSessionsList: [
      { sessionId: 'SES-0045', stage: 'Preflight Verification', status: 'ACTIVE', operator: 'Metrologist' },
    ],
    usageHistory: [
      { date: '02 Oct', sessionId: 'SES-0045', operator: 'Metrologist', result: 'PASS' },
      { date: '29 Sep', sessionId: 'SES-0033', operator: 'Metrologist', result: 'PASS' },
    ],
  },
  {
    id: 'F1-011',
    accuracyClass: 'F1',
    setName: 'Class F1 Industrial Working Set',
    massRange: '100 g – 20 kg',
    piecesCount: 12,
    piecesList: ['100 g', '200 g', '500 g', '1 kg', '2 kg', '5 kg', '10 kg', '20 kg'],
    certificateNumber: 'NABL-2026-F1-011',
    calibrationDate: '01 Jul 2026',
    validUntilDate: '31 Dec 2026',
    daysRemaining: 88,
    status: 'VALID',
    laboratory: 'Central Legal Metrology Calibration Lab',
    accreditationBody: 'NABL ISO/IEC 17025 (CC-3412)',
    expandedUncertainty: 'U = 0.30 mg (k = 2)',
    isCurrentlyAssigned: false,
    assignedSessionsCount: 0,
    assignedSessionsList: [],
    usageHistory: [
      { date: '15 Sep', sessionId: 'SES-0020', operator: 'Metrologist', result: 'PASS' },
    ],
  },
  {
    id: 'M1-003',
    accuracyClass: 'M1',
    setName: 'Class M1 Heavy Cast Iron Set',
    massRange: '1 kg – 50 kg',
    piecesCount: 10,
    piecesList: ['1 kg', '2 kg', '5 kg', '10 kg', '20 kg', '50 kg'],
    certificateNumber: 'NABL-2025-M1-003',
    calibrationDate: '02 Oct 2025',
    validUntilDate: '02 Oct 2026',
    daysRemaining: -2,
    status: 'EXPIRED',
    laboratory: 'Central Legal Metrology Calibration Lab',
    accreditationBody: 'NABL ISO/IEC 17025 (CC-3412)',
    expandedUncertainty: 'U = 5.0 mg (k = 2)',
    isCurrentlyAssigned: false,
    assignedSessionsCount: 1,
    assignedSessionsList: [
      { sessionId: 'VR-2026-00409', stage: 'Corner Load Inspection', status: 'READ_ONLY', operator: 'Metrologist' },
    ],
    usageHistory: [
      { date: '01 Oct', sessionId: 'VR-2026-00409', operator: 'Metrologist', result: 'PASS' },
      { date: '20 Sep', sessionId: 'SES-0024', operator: 'Metrologist', result: 'PASS' },
    ],
  },
];

export const INITIAL_STANDARD_WEIGHTS = CANONICAL_STANDARDS;
