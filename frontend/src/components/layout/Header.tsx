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
  const { activeLab, setActiveLab, currentUser, setUserRole, isOnline, logout } = useLab();
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

  const roles: { role: UserRole; title: string; color: string }[] = [
    { role: 'METROLOGIST', title: 'Testing Officer (Metrologist)', color: 'bg-indigo-500' },
    { role: 'REVIEWER', title: 'Principal Scientific Officer (Reviewer)', color: 'bg-teal-500' },
    { role: 'DIRECTOR', title: 'Director / Lab Head (Issuing Authority)', color: 'bg-purple-500' },
    { role: 'AUDITOR', title: 'DoCA Inspector (Auditor - Read Only)', color: 'bg-amber-500' },
    { role: 'ADMIN', title: 'National System Administrator', color: 'bg-rose-500' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-white/[0.08] glass-header transition-colors">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        {/* Left Section: Mobile Menu + Emblem + Branding */}
        <div className="flex items-center gap-3.5">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800/80 cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          {/* Government of India Official Emblem & Platform Brand */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 dark:bg-slate-800 text-white border border-slate-700/60 shadow-xs">
              <span className="text-[11px] font-mono font-bold tracking-tight text-amber-400">
                DoCA
              </span>
            </div>

            <div className="hidden sm:block">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-[10px] font-semibold tracking-wider text-slate-500 dark:text-slate-400 uppercase">
                  Govt. of India
                </span>
                <span className="text-slate-300 dark:text-slate-600 text-[10px]">•</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-devanagari">
                  उपभोक्ता मामले
                </span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                  METROLOGIX-76
                </span>
                <span className="rounded bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  OIML R 76
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right Section: Live Telemetry, Scenario Selector, Lab Switcher, Sync Indicator, Profile, Theme Toggle */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* LiveBridge Scale Telemetry Pill */}
          <button
            onClick={() => onNavigateToTab && onNavigateToTab('live_bridge')}
            title="Scale Telemetry LiveBridge"
            className="hidden md:flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50 dark:bg-slate-800/60 px-3 py-1.5 text-xs font-mono transition-colors hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer shadow-xs"
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isStable ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
              }`}
            />
            <span className="tabular-nums font-semibold text-slate-900 dark:text-slate-100">
              {currentWeight.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 3 })}{' '}
              {unit}
            </span>
            <span
              className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${
                isStable
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'bg-amber-500/10 text-amber-700 dark:text-amber-300'
              }`}
            >
              {isStable ? 'STABLE' : 'MOTION'}
            </span>
          </button>

          {/* Synthetic Metrological Scenario Selector Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsScenarioDropdownOpen(!isScenarioDropdownOpen);
                setIsLabDropdownOpen(false);
                setIsRoleDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-800/60 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="max-w-[120px] sm:max-w-[160px] truncate">
                {activeScenario ? activeScenario.short_title : 'Demo Scenarios'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {isScenarioDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsScenarioDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 sm:w-[410px] rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#0c1322] p-2.5 shadow-2xl z-50 animate-in fade-in duration-100">
                  <div className="px-3.5 py-2.5 border-b border-slate-100 dark:border-white/[0.08] flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      OIML R 76-1 Test Scenarios
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      5 Presets
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1 space-y-1">
                    {allScenarios.map((sc) => {
                      const isSelected = activeScenario?.id === sc.id;

                      return (
                        <button
                          key={sc.id}
                          onClick={() => handleScenarioSelect(sc.id)}
                          className={`w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left text-xs transition-colors border cursor-pointer ${
                            isSelected
                              ? 'bg-brand-500/10 dark:bg-brand-500/[0.14] border-brand-500/40 text-brand-900 dark:text-brand-100 font-medium'
                              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">{getScenarioIcon(sc.id)}</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="font-semibold text-xs truncate">{sc.title}</span>
                              <span
                                className={`shrink-0 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase ${
                                  sc.expected_verdict === 'PASS'
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30'
                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30'
                                }`}
                              >
                                {sc.expected_verdict}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                              {sc.highlight_aspect}
                            </p>
                            <div className="mt-1 flex items-center gap-2 text-[10px] font-mono text-slate-400 dark:text-slate-500">
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

          {/* Active Laboratory Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsLabDropdownOpen(!isLabDropdownOpen);
                setIsRoleDropdownOpen(false);
                setIsScenarioDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50/80 dark:bg-[#101828] px-3 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer shadow-subtle"
            >
              <Building2 className="w-3.5 h-3.5 text-brand-600 dark:text-brand-400 shrink-0" />
              <span className="max-w-[110px] sm:max-w-[180px] truncate">{activeLab.code}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {isLabDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsLabDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#0c1322] p-2.5 shadow-2xl z-50 animate-in fade-in duration-100">
                  <div className="px-3 py-2 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Accredited Metrology Labs
                  </div>
                  <div className="max-h-72 overflow-y-auto py-1 space-y-1">
                    {NATIONAL_LABORATORIES.map((lab) => {
                      const isSelected = lab.id === activeLab.id;
                      return (
                        <button
                          key={lab.id}
                          onClick={() => {
                            setActiveLab(lab);
                            setIsLabDropdownOpen(false);
                          }}
                          className={`w-full flex items-start gap-2.5 rounded-xl p-2.5 text-left text-xs transition-colors border cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800/80 dark:bg-white/[0.06] border-slate-700/60 dark:border-white/[0.08] text-white font-medium shadow-xs'
                              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 text-brand-400 mt-0.5 shrink-0" />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-mono font-bold text-xs text-slate-900 dark:text-slate-100">
                                {lab.code.includes('-') ? lab.code.replace('-', ' - ') : lab.code}
                              </span>
                              <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800/90 text-slate-700 dark:text-slate-400 border border-slate-300 dark:border-slate-700/60">
                                {lab.labType}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {lab.city}, {lab.state}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Sync Status Indicator */}
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 text-xs text-slate-500 dark:text-slate-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-[11px] font-medium">
              {isOnline ? 'Online' : 'Offline (Local)'}
            </span>
          </div>

          {/* User Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setIsRoleDropdownOpen(!isRoleDropdownOpen);
                setIsLabDropdownOpen(false);
                setIsScenarioDropdownOpen(false);
              }}
              className="flex items-center gap-2 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101828] px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors shadow-subtle cursor-pointer"
            >
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-600 text-white font-bold text-[10px]">
                {currentUser.fullName
                  .split(' ')
                  .map((n: string) => n[0])
                  .join('')
                  .slice(0, 2)}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold leading-none text-slate-900 dark:text-slate-100">{currentUser.fullName}</p>
                <p className="text-[10px] text-brand-600 dark:text-brand-400 font-mono font-bold mt-0.5">
                  {currentUser.role}
                </p>
              </div>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </button>

            {isRoleDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsRoleDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200/90 dark:border-white/[0.1] bg-white dark:bg-[#0c1322] p-2.5 shadow-2xl z-50 animate-in fade-in duration-100">
                  <div className="px-3 pt-1 pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentUser.fullName}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {currentUser.email}
                    </p>
                    <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                      <span>Statutory RBAC Active</span>
                    </div>
                  </div>

                  <div className="px-3 py-2 text-[10px] font-mono font-semibold text-slate-400 dark:text-slate-400 uppercase tracking-wider">
                    Switch Operational Role:
                  </div>

                  <div className="space-y-1">
                    {roles.map(({ role, title }) => {
                      const isSelected = currentUser.role === role;
                      return (
                        <button
                          key={role}
                          onClick={() => {
                            setUserRole(role);
                            setIsRoleDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between rounded-xl px-3 py-2 text-xs transition-colors border cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800/80 dark:bg-white/[0.06] border-slate-700/60 dark:border-white/[0.08] text-white font-semibold shadow-xs'
                              : 'border-transparent text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                          }`}
                        >
                          <span className="truncate">{title}</span>
                          {isSelected && (
                            <Check className="w-4 h-4 text-brand-400 shrink-0 ml-2" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-white/[0.06]">
                    <button
                      onClick={() => {
                        logout();
                        setIsRoleDropdownOpen(false);
                      }}
                      className="w-full flex items-center gap-2 rounded-xl px-3 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-medium cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500 dark:text-rose-400 shrink-0" />
                      <span>Switch Officer / Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Jury Demo Assistant Launcher Button */}
          {onToggleJuryAssistant && (
            <button
              onClick={onToggleJuryAssistant}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isJuryAssistantOpen
                  ? 'border-brand-500 bg-brand-500/10 text-brand-700 dark:text-brand-300'
                  : 'border-slate-200 dark:border-white/[0.08] bg-white dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
              }`}
              title="Toggle Presentation & Walkthrough Assistant"
            >
              <Award className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Demo Guide</span>
            </button>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg border border-slate-200 dark:border-white/[0.08] bg-white dark:bg-[#101828] text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/80 dark:hover:text-slate-100 transition-colors shadow-subtle cursor-pointer"
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
