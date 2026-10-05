import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MainViewport } from './MainViewport';
import { BottomStatusStrip } from './BottomStatusStrip';
import { ToastProvider } from './ToastViewport';
import { GlobalOverlays } from './GlobalOverlays';

export interface AppShellProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  userRole?: string;
  onChangeRole?: (role: string) => void;
  userName?: string;
  onSignOut?: () => void;
  activeLab?: string;
  onSelectLab?: (lab: string) => void;
  activeSession?: any;
  counts?: {
    activeSessions: number;
    awaitingReview: number;
    needsAction: number;
  };
  standardsStatus?: 'VALID' | 'EXPIRING' | 'EXPIRED';
  isTraceabilityLocked?: boolean;
  onResolveTraceability?: () => void;
  onOpenDemoCenter?: () => void;
  onOpenJuryAssistant?: () => void;
  isDemoActive?: boolean;
  isJuryActive?: boolean;
  scaleConnected?: boolean;
  scaleModel?: string;
  activeScenarioId?: string | null;
  activeScenarioName?: string | null;
  onSelectScenario?: (scenarioId: string) => void;
  onExitScenario?: () => void;
  onLeaveSession?: () => void;
  hasUnsavedChanges?: boolean;
  onDiscardChanges?: () => void;
  connectionStatus?: 'online' | 'syncing' | 'offline';
  children: React.ReactNode;
}

/**
 * METROLOGIX-76 Application Shell Framework (§1, §2, §26, §27, §28, §30, §32, §33, §34, §35)
 * Master shell component composing Header, Sidebar, MainViewport, BottomStatusStrip, and GlobalOverlays.
 */
