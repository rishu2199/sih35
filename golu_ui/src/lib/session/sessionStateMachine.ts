import { ReviewStatus } from '../../types/instrument';
import { VerificationSession } from '../../types/session';
import { assertSessionEditable } from './sessionGuards';
import { emitAuditEvent } from '../audit/auditEvents';

export type SessionLifecycleAction =
  | 'START_TESTING'
  | 'SUBMIT_FOR_REVIEW'
  | 'APPROVE'
  | 'REMAND'
  | 'RESUME_TESTING';

export const ALLOWED_TRANSITIONS: Record<ReviewStatus, SessionLifecycleAction[]> = {
  DRAFT: ['START_TESTING'],
  IN_TESTING: ['SUBMIT_FOR_REVIEW'],
  PENDING_REVIEW: ['APPROVE', 'REMAND'],
  REMANDED: ['RESUME_TESTING'],
  APPROVED: [],
};

export class InvalidStateTransitionError extends Error {
  constructor(status: ReviewStatus, action: SessionLifecycleAction) {
    super(`Cannot execute action '${action}' when session is in '${status}' state.`);
    this.name = 'InvalidStateTransitionError';
  }
}

export interface TransitionParams {
  session: VerificationSession;
  action: SessionLifecycleAction;
  actorId?: string;
  actorName?: string;
  notes?: string;
}

/**
 * Central state machine transition dispatcher (§5, §6)
 */
export function transitionSession(params: TransitionParams): VerificationSession {
  const { session, action, actorId, actorName, notes } = params;

  // 1. Guard check for approved/immutable sessions
  assertSessionEditable(session);

  // 2. Validate transition allowed from current reviewStatus
  const currentStatus: ReviewStatus = session.reviewStatus || 'DRAFT';
  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];

  if (!allowed.includes(action)) {
    throw new InvalidStateTransitionError(currentStatus, action);
  }

  // 3. Clone and compute next state
  const updated: VerificationSession = JSON.parse(JSON.stringify(session));
  updated.updatedAt = new Date().toISOString();

  switch (action) {
    case 'START_TESTING':
      updated.reviewStatus = 'IN_TESTING';
      updated.activeStep = 2; // Move to testing
      break;

    case 'SUBMIT_FOR_REVIEW':
      updated.reviewStatus = 'PENDING_REVIEW';
      updated.activeStep = 7; // Review step
      break;

    case 'APPROVE':
      updated.reviewStatus = 'APPROVED';
      updated.complianceStatus = 'PASS';
      updated.isImmutable = true;
      break;

    case 'REMAND':
      updated.reviewStatus = 'REMANDED';
      break;

    case 'RESUME_TESTING':
      updated.reviewStatus = 'IN_TESTING';
      break;
  }

  // 4. Automatically emit audit event (§45)
  emitAuditEvent({
    actorId,
    actorName,
    action: `TRANSITION_${action}`,
    sessionId: session.id,
    metadata: {
      fromStatus: currentStatus,
      toStatus: updated.reviewStatus,
      notes,
    },
  });

  return updated;
}
