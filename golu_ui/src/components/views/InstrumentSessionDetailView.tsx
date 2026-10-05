import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Scale,
  Lock,
  FileCheck2,
  History,
  QrCode,
  Sparkles,
  Info,
} from 'lucide-react';
import {
  InstrumentSpecs,
  SessionMeta,
  SessionScenario,
  StatutoryEvidenceItem,
  TestStepItem,
  TestResultModuleItem,
} from '../session_detail/types';
import { InstrumentIdentityHeader } from '../session_detail/InstrumentIdentityHeader';
import { TraceabilityStrip } from '../session_detail/TraceabilityStrip';
import { SevenStepStepper } from '../session_detail/SevenStepStepper';
import { ComplianceAndNextAction } from '../session_detail/ComplianceAndNextAction';
import { TestResultCardsGrid } from '../session_detail/TestResultCardsGrid';
import { CollapsibleDetailsSection } from '../session_detail/CollapsibleDetailsSection';
import { RoleAwareFooter } from '../session_detail/RoleAwareFooter';
import { EvidenceDossierModal } from '../session_detail/EvidenceDossierModal';
import { useToast } from '../layout/ToastViewport';

import { CANONICAL_INSTRUMENTS } from '../../data/instruments';

interface InstrumentSessionDetailViewProps {
  session?: any;
  onBackToSessions: () => void;
  onNavigateToTest: (targetView: string) => void;
  userRole?: string;
  isTraceabilityLocked?: boolean;
}

