/**
 * METROLOGIX-76 — 1-Click Synthetic Metrological Edge-Case Selector.
 *
 * Provides immediate loading of laboratory stress scenarios for jury demonstrations,
 * highlighting the Scenario 2 Rounding Discrepancy Trap.
 */

import React, { useState } from 'react';
import {
  Sparkles,
  Thermometer,
  Compass,
  Microscope,
  Scale,
  Info,
  Flame,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { useScenario } from '../../context/ScenarioContext';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import type { SyntheticScenario } from '../../types/scenarios';

interface DemoScenarioSelectorProps {
  onScenarioLoaded?: (scenario: SyntheticScenario) => void;
  className?: string;
}

export const DemoScenarioSelector: React.FC<DemoScenarioSelectorProps> = ({
  onScenarioLoaded,
  className = '',
}) => {
  const {
    activeScenario,
    allScenarios,
    loadScenario,
    isLoadingScenario,
    isRoundingTrapActive,
  } = useScenario();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPreviewScenario, setSelectedPreviewScenario] = useState<SyntheticScenario | null>(
    activeScenario || allScenarios[1]
  );

  const handleSelectScenario = async (scenarioId: string) => {
    const loaded = await loadScenario(scenarioId);
    if (onScenarioLoaded) {
      onScenarioLoaded(loaded);
    }
  };

  const getScenarioIcon = (id: string) => {
    switch (id) {
      case 'standard_class_iii_retail':
        return <Scale className="w-4 h-4 text-emerald-500" />;
      case 'rounding_discrepancy_trap':
        return <Flame className="w-4 h-4 text-amber-500 animate-pulse" />;
      case 'temperature_span_drift_fail':
        return <Thermometer className="w-4 h-4 text-rose-500" />;
      case 'eccentricity_cantilever_twist':
        return <Compass className="w-4 h-4 text-purple-500" />;
      case 'high_interval_class_i_analytical':
        return <Microscope className="w-4 h-4 text-sky-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-brand-500" />;
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {/* 1-Click Quick Selector Ribbon */}
      <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-3.5 shadow-card dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.25)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-brand-600 text-white shadow-xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200">
                  1-Click Synthetic Metrology Lab
                </span>
                <span className="rounded bg-amber-500/15 border border-amber-500/30 px-1.5 py-0.2 text-[10px] font-mono font-bold text-amber-800 dark:text-amber-300">
                  Step 26 Live Demo
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Load authentic stress scenarios with real fractional auxiliary weights (ΔL)
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsModalOpen(true)}
            className="text-xs shrink-0 flex items-center gap-1.5"
          >
            <Info className="w-3.5 h-3.5 text-brand-500" />
            <span>Examine 5 Scenarios</span>
          </Button>
        </div>

        {/* 5 Scenario Quick Action Chips */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {allScenarios.map((sc) => {
            const isCurrent = activeScenario?.id === sc.id;
            const isTrap = sc.id === 'rounding_discrepancy_trap';

            return (
              <button
                key={sc.id}
                onClick={() => handleSelectScenario(sc.id)}
                disabled={isLoadingScenario}
                className={`flex items-center gap-2 rounded-lg p-2 text-left transition-all relative overflow-hidden border cursor-pointer ${
                  isCurrent
                    ? 'border-brand-500/40 bg-brand-500/10 shadow-xs text-brand-900 dark:text-brand-100 font-bold'
                    : isTrap
                    ? 'border-amber-500/30 bg-amber-500/[0.05] hover:bg-amber-500/[0.12] text-slate-800 dark:text-slate-200'
                    : 'border-slate-200/80 dark:border-white/[0.06] bg-slate-50/50 hover:bg-slate-100/80 dark:bg-slate-800/40 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300'
                }`}
              >
                {/* Trap highlight badge */}
                {isTrap && (
                  <span className="absolute -top-1.5 right-1 rounded-full bg-gradient-to-r from-amber-500 to-rose-500 px-1.5 py-0.2 text-[8px] font-black text-white uppercase tracking-wider shadow-xs">
                    Winner
                  </span>
                )}

                <div className="shrink-0">{getScenarioIcon(sc.id)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <p className="text-[11px] font-bold truncate">{sc.short_title}</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                    <span>{sc.expected_verdict}</span>
                    <span>•</span>
                    <span>{sc.accuracy_class}</span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Prominent Golden Callout Banner for Scenario 2: Rounding Discrepancy Trap */}
      {isRoundingTrapActive && activeScenario?.rounding_trap_highlight && (
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/[0.08] via-amber-500/[0.04] to-rose-500/[0.08] p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white shadow-md">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-mono font-black text-white uppercase tracking-wider shadow-xs">
                    STATUTORY TRAP HIGHLIGHT
                  </span>
                  <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                    OIML R 76-1 Clause A.4.4.3 Changeover Discrepancy
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  At Step 7 (<span className="font-mono font-bold">10,000 g</span> / 2000e), the scale displays <span className="font-mono font-bold">10,000 g</span>. A naive spreadsheet calculates <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">I - L = 0.0 g (PASS)</span>. But with auxiliary weight <span className="font-mono font-bold">ΔL = 7.8 g</span>, true changeover <span className="font-mono font-bold">P = 9,994.7 g</span> produces <span className="font-mono font-bold text-rose-600 dark:text-rose-400">Ec = -5.3 g</span>, violating the statutory <span className="font-mono font-bold">±5.0 g</span> MPE!
                </p>
              </div>
            </div>

            {/* Side-by-Side Comparison Pill */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-amber-300 dark:border-amber-800 shrink-0">
              <div className="text-center px-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Naive I - L</p>
                <p className="text-xs font-mono font-black text-emerald-600">0.0 g</p>
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1 rounded">
                  FALSE PASS
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              <div className="text-center px-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">OIML Changeover</p>
                <p className="text-xs font-mono font-black text-rose-600">-5.3 g</p>
                <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-1 rounded">
                  TRUE FAIL
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prominent Statutory Callout Banner for Scenario 4: Eccentricity Cantilever Corner Twist */}
      {activeScenario?.id === 'eccentricity_cantilever_twist' && (
        <div className="rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-500/[0.08] via-purple-500/[0.04] to-rose-500/[0.08] p-4 shadow-sm backdrop-blur-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500 text-white shadow-md">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-rose-600 px-2 py-0.5 text-[10px] font-mono font-black text-white uppercase tracking-wider shadow-xs">
                    STATUTORY BREACH
                  </span>
                  <span className="text-xs font-bold text-rose-900 dark:text-rose-200">
                    OIML R 76-1 Clause A.4.7 Cantilever Corner Twist Deflection
                  </span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  At Position 5 (<span className="font-semibold">Front-Right Quadrant</span>), structural torque and cantilever mounting deformation cause the load receptor to twist, producing a corrected corner error of <span className="font-mono font-bold text-rose-600 dark:text-rose-400">Ec = +6.20 g</span>, which violates the allowable statutory tolerance of <span className="font-mono font-semibold">±5.00 g (±1.0e)</span> under Clause A.4.7.1!
                </p>
              </div>
            </div>

            {/* Side-by-Side Comparison Pill */}
            <div className="flex items-center gap-2 bg-white/80 dark:bg-slate-900/80 p-2.5 rounded-lg border border-rose-300 dark:border-rose-800 shrink-0">
              <div className="text-center px-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Allowable MPE</p>
                <p className="text-xs font-mono font-black text-emerald-600">±5.00 g</p>
                <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-1 rounded">
                  TABLE 6 LIMIT
                </span>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-400 shrink-0" />

              <div className="text-center px-2">
                <p className="text-[10px] font-bold text-slate-500 uppercase">Pos 5 Corner</p>
                <p className="text-xs font-mono font-black text-rose-600">+6.20 g</p>
                <span className="text-[9px] font-bold text-rose-700 dark:text-rose-400 bg-rose-100 dark:bg-rose-950 px-1 rounded">
                  STATUTORY FAIL
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Full 5-Scenario Exploration Modal */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Curated Metrological Edge-Case Scenarios (OIML R 76-1 / R 76-2)"
        >
          <div className="space-y-4 max-h-[75vh] overflow-y-auto pr-1">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              Select any of the 5 curated edge cases to stress-test calculations, dynamic MPE corridors, 2D platter torque deflection, and laboratory review signing.
            </p>

            <div className="space-y-3">
              {allScenarios.map((sc) => {
                const isSelected = selectedPreviewScenario?.id === sc.id;
                const isCurrentActive = activeScenario?.id === sc.id;
                const isTrap = sc.id === 'rounding_discrepancy_trap';

                return (
                  <div
                    key={sc.id}
                    onClick={() => setSelectedPreviewScenario(sc)}
                    className={`rounded-xl border p-4 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/40 dark:border-brand-500 dark:bg-brand-950/30'
                        : isTrap
                        ? 'border-amber-300 dark:border-amber-800 bg-amber-50/20'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2">
                        {getScenarioIcon(sc.id)}
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {sc.title}
                        </h4>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded px-1.5 py-0.5 text-[10px] font-mono font-bold uppercase ${
                            sc.expected_verdict === 'PASS'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {sc.expected_verdict}
                        </span>
                        {isCurrentActive && (
                          <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-bold text-brand-800 dark:bg-brand-950 dark:text-brand-300">
                            Active
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="mt-2 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                      {sc.description}
                    </p>

                    <div className="mt-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 p-2.5 text-[11px] space-y-1">
                      <p className="font-semibold text-slate-700 dark:text-slate-300">
                        Metrological Grounding:
                      </p>
                      <p className="text-slate-600 dark:text-slate-400">
                        {sc.technical_explanation}
                      </p>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-3 font-mono">
                        <span>Class: {sc.accuracy_class}</span>
                        <span>Max: {sc.max_capacity} {sc.unit}</span>
                        <span>e = {sc.e} {sc.unit}</span>
                        <span>n = {sc.n.toLocaleString()}</span>
                      </div>

                      <Button
                        size="sm"
                        variant={isCurrentActive ? 'secondary' : 'primary'}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectScenario(sc.id);
                          setIsModalOpen(false);
                        }}
                        className="text-xs"
                      >
                        {isCurrentActive ? 'Already Active' : '1-Click Load Scenario'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
