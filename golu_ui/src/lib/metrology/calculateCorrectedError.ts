/**
 * OIML R 76-1 Clause A.4.4.3: Calculation of Corrected Error
 * 
 * Formula: Ec = E - E0
 * Where:
 *   E = Error at load L
 *   E0 = Error determined at zero load (or calculated zero-setting error)
 */
export function calculateCorrectedError(
  errorE: number,
  zeroErrorE0: number = 0
): number {
  const corrected = errorE - zeroErrorE0;
  return Number(corrected.toFixed(8));
}
