import { VerificationSession } from '../../types/session';
import { ComplianceStatus, ReviewStatus } from '../../types/instrument';

export interface NextActionInfo {
  stepNumber: number;
  stepName: string;
  targetTab: string;
  headline: string;
  subtext: string;
  actionText: string;
  isCompleted: boolean;
}

export interface SessionProgressInfo {
  completedStepsCount: number;
  totalStepsCount: number;
  progressPercent: number;
  currentStepIndex: number;
  overallCompliance: ComplianceStatus;
}

export interface SessionVerdictSummary {
  verdict: 'PASS' | 'FAIL' | 'PENDING' | 'APPROVED';
  humanAnswer: string;
  evidence: string;
  technicalProof: string;
}

/**
 * Computes completed step count (§29, §30)
 */
export function getCompletedStepCount(session: VerificationSession | null | undefined): number {
  if (!session) return 0;
  let completed = 0;

  if (session.readiness.overallStatus === 'READY' || session.readiness.isReady) completed++;
  if (session.physicalInspection.status === 'PASS') completed++;
  if (
    session.weighing.completed ||
    (session.weighing.ascending.length > 0 && session.weighing.overallStatus !== 'PENDING') ||
    (session.weighing.observations && session.weighing.observations.length > 0 && session.weighing.status !== 'PENDING')
  ) {
    completed++;
  }
  if (
    session.eccentricity.completed ||
    (session.eccentricity.points.length > 0 && session.eccentricity.overallStatus !== 'PENDING') ||
    (session.eccentricity.locations && session.eccentricity.locations.length > 0 && session.eccentricity.status !== 'PENDING')
  ) {
    completed++;
  }
  if (
    session.repeatability.completed ||
    (session.repeatability.readings.length > 0 && session.repeatability.status !== 'PENDING') ||
    (session.repeatability.runs && session.repeatability.runs.length > 0 && session.repeatability.status !== 'PENDING')
  ) {
    completed++;
  }
  if (session.environment.completed || session.environment.status === 'PASS' || session.environment.status === 'FAIL') {
    completed++;
  }
  if (session.reviewStatus === 'APPROVED' || session.reviewStatus === 'PENDING_REVIEW') {
    completed++;
  }

  return completed;
}

/**
 * Computes applicable procedure count from test plan (§29)
 */
export function getApplicableProcedureCount(session: VerificationSession | null | undefined): number {
  if (!session || !session.testPlan || !session.testPlan.procedures) return 5;
  return session.testPlan.procedures.filter((p) => p.applicable).length;
}

/**
 * Gets overall session progress ratio and percent (§29, §30)
 */
export function getOverallProgress(session: VerificationSession | null | undefined): number {
  const completed = getCompletedStepCount(session);
  const total = 7;
  return Math.min(100, Math.round((completed / total) * 100));
}

export function getSessionProgress(session: VerificationSession | null | undefined): SessionProgressInfo {
  if (!session) {
    return {
      completedStepsCount: 0,
      totalStepsCount: 7,
      progressPercent: 0,
      currentStepIndex: 1,
      overallCompliance: 'PENDING',
    };
  }

  const completed = getCompletedStepCount(session);
  const total = 7;
  const percent = Math.min(100, Math.round((completed / total) * 100));

  return {
    completedStepsCount: completed,
    totalStepsCount: total,
    progressPercent: percent,
    currentStepIndex: Math.min(7, Math.max(1, session.activeStep || completed + 1)),
    overallCompliance: session.complianceStatus,
  };
}

/**
 * Gets current step descriptor (§29)
 */
export function getCurrentStep(session: VerificationSession | null | undefined): string {
  if (!session) return 'No Active Session';
  if (session.reviewStatus === 'APPROVED') return 'Approved & Certified';
  if (session.reviewStatus === 'PENDING_REVIEW') return 'Supervisory Review';
  if (session.reviewStatus === 'REMANDED') return 'Remanded for Correction';

  if (!session.readiness.isReady && session.readiness.overallStatus !== 'READY') return 'Test Readiness Gate';
  if (session.physicalInspection.status !== 'PASS') return 'Physical & Visual Inspection';
  if (!session.weighing.completed && session.weighing.overallStatus === 'PENDING') return 'Weighing Linearity Test';
  if (!session.eccentricity.completed && session.eccentricity.overallStatus === 'PENDING') return 'Eccentricity (Corner Load)';
  if (!session.repeatability.completed && (session.repeatability.status === 'PENDING' || session.repeatability.overallStatus === 'PENDING')) return 'Repeatability Sequence';
  if (!session.environment.completed && session.environment.status === 'PENDING') return 'Environmental / Tare Drift';

  return 'Ready for Supervisory Review';
}

/**
 * Gets review status (§29)
 */
