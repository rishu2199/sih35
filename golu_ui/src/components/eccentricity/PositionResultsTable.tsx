import React from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Flag, Calculator, Edit3, Lock } from 'lucide-react';
import { EccentricityPosition } from './PlatterVisualizer';
import { EccentricityAuditComment } from './EccentricityAuditModal';

interface PositionResultsTableProps {
  positions: EccentricityPosition[];
  selectedPositionId: string;
  onSelectPosition: (id: string) => void;
  onInspectTrace: (position: EccentricityPosition) => void;
  onOpenAudit: (position: EccentricityPosition) => void;
  onOpenManualEntry: (position: EccentricityPosition) => void;
  auditComments: Record<string, EccentricityAuditComment>;
  mpeGrams: number;
  isTraceabilityLocked?: boolean;
}

export const PositionResultsTable: React.FC<PositionResultsTableProps> = ({
  positions,
  selectedPositionId,
  onSelectPosition,
  onInspectTrace,
  onOpenAudit,
  onOpenManualEntry,
  auditComments,
  mpeGrams,
  isTraceabilityLocked = false,
}) => {
  const completedCount = positions.filter((p) => p.status !== 'PENDING').length;

  return (
    <div className="bg-white rounded-xl border border-foundation-200 shadow-xs overflow-hidden">
      {/* Table Header per spec §11 */}
      <div className="p-4 sm:p-5 border-b border-foundation-100 flex items-center justify-between bg-foundation-50/50">
        <div>
          <h3 className="text-sm sm:text-base font-bold text-foundation-900 tracking-tight font-sans">
            POSITION RESULTS (OIML R 76-1 CL 3.6.2)
          </h3>
          <p className="text-xs text-foundation-500 mt-0.5 font-mono">
            Verify indication uniformity across distributed load quadrants at 1/3 Max Capacity (10.000 kg).
          </p>
        </div>
        <span className="text-[11px] font-mono text-foundation-700 bg-white border border-foundation-200 px-2.5 py-1 rounded-full font-semibold shadow-2xs">
          {completedCount} of {positions.length} recorded
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono select-none">
          <thead>
            <tr className="bg-foundation-100/70 border-b border-foundation-200 text-[11px] text-foundation-600 font-bold uppercase tracking-wider">
              <th className="py-2.5 px-4">Position</th>
              <th className="py-2.5 px-3">
                Target Load
                <span className="text-[9px] block text-foundation-400 font-normal">L (1/3 Max)</span>
              </th>
              <th className="py-2.5 px-3">
                Observed Reading
                <span className="text-[9px] block text-foundation-400 font-normal">I (Scale)</span>
              </th>
              <th className="py-2.5 px-3">
                Calculated Error
                <span className="text-[9px] block text-foundation-400 font-normal">Ec = P − L</span>
              </th>
              <th className="py-2.5 px-3">
                Legal Limit
                <span className="text-[9px] block text-foundation-400 font-normal">±MPE Statutory</span>
              </th>
              <th className="py-2.5 px-4">Compliance</th>
              <th className="py-2.5 px-3 text-center">Trace</th>
              <th className="py-2.5 px-3 text-right">Audit</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-foundation-100">
            {positions.map((pos) => {
              const isSelected = selectedPositionId === pos.id;
              const comment = auditComments[pos.id];

              return (
                <tr
                  key={pos.id}
                  onClick={() => onSelectPosition(pos.id)}
                  className={`transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-brand-50/80 border-l-4 border-l-brand-600 font-medium'
                      : 'hover:bg-foundation-50/70'
                  }`}
                >
                  {/* Position Identifier */}
                  <td className="py-3 px-4 font-bold text-foundation-900">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded bg-foundation-200 text-foundation-800 flex items-center justify-center text-[10px] font-bold">
                        {pos.label}
                      </span>
                      <span>{pos.name}</span>
                    </div>
                  </td>

                  {/* Target Load */}
                  <td className="py-3 px-3 font-semibold text-foundation-800">
                    {pos.targetLoad.toFixed(3)} kg
                  </td>

                  {/* Observed Reading with manual edit action */}
                  <td className="py-3 px-3">
                    {pos.observedReading !== undefined ? (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-foundation-900 text-sm">
                          {pos.observedReading.toFixed(3)} kg
                        </span>
                        {!isTraceabilityLocked && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onOpenManualEntry(pos);
                            }}
                            title="Edit observed reading"
                            className="text-foundation-400 hover:text-brand-600 p-0.5 rounded cursor-pointer"
                          >
                            <Edit3 size={12} />
                          </button>
                        )}
                      </div>
                    ) : isTraceabilityLocked ? (
                      <span className="text-rose-600 text-[11px] flex items-center gap-1">
                        <Lock size={11} />
                        <span>Locked</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenManualEntry(pos);
                        }}
                        className="px-2 py-0.5 rounded bg-foundation-100 hover:bg-foundation-200 text-foundation-600 text-[11px] font-semibold"
                      >
                        [ Enter Reading ]
                      </button>
                    )}
                  </td>

                  {/* Calculated Error */}
                  <td className="py-3 px-3">
                    {pos.errorGrams !== undefined ? (
                      <span
                        className={`font-bold text-sm ${
                          pos.status === 'PASS'
                            ? 'text-emerald-700'
                            : pos.status === 'MARGINAL'
                            ? 'text-amber-700'
                            : 'text-rose-700'
                        }`}
                      >
                        {(pos.errorGrams > 0 ? '+' : '') + pos.errorGrams.toFixed(1)} g
                      </span>
                    ) : (
                      <span className="text-foundation-300">—</span>
                    )}
                  </td>

                  {/* Statutory Tolerance Limit */}
                  <td className="py-3 px-3 text-foundation-700 font-semibold">
                    ±{mpeGrams.toFixed(1)} g
                  </td>

                  {/* Compliance Verdict per §11 */}
                  <td className="py-3 px-4">
                    {pos.status === 'PASS' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>✓ PASS</span>
                      </span>
                    ) : pos.status === 'MARGINAL' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                        <AlertTriangle size={12} className="text-amber-600" />
                        <span>⚠ MARGINAL</span>
                      </span>
                    ) : pos.status === 'FAIL' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300">
                        <XCircle size={12} className="text-rose-600" />
                        <span>✕ FAIL</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-foundation-100 text-foundation-500">
                        <span>○ PENDING</span>
                      </span>
                    )}
                  </td>

                  {/* Trace Action ⓘ per §26 */}
                  <td className="py-3 px-3 text-center">
                    {pos.status !== 'PENDING' ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onInspectTrace(pos);
                        }}
                        title="Inspect turning point calculation proof"
                        className="w-6 h-6 rounded-full inline-flex items-center justify-center text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors cursor-pointer"
                      >
                        <span className="font-bold text-xs">ⓘ</span>
                      </button>
                    ) : (
                      <span className="text-foundation-300">—</span>
                    )}
                  </td>

                  {/* Audit Flag ⚑ per §27 */}
                  <td className="py-3 px-3 text-right">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onOpenAudit(pos);
                      }}
                      title={comment ? `Audit remark: ${comment.comment}` : 'Add position audit remark'}
                      className={`p-1.5 rounded transition-colors cursor-pointer ${
                        comment
                          ? 'text-amber-700 bg-amber-100 border border-amber-300'
                          : 'text-foundation-400 hover:text-foundation-700 hover:bg-foundation-100'
                      }`}
                    >
                      <Flag size={14} className={comment ? 'fill-amber-600' : ''} />
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
