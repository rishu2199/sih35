import React, { useState, useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  ExternalLink,
  Minimize2,
  Maximize2,
  CheckCircle2,
  Award,
  Clock,
  Zap,
  Scale,
  FileSpreadsheet,
  Camera,
  Activity,
  Radio,
  Crosshair,
  Repeat,
  Weight,
  ClipboardCheck,
} from 'lucide-react';
import { type NavItemKey } from '../layout/Sidebar';

interface DemoMinute {
  minute: number;
  timeRange: string;
  title: string;
  targetTab: NavItemKey;
  icon: React.ComponentType<{ className?: string }>;
  statutoryRef: string;
  scriptCue: string;
  keyHighlights: string[];
}

const DEMO_MINUTES: DemoMinute[] = [
  {
    minute: 1,
    timeRange: '0:00 - 1:00',
    title: 'Problem Statement & Statutory Mandate',
    targetTab: 'dashboard',
    icon: Activity,
    statutoryRef: 'Legal Metrology Act 2009, Sec. 24 | OIML R 76-1:2006',
    scriptCue:
      'Esteemed judges: Across 5 Regional Reference Standard Laboratories (RRSL) and state labs, over 100,000 weighing instruments are verified annually. Manual Excel sheets introduce turning point omission and unrecorded rounding errors. METROLOGIX-76 replaces manual chaos with autonomous, deterministic, and cryptographically verified test reports.',
    keyHighlights: [
      'Problem Statement ID 26035 compliance',
      'Real-time executive metrology KPIs',
      'DoCA multi-lab hierarchy (RRSL Bangalore, Delhi, etc.)',
    ],
  },
  {
    minute: 2,
    timeRange: '1:00 - 2:00',
    title: 'AI OCR Intake & Test Applicability Matrix (TAM)',
    targetTab: 'intake',
    icon: Zap,
    statutoryRef: 'OIML R 76-1 Cl. 3.1 | Form-A Verification',
    scriptCue:
      'Notice how our dual-engine optical intake parses noisy instrument nameplates in milliseconds. Tesseract OCR extracts Class III, Max 30 kg, e=5 g, and our Test Applicability Matrix (TAM) generates the exact statutory test sequence based on instrument geometry.',
    keyHighlights: [
      'Automatic Class I, II, III, IV classification',
      'Confidence-scored nameplate digitization',
      'Rule 14 statutory field validation',
    ],
  },
  {
    minute: 3,
    timeRange: '2:00 - 3:00',
    title: 'OpenCV Optical Platter & Seal Auditor',
    targetTab: 'vision_audit',
    icon: Camera,
    statutoryRef: 'OIML R 76-1 Cl. 3.9.1.1 (Leveling) & Sec. 24 (Physical Seal)',
    scriptCue:
      'Before testing begins, computer vision guarantees statutory physical conditions. OpenCV Hough Circles detects spirit bubble leveling to within 0.1° tilt, contour analysis flags platter contamination, and corner detection verifies lead seal holes to prevent physical tampering.',
    keyHighlights: [
      'Hough Circle Transform for bubble tilt detection',
      'Platter cleanliness & edge-binding contour analysis',
      'Lead seal hole verification to prevent tampering',
    ],
  },
  {
    minute: 4,
    timeRange: '3:00 - 4:00',
    title: 'LiveBridge IoT Serial Port / WebSocket Gateway',
    targetTab: 'live_bridge',
    icon: Radio,
    statutoryRef: 'OIML R 76-1 Cl. 4.4.2 (Zero-Setting & Stability)',
    scriptCue:
      'Our LiveBridge IoT Gateway interfaces directly with laboratory balances via RS-232 / USB serial protocols or WebSockets. It auto-detects baud rates, samples continuous stream values, filters out unstable vibrations, and eliminates human transcription fraud.',
    keyHighlights: [
      'Sub-50ms serial baud auto-negotiation',
      'Real-time WebSocket telemetry with stability checks',
      'Zero-human-intervention direct weight capture',
    ],
  },
  {
    minute: 5,
    timeRange: '4:00 - 5:00',
    title: 'Clause A.4.4 Weighing Error & Changeover Engine',
    targetTab: 'weighing',
    icon: Scale,
    statutoryRef: 'OIML R 76-1 Clause A.4.4.3 & Table 6 MPE',
    scriptCue:
      'Here is our mathematical core: digital displays round to nearest e. Following Clause A.4.4.3, we add auxiliary weights ΔL to find the turning point P = I + 0.5e - ΔL. The engine calculates true uncorrected error E = P - L and corrected error E_c = E - E_0 using exact Decimal arithmetic against Table 6 MPE brackets.',
    keyHighlights: [
      'Deterministic turning point formula P = I + 0.5e - ΔL',
      'Zero reference correction: E_c = E - E_0',
      'Statutory Table 6 MPE step resolver (±0.5e, ±1.0e, ±1.5e)',
    ],
  },
  {
    minute: 6,
    timeRange: '5:00 - 6:00',
    title: 'Clause A.4.7 Eccentricity & 3D Interactive Platter',
    targetTab: 'eccentricity',
    icon: Crosshair,
    statutoryRef: 'OIML R 76-1 Clause A.4.7 (Off-Center Loading)',
    scriptCue:
      'Inspectors evaluate off-center loads with our interactive platter heatmapping canvas. Loading 1/3 Max on 4 corners and the center, errors are normalized to position 1 and color-coded green or red according to Table 6 MPE limits.',
    keyHighlights: [
      '5-point corner loading geometry (rectangular / circular)',
      'Normalized corner error against center reference',
      'Real-time chromatic compliance heatmap',
    ],
  },
  {
    minute: 7,
    timeRange: '6:00 - 7:00',
    title: 'Repeatability, Sensitivity & Temperature Drift',
    targetTab: 'repeatability',
    icon: Repeat,
    statutoryRef: 'OIML R 76-1 Cl. A.4.10 (Repeatability) & Cl. A.4.8',
    scriptCue:
      'Clause A.4.10 requires 10 consecutive weighings at 50% and 100% capacity where the spread (I_max - I_min) must not exceed |MPE|. Our discrimination test applies an auxiliary micro-load of 1.4d to confirm positive indication change.',
    keyHighlights: [
      '10-run repeatability span check against MPE',
      'Discrimination sensitivity verification at 1.4d',
      'Temperature drift coefficient validation',
    ],
  },
  {
    minute: 8,
    timeRange: '7:00 - 8:00',
    title: 'Weight Traceability & Automatic Lockout',
    targetTab: 'traceability',
    icon: Weight,
    statutoryRef: 'Legal Metrology Rules 2011, Rule 14 | OIML R 111',
    scriptCue:
      'Verification validity is legally conditional upon weight calibration. If a standard weight set certificate expires, our engine triggers an automated hard lockout, preventing illegal verification under Rule 14.',
    keyHighlights: [
      'Class E2, F1, M1 calibration certificate tracker',
      'Hard statutory lockout on expired validity dates',
      'Uncertainty ratio U <= 1/3 MPE verification',
    ],
  },
  {
    minute: 9,
    timeRange: '8:00 - 9:00',
    title: '10-Year Legacy Excel Migration Engine',
    targetTab: 'excel_migration',
    icon: FileSpreadsheet,
    statutoryRef: 'OIML R 76-1 Deterministic Changeover Migration',
    scriptCue:
      'Labs have a decade of legacy spreadsheets. Watch our openpyxl migration engine ingest a 2018 RRSL sheet in 2 seconds. It flags where manual Excel formulas (I - L) omitted turning points and concealed a statutory non-compliance—turning a false pass into an immediate audit finding.',
    keyHighlights: [
      'Instant parsing of 10-year legacy lab spreadsheets',
      'Flags historical FALSE PASSES concealed by manual formulas',
      'Re-evaluates every observation through OIML changeover logic',
    ],
  },
  {
    minute: 10,
    timeRange: '9:00 - 10:00',
    title: 'Statutory Review, Cryptographic Signing & PDF/A Export',
    targetTab: 'review',
    icon: ClipboardCheck,
    statutoryRef: 'OIML R 76-2:2007 Pattern Approval Report & SHA-256',
    scriptCue:
      'Finally, the Senior Metrology Officer reviews all test evidence. Dual-role cryptographic signing links the inspector and officer, writes an immutable SHA-256 block into the audit chain, and exports a tamper-proof ISO/IEC 17025 compliant OIML R 76-2 certificate ready for DoCA approval.',
    keyHighlights: [
      'Role-based dual authorization (Inspector + Approver)',
      'Immutable SHA-256 cryptographic audit block chain',
      'One-click export of statutory PDF/A & Word test reports',
    ],
  },
];

