import React from 'react';
import { Inbox } from 'lucide-react';
import { Skeleton } from './Skeleton';
import { EmptyState } from './EmptyState';

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: 'left' | 'center' | 'right';
  width?: string;
  isNumeric?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  isLoading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyActionLabel?: string;
  onEmptyAction?: () => void;
  selectedRowKey?: string;
  onRowClick?: (row: T, index: number) => void;
  stickyHeader?: boolean;
  className?: string;
}

/**
 * METROLOGIX-76 Standard DataTable (§19)
 * - Sticky headers
 * - Numeric alignment (right-aligned for loads, readings, errors, tolerances)
 * - Tabular numbers with IBM Plex Mono
 * - Row hover & selection highlight
 * - Integrated loading skeletons & actionable empty state
 * - Responsive overflow
 */
export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyTitle = 'No data available',
  emptyDescription = 'There are currently no records matching this criteria.',
  emptyActionLabel,
  onEmptyAction,
  selectedRowKey,
  onRowClick,
  stickyHeader = true,
  className = '',
}: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className={`w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 ${className}`}>
        <div className="p-4 space-y-3">
          <Skeleton variant="rect" className="w-1/3 h-5 mb-4 rounded-md" />
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
          <Skeleton variant="table-row" />
        </div>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className={`w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 ${className}`}>
        <EmptyState
          icon={Inbox}
          title={emptyTitle}
          description={emptyDescription}
          actionLabel={emptyActionLabel}
          onAction={onEmptyAction}
        />
      </div>
    );
  }

  return (
    <div className={`w-full overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs ${className}`}>
      <table className="w-full text-left border-collapse text-xs">
        <thead className={`border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/90 text-slate-500 dark:text-slate-400 font-mono uppercase text-[11px] ${stickyHeader ? 'sticky top-0 z-10 backdrop-blur-xs' : ''}`}>
          <tr>
            {columns.map((col) => {
              const alignClass =
                col.align === 'right' || col.isNumeric
                  ? 'text-right'
                  : col.align === 'center'
                  ? 'text-center'
                  : 'text-left';

              return (
                <th
                  key={col.key}
                  style={col.width ? { width: col.width } : undefined}
                  className={`px-4 py-3 font-bold tracking-wider ${alignClass}`}
                >
                  {col.header}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-sans">
          {data.map((row, index) => {
            const key = keyExtractor(row, index);
            const isSelected = selectedRowKey === key;

            return (
              <tr
                key={key}
                onClick={() => onRowClick?.(row, index)}
                className={`transition-colors ${
                  onRowClick ? 'cursor-pointer' : ''
                } ${
                  isSelected
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 text-blue-950 dark:text-blue-100 font-medium'
                    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40 text-slate-800 dark:text-slate-200'
                }`}
              >
                {columns.map((col) => {
                  const alignClass =
                    col.align === 'right' || col.isNumeric
                      ? 'text-right'
                      : col.align === 'center'
                      ? 'text-center'
                      : 'text-left';

                  const isMono = col.isNumeric || col.align === 'right';

                  return (
                    <td
                      key={col.key}
                      className={`px-4 py-3.5 whitespace-nowrap ${alignClass} ${
                        isMono ? 'font-mono tabular-nums' : ''
                      }`}
                    >
                      {col.render
                        ? col.render(row, index)
                        : ((row as any)[col.key] ?? '—')}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
