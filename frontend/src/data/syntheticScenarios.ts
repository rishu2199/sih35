/**
 * METROLOGIX-76 — High-Fidelity Pre-Compiled Synthetic Metrological Edge-Case Scenarios.
 *
 * Provides instantaneous 1-click loading with zero network latency, with seamless API
 * fallback synchronization.
 *
 * Statutory References:
 * - OIML R 76-1:2006 Clause 3.2 (Table 3), Clause 3.5 (Table 4 & Table 6)
 * - OIML R 76-1:2006 Clause A.4.4.3 (Digital indication changeover P = I + 0.5e - ΔL)
 * - OIML R 76-1:2006 Clause A.4.7 (Eccentricity)
 * - OIML R 76-1:2006 Clause A.5.3 (Temperature span drift)
 */

import type { SyntheticScenario } from '../types/scenarios';

// Helper to compute authentic changeover observation
function makeObs(
  step: number,
  dir: 'ASCENDING' | 'DESCENDING' | 'REPEATABILITY',
  load: number,
  ind: number,
  deltaL: number,
  e: number,
  mpeMul: number,
  zeroErr = 0,
  notes: string | null = null,
  naiveErrorOverride?: number,
  naiveStatusOverride?: 'PASS' | 'FAIL'
) {
  const p = Number((ind + 0.5 * e - deltaL).toFixed(4));
  const uncorrected = Number((p - load).toFixed(4));
  const corrected = Number((uncorrected - zeroErr).toFixed(4));
  const mpeLimit = Number((e * mpeMul).toFixed(4));
  const margin = Number((mpeLimit - Math.abs(corrected)).toFixed(4));
  const status = Math.abs(corrected) <= mpeLimit ? 'PASS' : 'FAIL';
  const naiveError = naiveErrorOverride ?? Number((ind - load).toFixed(4));
  const naiveStatus = naiveStatusOverride ?? (Math.abs(naiveError) <= mpeLimit ? 'PASS' : 'FAIL');

  return {
    id: `obs-${step}`,
    step,
    direction: dir,
    target_load: load,
    indication: ind,
    auxiliary_load: deltaL,
    true_indication: p,
    uncorrected_error: uncorrected,
    zero_error: zeroErr,
    corrected_error: corrected,
    mpe_limit: mpeLimit,
    mpe_in_e: `±${mpeMul.toFixed(1)} e`,
    margin,
    status: status as 'PASS' | 'FAIL',
    is_zero_point: load === 0,
    notes,
    naive_error: naiveError,
    naive_status: naiveStatus as 'PASS' | 'FAIL',
  };
}

// ============================================================================
// Scenario 1: Standard Class III Retail Bench Scale (Passing Baseline)
// ============================================================================
const e1 = 5;
const s1AscLoads: [number, number, number, number, string | null][] = [
  [0, 0, 2.5, 0.5, null],
  [100, 100, 2.6, 0.5, null],
  [500, 500, 2.4, 0.5, null],
  [1000, 1000, 2.7, 0.5, null],
  [2500, 2500, 2.5, 0.5, null],
  [5000, 5000, 2.8, 1.0, null],
  [10000, 10000, 3.1, 1.0, null],
  [15000, 15000, 3.3, 1.5, null],
  [20000, 20000, 3.6, 1.5, null],
  [25000, 25000, 3.8, 1.5, null],
  [30000, 30000, 2.3, 1.5, null],
];

const s1Weighing = [
  ...s1AscLoads.map(([load, ind, dl, mpe, note], i) =>
    makeObs(i + 1, 'ASCENDING', load, ind, dl, e1, mpe, 0, note)
  ),
  ...[...s1AscLoads].reverse().map(([load, ind, dl, mpe, note], i) =>
    makeObs(12 + i, 'DESCENDING', load, ind, dl + (i % 2 === 0 ? 0.2 : -0.1), e1, mpe, 0, note)
  ),
  makeObs(23, 'REPEATABILITY', 15000, 15000, 2.6, e1, 1.5, 0, 'Repeatability run #1 (50% Max)'),
  makeObs(24, 'REPEATABILITY', 15000, 15000, 2.7, e1, 1.5, 0, 'Repeatability run #2 (50% Max)'),
  makeObs(25, 'REPEATABILITY', 30000, 30000, 2.8, e1, 1.5, 0, 'Repeatability run #3 (100% Max)'),
  makeObs(26, 'REPEATABILITY', 30000, 30000, 2.9, e1, 1.5, 0, 'Repeatability run #4 (100% Max)'),
];

