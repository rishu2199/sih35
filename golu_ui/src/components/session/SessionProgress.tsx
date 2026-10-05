import React from 'react';
import { ArrowRight, Lock } from 'lucide-react';
import { ComplianceBadge } from '../ui/ComplianceBadge';
import { ComplianceStatus } from '../../lib/session/types';

export interface SessionProgressProps {
  complianceStatus: ComplianceStatus | 'PASS' | 'FAIL' | 'WARNING' | 'PENDING';
  nextAction?: {
    actionText: string;
    targetTab: string;
  } | null;
  isGoldenPadlock?: boolean;
  onNavigateTab: (tabId: string) => void;
  className?: string;
}

/**
 * SessionProgress (§35)
 * Displays statutory verdict compliance badge and guided Next Best Action pill
 */
export const SessionProgress: React.FC<SessionProgressProps> = ({
  complianceStatus = 'PASS',
  nextAction,
  isGoldenPadlock = false,
  onNavigateTab,
  className = '',
}) => {
  return (
    <div className={`flex items-center gap-3 shrink-0 ${className}`}>
      {/* Current Verdict Badge */}
      <ComplianceBadge status={complianceStatus as any} size="sm" showIcon />

      {/* Next Best Action Pill */}
      {nextAction && !isGoldenPadlock && (
        <button
          type="button"
          onClick={() => onNavigateTab(nextAction.targetTab)}
          className="hidden lg:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
          title={`Advance to ${nextAction.actionText}`}
        >
          <span>Next: {nextAction.actionText}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};
