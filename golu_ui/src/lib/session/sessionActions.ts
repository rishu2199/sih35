import { VerificationSession } from '../../types/session';
import { ObservationRow } from '../../types/observation';
import { RowAuditComment, SignatureRecord } from '../../types/review';
import { assertSessionEditable, assertTraceabilityValid } from './sessionGuards';
import { transitionSession } from './sessionStateMachine';
import { emitAuditEvent } from '../audit/auditEvents';
import { calculateObservation } from '../metrology/calculateCompliance';

export interface ObservationPatch {
  stepIndex?: number;
  scaleReading?: number;
  auxiliaryDeltaL?: number;
  hasComment?: boolean;
}

/**
 * Action 1: startTesting (§8)
 */
export function startTesting(
  session: VerificationSession,
  actor?: { id: string; name: string }
): VerificationSession {
  assertSessionEditable(session);
  assertTraceabilityValid(session);

  const updated = transitionSession({
    session,
    action: 'START_TESTING',
    actorId: actor?.id,
    actorName: actor?.name,
  });

  return updated;
}

/**
 * Action 2: completeReadiness (§8)
 */
export function completeReadiness(
  session: VerificationSession,
  actor?: { id: string; name: string }
): VerificationSession {
  assertSessionEditable(session);
  assertTraceabilityValid(session);

  const clone: VerificationSession = JSON.parse(JSON.stringify(session));
  clone.readiness.overallStatus = 'READY';
  clone.readiness.score = 100;
  clone.readiness.blockingIssues = [];
  clone.readiness.checkedAt = new Date().toISOString();
  if (clone.readiness.isReady !== undefined) clone.readiness.isReady = true;
  clone.updatedAt = new Date().toISOString();

  emitAuditEvent({
    actorId: actor?.id,
    actorName: actor?.name,
    action: 'COMPLETE_READINESS',
    sessionId: session.id,
    metadata: { score: 100, status: 'READY' },
  });

  return clone;
}

/**
 * Action 3: updateObservation (§8)
 * Updates a single observation row with deterministic metrology re-calculation.
 */
export function updateObservation(
  session: VerificationSession,
  rowIdOrIndex: string | number,
  patch: ObservationPatch,
  actor?: { id: string; name: string }
): VerificationSession {
  assertSessionEditable(session);
  assertTraceabilityValid(session);

  const clone: VerificationSession = JSON.parse(JSON.stringify(session));
  const instObj = typeof clone.instrument === 'object' ? clone.instrument : null;
  const e = instObj?.e || 0.005;
  const accuracyClass = instObj?.accuracyClass || 'CLASS_III';
  const stage = clone.verificationStage;

  let targetRow: ObservationRow | undefined;
  let isAscending = true;

  // Search ascending
  let idx = clone.weighing.ascending.findIndex(
    (r) => r.id === rowIdOrIndex || r.stepIndex === rowIdOrIndex || r.stepNumber === rowIdOrIndex
  );
  if (idx >= 0) {
    targetRow = clone.weighing.ascending[idx];
  } else {
    // Search descending
    idx = clone.weighing.descending.findIndex(
      (r) => r.id === rowIdOrIndex || r.stepIndex === rowIdOrIndex || r.stepNumber === rowIdOrIndex
    );
    if (idx >= 0) {
      targetRow = clone.weighing.descending[idx];
      isAscending = false;
    }
  }

  if (!targetRow) {
    console.warn(`Observation row ${rowIdOrIndex} not found`);
    return session;
  }

  const nominalLoad = targetRow.nominalLoad;
  const scaleReading = patch.scaleReading !== undefined ? patch.scaleReading : targetRow.scaleReading;
  const deltaL = patch.auxiliaryDeltaL !== undefined ? patch.auxiliaryDeltaL : (targetRow.auxiliaryDeltaL || 0);

  const calc = calculateObservation({
    nominalLoad,
    scaleReading,
    e,
    deltaL,
    accuracyClass,
    verificationStage: stage,
  });

  targetRow.scaleReading = scaleReading;
  targetRow.auxiliaryDeltaL = deltaL;
  targetRow.turningPointP = calc.turningPointP;
  targetRow.errorE = calc.errorE;
  targetRow.correctedErrorEc = calc.correctedErrorEc;
  targetRow.mpeLimit = calc.mpeLimit;
  targetRow.status = calc.status;
  if (patch.hasComment !== undefined) targetRow.hasComment = patch.hasComment;

  // Sync compatibility fields
  targetRow.indicationI = scaleReading;
  targetRow.turningPointDeltaL = deltaL;
  targetRow.calculatedP = calc.turningPointP;
  targetRow.mpe = calc.mpeLimit;

  // Recompute overall weighing test status
  const allRows = [...clone.weighing.ascending, ...clone.weighing.descending];
  const hasFail = allRows.some((r) => r.status === 'FAIL');
  const maxErr = Math.max(...allRows.map((r) => Math.abs(r.errorE)));

  clone.weighing.overallStatus = hasFail ? 'FAIL' : 'PASS';
  clone.weighing.maxObservedError = maxErr;
  clone.weighing.status = clone.weighing.overallStatus;
  clone.weighing.maxError = maxErr;
  clone.weighing.observations = allRows;

  if (hasFail) {
    clone.complianceStatus = 'FAIL';
  }

  clone.updatedAt = new Date().toISOString();

  emitAuditEvent({
    actorId: actor?.id,
    actorName: actor?.name,
    action: 'UPDATE_OBSERVATION',
    sessionId: session.id,
    metadata: {
      rowId: rowIdOrIndex,
      nominalLoad,
      scaleReading,
      errorE: calc.errorE,
      status: calc.status,
    },
  });

  return clone;
}

