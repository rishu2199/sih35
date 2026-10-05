import React from 'react';

export interface PageContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'wide' | 'form' | 'document';
  children: React.ReactNode;
}

/**
 * Standard Page Viewport Container (§21, §22)
 * Ensures consistent width constraints and responsive padding across all views:
 * - wide (~1440px): Dashboards, complex multi-column observation tables
 * - form (~1200px): Forms, wizard steps, settings, intake
 * - document (~850px): Official certificates, legal reports, test sheets
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  variant = 'wide',
  className = '',
  children,
  ...props
}) => {
  const variantStyles = {
    wide: 'max-w-[1440px]',
    form: 'max-w-[1200px]',
    document: 'max-w-[850px] shadow-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-10 my-4',
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 transition-all ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
