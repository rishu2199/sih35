import React, { useState } from 'react';
import {
  Scale,
  Building2,
  ChevronDown,
  Check,
  Sparkles,
  Sun,
  Moon,
  Shield,
  Layers,
  Activity,
  AlertTriangle,
  ExternalLink,
  Wifi,
  WifiOff,
} from 'lucide-react';
import { useIoT } from '../../contexts/IoTContext';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface HeaderProps {
  activeLab?: string;
  onSelectLab?: (lab: string) => void;
  onOpenDemoCenter?: () => void;
  onOpenJuryAssistant?: () => void;
  isDemoActive?: boolean;
  isJuryActive?: boolean;
  userName?: string;
  userRole?: string;
  onChangeRole?: (role: string) => void;
  onSignOut?: () => void;
  activeSession?: any;
  isSessionActive?: boolean;
  scaleConnected?: boolean;
  onToggleTheme?: () => void;
  isDarkMode?: boolean;
  onNavigateTab?: (tab: string) => void;
  activeScenarioId?: string | null;
  onSelectScenario?: (scenarioId: string) => void;
  onLeaveSession?: () => void;
}

const CANONICAL_LABS = [
  {
    id: 'RRSL-BLR',
    name: 'RRSL Bengaluru',
    city: 'Bengaluru, Karnataka',
    type: 'Regional Reference Standard Laboratory',
  },
  {
    id: 'RRSL-AHM',
    name: 'RRSL Ahmedabad',
    city: 'Ahmedabad, Gujarat',
    type: 'Regional Reference Standard Laboratory',
  },
  {
    id: 'RRSL-DEL',
    name: 'RRSL Delhi',
    city: 'New Delhi',
    type: 'Central Legal Metrology Reference Laboratory',
  },
];

const ROLES = [
  { id: 'Metrologist', label: 'Metrologist', desc: 'Test Officer' },
  { id: 'Reviewer', label: 'Reviewer', desc: 'Technical Review' },
  { id: 'Director', label: 'Director', desc: 'Statutory Authority' },
  { id: 'Auditor', label: 'Auditor', desc: 'Read-only Inspection' },
  { id: 'Admin', label: 'Admin', desc: 'System Configuration' },
];

const CANONICAL_SCENARIOS = [
  {
    id: 'standard_class_iii_retail',
    name: 'Standard Class III Retail',
    badge: '✓ Passing baseline',
    badgeClass: 'text-emerald-700 bg-emerald-50 dark:bg-emerald-950/60 border-emerald-200 dark:border-emerald-800',
  },
  {
    id: 'rounding_discrepancy_trap',
    name: 'Rounding Discrepancy Trap',
    badge: '⚠ False spreadsheet PASS → true FAIL',
    badgeClass: 'text-amber-800 bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800',
  },
  {
    id: 'temperature_span_drift_fail',
    name: 'Temperature Span Drift',
    badge: '✕ Thermal non-compliance',
    badgeClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'eccentricity_cantilever_twist',
    name: 'Eccentricity Cantilever Twist',
    badge: '✕ Corner-loading failure',
    badgeClass: 'text-rose-700 bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
  },
  {
    id: 'high_interval_class_i_analytical',
    name: 'High-Interval Class I',
    badge: '✓ Micro-precision',
    badgeClass: 'text-blue-700 bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800',
  },
];

/**
 * METROLOGIX-76 Global Application Header (§3, §4, §5, §6, §7, §8, §9, §10, §11, §12, §13)
 * Hierarchy: METROLOGIX-76 -> active lab -> role -> live instrument signal -> utilities
 */