/**
 * Action 4: completeTest (§8)
 */
export function completeTest(
  session: VerificationSession,
  testKey: 'PHYSICAL' | 'WEIGHING' | 'ECCENTRICITY' | 'REPEATABILITY' | 'ENVIRONMENT',
  actor?: { id: string; name: string }
): VerificationSession {
  assertSessionEditable(session);

  const clone: VerificationSession = JSON.parse(JSON.stringify(session));
  const proc = clone.testPlan.procedures.find((p) => p.key === testKey);
  if (proc) {
    proc.status = 'PASS';
  }

  clone.updatedAt = new Date().toISOString();

  emitAuditEvent({
    actorId: actor?.id,
    actorName: actor?.name,
    action: `COMPLETE_TEST_${testKey}`,
    sessionId: session.id,
  });

  return clone;
}

/**
 * Action 5: submitForReview (§8)
 */
export function submitForReview(
  session: VerificationSession,
  notes?: string,
  actor?: { id: string; name: string }
): VerificationSession {
  assertSessionEditable(session);

  const updated = transitionSession({
    session,
    action: 'SUBMIT_FOR_REVIEW',
    actorId: actor?.id,
    actorName: actor?.name,
    notes,
  });

  if (notes) {
    updated.notes = notes;
  }

  return updated;
}

/**
 * Action 6: addReviewComment (§8)
 */
export function addReviewComment(
  session: VerificationSession,
  comment: Omit<RowAuditComment, 'id' | 'timestamp'>,
  actor?: { id: string; name: string }
): VerificationSession {
  const clone: VerificationSession = JSON.parse(JSON.stringify(session));
  if (!clone.reviewer) {
    clone.reviewer = {
      reviewerId: actor?.id || 'usr-rev-01',
      reviewerName: actor?.name || 'R. Singh',
      recommendation: 'APPROVE',
      comments: [],
    };
  }

  const fullComment: RowAuditComment = {
    ...comment,
    id: `com-${Date.now()}`,
    timestamp: new Date().toISOString(),
  };

  clone.reviewer.comments.push(fullComment);
  clone.updatedAt = new Date().toISOString();

  emitAuditEvent({
    actorId: actor?.id,
    actorName: actor?.name,
    action: 'ADD_REVIEW_COMMENT',
    sessionId: session.id,
    metadata: { testKey: comment.testKey, comment: comment.comment },
  });

  return clone;
}

/**
 * Action 7: remandSession (§8)
 */
