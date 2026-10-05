export type AuditEventCategory =
  | 'INSTRUMENT'
  | 'TEST'
  | 'EVIDENCE'
  | 'REVIEW'
  | 'APPROVAL'
  | 'SIGNATURE'
  | 'CERTIFICATE'
  | 'SYSTEM';

export interface AuditEvent {
  id: string; // e.g. "AUD-000406"
  blockNumber: number; // Sequence index, e.g. 142
  action: string; // e.g. "WEIGHING_COMPLETED"
  title: string; // Human-readable: "Weighing Error & Linearity Series Recorded"
  category: AuditEventCategory;
  actor: string; // e.g. "Shashi Shekhar"
  role: string; // e.g. "METROLOGIST"
  timestamp: string; // ISO string
  timeFormatted: string; // "09:48:36"
  dateFormatted: string; // "04 Oct 2026"
  sessionId: string; // "AV-2026-8812"
  instrumentSummary: string; // "Avery ZM201 Retail Platform • Class III • 30 kg"
  hash: string; // 64-character SHA-256
  previousHash: string; // 64-character SHA-256
  details: string; // Human explanation of what was verified/recorded
  statutoryReference: string; // OIML / WELMEC rule
  payloadSummary: Record<string, string | number | boolean>;
  isValid: boolean;
  isCorrupted?: boolean;
}

export interface AuditChainState {
  totalEvents: number;
  totalActors: number;
  integrityIssues: number;
  lastVerifiedTime: string;
  isChainValid: boolean;
  corruptedBlockNumber?: number;
  corruptedEventId?: string;
  expectedHash?: string;
  receivedHash?: string;
  brokenLinkCount?: number;
}

export interface AuditSessionScope {
  id: string;
  label: string;
  instrument: string;
  serial: string;
  accuracyClass: string;
  capacity: string;
  eventsCount: number;
  isImmutable?: boolean;
  isSystemLedger?: boolean;
}
