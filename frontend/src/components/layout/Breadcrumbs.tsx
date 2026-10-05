import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
  label: string;
  onClick?: () => void;
  isCurrent?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  return (
    <nav className={`flex items-center space-x-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 ${className}`} aria-label="Breadcrumb">
      <div className="flex items-center gap-1.5">
        <Home className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <span className="font-semibold text-slate-700 dark:text-slate-300">DoCA Metrology</span>
      </div>

      {items.map((item, index) => (
        <React.Fragment key={index}>
          <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
          {item.onClick && !item.isCurrent ? (
            <button
              onClick={item.onClick}
              className="font-medium hover:text-brand-600 dark:hover:text-brand-400 transition-colors cursor-pointer"
            >
              {item.label}
            </button>
          ) : (
            <span
              className={
                item.isCurrent
                  ? 'font-bold text-slate-900 dark:text-slate-100 font-mono'
                  : 'font-medium'
              }
              aria-current={item.isCurrent ? 'page' : undefined}
            >
              {item.label}
            </span>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};