interface JuryDemoAssistantProps {
  currentTab: NavItemKey;
  onNavigateToTab: (tab: NavItemKey) => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const JuryDemoAssistant: React.FC<JuryDemoAssistantProps> = ({
  currentTab,
  onNavigateToTab,
  isOpen,
  onToggleOpen,
}) => {
  const [currentMinuteIdx, setCurrentMinuteIdx] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-timer tick
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => {
          if (prev >= 600) {
            setIsRunning(false);
            return 600;
          }
          return prev + 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Synchronize minute index with timer
  useEffect(() => {
    const calcMin = Math.min(Math.floor(timerSeconds / 60), 9);
    setCurrentMinuteIdx(calcMin);
  }, [timerSeconds]);

  if (!isOpen) return null;

  const currentMinute = DEMO_MINUTES[currentMinuteIdx];
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (currentMinuteIdx < DEMO_MINUTES.length - 1) {
      const nextIdx = currentMinuteIdx + 1;
      setCurrentMinuteIdx(nextIdx);
      setTimerSeconds(nextIdx * 60);
      onNavigateToTab(DEMO_MINUTES[nextIdx].targetTab);
    }
  };

  const handlePrev = () => {
    if (currentMinuteIdx > 0) {
      const prevIdx = currentMinuteIdx - 1;
      setCurrentMinuteIdx(prevIdx);
      setTimerSeconds(prevIdx * 60);
      onNavigateToTab(DEMO_MINUTES[prevIdx].targetTab);
    }
  };

  const handleSelectMinute = (idx: number) => {
    setCurrentMinuteIdx(idx);
    setTimerSeconds(idx * 60);
    onNavigateToTab(DEMO_MINUTES[idx].targetTab);
  };

  const progressPercent = Math.min((timerSeconds / 600) * 100, 100);

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-64 z-40 transition-all duration-300">
      <div className="card-sheen bg-[#0f1728]/95 dark:bg-[#080c14]/95 text-white rounded-2xl border border-white/[0.12] shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Progress Bar */}
        <div className="w-full bg-white/[0.05] h-1.5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-brand-500 via-amber-500 to-emerald-500 transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        {/* Toolbar Header */}
        <div className="px-4 py-2.5 bg-black/30 border-b border-white/[0.08] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1.5 bg-amber-500/15 text-amber-300 border border-amber-500/25 rounded-lg flex items-center gap-1.5 font-bold text-xs font-mono shadow-xs">
              <Award className="w-4 h-4 text-amber-400" />
              <span>GRAND FINALE JURY ASSISTANT</span>
            </div>

            {/* Timer Controls */}
            <div className="flex items-center gap-2 font-mono text-xs bg-white/[0.04] px-3 py-1 rounded-lg border border-white/[0.08]">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span className={`font-bold ${timerSeconds >= 540 ? 'text-rose-400 animate-pulse' : 'text-emerald-400'}`}>
                {formatTime(timerSeconds)} / 10:00
              </span>
              <button
                onClick={() => setIsRunning(!isRunning)}
                className="p-1 hover:text-amber-400 transition-colors"
                title={isRunning ? 'Pause Pitch Timer' : 'Start Pitch Timer'}
              >
                {isRunning ? <Pause className="w-3 h-3 text-amber-400" /> : <Play className="w-3 h-3 text-emerald-400" />}
              </button>
              <button
                onClick={() => {
                  setIsRunning(false);
                  setTimerSeconds(0);
                  setCurrentMinuteIdx(0);
                }}
                className="p-1 hover:text-white transition-colors text-slate-400"
                title="Reset Timer"
              >
                <RotateCcw className="w-3 h-3" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded-lg hover:bg-white/[0.08] text-slate-400 hover:text-white transition-colors"
              title={isMinimized ? 'Expand Cue Card' : 'Minimize Cue Card'}
            >
              {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
            </button>
            <button
              onClick={onToggleOpen}
              className="text-xs px-2.5 py-1 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] text-slate-300 font-semibold transition-colors border border-white/[0.06]"
            >
              Close Assistant
            </button>
          </div>
        </div>

        {/* 10-Minute Shortcut Pills */}
        <div className="px-4 py-2 bg-black/10 border-b border-white/[0.06] flex items-center gap-1.5 overflow-x-auto text-[11px] font-bold">
          {DEMO_MINUTES.map((m, idx) => {
            const isCurrent = idx === currentMinuteIdx;
            const Icon = m.icon;
            return (
              <button
                key={m.minute}
                onClick={() => handleSelectMinute(idx)}
                className={`px-2.5 py-1 rounded-lg shrink-0 flex items-center gap-1.5 transition-all font-mono ${
                  isCurrent
                    ? 'bg-brand-500 text-white font-black shadow-xs'
                    : 'bg-white/[0.05] text-slate-300 hover:bg-white/[0.1] hover:text-white border border-white/[0.04]'
                }`}
              >
                <Icon className="w-3 h-3" />
                <span>Min {m.minute}</span>
              </button>
            );
          })}
        </div>

        {/* Expanded Cue Card Body */}
        {!isMinimized && (
          <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-4 items-center">
            {/* Script & Pitch Cue */}
            <div className="lg:col-span-8 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[11px] font-black uppercase font-mono bg-emerald-500/15 text-emerald-300 border border-emerald-500/25">
                  Minute {currentMinute.minute} ({currentMinute.timeRange})
                </span>
                <h4 className="text-sm font-bold text-white tracking-wide font-display">
                  {currentMinute.title}
                </h4>
                <span className="text-[10px] font-mono text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded border border-amber-500/25">
                  {currentMinute.statutoryRef}
                </span>
              </div>

              {/* Presenter Spoken Cue */}
              <div className="p-3 bg-black/40 rounded-xl border border-white/[0.08] text-xs text-slate-200 leading-relaxed font-sans">
                <span className="text-amber-400 font-bold mr-1">Presenter Script:</span>
                &ldquo;{currentMinute.scriptCue}&rdquo;
              </div>
            </div>

            {/* Key Highlights & Jump Navigation */}
            <div className="lg:col-span-4 space-y-2 border-t lg:border-t-0 lg:border-l border-white/[0.08] lg:pl-4">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider font-mono">
                Jury Evaluation Points:
              </div>
              <ul className="space-y-1 text-xs text-slate-300">
                {currentMinute.keyHighlights.map((hl, i) => (
                  <li key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span className="truncate">{hl}</span>
                  </li>
                ))}
              </ul>

              {/* Navigation Actions */}
              <div className="pt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handlePrev}
                    disabled={currentMinuteIdx === 0}
                    className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-40 text-slate-200 border border-white/[0.06]"
                    title="Previous Minute"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentMinuteIdx === DEMO_MINUTES.length - 1}
                    className="p-1.5 rounded-lg bg-white/[0.08] hover:bg-white/[0.12] disabled:opacity-40 text-slate-200 border border-white/[0.06]"
                    title="Next Minute"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <button
                  onClick={() => onNavigateToTab(currentMinute.targetTab)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-[0.98] ${
                    currentTab === currentMinute.targetTab
                      ? 'bg-emerald-600 text-white font-black'
                      : 'bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white'
                  }`}
                >
                  {currentTab === currentMinute.targetTab ? (
                    <>
                      <span>Active Screen</span>
                      <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                    </>
                  ) : (
                    <>
                      <span>Go to Screen</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