export const SCENARIO_1: SyntheticScenario = {
  id: 'standard_class_iii_retail',
  scenario_number: 1,
  title: 'Standard Class III Retail Bench Scale (Passing Baseline)',
  short_title: '1. Retail Scale (Baseline PASS)',
  category: 'COMPLIANCE_BASELINE',
  description:
    'Standard electronic price-computing retail scale (30 kg x 5 g) evaluated for initial type approval under OIML R 76-1. Demonstrates normal test progression with healthy safety margins across all tolerance corridors.',
  highlight_aspect: 'Fully compliant baseline dataset with 31 observations satisfying Table 3 and Table 4.',
  technical_explanation:
    'Verification scale interval e = 5 g; n = 6,000 intervals. All observations exhibit natural mechanical variance with auxiliary load changeover points ΔL ≈ 2.3 - 3.8 g. Maximum observed error of -1.5 g consumes only 20% of the allowable ±7.5 g corridor at Max.',
  accuracy_class: 'CLASS_III',
  manufacturer: 'Essae-Teraoka Pvt Ltd',
  model_name: 'PR-30 Price Computing Counter Scale',
  serial_number: 'ET-2026-9041',
  max_capacity: 30000,
  min_capacity: 100,
  e: 5,
  d: 5,
  n: 6000,
  unit: 'g',
  verification_stage: 'INITIAL_TYPE_APPROVAL',
  expected_verdict: 'PASS',
  observations_count: 31,
  rounding_trap_highlight: null,
  weighing_observations: s1Weighing,
  eccentricity_observations: [
    { position: 'CENTER', position_number: 1, label: 'Center (Pos 1)', target_load: 10000, indication: 10000, auxiliary_load: 2.5, true_indication: 10000.0, corrected_error: 0.0, mpe_limit: 5.0, status: 'PASS' },
    { position: 'FRONT_LEFT', position_number: 2, label: 'Front Left (Pos 2)', target_load: 10000, indication: 10000, auxiliary_load: 2.8, true_indication: 9999.7, corrected_error: -0.3, mpe_limit: 5.0, status: 'PASS' },
    { position: 'BACK_LEFT', position_number: 3, label: 'Back Left (Pos 3)', target_load: 10000, indication: 10000, auxiliary_load: 2.2, true_indication: 10000.3, corrected_error: 0.3, mpe_limit: 5.0, status: 'PASS' },
    { position: 'BACK_RIGHT', position_number: 4, label: 'Back Right (Pos 4)', target_load: 10000, indication: 10000, auxiliary_load: 2.9, true_indication: 9999.6, corrected_error: -0.4, mpe_limit: 5.0, status: 'PASS' },
    { position: 'FRONT_RIGHT', position_number: 5, label: 'Front Right (Pos 5)', target_load: 10000, indication: 10000, auxiliary_load: 2.4, true_indication: 10000.1, corrected_error: 0.1, mpe_limit: 5.0, status: 'PASS' },
  ],
  audit_notes: [
    'Test executed in accordance with OIML R 76-1 Clause A.4.4.',
    'All changeover points verified with M1 working standard fractional weights.',
    'Zero point return deviation is 0.000 g across initial and final test runs.',
  ],
};

