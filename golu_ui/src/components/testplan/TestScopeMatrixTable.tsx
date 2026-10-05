import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Eye,
  Lock,
  FileCheck2,
  X,
  ShieldAlert,
  Info,
  ExternalLink,
} from 'lucide-react';
import { StatutoryTestItem, TestScopeStatus } from './types';

interface TestScopeMatrixTableProps {
  tests: StatutoryTestItem[];
  onOpenTest: (test: StatutoryTestItem) => void;
  standardsValid: boolean;
  userRole?: string;
  onResolveBlocked?: (test: StatutoryTestItem) => void;
}

export const TestScopeMatrixTable: React.FC<TestScopeMatrixTableProps> = ({
  tests,
  onOpenTest,
  standardsValid,
  userRole = 'Metrologist',
  onResolveBlocked,
}) => {
  const [selectedExplainingTest, setSelectedExplainingTest] = useState<StatutoryTestItem | null>(null);

  // Status mapping (§8: 5 visual states)
  const renderStatusBadge = (test: StatutoryTestItem) => {
    if (test.status === 'BLOCKED' || (!standardsValid && test.status !== 'COMPLETE' && test.required)) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-300">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-600" />
          <span>● BLOCKED</span>
        </span>
      );
    }

    switch (test.status) {
      case 'COMPLETE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 size={13} className="text-emerald-600" />
            <span>✓ COMPLETE</span>
          </span>
        );
      case 'READY':
      case 'CURRENT':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100/70 text-emerald-900 border border-emerald-300 ring-2 ring-emerald-100">
            <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
            <span>● READY</span>
          </span>
        );
      case 'ATTENTION':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
            <AlertTriangle size={13} className="text-amber-600" />
            <span>⚠ ATTENTION</span>
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
            <span>● PENDING</span>
          </span>
        );
      case 'OPTIONAL':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-foundation-100 text-foundation-600 border border-foundation-200">
            <span>OPTIONAL</span>
          </span>
        );
      case 'NOT_APPLICABLE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono text-foundation-400">
            <span>— Not applicable</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-white rounded-xl border border-foundation-200 shadow-xs overflow-hidden select-none font-mono">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-foundation-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
              OIML R 76-1 Matrix
            </span>
            <span className="text-xs text-foundation-400">•</span>
            <span className="text-xs font-bold text-foundation-600 font-sans">
              8 Statutory Verification Procedures
            </span>
          </div>
          <h3 className="text-base font-black text-foundation-950 tracking-tight font-sans mt-1">
            REQUIRED VERIFICATION PROCEDURES
          </h3>
        </div>

        <div className="text-xs text-foundation-500 font-sans flex items-center gap-1.5 bg-foundation-50 px-2.5 py-1 rounded-lg border border-foundation-200">
          <Info size={13} className="text-foundation-400" />
          <span>System-determined statutory rules</span>
        </div>
      </div>

      {/* Desktop Table View (§6, §7) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead>
            <tr className="bg-foundation-50/80 border-b border-foundation-200 text-[11px] text-foundation-500 font-bold uppercase tracking-wider">
              <th className="py-3 px-3 text-center w-12">#</th>
              <th className="py-3 px-4">Verification Procedure</th>
              <th className="py-3 px-3 text-center">Applicability</th>
              <th className="py-3 px-3">Current Status</th>
              <th className="py-3 px-4">Basis</th>
              <th className="py-3 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foundation-100">
            {tests.map((test) => {
              const isBlocked = test.status === 'BLOCKED' || (!standardsValid && test.status !== 'COMPLETE' && test.required);
              const isComplete = test.status === 'COMPLETE';
              const isReady = test.status === 'READY' || test.status === 'CURRENT';
              const isAttention = test.status === 'ATTENTION';
              const isNotApplicable = test.status === 'NOT_APPLICABLE';

              return (
                <tr
                  key={test.id}
                  className={`transition-colors ${
                    isBlocked
                      ? 'bg-rose-50/40 hover:bg-rose-50/70'
                      : isReady
                      ? 'bg-emerald-50/30 hover:bg-emerald-50/60'
                      : isAttention
                      ? 'bg-amber-50/30 hover:bg-amber-50/60'
                      : isNotApplicable
                      ? 'bg-foundation-50/30 text-foundation-400'
                      : 'hover:bg-foundation-50/60'
                  }`}
                >
                  {/* Sequence Number */}
                  <td className="py-3 px-3 text-center font-bold text-foundation-500">
                    {test.sequenceNumber}
                  </td>

                  {/* Verification Procedure & Reference */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-bold font-sans ${
                          isNotApplicable ? 'text-foundation-500' : 'text-foundation-950'
                        }`}
                      >
                        {test.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5 text-[11px] text-foundation-400">
                      <span className="font-bold text-brand-700 bg-brand-50 px-1 rounded">
                        {test.id}
                      </span>
                      <span>•</span>
                      <span>{test.clause}</span>
                    </div>
                    {isBlocked && test.blockReason && (
                      <p className="text-[11px] text-rose-700 font-sans mt-1 font-bold">
                        Blocked: {test.blockReason}
                      </p>
                    )}
                  </td>

                  {/* Applicability (System Determined - §10: NO EDITABLE CHECKBOXES) */}
                  <td className="py-3 px-3 text-center">
                    {test.required ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-black bg-blue-100 text-blue-900 border border-blue-200">
                        REQUIRED
                      </span>
                    ) : test.applicable ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-foundation-100 text-foundation-700">
                        OPTIONAL
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] text-foundation-400 bg-foundation-100/60">
                        NOT REQUIRED
                      </span>
                    )}
                  </td>

                  {/* Current Status */}
                  <td className="py-3 px-3">
                    {renderStatusBadge(test)}
                  </td>

                  {/* Basis (§9: Class/stage determination with explanation drawer trigger) */}
                  <td className="py-3 px-4">
                    <button
                      type="button"
                      onClick={() => setSelectedExplainingTest(test)}
                      className="group text-left text-foundation-600 hover:text-brand-700 transition-colors cursor-pointer flex items-center gap-1.5"
                      title="Inspect statutory basis"
                    >
                      <span className="text-[11px] font-medium underline underline-offset-2 decoration-foundation-300 group-hover:decoration-brand-500">
                        {test.basisText}
                      </span>
                      <HelpCircle size={12} className="text-foundation-400 group-hover:text-brand-600 shrink-0" />
                    </button>
                  </td>

                  {/* Action Button (§7, §11, §12) */}
                  <td className="py-3 px-4 text-right">
                    {isNotApplicable ? (
                      <span className="text-foundation-300 text-[11px]">—</span>
                    ) : isBlocked ? (
                      <button
                        type="button"
                        onClick={() => (onResolveBlocked ? onResolveBlocked(test) : onOpenTest(test))}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white transition-colors inline-flex items-center gap-1 cursor-pointer shadow-2xs"
                      >
                        <span>Resolve →</span>
                      </button>
                    ) : isComplete ? (
                      <button
                        type="button"
                        onClick={() => onOpenTest(test)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-foundation-700 hover:bg-foundation-100 hover:text-brand-700 transition-colors inline-flex items-center gap-1 cursor-pointer border border-foundation-200"
                      >
                        <Eye size={12} />
                        <span>View →</span>
                      </button>
                    ) : isReady ? (
                      <button
                        type="button"
                        onClick={() => onOpenTest(test)}
                        className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>Start →</span>
                      </button>
                    ) : isAttention ? (
                      <button
                        type="button"
                        onClick={() => onOpenTest(test)}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white transition-colors inline-flex items-center gap-1 cursor-pointer"
                      >
                        <span>Review →</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => onOpenTest(test)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-foundation-700 hover:bg-foundation-100 transition-colors inline-flex items-center gap-1 cursor-pointer border border-foundation-200"
                      >
                        <span>Start →</span>
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile Card-Based List View (§15) */}
      <div className="md:hidden divide-y divide-foundation-100 p-3 space-y-3">
        {tests.map((test) => {
          const isBlocked = test.status === 'BLOCKED' || (!standardsValid && test.status !== 'COMPLETE' && test.required);
          const isComplete = test.status === 'COMPLETE';
          const isReady = test.status === 'READY' || test.status === 'CURRENT';

          return (
            <div
              key={test.id}
              className={`p-3.5 rounded-xl border space-y-2.5 ${
                isBlocked
                  ? 'bg-rose-50/50 border-rose-200'
                  : isReady
                  ? 'bg-emerald-50/30 border-emerald-200'
                  : 'bg-white border-foundation-200'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold text-foundation-400">
                    TEST {test.sequenceNumber} • {test.id}
                  </span>
                  <h4 className="text-sm font-bold text-foundation-950 font-sans">
                    {test.name}
                  </h4>
                </div>
                {renderStatusBadge(test)}
              </div>

              <div className="flex items-center justify-between text-xs text-foundation-500 pt-1 border-t border-foundation-100">
                <span className="text-[11px] font-bold text-foundation-700">
                  {test.required ? 'REQUIRED' : 'OPTIONAL'}
                </span>
                <button
                  type="button"
                  onClick={() => setSelectedExplainingTest(test)}
                  className="text-[11px] text-brand-700 underline font-medium cursor-pointer"
                >
                  Basis: {test.basisText.split('+')[0]}
                </button>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => onOpenTest(test)}
                  className="w-full py-2 rounded-lg bg-brand-600 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer"
                >
                  <span>{isComplete ? 'View Procedure' : 'Start Procedure'}</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* "Why is this test included?" Explanation Drawer / Popover (§9) */}
      {selectedExplainingTest && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-foundation-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div className="bg-white rounded-2xl border border-foundation-200 shadow-2xl max-w-lg w-full p-6 space-y-4 font-mono">
            <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-50 text-brand-700 flex items-center justify-center">
                  <FileCheck2 size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-black text-foundation-950 font-sans">
                    WHY IS THIS TEST INCLUDED?
                  </h4>
                  <span className="text-[11px] text-foundation-500">
                    OIML R 76-1 Statutory Test Determination
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedExplainingTest(null)}
                className="p-1 rounded-lg hover:bg-foundation-100 text-foundation-400 hover:text-foundation-700 cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-foundation-50 rounded-xl border border-foundation-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-foundation-500">Procedure:</span>
                  <span className="font-bold text-foundation-900 font-sans">
                    {selectedExplainingTest.name}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foundation-500">Test ID:</span>
                  <span className="font-bold text-brand-700">{selectedExplainingTest.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foundation-500">Legal Metrology Clause:</span>
                  <span className="font-bold text-foundation-800">{selectedExplainingTest.clause}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-foundation-500">Applicability:</span>
                  <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    {selectedExplainingTest.required ? 'REQUIRED' : 'OPTIONAL'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-foundation-500 uppercase tracking-wider block mb-1">
                  Determination Logic
                </span>
                <p className="text-xs text-foundation-800 font-sans bg-brand-50/40 p-3 rounded-lg border border-brand-200 leading-relaxed">
                  {selectedExplainingTest.applicabilityReason}
                </p>
              </div>

              <div className="p-3 bg-foundation-50 rounded-lg text-[11px] text-foundation-600 font-sans space-y-1">
                <div className="font-bold text-foundation-800">Statutory Compliance Note:</div>
                <p>
                  Determination is system-generated from configured test applicability rules according to Legal Metrology Act, 2009 and OIML R 76-1. Manual bypass is strictly prohibited.
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedExplainingTest(null)}
                className="px-4 py-2 rounded-lg bg-foundation-100 hover:bg-foundation-200 text-foundation-800 font-bold text-xs cursor-pointer transition-colors"
              >
                Close Explanation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
