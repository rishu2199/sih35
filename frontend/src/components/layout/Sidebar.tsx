import React from 'react';
import {
  LayoutDashboard,
  Activity,
  ScanLine,
  Grid3X3,
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
        {
          key: 'dashboard' as NavItemKey,
          label: 'Dashboard',
          icon: LayoutDashboard,
        },
        {
          key: 'workspace' as NavItemKey,
          label: 'Active Tests',
          icon: Activity,
          badge: activeTestCount > 0 ? `${activeTestCount}` : undefined,
          badgeColor: 'bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-800',
        },
        {
          key: 'live_bridge' as NavItemKey,
          label: 'Scale Bridge (IoT)',
          icon: Radio,
        },
      ],
    },
    {
      title: 'TEST BATTERY (R 76)',
      items: [
        {
          key: 'intake' as NavItemKey,
          label: 'Instrument Intake',
          icon: ScanLine,
        },
        {
          key: 'tam' as NavItemKey,
          label: 'Test Scope',
          icon: Grid3X3,
        },
        {
          key: 'vision_audit' as NavItemKey,
          label: 'Visual Inspection',
          icon: Camera,
        },
        {
          key: 'weighing' as NavItemKey,
          label: 'Weighing Error',
          icon: Scale,
        },
        {
          key: 'eccentricity' as NavItemKey,
          label: 'Eccentricity',
          icon: Crosshair,
        },
        {
          key: 'repeatability' as NavItemKey,
          label: 'Repeatability',
          icon: Repeat,
        },
        {
          key: 'tare_temp' as NavItemKey,
          label: 'Environmental Drift',
          icon: ThermometerSnowflake,
        },
      ],
    },
    {
      title: 'ASSURANCE & AUDIT',
      items: [
        {
          key: 'review' as NavItemKey,
          label: 'Review & Sign',
          icon: ClipboardCheck,
        },
        {
          key: 'traceability' as NavItemKey,
          label: 'Standard Weights',
          icon: Weight,
          badge: lockedSessionCount > 0 ? `${lockedSessionCount} Issue` : undefined,
          badgeColor: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800',
        },
        {
          key: 'excel_migration' as NavItemKey,
          label: 'Excel Migration',
          icon: FileSpreadsheet,
        },
        {
          key: 'audit' as NavItemKey,
          label: 'Audit Trail',
          icon: FileCheck2,
        },
        {
          key: 'reports' as NavItemKey,
          label: 'Certificates',
          icon: FileText,
        },
      ],
    },
  ];

  return (
    <aside
      className={`fixed lg:sticky top-16 left-0 z-30 flex flex-col border-r border-slate-200/80 dark:border-white/[0.08] bg-white/95 dark:bg-[#0c121e]/95 backdrop-blur-md transition-all duration-200 h-[calc(100vh-4rem)] shrink-0 ${
        isCollapsed ? 'w-16' : 'w-64'
      } ${className}`}
    >
      {/* Navigation Links */}
      <div className={`flex-1 overflow-y-auto space-y-6 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!isCollapsed ? (
              <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 select-none">
                {section.title}
              </p>
            ) : (
              <div className="h-1.5" />
            )}

            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = currentTab === item.key;
                const Icon = item.icon;
                return (
                  <button
                    key={item.key}
                    onClick={() => onSelectTab(item.key)}
                    title={item.label}
                    className={`group relative flex items-center rounded-lg text-xs font-medium transition-colors cursor-pointer select-none ${
                      isActive
                        ? 'bg-brand-50 dark:bg-brand-950/40 text-brand-700 dark:text-brand-300 font-semibold'
                        : 'text-slate-600 hover:bg-slate-100/70 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                    } ${
                      isCollapsed
                        ? 'w-10 h-10 mx-auto justify-center p-0'
                        : 'w-full gap-3 px-3 py-2'
                    }`}
                  >
                    {/* Clean active indicator line */}
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-full bg-brand-600 dark:bg-brand-400" />
                    )}

                    <Icon
                      className={`h-4 w-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-brand-600 dark:text-brand-400'
                          : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300'
                      }`}
                    />

                    {!isCollapsed && <span className="truncate">{item.label}</span>}

                    {!isCollapsed && item.badge && (
                      <span
                        className={`ml-auto inline-flex items-center rounded-md px-1.5 py-0.2 text-[10px] font-bold ${item.badgeColor}`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {isCollapsed && item.badge && (
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Info Box & Collapse Toggle */}
      <div className={`border-t border-slate-200/80 dark:border-slate-800/80 bg-slate-50/50 dark:bg-[#090d16]/50 ${isCollapsed ? 'p-2' : 'p-3'}`}>
        {!isCollapsed ? (
          <div className="mb-2 rounded-lg border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c121e] p-2.5 text-[11px]">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                {activeLab.code}
              </span>
              <span className="font-mono text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                {activeLab.nablAccreditationNo || 'NABL'}
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-slate-500 dark:text-slate-400">
              <ShieldAlert className="w-3 h-3 text-brand-500 shrink-0" />
              <span className="truncate">Statutory OIML R 76 Enforced</span>
            </div>
          </div>
        ) : (
          <div className="mb-2 flex justify-center" title={`${activeLab.name} (${activeLab.code}) • NABL ${activeLab.nablAccreditationNo || 'Accredited'}`}>
            <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800 shadow-xs">
              {activeLab.code.split('-')[1] || 'BLR'}
            </span>
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          className={`flex items-center justify-center rounded-lg border border-slate-200/90 dark:border-slate-800/80 bg-white dark:bg-[#0c121e] text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 transition-colors cursor-pointer ${
            isCollapsed ? 'w-10 h-10 mx-auto p-0' : 'w-full gap-2 p-2'
          }`}
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <>
              <ChevronLeft className="h-4 w-4" />
              <span>Collapse Sidebar</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};
