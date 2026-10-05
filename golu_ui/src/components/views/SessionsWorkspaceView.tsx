import React, { useState, useEffect } from 'react';
import {
  ActiveSessionItem,
  INITIAL_ACTIVE_SESSIONS,
} from '../sessions/types';
import { SessionsTable } from '../sessions/SessionsTable';
import {
  Plus,
  Scale,
  Search,
  AlertTriangle,
  Lock,
  ArrowRight,
  Filter,
  X,
  ChevronDown,
} from 'lucide-react';
import { sessionRepository } from '../../repositories/sessionRepository';
import { VerificationSession } from '../../types/session';

interface SessionsWorkspaceViewProps {
  onSelectSession: (session: any) => void;
  onNewVerification: () => void;
  onOpenTestPlan?: (session: any) => void;
  onViewSessionDetail?: (session: any) => void;
  onOpenDemoCenter?: () => void;
  isTraceabilityLocked?: boolean;
  onResolveTraceability?: () => void;
  isLoading?: boolean;
}

export const SessionsWorkspaceView: React.FC<SessionsWorkspaceViewProps> = ({
  onSelectSession,
  onNewVerification,
  onOpenTestPlan,
  onViewSessionDetail,
  onOpenDemoCenter,
  isTraceabilityLocked = false,
  onResolveTraceability,
  isLoading = false,
}) => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [classFilter, setClassFilter] = useState<string>('ALL');
  const [stageFilter, setStageFilter] = useState<string>('ALL');
  const [isDataLoading, setIsDataLoading] = useState<boolean>(true);

  // Load from sessionRepository so it includes seeded & newly created sessions
  useEffect(() => {
    const fetchSessions = async () => {
      setIsDataLoading(true);
      try {
        const list = await sessionRepository.list();
        if (list && list.length > 0) {
          setSessions(list);
        } else {
          setSessions(INITIAL_ACTIVE_SESSIONS);
        }
      } catch (e) {
        setSessions(INITIAL_ACTIVE_SESSIONS);
      } finally {
        setIsDataLoading(false);
      }
    };
    fetchSessions();
  }, []);

  // Filter logic (§13, §14, §15)
  const filteredSessions = sessions.filter((s) => {
    // Status filter (§15)
    if (statusFilter !== 'ALL') {
      const st = (s.reviewStatus || s.status || '').toUpperCase();
      if (statusFilter === 'IN_TESTING' && !st.includes('TEST') && !st.includes('ACTIVE')) return false;
      if (statusFilter === 'PENDING_REVIEW' && !st.includes('REVIEW')) return false;
      if (statusFilter === 'REMANDED' && !st.includes('REMAND')) return false;
      if (statusFilter === 'APPROVED' && !st.includes('APPROV')) return false;
    }

    // Class filter
    if (classFilter !== 'ALL') {
      const cls = (s.accuracyClass || s.instrument?.accuracyClass || '').toUpperCase();
      if (!cls.includes(classFilter.toUpperCase())) return false;
    }

    // Stage filter
    if (stageFilter !== 'ALL') {
      const stg = (s.verificationStage || '').toUpperCase();
      if (!stg.includes(stageFilter.toUpperCase())) return false;
    }

    // Search query
    if (searchTerm.trim() !== '') {
      const q = searchTerm.toLowerCase().trim();
      const num = (s.sessionNumber || s.id || '').toLowerCase();
      const model = (s.model || s.instrument?.modelName || (typeof s.instrument === 'string' ? s.instrument : '')).toLowerCase();
      const mfr = (s.manufacturer || s.instrument?.manufacturer || '').toLowerCase();
      const serial = (s.serialNumber || s.instrument?.serialNumber || '').toLowerCase();
      if (!num.includes(q) && !model.includes(q) && !mfr.includes(q) && !serial.includes(q)) {
        return false;
      }
    }

    return true;
  });

  const activeCount = sessions.filter((s) => {
    const st = (s.reviewStatus || s.status || '').toUpperCase();
    return !st.includes('APPROV');
  }).length;

  const handleRowClick = (session: any) => {
    if (onViewSessionDetail) {
      onViewSessionDetail(session);
    } else {
      onSelectSession(session);
    }
  };

  if (isLoading || isDataLoading) {
    return (
      <div className="space-y-6 pb-16 animate-pulse">
        <div className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-24 rounded-3xl bg-slate-100 dark:bg-slate-800" />
        <div className="h-80 rounded-3xl bg-slate-100 dark:bg-slate-800" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-16 animate-in fade-in duration-200 font-sans">
      {/* 1. Header (§13) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-slate-400 dark:text-slate-500 text-[11px] font-mono font-bold tracking-wider uppercase mb-1">
            <span>Sessions</span>
            <span className="text-slate-300 dark:text-slate-600">/</span>
            <span className="text-blue-600 dark:text-blue-400">Verification Work</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Verification Work Queue
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 max-w-xl">
            Verification work currently in progress and recently completed.
          </p>
        </div>

        <button
          type="button"
          onClick={onNewVerification}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>+ Register Instrument</span>
        </button>
      </div>

      {/* 2. Global Lockout Banner if standards expired */}
      {isTraceabilityLocked && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-rose-900 dark:text-rose-200">
                🔒 TRACEABILITY LOCKED: Standard Weight Set Expired
              </div>
              <div className="text-rose-700 dark:text-rose-300">
                Testing cannot continue until a valid calibrated standard set is selected.
              </div>
            </div>
          </div>
          {onResolveTraceability && (
            <button
              type="button"
              onClick={onResolveTraceability}
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 transition-colors cursor-pointer"
            >
              View Standard Weights →
            </button>
          )}
        </div>
      )}

      {/* 3. Filter Bar (§13, §14, §15) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-[#E4E8EF] dark:border-slate-800 p-4 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search serial, model or session ID..."
              className="w-full pl-10 pr-8 py-2 text-xs bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-mono transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Quick Filter Dropdowns (§14) */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Dropdown (§15) */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Status: All</option>
              <option value="IN_TESTING">In Testing</option>
              <option value="PENDING_REVIEW">Pending Review</option>
              <option value="REMANDED">Remanded</option>
              <option value="APPROVED">Approved</option>
            </select>

            {/* Accuracy Class Dropdown */}
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Class: All</option>
              <option value="CLASS_I">Class I</option>
              <option value="CLASS_II">Class II</option>
              <option value="CLASS_III">Class III</option>
              <option value="CLASS_IIII">Class IIII</option>
            </select>

            {/* Verification Stage Dropdown */}
            <select
              value={stageFilter}
              onChange={(e) => setStageFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
            >
              <option value="ALL">Stage: All</option>
              <option value="INITIAL">Initial Verification</option>
              <option value="SUBSEQUENT">Subsequent Verification</option>
              <option value="TYPE_APPROVAL">Type Approval</option>
            </select>
          </div>
        </div>

        {/* Sessions count info (§13) */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 font-mono">
          <span>
            Showing <strong className="text-slate-800 dark:text-white font-bold">{filteredSessions.length}</strong> sessions ({activeCount} active)
          </span>
          {(searchTerm || statusFilter !== 'ALL' || classFilter !== 'ALL' || stageFilter !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setClassFilter('ALL');
                stageFilter !== 'ALL' && setStageFilter('ALL');
              }}
              className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer font-bold"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Sessions Content: Table (Desktop) / Cards (Mobile) (§17) */}
      {filteredSessions.length === 0 ? (
        searchTerm || statusFilter !== 'ALL' ? (
          /* Empty search state (§44) */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-8 shadow-xs space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                NO MATCHING SESSIONS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Try another serial number, model or status filter.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
                setClassFilter('ALL');
                setStageFilter('ALL');
              }}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-colors cursor-pointer"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          /* No active sessions empty state (§44) */
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center max-w-md mx-auto my-8 shadow-xs space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-900 flex items-center justify-center mx-auto text-blue-600">
              <Scale className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                NO ACTIVE VERIFICATIONS
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                There are no verification sessions currently in progress.
              </p>
            </div>
            <button
              type="button"
              onClick={onNewVerification}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-2xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Register Instrument</span>
            </button>
          </div>
        )
      ) : (
        <SessionsTable
          sessions={filteredSessions}
          onSelectSession={handleRowClick}
        />
      )}
    </div>
  );
};
