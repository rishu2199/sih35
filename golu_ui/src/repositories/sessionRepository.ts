import { VerificationSession } from '../types/session';
import { ALL_SYNTHETIC_SCENARIOS } from '../data/scenarios';
import {
  INSTRUMENT_AVERY_ZM201,
  INSTRUMENT_METTLER_XPR,
  INSTRUMENT_SANSUI_GOLDMASTER,
  INSTRUMENT_ESSAE_DS215,
  INSTRUMENT_AVERY_8810,
  INSTRUMENT_METTLER_0048,
} from '../data/instruments';
import { instrumentRepository } from './instrumentRepository';

export interface SessionRepository {
  list(): Promise<VerificationSession[]>;
  getById(id: string): Promise<VerificationSession | null>;
  getBySessionNumber(sessionNumber: string): Promise<VerificationSession | null>;
  create(session: VerificationSession): Promise<VerificationSession>;
  update(session: VerificationSession): Promise<VerificationSession>;
  delete(id: string): Promise<boolean>;
  getActiveSession(): Promise<VerificationSession>;
  setActiveSession(session: VerificationSession): Promise<void>;
  createFromPreset(presetKey: string): Promise<VerificationSession>;
  createFromIntake(intakeData: any): Promise<VerificationSession>;
}

const STORAGE_KEY_SESSIONS = 'metrologix:sessions';
const STORAGE_KEY_ACTIVE_SESSION = 'metrologix:activeSession';

class MockSessionRepository implements SessionRepository {
  private sessions: Map<string, VerificationSession> = new Map();
  private activeSessionId: string = 'ses-av-2026-8812';

  constructor() {
    this.loadFromStorageOrSeed();
  }