export const AppShell: React.FC<AppShellProps> = ({
  currentTab,
  onSelectTab,
  userRole = 'Metrologist',
  onChangeRole,
  userName = 'R. Sharma',
  onSignOut,
  activeLab = 'RRSL Bengaluru',
  onSelectLab,
  activeSession,
  counts = { activeSessions: 3, awaitingReview: 1, needsAction: 2 },
  standardsStatus = 'VALID',
  isTraceabilityLocked = false,
  onResolveTraceability,
  onOpenDemoCenter = () => {},
  onOpenJuryAssistant,
  isDemoActive = false,
  isJuryActive = false,
  scaleConnected = true,
  scaleModel = 'Avery ZM201 (COM3)',
  activeScenarioId,
  activeScenarioName,
  onSelectScenario,
  onExitScenario,
  onLeaveSession,
  hasUnsavedChanges = false,
  onDiscardChanges,
  connectionStatus = 'online',
  children,
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(false);
  const [pendingUnsavedTab, setPendingUnsavedTab] = useState<string | null>(null);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
    document.documentElement.classList.toggle('dark');
  };

  // Central Unsaved Changes Navigation Guard (§32)
  const handleSafeNavigate = (targetTab: string) => {
    if (targetTab === currentTab) return;

    if (hasUnsavedChanges) {
      setPendingUnsavedTab(targetTab);
    } else {
      onSelectTab(targetTab);
    }
  };

  const handleConfirmDiscard = () => {
    if (pendingUnsavedTab) {
      onDiscardChanges?.();
      onSelectTab(pendingUnsavedTab);
      setPendingUnsavedTab(null);
    }
  };

  const handleCancelDiscard = () => {
    setPendingUnsavedTab(null);
  };

  // Determine if currently within an active test session flow (§18)
  const isTestSessionView = [
    'readiness',
    'preflight',
    'test_plan',
    'physical_inspection',
    'weighing_linearity',
    'eccentricity_workspace',
    'repeatability_workspace',
    'environmental_workspace',
    'review_workspace',
    'review',
  ].includes(currentTab);

  const isSessionDetailView = currentTab === 'session_detail' || currentTab === 'instrument_detail';
  const showSessionShell = isTestSessionView || isSessionDetailView;

  const labCodeMap: Record<string, string> = {
    'RRSL Bengaluru': 'RRSL-BLR',
    'RRSL Ahmedabad': 'RRSL-AHM',
    'RRSL Delhi': 'RRSL-DEL',
    'Central LM Laboratory': 'CENTRAL-LM',
  };
  const activeLabCode = labCodeMap[activeLab] || 'RRSL-BLR';

  return (
    <ToastProvider>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#F6F8FB] dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200">
        
        {/* 1. Global Header (§3, §4, §5, §6, §7, §8, §9, §10, §11, §12, §13) */}
        <Header
          activeLab={activeLab}
          onSelectLab={onSelectLab}
          onOpenDemoCenter={onOpenDemoCenter}
          onOpenJuryAssistant={onOpenJuryAssistant}
          isDemoActive={isDemoActive}
          isJuryActive={isJuryActive}
          userName={userName}
          userRole={userRole}
          onChangeRole={onChangeRole}
          onSignOut={onSignOut}
          activeSession={activeSession}
          isSessionActive={showSessionShell}
          scaleConnected={scaleConnected}
          onToggleTheme={toggleDarkMode}
          isDarkMode={isDarkMode}
          onNavigateTab={handleSafeNavigate}
          activeScenarioId={activeScenarioId}
          onSelectScenario={onSelectScenario}
          onLeaveSession={onLeaveSession}
        />

        {/* 1b. Global Demo Scenario Banner (§12) */}
        {activeScenarioName && (
          <div className="bg-amber-500/10 dark:bg-amber-950/40 border-b border-amber-300 dark:border-amber-700/60 px-4 sm:px-6 py-2 flex items-center justify-between text-xs z-30 shrink-0 animate-in fade-in">
            <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200">
              <span className="font-mono font-bold uppercase tracking-wider text-[10px] px-1.5 py-0.5 rounded bg-amber-200/80 dark:bg-amber-900/80 border border-amber-300 dark:border-amber-700">
                DEMO SCENARIO
              </span>
              <span className="font-semibold">{activeScenarioName}</span>
            </div>
            {onExitScenario && (
              <button
                type="button"
                onClick={onExitScenario}
                className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-white dark:bg-slate-900 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700 hover:bg-amber-50 dark:hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                Exit Scenario
              </button>
            )}
          </div>
        )}

        {/* 2. Middle Body: Sidebar + MainViewport (§35) */}
        <div className="flex flex-1 overflow-hidden relative">
          
          {/* Sidebar (§14, §15, §16, §17, §18, §19, §31, §36, §37) */}
          <Sidebar
            currentTab={currentTab}
            onSelectTab={handleSafeNavigate}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
            counts={counts}
            standardsStatus={standardsStatus}
            isTraceabilityLocked={isTraceabilityLocked}
            userName={userName}
            userRole={userRole}
            activeSession={activeSession}
            isSessionActive={showSessionShell}
          />

          {/* Main Viewport Container (§26, §30, §35) */}
          <MainViewport
            currentTab={currentTab}
            onNavigateTab={handleSafeNavigate}
            showSessionShell={showSessionShell}
            activeSession={activeSession}
            standardsStatus={standardsStatus}
            isTraceabilityLocked={isTraceabilityLocked}
            onResolveTraceability={onResolveTraceability}
          >
            {children}
          </MainViewport>
        </div>

        {/* 3. Global Slim Status Strip (§33, §34) */}
        <BottomStatusStrip
          standardsValid={!isTraceabilityLocked}
          scaleConnected={scaleConnected}
          scaleModel={scaleModel}
          connectionStatus={connectionStatus}
          activeLabCode={activeLabCode}
        />

        {/* 4. Global Overlays: Unsaved Navigation Modal, Offline Banner, Jury Float Trigger (§27, §28, §32, §34, §35) */}
        <GlobalOverlays
          pendingUnsavedTab={pendingUnsavedTab}
          onCancelUnsavedNavigation={handleCancelDiscard}
          onConfirmUnsavedNavigation={handleConfirmDiscard}
          isOffline={connectionStatus === 'offline'}
          onOpenJuryAssistant={onOpenJuryAssistant}
          showJuryTrigger={!isJuryActive}
        />
      </div>
    </ToastProvider>
  );
};
