import { ObservationRow } from '../types/observation';
import { calculateObservation } from '../lib/metrology/calculateCompliance';

/**
 * Builds canonical observation rows for ascending and descending runs.
 */
export function buildWeighingRows(
  loads: number[],
  e: number,
  accuracyClass: 'CLASS_I' | 'CLASS_II' | 'CLASS_III' | 'CLASS_IIII' = 'CLASS_III',
  deltaLValues?: number[],
  scaleReadings?: number[]
): ObservationRow[] {
  return loads.map((nominalLoad, idx) => {
    const scaleReading = scaleReadings && scaleReadings[idx] !== undefined
      ? scaleReadings[idx]
      : nominalLoad;
    const deltaL = deltaLValues && deltaLValues[idx] !== undefined
      ? deltaLValues[idx]
      : 0.5 * e; // default exact half-interval

    const calc = calculateObservation({
      nominalLoad,
      scaleReading,
      e,
      deltaL,
      accuracyClass,
    });

    return {
      stepIndex: idx + 1,
      nominalLoad,
      scaleReading,
      auxiliaryDeltaL: deltaL,
      turningPointP: calc.turningPointP,
      errorE: calc.errorE,
      correctedErrorEc: calc.correctedErrorEc,
      mpeLimit: calc.mpeLimit,
      status: calc.status,
      hasComment: false,

      // Compatibility fields
      id: `row-${idx + 1}`,
      stepNumber: idx + 1,
      loadNominal: nominalLoad,
      indicationI: scaleReading,
      turningPointDeltaL: deltaL,
      calculatedP: calc.turningPointP,
      mpe: calc.mpeLimit,
      direction: 'ASCENDING',
      timestamp: `10:${15 + idx}:00`,
      source: 'MANUAL',
    };
  });
}
