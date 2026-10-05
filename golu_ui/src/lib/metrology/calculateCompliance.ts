import { AccuracyClass, VerificationStage, ComplianceStatus } from '../../types/instrument';
import { calculateTurningPoint } from './calculateTurningPoint';
import { calculateError } from './calculateError';
import { calculateCorrectedError } from './calculateCorrectedError';

/**
 * OIML R 76-1 Table 6: Maximum Permissible Errors on Initial Verification
 * 
 * Expressed in units of verification scale interval 'e':
 * 
 * Class I:
 *   0 <= m <= 50,000e   : +/- 0.5e
 *   50,000e < m <= 200,000e : +/- 1.0e
 *   m > 200,000e        : +/- 1.5e
 * 
 * Class II:
 *   0 <= m <= 5,000e    : +/- 0.5e
 *   5,000e < m <= 20,000e   : +/- 1.0e
 *   m > 20,000e         : +/- 1.5e
 * 
 * Class III:
 *   0 <= m <= 500e      : +/- 0.5e
 *   500e < m <= 2,000e  : +/- 1.0e
 *   m > 2,000e          : +/- 1.5e
 * 
 * Class IIII:
 *   0 <= m <= 50e       : +/- 0.5e
 *   50e < m <= 200e     : +/- 1.0e
 *   m > 200e            : +/- 1.5e
 */
export function calculateMpeLimit(
  nominalLoad: number,
  e: number,
  accuracyClass: AccuracyClass = 'CLASS_III',
  stage: VerificationStage = 'SUBSEQUENT_VERIFICATION'
): number {
  if (e <= 0) return 0;

  // Number of scale intervals m = load / e
  const m = Math.abs(nominalLoad) / e;
  let mpeInE = 1.0;

  switch (accuracyClass) {
    case 'CLASS_I':
      if (m <= 50000) mpeInE = 0.5;
      else if (m <= 200000) mpeInE = 1.0;
      else mpeInE = 1.5;
      break;

    case 'CLASS_II':
      if (m <= 5000) mpeInE = 0.5;
      else if (m <= 20000) mpeInE = 1.0;
      else mpeInE = 1.5;
      break;

    case 'CLASS_III':
      if (m <= 500) mpeInE = 0.5;
      else if (m <= 2000) mpeInE = 1.0;
      else mpeInE = 1.5;
      break;

    case 'CLASS_IIII':
      if (m <= 50) mpeInE = 0.5;
      else if (m <= 200) mpeInE = 1.0;
      else mpeInE = 1.5;
      break;

    default:
      mpeInE = 1.0;
  }

  // In service inspections allow 2x MPE under statutory rules
  if (stage === 'IN_SERVICE_INSPECTION') {
    mpeInE *= 2.0;
  }

  const limit = mpeInE * e;
  return Number(limit.toFixed(8));
}

export interface ObservationCalculationInput {
  nominalLoad: number;
  scaleReading: number;
  e: number;
  deltaL?: number;
  zeroError?: number;
  accuracyClass?: AccuracyClass;
  verificationStage?: VerificationStage;
}

export interface ObservationCalculationResult {
  turningPointP: number;
  errorE: number;
  correctedErrorEc: number;
  mpeLimit: number;
  status: ComplianceStatus;
}

/**
 * Deterministic metrological pipeline (§41, §42):
 * raw observations -> derived calculation -> legal comparison -> status
 */
export function calculateObservation(
  input: ObservationCalculationInput
): ObservationCalculationResult {
  const {
    nominalLoad,
    scaleReading,
    e,
    deltaL = 0,
    zeroError = 0,
    accuracyClass = 'CLASS_III',
    verificationStage = 'SUBSEQUENT_VERIFICATION',
  } = input;

  const turningPointP = calculateTurningPoint(scaleReading, deltaL, e);
  const errorE = calculateError(turningPointP, nominalLoad);
  const correctedErrorEc = calculateCorrectedError(errorE, zeroError);
  const mpeLimit = calculateMpeLimit(nominalLoad, e, accuracyClass, verificationStage);

  const absError = Math.abs(correctedErrorEc);
  let status: ComplianceStatus = 'PASS';

  // Small epsilon for floating point boundary comparisons (1e-7)
  if (absError > mpeLimit + 1e-7) {
    status = 'FAIL';
  } else if (absError >= mpeLimit * 0.95) {
    status = 'MARGINAL';
  } else {
    status = 'PASS';
  }

  return {
    turningPointP,
    errorE,
    correctedErrorEc,
    mpeLimit,
    status,
  };
}
