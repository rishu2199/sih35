import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Lock,
} from 'lucide-react';
import { GLOBAL_NAVIGATION, GlobalNavItem } from './navigationConfig';
import { SessionSidebar } from './SessionSidebar';

export interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  counts: {
    activeSessions: number;
    awaitingReview: number;
    needsAction: number;
  };
  standardsStatus?: 'VALID' | 'EXPIRING' | 'EXPIRED';
  isTraceabilityLocked?: boolean;
  userName?: string;
  userRole?: string;
  activeSession?: any;
  isSessionActive?: boolean;
}

/**
 * METROLOGIX-76 Global Sidebar (§14, §15, §16, §17, §31, §35, §36)
 * Supports:
 * - 4-pillar global navigation (WORK, ASSURANCE, OUTPUT, SYSTEM)
 * - Role-based permission filtering (§31)
 * - Contextual SessionSidebar delegation during active test sessions (§18, §19, §35)
 * - 240px ↔ 72px collapse with accessible hover tooltips
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  onToggleCollapse,
  counts,
  standardsStatus = 'VALID',
  isTraceabilityLocked = false,
  userName = 'R. Sharma',
  userRole = 'Metrologist',
  activeSession,
  isSessionActive = false,
}) => {
  const isAdmin = userRole.toLowerCase() === 'admin';

  const isItemActive = (key: string) => {
    if (key === currentTab) return true;
    if (key === 'sessions' && !isSessionActive && (
      currentTab === 'session_detail' ||
      currentTab === 'readiness' ||
      currentTab === 'preflight' ||
      currentTab === 'physical_inspection' ||
      currentTab === 'weighing_linearity' ||
      currentTab === 'eccentricity_workspace' ||
      currentTab === 'repeatability_workspace' ||
      currentTab === 'environmental_workspace'
    )) {
      return true;
    }
    if (key === 'instruments' && currentTab === 'intake') return true;
    if (key === 'review' && currentTab === 'review_workspace') return true;
    if (key === 'reports' && currentTab === 'certificates') return true;
    if (key === 'audit' && currentTab === 'audit_trail') return true;
    return false;
  };

  const getItemBadge = (item: GlobalNavItem) => {
    if (item.key === 'sessions' && counts.activeSessions > 0) {
      return {
        text: counts.activeSessions.toString().padStart(2, '0'),
        color: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-mono',
      };
    }
    if (item.key === 'review' && counts.awaitingReview > 0) {
      return {
        text: counts.awaitingReview.toString().padStart(2, '0'),
        color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 font-mono',
      };
    }
    if (item.key === 'standards' && (standardsStatus === 'EXPIRED' || standardsStatus === 'EXPIRING')) {
      return {
        text: '!',
        color: standardsStatus === 'EXPIRED' ? 'bg-rose-100 text-rose-700 font-bold' : 'bg-amber-100 text-amber-800 font-bold',
      };
    }
    if (item.key === 'design_system') {
      return {
        text: 'DEV',
        color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 font-mono text-[9px]',
      };
    }
    return null;
  };

  return (
    <aside
      className={`relative flex flex-col bg-white dark:bg-slate-900 border-r border-[#E4E8EF] dark:border-slate-800 transition-all duration-200 select-none z-30 shrink-0 ${
        collapsed ? 'w-[72px]' : 'w-[240px]'
      }`}
    >
      {/* Top Header / Brand Crest */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-[#E4E8EF] dark:border-slate-800">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#172554] text-white flex items-center justify-center font-black text-xs">
              ML
            </div>
            <div>
              <div className="text-xs font-bold tracking-tight text-slate-900 dark:text-white uppercase font-sans">
                METROLOGIX<span className="text-[#2563EB]">-76</span>
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                RRSL Bengaluru Node
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center">
            <div className="w-8 h-8 rounded-lg bg-[#172554] text-white flex items-center justify-center font-black text-xs">
              ML
            </div>
          </div>
        )}

        {/* Collapse toggle button */}
        <button
          type="button"
          onClick={onToggleCollapse}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Body: SessionSidebar if inside active session, else GlobalNavigation */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {isSessionActive ? (
          <SessionSidebar
            currentTab={currentTab}
            onSelectTab={onSelectTab}
            collapsed={collapsed}
            activeSession={activeSession}
            isTraceabilityLocked={isTraceabilityLocked}
          />
        ) : (
          <div className="flex-1 overflow-y-auto py-3 px-2 space-y-5">
            {GLOBAL_NAVIGATION.map((section) => (
              <div key={section.section} className="space-y-1">
                {!collapsed && (
                  <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                    {section.section}
                  </div>
                )}

                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const Icon = item.icon;
                    const active = isItemActive(item.key);
                    const badge = getItemBadge(item);
                    const isRestricted = item.adminOnly && !isAdmin;

                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => {
                          if (isRestricted) return;
                          onSelectTab(item.key);
                        }}
                        disabled={isRestricted}
                        title={collapsed ? item.label : isRestricted ? 'Restricted to System Administrator' : undefined}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all relative ${
                          isRestricted
                            ? 'opacity-40 cursor-not-allowed text-slate-400'
                            : active
                            ? 'bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 font-semibold cursor-pointer'
                            : 'text-[#475569] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white cursor-pointer'
                        } ${collapsed ? 'justify-center px-0' : ''}`}
                      >
                        {/* Leading indicator */}
                        {active && !isRestricted && (
                          <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#2563EB]" />
                        )}

                        <Icon
                          className={`w-4 h-4 shrink-0 transition-colors ${
                            active && !isRestricted
                              ? 'text-[#2563EB] dark:text-blue-400'
                              : 'text-[#64748B] dark:text-slate-500'
                          }`}
                        />

                        {!collapsed && (
                          <span className="flex-1 text-left truncate">{item.label}</span>
                        )}

                        {/* Restricted Lock Icon (§31) */}
                        {!collapsed && isRestricted && (
                          <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                        )}

                        {/* Badge */}
                        {!collapsed && badge && !isRestricted && (
                          <span
                            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md shrink-0 ${badge.color}`}
                          >
                            {badge.text}
                          </span>
                        )}

                        {collapsed && badge && !isRestricted && (
                          <span className="absolute top-1.5 right-3 w-2 h-2 rounded-full bg-blue-600" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Bottom User Profile Strip */}
      <div className="p-3 border-t border-[#E4E8EF] dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs shrink-0">
              {userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                {userName}
              </div>
              <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase truncate">
                {userRole}
              </div>
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-center" title={`${userName} (${userRole})`}>
            <div className="w-8 h-8 rounded-full bg-[#172554] text-white flex items-center justify-center font-bold text-xs">
              {userName.split(' ').map((n) => n[0]).join('').slice(0, 2)}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
