import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbsProps {
  currentTab: string;
  activeSession?: any;
  onNavigate: (tab: string) => void;
}

interface CrumbItem {
  label: string;
  tab?: string;
  isCurrent?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentTab,
  activeSession,
  onNavigate,
}) => {
  const serial = activeSession?.serialNumber || 'AV-2026-8812';

  const getCrumbs = (): CrumbItem[] => {
    switch (currentTab) {
      case 'dashboard':
        return [{ label: 'Home', isCurrent: true }];

      case 'sessions':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Sessions', isCurrent: true },
        ];

      case 'session_detail':
      case 'instrument_detail':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Sessions', tab: 'sessions' },
          { label: serial, isCurrent: true },
        ];

      case 'instruments':
      case 'intake':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Instruments', tab: 'instruments' },
          { label: serial, isCurrent: true },
        ];

      case 'readiness':
      case 'preflight':
        return [
          { label: 'Sessions', tab: 'sessions' },
          { label: serial, tab: 'session_detail' },
          { label: 'Test Readiness & Preflight', isCurrent: true },
        ];

      case 'physical_inspection':
        return [
          { label: 'Sessions', tab: 'sessions' },
          { label: serial, tab: 'session_detail' },
          { label: 'Physical Inspection', isCurrent: true },
        ];

      case 'weighing_linearity':
        return [
          { label: 'Sessions', tab: 'sessions' },
          { label: serial, tab: 'session_detail' },
          { label: 'Weighing Error', isCurrent: true },
        ];

      case 'eccentricity_workspace':
        return [
          { label: 'Sessions', tab: 'sessions' },
          { label: serial, tab: 'session_detail' },
          { label: 'Eccentricity', isCurrent: true },
        ];

      case 'repeatability_workspace':
        return [
          { label: 'Sessions', tab: 'sessions' },
          { label: serial, tab: 'session_detail' },
          { label: 'Repeatability', isCurrent: true },
        ];

      case 'environmental_workspace':
        return [
          { label: 'Sessions', tab: 'sessions' },
          { label: serial, tab: 'session_detail' },
          { label: 'Environmental Drift', isCurrent: true },
        ];

      case 'review':
      case 'review_workspace':
        return [
          { label: 'Review', tab: 'review' },
          { label: serial, isCurrent: true },
        ];

      case 'standards':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Standards & Traceability', isCurrent: true },
        ];

      case 'audit':
      case 'audit_trail':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Cryptographic Audit Trail', isCurrent: true },
        ];

      case 'reports':
      case 'certificates':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Reports & Certificates', isCurrent: true },
        ];

      case 'settings':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Settings', isCurrent: true },
        ];

      case 'bridge':
      case 'hardware_bridge':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Live Hardware Bridge', isCurrent: true },
        ];

      case 'excel_auditor':
        return [
          { label: 'Home', tab: 'dashboard' },
          { label: 'Flaw Auditor', isCurrent: true },
        ];

      default:
        return [{ label: 'Home', tab: 'dashboard' }, { label: currentTab, isCurrent: true }];
    }
  };

  const crumbs = getCrumbs();

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500 font-medium py-1">
      {crumbs.map((crumb, idx) => {
        const isLast = idx === crumbs.length - 1;

        return (
          <React.Fragment key={crumb.label + idx}>
            {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}

            {crumb.tab && !isLast ? (
              <button
                type="button"
                onClick={() => onNavigate(crumb.tab!)}
                className="hover:text-blue-600 transition-colors flex items-center gap-1 cursor-pointer font-medium"
              >
                {idx === 0 && <Home className="w-3 h-3 text-slate-400" />}
                <span>{crumb.label}</span>
              </button>
            ) : (
              <span className={`font-semibold ${isLast ? 'text-slate-800 dark:text-slate-200' : 'text-slate-600'}`}>
                {crumb.label}
              </span>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
