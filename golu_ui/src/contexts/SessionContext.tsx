import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  VerificationSession,
  ObservationRow,
  ComplianceStatus,
  ReviewStatus,
} from '../types';
import { loadScenario, SYNTHETIC_SCENARIOS } from '../lib/session/scenarioEngine';
import { getSessionLockState, LockStateInfo } from '../lib/session/lockStateEngine';
import {
  getSessionProgress,
  getNextBestAction,
  getSessionVerdictSummary,
  getCompletedStepCount,
  getApplicableProcedureCount,
  getTraceabilityStatus,
  getBlockingIssues,
  getPendingActions,
  SessionProgressInfo,
  NextActionInfo,
  SessionVerdictSummary,
} from '../lib/session/sessionSelectors';
import {
  startTesting as actionStartTesting,
  completeReadiness as actionCompleteReadiness,
  updateObservation as actionUpdateObservation,
  submitForReview as actionSubmitForReview,
  addReviewComment as actionAddReviewComment,
  remandSession as actionRemandSession,
  approveReview as actionApproveReview,
  signCertificate as actionSignCertificate,
  lockApprovedSession as actionLockApprovedSession,
  ObservationPatch,
} from '../lib/session/sessionActions';
import { assertSessionEditable } from '../lib/session/sessionGuards';
import { sessionRepository } from '../repositories/sessionRepository';

interface SessionContextType {
  activeSession: VerificationSession;
  activeScenarioId: string;
  lockInfo: LockStateInfo;
  progress: SessionProgressInfo;
  nextAction: NextActionInfo;
  verdictSummary: SessionVerdictSummary;
  standardsValid: boolean;
  isImmutable: boolean;
  blockingIssues: string[];
  pendingActions: string[];
  allSessions: VerificationSession[];

  // Actions (§7, §8)
  refreshSessions: () => Promise<void>;
  selectSessionById: (sessionId: string) => Promise<boolean>;
  setActiveSessionDirect: (session: VerificationSession) => void;
  createSessionFromPreset: (presetKey: string) => Promise<VerificationSession>;
  createSessionFromIntake: (intakeData: any) => Promise<VerificationSession>;
  loadScenarioById: (scenarioId: string) => void;
  updateSession: (updater: (prev: VerificationSession) => VerificationSession) => void;
  startTesting: () => void;
  completeReadiness: () => void;
  updateObservationRow: (rowIdOrIndex: string | number, patch: ObservationPatch) => void;
  recordWeighingObservation: (obs: ObservationRow) => void;
  submitForReview: (notes?: string) => void;
  addReviewComment: (comment: { testKey: string; comment: string; author: string; rowIndex?: number }) => void;
  remandSession: (comments: string) => void;
  approveReview: () => void;
  signCertificate: (signedBy: string, role: string) => void;
  lockSession: () => void;
  setStandardsValid: (valid: boolean) => void;
  resetToDefault: () => void;
}

const STORAGE_KEY_ACTIVE_SCENARIO = 'metrologix:activeScenario';
const STORAGE_KEY_ACTIVE_SESSION_DATA = 'metrologix:activeSessionData';

