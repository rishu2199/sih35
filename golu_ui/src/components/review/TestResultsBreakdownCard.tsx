import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, ArrowRight, Eye, FileText, Check } from 'lucide-react';
import { ReviewTestItem } from './types';

interface TestResultsBreakdownCardProps {
  tests: ReviewTestItem[];
  onOpenTest: (test: ReviewTestItem) => void;
}

export const TestResultsBreakdownCard: React.FC<TestResultsBreakdownCardProps> = ({
  tests,
  onOpenTest,
}) => {
  return (
    <div className="bg-white border border-foundation-200 rounded-2xl shadow-xs overflow-hidden font-mono select-none">
      {/* Header (§8) */}
      <div className="p-4 sm:p-5 border-b border-foundation-100 flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider block">
            STATUTORY TEST EVIDENCE
          </span>
          <h3 className="text-base font-bold text-foundation-950 font-sans tracking-tight">
            Test Results & Evidence Dossier
          </h3>
        </div>
        <span className="text-xs text-foundation-500 font-sans hidden sm:block">
          Click row to inspect observation data
        </span>
      </div>

      {/* Table format per §2, §8, §9 */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="bg-foundation-50/75 text-[11px] text-foundation-500 font-bold uppercase tracking-wider border-b border-foundation-200">
              <th className="py-2.5 px-4 w-12 text-center">#</th>
              <th className="py-2.5 px-4">Verification Procedure</th>
              <th className="py-2.5 px-3">Result</th>
              <th className="py-2.5 px-3 text-center">Data</th>
              <th className="py-2.5 px-4">Evidence</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foundation-100">
            {tests.map((test, idx) => {
              const isPass = test.status === 'PASS';
              const isMarginal = test.status === 'MARGINAL';
              const isFail = test.status === 'FAIL';
              const seq = String(idx + 1).padStart(2, '0');

              return (
                <tr
                  key={test.id}
                  onClick={() => onOpenTest(test)}
                  className="hover:bg-foundation-50/70 transition-colors cursor-pointer group"
                >
                  <td className="py-3 px-4 text-center font-bold text-foundation-400">
                    {seq}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-bold text-foundation-950 font-sans group-hover:text-brand-700 transition-colors">
                      {test.name}
                    </div>
                    <div className="text-[11px] text-foundation-400 mt-0.5">
                      {test.code}
                    </div>
                  </td>

                  <td className="py-3 px-3">
                    {isFail ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 border border-rose-300">
                        <XCircle size={11} className="text-rose-600" />
                        <span>✕ FAIL</span>
                      </span>
                    ) : isMarginal ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                        <AlertTriangle size={11} className="text-amber-600" />
                        <span>⚠ ATTENTION</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                        <CheckCircle2 size={11} className="text-emerald-600" />
                        <span>✓ PASS</span>
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="font-bold text-emerald-700 text-sm">✓</span>
                  </td>

                  <td className="py-3 px-4 text-foundation-600 font-sans text-xs">
                    {test.observationsCount}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenTest(test);
                      }}
                      className="px-3 py-1 rounded-lg text-xs font-bold text-foundation-700 hover:bg-foundation-100 group-hover:text-brand-700 group-hover:bg-brand-50 transition-colors inline-flex items-center gap-1 border border-foundation-200 cursor-pointer"
                    >
                      <Eye size={12} />
                      <span>View evidence →</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
