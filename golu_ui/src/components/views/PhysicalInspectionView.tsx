import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  Check,
  ShieldCheck,
  RotateCcw,
  Camera,
  Layers,
  Lock,
} from 'lucide-react';
import { CameraInspectionCard } from '../inspection/CameraInspectionCard';
import { SpiritLevelHero } from '../inspection/SpiritLevelHero';
import { SecurityTamperCheck, SecurityCheckItem } from '../inspection/SecurityTamperCheck';
import { InspectionFindingsTable, FindingItem } from '../inspection/InspectionFindingsTable';
import { OverallInspectionCard } from '../inspection/OverallInspectionCard';
import { useToast } from '../layout/ToastViewport';

interface PhysicalInspectionViewProps {
  session: any;
  onBackToDashboard: () => void;
  onContinueToWeighing: (updatedSession: any) => void;
  onNavigatePrevious?: () => void;
  onUpdateSession?: (updatedSession: any) => void;
  userRole?: string;
  isTraceabilityLocked?: boolean;
}

export type InspectionScenario = 'PASS' | 'SEAL_FAIL' | 'LEVEL_FAIL' | 'ATTENTION';

export const PhysicalInspectionView: React.FC<PhysicalInspectionViewProps> = ({
  session,
  onBackToDashboard,
  onContinueToWeighing,
  onNavigatePrevious,
  onUpdateSession,
  userRole = 'Metrologist',
  isTraceabilityLocked = false,
}) => {
  const { showToast } = useToast();

  const roleLower = userRole.toLowerCase();
  const isReadOnly =
    roleLower.includes('review') ||
    roleLower.includes('director') ||
    roleLower.includes('audit');

  // Interactive Demo Scenario Switcher (§23 & §24)
  const [scenario, setScenario] = useState<InspectionScenario>('PASS');

  // Session & Instrument Identifiers (§3)
  const sessionNumber = session?.sessionNumber || session?.id || 'SES-2026-0046';
  const manufacturer = session?.manufacturer || 'Avery Weigh-Tronix';
  const model = session?.model || session?.instrument || 'ZM201 Retail Platform';
  const serialNumber = session?.serialNumber || 'AV-2026-8812';
  const accuracyClass = session?.accuracyClass || 'Class III';
  const maxCapacity = session?.maxCapacity || '30.000 kg';
  const verificationInterval = session?.verificationInterval || session?.interval || '0.005 kg';

  // 1. Spirit Level Tilt State (§9–12)
  const [tilt, setTilt] = useState<number>(scenario === 'LEVEL_FAIL' ? 0.73 : 0.18);

  // 2. Security & Tamper Checks State (§13–14)
  const [securityChecks, setSecurityChecks] = useState<SecurityCheckItem[]>([
    {
      id: 'check-lead-seal',
      name: 'Lead-wire tamper seal',
      description: 'Official wire-lead seal intact securing metrological adjustment switch.',
      status: 'INTACT',
      evidenceFile: 'wire_lead_seal_macro.jpg',
      evidenceDate: '04 Oct 2026 • 15:41 IST',
      evidenceUrl: 'https://images.unsplash.com/photo-1581092162384-8987c1d64718?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'check-holo-sticker',
      name: 'Holographic security sticker',
      description: 'Tamper-evident holographic void sticker intact across housing seam.',
      status: 'INTACT',
      evidenceFile: 'holographic_sticker_seam.jpg',
      evidenceDate: '04 Oct 2026 • 15:42 IST',
      evidenceUrl: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&auto=format&fit=crop&q=80',
    },
    {
      id: 'check-cal-jumper',
      name: 'Calibration jumper',
      description: 'Internal hardware calibration write-protect circuit locked.',
      status: 'INTACT',
      evidenceFile: 'calibration_jumper_audit.jpg',
      evidenceDate: '04 Oct 2026 • 15:43 IST',
      evidenceUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&auto=format&fit=crop&q=80',
    },
  ]);

  // 3. Inspection Findings Table State (§15–18)
  const [findings, setFindings] = useState<FindingItem[]>([
    {
      id: 'FND-01',
      checkName: 'Physical condition',
      category: 'Physical condition',
      result: 'PASS',
      evidenceType: '2 photos',
      evidenceCount: 2,
      notes: 'No cracks or deformation visible on platter or enclosure.',
      detailedObservation: 'Enclosure inspected under magnification. Platter is level and stable with no mechanical interference.',
      inspector: 'Rahul Kumar (Metrologist)',
      timestamp: '04 Oct 2026 · 15:08 IST',
    },
    {
      id: 'FND-02',
      checkName: 'Display / markings',
      category: 'Identification Plate',
      result: 'PASS',
      evidenceType: '1 photo',
      evidenceCount: 1,
      notes: 'Legible ratings: Max 30 kg, e=0.005 kg, TAC-2026-III-0142.',
      detailedObservation: 'Dual backlit LCD display clear. All statutory markings permanently affixed and legible.',
      inspector: 'Rahul Kumar (Metrologist)',
      timestamp: '04 Oct 2026 · 15:10 IST',
    },
    {
      id: 'FND-03',
      checkName: 'Level indicator bubble',
      category: 'Spirit level alignment',
      result: 'PASS',
      evidenceType: 'Bubble gauge',
      evidenceCount: 1,
      notes: '0.18° tilt within statutory acceptance threshold (≤ 0.50°).',
      detailedObservation: 'Spirit bubble concentric with inner circular marker. Deflection verified < 0.2 mm.',
      inspector: 'Rahul Kumar (Metrologist)',
      timestamp: '04 Oct 2026 · 15:12 IST',
    },
    {
      id: 'FND-04',
      checkName: 'Lead wire seal',
      category: 'Security Seal',
      result: 'PASS',
      evidenceType: '1 photo',
      evidenceCount: 1,
      notes: 'Seal #IN-DL-2026-0814 intact with unbroken wire loop.',
      detailedObservation: 'Embossed laboratory logo verified on lead disc. No sign of mechanical crimping or wire slicing.',
      inspector: 'Rahul Kumar (Metrologist)',
      timestamp: '04 Oct 2026 · 15:14 IST',
    },
    {
      id: 'FND-05',
      checkName: 'Holographic sticker',
      category: 'Security Seal',
      result: 'PASS',
      evidenceType: '1 photo',
      evidenceCount: 1,
      notes: 'Present across chassis split line without VOID pattern show.',
      detailedObservation: 'Hologram intact. Under illumination, holographic crest reveals valid national seal.',
      inspector: 'Rahul Kumar (Metrologist)',
      timestamp: '04 Oct 2026 · 15:15 IST',
    },
    {
      id: 'FND-06',
      checkName: 'Calibration jumper',
      category: 'Security Seal',
      result: 'PASS',
      evidenceType: '1 photo',
      evidenceCount: 1,
      notes: 'Hardware write-protect link verified in locked position.',
      detailedObservation: 'Calibration switch physically blocked by internal housing gate.',
      inspector: 'Rahul Kumar (Metrologist)',
      timestamp: '04 Oct 2026 · 15:16 IST',
    },
  ]);

  const [evidenceCount, setEvidenceCount] = useState<number>(6);

  // Synchronize Demo Scenario with State (§23 & §24)
  const handleSelectScenario = (scen: InspectionScenario) => {
    setScenario(scen);
    if (scen === 'SEAL_FAIL') {
      setSecurityChecks((prev) =>
        prev.map((c) =>
          c.id === 'check-lead-seal'
            ? { ...c, status: 'DAMAGED' }
            : { ...c, status: 'INTACT' }
        )
      );
      setTilt(0.18);
      setFindings((prev) =>
        prev.map((f) =>
          f.checkName === 'Lead wire seal'
            ? {
                ...f,
                result: 'FAIL',
                notes: 'Lead wire severed at housing anchor point.',
                detailedObservation: 'Wire shows clean cut. Metrological protection compromised.',
              }
            : { ...f, result: 'PASS' }
        )
      );
    } else if (scen === 'LEVEL_FAIL') {
      setTilt(0.73);
      setSecurityChecks((prev) => prev.map((c) => ({ ...c, status: 'INTACT' })));
      setFindings((prev) =>
        prev.map((f) =>
          f.checkName === 'Level indicator bubble'
            ? {
                ...f,
                result: 'FAIL',
                notes: '0.73° tilt exceeds permissible threshold of ≤ 0.50°.',
                detailedObservation: 'Spirit bubble touching outer glass boundary. Scale is visibly tilted.',
              }
            : { ...f, result: 'PASS' }
        )
      );
    } else if (scen === 'ATTENTION') {
      setTilt(0.42);
      setSecurityChecks((prev) => prev.map((c) => ({ ...c, status: 'INTACT' })));
      setFindings((prev) =>
        prev.map((f) =>
          f.checkName === 'Level indicator bubble'
            ? {
                ...f,
                result: 'WARNING',
                notes: '0.42° near allowable statutory limit of 0.50°.',
                detailedObservation: 'Off-center but within legal range. Re-leveling recommended.',
              }
            : { ...f, result: 'PASS' }
        )
      );
    } else {
      // Canonical PASS
      setTilt(0.18);
      setSecurityChecks((prev) => prev.map((c) => ({ ...c, status: 'INTACT' })));
      setFindings((prev) => prev.map((f) => ({ ...f, result: 'PASS' })));
    }

    if (scen === 'SEAL_FAIL' || scen === 'LEVEL_FAIL') {
      onUpdateSession?.({
        ...session,
        complianceStatus: 'FAIL',
        status: 'FAIL',
        notes: scen === 'SEAL_FAIL' ? 'Lead wire seal severed at housing anchor point.' : '0.73° tilt exceeds permissible threshold of ≤ 0.50°.',
        physicalInspection: {
          tilt: scen === 'LEVEL_FAIL' ? 0.73 : 0.18,
          status: 'FAIL',
        },
      });
    } else if (scen === 'PASS') {
      onUpdateSession?.({
        ...session,
        physicalInspection: {
          tilt: 0.18,
          status: 'PASS',
        },
      });
    }
  };

  // Overall compliance calculations
  const hasDamagedSeal = securityChecks.some((c) => c.status === 'DAMAGED');
  const isTiltOverLimit = tilt > 0.50;
  const isTiltNearLimit = tilt > 0.35 && tilt <= 0.50;
  const hasFailFinding = findings.some((f) => f.result === 'FAIL');
  const hasWarnFinding = findings.some((f) => f.result === 'WARNING');

  const overallStatus: 'PASS' | 'WARNING' | 'FAIL' =
    hasDamagedSeal || isTiltOverLimit || hasFailFinding
      ? 'FAIL'
      : isTiltNearLimit || hasWarnFinding
      ? 'WARNING'
      : 'PASS';

  const isCanContinue = overallStatus === 'PASS' && !isReadOnly && !isTraceabilityLocked;

  // Handlers
  const handleToggleSecurityStatus = (
    id: string,
    newStatus: 'INTACT' | 'DAMAGED' | 'NOT_INSPECTED'
  ) => {
    setSecurityChecks((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
  };

  const handleAddFinding = (newFinding: Partial<FindingItem>) => {
    const created: FindingItem = {
      id: `FND-${Date.now()}`,
      checkName: newFinding.checkName || 'Custom Finding',
      category: newFinding.category || 'Physical condition',
      result: newFinding.result || 'PASS',
      evidenceType: '1 photo',
      evidenceCount: 1,
      notes: newFinding.notes || '',
      detailedObservation: newFinding.detailedObservation || newFinding.notes,
      inspector: 'Metrologist',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST',
    };
    setFindings((prev) => [created, ...prev]);
    setEvidenceCount((prev) => prev + 1);
    showToast(
      'Inspection Finding Recorded',
      `Observation for ${created.checkName} logged in cryptographic dossier.`,
      'info'
    );
  };

  const handleSaveInspection = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    showToast(
      'Inspection Saved',
      `Physical inspection saved at ${timeStr}. Status: ${overallStatus}.`,
      'success'
    );
  };

  const handleContinue = () => {
    if (!isCanContinue) return;

    showToast(
      'Inspection Verified',
      'Physical inspection complete ✓. Opening Weighing Error & Linearity workspace.',
      'success'
    );

    onContinueToWeighing({
      ...session,
      procedure: 'Weighing Error',
      progressText: '2 / 7',
      physicalInspection: {
        tilt,
        securityChecks,
        findings,
        status: overallStatus,
        completedAt: new Date().toISOString(),
      },
    });
  };

  // 7-step stepper data (§3)
  const steps = [
    { num: '01', label: 'Preflight', status: 'DONE' },
    { num: '02', label: 'Inspection', status: 'ACTIVE' },
    { num: '03', label: 'Weighing', status: 'UPCOMING' },
    { num: '04', label: 'Eccentricity', status: 'UPCOMING' },
    { num: '05', label: 'Repeatability', status: 'UPCOMING' },
    { num: '06', label: 'Environmental', status: 'UPCOMING' },
    { num: '07', label: 'Review', status: 'UPCOMING' },
  ];

  return (
    <div className="space-y-6 pb-28 animate-in fade-in duration-200">
      {/* 1. Persistent Verification Header & Stepper (§3) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Session #{sessionNumber}</span>
              </button>
              <span className="text-slate-400">/</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Stage 02: Physical Inspection
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Physical &amp; Visual Inspection
              </h1>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-blue-50 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                ● STAGE 02 IN PROGRESS
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verify the instrument&apos;s physical condition, leveling and security controls.
            </p>
          </div>

          {/* Interactive Demo Scenario Switcher (§23 & §24) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden md:inline">
              Demo Scenario:
            </span>
            <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              <button
                type="button"
                onClick={() => handleSelectScenario('PASS')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  scenario === 'PASS'
                    ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                ✓ Pass (Normal)
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('SEAL_FAIL')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  scenario === 'SEAL_FAIL'
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                ✕ Seal Failure
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('LEVEL_FAIL')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  scenario === 'LEVEL_FAIL'
                    ? 'bg-white dark:bg-slate-700 text-red-600 dark:text-red-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                ✕ Tilt Defect
              </button>
              <button
                type="button"
                onClick={() => handleSelectScenario('ATTENTION')}
                className={`px-3 py-1 rounded-xl transition-all cursor-pointer ${
                  scenario === 'ATTENTION'
                    ? 'bg-white dark:bg-slate-700 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                ⚠ Attention
              </button>
            </div>
          </div>
        </div>

        {/* Persistent Instrument Parameter Strip (§3) */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white font-sans">
              {manufacturer} {model}
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{serialNumber}</span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
              {accuracyClass}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              Max {maxCapacity}
            </span>
            <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
              e = {verificationInterval}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Traceability Valid</span>
            </span>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Preflight Complete</span>
            </span>
          </div>
        </div>

        {/* 7-Step Horizontal Stepper (§3) */}
        <div className="flex items-center justify-between overflow-x-auto pt-2 text-xs font-mono">
          {steps.map((s, idx) => {
            const isDone = s.status === 'DONE';
            const isActive = s.status === 'ACTIVE';

            return (
              <React.Fragment key={s.num}>
                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[11px] ${
                      isDone
                        ? 'bg-emerald-600 text-white'
                        : isActive
                        ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100 dark:ring-blue-950 animate-pulse'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {isDone ? '✓' : s.num}
                  </span>
                  <span
                    className={`font-bold font-sans ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : isDone
                        ? 'text-slate-800 dark:text-slate-200'
                        : 'text-slate-400'
                    }`}
                  >
                    {s.label}
                  </span>
                </div>
                {idx < steps.length - 1 && (
                  <span className="text-slate-300 dark:text-slate-700 px-3 select-none">───</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* 2. Main Two-Column Workstation Layout (§2, §5–14) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (65% / 7 cols): Live Camera / Photo Inspector (§5–8) */}
        <div className="lg:col-span-7">
          <CameraInspectionCard
            onCaptureEvidence={(cat, file) => {
              setEvidenceCount((prev) => prev + 1);
            }}
            evidenceCount={evidenceCount}
            isReadOnly={isReadOnly}
          />
        </div>

        {/* Right Column (35% / 5 cols): Spirit Level (§9–12) + Security & Seal (§13–14) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Spirit Level Hero (§9–12) */}
          <SpiritLevelHero
            tilt={tilt}
            onTiltChange={(newTilt) => setTilt(newTilt)}
            onRecordFinding={(failedTilt) => {
              handleAddFinding({
                checkName: 'Spirit level alignment',
                category: 'Spirit level alignment',
                result: 'FAIL',
                notes: `Tilt angle ${failedTilt.toFixed(2)}° exceeds statutory limit of ≤ 0.50°.`,
                detailedObservation: 'Defect recorded during optical spirit-level inspection. Instrument requires re-leveling.',
              });
            }}
            isReadOnly={isReadOnly}
          />

          {/* Security & Tamper Check (§13–14) */}
          <SecurityTamperCheck
            checks={securityChecks}
            onToggleCheckStatus={handleToggleSecurityStatus}
            onOpenAddFinding={() => {
              handleAddFinding({
                checkName: 'Custom Seal Observation',
                category: 'Security Seal',
                result: 'WARNING',
                notes: 'Additional security marker inspected.',
              });
            }}
            isReadOnly={isReadOnly}
          />
        </div>
      </div>

      {/* 3. Inspection Findings Table & Add Finding (§15–18) */}
      <InspectionFindingsTable
        findings={findings}
        onAddFinding={handleAddFinding}
        isReadOnly={isReadOnly}
      />

      {/* 4. Overall Inspection Status Card (§19–21) */}
      <OverallInspectionCard
        status={overallStatus}
        passedCount={findings.filter((f) => f.result === 'PASS').length}
        totalCount={findings.length}
        evidenceCount={evidenceCount}
        failureReason={
          hasDamagedSeal
            ? 'Lead wire tamper seal damaged or sliced.'
            : isTiltOverLimit
            ? `Instrument tilt (${tilt.toFixed(2)}°) exceeds the statutory threshold of ≤ 0.50°.`
            : 'Physical defect detected.'
        }
        onReviewFinding={() => {
          showToast(
            'Inspection Review',
            'Reviewing flagged observations in findings table.',
            'info'
          );
        }}
      />

      {/* 5. Sticky Bottom Action Bar (§22) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 py-4 px-6 sm:px-8 z-30 shadow-2xl">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto">
            <span className="font-bold text-slate-700 dark:text-slate-300">
              Inspection Status:
            </span>
            <span
              className={`font-mono font-black ${
                overallStatus === 'PASS'
                  ? 'text-emerald-600 dark:text-emerald-400'
                  : overallStatus === 'FAIL'
                  ? 'text-red-600 dark:text-red-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}
            >
              {overallStatus === 'PASS'
                ? '✓ Inspection complete'
                : overallStatus === 'FAIL'
                ? '✕ Inspection failed'
                : '⚠ Resolve inspection finding'}
            </span>
            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">•</span>
            <span className="font-mono text-slate-500 text-[11px] hidden sm:inline">
              {evidenceCount} evidence photos captured
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onNavigatePrevious && (
              <button
                type="button"
                onClick={onNavigatePrevious}
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous: Test Plan</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-bold transition-colors cursor-pointer"
            >
              Back
            </button>

            <button
              type="button"
              onClick={handleSaveInspection}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 text-xs font-bold transition-colors cursor-pointer"
            >
              Save Inspection
            </button>

            {/* Primary Action Button (§22) */}
            <button
              type="button"
              disabled={!isCanContinue}
              onClick={handleContinue}
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-xs shadow-md transition-all cursor-pointer ${
                isCanContinue
                  ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/25 hover:scale-[1.02]'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-300 dark:border-slate-700'
              }`}
            >
              <span>{isCanContinue ? 'Continue to Weighing →' : 'Continue Disabled (Fail)'}</span>
              {isCanContinue && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