const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_ACTIVE_SCENARIO);
      if (stored) return stored;
    } catch (e) {
      // Ignore
    }
    return 'standard_class_iii_retail';
  });

  const [activeSession, setActiveSession] = useState<VerificationSession>(() => {
    try {
      const storedData = localStorage.getItem(STORAGE_KEY_ACTIVE_SESSION_DATA);
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (e) {
      // Ignore
    }
    return loadScenario('standard_class_iii_retail');
  });

  const [standardsValid, setStandardsValid] = useState<boolean>(true);
  const [allSessions, setAllSessions] = useState<VerificationSession[]>([]);

  const refreshSessions = async () => {
    try {
      const list = await sessionRepository.list();
      setAllSessions(list);
    } catch (e) {
      console.warn('Failed to load session list from repository', e);
    }
  };

  useEffect(() => {
    refreshSessions();
  }, [activeSession]);

  const selectSessionById = async (idOrSessionNumber: string): Promise<boolean> => {
    const found =
      (await sessionRepository.getById(idOrSessionNumber)) ||
      (await sessionRepository.getBySessionNumber(idOrSessionNumber));
    if (found) {
      setActiveSession(found);
      await sessionRepository.setActiveSession(found);
      return true;
    }
    return false;
  };

  const setActiveSessionDirect = (session: VerificationSession) => {
    setActiveSession(session);
    sessionRepository.setActiveSession(session);
  };

  const createSessionFromPreset = async (presetKey: string): Promise<VerificationSession> => {
    const created = await sessionRepository.createFromPreset(presetKey);
    setActiveSession(created);
    await refreshSessions();
    return created;
  };

  const createSessionFromIntake = async (intakeData: any): Promise<VerificationSession> => {
    const created = await sessionRepository.createFromIntake(intakeData);
    setActiveSession(created);
    await refreshSessions();
    return created;
  };

  // Sync to localStorage whenever active session changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_ACTIVE_SCENARIO, activeScenarioId);
      localStorage.setItem(STORAGE_KEY_ACTIVE_SESSION_DATA, JSON.stringify(activeSession));
      sessionRepository.setActiveSession(activeSession);
    } catch (e) {
      // Ignore
    }
  }, [activeSession, activeScenarioId]);

  // Derived state engines (§29, §30, §31)
  const lockInfo = getSessionLockState(activeSession as any, standardsValid);
  const progress = getSessionProgress(activeSession);
  const nextAction = getNextBestAction(activeSession);
  const verdictSummary = getSessionVerdictSummary(activeSession);
  const isImmutable = !!activeSession.isImmutable || activeSession.reviewStatus === 'APPROVED';
  const blockingIssues = getBlockingIssues(activeSession);
  const pendingActions = getPendingActions(activeSession);

  const loadScenarioById = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    const newSession = loadScenario(scenarioId);
    setActiveSession(newSession);
  };

  const updateSession = (updater: (prev: VerificationSession) => VerificationSession) => {
    try {
      assertSessionEditable(activeSession);
    } catch (err: any) {
      console.warn('Mutation blocked by statutory session guard:', err.message);
      return;
    }
    setActiveSession(updater);
  };

  const startTesting = () => {
    try {
      const updated = actionStartTesting(activeSession);
      setActiveSession(updated);
    } catch (err: any) {
      console.warn('startTesting blocked:', err.message);
    }
  };

  const completeReadiness = () => {
    try {
      const updated = actionCompleteReadiness(activeSession);
      setActiveSession(updated);
    } catch (err: any) {
      console.warn('completeReadiness blocked:', err.message);
    }
  };

  const updateObservationRow = (rowIdOrIndex: string | number, patch: ObservationPatch) => {
    try {
      const updated = actionUpdateObservation(activeSession, rowIdOrIndex, patch);
      setActiveSession(updated);
    } catch (err: any) {
      console.warn('updateObservation blocked:', err.message);
    }
  };

  const recordWeighingObservation = (obs: ObservationRow) => {
    try {
      assertSessionEditable(activeSession);
    } catch (err: any) {
      console.warn('recordWeighingObservation blocked:', err.message);
      return;
    }

    const rowId = obs.id || obs.stepIndex || obs.stepNumber || 1;
    const patch: ObservationPatch = {
      scaleReading: obs.scaleReading !== undefined ? obs.scaleReading : (obs.indicationI || 0),
      auxiliaryDeltaL: obs.auxiliaryDeltaL !== undefined ? obs.auxiliaryDeltaL : (obs.turningPointDeltaL || 0),
      hasComment: obs.hasComment,
    };
    updateObservationRow(rowId, patch);
  };

  const submitForReview = (notes?: string) => {
    try {
      const updated = actionSubmitForReview(activeSession, notes);
      setActiveSession(updated);
    } catch (err: any) {
      console.warn('submitForReview blocked:', err.message);
    }
  };

  const addReviewComment = (comment: { testKey: string; comment: string; author: string; rowIndex?: number }) => {
    try {
      const updated = actionAddReviewComment(activeSession, {
        testKey: comment.testKey,
        rowIndex: comment.rowIndex,
        comment: comment.comment,
        author: comment.author,
        resolved: false,
      });
      setActiveSession(updated);
    } catch (err: any) {
      console.warn('addReviewComment blocked:', err.message);
    }
  };

  const remandSession = (reason: string) => {
    try {
      const updated = actionRemandSession(activeSession, reason);
      setActiveSession(updated);
    } catch (err: any) {
      console.warn('remandSession blocked:', err.message);
    }
  };

  const approveReview = () => {
    try {
      const updated = actionApproveReview(activeSession);
      setActiveSession(updated);
    } catch (err: any) {
      console.warn('approveReview blocked:', err.message);
    }
  };

  const signCertificate = (signedBy: string, role: string) => {
    try {
      const certId = `CERT-2026-IND-${Math.floor(100000 + Math.random() * 900000)}`;
      const digest = '0xa8f3b49c0d12e345f67890abcdef1234567890abcdef1234567890abcdef1234';
      const updated = actionSignCertificate(activeSession, {
        directorName: signedBy,
        certificateId: certId,
        digest,
        declarationAccepted: true,
        sealApplied: true,
      });
      setActiveSession(updated);
    } catch (err: any) {
      console.warn('signCertificate blocked:', err.message);
    }
  };

  const lockSession = () => {
    const updated = actionLockApprovedSession(activeSession);
    setActiveSession(updated);
  };

  const resetToDefault = () => {
    loadScenarioById('standard_class_iii_retail');
    setStandardsValid(true);
  };

  return (
    <SessionContext.Provider
      value={{
        activeSession,
        activeScenarioId,
        lockInfo,
        progress,
        nextAction,
        verdictSummary,
        standardsValid,
        isImmutable,
        blockingIssues,
        pendingActions,
        allSessions,
        refreshSessions,
        selectSessionById,
        setActiveSessionDirect,
        createSessionFromPreset,
        createSessionFromIntake,
        loadScenarioById,
        updateSession,
        startTesting,
        completeReadiness,
        updateObservationRow,
        recordWeighingObservation,
        submitForReview,
        addReviewComment,
        remandSession,
        approveReview,
        signCertificate,
        lockSession,
        setStandardsValid,
        resetToDefault,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