// ============================================================================
// Scenario 2: Rounding Discrepancy Trap (Hackathon Highlight)
// ============================================================================
const s2Weighing = [
  makeObs(1, 'ASCENDING', 0, 0, 2.5, 5, 0.5, 0),
  makeObs(2, 'ASCENDING', 100, 100, 2.6, 5, 0.5, 0),
  makeObs(3, 'ASCENDING', 500, 500, 2.5, 5, 0.5, 0),
  makeObs(4, 'ASCENDING', 1000, 1000, 2.7, 5, 0.5, 0),
  makeObs(5, 'ASCENDING', 2500, 2500, 2.6, 5, 0.5, 0),
  makeObs(6, 'ASCENDING', 5000, 5000, 3.0, 5, 1.0, 0),
  // Step 7: THE METROLOGICAL TRAP!
  makeObs(
    7,
    'ASCENDING',
    10000,
    10000,
    7.8,
    5,
    1.0,
    0,
    'CRITICAL OIML DISCREPANCY: Naive error I - L = 0.0 g (PASS), but true changeover P = 9,994.7 g produces Ec = -5.3 g (> ±5.0 g MPE). Statutory violation caught!',
    0.0,
    'PASS'
  ),
  makeObs(8, 'ASCENDING', 15000, 15000, 3.2, 5, 1.5, 0),
  makeObs(9, 'ASCENDING', 20000, 20000, 3.5, 5, 1.5, 0),
  makeObs(10, 'ASCENDING', 25000, 25000, 3.7, 5, 1.5, 0),
  makeObs(11, 'ASCENDING', 30000, 30000, 3.9, 5, 1.5, 0),
  // Descending
  makeObs(12, 'DESCENDING', 30000, 30000, 4.0, 5, 1.5, 0),
  makeObs(13, 'DESCENDING', 25000, 25000, 3.8, 5, 1.5, 0),
  makeObs(14, 'DESCENDING', 20000, 20000, 3.6, 5, 1.5, 0),
  makeObs(15, 'DESCENDING', 15000, 15000, 3.3, 5, 1.5, 0),
  makeObs(
    16,
    'DESCENDING',
    10000,
    10000,
    7.6,
    5,
    1.0,
    0,
    'Descending hysteresis trap: Ec = -5.1 g exceeds ±5.0 g MPE.'
  ),
  makeObs(17, 'DESCENDING', 5000, 5000, 3.1, 5, 1.0, 0),
  makeObs(18, 'DESCENDING', 2500, 2500, 2.7, 5, 0.5, 0),
  makeObs(19, 'DESCENDING', 1000, 1000, 2.8, 5, 0.5, 0),
  makeObs(20, 'DESCENDING', 500, 500, 2.6, 5, 0.5, 0),
  makeObs(21, 'DESCENDING', 100, 100, 2.7, 5, 0.5, 0),
  makeObs(22, 'DESCENDING', 0, 0, 2.6, 5, 0.5, 0),
  // Repeatability
  makeObs(23, 'REPEATABILITY', 15000, 15000, 2.6, 5, 1.5, 0),
  makeObs(24, 'REPEATABILITY', 15000, 15000, 2.7, 5, 1.5, 0),
  makeObs(25, 'REPEATABILITY', 30000, 30000, 2.8, 5, 1.5, 0),
  makeObs(26, 'REPEATABILITY', 30000, 30000, 2.9, 5, 1.5, 0),
];

