import React, { useState } from 'react';
import { AppShell } from './components/layout/AppShell';
import { DashboardView } from './components/views/DashboardView';
import { TestingWorkspaceView } from './components/views/TestingWorkspaceView';
import { ReviewView } from './components/views/ReviewView';
import { DemoControlModal } from './components/modals/DemoControlModal';
import { NewSessionModal } from './components/modals/NewSessionModal';
import { LoginView, UserAuthProfile } from './components/views/LoginView';
import { InstrumentIntakeView } from './components/views/InstrumentIntakeView';
import { InstrumentsView } from './components/views/InstrumentsView';
import { PhysicalInspectionView } from './components/views/PhysicalInspectionView';
import { WeighingLinearityView } from './components/views/WeighingLinearityView';
import { EccentricityWorkspaceView } from './components/views/EccentricityWorkspaceView';
import { RepeatabilityWorkspaceView } from './components/views/RepeatabilityWorkspaceView';
import { EnvironmentalDriftWorkspaceView } from './components/views/EnvironmentalDriftWorkspaceView';
import { StandardsTraceabilityView } from './components/views/StandardsTraceabilityView';
import { sessionRepository } from './repositories/sessionRepository';
import { GlobalTestingLockoutBanner } from './components/standards/GlobalTestingLockoutBanner';
import { INITIAL_STANDARD_WEIGHTS, StandardWeightSet } from './components/standards/types';
import { SessionsWorkspaceView } from './components/views/SessionsWorkspaceView';
import { TestApplicabilityView } from './components/views/TestApplicabilityView';
import { CryptographicAuditView } from './components/views/CryptographicAuditView';
import { CertificateRepositoryView } from './components/views/CertificateRepositoryView';
import { LiveHardwareBridgeView } from './components/views/LiveHardwareBridgeView';
import { LegacyExcelAuditorView } from './components/views/LegacyExcelAuditorView';
import { InstrumentSessionDetailView } from './components/views/InstrumentSessionDetailView';
import { TestReadinessPreflightView } from './components/views/TestReadinessPreflightView';
import { SettingsView } from './components/views/SettingsView';
import { DesignSystemShowcaseView } from './components/views/DesignSystemShowcaseView';
import { JuryDemoDrawer } from './components/jury/JuryDemoDrawer';
import { JuryDemoBanner } from './components/jury/JuryDemoBanner';
import { SpotlightOverlay } from './components/jury/SpotlightOverlay';
import { JURY_DEMO_STEPS } from './components/jury/juryDemoData';
import { ActiveSessionItem } from './components/sessions/types';
import {
  INITIAL_METRICS,
  INITIAL_VERIFICATION_SESSIONS,
  INITIAL_ATTENTION_ITEMS,
  INITIAL_COMPLIANCE,
  INSTRUMENT_PRESETS,
  CURRENT_HERO_SESSION,
  DEMO_SCENARIOS,
} from './mockData';
import {
  VerificationSession,
  AttentionItem,
  InstrumentPreset,
  ComplianceData,
  DemoScenario,
} from './types';
import { loadScenario, UnifiedVerificationSession } from './lib/session';

