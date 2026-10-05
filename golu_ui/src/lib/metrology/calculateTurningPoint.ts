/**
 * OIML R 76-1 Clause A.4.4.3: Determination of Turning Point (Changeover Point)
 * 
 * Formula: P = I + 0.5e - ΔL
 * Where:
 *   I = Scale Reading / Indication
 *   e = Verification scale interval
 *   ΔL = Auxiliary fractional weights added until indication transitions to I + d
 */
export function calculateTurningPoint(
  indication: number,
  deltaL: number = 0,
  e: number
): number {
  if (e <= 0) return indication;
  // P = I + 0.5e - deltaL
  const p = indication + 0.5 * e - deltaL;
  // Round to appropriate precision to avoid JavaScript IEEE-754 floating-point artifacts
  return Number(p.toFixed(8));
}