  private loadFromStorageOrSeed(): void {
    // 1. Seed from scenarios
    Object.values(ALL_SYNTHETIC_SCENARIOS).forEach((scen) => {
      this.sessions.set(scen.session.id, JSON.parse(JSON.stringify(scen.session)));
    });

    // 2. Ensure the 6 canonical statutory sessions from OIML verification queue exist (§40)
    // VS-2026-00184 (Avery ZM201 Retail Platform, IN_TESTING, 5/7 steps)
    const s184 = this.sessions.get('ses-av-2026-8812');
    if (s184) {
      s184.sessionNumber = 'AV-2026-8812';
      s184.verificationStage = 'INITIAL_TYPE_APPROVAL';
      s184.reviewStatus = 'IN_TESTING';
      s184.activeStep = 5;
    }

    // VS-2026-00183 (Mettler XPR Micro-Balance, PENDING_REVIEW, 7/7 steps)
    const s183 = this.sessions.get('ses-mt-2026-0049');
    if (s183) {
      s183.sessionNumber = 'MT-2026-0049';
      s183.verificationStage = 'INITIAL_TYPE_APPROVAL';
      s183.reviewStatus = 'PENDING_REVIEW';
      s183.complianceStatus = 'PASS';
      s183.activeStep = 7;
    }

    // VS-2026-00182 (Sansui GoldMaster-6K, APPROVED, 7/7 steps)
    const s182 = this.sessions.get('ses-sn-2026-3391');
    if (s182) {
      s182.sessionNumber = 'SN-2026-3391';
      s182.verificationStage = 'SUBSEQUENT_VERIFICATION';
      s182.reviewStatus = 'APPROVED';
      s182.complianceStatus = 'PASS';
      s182.isImmutable = true;
      s182.activeStep = 7;
    }

    // VS-2026-00181 (Essae DS-215 Heavy Platform, REMANDED, 3/7 steps)
    const s181 = this.sessions.get('ses-et-2026-9041');
    if (s181) {
      s181.sessionNumber = 'ET-2026-9041';
      s181.verificationStage = 'SUBSEQUENT_VERIFICATION';
      s181.reviewStatus = 'REMANDED';
      s181.complianceStatus = 'FAIL';
      s181.activeStep = 3;
    }

    // VS-2026-00180 (Avery ZM201 Retail Platform, APPROVED, 7/7 steps)
    if (!this.sessions.has('ses-av-2026-8810')) {
      const s180: VerificationSession = JSON.parse(JSON.stringify(s184 || Object.values(ALL_SYNTHETIC_SCENARIOS)[0].session));
      s180.id = 'ses-av-2026-8810';
      s180.sessionNumber = 'AV-2026-8810';
      s180.instrumentId = INSTRUMENT_AVERY_8810.id;
      s180.verificationStage = 'SUBSEQUENT_VERIFICATION';
      s180.reviewStatus = 'APPROVED';
      s180.complianceStatus = 'PASS';
      s180.isImmutable = true;
      s180.activeStep = 7;
      this.sessions.set(s180.id, s180);
    }

    // VS-2026-00179 (Mettler XPR Micro-Balance, IN_TESTING, 2/7 steps)
    if (!this.sessions.has('ses-mt-2026-0048')) {
      const s179: VerificationSession = JSON.parse(JSON.stringify(s183 || Object.values(ALL_SYNTHETIC_SCENARIOS)[0].session));
      s179.id = 'ses-mt-2026-0048';
      s179.sessionNumber = 'MT-2026-0048';
      s179.instrumentId = INSTRUMENT_METTLER_0048.id;
      s179.verificationStage = 'INITIAL_TYPE_APPROVAL';
      s179.reviewStatus = 'IN_TESTING';
      s179.complianceStatus = 'PASS';
      s179.activeStep = 2;
      this.sessions.set(s179.id, s179);
    }

    // 3. Check localStorage for persisted overrides
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if (stored) {
          const list: VerificationSession[] = JSON.parse(stored);
          list.forEach((s) => this.sessions.set(s.id, s));
        }
        const activeId = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION);
        if (activeId && this.sessions.has(activeId)) {
          this.activeSessionId = activeId;
        }
      } catch (e) {
        console.warn('LocalStorage error in MockSessionRepository', e);
      }
    }
  }

  private persist(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const arr = Array.from(this.sessions.values());
        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(arr));
        localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION, this.activeSessionId);
      } catch (e) {
        // Ignore quota errors
      }
    }
  }

  async list(): Promise<VerificationSession[]> {
    return Array.from(this.sessions.values());
  }

  async getById(id: string): Promise<VerificationSession | null> {
    const s = this.sessions.get(id);
    if (s) return JSON.parse(JSON.stringify(s));
    // Fallback: check by sessionNumber
    return this.getBySessionNumber(id);
  }

  async getBySessionNumber(sessionNumber: string): Promise<VerificationSession | null> {
    const q = sessionNumber.toLowerCase().trim();
    for (const s of this.sessions.values()) {
      if (s.sessionNumber.toLowerCase() === q || s.id.toLowerCase() === q) {
        return JSON.parse(JSON.stringify(s));
      }
    }
    return null;
  }

  async create(session: VerificationSession): Promise<VerificationSession> {
    const clone = JSON.parse(JSON.stringify(session));
    this.sessions.set(clone.id, clone);
    this.activeSessionId = clone.id;
    this.persist();
    return clone;
  }

  async update(session: VerificationSession): Promise<VerificationSession> {
    const clone = JSON.parse(JSON.stringify(session));
    this.sessions.set(clone.id, clone);
    this.persist();
    return clone;
  }

  async delete(id: string): Promise<boolean> {
    const deleted = this.sessions.delete(id);
    this.persist();
    return deleted;
  }

  async getActiveSession(): Promise<VerificationSession> {
    const active = this.sessions.get(this.activeSessionId);
    if (active) return JSON.parse(JSON.stringify(active));
    const first = Array.from(this.sessions.values())[0];
    return JSON.parse(JSON.stringify(first));
  }

  async setActiveSession(session: VerificationSession): Promise<void> {
    this.activeSessionId = session.id;
    await this.update(session);
  }

  /**
   * One-click Preset Loading and Session Generation (§10, §11, §37)
   * Immediately instantiates instrument, creates coherent session, persists and prepares for session overview.
   */
  async createFromPreset(presetKey: string): Promise<VerificationSession> {
    const key = presetKey.toLowerCase();
    let instrument = INSTRUMENT_AVERY_ZM201;
    let sessionPrefix = 'AV-2026';

    if (key.includes('mettler') || key.includes('class_i') || key.includes('xp205')) {
      instrument = INSTRUMENT_METTLER_XPR;
      sessionPrefix = 'MT-2026';
    } else if (key.includes('sansui') || key.includes('class_ii') || key.includes('gold')) {
      instrument = INSTRUMENT_SANSUI_GOLDMASTER;
      sessionPrefix = 'SN-2026';
    } else if (key.includes('essae') || key.includes('class_iiii') || key.includes('ds215')) {
      instrument = INSTRUMENT_ESSAE_DS215;
      sessionPrefix = 'ET-2026';
    }

    // Ensure instrument is registered in instrumentRepository
    await instrumentRepository.create(instrument);

    const randId = Math.floor(1000 + Math.random() * 9000);
    const sessionId = `ses-${sessionPrefix.toLowerCase()}-${randId}`;
    const sessionNumber = `${sessionPrefix}-${randId}`;

    const now = new Date().toISOString();
    // Fresh session structure ready for Session Overview -> Readiness Gate (§36)
    const newSession: VerificationSession = {
      id: sessionId,
      sessionNumber: sessionNumber,
      instrumentId: instrument.id,
      verificationStage: 'INITIAL_TYPE_APPROVAL',
      reviewStatus: 'IN_TESTING',
      complianceStatus: 'PENDING',
      isImmutable: false,
      activeStep: 1,
      createdAt: now,
      updatedAt: now,

      readiness: {
        overallStatus: 'ATTENTION',
        score: 0,
        blockingIssues: ['Precondition checks pending'],
        checkedAt: now,
        checks: [
          { id: 'chk-1', label: 'Instrument Identity & Plate Legibility', category: 'INSTRUMENT', required: true, status: 'READY' },
          { id: 'chk-2', label: 'Reference Standard Weights Calibration Valid', category: 'TRACEABILITY', required: true, status: 'READY' },
          { id: 'chk-3', label: 'OIML R 76-1 Test Scope Matrix Generated', category: 'TEST_PLAN', required: true, status: 'READY' },
          { id: 'chk-4', label: 'Chamber Baseline & Leveling Bubble Centered', category: 'ENVIRONMENT', required: true, status: 'READY' },
        ],
        environmentStable: true,
        powerWarmupComplete: true,
        scaleLevelCentered: true,
        standardWeightsValid: true,
        standardWeightsId: 'SET-M1-2024-009 (RRSL-BLR)',
        ambientTemperatureC: 22.1,
        relativeHumidityPercent: 49,
        atmosphericPressureHpa: 1013.25,
        isReady: false,
        notes: 'Session created from preset. Ready for precondition checklist.',
      },

      testPlan: {
        verificationStage: 'INITIAL_TYPE_APPROVAL',
        allRequiredComplete: false,
        procedures: [
          { key: 'PHYSICAL', label: 'Physical & Visual Inspection', applicable: true, required: true, status: 'PENDING' },
          { key: 'WEIGHING', label: 'Weighing Linearity Test', applicable: true, required: true, status: 'PENDING' },
          { key: 'ECCENTRICITY', label: 'Eccentricity (Corner Load)', applicable: true, required: true, status: 'PENDING' },
          { key: 'REPEATABILITY', label: 'Repeatability Sequence', applicable: true, required: true, status: 'PENDING' },
          { key: 'ENVIRONMENT', label: 'Environmental / Tare Drift', applicable: true, required: true, status: 'PENDING' },
        ],
        applicableSteps: ['PHYSICAL', 'WEIGHING', 'ECCENTRICITY', 'REPEATABILITY', 'ENVIRONMENT'],
        weighingTestPoints: [0.1, 0.5, 2.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0],
        repeatabilityTestLoads: [10.0, 30.0],
        eccentricityTestLoad: 10.0,
        mpeTier1: 0.5,
        mpeTier2: 1.0,
        mpeTier3: 1.5,
      },

      physicalInspection: {
        markingsLegible: true,
        levelingIndicatorPresent: true,
        stampingSealsIntact: true,
        securityLockHardwareSecure: true,
        auditTrailVerified: true,
        status: 'PENDING',
        inspectorName: 'R. Sharma (Metrologist)',
        inspectedAt: now,
        notes: 'Pending initial visual inspection on test bench.',
      },

      weighing: {
        completed: false,
        overallStatus: 'PENDING',
        maxError: 0,
        maxObservedError: 0,
        minObservedError: 0,
        ascending: [],
        descending: [],
        observations: [],
        status: 'PENDING',
      },

      eccentricity: {
        geometry: 'SQUARE',
        completed: false,
        overallStatus: 'PENDING',
        points: [],
        locations: [],
        status: 'PENDING',
      },

      repeatability: {
        targetLoad: instrument.maxCapacity / 2,
        observedSpread: 0,
        allowableLimit: instrument.e,
        completed: false,
        overallStatus: 'PENDING',
        readings: [],
        runs: [],
        status: 'PENDING',
      },

      environment: {
        completed: false,
        status: 'PENDING',
        baseline: {
          temperature: 22.0,
          humidity: 50,
          pressure: 1013.25,
        },
        tare: {
          tareType: 'SUBTRACTIVE',
          tareValue: 0,
          scaleIndication: 0,
          error: 0,
          status: 'PENDING',
        },
        temperatureDrift: {
          tempStart: 20,
          tempEnd: 20,
          driftPpmPerK: 0,
          mpeLimit: 5,
          status: 'PENDING',
        },
        chamber: {
          temperatureC: 22.0,
          relativeHumidityPercent: 50,
          pressureHpa: 1013.25,
          dewPointC: 11.2,
          lastUpdated: now,
        },
      },

      traceability: {
        standardSetId: 'STD-RRSL-2026-018',
        calibrationValid: true,
        calibrationDate: '2026-01-10',
        expiryDate: '2027-03-31',
        daysRemaining: 180,
      },
    };

    return this.create(newSession);
  }

  /**
   * Register Instrument & Create Verification Session (§35, §36)
   */
  async createFromIntake(intakeData: any): Promise<VerificationSession> {
    const serial = intakeData.serialNumber || `SN-${Math.floor(1000 + Math.random() * 9000)}`;
    const brand = intakeData.manufacturer || 'Custom Manufacturer';
    const model = intakeData.model || 'Precision Weighing Platform';

    // Register physical instrument in repository
    const inst = await instrumentRepository.create({
      id: `inst-${serial.toLowerCase().replace(/[^a-z0-9]/g, '-')}`,
      manufacturer: brand,
      modelName: model,
      serialNumber: serial,
      approvalNumber: intakeData.approvalNumber || 'TAC-2026-III-091',
      accuracyClass: intakeData.accuracyClass || 'CLASS_III',
      maxCapacity: typeof intakeData.maxCapacity === 'number' ? intakeData.maxCapacity : parseFloat(intakeData.maxCapacity) || 30.0,
      minCapacity: typeof intakeData.minCapacity === 'number' ? intakeData.minCapacity : parseFloat(intakeData.minCapacity) || 0.1,
      e: typeof intakeData.verificationInterval === 'number' ? intakeData.verificationInterval : parseFloat(intakeData.verificationInterval) || 0.005,
      d: typeof intakeData.scaleInterval === 'number' ? intakeData.scaleInterval : parseFloat(intakeData.scaleInterval) || 0.005,
      unit: intakeData.unit || 'kg',
      n: Math.round((parseFloat(intakeData.maxCapacity) || 30.0) / (parseFloat(intakeData.verificationInterval) || 0.005)),
      receptorType: 'Flat Stainless Platter',
      numSupports: 4,
      verificationStage: 'INITIAL_TYPE_APPROVAL',
      firmwareVersion: 'v1.0.0',
      calibrationCounter: 1,
      status: 'IN_TESTING',
      complianceStatus: 'PENDING',
    });

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const prefix = brand.split(' ')[0].toUpperCase().substring(0, 2);
    const sessionNumber = `${prefix}-2026-${randNum}`;
    const sessionId = `ses-${prefix.toLowerCase()}-2026-${randNum}`;

    const now = new Date().toISOString();
    const newSession: VerificationSession = {
      id: sessionId,
      sessionNumber: sessionNumber,
      instrumentId: inst.id,
      verificationStage: 'INITIAL_TYPE_APPROVAL',
      reviewStatus: 'IN_TESTING',
      complianceStatus: 'PENDING',
      isImmutable: false,
      activeStep: 1,
      createdAt: now,
      updatedAt: now,

      readiness: {
        overallStatus: 'ATTENTION',
        score: 0,
        blockingIssues: ['Complete preflight readiness checklist'],
        checkedAt: now,
        checks: [
          { id: 'chk-1', label: 'Instrument Identity & Plate Legibility', category: 'INSTRUMENT', required: true, status: 'READY' },
          { id: 'chk-2', label: 'Reference Standard Weights Calibration Valid', category: 'TRACEABILITY', required: true, status: 'READY' },
          { id: 'chk-3', label: 'OIML R 76-1 Test Scope Matrix Generated', category: 'TEST_PLAN', required: true, status: 'READY' },
          { id: 'chk-4', label: 'Chamber Baseline & Leveling Bubble Centered', category: 'ENVIRONMENT', required: true, status: 'READY' },
        ],
        environmentStable: true,
        powerWarmupComplete: true,
        scaleLevelCentered: true,
        standardWeightsValid: true,
        standardWeightsId: 'SET-M1-2024-009 (RRSL-BLR)',
        ambientTemperatureC: 22.0,
        relativeHumidityPercent: 50,
        atmosphericPressureHpa: 1013.25,
        isReady: false,
        notes: 'Instrument registered from intake workflow. Ready for preflight checks.',
      },

      testPlan: {
        verificationStage: 'INITIAL_TYPE_APPROVAL',
        allRequiredComplete: false,
        procedures: [
          { key: 'PHYSICAL', label: 'Physical & Visual Inspection', applicable: true, required: true, status: 'PENDING' },
          { key: 'WEIGHING', label: 'Weighing Linearity Test', applicable: true, required: true, status: 'PENDING' },
          { key: 'ECCENTRICITY', label: 'Eccentricity (Corner Load)', applicable: true, required: true, status: 'PENDING' },
          { key: 'REPEATABILITY', label: 'Repeatability Sequence', applicable: true, required: true, status: 'PENDING' },
          { key: 'ENVIRONMENT', label: 'Environmental / Tare Drift', applicable: true, required: true, status: 'PENDING' },
        ],
        applicableSteps: ['PHYSICAL', 'WEIGHING', 'ECCENTRICITY', 'REPEATABILITY', 'ENVIRONMENT'],
        weighingTestPoints: [0.1, 0.5, 2.0, 5.0, 10.0, 15.0, 20.0, 25.0, 30.0],
        repeatabilityTestLoads: [10.0, 30.0],
        eccentricityTestLoad: 10.0,
        mpeTier1: 0.5,
        mpeTier2: 1.0,
        mpeTier3: 1.5,
      },

      physicalInspection: {
        markingsLegible: true,
        levelingIndicatorPresent: true,
        stampingSealsIntact: true,
        securityLockHardwareSecure: true,
        auditTrailVerified: true,
        status: 'PENDING',
        inspectorName: 'R. Sharma (Metrologist)',
        inspectedAt: now,
        notes: 'Pending initial visual inspection on test bench.',
      },

      weighing: {
        completed: false,
        overallStatus: 'PENDING',
        maxError: 0,
        maxObservedError: 0,
        minObservedError: 0,
        ascending: [],
        descending: [],
        observations: [],
        status: 'PENDING',
      },

      eccentricity: {
        geometry: 'SQUARE',
        completed: false,
        overallStatus: 'PENDING',
        points: [],
        locations: [],
        status: 'PENDING',
      },

      repeatability: {
        targetLoad: inst.maxCapacity / 2,
        observedSpread: 0,
        allowableLimit: inst.e,
        completed: false,
        overallStatus: 'PENDING',
        readings: [],
        runs: [],
        status: 'PENDING',
      },

      environment: {
        completed: false,
        status: 'PENDING',
        baseline: {
          temperature: 22.0,
          humidity: 50,
          pressure: 1013.25,
        },
        tare: {
          tareType: 'SUBTRACTIVE',
          tareValue: 0,
          scaleIndication: 0,
          error: 0,
          status: 'PENDING',
        },
        temperatureDrift: {
          tempStart: 20,
          tempEnd: 20,
          driftPpmPerK: 0,
          mpeLimit: 5,
          status: 'PENDING',
        },
        chamber: {
          temperatureC: 22.0,
          relativeHumidityPercent: 50,
          pressureHpa: 1013.25,
          dewPointC: 11.2,
          lastUpdated: now,
        },
      },

      traceability: {
        standardSetId: 'STD-RRSL-2026-018',
        calibrationValid: true,
        calibrationDate: '2026-01-10',
        expiryDate: '2027-03-31',
        daysRemaining: 180,
      },
    };

    return this.create(newSession);
  }
}

export const sessionRepository: SessionRepository = new MockSessionRepository();