export const InstrumentSessionDetailView: React.FC<InstrumentSessionDetailViewProps> = ({
  session,
  onBackToSessions,
  onNavigateToTest,
  userRole = 'Metrologist',
  isTraceabilityLocked = false,
}) => {
  const { showToast } = useToast();

  // Resolve instrument details from session or canonical database (§20)
  const resolvedInst =
    (session?.instrument && typeof session.instrument === 'object' ? session.instrument : null) ||
    (session?.instrumentId ? CANONICAL_INSTRUMENTS.find((i) => i.id === session.instrumentId) : null);

  const formatClass = (cls?: string) => {
    if (!cls) return 'Class III';
    if (cls === 'CLASS_I') return 'Class I';
    if (cls === 'CLASS_II') return 'Class II';
    if (cls === 'CLASS_III') return 'Class III';
    if (cls === 'CLASS_IIII') return 'Class IIII';
    return cls;
  };

  const determineInitialScenario = (): SessionScenario => {
    if (isTraceabilityLocked) return 'BLOCKED';
    if (!session) return 'ACTIVE';
    if (session.complianceStatus === 'FAIL' || session.status === 'FAIL') return 'FAILED';
    const st = (session.reviewStatus || session.status || '').toUpperCase();
    if (st.includes('APPROV')) return 'APPROVED';
    if (st.includes('REMAND')) return 'REMANDED';
    if (st.includes('REVIEW')) return 'FINISHED';
    if (
      st.includes('PENDING') ||
      session.activeStep === 1 ||
      session.progressText === '1 / 7' ||
      session.progressText === '0 / 7' ||
      session.readiness?.overallStatus === 'ATTENTION'
    ) {
      return 'FRESH';
    }
    return 'ACTIVE';
  };

  // Interactive Scenario / Lifecycle State Switcher (§18, §19, §20, §21, §22)
  const [scenario, setScenario] = useState<SessionScenario>(determineInitialScenario);
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [lastSavedTimestamp, setLastSavedTimestamp] = useState<string>('18:42 IST');

  // Sync state if session or lockout changes
  React.useEffect(() => {
    setScenario(determineInitialScenario());
  }, [session?.id, session?.status, session?.reviewStatus, isTraceabilityLocked]);

  // Instrument Metrological Specifications (§3, §5, §20, §28)
  const specs: InstrumentSpecs = {
    manufacturer: resolvedInst?.manufacturer || session?.manufacturer || 'Avery Weigh-Tronix',
    model: resolvedInst?.modelName || session?.model || session?.modelName || 'ZM201 Retail Platform',
    serialNumber: resolvedInst?.serialNumber || session?.serialNumber || session?.sessionNumber || 'AV-2026-8812',
    tacNumber: resolvedInst?.approvalNumber || session?.tacNumber || 'TAC-2026-III-0142',
    accuracyClass: formatClass(resolvedInst?.accuracyClass || session?.accuracyClass),
    maxCapacity: resolvedInst ? `${resolvedInst.maxCapacity} ${resolvedInst.unit}` : session?.maxCapacity ? (typeof session.maxCapacity === 'number' ? `${session.maxCapacity} kg` : session.maxCapacity) : '30.000 kg',
    minCapacity: resolvedInst ? `${resolvedInst.minCapacity} ${resolvedInst.unit}` : session?.minCapacity ? (typeof session.minCapacity === 'number' ? `${session.minCapacity} kg` : session.minCapacity) : '0.100 kg',
    interval: resolvedInst ? `${resolvedInst.e} ${resolvedInst.unit}` : session?.interval || '0.005 kg',
    scaleInterval: resolvedInst ? `${resolvedInst.d} ${resolvedInst.unit}` : session?.scaleInterval || '0.005 kg',
    divisionsCount: resolvedInst?.n || session?.divisionsCount || 6000,
    firmware: resolvedInst?.firmwareVersion || session?.firmware || 'v2.4.1',
    laboratory: 'Central Legal Metrology Lab, New Delhi',
    verificationStage: session?.verificationStage === 'INITIAL_TYPE_APPROVAL' ? 'Initial Type Approval' : 'Subsequent Verification',
  };

  const meta: SessionMeta = {
    sessionId: session?.id || session?.sessionNumber || 'SES-2026-00184',
    stage: session?.verificationStage === 'INITIAL_TYPE_APPROVAL' ? 'Initial Type Approval' : 'Subsequent Verification',
    operator: session?.operator || (userRole === 'Metrologist' ? 'R. Sharma' : userRole),
    startedAt: '04 Oct 2026 · 11:20',
    lastSavedAt: lastSavedTimestamp,
    auditEventsCount: scenario === 'APPROVED' ? 42 : scenario === 'FRESH' ? 4 : 26,
    lastAction:
      scenario === 'APPROVED'
        ? 'Certificate Form VI issued and digitally sealed'
        : scenario === 'REMANDED'
        ? 'Reviewer requested eccentricity re-check'
        : scenario === 'FINISHED'
        ? 'All 4 measurement modules verified compliant'
        : scenario === 'FRESH'
        ? 'Instrument registered from intake'
        : 'Observation #4 recorded at 10.000 kg',
  };

  // 7 Lifecycle Stages of Verification Session (§8, §28, §34)
  const getStepsForScenario = (): TestStepItem[] => {
    switch (scenario) {
      case 'FRESH':
        return [
          {
            id: 1,
            stepNumber: '01',
            name: 'Registration & Intake',
            shortName: 'Registration',
            targetView: 'intake',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Instrument parameters registered & TAC verified',
          },
          {
            id: 2,
            stepNumber: '02',
            name: 'Precondition & Readiness',
            shortName: 'Precondition',
            targetView: 'readiness',
            state: 'IN_PROGRESS',
            badgeText: '● READY TO START',
            resultSummary: 'Environmental baseline & standards readiness check',
          },
          {
            id: 3,
            stepNumber: '03',
            name: 'Test Plan Confirmation',
            shortName: 'Test Plan',
            targetView: 'test_applicability',
            state: 'UPCOMING',
            badgeText: '○ NOT STARTED',
            resultSummary: 'Statutory test applicability scope',
            lockedReason: 'Complete Precondition Check first.',
          },
          {
            id: 4,
            stepNumber: '04',
            name: 'OIML Metrological Testing',
            shortName: 'Testing',
            targetView: 'weighing_linearity',
            state: 'UPCOMING',
            badgeText: '○ NOT STARTED',
            resultSummary: 'Weighing, Eccentricity, Repeatability, Drift',
            lockedReason: 'Requires confirmed Test Plan.',
          },
          {
            id: 5,
            stepNumber: '05',
            name: 'Statutory Peer Review',
            shortName: 'Review',
            targetView: 'review',
            state: 'UPCOMING',
            badgeText: '○ NOT STARTED',
            resultSummary: 'Independent four-eyes verification',
            lockedReason: 'Requires completion of testing stages.',
          },
          {
            id: 6,
            stepNumber: '06',
            name: 'Director Authorization',
            shortName: 'Director Sign',
            targetView: 'review',
            state: 'UPCOMING',
            badgeText: '○ NOT STARTED',
            resultSummary: 'PIN authorization and Green Guilloche seal',
            lockedReason: 'Requires Reviewer approval.',
          },
          {
            id: 7,
            stepNumber: '07',
            name: 'Certificate & e-Māap QR',
            shortName: 'Certificate',
            targetView: 'reports',
            state: 'UPCOMING',
            badgeText: '○ NOT STARTED',
            resultSummary: 'Statutory Form VI certificate generation',
            lockedReason: 'Requires Director signature.',
          },
        ];

      case 'FINISHED':
        return [
          {
            id: 1,
            stepNumber: '01',
            name: 'Registration & Intake',
            shortName: 'Registration',
            targetView: 'intake',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Instrument parameters verified compliant',
          },
          {
            id: 2,
            stepNumber: '02',
            name: 'Precondition & Readiness',
            shortName: 'Precondition',
            targetView: 'readiness',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: '20.2°C, 51% RH, Level centered, Seals intact',
          },
          {
            id: 3,
            stepNumber: '03',
            name: 'Test Plan Confirmation',
            shortName: 'Test Plan',
            targetView: 'test_applicability',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Class III 4-test schedule locked',
          },
          {
            id: 4,
            stepNumber: '04',
            name: 'OIML Metrological Testing',
            shortName: 'Testing',
            targetView: 'weighing_linearity',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'All 4 measurement modules verified compliant',
          },
          {
            id: 5,
            stepNumber: '05',
            name: 'Statutory Peer Review',
            shortName: 'Review',
            targetView: 'review',
            state: 'IN_PROGRESS',
            badgeText: '● READY FOR REVIEW',
            resultSummary: 'Awaiting independent Senior Reviewer audit',
          },
          {
            id: 6,
            stepNumber: '06',
            name: 'Director Authorization',
            shortName: 'Director Sign',
            targetView: 'review',
            state: 'UPCOMING',
            badgeText: '○ NOT STARTED',
            resultSummary: 'Director cryptographic seal',
            lockedReason: 'Pending Senior Reviewer sign-off.',
          },
          {
            id: 7,
            stepNumber: '07',
            name: 'Certificate & e-Māap QR',
            shortName: 'Certificate',
            targetView: 'reports',
            state: 'UPCOMING',
            badgeText: '○ NOT STARTED',
            resultSummary: 'Statutory Form VI certificate generation',
            lockedReason: 'Pending Director signature.',
          },
        ];

      case 'APPROVED':
        return [
          {
            id: 1,
            stepNumber: '01',
            name: 'Registration & Intake',
            shortName: 'Registration',
            targetView: 'intake',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Instrument registered',
          },
          {
            id: 2,
            stepNumber: '02',
            name: 'Precondition & Readiness',
            shortName: 'Precondition',
            targetView: 'readiness',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Physical baseline confirmed',
          },
          {
            id: 3,
            stepNumber: '03',
            name: 'Test Plan Confirmation',
            shortName: 'Test Plan',
            targetView: 'test_applicability',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Schedule locked',
          },
          {
            id: 4,
            stepNumber: '04',
            name: 'OIML Metrological Testing',
            shortName: 'Testing',
            targetView: 'weighing_linearity',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'All 31 observations pass MPE',
          },
          {
            id: 5,
            stepNumber: '05',
            name: 'Statutory Peer Review',
            shortName: 'Review',
            targetView: 'review',
            state: 'COMPLETED',
            badgeText: '✓ APPROVED',
            resultSummary: 'Peer review completed with 0 remarks',
          },
          {
            id: 6,
            stepNumber: '06',
            name: 'Director Authorization',
            shortName: 'Director Sign',
            targetView: 'review',
            state: 'COMPLETED',
            badgeText: '✓ SIGNED',
            resultSummary: 'Cryptographically sealed by Director',
          },
          {
            id: 7,
            stepNumber: '07',
            name: 'Certificate & e-Māap QR',
            shortName: 'Certificate',
            targetView: 'reports',
            state: 'COMPLETED',
            badgeText: '🔒 ISSUED',
            resultSummary: 'Form VI Certificate issued with e-Māap QR',
          },
        ];

      case 'REMANDED':
        return [
          {
            id: 1,
            stepNumber: '01',
            name: 'Registration & Intake',
            shortName: 'Registration',
            targetView: 'intake',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Instrument parameters confirmed',
          },
          {
            id: 2,
            stepNumber: '02',
            name: 'Precondition & Readiness',
            shortName: 'Precondition',
            targetView: 'readiness',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Physical baseline verified',
          },
          {
            id: 3,
            stepNumber: '03',
            name: 'Test Plan Confirmation',
            shortName: 'Test Plan',
            targetView: 'test_applicability',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Schedule locked',
          },
          {
            id: 4,
            stepNumber: '04',
            name: 'OIML Metrological Testing',
            shortName: 'Testing',
            targetView: 'eccentricity_workspace',
            state: 'IN_PROGRESS',
            badgeText: '⚠ RE-CHECK REQUIRED',
            resultSummary: 'Reviewer noted 0.4e deviation on Corner 3',
          },
          {
            id: 5,
            stepNumber: '05',
            name: 'Statutory Peer Review',
            shortName: 'Review',
            targetView: 'review',
            state: 'BLOCKED',
            badgeText: '⚠ REMANDED',
            resultSummary: 'Returned to operator for correction',
          },
          {
            id: 6,
            stepNumber: '06',
            name: 'Director Authorization',
            shortName: 'Director Sign',
            targetView: 'review',
            state: 'LOCKED',
            badgeText: '🔒 LOCKED',
            resultSummary: 'Locked until remand resolved',
          },
          {
            id: 7,
            stepNumber: '07',
            name: 'Certificate & e-Māap QR',
            shortName: 'Certificate',
            targetView: 'reports',
            state: 'LOCKED',
            badgeText: '🔒 LOCKED',
            resultSummary: 'Locked',
          },
        ];

      case 'BLOCKED':
        return [
          {
            id: 1,
            stepNumber: '01',
            name: 'Registration & Intake',
            shortName: 'Registration',
            targetView: 'intake',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Registration baseline checked',
          },
          {
            id: 2,
            stepNumber: '02',
            name: 'Precondition & Readiness',
            shortName: 'Precondition',
            targetView: 'readiness',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Physical inspection completed',
          },
          {
            id: 3,
            stepNumber: '03',
            name: 'Test Plan Confirmation',
            shortName: 'Test Plan',
            targetView: 'test_applicability',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Schedule established',
          },
          {
            id: 4,
            stepNumber: '04',
            name: 'OIML Metrological Testing',
            shortName: 'Testing',
            targetView: 'weighing_linearity',
            state: 'BLOCKED',
            badgeText: '! BLOCKED',
            resultSummary: 'Standard weights expired - measurement disabled',
            lockedReason: 'Standard weights expired. Resolve in Standards Traceability.',
          },
          {
            id: 5,
            stepNumber: '05',
            name: 'Statutory Peer Review',
            shortName: 'Review',
            targetView: 'review',
            state: 'LOCKED',
            badgeText: '🔒 LOCKED',
            resultSummary: 'Testing locked',
          },
          {
            id: 6,
            stepNumber: '06',
            name: 'Director Authorization',
            shortName: 'Director Sign',
            targetView: 'review',
            state: 'LOCKED',
            badgeText: '🔒 LOCKED',
            resultSummary: 'Testing locked',
          },
          {
            id: 7,
            stepNumber: '07',
            name: 'Certificate & e-Māap QR',
            shortName: 'Certificate',
            targetView: 'reports',
            state: 'LOCKED',
            badgeText: '🔒 LOCKED',
            resultSummary: 'Testing locked',
          },
        ];

      case 'FAILED':
        return [
          {
            id: 1,
            stepNumber: '01',
            name: 'Registration & Intake',
            shortName: 'Registration',
            targetView: 'intake',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Instrument parameters confirmed',
          },
          {
            id: 2,
            stepNumber: '02',
            name: 'Precondition & Readiness',
            shortName: 'Precondition',
            targetView: 'readiness',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Physical baseline confirmed',
          },
          {
            id: 3,
            stepNumber: '03',
            name: 'Test Plan Confirmation',
            shortName: 'Test Plan',
            targetView: 'test_applicability',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Schedule locked',
          },
          {
            id: 4,
            stepNumber: '04',
            name: 'OIML Metrological Testing',
            shortName: 'Testing',
            targetView: 'weighing_linearity',
            state: 'BLOCKED',
            badgeText: '✕ FAIL',
            resultSummary: 'Statutory MPE tolerance breach detected',
          },
          {
            id: 5,
            stepNumber: '05',
            name: 'Statutory Peer Review',
            shortName: 'Review',
            targetView: 'review',
            state: 'BLOCKED',
            badgeText: '✕ REJECTED',
            resultSummary: 'Blocked due to measurement failure',
            lockedReason: 'Cannot review rejected session.',
          },
          {
            id: 6,
            stepNumber: '06',
            name: 'Director Authorization',
            shortName: 'Director Sign',
            targetView: 'review',
            state: 'LOCKED',
            badgeText: '🔒 LOCKED',
            resultSummary: 'Authorization barred for non-compliant scale',
          },
          {
            id: 7,
            stepNumber: '07',
            name: 'Certificate & e-Māap QR',
            shortName: 'Certificate',
            targetView: 'reports',
            state: 'LOCKED',
            badgeText: '🔒 LOCKED',
            resultSummary: 'Certificate generation blocked',
          },
        ];

      case 'ACTIVE':
      default:
        // Canonical Active State (§21): Registration, Precondition, Plan complete; Testing in progress
        return [
          {
            id: 1,
            stepNumber: '01',
            name: 'Registration & Intake',
            shortName: 'Registration',
            targetView: 'intake',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Instrument parameters registered & TAC verified',
          },
          {
            id: 2,
            stepNumber: '02',
            name: 'Precondition & Readiness',
            shortName: 'Precondition',
            targetView: 'readiness',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Spirit level centered, seals intact, baseline verified',
          },
          {
            id: 3,
            stepNumber: '03',
            name: 'Test Plan Confirmation',
            shortName: 'Test Plan',
            targetView: 'test_applicability',
            state: 'COMPLETED',
            badgeText: '✓ COMPLETE',
            resultSummary: 'Class III 4-test schedule confirmed',
          },
          {
            id: 4,
            stepNumber: '04',
            name: 'OIML Metrological Testing',
            shortName: 'Testing',
            targetView: 'weighing_linearity',
            state: 'IN_PROGRESS',
            badgeText: '● IN TESTING',
            resultSummary: 'Weighing Error & Corner Loading in progress (4 / 31 points)',
          },
          {
            id: 5,
            stepNumber: '05',
            name: 'Statutory Peer Review',
            shortName: 'Review',
            targetView: 'review',
            state: 'UPCOMING',
            badgeText: '○ PENDING',
            resultSummary: 'Independent four-eyes verification',
            lockedReason: 'Complete OIML Metrological Testing first.',
          },
          {
            id: 6,
            stepNumber: '06',
            name: 'Director Authorization',
            shortName: 'Director Sign',
            targetView: 'review',
            state: 'UPCOMING',
            badgeText: '○ PENDING',
            resultSummary: 'Director cryptographic seal',
            lockedReason: 'Requires Reviewer approval.',
          },
          {
            id: 7,
            stepNumber: '07',
            name: 'Certificate & e-Māap QR',
            shortName: 'Certificate',
            targetView: 'reports',
            state: 'UPCOMING',
            badgeText: '○ PENDING',
            resultSummary: 'Statutory Form VI certificate generation',
            lockedReason: 'Requires Director signature.',
          },
        ];
    }
  };

  const steps = getStepsForScenario();

  // Find index of current active step
  const activeStepIdx = steps.findIndex(
    (s) => s.state === 'IN_PROGRESS' || s.state === 'BLOCKED'
  );
  const currentStepIndex = activeStepIdx >= 0 ? activeStepIdx : 0;
  const currentStep = steps[currentStepIndex];

  // Statutory Evidence Items (§15 & §18)
  const evidenceItems: StatutoryEvidenceItem[] = [
    {
      id: 'nameplate',
      category: 'NAMEPLATE',
      name: 'Nameplate & Markings',
      captured: true,
      timestamp: '04 Oct 2026, 11:25 IST',
      hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      iconName: 'Camera',
      notes: 'Clear legibility of Max 30 kg, Min 100 g, e 5 g, and TAC-2026-III-0142.',
    },
    {
      id: 'frontView',
      category: 'FRONT VIEW',
      name: 'Full Scale Frontal View',
      captured: true,
      timestamp: '04 Oct 2026, 11:27 IST',
      hash: '7d793037a0760186574b0282f2f435e7b1e7ee68d6da90cc3e6609e2ca9a7845',
      iconName: 'Camera',
      notes: 'Front perspective showing dual display, tare key, and platform condition.',
    },
    {
      id: 'sealingPoint',
      category: 'SEALING POINT',
      name: 'Lead-Wire Seal Housing',
      captured: true,
      timestamp: '04 Oct 2026, 11:32 IST',
      hash: 'ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad',
      iconName: 'Lock',
      notes: 'Intact verification wire seal securing the metrological adjustment switch.',
    },
    {
      id: 'levelBubble',
      category: 'LEVEL BUBBLE',
      name: 'Spirit Level Indicator',
      captured: true,
      timestamp: '04 Oct 2026, 11:35 IST',
      hash: 'cb8379ac2098aa165029e3938a51da0bcecfc008fd6795f401178647f96c5b34',
      iconName: 'Check',
      notes: 'Level indicator bubble perfectly centered within inner black circle.',
    },
    {
      id: 'specDocument',
      category: 'DOCUMENTATION',
      name: 'Manufacturer Manual & TAC',
      captured: true,
      timestamp: '04 Oct 2026, 11:38 IST',
      hash: '4a0f443b2361cfb36e3c1a2512f45037d04f3db6e64cbe39b940ad4a1cf647aa',
      iconName: 'FileText',
      notes: 'National Type Approval Certificate documentation matching model firmware.',
    },
  ];

  // Navigation handlers (§23)
  const handleStepClick = (step: TestStepItem) => {
    if (step.state === 'COMPLETED' || step.state === 'IN_PROGRESS') {
      onNavigateToTest(step.targetView);
    } else if (step.state === 'BLOCKED') {
      onNavigateToTest('standards');
    } else {
      showToast(
        `Step ${step.stepNumber} Locked`,
        step.lockedReason || `Complete Step 0${step.id - 1} before proceeding to ${step.name}.`,
        'warning'
      );
    }
  };

  const isWeighingFail = session?.weighing?.overallStatus === 'FAIL' || session?.weighing?.status === 'FAIL';
  const isEccentricityFail = session?.eccentricity?.overallStatus === 'FAIL' || session?.eccentricity?.status === 'FAIL' || session?.eccentricity?.points?.some((p: any) => p.status === 'FAIL');
  const isEnvFail = session?.environment?.status === 'FAIL' || session?.environment?.temperatureDrift?.status === 'FAIL';
  const isRepeatFail = session?.repeatability?.status === 'FAIL';

  const handleContinueTesting = () => {
    if (scenario === 'APPROVED') {
      onNavigateToTest('reports');
    } else if (scenario === 'FAILED') {
      if (isWeighingFail) onNavigateToTest('weighing_linearity');
      else if (isEccentricityFail) onNavigateToTest('eccentricity_workspace');
      else if (isEnvFail) onNavigateToTest('environmental_workspace');
      else onNavigateToTest('weighing_linearity');
    } else if (scenario === 'REMANDED') {
      onNavigateToTest('eccentricity_workspace');
    } else if (scenario === 'FINISHED') {
      onNavigateToTest('review');
    } else if (scenario === 'FRESH') {
      onNavigateToTest('readiness');
    } else {
      onNavigateToTest(currentStep.targetView);
    }
  };

  const dynamicModules: TestResultModuleItem[] = [
    {
      id: 'test-weighing',
      testNumber: 'Test 01',
      name: 'Weighing Error & Linearity',
      standardReference: 'OIML R 76-1 § 3.5.1',
      state: isWeighingFail ? 'COMPLETED' : session?.weighing?.completed ? 'COMPLETED' : 'IN_PROGRESS',
      verdict: isWeighingFail ? 'FAIL' : session?.weighing?.completed ? 'PASS' : 'ACTIVE',
      observationsCount: isWeighingFail ? '14 obs (FAIL)' : '14 obs',
      details: isWeighingFail ? 'Turning-point error -5.3 g exceeds MPE ±5.0 g' : 'Max error: 1.8 g (MPE limit ±5.0 g)',
      targetView: 'weighing_linearity',
    },
    {
      id: 'test-eccentricity',
      testNumber: 'Test 02',
      name: 'Eccentricity (Corner Loading)',
      standardReference: 'OIML R 76-1 § 3.6.2',
      state: isEccentricityFail ? 'COMPLETED' : session?.eccentricity?.completed ? 'COMPLETED' : 'IN_PROGRESS',
      verdict: isEccentricityFail ? 'FAIL' : session?.eccentricity?.completed ? 'PASS' : 'ACTIVE',
      observationsCount: isEccentricityFail ? '5 pos (FAIL)' : '5 pos',
      details: isEccentricityFail ? 'Corner 4 cantilever deflection -6.2 g exceeds ±5.0 g' : 'Corner deflection compliant · Max delta 1.2 g',
      targetView: 'eccentricity_workspace',
    },
    {
      id: 'test-repeatability',
      testNumber: 'Test 03',
      name: 'Repeatability Test',
      standardReference: 'OIML R 76-1 § 3.6.1',
      state: isRepeatFail ? 'COMPLETED' : session?.repeatability?.completed ? 'COMPLETED' : 'IN_PROGRESS',
      verdict: isRepeatFail ? 'FAIL' : session?.repeatability?.completed ? 'PASS' : 'ACTIVE',
      observationsCount: '10 runs',
      details: isRepeatFail ? 'Spread exceeds 2.0 g limit' : 'Total observed spread 1.2 g (Limit: 2.0 g)',
      targetView: 'repeatability_workspace',
    },
    {
      id: 'test-environmental',
      testNumber: 'Test 04',
      name: 'Environmental Drift & Tare',
      standardReference: 'OIML R 76-1 § 3.9',
      state: isEnvFail ? 'COMPLETED' : session?.environment?.completed ? 'COMPLETED' : 'PENDING',
      verdict: isEnvFail ? 'FAIL' : session?.environment?.completed ? 'PASS' : 'PENDING',
      observationsCount: isEnvFail ? '4 stages (FAIL)' : '4 stages',
      details: isEnvFail ? '+40°C thermal drift +6.4 g exceeds statutory limit' : 'Thermal chamber stability and tare balance verified',
      targetView: 'environmental_workspace',
    },
  ];

  const handleSaveSession = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    setLastSavedTimestamp(timeStr);
    showToast(
      'Session Saved',
      `Session ${meta.sessionId} saved at ${timeStr}. Cryptographic state persisted.`,
      'success'
    );
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-200">
      {/* 0. Approved State Banner (§31) */}
      {scenario === 'APPROVED' && (
        <div className="p-4 rounded-3xl bg-emerald-950 text-white border-2 border-emerald-600 shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-emerald-800 text-emerald-200">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-emerald-300">
                🔒 APPROVED · IMMUTABLE VERIFICATION RECORD
              </div>
              <p className="text-xs text-emerald-100">
                This verification session has been digitally signed by the Laboratory Director. All data is cryptographically sealed and permanently read-only.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTest('reports')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md"
          >
            View Certificate Form VI →
          </button>
        </div>
      )}

      {/* 0. Remanded State Banner (§32) */}
      {scenario === 'REMANDED' && (
        <div className="p-4 rounded-3xl bg-amber-950 text-white border-2 border-amber-600 shadow-lg flex items-center justify-between gap-4 animate-in slide-in-from-top-2">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-amber-800 text-amber-200">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="text-xs font-black uppercase tracking-wider text-amber-300">
                ⚠ SESSION REMANDED BY REVIEWER
              </div>
              <p className="text-xs text-amber-100">
                Reviewer requested additional clarification: Corner 3 showed 0.4e deviation on off-center placement. 1 issue requires operator correction.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateToTest('eccentricity_workspace')}
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shrink-0 cursor-pointer shadow-md"
          >
            Resolve Issue →
          </button>
        </div>
      )}

      {/* 1. Page Header & Lifecycle State Switcher (§4) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onBackToSessions}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750 transition-colors shadow-xs cursor-pointer text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sessions</span>
            </button>
            <span className="text-slate-300 dark:text-slate-700">·</span>
            <span className="text-xs font-mono font-bold uppercase text-slate-400">
              CASE: {meta.sessionId}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight mt-1.5">
            Verification Session Overview
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Complete overview of this instrument, workflow progress, evidence dossier and next action.
          </p>
        </div>

        {/* Demo State Switcher for quick assessment of all 6 states (§18–22) */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="text-[11px] text-slate-400 font-mono font-bold hidden lg:inline">
            LIFECYCLE STATE:
          </span>
          <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800 text-xs font-bold">
            <button
              type="button"
              onClick={() => setScenario('FRESH')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scenario === 'FRESH'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Fresh
            </button>
            <button
              type="button"
              onClick={() => setScenario('ACTIVE')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scenario === 'ACTIVE'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              In Testing
            </button>
            <button
              type="button"
              onClick={() => setScenario('FINISHED')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scenario === 'FINISHED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Ready
            </button>
            <button
              type="button"
              onClick={() => setScenario('APPROVED')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scenario === 'APPROVED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Approved
            </button>
            <button
              type="button"
              onClick={() => setScenario('REMANDED')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scenario === 'REMANDED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Remanded
            </button>
            <button
              type="button"
              onClick={() => setScenario('FAILED')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scenario === 'FAILED'
                  ? 'bg-rose-600 text-white font-black shadow-xs'
                  : 'text-rose-600 hover:text-rose-700'
              }`}
            >
              ✕ Fail
            </button>
            <button
              type="button"
              onClick={() => setScenario('BLOCKED')}
              className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                scenario === 'BLOCKED'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Blocked
            </button>
          </div>
        </div>
      </div>

      {/* 2. Instrument Identity Header Card (§3, §5, §6, §7) */}
      <InstrumentIdentityHeader
        specs={specs}
        meta={meta}
        scenario={scenario}
      />

      {/* 3. Traceability Status Strip (§16) */}
      <TraceabilityStrip
        status={
          scenario === 'BLOCKED' || isTraceabilityLocked
            ? 'LOCKED'
            : 'VALID'
        }
        weightSetId="F1-018"
        onResolveTraceability={() => onNavigateToTest('standards')}
      />

      {/* 4. Seven-Step Progress Stepper & Current-Step Callout (§8, §9, §10, §28) */}
      <SevenStepStepper
        steps={steps}
        currentStepIndex={currentStepIndex}
        onStepClick={handleStepClick}
        onContinueCurrentStep={handleContinueTesting}
        isTraceabilityLocked={scenario === 'BLOCKED' || isTraceabilityLocked}
      />

      {/* 5. Overall Result & Next Action & What Needs Attention Cards (§11, §12, §23, §27) */}
      <ComplianceAndNextAction
        scenario={scenario}
        steps={steps}
        currentStep={currentStep}
        onContinueTesting={handleContinueTesting}
        onResolveBlocker={() => onNavigateToTest('standards')}
        onViewAttentionItem={() => onNavigateToTest('eccentricity_workspace')}
        isTraceabilityLocked={scenario === 'BLOCKED' || isTraceabilityLocked}
      />

      {/* 6. Test Result Cards Grid (§13, §14) */}
      <TestResultCardsGrid
        testModules={dynamicModules}
        steps={steps}
        onModuleAction={(mod) => onNavigateToTest(mod.targetView)}
        onStepAction={handleStepClick}
      />

      {/* 7. Collapsible Specifications, Evidence & Assurance Summary (§14, §15, §16, §18, §22, §37) */}
      <CollapsibleDetailsSection
        specs={specs}
        meta={meta}
        evidenceItems={evidenceItems}
        onOpenEvidenceModal={() => setIsEvidenceModalOpen(true)}
        onNavigateToAudit={() => onNavigateToTest('audit')}
        onNavigateToBridge={() => onNavigateToTest('scale_bridge')}
        onNavigateToStandards={() => onNavigateToTest('standards')}
      />

      {/* 8. Role-Aware Sticky Footer Action Bar (§20, §24) */}
      <RoleAwareFooter
        userRole={userRole}
        scenario={scenario}
        onSaveSession={handleSaveSession}
        onContinueTesting={handleContinueTesting}
        onOpenReview={() => onNavigateToTest('review')}
        onAddComment={() => {
          showToast(
            'Audit Comment Logged',
            'Review comment added to cryptographic audit trail.',
            'info'
          );
        }}
        onSignCertificate={() => onNavigateToTest('review')}
        onViewAuditTrail={() => onNavigateToTest('audit')}
        onViewCertificate={() => onNavigateToTest('reports')}
        onResumeCorrection={() => onNavigateToTest('eccentricity_workspace')}
        isTraceabilityLocked={scenario === 'BLOCKED' || isTraceabilityLocked}
      />

      {/* 9. Statutory Evidence Dossier Modal (§15) */}
      <EvidenceDossierModal
        isOpen={isEvidenceModalOpen}
        onClose={() => setIsEvidenceModalOpen(false)}
        evidenceItems={evidenceItems}
        instrumentId={specs.serialNumber}
      />
    </div>
  );
};
