import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';

interface LockoutBannerProps {
  weightSetCode: string;
  reasons?: string[];
  violations: string[];
  onViewTraceabilityDetails?: () => void;
  className?: string;
}

export const LockoutBanner: React.FC<LockoutBannerProps> = ({
  weightSetCode,
  reasons = [],
  violations,
  onViewTraceabilityDetails,
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  // Filter out raw SCREAMING_SNAKE_CASE enum keys, keeping human-readable text
  const humanViolations = [...reasons, ...violations].filter(
    (item) => !/^[A-Z0-9_]+$/.test(item.trim())
  );

  return (
    <div
      className={`rounded-xl border border-rose-500/25 bg-rose-500/[0.06] dark:bg-rose-950/25 p-3.5 sm:px-4.5 transition-all text-xs ${className}`}
      role="alert"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Indicator & Core Message */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
            <ShieldAlert className="h-4 w-4" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-rose-700 dark:text-rose-300">
                Statutory Lockout
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-600 dark:text-slate-400">
                Weight Set <strong className="font-mono text-rose-600 dark:text-rose-300">{weightSetCode}</strong> expired
              </span>
              <span className="text-slate-400 dark:text-slate-500">•</span>
              <span className="text-slate-500 dark:text-slate-400 truncate">
                Testing suspended for affected scale sessions under Clause 3.7.1
              </span>
            </div>
          </div>
        </div>

        {/* Right: Quick Actions */}
        <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
          {humanViolations.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Details' : 'View Details'}</span>
              {isExpanded ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>
          )}

          {onViewTraceabilityDetails && (
            <button
              type="button"
              onClick={onViewTraceabilityDetails}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-medium shadow-xs transition-colors cursor-pointer text-xs"
            >
              <span>Audit Details</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Expandable Non-Compliance Reasons */}
      {isExpanded && humanViolations.length > 0 && (
        <div className="mt-3 pt-3 border-t border-rose-500/20 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 animate-in">
          <p className="font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Traceability Audit Findings:</span>
          </p>
          <ul className="space-y-1 pl-4 list-disc text-slate-600 dark:text-slate-300">
            {humanViolations.map((v, i) => (
              <li key={i} className="leading-relaxed">
                {v}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
