import { Instrument } from '../types/instrument';
import { CANONICAL_INSTRUMENTS } from '../data/instruments';

export interface InstrumentRepository {
  list(): Promise<Instrument[]>;
  getById(id: string): Promise<Instrument | null>;
  getBySerialNumber(serialNumber: string): Promise<Instrument | null>;
  create(instrument: Instrument): Promise<Instrument>;
  update(instrument: Instrument): Promise<Instrument>;
}

class MockInstrumentRepository implements InstrumentRepository {
  private instruments: Map<string, Instrument> = new Map();

  constructor() {
    CANONICAL_INSTRUMENTS.forEach((inst) => {
      this.instruments.set(inst.id, { ...inst });
    });
  }

  async list(): Promise<Instrument[]> {
    return Array.from(this.instruments.values());
  }

  async getById(id: string): Promise<Instrument | null> {
    const found = this.instruments.get(id);
    return found ? { ...found } : null;
  }

  async getBySerialNumber(serialNumber: string): Promise<Instrument | null> {
    for (const inst of this.instruments.values()) {
      if (inst.serialNumber.toLowerCase() === serialNumber.toLowerCase()) {
        return { ...inst };
      }
    }
    return null;
  }

  async create(instrument: Instrument): Promise<Instrument> {
    this.instruments.set(instrument.id, { ...instrument });
    return { ...instrument };
  }

  async update(instrument: Instrument): Promise<Instrument> {
    this.instruments.set(instrument.id, { ...instrument });
    return { ...instrument };
  }
}

export const instrumentRepository: InstrumentRepository = new MockInstrumentRepository();
