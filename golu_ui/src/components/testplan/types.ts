export type VerificationStage = 'Initial Type Approval' | 'Subsequent Verification' | 'In-Service Inspection';

export type TestScopeStatus =
  | 'READY'
  | 'COMPLETE'
  | 'PENDING'
  | 'ATTENTION'
  | 'BLOCKED'
  | 'CURRENT'
  | 'OPTIONAL'
  | 'NOT_APPLICABLE';

export interface StatutoryTestItem {
  id: string; // e.g. 'TEST_01'
  testNumber: number; // 1 to 8
  sequenceNumber: string; // '01', '02', etc.
  name: string;
  clause: string;
  description: string;
  applicable: boolean;
  required: boolean;
  status: TestScopeStatus;
  targetView: string;
  targetStepNumber: number;
  basisText: string;
  applicabilityReason: string;
  completedAt?: string;
  result?: 'PASS' | 'MARGINAL' | 'FAIL';
  blockReason?: string;
  attentionNote?: string;
}

export const GET_STATUTORY_TEST_SCOPE = (
  stage: VerificationStage,
  standardsValid: boolean = true,
  baselineRecorded: boolean = true,
  physicalCompleted: boolean = false
): StatutoryTestItem[] => {
  return [
    {
      id: 'TEST_01',
      testNumber: 1,
      sequenceNumber: '01',
      name: 'Visual & Physical Examination',
      clause: 'OIML R 76-1 CL 3.1 & CL 3.2',
      description: 'Audit instrument nameplate markings, verification scale intervals, leveling spirit-bubble position, and tamper-evident lead/wire seals.',
      applicable: true,
      required: true,
      status: physicalCompleted ? 'COMPLETE' : 'READY',
      targetView: 'physical_inspection',
      targetStepNumber: 2,
      basisText: 'Class III + Universal Mandatory',
      applicabilityReason: 'Mandatory statutory prerequisite across all verification stages and instrument accuracy classes (WELMEC 7.2 Guide § 3).',
      completedAt: physicalCompleted ? '04 Oct 2026 • 14:15' : undefined,
      result: physicalCompleted ? 'PASS' : undefined,
    },
    {
      id: 'TEST_02',
      testNumber: 2,
      sequenceNumber: '02',
      name: 'Zero-Setting & Tare Device Operations',
      clause: 'OIML R 76-1 CL 3.5.1',
      description: 'Audit semi-automatic zero-setting range (±2% Max), zero-tracking rate (0.5d/s), and initial zero-setting bounds.',
      applicable: true,
      required: true,
      status: 'COMPLETE',
      targetView: 'weighing_linearity',
      targetStepNumber: 3,
      basisText: 'Class III + Subsequent Verification',
      applicabilityReason: 'Mandatory for all instruments equipped with semi-automatic zero-setting or zero-tracking balance registers.',
      completedAt: '04 Oct 2026 • 14:30',
      result: 'PASS',
    },
    {
      id: 'TEST_03',
      testNumber: 3,
      sequenceNumber: '03',
      name: 'Weighing Error & Linearity (Ascending/Descending)',
      clause: 'OIML R 76-1 CL 3.5.2 & CL A.4.4',
      description: 'Determine intrinsic errors with ascending and descending standard test loads across minimum, break points (500e, 2000e), and maximum capacity.',
      applicable: true,
      required: true,
      status: !standardsValid ? 'BLOCKED' : 'READY',
      targetView: 'weighing_linearity',
      targetStepNumber: 3,
      basisText: 'Class III + Core Metrology Protocol',
      applicabilityReason: 'Core metrological weighing test required for verification certificate issuance and MPE compliance verification.',
      blockReason: !standardsValid ? 'Reference standard weight set has expired calibration.' : undefined,
    },
    {
      id: 'TEST_04',
      testNumber: 4,
      sequenceNumber: '04',
      name: 'Eccentricity / Off-Center Loading Test',
      clause: 'OIML R 76-1 CL 3.6.2 & CL A.4.7',
      description: 'Evaluate load receptor indication shifts when 1/3 Max test load (10 kg) is positioned sequentially at off-center platform quadrants.',
      applicable: true,
      required: true,
      status: !standardsValid ? 'BLOCKED' : 'READY',
      targetView: 'eccentricity_workspace',
      targetStepNumber: 4,
      basisText: 'Class III + Platter Scale Geometry',
      applicabilityReason: 'Mandatory for flat platter scales to certify load cell geometry deflection limits under off-center distribution.',
      blockReason: !standardsValid ? 'Reference standard weight set has expired calibration.' : undefined,
    },
    {
      id: 'TEST_05',
      testNumber: 5,
      sequenceNumber: '05',
      name: 'Repeatability Test (10 Sequential Cycles)',
      clause: 'OIML R 76-1 CL 3.6.1 & CL A.4.5',
      description: 'Verify consistency of indications under repeated applications of identical standard test loads (1/2 Max and Max) with return to zero.',
      applicable: true,
      required: true,
      status: !standardsValid ? 'BLOCKED' : 'PENDING',
      targetView: 'repeatability_workspace',
      targetStepNumber: 5,
      basisText: 'Class III + Subsequent Verification',
      applicabilityReason: 'Statutory repeatability test required under OIML non-automatic weighing instrument protocols (range ≤ |MPE|).',
      blockReason: !standardsValid ? 'Reference standard weight set has expired calibration.' : undefined,
    },
    {
      id: 'TEST_06',
      testNumber: 6,
      sequenceNumber: '06',
      name: 'Tare Balance Indication Accuracy',
      clause: 'OIML R 76-1 CL 3.6.3',
      description: 'Verify additive and subtractive tare indication correctness within ±0.25e at zero and full scale loads.',
      applicable: true,
      required: stage !== 'In-Service Inspection',
      status: stage === 'In-Service Inspection' ? 'OPTIONAL' : !standardsValid ? 'BLOCKED' : 'READY',
      targetView: 'environmental_workspace',
      targetStepNumber: 6,
      basisText: stage === 'In-Service Inspection' ? 'In-Service (Periodic Optional)' : 'Subsequent Verification Mandatory',
      applicabilityReason: 'Mandatory for commercial trade scales with net price computing tare registers.',
      blockReason: !standardsValid ? 'Reference standard weight set has expired calibration.' : undefined,
    },
    {
      id: 'TEST_07',
      testNumber: 7,
      sequenceNumber: '07',
      name: 'Environmental Climatic Temperature Drift',
      clause: 'OIML R 76-1 CL 3.9.2.1',
      description: 'Subject instrument to defined climatic sequence (+20°C → +40°C → -10°C → +20°C) with mandatory thermal soak verification.',
      applicable: stage === 'Initial Type Approval' || stage === 'Subsequent Verification',
      required: stage === 'Initial Type Approval',
      status:
        stage === 'Initial Type Approval'
          ? !baselineRecorded
            ? 'ATTENTION'
            : 'READY'
          : stage === 'Subsequent Verification'
          ? 'READY'
          : 'NOT_APPLICABLE',
      targetView: 'environmental_workspace',
      targetStepNumber: 6,
      basisText:
        stage === 'Initial Type Approval'
          ? 'Type Approval Laboratory Gate'
          : 'Subsequent Verification (Environmental Audit)',
      applicabilityReason:
        stage === 'Initial Type Approval'
          ? 'Mandatory for pattern approval under controlled climatic testing chamber (Class III: -10°C to +40°C).'
          : 'Optional periodic environmental drift verification for regulated stationary installations.',
      attentionNote: !baselineRecorded ? 'Ambient chamber baseline not yet recorded.' : undefined,
    },
    {
      id: 'TEST_08',
      testNumber: 8,
      sequenceNumber: '08',
      name: 'Span Stability & Long-Term Endurance',
      clause: 'OIML R 76-1 CL 3.8 & CL A.6',
      description: 'Evaluate long-term span creep, power supply variation drift, and warm-up drift across 28-day stability cycles.',
      applicable: stage === 'Initial Type Approval',
      required: stage === 'Initial Type Approval',
      status: stage === 'Initial Type Approval' ? 'PENDING' : 'NOT_APPLICABLE',
      targetView: 'testing_workspace',
      targetStepNumber: 6,
      basisText:
        stage === 'Initial Type Approval'
          ? 'Pattern Approval 28-Day Protocol'
          : 'Not Applicable for Field Verification',
      applicabilityReason:
        'Only applicable during comprehensive type approval evaluation in authorized test laboratories; not required for routine field verification.',
    },
  ];
};

export const GET_INITIAL_TEST_SCOPE = (stage: VerificationStage): StatutoryTestItem[] => {
  return GET_STATUTORY_TEST_SCOPE(stage, true, true);
};
