/**
 * METROLOGIX-76 — Synthetic Metrological Edge-Case Scenario Context.
 *
 * Manages 1-click loading and state synchronization across the Observation Grid,
 * Error Corridor Chart, Platter Heatmap, and Review Pipeline.
 */

import React, { createContext, useContext, useState, useCallback } from 'react';
import type { SyntheticScenario } from '../types/scenarios';
import {
  ALL_SYNTHETIC_SCENARIOS,
  SYNTHETIC_SCENARIO_LIST,
  SCENARIO_2,
} from '../data/syntheticScenarios';

interface ScenarioContextType {
  activeScenario: SyntheticScenario | null;
  isLoadingScenario: boolean;
  scenarioError: string | null;
  allScenarios: SyntheticScenario[];
  loadScenario: (scenarioId: string) => Promise<SyntheticScenario>;
  clearScenario: () => void;
  isRoundingTrapActive: boolean;
  loadedSessionId: string | null;
  loadedSessionNumber: string | null;
}

const ScenarioContext = createContext<ScenarioContextType | undefined>(undefined);

export const ScenarioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Start with Scenario 2 ("Rounding Trap") ready or available as primary showcase
  const [activeScenario, setActiveScenario] = useState<SyntheticScenario | null>(SCENARIO_2);
  const [isLoadingScenario, setIsLoadingScenario] = useState<boolean>(false);
  const [scenarioError, setScenarioError] = useState<string | null>(null);
  const [loadedSessionId, setLoadedSessionId] = useState<string | null>('SES-DEMO-02-LOCAL');
  const [loadedSessionNumber, setLoadedSessionNumber] = useState<string | null>(
    'SES-DEMO-02-TRAP'
  );

  const loadScenario = useCallback(async (scenarioId: string): Promise<SyntheticScenario> => {
    setIsLoadingScenario(true);
    setScenarioError(null);

    // Baseline fallback from static registry
    const fallbackScenario = ALL_SYNTHETIC_SCENARIOS[scenarioId] || SCENARIO_2;

    try {
      // Attempt backend 1-click load API call
      const response = await fetch(`/api/v1/sessions/load-scenario/${scenarioId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.scenario) {
          setActiveScenario(data.scenario);
          setLoadedSessionId(data.session_id);
          setLoadedSessionNumber(data.session_number);
          setIsLoadingScenario(false);
          return data.scenario;
        }
      }
    } catch {
      // Graceful offline fallback to static authentic dataset
    }

    // Use local authentic scenario dataset
    setActiveScenario(fallbackScenario);
    setLoadedSessionId(`SES-DEMO-${fallbackScenario.scenario_number}-LOCAL`);
    setLoadedSessionNumber(
      `SES-DEMO-${String(fallbackScenario.scenario_number).padStart(2, '0')}-LOCAL`
    );
    setIsLoadingScenario(false);
    return fallbackScenario;
  }, []);

  const clearScenario = useCallback(() => {
    setActiveScenario(null);
    setLoadedSessionId(null);
    setLoadedSessionNumber(null);
  }, []);

  const isRoundingTrapActive = activeScenario?.id === 'rounding_discrepancy_trap';

  return (
    <ScenarioContext.Provider
      value={{
        activeScenario,
        isLoadingScenario,
        scenarioError,
        allScenarios: SYNTHETIC_SCENARIO_LIST,
        loadScenario,
        clearScenario,
        isRoundingTrapActive,
        loadedSessionId,
        loadedSessionNumber,
      }}
    >
      {children}
    </ScenarioContext.Provider>
  );
};

export const useScenario = (): ScenarioContextType => {
  const context = useContext(ScenarioContext);
  if (!context) {
    throw new Error('useScenario must be used within a ScenarioProvider');
  }
  return context;
};
