import { VerificationSession } from '../types/session';
import { ObservationRow } from '../types/observation';
import {
  INSTRUMENT_AVERY_ZM201,
  INSTRUMENT_METTLER_XPR,
  INSTRUMENT_SANSUI_GOLDMASTER,
  INSTRUMENT_ESSAE_DS215,
} from './instruments';
import { DEFAULT_TRACEABILITY_VALID } from './standards';

/**
 * 1. Standard Class III Retail Session (Passing Baseline)
 */
export function createStandardClassIIISession(): VerificationSession {
  const e = 0.005; // 5 g = 0.005 kg
  const loads = [0.1, 0.5, 2.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0];

  const ascending: ObservationRow[] = loads.map((nominalLoad, idx) => {
    const scaleReading = nominalLoad;
    const deltaL = 0.0025; // exact half interval
    const turningPointP = scaleReading;
    const errorE = 0.0;
    const correctedErrorEc = 0.0;
    // OIML Table 6 Class III MPE
    const m = nominalLoad / e;
    const mpeLimit = (m <= 500 ? 0.5 : m <= 2000 ? 1.0 : 1.5) * e;

    return {
      stepIndex: idx + 1,
      nominalLoad,
      scaleReading,
      auxiliaryDeltaL: deltaL,
      turningPointP,
      errorE,
      correctedErrorEc,
      mpeLimit,
      status: 'PASS',
      hasComment: false,
      id: `row-asc-${idx + 1}`,
      stepNumber: idx + 1,
      loadNominal: nominalLoad,
      indicationI: scaleReading,
      turningPointDeltaL: deltaL,
      calculatedP: turningPointP,
      mpe: mpeLimit,
      direction: 'ASCENDING',
      timestamp: `10:${15 + idx}:00`,
      source: 'MANUAL',
    };
  });

  const descending: ObservationRow[] = [30.0, 20.0, 10.0, 5.0, 0.1].map((nominalLoad, idx) => {
    const scaleReading = nominalLoad;
    const deltaL = 0.0025;
    const turningPointP = scaleReading;
    const errorE = 0.0;
    const correctedErrorEc = 0.0;
    const m = nominalLoad / e;
    const mpeLimit = (m <= 500 ? 0.5 : m <= 2000 ? 1.0 : 1.5) * e;

    return {
      stepIndex: idx + 10,
      nominalLoad,
      scaleReading,
      auxiliaryDeltaL: deltaL,
      turningPointP,
      errorE,
      correctedErrorEc,
      mpeLimit,
      status: 'PASS',
      hasComment: false,
      id: `row-desc-${idx + 1}`,
      stepNumber: idx + 10,
      loadNominal: nominalLoad,
      indicationI: scaleReading,
      turningPointDeltaL: deltaL,
      calculatedP: turningPointP,
      mpe: mpeLimit,
      direction: 'DESCENDING',
      timestamp: `10:${25 + idx}:00`,
      source: 'MANUAL',
    };
  });

  return {
    id: 'ses-av-2026-8812',
    sessionNumber: 'AV-2026-8812',
    instrumentId: INSTRUMENT_AVERY_ZM201.id,
    verificationStage: 'INITIAL_TYPE_APPROVAL',
    reviewStatus: 'IN_TESTING',
    complianceStatus: 'PASS',
    isImmutable: false,

    readiness: {
      overallStatus: 'READY',
      score: 100,
      blockingIssues: [],
      checkedAt: '2026-10-04T09:30:00Z',
      checks: [
        { id: 'chk-1', label: 'Instrument Identity & Plate Legibility', category: 'INSTRUMENT', required: true, status: 'READY' },
        { id: 'chk-2', label: 'Reference Standard Weights Calibration Valid', category: 'TRACEABILITY', required: true, status: 'READY' },
        { id: 'chk-3', label: 'OIML R 76-1 Test Scope Matrix Generated', category: 'TEST_PLAN', required: true, status: 'READY' },
        { id: 'chk-4', label: 'Chamber Baseline & Leveling Bubble Centered', category: 'ENVIRONMENT', required: true, status: 'READY' },
      ],
      // Compatibility fields
      environmentStable: true,
      powerWarmupComplete: true,
      scaleLevelCentered: true,
      standardWeightsValid: true,
      standardWeightsId: 'SET-M1-2024-009 (RRSL-BLR)',
      ambientTemperatureC: 22.4,
      relativeHumidityPercent: 48,
      atmosphericPressureHpa: 1013.2,
      isReady: true,
      notes: 'Preflight checklist completed. Working standard certificate valid for 87 days.',
    },

    testPlan: {
      verificationStage: 'INITIAL_TYPE_APPROVAL',
      allRequiredComplete: false,
      procedures: [
        { key: 'PHYSICAL', label: 'Physical & Visual Inspection', applicable: true, required: true, status: 'PASS' },
        { key: 'WEIGHING', label: 'Weighing Linearity Test', applicable: true, required: true, status: 'PASS' },
        { key: 'ECCENTRICITY', label: 'Eccentricity (Corner Load)', applicable: true, required: true, status: 'PASS' },
        { key: 'REPEATABILITY', label: 'Repeatability Sequence', applicable: true, required: true, status: 'PASS' },
        { key: 'ENVIRONMENT', label: 'Environmental / Tare Drift', applicable: true, required: true, status: 'PASS' },
      ],
      // Compatibility
      applicableSteps: ['PHYSICAL', 'WEIGHING', 'ECCENTRICITY', 'REPEATABILITY', 'ENVIRONMENT'],
      weighingTestPoints: loads,
      repeatabilityTestLoads: [10.0, 30.0],
      eccentricityTestLoad: 10.0,
      mpeTier1: 0.5,
      mpeTier2: 1.0,
      mpeTier3: 1.5,
    },

    physicalInspection: {
      markingsLegible: true,
      levelingIndicatorPresent: true,
      stampingSealsIntact: true,
      securityLockHardwareSecure: true,
      auditTrailVerified: true,
      status: 'PASS',
      inspectorName: 'Shashi Shekhar',
      inspectedAt: '2026-10-04T09:35:00Z',
      notes: 'All markings legible. Lead verification seal intact and verified against 2025 records.',
    },

    weighing: {
      ascending,
      descending,
      completed: true,
      overallStatus: 'PASS',
      maxObservedError: 0.0,
      minObservedError: 0.0,
      // Compatibility
      observations: [...ascending, ...descending],
      maxError: 0.0,
      status: 'PASS',
      notes: 'All 14 test points comply strictly with OIML R 76-1 Table 6 tolerances.',
    },

    eccentricity: {
      geometry: 'SQUARE',
      completed: true,
      overallStatus: 'PASS',
      points: [
        { id: 'ecc-1', label: 'Center (Pos 1)', load: 10.0, observedValue: 10.000, deviation: 0.0, mpeLimit: 0.005, status: 'PASS', positionNumber: 1, name: 'Center', position: 'CENTER', indication: 10.0, error: 0.0, mpe: 0.005 },
        { id: 'ecc-2', label: 'Corner 1 - Front Left', load: 10.0, observedValue: 10.002, deviation: 0.002, mpeLimit: 0.005, status: 'PASS', positionNumber: 2, name: 'Front-Left', position: 'FRONT_LEFT', indication: 10.002, error: 0.002, mpe: 0.005 },
        { id: 'ecc-3', label: 'Corner 2 - Rear Left', load: 10.0, observedValue: 9.999, deviation: -0.001, mpeLimit: 0.005, status: 'PASS', positionNumber: 3, name: 'Rear-Left', position: 'REAR_LEFT', indication: 9.999, error: -0.001, mpe: 0.005 },
        { id: 'ecc-4', label: 'Corner 3 - Rear Right', load: 10.0, observedValue: 10.003, deviation: 0.003, mpeLimit: 0.005, status: 'PASS', positionNumber: 4, name: 'Rear-Right', position: 'REAR_RIGHT', indication: 10.003, error: 0.003, mpe: 0.005 },
        { id: 'ecc-5', label: 'Corner 4 - Front Right', load: 10.0, observedValue: 9.998, deviation: -0.002, mpeLimit: 0.005, status: 'PASS', positionNumber: 5, name: 'Front-Right', position: 'FRONT_RIGHT', indication: 9.998, error: -0.002, mpe: 0.005 },
      ],
      // Compatibility
      testLoad: 10.0,
      centerReading: 10.0,
      locations: [],
      maxSpread: 0.005,
      status: 'PASS',
      notes: 'Corner load test using 1/3 Max (10 kg). Platter deflection within tolerance.',
    },

    repeatability: {
      targetLoad: 15.0,
      observedSpread: 0.003,
      allowableLimit: 0.005,
      status: 'PASS',
      completed: true,
      readings: [
        { runIndex: 1, load: 15.0, reading: 15.000, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:30:00', runNumber: 1, indication: 15.000 },
        { runIndex: 2, load: 15.0, reading: 15.002, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:31:00', runNumber: 2, indication: 15.002 },
        { runIndex: 3, load: 15.0, reading: 15.000, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:32:00', runNumber: 3, indication: 15.000 },
        { runIndex: 4, load: 15.0, reading: 15.001, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:33:00', runNumber: 4, indication: 15.001 },
        { runIndex: 5, load: 15.0, reading: 15.003, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:34:00', runNumber: 5, indication: 15.003 },
        { runIndex: 6, load: 15.0, reading: 15.000, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:35:00', runNumber: 6, indication: 15.000 },
        { runIndex: 7, load: 15.0, reading: 15.002, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:36:00', runNumber: 7, indication: 15.002 },
        { runIndex: 8, load: 15.0, reading: 15.001, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:37:00', runNumber: 8, indication: 15.001 },
        { runIndex: 9, load: 15.0, reading: 15.000, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:38:00', runNumber: 9, indication: 15.000 },
        { runIndex: 10, load: 15.0, reading: 15.001, zeroReturn: 0.0, deltaL: 0.0025, timestamp: '10:39:00', runNumber: 10, indication: 15.001 },
      ],
      // Compatibility
      testLoad: 15.0,
      runs: [],
      maxDifference: 0.003,
      mpe: 0.005,
      notes: '10-reading sequence completed. Observed spread 0.003 kg does not exceed limit 0.005 kg.',
    },

    environment: {
      baseline: {
        temperature: 22.4,
        humidity: 48,
        pressure: 1013.2,
      },
      tare: {
        tareType: 'SUBTRACTIVE',
        tareValue: 5.0,
        scaleIndication: 5.000,
        error: 0.000,
        status: 'PASS',
      },
      temperatureDrift: {
        tempStart: 22.4,
        tempEnd: 22.8,
        driftPpmPerK: 1.2,
        mpeLimit: 5.0,
        status: 'PASS',
      },
      chamber: {
        temperatureC: 22.6,
        relativeHumidityPercent: 48,
        pressureHpa: 1013.2,
        dewPointC: 11.2,
        lastUpdated: '10:45:00',
      },
      status: 'PASS',
      completed: true,
      // Compatibility
      tareSubtractive: true,
      zeroTareAccuracy: 0.001,
      thermalDriftPpmPerK: 1.2,
      temperatureStartC: 22.4,
      temperatureEndC: 22.8,
      notes: 'Subtractive tare and thermal chamber drift compliant.',
    },

    traceability: DEFAULT_TRACEABILITY_VALID,

    createdAt: '2026-10-04T09:15:00Z',
    updatedAt: '2026-10-04T10:45:00Z',

    // Compatibility fields
    instrument: INSTRUMENT_AVERY_ZM201,
    activeStep: 4,
    operatorName: 'Shashi Shekhar',
    laboratory: 'RRSL Bengaluru',
    serialNumber: 'AV-2026-8812',
    model: 'ZM201 Retail Platform',
    manufacturer: 'Avery Weigh-Tronix',
    accuracyClass: 'CLASS_III',
    maxCapacity: '30.000 kg',
    interval: 'e = 0.005 kg',
    currentProcedure: 'Eccentricity / Corner Loading',
    completedSteps: 4,
    totalSteps: 7,
    progressPercent: 57,
    status: 'PASS',
    steps: [
      { num: 1, label: 'Physical Inspection', status: 'PASS' },
      { num: 2, label: 'Test Readiness', status: 'PASS' },
      { num: 3, label: 'Weighing Linearity', status: 'PASS' },
      { num: 4, label: 'Eccentricity (Corner)', status: 'IN_PROGRESS' },
      { num: 5, label: 'Repeatability Test', status: 'PENDING' },
      { num: 6, label: 'Environmental Drift', status: 'PENDING' },
      { num: 7, label: 'Supervisory Review', status: 'PENDING' },
    ],
  };
}

/**
 * 2. Scenario 2: Rounding Discrepancy Trap (Flagship Demo §23)
 */
export function createRoundingTrapSession(): VerificationSession {
  const session = createStandardClassIIISession();
  session.id = 'ses-trap-2026-007';
  session.sessionNumber = 'TRAP-2026-007';
  session.complianceStatus = 'FAIL';

  // Capacity boundary: 2,000e = 10,000 g (10.0 kg)
  // Legacy spreadsheet: I - L = 10.000 - 10.000 = 0.0 g (FALSE PASS)
  // Turning-point analysis: delta L = 0.0078 kg added to reach 10.005 kg
  // P = 10.000 + 0.0025 - 0.0078 = 9.9947 kg => Error E = -0.0053 kg (-5.3 g)
  // Legal limit: +/- 5.0 g. True result: FAIL!
  const trapRow: ObservationRow = {
    stepIndex: 5,
    nominalLoad: 10.0,
    scaleReading: 10.0,
    auxiliaryDeltaL: 0.0078,
    turningPointP: 9.9947,
    errorE: -0.0053,
    correctedErrorEc: -0.0053,
    mpeLimit: 0.0050,
    status: 'FAIL',
    hasComment: true,
    id: 'row-trap-5',
    stepNumber: 5,
    loadNominal: 10.0,
    indicationI: 10.0,
    turningPointDeltaL: 0.0078,
    calculatedP: 9.9947,
    mpe: 0.0050,
    direction: 'ASCENDING',
    timestamp: '11:02:15',
    source: 'LIVE_SCALE',
    comment: 'CRITICAL STATUTORY CATCH: Naive spreadsheet (I - L = 0.0 g) shows PASS. METROLOGIX-76 turning-point reveals true error E = -5.3 g exceeding MPE ±5.0 g.',
  };

  session.weighing.ascending[4] = trapRow;
  session.weighing.observations = [...session.weighing.ascending, ...session.weighing.descending];
  session.weighing.overallStatus = 'FAIL';
  session.weighing.status = 'FAIL';
  session.weighing.maxObservedError = -0.0053;
  session.weighing.maxError = -0.0053;

  session.notes = 'ROUNDING TRAP DEMO: Naive subtraction hides out-of-tolerance error. Formula P = I + 0.5e - delta L detected statutory violation.';
  session.status = 'FAIL';

  return session;
}

/**
 * 3. Scenario 3: Temperature Span Drift Failure (§24)
 */
export function createTemperatureDriftSession(): VerificationSession {
  const session = createStandardClassIIISession();
  session.id = 'ses-therm-2026-901';
  session.sessionNumber = 'THERM-2026-901';
  session.instrumentId = INSTRUMENT_SANSUI_GOLDMASTER.id;
  session.instrument = INSTRUMENT_SANSUI_GOLDMASTER;
  session.complianceStatus = 'FAIL';

  session.environment.temperatureDrift = {
    tempStart: 20.0,
    tempEnd: 40.0,
    driftPpmPerK: 14.2,
    mpeLimit: 5.0,
    status: 'FAIL',
  };
  session.environment.thermalDriftPpmPerK = 14.2;
  session.environment.temperatureStartC = 20.0;
  session.environment.temperatureEndC = 40.0;
  session.environment.status = 'FAIL';
  session.environment.notes = 'Thermal span shift under OIML Clause A.5.3: Reference +20°C PASS, elevated +40°C FAIL. Drift rate 14.2 ppm/K exceeds statutory ceiling 5.0 ppm/K.';

  session.notes = 'Thermal expansion / span shift failure under OIML Clause A.5.3 elevated temperature testing.';
  session.status = 'FAIL';

  return session;
}

/**
 * 4. Scenario 4: Eccentricity Cantilever Twist (§25)
 */
export function createEccentricityTwistSession(): VerificationSession {
  const session = createStandardClassIIISession();
  session.id = 'ses-ecc-2026-442';
  session.sessionNumber = 'ECC-2026-442';
  session.instrumentId = INSTRUMENT_ESSAE_DS215.id;
  session.instrument = INSTRUMENT_ESSAE_DS215;
  session.complianceStatus = 'FAIL';

  // Corner 4 (Front-Right) mechanical sag -6.2 g (or -0.0062 kg) exceeding MPE +/-0.005 kg
  session.eccentricity.points[4] = {
    id: 'ecc-5',
    label: 'Corner 4 - Front Right (Cantilever Twist)',
    load: 10.0,
    observedValue: 9.9938,
    deviation: -0.0062,
    mpeLimit: 0.005,
    status: 'FAIL',
    positionNumber: 5,
    name: 'Front-Right',
    position: 'FRONT_RIGHT',
    indication: 9.9938,
    error: -0.0062,
    mpe: 0.005,
  };
  session.eccentricity.overallStatus = 'FAIL';
  session.eccentricity.status = 'FAIL';
  session.eccentricity.maxSpread = 0.0092;
  session.eccentricity.notes = 'Corner 4 mechanical sag / cantilever twist detected. Platter deflection exceeds statutory tolerance.';

  session.notes = 'Corner 4 mechanical deflection error -6.2 g exceeds legal limit ±5.0 g.';
  session.status = 'FAIL';

  return session;
}

/**
 * 5. Scenario 5: High-Interval Class I Analytical Balance (§26)
 */
export function createClassIAnalyticalSession(): VerificationSession {
  const e = 0.001; // 1 mg = 0.001 g
  const loads = [1.0, 10.0, 50.0, 100.0, 120.0];

  const ascending: ObservationRow[] = loads.map((nominalLoad, idx) => {
    const errorE = idx === 4 ? 0.0004 : 0.0002;
    const calcP = nominalLoad + errorE;
    return {
      stepIndex: idx + 1,
      nominalLoad,
      scaleReading: calcP,
      auxiliaryDeltaL: 0.0005,
      turningPointP: calcP,
      errorE,
      correctedErrorEc: errorE,
      mpeLimit: 0.0010,
      status: 'PASS',
      hasComment: false,
      id: `row-cl1-${idx + 1}`,
      stepNumber: idx + 1,
      loadNominal: nominalLoad,
      indicationI: calcP,
      turningPointDeltaL: 0.0005,
      calculatedP: calcP,
      mpe: 0.0010,
      direction: 'ASCENDING',
      timestamp: `09:${10 + idx * 5}:00`,
      source: 'LIVE_SCALE',
    };
  });

  return {
    id: 'ses-mt-2026-0049',
    sessionNumber: 'MT-2026-0049',
    instrumentId: INSTRUMENT_METTLER_XPR.id,
    instrument: INSTRUMENT_METTLER_XPR,
    verificationStage: 'INITIAL_TYPE_APPROVAL',
    reviewStatus: 'APPROVED',
    complianceStatus: 'PASS',
    isImmutable: true,

    readiness: {
      overallStatus: 'READY',
      score: 100,
      blockingIssues: [],
      checkedAt: '2026-10-04T08:00:00Z',
      checks: [
        { id: 'chk-1', label: 'Micro-balance draft shield closed and level indicator centered', category: 'INSTRUMENT', required: true, status: 'READY' },
        { id: 'chk-2', label: 'E2 class reference standard weights valid (NPL India)', category: 'TRACEABILITY', required: true, status: 'READY' },
        { id: 'chk-3', label: 'Air buoyancy correction protocol initialized (CIPM-2007)', category: 'ENVIRONMENT', required: true, status: 'READY' },
      ],
      environmentStable: true,
      powerWarmupComplete: true,
      scaleLevelCentered: true,
      standardWeightsValid: true,
      standardWeightsId: 'SET-E2-2025-001 (NPL)',
      ambientTemperatureC: 20.1,
      relativeHumidityPercent: 45,
      atmosphericPressureHpa: 1014.5,
      isReady: true,
      notes: 'Environmental stabilization achieved. Buoyancy correction calculated according to CIPM-2007 air density.',
    },

    testPlan: {
      verificationStage: 'INITIAL_TYPE_APPROVAL',
      allRequiredComplete: true,
      procedures: [
        { key: 'PHYSICAL', label: 'Physical & Visual Inspection', applicable: true, required: true, status: 'PASS' },
        { key: 'WEIGHING', label: 'Weighing Linearity Test', applicable: true, required: true, status: 'PASS' },
        { key: 'ECCENTRICITY', label: 'Eccentricity (Corner Load)', applicable: true, required: true, status: 'PASS' },
        { key: 'REPEATABILITY', label: 'Repeatability Sequence', applicable: true, required: true, status: 'PASS' },
        { key: 'ENVIRONMENT', label: 'Environmental / Tare Drift', applicable: true, required: true, status: 'PASS' },
      ],
      applicableSteps: ['PHYSICAL', 'WEIGHING', 'ECCENTRICITY', 'REPEATABILITY', 'ENVIRONMENT'],
      weighingTestPoints: loads,
      repeatabilityTestLoads: [50.0, 120.0],
      eccentricityTestLoad: 40.0,
      mpeTier1: 0.5,
      mpeTier2: 1.0,
      mpeTier3: 1.5,
    },

    physicalInspection: {
      markingsLegible: true,
      levelingIndicatorPresent: true,
      stampingSealsIntact: true,
      securityLockHardwareSecure: true,
      auditTrailVerified: true,
      status: 'PASS',
      inspectorName: 'Shashi Shekhar',
      inspectedAt: '2026-10-04T08:15:00Z',
    },

    weighing: {
      ascending,
      descending: [],
      completed: true,
      overallStatus: 'PASS',
      maxObservedError: 0.0004,
      minObservedError: 0.0002,
      observations: ascending,
      maxError: 0.0004,
      status: 'PASS',
      notes: 'Micro-precision measurements with buoyancy compensation. Maximum error +0.4 mg well within MPE ±1.0 mg.',
    },

    eccentricity: {
      geometry: 'ROUND',
      completed: true,
      overallStatus: 'PASS',
      points: [
        { id: 'ecc-1', label: 'Center (Pos 1)', load: 40.0, observedValue: 40.0000, deviation: 0.0, mpeLimit: 0.0005, status: 'PASS', positionNumber: 1, name: 'Center', position: 'CENTER', indication: 40.0, error: 0.0, mpe: 0.0005 },
        { id: 'ecc-2', label: 'North Position', load: 40.0, observedValue: 40.0002, deviation: 0.0002, mpeLimit: 0.0005, status: 'PASS', positionNumber: 2, name: 'North', position: 'FRONT_LEFT', indication: 40.0002, error: 0.0002, mpe: 0.0005 },
        { id: 'ecc-3', label: 'South Position', load: 40.0, observedValue: 40.0001, deviation: 0.0001, mpeLimit: 0.0005, status: 'PASS', positionNumber: 3, name: 'South', position: 'REAR_RIGHT', indication: 40.0001, error: 0.0001, mpe: 0.0005 },
      ],
      testLoad: 40.0,
      centerReading: 40.0,
      locations: [],
      maxSpread: 0.0002,
      status: 'PASS',
    },

    repeatability: {
      targetLoad: 50.0,
      observedSpread: 0.0001,
      allowableLimit: 0.0005,
      status: 'PASS',
      completed: true,
      readings: [
        { runIndex: 1, load: 50.0, reading: 50.0001, zeroReturn: 0.0, timestamp: '09:30:00', runNumber: 1, indication: 50.0001 },
        { runIndex: 2, load: 50.0, reading: 50.0002, zeroReturn: 0.0, timestamp: '09:32:00', runNumber: 2, indication: 50.0002 },
        { runIndex: 3, load: 50.0, reading: 50.0001, zeroReturn: 0.0, timestamp: '09:34:00', runNumber: 3, indication: 50.0001 },
      ],
      testLoad: 50.0,
      runs: [],
      maxDifference: 0.0001,
      mpe: 0.0005,
    },

    environment: {
      baseline: { temperature: 20.1, humidity: 45, pressure: 1014.5 },
      tare: { tareType: 'SUBTRACTIVE', tareValue: 10.0, scaleIndication: 10.0000, error: 0.0, status: 'PASS' },
      temperatureDrift: { tempStart: 20.1, tempEnd: 20.3, driftPpmPerK: 0.4, mpeLimit: 1.0, status: 'PASS' },
      chamber: { temperatureC: 20.2, relativeHumidityPercent: 45, pressureHpa: 1014.5, dewPointC: 7.9, lastUpdated: '09:40:00' },
      status: 'PASS',
      completed: true,
      tareSubtractive: true,
      zeroTareAccuracy: 0.0001,
    },

    reviewer: {
      reviewerId: 'usr-rev-01',
      reviewerName: 'R. Singh',
      recommendation: 'APPROVE',
      comments: [
        { id: 'c-1', testKey: 'WEIGHING', rowIndex: 4, comment: 'High-interval analytical precision verified with zero roundoff error.', author: 'R. Singh', timestamp: '2026-10-04T10:00:00Z', resolved: true },
      ],
      reviewedAt: '2026-10-04T10:00:00Z',
      verdict: 'APPROVED',
    },

    directorSignature: {
      directorId: 'usr-dir-01',
      directorName: 'Dr. A. Kumar',
      signedAt: '2026-10-04T10:30:00Z',
      digest: '0xe3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      declarationAccepted: true,
      sealApplied: true,
      certificateId: 'CERT-2026-IND-00185',
      signedBy: 'Dr. A. Kumar',
      role: 'Director of Legal Metrology',
      digitalCertificateId: 'CERT-2026-IND-00185',
      qrCodePayload: 'https://verify.legalmetrology.gov.in/cert/CERT-2026-IND-00185?sha256=e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      cryptographicHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      formType: 'FORM_VI_VERIFICATION_CERTIFICATE',
    },

    traceability: {
      standardSetId: 'set-e2-2025-001',
      calibrationValid: true,
      calibrationDate: '2025-04-15',
      expiryDate: '2027-04-15',
      daysRemaining: 192,
    },

    createdAt: '2026-10-04T08:00:00Z',
    updatedAt: '2026-10-04T10:30:00Z',

    activeStep: 7,
    operatorName: 'Shashi Shekhar',
    laboratory: 'RRSL Bengaluru',
    serialNumber: 'MT-2026-0049',
    model: 'XPR Analytical Micro-Balance',
    manufacturer: 'Mettler-Toledo',
    accuracyClass: 'CLASS_I',
    maxCapacity: '120 g',
    interval: 'e = 1 mg',
    currentProcedure: 'Statutory Sign-off',
    completedSteps: 7,
    totalSteps: 7,
    progressPercent: 100,
    status: 'APPROVED',
  };
}
