import React from 'react';
import { MessageSquare, AlertTriangle, Info, CheckCircle2, ArrowRight } from 'lucide-react';
import { ReviewFinding } from './types';

interface ReviewFindingsCardProps {
  findings: ReviewFinding[];
  onOpenFindingsDrawer: () => void;
}

export const ReviewFindingsCard: React.FC<ReviewFindingsCardProps> = ({
  findings,
  onOpenFindingsDrawer,
}) => {
  const flagsCount = findings.filter((f) => f.severity === 'FLAG').length;
  const notesCount = findings.filter((f) => f.severity === 'NOTE').length;
  const blockersCount = findings.filter((f) => f.severity === 'BLOCKER').length;

  return (
    <div className="bg-white border border-foundation-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-foundation-100">
          <div>
            <span className="text-[11px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
              Review Findings & Notes
            </span>
            <h3 className="text-sm font-bold text-foundation-900 font-sans">
              Peer Review Comments & Flags
            </h3>
          </div>
          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-full bg-foundation-100 text-foundation-700">
            {findings.length} item{findings.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Blocking status callout */}
        {blockersCount > 0 ? (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs mb-3 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">1 Blocking Issue Identified</div>
              <div className="text-[11px] text-rose-700 mt-0.5">
                Statutory non-conformance must be resolved or remanded before sign-off.
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <div className="font-semibold">
              ✓ No blocking findings. Case complies with verification threshold.
            </div>
          </div>
        )}

        {/* Breakdown chips */}
        <div className="flex items-center gap-2 mb-3">
          <div className="flex-1 p-2.5 rounded-xl border border-foundation-200 bg-foundation-50/50 flex items-center justify-between">
            <span className="text-xs text-foundation-600 flex items-center gap-1.5 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
              Flags / Warnings
            </span>
            <span className="font-mono text-xs font-bold text-amber-800">{flagsCount}</span>
          </div>

          <div className="flex-1 p-2.5 rounded-xl border border-foundation-200 bg-foundation-50/50 flex items-center justify-between">
            <span className="text-xs text-foundation-600 flex items-center gap-1.5 font-medium">
              <Info className="w-3.5 h-3.5 text-blue-600" />
              Observation Notes
            </span>
            <span className="font-mono text-xs font-bold text-blue-800">{notesCount}</span>
          </div>
        </div>

        {/* Recent Finding Preview */}
        {findings.length > 0 && (
          <div className="space-y-2">
            {findings.slice(0, 2).map((f) => (
              <div
                key={f.id}
                className="p-2.5 rounded-xl border border-foundation-200 bg-foundation-50/30 text-xs"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] font-bold text-foundation-600">
                    {f.observationIndex} · {f.testName.split(' ')[0]}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded ${
                      f.severity === 'FLAG'
                        ? 'bg-amber-100 text-amber-800'
                        : f.severity === 'BLOCKER'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {f.severity}
                  </span>
                </div>
                <p className="text-foundation-700 text-[11px] line-clamp-1 italic">
                  "{f.text}"
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-4 pt-3 border-t border-foundation-100">
        <button
          type="button"
          onClick={onOpenFindingsDrawer}
          className="w-full py-2 px-3 rounded-xl border border-foundation-200 bg-foundation-50 hover:bg-foundation-100 text-xs font-bold text-foundation-800 transition-colors flex items-center justify-center gap-1.5"
        >
          <MessageSquare size={14} className="text-foundation-600" />
          <span>View All Findings ({findings.length})</span>
          <ArrowRight size={13} className="text-foundation-400" />
        </button>
      </div>
    </div>
  );
};
