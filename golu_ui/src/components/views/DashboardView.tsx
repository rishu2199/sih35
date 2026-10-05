import React, { useState } from 'react';
import { PageHeader } from '../dashboard/PageHeader';
import { OperationalMetricRow } from '../dashboard/OperationalMetricRow';
import { RecentSessionsTable } from '../dashboard/RecentSessionsTable';
import { ComplianceOverviewPanel } from '../dashboard/ComplianceOverviewPanel';
import { QuickStartPanel } from '../dashboard/QuickStartPanel';
import { EmptyDashboardState } from '../dashboard/EmptyDashboardState';
import { useToast } from '../layout/ToastViewport';
import {
  MetricData,
  VerificationSession,
  AttentionItem,
  InstrumentPreset,
  ComplianceData,
} from '../../types';
import { AlertTriangle, Lock, FileCheck2, ArrowRight, ShieldCheck, Eye } from 'lucide-react';

interface DashboardViewProps {
  metrics: MetricData;
  sessions: VerificationSession[];
  attentionItems: AttentionItem[];
  compliance: ComplianceData;
  presets?: any[];
  isEmptyState: boolean;
  onNewVerification: () => void;
  onContinueTesting: (sessionId: string) => void;
  onSelectSession: (session: VerificationSession) => void;
  onSelectAttentionItem: (item: AttentionItem) => void;
  onSelectPreset: (preset: any) => void;
  onOpenDemoCenter: () => void;
  onViewAllSessions: () => void;
  onFilterClick?: (filter: string) => void;
  userRole?: string;
  standardsStatus?: 'VALID' | 'EXPIRING' | 'EXPIRED';
  isTraceabilityLocked?: boolean;
  isLoading?: boolean;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  metrics,
  sessions,
  attentionItems,
  compliance,
  presets,
  isEmptyState,
  onNewVerification,
  onContinueTesting,
  onSelectSession,
  onSelectAttentionItem,
  onSelectPreset,
  onOpenDemoCenter,
  onViewAllSessions,
  onFilterClick,
  userRole = 'Metrologist',
  standardsStatus = 'VALID',
  isTraceabilityLocked = false,
  isLoading = false,
}) => {
  const { showToast } = useToast();
  const [activeFilterSegment, setActiveFilterSegment] = useState<'PASS' | 'FAIL' | 'WARNING' | null>(null);

  // Filter sessions if a donut segment was clicked (Section 8)
  const filteredSessions = activeFilterSegment
    ? sessions.filter((s) => s.status === activeFilterSegment)
    : sessions;

  const handleLaunchPresetWithToast = (preset: any) => {
    showToast(
      'Demo instrument loaded',
      `${preset.name || preset.model} (${preset.classLabel || preset.accuracyClass}) is initialized and ready for preflight.`,
      'success'
    );
    onSelectPreset(preset);
  };

  // Section 13: Loading skeleton state (no giant spinner)
  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse pb-12">
        <PageHeader onNewSession={onNewVerification} />

        {/* 4 KPI Skeletons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 p-5 flex flex-col justify-between">
              <div className="h-3 w-28 bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-8 w-20 bg-slate-200 dark:bg-slate-700 rounded-md" />
              <div className="h-3 w-36 bg-slate-200 dark:bg-slate-700 rounded-md" />
            </div>
          ))}
        </div>

        {/* Grid Skeletons */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div className="h-5 w-48 bg-slate-200 dark:bg-slate-700 rounded-md" />
            <div className="space-y-3 pt-4">
              {[1, 2, 3, 4, 5].map((r) => (
                <div key={r} className="h-10 w-full bg-slate-200/70 dark:bg-slate-700/60 rounded-xl" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-4 h-96 rounded-3xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center space-y-4">
            <div className="w-32 h-32 rounded-full border-8 border-slate-200 dark:border-slate-700" />
            <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded-md" />
          </div>
        </div>
      </div>
    );
  }

  if (isEmptyState || sessions.length === 0) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200">
        <PageHeader onNewSession={onNewVerification} />
        <EmptyDashboardState
          onRegisterInstrument={onNewVerification}
          onLoadPreset={handleLaunchPresetWithToast}
          presets={presets}
          onOpenDemoCenter={onOpenDemoCenter}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-200 pb-12">
      {/* 1. Page Header (Section 3) */}
      <PageHeader onNewSession={onNewVerification} />

      {/* 2. Traceability Attention / Locked State Banner (Section 14) */}
      {isTraceabilityLocked ? (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-900 text-rose-600 flex items-center justify-center shrink-0">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-rose-900 dark:text-rose-200">
                🔒 TESTING LOCKED: Traceability Expired
              </div>
              <div className="text-rose-700 dark:text-rose-300">
                An expired standard weight set is currently assigned to active verification work. Testing input has been disabled.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFilterClick?.('traceability')}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shrink-0 transition-colors cursor-pointer"
          >
            Resolve Traceability →
          </button>
        </div>
      ) : standardsStatus === 'EXPIRING' ? (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-600 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-amber-900 dark:text-amber-200">
                ⚠ Traceability Attention Required
              </div>
              <div className="text-amber-700 dark:text-amber-300">
                Standard Weight Set E2-014 expires today. Recalibration required to maintain testing authorization.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onFilterClick?.('traceability')}
            className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold shrink-0 transition-colors cursor-pointer"
          >
            Review Standards →
          </button>
        </div>
      ) : null}

      {/* 3. Role-Specific Banner Adaptation (Section 15) */}
      {userRole.toLowerCase().includes('director') ? (
        <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <span className="font-bold text-indigo-950 dark:text-indigo-200">
              Director Dashboard Mode:
            </span>
            <span className="text-indigo-800 dark:text-indigo-300">
              3 completed verification dossiers awaiting statutory PIN sign-off.
            </span>
          </div>
          <button
            onClick={() => onFilterClick?.('review')}
            className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Open Sign-Off Queue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : userRole.toLowerCase().includes('review') ? (
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800 flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <FileCheck2 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="font-bold text-amber-950 dark:text-amber-200">
              Technical Reviewer Mode:
            </span>
            <span className="text-amber-800 dark:text-amber-300">
              3 test dossiers submitted for peer review and mathematical tolerance validation.
            </span>
          </div>
          <button
            onClick={() => onFilterClick?.('review')}
            className="font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            Review Queue <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : userRole.toLowerCase().includes('audit') ? (
        <div className="p-3.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
          <Eye className="w-4 h-4 text-slate-500" />
          <span>
            <strong>Auditor Mode (Read-Only):</strong> Viewing live laboratory verification activity. Inspection records are cryptographically verified against SHA-256 block ledger.
          </span>
        </div>
      ) : null}

      {/* 4. Top 4 KPI Cards Row (Section 4) */}
      <OperationalMetricRow
        metrics={metrics}
        standardsStatus={standardsStatus}
        isTraceabilityLocked={isTraceabilityLocked}
        onFilterClick={(filter) => {
          if (filter === 'active') onViewAllSessions();
          else if (filter === 'review') onFilterClick?.('review');
          else if (filter === 'traceability') onFilterClick?.('traceability');
          else if (filter === 'pass') {
            setActiveFilterSegment(activeFilterSegment === 'PASS' ? null : 'PASS');
          }
        }}
      />

      {/* 5. Main Middle Grid: Recent Sessions Table (65%) + Compliance Overview Donut (35%) (Section 2, 5, 8) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Recent Verification Sessions Table */}
        <div className="lg:col-span-8 flex flex-col">
          <RecentSessionsTable
            sessions={filteredSessions}
            onSelectSession={onSelectSession}
            onViewAllSessions={onViewAllSessions}
          />
        </div>

        {/* Right Column: Compliance Overview Donut */}
        <div className="lg:col-span-4 flex flex-col">
          <ComplianceOverviewPanel
            data={compliance}
            onFilterSegment={(seg) => {
              setActiveFilterSegment(activeFilterSegment === seg ? null : seg);
            }}
          />
        </div>
      </div>

      {/* 6. Quick Start Synthetic Scenarios (Section 9, 10, 11) */}
      <QuickStartPanel
        presets={presets}
        onSelectPreset={handleLaunchPresetWithToast}
        onOpenDemoCenter={onOpenDemoCenter}
      />
    </div>
  );
};
