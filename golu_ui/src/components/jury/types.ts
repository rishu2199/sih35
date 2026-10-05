export interface JuryDemoStep {
  id: string;
  stepNumber: number;
  minuteMarker: string; // e.g. "04:00"
  durationSeconds: number;
  title: string;
  subtitle: string;
  targetTab: string;
  suggestedRole?: 'Metrologist' | 'Reviewer' | 'Director' | 'Auditor';
  scenarioId?: string;
  scenarioName?: string;
  showText: string;
  focusAreas: string[];
  sayText: string;
  keyHighlights: string[];
  statutoryReference: string;
  statutoryDetail: string;
}

export type JuryTimerState = 'IDLE' | 'RUNNING' | 'PAUSED' | 'COMPLETE';

export interface JuryDemoState {
  isOpen: boolean;
  isActive: boolean;
  timerState: JuryTimerState;
  currentStepIndex: number;
  timeRemainingSeconds: number;
  visitedSteps: number[];
}
