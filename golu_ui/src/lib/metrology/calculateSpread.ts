import { ComplianceStatus } from '../../types/instrument';

export interface SpreadResult {
  min: number;
  max: number;
  spread: number;
  allowableLimit: number;
  status: ComplianceStatus;
}

/**
 * Calculates observed spread and compliance for repeatability / eccentricity.
 * 
 * Formula: Spread = max(values) - min(values)
 * Compliance: Spread <= allowableLimit
 */
export function calculateSpread(
  values: number[],
  allowableLimit: number
): SpreadResult {
  if (!values || values.length === 0) {
    return {
      min: 0,
      max: 0,
      spread: 0,
      allowableLimit,
      status: 'PENDING',
    };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const spread = Number((max - min).toFixed(8));

  const status: ComplianceStatus =
    spread <= allowableLimit + 1e-7 ? 'PASS' : 'FAIL';

  return {
    min,
    max,
    spread,
    allowableLimit,
    status,
  };
}