export function getReviewStatus(session: VerificationSession | null | undefined): ReviewStatus {
  return session ? session.reviewStatus : 'DRAFT';
}

/**
 * Gets traceability status (§16, §29)
 */
export function getTraceabilityStatus(session: VerificationSession | null | undefined): 'VALID' | 'EXPIRING_SOON' | 'EXPIRED' | 'LOCKED' {
  if (!session || !session.traceability) return 'VALID';
  if (!session.traceability.calibrationValid) return 'LOCKED';
  if (session.traceability.daysRemaining <= 0) return 'EXPIRED';
  if (session.traceability.daysRemaining <= 30) return 'EXPIRING_SOON';
  return 'VALID';
}

/**
 * Gets blocking issues that halt testing (§9, §29)
 */
export function getBlockingIssues(session: VerificationSession | null | undefined): string[] {
  if (!session) return ['No active session selected.'];
  const issues: string[] = [];

  if (session.traceability && !session.traceability.calibrationValid) {
    issues.push(session.traceability.lockoutReason || 'Standard weight set calibration expired.');
  }

  if (session.readiness && session.readiness.blockingIssues) {
    issues.push(...session.readiness.blockingIssues);
  }

  return issues;
}

/**
 * Gets pending actions needed from operator or reviewer (§29)
 */
export function getPendingActions(session: VerificationSession | null | undefined): string[] {
  if (!session) return ['Select or register an instrument'];
  const actions: string[] = [];

  if (session.reviewStatus === 'APPROVED') {
    actions.push('Download statutory verification certificate (Form VI)');
    return actions;
  }

  if (session.reviewStatus === 'PENDING_REVIEW') {
    actions.push('Review technical test data and apply digital stamp');
    return actions;
  }

  if (session.reviewStatus === 'REMANDED') {
    actions.push(`Address remand reason: ${session.reviewer?.remandReason || 'Corrections requested'}`);
    actions.push('Resume testing sequence');
    return actions;
  }

  if (session.readiness.overallStatus !== 'READY' && !session.readiness.isReady) {
    actions.push('Complete test readiness preflight checklist');
  }
  if (session.physicalInspection.status !== 'PASS') {
    actions.push('Complete physical & visual inspection');
  }
  if (!session.weighing.completed && session.weighing.overallStatus !== 'PASS' && session.weighing.overallStatus !== 'FAIL') {
    actions.push('Record ascending and descending weighing observations');
  }
  if (!session.eccentricity.completed && session.eccentricity.overallStatus !== 'PASS' && session.eccentricity.overallStatus !== 'FAIL') {
    actions.push('Record 5-point eccentricity corner loads');
  }
  if (!session.repeatability.completed && session.repeatability.status !== 'PASS' && session.repeatability.status !== 'FAIL') {
    actions.push('Execute 10-reading repeatability sequence');
  }

  return actions;
}

/**
 * Intelligent Next Best Action (§31)
 */
