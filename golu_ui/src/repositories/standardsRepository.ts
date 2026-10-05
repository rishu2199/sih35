import { StandardWeightSet, TraceabilityState } from '../types/standards';
import { CANONICAL_STANDARDS, DEFAULT_TRACEABILITY_VALID, LOCKED_OUT_TRACEABILITY } from '../data/standards';

export interface StandardsRepository {
  list(): Promise<StandardWeightSet[]>;
  getById(id: string): Promise<StandardWeightSet | null>;
  getActiveSet(): Promise<StandardWeightSet>;
  setActiveSet(id: string): Promise<void>;
  getTraceabilityState(): Promise<TraceabilityState>;
  setStandardStatus(id: string, status: 'VALID' | 'EXPIRING' | 'EXPIRED' | 'LOCKED'): Promise<void>;
}

const STORAGE_KEY_STANDARDS = 'metrologix:standards';
const STORAGE_KEY_ACTIVE_STANDARD_ID = 'metrologix:activeStandardId';

class MockStandardsRepository implements StandardsRepository {
  private standards: Map<string, StandardWeightSet> = new Map();
  private activeStandardId: string = 'set-m1-2024-009';

  constructor() {
    this.loadFromStorageOrSeed();
  }

  private loadFromStorageOrSeed(): void {
    CANONICAL_STANDARDS.forEach((std) => {
      this.standards.set(std.id, { ...std });
    });

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_STANDARDS);
        if (stored) {
          const list: StandardWeightSet[] = JSON.parse(stored);
          list.forEach((s) => this.standards.set(s.id, s));
        }
        const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_STANDARD_ID);
        if (activeId && this.standards.has(activeId)) {
          this.activeStandardId = activeId;
        }
      } catch (e) {
        console.warn('LocalStorage error in MockStandardsRepository', e);
      }
    }
  }

  private persist(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const arr = Array.from(this.standards.values());
        localStorage.setItem(STORAGE_KEY_STANDARDS, JSON.stringify(arr));
        localStorage.setItem(STORAGE_KEY_ACTIVE_STANDARD_ID, this.activeStandardId);
      } catch (e) {
        // Ignore
      }
    }
  }

  async list(): Promise<StandardWeightSet[]> {
    return Array.from(this.standards.values());
  }

  async getById(id: string): Promise<StandardWeightSet | null> {
    const s = this.standards.get(id);
    return s ? { ...s } : null;
  }

  async getActiveSet(): Promise<StandardWeightSet> {
    const found = this.standards.get(this.activeStandardId);
    if (found) return { ...found };
    const first = Array.from(this.standards.values())[0];
    return { ...first };
  }

  async setActiveSet(id: string): Promise<void> {
    if (this.standards.has(id)) {
      this.activeStandardId = id;
      this.persist();
    }
  }

  async getTraceabilityState(): Promise<TraceabilityState> {
    const active = await this.getActiveSet();
    if (active.status === 'EXPIRED') {
      return {
        ...LOCKED_OUT_TRACEABILITY,
        standardSetId: active.id,
        lockoutReason: `Standard weight set ${active.code} expired on ${active.validUntil}. Testing cannot continue until a valid set is selected.`,
      };
    }
    return {
      ...DEFAULT_TRACEABILITY_VALID,
      standardSetId: active.id,
      expiryDate: active.validUntil,
    };
  }

  async setStandardStatus(id: string, status: 'VALID' | 'EXPIRING' | 'EXPIRED' | 'LOCKED'): Promise<void> {
    const existing = this.standards.get(id);
    if (existing) {
      existing.status = status;
      this.standards.set(id, existing);
      this.persist();
    }
  }
}

export const standardsRepository: StandardsRepository = new MockStandardsRepository();
