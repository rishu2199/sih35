import { SyntheticScenario } from '../types/scenario';
import {
  INSTRUMENT_AVERY_ZM201,
  INSTRUMENT_METTLER_XPR,
  INSTRUMENT_SANSUI_GOLDMASTER,
  INSTRUMENT_ESSAE_DS215,
} from './instruments';
import {
  createStandardClassIIISession,
  createRoundingTrapSession,
  createTemperatureDriftSession,
  createEccentricityTwistSession,
  createClassIAnalyticalSession,
} from './sessions';

export const SCENARIO_1_STANDARD_RETAIL: SyntheticScenario = {
  id: 'standard_class_iii_retail',
  name: 'Standard Class III Retail',
  shortDescription: 'Commercial counter-scale verification passing all statutory OIML R 76-1 tolerances.',
  severity: 'PASS',
  instrument: INSTRUMENT_AVERY_ZM201,
  session: createStandardClassIIISession(),
  demoNarrative: {
    problem: 'Routine annual verification of a commercial retail platform.',
    discovery: 'All 14 weighing linearity points, 5 corner positions, and repeatability sequence fall within legal MPE envelopes.',
    conclusion: 'Statutory verification passes unconditionally; eligible for supervisory review and digital stamp.',
  },
  subtitle: 'Normal Happy-Path Verification (Avery ZM201)',
  expectedVerdict: 'PASS',
  classType: 'CLASS_III',
  description: 'Clean standard 30 kg x 5 g counter-scale baseline with full OIML Table 6 compliance.',
  keyHighlight: 'All statutory tests (Visual, Readiness, Linearity, Eccentricity, Repeatability, Tare) PASS.',
};

export const SCENARIO_2_ROUNDING_TRAP: SyntheticScenario = {
  id: 'rounding_discrepancy_trap',
  name: 'Rounding Discrepancy Trap',
  shortDescription: 'Legacy spreadsheet naive subtraction shows false PASS, while OIML turning-point detects true legal FAIL.',
  severity: 'FAIL',
  instrument: INSTRUMENT_AVERY_ZM201,
  session: createRoundingTrapSession(),
  demoNarrative: {
    problem: 'At the 2,000e capacity boundary (10,000 g), legacy spreadsheets use naive I - L = 10,000 - 10,000 = 0.0 g, issuing a fraudulent PASS certificate.',
    discovery: 'METROLOGIX-76 executes statutory turning-point interpolation (P = I + 0.5e - ΔL). An auxiliary load of 7.8 g was required to tip indication to 10,005 g, giving P = 9,994.7 g and true error E = -5.3 g.',
    conclusion: 'Legal tolerance limit is ±5.0 g. Instrument truly FAILS by 0.3 g out-of-tolerance. Metrological integrity is protected.',
  },
  subtitle: 'The Flagship SIH Metrological Catch (2,000e Boundary)',
  expectedVerdict: 'FAIL',
  classType: 'CLASS_III',
  description: 'Demonstrates why statutory legal metrology cannot rely on legacy spreadsheets.',
  keyHighlight: 'Legacy Spreadsheet (I - L = 0.0 g -> PASS) vs METROLOGIX-76 (P = I + 0.5e - ΔL -> Error -5.3 g -> FAIL).',
};

export const SCENARIO_3_TEMPERATURE_DRIFT: SyntheticScenario = {
  id: 'temperature_span_drift_fail',
  name: 'Temperature Span Drift Failure',
  shortDescription: 'Thermal non-compliance under OIML Clause A.5.3 elevated temperature testing (+40°C).',
  severity: 'FAIL',
  instrument: INSTRUMENT_SANSUI_GOLDMASTER,
  session: createTemperatureDriftSession(),
  demoNarrative: {
    problem: 'Evaluation of zero and span stability across ambient temperature transitions.',
    discovery: 'Reference temperature (+20°C) passed, but elevated exposure (+40°C) caused thermal expansion and span shift, producing a drift rate of 14.2 ppm/K.',
    conclusion: 'Exceeds maximum allowable thermal coefficient of 5.0 ppm/K for Class II. Instrument rejected.',
  },
  subtitle: 'Thermal Expansion & Span Shift (+40°C)',
  expectedVerdict: 'FAIL',
  classType: 'CLASS_II',
  description: 'OIML Clause A.5.3 thermal non-compliance scenario exposing environmental vulnerabilities.',
  keyHighlight: 'Thermal drift rate 14.2 ppm/K exceeds statutory ceiling 5.0 ppm/K.',
};

export const SCENARIO_4_ECCENTRICITY_TWIST: SyntheticScenario = {
  id: 'eccentricity_cantilever_twist',
  name: 'Eccentricity Cantilever Twist',
  shortDescription: 'Off-center load test reveals Corner 4 mechanical sag exceeding statutory limits.',
  severity: 'FAIL',
  instrument: INSTRUMENT_ESSAE_DS215,
  session: createEccentricityTwistSession(),
  demoNarrative: {
    problem: 'Heavy industrial platform platter testing with 1/3 Max test load applied off-center.',
    discovery: 'Center, Corner 1, Corner 2, and Corner 3 pass within ±5.0 g. Corner 4 suffers mechanical cantilever twist, exhibiting an error of -6.2 g.',
    conclusion: 'Platter fails off-center load distribution. Deflection is visually highlighted on Corner 4.',
  },
  subtitle: 'Corner 4 Mechanical Deflection (1/3 Max)',
  expectedVerdict: 'FAIL',
  classType: 'CLASS_IIII',
  description: 'Structural deflection in Corner 4 load-cell mounting bracket caught during eccentricity check.',
  keyHighlight: 'Corner 4 deflection error -6.2 g exceeds legal limit ±5.0 g.',
};

export const SCENARIO_5_CLASS_I_PRECISION: SyntheticScenario = {
  id: 'high_interval_class_i_analytical',
  name: 'High-Interval Class I Analytical',
  shortDescription: 'Micro-precision 120 g x 1 mg balance with n = 120,000 intervals and air buoyancy compensation.',
  severity: 'PASS',
  instrument: INSTRUMENT_METTLER_XPR,
  session: createClassIAnalyticalSession(),
  demoNarrative: {
    problem: 'Verification of high-interval Class I micro-balance susceptible to floating-point roundoff errors.',
    discovery: 'Deterministic integer-bounded metrology prevents IEEE-754 precision loss across 120,000 intervals.',
    conclusion: 'All tests PASS; sealed by Director Dr. A. Kumar with Green Guilloche seal and QR token.',
  },
  subtitle: 'Micro-Precision Class I Sealed Certificate (120 g / 1 mg)',
  expectedVerdict: 'PASS',
  classType: 'CLASS_I',
  description: 'High-interval analytical balance demonstrating precision calculation and approved immutability.',
  keyHighlight: 'Approved immutable record sealed with Director signature and e-Māap QR token.',
};

export const ALL_SYNTHETIC_SCENARIOS: Record<string, SyntheticScenario> = {
  standard_class_iii_retail: SCENARIO_1_STANDARD_RETAIL,
  rounding_discrepancy_trap: SCENARIO_2_ROUNDING_TRAP,
  temperature_span_drift_fail: SCENARIO_3_TEMPERATURE_DRIFT,
  eccentricity_cantilever_twist: SCENARIO_4_ECCENTRICITY_TWIST,
  high_interval_class_i_analytical: SCENARIO_5_CLASS_I_PRECISION,
};
