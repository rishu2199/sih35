import React, { useState } from 'react';
import {
  X,
  MessageSquare,
  Flag,
  CheckCircle2,
  Send,
  Calculator,
  ShieldAlert,
  Clock,
  Sparkles,
  Lock,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type {
  ObservationRow,
  RowAuditComment,
  UserProfile,
  AuditCommentSeverity,
} from '../../types';

interface RowLevelCommentDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  row: ObservationRow | null;
  comments: RowAuditComment[];
  currentUser: UserProfile;
  isSessionLocked: boolean;
  onAddComment: (commentData: {
    stepIndex: number;
    testType: 'WEIGHING' | 'ECCENTRICITY' | 'REPEATABILITY' | 'TARE_TEMP';
    targetLoad: number;
    unit: string;
    comment: string;
    severity: AuditCommentSeverity;
  }) => void;
  onToggleResolveComment?: (commentId: string) => void;
}

const QUICK_AUDIT_FLAGS = [
  {
    label: 'Low Margin Warning',
    text: 'Repeatability margin too low (< 0.2e); re-test recommended.',
    severity: 'FLAG' as AuditCommentSeverity,
  },
  {
    label: 'Hysteresis Reversal',
    text: 'Suspected hysteresis reversal between ascending and descending series. Verify mechanical knife-edge bearings.',
    severity: 'FLAG' as AuditCommentSeverity,
  },
  {
    label: 'Changeover Instability',
    text: 'Changeover point ΔL unstable; re-verify auxiliary weights and digital zero tracking.',
    severity: 'FLAG' as AuditCommentSeverity,
  },
  {
    label: 'MPE Non-Compliance',
    text: 'Corrected error exceeds statutory Maximum Permissible Error (MPE). Statutory rejection required.',
    severity: 'REJECT_REASON' as AuditCommentSeverity,
  },
  {
    label: 'Zero Drift Alert',
    text: 'Zero point drift exceeds ±0.25e allowable threshold per OIML R 76-1 Clause A.4.2.3.',
    severity: 'FLAG' as AuditCommentSeverity,
  },
  {
    label: 'Satisfactory Confirmation',
    text: 'Calculation trace verified and compliant with OIML R 76-1 Clause A.4.4.3.',
    severity: 'NOTE' as AuditCommentSeverity,
  },
];

