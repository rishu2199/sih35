/**
 * OIML R 76-1 Clause A.4.4.3: Calculation of Error
 * 
 * Formula: E = P - L
 * Where:
 *   P = Turning point indication (or raw indication if deltaL not measured)
 *   L = Nominal standard test load applied
 */
export function calculateError(
  turningPointP: number,
  nominalLoadL: number
): number {
  const error = turningPointP - nominalLoadL;
  return Number(error.toFixed(8));
}
