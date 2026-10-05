export type SettingsNavTab =
  | 'LABORATORY'
  | 'USERS'
  | 'STANDARDS'
  | 'DEFAULTS'
  | 'LANGUAGE'
  | 'CERTIFICATES'
  | 'APPEARANCE'
  | 'DEMO';

export type MetrologicalRole = 'METROLOGIST' | 'REVIEWER' | 'DIRECTOR' | 'AUDITOR' | 'ADMIN';

export interface LaboratoryConfig {
  id: string;
  name: string;
  code: string;
  city: string;
  state: string;
  country: string;
  labType: 'RRSL' | 'GATC' | 'CENTRAL_REFERENCE' | 'STATE_DISTRICT';
  nablAccreditationNo: string;
  nablStatus: 'ACTIVE' | 'EXPIRED' | 'RENEWAL_PENDING';
  nablValidUntil: string;
  address: string;
  contactEmail: string;
  contactPhone: string;
  brandingLogoName: string;
  governmentMarkConfigured: boolean;
  headerPreviewApproved: boolean;
}

export interface UserRoleItem {
  id: string;
  name: string;
  designation: string;
  email: string;
  role: MetrologicalRole;
  laboratory: string;
  status: 'ACTIVE' | 'INACTIVE';
  permissions: {
    registerInstruments: boolean;
    enterObservations: boolean;
    captureLiveReadings: boolean;
    submitForReview: boolean;
    reviewTestDossier: boolean;
    remandWithJustification: boolean;
    directorSignOff: boolean;
    modifySystemSettings: boolean;
    auditLedgerInspection: boolean;
  };
}

export interface StandardWeightSetItem {
  id: string;
  setId: string;
  accuracyClass: 'E2' | 'F1' | 'F2' | 'M1';
  calibrationLab: string;
  certificateNumber: string;
  calibrationDate: string;
  expiryDate: string;
  status: 'VALID' | 'EXPIRING' | 'EXPIRED' | 'RETIRED';
  daysRemaining: number;
}

export interface StandardsConfig {
  defaultWeightSetId: string;
  requireValidCalibration: boolean;
  blockTestingWhenExpired: boolean;
  expiryWarningDays: number;
  autoSyncWithRegistry: boolean;
  weightSets: StandardWeightSetItem[];
}

export interface TestDefaultsConfig {
  defaultVerificationStage: 'Subsequent Verification' | 'Initial Verification' | 'Re-verification';
  defaultUnit: 'kg' | 'g';
  defaultObservationLayout: 'SPLIT_VIEW' | 'TABULAR' | 'CHART_FOCUS';
  autoSaveObservations: boolean;
  autoCaptureStableReadings: boolean;
  showCalculationProof: 'ON_DEMAND' | 'ALWAYS' | 'NEVER';
  confirmBeforeSubmitting: boolean;
  enforceZeroTrackingVerification: boolean;
}

export interface LanguageSettingsConfig {
  applicationLanguage: 'ENGLISH' | 'HINDI';
  certificateLanguage: 'ENGLISH' | 'HINDI' | 'BILINGUAL';
  bilingualLayout: 'PARALLEL_COLUMNS' | 'INTERLEAVED';
}

export interface CertificateSettingsConfig {
  defaultFormat: 'PDF_A' | 'DOCX';
  verificationQrEnabled: boolean;
  digitalSignatureEnabled: boolean;
  certificateNumberPrefix: string;
  nextCertificateId: string;
  watermarkEnabled: boolean;
}

export interface AppearanceConfig {
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  density: 'COMFORTABLE' | 'COMPACT';
  fontFamily: 'IBM_PLEX_MONO' | 'INTER_SYSTEM';
  reducedMotion: boolean;
}

export interface DemoModeConfig {
  demoControlsEnabled: boolean;
  juryDemoAssistantEnabled: boolean;
  syntheticScenariosEnabled: boolean;
  virtualScaleSimulatorEnabled: boolean;
  tamperSimulationEnabled: boolean;
  availableScenarios: Array<{
    id: string;
    name: string;
    description: string;
    enabled: boolean;
  }>;
}

export interface SystemStatusInfo {
  version: string;
  connectionStatus: 'ONLINE' | 'OFFLINE' | 'SYNCING';
  dataSyncStatus: 'SYNCHRONIZED' | 'PENDING' | 'ERROR';
  activeNode: string;
  lastSavedTimestamp: string;
  databaseDriver: string;
}
