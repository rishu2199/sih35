import React, { useState } from 'react';
import {
  Lock,
  Clock,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  FileCheck2,
  UserCheck,
  Sparkles,
  AlertTriangle,
  Scale,
  Crosshair,
  MessageSquare,
  Flag,
  Download,
  FileText,
  RefreshCw,
} from 'lucide-react';
import { useLab } from '../../context/LabContext';
import { Button } from '../../components/ui/Button';
import { ReviewerQueue } from './ReviewerQueue';
import { RowLevelCommentDrawer } from './RowLevelCommentDrawer';
import { DirectorSignModal } from './DirectorSignModal';
import { GreenStampedSeal } from './GreenStampedSeal';
import { downloadReport } from '../reports/downloadService';
import type {
  ReviewSession,
  ObservationRow,
  RowAuditComment,
  UserRole,
  AuditCommentSeverity,
} from '../../types';

// Mock initial data demonstrating the 4 statutory lifecycle states
const MOCK_SESSIONS: ReviewSession[] = [
  {
    id: 'sess-rrsl-blr-2026-001',
    sessionNumber: 'RRSL-BLR-2026-001',
    instrumentModel: 'Precision-Pro 30K',
    manufacturer: 'Essae-Teraoka Pvt Ltd',
    serialNumber: 'ET-2026-9041',
    accuracyClass: 'CLASS_III',
    maxCapacity: 30000,
    e: 5,
    d: 5,
    unit: 'GRAM',
    stage: 'INITIAL_TYPE_APPROVAL',
    status: 'PENDING_REVIEW',
    complianceStatus: 'PASS',
    operatorName: 'Dr. Anand Raman',
    operatorEmail: 'anand.raman@rrsl.gov.in',
    reviewerName: 'Smt. Preeti Deshmukh',
    reviewerEmail: 'preeti.deshmukh@rrsl.gov.in',
    directorName: 'Dr. Rajeshwar Sharma',
    directorEmail: 'director.blr@rrsl.gov.in',
    isLocked: false,
    commentsCount: 1,
    flaggedRowCount: 1,
    createdAt: '2026-09-24T10:00:00Z',
    submittedAt: '2026-09-25T14:30:00Z',
    signatureDigest: '7c89f1d03b715694c92b23ae1c2f9d854e7a3b8210459c01823901bcefa78129',
    weighingObservations: [
      {
        id: 'obs-1',
        step: 1,
        direction: 'ASCENDING',
        targetLoad: 0,
        indication: 0.0,
        auxiliaryLoad: 2.5,
        trueIndication: 0.0,
        uncorrectedError: 0.0,
        zeroError: 0.0,
        correctedError: 0.0,
        mpeLimit: 2.5,
        mpeInE: '±0.5 e',
        margin: 2.5,
        status: 'PASS',
        isZeroPoint: true,
      },
      {
        id: 'obs-2',
        step: 2,
        direction: 'ASCENDING',
        targetLoad: 100,
        indication: 100.0,
        auxiliaryLoad: 2.6,
        trueIndication: 99.9,
        uncorrectedError: -0.1,
        zeroError: 0.0,
        correctedError: -0.1,
        mpeLimit: 2.5,
        mpeInE: '±0.5 e',
        margin: 2.4,
        status: 'PASS',
        isZeroPoint: false,
      },
      {
        id: 'obs-3',
        step: 3,
        direction: 'ASCENDING',
        targetLoad: 2500,
        indication: 2500.0,
        auxiliaryLoad: 2.7,
        trueIndication: 2499.8,
        uncorrectedError: -0.2,
        zeroError: 0.0,
        correctedError: -0.2,
        mpeLimit: 2.5,
        mpeInE: '±0.5 e',
        margin: 2.3,
        status: 'PASS',
        isZeroPoint: false,
      },
      {
        id: 'obs-4',
        step: 4,
        direction: 'ASCENDING',
        targetLoad: 10000,
        indication: 10000.0,
        auxiliaryLoad: 3.2,
        trueIndication: 9999.3,
        uncorrectedError: -0.7,
        zeroError: 0.0,
        correctedError: -0.7,
        mpeLimit: 5.0,
        mpeInE: '±1.0 e',
        margin: 4.3,
        status: 'PASS',
        isZeroPoint: false,
      },
      {
        id: 'obs-5',
        step: 5,
        direction: 'ASCENDING',
        targetLoad: 20000,
        indication: 20000.0,
        auxiliaryLoad: 3.8,
        trueIndication: 19998.7,
        uncorrectedError: -1.3,
        zeroError: 0.0,
        correctedError: -1.3,
        mpeLimit: 5.0,
        mpeInE: '±1.0 e',
        margin: 3.7,
        status: 'PASS',
        isZeroPoint: false,
      },
      {
        id: 'obs-6',
        step: 6,
        direction: 'ASCENDING',
        targetLoad: 30000,
        indication: 30000.0,
        auxiliaryLoad: 2.4,
        trueIndication: 30000.1,
        uncorrectedError: 0.1,
        zeroError: 0.0,
        correctedError: 0.1,
        mpeLimit: 7.5,
        mpeInE: '±1.5 e',
        margin: 7.4,
        status: 'PASS',
        isZeroPoint: false,
      },
    ],
    eccentricityObservations: [
      {
        position: 'CENTER',
        positionNumber: 1,
        label: 'Center (Pos 1)',
        targetLoad: 10000,
        indication: 10000.0,
        auxiliaryLoad: 2.5,
        trueIndication: 10000.0,
        uncorrectedError: 0.0,
        zeroError: 0.0,
        correctedError: 0.0,
        mpeLimit: 5.0,
        mpeInE: '±1.0 e',
        margin: 5.0,
        status: 'PASS',
      },
      {
        position: 'FRONT_LEFT',
        positionNumber: 2,
        label: 'Front Left (Pos 2)',
        targetLoad: 10000,
        indication: 10000.0,
        auxiliaryLoad: 2.9,
        trueIndication: 9999.6,
        uncorrectedError: -0.4,
        zeroError: 0.0,
        correctedError: -0.4,
        mpeLimit: 5.0,
        mpeInE: '±1.0 e',
        margin: 4.6,
        status: 'PASS',
      },
      {
        position: 'BACK_LEFT',
        positionNumber: 3,
        label: 'Back Left (Pos 3)',
        targetLoad: 10000,
        indication: 10000.0,
        auxiliaryLoad: 2.2,
        trueIndication: 10000.3,
        uncorrectedError: 0.3,
        zeroError: 0.0,
        correctedError: 0.3,
        mpeLimit: 5.0,
        mpeInE: '±1.0 e',
        margin: 4.7,
        status: 'PASS',
      },
    ],
  },
  {
    id: 'sess-rrsl-blr-2026-002',
    sessionNumber: 'RRSL-BLR-2026-002',
    instrumentModel: 'Avery Weigh-Tronix WB-50',
    manufacturer: 'Avery India Limited',
    serialNumber: 'WB-2026-4412',
    accuracyClass: 'CLASS_III',
    maxCapacity: 50000,
    e: 10,
    d: 10,
    unit: 'KILOGRAM',
    stage: 'INITIAL_TYPE_APPROVAL',
    status: 'APPROVED',
    complianceStatus: 'PASS',
    operatorName: 'Dr. Anand Raman',
    operatorEmail: 'anand.raman@rrsl.gov.in',
    reviewerName: 'Smt. Preeti Deshmukh',
    reviewerEmail: 'preeti.deshmukh@rrsl.gov.in',
    directorName: 'Dr. Rajeshwar Sharma',
    directorEmail: 'director.blr@rrsl.gov.in',
    isLocked: true,
    signedAt: '2026-09-25T16:45:00Z',
    signatureDigest: '3a882910f4be92a3487c6b9148d21054ef71295b9c0284710294817a02bce941',
    signatureBase64: 'MEYCIQC49210F4BE92A3487C6B9148D21054EF71295B9C0284710294817A02BCE941...',
    verificationUrl: 'https://emaap.doca.gov.in/verify/sess-rrsl-blr-2026-002?sig=3a882910f4be92a3487c6b9148d21054',
    commentsCount: 0,
    flaggedRowCount: 0,
    createdAt: '2026-09-23T09:00:00Z',
    submittedAt: '2026-09-24T11:00:00Z',
    reviewedAt: '2026-09-25T15:00:00Z',
    weighingObservations: [],
    eccentricityObservations: [],
  },
  {
    id: 'sess-rrsl-blr-2026-003',
    sessionNumber: 'RRSL-BLR-2026-003',
    instrumentModel: 'Citizen Scale CX-600',
    manufacturer: 'Citizen Scales India Ltd',
    serialNumber: 'CZ-2026-1188',
    accuracyClass: 'CLASS_II',
    maxCapacity: 600,
    e: 0.01,
    d: 0.001,
    unit: 'GRAM',
    stage: 'INITIAL_TYPE_APPROVAL',
    status: 'REMANDED',
    complianceStatus: 'MARGINAL',
    operatorName: 'Dr. Anand Raman',
    operatorEmail: 'anand.raman@rrsl.gov.in',
    reviewerName: 'Smt. Preeti Deshmukh',
    reviewerEmail: 'preeti.deshmukh@rrsl.gov.in',
    isLocked: false,
    commentsCount: 2,
    flaggedRowCount: 2,
    createdAt: '2026-09-24T12:00:00Z',
    submittedAt: '2026-09-25T09:15:00Z',
    remandReason:
      'Repeatability margin too low (< 0.2e) at 300g test load. Changeover auxiliary weights require recalibration against Class E2 standard set.',
    weighingObservations: [],
    eccentricityObservations: [],
  },
  {
    id: 'sess-rrsl-blr-2026-004',
    sessionNumber: 'RRSL-BLR-2026-004',
    instrumentModel: 'Phoenix High Precision 150',
    manufacturer: 'Phoenix Weighing Systems',
    serialNumber: 'PH-2026-0091',
    accuracyClass: 'CLASS_I',
    maxCapacity: 150,
    e: 0.001,
    d: 0.0001,
    unit: 'GRAM',
    stage: 'INITIAL_TYPE_APPROVAL',
    status: 'IN_TESTING',
    complianceStatus: 'PENDING',
    operatorName: 'Dr. Anand Raman',
    operatorEmail: 'anand.raman@rrsl.gov.in',
    isLocked: false,
    commentsCount: 0,
    flaggedRowCount: 0,
    createdAt: '2026-09-25T15:00:00Z',
    weighingObservations: [],
    eccentricityObservations: [],
  },
];

