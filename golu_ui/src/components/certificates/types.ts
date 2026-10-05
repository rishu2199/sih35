export type CertificateLanguage = 'en' | 'hi' | 'bilingual';

export type CertificateStatus = 'VERIFIED' | 'REMANDED' | 'SUPERSEDED' | 'PENDING';

export interface CertificateItem {
  id: string; // e.g. "CERT-2026-000184"
  serialNumber: string; // e.g. "AV-2026-8812"
  sessionId: string; // e.g. "AV-2026-8812"
  instrument: string; // e.g. "Avery Weigh-Tronix ZM201 Retail Platform"
  model: string; // e.g. "ZM201 Retail Platform"
  manufacturer: string; // e.g. "Avery Weigh-Tronix"
  accuracyClass: string; // e.g. "Class III"
  maxCapacity: string; // e.g. "30 kg"
  maxCapacityNum: number; // 30
  unit: string; // "kg"
  interval: string; // e.g. "e = 5 g, d = 5 g"
  director: string; // e.g. "Dr. S. Sharma"
  directorRole: string; // e.g. "Director of Legal Metrology"
  laboratory: string; // e.g. "RRSL Bengaluru"
  approvedAt: string; // e.g. "04 Oct 2026"
  issuedAt: string; // ISO date or formatted
  validUntil: string; // e.g. "03 Oct 2027"
  status: CertificateStatus;
  qrPayload: string;
  verificationUrl: string;
  sha256Digest: string;
  standardWeightsUsed: string;
  availableLanguages: ('ENGLISH' | 'HINDI' | 'BILINGUAL')[];
  pdfAvailable: boolean;
  docxAvailable: boolean;
  testSummary: {
    physical: 'PASS' | 'FAIL';
    weighing: 'PASS' | 'FAIL';
    eccentricity: 'PASS' | 'FAIL' | 'MARGINAL';
    repeatability: 'PASS' | 'FAIL';
    environmental: 'PASS' | 'FAIL';
  };
  evidencePhotos: {
    title: string;
    description: string;
    verified: boolean;
  }[];
}
