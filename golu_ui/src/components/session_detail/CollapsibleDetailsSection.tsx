import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Scale,
  Camera,
  History,
  Check,
  ArrowRight,
  ShieldCheck,
  FileCheck2,
  ExternalLink,
  Radio,
  Clock,
  Lock,
  Layers,
} from 'lucide-react';
import { InstrumentSpecs, SessionMeta, StatutoryEvidenceItem, SessionTimelineEvent, HardwareTelemetryReading } from './types';

interface CollapsibleDetailsSectionProps {
  specs: InstrumentSpecs;
  meta: SessionMeta;
  evidenceItems: StatutoryEvidenceItem[];
  onOpenEvidenceModal: () => void;
  onNavigateToAudit: () => void;
  onNavigateToBridge?: () => void;
  onNavigateToStandards?: () => void;
}

export const CollapsibleDetailsSection: React.FC<CollapsibleDetailsSectionProps> = ({
  specs,
  meta,
  evidenceItems,
  onOpenEvidenceModal,
  onNavigateToAudit,
  onNavigateToBridge,
  onNavigateToStandards,
}) => {
  const [isInstrumentDetailsOpen, setIsInstrumentDetailsOpen] = useState(false);

  const capturedEvidenceCount = evidenceItems.filter((e) => e.captured).length;

  // Session Timeline stages (§22)
  const timelineStages: SessionTimelineEvent[] = [
    {
      step: '01',
      title: 'Registration & Intake',
      status: 'COMPLETED',
      timestamp: '04 Oct, 11:20 IST',
      actor: 'Officer R. Sharma',
      detail: 'Model Avery ZM201 verified against TAC-2026-III-0142. n = 6,000 divisions.',
    },
    {
      step: '02',
      title: 'Precondition & Physical Audit',
      status: 'COMPLETED',
      timestamp: '04 Oct, 11:45 IST',
      actor: 'Officer R. Sharma',
      detail: 'Spirit level centered, lead-wire seal intact, thermal chamber at 20.2°C.',
    },
    {
      step: '03',
      title: 'Test Plan Confirmed',
      status: 'COMPLETED',
      timestamp: '04 Oct, 12:10 IST',
      actor: 'Officer R. Sharma',
      detail: 'Class III standard test scope locked: Weighing, Eccentricity, Repeatability, Drift.',
    },
    {
      step: '04',
      title: 'Metrological Testing',
      status: 'CURRENT',
      timestamp: 'Active Now',
      actor: 'Officer R. Sharma',
      detail: 'Weighing Error and Corner loading in progress. 4 / 31 test points captured.',
    },
    {
      step: '05',
      title: 'Statutory Peer Review',
      status: 'PENDING',
      detail: 'Awaiting completion of OIML test measurements for Senior Reviewer sign-off.',
    },
    {
      step: '06',
      title: 'Director Sign & Seal',
      status: 'PENDING',
      detail: 'Director PIN authorization and Green Guilloche anti-counterfeit seal.',
    },
    {
      step: '07',
      title: 'Certificate Issuance',
      status: 'PENDING',
      detail: 'Statutory Form VI generation with embedded national e-Māap QR portal token.',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Collapsible Instrument Details (§14) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden transition-all">
        <button
          type="button"
          onClick={() => setIsInstrumentDetailsOpen(!isInstrumentDetailsOpen)}
          className="w-full p-6 flex items-center justify-between text-left hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-[#172554] dark:text-blue-400">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Instrument Details &amp; Metrological Specifications
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory parameters registered under OIML Table 3 &amp; TAC-2026-III-0142.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <span>{isInstrumentDetailsOpen ? 'Hide Specifications' : 'Expand Specifications'}</span>
            {isInstrumentDetailsOpen ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </button>

        {isInstrumentDetailsOpen && (
          <div className="p-6 pt-0 border-t border-slate-100 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-xs font-mono">
              {/* Identification */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="font-sans font-bold text-xs uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-700">
                  Identification
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Manufacturer:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{specs.manufacturer}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Model Identifier:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{specs.model}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Serial Number:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">{specs.serialNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">National Approval No:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{specs.tacNumber}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Testing Laboratory:</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">{specs.laboratory}</span>
                </div>
              </div>

              {/* Metrological */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 space-y-2.5">
                <div className="font-sans font-bold text-xs uppercase tracking-wider text-slate-500 pb-1 border-b border-slate-200 dark:border-slate-700">
                  Metrological Parameters (OIML R 76-1)
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Accuracy Class:</span>
                  <span className="font-bold text-blue-700 dark:text-blue-300">{specs.accuracyClass}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Maximum Capacity (Max):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{specs.maxCapacity}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Minimum Capacity (Min):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{specs.minCapacity}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Verification Interval (e):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{specs.interval}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Scale Interval (d):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{specs.scaleInterval}</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-500 font-sans">Total Divisions (n = Max / e):</span>
                  <span className="font-bold text-slate-900 dark:text-white">{specs.divisionsCount.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. Evidence & Assurance Cards Grid (§15, §16, §18, §37) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Evidence Summary (§15) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  EVIDENCE
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ LINKED
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between font-mono">
                <span>Photos:</span>
                <strong className="text-slate-900 dark:text-white">12 Captured</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>Observations:</span>
                <strong className="text-slate-900 dark:text-white">31 Points</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>Repeatability:</span>
                <strong className="text-slate-900 dark:text-white">10 Runs</strong>
              </div>
              <div className="flex justify-between font-mono">
                <span>Audit Notes:</span>
                <strong className="text-slate-900 dark:text-white">4 Comments</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onOpenEvidenceModal}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Evidence</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 2: Traceability (§16) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  TRACEABILITY
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ VALID
              </span>
            </div>
            <div className="space-y-1 text-xs">
              <div className="font-bold text-slate-900 dark:text-white">
                F1 Standard Set
              </div>
              <div className="font-mono text-[11px] text-slate-500">
                Cert: FW-24-018
              </div>
              <div className="text-[11px] text-slate-500 pt-1">
                Calibration expires:
              </div>
              <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400 text-xs">
                18 Mar 2027
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToStandards}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Traceability Gate</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 3: Cryptographic Audit (§18) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <History className="w-4 h-4 text-purple-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  AUDIT SUMMARY
                </h4>
              </div>
              <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                {meta.auditEventsCount} EVENTS
              </span>
            </div>
            <div className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Session history logged</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Evidence hash linked</span>
              </div>
              <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>Chain verified 100%</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToAudit}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>View Audit Trail</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Card 4: Scale Bridge Telemetry (§37) */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-1.5">
                <Radio className="w-4 h-4 text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  HARDWARE STREAM
                </h4>
              </div>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                ONLINE
              </span>
            </div>
            <div className="space-y-1">
              <div className="font-mono text-lg font-black text-slate-900 dark:text-white">
                12.345 kg
              </div>
              <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                <span>● STABLE</span>
                <span className="text-slate-300 dark:text-slate-700">·</span>
                <span className="text-slate-400 font-normal">RS-232 COM3</span>
              </div>
              <div className="text-[10px] font-mono text-slate-400">
                Last captured: 18:42:11 IST
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onNavigateToBridge}
            className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Scale Bridge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 3. Session History Timeline (§22) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              SESSION HISTORY TIMELINE
            </h4>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Immutable Audit Trail Linked
          </span>
        </div>

        <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
          {timelineStages.map((st) => {
            const isDone = st.status === 'COMPLETED';
            const isCur = st.status === 'CURRENT';

            return (
              <div key={st.step} className="relative group">
                <div
                  className={`absolute -left-6 top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-mono font-bold ${
                    isDone
                      ? 'bg-emerald-600 text-white ring-4 ring-emerald-50 dark:ring-emerald-950'
                      : isCur
                      ? 'bg-blue-600 text-white ring-4 ring-blue-50 dark:ring-blue-950 animate-pulse'
                      : 'bg-slate-200 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isDone ? '✓' : st.step}
                </div>

                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isCur
                          ? 'text-blue-600 dark:text-blue-400 font-black'
                          : isDone
                          ? 'text-slate-900 dark:text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {st.title}
                    </span>
                    {isCur && (
                      <span className="text-[9px] font-mono font-bold px-1.5 py-0.2 rounded bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300">
                        CURRENT
                      </span>
                    )}
                  </div>
                  {st.timestamp && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {st.timestamp} {st.actor && `· ${st.actor}`}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
                  {st.detail}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
