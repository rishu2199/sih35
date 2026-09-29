import React, { useState } from 'react';
import { ShieldAlert, ExternalLink, ChevronDown, ChevronUp, AlertCircle } from 'lucide-react';
import { Button } from './Button';

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

  // Filter out raw SCREAMING_SNAKE_CASE enum keys, keeping human-readable violations
  const humanViolations = [...reasons, ...violations].filter(
    (item) => !/^[A-Z0-9_]+$/.test(item.trim())
  );

  return (
    <div
      className={`rounded-2xl border border-rose-500/30 bg-rose-950/20 p-5 transition-all shadow-card ${className}`}
      role="alert"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-400 mt-0.5">
            <ShieldAlert className="h-5 w-5" />
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="font-semibold text-rose-400">
                Statutory Lockout
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-400">
                Set ID: <strong className="font-mono font-bold text-rose-400">{weightSetCode}</strong>
              </span>
            </div>

            <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
              Testing Suspended: Standard Weights Non-Compliant
            </h4>

            <p className="text-xs text-slate-400 max-w-3xl leading-relaxed">
              Standard weights fail OIML R 76-1 Clause 3.7.1 traceability rules. Measurement entry and certificate generation are disabled for affected sessions.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center shrink-0 pl-14 sm:pl-0">
          {humanViolations.length > 0 && (
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-rose-400 hover:text-rose-300 transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Violations' : 'View Violations'}</span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 ml-0.5" />
              ) : (
                <ChevronDown className="w-4 h-4 ml-0.5" />
              )}
            </button>
          )}

          {onViewTraceabilityDetails && (
            <Button
              variant="danger"
              size="sm"
              onClick={onViewTraceabilityDetails}
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
              className="text-xs font-medium"
            >
              Audit Details
            </Button>
          )}
        </div>
      </div>

      {isExpanded && humanViolations.length > 0 && (
        <div className="mt-4 pt-4 border-t border-rose-500/20 pl-14 space-y-2 animate-in fade-in duration-150">
          <p className="text-[11px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Traceability Non-Compliance Details:</span>
          </p>
          <ul className="space-y-1.5 text-xs text-slate-300">
            {humanViolations.map((v, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-rose-400 font-bold shrink-0 mt-0.5">•</span>
                <span className="leading-relaxed">{v}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

