import { UnifiedVerificationSession, AccuracyClass } from './types';
import {
  ALL_SYNTHETIC_SCENARIOS,
  SCENARIO_1_STANDARD_RETAIL,
  SCENARIO_2_ROUNDING_TRAP,
  SCENARIO_3_TEMPERATURE_DRIFT,
  SCENARIO_4_ECCENTRICITY_TWIST,
  SCENARIO_5_CLASS_I_PRECISION,
} from '../../data/scenarios';
import {
  createStandardClassIIISession,
  createRoundingTrapSession,
  createTemperatureDriftSession,
  createEccentricityTwistSession,
  createClassIAnalyticalSession,
} from '../../data/sessions';

/**
 * Canonical Synthetic Scenarios (§15, §16, §20, §21)
 * Generates rich, realistic OIML R 76-1 datasets for live evaluation and demo tests.
 */

export interface ScenarioDefinition {
  id: string;
  name: string;
  subtitle: string;
  expectedVerdict: 'PASS' | 'FAIL';
  classType: AccuracyClass;
  description: string;
  keyHighlight: string;
  createSession: () => UnifiedVerificationSession;
}

export const SYNTHETIC_SCENARIOS: Record<string, ScenarioDefinition> = {
  standard_class_iii_retail: {
    id: 'standard_class_iii_retail',
    name: '1. Passing Baseline',
    subtitle: SCENARIO_1_STANDARD_RETAIL.subtitle || 'Standard Class III Compliant (Avery ZM201)',
    expectedVerdict: 'PASS',
    classType: 'CLASS_III',
    description: SCENARIO_1_STANDARD_RETAIL.description || 'Statutory verification workflow for commercial retail platform with full MPE compliance.',
    keyHighlight: SCENARIO_1_STANDARD_RETAIL.keyHighlight || 'Complete sequence demonstrating lawful verification passing all OIML tolerances.',
    createSession: createStandardClassIIISession,
  },
  rounding_discrepancy_trap: {
    id: 'rounding_discrepancy_trap',
    name: '2. Rounding Discrepancy Trap',
    subtitle: SCENARIO_2_ROUNDING_TRAP.subtitle || 'Turning Point Interpolation (OIML R 76-1 Cl. 3.5.3.2)',
    expectedVerdict: 'FAIL',
    classType: 'CLASS_III',
    description: SCENARIO_2_ROUNDING_TRAP.description || 'Demonstrates the vulnerability of legacy spreadsheets where naive subtraction produces a false pass, but statutory turning-point interpolation catches a true out-of-tolerance failure.',
    keyHighlight: SCENARIO_2_ROUNDING_TRAP.keyHighlight || 'Legacy Spreadsheet (I - L = 0.0 g -> PASS) vs METROLOGIX-76 (P = I + 0.5e - ΔL -> Error -5.3 g -> FAIL).',
    createSession: createRoundingTrapSession,
  },
  temperature_span_drift_fail: {
    id: 'temperature_span_drift_fail',
    name: '3. Temperature Drift Failure',
    subtitle: SCENARIO_3_TEMPERATURE_DRIFT.subtitle || 'Thermal Gradient Out of Bounds',
    expectedVerdict: 'FAIL',
    classType: 'CLASS_II',
    description: SCENARIO_3_TEMPERATURE_DRIFT.description || 'Simulates ambient thermal fluctuation beyond legal limits causing excessive zero drift and span error.',
    keyHighlight: SCENARIO_3_TEMPERATURE_DRIFT.keyHighlight || 'Thermal drift rate 14.2 ppm/K exceeds maximum statutory limit of 5.0 ppm/K.',
    createSession: createTemperatureDriftSession,
  },
  eccentricity_cantilever_twist: {
    id: 'eccentricity_cantilever_twist',
    name: '4. Eccentricity Cantilever Twist',
    subtitle: SCENARIO_4_ECCENTRICITY_TWIST.subtitle || 'Corner 4 Mechanical Deflection',
    expectedVerdict: 'FAIL',
    classType: 'CLASS_III',
    description: SCENARIO_4_ECCENTRICITY_TWIST.description || 'Off-center load test reveals structural fatigue in Corner 4 load-cell mounting bracket.',
    keyHighlight: SCENARIO_4_ECCENTRICITY_TWIST.keyHighlight || 'Corner 4 deflection error -6.2 g exceeds legal limit ±5.0 g.',
    createSession: createEccentricityTwistSession,
  },
  high_interval_class_i_analytical: {
    id: 'high_interval_class_i_analytical',
    name: '5. Class I Micro-Precision',
    subtitle: SCENARIO_5_CLASS_I_PRECISION.subtitle || 'Mettler XP205 (120 g / 1 mg)',
    expectedVerdict: 'PASS',
    classType: 'CLASS_I',
    description: SCENARIO_5_CLASS_I_PRECISION.description || 'Laboratory microbalance verification incorporating air buoyancy correction and sealed certificate.',
    keyHighlight: SCENARIO_5_CLASS_I_PRECISION.keyHighlight || 'Demonstrates approved immutable record with Golden Padlock and Director e-Sign.',
    createSession: createClassIAnalyticalSession,
  },
};

/**
 * Global Scenario Loader (§15, §27)
 * Returns the complete domain session aggregate for the chosen scenario ID.
 */
export function loadScenario(scenarioId: string): UnifiedVerificationSession {
  const normalizedId = scenarioId.toLowerCase().replace(/[^a-z0-9_]/g, '_');

  if (normalizedId.includes('rounding') || normalizedId.includes('trap')) {
    return SYNTHETIC_SCENARIOS.rounding_discrepancy_trap.createSession();
  }
  if (normalizedId.includes('temp') || normalizedId.includes('drift')) {
    return SYNTHETIC_SCENARIOS.temperature_span_drift_fail.createSession();
  }
  if (normalizedId.includes('cantilever') || normalizedId.includes('eccentricity')) {
    return SYNTHETIC_SCENARIOS.eccentricity_cantilever_twist.createSession();
  }
  if (normalizedId.includes('micro') || normalizedId.includes('class_i') || normalizedId.includes('analytical')) {
    return SYNTHETIC_SCENARIOS.high_interval_class_i_analytical.createSession();
  }

  // Default fallback to baseline
  return SYNTHETIC_SCENARIOS.standard_class_iii_retail.createSession();
}

export { ALL_SYNTHETIC_SCENARIOS };
