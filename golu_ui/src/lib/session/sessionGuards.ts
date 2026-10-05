import { VerificationSession } from '../../types/session';

export class SessionImmutableError extends Error {
  constructor(message: string = 'This verification record is approved and is permanently read-only.') {
    super(message);
    this.name = 'SessionImmutableError';
  }
}

export class SessionLockoutError extends Error {
  constructor(message: string = 'Verification testing is locked out due to expired reference standard weights.') {
    super(message);
    this.name = 'SessionLockoutError';
  }
}

/**
 * Asserts that the session is in an editable state (§35).
 * Throws SessionImmutableError if session is APPROVED or marked immutable.
 */
export function assertSessionEditable(session: VerificationSession): void {
  if (session.isImmutable || session.reviewStatus === 'APPROVED') {
    throw new SessionImmutableError(
      'This verification record is approved and is permanently read-only.'
    );
  }
}

/**
 * Asserts that standards traceability is valid and not locked out.
 */
export function assertTraceabilityValid(session: VerificationSession): void {
  if (session.traceability && !session.traceability.calibrationValid) {
    throw new SessionLockoutError(
      session.traceability.lockoutReason || 'Traceability standard weights are expired or invalid.'
    );
  }
}
