import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
  ChevronDown,
  MessageSquare,
  Eye,
  CheckSquare,
  Award,
  Copy,
  Check,
  AlertTriangle,
  Layers,
  Database,
  Info,
} from 'lucide-react';
import { JuryDemoStep, JuryTimerState } from './types';
import { JURY_DEMO_STEPS } from './juryDemoData';

interface JuryDemoDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateToTab: (tabId: string) => void;
  onSwitchPersona?: (role: string) => void;
  onLoadScenario?: (scenarioId: string) => void;
  currentTab: string;
}

export const JuryDemoDrawer: React.FC<JuryDemoDrawerProps> = ({
  isOpen,
  onClose,
  onNavigateToTab,
  onSwitchPersona,
  onLoadScenario,
  currentTab,
}) => {
  const steps: JuryDemoStep[] = JURY_DEMO_STEPS;
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState<number>(600); // 10 minutes (600s)
  const [timerState, setTimerState] = useState<JuryTimerState>('IDLE');
  const [visitedSteps, setVisitedSteps] = useState<Set<number>>(new Set([0]));
  const [copiedScript, setCopiedScript] = useState<boolean>(false);
  const [showStatutoryRef, setShowStatutoryRef] = useState<boolean>(false);
  const [scenarioLoaded, setScenarioLoaded] = useState<string | null>(null);
  const [isTimelineExpanded, setIsTimelineExpanded] = useState<boolean>(false);

  const currentStep = steps[currentStepIndex] || steps[0];

  // Timer Tick Engine
  useEffect(() => {
    if (!isOpen || timerState !== 'RUNNING') return;

    const timer = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          setTimerState('COMPLETE');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, timerState]);

  // Format MM:SS with IBM Plex Mono font
  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step Switch Engine (Section 14 & 15: Automatic Navigation)
  const handleGoToStep = useCallback(
    (index: number) => {
      if (index < 0 || index >= steps.length) return;
      setCurrentStepIndex(index);
      setVisitedSteps((prev) => new Set([...prev, index]));
      setShowStatutoryRef(false);
      setCopiedScript(false);

      const targetStep = steps[index];
      if (targetStep) {
        onNavigateToTab(targetStep.targetTab);
        if (onSwitchPersona && targetStep.suggestedRole) {
          onSwitchPersona(targetStep.suggestedRole.toLowerCase());
        }
      }
    },
    [steps, onNavigateToTab, onSwitchPersona]
  );

  const handleNextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      if (timerState === 'IDLE') {
        setTimerState('RUNNING');
      }
      handleGoToStep(currentStepIndex + 1);
    } else {
      setTimerState('COMPLETE');
    }
  }, [currentStepIndex, steps.length, timerState, handleGoToStep]);

  const handlePrevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      handleGoToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, handleGoToStep]);

  const handleStartResume = () => {
    setTimerState('RUNNING');
  };

  const handlePause = () => {
    setTimerState('PAUSED');
  };

  const handleResetDemo = () => {
    setCurrentStepIndex(0);
    setTimeRemainingSeconds(600);
    setTimerState('IDLE');
    setVisitedSteps(new Set([0]));
    setShowStatutoryRef(false);
    setCopiedScript(false);
    setScenarioLoaded(null);
    handleGoToStep(0);
  };

  const handleCopyScript = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentStep.sayText.replace(/^[“"]|[”"]$/g, ''));
      setCopiedScript(true);
      setTimeout(() => setCopiedScript(false), 2000);
    }
  };

  const handleTriggerScenario = () => {
    if (currentStep.scenarioId) {
      onLoadScenario?.(currentStep.scenarioId);
      setScenarioLoaded(currentStep.scenarioId);
      setTimeout(() => setScenarioLoaded(null), 3500);
    }
  };

  // Keyboard Shortcuts (Section 30: Esc, Space, Left/Right arrows)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const targetTag = (e.target as HTMLElement)?.tagName?.toLowerCase();
      if (targetTag === 'input' || targetTag === 'textarea' || targetTag === 'select') return;

      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === ' ') {
        e.preventDefault();
        if (timerState === 'RUNNING') {
          handlePause();
        } else {
          handleStartResume();
        }
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextStep();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevStep();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, timerState, handleNextStep, handlePrevStep, onClose]);

  if (!isOpen) return null;

  // Warning thresholds (§23: 02:00 amber, 00:30 red)
  const isAmberWarning = timeRemainingSeconds <= 120 && timeRemainingSeconds > 30;
  const isRedWarning = timeRemainingSeconds <= 30 && timeRemainingSeconds > 0;

  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div
      role="dialog"
      aria-label="Jury Demo Assistant"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-[460px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 select-none text-slate-800 dark:text-slate-200"
    >
      {/* 1. Header Area (§5) */}
      <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-[#172554] text-white flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-600/30 border border-blue-400/40 text-blue-300 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-sm font-black tracking-tight text-white uppercase font-sans">
                Jury Demo Assistant
              </h3>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-amber-400 text-slate-950">
                10-MIN AUTOPILOT
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 font-medium">
              Guided 10-minute product walkthrough.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-white/10 transition-colors"
          title="Close Presentation Assistant (Esc)"
          aria-label="Close Assistant"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* 2. Timer & Countdown Controls Bar (§6, §22, §23) */}
      <div
        className={`px-5 py-3 border-b flex items-center justify-between transition-colors shadow-inner ${
          isRedWarning
            ? 'bg-rose-950/80 border-rose-800 text-white'
            : isAmberWarning
            ? 'bg-amber-950/80 border-amber-800 text-white'
            : 'bg-slate-950 border-slate-800 text-white'
        }`}
      >
        <div>
          <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <span
              className={`w-2 h-2 rounded-full ${
                timerState === 'RUNNING'
                  ? isRedWarning
                    ? 'bg-rose-500 animate-ping'
                    : isAmberWarning
                    ? 'bg-amber-400 animate-pulse'
                    : 'bg-emerald-400 animate-pulse'
                  : timerState === 'PAUSED'
                  ? 'bg-amber-400'
                  : timerState === 'COMPLETE'
                  ? 'bg-blue-400'
                  : 'bg-slate-500'
              }`}
            />
            <span>
              {timerState === 'RUNNING'
                ? isRedWarning
                  ? '30s WARNING'
                  : isAmberWarning
                  ? '2:00 WARNING'
                  : 'RUNNING'
                : timerState === 'PAUSED'
                ? 'PAUSED'
                : timerState === 'COMPLETE'
                ? 'COMPLETED'
                : 'NOT STARTED'}
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-0.5">
            <span className="text-2xl font-black font-mono tracking-tight text-white">
              {formatTimer(timeRemainingSeconds)}
            </span>
            <span className="text-[11px] font-mono text-slate-400 uppercase">
              {timerState === 'COMPLETE' ? 'FINISHED' : 'REMAINING'}
            </span>
          </div>
        </div>

        {/* Playback Controls */}
        <div className="flex items-center gap-1.5">
          {timerState === 'RUNNING' ? (
            <button
              onClick={handlePause}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Pause Timer (Space)"
            >
              <Pause className="w-3.5 h-3.5" />
              <span>Pause</span>
            </button>
          ) : timerState === 'PAUSED' ? (
            <button
              onClick={handleStartResume}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Resume Timer (Space)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume</span>
            </button>
          ) : timerState === 'COMPLETE' ? (
            <button
              onClick={handleResetDemo}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          ) : (
            <button
              onClick={handleStartResume}
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Start Demo (Space)"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Start Demo</span>
            </button>
          )}

          <button
            onClick={handleResetDemo}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            title="Reset Demo to Step 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Paused Notification Banner (§22) */}
      {timerState === 'PAUSED' && (
        <div className="px-4 py-2 bg-amber-50 dark:bg-amber-950/60 border-b border-amber-200 dark:border-amber-800/60 flex items-center gap-2 text-xs text-amber-900 dark:text-amber-200">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>
            <strong>DEMO PAUSED:</strong> Current step preserved. The application view remains unchanged.
          </span>
        </div>
      )}

      {/* 3. Main Drawer Scroll Content Area */}
      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        {/* Demo Complete Screen (§24) */}
        {timerState === 'COMPLETE' ? (
          <div className="p-6 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/80 text-center space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 mx-auto flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white">
                ✓ DEMO COMPLETE
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                10-minute walkthrough finished. All statutory verification checkpoints demonstrated.
              </p>
            </div>

            <div className="p-3.5 rounded-xl bg-white dark:bg-slate-900 border border-emerald-200/80 dark:border-emerald-800/60 text-left space-y-1.5 text-xs">
              <div className="text-[10px] font-mono font-bold text-slate-500 uppercase tracking-wider">
                Covered Capabilities:
              </div>
              <div className="text-emerald-700 dark:text-emerald-400 font-semibold space-y-1">
                <div>✓ Automated statutory verification & OIML tolerance corridor</div>
                <div>✓ Live hardware serial bridge & WELMEC 7.2 software examination</div>
                <div>✓ Forensic legacy Excel flaw audit & false pass detection</div>
                <div>✓ Independent four-eyes review & Director PIN sign-off</div>
                <div>✓ Bilingual Form VI Certificate & public e-Māap QR validation</div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 py-1 text-left font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 font-sans uppercase">Elapsed Time</div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {formatTimer(600 - timeRemainingSeconds)}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                <div className="text-[10px] text-slate-500 font-sans uppercase">Screens Shown</div>
                <div className="font-bold text-slate-900 dark:text-white">
                  {visitedSteps.size} of {steps.length}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={handleResetDemo}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#172554] text-white hover:bg-blue-900 shadow-md transition-all cursor-pointer"
              >
                Restart Demo
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Close Assistant
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Step Progress Counter (§19) */}
            <div className="flex items-center justify-between text-xs font-mono text-slate-500">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                DEMO PROGRESS: <strong className="text-blue-600 dark:text-blue-400">{currentStepIndex + 1} of {steps.length}</strong>
              </span>
              <button
                type="button"
                onClick={() => setIsTimelineExpanded(!isTimelineExpanded)}
                className="text-[11px] font-sans font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>{isTimelineExpanded ? 'Hide Timeline' : 'View All Steps'}</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isTimelineExpanded ? 'rotate-180' : ''}`}
                />
              </button>
            </div>

            {/* Collapsible Full Vertical Timeline (§7) */}
            {isTimelineExpanded && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 animate-in fade-in duration-200">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-700">
                  10-Minute Presentation Timeline
                </div>
                <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                  {steps.map((st, idx) => {
                    const isCurrent = idx === currentStepIndex;
                    const isPast = visitedSteps.has(idx);

                    return (
                      <div
                        key={st.id}
                        onClick={() => handleGoToStep(idx)}
                        className={`flex items-center justify-between p-2 rounded-xl text-xs cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-[#172554] text-white font-bold shadow-xs'
                            : isPast
                            ? 'text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                            : 'text-slate-400 dark:text-slate-500 hover:bg-slate-200/60 dark:hover:bg-slate-700/50'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold shrink-0 ${
                              isCurrent
                                ? 'bg-amber-400 text-slate-950'
                                : isPast
                                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400'
                            }`}
                          >
                            {isPast && !isCurrent ? '✓' : st.stepNumber}
                          </span>
                          <span className="truncate">{st.title}</span>
                        </div>
                        <span className="font-mono text-[10px] shrink-0 text-slate-400">
                          {st.minuteMarker}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Current Step Hero Card (§8) */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-[#172554] text-white">
                  STEP {currentStep.stepNumber.toString().padStart(2, '0')}
                </span>
                <span className="text-[11px] font-mono text-blue-700 dark:text-blue-300 font-semibold flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {currentStep.minuteMarker} ({currentStep.durationSeconds}s)
                </span>
              </div>

              <div>
                <h4 className="text-sm font-black text-slate-900 dark:text-white leading-snug">
                  {currentStep.title}
                </h4>
                <div className="text-xs text-blue-700 dark:text-blue-300 font-medium mt-0.5">
                  {currentStep.subtitle}
                </div>
              </div>

              {/* Target Screen Banner */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 border border-blue-200/80 dark:border-blue-800/60 text-xs">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">
                    Active Application View:
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {currentStep.showText}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => onNavigateToTab(currentStep.targetTab)}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/40 dark:hover:bg-blue-900/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-700 flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open</span>
                </button>
              </div>

              {/* Demo Scenario Loader (§17, §18, §36, §37) */}
              {currentStep.scenarioName && (
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-center justify-between text-xs">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200">
                        SYNTHETIC DATA
                      </span>
                      <span className="font-bold text-amber-950 dark:text-amber-200 truncate max-w-[160px]">
                        {currentStep.scenarioName}
                      </span>
                    </div>
                    {scenarioLoaded === currentStep.scenarioId ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1 mt-0.5">
                        <Check className="w-3 h-3" /> Scenario loaded successfully
                      </span>
                    ) : (
                      <span className="text-[10px] text-amber-700/80 dark:text-amber-300/80 block mt-0.5">
                        Stages pre-calculated test edge case
                      </span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleTriggerScenario}
                    disabled={scenarioLoaded === currentStep.scenarioId}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-xs flex items-center gap-1 transition-all cursor-pointer disabled:opacity-50"
                  >
                    <Database className="w-3 h-3" />
                    <span>Load</span>
                  </button>
                </div>
              )}
            </div>

            {/* “SHOW” Section (§9) */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <Eye className="w-3.5 h-3.5 text-emerald-600" />
                <span>Show Judges:</span>
              </div>
              <ul className="space-y-1 text-xs text-slate-700 dark:text-slate-300 pl-5 list-disc leading-relaxed">
                {currentStep.focusAreas.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>

            {/* “SAY” Section (§10, §11) with One-Click Copy */}
            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
                  <span>Say This:</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyScript}
                  className="px-2 py-0.5 rounded-md text-[11px] font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-1 transition-colors cursor-pointer"
                  title="Copy presenter script to clipboard"
                >
                  {copiedScript ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy script</span>
                    </>
                  )}
                </button>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border-l-4 border-blue-600 text-xs text-slate-800 dark:text-slate-200 font-sans italic leading-relaxed">
                {currentStep.sayText}
              </div>
            </div>

            {/* “KEY HIGHLIGHTS” Section (§12) */}
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                <CheckSquare className="w-3.5 h-3.5 text-amber-600" />
                <span>Key Highlights:</span>
              </div>
              <div className="space-y-1 text-xs">
                {currentStep.keyHighlights.map((hl, i) => (
                  <div key={i} className="flex items-start gap-2 text-slate-700 dark:text-slate-300">
                    <span className="text-emerald-600 font-bold">✓</span>
                    <span>{hl}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* “STATUTORY REFERENCE” Section (§13) */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 font-mono text-slate-600 dark:text-slate-400">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span className="font-semibold">{currentStep.statutoryReference}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowStatutoryRef(!showStatutoryRef)}
                  className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                >
                  {showStatutoryRef ? 'Hide Reference' : 'View Reference'}
                </button>
              </div>

              {showStatutoryRef && (
                <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans animate-in fade-in duration-150">
                  <div className="text-[10px] font-mono font-bold uppercase text-slate-400 mb-1">
                    Statutory Rule & Mandate:
                  </div>
                  {currentStep.statutoryDetail}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* 4. Bottom Controls Area (§14, §15, §20) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-900/90 space-y-2.5 shadow-lg">
        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Previous / Next Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={currentStepIndex === 0}
            className="flex-1 py-2 px-3 rounded-xl text-xs font-bold bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="flex-2 py-2 px-4 rounded-xl text-xs font-bold bg-[#172554] hover:bg-blue-900 text-white shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.01] cursor-pointer"
          >
            <span>
              {currentStepIndex >= steps.length - 1 ? 'Finish Demo' : 'Next Step'}
            </span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
