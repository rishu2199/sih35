import React, { createContext, useContext, useState, useEffect } from 'react';
import { SyntheticScenario } from '../types/scenario';
import { ALL_SYNTHETIC_SCENARIOS } from '../data/scenarios';
import { emitAuditEvent } from '../lib/audit/auditEvents';

interface ScenarioContextType {
  activeScenario: SyntheticScenario | null;
  activeScenarioId: string | null;
  loading: boolean;
  error: string | null;
  allScenarios: Record<string, SyntheticScenario>;
  isRoundingTrapActive: boolean;
  loadedSessionId: string | null;
  loadedSessionNumber: string | null;

  // Actions
  loadScenario: (scenarioId: string) => SyntheticScenario;
  clearScenario: () => void;
}

const STORAGE_KEY_SCENARIO = 'metrologix:activeScenario';
const STORAGE_KEY_LOADED_SESSION_ID = 'metrologix:loadedSessionId';

const ScenarioContext = createContext<ScenarioContextType | null>(null);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_SCENARIO);
      if (stored && ALL_SYNTHETIC_SCENARIOS[stored]) return stored;
    } catch (e) {
      // Ignore
    }
    return 'standard_class_iii_retail';
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const activeScenario = activeScenarioId ? ALL_SYNTHETIC_SCENARIOS[activeScenarioId] || null : null;
  const isRoundingTrapActive = activeScenarioId === 'rounding_discrepancy_trap';
  const loadedSessionId = activeScenario?.session.id || null;
  const loadedSessionNumber = activeScenario?.session.sessionNumber || null;

  useEffect(() => {
    if (activeScenarioId) {
      try {
        localStorage.setItem(STORAGE_KEY_SCENARIO, activeScenarioId);
        if (loadedSessionId) {
          localStorage.setItem(STORAGE_KEY_LOADED_SESSION_ID, loadedSessionId);
        }
      } catch (e) {
        // Ignore
      }
    }
  }, [activeScenarioId, loadedSessionId]);

  const loadScenario = (scenarioId: string): SyntheticScenario => {
    setLoading(true);
    setError(null);

    const normalized = scenarioId.toLowerCase().replace(/[^a-z0-9_]/g, '_');
    let matchedId = 'standard_class_iii_retail';

    if (normalized.includes('rounding') || normalized.includes('trap')) {
      matchedId = 'rounding_discrepancy_trap';
    } else if (normalized.includes('temp') || normalized.includes('drift')) {
      matchedId = 'temperature_span_drift_fail';
    } else if (normalized.includes('cantilever') || normalized.includes('eccentricity')) {
      matchedId = 'eccentricity_cantilever_twist';
    } else if (normalized.includes('micro') || normalized.includes('class_i') || normalized.includes('analytical')) {
      matchedId = 'high_interval_class_i_analytical';
    } else if (ALL_SYNTHETIC_SCENARIOS[scenarioId]) {
      matchedId = scenarioId;
    }

    const scenario = ALL_SYNTHETIC_SCENARIOS[matchedId];
    setActiveScenarioId(matchedId);
    setLoading(false);

    emitAuditEvent({
      action: 'LOAD_SCENARIO',
      sessionId: scenario.session.id,
      metadata: {
        scenarioId: matchedId,
        scenarioName: scenario.name,
        severity: scenario.severity,
      },
    });

    return scenario;
  };

  const clearScenario = () => {
    setActiveScenarioId(null);
    try {
      localStorage.removeItem(STORAGE_KEY_SCENARIO);
      localStorage.removeItem(STORAGE_KEY_LOADED_SESSION_ID);
    } catch (e) {
      // Ignore
    }
  };

  return (
    <ScenarioContext.Provider
      value={{
        activeScenario,
        activeScenarioId,
        loading,
        error,
        allScenarios: ALL_SYNTHETIC_SCENARIOS,
        isRoundingTrapActive,
        loadedSessionId,
        loadedSessionNumber,
        loadScenario,
        clearScenario,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = () => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