export const Header: React.FC<HeaderProps> = ({
  activeLab = 'RRSL Bengaluru',
  onSelectLab,
  onOpenDemoCenter,
  onOpenJuryAssistant,
  isDemoActive = false,
  isJuryActive = false,
  userName = 'R. Sharma',
  userRole = 'Metrologist',
  onChangeRole,
  onSignOut,
  activeSession,
  isSessionActive = false,
  scaleConnected = true,
  onToggleTheme,
  isDarkMode = false,
  onNavigateTab,
  activeScenarioId,
  onSelectScenario,
  onLeaveSession,
}) => {
  // Dropdown states
  const [isLabMenuOpen, setIsLabMenuOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);
  const [isScenarioMenuOpen, setIsScenarioMenuOpen] = useState(false);
  const [isIoTPopoverOpen, setIsIoTPopoverOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Lab switch confirmation modal state (§6)
  const [pendingLabSwitch, setPendingLabSwitch] = useState<string | null>(null);

  // Live IoT Context integration (§9, §10)
  let iotScaleConnected = scaleConnected;
  let iotSimulator = true;
  let iotWeight = 10.25;
  let iotUnit = 'kg';
  let iotStable = true;
  let iotModel = 'Avery ZM201 (COM3)';

  try {
    const iot = useIoT();
    if (iot) {
      iotScaleConnected = iot.scaleConnected;
      iotSimulator = iot.isSimulatorActive;
      iotWeight = iot.currentWeight;
      iotUnit = iot.unit;
      iotStable = iot.isStable;
      iotModel = iot.scaleModel;
    }
  } catch (err) {
    // Fallback if rendered outside IoTProvider
  }

  const handleLabItemClick = (labName: string) => {
    if (labName === activeLab) {
      setIsLabMenuOpen(false);
      return;
    }

    if (isSessionActive) {
      // Guard against silent context loss when verification session is open (§6)
      setPendingLabSwitch(labName);
      setIsLabMenuOpen(false);
    } else {
      onSelectLab?.(labName);
      setIsLabMenuOpen(false);
    }
  };

  const handleConfirmLabSwitch = () => {
    if (pendingLabSwitch) {
      onSelectLab?.(pendingLabSwitch);
      setPendingLabSwitch(null);
      onLeaveSession?.();
      if (onNavigateTab) {
        onNavigateTab('dashboard');
      }
    }
  };

  const formattedWeight = iotWeight.toFixed(3);

  return (
    <>
      <header className="sticky top-0 z-40 w-full h-16 border-b border-[#E4E8EF] dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shrink-0 shadow-2xs">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 gap-3">
          
          {/* 1. Left: METROLOGIX-76 Brand + Active Lab Switcher (§3, §4, §5) */}
          <div className="flex items-center gap-4 shrink-0">
            {/* Brand Emblem */}
            <div className="flex items-center gap-3 select-none">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#172554] text-white shadow-xs">
                <Scale className="w-5 h-5 text-blue-400" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-black tracking-tight text-slate-900 dark:text-white font-sans uppercase">
                    METROLOGIX<span className="text-[#2563EB]">-76</span>
                  </span>
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                  Legal Metrology
                </p>
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block" />

            {/* Active Laboratory Switcher (§5) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsLabMenuOpen(!isLabMenuOpen);
                  setIsRoleMenuOpen(false);
                  setIsScenarioMenuOpen(false);
                  setIsIoTPopoverOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                title="Active Verification Laboratory"
              >
                <Building2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-bold truncate max-w-[140px] sm:max-w-none">{activeLab}</span>
                <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
              </button>

              {/* Lab Menu Dropdown (§5) */}
              {isLabMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsLabMenuOpen(false)} />
                  <div className="absolute left-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                      ACTIVE LABORATORY
                    </div>
                    <div className="space-y-0.5">
                      {CANONICAL_LABS.map((lab) => {
                        const isSelected = lab.name.toLowerCase() === activeLab.toLowerCase();
                        return (
                          <button
                            key={lab.id}
                            type="button"
                            onClick={() => handleLabItemClick(lab.name)}
                            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <div>
                              <div className="flex items-center gap-1.5 font-semibold text-xs">
                                <span>{isSelected ? '✓' : '○'}</span>
                                <span>{lab.name}</span>
                              </div>
                              <div className="text-[10px] text-slate-500 dark:text-slate-400 pl-4 mt-0.5">
                                {lab.city}
                              </div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* 2. Center / Right: Role -> Live IoT Signal -> Utilities (§4) */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">

            {/* Role Switcher with "Demo Environment" treatment (§7, §8) */}
            <div className="relative flex items-center">
              <button
                type="button"
                onClick={() => {
                  setIsRoleMenuOpen(!isRoleMenuOpen);
                  setIsLabMenuOpen(false);
                  setIsScenarioMenuOpen(false);
                  setIsIoTPopoverOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                title="Demo Role Switcher"
              >
                <Shield className="w-3 h-3 text-blue-600 dark:text-blue-400" />
                <span className="uppercase">{userRole}</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Subtle Demo Environment Badge (§8) */}
              <span className="hidden xl:inline-block ml-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                Demo Environment
              </span>

              {/* Role Dropdown (§7) */}
              {isRoleMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsRoleMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 top-full w-64 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="px-3 py-1.5 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 mb-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">
                        SWITCH ROLE
                      </span>
                      <span className="text-[9px] font-mono text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-1 rounded">
                        Demo
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {ROLES.map((r) => {
                        const isSelected = r.id.toLowerCase() === userRole.toLowerCase();
                        return (
                          <button
                            key={r.id}
                            type="button"
                            onClick={() => {
                              onChangeRole?.(r.id);
                              setIsRoleMenuOpen(false);
                            }}
                            className={`w-full flex items-center justify-between p-2 rounded-xl text-left transition-colors cursor-pointer ${
                              isSelected
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-bold'
                                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/70'
                            }`}
                          >
                            <div>
                              <div className="font-semibold text-xs flex items-center gap-1.5">
                                <span>{isSelected ? '✓' : '○'}</span>
                                <span>{r.label}</span>
                              </div>
                              <div className="text-[10px] text-slate-400 pl-4">{r.desc}</div>
                            </div>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* IoT Live Scale Status Chip (§9, §10) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsIoTPopoverOpen(!isIoTPopoverOpen);
                  setIsLabMenuOpen(false);
                  setIsRoleMenuOpen(false);
                  setIsScenarioMenuOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-mono font-semibold transition-all cursor-pointer ${
                  !iotScaleConnected
                    ? 'bg-slate-100 dark:bg-slate-800/70 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    : iotStable
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300'
                    : 'bg-amber-50 dark:bg-amber-950/50 border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300'
                }`}
                title="Live Instrument Bridge Signal (Click for details)"
              >
                <Scale className="w-3.5 h-3.5" />

                {!iotScaleConnected ? (
                  <>
                    <span>Scale</span>
                    <span className="text-[10px] text-slate-400">○ Disconnected</span>
                  </>
                ) : (
                  <>
                    <span className="font-bold tabular-nums">{formattedWeight} {iotUnit}</span>
                    <span className="flex items-center gap-1 text-[10px]">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          iotStable ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
                        }`}
                      />
                      <span>{iotStable ? 'STABLE' : 'UNSTABLE'}</span>
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-white/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-bold">
                      {iotSimulator ? 'SIM' : 'USB'}
                    </span>
                  </>
                )}
              </button>

              {/* Compact IoT Popover (§10) */}
              {isIoTPopoverOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsIoTPopoverOpen(false)} />
                  <div className="absolute right-0 mt-2 w-72 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                      <span className="font-mono font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                        LIVE SCALE
                      </span>
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-700 dark:text-emerald-400 font-bold">
                        <Activity className="w-3 h-3 text-emerald-600 animate-pulse" />
                        {iotScaleConnected ? 'Continuous Stream' : 'Offline'}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-center space-y-1">
                      <div className="font-mono text-xl font-bold text-slate-900 dark:text-white tabular-nums">
                        {iotScaleConnected ? `${formattedWeight} ${iotUnit}` : '--.--- kg'}
                      </div>
                      <div className="flex items-center justify-center gap-1.5 text-[11px] font-mono font-bold">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            !iotScaleConnected
                              ? 'bg-slate-400'
                              : iotStable
                              ? 'bg-emerald-500'
                              : 'bg-amber-500 animate-ping'
                          }`}
                        />
                        <span className={iotStable ? 'text-emerald-700 dark:text-emerald-300' : 'text-amber-700 dark:text-amber-300'}>
                          {iotScaleConnected ? (iotStable ? 'STABLE' : 'UNSTABLE') : 'DISCONNECTED'}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px]">
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Mode</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">GROSS</span>
                      </div>
                      <div className="flex justify-between text-slate-500 dark:text-slate-400">
                        <span>Connection</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200 truncate max-w-[140px]">
                          {iotSimulator ? 'Virtual Simulator' : iotModel}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setIsIoTPopoverOpen(false);
                        onNavigateTab?.('bridge');
                      }}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs transition-colors shadow-xs cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Open Scale Bridge</span>
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Scenario Launcher (§11) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsScenarioMenuOpen(!isScenarioMenuOpen);
                  setIsLabMenuOpen(false);
                  setIsRoleMenuOpen(false);
                  setIsIoTPopoverOpen(false);
                  setIsUserMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                  activeScenarioId && activeScenarioId !== 'standard_class_iii_retail'
                    ? 'border-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-800 dark:text-indigo-300'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span className="hidden sm:inline">Demo Scenario</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {/* Canonical 5 Scenarios Dropdown (§11) */}
              {isScenarioMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsScenarioMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95 space-y-1">
                    <div className="px-3 py-1.5 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                      DEMO SCENARIOS
                    </div>
                    {CANONICAL_SCENARIOS.map((sc) => {
                      const isSelected = activeScenarioId === sc.id;
                      return (
                        <button
                          key={sc.id}
                          type="button"
                          onClick={() => {
                            onSelectScenario?.(sc.id);
                            setIsScenarioMenuOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800'
                          }`}
                        >
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center justify-between">
                            <span>{sc.name}</span>
                            {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
                          </div>
                          <span
                            className={`inline-block mt-1 text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded border ${sc.badgeClass}`}
                          >
                            {sc.badge}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Theme Toggle Button (☼ / ☾) (§13) */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title={isDarkMode ? 'Switch to light theme' : 'Switch to dark theme'}
            >
              {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Jury Assistant Presentation Button (§3, §29) */}
            {onOpenJuryAssistant && (
              <button
                type="button"
                onClick={onOpenJuryAssistant}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/60 dark:to-orange-950/40 text-amber-900 dark:text-amber-300 hover:from-amber-100 hover:to-orange-100 text-xs font-bold transition-all shadow-xs cursor-pointer shrink-0"
                title="Open 10-Minute Guided Jury Presentation Assistant"
              >
                <span>🎬</span>
                <span className="hidden md:inline">Jury Demo</span>
              </button>
            )}

            {/* User Profile Avatar (§3) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setIsUserMenuOpen(!isUserMenuOpen);
                  setIsLabMenuOpen(false);
                  setIsRoleMenuOpen(false);
                  setIsScenarioMenuOpen(false);
                  setIsIoTPopoverOpen(false);
                }}
                className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 dark:ring-slate-800 cursor-pointer"
                title={userName}
              >
                {userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
              </button>

              {isUserMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 shadow-xl z-50 text-xs animate-in fade-in zoom-in-95">
                    <div className="pb-2 border-b border-slate-100 dark:border-slate-800">
                      <div className="font-bold text-slate-900 dark:text-white">{userName}</div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">{userRole} · {activeLab}</div>
                    </div>
                    {onSignOut && (
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={onSignOut}
                          className="w-full text-left py-1.5 px-2 rounded-lg text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold cursor-pointer"
                        >
                          Sign Out Gateway
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>
      </header>

      {/* Confirmation Modal when switching lab during active verification session (§6) */}
      <Modal
        isOpen={!!pendingLabSwitch}
        onClose={() => setPendingLabSwitch(null)}
        title="SWITCH LABORATORY?"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={() => setPendingLabSwitch(null)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleConfirmLabSwitch}>
              Switch Laboratory
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-slate-700 dark:text-slate-300 text-sm">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">
                You currently have an active verification session in {activeLab}.
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Changing laboratory to <strong className="text-slate-900 dark:text-white">{pendingLabSwitch}</strong> will safely close this session and return you to the laboratory workspace.
              </p>
            </div>
          </div>
        </div>
      </Modal>
    </>
  );
};
