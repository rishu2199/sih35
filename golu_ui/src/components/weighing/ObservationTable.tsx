import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calculator,
  Flag,
  ChevronDown,
  ChevronUp,
  Camera,
  Edit3,
  Lock,
} from 'lucide-react';
import { WeighingPoint } from './ErrorCorridorChart';
import { AuditComment } from './AuditCommentModal';

interface ObservationTableProps {
  seriesType: 'ascending' | 'descending';
  seriesIndex: '01' | '02';
  title: string;
  subtitle: string;
  points: WeighingPoint[];
  selectedPointId?: string;
  onSelectPoint: (point: WeighingPoint) => void;
  onCaptureRow: (pointId: string) => void;
  onOpenManualEntry: (point: WeighingPoint) => void;
  onInspectTrace: (point: WeighingPoint) => void;
  onOpenComment: (point: WeighingPoint) => void;
  auditComments: Record<string, AuditComment>;
  verificationStageMultiplier: number;
  userRole: string;
  isScaleStable?: boolean;
  isTraceabilityLocked?: boolean;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const ObservationTable: React.FC<ObservationTableProps> = ({
  seriesType,
  seriesIndex,
  title,
  subtitle,
  points,
  selectedPointId,
  onSelectPoint,
  onCaptureRow,
  onOpenManualEntry,
  onInspectTrace,
  onOpenComment,
  auditComments,
  verificationStageMultiplier,
  userRole,
  isScaleStable = true,
  isTraceabilityLocked = false,
  isCollapsed = false,
  onToggleCollapse,
}) => {
  const completedCount = points.filter((p) => p.status !== 'PENDING').length;
  const isMetrologist =
    userRole.toLowerCase().includes('metrologist') || userRole.toLowerCase().includes('officer');
  const canCapture = isMetrologist && !isTraceabilityLocked;
  const progressPercent = (completedCount / points.length) * 100;

  return (
    <div className="bg-white rounded-xl border border-foundation-200 shadow-xs overflow-hidden">
      {/* Table Header per spec §8, §16, §17 */}
      <div className="p-4 sm:p-5 border-b border-foundation-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-foundation-50/50">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
              {seriesIndex}
            </span>
            <h3 className="text-sm sm:text-base font-bold text-foundation-900 tracking-tight font-sans">
              {title.toUpperCase()}
            </h3>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-foundation-200 text-foundation-700 font-semibold shadow-2xs">
              {completedCount} / {points.length} observations
            </span>
          </div>
          <p className="text-xs text-foundation-500 mt-0.5 font-mono">{subtitle}</p>

          {/* Series Progress Bar per §17 */}
          <div className="flex items-center gap-2 mt-2">
            <div className="w-36 h-2 bg-foundation-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  seriesType === 'ascending' ? 'bg-blue-600' : 'bg-purple-600'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span className="text-[10px] font-mono font-bold text-foundation-600">
              {Math.round(progressPercent)}%
            </span>
          </div>
        </div>

        {onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-700 cursor-pointer shadow-2xs self-start sm:self-auto"
          >
            <span>{isCollapsed ? 'Expand Series' : 'Collapse Series'}</span>
            {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
          </button>
        )}
      </div>

      {/* Main Table Body */}
      {!isCollapsed ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono select-none">
            <thead>
              <tr className="bg-foundation-100/70 border-b border-foundation-200 text-[11px] text-foundation-600 font-bold uppercase tracking-wider">
                <th className="py-2.5 px-4">#</th>
                <th className="py-2.5 px-3">
                  Target Test Load
                  <span className="text-[9px] block text-foundation-400 font-normal">L (Nominal)</span>
                </th>
                <th className="py-2.5 px-3">
                  Observed Reading
                  <span className="text-[9px] block text-foundation-400 font-normal">I (Indicator)</span>
                </th>
                <th className="py-2.5 px-3">
                  Calculated Error
                  <span className="text-[9px] block text-foundation-400 font-normal">Ec = P - L</span>
                </th>
                <th className="py-2.5 px-3">
                  Legal Tolerance Limit
                  <span className="text-[9px] block text-foundation-400 font-normal">±MPE Statutory</span>
                </th>
                <th className="py-2.5 px-4">Compliance</th>
                <th className="py-2.5 px-4 text-center">Trace</th>
                <th className="py-2.5 px-3 text-right">Audit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-foundation-100">
              {points.map((pt, idx) => {
                const isSelected = selectedPointId === pt.id;
                const effectiveMpe = pt.mpeGrams * verificationStageMultiplier;
                const comment = auditComments[pt.id];

                return (
                  <tr
                    key={pt.id}
                    onClick={() => onSelectPoint(pt)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-brand-50/80 border-l-4 border-l-brand-600 font-medium'
                        : 'hover:bg-foundation-50/70'
                    }`}
                  >
                    {/* Index */}
                    <td className="py-3 px-4 text-foundation-400 font-bold">
                      {idx + 1}
                    </td>

                    {/* Target Load */}
                    <td className="py-3 px-3 font-bold text-foundation-900">
                      {pt.targetLoad.toFixed(3)} kg
                    </td>

                    {/* Observed Reading */}
                    <td className="py-3 px-3">
                      {pt.observedReading !== undefined ? (
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-foundation-900 text-sm">
                            {pt.observedReading.toFixed(3)} kg
                          </span>
                          {canCapture && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpenManualEntry(pt);
                              }}
                              title="Edit observed reading"
                              className="text-foundation-400 hover:text-brand-600 p-0.5 rounded cursor-pointer"
                            >
                              <Edit3 size={12} />
                            </button>
                          )}
                        </div>
                      ) : canCapture ? (
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            disabled={!isScaleStable}
                            onClick={() => onCaptureRow(pt.id)}
                            title={
                              isScaleStable
                                ? 'Capture stable weight from connected indicator'
                                : 'Indicator is UNSTABLE. Wait for stability or simulate stable.'
                            }
                            className={`px-2.5 py-1 rounded text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                              isScaleStable
                                ? 'bg-brand-50 hover:bg-brand-100 text-brand-700 border-brand-200'
                                : 'bg-foundation-100 text-foundation-400 border-foundation-200 cursor-not-allowed'
                            }`}
                          >
                            <Camera size={12} />
                            <span>Capture</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenManualEntry(pt)}
                            title="Enter reading manually without live scale"
                            className="px-2 py-1 rounded bg-foundation-50 hover:bg-foundation-100 text-foundation-600 border border-foundation-200 text-[11px] font-semibold cursor-pointer"
                          >
                            Manual
                          </button>
                        </div>
                      ) : isTraceabilityLocked ? (
                        <span className="text-rose-600 text-[11px] flex items-center gap-1">
                          <Lock size={11} />
                          <span>Locked</span>
                        </span>
                      ) : (
                        <span className="text-foundation-400">—</span>
                      )}
                    </td>

                    {/* Calculated Error per §10: Clean human-readable text (+1.8 g) */}
                    <td className="py-3 px-3">
                      {pt.errorGrams !== undefined ? (
                        <span
                          className={`font-bold text-sm ${
                            pt.status === 'PASS'
                              ? 'text-emerald-700'
                              : pt.status === 'MARGINAL'
                              ? 'text-amber-700'
                              : 'text-rose-700'
                          }`}
                        >
                          {(pt.errorGrams > 0 ? '+' : '') + pt.errorGrams.toFixed(1)} g
                        </span>
                      ) : (
                        <span className="text-foundation-300">—</span>
                      )}
                    </td>

                    {/* Legal Tolerance Limit ±MPE */}
                    <td className="py-3 px-3 text-foundation-700 font-semibold">
                      ±{effectiveMpe.toFixed(1)} g
                    </td>

                    {/* Compliance Verdict per §13: PASS, MARGINAL, FAIL */}
                    <td className="py-3 px-4">
                      {pt.status === 'PASS' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle2 size={12} className="text-emerald-600" />
                          <span>✓ PASS</span>
                        </span>
                      ) : pt.status === 'MARGINAL' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300">
                          <AlertTriangle size={12} className="text-amber-600" />
                          <span>⚠ MARGINAL</span>
                        </span>
                      ) : pt.status === 'FAIL' ? (
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

                    {/* Trace Button per §14: ⓘ */}
                    <td className="py-3 px-4 text-center">
                      {pt.status !== 'PENDING' ? (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onInspectTrace(pt);
                          }}
                          title="Inspect turning-point calculation trace (OIML A.4.4.3)"
                          className="w-6 h-6 rounded-full inline-flex items-center justify-center text-brand-600 bg-brand-50 hover:bg-brand-100 border border-brand-200 transition-colors cursor-pointer"
                        >
                          <span className="font-bold text-xs">ⓘ</span>
                        </button>
                      ) : (
                        <span className="text-foundation-300">—</span>
                      )}
                    </td>

                    {/* Row Audit Flag per §18: ⚑ */}
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenComment(pt);
                        }}
                        title={comment ? `Audit flag: ${comment.comment}` : 'Add row audit comment'}
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
      ) : (
        /* Collapsed Summary Banner */
        <div className="p-4 bg-foundation-50/60 flex items-center justify-between text-xs font-mono">
          <span className="text-foundation-600">
            {completedCount} of {points.length} observations complete ({Math.round(progressPercent)}%)
          </span>
          <button
            type="button"
            onClick={onToggleCollapse}
            className="text-brand-600 hover:text-brand-800 font-bold flex items-center gap-1 cursor-pointer"
          >
            <span>Expand Series ({points.length} points)</span>
            <ChevronDown size={14} />
          </button>
        </div>
      )}
    </div>
  );
};