export const SCENARIO_2: SyntheticScenario = {
  id: 'rounding_discrepancy_trap',
  scenario_number: 2,
  title: 'Rounding Discrepancy Trap (Naive PASS vs OIML Formula FAIL)',
  short_title: '2. Rounding Trap (OIML FAIL)',
  category: 'METROLOGICAL_TRAP',
  description:
    'The quintessential metrology trap: At the 2,000e boundary (10,000 g), the digital scale display reads an exact 10,000 g. A naive spreadsheet computes Error = 10,000 - 10,000 = 0 g (PASS). However, true Legal Metrology changeover analysis with auxiliary weights (ΔL = 7.8 g) reveals a true unrounded indication of 9,994.7 g — producing a corrected error of -5.3 g, which violates the statutory ±5.0 g MPE!',
  highlight_aspect: 'Exposes why naive spreadsheets fail Legal Metrology audits while METROLOGIX-76 guarantees legal compliance.',
  technical_explanation:
    'Per OIML R 76-1:2006 Clause A.4.4.3, analog changeover point P = I + 0.5e - ΔL. At Step 7 (L = 10,000 g), I = 10,000 g, e = 5 g, ΔL = 7.8 g. P = 10,000 + 2.5 - 7.8 = 9,994.7 g. Error E = P - L = -5.3 g. Allowable MPE for Initial Verification at 2,000e is ±1.0e = ±5.0 g. Since |-5.3 g| > 5.0 g, the instrument FAILS statutory type approval.',
  accuracy_class: 'CLASS_III',
  manufacturer: 'Apex Weighing Systems',
  model_name: 'Vanguard Precision Platform 30K',
  serial_number: 'APX-2026-TRAP-02',
  max_capacity: 30000,
  min_capacity: 100,
  e: 5,
  d: 5,
  n: 6000,
  unit: 'g',
  verification_stage: 'INITIAL_TYPE_APPROVAL',
  expected_verdict: 'FAIL',
  observations_count: 31,
  rounding_trap_highlight: {
    step: 7,
    target_load: 10000.0,
    display_indication: 10000.0,
    auxiliary_weight_delta_l: 7.8,
    naive_calculation: {
      formula: 'Error = I - L',
      computed_error: 0.0,
      allowable_mpe: 5.0,
      verdict: 'PASS (FALSE COMPLIANCE)',
    },
    oiml_statutory_calculation: {
      formula: 'P = I + 0.5e - ΔL = 10000 + 2.5 - 7.8 = 9994.7 g; Ec = P - L = -5.3 g',
      computed_error: -5.3,
      allowable_mpe: 5.0,
      verdict: 'FAIL (OIML R 76-1 NON-COMPLIANCE)',
    },
    statutory_citation: 'OIML R 76-1:2006 Clause A.4.4.3 & Clause 3.5.1 (Table 6)',
  },
  weighing_observations: s2Weighing,
  eccentricity_observations: [
    { position: 'CENTER', position_number: 1, label: 'Center (Pos 1)', target_load: 10000, indication: 10000, auxiliary_load: 2.5, true_indication: 10000.0, corrected_error: 0.0, mpe_limit: 5.0, status: 'PASS' },
    { position: 'FRONT_LEFT', position_number: 2, label: 'Front Left (Pos 2)', target_load: 10000, indication: 10000, auxiliary_load: 2.8, true_indication: 9999.7, corrected_error: -0.3, mpe_limit: 5.0, status: 'PASS' },
    { position: 'BACK_LEFT', position_number: 3, label: 'Back Left (Pos 3)', target_load: 10000, indication: 10000, auxiliary_load: 2.3, true_indication: 10000.2, corrected_error: 0.2, mpe_limit: 5.0, status: 'PASS' },
    { position: 'BACK_RIGHT', position_number: 4, label: 'Back Right (Pos 4)', target_load: 10000, indication: 10000, auxiliary_load: 2.9, true_indication: 9999.6, corrected_error: -0.4, mpe_limit: 5.0, status: 'PASS' },
    { position: 'FRONT_RIGHT', position_number: 5, label: 'Front Right (Pos 5)', target_load: 10000, indication: 10000, auxiliary_load: 2.6, true_indication: 9999.9, corrected_error: -0.1, mpe_limit: 5.0, status: 'PASS' },
  ],
  audit_notes: [
    'CRITICAL NON-COMPLIANCE DETECTED: Observation #7 violates Table 6 MPE (Error -5.3 g exceeds ±5.0 g).',
    'Spreadsheet inspection audit: Naive formula I - L failed to catch this non-compliance.',
    'Statutory action: Pattern evaluation report must issue REJECTION under Legal Metrology Act, 2009 Section 24.',
  ],
};

