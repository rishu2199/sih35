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
  LayoutGrid,
  List,
  X,
  User,
  ShieldCheck,
} from 'lucide-react';
import { MOCK_ACTIVE_SESSIONS, type ActiveSessionDetail } from '../../data/mockSessions';
import { StatusPill } from '../../components/ui/StatusPill';
import { ComplianceBadge } from '../../components/ui/ComplianceBadge';
import { Button } from '../../components/ui/Button';

export interface ActiveTestsWorkspaceProps {
  onNavigateToTest: (testType: 'weighing' | 'eccentricity' | 'repeatability' | 'vision_audit' | 'review') => void;
  onNavigateToIntake: () => void;
  onInspectLockout: () => void;
}

type FilterTab = 'ALL' | 'IN_PROGRESS' | 'UNDER_REVIEW' | 'LOCKED';
type ViewMode = 'CARDS' | 'LIST';

export const ActiveTestsWorkspace: React.FC<ActiveTestsWorkspaceProps> = ({
  onNavigateToTest,
  onNavigateToIntake,
  onInspectLockout,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>('CARDS');

  const counts = useMemo(() => {
    return {
      all: MOCK_ACTIVE_SESSIONS.length,
      inProgress: MOCK_ACTIVE_SESSIONS.filter((s) => s.status === 'IN_PROGRESS' && !s.isLocked).length,
      underReview: MOCK_ACTIVE_SESSIONS.filter((s) => s.status === 'UNDER_REVIEW').length,
      locked: MOCK_ACTIVE_SESSIONS.filter((s) => s.isLocked).length,
    };
  }, []);

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
        const matchesSerial = session.serialNumber.toLowerCase().includes(query);
        return matchesSession || matchesModel || matchesManufacturer || matchesOfficer || matchesSerial;
      }

      return true;
    });
  }, [activeFilter, searchQuery]);

  const testSteps = [
    { key: 'visual' as const, label: 'Visual' },
    { key: 'weighing' as const, label: 'Error' },
    { key: 'eccentricity' as const, label: 'Eccentricity' },
    { key: 'repeatability' as const, label: 'Repeatability' },
    { key: 'drift' as const, label: 'Drift' },
  ];

  const getStepStatusNode = (status: 'PASS' | 'FAIL' | 'IN_PROGRESS' | 'PENDING' | 'NOT_APPLICABLE', label: string) => {
    if (status === 'NOT_APPLICABLE') {
      return (
        <span
          key={label}
          title={`${label}: Not Applicable`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-400 dark:bg-slate-800/50 dark:text-slate-500 border border-slate-200/50 dark:border-slate-800/50"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <span>{label}</span>
        </span>
      );
    }

    if (status === 'PASS') {
      return (
        <span
          key={label}
          title={`${label}: Completed & Passed`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/50"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{label}</span>
        </span>
      );
    }

    if (status === 'FAIL') {
      return (
        <span
          key={label}
          title={`${label}: Tolerance Exceeded (MPE Violation)`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200/80 dark:border-rose-800/50"
        >
          <XCircle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
          <span>{label}</span>
        </span>
      );
    }

    if (status === 'IN_PROGRESS') {
      return (
        <span
          key={label}
          title={`${label}: Live Testing In Progress`}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200/80 dark:border-blue-800/60"
        >
          <Activity className="w-3 h-3 text-blue-600 dark:text-blue-400 animate-pulse shrink-0" />
          <span>{label}</span>
        </span>
      );
    }

    return (
      <span
        key={label}
        title={`${label}: Pending`}
        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-slate-50 text-slate-500 dark:bg-slate-800/40 dark:text-slate-400 border border-slate-200/60 dark:border-slate-800/60"
      >
        <Clock className="w-3 h-3 text-slate-400 shrink-0" />
        <span>{label}</span>
      </span>
    );
  };

  const renderActionButton = (session: ActiveSessionDetail) => {
    if (session.isLocked) {
      return (
        <Button
          variant="outline"
          size="sm"
          className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs sm:text-sm font-semibold cursor-pointer"
          onClick={onInspectLockout}
          leftIcon={<ShieldAlert className="w-4 h-4 text-rose-500" />}
        >
          Inspect Lockout
        </Button>
      );
    }

    if (session.status === 'UNDER_REVIEW') {
      return (
        <Button
          variant="outline"
          size="sm"
          className="text-xs sm:text-sm font-semibold cursor-pointer border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          onClick={() => onNavigateToTest('review')}
          rightIcon={<FileCheck2 className="w-4 h-4" />}
        >
          Review Suite
        </Button>
      );
    }

    return (
      <Button
        variant="primary"
        size="sm"
        className="text-xs sm:text-sm font-semibold cursor-pointer shadow-xs"
        onClick={() => onNavigateToTest('weighing')}
        rightIcon={<ArrowRight className="w-4 h-4" />}
      >
        Open Worksheet
      </Button>
    );
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 1. Page Header & Primary Action (Clarity & Purpose) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Active Tests
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Workload management and test battery tracking under OIML Recommendation R 76-1.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            leftIcon={<PlusCircle className="w-4 h-4" />}
            onClick={onNavigateToIntake}
            className="text-xs sm:text-sm font-semibold"
          >
            New Intake
          </Button>
        </div>
      </div>

      {/* 2. Executive At-a-Glance KPI Strip (5-10 Second Understanding) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'ALL'
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-xs'
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Workload</span>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-slate-900 dark:text-slate-100">{counts.all}</span>
            <span className="text-xs text-slate-400">sessions</span>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('IN_PROGRESS')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'IN_PROGRESS'
              ? 'bg-blue-50/70 dark:bg-blue-950/30 border-blue-300 dark:border-blue-700 shadow-xs'
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">In Testing</span>
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">{counts.inProgress}</span>
            <span className="text-xs text-slate-400">active tests</span>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('UNDER_REVIEW')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'UNDER_REVIEW'
              ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700 shadow-xs'
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Under Review</span>
            <span className="w-2 h-2 rounded-full bg-amber-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">{counts.underReview}</span>
            <span className="text-xs text-slate-400">pending sign</span>
          </div>
        </button>

        <button
          onClick={() => setActiveFilter('LOCKED')}
          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
            activeFilter === 'LOCKED'
              ? 'bg-rose-50/70 dark:bg-rose-950/30 border-rose-300 dark:border-rose-700 shadow-xs'
              : 'bg-white dark:bg-[#111827] border-slate-200/90 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Statutory Lockout</span>
            <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-rose-600 dark:text-rose-400">{counts.locked}</span>
            <span className="text-xs text-slate-400">action req.</span>
          </div>
        </button>
      </div>

      {/* 3. Filter Toolbar & View Switcher (List vs Card) */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800/80 pb-3">
        {/* Segmented Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            onClick={() => setActiveFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeFilter === 'ALL'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>All</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
              activeFilter === 'ALL'
                ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800 font-bold'
                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
            }`}>
              {counts.all}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('IN_PROGRESS')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeFilter === 'IN_PROGRESS'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>In Testing</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
              activeFilter === 'IN_PROGRESS'
                ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800 font-bold'
                : 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300'
            }`}>
              {counts.inProgress}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('UNDER_REVIEW')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeFilter === 'UNDER_REVIEW'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <span>Under Review</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
              activeFilter === 'UNDER_REVIEW'
                ? 'bg-slate-700 text-slate-200 dark:bg-slate-200 dark:text-slate-800 font-bold'
                : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
            }`}>
              {counts.underReview}
            </span>
          </button>

          <button
            onClick={() => setActiveFilter('LOCKED')}
            className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${
              activeFilter === 'LOCKED'
                ? 'bg-rose-600 text-white font-semibold shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 hover:text-rose-700 dark:hover:text-rose-300'
            }`}
          >
            <span>Locked</span>
            <span className={`text-xs px-1.5 py-0.2 rounded-full font-mono ${
              activeFilter === 'LOCKED'
                ? 'bg-rose-700 text-white font-bold'
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300'
            }`}>
              {counts.locked}
            </span>
          </button>
        </div>

        {/* Search Input & View Switcher */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex-1 sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search session, model, serial, officer..."
              className="w-full pl-9 pr-8 py-1.5 rounded-lg text-xs sm:text-sm bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* List / Card View Mode Toggle */}
          <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/60 p-0.5 text-xs">
            <button
              onClick={() => setViewMode('CARDS')}
              title="Card Grid View"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'CARDS'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('LIST')}
              title="Table List View"
              className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                viewMode === 'LIST'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Main Sessions Presentation */}
      {filteredSessions.length === 0 ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-12 text-center">
          <Scale className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
            No matching verification sessions
          </h3>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            {searchQuery
              ? `No sessions found matching "${searchQuery}". Check the spelling or reset search.`
              : 'No sessions match the selected filter category.'}
          </p>
          {(searchQuery || activeFilter !== 'ALL') && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setActiveFilter('ALL');
              }}
              className="mt-4 text-xs font-medium cursor-pointer"
            >
              Reset Filters
            </Button>
          )}
        </div>
      ) : viewMode === 'CARDS' ? (
        /* Modern, Un-Nested Card Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredSessions.map((session) => (
            <div
              key={session.id}
              className={`rounded-xl border bg-white dark:bg-[#111827] p-5 sm:p-6 flex flex-col justify-between transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs ${
                session.isLocked
                  ? 'border-rose-200/90 dark:border-rose-900/50'
                  : 'border-slate-200/90 dark:border-slate-800/80'
              }`}
            >
              <div className="space-y-4">
                {/* Header: Model & Class Badge + Status/Verdict Pill */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 truncate">
                        {session.instrumentModel}
                      </h3>
                      <StatusPill type="class" value={session.accuracyClass} />
                    </div>
                    <div className="mt-1 flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
                      <span className="font-mono font-semibold text-blue-600 dark:text-blue-400">
                        {session.sessionNumber}
                      </span>
                      <span>•</span>
                      <span>{session.manufacturer}</span>
                      <span>•</span>
                      <span>SN: <strong className="font-mono font-medium text-slate-700 dark:text-slate-300">{session.serialNumber}</strong></span>
                      <span>•</span>
                      <span className="font-mono">Max {session.maxCapacity}, e={session.verificationInterval}</span>
                    </div>
                  </div>

                  <ComplianceBadge
                    status={session.isLocked ? 'LOCKED_OUT' : session.complianceStatus}
                    size="sm"
                  />
                </div>

                {/* Progress Bar & Sequence */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs sm:text-sm">
                    <span className="font-medium text-slate-600 dark:text-slate-400">
                      Verification Battery Progress
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      {session.progressPercent}%
                    </span>
                  </div>

                  {/* Clean progress bar */}
                  <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        session.isLocked
                          ? 'bg-rose-500'
                          : session.progressPercent === 100
                          ? 'bg-emerald-500'
                          : 'bg-blue-600 dark:bg-blue-500'
                      }`}
                      style={{ width: `${session.progressPercent}%` }}
                    />
                  </div>

                  {/* Test step chips */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {testSteps.map(({ key, label }) =>
                      getStepStatusNode(session.batteryStatus[key], label)
                    )}
                  </div>
                </div>

                {/* Calm, Integrated Status Note */}
                {session.notes && (
                  <div className={`flex items-start gap-2.5 p-3 rounded-lg text-xs leading-relaxed ${
                    session.isLocked
                      ? 'bg-rose-500/10 text-rose-800 dark:text-rose-200 border border-rose-500/20'
                      : session.status === 'UNDER_REVIEW'
                      ? 'bg-amber-500/10 text-amber-800 dark:text-amber-200 border border-amber-500/20'
                      : session.progressPercent === 100
                      ? 'bg-emerald-500/10 text-emerald-800 dark:text-emerald-200 border border-emerald-500/20'
                      : 'bg-slate-100/80 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/50'
                  }`}>
                    {session.isLocked ? (
                      <ShieldAlert className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    ) : session.status === 'UNDER_REVIEW' ? (
                      <FileCheck2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    ) : session.progressPercent === 100 ? (
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                    ) : (
                      <Activity className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    )}
                    <span>{session.notes}</span>
                  </div>
                )}
              </div>

              {/* Card Footer: Officer & Primary Action */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 min-w-0 text-xs text-slate-500 dark:text-slate-400">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                    <User className="w-3.5 h-3.5 text-slate-600 dark:text-slate-300" />
                  </div>
                  <div className="truncate">
                    <span className="font-medium text-slate-700 dark:text-slate-200">{session.operatorName}</span>
                    <span className="text-slate-400 ml-1.5">• Updated {session.lastUpdated}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  {renderActionButton(session)}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Scannable, High-Density Table List View (Linear / Stripe Style) */
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/40 text-slate-500 dark:text-slate-400 font-medium">
                <tr>
                  <th className="py-3 px-3.5">Session & Date</th>
                  <th className="py-3 px-3.5">Instrument</th>
                  <th className="py-3 px-3.5">Specifications</th>
                  <th className="py-3 px-3.5 min-w-[130px]">Progress</th>
                  <th className="py-3 px-3.5">Statutory Verdict</th>
                  <th className="py-3 px-3.5">Officer</th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                {filteredSessions.map((session) => (
                  <tr
                    key={session.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Session ID */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <div className="font-mono font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        <span>{session.sessionNumber}</span>
                        {session.isLocked && (
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        )}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        {session.createdAt}
                      </div>
                    </td>

                    {/* Instrument */}
                    <td className="py-3 px-3.5">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[210px]">
                        {session.instrumentModel}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-[210px]">
                        {session.manufacturer} • SN: {session.serialNumber}
                      </div>
                    </td>

                    {/* Specifications */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <StatusPill type="class" value={session.accuracyClass} />
                      <div className="font-mono text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Max {session.maxCapacity} • e={session.verificationInterval}
                      </div>
                    </td>

                    {/* Progress */}
                    <td className="py-3 px-3.5 min-w-[130px]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="flex-1 h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              session.isLocked
                                ? 'bg-rose-500'
                                : session.progressPercent === 100
                                ? 'bg-emerald-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${session.progressPercent}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                          {session.progressPercent}%
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 truncate">
                        Updated {session.lastUpdated}
                      </div>
                    </td>

                    {/* Verdict */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <ComplianceBadge
                        status={session.isLocked ? 'LOCKED_OUT' : session.complianceStatus}
                        size="sm"
                      />
                    </td>

                    {/* Officer */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      <div className="font-medium text-xs sm:text-sm">{session.operatorName}</div>
                    </td>

                    {/* Action */}
                    <td className="py-3 px-3.5 whitespace-nowrap text-right">
                      {renderActionButton(session)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
