import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { SESSION_NAVIGATION } from './navigationConfig';

export interface SessionSidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  collapsed: boolean;
  activeSession?: any;
  isTraceabilityLocked?: boolean;
}

/**
 * SessionSidebar (§18, §19, §35, §37)
 * Contextual session navigation replacing global sidebar during verification workflows
 */
export const SessionSidebar: React.FC<SessionSidebarProps> = ({
  currentTab,
  onSelectTab,
  collapsed,
  activeSession,
  isTraceabilityLocked = false,
}) => {
  const serial = activeSession?.serialNumber || activeSession?.sessionNumber || 'AV-2026-8812';
  const model = activeSession?.model || activeSession?.instrumentModel || 'Avery ZM201 Platform';
  const accuracyClass = (activeSession?.accuracyClass || 'CLASS III').replace('_', ' ');

  const sessionOrder = [
    'session_detail',
    'readiness',
    'test_plan',
    'physical_inspection',
    'weighing_linearity',
    'eccentricity_workspace',
    'repeatability_workspace',
    'environmental_workspace',
    'review_workspace',
    'certificates',
  ];

  const getDynamicStepState = (itemId: string) => {
    if (itemId === currentTab) return 'current';
    if (isTraceabilityLocked && itemId !== 'readiness' && itemId !== 'session_detail') {
      return 'locked';
    }

    const itemIdx = sessionOrder.indexOf(itemId);
    const currentIdx = sessionOrder.indexOf(currentTab);

    if (activeSession?.complianceStatus === 'FAIL' && itemId === 'review_workspace') {
      return 'blocked';
    }

    if (currentIdx !== -1 && itemIdx !== -1) {
      if (itemIdx < currentIdx || activeSession?.reviewStatus === 'APPROVED') return 'completed';
      if (itemIdx === currentIdx) return 'current';
      return 'upcoming';
    }

    return 'upcoming';
  };

  return (
    <div className="flex flex-col h-full">
      {/* Active Session Identity Strip */}
      {!collapsed && (
        <div className="p-3 mx-2 my-2 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-900/60 space-y-1.5 shrink-0">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-mono font-black uppercase text-indigo-700 dark:text-indigo-400 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded shadow-2xs">
              {accuracyClass}
            </span>
            <button
              type="button"
              onClick={() => onSelectTab('sessions')}
              className="text-[10px] font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 cursor-pointer"
              title="Return to Sessions List"
            >
              <ArrowLeft className="w-3 h-3" />
              <span>Exit Session</span>
            </button>
          </div>
          <div className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
            {serial}
          </div>
          <div className="text-[10px] text-slate-500 truncate">
            {model}
          </div>
        </div>
      )}

      {/* Navigation Groups from config (§37) */}
      <div className="flex-1 overflow-y-auto py-2 px-2 space-y-4">
        {SESSION_NAVIGATION.map((section) => (
          <div key={section.group} className="space-y-1">
            {!collapsed && (
              <div className="px-3 text-[10px] font-mono font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
                {section.group}
              </div>
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const active = currentTab === item.key;
                const stepState = getDynamicStepState(item.key);

                return (
                  <button
                    key={item.key}
                    type="button"
                    onClick={() => onSelectTab(item.key)}
                    title={collapsed ? item.label : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-all relative cursor-pointer ${
                      active
                        ? 'bg-[#EFF6FF] dark:bg-blue-950/60 text-[#1D4ED8] dark:text-blue-300 font-semibold'
                        : 'text-[#475569] dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-white'
                    } ${collapsed ? 'justify-center px-0' : ''}`}
                  >
                    {/* Active Leading Indicator Bar */}
                    {active && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-[#2563EB]" />
                    )}

                    <Icon
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        active ? 'text-[#2563EB] dark:text-blue-400' : 'text-[#64748B] dark:text-slate-500'
                      }`}
                    />

                    {!collapsed && (
                      <span className="flex-1 text-left truncate">{item.label}</span>
                    )}

                    {/* Step State Badge: ✓, ●, ○, !, 🔒 (§19) */}
                    {!collapsed && (
                      <span className="shrink-0">
                        {stepState === 'completed' && (
                          <span
                            className="w-3.5 h-3.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-[9px] font-mono font-bold"
                            title="Completed Step"
                          >
                            ✓
                          </span>
                        )}
                        {stepState === 'current' && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" title="Active Step" />
                        )}
                        {stepState === 'blocked' && (
                          <span
                            className="w-3.5 h-3.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 flex items-center justify-center text-[9px] font-mono font-bold"
                            title="Blocked Step"
                          >
                            !
                          </span>
                        )}
                        {stepState === 'locked' && (
                          <span
                            className="w-3.5 h-3.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center text-[8px]"
                            title="Locked by Traceability"
                          >
                            🔒
                          </span>
                        )}
                        {stepState === 'upcoming' && (
                          <span
                            className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-700 text-slate-400 flex items-center justify-center text-[8px]"
                            title="Upcoming Step"
                          >
                            ○
                          </span>
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
