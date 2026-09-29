/**
 * METROLOGIX-76 — Synthetic Metrological Edge-Case Scenario Types.
 *
 * Conforming to OIML R 76-1:2006 Clause 3.2, 3.5, A.4.4.3, A.4.7, A.5.3.
 */

import type { AccuracyClass, ComplianceStatus, VerificationStage } from './index';

export interface SyntheticObservation {
  id: string;
  step: number;
  direction: 'ASCENDING' | 'DESCENDING' | 'REPEATABILITY' | 'ECCENTRICITY';
  target_load: number;
  indication: number;
  auxiliary_load: number;
  true_indication: number;
  uncorrected_error: number;
  zero_error: number;
  corrected_error: number;
  mpe_limit: number;
  mpe_in_e: string;
  margin: number;
  status: ComplianceStatus;
  is_zero_point: boolean;
  notes?: string | null;
  naive_error?: number | null;
  naive_status?: ComplianceStatus | null;
}

export interface SyntheticCornerObservation {
  position: string;
  position_number: number;
  label: string;
  target_load: number;
  indication: number;
  auxiliary_load: number;
  true_indication: number;
  corrected_error: number;
  mpe_limit: number;
  status: ComplianceStatus;
  notes?: string | null;
}

export interface RoundingTrapHighlight {
  step: number;
  target_load: number;
  display_indication: number;
  auxiliary_weight_delta_l: number;
  naive_calculation: {
    formula: string;
    computed_error: number;
    allowable_mpe: number;
    verdict: string;
  };
  oiml_statutory_calculation: {
    formula: string;
    computed_error: number;
    allowable_mpe: number;
    verdict: string;
  };
  statutory_citation: string;
}

export interface SyntheticScenario {
  id: string;
  scenario_number: number;
  title: string;
  short_title: string;
  category: string;
  description: string;
  highlight_aspect: string;
  technical_explanation: string;
  accuracy_class: AccuracyClass;
  manufacturer: string;
  model_name: string;
  serial_number: string;
  max_capacity: number;
  min_capacity: number;
  e: number;
  d: number;
  n: number;
  unit: string;
  verification_stage: VerificationStage;
  expected_verdict: ComplianceStatus;
  observations_count: number;
  rounding_trap_highlight?: RoundingTrapHighlight | null;
  weighing_observations: SyntheticObservation[];
  eccentricity_observations: SyntheticCornerObservation[];
  audit_notes: string[];
}

export interface ScenarioSummary {
  id: string;
  scenario_number: number;
  title: string;
  short_title: string;
  category: string;
  description: string;
  highlight_aspect: string;
  technical_explanation: string;
  accuracy_class: AccuracyClass;
  manufacturer: string;
  model_name: string;
  serial_number: string;
  max_capacity: number;
  min_capacity: number;
  e: number;
  d: number;
  n: number;
  unit: string;
  verification_stage: VerificationStage;
  expected_verdict: ComplianceStatus;
  observations_count: number;
  rounding_trap_highlight?: RoundingTrapHighlight | null;
}
