import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Compass,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Check,
  RotateCcw,
  Zap,
  Lock,
  Cpu,
  Star,
} from 'lucide-react';
import { PlatterGeometrySelector, PlatterGeometry } from '../eccentricity/PlatterGeometrySelector';
import { PlatterVisualizer, EccentricityPosition } from '../eccentricity/PlatterVisualizer';
import { EccentricitySummaryCard } from '../eccentricity/EccentricitySummaryCard';
import { PositionResultsTable } from '../eccentricity/PositionResultsTable';
import { EccentricityTraceDrawer } from '../eccentricity/EccentricityTraceDrawer';
import { EccentricityAuditModal, EccentricityAuditComment } from '../eccentricity/EccentricityAuditModal';
import { EccentricityManualEntryModal } from '../eccentricity/EccentricityManualEntryModal';

interface EccentricityWorkspaceViewProps {
  session: any;
  onBackToDashboard: () => void;
  onContinueToRepeatability: (updatedSession: any) => void;
  onNavigatePrevious?: () => void;
  onUpdateSession?: (updatedSession: any) => void;
  userRole?: string;
}

export const EccentricityWorkspaceView: React.FC<EccentricityWorkspaceViewProps> = ({
  session,
  onBackToDashboard,
  onContinueToRepeatability,
  onNavigatePrevious,
  onUpdateSession,
  userRole = 'Metrologist',
}) => {
  // Session metadata per spec §2, §31
  const sessionNumber = session?.sessionNumber || session?.id || 'VR-2026-00418';
  const manufacturer = session?.manufacturer || 'Avery Weigh-Tronix';
  const model = session?.model || session?.instrument || 'ZM201 Retail Platform';
  const serialNumber = session?.serialNumber || 'AV-2026-8812';
  const accuracyClass = session?.accuracyClass || 'Class III';
  const maxCapacity = session?.maxCapacity || '30 kg';
  const verificationInterval = session?.verificationInterval || session?.interval || 'e = 0.005 kg';
  const verificationIntervalKg = 0.005; // 5 g

  // OIML R 76-1 CL 3.6.2: Test load is 1/3 Max = 10.000 kg.
  // Under Table 6 for Class III with e = 5 g: at 10 kg (2000e), statutory MPE = ±1.0e = ±5.0 g.
  const mpeGrams = 5.0;

  // 1. Platter Geometry State (Spec §3, §21, §22)
  const [geometry, setGeometry] = useState<PlatterGeometry>('square');

  // 2. Scale & Hardware status (Spec §8, §25)
  const [isScaleStable, setIsScaleStable] = useState<boolean>(true);
  const [liveWeight, setLiveWeight] = useState<string>('10.004 kg');

  // 3. Traceability lockout state (Spec §30)
  const [isTraceabilityLocked, setIsTraceabilityLocked] = useState<boolean>(false);

  // 4. Toast Notification
  const [toast, setToast] = useState<{ show: boolean; title: string; subtitle: string } | null>(null);

  const showToast = (title: string, subtitle: string) => {
    setToast({ show: true, title, subtitle });
    setTimeout(() => setToast(null), 3500);
  };

  // Positions dataset for Square Platter (4 Corners + Center, Spec §4)
  const defaultSquarePositions: EccentricityPosition[] = [
    { id: 'corner-1', label: 'C1', name: 'Corner 1 (Front-Left)', x: 105, y: 105, targetLoad: 10.0, observedReading: 10.001, errorGrams: 1.0, mpeGrams, status: 'PASS' },
    { id: 'corner-2', label: 'C2', name: 'Corner 2 (Front-Right)', x: 295, y: 105, targetLoad: 10.0, observedReading: 10.003, errorGrams: 3.0, mpeGrams, status: 'PASS' },
    { id: 'corner-3', label: 'C3', name: 'Corner 3 (Rear-Right)', x: 295, y: 295, targetLoad: 10.0, observedReading: 10.004, errorGrams: 4.0, mpeGrams, status: 'MARGINAL' },
    { id: 'corner-4', label: 'C4', name: 'Corner 4 (Rear-Left)', x: 105, y: 295, targetLoad: 10.0, mpeGrams, status: 'PENDING' },
    { id: 'center', label: 'C0', name: 'Center Reference', x: 200, y: 200, targetLoad: 10.0, observedReading: 10.000, errorGrams: 0.0, mpeGrams, status: 'PASS' },
  ];

  // Positions dataset for Round Platter (3 supports at 120° + Center, Spec §21)
  const defaultRoundPositions: EccentricityPosition[] = [
    { id: 'round-1', label: 'S1', name: 'Support 1 (0° North)', x: 200, y: 85, targetLoad: 10.0, observedReading: 10.001, errorGrams: 1.0, mpeGrams, status: 'PASS' },
    { id: 'round-2', label: 'S2', name: 'Support 2 (120° East)', x: 300, y: 260, targetLoad: 10.0, observedReading: 10.002, errorGrams: 2.0, mpeGrams, status: 'PASS' },
    { id: 'round-3', label: 'S3', name: 'Support 3 (240° West)', x: 100, y: 260, targetLoad: 10.0, mpeGrams, status: 'PENDING' },
    { id: 'round-center', label: 'C0', name: 'Center Reference', x: 200, y: 200, targetLoad: 10.0, observedReading: 10.000, errorGrams: 0.0, mpeGrams, status: 'PASS' },
  ];

  // Positions dataset for Rolling Load (>4 Supports / Axle Track, Spec §22)
  const defaultRollingPositions: EccentricityPosition[] = [
    { id: 'roll-1', label: '1', name: 'Track Entry Ramp', x: 90, y: 200, targetLoad: 10.0, observedReading: 10.002, errorGrams: 2.0, mpeGrams, status: 'PASS' },
    { id: 'roll-2', label: '2', name: 'Axle 1 Forward', x: 145, y: 200, targetLoad: 10.0, observedReading: 10.003, errorGrams: 3.0, mpeGrams, status: 'PASS' },
    { id: 'roll-3', label: '3', name: 'Track Center Span', x: 200, y: 200, targetLoad: 10.0, observedReading: 10.001, errorGrams: 1.0, mpeGrams, status: 'PASS' },
    { id: 'roll-4', label: '4', name: 'Axle 2 Aft', x: 255, y: 200, targetLoad: 10.0, mpeGrams, status: 'PENDING' },
    { id: 'roll-5', label: '5', name: 'Track Exit Ramp', x: 310, y: 200, targetLoad: 10.0, mpeGrams, status: 'PENDING' },
  ];

  const [positions, setPositions] = useState<EccentricityPosition[]>(defaultSquarePositions);
  const [selectedPositionId, setSelectedPositionId] = useState<string>('corner-3');

  // Modals & Drawers
  const [tracePosition, setTracePosition] = useState<EccentricityPosition | null>(null);
  const [isTraceOpen, setIsTraceOpen] = useState<boolean>(false);
  const [auditPosition, setAuditPosition] = useState<EccentricityPosition | null>(null);
  const [isAuditOpen, setIsAuditOpen] = useState<boolean>(false);
  const [manualPosition, setManualPosition] = useState<EccentricityPosition | null>(null);
  const [isManualOpen, setIsManualOpen] = useState<boolean>(false);
  const [auditComments, setAuditComments] = useState<Record<string, EccentricityAuditComment>>({});

  // Transition state
  const [isAdvancing, setIsAdvancing] = useState<boolean>(false);
  const [advanceCompleted, setAdvanceCompleted] = useState<boolean>(false);

  // Switch geometry per spec §3
  const handleSelectGeometry = (geom: PlatterGeometry) => {
    setGeometry(geom);
    if (geom === 'round') {
      setPositions(defaultRoundPositions);
      setSelectedPositionId('round-1');
    } else if (geom === 'rolling') {
      setPositions(defaultRollingPositions);
      setSelectedPositionId('roll-1');
    } else {
      setPositions(defaultSquarePositions);
      setSelectedPositionId('corner-3');
    }
    showToast('Platter Geometry Changed', `Switched layout to ${geom.toUpperCase()} platform.`);
  };

  const selectedPos = positions.find((p) => p.id === selectedPositionId) || positions[0];

  // Helper for computing point result
  const evaluateIndication = (targetLoad: number, observed: number) => {
    const errorGrams = parseFloat(((observed - targetLoad) * 1000).toFixed(1));
    const errorAbs = Math.abs(errorGrams);
    let status: 'PASS' | 'MARGINAL' | 'FAIL' = 'PASS';
    if (errorAbs > mpeGrams) {
      status = 'FAIL';
    } else if (errorAbs > mpeGrams * 0.75) {
      status = 'MARGINAL';
    }
    return { observedReading: observed, errorGrams, status };
  };

  // Capture current position reading (Spec §8)
  const handleCaptureCurrent = () => {
    if (isTraceabilityLocked) {
      showToast('Traceability Locked', 'Cannot capture readings while standard weights are expired.');
      return;
    }
    if (!isScaleStable) {
      showToast('Scale Unstable', 'Cannot capture weight while reading is fluctuating.');
      return;
    }

    // Realistic simulated reading for current corner (e.g. 10.003 kg)
    const simulatedReading =
      selectedPos.id === 'corner-4' ? 10.002 : selectedPos.id.includes('4') ? 10.003 : 10.002;
    const computed = evaluateIndication(selectedPos.targetLoad, simulatedReading);

    setPositions((prev) =>
      prev.map((p) => (p.id === selectedPositionId ? { ...p, ...computed } : p))
    );

    showToast(
      '✓ Reading Captured',
      `${selectedPos.name} recorded at ${simulatedReading.toFixed(3)} kg (${computed.errorGrams > 0 ? '+' : ''}${computed.errorGrams} g).`
    );
  };

  // Manual entry save (Spec §9)
  const handleSaveManualReading = (positionId: string, observedKg: number) => {
    const computed = evaluateIndication(selectedPos.targetLoad, observedKg);
    setPositions((prev) =>
      prev.map((p) => (p.id === positionId ? { ...p, ...computed } : p))
    );
    showToast(
      '✓ Reading Recorded',
      `${selectedPos.name} updated with ${observedKg.toFixed(3)} kg.`
    );
  };

  // Save audit comment (Spec §27)
  const handleSaveAuditComment = (comment: EccentricityAuditComment) => {
    setAuditComments((prev) => ({
      ...prev,
      [comment.positionId]: comment,
    }));
    showToast('Audit Remark Saved', `Comment recorded for ${selectedPos.name}.`);
  };

  // Demo Scenarios (Spec §20, §32)
  const handleLoadStressCantileverScenario = () => {
    // Spec §20: Cantilever Twist Stress Case
    // Corner 1 = +1.2g, Corner 2 = +0.8g, Corner 3 = +2.1g, Corner 4 = -6.2g (FAIL > 5.0g)
    setGeometry('square');
    const stressPositions: EccentricityPosition[] = [
      { id: 'corner-1', label: 'C1', name: 'Corner 1 (Front-Left)', x: 105, y: 105, targetLoad: 10.0, observedReading: 10.0012, errorGrams: 1.2, mpeGrams, status: 'PASS' },
      { id: 'corner-2', label: 'C2', name: 'Corner 2 (Front-Right)', x: 295, y: 105, targetLoad: 10.0, observedReading: 10.0008, errorGrams: 0.8, mpeGrams, status: 'PASS' },
      { id: 'corner-3', label: 'C3', name: 'Corner 3 (Rear-Right)', x: 295, y: 295, targetLoad: 10.0, observedReading: 10.0021, errorGrams: 2.1, mpeGrams, status: 'PASS' },
      { id: 'corner-4', label: 'corner-4', name: 'Corner 4 (Rear-Left)', x: 105, y: 295, targetLoad: 10.0, observedReading: 9.9938, errorGrams: -6.2, mpeGrams, status: 'FAIL' },
      { id: 'center', label: 'C0', name: 'Center Reference', x: 200, y: 200, targetLoad: 10.0, observedReading: 10.000, errorGrams: 0.0, mpeGrams, status: 'PASS' },
    ];
    setPositions(stressPositions);
    setSelectedPositionId('corner-4');
    onUpdateSession?.({
      ...session,
      complianceStatus: 'FAIL',
      status: 'FAIL',
      notes: 'Corner 4 mechanical deflection error -6.2 g exceeds legal limit ±5.0 g.',
      eccentricity: {
        geometry: 'square',
        points: stressPositions,
        worstPosition: 'Corner 4 (Rear-Left)',
        maxError: -6.2,
        status: 'FAIL',
        overallStatus: 'FAIL',
      },
    });
    showToast('Cantilever Stress Case Loaded', 'Corner 4 exhibits critical cantilever sag (-6.2g > ±5.0g MPE). Advance locked.');
  };

  const handleLoadFullPassScenario = () => {
    setGeometry('square');
    const passingPositions: EccentricityPosition[] = [
      { id: 'corner-1', label: 'C1', name: 'Corner 1 (Front-Left)', x: 105, y: 105, targetLoad: 10.0, observedReading: 10.001, errorGrams: 1.0, mpeGrams, status: 'PASS' },
      { id: 'corner-2', label: 'C2', name: 'Corner 2 (Front-Right)', x: 295, y: 105, targetLoad: 10.0, observedReading: 10.001, errorGrams: 1.0, mpeGrams, status: 'PASS' },
      { id: 'corner-3', label: 'C3', name: 'Corner 3 (Rear-Right)', x: 295, y: 295, targetLoad: 10.0, observedReading: 10.002, errorGrams: 2.0, mpeGrams, status: 'PASS' },
      { id: 'corner-4', label: 'corner-4', name: 'Corner 4 (Rear-Left)', x: 105, y: 295, targetLoad: 10.0, observedReading: 10.001, errorGrams: 1.0, mpeGrams, status: 'PASS' },
      { id: 'center', label: 'C0', name: 'Center Reference', x: 200, y: 200, targetLoad: 10.0, observedReading: 10.000, errorGrams: 0.0, mpeGrams, status: 'PASS' },
    ];
    setPositions(passingPositions);
    setSelectedPositionId('corner-3');
    onUpdateSession?.({
      ...session,
      eccentricity: {
        geometry: 'square',
        points: passingPositions,
        worstPosition: 'Corner 3 (Rear-Right)',
        maxError: 2.0,
        status: 'PASS',
        overallStatus: 'PASS',
      },
    });
    showToast('Compliant Pass Run Loaded', 'All quadrants pass within legal tolerance. Advance unlocked.');
  };

  // Auto-load scenario on mount if matching session scenario
  React.useEffect(() => {
    if (
      session?.scenarioId === 'eccentricity_cantilever_twist' ||
      session?.id?.includes('cantilever') ||
      session?.id?.includes('ecc') ||
      session?.eccentricity?.points?.some((p: any) => p.status === 'FAIL')
    ) {
      handleLoadStressCantileverScenario();
    }
  }, [session?.id, session?.scenarioId]);

  const handleResetPositions = () => {
    setPositions((prev) =>
      prev.map((p) => ({
        ...p,
        observedReading: undefined,
        errorGrams: undefined,
        status: 'PENDING',
      }))
    );
    showToast('Positions Cleared', 'All position observations reset to pending.');
  };

  // Evaluated statistics per spec §16
  const evaluatedPositions = positions.filter((p) => p.status !== 'PENDING' && p.errorGrams !== undefined);
  const worstPos = evaluatedPositions.reduce<EccentricityPosition | null>((worst, cur) => {
    if (!worst) return cur;
    return Math.abs(cur.errorGrams || 0) > Math.abs(worst.errorGrams || 0) ? cur : worst;
  }, null);

  const hasFailures = evaluatedPositions.some((p) => p.status === 'FAIL');
  const isSequenceComplete = evaluatedPositions.length === positions.length;
  const missingPositions = positions.filter((p) => p.status === 'PENDING');

  // Advance to Next Step (Repeatability) per spec §28
  const handleContinue = () => {
    if (hasFailures || !isSequenceComplete) return;

    setIsAdvancing(true);
    setTimeout(() => {
      setIsAdvancing(false);
      setAdvanceCompleted(true);
      setTimeout(() => {
        onContinueToRepeatability({
          ...session,
          eccentricityResults: {
            geometry,
            positions,
            worstPosition: worstPos?.name,
            maxError: worstPos?.errorGrams,
            status: 'PASS',
          },
        });
      }, 700);
    }, 600);
  };

  // Statutory 7-step horizontal rail per spec §2, §31
  const steps = [
    { num: 1, label: 'Preflight', status: 'DONE' },
    { num: 2, label: 'Inspection', status: 'DONE' },
    { num: 3, label: 'Weighing', status: 'DONE' },
    { num: 4, label: 'Eccentricity', status: 'CURRENT' },
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

      {/* 1. Persistent Session Header per spec §2, §31 */}
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
                Step 04 of 07
              </span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foundation-950 font-sans">
                ECCENTRICITY / CORNER LOADING
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono uppercase bg-brand-50 text-brand-700 border border-brand-200 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                <span>IN TEST</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-foundation-500 mt-1">
              Verify the weighing response at defined platform load positions under OIML R 76-1 Clause 3.6.2.
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

        {/* 7-Step Horizontal Stepper per spec §2, §31 */}
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

      {/* Quick Interactive Jury Presets Bar per spec §20, §32 */}
      <div className="bg-slate-900 text-white rounded-xl p-3 sm:px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 shadow-md border border-slate-800">
        <div className="flex items-center gap-2 font-mono text-xs">
          <Zap size={14} className="text-amber-400" />
          <span className="font-bold text-amber-400 uppercase tracking-wider">Jury Demo Scenarios:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleLoadFullPassScenario}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer"
          >
            ✓ Standard 4/4 Pass
          </button>

          <button
            type="button"
            onClick={handleLoadStressCantileverScenario}
            className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-[11px] font-mono border border-rose-800/80 transition-colors cursor-pointer flex items-center gap-1"
          >
            <AlertTriangle size={11} />
            <span>Stress: Cantilever Twist (-6.2g FAIL)</span>
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
            onClick={handleResetPositions}
            className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 text-[11px] font-mono border border-slate-700 transition-colors cursor-pointer flex items-center gap-1"
          >
            <RotateCcw size={11} />
            <span>Reset All</span>
          </button>
        </div>
      </div>

      {/* Traceability Lockout Alert Banner per spec §30 */}
      {isTraceabilityLocked && (
        <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-xs animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <Lock size={20} className="text-rose-700 shrink-0 mt-0.5" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-rose-950 uppercase font-mono tracking-wider">
                  🔒 TESTING LOCKED — Standard Weight Traceability Invalid
                </span>
                <span className="text-[10px] font-mono bg-rose-200 text-rose-900 px-1.5 py-0.2 rounded font-bold">
                  STATUTORY LOCKOUT
                </span>
              </div>
              <p className="text-xs text-rose-800 mt-0.5">
                Position readings cannot be captured until the assigned standard weight set is replaced or renewed.
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

      {/* 2. Platter Geometry Selector per spec §3 */}
      <PlatterGeometrySelector
        geometry={geometry}
        onSelectGeometry={handleSelectGeometry}
      />

      {/* 3. Main Workstation Area: Interactive Platter + Current Position Card per spec §2, §6, §7, §31 */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-7">
          <PlatterVisualizer
            geometry={geometry}
            positions={positions}
            selectedPositionId={selectedPositionId}
            onSelectPosition={(posId) => setSelectedPositionId(posId)}
            mpeGrams={mpeGrams}
          />
        </div>

        <div className="lg:col-span-5">
          <EccentricitySummaryCard
            currentPosition={selectedPos}
            positions={positions}
            onCaptureCurrent={handleCaptureCurrent}
            onOpenManualEntry={(pos) => {
              setManualPosition(pos);
              setIsManualOpen(true);
            }}
            onInspectTrace={(pos) => {
              setTracePosition(pos);
              setIsTraceOpen(true);
            }}
            isScaleStable={isScaleStable}
            liveWeight={liveWeight}
            isTraceabilityLocked={isTraceabilityLocked}
            mpeGrams={mpeGrams}
          />
        </div>
      </div>

      {/* 4. Position Results Table per spec §11 */}
      <PositionResultsTable
        positions={positions}
        selectedPositionId={selectedPositionId}
        onSelectPosition={(id) => setSelectedPositionId(id)}
        onInspectTrace={(pos) => {
          setTracePosition(pos);
          setIsTraceOpen(true);
        }}
        onOpenAudit={(pos) => {
          setAuditPosition(pos);
          setIsAuditOpen(true);
        }}
        onOpenManualEntry={(pos) => {
          setManualPosition(pos);
          setIsManualOpen(true);
        }}
        auditComments={auditComments}
        mpeGrams={mpeGrams}
        isTraceabilityLocked={isTraceabilityLocked}
      />

      {/* 5. Missing Position & Overall Completion Banner per spec §23, §24, §28 */}
      <div
        className={`rounded-xl border p-5 transition-all ${
          hasFailures
            ? 'bg-rose-50/90 border-rose-300 text-rose-950'
            : !isSequenceComplete
            ? 'bg-amber-50/80 border-amber-300 text-amber-950'
            : 'bg-emerald-50/90 border-emerald-300 text-emerald-950'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-start gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 shadow-xs ${
                hasFailures
                  ? 'bg-rose-600 text-white'
                  : !isSequenceComplete
                  ? 'bg-amber-500 text-white'
                  : 'bg-emerald-600 text-white'
              }`}
            >
              {hasFailures ? (
                <XCircle size={22} className="stroke-[2.5]" />
              ) : !isSequenceComplete ? (
                <AlertTriangle size={22} className="stroke-[2.5]" />
              ) : (
                <CheckCircle2 size={22} className="stroke-[2.5]" />
              )}
            </div>

            <div>
              <h3 className="text-base font-bold tracking-tight font-sans">
                {hasFailures
                  ? `✕ ECCENTRICITY TEST FAILED — ${worstPos?.name} Exceeds Tolerance`
                  : !isSequenceComplete
                  ? `⚠ TEST INCOMPLETE — ${missingPositions.length} Positions Awaiting Load`
                  : '✓ ECCENTRICITY TEST COMPLETE — All Positions Verified'}
              </h3>
              <p className="text-xs mt-1 font-mono leading-relaxed">
                {hasFailures
                  ? `Worst position error (${worstPos?.errorGrams! > 0 ? '+' : ''}${worstPos?.errorGrams} g) violates the maximum permissible error limit of ±${mpeGrams.toFixed(1)} g under OIML R 76-1 CL 3.6.2. Advance is blocked.`
                  : !isSequenceComplete
                  ? `${missingPositions.map((p) => p.name).join(', ')} have not been recorded. Record all platform positions to complete evaluation.`
                  : `All ${positions.length} test positions demonstrate uniform balance response within the legal limit (worst observed: ${worstPos?.name} at ${worstPos?.errorGrams! > 0 ? '+' : ''}${worstPos?.errorGrams} g).`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-xs font-bold self-start sm:self-auto">
            {!isSequenceComplete && missingPositions.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedPositionId(missingPositions[0].id)}
                className="px-3 py-1.5 rounded-lg bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold transition-colors cursor-pointer"
              >
                Record {missingPositions[0].name} →
              </button>
            )}
            {hasFailures && worstPos && (
              <button
                type="button"
                onClick={() => {
                  setTracePosition(worstPos);
                  setIsTraceOpen(true);
                }}
                className="px-3 py-1.5 rounded-lg bg-rose-200 hover:bg-rose-300 text-rose-950 font-bold transition-colors cursor-pointer"
              >
                Inspect Failure Proof →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 6. Sticky Bottom Action Footer per spec §2, §28, §31 */}
      <div className="fixed bottom-0 inset-x-0 bg-white/95 backdrop-blur-md border-t border-foundation-200 py-3.5 px-4 sm:px-8 z-30 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Left Progress Indicators per §23 */}
          <div className="flex items-center gap-3 text-xs w-full sm:w-auto font-mono">
            <span className="font-bold text-foundation-800 font-sans">
              Platter Positions:
            </span>
            <span className="text-foundation-600 font-bold">
              {evaluatedPositions.length} / {positions.length} Complete
            </span>
            <div className="w-28 h-2 bg-foundation-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${
                  hasFailures ? 'bg-rose-500' : 'bg-brand-600'
                }`}
                style={{ width: `${(evaluatedPositions.length / positions.length) * 100}%` }}
              />
            </div>
            <span className="text-foundation-300 hidden sm:inline">•</span>
            <span className="text-foundation-500 text-[11px] hidden sm:inline">
              ✓ Autosaved
            </span>
          </div>

          {/* Right Action Buttons per §28 */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
            {onNavigatePrevious && (
              <button
                type="button"
                onClick={onNavigatePrevious}
                className="px-4 py-2 border border-foundation-200 text-foundation-700 hover:bg-foundation-100 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Previous: Weighing</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToDashboard}
              className="px-4 py-2 border border-foundation-200 text-foundation-700 hover:bg-foundation-100 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              Save Draft
            </button>

            {/* Dominant Primary Action CTA */}
            <button
              type="button"
              disabled={hasFailures || !isSequenceComplete || isAdvancing || advanceCompleted}
              onClick={handleContinue}
              title={
                hasFailures
                  ? 'Eccentricity test failed. Cannot advance until corner errors are resolved.'
                  : !isSequenceComplete
                  ? 'Complete all positions before advancing.'
                  : 'Save eccentricity results and advance to Step 05: Repeatability Test.'
              }
              className={`px-6 py-2.5 rounded-lg text-xs sm:text-sm font-bold text-white transition-all flex items-center gap-2 shadow-sm cursor-pointer ${
                advanceCompleted
                  ? 'bg-emerald-600'
                  : isAdvancing
                  ? 'bg-brand-600 opacity-90'
                  : isSequenceComplete && !hasFailures
                  ? 'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 hover:shadow'
                  : 'bg-foundation-300 cursor-not-allowed opacity-60'
              }`}
            >
              {isAdvancing ? (
                <>
                  <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Saving Eccentricity Test...</span>
                </>
              ) : advanceCompleted ? (
                <>
                  <Check size={16} className="stroke-[3]" />
                  <span>Eccentricity Complete ✓ · Opening Repeatability →</span>
                </>
              ) : (
                <>
                  <span>Continue to Repeatability</span>
                  <ArrowRight size={15} className="stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Drawers & Modals */}
      <EccentricityTraceDrawer
        isOpen={isTraceOpen}
        onClose={() => setIsTraceOpen(false)}
        position={tracePosition}
        verificationIntervalKg={verificationIntervalKg}
      />

      <EccentricityAuditModal
        isOpen={isAuditOpen}
        onClose={() => setIsAuditOpen(false)}
        position={auditPosition}
        currentComment={auditPosition ? auditComments[auditPosition.id] : null}
        onSaveComment={handleSaveAuditComment}
        userRole={userRole}
      />

      <EccentricityManualEntryModal
        isOpen={isManualOpen}
        onClose={() => setIsManualOpen(false)}
        position={manualPosition}
        onSaveReading={handleSaveManualReading}
      />
    </div>
  );
};
