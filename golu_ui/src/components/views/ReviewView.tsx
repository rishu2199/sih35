import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Check,
  Lock,
  UserCheck,
  FileCheck2,
  SlidersHorizontal,
  ExternalLink,
  Sparkles,
  Award,
  QrCode,
  FileText,
} from 'lucide-react';
import { ReviewSessionCase, ReviewFinding, ReviewTestItem, CertificateInfo } from '../review/types';
import { INITIAL_REVIEW_CASES } from '../review/mockReviewData';
import { ReviewQueuePanel } from '../review/ReviewQueuePanel';
import { VerificationSummaryCard } from '../review/VerificationSummaryCard';
import { TestResultsBreakdownCard } from '../review/TestResultsBreakdownCard';
import { ReviewFindingsCard } from '../review/ReviewFindingsCard';
import { ReviewFindingsDrawer } from '../review/ReviewFindingsDrawer';
import { ObservationEvidenceDrawer } from '../review/ObservationEvidenceDrawer';
import { AuditPreviewTimeline } from '../review/AuditPreviewTimeline';
import { RemandModal } from '../review/RemandModal';
import { ApproveForwardModal } from '../review/ApproveForwardModal';
import { DirectorSignModal } from '../review/DirectorSignModal';
import { GreenGuillocheSeal } from '../review/GreenGuillocheSeal';
import { CertificateModal } from '../review/CertificateModal';