// ============================================================================
// Scenario 3: Temperature Span Drift Fail (Passes at 20°C, Fails at 40°C)
// ============================================================================
const s3Weighing = [
  makeObs(1, 'ASCENDING', 0, 0, 2.5, 5, 0.5, 0),
  makeObs(2, 'ASCENDING', 100, 100, 2.9, 5, 0.5, 0),
  makeObs(3, 'ASCENDING', 500, 500, 3.4, 5, 0.5, 0),
  makeObs(4, 'ASCENDING', 1000, 1000, 3.9, 5, 0.5, 0),
  makeObs(5, 'ASCENDING', 2500, 2500, 4.4, 5, 0.5, 0),
  makeObs(6, 'ASCENDING', 5000, 5000, 5.2, 5, 1.0, 0),
  makeObs(7, 'ASCENDING', 10000, 10000, 6.8, 5, 1.0, 0),
  makeObs(8, 'ASCENDING', 15000, 15000, 8.5, 5, 1.5, 0, 'THERMAL DRIFT: Strain gauge sensitivity expands at +40°C'),
  makeObs(9, 'ASCENDING', 20000, 20000, 10.2, 5, 1.5, 0, 'THERMAL DRIFT: Error exceeds allowable MPE corridor'),
  makeObs(10, 'ASCENDING', 25000, 25000, 11.9, 5, 1.5, 0, 'STATUTORY VIOLATION: Span thermal drift exceeds Clause A.5.3'),
  makeObs(11, 'ASCENDING', 30000, 30000, 13.5, 5, 1.5, 0, 'MAX CAPACITY FAILURE: Corrected error = -11.0 g (> ±7.5 g MPE)'),
  // Descending
  makeObs(12, 'DESCENDING', 30000, 30000, 13.8, 5, 1.5, 0),
  makeObs(13, 'DESCENDING', 25000, 25000, 12.1, 5, 1.5, 0),
  makeObs(14, 'DESCENDING', 20000, 20000, 10.5, 5, 1.5, 0),
  makeObs(15, 'DESCENDING', 15000, 15000, 8.7, 5, 1.5, 0),
  makeObs(16, 'DESCENDING', 10000, 10000, 6.9, 5, 1.0, 0),
  makeObs(17, 'DESCENDING', 5000, 5000, 5.3, 5, 1.0, 0),
  makeObs(18, 'DESCENDING', 2500, 2500, 4.5, 5, 0.5, 0),
  makeObs(19, 'DESCENDING', 1000, 1000, 3.8, 5, 0.5, 0),
  makeObs(20, 'DESCENDING', 500, 500, 3.3, 5, 0.5, 0),
  makeObs(21, 'DESCENDING', 100, 100, 2.8, 5, 0.5, 0),
  makeObs(22, 'DESCENDING', 0, 0, 2.7, 5, 0.5, 0),
  // Repeatability
  makeObs(23, 'REPEATABILITY', 15000, 15000, 8.4, 5, 1.5, 0),
  makeObs(24, 'REPEATABILITY', 15000, 15000, 8.6, 5, 1.5, 0),
  makeObs(25, 'REPEATABILITY', 30000, 30000, 13.6, 5, 1.5, 0),
  makeObs(26, 'REPEATABILITY', 30000, 30000, 13.9, 5, 1.5, 0),
];

