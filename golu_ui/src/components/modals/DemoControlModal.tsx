import React from 'react';
import { X, Sparkles, UserCheck, ShieldAlert, CheckCircle2, RotateCcw, AlertTriangle, Scale } from 'lucide-react';
import { DEMO_SCENARIOS } from '../../mockData';
import { DemoScenario } from '../../types';

interface DemoControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectScenario: (scenario: DemoScenario) => void;
  currentPersona: string;
  onChangePersona: (persona: string) => void;
  isEmptyState: boolean;
  onToggleEmptyState: () => void;
  onResetData: () => void;
}

export const DemoControlModal: React.FC<DemoControlModalProps> = ({
  isOpen,
  onClose,
  onSelectScenario,
  currentPersona,
  onChangePersona,
  isEmptyState,
  onToggleEmptyState,
  onResetData,
}) => {
  if (!isOpen) return null;

  const personas = [
    {
      id: 'officer',
      role: 'Metrology Testing Officer',
      name: 'R. K. Ramanathan',
      desc: 'Conducts physical load tests, zero tracking, eccentricity checks.',
    },
    {
      id: 'reviewer',
      role: 'Senior Metrological Reviewer',
      name: 'Priyanka Sharma',
      desc: 'Validates raw turning points, flags temperature or repeatability discrepancies.',
    },
    {
      id: 'director',
      role: 'Laboratory Director (RRSL)',
      name: 'Dr. V. K. Menon',
      desc: 'Authorized digital certificate signing, legal seal, and OIML conformance approval.',
    },
  ];

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foundation-900/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-foundation-200 shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-foundation-200 flex items-center justify-between bg-foundation-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-100 text-brand-700">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foundation-900">
                Demo Control Center
              </h3>
              <p className="text-xs text-foundation-500">
                Jury presentation scenarios, persona switching & laboratory states
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Persona Selection */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-foundation-500 block mb-2.5">
              1. Active Demonstration Persona
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {personas.map((p) => {
                const isSelected = currentPersona === p.id;
                return (
                  <button
                    key={p.id}
                    onClick={() => onChangePersona(p.id)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-brand-500 bg-brand-50/50 shadow-xs'
                        : 'border-foundation-200 hover:border-foundation-300 hover:bg-foundation-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-foundation-900">
                        {p.name}
                      </span>
                      {isSelected && <CheckCircle2 size={14} className="text-brand-600" />}
                    </div>
                    <div className="text-[11px] font-semibold text-brand-700">
                      {p.role}
                    </div>
                    <p className="text-[10px] text-foundation-500 mt-1 leading-tight">
                      {p.desc}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 5 Jury Stress Scenarios */}
          <div>
            <div className="flex items-center justify-between mb-2.5">
              <label className="text-xs font-bold uppercase tracking-wider text-foundation-500 block">
                2. Metrological Jury Scenarios (OIML R 76-1)
              </label>
              <span className="text-[11px] text-brand-600 font-medium">1-Click Live Test Setup</span>
            </div>

            <div className="space-y-2">
              {DEMO_SCENARIOS.map((scenario) => {
                const isPass = scenario.expectedVerdict === 'PASS';
                return (
                  <div
                    key={scenario.id}
                    onClick={() => {
                      onSelectScenario(scenario);
                      onClose();
                    }}
                    className="p-3 rounded-xl border border-foundation-200 hover:border-brand-300 hover:bg-brand-50/30 transition-all cursor-pointer group flex items-start justify-between gap-4"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-foundation-900 group-hover:text-brand-700 transition-colors">
                          {scenario.name}
                        </span>
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${
                            isPass
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-rose-50 border-rose-200 text-rose-700'
                          }`}
                        >
                          Expected: {scenario.expectedVerdict}
                        </span>
                        <span className="text-[10px] font-mono text-foundation-400">
                          {scenario.classType.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-xs font-medium text-foundation-700 mt-0.5">
                        {scenario.subtitle}
                      </p>
                      <p className="text-[11px] text-foundation-500 mt-1 leading-normal">
                        {scenario.description}
                      </p>
                    </div>

                    <button className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-white border border-foundation-200 text-foundation-700 group-hover:bg-brand-600 group-hover:text-white group-hover:border-brand-600 transition-colors shrink-0">
                      Load Test
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Laboratory State Toggles */}
          <div className="pt-4 border-t border-foundation-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={onToggleEmptyState}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  isEmptyState
                    ? 'bg-amber-50 border-amber-300 text-amber-800'
                    : 'bg-foundation-100 border-foundation-200 text-foundation-700 hover:bg-foundation-200'
                }`}
              >
                {isEmptyState ? 'Switch to Active Lab Data' : 'Test Empty Lab State'}
              </button>

              <button
                onClick={onResetData}
                className="px-3 py-1.5 rounded-lg border border-foundation-200 text-xs font-medium text-foundation-700 hover:bg-foundation-100 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw size={13} />
                <span>Reset Seed Data</span>
              </button>
            </div>

            <span className="text-[11px] text-foundation-400 font-mono">
              Build v2.4 · RRSL-BLR
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
