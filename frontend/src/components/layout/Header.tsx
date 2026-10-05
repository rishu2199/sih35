import React, { useState } from 'react';
import {
  Building2,
  ChevronDown,
  Moon,
  Sun,
  ShieldCheck,
  Menu,
  Check,
  Sparkles,
  Flame,
  Scale,
  Thermometer,
  Compass,
  Microscope,
  Award,
  LogOut,
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useLab, NATIONAL_LABORATORIES } from '../../context/LabContext';
import { useScenario } from '../../context/ScenarioContext';
import { useIoT } from '../../context/IoTContext';
import type { UserRole } from '../../types';

interface HeaderProps {
  onToggleSidebar?: () => void;
  onNavigateToTab?: (tab: string) => void;
  onToggleJuryAssistant?: () => void;
  isJuryAssistantOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onNavigateToTab,
  onToggleJuryAssistant,
  isJuryAssistantOpen = false,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { activeLab, setActiveLab, currentUser, setUserRole, logout } = useLab();
  const { activeScenario, allScenarios, loadScenario } = useScenario();
  const { currentWeight, isStable, unit } = useIoT();
  const [isScenarioDropdownOpen, setIsScenarioDropdownOpen] = useState(false);
  const [isLabDropdownOpen, setIsLabDropdownOpen] = useState(false);
  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'standard_class_iii_retail':
        return <Scale className="w-3.5 h-3.5 text-emerald-500 shrink-0" />;
      case 'rounding_discrepancy_trap':
        return <Flame className="w-3.5 h-3.5 text-amber-500 shrink-0 animate-pulse" />;
      case 'temperature_span_drift_fail':
        return <Thermometer className="w-3.5 h-3.5 text-rose-500 shrink-0" />;
      case 'eccentricity_cantilever_twist':
        return <Compass className="w-3.5 h-3.5 text-purple-500 shrink-0" />;
      case 'high_interval_class_i_analytical':
        return <Microscope className="w-3.5 h-3.5 text-sky-500 shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 text-brand-500 shrink-0" />;
    }
  };

  const handleScenarioSelect = (scenarioId: string) => {
    loadScenario(scenarioId);
    setIsScenarioDropdownOpen(false);
    if (onNavigateToTab) {
      if (scenarioId === 'eccentricity_cantilever_twist') {
        onNavigateToTab('eccentricity');
      } else {
        onNavigateToTab('weighing');
      }
    }
  };

  const roles: { role: UserRole; title: string }[] = [
    { role: 'METROLOGIST', title: 'Testing Officer (Metrologist)' },
    { role: 'REVIEWER',    title: 'Principal Scientific Officer (Reviewer)' },
    { role: 'DIRECTOR',    title: 'Director / Lab Head (Issuing Authority)' },
    { role: 'AUDITOR',     title: 'DoCA Inspector (Auditor — Read Only)' },
    { role: 'ADMIN',       title: 'National System Administrator' },
  ];

  const roleColors: Record<string, string> = {
    METROLOGIST: 'bg-brand-700',
    REVIEWER:    'bg-teal-600',
    DIRECTOR:    'bg-gold-700',
    AUDITOR:     'bg-amber-600',
    ADMIN:       'bg-rose-600',
  };

  return (
    <header className="sticky top-0 z-40 w-full h-15 border-b border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-[#0d131f]/95 backdrop-blur-md transition-colors shrink-0">
      <div className="flex h-15 items-center justify-between px-4 sm:px-6">

        {/* Left: Mobile Menu + Emblem + Brand */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="Toggle navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* National Legal Metrology Brand */}
          <div className="flex items-center gap-3 select-none">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-700 dark:bg-blue-600 text-white shadow-xs">
              <Scale className="w-5 h-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white font-sans">
                  METROLOGIX<span className="text-blue-600 dark:text-blue-400 font-extrabold">-76</span>
                </span>
                <span className="rounded px-2 py-0.5 text-[10px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  OIML R 76
                </span>
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium tracking-wide uppercase hidden sm:block">
                Dept. of Consumer Affairs • Legal Metrology
              </p>
            </div>
          </div>
        </div>

        {/* Right: Controls & Actions */}
        <div className="flex items-center gap-2.5">

          {/* Scale Telemetry Pill */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('live_bridge')}
            title="Inspect Live Scale Telemetry Bridge"
            className="hidden md:inline-flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 px-3 py-1.5 text-xs font-mono transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <span className={`w-2 h-2 rounded-full ${isStable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
            <span className="text-slate-500 dark:text-slate-400 font-sans text-xs">Scale:</span>
            <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
              {currentWeight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 3 })} {unit}
            </span>
            <span className={`text-[10px] font-bold ${isStable ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
              {isStable ? 'STABLE' : 'MOTION'}
            </span>
          </button>

          {/* Scenario Selector */}
          <div className="relative">
            <button
              onClick={() => {
                setIsScenarioDropdownOpen(!isScenarioDropdownOpen);
                setIsLabDropdownOpen(false);
                setIsRoleDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="hidden sm:inline font-medium">Scenarios</span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-xs font-mono bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800/60">
                5
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isScenarioDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsScenarioDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-80 sm:w-[380px] rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-2.5 shadow-xl z-50">
                  <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">OIML R 76-1 Test Scenarios</span>
                    <span className="text-xs text-slate-400 font-mono">5 Presets</span>
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1 space-y-0.5 mt-1">
                    {allScenarios.map((sc) => {
                      const isSelected = activeScenario?.id === sc.id;
                      return (
                        <button
                          key={sc.id}
                          onClick={() => handleScenarioSelect(sc.id)}
                          className={`w-full flex items-start gap-2.5 rounded-lg p-2.5 text-left text-xs sm:text-sm transition-colors border cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-800/50 text-blue-900 dark:text-blue-100'
                              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">{getScenarioIcon(sc.id)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold truncate">{sc.title}</span>
                              <span className={`shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                                sc.expected_verdict === 'PASS'
                                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                              }`}>
                                {sc.expected_verdict}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">{sc.highlight_aspect}</p>
                            <div className="mt-1 flex items-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500">
                              <span>Class {sc.accuracy_class}</span>
                              <span>•</span>
                              <span>{sc.observations_count} tests</span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Lab Switcher */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLabDropdownOpen(!isLabDropdownOpen);
                setIsRoleDropdownOpen(false);
                setIsScenarioDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-3 py-2 text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer"
            >
              <Building2 className="w-4 h-4 text-slate-500 dark:text-slate-400 shrink-0" />
              <span className="max-w-[90px] sm:max-w-[140px] truncate">{activeLab.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isLabDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsLabDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-2.5 shadow-xl z-50">
                  <div className="px-3 py-2 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800 mb-1">
                    Accredited Metrology Labs
                  </div>
                  <div className="max-h-64 overflow-y-auto py-1 space-y-0.5">
                    {NATIONAL_LABORATORIES.map((lab) => {
                      const isSelected = lab.id === activeLab.id;
                      return (
                        <button
                          key={lab.id}
                          onClick={() => { setActiveLab(lab); setIsLabDropdownOpen(false); }}
                          className={`w-full flex items-start gap-2.5 rounded-lg p-2.5 text-left text-xs sm:text-sm transition-colors border cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-white font-medium'
                              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-semibold text-xs sm:text-sm">{lab.code}</span>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                                {lab.labType}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{lab.city}, {lab.state}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User / Role Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsLabDropdownOpen(false);
                setIsScenarioDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 px-2.5 py-1.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${roleColors[currentUser.role] || 'bg-blue-600'} text-white font-bold text-xs`}>
                {currentUser.fullName.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold leading-none text-slate-900 dark:text-slate-100">{currentUser.fullName.split(' ')[0]}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">{currentUser.role}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isRoleDropdownOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsRoleDropdownOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-2.5 shadow-xl z-50">
                  <div className="px-3 pt-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">{currentUser.fullName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{currentUser.email}</p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-4 h-4 shrink-0" />
                      <span>Statutory RBAC Active</span>
                    </div>
                  </div>

                  <div className="px-3 py-2 text-xs font-mono font-semibold text-slate-400 uppercase tracking-wider">
                    Switch Operational Role
                  </div>

                  <div className="space-y-1">
                    {roles.map(({ role, title }) => {
                      const isSelected = currentUser.role === role;
                      return (
                        <button
                          key={role}
                          onClick={() => { setUserRole(role); setIsRoleDropdownOpen(false); }}
                          className={`w-full flex items-center justify-between rounded-lg px-3 py-2 text-xs sm:text-sm transition-colors border cursor-pointer ${
                            isSelected
                              ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-800 text-blue-900 dark:text-white font-semibold'
                              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                          }`}
                        >
                          <span className="truncate">{title}</span>
                          {isSelected && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 ml-2" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={() => { logout(); setIsRoleDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-xs sm:text-sm text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="w-4 h-4 shrink-0" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Jury Demo Launcher */}
          {onToggleJuryAssistant && (
            <button
              onClick={onToggleJuryAssistant}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                isJuryAssistantOpen
                  ? 'border-amber-500/50 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Toggle Evaluation Demo Guide"
            >
              <Award className="w-4 h-4 text-amber-500 shrink-0" />
              <span className="hidden sm:inline">Demo</span>
            </button>
          )}

          {/* Theme Toggle */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

