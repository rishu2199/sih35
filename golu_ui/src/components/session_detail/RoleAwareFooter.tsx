import React from 'react';
import {
  Save,
  ArrowRight,
  FileCheck2,
  MessageSquarePlus,
  History,
  Stamp,
  Lock,
  AlertTriangle,
  RotateCcw,
} from 'lucide-react';
import { SessionScenario } from './types';

interface RoleAwareFooterProps {
  userRole: string;
  scenario: SessionScenario;
  onSaveSession: () => void;
  onContinueTesting: () => void;
  onOpenReview: () => void;
  onAddComment: () => void;
  onSignCertificate: () => void;
  onViewAuditTrail: () => void;
  onViewCertificate: () => void;
  onResumeCorrection: () => void;
  isTraceabilityLocked?: boolean;
}

export const RoleAwareFooter: React.FC<RoleAwareFooterProps> = ({
  userRole,
  scenario,
  onSaveSession,
  onContinueTesting,
  onOpenReview,
  onAddComment,
  onSignCertificate,
  onViewAuditTrail,
  onViewCertificate,
  onResumeCorrection,
  isTraceabilityLocked = false,
}) => {
  const roleLower = userRole.toLowerCase();
  const isReviewer = roleLower.includes('review');
  const isDirector = roleLower.includes('director');
  const isAuditor = roleLower.includes('audit');
  // Default is Metrologist/Officer

  // Remanded banner state (§19)
  if (scenario === 'REMANDED') {
    return (
      <div className="sticky bottom-4 z-40 bg-amber-50 dark:bg-amber-950/90 border border-amber-300 dark:border-amber-800 rounded-3xl p-4 shadow-lg backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-in slide-in-from-bottom-2">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-200">
              ⚠ SESSION REMANDED BY REVIEWER
            </div>
            <div className="text-xs text-amber-800 dark:text-amber-300 font-medium">
              Correction required on Eccentricity observation before re-submission.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={onResumeCorrection}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow-md transition-all cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Resume Correction →</span>
          </button>
        </div>
      </div>
    );
  }

  // Approved state (§18): permanently read only
  if (scenario === 'APPROVED') {
    return (
      <div className="sticky bottom-4 z-40 bg-white/90 dark:bg-slate-900/90 border border-emerald-300 dark:border-emerald-800/80 rounded-3xl p-4 shadow-lg backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-2xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
              🔒 APPROVED · READ ONLY (CERT-2026-00192)
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Digitally signed and sealed under Indian Legal Metrology Act. Data is cryptographically immutable.
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          <button
            type="button"
            onClick={onViewCertificate}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <FileCheck2 className="w-4 h-4" />
            <span>View Certificate</span>
          </button>
          <button
            type="button"
            onClick={onViewAuditTrail}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <History className="w-4 h-4" />
            <span>Audit Trail</span>
          </button>
        </div>
      </div>
    );
  }

  // Normal role-aware actions (§17)
  return (
    <div className="sticky bottom-4 z-40 bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      {/* Role Indicator badge */}
      <div className="flex items-center gap-2 text-xs">
        <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
          ACTIVE ROLE:
        </span>
        <span className="font-mono font-bold text-slate-900 dark:text-white px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
          {userRole}
        </span>
      </div>

      {/* Role specific actions (§17) */}
      <div className="flex items-center gap-3 self-end sm:self-center">
        {isReviewer ? (
          <>
            <button
              type="button"
              onClick={onAddComment}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <MessageSquarePlus className="w-4 h-4 text-slate-500" />
              <span>Add Audit Comment</span>
            </button>
            <button
              type="button"
              onClick={onOpenReview}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-md shadow-amber-600/25 transition-all cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Open Review</span>
            </button>
          </>
        ) : isDirector ? (
          <>
            <button
              type="button"
              onClick={onOpenReview}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>Review Results</span>
            </button>
            <button
              type="button"
              onClick={onSignCertificate}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/25 transition-all cursor-pointer"
            >
              <Stamp className="w-4 h-4" />
              <span>Sign &amp; Stamp Certificate</span>
            </button>
          </>
        ) : isAuditor ? (
          <>
            <button
              type="button"
              onClick={onViewCertificate}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <FileCheck2 className="w-4 h-4" />
              <span>View Certificate</span>
            </button>
            <button
              type="button"
              onClick={onViewAuditTrail}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-600/25 transition-all cursor-pointer"
            >
              <History className="w-4 h-4" />
              <span>View Audit Trail</span>
            </button>
          </>
        ) : (
          /* Metrologist / Default */
          <>
            <button
              type="button"
              onClick={onSaveSession}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4 text-slate-500" />
              <span>Save Session</span>
            </button>
            <button
              type="button"
              onClick={onContinueTesting}
              disabled={isTraceabilityLocked}
              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs shadow-md transition-all cursor-pointer ${
                isTraceabilityLocked
                  ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-600/25 hover:scale-[1.02]'
              }`}
            >
              <span>Continue Testing</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};
