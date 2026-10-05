import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Lock,
  Calculator,
  Inbox,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  ArrowRight,
  RefreshCw,
  Plus,
  Scale,
  Activity,
  Maximize2,
  Radio,
} from 'lucide-react';
import {
  Button,
  Card,
  MetricCard,
  Modal,
  Drawer,
  ComplianceBadge,
  StatusPill,
  RoleBadge,
  TraceabilityBadge,
  ConnectionBadge,
  TechnicalValue,
  Field,
  LockoutBanner,
  CalculationProofModal,
  EmptyState,
  Skeleton,
  DataTable,
  Stepper,
} from '../ui';

interface DesignSystemShowcaseViewProps {
  onBackToDashboard?: () => void;
}

export const DesignSystemShowcaseView: React.FC<DesignSystemShowcaseViewProps> = ({
  onBackToDashboard,
}) => {
  const [proofOpen, setProofOpen] = useState(false);
  const [genericModalOpen, setGenericModalOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [inputValue, setInputValue] = useState('10.005');
  const [hasInputError, setHasInputError] = useState(false);
  const [isLoadingDemo, setIsLoadingDemo] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50/70 dark:bg-slate-950 font-sans pb-24 text-slate-800 dark:text-slate-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 backdrop-blur-md bg-white/90 dark:bg-slate-900/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-bold tracking-wider uppercase mb-1">
                <Layers className="w-4 h-4" />
                PHASE 1 — CENTRAL METROLOGIX-76 DESIGN SYSTEM
              </div>
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                Design System Component Showcase
              </h1>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Internal component validation harness verifying unified typography, compliance semantics, forms, buttons, cards, modals, and statutory gates.
              </p>
            </div>

            {onBackToDashboard && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onBackToDashboard}
              >
                Back to Dashboard
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Section 1: Standard Button System (§10, §11) */}
        <Card
          title="01. Button System & Hierarchy (§10, §11)"
          subtitle="Restrained 8px radius geometry, single primary CTA per view, and integrated loading spinners."
        >
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="primary" leftIcon={<Plus className="w-3.5 h-3.5" />}>
                Primary Action
              </Button>
              <Button variant="secondary">Secondary Action</Button>
              <Button variant="ghost">Ghost Action</Button>
              <Button variant="danger">Remand Session</Button>
              <Button variant="success">Approve &amp; Sign</Button>
              <Button variant="primary" isLoading>
                Saving...
              </Button>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
              <span className="text-xs text-slate-500 font-mono">Interactive Overlays:</span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setGenericModalOpen(true)}
              >
                Open Reusable Modal (§20)
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDrawerOpen(true)}
              >
                Open Contextual Drawer (§21)
              </Button>
            </div>
          </div>
        </Card>

        {/* Section: Statutory Stepper & Session Progress (§27, §28) */}
        <Card
          title="02. Core Product Stepper & Progress (§27, §28)"
          subtitle="Identity component indicating completed (✓), current (●), available (○), locked, and blocked (!) states."
        >
          <div className="space-y-4">
            <Stepper
              steps={[
                { number: '01', label: 'Intake', state: 'completed' },
                { number: '02', label: 'Physical', state: 'completed' },
                { number: '03', label: 'Weighing', state: 'current' },
                { number: '04', label: 'Eccentricity', state: 'available' },
                { number: '05', label: 'Repeatability', state: 'locked' },
                { number: '06', label: 'Environment', state: 'locked' },
                { number: '07', label: 'Review', state: 'locked' },
              ]}
            />
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-500 font-mono pt-3 border-t border-slate-100 dark:border-slate-800">
              <span><strong>Session Progress:</strong> 2 / 7 steps complete</span>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">Weighing Error &amp; Linearity (● Current)</span>
            </div>
          </div>
        </Card>

        {/* Section 3: Statutory Lockout Banner (§14, §26) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-500">
              03. Statutory Traceability Lockout (§14, §26)
            </h2>
          </div>
          <LockoutBanner
            title="TRACEABILITY LOCKED"
            message="Standard weight set F1-2024-018 expired on 18 Mar 2026. Testing cannot continue until a certified valid standard weight set is selected in the laboratory registry."
            actionLabel="View Standards Registry"
            onAction={() => alert('Routing to Standards Registry...')}
          />
        </div>

        {/* Section 3: Compliance & Status Architecture (§14, §15, §16) */}
        <Card
          title="03. Status Architecture & Compliance Badges (§14, §15, §16)"
          subtitle="Separate badges for Compliance Verdicts, Accuracy Classes, Roles, Traceability, and IoT Connection."
        >
          <div className="space-y-5">
            <div>
              <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                Statutory Compliance Verdicts:
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <ComplianceBadge status="PASS" size="lg" />
                <ComplianceBadge status="FAIL" size="lg" />
                <ComplianceBadge status="MARGINAL" size="lg" />
                <ComplianceBadge status="PENDING" size="lg" />
                <ComplianceBadge status="LOCKED_OUT" size="lg" />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                Traceability &amp; Connection Badges (§16):
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <TraceabilityBadge status="VALID" />
                <TraceabilityBadge status="EXPIRING" />
                <TraceabilityBadge status="EXPIRED" />
                <ConnectionBadge connected isStable />
                <ConnectionBadge connected isStable={false} />
                <ConnectionBadge connected={false} />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                  Metrological Role Badges:
                </div>
                <div className="flex flex-wrap gap-2">
                  <RoleBadge role="METROLOGIST" />
                  <RoleBadge role="REVIEWER" />
                  <RoleBadge role="DIRECTOR" />
                  <RoleBadge role="AUDITOR" />
                  <RoleBadge role="ADMIN" />
                </div>
              </div>

              <div>
                <div className="text-xs font-mono font-bold text-slate-400 uppercase mb-2">
                  Workflow Lifecycle Status Pills:
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill status="DRAFT" />
                  <StatusPill status="IN_TESTING" />
                  <StatusPill status="PENDING_REVIEW" />
                  <StatusPill status="APPROVED" />
                  <StatusPill status="REMANDED" />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 4: Operational Metric Cards (§18) */}
        <div>
          <div className="text-sm font-mono font-bold uppercase tracking-wider text-slate-500 mb-3">
            04. Operational Metric Cards (§18)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <MetricCard
              label="Active Verifications"
              value="12"
              unit="sessions"
              trend="↑ 3 from yesterday"
              trendType="positive"
              icon={Activity}
            />
            <MetricCard
              label="Pending Director Sign-off"
              value="3"
              unit="cases"
              trend="Awaiting digital PIN"
              trendType="neutral"
              icon={FileCheck2}
              badge="PRIORITY"
              badgeColor="bg-amber-100 text-amber-800"
            />
            <MetricCard
              label="Statutory Pass Rate"
              value="94.2"
              unit="%"
              trend="↑ 1.4% vs monthly avg"
              trendType="positive"
              icon={ShieldCheck}
            />
            <MetricCard
              label="Traceability Expiry"
              value="18"
              unit="days"
              trend="Standard set F1-2024"
              trendType="negative"
              icon={Clock}
            />
          </div>
        </div>

        {/* Section 5: Technical Values & Tabular Numbers (§29, §30) */}
        <Card
          title="05. Technical Values &amp; Numeric Precision (§29)"
          subtitle="Rendered with IBM Plex Mono, tabular numerals, with automatic positive signs and unit formatting."
          action={
            <Button
              variant="secondary"
              size="sm"
              leftIcon={<Calculator className="w-3.5 h-3.5" />}
              onClick={() => setProofOpen(true)}
            >
              Open Calculation Proof (§30)
            </Button>
          }
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Target Load (L)</div>
              <div className="mt-1">
                <TechnicalValue value="10.000" unit="kg" size="lg" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Observed (I)</div>
              <div className="mt-1">
                <TechnicalValue value="10.005" unit="kg" size="lg" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Error (E)</div>
              <div className="mt-1">
                <TechnicalValue value="-5.3" unit="g" sign size="lg" status="FAIL" />
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Table 6 Limit (MPE)</div>
              <div className="mt-1">
                <TechnicalValue value="±5.0" unit="g" size="lg" status="WARNING" />
              </div>
            </div>
          </div>
        </Card>

        {/* Section 6: Form Field Primitives (§12, §13, §25) */}
        <Card
          title="06. Form Field Primitives &amp; Error Recovery (§12, §13, §25)"
          subtitle="Input with unit suffix, help hint, focus rings, and actionable inline error recovery."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setHasInputError(!hasInputError)}
            >
              Toggle Error State
            </Button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <Field
              label="Standard Target Load"
              unit="kg"
              value="10.000"
              readOnly
              help="Derived from certified F1 standard set"
            />

            <Field
              label="Observed Scale Indication"
              unit="kg"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              error={hasInputError ? 'Reading deviates beyond zero-tracking boundary' : undefined}
              help="Continuous live reading from RS-232 COM3"
            />

            <Field
              label="Additional Weights Added (ΔL)"
              unit="g"
              defaultValue="2.5"
              success="Turning point threshold stabilized"
              help="Small weights added to reach next turning point"
            />
          </div>
        </Card>

        {/* Section 7: Actionable Empty States & Loading Skeletons (§23, §24) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card
            title="07. Actionable Empty State (§23)"
            subtitle="Explains What is missing, Why it matters, and Next action."
          >
            <EmptyState
              icon={Inbox}
              title="No active verification sessions"
              description="There are currently no instruments undergoing statutory inspection on this testing bench."
              actionLabel="+ Register Instrument"
              onAction={() => alert('Navigating to Intake Registration...')}
            />
          </Card>

          <Card
            title="08. Shimmer Loading Skeletons (§24)"
            subtitle="Prevents blank screen flashes during async data fetching."
            action={
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsLoadingDemo(!isLoadingDemo)}
              >
                Pulse Toggle
              </Button>
            }
          >
            <div className="space-y-3">
              <Skeleton variant="text" lines={3} />
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <Skeleton variant="table-row" />
                <Skeleton variant="table-row" />
              </div>
            </div>
          </Card>
        </div>

        {/* Section 8: Metrological DataTable (§19) */}
        <Card
          title="09. Metrological DataTable (§19)"
          subtitle="Sticky header, numeric alignment (loads, readings, errors, tolerances), and centered compliance badge."
        >
          <DataTable
            data={[
              { id: '1', step: '01', load: '0.100 kg', reading: '0.100 kg', error: '0.0 g', tolerance: '±2.5 g', status: 'PASS' },
              { id: '2', step: '02', load: '5.000 kg', reading: '5.002 kg', error: '+2.0 g', tolerance: '±5.0 g', status: 'PASS' },
              { id: '3', step: '03', load: '10.000 kg', reading: '10.007 kg', error: '+7.0 g', tolerance: '±5.0 g', status: 'FAIL' },
              { id: '4', step: '04', load: '20.000 kg', reading: '20.004 kg', error: '+4.0 g', tolerance: '±7.5 g', status: 'PASS' },
              { id: '5', step: '05', load: '30.000 kg', reading: '30.006 kg', error: '+6.0 g', tolerance: '±7.5 g', status: 'MARGINAL' },
            ]}
            keyExtractor={(row) => row.id}
            columns={[
              { key: 'step', header: 'Step', align: 'left', width: '60px' },
              { key: 'load', header: 'Target Load', align: 'right', isNumeric: true },
              { key: 'reading', header: 'Observed Reading', align: 'right', isNumeric: true },
              {
                key: 'error',
                header: 'Calculated Error (E)',
                align: 'right',
                isNumeric: true,
                render: (row) => (
                  <span className={row.status === 'FAIL' ? 'text-rose-600 font-bold' : row.status === 'MARGINAL' ? 'text-amber-600 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                    {row.error}
                  </span>
                ),
              },
              { key: 'tolerance', header: 'Tolerance (MPE)', align: 'right', isNumeric: true },
              {
                key: 'status',
                header: 'Status',
                align: 'center',
                width: '120px',
                render: (row) => <ComplianceBadge status={row.status as any} size="sm" />,
              },
            ]}
          />
        </Card>
      </div>

      {/* Reusable Generic Modal Demonstration (§20) */}
      <Modal
        isOpen={genericModalOpen}
        onClose={() => setGenericModalOpen(false)}
        title="Statutory Pre-Verification Confirmation"
        description="Verify laboratory ambient baseline conditions prior to test execution."
        footer={
          <>
            <Button variant="ghost" onClick={() => setGenericModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={() => {
                setGenericModalOpen(false);
                alert('Pre-verification baseline locked.');
              }}
            >
              Confirm &amp; Proceed
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
          <p>
            Reference standards certificate <strong>NPL-IND-2024-F1</strong> is valid until 18 Nov 2026. Ambient temperature is stabilized at <strong>23.4°C</strong> with relative humidity at <strong>48%</strong>.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 font-mono text-[11px] space-y-1">
            <div>Sensor ID: LM-ENV-2026-99</div>
            <div>Pressure: 1013 hPa</div>
            <div>Gravity Correction: 9.794 m/s²</div>
          </div>
        </div>
      </Modal>

      {/* Contextual Drawer Demonstration (§21) */}
      <Drawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Observation Row Audit Trace"
        subtitle="Step 03 · 10.000 kg Nominal Target Load"
        footer={
          <Button variant="secondary" size="sm" onClick={() => setDrawerOpen(false)}>
            Close Drawer
          </Button>
        }
      >
        <div className="space-y-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-1.5 font-mono text-[11px]">
            <div className="text-slate-400 uppercase text-[10px]">Statutory Formula</div>
            <div className="text-slate-900 dark:text-white font-bold">P = I + 0.5e - ΔL</div>
            <div className="text-slate-600 dark:text-slate-300">P = 10.005 + 0.0025 - 0.0025 = 10.005 kg</div>
            <div className="text-rose-600 font-bold">E = P - L = -5.3 g (Exceeds MPE ±5.0 g)</div>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 dark:text-white mb-1.5">Reviewer Audit Notes</h4>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
              Observation recorded via RS-232 COM3 automated scale capture. Scale stabilized for 1.4 seconds before turning point changeover weights were applied.
            </p>
          </div>
        </div>
      </Drawer>

      {/* Calculation Proof Progressive Disclosure Modal (§30) */}
      <CalculationProofModal
        isOpen={proofOpen}
        onClose={() => setProofOpen(false)}
        load="10.000 kg"
        reading="10.005 kg"
        turningPointP="10.005 kg"
        errorE="-5.3 g"
        toleranceMPE="±5.0 g"
        clauseReference="OIML R 76-1:2006 Clause A.4.4.3 & Clause 3.5.1"
      />
    </div>
  );
};
