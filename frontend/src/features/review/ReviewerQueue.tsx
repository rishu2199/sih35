import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  RotateCcw,
  Eye,
  Lock,
  Flag,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { ReviewSession, ReviewStatus, UserProfile } from '../../types';

interface ReviewerQueueProps {
  sessions: ReviewSession[];
  currentUser: UserProfile;
  selectedSessionId: string | null;
  onSelectSession: (sessionId: string) => void;
  onSubmitForReview: (sessionId: string) => void;
  onOpenSignModal: (sessionId: string) => void;
  onRemandSession: (sessionId: string, reason: string) => void;
}

export const ReviewerQueue: React.FC<ReviewerQueueProps> = ({
  sessions,
  currentUser,
  selectedSessionId,
  onSelectSession,
  onSubmitForReview,
  onOpenSignModal,
  onRemandSession,
}) => {
  const [activeFilter, setActiveFilter] = useState<ReviewStatus | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [classFilter, setClassFilter] = useState<string>('ALL');

  // Filter calculations
  const filteredSessions = sessions.filter((s) => {
    const matchesStatus = activeFilter === 'ALL' || s.status === activeFilter;
    const matchesSearch =
      searchQuery === '' ||
      s.sessionNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.instrumentModel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.manufacturer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.operatorName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = classFilter === 'ALL' || s.accuracyClass === classFilter;
    return matchesStatus && matchesSearch && matchesClass;
  });

  const countPending = sessions.filter((s) => s.status === 'PENDING_REVIEW').length;
  const countInTesting = sessions.filter((s) => s.status === 'IN_TESTING').length;
  const countApproved = sessions.filter((s) => s.status === 'APPROVED').length;
  const countRemanded = sessions.filter((s) => s.status === 'REMANDED').length;

  const getStatusBadge = (status: ReviewStatus) => {
    switch (status) {
      case 'PENDING_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30">
            <Clock className="w-3.5 h-3.5" /> Pending Review
          </span>
        );
      case 'IN_TESTING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30">
            <AlertCircle className="w-3.5 h-3.5" /> In Testing
          </span>
        );
      case 'APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approved &amp; Sealed
          </span>
        );
      case 'REMANDED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            <RotateCcw className="w-3.5 h-3.5" /> Remanded
          </span>
        );
    }
  };

  const getComplianceBadge = (comp: string) => {
    switch (comp) {
      case 'PASS':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
            PASS
          </span>
        );
      case 'MARGINAL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
            MARGINAL
          </span>
        );
      case 'FAIL':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
            FAIL
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-[11px] font-bold font-mono uppercase bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
            PENDING
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 4 Statutory Lifecycle KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Pending Review
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {countPending}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Awaiting Reviewing Officer
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            In Testing
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {countInTesting}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Active on laboratory benches
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Approved &amp; Sealed
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {countApproved}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Signed by Lab Director
          </span>
        </div>

        <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            Remanded for Retest
          </span>
          <div className="my-2">
            <span className="text-3xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums">
              {countRemanded}
            </span>
          </div>
          <span className="text-xs text-slate-500 dark:text-slate-400 font-sans">
            Requires operator revision
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0f1728] p-3.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] shadow-xs">
        {/* Status Tab Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {(
            [
              { key: 'ALL', label: 'All Sessions', count: sessions.length },
              { key: 'PENDING_REVIEW', label: 'Pending Review', count: countPending },
              { key: 'IN_TESTING', label: 'In Testing', count: countInTesting },
              { key: 'APPROVED', label: 'Approved', count: countApproved },
              { key: 'REMANDED', label: 'Remanded', count: countRemanded },
            ] as const
          ).map((tab) => {
            const isActive = activeFilter === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 dark:bg-[#1e293b] text-white dark:text-slate-100 font-semibold border border-slate-700/60 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent font-medium'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[11px] px-1.5 py-0.2 rounded font-mono ${
                    isActive
                      ? 'bg-slate-800 dark:bg-slate-700/80 text-white'
                      : 'bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Class Dropdown */}
        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search serial, model, officer..."
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50/70 dark:bg-[#101828] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors"
            />
          </div>

          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50/70 dark:bg-[#101828] border border-slate-200 dark:border-white/[0.08] rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-500 transition-colors cursor-pointer"
          >
            <option value="ALL">All Classes</option>
            <option value="CLASS_I">Class I</option>
            <option value="CLASS_II">Class II</option>
            <option value="CLASS_III">Class III</option>
            <option value="CLASS_IIII">Class IIII</option>
          </select>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-card dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.25)]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/80 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:border-white/[0.06]">
            <tr>
              <th className="py-3 px-4">Session Number</th>
              <th className="py-3 px-4">Instrument Specification</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Testing Officer</th>
              <th className="py-3 px-4">Audit Flags</th>
              <th className="py-3 px-4">Compliance</th>
              <th className="py-3 px-4 text-right">Workflow Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredSessions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No evaluation sessions match the selected filters.
                </td>
              </tr>
            ) : (
              filteredSessions.map((session) => {
                const isSelected = selectedSessionId === session.id;
                return (
                  <tr
                    key={session.id}
                    onClick={() => onSelectSession(session.id)}
                    className={`cursor-pointer transition-colors ${
                      isSelected
                        ? 'bg-brand-50/60 dark:bg-brand-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                      <div className="flex items-center gap-1.5">
                        {session.isLocked && <Lock className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />}
                        <span>{session.sessionNumber}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-normal font-sans block mt-0.5">
                        SN: {session.serialNumber}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-800 dark:text-slate-200">
                        {session.manufacturer} {session.instrumentModel}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        Max {session.maxCapacity} {session.unit} • e = {session.e} {session.unit} (
                        {session.accuracyClass.replace('_', ' ')})
                      </div>
                    </td>

                    <td className="py-3.5 px-4">{getStatusBadge(session.status)}</td>

                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {session.operatorName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-0.5 leading-tight">
                        {session.stage === 'INITIAL_TYPE_APPROVAL' ? (
                          <>
                            <div>INITIAL TYPE</div>
                            <div>APPROVAL</div>
                          </>
                        ) : (
                          session.stage.replace(/_/g, ' ')
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      {session.commentsCount > 0 ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                          <Flag className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          {session.commentsCount > 1 ? (
                            <span className="text-left leading-tight">
                              <div>{session.commentsCount}</div>
                              <div className="text-[10px] font-normal -mt-0.5">remarks</div>
                            </span>
                          ) : (
                            <span>{session.commentsCount} remark</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">0 remarks</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">{getComplianceBadge(session.complianceStatus)}</td>

                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => onSelectSession(session.id)}
                          className="h-8 px-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 mr-1" />
                          Inspect
                        </button>

                        {/* Metrologist Action */}
                        {currentUser.role === 'METROLOGIST' && session.status === 'IN_TESTING' && (
                          <button
                            type="button"
                            onClick={() => onSubmitForReview(session.id)}
                            className="px-3 py-1 rounded-lg bg-slate-900 dark:bg-[#162032] border border-slate-700/60 hover:bg-slate-800 text-white text-xs font-medium leading-tight text-center transition-colors shadow-xs cursor-pointer"
                          >
                            <div>Submit</div>
                            <div>Review</div>
                          </button>
                        )}

                        {/* Reviewer Action */}
                        {currentUser.role === 'REVIEWER' && session.status === 'PENDING_REVIEW' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                const reason = window.prompt(
                                  'Enter statutory remand justification for the testing officer:'
                                );
                                if (reason) onRemandSession(session.id, reason);
                              }}
                              className="text-xs text-rose-600 hover:text-rose-700"
                            >
                              Remand
                            </Button>
                          </>
                        )}

                        {/* Director Action */}
                        {currentUser.role === 'DIRECTOR' &&
                          session.status === 'PENDING_REVIEW' &&
                          !session.isLocked && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => onOpenSignModal(session.id)}
                              className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1"
                            >
                              <Lock className="w-3 h-3" />
                              Sign &amp; Certify
                            </Button>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
