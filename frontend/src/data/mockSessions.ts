import type { TestSessionSummary } from '../types';

export interface ActiveSessionDetail extends TestSessionSummary {
  progressPercent: number;
  batteryStatus: {
    visual: 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING';
    weighing: 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING';
    eccentricity: 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING';
    repeatability: 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING';
    drift: 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING' | 'NOT_APPLICABLE';
  };
  lastUpdated: string;
  notes?: string;
}

export const MOCK_ACTIVE_SESSIONS: ActiveSessionDetail[] = [
  {
    id: 'sess-001',
    sessionNumber: 'RRSL-BLR-2026-0842',
    instrumentModel: 'Avery Weigh-Tronix ZM510',
    manufacturer: 'Avery India Ltd.',
    serialNumber: 'SN-2026-9931',
    accuracyClass: 'CLASS_III',
    maxCapacity: '30.0 kg',
    verificationInterval: '10.0 g',
    unit: 'KILOGRAM',
    stage: 'INITIAL_TYPE_APPROVAL',
    status: 'APPROVED',
    complianceStatus: 'PASS',
    operatorName: 'Dr. Anand Raman',
    isLocked: false,
    createdAt: '2026-09-25 14:30 IST',
    lastUpdated: '10m ago',
    progressPercent: 100,
    batteryStatus: {
      visual: 'PASS',
      weighing: 'PASS',
      eccentricity: 'PASS',
      repeatability: 'PASS',
      drift: 'PASS',
    },
    notes: 'Full statutory verification complete. Conforms to Clause A.4.4 error corridors.',
  },
  {
    id: 'sess-002',
    sessionNumber: 'RRSL-BLR-2026-0843',
    instrumentModel: 'Mettler Toledo XPE-205',
    manufacturer: 'Mettler-Toledo India',
    serialNumber: 'MT-8841-A',
    accuracyClass: 'CLASS_I',
    maxCapacity: '220.0 g',
    verificationInterval: '1.0 mg',
    unit: 'GRAM',
    stage: 'INITIAL_TYPE_APPROVAL',
    status: 'UNDER_REVIEW',
    complianceStatus: 'PASS',
    operatorName: 'K. S. Verma',
    isLocked: false,
    createdAt: '2026-09-25 16:15 IST',
    lastUpdated: '25m ago',
    progressPercent: 80,
    batteryStatus: {
      visual: 'PASS',
      weighing: 'PASS',
      eccentricity: 'PASS',
      repeatability: 'PASS',
      drift: 'PENDING',
    },
    notes: 'Submitted for Principal Scientific Officer statutory review and cryptographic co-signature.',
  },
  {
    id: 'sess-003',
    sessionNumber: 'RRSL-BLR-2026-0844',
    instrumentModel: 'Sartorius Entris II 6200',
    manufacturer: 'Sartorius India Pvt Ltd',
    serialNumber: 'SAR-2026-441',
    accuracyClass: 'CLASS_II',
    maxCapacity: '6200.0 g',
    verificationInterval: '0.1 g',
    unit: 'GRAM',
    stage: 'SUBSEQUENT_VERIFICATION',
    status: 'IN_PROGRESS',
    complianceStatus: 'FAIL',
    operatorName: 'Dr. Anand Raman',
    isLocked: true,
    createdAt: '2026-09-25 17:40 IST',
    lastUpdated: '1h ago',
    progressPercent: 35,
    batteryStatus: {
      visual: 'PASS',
      weighing: 'FAIL',
      eccentricity: 'PENDING',
      repeatability: 'PENDING',
      drift: 'PENDING',
    },
    notes: 'Testing gate locked: Assigned weight set WORKSHOP-M2-SET fails Clause 3.7.1 uncertainty criteria.',
  },
  {
    id: 'sess-004',
    sessionNumber: 'RRSL-BLR-2026-0845',
    instrumentModel: 'Essae Teraoka DS-215 Crane',
    manufacturer: 'Essae-Teraoka Ltd',
    serialNumber: 'ES-CRN-552',
    accuracyClass: 'CLASS_IIII',
    maxCapacity: '5000.0 kg',
    verificationInterval: '2.0 kg',
    unit: 'KILOGRAM',
    stage: 'IN_SERVICE_INSPECTION',
    status: 'IN_PROGRESS',
    complianceStatus: 'PENDING',
    operatorName: 'Priya Sharma',
    isLocked: false,
    createdAt: '2026-09-25 18:20 IST',
    lastUpdated: '45m ago',
    progressPercent: 40,
    batteryStatus: {
      visual: 'PASS',
      weighing: 'IN_PROGRESS',
      eccentricity: 'PENDING',
      repeatability: 'PENDING',
      drift: 'NOT_APPLICABLE',
    },
    notes: 'Ascending test series active. Target load 2000 kg pending LiveBridge serial telemetry packet.',
  },
];
