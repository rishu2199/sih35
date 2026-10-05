import React from 'react';
import { ArrowRight, CheckCircle2, ChevronRight, Scale } from 'lucide-react';
import { VerificationSession } from '../../types/session';
import { getCompletedStepCount } from '../../lib/session/sessionSelectors';

interface SessionsTableProps {
  sessions: any[];
  onSelectSession: (session: any) => void;
}

export const SessionsTable: React.FC<SessionsTableProps> = ({
  sessions,
  onSelectSession,
}) => {
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
    return (
      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        Class II
      </span>
    );
  };

  const getStatusPresentation = (session: any) => {
    const s = (session.reviewStatus || session.status || '').toUpperCase();

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
    // Default: IN TESTING
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
        <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
        IN TESTING
      </span>
    );
  };

  const getNextActionLabel = (session: any) => {
    const s = (session.reviewStatus || session.status || '').toUpperCase();
    if (s.includes('APPROV')) return 'Certificate →';
    if (s.includes('REVIEW')) return 'Review →';
    if (s.includes('REMAND')) return 'Resolve Issue →';
    return 'Continue →';
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-3xl shadow-xs overflow-hidden">
      {/* Desktop Table View (§13, §17) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/70 dark:bg-slate-800/40 border-b border-[#E4E8EF] dark:border-slate-800 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-6">Instrument</th>
              <th className="py-3.5 px-4">Session</th>
              <th className="py-3.5 px-3">Class</th>
              <th className="py-3.5 px-4">Progress</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-6 text-right">Next Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E4E8EF] dark:divide-slate-800 text-xs">
            {sessions.map((session: any) => {
              const sessionNum = session.sessionNumber || session.id;
              const instrumentModel =
                session.model ||
                session.instrument?.modelName ||
                (typeof session.instrument === 'string' ? session.instrument : 'Precision Scale');
              const manufacturer = session.manufacturer || session.instrument?.manufacturer || 'Laboratory Scale';
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
              const nextActionText = getNextActionLabel(session);

              return (
                <tr
                  key={session.id || sessionNum}
                  onClick={() => onSelectSession(session)}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
                >
                  {/* INSTRUMENT */}
                  <td className="py-4 px-6">
                    <div className="font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                      {instrumentModel}
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 font-mono">
                      {manufacturer}
                    </div>
                  </td>

                  {/* SESSION */}
                  <td className="py-4 px-4 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {sessionNum}
                  </td>

                  {/* CLASS */}
                  <td className="py-4 px-3">
                    {getClassBadge(accuracyClass)}
                  </td>

                  {/* PROGRESS */}
                  <td className="py-4 px-4">
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
                  <td className="py-4 px-4">
                    {getStatusPresentation(session)}
                  </td>

                  {/* NEXT ACTION */}
                  <td className="py-4 px-6 text-right">
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

      {/* Mobile Cards View (§17) */}
      <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {sessions.map((session: any) => {
          const sessionNum = session.sessionNumber || session.id;
          const instrumentModel =
            session.model ||
            session.instrument?.modelName ||
            (typeof session.instrument === 'string' ? session.instrument : 'Precision Scale');
          const accuracyClass =
            session.accuracyClass || session.instrument?.accuracyClass || 'Class III';

          let completedSteps = 5;
          if (session.readiness && typeof session.readiness === 'object') {
            completedSteps = getCompletedStepCount(session);
          } else if (session.progressText) {
            const parts = session.progressText.split('/');
            completedSteps = parseInt(parts[0], 10) || 5;
          }

          const progressRatio = `${completedSteps} / 7 steps complete`;
          const progressPct = Math.min(100, Math.round((completedSteps / 7) * 100));

          return (
            <div
              key={session.id || sessionNum}
              onClick={() => onSelectSession(session)}
              className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm">
                    {instrumentModel}
                  </h4>
                  <div className="text-xs text-slate-400 font-mono mt-0.5">
                    {sessionNum}
                  </div>
                </div>
                {getClassBadge(accuracyClass)}
              </div>

              {/* Progress Bar */}
              <div>
                <div className="flex items-center justify-between text-xs font-mono text-slate-500 mb-1">
                  <span>{progressRatio}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-300"
                    style={{ width: `${progressPct}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                {getStatusPresentation(session)}
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400 flex items-center gap-1">
                  <span>Continue Testing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
