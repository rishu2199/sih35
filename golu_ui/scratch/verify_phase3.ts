import { CANONICAL_INSTRUMENTS } from '../src/data/instruments';
import { ALL_SYNTHETIC_SCENARIOS } from '../src/data/scenarios';
import { loadScenario } from '../src/lib/session/scenarioEngine';
import { ALL_LABORATORIES, LAB_RRSL_BENGALURU } from '../src/data/laboratories';
import { CANONICAL_USERS } from '../src/data/users';
import { CANONICAL_STANDARDS } from '../src/data/standards';
import {
  calculateTurningPoint,
  calculateError,
  calculateCorrectedError,
  calculateMpeLimit,
  calculateObservation,
  calculateSpread,
} from '../src/lib/metrology';
import {
  transitionSession,
  ALLOWED_TRANSITIONS,
  InvalidStateTransitionError,
} from '../src/lib/session/sessionStateMachine';
import {
  assertSessionEditable,
  SessionImmutableError,
} from '../src/lib/session/sessionGuards';
import {
  startTesting,
  completeReadiness,
  updateObservation,
  submitForReview,
  addReviewComment,
  remandSession,
  approveReview,
  signCertificate,
} from '../src/lib/session/sessionActions';
import {
  getCurrentStep,
  getOverallProgress,
  getSessionVerdict,
  getBlockingIssues,
  getNextBestAction,
  getTraceabilityStatus,
  getCompletedStepCount,
  getApplicableProcedureCount,
} from '../src/lib/session/sessionSelectors';
import { getAuditTrail, clearAuditTrail } from '../src/lib/audit/auditEvents';
import {
  instrumentRepository,
  sessionRepository,
  standardsRepository,
  userRepository,
} from '../src/repositories';

function assert(condition: boolean, msg: string) {
  if (!condition) {
    console.error(`❌ FAILED: ${msg}`);
    process.exit(1);
  }
  console.log(`✓ PASSED: ${msg}`);
}