export const SCENARIO_3: SyntheticScenario = {
  id: 'temperature_span_drift_fail',
  scenario_number: 3,
  title: 'Static Temperature Span Drift Failure (Passes at 20°C, Fails at 40°C)',
  short_title: '3. Temp Drift (FAIL at 40°C)',
  category: 'ENVIRONMENTAL_CHAMBER_FAILURE',
  description:
    'Instrument perfectly satisfies initial verification at standard reference temperature (20°C), but exhibits severe uncompensated span drift when subjected to +40°C in the environmental test chamber per Clause A.5.3.',
  highlight_aspect: 'Demonstrates environmental chamber stress testing and thermal coefficient drift at Max capacity.',
  technical_explanation:
    'Under OIML R 76-1 Clause A.5.3, weighing instruments must maintain statutory MPE across the specified temperature range (-10°C to +40°C). In this scenario, defective strain gauge thermal compensation causes the sensitivity to drift at high loads, producing an error of -11.0 g at 30,000 g (MPE limit ±7.5 g).',
  accuracy_class: 'CLASS_III',
  manufacturer: 'Himalaya Metrology Solutions',
  model_name: 'ThermaScale TS-30K',
  serial_number: 'HMS-2026-TEMP-40',
  max_capacity: 30000,
  min_capacity: 100,
  e: 5,
  d: 5,
  n: 6000,
  unit: 'g',
  verification_stage: 'INITIAL_TYPE_APPROVAL',
  expected_verdict: 'FAIL',
  observations_count: 31,
  rounding_trap_highlight: null,
  weighing_observations: s3Weighing,
  eccentricity_observations: [
    { position: 'CENTER', position_number: 1, label: 'Center (Pos 1)', target_load: 10000, indication: 10000, auxiliary_load: 2.5, true_indication: 10000.0, corrected_error: 0.0, mpe_limit: 5.0, status: 'PASS' },
    { position: 'FRONT_LEFT', position_number: 2, label: 'Front Left (Pos 2)', target_load: 10000, indication: 10000, auxiliary_load: 3.2, true_indication: 9999.3, corrected_error: -0.7, mpe_limit: 5.0, status: 'PASS' },
    { position: 'BACK_LEFT', position_number: 3, label: 'Back Left (Pos 3)', target_load: 10000, indication: 10000, auxiliary_load: 3.5, true_indication: 9999.0, corrected_error: -1.0, mpe_limit: 5.0, status: 'PASS' },
    { position: 'BACK_RIGHT', position_number: 4, label: 'Back Right (Pos 4)', target_load: 10000, indication: 10000, auxiliary_load: 4.1, true_indication: 9998.4, corrected_error: -1.6, mpe_limit: 5.0, status: 'PASS' },
    { position: 'FRONT_RIGHT', position_number: 5, label: 'Front Right (Pos 5)', target_load: 10000, indication: 10000, auxiliary_load: 3.8, true_indication: 9998.7, corrected_error: -1.3, mpe_limit: 5.0, status: 'PASS' },
  ],
  audit_notes: [
    'Environmental Chamber Run: Chamber #2 at 40.0°C ± 0.5°C with 50% RH.',
    'Stabilization period: 8 hours observed per Clause A.5.3.1.',
    'Span temperature coefficient exceeds allowable threshold: non-compliant temperature compensation resistor network.',
  ],
};