export function remandSession(
  session: VerificationSession,
  reason: string,
  actor?: { id: string; name: string }
): VerificationSession {
  assertSessionEditable(session);

  const updated = transitionSession({
    session,
    action: 'REMAND',
    actorId: actor?.id,
    actorName: actor?.name,
    notes: reason,
  });

  if (!updated.reviewer) {
    updated.reviewer = {
      reviewerId: actor?.id || 'usr-rev-01',
      reviewerName: actor?.name || 'R. Singh',
      recommendation: 'REMAND',
      comments: [],
    };
  }
  updated.reviewer.recommendation = 'REMAND';
  updated.reviewer.remandReason = reason;
  updated.reviewer.reviewedAt = new Date().toISOString();
  updated.reviewer.verdict = 'REMANDED';

  return updated;
}

/**
 * Action 8: approveReview (§8)
 */
export function approveReview(
  session: VerificationSession,
  actor?: { id: string; name: string }
): VerificationSession {
  assertSessionEditable(session);

  const clone: VerificationSession = JSON.parse(JSON.stringify(session));
  if (!clone.reviewer) {
    clone.reviewer = {
      reviewerId: actor?.id || 'usr-rev-01',
      reviewerName: actor?.name || 'R. Singh',
      recommendation: 'APPROVE',
      comments: [],
    };
  }
  clone.reviewer.recommendation = 'APPROVE';
  clone.reviewer.reviewedAt = new Date().toISOString();
  clone.reviewer.verdict = 'APPROVED';

  emitAuditEvent({
    actorId: actor?.id,
    actorName: actor?.name,
    action: 'APPROVE_REVIEW',
    sessionId: session.id,
  });

  return clone;
}

/**
 * Action 9: signCertificate (§8, §34, §35)
 * Moves session into APPROVED and permanently IMMUTABLE state.
 */
export function signCertificate(
  session: VerificationSession,
  signature: Partial<SignatureRecord>,
  actor?: { id: string; name: string }
): VerificationSession {
  assertSessionEditable(session);

  const clone: VerificationSession = JSON.parse(JSON.stringify(session));
  const timestamp = new Date().toISOString();
  const certId = signature.certificateId || `CERT-2026-IND-${Math.floor(100000 + Math.random() * 900000)}`;
  const digest = signature.digest || '0xa8f3b49c0d12e345f67890abcdef1234567890abcdef1234567890abcdef1234';

  clone.directorSignature = {
    directorId: signature.directorId || actor?.id || 'usr-dir-01',
    directorName: signature.directorName || actor?.name || 'Dr. A. Kumar',
    signedAt: timestamp,
    digest,
    declarationAccepted: signature.declarationAccepted ?? true,
    sealApplied: signature.sealApplied ?? true,
    certificateId: certId,
    signedBy: signature.directorName || actor?.name || 'Dr. A. Kumar',
    role: 'Director of Legal Metrology',
    digitalCertificateId: certId,
    qrCodePayload: `https://verify.legalmetrology.gov.in/cert/${certId}?sha256=${digest}`,
    cryptographicHash: digest,
    formType: 'FORM_VI_VERIFICATION_CERTIFICATE',
  };

  // Move to APPROVED and lock immutably
  clone.reviewStatus = 'APPROVED';
  clone.complianceStatus = 'PASS';
  clone.isImmutable = true;
  clone.updatedAt = timestamp;
  clone.status = 'APPROVED';

  emitAuditEvent({
    actorId: actor?.id || clone.directorSignature.directorId,
    actorName: actor?.name || clone.directorSignature.directorName,
    actorRole: 'DIRECTOR',
    action: 'SIGN_CERTIFICATE',
    sessionId: session.id,
    metadata: {
      certificateId: certId,
      digest,
      isImmutable: true,
    },
  });

  return clone;
}

/**
 * Action 10: lockApprovedSession (§8, §35)
 */
export function lockApprovedSession(session: VerificationSession): VerificationSession {
  const clone: VerificationSession = JSON.parse(JSON.stringify(session));
  clone.isImmutable = true;
  clone.reviewStatus = 'APPROVED';
  clone.updatedAt = new Date().toISOString();
  return clone;
}
