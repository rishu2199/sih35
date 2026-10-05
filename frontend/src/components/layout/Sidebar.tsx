import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ScanLine,
  Scale,
  Crosshair,
  Repeat,
  ThermometerSnowflake,
  Weight,
  FileCheck2,
  FileText,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ClipboardCheck,
  Radio,
  Camera,
  FileSpreadsheet,
} from 'lucide-react';
import { useLab } from '../../context/LabContext';

export type NavItemKey =
  | 'dashboard'
  | 'workspace'
  | 'live_bridge'
  | 'vision_audit'
  | 'excel_migration'
  | 'intake'
  | 'tam'
  | 'weighing'
  | 'eccentricity'
  | 'repeatability'
  | 'tare_temp'
  | 'traceability'
  | 'review'
  | 'audit'
  | 'reports';

interface SidebarProps {
  currentTab: NavItemKey;
  onSelectTab: (tab: NavItemKey) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  className?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isCollapsed,
  onToggleCollapse,
  className = '',
}) => {
  const { activeTestCount, lockedSessionCount, activeLab } = useLab();

  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        { key: 'dashboard' as NavItemKey, label: 'Dashboard', icon: LayoutDashboard },
        {
          key: 'workspace' as NavItemKey,
          label: 'Active Tests',
          icon: Activity,
          badge: activeTestCount > 0 ? `${activeTestCount}` : undefined,
          badgeColor: 'bg-brand-50 dark:bg-brand-950/50 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800/60',
        },
        { key: 'live_bridge' as NavItemKey, label: 'Scale Telemetry', icon: Radio },
      ],
    },
    {
      title: '7-STEP VERIFICATION',
      items: [
        { key: 'intake' as NavItemKey, label: '1. Intake & Specs', icon: ScanLine },
        { key: 'vision_audit' as NavItemKey, label: '2. Visual Inspection', icon: Camera },
        { key: 'weighing' as NavItemKey, label: '3. Weighing Error', icon: Scale },
        { key: 'eccentricity' as NavItemKey, label: '4. Eccentricity', icon: Crosshair },
        { key: 'repeatability' as NavItemKey, label: '5. Repeatability', icon: Repeat },
        { key: 'tare_temp' as NavItemKey, label: '6. Environmental Drift', icon: ThermometerSnowflake },
        { key: 'review' as NavItemKey, label: '7. Review & Sign', icon: ClipboardCheck },
      ],
    },
    {
      title: 'RECORDS & AUDIT',
      items: [
        {
          key: 'traceability' as NavItemKey,
          label: 'Standard Weights',
          icon: Weight,
          badge: lockedSessionCount > 0 ? `${lockedSessionCount} Issue` : undefined,
          badgeColor: 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60',
        },
        { key: 'reports' as NavItemKey, label: 'Certificates', icon: FileText },
        { key: 'audit' as NavItemKey, label: 'Audit Trail', icon: FileCheck2 },
        { key: 'excel_migration' as NavItemKey, label: 'Excel Migration', icon: FileSpreadsheet },
      ],
    },
  ];

  return (
    <aside
      className={`flex flex-col border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0d131f] transition-all duration-200 h-full shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto space-y-6 ${isCollapsed ? 'p-2' : 'py-4 px-3'}`}>
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <p className="px-3 pb-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                {section.title}
              </p>
            ) : (
              <div className="h-px bg-slate-100 dark:bg-slate-800 mx-1 my-2" />
            )}

            {section.items.map((item) => {
              const isActive = currentTab === item.key;
              const Icon = item.icon;
              return (
                <button
                  key={item.key}
                  onClick={() => onSelectTab(item.key)}
                  title={item.label}
                  className={`group relative flex items-center rounded-lg text-sm transition-all duration-150 cursor-pointer select-none border ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-200/80 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                      : 'border-transparent text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60 dark:hover:text-white font-medium'
                  } ${
                    isCollapsed
                      ? 'w-11 h-11 mx-auto justify-center p-0'
                      : 'w-full gap-3 px-3 py-2.5'
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-colors ${
                      isActive
                        ? 'text-blue-600 dark:text-blue-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}
                  />

                  {!isCollapsed && <span className="truncate">{item.label}</span>}

                  {!isCollapsed && item.badge && (
                    <span className={`ml-auto inline-flex items-center rounded-full px-2 py-0.5 text-xs font-mono font-semibold ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  )}

                  {isCollapsed && item.badge && (
                    <span className="absolute top-1.5 right-1.5 h-2.5 w-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer Info & Collapse Toggle */}
      <div className={`border-t border-slate-200/80 dark:border-slate-800/80 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {!isCollapsed ? (
          <div className="mb-2.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 p-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold text-slate-800 dark:text-slate-200">
                {activeLab.code}
              </span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold px-1.5 py-0.5 rounded bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                {activeLab.nablAccreditationNo || 'NABL'}
              </span>
            </div>
            <div className="mt-1.5 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <ShieldAlert className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
              <span className="truncate font-medium">OIML R 76 Statutory Terminal</span>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex justify-center" title={`${activeLab.name} (${activeLab.code})`}>
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              {activeLab.code.split('-')[1] || 'BLR'}
            </span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`flex items-center justify-center rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer ${
            isCollapsed ? 'w-11 h-11 mx-auto p-0' : 'w-full gap-2 py-2 px-3'
          }`}
          title={isCollapsed ? 'Expand' : 'Collapse'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span className="text-xs font-medium">Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