export const App: React.FC = () => {
  // Authentication Gateway State (Starts on Login Gateway)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserAuthProfile | null>(null);

  // Active Laboratory
  const [activeLab, setActiveLab] = useState<string>('Central LM Laboratory');

  // Navigation & View state
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [activeSession, setActiveSession] = useState<any>(() => loadScenario('standard_class_iii_retail'));

  // Application Data state (Page 02 specification data)
  const [sessions, setSessions] = useState<any[]>(INITIAL_VERIFICATION_SESSIONS);
  const [attentionItems, setAttentionItems] = useState<AttentionItem[]>(INITIAL_ATTENTION_ITEMS);
  const [metrics, setMetrics] = useState(INITIAL_METRICS);
  const [compliance, setCompliance] = useState<ComplianceData>(INITIAL_COMPLIANCE);

  // Jury Demo Assistant State (Page 17)
  const [isJuryAssistantOpen, setIsJuryAssistantOpen] = useState<boolean>(false);
  const [isJuryDemoActive, setIsJuryDemoActive] = useState<boolean>(false);
  const [activeSpotlightTitle, setActiveSpotlightTitle] = useState<string>('System Overview');
  const [spotlightKey, setSpotlightKey] = useState<number>(0);

  // Demo & Persona state
  const [currentPersona, setCurrentPersona] = useState<string>('officer');
  const [isEmptyState, setIsEmptyState] = useState<boolean>(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState<boolean>(false);
  const [isNewSessionModalOpen, setIsNewSessionModalOpen] = useState<boolean>(false);
  const [activeScenarioId, setActiveScenarioId] = useState<string | null>(null);

  const scenarioNameMap: Record<string, string> = {
    standard_class_iii_retail: 'Standard Class III Retail',
    rounding_discrepancy_trap: 'Rounding Discrepancy Trap',
    temperature_span_drift_fail: 'Temperature Span Drift',
    eccentricity_cantilever_twist: 'Eccentricity Cantilever Twist',
    high_interval_class_i_analytical: 'High-Interval Class I',
  };
  const activeScenarioName = activeScenarioId ? scenarioNameMap[activeScenarioId] || activeScenarioId : null;

  // Standards and Traceability state (Page 09)
  const [standards, setStandards] = useState<StandardWeightSet[]>(INITIAL_STANDARD_WEIGHTS);
  const expiredStandard = standards.find((s) => s.status === 'EXPIRED');
  const isTraceabilityLocked = !!expiredStandard;
  const expiringStandard = standards.find((s) => s.status === 'EXPIRING');
  const standardsStatus: 'VALID' | 'EXPIRING' | 'EXPIRED' = expiredStandard
    ? 'EXPIRED'
    : expiringStandard
    ? 'EXPIRING'
    : 'VALID';

  // Persona lookup
  const personaMap: Record<string, { name: string; role: string }> = {
    officer: { name: 'R. Sharma', role: 'Metrologist' },
    reviewer: { name: 'A. Gupta', role: 'Reviewer' },
    director: { name: 'S. Kumar', role: 'Director' },
    auditor: { name: 'P. Das', role: 'Auditor' },
    admin: { name: 'Admin', role: 'Admin' },
  };

  const activePersona = personaMap[currentPersona] || personaMap.officer;

  const handleLoginSuccess = (user: UserAuthProfile) => {
    setCurrentUser(user);
    if (user.role === 'Reviewer') {
      setCurrentPersona('reviewer');
    } else if (user.role === 'Director') {
      setCurrentPersona('director');
    } else if (user.role === 'Admin') {
      setCurrentPersona('admin');
    } else if (user.role === 'Auditor') {
      setCurrentPersona('auditor');
    } else {
      setCurrentPersona('officer');
    }
    setIsAuthenticated(true);
    setCurrentTab('dashboard');
  };

  // Handlers
  const handleOpenDemoCenter = () => {
    setIsDemoModalOpen(true);
  };

  const handleOpenJuryAssistant = () => {
    setIsJuryAssistantOpen(true);
    setIsJuryDemoActive(true);
  };

  const handleJuryNavigate = (tabId: string) => {
    setCurrentTab(tabId);
    const step = JURY_DEMO_STEPS.find((s) => s.targetTab === tabId);
    setActiveSpotlightTitle(step ? step.title : tabId.replace(/_/g, ' ').toUpperCase());
    setSpotlightKey((prev) => prev + 1);
  };

  const handleNewSession = () => {
    setCurrentTab('intake');
  };

  const handleContinueTesting = (sessionId: string) => {
    const matched = sessions.find((s) => s.id === sessionId || s.sessionNumber === sessionId);
    setActiveSession(matched || CURRENT_HERO_SESSION);
    setCurrentTab('testing_workspace');
  };

  const handleSelectSessionFromWorkspace = (sess: ActiveSessionItem) => {
    const matched = sessions.find((s) => s.id === sess.id || s.sessionNumber === sess.sessionNumber);
    const sessionObj = matched || {
      ...CURRENT_HERO_SESSION,
      id: sess.id,
      sessionNumber: sess.sessionNumber,
      instrument: `${sess.manufacturer} ${sess.model}`,
      model: sess.model,
      manufacturer: sess.manufacturer,
      accuracyClass: sess.accuracyClass,
      maxCapacity: sess.maxCapacity,
      interval: sess.interval,
    };
    setActiveSession(sessionObj);
    setCurrentTab(sess.targetView);
  };

  const handleOpenTestPlanFromSession = (sess: ActiveSessionItem) => {
    const matched = sessions.find((s) => s.id === sess.id || s.sessionNumber === sess.sessionNumber);
    const sessionObj = matched || {
      ...CURRENT_HERO_SESSION,
      id: sess.id,
      sessionNumber: sess.sessionNumber,
      instrument: `${sess.manufacturer} ${sess.model}`,
      model: sess.model,
      manufacturer: sess.manufacturer,
      accuracyClass: sess.accuracyClass,
      maxCapacity: sess.maxCapacity,
      interval: sess.interval,
    };
    setActiveSession(sessionObj);
    setCurrentTab('test_plan');
  };

  const handleSelectSession = (session: any) => {
    setActiveSession(session);
    setCurrentTab('session_detail');
  };

  const handleSelectAttentionItem = (item: AttentionItem) => {
    if (item.sessionId) {
      handleContinueTesting(item.sessionId);
    } else {
      setCurrentTab('standards');
    }
  };

  const handleSelectPreset = async (preset: any) => {
    let key = preset.presetKey || 'avery';
    if (!preset.presetKey) {
      const pl = (preset.brand || preset.model || preset.name || preset.manufacturer || '').toLowerCase();
      if (pl.includes('mettler') || pl.includes('xpr') || (preset.classLabel && preset.classLabel.includes('Class I'))) key = 'mettler';
      else if (pl.includes('sansui') || pl.includes('gold') || (preset.classLabel && preset.classLabel.includes('Class II'))) key = 'sansui';
      else if (pl.includes('essae') || pl.includes('ds') || (preset.classLabel && preset.classLabel.includes('Class IIII'))) key = 'essae';
    }

    try {
      const newSession = await sessionRepository.createFromPreset(key);
      setActiveSession(newSession);
      setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
      setMetrics((prev) => ({
        ...prev,
        activeVerifications: prev.activeVerifications + 1,
      }));
    } catch (e) {
      console.warn('Error loading preset session', e);
    }
    // Section 11 & Section 37 & 50:
    // "preset loaded -> instrument prefilled -> new session created -> session overview"
    setCurrentTab('session_detail');
  };

  const handleCreateSession = (newSessionData: any) => {
    const newSession: any = {
      id: `VR-${Math.floor(1000 + Math.random() * 9000)}`,
      sessionNumber: `VR-${Math.floor(1000 + Math.random() * 9000)}`,
      instrument: newSessionData.instrumentModel || 'Commercial Scale',
      model: newSessionData.instrumentModel || 'Platform Scale',
      manufacturer: newSessionData.manufacturer || 'Approved Manufacturer',
      accuracyClass: newSessionData.accuracyClass || 'Class III',
      maxCapacity: newSessionData.maxCapacity || '30 kg',
      interval: newSessionData.verificationInterval || 'e = 5 g',
      procedure: 'Visual Inspection',
      progressText: '1 / 7',
      status: 'PENDING',
      updated: 'Just now',
      actionText: 'View',
    };

    setSessions([newSession, ...sessions]);
    setMetrics((prev) => ({
      ...prev,
      activeVerifications: prev.activeVerifications + 1,
    }));
    setActiveSession(newSession);
    setCurrentTab('testing_workspace');
  };

  const handleSelectDemoScenario = (scenario: DemoScenario) => {
    const fullSession = loadScenario(scenario.id);
    setActiveSession(fullSession);

    // Synchronize sessions list for consistent global dashboard state
    const isPass = fullSession.complianceStatus === 'PASS';
    const inst = (typeof fullSession.instrument === 'object' && fullSession.instrument)
      ? fullSession.instrument
      : {
          manufacturer: fullSession.manufacturer || 'Avery Weigh-Tronix',
          modelName: fullSession.model || 'ZM201 Platform',
          accuracyClass: (fullSession.accuracyClass || 'CLASS_III') as string,
          maxCapacity: fullSession.maxCapacity || 30,
          unit: 'kg',
          e: 0.005,
        };

    const listEntry: any = {
      id: fullSession.id,
      sessionNumber: fullSession.sessionNumber,
      instrument: `${inst.manufacturer} ${inst.modelName}`,
      model: inst.modelName,
      manufacturer: inst.manufacturer,
      accuracyClass: String(inst.accuracyClass).replace('_', ' '),
      maxCapacity: `${inst.maxCapacity} ${inst.unit}`,
      interval: `e = ${inst.e} ${inst.unit}`,
      procedure: fullSession.currentProcedure || 'Weighing Linearity',
      progressText: `${fullSession.activeStep || 1} / 7`,
      status: isPass ? 'PASS' : 'FAIL',
      updated: 'Just now',
      actionText: isPass ? 'Continue' : 'Review',
    };

    setSessions([listEntry, ...sessions.filter((s) => s.id !== fullSession.id)]);

    // Direct routing to showcase the exact metrological scenario highlight (§15, §16)
    const norm = scenario.id.toLowerCase();
    if (norm.includes('rounding') || norm.includes('trap')) {
      setCurrentTab('weighing_linearity');
    } else if (norm.includes('temp') || norm.includes('drift')) {
      setCurrentTab('environmental_workspace');
    } else if (norm.includes('cantilever') || norm.includes('eccentricity')) {
      setCurrentTab('eccentricity_workspace');
    } else if (norm.includes('micro') || norm.includes('class_i') || norm.includes('analytical')) {
      setCurrentTab('review_workspace');
    } else {
      setCurrentTab('weighing_linearity');
    }
  };

  const handleSelectScenarioById = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    handleSelectDemoScenario({
      id: scenarioId,
      name: scenarioNameMap[scenarioId] || scenarioId,
      subtitle: '',
      expectedVerdict: 'PASS',
      classType: 'CLASS_III',
      description: '',
    });
  };

  const handleExitScenario = () => {
    setActiveScenarioId(null);
    const baseline = loadScenario('standard_class_iii_retail');
    setActiveSession(baseline);
    setCurrentTab('dashboard');
  };

  const handleLeaveSession = () => {
    setCurrentTab('dashboard');
  };

  const handleApproveSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, status: 'PASS', actionText: 'View', updated: 'Just now' } : s
      )
    );
    setMetrics((prev) => ({
      ...prev,
      pendingSignOff: Math.max(0, prev.pendingSignOff - 1),
    }));
    setCurrentTab('dashboard');
  };

  const handleRemandSession = (sessionId: string) => {
    setSessions((prev) =>
      prev.map((s) =>
        s.id === sessionId ? { ...s, status: 'FAIL', actionText: 'View', updated: 'Just now' } : s
      )
    );
    setCurrentTab('dashboard');
  };

  const handleResetData = () => {
    setSessions(INITIAL_VERIFICATION_SESSIONS);
    setAttentionItems(INITIAL_ATTENTION_ITEMS);
    setMetrics(INITIAL_METRICS);
    setCompliance(INITIAL_COMPLIANCE);
    setIsEmptyState(false);
  };

  // If not authenticated, render Login / Authentication Gateway (Page 01)
  if (!isAuthenticated) {
    return <LoginView onLoginSuccess={handleLoginSuccess} />;
  }

  // Display Page 02 Home / Operational Dashboard inside Application Shell
  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F6F8FB] text-foundation-900 font-sans antialiased">
      {/* 0. Top Presentation Banner (if Jury Demo active) */}
      <JuryDemoBanner
        isActive={isJuryDemoActive}
        isOpen={isJuryAssistantOpen}
        currentStepNumber={1}
        totalSteps={JURY_DEMO_STEPS.length}
        currentStepTitle="Government Legal Metrology Automation"
        onOpenAssistant={() => setIsJuryAssistantOpen(true)}
      />

      {/* Permanent Application Shell Framework */}
      <AppShell
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
        }}
        userName={currentUser ? currentUser.name : activePersona.name}
        userRole={currentUser ? currentUser.role : activePersona.role}
        onChangeRole={(role) => {
          const r = role.toLowerCase();
          if (r.includes('review')) setCurrentPersona('reviewer');
          else if (r.includes('direct')) setCurrentPersona('director');
          else if (r.includes('admin')) setCurrentPersona('admin');
          else if (r.includes('audit')) setCurrentPersona('auditor');
          else setCurrentPersona('officer');
        }}
        activeLab={activeLab}
        onSelectLab={(lab) => setActiveLab(lab)}
        onSignOut={() => setIsAuthenticated(false)}
        activeSession={activeSession}
        counts={{
          activeSessions: metrics.activeVerifications,
          awaitingReview: metrics.pendingSignOff,
          needsAction: attentionItems.length,
        }}
        standardsStatus={standardsStatus}
        isTraceabilityLocked={isTraceabilityLocked}
        onResolveTraceability={() => setCurrentTab('standards')}
        onOpenDemoCenter={handleOpenDemoCenter}
        onOpenJuryAssistant={handleOpenJuryAssistant}
        isDemoActive={isDemoModalOpen}
        isJuryActive={isJuryDemoActive}
        scaleConnected={true}
        scaleModel="Avery ZM201 (COM3)"
        activeScenarioId={activeScenarioId}
        activeScenarioName={activeScenarioName}
        onSelectScenario={handleSelectScenarioById}
        onExitScenario={handleExitScenario}
        onLeaveSession={handleLeaveSession}
      >
            {currentTab === 'intake' ? (
              <InstrumentIntakeView
                userRole={currentUser?.role || activePersona.role}
                onBackToHome={() => setCurrentTab('instruments')}
                onRegisterSuccess={async (data) => {
                  try {
                    const newSession = await sessionRepository.createFromIntake({
                      manufacturer: data.manufacturer,
                      modelName: data.model,
                      serialNumber: data.serialNumber,
                      approvalNumber: data.approvalNumber,
                      accuracyClass: data.accuracyClass,
                      maxCapacity: parseFloat(data.maxCapacity) || 30,
                      minCapacity: 0.1,
                      verificationInterval: parseFloat(data.verificationInterval?.replace(/[^0-9.]/g, '')) || 0.005,
                      scaleInterval: parseFloat(data.scaleInterval?.replace(/[^0-9.]/g, '')) || 0.005,
                      unit: data.unit || 'kg',
                    });
                    setActiveSession(newSession);
                    setSessions((prev) => [newSession, ...prev.filter((s) => s.id !== newSession.id)]);
                    setMetrics((prev) => ({
                      ...prev,
                      activeVerifications: prev.activeVerifications + 1,
                    }));
                  } catch (e) {
                    console.warn('Error creating session from intake', e);
                  }
                  setCurrentTab('session_detail');
                }}
              />
            ) : currentTab === 'instruments' ? (
              <InstrumentsView
                onRegisterNew={() => setCurrentTab('intake')}
                onOpenSession={(sess) => {
                  setActiveSession(sess);
                  setCurrentTab('session_detail');
                }}
                userRole={currentUser?.role || activePersona.role}
              />
            ) : currentTab === 'physical_inspection' ? (
              <PhysicalInspectionView
                session={activeSession}
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onNavigatePrevious={() => setCurrentTab('test_plan')}
                onUpdateSession={(updatedSession) => setActiveSession(updatedSession)}
                onContinueToWeighing={(updatedSession) => {
                  setActiveSession(updatedSession);
                  setCurrentTab('weighing_linearity');
                }}
              />
            ) : currentTab === 'weighing_linearity' ? (
              <WeighingLinearityView
                session={activeSession}
                userRole={currentUser?.role || activePersona.role}
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onNavigatePrevious={() => setCurrentTab('physical_inspection')}
                onUpdateSession={(updatedSession) => setActiveSession(updatedSession)}
                onContinueToEccentricity={(updatedSession) => {
                  setActiveSession(updatedSession);
                  setCurrentTab('eccentricity_workspace');
                }}
              />
            ) : currentTab === 'eccentricity_workspace' ? (
              <EccentricityWorkspaceView
                session={activeSession}
                userRole={currentUser?.role || activePersona.role}
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onNavigatePrevious={() => setCurrentTab('weighing_linearity')}
                onUpdateSession={(updatedSession) => setActiveSession(updatedSession)}
                onContinueToRepeatability={(updatedSession) => {
                  setActiveSession(updatedSession);
                  setCurrentTab('repeatability_workspace');
                }}
              />
            ) : currentTab === 'repeatability_workspace' ? (
              <RepeatabilityWorkspaceView
                session={activeSession}
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onNavigatePrevious={() => setCurrentTab('eccentricity_workspace')}
                onUpdateSession={(updatedSession) => setActiveSession(updatedSession)}
                onContinueToEnvironment={(updatedSession) => {
                  setActiveSession(updatedSession);
                  setCurrentTab('environmental_workspace');
                }}
              />
            ) : currentTab === 'environmental_workspace' ? (
              <EnvironmentalDriftWorkspaceView
                session={activeSession}
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onNavigatePrevious={() => setCurrentTab('repeatability_workspace')}
                onUpdateSession={(updatedSession) => setActiveSession(updatedSession)}
                onContinueToReview={(updatedSession) => {
                  setActiveSession(updatedSession);
                  setCurrentTab('review_workspace');
                }}
              />
            ) : currentTab === 'sessions' ? (
              <SessionsWorkspaceView
                onSelectSession={(sess) => {
                  setActiveSession(sess);
                  setCurrentTab('session_detail');
                }}
                onNewVerification={handleNewSession}
                onOpenTestPlan={handleOpenTestPlanFromSession}
                onOpenDemoCenter={handleOpenDemoCenter}
                isTraceabilityLocked={isTraceabilityLocked}
                onResolveTraceability={() => setCurrentTab('standards')}
                onViewSessionDetail={(sess) => {
                  setActiveSession(sess);
                  setCurrentTab('session_detail');
                }}
              />
            ) : currentTab === 'test_plan' ? (
              <TestApplicabilityView
                session={activeSession}
                standardsValid={!isTraceabilityLocked}
                userRole={currentUser?.role || activePersona.role}
                onBackToSessions={() => setCurrentTab('sessions')}
                onNavigateToTest={(targetView) => setCurrentTab(targetView)}
                onNavigateToStandards={() => setCurrentTab('standards')}
              />
            ) : currentTab === 'testing_workspace' ? (
              <TestingWorkspaceView
                session={activeSession}
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onSessionUpdate={(updated) => setActiveSession(updated)}
              />
            ) : currentTab === 'standards' ? (
              <StandardsTraceabilityView
                standards={standards}
                onUpdateStandards={(updated) => setStandards(updated)}
                onBackToDashboard={() => setCurrentTab('dashboard')}
              />
            ) : currentTab === 'review_workspace' || currentTab === 'review' ? (
              <ReviewView
                session={activeSession}
                userRole={currentUser?.role || activePersona.role}
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onApprove={handleApproveSession}
                onRemand={handleRemandSession}
                onNavigateToTest={(targetView) => setCurrentTab(targetView)}
              />
            ) : currentTab === 'audit' || currentTab === 'audit_trail' ? (
              <CryptographicAuditView
                initialSessionId={activeSession?.id || 'VR-2026-00417'}
                onBackToDashboard={() => setCurrentTab('dashboard')}
                userRole={currentUser?.role || activePersona.role}
              />
            ) : currentTab === 'reports' || currentTab === 'certificates' || currentTab === 'certificate_repository' ? (
              <CertificateRepositoryView
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onNavigateToAudit={(_sessId) => setCurrentTab('audit')}
                userRole={currentUser?.role || activePersona.role}
              />
            ) : currentTab === 'bridge' || currentTab === 'hardware_bridge' ? (
              <LiveHardwareBridgeView
                onBackToDashboard={() => setCurrentTab('dashboard')}
                activeSession={activeSession}
                onUseReadingInTest={(_weight, _unit) => {
                  if (activeSession) {
                    setCurrentTab('repeatability_workspace');
                  }
                }}
                userRole={currentUser?.role || activePersona.role}
              />
            ) : currentTab === 'excel_auditor' || currentTab === 'flaw_auditor' ? (
              <LegacyExcelAuditorView
                onBackToDashboard={() => setCurrentTab('dashboard')}
                onNavigateToTestSession={(_sessionId) => {
                  handleNewSession();
                }}
                userRole={currentUser?.role || activePersona.role}
              />
            ) : currentTab === 'session_detail' || currentTab === 'instrument_detail' ? (
              <InstrumentSessionDetailView
                session={activeSession}
                onBackToSessions={() => setCurrentTab('sessions')}
                onNavigateToTest={(targetView) => setCurrentTab(targetView)}
                userRole={currentUser?.role || activePersona.role}
                isTraceabilityLocked={isTraceabilityLocked}
              />
            ) : currentTab === 'readiness' || currentTab === 'preflight' ? (
              <TestReadinessPreflightView
                session={activeSession}
                onBackToSession={() => setCurrentTab('session_detail')}
                onNavigateToTab={(tabId) => setCurrentTab(tabId)}
                onStartVerification={() => setCurrentTab('test_plan')}
                userRole={currentUser?.role || activePersona.role}
                isGloballyTraceabilityLocked={isTraceabilityLocked}
              />
            ) : currentTab === 'design_system' || currentTab === 'showcase' ? (
              <DesignSystemShowcaseView
                onBackToDashboard={() => setCurrentTab('dashboard')}
              />
            ) : currentTab === 'settings' ? (
              <SettingsView
                onNavigate={(targetView) => setCurrentTab(targetView)}
                currentUserRole={((currentUser?.role?.toUpperCase() || activePersona?.role?.toUpperCase() || 'ADMIN') as any)}
                onOpenJuryDemo={() => setIsJuryAssistantOpen(true)}
              />
            ) : (
              <DashboardView
                metrics={metrics}
                sessions={sessions}
                attentionItems={attentionItems}
                compliance={compliance}
                presets={INSTRUMENT_PRESETS}
                isEmptyState={isEmptyState}
                onNewVerification={handleNewSession}
                onContinueTesting={handleContinueTesting}
                onSelectSession={handleSelectSession}
                onSelectAttentionItem={handleSelectAttentionItem}
                onSelectPreset={handleSelectPreset}
                onOpenDemoCenter={handleOpenDemoCenter}
                onViewAllSessions={() => setCurrentTab('sessions')}
                userRole={currentUser?.role || activePersona.role}
                standardsStatus={standardsStatus}
                isTraceabilityLocked={isTraceabilityLocked}
                onFilterClick={(filter) => {
                  if (filter === 'traceability') setCurrentTab('standards');
                  else if (filter === 'review') setCurrentTab('review');
                  else if (filter === 'active') setCurrentTab('sessions');
                }}
              />
            )}
      </AppShell>

      {/* 4. Modals */}
      <DemoControlModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onSelectScenario={handleSelectDemoScenario}
        currentPersona={currentPersona}
        onChangePersona={setCurrentPersona}
        isEmptyState={isEmptyState}
        onToggleEmptyState={() => setIsEmptyState(!isEmptyState)}
        onResetData={handleResetData}
      />

      <NewSessionModal
        isOpen={isNewSessionModalOpen}
        onClose={() => setIsNewSessionModalOpen(false)}
        onCreateSession={handleCreateSession}
      />

      {/* 5. Jury Demo Assistant Floating Presentation Layer (Page 17) */}
      <JuryDemoDrawer
        isOpen={isJuryAssistantOpen}
        onClose={() => setIsJuryAssistantOpen(false)}
        onNavigateToTab={handleJuryNavigate}
        onSwitchPersona={(role) => setCurrentPersona(role)}
        onLoadScenario={(scenarioId) => {
          const matched = DEMO_SCENARIOS.find((s) => s.id === scenarioId);
          if (matched) {
            handleSelectDemoScenario(matched);
          }
        }}
        currentTab={currentTab}
      />

      {/* 6. Spotlight Highlight Callout */}
      <SpotlightOverlay
        activeStepTitle={activeSpotlightTitle}
        triggerKey={spotlightKey}
      />
    </div>
  );
};

export default App;
