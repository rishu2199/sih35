import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  Columns,
  Cpu,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Info,
  Check,
  RefreshCw,
  Lock,
  Unlock,
  Sliders,
  FileCheck,
  ShieldAlert,
  Zap,
} from 'lucide-react';
import { ErrorCorridorChart, WeighingPoint } from '../weighing/ErrorCorridorChart';
import { CurrentObservationCard } from '../weighing/CurrentObservationCard';
import { ObservationTable } from '../weighing/ObservationTable';
import { CalculationTraceDrawer } from '../weighing/CalculationTraceDrawer';
import { RoundingTrapModal } from '../weighing/RoundingTrapModal';
import { AuditCommentModal, AuditComment } from '../weighing/AuditCommentModal';
import { ManualEntryModal } from '../weighing/ManualEntryModal';
import { useIoT } from '../../contexts/IoTContext';
import { can } from '../../lib/session/permissions';

interface WeighingLinearityViewProps {
  session: any;
  onBackToDashboard: () => void;
  onContinueToEccentricity: (updatedSession: any) => void;
  onNavigatePrevious?: () => void;
  onUpdateSession?: (updatedSession: any) => void;
  userRole?: string;
}

export const WeighingLinearityView: React.FC<WeighingLinearityViewProps> = ({
  session,
  onBackToDashboard,
  onContinueToEccentricity,
  onNavigatePrevious,
  onUpdateSession,
  userRole = 'Metrologist',
}) => {
  const { currentWeight, isStable: iotScaleStable, captureCurrentReading, scaleConnected } = useIoT();
  const isApproved = session?.reviewStatus === 'APPROVED' || session?.status === 'APPROVED';
  const canEnterObservation = can(userRole, 'ENTER_OBSERVATION', session) && !isApproved;

  // Session Identity per spec §3
  const sessionNumber = session?.sessionNumber || session?.id || 'VR-2026-00418';
  const manufacturer = session?.manufacturer || 'Avery Weigh-Tronix';
  const model = session?.model || session?.instrument || 'ZM201 Retail Platform';
  const serialNumber = session?.serialNumber || 'AV-2026-8812';
  const accuracyClass = session?.accuracyClass || 'Class III';
  const maxCapacity = session?.maxCapacity || '30 kg';
  const verificationInterval = session?.verificationInterval || session?.interval || 'e = 0.005 kg';
  const verificationIntervalKg = 0.005; // 5g

  // 1. Verification Stage Switcher (Spec §5)
  // Initial Type Approval (1x MPE) vs Subsequent Verification (2x MPE)
  const [verificationStage, setVerificationStage] = useState<'initial' | 'subsequent'>('initial');
  const stageMultiplier = verificationStage === 'initial' ? 1.0 : 2.0;

  // 2. View Switcher (Spec §7): Split View | Grid Only | Chart Only
  const [activeView, setActiveView] = useState<'split' | 'grid' | 'chart'>('split');

  // 3. Live Scale Status Chip (Spec §6)
  const [isScaleStable, setIsScaleStable] = useState<boolean>(true);
  const [liveWeight, setLiveWeight] = useState<string>('15.006 kg');

  // 4. Traceability Lockout state (Spec §31)
  const [isTraceabilityLocked, setIsTraceabilityLocked] = useState<boolean>(false);

  // 5. Rounding Trap Active Alert state (Spec §19)
  const [isRoundingTrapActive, setIsRoundingTrapActive] = useState<boolean>(false);

  // 6. Toast Notification for reading capture (Spec §11)
  const [toast, setToast] = useState<{ show: boolean; title: string; subtitle: string } | null>(null);

  const showToast = (title: string, subtitle: string) => {
    setToast({ show: true, title, subtitle });
    setTimeout(() => setToast(null), 3500);
  };

  // Statutory OIML R 76-1 Table 6 MPE for Class III scale (e = 5 g):
  // 0 - 2.5 kg: 2.5 g (0.5e)
  // 2.5 - 10 kg: 5.0 g (1.0e)
  // 10 - 30 kg: 7.5 g (1.5e)
  const getMpeForLoad = (loadKg: number) => {
    if (loadKg <= 2.5) return 2.5;
    if (loadKg <= 10.0) return 5.0;
    return 7.5;
  };

  // 7. Initial Observation Points Data (Ascending & Descending Series, Spec §8, §9, §16)
  const initialAscendingPoints: WeighingPoint[] = [
    {
      id: 'asc-1',
      series: 'ascending',
      stepIndex: 1,
      targetLoad: 0.0,
      observedReading: 0.000,
      errorGrams: 0.0,
      mpeGrams: 2.5,
      status: 'PASS',
      turningPointP: 0.000,
      deltaL: 0.0025,
    },
    {
      id: 'asc-2',
      series: 'ascending',
      stepIndex: 2,
      targetLoad: 5.0,
      observedReading: 5.002,
      errorGrams: 2.0,
      mpeGrams: 5.0,
      status: 'PASS',
      turningPointP: 5.002,
      deltaL: 0.0025,
    },
    {
      id: 'asc-3',
      series: 'ascending',
      stepIndex: 3,
      targetLoad: 10.0,
      observedReading: 10.004,
      errorGrams: 4.0,
      mpeGrams: 5.0,
      status: 'PASS',
      turningPointP: 10.004,
      deltaL: 0.0025,
    },
    {
      id: 'asc-4',
      series: 'ascending',
      stepIndex: 4,
      targetLoad: 15.0,
      observedReading: 15.006,
      errorGrams: 6.0,
      mpeGrams: 7.5,
      status: 'MARGINAL',
      turningPointP: 15.006,
      deltaL: 0.0025,
    },
    {
      id: 'asc-5',
      series: 'ascending',
      stepIndex: 5,
      targetLoad: 20.0,
      mpeGrams: 7.5,
      status: 'PENDING',
    },
    {
      id: 'asc-6',
      series: 'ascending',
      stepIndex: 6,
      targetLoad: 25.0,
      mpeGrams: 7.5,
      status: 'PENDING',
    },
    {
      id: 'asc-7',
      series: 'ascending',
      stepIndex: 7,
      targetLoad: 30.0,
      mpeGrams: 7.5,
      status: 'PENDING',
    },
  ];

  const initialDescendingPoints: WeighingPoint[] = [
    {
      id: 'dsc-1',
      series: 'descending',
      stepIndex: 1,
      targetLoad: 30.0,
      mpeGrams: 7.5,
      status: 'PENDING',
    },
    {
      id: 'dsc-2',
      series: 'descending',
      stepIndex: 2,
      targetLoad: 25.0,
      mpeGrams: 7.5,
      status: 'PENDING',
    },
    {
      id: 'dsc-3',
      series: 'descending',
      stepIndex: 3,
      targetLoad: 20.0,
      mpeGrams: 7.5,
      status: 'PENDING',
    },
    {
      id: 'dsc-4',
      series: 'descending',
      stepIndex: 4,
      targetLoad: 15.0,
      mpeGrams: 7.5,
      status: 'PENDING',
    },
    {
      id: 'dsc-5',
      series: 'descending',
      stepIndex: 5,
      targetLoad: 10.0,
      mpeGrams: 5.0,
      status: 'PENDING',
    },
    {
      id: 'dsc-6',
      series: 'descending',
      stepIndex: 6,
      targetLoad: 5.0,
      mpeGrams: 5.0,
      status: 'PENDING',
    },
    {
      id: 'dsc-7',
      series: 'descending',
      stepIndex: 7,
      targetLoad: 0.0,
      mpeGrams: 2.5,
      status: 'PENDING',
    },
  ];

  const [ascendingPoints, setAscendingPoints] = useState<WeighingPoint[]>(initialAscendingPoints);
  const [descendingPoints, setDescendingPoints] = useState<WeighingPoint[]>(initialDescendingPoints);
  const [isDescendingCollapsed, setIsDescendingCollapsed] = useState<boolean>(false);

  // Selected Point for Current Observation Card & Trace
  const [selectedPointId, setSelectedPointId] = useState<string>('asc-4');

  // Modals & Drawers
  const [tracePoint, setTracePoint] = useState<WeighingPoint | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(false);
  const [isRoundingTrapOpen, setIsRoundingTrapOpen] = useState<boolean>(false);
  const [manualEntryPoint, setManualEntryPoint] = useState<WeighingPoint | null>(null);
  const [isManualEntryOpen, setIsManualEntryOpen] = useState<boolean>(false);
  const [commentPoint, setCommentPoint] = useState<WeighingPoint | null>(null);
  const [isCommentModalOpen, setIsCommentModalOpen] = useState<boolean>(false);
  const [auditComments, setAuditComments] = useState<Record<string, AuditComment>>({});

  // Transition / Advance state
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [advanceCompleted, setAdvanceCompleted] = useState<boolean>(false);

  // Combined points & metrics (Spec §21)
  const allPoints = [...ascendingPoints, ...descendingPoints];
  const completedPoints = allPoints.filter((p) => p.status !== 'PENDING' && p.errorGrams !== undefined);
  const selectedPoint = allPoints.find((p) => p.id === selectedPointId) || ascendingPoints[3];

  const hasFailures = completedPoints.some((p) => p.status === 'FAIL');
  const marginalCount = completedPoints.filter((p) => p.status === 'MARGINAL').length;
  const passCount = completedPoints.filter((p) => p.status === 'PASS').length;
  const isAllComplete = completedPoints.length === allPoints.length;

  // Max and Min error calculations for §21
  const errors = completedPoints.map((p) => p.errorGrams || 0);
  const maxError = errors.length > 0 ? Math.max(...errors) : 0;
  const minError = errors.length > 0 ? Math.min(...errors) : 0;

  // Helper to compute observation results
  const computePointResult = (
    targetLoad: number,
    observedReading: number,
    deltaL: number = 0.0025,
    mpeBase: number
  ) => {
    const e = verificationIntervalKg;
    const P = observedReading + 0.5 * e - deltaL;
    const E = P - targetLoad;
    const Ec = E - 0.0; // E0 = 0
    const errorGrams = Ec * 1000;
    const effectiveMpe = mpeBase * stageMultiplier;

    let status: 'PASS' | 'MARGINAL' | 'FAIL' = 'PASS';
    if (Math.abs(errorGrams) > effectiveMpe) {
      status = 'FAIL';
    } else if (Math.abs(errorGrams) > effectiveMpe * 0.75) {
      status = 'MARGINAL';
    }

    return {
      observedReading,
      errorGrams: parseFloat(errorGrams.toFixed(2)),
      turningPointP: parseFloat(P.toFixed(4)),
      deltaL,
      status,
    };
  };

  // Synchronize canonical scenario observations when provided (§15, §16)
  React.useEffect(() => {
    if (session?.weighing?.observations && session.weighing.observations.length > 0) {
      const ascObs = session.weighing.observations.filter((o: any) => o.direction === 'ASCENDING');
      if (ascObs.length > 0) {
        setAscendingPoints((prev) =>
          prev.map((pt, idx) => {
            const match = ascObs[idx] || ascObs.find((o: any) => Math.abs(o.loadNominal - pt.targetLoad) < 0.001);
            if (match) {
              return {
                ...pt,
                observedReading: match.indicationI,
                errorGrams: Number((match.errorE * 1000).toFixed(2)),
                turningPointP: match.calculatedP,
                deltaL: match.turningPointDeltaL,
                status: match.status,
              };
            }
            return pt;
          })
        );
      }
    }
    if (session?.id?.includes('rounding') || session?.scenarioId === 'rounding_discrepancy_trap') {
      setIsRoundingTrapActive(true);
    }
  }, [session?.id, session?.scenarioId, session?.weighing]);

  // Handler for capturing live row reading (Spec §11)
  const handleCaptureRow = (pointId: string) => {
    if (isApproved) {
      showToast('Session Approved & Sealed', 'Observations cannot be altered on an approved statutory record.');
      return;
    }
    if (!canEnterObservation) {
      showToast('Read-Only Mode', `Role "${userRole}" is not authorized to capture observations. Read-only view active.`);
      return;
    }
    if (isTraceabilityLocked) {
      showToast('Traceability Locked', 'Cannot capture readings while standard weights are expired.');
      return;
    }
    if (!isScaleStable && !iotScaleStable) {
      showToast('Scale Unstable', 'Cannot capture weight while reading is fluctuating.');
      return;
    }

    const isAsc = pointId.startsWith('asc');
    const targetList = isAsc ? ascendingPoints : descendingPoints;
    const pt = targetList.find((p) => p.id === pointId);
    if (!pt) return;

    // Use live hardware scale if reading is available and plausible, else deterministic deviation
    let observed = pt.targetLoad === 0 ? 0.0 : (pt.targetLoad % 10 === 0 ? 0.004 : 0.002) + pt.targetLoad;
    if (scaleConnected) {
      const live = captureCurrentReading();
      if (live && typeof live.weight === 'number' && live.weight > 0) {
        observed = Number(live.weight.toFixed(4));
      }
    }

    const computed = computePointResult(pt.targetLoad, observed, 0.0025, pt.mpeGrams);

    const updateList = isAsc ? setAscendingPoints : setDescendingPoints;
    updateList((prev) =>
      prev.map((item) => (item.id === pointId ? { ...item, ...computed } : item))
    );

    setSelectedPointId(pointId);
    showToast(
      '✓ Reading captured',
      `Observation #${pt.stepIndex} (${pt.series}) recorded: ${observed.toFixed(3)} kg.`
    );
  };

  // Handler for manual entry (Spec §12)
  const handleSaveManualReading = (pointId: string, observedKg: number, deltaLKg: number) => {
    if (isApproved) {
      showToast('Session Approved & Sealed', 'Observations cannot be altered on an approved statutory record.');
      return;
    }
    if (!canEnterObservation) {
      showToast('Read-Only Mode', `Role "${userRole}" is not authorized to edit observations. Read-only view active.`);
      return;
    }
    const isAsc = pointId.startsWith('asc');
    const targetList = isAsc ? ascendingPoints : descendingPoints;
    const pt = targetList.find((p) => p.id === pointId);
    if (!pt) return;

    const computed = computePointResult(pt.targetLoad, observedKg, deltaLKg, pt.mpeGrams);

    const updateList = isAsc ? setAscendingPoints : setDescendingPoints;
    updateList((prev) =>
      prev.map((item) => (item.id === pointId ? { ...item, ...computed } : item))
    );

    setSelectedPointId(pointId);
    showToast(
      '✓ Manual Reading Recorded',
      `Observation #${pt.stepIndex} (${pt.series}) updated with ${observedKg.toFixed(3)} kg.`
    );
  };

  // Capture next pending row from top live scale widget
  const handleCaptureLiveTop = () => {
    if (isApproved) {
      showToast('Session Approved & Sealed', 'Observations cannot be altered on an approved statutory record.');
      return;
    }
    if (!canEnterObservation) {
      showToast('Read-Only Mode', `Role "${userRole}" is not authorized to capture observations. Read-only view active.`);
      return;
    }
    if (isTraceabilityLocked) {
      showToast('Traceability Locked', 'Cannot capture readings while standard weights are expired.');
      return;
    }
    if (!isScaleStable) {
      showToast('Scale Unstable', 'Cannot capture weight while reading is fluctuating.');
      return;
    }

    const nextPending = allPoints.find((p) => p.status === 'PENDING');
    if (nextPending) {
      handleCaptureRow(nextPending.id);
      if (nextPending.series === 'descending') {
        setIsDescendingCollapsed(false);
      }
    } else {
      showToast('All Observations Complete', 'All 14 statutory test points have been recorded.');
    }
  };

  // Inspect trace handler (Spec §14)
  const handleInspectTrace = (pt: WeighingPoint) => {
    setTracePoint(pt);
    setIsTraceOpen(true);
  };

  // Manual entry modal opener (Spec §12)
  const handleOpenManualEntry = (pt: WeighingPoint) => {
    setManualEntryPoint(pt);
    setIsManualEntryOpen(true);
  };

  // Audit comment handler (Spec §18)
  const handleOpenComment = (pt: WeighingPoint) => {
    setCommentPoint(pt);
    setIsCommentModalOpen(true);
  };

  const handleSaveComment = (comment: AuditComment) => {
    setAuditComments((prev) => ({
      ...prev,
      [comment.pointId]: comment,
    }));
    showToast('Audit Comment Saved', `Remark logged for observation #${comment.pointId}.`);
  };

  // Demo Scenarios Handler (Spec §32)
  const handleLoadPassingScenario = () => {
    const fullAsc: WeighingPoint[] = [
      { id: 'asc-1', series: 'ascending', stepIndex: 1, targetLoad: 0.0, observedReading: 0.000, errorGrams: 0.0, mpeGrams: 2.5, status: 'PASS', turningPointP: 0.000, deltaL: 0.0025 },
      { id: 'asc-2', series: 'ascending', stepIndex: 2, targetLoad: 5.0, observedReading: 5.002, errorGrams: 2.0, mpeGrams: 5.0, status: 'PASS', turningPointP: 5.002, deltaL: 0.0025 },
      { id: 'asc-3', series: 'ascending', stepIndex: 3, targetLoad: 10.0, observedReading: 10.003, errorGrams: 3.0, mpeGrams: 5.0, status: 'PASS', turningPointP: 10.003, deltaL: 0.0025 },
      { id: 'asc-4', series: 'ascending', stepIndex: 4, targetLoad: 15.0, observedReading: 15.003, errorGrams: 3.0, mpeGrams: 7.5, status: 'PASS', turningPointP: 15.003, deltaL: 0.0025 },
      { id: 'asc-5', series: 'ascending', stepIndex: 5, targetLoad: 20.0, observedReading: 20.004, errorGrams: 4.0, mpeGrams: 7.5, status: 'PASS', turningPointP: 20.004, deltaL: 0.0025 },
      { id: 'asc-6', series: 'ascending', stepIndex: 6, targetLoad: 25.0, observedReading: 25.004, errorGrams: 4.0, mpeGrams: 7.5, status: 'PASS', turningPointP: 25.004, deltaL: 0.0025 },
      { id: 'asc-7', series: 'ascending', stepIndex: 7, targetLoad: 30.0, observedReading: 30.005, errorGrams: 5.0, mpeGrams: 7.5, status: 'PASS', turningPointP: 30.005, deltaL: 0.0025 },
    ];
    const fullDsc: WeighingPoint[] = [
      { id: 'dsc-1', series: 'descending', stepIndex: 1, targetLoad: 30.0, observedReading: 30.004, errorGrams: 4.0, mpeGrams: 7.5, status: 'PASS', turningPointP: 30.004, deltaL: 0.0025 },
      { id: 'dsc-2', series: 'descending', stepIndex: 2, targetLoad: 25.0, observedReading: 25.003, errorGrams: 3.0, mpeGrams: 7.5, status: 'PASS', turningPointP: 25.003, deltaL: 0.0025 },
      { id: 'dsc-3', series: 'descending', stepIndex: 3, targetLoad: 20.0, observedReading: 20.002, errorGrams: 2.0, mpeGrams: 7.5, status: 'PASS', turningPointP: 20.002, deltaL: 0.0025 },
      { id: 'dsc-4', series: 'descending', stepIndex: 4, targetLoad: 15.0, observedReading: 15.002, errorGrams: 2.0, mpeGrams: 7.5, status: 'PASS', turningPointP: 15.002, deltaL: 0.0025 },
      { id: 'dsc-5', series: 'descending', stepIndex: 5, targetLoad: 10.0, observedReading: 10.001, errorGrams: 1.0, mpeGrams: 5.0, status: 'PASS', turningPointP: 10.001, deltaL: 0.0025 },
      { id: 'dsc-6', series: 'descending', stepIndex: 6, targetLoad: 5.0, observedReading: 5.001, errorGrams: 1.0, mpeGrams: 5.0, status: 'PASS', turningPointP: 5.001, deltaL: 0.0025 },
      { id: 'dsc-7', series: 'descending', stepIndex: 7, targetLoad: 0.0, observedReading: 0.000, errorGrams: 0.0, mpeGrams: 2.5, status: 'PASS', turningPointP: 0.000, deltaL: 0.0025 },
    ];
    setAscendingPoints(fullAsc);
    setDescendingPoints(fullDsc);
    setIsRoundingTrapActive(false);
    showToast('Passing Scenario Loaded', '14 compliant observations loaded. All errors within legal corridor.');
  };

  const handleLoadRoundingTrapScenario = () => {
    setIsRoundingTrapActive(true);
    // Replace observation #3 with turning point failure:
    // Display: 10.000 kg (appears to be 0 error), deltaL = 0.0078 kg -> P = 10.000 + 0.0025 - 0.0078 = 9.9947 kg -> E = -5.3 g (> 5.0 g MPE)
    setAscendingPoints((prev) =>
      prev.map((pt) => {
        if (pt.id === 'asc-3') {
          return {
            ...pt,
            observedReading: 10.000,
            turningPointP: 9.9947,
            deltaL: 0.0078,
            errorGrams: -5.3,
            status: 'FAIL',
          };
        }
        return pt;
      })
    );
    setSelectedPointId('asc-3');
    setIsRoundingTrapOpen(true);
    onUpdateSession?.({
      ...session,
      complianceStatus: 'FAIL',
      status: 'FAIL',
      notes: 'ROUNDING TRAP ACTIVE: Unrounded error -5.3 g exceeds legal tolerance ±5.0 g.',
      weighing: {
        ...session?.weighing,
        overallStatus: 'FAIL',
        status: 'FAIL',
        maxError: -0.0053,
      },
    });
    showToast('Rounding Trap Activated', 'Naive spreadsheet says 0.0g error (PASS). Statutory turning point calculates -5.3g (FAIL).');
  };

  const handleLoadFailureScenario = () => {
    setAscendingPoints((prev) =>
      prev.map((pt) => {
        if (pt.id === 'asc-5') {
          return {
            ...pt,
            observedReading: 20.009,
            turningPointP: 20.009,
            deltaL: 0.0025,
            errorGrams: 9.0, // > 7.5g MPE
            status: 'FAIL',
          };
        }
        return pt;
      })
    );
    setSelectedPointId('asc-5');
    onUpdateSession?.({
      ...session,
      complianceStatus: 'FAIL',
      status: 'FAIL',
      notes: 'Observation #5 error +9.0 g exceeds maximum permissible error limit ±7.5 g.',
      weighing: {
        ...session?.weighing,
        overallStatus: 'FAIL',
        status: 'FAIL',
        maxError: 0.009,
      },
    });
    showToast('Out-of-Tolerance Failure Loaded', 'Observation #5 exceeds maximum permissible error limit.');
  };

  const handleResetToPartial = () => {
    setAscendingPoints(initialAscendingPoints);
    setDescendingPoints(initialDescendingPoints);
    setIsRoundingTrapActive(false);
    setSelectedPointId('asc-4');
    showToast('Reset to Incomplete Run', 'Test reset to 4 completed, 10 pending observations.');
  };

  // Advance to Next Step (Eccentricity) per §27
  const handleContinue = () => {
    if (hasFailures || !isAllComplete) return;

    setIsAdvancing(true);
    setTimeout(() => {
      setIsAdvancing(false);
      setAdvanceCompleted(true);
      setTimeout(() => {
        onContinueToEccentricity({
          ...session,
          weighingResults: {
            ascending: ascendingPoints,
            descending: descendingPoints,
            verificationStage,
            passCount,
            marginalCount,
            maxError,
            minError,
            status: 'PASS',
          },
        });
      }, 700);
    }, 600);
  };

  // Statutory 7-step progress rail per §3
  const steps = [
    { num: 1, label: 'Preflight', status: 'DONE' },
    { num: 2, label: 'Inspection', status: 'DONE' },
    { num: 3, label: 'Weighing', status: 'CURRENT' },
    { num: 4, label: 'Eccentricity', status: 'PENDING' },
    { num: 5, label: 'Repeatability', status: 'PENDING' },
    { num: 6, label: 'Environmental', status: 'PENDING' },
    { num: 7, label: 'Review', status: 'PENDING' },
  ];

  return (
    <div className="space-y-6 pb-28">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed top-20 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 animate-in slide-in-from-top-4 flex items-start gap-3 max-w-sm">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold font-sans">{toast.title}</p>
            <p className="text-[11px] font-mono text-slate-300 mt-0.5">{toast.subtitle}</p>
          </div>
        </div>
      )}

      {/* Visual Permission Enforcement Banners (§13) */}
      {isApproved && (
        <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-300 flex items-center gap-2">
                <span>IMMUTABLE STATUTORY RECORD</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 dark:bg-amber-900 text-[10px] font-black">
                  LOCKED
                </span>
              </div>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5 font-sans">
                This verification session has been formally APPROVED and sealed with digital signature. Test observations are permanently locked to preserve legal evidentiary integrity.
              </p>
            </div>
          </div>
          <span className="font-mono text-xs text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-3 py-1.5 rounded-xl border border-amber-300/60 font-semibold shrink-0">
            🔒 Read-Only
          </span>
        </div>
      )}

      {!canEnterObservation && !isApproved && (
        <div className="bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-2xl p-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center font-bold text-xs">
              🔒
            </div>
            <span className="text-xs text-slate-700 dark:text-slate-300 font-sans">
              <strong className="font-bold">{userRole} View:</strong> Observation capture is managed by the testing Metrologist. Calculation proofs, traces, and audit logs are open for review.
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-700 text-[11px] font-mono font-bold text-slate-600 dark:text-slate-300 shrink-0">
            🔒 Read-Only
          </span>
        </div>
      )}

      {/* 1. Persistent Session Header per spec §3 */}
      <div className="bg-white rounded-xl border border-foundation-200 p-4 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-foundation-100">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <button
                type="button"
                onClick={onBackToDashboard}
                className="text-xs font-semibold text-foundation-500 hover:text-brand-600 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Verification / {sessionNumber}</span>
              </button>
              <span className="text-foundation-300">•</span>
              <span className="font-mono text-xs font-bold text-foundation-500 uppercase">
                Step 03 of 07
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foundation-950 font-sans">
                WEIGHING ERROR & LINEARITY
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                <span>IN TEST</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foundation-500 mt-1">
              Determine weighing error across increasing and decreasing loads under OIML R 76-1 Clause 3.5.
            </p>
          </div>

          {/* Instrument Identity & Traceability Status Badge */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 self-start sm:self-auto">
            <div className="font-mono text-xs text-foundation-700 bg-foundation-50 px-3 py-1.5 rounded-lg border border-foundation-200 flex items-center gap-2">
              <span className="font-bold text-foundation-950">{manufacturer} {model}</span>
              <span className="text-foundation-300">•</span>
              <span>{serialNumber}</span>
              <span className="text-foundation-300">•</span>
              <span className="font-bold text-foundation-900">{maxCapacity} (e = 0.005 kg)</span>
            </div>

            <div
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 ${
                isTraceabilityLocked
                  ? 'bg-rose-50 border-rose-300 text-rose-800'
                  : 'bg-emerald-50 border-emerald-300 text-emerald-800'
              }`}
            >
              {isTraceabilityLocked ? (
                <>
                  <Lock size={13} className="text-rose-600" />
                  <span>Lockout: Traceability Expired</span>
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} className="text-emerald-600" />
                  <span>✓ Traceability Valid</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* 7-Step Horizontal Progress Rail per §3 */}
        <div className="flex items-center justify-between overflow-x-auto pt-3 text-xs">
          {steps.map((s, idx) => (
            <React.Fragment key={s.num}>
              <div className="flex items-center gap-2 shrink-0">
                <span
                  className={`w-5 h-5 rounded-full flex items-center justify-center font-mono text-[10px] font-bold ${
                    s.status === 'DONE'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : s.status === 'CURRENT'
                      ? 'bg-brand-600 text-white shadow-xs ring-2 ring-brand-100'
                      : 'bg-foundation-100 text-foundation-400'
                  }`}
                >
                  {s.status === 'DONE' ? '✓' : s.num}
                </span>
                <span
                  className={`font-medium ${
                    s.status === 'CURRENT'
                      ? 'text-brand-900 font-bold'
                      : s.status === 'DONE'
                      ? 'text-foundation-800 font-semibold'
                      : 'text-foundation-400'
                  }`}
                >
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <span className="text-foundation-300 px-2 select-none">→</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Quick Interactive Demo Presets Strip (Spec §32) */}
      <div className="bg-slate-900 text-white rounded-xl p-3 sm:px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Zap size={14} className="text-amber-400" />
          <span className="font-bold text-amber-400 uppercase tracking-wider">Jury Demo Workflows:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadPassingScenario}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer"
          >
            ✓ Standard 14/14 Pass
          </button>

          <button
            type="button"
            onClick={handleLoadRoundingTrapScenario}
            className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 text-amber-300 text-[11px] font-mono border border-amber-800/80 transition-colors cursor-pointer flex items-center gap-1"
          >
            <AlertTriangle size={11} />
            <span>Rounding Trap Test</span>
          </button>

          <button
            type="button"
            onClick={handleLoadFailureScenario}
            className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[11px] font-mono border border-rose-800/80 transition-colors cursor-pointer flex items-center gap-1"
          >
            <XCircle size={11} />
            <span>Tolerance Fail (Lock Advance)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScaleStable(!isScaleStable)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer ${
              isScaleStable
                ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                : 'bg-amber-900 text-amber-200 border-amber-700 animate-pulse'
            }`}
          >
            {isScaleStable ? 'Toggle Unstable Noise' : 'Set Indicator Stable'}
          </button>

          <button
            type="button"
            onClick={() => setIsTraceabilityLocked(!isTraceabilityLocked)}
            className={`px-2.5 py-1 rounded text-[11px] font-mono border transition-colors cursor-pointer flex items-center gap-1 ${
              isTraceabilityLocked
                ? 'bg-rose-900 text-rose-200 border-rose-700'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <Lock size={11} />
            <span>{isTraceabilityLocked ? 'Unlock Traceability' : 'Simulate Lockout'}</span>
          </button>

          <button
            type="button"
            onClick={handleResetToPartial}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RefreshCw size={11} />
            <span>Reset 4/14</span>
          </button>
        </div>
      </div>

      {/* Traceability Lockout Alert Banner per spec §31 */}
      {isTraceabilityLocked && (
        <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Lock size={20} className="text-rose-700 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-950 uppercase font-mono tracking-wider">
                  🔒 TESTING LOCKED — Traceability Expired
                </span>
                <span className="text-[10px] font-mono bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-bold">
                  STATUTORY INTERLOCK
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                Assigned reference standard weight set certificate has passed statutory calibration validity. Observation entry and capture are disabled.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTraceabilityLocked(false)}
            className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-mono font-bold transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            Resolve Traceability →
          </button>
        </div>
      )}

      {/* Rounding Trap Active Callout Banner per spec §21 */}
      {isRoundingTrapActive && (
        <div className="rounded-2xl border-2 border-amber-400 bg-amber-50/95 dark:bg-amber-950/40 p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-sm animate-in fade-in">
          <div className="flex items-start gap-3.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-amber-950 dark:text-amber-100 uppercase font-mono tracking-wider">
                  ⚠ ROUNDING TRAP ACTIVE
                </span>
                <span className="text-[10px] font-mono bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                  CORE OIML DEMONSTRATION
                </span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-1 text-xs font-mono">
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-600 dark:text-slate-400">Legacy spreadsheet calculation:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">PASS</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-600 dark:text-slate-400">METROLOGIX-76 turning-point:</span>
                  <span className="font-black text-rose-600 dark:text-rose-400">FAIL</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-600 dark:text-slate-400">Unrounded error:</span>
                  <span className="font-black text-rose-600 dark:text-rose-400">-5.3 g</span>
                </div>
                <div className="flex items-center justify-between sm:justify-start gap-4">
                  <span className="text-slate-600 dark:text-slate-400">Legal tolerance:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">±5.0 g</span>
                </div>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsRoundingTrapOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 text-xs font-mono font-black transition-all shrink-0 cursor-pointer shadow-sm flex items-center gap-1.5 self-start md:self-auto"
          >
            <span>Inspect Why →</span>
          </button>
        </div>
      )}

      {/* 2. Top Controls Strip (Spec §4, §5, §6, §7) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Verification Stage Selector per spec §5 */}
        <div className="md:col-span-4 bg-white rounded-xl border border-foundation-200 p-3.5 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-foundation-500 uppercase font-mono tracking-wider">
              VERIFICATION STAGE
            </span>
            <span className="text-[10px] font-mono text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded font-bold border border-brand-200">
              {stageMultiplier}× MPE
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setVerificationStage('initial')}
              className={`p-2.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer text-left ${
                verificationStage === 'initial'
                  ? 'bg-brand-50 border-brand-300 text-brand-900 ring-2 ring-brand-100 shadow-2xs'
                  : 'bg-foundation-50 border-foundation-200 text-foundation-600 hover:bg-foundation-100'
              }`}
            >
              <div>Initial Type Approval</div>
              <span className="text-[10px] font-normal text-foundation-500 block mt-0.5">
                1× legal tolerance
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVerificationStage('subsequent')}
              className={`p-2.5 rounded-lg text-xs font-mono font-bold border transition-colors cursor-pointer text-left ${
                verificationStage === 'subsequent'
                  ? 'bg-brand-50 border-brand-300 text-brand-900 ring-2 ring-brand-100 shadow-2xs'
                  : 'bg-foundation-50 border-foundation-200 text-foundation-600 hover:bg-foundation-100'
              }`}
            >
              <div>Subsequent Verification</div>
              <span className="text-[10px] font-normal text-foundation-500 block mt-0.5">
                2× legal tolerance
              </span>
            </button>
          </div>
        </div>

        {/* Layout Viewport Switcher per spec §7 */}
        <div className="md:col-span-4 bg-white rounded-xl border border-foundation-200 p-3.5 shadow-xs flex flex-col justify-between">
          <span className="text-[11px] font-bold text-foundation-500 uppercase font-mono tracking-wider mb-2 block">
            VIEWPORT LAYOUT
          </span>
          <div className="flex items-center gap-1.5 bg-foundation-100 p-1 rounded-lg border border-foundation-200 text-xs">
            <button
              type="button"
              onClick={() => setActiveView('split')}
              className={`flex-1 py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'split'
                  ? 'bg-white text-foundation-950 shadow-xs font-bold'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              <Columns size={13} />
              <span>Split View</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('grid')}
              className={`flex-1 py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'grid'
                  ? 'bg-white text-foundation-950 shadow-xs font-bold'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              <LayoutGrid size={13} />
              <span>Grid Only</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveView('chart')}
              className={`flex-1 py-1.5 px-2 rounded-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                activeView === 'chart'
                  ? 'bg-white text-foundation-950 shadow-xs font-bold'
                  : 'text-foundation-600 hover:text-foundation-900'
              }`}
            >
              <TrendingUp size={13} />
              <span>Chart Only</span>
            </button>
          </div>
        </div>

        {/* Live Scale Status Chip per spec §6 */}
        <div className="md:col-span-4 bg-white rounded-xl border border-foundation-200 p-3.5 shadow-xs flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5 text-xs text-foundation-500 font-mono">
              <Cpu size={14} className="text-brand-600" />
              <span>LIVE SCALE (RS-232 / USB)</span>
            </div>
            <div className="text-2xl font-mono font-bold text-foundation-950 mt-0.5">
              {isScaleStable ? liveWeight : '10.002 ↕ 10.008 kg'}
            </div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono font-bold mt-0.5">
              {isScaleStable ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>● STABLE 10.005 kg</span>
                </span>
              ) : (
                <span className="text-amber-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>● UNSTABLE (Fluctuating)</span>
                </span>
              )}
            </div>
          </div>

          <button
            type="button"
            disabled={!isScaleStable || isTraceabilityLocked}
            onClick={handleCaptureLiveTop}
            title={
              isTraceabilityLocked
                ? 'Traceability locked'
                : !isScaleStable
                ? 'Scale is unstable'
                : 'Capture next observation'
            }
            className={`px-3.5 py-2.5 rounded-lg text-xs font-bold font-mono transition-colors shadow-sm cursor-pointer ${
              isScaleStable && !isTraceabilityLocked
                ? 'bg-brand-600 hover:bg-brand-700 text-white'
                : 'bg-foundation-200 text-foundation-400 cursor-not-allowed'
            }`}
          >
            Capture Next
          </button>
        </div>
      </div>

      {/* 3. Main Workstation Area per activeView layout switch (Spec §7) */}
      {activeView === 'split' ? (
        <div className="space-y-6">
          {/* Top Half: Ascending Series Table */}
          <ObservationTable
            seriesType="ascending"
            seriesIndex="01"
            title="Ascending Series — Increasing Load"
            subtitle="0 → Maximum Capacity (30.000 kg)"
            points={ascendingPoints}
            selectedPointId={selectedPointId}
            onSelectPoint={(pt) => setSelectedPointId(pt.id)}
            onCaptureRow={handleCaptureRow}
            onOpenManualEntry={handleOpenManualEntry}
            onInspectTrace={handleInspectTrace}
            onOpenComment={handleOpenComment}
            auditComments={auditComments}
            verificationStageMultiplier={stageMultiplier}
            userRole={userRole}
            isScaleStable={isScaleStable}
            isTraceabilityLocked={isTraceabilityLocked}
          />

          {/* Middle: Side-by-Side Error Corridor Chart + Current Observation Card */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            <div className="lg:col-span-8">
              <ErrorCorridorChart
                points={allPoints}
                selectedPointId={selectedPointId}
                onSelectPoint={(pt) => setSelectedPointId(pt.id)}
                verificationStageMultiplier={stageMultiplier}
              />
            </div>
            <div className="lg:col-span-4">
              <CurrentObservationCard
                point={selectedPoint}
                verificationStageMultiplier={stageMultiplier}
                onInspectTrace={handleInspectTrace}
              />
            </div>
          </div>

          {/* Bottom Half: Descending Series Table */}
          <ObservationTable
            seriesType="descending"
            seriesIndex="02"
            title="Descending Series — Decreasing Load"
            subtitle="Maximum Capacity → 0 kg (Mechanical Hysteresis Evaluation)"
            points={descendingPoints}
            selectedPointId={selectedPointId}
            onSelectPoint={(pt) => setSelectedPointId(pt.id)}
            onCaptureRow={handleCaptureRow}
            onOpenManualEntry={handleOpenManualEntry}
            onInspectTrace={handleInspectTrace}
            onOpenComment={handleOpenComment}
            auditComments={auditComments}
            verificationStageMultiplier={stageMultiplier}
            userRole={userRole}
            isScaleStable={isScaleStable}
            isTraceabilityLocked={isTraceabilityLocked}
            isCollapsed={isDescendingCollapsed}
            onToggleCollapse={() => setIsDescendingCollapsed(!isDescendingCollapsed)}
          />
        </div>
      ) : activeView === 'grid' ? (
        /* Full Grid Entry Mode */
        <div className="space-y-6">
          <ObservationTable
            seriesType="ascending"
            seriesIndex="01"
            title="Ascending Series — Increasing Load"
            subtitle="0 → Maximum Capacity (30.000 kg)"
            points={ascendingPoints}
            selectedPointId={selectedPointId}
            onSelectPoint={(pt) => setSelectedPointId(pt.id)}
            onCaptureRow={handleCaptureRow}
            onOpenManualEntry={handleOpenManualEntry}
            onInspectTrace={handleInspectTrace}
            onOpenComment={handleOpenComment}
            auditComments={auditComments}
            verificationStageMultiplier={stageMultiplier}
            userRole={userRole}
            isScaleStable={isScaleStable}
            isTraceabilityLocked={isTraceabilityLocked}
          />
          <ObservationTable
            seriesType="descending"
            seriesIndex="02"
            title="Descending Series — Decreasing Load"
            subtitle="Maximum Capacity → 0 kg (Mechanical Hysteresis Evaluation)"
            points={descendingPoints}
            selectedPointId={selectedPointId}
            onSelectPoint={(pt) => setSelectedPointId(pt.id)}
            onCaptureRow={handleCaptureRow}
            onOpenManualEntry={handleOpenManualEntry}
            onInspectTrace={handleInspectTrace}
            onOpenComment={handleOpenComment}
            auditComments={auditComments}
            verificationStageMultiplier={stageMultiplier}
            userRole={userRole}
            isScaleStable={isScaleStable}
            isTraceabilityLocked={isTraceabilityLocked}
            isCollapsed={false}
          />
        </div>
      ) : (
        /* Full Chart Mode per spec §26 */
        <div className="space-y-6">
          <ErrorCorridorChart
            points={allPoints}
            selectedPointId={selectedPointId}
            onSelectPoint={(pt) => setSelectedPointId(pt.id)}
            verificationStageMultiplier={stageMultiplier}
            isExpandedChartOnly={true}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CurrentObservationCard
              point={selectedPoint}
              verificationStageMultiplier={stageMultiplier}
              onInspectTrace={handleInspectTrace}
            />

            {/* Linearity Instrument Analysis Card */}
            <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[11px] font-bold text-foundation-500 uppercase font-mono tracking-wider block mb-2">
                  LINEARITY & HYSTERESIS ANALYSIS
                </span>
                <p className="text-xs text-foundation-600 leading-relaxed font-sans">
                  The statutory Error Corridor visualizes increasing (●) and decreasing (◆) error trajectories against the OIML Table 6 tolerance envelope. Maximum allowable deviation is tiered at $\pm 0.5e$ up to 2.5 kg, $\pm 1.0e$ up to 10 kg, and $\pm 1.5e$ up to 30 kg.
                </p>
              </div>

              <div className="pt-4 border-t border-foundation-100 space-y-2 text-xs font-mono">
                <div className="flex items-center justify-between">
                  <span className="text-foundation-500">Max Ascending Error:</span>
                  <span className="font-bold text-foundation-900">+5.0 g (at 30 kg)</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-foundation-500">Max Descending Error:</span>
                  <span className="font-bold text-foundation-900">+4.0 g (at 30 kg)</span>
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-foundation-100">
                  <span className="text-foundation-500">Hysteresis Spread ($\Delta H$):</span>
                  <span className="font-bold text-emerald-700">1.0 g (Compliant $\le 1.0e$)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. Weighing Summary Card & Completion Banner per spec §21, §27, §28, §29 */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Weighing Summary Metric Card per §21 */}
        <div className="md:col-span-5 bg-white rounded-xl border border-foundation-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
              <span className="text-[11px] font-bold text-foundation-500 uppercase font-mono tracking-wider">
                WEIGHING SUMMARY
              </span>
              <span className="font-mono text-xs text-foundation-600 font-bold">
                {completedPoints.length} / {allPoints.length}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 py-3 font-mono text-xs border-b border-foundation-100">
              <div>
                <span className="text-foundation-400 block text-[10px]">Maximum Error</span>
                <span className="text-base font-bold text-foundation-900">
                  {maxError > 0 ? `+${maxError.toFixed(1)} g` : `${maxError.toFixed(1)} g`}
                </span>
              </div>
              <div>
                <span className="text-foundation-400 block text-[10px]">Minimum Error</span>
                <span className="text-base font-bold text-foundation-900">
                  {minError > 0 ? `+${minError.toFixed(1)} g` : `${minError.toFixed(1)} g`}
                </span>
              </div>
              <div>
                <span className="text-foundation-400 block text-[10px]">Near Limit (Marginal)</span>
                <span className="text-base font-bold text-amber-700">{marginalCount}</span>
              </div>
              <div>
                <span className="text-foundation-400 block text-[10px]">Failures</span>
                <span className={`text-base font-bold ${hasFailures ? 'text-rose-700' : 'text-foundation-900'}`}>
                  {completedPoints.filter((p) => p.status === 'FAIL').length}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex items-center justify-between font-mono text-xs">
            <span className="text-foundation-500">Overall Linearity:</span>
            <span
              className={`font-bold px-2 py-0.5 rounded ${
                hasFailures
                  ? 'bg-rose-100 text-rose-800'
                  : !isAllComplete
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {hasFailures ? '✕ FAIL' : !isAllComplete ? '○ IN PROGRESS' : '✓ PASS'}
            </span>
          </div>
        </div>

        {/* Dynamic Test Verdict Banner per §27, §28, §29 */}
        <div
          className={`md:col-span-7 rounded-xl border p-5 flex flex-col justify-between transition-all ${
            hasFailures
              ? 'bg-rose-50/90 border-rose-300 text-rose-950'
              : !isAllComplete
              ? 'bg-amber-50/80 border-amber-300 text-amber-950'
              : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
          }`}
        >
          <div className="flex items-start gap-3.5">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                hasFailures
                  ? 'bg-rose-600 text-white'
                  : !isAllComplete
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {hasFailures ? (
                <XCircle size={22} className="stroke-[2.5]" />
              ) : !isAllComplete ? (
                <AlertTriangle size={22} className="stroke-[2.5]" />
              ) : (
                <CheckCircle2 size={22} className="stroke-[2.5]" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold tracking-tight font-sans">
                {hasFailures
                  ? '✕ WEIGHING TEST FAILED — Tolerance Exceeded'
                  : !isAllComplete
                  ? '⚠ WEIGHING TEST INCOMPLETE'
                  : '✓ WEIGHING TEST RESULT: PASS'}
              </h3>
              <p className="text-xs mt-1 font-mono leading-relaxed">
                {hasFailures
                  ? `One or more test observations exceed the legal tolerance limit (${stageMultiplier}× MPE under OIML R 76-1 Table 6). Advance to next stage is blocked.`
                  : !isAllComplete
                  ? `${allPoints.length - completedPoints.length} mandatory observations remain before statutory verification can be completed.`
                  : 'All recorded errors across increasing and decreasing loads are within the statutory maximum permissible error corridor.'}
              </p>
            </div>
          </div>

          <div className="pt-3 border-t border-black/10 flex items-center justify-between text-xs font-mono">
            <span>
              {isAllComplete
                ? 'Ascending: 7/7 · Descending: 7/7 complete'
                : `${completedPoints.length} of ${allPoints.length} complete`}
            </span>
            {hasFailures && (
              <button
                type="button"
                onClick={() => {
                  const failed = completedPoints.find((p) => p.status === 'FAIL');
                  if (failed) handleInspectTrace(failed);
                }}
                className="text-xs font-bold text-rose-800 underline hover:text-rose-950 cursor-pointer"
              >
                Inspect Failed Trace →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 5. Sticky Bottom Action Footer (Spec §2, §21, §28, §33) */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-foundation-200 py-3.5 px-4 sm:px-8 z-30 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left Progress Indicators */}
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto font-mono">
            <span className="font-bold text-foundation-800 font-sans">
              Test Progress:
            </span>
            <span className="text-foundation-600">
              Ascending {ascendingPoints.filter((p) => p.status !== 'PENDING').length}/7 · Descending {descendingPoints.filter((p) => p.status !== 'PENDING').length}/7
            </span>
            <div className="w-28 h-2 bg-foundation-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hasFailures ? 'bg-rose-500' : 'bg-brand-600'
                }`}
                style={{ width: `${(completedPoints.length / allPoints.length) * 100}%` }}
              />
            </div>
            <span className="text-foundation-300 hidden sm:inline">•</span>
            <span className="text-foundation-500 text-[11px] hidden sm:inline">
              ✓ Autosaved
            </span>
          </div>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onNavigatePrevious && (
              <button
                type="button"
                onClick={onNavigatePrevious}
                className="px-4 py-2 border border-foundation-200 text-foundation-700 hover:bg-foundation-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Previous: Physical Inspection</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2 border border-foundation-200 text-foundation-700 hover:bg-foundation-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            {/* Dominant Primary Action CTA per §28, §29, §33 */}
            <button
              type="button"
              disabled={hasFailures || !isAllComplete || isAdvancing || advanceCompleted}
              onClick={handleContinue}
              title={
                hasFailures
                  ? 'Weighing test failed. Cannot proceed to Eccentricity until errors are resolved.'
                  : !isAllComplete
                  ? 'Complete all 14 observations before continuing.'
                  : 'Save weighing linearity and advance to Step 04: Eccentricity / Corner Loading.'
              }
              className={`px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                advanceCompleted
                  ? 'bg-emerald-600'
                  : isAdvancing
                  ? 'bg-brand-600 opacity-90'
                  : isAllComplete && !hasFailures
                  ? 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 hover:shadow'
                  : 'bg-foundation-300 cursor-not-allowed opacity-60'
              }`}
            >
              {isAdvancing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Weighing Test...</span>
                </>
              ) : advanceCompleted ? (
                <>
                  <Check size={16} className="stroke-[3]" />
                  <span>Weighing Complete ✓ · Opening Eccentricity →</span>
                </>
              ) : (
                <>
                  <span>Continue to Eccentricity</span>
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drawers & Modals */}
      <CalculationTraceDrawer
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        point={tracePoint}
        verificationIntervalKg={verificationIntervalKg}
        verificationStageMultiplier={stageMultiplier}
      />

      <RoundingTrapModal
        isOpen={isRoundingTrapOpen}
        onClose={() => setIsRoundingTrapOpen(false)}
      />

      <ManualEntryModal
        isOpen={isManualEntryOpen}
        onClose={() => setIsManualEntryOpen(false)}
        point={manualEntryPoint}
        onSaveManualReading={handleSaveManualReading}
        verificationIntervalKg={verificationIntervalKg}
      />

      <AuditCommentModal
        isOpen={isCommentModalOpen}
        onClose={() => setIsCommentModalOpen(false)}
        point={commentPoint}
        currentComment={commentPoint ? auditComments[commentPoint.id] : null}
        onSaveComment={handleSaveComment}
        userRole={userRole}
      />
    </div>
  );
};