async function runVerification() {
  console.log('====================================================');
  console.log('METROLOGIX-76 PHASE 3 DOMAIN ARCHITECTURE TEST SUITE');
  console.log('====================================================\n');

  clearAuditTrail();

  // Test 1: Canonical Instruments (§19)
  console.log('--- 1. Canonical Instruments (§19) ---');
  assert(CANONICAL_INSTRUMENTS.length === 4, 'Four canonical instruments exist');
  const avery = CANONICAL_INSTRUMENTS.find((i) => i.manufacturer.includes('Avery'));
  const mettler = CANONICAL_INSTRUMENTS.find((i) => i.manufacturer.includes('Mettler'));
  const sansui = CANONICAL_INSTRUMENTS.find((i) => i.manufacturer.includes('Sansui'));
  const essae = CANONICAL_INSTRUMENTS.find((i) => i.manufacturer.includes('Essae'));
  assert(!!avery && avery.accuracyClass === 'CLASS_III' && avery.maxCapacity === 30, 'Avery Class III 30kg configured');
  assert(!!mettler && mettler.accuracyClass === 'CLASS_I' && mettler.n === 120000, 'Mettler Class I n=120,000 configured');
  assert(!!sansui && sansui.accuracyClass === 'CLASS_II' && sansui.e === 0.1, 'Sansui Class II e=0.1g configured');
  assert(!!essae && essae.accuracyClass === 'CLASS_IIII' && essae.maxCapacity === 150, 'Essae Class IIII 150kg configured');

  // Test 2: Canonical Scenarios (§20, §21)
  console.log('\n--- 2. Canonical Synthetic Scenarios (§20, §21) ---');
  const scenarios = Object.keys(ALL_SYNTHETIC_SCENARIOS);
  assert(scenarios.length === 5, 'Five scenarios configured');
  assert(scenarios.includes('standard_class_iii_retail'), 'standard_class_iii_retail present');
  assert(scenarios.includes('rounding_discrepancy_trap'), 'rounding_discrepancy_trap present');
  assert(scenarios.includes('temperature_span_drift_fail'), 'temperature_span_drift_fail present');
  assert(scenarios.includes('eccentricity_cantilever_twist'), 'eccentricity_cantilever_twist present');
  assert(scenarios.includes('high_interval_class_i_analytical'), 'high_interval_class_i_analytical present');

  // Test 3: The Rounding Discrepancy Trap Verification (§23)
  console.log('\n--- 3. Flagship Rounding Trap Metrological Proof (§23) ---');
  const trapScenario = ALL_SYNTHETIC_SCENARIOS['rounding_discrepancy_trap'];
  const trapSession = trapScenario.session;
  const trapRow = trapSession.weighing.ascending[4]; // step 5 at 10.0 kg
  assert(trapRow.nominalLoad === 10.0, 'Trap nominal load is 10.0 kg (2,000e)');
  // Legacy spreadsheet: I - L = 10.0 - 10.0 = 0.0 => FALSE PASS
  const legacySpreadsheetError = trapRow.scaleReading - trapRow.nominalLoad;
  assert(legacySpreadsheetError === 0.0, 'Legacy spreadsheet error is exactly 0.0 (False PASS)');
  // Turning-point calculation:
  // P = 10.0 + 0.5 * 0.005 - 0.0078 = 9.9947 kg
  const expectedP = calculateTurningPoint(10.0, 0.0078, 0.005);
  assert(expectedP === 9.9947, 'Statutory turning point P is 9.9947 kg');
  const calculatedErr = calculateError(expectedP, 10.0);
  assert(calculatedErr === -0.0053, 'True error E is -0.0053 kg (-5.3 g)');
  const mpe = calculateMpeLimit(10.0, 0.005, 'CLASS_III');
  assert(mpe === 0.005, 'MPE at 2,000e for Class III is ±0.005 kg (±5.0 g)');
  assert(Math.abs(calculatedErr) > mpe, '| -5.3 g | > 5.0 g -> Statutory Tolerance Violation detected!');
  assert(trapRow.status === 'FAIL', 'Trap row status is FAIL');
  assert(trapSession.complianceStatus === 'FAIL', 'Session compliance status correctly marked FAIL');

  // Test 4: Scenario 3 Temperature Drift (§24)
  console.log('\n--- 4. Temperature Span Drift Failure (§24) ---');
  const tempSession = ALL_SYNTHETIC_SCENARIOS['temperature_span_drift_fail'].session;
  assert(tempSession.complianceStatus === 'FAIL', 'Temperature drift session is marked FAIL');
  assert(tempSession.environment.temperatureDrift.driftPpmPerK === 14.2, 'Thermal drift coefficient 14.2 ppm/K');
  assert(tempSession.environment.temperatureDrift.mpeLimit === 5.0, 'Max allowable drift is 5.0 ppm/K');

  // Test 5: Scenario 4 Eccentricity Cantilever Deflection (§25)
  console.log('\n--- 5. Eccentricity Cantilever Twist (§25) ---');
  const eccSession = ALL_SYNTHETIC_SCENARIOS['eccentricity_cantilever_twist'].session;
  assert(eccSession.complianceStatus === 'FAIL', 'Eccentricity session is marked FAIL');
  const corner4 = eccSession.eccentricity.points[4];
  assert(corner4.positionNumber === 5 && corner4.status === 'FAIL', 'Corner 4 (Front-Right) is marked FAIL');
  assert(corner4.deviation === -0.0062, 'Corner 4 deflection error is -6.2 g exceeding ±5.0 g limit');

  // Test 6: Scenario 5 High-Interval Class I Analytical (§26)
  console.log('\n--- 6. High-Interval Class I Analytical Balance (§26) ---');
  const classISession = ALL_SYNTHETIC_SCENARIOS['high_interval_class_i_analytical'].session;
  assert(classISession.reviewStatus === 'APPROVED', 'Class I session is APPROVED');
  assert(classISession.isImmutable === true, 'Class I session is permanently IMMUTABLE');
  assert(!!classISession.directorSignature?.certificateId, 'Director signature and certificate ID present');
  assert(classISession.directorSignature.declarationAccepted === true, 'Statutory declaration accepted');

  // Test 7: Central State Machine & Lifecycle (§5, §6)
  console.log('\n--- 7. Session Lifecycle State Machine (§5, §6) ---');
  let testSession = loadScenario('standard_class_iii_retail');
  testSession.reviewStatus = 'DRAFT';
  testSession.isImmutable = false;

  testSession = transitionSession({ session: testSession, action: 'START_TESTING' });
  assert(testSession.reviewStatus === 'IN_TESTING', 'Transitioned DRAFT -> IN_TESTING');

  testSession = transitionSession({ session: testSession, action: 'SUBMIT_FOR_REVIEW' });
  assert(testSession.reviewStatus === 'PENDING_REVIEW', 'Transitioned IN_TESTING -> PENDING_REVIEW');

  // Remand path
  testSession = transitionSession({ session: testSession, action: 'REMAND', notes: 'Re-test Corner 2' });
  assert(testSession.reviewStatus === 'REMANDED', 'Transitioned PENDING_REVIEW -> REMANDED');

  testSession = transitionSession({ session: testSession, action: 'RESUME_TESTING' });
  assert(testSession.reviewStatus === 'IN_TESTING', 'Transitioned REMANDED -> IN_TESTING');

  testSession = transitionSession({ session: testSession, action: 'SUBMIT_FOR_REVIEW' });
  assert(testSession.reviewStatus === 'PENDING_REVIEW', 'Re-submitted -> PENDING_REVIEW');

  testSession = transitionSession({ session: testSession, action: 'APPROVE' });
  assert(testSession.reviewStatus === 'APPROVED', 'Transitioned PENDING_REVIEW -> APPROVED');
  assert(testSession.isImmutable === true, 'Session becomes permanently immutable upon approval');

  // Invalid transition check: Attempting to submit from APPROVED
  let threwTransitionError = false;
  try {
    transitionSession({ session: testSession, action: 'SUBMIT_FOR_REVIEW' });
  } catch (e: any) {
    threwTransitionError = true;
  }
  assert(threwTransitionError, 'State machine blocked invalid transition from APPROVED');

  // Test 8: Immutability Guard Enforcement (§35)
  console.log('\n--- 8. Immutability Guard Assertion (§35) ---');
  let threwImmutabilityError = false;
  try {
    assertSessionEditable(testSession);
  } catch (e: any) {
    threwImmutabilityError = e instanceof SessionImmutableError;
  }
  assert(threwImmutabilityError, 'assertSessionEditable threw SessionImmutableError for approved session');

  // Attempting observation edit on approved session
  let threwActionError = false;
  try {
    updateObservation(testSession, 1, { scaleReading: 9.999 });
  } catch (e: any) {
    threwActionError = e instanceof SessionImmutableError;
  }
  assert(threwActionError, 'updateObservation blocked on immutable session at the domain state layer');

  // Test 9: Complete Happy Path & Audit Events Ledger (§45, §46, §49)
  console.log('\n--- 9. Complete Happy Path & Tamper-Evident Audit Trail (§45, §49) ---');
  clearAuditTrail();
  let liveSession = loadScenario('standard_class_iii_retail');
  liveSession.reviewStatus = 'IN_TESTING';
  liveSession.isImmutable = false;

  // 1. Edit reading
  liveSession = updateObservation(liveSession, 1, { scaleReading: 0.100, auxiliaryDeltaL: 0.0025 });
  // 2. Submit for review
  liveSession = submitForReview(liveSession, 'Ready for final sign-off');
  // 3. Add reviewer comment
  liveSession = addReviewComment(liveSession, {
    testKey: 'WEIGHING',
    comment: 'Observations cross-verified against working standards.',
    author: 'R. Singh',
  });
  // 4. Approve review
  liveSession = approveReview(liveSession);
  // 5. Director sign
  liveSession = signCertificate(liveSession, {
    directorName: 'Dr. A. Kumar',
    certificateId: 'CERT-2026-IND-TEST-001',
    digest: '0x9999888877776666555544443333222211110000',
  });

  assert(liveSession.reviewStatus === 'APPROVED', 'Final state is APPROVED');
  assert(liveSession.isImmutable === true, 'Final state is permanently IMMUTABLE');

  const trail = getAuditTrail();
  console.log(`Generated ${trail.length} tamper-evident audit ledger entries`);
  assert(trail.length >= 5, 'At least 5 audit events recorded for lifecycle flow');
  assert(trail[trail.length - 1].action === 'SIGN_CERTIFICATE', 'Latest audit event is SIGN_CERTIFICATE');
  assert(!!trail[trail.length - 1].hash, 'Audit event contains cryptographic hash');

  // Test 10: Selectors & Intelligence (§29, §30, §31)
  console.log('\n--- 10. Domain Selectors (§29, §30, §31) ---');
  const verdict = getSessionVerdict(liveSession);
  assert(verdict === 'APPROVED', 'getSessionVerdict returned APPROVED');
  const nextAction = getNextBestAction(liveSession);
  assert(nextAction.actionText === 'Open Certificate', 'Next best action is Open Certificate');
  const progress = getOverallProgress(liveSession);
  assert(progress === 100, 'Overall progress is 100%');

  // Test 11: Repositories (§36)
  console.log('\n--- 11. Mock Repositories (§36) ---');
  const repoInstruments = await instrumentRepository.list();
  assert(repoInstruments.length === 4, 'InstrumentRepository returns 4 instruments');
  const activeStd = await standardsRepository.getActiveSet();
  assert(!!activeStd && activeStd.status === 'VALID', 'StandardsRepository returns valid standard set');
  const user = await userRepository.getByRole('DIRECTOR');
  assert(user?.fullName === 'Dr. A. Kumar', 'UserRepository returns Dr. A. Kumar for DIRECTOR');

  console.log('\n====================================================');
  console.log('🎉 ALL 11 PHASE 3 ARCHITECTURE SUITE TESTS PASSED!');
  console.log('====================================================');
}

runVerification().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});
