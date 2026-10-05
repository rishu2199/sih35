import React from 'react';
import { Layers, FileCheck2, CheckCircle2, ShieldCheck, AlertTriangle, Lock, ArrowRight } from 'lucide-react';
import { MetricData } from '../../types';

interface OperationalMetricRowProps {
  metrics: MetricData;
  standardsStatus?: 'VALID' | 'EXPIRING' | 'EXPIRED';
  isTraceabilityLocked?: boolean;
  onFilterClick?: (filter: 'active' | 'review' | 'pass' | 'traceability') => void;
}

export const OperationalMetricRow: React.FC<OperationalMetricRowProps> = ({
  metrics,
  standardsStatus = 'VALID',
  isTraceabilityLocked = false,
  onFilterClick,
}) => {
  const isExpired = standardsStatus === 'EXPIRED' || isTraceabilityLocked;
  const isExpiring = standardsStatus === 'EXPIRING';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 01 Active Verifications */}
      <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Active Verifications
            </span>
            <div className="p-1.5 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {metrics.activeVerifications}
            </span>
            <span className="text-xs font-semibold text-slate-500">sessions</span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            +3 today
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => onFilterClick?.('active')}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer group"
          >
            <span>View Active Sessions</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 02 Pending Director Sign-Off */}
      <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Pending Director Sign-Off
            </span>
            <div className="p-1.5 rounded-xl bg-amber-50 dark:bg-amber-950 text-amber-600 dark:text-amber-400">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
              {metrics.pendingSignOff}
            </span>
            <span className="text-xs font-semibold text-slate-500">sessions</span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            2 ready today
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => onFilterClick?.('review')}
            className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:text-amber-800 flex items-center gap-1 transition-colors cursor-pointer group"
          >
            <span>View Approvals</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 03 24h Pass Rate */}
      <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              24h Pass Rate
            </span>
            <div className="p-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 tracking-tight">
              {metrics.passRate24h}%
            </span>
          </div>

          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-medium">
            last 24 hours
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => onFilterClick?.('pass')}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer group"
          >
            <span>View Quality Analytics</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* 04 Traceability Status */}
      <div
        className={`border rounded-2xl p-5 flex flex-col justify-between shadow-xs ${
          isExpired
            ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-300 dark:border-rose-900'
            : isExpiring
            ? 'bg-amber-50/50 dark:bg-amber-950/20 border-amber-300 dark:border-amber-900'
            : 'bg-white dark:bg-slate-900 border-[#E4E8EF] dark:border-slate-800'
        }`}
      >
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Traceability
            </span>
            <div
              className={`p-1.5 rounded-xl ${
                isExpired
                  ? 'bg-rose-100 dark:bg-rose-900 text-rose-600'
                  : isExpiring
                  ? 'bg-amber-100 dark:bg-amber-900 text-amber-600'
                  : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-600'
              }`}
            >
              {isExpired ? (
                <Lock className="w-4 h-4" />
              ) : isExpiring ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
            </div>
          </div>

          <div className="flex items-baseline gap-2">
            <span
              className={`text-3xl font-extrabold font-mono tracking-tight ${
                isExpired
                  ? 'text-rose-600 dark:text-rose-400'
                  : isExpiring
                  ? 'text-amber-600 dark:text-amber-400'
                  : 'text-slate-900 dark:text-white'
              }`}
            >
              {isExpired ? 'LOCKED' : isExpiring ? '87%' : '100%'}
            </span>
            <span
              className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                isExpired
                  ? 'bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200'
                  : isExpiring
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                  : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              }`}
            >
              {isExpired ? 'BLOCKED' : isExpiring ? 'ATTENTION' : 'VALID'}
            </span>
          </div>

          <p className="text-[11px] font-medium mt-1 text-slate-500 dark:text-slate-400 truncate">
            {isExpired
              ? '1 set expired'
              : isExpiring
              ? '1 set expiring in 6 days'
              : 'All standard sets valid'}
          </p>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
          <button
            type="button"
            onClick={() => onFilterClick?.('traceability')}
            className={`text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer group ${
              isExpired
                ? 'text-rose-600 hover:text-rose-800'
                : isExpiring
                ? 'text-amber-600 hover:text-amber-800'
                : 'text-emerald-600 dark:text-emerald-400 hover:text-emerald-800'
            }`}
          >
            <span>{isExpired ? 'Resolve Lockout' : 'Review Standards'}</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
};
