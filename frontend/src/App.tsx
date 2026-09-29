import React, { useState } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LabProvider, useLab } from './context/LabContext';
import { ScenarioProvider } from './context/ScenarioContext';
import { IoTProvider } from './context/IoTContext';
import { Header } from './components/layout/Header';
import { Sidebar, type NavItemKey } from './components/layout/Sidebar';
import { Breadcrumbs } from './components/layout/Breadcrumbs';
import { LabDashboard } from './features/dashboard/LabDashboard';
import { InstrumentIntakeForm } from './features/intake/InstrumentIntakeForm';
import { ObservationGrid, ActiveTestsWorkspace, TestScopeMatrix, RepeatabilityView, TareTempView } from './features/testing';
import { PlatterHeatmap } from './features/testing/PlatterHeatmap';
import { ReviewPipeline } from './features/review';
import { LiveBridge } from './features/iot';
import { PhysicalAuditorView } from './features/vision';
import { ExcelIngestionView } from './features/ingestion/ExcelIngestionView';
import { ReportRepositoryView } from './features/reports';
import { LoginScreen } from './features/auth/LoginScreen';
import { JuryDemoAssistant } from './components/ui/JuryDemoAssistant';
import { LockoutBanner } from './components/ui/LockoutBanner';
import {
  Weight,
  FileCheck2,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeLab, lockedSessionCount, isAuthenticated, login } = useLab();

  const [currentTab, setCurrentTab] = useState<NavItemKey>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isJuryAssistantOpen, setIsJuryAssistantOpen] = useState(false);

  // If officer is not signed in, gate access with statutory authentication screen
  if (!isAuthenticated) {
    return <LoginScreen onLoginSuccess={(user) => login(user)} />;
  }

  // Helper breadcrumb generator based on active tab
  const getBreadcrumbs = () => {
    switch (currentTab) {
      case 'dashboard':
        return [{ label: 'Dashboard', isCurrent: true }];
      case 'workspace':
        return [{ label: 'Active Tests', isCurrent: true }];
      case 'live_bridge':
        return [{ label: 'Scale Bridge', isCurrent: true }];
      case 'intake':
        return [{ label: 'Instrument Intake', isCurrent: true }];
      case 'tam':
        return [
          { label: 'Tests' },
          { label: 'Test Scope Matrix', isCurrent: true },
        ];
      case 'vision_audit':
        return [
          { label: 'Tests' },
          { label: 'Visual Inspection', isCurrent: true },
        ];
      case 'weighing':
        return [
          { label: 'Tests' },
          { label: 'Weighing Error', isCurrent: true },
        ];
      case 'eccentricity':
        return [
          { label: 'Tests' },
          { label: 'Eccentricity', isCurrent: true },
        ];
      case 'repeatability':
        return [
          { label: 'Tests' },
          { label: 'Repeatability', isCurrent: true },
        ];
      case 'tare_temp':
        return [
          { label: 'Tests' },
          { label: 'Environmental Drift', isCurrent: true },
        ];
      case 'traceability':
        return [
          { label: 'Assurance' },
          { label: 'Standard Weights', isCurrent: true },
        ];
      case 'review':
        return [
          { label: 'Assurance' },
          { label: 'Review & Sign', isCurrent: true },
        ];
      case 'excel_migration':
        return [
          { label: 'Assurance' },
          { label: 'Excel Migration', isCurrent: true },
        ];
      case 'audit':
        return [
          { label: 'Compliance' },
          { label: 'Audit Trail', isCurrent: true },
        ];
      case 'reports':
        return [
          { label: 'Compliance' },
          { label: 'Certificates', isCurrent: true },
        ];
      default:
        return [{ label: 'Dashboard', isCurrent: true }];
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#080c14] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
      {/* Top Header */}
      <Header
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onNavigateToTab={(tab) => setCurrentTab(tab as NavItemKey)}
        onToggleJuryAssistant={() => setIsJuryAssistantOpen(!isJuryAssistantOpen)}
        isJuryAssistantOpen={isJuryAssistantOpen}
      />

      {/* Main Layout Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => {
            setCurrentTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="hidden lg:flex"
        />

        {/* Mobile Sidebar Overlay Drawer */}
        {isMobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
              onClick={() => setIsMobileSidebarOpen(false)}
            />
            <Sidebar
              currentTab={currentTab}
              onSelectTab={(tab) => {
                setCurrentTab(tab);
                setIsMobileSidebarOpen(false);
              }}
              isCollapsed={false}
              onToggleCollapse={() => setIsMobileSidebarOpen(false)}
              className="relative z-10 w-72 shadow-2xl"
            />
          </div>
        )}

        {/* Dynamic Main Workspace Container */}
        <main className="flex-1 overflow-y-auto">
          {/* Main Content Area */}
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
            {/* Top Breadcrumb */}
            <div className="flex items-center justify-between pb-1">
              <Breadcrumbs items={getBreadcrumbs()} />
              <span className="text-xs text-slate-400 font-mono hidden sm:inline">
                {activeLab.code}
              </span>
            </div>

            {currentTab === 'dashboard' && (
              <LabDashboard
                onNavigateToIntake={() => setCurrentTab('intake')}
                onNavigateToTesting={() => setCurrentTab('weighing')}
              />
            )}

            {currentTab === 'live_bridge' && (
              <LiveBridge onNavigateToTesting={() => setCurrentTab('weighing')} />
            )}

            {currentTab === 'vision_audit' && (
              <PhysicalAuditorView />
            )}

            {currentTab === 'weighing' && (
              <ObservationGrid />
            )}

            {currentTab === 'eccentricity' && (
              <PlatterHeatmap
                initialAccuracyClass="CLASS_III"
                maxCapacity={30000}
                e={5}
                d={5}
                unit="GRAM"
                stage="INITIAL_TYPE_APPROVAL"
                numSupports={4}
                initialGeometry="RECTANGLE"
              />
            )}

            {currentTab === 'repeatability' && (
              <RepeatabilityView onNavigateToDashboard={() => setCurrentTab('dashboard')} />
            )}

            {currentTab === 'tare_temp' && (
              <TareTempView onNavigateToDashboard={() => setCurrentTab('dashboard')} />
            )}

            {currentTab === 'traceability' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <Weight className="w-6 h-6 text-brand-400" />
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        OIML R 111 Standard Weight Sets &amp; Equipment Traceability
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Mandatory calibration certificate verification and automated lockout prevention conforming to Step 16.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('dashboard')}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors shadow-xs cursor-pointer"
                  >
                    Back to Dashboard
                  </button>
                </div>

                {lockedSessionCount > 0 && (
                  <LockoutBanner
                    weightSetCode="OIML-E2-BLR-04"
                    reasons={[
                      "Physical Standard Set OIML-E2-BLR-04 Certificate expired on 2026-08-15. Recalibration required before tests can proceed.",
                    ]}
                    violations={[
                      "Rule 14 of Legal Metrology (General) Rules 2011: Expired calibration validity.",
                      "OIML R 76-1 Clause 3.7.1: Uncertainty ratio U ≤ ⅓ MPE cannot be verified without unexpired certificate.",
                    ]}
                  />
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Active Sets
                    </span>
                    <div className="my-2">
                      <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        4 Sets
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-sans">
                      Ready for test execution
                    </span>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Expired Sets
                    </span>
                    <div className="my-2">
                      <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        1 Set
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-sans">
                      Hard lockout triggered
                    </span>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Next Scheduled Calibration
                    </span>
                    <div className="my-2">
                      <span className="text-3xl font-bold font-mono text-slate-900 dark:text-white tabular-nums">
                        2026-10-15
                      </span>
                    </div>
                    <span className="text-xs text-slate-400 font-sans">
                      RRSL Primary Class E1
                    </span>
                  </div>

                  <div className="p-5 rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs hover:border-slate-300 dark:hover:border-white/[0.15] transition-all flex flex-col justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Hierarchy Level
                    </span>
                    <div className="my-1">
                      <div className="text-3xl font-bold text-slate-900 dark:text-white leading-tight">
                        <div>Working</div>
                        <div>Standard</div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-400 font-sans mt-2">
                      Traceable to National Prototype
                    </span>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'excel_migration' && (
              <ExcelIngestionView />
            )}

            {currentTab === 'audit' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2.5">
                      <FileCheck2 className="w-6 h-6 text-brand-400 shrink-0" />
                      <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white font-display">
                        Statutory Immutable Audit Trail
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Cryptographic event sourcing (SHA-256) logging every raw observation change, operator credential, and verification status.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setCurrentTab('dashboard')}
                    className="px-4 py-2 rounded-xl border border-slate-700/60 bg-slate-900/60 hover:bg-slate-800 text-slate-200 text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
                  >
                    Back to Dashboard
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card">
                    <div className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                      CRYPTOGRAPHIC CHAIN
                    </div>
                    <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-3">
                      SHA-256
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-normal">
                      Tamper-evident hash link
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card">
                    <div className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                      RECORDED EVENTS
                    </div>
                    <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-3">
                      1,429
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-normal">
                      Full lifecycle coverage
                    </div>
                  </div>

                  <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card">
                    <div className="text-[11px] font-bold font-mono tracking-wider text-slate-400 uppercase">
                      INTEGRITY VERIFICATION
                    </div>
                    <div className="text-3xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-3">
                      VERIFIED 100%
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 font-normal">
                      Zero broken chain links
                    </div>
                  </div>
                </div>

                <div className="p-6 rounded-2xl border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c1322] shadow-card space-y-4 font-mono text-xs">
                  <div className="text-sm font-semibold text-slate-900 dark:text-slate-200 font-sans">
                    Recent Cryptographic Block Header
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070c18] break-all flex items-center gap-2">
                    <span className="text-brand-600 dark:text-brand-400 font-bold tracking-wider shrink-0">PREV_HASH:</span>
                    <span className="text-slate-700 dark:text-slate-300">e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</span>
                  </div>
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#070c18] break-all flex items-center gap-2">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold tracking-wider shrink-0">CURR_HASH:</span>
                    <span className="text-slate-700 dark:text-slate-300">8f434346648f6b96df89dda901c5176b10a6d83961dd3c1ac88b59b2dc327aa4</span>
                  </div>
                </div>
              </div>
            )}

            {currentTab === 'review' && (
              <ReviewPipeline />
            )}

            {currentTab === 'reports' && (
              <ReportRepositoryView
                onOpenSession={() => setCurrentTab('review')}
              />
            )}

            {currentTab === 'intake' && (
              <InstrumentIntakeForm
                onNavigateToTesting={(_sessionId) => setCurrentTab('weighing')}
              />
            )}

            {currentTab === 'workspace' && (
              <ActiveTestsWorkspace
                onNavigateToTest={(testType) => setCurrentTab(testType as NavItemKey)}
                onNavigateToIntake={() => setCurrentTab('intake')}
                onInspectLockout={() => setCurrentTab('traceability')}
              />
            )}

            {currentTab === 'tam' && (
              <TestScopeMatrix
                onNavigateToTest={(testType) => setCurrentTab(testType as NavItemKey)}
              />
            )}
          </div>

          {/* Statutory National Metrology Footer */}
          <footer className="mt-16 border-t border-slate-200/80 bg-white/90 dark:border-white/[0.08] dark:bg-[#0c121e]/90 text-xs text-slate-500 dark:text-slate-400 transition-colors relative">
            <div className="max-w-7xl mx-auto px-4 py-5 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-7 w-1 rounded-full bg-gradient-to-b from-amber-500 via-white to-emerald-600 shrink-0 shadow-xs" />
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      <span>METROLOGIX-76</span>
                      <span className="text-slate-400 dark:text-slate-600 font-normal">•</span>
                      <span className="text-slate-700 dark:text-slate-300 font-medium">Government of India Metrology Operating System</span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Under the Legal Metrology Act, 2009 &amp; OIML R 76–1:2006 (Non-automatic weighing instruments)
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    OIML R 76-1 COMPLIANT
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    OIML R 111-1 TRACEABLE
                  </span>
                  <span className="text-slate-400 dark:text-slate-600">•</span>
                  <span className="text-slate-600 dark:text-slate-400">
                    NABL ISO/IEC 17025
                  </span>
                </div>
              </div>
            </div>
          </footer>
        </main>
      </div>

      {/* Jury Demo Assistant Floating Banner */}
      <JuryDemoAssistant
        currentTab={currentTab}
        onNavigateToTab={(tab) => setCurrentTab(tab)}
        isOpen={isJuryAssistantOpen}
        onToggleOpen={() => setIsJuryAssistantOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LabProvider>
        <ScenarioProvider>
          <IoTProvider>
            <MainLayout />
          </IoTProvider>
        </ScenarioProvider>
      </LabProvider>
    </ThemeProvider>
  );
}

export default App;
