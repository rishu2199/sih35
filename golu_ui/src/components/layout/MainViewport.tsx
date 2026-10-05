import React from 'react';
import { Breadcrumbs } from './Breadcrumbs';
import { VerificationSessionHeader } from '../session/VerificationSessionHeader';
import { GlobalTestingLockoutBanner } from '../standards/GlobalTestingLockoutBanner';

export interface MainViewportProps {
  currentTab: string;
  onNavigateTab: (tab: string) => void;
  showSessionShell: boolean;
  activeSession?: any;
  standardsStatus?: 'VALID' | 'EXPIRING' | 'EXPIRED';
  isTraceabilityLocked?: boolean;
  onResolveTraceability?: () => void;
  children: React.ReactNode;
}

/**
 * MainViewport (§30, §35)
 * Stable viewport maintaining fixed header/session frames with soft content transitions
 */
export const MainViewport: React.FC<MainViewportProps> = ({
  currentTab,
  onNavigateTab,
  showSessionShell,
  activeSession,
  standardsStatus = 'VALID',
  isTraceabilityLocked = false,
  onResolveTraceability,
  children,
}) => {
  return (
    <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-[#F6F8FB] dark:bg-slate-950">
      
      {/* 1. Persistent Verification Session Header (§23, §24, §25) */}
      {showSessionShell && activeSession && (
        <VerificationSessionHeader
          session={activeSession}
          currentTab={currentTab}
          onNavigateTab={onNavigateTab}
          standardsStatus={standardsStatus}
          isTraceabilityLocked={isTraceabilityLocked}
          onNavigateToStandards={() => onNavigateTab('standards')}
        />
      )}

      {/* 2. Global Traceability Lockout Banner Placement (§26) */}
      {/* Placed immediately under Session Header, before page content */}
      {isTraceabilityLocked && currentTab !== 'standards' && currentTab !== 'dashboard' && (
        <GlobalTestingLockoutBanner
          expiredStandardId="SW-E2-014"
          onResolveTraceability={onResolveTraceability || (() => onNavigateTab('standards'))}
        />
      )}

      {/* 3. Page Content Viewport Wrapper with Standardized Width Constraints (§21, §22) */}
      <div className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="max-w-[1440px] mx-auto space-y-4">
          
          {/* Breadcrumbs Navigation (§20) */}
          <Breadcrumbs
            currentTab={currentTab}
            activeSession={activeSession}
            onNavigate={onNavigateTab}
          />

          {/* Page Content with gentle fade transition (§30) */}
          <div className="min-w-0 transition-opacity duration-150 ease-in-out">
            {children}
          </div>
        </div>
      </div>
    </main>
  );
};