export const RowLevelCommentDrawer: React.FC<RowLevelCommentDrawerProps> = ({
  isOpen,
  onClose,
  row,
  comments,
  currentUser,
  isSessionLocked,
  onAddComment,
  onToggleResolveComment,
}) => {
  const [commentText, setCommentText] = useState('');
  const [severity, setSeverity] = useState<AuditCommentSeverity>('FLAG');

  if (!isOpen || !row) return null;

  const rowComments = comments.filter((c) => c.stepIndex === row.step);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || isSessionLocked) return;

    onAddComment({
      stepIndex: row.step,
      testType: 'WEIGHING',
      targetLoad: row.targetLoad,
      unit: 'g',
      comment: commentText.trim(),
      severity,
    });

    setCommentText('');
  };

  const handleApplyQuickFlag = (flag: (typeof QUICK_AUDIT_FLAGS)[0]) => {
    if (isSessionLocked) return;
    setCommentText(flag.text);
    setSeverity(flag.severity);
  };

  const severityBadge = (sev: AuditCommentSeverity) => {
    switch (sev) {
      case 'REJECT_REASON':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <ShieldAlert className="w-3 h-3" /> Rejection Clause
          </span>
        );
      case 'FLAG':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Flag className="w-3 h-3" /> Technical Flag
          </span>
        );
      case 'NOTE':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <MessageSquare className="w-3 h-3" /> Review Note
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <aside className="relative z-10 w-full max-w-lg bg-white dark:bg-[#0f1728] border-l border-slate-200/80 dark:border-white/[0.08] shadow-2xl flex flex-col h-full animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="p-4 border-b border-slate-200/80 dark:border-white/[0.08] flex items-center justify-between bg-slate-50/70 dark:bg-[#0c121e]">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h3 className="font-bold text-slate-900 dark:text-slate-50 text-base">
                Row-Level Metrology Audit Drawer
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Step #{row.step} • Direction: {row.direction} • Load: {row.targetLoad}g
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-5 text-xs">
          {/* Observation Details Card */}
          <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#121c2d] p-3.5 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px]">
                Raw Observation Parameters
              </span>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                  row.status === 'PASS'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                }`}
              >
                {row.status}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Indication (I):</span>
                <span className="font-mono font-semibold">{row.indication !== null ? `${row.indication} g` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Auxiliary Weights (ΔL):</span>
                <span className="font-mono font-semibold">{row.auxiliaryLoad !== null ? `${row.auxiliaryLoad} g` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">True Indication (P):</span>
                <span className="font-mono font-semibold">{row.trueIndication !== null ? `${row.trueIndication.toFixed(3)} g` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Corrected Error (Ec):</span>
                <span className="font-mono font-semibold text-brand-600 dark:text-brand-400">
                  {row.correctedError !== null ? `${row.correctedError > 0 ? '+' : ''}${row.correctedError.toFixed(3)} g` : '—'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Statutory MPE Limit:</span>
                <span className="font-mono font-semibold">±{row.mpeLimit !== null ? `${row.mpeLimit} g (${row.mpeInE || ''})` : '—'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Tolerance Margin:</span>
                <span className="font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                  {row.margin !== null ? `${row.margin.toFixed(3)} g` : '—'}
                </span>
              </div>
            </div>
          </div>

          {/* OIML Calculation Trace Box */}
          <div className="rounded-xl border border-brand-200 dark:border-brand-900/60 bg-brand-50/40 dark:bg-brand-950/20 p-3 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-brand-700 dark:text-brand-300 text-[11px]">
              <Calculator className="w-3.5 h-3.5" />
              OIML R 76-1 Clause A.4.4.3 Calculation Trace
            </div>
            <div className="font-mono text-[10.5px] text-slate-700 dark:text-slate-300 space-y-1 pl-1">
              <div>P = I + 0.5d - ΔL = {row.indication} + 2.5 - {row.auxiliaryLoad} = {row.trueIndication?.toFixed(3)}</div>
              <div>E = P - L = {row.trueIndication?.toFixed(3)} - {row.targetLoad} = {(Number(row.trueIndication) - Number(row.targetLoad)).toFixed(3)}</div>
              <div>Ec = E - E₀ = {(row.correctedError ?? 0).toFixed(3)}</div>
              <div>Statutory Condition: |Ec| ≤ |MPE| ({Math.abs(row.correctedError ?? 0).toFixed(3)} ≤ {row.mpeLimit})</div>
            </div>
          </div>

          {/* Quick-Add Audit Flags */}
          {!isSessionLocked && (
            <div className="space-y-1.5">
              <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Quick Metrology Audit Flags
              </span>
              <div className="flex flex-wrap gap-1.5">
                {QUICK_AUDIT_FLAGS.map((flag, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleApplyQuickFlag(flag)}
                    className="text-[10px] px-2.5 py-1 rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 hover:border-brand-400 dark:hover:border-brand-600 text-slate-700 dark:text-slate-300 transition-colors text-left"
                  >
                    {flag.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Audit Thread */}
          <div className="space-y-2">
            <span className="font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 text-[10px] flex items-center justify-between">
              <span>Observation Comment History ({rowComments.length})</span>
            </span>

            {rowComments.length === 0 ? (
              <div className="p-4 text-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
                No row-level audit remarks recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {rowComments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`rounded-xl p-3 border text-xs space-y-1.5 transition-all ${
                      comment.resolved
                        ? 'border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20'
                        : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 shadow-xs'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        {severityBadge(comment.severity)}
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {comment.authorName}
                        </span>
                        <span className="text-[10px] text-slate-400">({comment.authorRole})</span>
                      </div>

                      {onToggleResolveComment && !isSessionLocked && (
                        <button
                          onClick={() => onToggleResolveComment(comment.id)}
                          className={`text-[10px] flex items-center gap-1 px-1.5 py-0.5 rounded transition-colors ${
                            comment.resolved
                              ? 'text-emerald-700 dark:text-emerald-300 font-bold'
                              : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
                          }`}
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          {comment.resolved ? 'Resolved' : 'Mark Resolved'}
                        </button>
                      )}
                    </div>

                    <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
                      {comment.comment}
                    </p>

                    <div className="text-[10px] text-slate-400 flex items-center gap-1 pt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(comment.timestamp).toLocaleTimeString('en-IN', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer: Input Form */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
          {isSessionLocked ? (
            <div className="p-3 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
              <span>Session is officially sealed and locked. Comments cannot be added.</span>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Posting as <strong className="text-slate-600 dark:text-slate-300">{currentUser.fullName}</strong> ({currentUser.role})
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase">
                    Severity:
                  </span>
                  {(['NOTE', 'FLAG', 'REJECT_REASON'] as AuditCommentSeverity[]).map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSeverity(s)}
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase transition-colors ${
                        severity === s
                          ? s === 'REJECT_REASON'
                            ? 'bg-rose-600 text-white'
                            : s === 'FLAG'
                            ? 'bg-amber-600 text-white'
                            : 'bg-brand-600 text-white'
                          : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {s.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add row audit flag or note for operator..."
                  className="flex-1 px-3 py-2 text-xs rounded-lg border border-slate-300 dark:border-white/[0.12] bg-white dark:bg-[#121c2d] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500"
                />
                <Button
                  variant="primary"
                  size="sm"
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-3"
                >
                  <Send className="w-3.5 h-3.5" />
                </Button>
              </div>
            </form>
          )}
        </div>
      </aside>
    </div>
  );
};