export function getNextBestAction(session: VerificationSession | null | undefined): NextActionInfo {
  if (!session) {
    return {
      stepNumber: 1,
      stepName: 'Test Readiness',
      targetTab: 'readiness',
      headline: 'Begin Verification',
      subtext: 'Perform environmental and standards preflight checklist.',
      actionText: 'Start Preflight Gate',
      isCompleted: false,
    };
  }

  if (session.reviewStatus === 'APPROVED') {
    return {
      stepNumber: 7,
      stepName: 'Certificate Issued',
      targetTab: 'certificates',
      headline: 'Statutory Certificate Form VI',
      subtext: 'Verification sealed with Director signature and e-Māap QR token.',
      actionText: 'Open Certificate',
      isCompleted: true,
    };
  }

  if (session.reviewStatus === 'PENDING_REVIEW') {
    return {
      stepNumber: 7,
      stepName: 'Supervisory Review',
      targetTab: 'review',
      headline: 'Sign Statutory Certificate',
      subtext: 'All 6 test stages complete. Awaiting supervisory approval and seal.',
      actionText: 'Review Session',
      isCompleted: false,
    };
  }

  if (session.reviewStatus === 'REMANDED') {
    return {
      stepNumber: 3,
      stepName: 'Remanded for Correction',
      targetTab: 'weighing_linearity',
      headline: 'Correct Observations',
      subtext: session.reviewer?.remandReason || 'Remanded by reviewer. Please inspect readings.',
      actionText: 'Continue Testing',
      isCompleted: false,
    };
  }

  if (session.readiness.overallStatus !== 'READY' && !session.readiness.isReady) {
    return {
      stepNumber: 1,
      stepName: 'Test Readiness',
      targetTab: 'readiness',
      headline: 'Preflight Verification Gate',
      subtext: 'Verify calibration standard weights and environmental stability.',
      actionText: 'Start Testing',
      isCompleted: false,
    };
  }

  if (session.physicalInspection.status !== 'PASS') {
    return {
      stepNumber: 2,
      stepName: 'Physical Inspection',
      targetTab: 'physical_inspection',
      headline: 'Visual & Physical Examination',
      subtext: 'Inspect metrological stamping, security locks, and leveling bubble.',
      actionText: 'Inspect Instrument',
      isCompleted: false,
    };
  }

  if (!session.weighing.completed && session.weighing.overallStatus !== 'PASS' && session.weighing.overallStatus !== 'FAIL') {
    return {
      stepNumber: 3,
      stepName: 'Weighing Linearity',
      targetTab: 'weighing_linearity',
      headline: 'Ascending / Descending Load Grid',
      subtext: 'Record observations across statutory capacity increments.',
      actionText: 'Continue Weighing',
      isCompleted: false,
    };
  }

  if (!session.eccentricity.completed && session.eccentricity.overallStatus !== 'PASS' && session.eccentricity.overallStatus !== 'FAIL') {
    return {
      stepNumber: 4,
      stepName: 'Eccentricity (Corner)',
      targetTab: 'eccentricity_workspace',
      headline: 'Corner Loading Verification',
      subtext: 'Test platter load distribution across 4 corner positions with 1/3 Max.',
      actionText: 'Continue Eccentricity',
      isCompleted: false,
    };
  }

  if (!session.repeatability.completed && session.repeatability.status !== 'PASS' && session.repeatability.status !== 'FAIL') {
    return {
      stepNumber: 5,
      stepName: 'Repeatability Test',
      targetTab: 'repeatability_workspace',
      headline: 'Measurement Reproducibility',
      subtext: 'Execute 10 repeated loading cycles at 0.5 Max capacity.',
      actionText: 'Continue Repeatability',
      isCompleted: false,
    };
  }

  if (!session.environment.completed && session.environment.status !== 'PASS' && session.environment.status !== 'FAIL') {
    return {
      stepNumber: 6,
      stepName: 'Environmental / Tare',
      targetTab: 'environmental_workspace',
      headline: 'Tare & Thermal Span Stability',
      subtext: 'Verify subtractive tare accuracy and zero drift limits.',
      actionText: 'Complete Tare Verification',
      isCompleted: false,
    };
  }

  // All tests executed -> Ready to submit
  return {
    stepNumber: 7,
    stepName: 'Supervisory Review',
    targetTab: 'review',
    headline: 'Submit for Supervisory Sign-Off',
    subtext: 'All technical test procedures completed. Ready for Reviewer inspection.',
    actionText: 'Submit for Review',
    isCompleted: false,
  };
}

/**
 * Three-Tier Primary Answer Hierarchy (§22, §29)
 */
export function getSessionVerdictSummary(session: VerificationSession | null | undefined): SessionVerdictSummary {
  if (!session) {
    return {
      verdict: 'PENDING',
      humanAnswer: 'No active session loaded.',
      evidence: 'Please select an instrument or start a new verification.',
      technicalProof: 'Awaiting OIML R 76-1 inspection sequence.',
    };
  }

  if (session.complianceStatus === 'FAIL') {
    return {
      verdict: 'FAIL',
      humanAnswer: 'Instrument rejected: Measurement error exceeds statutory tolerance.',
      evidence: session.notes || 'One or more observation points violate maximum permissible error (MPE).',
      technicalProof: 'Under OIML R 76-1:2006 Clause 3.5.1 and Legal Metrology Act 2009, error E = P - L must not exceed ±mpe.',
    };
  }

  if (session.reviewStatus === 'APPROVED') {
    return {
      verdict: 'APPROVED',
      humanAnswer: 'Verified & Certified: Lawfully compliant for commercial trade.',
      evidence: `Digitally signed by ${session.directorSignature?.signedBy || session.directorSignature?.directorName || 'Director of Legal Metrology'}. Certificate ${session.directorSignature?.certificateId || session.directorSignature?.digitalCertificateId || 'Issued'}.`,
      technicalProof: `SHA-256 Digest: ${session.directorSignature?.digest?.substring(0, 18) || session.directorSignature?.cryptographicHash?.substring(0, 18) || 'Sealed'}... All statutory stages passed.`,
    };
  }

  return {
    verdict: 'PASS',
    humanAnswer: 'Within statutory tolerance: All recorded parameters comply with OIML R 76-1.',
    evidence: `Linearity, eccentricity, and repeatability tests compliant with statutory limits.`,
    technicalProof: 'Interpolated turning-point indication P = I + 0.5e - ΔL shows error E within statutory MPE envelope.',
  };
}

export function getSessionVerdict(session: VerificationSession | null | undefined): 'PASS' | 'FAIL' | 'PENDING' | 'APPROVED' {
  return getSessionVerdictSummary(session).verdict;
}
