import React, { useState, useMemo } from 'react';
import {
  Activity,
  Award,
  Calendar,
  FileText,
  PlusCircle,
  Scale,
  ShieldAlert,
  ShieldCheck,
  Weight,
  Search,
  ArrowRight,
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { Button } from '../../components/ui/Button';
import { MetricCard } from '../../components/ui/MetricCard';
import { ComplianceBadge } from '../../components/ui/ComplianceBadge';
import { StatusPill } from '../../components/ui/StatusPill';
import { DataTable, type Column } from '../../components/ui/DataTable';
import { LockoutBanner } from '../../components/ui/LockoutBanner';
import { Modal } from '../../components/ui/Modal';
import type { TestSessionSummary } from '../../types';
import { MOCK_ACTIVE_SESSIONS } from '../../data/mockSessions';

export interface LabDashboardProps {
  onNavigateToIntake?: () => void;
  onNavigateToTesting?: () => void;
}

export const LabDashboard: React.FC<LabDashboardProps> = ({
  onNavigateToIntake,
  onNavigateToTesting,
}) => {
  const { activeLab, activeTestCount } = useLab();

  // State for lockout inspection modal
  const [isLockoutModalOpen, setIsLockoutModalOpen] = useState(false);
  const [isNewIntakeModalOpen, setIsNewIntakeModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN_TESTING' | 'PENDING_REVIEW' | 'LOCKED'>('ALL');
  const [lowerTab, setLowerTab] = useState<'ACTIVITY' | 'GUIDELINES'>('ACTIVITY');

  const mockSessions: TestSessionSummary[] = MOCK_ACTIVE_SESSIONS;

  // Filtered sessions
  const filteredSessions = useMemo(() => {
    return mockSessions.filter((s) => {
      // Status tab filter
      if (statusFilter === 'IN_TESTING' && s.stage !== 'INITIAL_TYPE_APPROVAL' && s.stage !== 'SUBSEQUENT_VERIFICATION') {
        if (s.isLocked || s.complianceStatus !== 'PASS') return false;
      }
      if (statusFilter === 'PENDING_REVIEW' && s.stage !== 'IN_SERVICE_INSPECTION') {
        if (s.isLocked) return false;
      }
      if (statusFilter === 'LOCKED' && !s.isLocked) {
        return false;
      }

      // Search query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          s.sessionNumber.toLowerCase().includes(q) ||
          s.instrumentModel.toLowerCase().includes(q) ||
          s.manufacturer.toLowerCase().includes(q) ||
          s.serialNumber.toLowerCase().includes(q) ||
          s.operatorName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [mockSessions, statusFilter, searchQuery]);

  // Standard Weight Sets Registry Mock Data
  const weightSets = [
    {
      id: 'ws-1',
      code: 'RRSL-SET-E2-001',
      weightClass: 'E2',
      certNumber: 'NPLI-CAL-2026-E2-0842',
      calibratedBy: 'NPL India (NPLI)',
      expiryDays: 275,
      status: 'VERIFIED' as const,
    },
    {
      id: 'ws-2',
      code: 'RRSL-SET-F1-042',
      weightClass: 'F1',
      certNumber: 'RRSL-BLR-2026-F1-110',
      calibratedBy: 'RRSL Bengaluru',
      expiryDays: 305,
      status: 'VERIFIED' as const,
    },
    {
      id: 'ws-3',
      code: 'LM-DLH-M1-778',
      weightClass: 'M1',
      certNumber: 'DLH-LM-2026-M1-992',
      calibratedBy: 'Delhi State LM Central Lab',
      expiryDays: 14,
      status: 'WARNING' as const,
    },
    {
      id: 'ws-4',
      code: 'WORKSHOP-M2-SET',
      weightClass: 'M2',
      certNumber: 'M2-CERT-2025-998',
      calibratedBy: 'State Weights Lab',
      expiryDays: -35,
      status: 'LOCKED_OUT' as const,
    },
  ];

  // Recent Activity Feed
  const recentActivities = [
    {
      id: 'act-1',
      time: '12 min ago',
      title: 'Turning Point Observed',
      detail: 'Step 4 (10,000 g) ΔL recorded for TR-2026-0002',
      officer: 'Dr. Anand Raman',
      badge: 'PASS',
      type: 'success',
    },
    {
      id: 'act-2',
      time: '28 min ago',
      title: 'Optical Tilt Verified',
      detail: 'Spirit level verified concentric (≤ 0.20°) via CV Engine',
      officer: 'Dr. Anand Raman',
      badge: 'FORM 01',
      type: 'info',
    },
    {
      id: 'act-3',
      time: '45 min ago',
      title: 'Type Approval Signed',
      detail: 'Certificate issued for Precision-Pro 30K (Rule 16)',
      officer: 'Dr. Rajeshwar Sharma',
      badge: 'APPROVED',
      type: 'success',
    },
    {
      id: 'act-4',
      time: '1 hr ago',
      title: 'Traceability Gate Alert',
      detail: 'Standard Set WORKSHOP-M2-SET flagged (calibration expired)',
      officer: 'System Auto-Audit',
      badge: 'LOCKOUT',
      type: 'danger',
    },
  ];

  // Table Columns Definition
  const sessionColumns: Column<TestSessionSummary>[] = [
    {
      key: 'sessionNumber',
      header: 'Session',
      className: 'whitespace-nowrap min-w-[170px]',
      render: (row) => (
        <div>
          <div className="flex items-center gap-1.5 font-mono text-xs font-semibold text-slate-900 dark:text-slate-100">
            <span>{row.sessionNumber}</span>
            {row.isLocked && (
              <span title="Statutory Lockout Active">
                <ShieldAlert className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              </span>
            )}
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            {row.createdAt}
          </span>
        </div>
      ),
    },
    {
      key: 'instrumentModel',
      header: 'Instrument',
      className: 'min-w-[220px]',
      render: (row) => (
        <div>
          <p className="font-medium text-xs sm:text-sm text-slate-900 dark:text-slate-100">
            {row.instrumentModel}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {row.manufacturer} • SN: <span className="font-mono">{row.serialNumber}</span>
          </p>
        </div>
      ),
    },
    {
      key: 'accuracyClass',
      header: 'Class & Capacity',
      className: 'whitespace-nowrap min-w-[160px]',
      render: (row) => (
        <div className="space-y-1">
          <StatusPill type="class" value={row.accuracyClass} />
          <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
            Max {row.maxCapacity} • e={row.verificationInterval}
          </p>
        </div>
      ),
    },
    {
      key: 'stage',
      header: 'Stage',
      className: 'whitespace-nowrap min-w-[130px]',
      render: (row) => (
        <div className="space-y-0.5">
          <StatusPill type="stage" value={row.stage} />
          <p className="text-[10px] font-mono text-slate-500 dark:text-slate-400 pl-0.5">
            {row.stage === 'IN_SERVICE_INSPECTION' ? '2.0× MPE' : '1.0× MPE'}
          </p>
        </div>
      ),
    },
    {
      key: 'complianceStatus',
      header: 'Verdict',
      align: 'center',
      className: 'whitespace-nowrap min-w-[110px]',
      render: (row) => (
        <ComplianceBadge
          status={row.isLocked ? 'LOCKED_OUT' : row.complianceStatus}
          size="sm"
        />
      ),
    },
    {
      key: 'operatorName',
      header: 'Officer',
      className: 'whitespace-nowrap min-w-[120px]',
      render: (row) => (
        <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          {row.operatorName}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      align: 'right',
      className: 'whitespace-nowrap min-w-[110px]',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.isLocked ? (
            <Button
              variant="outline"
              size="sm"
              className="border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-medium"
              onClick={() => setIsLockoutModalOpen(true)}
            >
              Inspect Lock
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold bg-brand-50 hover:bg-brand-100 text-brand-700 dark:bg-brand-950/60 dark:hover:bg-brand-900/60 dark:text-brand-300 border border-brand-200 dark:border-brand-800/80 cursor-pointer"
              onClick={() => onNavigateToTesting && onNavigateToTesting()}
            >
              Worksheet →
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Page Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Laboratory Overview
          </h1>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            {activeLab.name} ({activeLab.code}) • NABL Accreditation {activeLab.nablAccreditationNo || 'CC-2849'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Calendar className="w-3.5 h-3.5 text-slate-500" />}
            onClick={() => setIsLockoutModalOpen(true)}
            className="text-xs font-medium"
          >
            Standards Audit
          </Button>

          <Button
            variant="primary"
            size="sm"
            leftIcon={<PlusCircle className="w-3.5 h-3.5" />}
            onClick={() => {
              if (onNavigateToIntake) {
                onNavigateToIntake();
              } else {
                setIsNewIntakeModalOpen(true);
              }
            }}
            className="text-xs font-medium"
          >
            + New Intake
          </Button>
        </div>
      </div>

      {/* Sleek, High-Priority Statutory Lockout Alert */}
      <LockoutBanner
        weightSetCode="WORKSHOP-M2-SET"
        reasons={['INADEQUATE_WEIGHT_CLASS', 'CALIBRATION_EXPIRED']}
        violations={[
          "Weight Class 'M2' is legally inadequate for Class II scale Sartorius Entris II 6200. OIML R 76-1 requires Class E2 or F1.",
          'Calibration certificate M2-CERT-2025-998 expired 35 days ago. Traceability is void.',
          'Standard weights expanded uncertainty U (0.05 g) exceeds 1/3 MPE limit (0.016667 g).',
        ]}
        onViewTraceabilityDetails={() => setIsLockoutModalOpen(true)}
      />

      {/* Executive KPI Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Sessions"
          value={activeTestCount}
          unit="sessions"
          subtitle="2 in testing • 1 in review • 1 locked"
          icon={<Activity className="h-4 w-4" />}
          change="Operational"
          status="info"
        />

        <MetricCard
          title="Issued Certificates"
          value="34"
          unit="this quarter"
          subtitle="OIML R 76-2 Type Approvals"
          icon={<Award className="h-4 w-4" />}
          change="98.2% pass"
          status="success"
        />

        <MetricCard
          title="Standards Gate"
          value="1"
          unit="set flagged (of 4)"
          subtitle="WORKSHOP-M2-SET calibration due"
          icon={<Weight className="h-4 w-4" />}
          change="Action required"
          status="danger"
        />

        <MetricCard
          title="Audit Ledger"
          value="1,489"
          unit="records"
          subtitle="Cryptographically sealed entries"
          icon={<ShieldCheck className="h-4 w-4" />}
          change="Verified 100%"
          status="info"
        />
      </div>

      {/* Primary Section: Active Verification Worklist */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 space-y-4">
        {/* Table Header & Segmented Filter Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Scale className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>Active Verification Worklist</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instruments currently undergoing evaluation and certification under OIML R 76-1.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search session, serial..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-blue-500 focus:border-blue-500 w-48 sm:w-56"
              />
            </div>

            {/* Quick Segmented Filter */}
            <div className="flex items-center rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100/80 dark:bg-slate-900/60 p-0.5 text-xs">
              <button
                onClick={() => setStatusFilter('ALL')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === 'ALL'
                    ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                All ({mockSessions.length})
              </button>
              <button
                onClick={() => setStatusFilter('LOCKED')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  statusFilter === 'LOCKED'
                    ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Locked (1)
              </button>
            </div>
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={sessionColumns}
          data={filteredSessions}
          keyExtractor={(item) => item.id}
        />
      </div>

      {/* Balanced Lower Grid: Standard Weights (60%) + Activity & Guidelines (40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (7 cols): Reference Standard Weights (Clause 3.7.1) */}
        <div className="lg:col-span-7 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Weight className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>Reference Standard Weights</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Traceable to CSIR-NPL India Primary Prototype (OIML R 111-1).
                </p>
              </div>
              <span className="rounded-md bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 text-xs font-mono font-medium text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                4 Registered Sets
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800/60 mt-1">
              {weightSets.map((ws) => (
                <div
                  key={ws.id}
                  onClick={() => setIsLockoutModalOpen(true)}
                  className="py-3 flex items-center justify-between gap-3 group cursor-pointer transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30 -mx-2 px-2 rounded-lg"
                >
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {ws.code}
                      </span>
                      <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        Class {ws.weightClass}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      Cert: <span className="font-mono text-slate-700 dark:text-slate-300">{ws.certNumber}</span> • {ws.calibratedBy}
                    </p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <div className="text-right">
                      <p
                        className={`text-xs font-mono font-medium ${
                          ws.expiryDays < 0
                            ? 'text-rose-600 dark:text-rose-400 font-semibold'
                            : ws.expiryDays < 30
                            ? 'text-amber-600 dark:text-amber-400 font-semibold'
                            : 'text-slate-600 dark:text-slate-400'
                        }`}
                      >
                        {ws.expiryDays < 0
                          ? `Expired ${Math.abs(ws.expiryDays)}d ago`
                          : `${ws.expiryDays}d validity`}
                      </p>
                    </div>

                    <ComplianceBadge status={ws.status} size="sm" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>All standards monitored under NABL ISO/IEC 17025 surveillance</span>
            <button
              onClick={() => setIsLockoutModalOpen(true)}
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium cursor-pointer inline-flex items-center gap-1"
            >
              <span>Audit Traceability</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Column (5 cols): Activity Stream & Regulatory Directives */}
        <div className="lg:col-span-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-5 flex flex-col justify-between space-y-4">
          <div>
            {/* Header with Switcher */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/80">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setLowerTab('ACTIVITY')}
                  className={`text-xs font-bold transition-colors cursor-pointer ${
                    lowerTab === 'ACTIVITY'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1 -mb-3'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Live Activity Log
                </button>
                <button
                  onClick={() => setLowerTab('GUIDELINES')}
                  className={`text-xs font-bold transition-colors cursor-pointer ml-3 ${
                    lowerTab === 'GUIDELINES'
                      ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 pb-1 -mb-3'
                      : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  Statutory Directives
                </button>
              </div>

              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Feed
              </span>
            </div>

            {/* Tab 1: Live Activity Stream */}
            {lowerTab === 'ACTIVITY' ? (
              <div className="space-y-3 mt-3">
                {recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-lg border border-slate-100 dark:border-slate-800/60 bg-slate-50/60 dark:bg-slate-900/40 text-xs space-y-1 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800 dark:text-slate-200">
                        {act.title}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed">
                      {act.detail}
                    </p>
                    <div className="flex items-center justify-between pt-1 text-[10px] text-slate-500 dark:text-slate-500 font-mono">
                      <span>{act.officer}</span>
                      <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold">
                        {act.badge}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Tab 2: Core Regulatory Requirements */
              <div className="space-y-3 mt-3 text-xs">
                <div className="border-l-2 border-emerald-500 pl-3 space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">1. Standard Uncertainty (Clause 3.7.1)</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Standard weight expanded uncertainty U must satisfy U &le; &frac13; MPE of the scale under test.
                  </p>
                </div>

                <div className="border-l-2 border-brand-500 pl-3 space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">2. Separation of Duties (Rule 16)</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    Testing officers cannot self-approve. Certificates require designated Lab Director signature.
                  </p>
                </div>

                <div className="border-l-2 border-indigo-500 pl-3 space-y-0.5">
                  <p className="font-semibold text-slate-900 dark:text-slate-100">3. Cryptographic Logging</p>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                    All observations are immutably signed and timestamped with SHA-256 hash chaining under Section 24.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <Button
              variant="outline"
              size="sm"
              className="w-full text-xs font-medium"
              leftIcon={<FileText className="w-3.5 h-3.5" />}
              onClick={() => setIsLockoutModalOpen(true)}
            >
              View Statutory Verification Standards
            </Button>
          </div>
        </div>
      </div>

      {/* Statutory Lockout Inspection Modal */}
      <Modal
        isOpen={isLockoutModalOpen}
        onClose={() => setIsLockoutModalOpen(false)}
        title="OIML R 111 Metrological Lockout Inspection"
        description="Statutory traceability audit for Standard Weight Set WORKSHOP-M2-SET"
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLockoutModalOpen(false)}
            >
              Dismiss
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={() => {
                alert('Statutory Warning: Lockout cannot be overridden without submitting an accredited calibration certificate with U <= (1/3)*MPE.');
              }}
            >
              Upload Calibration Certificate
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-4">
            <div className="flex items-center gap-2 text-rose-800 dark:text-rose-200 font-bold text-xs uppercase tracking-wide">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>Hard Lockout Triggered: Clause 3.7.1 Violation</span>
            </div>
            <p className="mt-1 text-xs text-rose-700 dark:text-rose-300">
              The assigned weight set is legally prohibited for use on Class II high accuracy instruments. The testing workspace is hard-locked to prevent invalid certification under Section 24 of the Legal Metrology Act, 2009.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Instrument Under Test</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                Sartorius Entris II 6200
              </span>
              <span className="text-brand-500 font-mono block mt-0.5">
                Class II (High Accuracy)
              </span>
            </div>

            <div className="rounded-lg bg-slate-50 dark:bg-slate-800/50 p-3 border border-slate-200 dark:border-slate-800">
              <span className="text-slate-400 block">Assigned Weight Set</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">
                WORKSHOP-M2-SET
              </span>
              <span className="text-rose-500 font-mono font-bold block mt-0.5">
                Class M2 (Non-Compliant)
              </span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950 p-3 font-mono text-xs text-slate-300 space-y-1">
            <div className="text-slate-500 uppercase tracking-wider text-[10px]">
              Mathematical Evaluation:
            </div>
            <div>Allowable U: (1/3) * MPE(0.1g) = 0.016667 g</div>
            <div>Declared Weight U: 0.050000 g</div>
            <div className="text-rose-400 font-bold">
              U / (1/3 MPE) = 300.0% &gt; 100% (VIOLATION)
            </div>
          </div>
        </div>
      </Modal>

      {/* New Scale Intake Modal */}
      <Modal
        isOpen={isNewIntakeModalOpen}
        onClose={() => setIsNewIntakeModalOpen(false)}
        title="Non-Automatic Weighing Instrument (NAWI) Intake"
        description="Capture instrument nameplate details and WELMEC 7.2 software parameters."
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsNewIntakeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert('Instrument registered successfully. Test Applicability Matrix generated.');
                setIsNewIntakeModalOpen(false);
              }}
            >
              Register & Generate TAM Battery
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                defaultValue="Avery Weigh-Tronix India"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Model Name / Number
              </label>
              <input
                type="text"
                defaultValue="ZM510-TradePlatform"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Accuracy Class
              </label>
              <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
                <option value="CLASS_III">Class III (Medium)</option>
                <option value="CLASS_I">Class I (Special)</option>
                <option value="CLASS_II">Class II (High)</option>
                <option value="CLASS_IIII">Class IIII (Ordinary)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Max Capacity (Max)
              </label>
              <input
                type="text"
                defaultValue="30.0"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Interval (e)
              </label>
              <input
                type="text"
                defaultValue="0.01"
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-brand-500 focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 font-mono"
              />
            </div>
          </div>

          <div className="rounded-xl border border-brand-200 bg-brand-50/50 p-3 dark:border-brand-900/60 dark:bg-brand-950/30">
            <span className="text-[11px] font-bold text-brand-700 dark:text-brand-300 uppercase block mb-1">
              Automated Test Plan (TAM Engine Preview):
            </span>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              n = Max / e = 3000 intervals. Table 6 brackets: Tier 1 (0 to 500e, MPE ±0.5e), Tier 2 (500e to 2000e, MPE ±1.0e), Tier 3 (2000e to 3000e, MPE ±1.5e).
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