// ============================================================================
// Scenario 4: Eccentricity Cantilever Twist (Corner 5 Fails)
// ============================================================================
export const SCENARIO_4: SyntheticScenario = {
  id: 'eccentricity_cantilever_twist',
  scenario_number: 4,
  title: 'Eccentricity Cantilever Twist (Corner 5 Structural Torque Violation)',
  short_title: '4. Corner Twist (FAIL on Pos 5)',
  category: 'MECHANICAL_DEFECT',
  description:
    'A platform bench scale with an asymmetric cantilever mount passes center-point weighing, but fails the OIML R 76-1 Clause A.4.7 eccentricity corner test when load is applied to Corner 5 (Right-Rear) due to torsional bending in the platter substructure.',
  highlight_aspect: 'Directly lights up the 2D Dynamic Platter Deflection Heatmap widget with a crimson deflection hotspot!',
  technical_explanation:
    'Clause A.4.7 requires 1/3 Max load applied successively to 4 quadrants and center. Maximum permissible error is ±1.0e (±5.0 g). Corner 5 exhibits an error of -6.2 g (exceeding ±5.0 g MPE limit), resulting in statutory rejection.',
  accuracy_class: 'CLASS_III',
  manufacturer: 'Titan Load Systems',
  model_name: 'Titan Pro-50 Heavy Duty Bench',
  serial_number: 'TLS-2026-CANT-05',
  max_capacity: 30000,
  min_capacity: 100,
  e: 5,
  d: 5,
  n: 6000,
  unit: 'g',
  verification_stage: 'INITIAL_TYPE_APPROVAL',
  expected_verdict: 'FAIL',
  observations_count: 31,
  rounding_trap_highlight: null,
  weighing_observations: s1Weighing,
  eccentricity_observations: [
    { position: 'CENTER', position_number: 1, label: 'Center (Pos 1)', target_load: 10000, indication: 10000, auxiliary_load: 2.5, true_indication: 10000.0, corrected_error: 0.0, mpe_limit: 5.0, status: 'PASS' },
    { position: 'FRONT_LEFT', position_number: 2, label: 'Front Left (Pos 2)', target_load: 10000, indication: 10000, auxiliary_load: 2.9, true_indication: 9999.6, corrected_error: -0.4, mpe_limit: 5.0, status: 'PASS' },
    { position: 'BACK_LEFT', position_number: 3, label: 'Back Left (Pos 3)', target_load: 10000, indication: 10000, auxiliary_load: 2.3, true_indication: 10000.2, corrected_error: 0.2, mpe_limit: 5.0, status: 'PASS' },
    { position: 'BACK_RIGHT', position_number: 4, label: 'Back Right (Pos 4)', target_load: 10000, indication: 10000, auxiliary_load: 3.1, true_indication: 9999.4, corrected_error: -0.6, mpe_limit: 5.0, status: 'PASS' },
    {
      position: 'FRONT_RIGHT',
      position_number: 5,
      label: 'Front Right (Pos 5)',
      target_load: 10000,
      indication: 10000,
      auxiliary_load: 8.7,
      true_indication: 9993.8,
      corrected_error: -6.2,
      mpe_limit: 5.0,
      status: 'FAIL',
      notes: 'ECCENTRICITY VIOLATION: Error -6.2 g exceeds ±5.0 g MPE due to platform load cell torsion.',
    },
  ],
  audit_notes: [
    'Eccentricity test load: 10,000 g (1/3 Max per OIML R 76-1 Clause A.4.7.1).',
    'Pos 5 (Front Right) exceeds allowable MPE: Delta L = 8.7 g, Error = -6.2 g.',
    'Mechanical inspection reveals flexure mount deformation under corner load.',
  ],
};

// ============================================================================
// Scenario 5: High-Interval Class I Analytical Balance (n = 120,000)
// ============================================================================
const e5 = 0.001; // 1 mg
const s5AscLoads: [number, number, number, number, string | null][] = [
  [0, 0, 0.0005, 0.5, null],
  [0.1, 0.1, 0.0004, 0.5, null],
  [1.0, 1.0, 0.0006, 0.5, null],
  [5.0, 5.0, 0.0005, 0.5, null],
  [10.0, 10.0, 0.0004, 0.5, null],
  [20.0, 20.0, 0.0007, 0.5, null],
  [50.0, 50.0, 0.0005, 0.5, null],
  [75.0, 75.0, 0.0008, 1.0, null],
  [100.0, 100.0, 0.0006, 1.0, null],
  [110.0, 110.0, 0.0007, 1.0, null],
  [120.0, 120.0, 0.0005, 1.0, null],
];

const s5Weighing = [
  ...s5AscLoads.map(([load, ind, dl, mpe, note], i) =>
    makeObs(i + 1, 'ASCENDING', load, ind, dl, e5, mpe, 0, note)
  ),
  ...[...s5AscLoads].reverse().map(([load, ind, dl, mpe, note], i) =>
    makeObs(12 + i, 'DESCENDING', load, ind, dl + (i % 2 === 0 ? 0.00005 : -0.00005), e5, mpe, 0, note)
  ),
  makeObs(23, 'REPEATABILITY', 60.0, 60.0, 0.00052, e5, 1.0, 0, 'Class I Repeatability #1'),
  makeObs(24, 'REPEATABILITY', 60.0, 60.0, 0.00054, e5, 1.0, 0, 'Class I Repeatability #2'),
  makeObs(25, 'REPEATABILITY', 120.0, 120.0, 0.00053, e5, 1.0, 0, 'Class I Repeatability #3'),
  makeObs(26, 'REPEATABILITY', 120.0, 120.0, 0.00055, e5, 1.0, 0, 'Class I Repeatability #4'),
];

