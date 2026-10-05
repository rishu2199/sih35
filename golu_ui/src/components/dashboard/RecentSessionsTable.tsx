import React from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, Scale } from 'lucide-react';
import { VerificationSession } from '../../types';
import { getCompletedStepCount } from '../../lib/session/sessionSelectors';

interface RecentSessionsTableProps {
  sessions: any[];
  onSelectSession: (session: any) => void;
  onViewAllSessions: () => void;
}

export const RecentSessionsTable: React.FC<RecentSessionsTableProps> = ({
  sessions,
  onSelectSession,
  onViewAllSessions,
}) => {
  // Use supplied sessions or canonical 5 OIML verification queue sessions (§7, §40)
  const canonicalSessions = sessions && sessions.length > 0 ? sessions.slice(0, 5) : [];

  const getClassBadge = (accClass: string) => {
    const norm = (accClass || '').toUpperCase();
    if (norm.includes('CLASS_I') || (norm.includes('I') && !norm.includes('II') && !norm.includes('III') && !norm.includes('IIII'))) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-50 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
          Class I
        </span>
      );
    }
    if (norm.includes('CLASS_IIII') || norm.includes('IIII')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          Class IIII
        </span>
      );
    }
    if (norm.includes('CLASS_III') || norm.includes('III')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
          Class III
        </span>
      );
    }
    if (norm.includes('CLASS_II') || norm.includes('II')) {
      return (
        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
          Class II
        </span>
      );
    }
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
        {accClass}
      </span>
    );
  };

  const getStatusPresentation = (status: string, reviewStatus?: string) => {
    const s = (reviewStatus || status || '').toUpperCase();

    if (s.includes('APPROV')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
          APPROVED
        </span>
      );
    }
    if (s.includes('REMAND')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          REMANDED
        </span>
      );
    }
    if (s.includes('REVIEW')) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          PENDING REVIEW
        </span>
      );
    }
    // Default: In Testing
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
        IN TESTING
      </span>
    );
  };

  const getNextActionLabel = (status: string, reviewStatus?: string) => {
    const s = (reviewStatus || status || '').toUpperCase();
    if (s.includes('APPROV')) return 'View Certificate →';
    if (s.includes('REVIEW')) return 'Review →';
    if (s.includes('REMAND')) return 'Resolve Issue →';
    return 'Continue →';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden flex flex-col justify-between h-full">
      {/* Table Header */}
      <div className="p-5 sm:px-6 flex items-center justify-between border-b border-[#E4E8EF] dark:border-slate-800">
        <div>
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
            Recent Verification Sessions
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Active verification work currently under statutory evaluation
          </p>
        </div>

        <button
          type="button"
          onClick={onViewAllSessions}
          className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-800 flex items-center gap-1 transition-colors cursor-pointer"
        >
          <span>View all sessions →</span>
        </button>
      </div>

      {/* Table Content (§7) */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-[#E4E8EF] dark:border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3 px-4 sm:px-6">Session</th>
              <th className="py-3 px-4">Instrument</th>
              <th className="py-3 px-3">Class</th>
              <th className="py-3 px-4">Progress</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 sm:px-6 text-right">Next Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF] dark:divide-slate-800 text-xs">
            {canonicalSessions.map((session: any) => {
              const sessionNum = session.sessionNumber || session.id || 'AV-2026-8812';
              const instrumentModel =
                session.model ||
                session.instrument?.modelName ||
                (typeof session.instrument === 'string' ? session.instrument : 'ZM201 Retail Platform');
              const accuracyClass =
                session.accuracyClass || session.instrument?.accuracyClass || 'Class III';

              // Calculate progress (§21, §41)
              let completedSteps = 5;
              if (session.readiness && typeof session.readiness === 'object') {
                completedSteps = getCompletedStepCount(session);
              } else if (session.progressText) {
                const parts = session.progressText.split('/');
                completedSteps = parseInt(parts[0], 10) || 5;
              } else if (session.completedSteps !== undefined) {
                completedSteps = session.completedSteps;
              }

              const progressRatio = `${completedSteps} / 7`;
              const progressPct = Math.min(100, Math.round((completedSteps / 7) * 100));

              const statusText = session.reviewStatus || session.status || 'IN_TESTING';
              const nextActionText = getNextActionLabel(statusText, session.reviewStatus);

              return (
                <tr
                  key={session.id || sessionNum}
                  onClick={() => onSelectSession(session)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  {/* SESSION */}
                  <td className="py-3.5 px-4 sm:px-6 font-mono font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                    {sessionNum}
                  </td>

                  {/* INSTRUMENT */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900 dark:text-white truncate max-w-[200px]">
                      {instrumentModel}
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono">
                      {session.manufacturer || 'Approved Laboratory Device'}
                    </div>
                  </td>

                  {/* CLASS */}
                  <td className="py-3.5 px-3">
                    {getClassBadge(accuracyClass)}
                  </td>

                  {/* PROGRESS */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {progressRatio}
                      </span>
                      <div className="w-16 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-blue-600 h-full rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* STATUS */}
                  <td className="py-3.5 px-4">
                    {getStatusPresentation(session.status, session.reviewStatus)}
                  </td>

                  {/* NEXT ACTION (§8) */}
                  <td className="py-3.5 px-4 sm:px-6 text-right">
                    <span className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 group-hover:text-blue-800 transition-colors">
                      <span>{nextActionText}</span>
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
