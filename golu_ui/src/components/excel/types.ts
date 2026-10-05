export type DiscrepancySeverity = 'HIGH' | 'MEDIUM' | 'LOW';

export type DiscrepancyCategory = 'FALSE_PASS' | 'FALSE_FAIL' | 'FORMULA_MISMATCH' | 'METADATA_MISMATCH' | 'DATA_ISSUE';

export interface AuditDiscrepancy {
  id: string;
  findingNumber: string; // e.g. "01", "02", "03"
  sheetName: string;
  rowNumber: number;
  testName: string;
  loadPoint: string;
  severity: DiscrepancySeverity;
  category: DiscrepancyCategory;
  title: string;
  legacyResult: 'PASS' | 'FAIL';
  recalculatedResult: 'PASS' | 'FAIL' | 'MARGINAL';
  legacyError: string;
  correctedError: string;
  difference: string;
  permissibleLimit: string;
  summary: string;
  whyItMatters: string;
  statutoryReference: string;
  calculationSnippet: string;
  legacyFormula?: string;
  digitalFormula?: string;
}

export interface WeighingRecalcRow {
  load: string;
  legacyReading: string;
  legacyError: string;
  digitalError: string;
  legacyResult: 'PASS' | 'FAIL';
  oimlTurningPoint: string;
  oimlLimit: string;
  oimlResult: 'PASS' | 'FAIL' | 'MARGINAL';
  differenceNotes: string;
}

export interface EccentricityComparisonRow {
  cornerNumber: number; // 1, 2, 3, 4
  position: 'A' | 'B' | 'C' | 'D';
  label: string;
  load: string;
  legacyDeviation: string;
  digitalDeviation: string;
  difference: string;
  status: 'MATCH' | 'DIFFERENCE' | 'HIGH-RISK';
  legacyResult: 'PASS' | 'FAIL';
  digitalResult: 'PASS' | 'FAIL';
  notes: string;
}

export interface MetadataFieldConfidence {
  field: string;
  value: string;
  status: 'CONFIDENT' | 'REQUIRES_CONFIRMATION';
  source: string;
}

export interface ExtractedWorkbookMetadata {
  fileName: string;
  fileSize: string;
  importedDate: string;
  totalSheets: number;
  totalRows: number;
  matchedRows: number;
  discrepanciesCount: number;
  highRiskCount: number;
  manufacturer: string;
  model: string;
  serialNumber: string;
  accuracyClass: string;
  maxCapacity: string;
  minCapacity: string;
  interval: string;
  scaleIntervalsCount: number;
  verificationStage: string;
  operator: string;
  reportDate: string;
  laboratory: string;
  workbookSheet: string;
  confidentFieldsCount: number;
  reviewFieldsCount: number;
  fieldConfidences: MetadataFieldConfidence[];
}