export const SCENARIO_5: SyntheticScenario = {
  id: 'high_interval_class_i_analytical',
  scenario_number: 5,
  title: 'Special Accuracy Class I Analytical Balance (n = 120,000 Intervals)',
  short_title: '5. Class I Analytical (PASS)',
  category: 'HIGH_PRECISION_ANALYTICAL',
  description:
    'Ultra-precision electromagnetic force restoration balance with 120,000 verification scale intervals (e = 0.001 g, d = 0.0001 g). Demonstrates sub-milligram changeover calculation and zero floating-point roundoff errors.',
  highlight_aspect: 'Validates 6-decimal-place Decimal precision and OIML R 76-1 Table 3 Class I criteria.',
  technical_explanation:
    'Under Table 3, Special Accuracy Class I requires verification interval e ≥ 1 mg and number of intervals n ≥ 50,000. This instrument operates at n = 120,000 intervals. Changeover auxiliary weights utilize sub-milligram riders (ΔL ≈ 0.4 - 0.8 mg). Maximum error consumes less than 15% of the allowable ±1.0 mg MPE band.',
  accuracy_class: 'CLASS_I',
  manufacturer: 'Sartorius Metrology AG',
  model_name: 'Secura Micro-Analytical 120-4S',
  serial_number: 'SM-2026-ANA-120K',
  max_capacity: 120.0,
  min_capacity: 0.01,
  e: 0.001,
  d: 0.0001,
  n: 120000,
  unit: 'g',
  verification_stage: 'INITIAL_TYPE_APPROVAL',
  expected_verdict: 'PASS',
  observations_count: 31,
  rounding_trap_highlight: null,
  weighing_observations: s5Weighing,
  eccentricity_observations: [
    { position: 'CENTER', position_number: 1, label: 'Center (Pos 1)', target_load: 40.0, indication: 40.0, auxiliary_load: 0.0005, true_indication: 40.0, corrected_error: 0.0, mpe_limit: 0.0005, status: 'PASS' },
    { position: 'FRONT_LEFT', position_number: 2, label: 'Front Left (Pos 2)', target_load: 40.0, indication: 40.0, auxiliary_load: 0.00052, true_indication: 39.99998, corrected_error: -0.00002, mpe_limit: 0.0005, status: 'PASS' },
    { position: 'BACK_LEFT', position_number: 3, label: 'Back Left (Pos 3)', target_load: 40.0, indication: 40.0, auxiliary_load: 0.00048, true_indication: 40.00002, corrected_error: 0.00002, mpe_limit: 0.0005, status: 'PASS' },
    { position: 'BACK_RIGHT', position_number: 4, label: 'Back Right (Pos 4)', target_load: 40.0, indication: 40.0, auxiliary_load: 0.00054, true_indication: 39.99996, corrected_error: -0.00004, mpe_limit: 0.0005, status: 'PASS' },
    { position: 'FRONT_RIGHT', position_number: 5, label: 'Front Right (Pos 5)', target_load: 40.0, indication: 40.0, auxiliary_load: 0.00049, true_indication: 40.00001, corrected_error: 0.00001, mpe_limit: 0.0005, status: 'PASS' },
  ],
  audit_notes: [
    'Special Accuracy Class I certified under OIML R 76-1 Table 3.',
    'Tested with Class E2 primary standard weights traceable to NPL National Prototype.',
    'Draft shield closed and environmental vibration dampening verified.',
  ],
};

export const ALL_SYNTHETIC_SCENARIOS: Record<string, SyntheticScenario> = {
  standard_class_iii_retail: SCENARIO_1,
  rounding_discrepancy_trap: SCENARIO_2,
  temperature_span_drift_fail: SCENARIO_3,
  eccentricity_cantilever_twist: SCENARIO_4,
  high_interval_class_i_analytical: SCENARIO_5,
};

export const SYNTHETIC_SCENARIO_LIST: SyntheticScenario[] = [
  SCENARIO_1,
  SCENARIO_2,
  SCENARIO_3,
  SCENARIO_4,
  SCENARIO_5,
];