interface ReviewViewProps {
  session?: any;
  userRole?: string;
  onBackToDashboard: () => void;
  onApprove?: (sessionId: string) => void;
  onRemand?: (sessionId: string) => void;
  onNavigateToTest?: (targetView: string) => void;
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  session,
  userRole = 'Reviewer',
  onBackToDashboard,
  onApprove,
  onRemand,
  onNavigateToTest,
}) => {
  // All review cases in memory
  const [cases, setCases] = useState<ReviewSessionCase[]>(() => {
    // If incoming session is Avery ZM201, ensure VR-2026-00418 case is top of list
    const incomingId = session?.id || session?.sessionNumber || 'VR-2026-00418';
    return INITIAL_REVIEW_CASES.map((c) => {
      if (c.serialNumber === 'AV-2026-8812' || c.model.includes('ZM201')) {
        return {
          ...c,
          id: incomingId,
          sessionNumber: incomingId,
        };
      }
      return c;
    });
  });

  // Active selected case in workstation
  const [selectedCaseId, setSelectedCaseId] = useState<string>(
    session?.id || session?.sessionNumber || 'VR-2026-00418'
  );

  // Role simulation toggle for hackathon demonstration (§23)
  const [activeRole, setActiveRole] = useState<'Reviewer' | 'Director' | 'Metrologist'>(
    userRole === 'Director' ? 'Director' : userRole === 'Metrologist' ? 'Metrologist' : 'Reviewer'
  );

  // Modals and Drawers state
  const [isFindingsDrawerOpen, setIsFindingsDrawerOpen] = useState(false);
  const [selectedObservingTest, setSelectedObservingTest] = useState<ReviewTestItem | null>(null);
  const [isObservationDrawerOpen, setIsObservationDrawerOpen] = useState(false);
  const [isRemandModalOpen, setIsRemandModalOpen] = useState(false);
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  const [isDirectorSignModalOpen, setIsDirectorSignModalOpen] = useState(false);
  const [isCertificateModalOpen, setIsCertificateModalOpen] = useState(false);

  // Notification toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Find currently selected case
  const currentCase = cases.find((c) => c.id === selectedCaseId) || cases[0];

  // Sync if incoming session prop changes
  useEffect(() => {
    if (session?.id) {
      const exists = cases.some((c) => c.id === session.id);
      if (exists) {
        setSelectedCaseId(session.id);
      }
    }
  }, [session, cases]);

  // Handlers
  const handleSelectCase = (c: ReviewSessionCase) => {
    setSelectedCaseId(c.id);
  };

  const handleToggleResolveFinding = (findingId: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== currentCase.id) return c;
        return {
          ...c,
          findings: c.findings.map((f) =>
            f.id === findingId ? { ...f, resolved: !f.resolved } : f
          ),
        };
      })
    );
  };

  const handleAddFinding = (newFinding: Omit<ReviewFinding, 'id' | 'timestamp' | 'resolved'>) => {
    const findingObj: ReviewFinding = {
      ...newFinding,
      id: `finding-${Date.now()}`,
      timestamp: 'Just now',
      resolved: false,
    };

    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== currentCase.id) return c;
        return {
          ...c,
          findings: [findingObj, ...c.findings],
          auditTrail: [
            {
              id: `audit-${Date.now()}`,
              time: 'Just now',
              iconType: 'flag',
              action: `Reviewer added comment: ${newFinding.title}`,
              actor: activeRole === 'Director' ? 'Dr. S. Sharma (Director)' : 'R. Kumar (Technical Reviewer)',
            },
            ...c.auditTrail,
          ],
        };
      })
    );
    showToast('Observation finding logged to audit trail');
  };

  const handleConfirmRemand = (reason: string) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== currentCase.id) return c;
        return {
          ...c,
          status: 'REMANDED',
          overallVerdict: 'FAIL',
          remandReason: reason,
          remandedBy: activeRole === 'Director' ? 'Dr. S. Sharma • Director' : 'R. Kumar • Technical Reviewer',
          remandDate: '04 Oct 2026 • Just now',
          auditTrail: [
            {
              id: `audit-${Date.now()}`,
              time: 'Just now',
              iconType: 'remand',
              action: `Case remanded: "${reason.slice(0, 40)}..."`,
              actor: activeRole === 'Director' ? 'Dr. S. Sharma (Director)' : 'R. Kumar (Technical Reviewer)',
            },
            ...c.auditTrail,
          ],
        };
      })
    );
    onRemand?.(currentCase.id);
    showToast(`Session ${currentCase.sessionNumber} remanded with statutory justification`);
  };

  const handleConfirmApproveAndForward = () => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== currentCase.id) return c;
        return {
          ...c,
          status: 'PENDING_DIRECTOR',
          auditTrail: [
            {
              id: `audit-${Date.now()}`,
              time: 'Just now',
              iconType: 'forward',
              action: 'Approved by Technical Reviewer & forwarded to Director',
              actor: 'R. Kumar (Technical Reviewer)',
            },
            ...c.auditTrail,
          ],
        };
      })
    );
    onApprove?.(currentCase.id);
    showToast(`Case ${currentCase.sessionNumber} forwarded to Director for sign-off`);
  };

  const handleDirectorSignSuccess = (certInfo: CertificateInfo) => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id !== currentCase.id) return c;
        return {
          ...c,
          status: 'APPROVED',
          certificate: certInfo,
          auditTrail: [
            {
              id: `audit-${Date.now()}`,
              time: '18:42 IST',
              iconType: 'sign',
              action: 'Statutory Certificate digitally signed & sealed by Director',
              actor: 'Dr. S. Sharma (Laboratory Director)',
            },
            ...c.auditTrail,
          ],
        };
      })
    );
    onApprove?.(currentCase.id);
    showToast(`Certificate ${certInfo.id} Approved & Green Sealed!`);
  };

  // Inspect test row -> Opens ObservationEvidenceDrawer per §8 & §10
  const handleInspectTest = (test: ReviewTestItem) => {
    setSelectedObservingTest(test);
    setIsObservationDrawerOpen(true);
  };

  // Demo Sandbox State Switcher (§27)
  const handleSetStatePendingReview = () => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === currentCase.id) {
          return {
            ...c,
            status: 'PENDING_REVIEW' as const,
            overallVerdict: 'PASS' as const,
            certificate: undefined,
            remandReason: undefined,
          };
        }
        return c;
      })
    );
    setActiveRole('Reviewer');
    showToast('Simulation: State A — Pending Review (8/8 tests pass, ready for reviewer)');
  };

  const handleSetStateRemanded = () => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === currentCase.id) {
          return {
            ...c,
            status: 'REMANDED' as const,
            overallVerdict: 'FAIL' as const,
            remandReason: 'Corner C eccentricity deviation (+42 g) exceeds maximum permissible error limit (±25 g). Platter load cell mechanical mounting requires inspection and levelling realignment.',
            remandedBy: 'R. Kumar • Technical Reviewer',
            remandDate: '04 Oct 2026 • 15:30 IST',
            certificate: undefined,
          };
        }
        return c;
      })
    );
    showToast('Simulation: State B — Remanded (Statutory exception logged)');
  };

  const handleSetStateReadyDirector = () => {
    setCases((prev) =>
      prev.map((c) => {
        if (c.id === currentCase.id) {
          return {
            ...c,
            status: 'PENDING_DIRECTOR' as const,
            overallVerdict: 'PASS' as const,
            certificate: undefined,
          };
        }
        return c;
      })
    );
    setActiveRole('Director');
    showToast('Simulation: State C — Ready for Director (Awaiting 4-Digit PIN Signature)');
  };

  const handleSetStateSigned = () => {
    const cert: CertificateInfo = {
      id: 'CERT-2026-000184',
      signedBy: 'Dr. S. Sharma',
      signedRole: 'Laboratory Director, Central LM Laboratory',
      signTimestamp: '04 Oct 2026 • 18:42 IST',
      sha256Digest: '7d91c0e1b3a891e47b01dc1f0e27ba61e9b6238f9024cf4f87ab2e105e19db621',
      verificationUrl: 'https://metrologix.gov.in/verify/CERT-2026-000184',
      qrPayload: `METROLOGIX-76|CERT-2026-000184|${currentCase.manufacturer}|${currentCase.serialNumber}|PASS|2026-10-04T18:42:00IST`,
      directorPinUsed: '7620',
    };
    handleDirectorSignSuccess(cert);
    showToast('Simulation: State D — Signed & Sealed (Official Green Guilloche Rosette)');
  };

  const isApproved = currentCase.status === 'APPROVED';
  const isRemanded = currentCase.status === 'REMANDED';
  const isPendingDirector = currentCase.status === 'PENDING_DIRECTOR';
  const isPendingReview = currentCase.status === 'PENDING_REVIEW';
  const hasBlocker = currentCase.overallVerdict === 'FAIL' || currentCase.findings.some((f) => f.severity === 'BLOCKER');

  return (
    <div className="space-y-6 pb-28 relative font-mono select-none">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-foundation-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-foundation-700 text-xs font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-200">
          <CheckCircle2 size={16} className="text-emerald-400 shrink-0" />
          <span className="font-sans">{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header (§3) */}
      <div className="bg-white rounded-xl border border-foundation-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-100 text-foundation-600 transition-colors shadow-xs cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                Statutory Review
              </span>
              <span className="text-foundation-300">•</span>
              <span className="text-xs text-foundation-500 font-sans">
                {cases.filter((c) => c.status === 'PENDING_REVIEW' || c.status === 'PENDING_DIRECTOR').length} sessions awaiting review
              </span>
            </div>
            <h1 className="text-lg sm:text-xl font-black text-foundation-950 tracking-tight font-sans">
              Statutory Review & Director Sign-Off
            </h1>
            <p className="text-xs text-foundation-500 font-sans mt-0.5">
              Review verification evidence before certification under OIML R 76-1 & WELMEC 7.2.
            </p>
          </div>
        </div>

        {/* Role Switcher (§23) */}
        <div className="flex items-center gap-1.5 bg-foundation-100 p-1.5 rounded-xl border border-foundation-200 shadow-2xs self-start md:self-auto text-xs">
          <span className="text-[10px] text-foundation-500 font-bold px-1.5 uppercase font-sans">
            Authority:
          </span>
          <button
            onClick={() => setActiveRole('Reviewer')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeRole === 'Reviewer'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-foundation-600 hover:text-foundation-900 hover:bg-foundation-200/60'
            }`}
          >
            Reviewer
          </button>
          <button
            onClick={() => setActiveRole('Director')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeRole === 'Director'
                ? 'bg-purple-700 text-white shadow-xs'
                : 'text-foundation-600 hover:text-foundation-900 hover:bg-foundation-200/60'
            }`}
          >
            Director
          </button>
          <button
            onClick={() => setActiveRole('Metrologist')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              activeRole === 'Metrologist'
                ? 'bg-foundation-800 text-white shadow-xs'
                : 'text-foundation-600 hover:text-foundation-900 hover:bg-foundation-200/60'
            }`}
          >
            Metrologist
          </button>
        </div>
      </div>

      {/* 2. Two-Panel Case-Review Workstation (§2) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Review Queue Panel (35% / 4 cols) */}
        <div className="lg:col-span-4 h-[820px]">
          <ReviewQueuePanel
            cases={cases}
            selectedCaseId={currentCase.id}
            onSelectCase={handleSelectCase}
          />
        </div>

        {/* Right Side: Verification Review Dossier (65% / 8 cols) */}
        <div className="lg:col-span-8 space-y-5">
          {/* Selected Case Header Card (§6) */}
          <div className="bg-white border border-foundation-200 rounded-2xl p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-foundation-100">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-black text-foundation-950 bg-foundation-100 px-2.5 py-0.5 rounded-lg border border-foundation-200">
                    {currentCase.sessionNumber}
                  </span>
                  <span className="text-foundation-300">•</span>
                  <span className="text-xs font-bold text-foundation-600 uppercase tracking-wider">
                    {currentCase.verificationStage}
                  </span>
                </div>
                <h2 className="text-lg font-black text-foundation-950 mt-1 tracking-tight font-sans">
                  {currentCase.manufacturer} {currentCase.model}
                </h2>
                {/* Compact Metrological Bar (§6) */}
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-foundation-700 mt-1">
                  <span className="font-bold text-foundation-900">{currentCase.serialNumber}</span>
                  <span>•</span>
                  <span className="bg-foundation-100 px-1.5 py-0.5 rounded font-bold text-foundation-800">
                    {currentCase.accuracyClass}
                  </span>
                  <span>•</span>
                  <span>Max: <strong>{currentCase.maxCapacity}</strong></span>
                  <span>•</span>
                  <span>{currentCase.interval}</span>
                </div>
              </div>

              {/* Status Pill in Header */}
              <div>
                {isApproved ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 shadow-2xs">
                    <CheckCircle2 size={16} className="text-emerald-700" />
                    <span className="font-mono text-xs font-black">APPROVED & SEALED</span>
                  </div>
                ) : isRemanded ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-rose-100 text-rose-900 border border-rose-300 shadow-2xs">
                    <RotateCcw size={16} className="text-rose-700" />
                    <span className="font-mono text-xs font-black">REMANDED FOR RE-TEST</span>
                  </div>
                ) : isPendingDirector ? (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-100 text-purple-900 border border-purple-300 shadow-2xs">
                    <ShieldCheck size={16} className="text-purple-700" />
                    <span className="font-mono text-xs font-black">AWAITING DIRECTOR SIGN</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-blue-100 text-blue-900 border border-blue-300 shadow-2xs">
                    <FileCheck2 size={16} className="text-blue-700" />
                    <span className="font-mono text-xs font-black">● PENDING REVIEW</span>
                  </div>
                )}
              </div>
            </div>

            {/* Traceability Reference Line (§6) */}
            <div className="flex flex-wrap items-center justify-between text-xs font-mono text-foundation-600 pt-1">
              <div className="flex items-center gap-2">
                <span>Standard weights:</span>
                <strong className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  E2-014 (Class E2) ✓ Valid
                </strong>
                <span>(Expires in 42 days)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>Evidence Package:</span>
                <strong className="text-foundation-900">Complete (8/8 Verified)</strong>
              </div>
            </div>
          </div>

          {/* Remanded Notice Banner (if remanded §12) */}
          {isRemanded && (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 text-xs space-y-1.5 shadow-2xs">
              <div className="flex items-center gap-2 font-bold text-rose-800">
                <AlertTriangle size={16} className="text-rose-600" />
                <span>⚠ SESSION REMANDED TO TESTING OFFICER</span>
              </div>
              <p className="font-sans leading-relaxed text-rose-900">
                <strong>Statutory Justification:</strong> {currentCase.remandReason}
              </p>
              <div className="font-mono text-[11px] text-rose-700 pt-1 flex items-center justify-between border-t border-rose-200/60">
                <span>Remanded by: {currentCase.remandedBy}</span>
                <span>Date: {currentCase.remandDate}</span>
              </div>
            </div>
          )}

          {/* If Approved: Official Green Guilloche Seal & QR Verification (§18, §19, §20) */}
          {isApproved && currentCase.certificate ? (
            <GreenGuillocheSeal
              certificate={currentCase.certificate}
              instrumentModel={`${currentCase.manufacturer} ${currentCase.model}`}
              serialNumber={currentCase.serialNumber}
              onViewCertificateModal={() => setIsCertificateModalOpen(true)}
              onDownloadPdf={() => showToast('Generating official PDF/A certificate...')}
              onDownloadWord={() => showToast('Exporting DOCX metrological report...')}
            />
          ) : null}

          {/* Verification Summary Card (§7 Decision Banner + Audit Triad) */}
          <VerificationSummaryCard
            caseItem={currentCase}
            onViewFlagged={() => setIsFindingsDrawerOpen(true)}
          />

          {/* Main Test Results Table (§8, §9) with clickable row inspection */}
          <TestResultsBreakdownCard
            tests={currentCase.tests}
            onOpenTest={handleInspectTest}
          />

          {/* Review Comments / Findings Card (§10) */}
          <ReviewFindingsCard
            findings={currentCase.findings}
            onOpenFindingsDrawer={() => setIsFindingsDrawerOpen(true)}
          />

          {/* Cryptographic Audit Preview Timeline */}
          <AuditPreviewTimeline entries={currentCase.auditTrail} />
        </div>
      </div>

      {/* 3. Demo Presets State Switcher Bar (§27) */}
      <div className="p-4 rounded-xl border border-foundation-200 bg-white/80 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-brand-600 shrink-0" />
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foundation-900 font-sans">
                Review Workflow Demo Scenarios (§27):
              </span>
              <span className="text-[10px] bg-brand-100 text-brand-700 font-bold px-1.5 py-0.5 rounded">
                DEMO SANDBOX
              </span>
            </div>
            <p className="text-[11px] text-foundation-500 font-sans mt-0.5">
              Toggle between the 4 major statutory states to demonstrate full lifecycle to judges.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={handleSetStatePendingReview}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              isPendingReview
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            State A: Pending Review
          </button>

          <button
            type="button"
            onClick={handleSetStateRemanded}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              isRemanded
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            State B: Remanded
          </button>

          <button
            type="button"
            onClick={handleSetStateReadyDirector}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              isPendingDirector
                ? 'bg-purple-700 text-white'
                : 'bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100'
            }`}
          >
            State C: Ready for Director
          </button>

          <button
            type="button"
            onClick={handleSetStateSigned}
            className={`px-2.5 py-1 rounded-md font-semibold transition-colors cursor-pointer ${
              isApproved
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            State D: Signed & Sealed
          </button>
        </div>
      </div>

      {/* 4. Sticky Bottom Decision Bar (§11, §13, §14, §21, §22) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-foundation-200 px-6 py-3.5 shadow-lg">
        <div className="max-w-[1400px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4 font-mono">
          <div className="flex items-center gap-3">
            <span className="font-bold text-foundation-950 font-sans text-xs">
              Case {currentCase.sessionNumber}
            </span>
            <span className="text-foundation-300">|</span>
            <span className="text-xs text-foundation-600 font-sans">
              Role: <strong className="text-foundation-900">{activeRole}</strong>
            </span>
            <span className="text-foundation-300">|</span>
            <span className="text-xs text-foundation-500">
              {currentCase.completedSteps} / {currentCase.totalSteps} stages evaluated
            </span>
          </div>

          {/* Role-based Decision Buttons (§11, §14, §21) */}
          <div className="flex items-center gap-3">
            {isApproved ? (
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                  <Lock size={13} className="text-emerald-600" />
                  <span>🔒 APPROVED — IMMUTABLE RECORD</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsCertificateModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <FileCheck2 size={15} />
                  <span>View Official Certificate</span>
                </button>
              </div>
            ) : isRemanded ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-rose-700 font-bold font-mono">
                  Remanded to Testing Officer
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (onNavigateToTest) onNavigateToTest('eccentricity_workspace');
                  }}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={15} />
                  <span>Resume Testing & Correction →</span>
                </button>
              </div>
            ) : activeRole === 'Director' || isPendingDirector ? (
              /* Director Decision Workflow (§14) */
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRemandModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Remand to Metrologist</span>
                </button>

                <button
                  type="button"
                  disabled={hasBlocker}
                  onClick={() => setIsDirectorSignModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-purple-700 hover:bg-purple-800 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  <ShieldCheck size={16} />
                  <span>Sign & Stamp Certificate (PIN)</span>
                </button>
              </div>
            ) : activeRole === 'Reviewer' ? (
              /* Technical Reviewer Decision Workflow (§11) */
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsRemandModalOpen(true)}
                  className="px-4 py-2 rounded-xl border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw size={14} />
                  <span>Remand Session</span>
                </button>

                <button
                  type="button"
                  disabled={hasBlocker}
                  onClick={() => setIsApproveModalOpen(true)}
                  className="px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold shadow-sm hover:shadow transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check size={16} />
                  <span>Approve & Forward to Director →</span>
                </button>
              </div>
            ) : (
              /* Metrologist Mode (Testing Officer) */
              <div className="flex items-center gap-3">
                <span className="text-xs text-foundation-500 font-mono">
                  Testing Officer view · Observations locked during review
                </span>
                <button
                  type="button"
                  onClick={() => showToast('Access Denied: Only a Lab Director is authorized to digitally sign.')}
                  className="px-4 py-2 rounded-xl bg-foundation-100 hover:bg-rose-50 hover:text-rose-700 text-foundation-600 text-xs font-bold border border-foundation-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="Only a Lab Director is authorized to digitally sign"
                >
                  <Lock size={13} className="text-foundation-500" />
                  <span>Director Sign (Locked)</span>
                </button>
                <span className="px-3 py-1.5 rounded-xl bg-foundation-200 text-foundation-700 text-xs font-bold font-mono">
                  Submitted for Review
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Modals and Drawers */}
      <ReviewFindingsDrawer
        isOpen={isFindingsDrawerOpen}
        onClose={() => setIsFindingsDrawerOpen(false)}
        findings={currentCase.findings}
        onToggleResolve={handleToggleResolveFinding}
        onAddComment={handleAddFinding}
      />

      {/* Row-Level Observation Evidence Drawer (§8, §10) */}
      <ObservationEvidenceDrawer
        isOpen={isObservationDrawerOpen}
        onClose={() => setIsObservationDrawerOpen(false)}
        test={selectedObservingTest}
        onAddComment={handleAddFinding}
      />

      <RemandModal
        isOpen={isRemandModalOpen}
        onClose={() => setIsRemandModalOpen(false)}
        sessionNumber={currentCase.sessionNumber}
        onConfirmRemand={handleConfirmRemand}
      />

      <ApproveForwardModal
        isOpen={isApproveModalOpen}
        onClose={() => setIsApproveModalOpen(false)}
        caseItem={currentCase}
        onConfirmApprove={handleConfirmApproveAndForward}
      />

      <DirectorSignModal
        isOpen={isDirectorSignModalOpen}
        onClose={() => setIsDirectorSignModalOpen(false)}
        caseItem={currentCase}
        onSignSuccess={handleDirectorSignSuccess}
      />

      {currentCase.certificate && (
        <CertificateModal
          isOpen={isCertificateModalOpen}
          onClose={() => setIsCertificateModalOpen(false)}
          caseItem={currentCase}
          certificate={currentCase.certificate}
        />
      )}
    </div>
  );
};
