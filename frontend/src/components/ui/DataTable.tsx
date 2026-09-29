import React from 'react';
import { Database, Loader2 } from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T, index: number) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  width?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T, index: number) => string;
  isLoading?: boolean;
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function DataTable<T>({
  columns,
  data,
  keyExtractor,
  isLoading = false,
  emptyMessage = 'No records found.',
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const alignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right font-mono',
  };

  return (
    <div
      className={`overflow-hidden rounded-lg border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0c121e] ${className}`}
    >
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/50">
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none ${
                    alignClass[col.align || 'left']
                  } ${col.className || ''}`}
                  style={{ width: col.width }}
                >
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
            {isLoading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Loader2 className="h-5 w-5 animate-spin text-brand-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Loading data...
                    </span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Database className="w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {emptyMessage}
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={keyExtractor(row, index)}
                  onClick={() => onRowClick && onRowClick(row)}
                  className={`transition-colors duration-100 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 ${
                    onRowClick ? 'cursor-pointer' : ''
                  }`}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`px-4 py-3 text-xs sm:text-sm text-slate-800 dark:text-slate-200 ${
                        alignClass[col.align || 'left']
                      } ${col.className || ''}`}
                    >
                      {col.render
                        ? col.render(row, index)
                        : (row as Record<string, unknown>)[col.key] !== undefined
                        ? String((row as Record<string, unknown>)[col.key])
                        : '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

