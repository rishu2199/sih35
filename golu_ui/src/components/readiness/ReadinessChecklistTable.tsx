import React from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  Lock,
  Clock,
  ChevronRight,
  Info,
  Check,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { ReadinessCheckItem, ReadinessStatus } from './types';

interface ReadinessChecklistTableProps {
  items: ReadinessCheckItem[];
  onSelectItem: (item: ReadinessCheckItem) => void;
}

export const ReadinessChecklistTable: React.FC<ReadinessChecklistTableProps> = ({
  items,
  onSelectItem,
}) => {
  const readyCount = items.filter((i) => i.status === 'READY').length;
  const totalCount = items.length;
  const progressPercent = Math.round((readyCount / totalCount) * 100);
  const isFullyReady = readyCount === totalCount;
  const hasBlocker = items.some((i) => i.status === 'BLOCKED');
  const hasWarning = items.some((i) => i.status === 'WARNING');

  const getStatusBadge = (status: ReadinessStatus) => {
    switch (status) {
      case 'READY':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <Check className="w-3.5 h-3.5 stroke-[2.5] text-emerald-600" />
            ✓ Complete
          </span>
        );
      case 'BLOCKED':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300 dark:border-red-800 ring-2 ring-red-500/20">
            <Lock className="w-3.5 h-3.5 text-red-600" />
            ✕ Blocked
          </span>
        );
      case 'WARNING':
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            ⚠ Attention
          </span>
        );
      case 'PENDING':
      default:
        return (
          <span className="inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            ○ Pending
          </span>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Header & Progress Metric (§8 & §16) */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-500">
              READINESS CHECKLIST §6
            </span>
            <span
              className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                hasBlocker
                  ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300'
                  : isFullyReady
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300'
              }`}
            >
              {hasBlocker
                ? '🔒 TESTING BLOCKED'
                : isFullyReady
                ? '✓ 8 / 8 READY'
                : hasWarning
                ? '⚠ ATTENTION REQUIRED'
                : `${readyCount} / ${totalCount} COMPLETE`}
            </span>
          </div>
          <h3 className="text-base font-black text-slate-900 dark:text-white mt-0.5 tracking-tight">
            Statutory Preflight Engine &amp; Prerequisite Evidence
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 font-sans">
            Every prerequisite is verified from system evidence. Click any row to inspect technical details or resolve issues.
          </p>
        </div>

        {/* Progress Bar Container (§8 & §16) */}
        <div className="w-full sm:w-72 space-y-1.5 font-mono">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600 dark:text-slate-400">
              {readyCount} of {totalCount} checks passed
            </span>
            <span
              className={`font-bold ${
                hasBlocker ? 'text-red-600' : isFullyReady ? 'text-emerald-600' : 'text-blue-600'
              }`}
            >
              {progressPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${
                hasBlocker ? 'bg-red-500' : isFullyReady ? 'bg-emerald-500' : 'bg-blue-500'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* 8 Statutory Rows (§6 & §7) */}
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {items.map((item, idx) => (
          <div
            key={item.id}
            onClick={() => onSelectItem(item)}
            className="p-4 sm:px-6 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
          >
            <div className="flex items-start sm:items-center gap-3.5">
              <span className="font-mono text-xs font-bold text-slate-400 w-6">
                0{idx + 1}
              </span>

              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded">
                    {item.category}
                  </span>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {item.title}
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400 hidden md:inline">
                    · {item.statutoryRef}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  {item.detail}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              {getStatusBadge(item.status)}
              <button
                type="button"
                className="hidden sm:inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors"
              >
                <span>{item.status === 'BLOCKED' || item.status === 'WARNING' ? 'Resolve →' : 'View →'}</span>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
