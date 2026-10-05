import { UserRole } from '../../types/instrument';

export interface AuditEvent {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
  hash?: string;
}

const AUDIT_STORAGE_KEY = 'metrologix:audit_events';

// In-memory cache synced with localStorage
let auditTrailStore: AuditEvent[] = [];

// Simple deterministic hash generator for tamper-evident ledger simulation
function generateEventHash(
  prevHash: string,
  event: Omit<AuditEvent, 'hash'>
): string {
  const content = `${prevHash}|${event.id}|${event.timestamp}|${event.actorId}|${event.action}|${event.sessionId || ''}|${JSON.stringify(event.metadata || {})}`;
  let hash = 0x811c9dc5;
  for (let i = 0; i < content.length; i++) {
    hash ^= content.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  const hex = (hash >>> 0).toString(16).padStart(8, '0');
  return `0x${hex}${BufferHex(content).substring(0, 16)}`;
}

function BufferHex(str: string): string {
  let hex = '';
  for (let i = 0; i < str.length; i++) {
    hex += str.charCodeAt(i).toString(16);
  }
  return hex.padEnd(16, '0');
}

export function loadStoredAuditEvents(): AuditEvent[] {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
      if (raw) {
        auditTrailStore = JSON.parse(raw);
      }
    } catch (err) {
      console.warn('Could not read audit events from localStorage', err);
    }
  }
  return auditTrailStore;
}

export function emitAuditEvent(params: {
  actorId?: string;
  actorName?: string;
  actorRole?: UserRole;
  action: string;
  sessionId?: string;
  metadata?: Record<string, unknown>;
}): AuditEvent {
  if (auditTrailStore.length === 0) {
    loadStoredAuditEvents();
  }

  const prevHash = auditTrailStore.length > 0
    ? auditTrailStore[auditTrailStore.length - 1].hash || 'GENESIS-BLOCK'
    : '0x0000000000000000';

  const baseEvent: Omit<AuditEvent, 'hash'> = {
    id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    actorId: params.actorId || 'usr-metrologist-01',
    actorName: params.actorName || 'Shashi Shekhar',
    actorRole: params.actorRole || 'METROLOGIST',
    action: params.action,
    sessionId: params.sessionId,
    metadata: params.metadata || {},
  };

  const hash = generateEventHash(prevHash, baseEvent);
  const fullEvent: AuditEvent = { ...baseEvent, hash };

  auditTrailStore.push(fullEvent);

  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(auditTrailStore.slice(-100)));
    } catch (e) {
      // Ignore storage quota
    }
  }

  return fullEvent;
}

export function getAuditTrail(sessionId?: string): AuditEvent[] {
  if (auditTrailStore.length === 0) {
    loadStoredAuditEvents();
  }
  if (!sessionId) {
    return [...auditTrailStore];
  }
  return auditTrailStore.filter((evt) => !evt.sessionId || evt.sessionId === sessionId);
}

export function clearAuditTrail(): void {
  auditTrailStore = [];
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(AUDIT_STORAGE_KEY);
    } catch (e) {
      // Ignore
    }
  }
}
