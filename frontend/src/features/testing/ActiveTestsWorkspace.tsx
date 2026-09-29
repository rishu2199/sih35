import React, { useState, useMemo } from 'react';
import {
  Scale,
  Activity,
  ShieldAlert,
  PlusCircle,
  Search,
  ArrowRight,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
} from 'lucide-react';
import { MOCK_ACTIVE_SESSIONS } from '../../data/mockSessions';
import { StatusPill } from '../../components/ui/StatusPill';
import { ComplianceBadge } from '../../components/ui/ComplianceBadge';
import { Button } from '../../components/ui/Button';

export interface ActiveTestsWorkspaceProps {
  onNavigateToTest: (testType: 'weighing' | 'eccentricity' | 'repeatability' | 'vision_audit' | 'review') => void;
  onNavigateToIntake: () => void;
  onInspectLockout: () => void;
}

type FilterTab = 'ALL' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'LOCKED';

export const ActiveTestsWorkspace: React.FC<ActiveTestsWorkspaceProps> = ({
  onNavigateToTest,
  onNavigateToIntake,
  onInspectLockout,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSessions = useMemo(() => {
    return MOCK_ACTIVE_SESSIONS.filter((session) => {
      // Filter by tab
      if (activeFilter === 'IN_PROGRESS' && (session.status !== 'IN_PROGRESS' || session.isLocked)) {
        return false;
      }
      if (activeFilter === 'UNDER_REVIEW' && session.status !== 'UNDER_REVIEW') {
        return false;
      }
      if (activeFilter === 'LOCKED' && !session.isLocked) {
        return false;
      }

      // Filter by search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesSession = session.sessionNumber.toLowerCase().includes(query);
        const matchesModel = session.instrumentModel.toLowerCase().includes(query);
        const matchesManufacturer = session.manufacturer.toLowerCase().includes(query);
        const matchesOfficer = session.operatorName.toLowerCase().includes(query);
        return matchesSession || matchesModel || matchesManufacturer || matchesOfficer;
      }

      return true;
    });
  }, [activeFilter, searchQuery]);

  const counts = useMemo(() => {
    return {
      all: MOCK_ACTIVE_SESSIONS.length,
      inProgress: MOCK_ACTIVE_SESSIONS.filter((s) => s.status === 'IN_PROGRESS' && !s.isLocked).length,
      underReview: MOCK_ACTIVE_SESSIONS.filter((s) => s.status === 'UNDER_REVIEW').length,
      locked: MOCK_ACTIVE_SESSIONS.filter((s) => s.isLocked).length,
    };
  }, []);

  const testSteps = [
    { key: 'visual' as const, label: 'Visual' },
    { key: 'weighing' as const, label: 'Error (A.4.4)' },
    { key: 'eccentricity' as const, label: 'Eccentricity' },
    { key: 'repeatability' as const, label: 'Repeatability' },
    { key: 'drift' as const, label: 'Drift' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              Active Tests
            </h1>
            <span className="rounded bg-slate-100 dark:bg-slate-800/90 px-2 py-0.5 text-xs font-mono font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              {counts.all} Sessions Registered
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Workload management and test battery tracking under OIML Recommendation R 76-1.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={onNavigateToIntake}
            className="text-xs font-medium"
          >
            New Intake
          </Button>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
        {/* Status Segmented Tabs */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === 'ALL'
                ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'IN_PROGRESS'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>In Testing</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === 'IN_PROGRESS'
                ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
                : 'bg-brand-50 text-brand-700 dark:bg-brand-950/40 dark:text-brand-300'
            }`}>
              {counts.inProgress}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('UNDER_REVIEW')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'UNDER_REVIEW'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Under Review</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === 'UNDER_REVIEW'
                ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
            }`}>
              {counts.underReview}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('LOCKED')}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeFilter === 'LOCKED'
                ? 'bg-rose-600 text-white font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300'
            }`}
          >
            <span>Locked</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              activeFilter === 'LOCKED'
                ? 'bg-rose-700 text-white'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            }`}>
              {counts.locked}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[240px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search session, model, or officer..."
            className="w-full pl-8 pr-3 py-1.5 rounded-md text-xs bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:border-brand-500"
          />
        </div>
      </div>

      {/* Test Sessions Grid */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] p-12 text-center">
          <Scale className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No matching testing sessions
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Try adjusting your search criteria or switching the filter tab.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`rounded-lg border bg-white dark:bg-[#0c121e] p-5 flex flex-col justify-between transition-colors ${
                session.isLocked
                  ? 'border-rose-200/90 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-slate-200/90 dark:border-slate-800/90 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="space-y-4">
                {/* Header: Session ID + Verdict */}
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-xs font-semibold ${
                        session.isLocked ? 'text-rose-700 dark:text-rose-400' : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {session.sessionNumber}
                      </span>
                      {session.isLocked && (
                        <span title="Statutory Traceability Lockout" className="inline-flex items-center">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0" />
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Created {session.createdAt} • Updated {session.lastUpdated}
                    </p>
                  </div>

                  <ComplianceBadge
                    status={session.isLocked ? 'LOCKED_OUT' : session.complianceStatus}
                    size="sm"
                  />
                </div>

                {/* Instrument Specifications (Direct Composition, No Box-in-Box) */}
                <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-slate-100 truncate">
                      {session.instrumentModel}
                    </h4>
                    <StatusPill type="class" value={session.accuracyClass} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>{session.manufacturer} • SN: <span className="font-mono">{session.serialNumber}</span></span>
                    <span className="font-mono text-slate-700 dark:text-slate-300">
                      Max {session.maxCapacity} • e={session.verificationInterval}
                    </span>
                  </div>
                </div>

                {/* OIML R 76 Test Battery Progress */}
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-600 dark:text-slate-400 font-medium">
                      Test Battery Progress
                    </span>
                    <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {session.progressPercent}%
                    </span>
                  </div>

                  {/* Clean progress line */}
                  <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        session.isLocked
                          ? 'bg-rose-500'
                          : session.progressPercent === 100
                          ? 'bg-emerald-500'
                          : 'bg-brand-500'
                      }`}
                      style={{ width: `${session.progressPercent}%` }}
                    />
                  </div>

                  {/* Test step chips */}
                  <div className="flex flex-wrap gap-1.5 pt-0.5">
                    {testSteps.map(({ key, label }) => {
                      const st = session.batteryStatus[key];
                      if (st === 'NOT_APPLICABLE') return null;

                      let chipStyle = 'bg-slate-50 text-slate-500 dark:bg-slate-800/50 dark:text-slate-400 border-slate-200 dark:border-slate-800';
                      let icon = <Clock className="w-2.5 h-2.5 text-slate-400" />;

                      if (st === 'PASS') {
                        chipStyle = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50';
                        icon = <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />;
                      } else if (st === 'FAIL') {
                        chipStyle = 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-300 border-rose-200 dark:border-rose-800/50';
                        icon = <XCircle className="w-2.5 h-2.5 text-rose-600 dark:text-rose-400" />;
                      } else if (st === 'IN_PROGRESS') {
                        chipStyle = 'bg-brand-50 text-brand-700 dark:bg-brand-950/30 dark:text-brand-300 border-brand-200 dark:border-brand-800/50';
                        icon = <Activity className="w-2.5 h-2.5 text-brand-600 animate-pulse" />;
                      }

                      return (
                        <span
                          key={key}
                          className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium border ${chipStyle}`}
                        >
                          {icon}
                          <span>{label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                {/* Contextual status note */}
                {session.notes && (
                  <div className={`text-[11px] leading-relaxed p-2.5 rounded border-l-2 ${
                    session.isLocked
                      ? 'border-rose-500 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200 border-y border-r border-rose-200/60 dark:border-rose-900/40'
                      : session.status === 'UNDER_REVIEW'
                      ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/20 text-amber-900 dark:text-amber-200 border-y border-r border-amber-200/60 dark:border-amber-900/40'
                      : session.progressPercent === 100
                      ? 'border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200 border-y border-r border-emerald-200/60 dark:border-emerald-900/40'
                      : 'border-brand-500 bg-brand-50/40 dark:bg-brand-950/20 text-slate-700 dark:text-slate-300 border-y border-r border-brand-200/50 dark:border-brand-900/40'
                  }`}>
                    {session.notes}
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between gap-2">
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Officer: <strong className="font-medium text-slate-700 dark:text-slate-300">{session.operatorName}</strong>
                </span>

                <div>
                  {session.isLocked ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium cursor-pointer"
                      onClick={onInspectLockout}
                      leftIcon={<ShieldAlert className="w-3.5 h-3.5 text-rose-500" />}
                    >
                      Inspect Lock
                    </Button>
                  ) : session.status === 'UNDER_REVIEW' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs font-medium cursor-pointer"
                      onClick={() => onNavigateToTest('review')}
                      rightIcon={<FileCheck2 className="w-3.5 h-3.5" />}
                    >
                      Review Suite
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      className="text-xs font-medium cursor-pointer"
                      onClick={() => onNavigateToTest('weighing')}
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                    >
                      Worksheet
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

