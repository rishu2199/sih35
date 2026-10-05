import React, { useState } from 'react';
import {
  ActiveSessionItem,
  SessionTestingStatus,
} from './types';
import {
  ArrowRight,
  AlertTriangle,
  RotateCcw,
  FileCheck2,
  Lock,
  Info,
  CheckCircle2,
  X,
  ExternalLink,
  Layers,
  Scale,
} from 'lucide-react';

interface SessionCardProps {
  session: ActiveSessionItem;
  onResume: (session: ActiveSessionItem) => void;
  onOpenTestPlan: (session: ActiveSessionItem) => void;
  onViewDetail?: (session: ActiveSessionItem) => void;
  onFilterByStatus?: (status: SessionTestingStatus) => void;
  onFilterByClass?: (accuracyClass: string) => void;
  isTraceabilityLocked?: boolean;
}

export const SessionCard: React.FC<SessionCardProps> = ({
  session,
  onResume,
  onOpenTestPlan,
  onViewDetail,
  onFilterByStatus,
  onFilterByClass,
  isTraceabilityLocked = false,
}) => {
  const [showQuickPreview, setShowQuickPreview] = useState<boolean>(false);

  // Status mapping (§7 & §10)
  const getStatusBadge = () => {
    switch (session.status) {
      case 'IN_TESTING':
        return {
          label: '● IN TEST',
          container: 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
          dot: 'bg-blue-600 animate-pulse',
        };
      case 'ACTION_REQUIRED':
        return {
          label: '⚠ NEEDS ATTENTION',
          container: 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border-amber-300 dark:border-amber-800 font-bold',
          dot: 'bg-amber-500',
        };
      case 'PENDING_REVIEW':
        return {
          label: 'PENDING REVIEW',
          container: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-semibold',
          dot: 'bg-indigo-500',
        };
      case 'REMANDED':
        return {
          label: '↩ REMANDED',
          container: 'bg-rose-50 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-bold',
          dot: 'bg-rose-500',
        };
      case 'APPROVED':
        return {
          label: '✓ APPROVED',
          container: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 font-bold',
          dot: 'bg-emerald-500',
        };
      case 'PAUSED':
      default:
        return {
          label: 'PAUSED',
          container: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
          dot: 'bg-slate-400',
        };
    }
  };

  const statusBadge = getStatusBadge();

  // Action button CTA (§10 & §19)
  const getActionConfig = () => {
    if (isTraceabilityLocked && (session.status === 'IN_TESTING' || session.status === 'PAUSED')) {
      return {
        label: 'Resume Testing 🔒',
        color: 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700 cursor-not-allowed',
        disabled: true,
      };
    }

    switch (session.status) {
      case 'ACTION_REQUIRED':
        return {
          label: 'Open Issue →',
          color: 'bg-amber-600 hover:bg-amber-700 active:scale-95 text-white shadow-sm shadow-amber-600/30',
          disabled: false,
        };
      case 'PENDING_REVIEW':
        return {
          label: 'Open Review →',
          color: 'bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white shadow-sm shadow-indigo-600/30',
          disabled: false,
        };
      case 'REMANDED':
        return {
          label: 'Resume Session →',
          color: 'bg-rose-600 hover:bg-rose-700 active:scale-95 text-white shadow-sm shadow-rose-600/30',
          disabled: false,
        };
      case 'APPROVED':
        return {
          label: 'View Certificate →',
          color: 'bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white shadow-sm shadow-emerald-600/30',
          disabled: false,
        };
      case 'PAUSED':
      case 'IN_TESTING':
      default:
        return {
          label: 'Resume Testing →',
          color: 'bg-blue-600 hover:bg-blue-700 active:scale-95 text-white shadow-sm shadow-blue-600/30',
          disabled: false,
        };
    }
  };

  const actionConfig = getActionConfig();

  // Circular progress ring calculation (§8)
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (session.progressPercent / 100) * circumference;

  const handleCardClick = (e: React.MouseEvent) => {
    // If the click is directly on an interactive button, do not bubble
    const target = e.target as HTMLElement;
    if (target.closest('button')) return;

    if (onViewDetail) {
      onViewDetail(session);
    } else {
      onResume(session);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className={`bg-white dark:bg-slate-900 border rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between select-none relative group cursor-pointer ${
        session.status === 'ACTION_REQUIRED'
          ? 'border-amber-300 dark:border-amber-900/60 hover:border-amber-500'
          : session.status === 'REMANDED'
          ? 'border-rose-300 dark:border-rose-900/60 hover:border-rose-500'
          : session.status === 'APPROVED'
          ? 'border-emerald-300 dark:border-emerald-900/60 hover:border-emerald-500'
          : 'border-slate-200 dark:border-slate-800 hover:border-blue-500 dark:hover:border-blue-500'
      }`}
    >
      <div>
        {/* Top Row: Serial Identity & Quick Preview Info Icon (§7, §15) */}
        <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="font-mono font-black text-sm text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {session.serialNumber}
            </div>
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate max-w-[200px]">
              {session.manufacturer} {session.model}
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Quick Preview Information Icon (§15) */}
            <button
              type="button"
              title="Quick Session Details"
              onClick={(e) => {
                e.stopPropagation();
                setShowQuickPreview(!showQuickPreview);
              }}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Accuracy Class & Status Badges (§7, §14) */}
        <div className="flex items-center justify-between gap-2 mt-3">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFilterByClass?.(session.accuracyClass);
            }}
            className="px-2.5 py-0.5 rounded-lg text-[10px] font-mono font-extrabold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-blue-50 hover:text-blue-700 dark:hover:bg-blue-950 dark:hover:text-blue-300 transition-colors cursor-pointer border border-slate-200 dark:border-slate-700"
          >
            {session.accuracyClass}
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFilterByStatus?.(session.status);
            }}
            className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border transition-colors cursor-pointer flex items-center gap-1.5 ${statusBadge.container}`}
          >
            <span>{statusBadge.label}</span>
          </button>
        </div>

        {/* Center Progress Ring & Tests Complete (§7, §8) */}
        <div className="flex flex-col items-center justify-center my-4 py-2">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 64 64">
              <circle
                cx="32"
                cy="32"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="5"
                stroke="currentColor"
                fill="none"
              />
              <circle
                cx="32"
                cy="32"
                r={radius}
                className={`transition-all duration-500 ${
                  session.status === 'ACTION_REQUIRED'
                    ? 'text-amber-500'
                    : session.status === 'REMANDED'
                    ? 'text-rose-500'
                    : session.status === 'APPROVED'
                    ? 'text-emerald-500'
                    : 'text-blue-600'
                }`}
                strokeWidth="5"
                stroke="currentColor"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="none"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-sm font-black font-mono text-slate-900 dark:text-white leading-none">
                {session.currentStep}
              </span>
              <span className="text-[10px] font-bold font-mono text-slate-400 leading-none mt-0.5">
                /{session.totalSteps}
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 mt-1 font-semibold">
            tests complete
          </span>
        </div>

        {/* Current Test Indication (§7, §9, §10) */}
        <div className="pt-2 pb-1 border-t border-slate-100 dark:border-slate-800/80">
          <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400 mb-0.5">
            CURRENT STEP
          </div>
          <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <span className="text-blue-600 dark:text-blue-400 font-mono">
              {session.currentStepCode || `0${session.currentStep}`}
            </span>
            <span className="truncate">{session.currentTestName}</span>
          </div>

          {/* Status-specific banners (§10) */}
          {session.status === 'ACTION_REQUIRED' && (
            <div className="mt-2.5 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-[11px] text-amber-900 dark:text-amber-200">
              <div className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>{session.flagReason || 'Reviewer flagged: Observation #7'}</span>
              </div>
              {session.issueDescription && (
                <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-0.5 font-medium line-clamp-1">
                  {session.issueDescription}
                </div>
              )}
            </div>
          )}

          {session.status === 'PENDING_REVIEW' && (
            <div className="mt-2.5 p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 text-[11px] text-indigo-900 dark:text-indigo-200">
              <div className="font-bold">7 / 7 completed</div>
              <div className="text-[10px] text-indigo-700 dark:text-indigo-400 mt-0.5">
                Reviewer action required before certificate issuance
              </div>
            </div>
          )}

          {session.status === 'REMANDED' && (
            <div className="mt-2.5 p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-[11px] text-rose-900 dark:text-rose-200">
              <div className="font-bold flex items-center gap-1 text-rose-800 dark:text-rose-300">
                <RotateCcw className="w-3.5 h-3.5 text-rose-600" />
                <span>Remanded by Reviewer</span>
              </div>
              <div className="text-[10px] text-rose-700 dark:text-rose-400 mt-0.5 italic line-clamp-1">
                "{session.remandReason || 'Eccentricity observation requires re-check.'}"
              </div>
            </div>
          )}

          {session.status === 'APPROVED' && (
            <div className="mt-2.5 p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-[11px] text-emerald-900 dark:text-emerald-200 flex items-center justify-between">
              <div>
                <span className="font-bold">Certificate:</span>{' '}
                <span className="font-mono">{session.certificateNumber || 'CERT-2026-00192'}</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                <Lock className="w-3 h-3" /> Read only
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Card Footer: Last updated & State-Aware Action Button (§7, §10, §14) */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
        <span className="text-[10px] font-mono text-slate-400">
          Last updated {session.lastSaved}
        </span>

        <button
          type="button"
          disabled={actionConfig.disabled}
          onClick={(e) => {
            e.stopPropagation();
            if (!actionConfig.disabled) {
              onResume(session);
            }
          }}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${actionConfig.color}`}
        >
          <span>{actionConfig.label}</span>
        </button>
      </div>

      {/* Quick Session Preview Popover Overlay (§15) */}
      {showQuickPreview && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute inset-x-3 top-3 bottom-3 bg-white dark:bg-slate-900 border border-blue-400 dark:border-blue-600 rounded-2xl p-4 shadow-xl z-20 flex flex-col justify-between animate-in fade-in zoom-in-95 duration-150"
        >
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                Session Details
              </span>
              <button
                type="button"
                onClick={() => setShowQuickPreview(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2.5 mt-3 text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Serial</span>
                <span className="font-mono font-bold text-slate-900 dark:text-white">{session.serialNumber}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Verification Stage</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{session.verificationStage}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Operator</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{session.operatorName}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Started</span>
                <span className="font-mono text-slate-600 dark:text-slate-300">{session.startedAt || '02 Oct 2026, 10:42'}</span>
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Current Test</span>
                <span className="font-bold text-blue-600 dark:text-blue-400">{session.currentTestName}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
            <span className="font-mono text-slate-400">Last saved: {session.lastSaved}</span>
            <button
              type="button"
              onClick={() => {
                setShowQuickPreview(false);
                if (onViewDetail) onViewDetail(session);
              }}
              className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Full Overview</span>
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