const INITIAL_COMMENTS: RowAuditComment[] = [
  {
    id: 'comm-1',
    sessionId: 'sess-rrsl-blr-2026-001',
    stepIndex: 5,
    testType: 'WEIGHING',
    targetLoad: 20000,
    unit: 'g',
    authorName: 'Smt. Preeti Deshmukh',
    authorRole: 'REVIEWER',
    authorEmail: 'preeti.deshmukh@rrsl.gov.in',
    comment:
      'Repeatability margin too low (< 0.2e); re-test recommended. Step 5 error of -1.3g consumes 26% of allowable MPE.',
    severity: 'FLAG',
    timestamp: '2026-09-25T14:45:00Z',
    resolved: false,
  },
];

export const ReviewPipeline: React.FC = () => {
  const { currentUser, setUserRole, activeLab } = useLab();
  const [sessions, setSessions] = useState<ReviewSession[]>(MOCK_SESSIONS);
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [comments, setComments] = useState<RowAuditComment[]>(INITIAL_COMMENTS);
  const [activeTab, setActiveTab] = useState<'weighing' | 'eccentricity' | 'anomalies' | 'comments'>('weighing');

  // Drawer & Modal States
  const [isCommentDrawerOpen, setIsCommentDrawerOpen] = useState(false);
  const [selectedObservationRow, setSelectedObservationRow] = useState<ObservationRow | null>(null);
  const [isSignModalOpen, setIsSignModalOpen] = useState(false);
  const [downloadingType, setDownloadingType] = useState<'pdf' | 'docx' | null>(null);

  const selectedSession = sessions.find((s) => s.id === selectedSessionId) || null;

  const handleDownloadReport = async (type: 'pdf' | 'docx') => {
    if (!selectedSession) return;
    setDownloadingType(type);
    await downloadReport({
      type,
      sessionId: selectedSession.id,
      sessionNumber: selectedSession.sessionNumber,
      language: 'en',
    });
    setDownloadingType(null);
  };

  // Role Action Handlers
  const handleSubmitForReview = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'PENDING_REVIEW',
              submittedAt: new Date().toISOString(),
            }
          : s
      )
    );
  };

  const handleRemandSession = (sessionId: string, reason: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              status: 'REMANDED',
              remandReason: reason,
              reviewerName: currentUser.fullName,
              reviewerEmail: currentUser.email,
            }
          : s
      )
    );
  };

  const handleRecommendApproval = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId
          ? {
              ...s,
              reviewedAt: new Date().toISOString(),
              reviewerName: currentUser.fullName,
              reviewerEmail: currentUser.email,
            }
          : s
      )
    );
  };

  const handleSignComplete = (signedData: {
    signatureDigest: string;
    signatureBase64: string;
    signedAt: string;
    signerName: string;
    signerRole: string;
    verificationUrl: string;
    qrCodeBase64: string;
  }) => {
    if (!selectedSessionId) return;

    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              status: 'APPROVED',
              isLocked: true,
              signedAt: signedData.signedAt,
              signatureDigest: signedData.signatureDigest,
              signatureBase64: signedData.signatureBase64,
              verificationUrl: signedData.verificationUrl,
              qrCodeBase64: signedData.qrCodeBase64,
              directorName: signedData.signerName,
              directorEmail: currentUser.email,
            }
          : s
      )
    );
  };

  const handleAddComment = (commentData: {
    stepIndex: number;
    testType: 'WEIGHING' | 'ECCENTRICITY' | 'REPEATABILITY' | 'TARE_TEMP';
    targetLoad: number;
    unit: string;
    comment: string;
    severity: AuditCommentSeverity;
  }) => {
    if (!selectedSessionId) return;

    const newComment: RowAuditComment = {
      id: `comm-${Date.now()}`,
      sessionId: selectedSessionId,
      stepIndex: commentData.stepIndex,
      testType: commentData.testType,
      targetLoad: commentData.targetLoad,
      unit: commentData.unit,
      authorName: currentUser.fullName,
      authorRole: currentUser.role,
      authorEmail: currentUser.email,
      comment: commentData.comment,
      severity: commentData.severity,
      timestamp: new Date().toISOString(),
      resolved: false,
    };

    setComments((prev) => [newComment, ...prev]);

    // Update comment counts on session
    setSessions((prev) =>
      prev.map((s) =>
        s.id === selectedSessionId
          ? {
              ...s,
              commentsCount: s.commentsCount + 1,
              flaggedRowCount:
                commentData.severity === 'FLAG' || commentData.severity === 'REJECT_REASON'
                  ? s.flaggedRowCount + 1
                  : s.flaggedRowCount,
            }
          : s
      )
    );
  };

  const handleToggleResolveComment = (commentId: string) => {
    setComments((prev) =>
      prev.map((c) => (c.id === commentId ? { ...c, resolved: !c.resolved } : c))
    );
  };

  const handleRowClick = (row: ObservationRow) => {
    setSelectedObservationRow(row);
    setIsCommentDrawerOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Interactive Multi-Tier Role Switcher & Statutory Header */}
      <div className="rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-5 shadow-card dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.06),0_2px_8px_rgba(0,0,0,0.25)] transition-all">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#162032] text-sky-500 border border-slate-200/90 dark:border-white/[0.08]">
                <FileCheck2 className="w-5 h-5 text-sky-500 dark:text-sky-400" />
              </div>
              <div>
                <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50 flex items-center gap-2.5 font-sans">
                  <span>Multi-Tier Laboratory Review Pipeline</span>
                  <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    OIML R 76-2
                  </span>
                </h1>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Statutory tripartite sign-off under Rule 16 of Legal Metrology (General) Rules, 2011: Operator → Reviewing Officer → Lab Director.
                </p>
              </div>
            </div>
          </div>

          {/* Interactive Role Switcher Toggle */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 bg-slate-100/80 dark:bg-[#101828] p-1.5 rounded-xl border border-slate-200/90 dark:border-white/[0.08]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 pl-1.5">
              Active Role:
            </span>
            <div className="flex items-center gap-1">
              {(
                [
                  { role: 'METROLOGIST' as UserRole, label: 'Metrologist' },
                  { role: 'REVIEWER' as UserRole, label: 'Reviewing Officer' },
                  { role: 'DIRECTOR' as UserRole, label: 'Lab Director' },
                ] as const
              ).map((item) => (
                <button
                  key={item.role}
                  onClick={() => setUserRole(item.role)}
                  className={`px-3 py-1.5 rounded-lg text-xs transition-all cursor-pointer ${
                    currentUser.role === item.role
                      ? 'bg-slate-900 dark:bg-[#1e293b] text-white dark:text-slate-100 shadow-xs border border-slate-700/60 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 border border-transparent font-medium'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main View: Queue vs Detailed Session Audit */}
      {!selectedSession ? (
        <ReviewerQueue
          sessions={sessions}
          currentUser={currentUser}
          selectedSessionId={selectedSessionId}
          onSelectSession={(id) => setSelectedSessionId(id)}
          onSubmitForReview={handleSubmitForReview}
          onOpenSignModal={(id) => {
            setSelectedSessionId(id);
            setIsSignModalOpen(true);
          }}
          onRemandSession={handleRemandSession}
        />
      ) : (
        /* Detailed Session Review Workspace */
        <div className="space-y-6">
          {/* Back Navigation & Status Actions Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f1728] p-4 rounded-xl border border-slate-200/80 dark:border-white/[0.08] shadow-xs dark:shadow-card card-sheen relative overflow-hidden">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedSessionId(null)}
                className="text-xs"
              >
                <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Queue
              </Button>

              <div className="h-5 w-px bg-slate-200 dark:bg-white/[0.08]" />

              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-50 flex items-center gap-2">
                  <span>{selectedSession.sessionNumber}</span>
                  <span className="text-xs font-mono font-normal text-slate-500">
                    ({selectedSession.manufacturer} {selectedSession.instrumentModel})
                  </span>
                </h2>
              </div>
            </div>

            {/* Workflow Action Buttons Based on Role */}
            <div className="flex items-center gap-2">
              {/* Metrologist Actions */}
              {currentUser.role === 'METROLOGIST' && selectedSession.status === 'IN_TESTING' && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleSubmitForReview(selectedSession.id)}
                  className="bg-brand-600 hover:bg-brand-700 text-white"
                >
                  Submit for Technical Review
                </Button>
              )}

              {/* Reviewer Actions */}
              {currentUser.role === 'REVIEWER' && selectedSession.status === 'PENDING_REVIEW' && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const reason = window.prompt(
                        'Enter statutory remand justification for testing officer:'
                      );
                      if (reason) handleRemandSession(selectedSession.id, reason);
                    }}
                    className="text-rose-600 hover:text-rose-700"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" /> Remand for Re-test
                  </Button>

                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleRecommendApproval(selectedSession.id)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Recommend Approval
                  </Button>
                </>
              )}

              {/* Director Action */}
              {selectedSession.status === 'PENDING_REVIEW' && !selectedSession.isLocked && (
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setIsSignModalOpen(true)}
                  disabled={currentUser.role !== 'DIRECTOR'}
                  title={
                    currentUser.role !== 'DIRECTOR'
                      ? 'Restricted: Only the Lab Director can digitally sign verification certificates.'
                      : 'Digitally sign & certify session'
                  }
                  className={`flex items-center gap-1.5 ${
                    currentUser.role === 'DIRECTOR'
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'opacity-50 cursor-not-allowed bg-slate-300 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  <Lock className="w-3.5 h-3.5" />
                  Sign & Issue Certificate
                </Button>
              )}

              {/* Dual Format Report Export */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadReport('pdf')}
                disabled={downloadingType === 'pdf'}
                title="Download Standardized OIML R 76-2 PDF/A Report"
                className="flex items-center gap-1.5 text-brand-600 dark:text-brand-400"
              >
                {downloadingType === 'pdf' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Download className="w-3.5 h-3.5" />
                )}
                <span>PDF/A Report</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleDownloadReport('docx')}
                disabled={downloadingType === 'docx'}
                title="Download Editable Microsoft Word (.docx) Report"
                className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300"
              >
                {downloadingType === 'docx' ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <FileText className="w-3.5 h-3.5 text-brand-500" />
                )}
                <span>Word (.docx)</span>
              </Button>
            </div>
          </div>

          {/* Official Green Stamped Seal if Session is Approved & Locked */}
          {selectedSession.isLocked && selectedSession.signedAt && (
            <GreenStampedSeal
              sessionNumber={selectedSession.sessionNumber}
              reportUuid={selectedSession.id}
              signatureDigest={selectedSession.signatureDigest || '—'}
              signerName={selectedSession.directorName || 'Dr. Rajeshwar Sharma'}
              signerDesignation="Director / Controller of Legal Metrology"
              signedAt={selectedSession.signedAt}
              verificationUrl={selectedSession.verificationUrl}
              qrCodeBase64={selectedSession.qrCodeBase64}
              laboratoryName={activeLab.name}
              accuracyClass={selectedSession.accuracyClass}
            />
          )}

          {/* Remanded Alert Banner if Session is Remanded */}
          {selectedSession.status === 'REMANDED' && (
            <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-4 dark:border-rose-900/60 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 text-xs flex items-start gap-3">
              <RotateCcw className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block text-sm font-bold">
                  Session Remanded by Reviewing Officer ({selectedSession.reviewerName})
                </strong>
                <p className="mt-1 leading-relaxed text-rose-800 dark:text-rose-300 font-medium">
                  "{selectedSession.remandReason}"
                </p>
                <span className="text-[11px] text-rose-600 dark:text-rose-400 mt-2 block">
                  Testing officer must conduct re-testing on flagged observation loads and re-submit for review.
                </span>
              </div>
            </div>
          )}

          {/* Read-Only Lock Banner if Locked */}
          {selectedSession.isLocked && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3.5 dark:border-emerald-900/60 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 text-xs flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>
                  <strong>Statutory Lockout Active:</strong> All observation inputs, calculations, and certificate metadata are permanently frozen in an immutable read-only state.
                </span>
              </div>
              <span className="font-mono text-[11px] font-bold uppercase text-emerald-700 dark:text-emerald-300">
                Rule 16 Compliant
              </span>
            </div>
          )}

          {/* Metrologist Non-Sign Notice */}
          {currentUser.role === 'METROLOGIST' &&
            selectedSession.status === 'PENDING_REVIEW' &&
            !selectedSession.isLocked && (
              <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 dark:border-blue-900/60 dark:bg-blue-950/30 text-blue-900 dark:text-blue-200 text-xs flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-blue-600 flex-shrink-0" />
                <span>
                  This evaluation session is currently under review by the Principal Scientific Officer. As a Metrologist / Testing Officer, signing privileges are restricted.
                </span>
              </div>
            )}

          {/* Test Tabs Bar */}
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
            <button
              onClick={() => setActiveTab('weighing')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'weighing'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Scale className="w-4 h-4" /> Form 4: Error of Indication (Cl. A.4.4)
            </button>

            <button
              onClick={() => setActiveTab('eccentricity')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'eccentricity'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Crosshair className="w-4 h-4" /> Form 5: Eccentricity (Cl. A.4.7)
            </button>

            <button
              onClick={() => setActiveTab('anomalies')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'anomalies'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4 text-amber-500" /> Anomaly & Anomaly Trace
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeTab === 'comments'
                  ? 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-brand-500" /> Audit Notes ({comments.length})
            </button>
          </div>

          {/* Form 4: Weighing Observation Grid with Row Click to Audit */}
          {activeTab === 'weighing' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <span>
                  Click any observation row below to inspect OIML calculation traces or append row-level audit flags.
                </span>
                <span className="font-mono text-[11px] text-brand-600 dark:text-brand-400 font-semibold">
                  Row Click $\to$ Opens Comment Drawer
                </span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs dark:shadow-card card-sheen relative overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 dark:bg-[#162032]/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider text-[10px] border-b border-slate-200/80 dark:border-white/[0.06]">
                    <tr>
                      <th className="py-2.5 px-3">Step</th>
                      <th className="py-2.5 px-3">Dir</th>
                      <th className="py-2.5 px-3">Target Load (L)</th>
                      <th className="py-2.5 px-3">Indication (I)</th>
                      <th className="py-2.5 px-3">Auxiliary (ΔL)</th>
                      <th className="py-2.5 px-3">True Ind. (P)</th>
                      <th className="py-2.5 px-3">Corrected Error (Ec)</th>
                      <th className="py-2.5 px-3">MPE Limit</th>
                      <th className="py-2.5 px-3">Margin</th>
                      <th className="py-2.5 px-3">Audit Flag</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                    {selectedSession.weighingObservations.map((row) => {
                      const rowComments = comments.filter((c) => c.stepIndex === row.step);
                      const hasFlag = rowComments.some((c) => c.severity === 'FLAG' || c.severity === 'REJECT_REASON');

                      return (
                        <tr
                          key={row.id}
                          onClick={() => handleRowClick(row)}
                          className="hover:bg-brand-50/40 dark:hover:bg-brand-950/20 cursor-pointer transition-colors"
                        >
                          <td className="py-2.5 px-3 font-mono font-bold">{row.step}</td>
                          <td className="py-2.5 px-3 text-[10px] font-mono text-slate-500">
                            {row.direction}
                          </td>
                          <td className="py-2.5 px-3 font-mono font-semibold">{row.targetLoad} g</td>
                          <td className="py-2.5 px-3 font-mono">{row.indication} g</td>
                          <td className="py-2.5 px-3 font-mono">{row.auxiliaryLoad} g</td>
                          <td className="py-2.5 px-3 font-mono">{row.trueIndication?.toFixed(3)} g</td>
                          <td className="py-2.5 px-3 font-mono font-bold text-brand-600 dark:text-brand-400">
                            {row.correctedError !== null ? `${row.correctedError > 0 ? '+' : ''}${row.correctedError.toFixed(3)} g` : '—'}
                          </td>
                          <td className="py-2.5 px-3 font-mono">±{row.mpeLimit} g</td>
                          <td className="py-2.5 px-3 font-mono text-emerald-600 dark:text-emerald-400">
                            {row.margin?.toFixed(3)} g
                          </td>
                          <td className="py-2.5 px-3">
                            {rowComments.length > 0 ? (
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  hasFlag
                                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                    : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                                }`}
                              >
                                <Flag className="w-3 h-3 text-amber-500" />
                                {rowComments.length} flag{rowComments.length > 1 ? 's' : ''}
                              </span>
                            ) : (
                              <span className="text-slate-400 text-[10px] hover:text-brand-500">
                                + Add note
                              </span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                row.status === 'PASS'
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              }`}
                            >
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Form 5: Eccentricity Corner Loading */}
          {activeTab === 'eccentricity' && (
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-5 shadow-xs dark:shadow-card card-sheen relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                    Eccentricity Corner Loading Observations (OIML R 76-1 Cl. A.4.7)
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Test load: 10,000 g (≈ ⅓ Max). Inter-corner variation allowable ≤ |MPE| (5.0 g).
                  </p>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  COMPLIANT
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                {selectedSession.eccentricityObservations.map((obs) => (
                  <div
                    key={obs.position}
                    className="p-3.5 rounded-lg border border-slate-200 dark:border-white/[0.08] bg-slate-50/50 dark:bg-[#121c2d] space-y-1"
                  >
                    <div className="flex justify-between font-bold">
                      <span>{obs.label}</span>
                      <span className="text-emerald-600">{obs.status}</span>
                    </div>
                    <div className="text-slate-500 text-[11px]">Load: {obs.targetLoad} g</div>
                    <div className="font-mono text-xs">Corrected Error: {obs.correctedError} g</div>
                    <div className="text-[10px] text-slate-400">Tolerance: ±{obs.mpeLimit} g</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Anomaly Trace Analyzer */}
          {activeTab === 'anomalies' && (
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-5 shadow-xs dark:shadow-card card-sheen relative overflow-hidden space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50">
                  Automated Metrological Anomaly & Anti-Fraud Scan
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="text-emerald-900 dark:text-emerald-200 block font-semibold">
                      Mechanical Variance Check: Normal Variance Confirmed
                    </strong>
                    Natural mechanical noise and standard deviation (σ &gt; 0) observed across all test series. No synthetic copy-paste patterns detected.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-amber-200 bg-amber-50/50 dark:border-amber-900/40 dark:bg-amber-950/20 flex items-start gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5" />
                  <div>
                    <strong className="text-amber-900 dark:text-amber-200 block font-semibold">
                      Tolerance Corridor Margin Warning (Step 5)
                    </strong>
                    At 20,000 g load, corrected error of -1.3 g approaches 26% of allowable corridor. While compliant, margin is low.
                  </div>
                </div>

                <div className="p-3.5 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5" />
                  <div>
                    <strong className="text-emerald-900 dark:text-emerald-200 block font-semibold">
                      Zero Point Temperature Stability
                    </strong>
                    Zero point deviation across initial and final test runs = 0.000 g (well within allowable ±0.25 e).
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Audit Notes Timeline */}
          {activeTab === 'comments' && (
            <div className="rounded-xl border border-slate-200/80 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] p-5 shadow-xs dark:shadow-card card-sheen relative overflow-hidden space-y-4">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-50 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-brand-500" />
                Session Audit Notes & Remarks Timeline
              </h3>

              {comments.length === 0 ? (
                <div className="p-8 text-center text-slate-400 text-xs">
                  No audit notes or remarks recorded for this session.
                </div>
              ) : (
                <div className="space-y-3">
                  {comments.map((comm) => (
                    <div
                      key={comm.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {comm.authorName}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-brand-100 dark:bg-brand-950 text-brand-700 dark:text-brand-300">
                            {comm.authorRole}
                          </span>
                          <span className="text-slate-400 text-[10px]">
                            Step #{comm.stepIndex} ({comm.targetLoad} {comm.unit})
                          </span>
                        </div>
                        <span className="text-slate-400 text-[10px]">
                          {new Date(comm.timestamp).toLocaleString('en-IN')}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        "{comm.comment}"
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Row-Level Comment Drawer */}
      <RowLevelCommentDrawer
        isOpen={isCommentDrawerOpen}
        onClose={() => setIsCommentDrawerOpen(false)}
        row={selectedObservationRow}
        comments={comments}
        currentUser={currentUser}
        isSessionLocked={selectedSession?.isLocked ?? false}
        onAddComment={handleAddComment}
        onToggleResolveComment={handleToggleResolveComment}
      />

      {/* Director Sign Modal */}
      {selectedSession && (
        <DirectorSignModal
          isOpen={isSignModalOpen}
          onClose={() => setIsSignModalOpen(false)}
          session={selectedSession}
          currentUser={currentUser}
          onSignComplete={handleSignComplete}
        />
      )}
    </div>
  );
};
