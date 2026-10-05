import React, { InputHTMLAttributes } from 'react';
import { AlertCircle, CheckCircle2 } from 'lucide-react';

interface FieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  unit?: string;
  help?: string;
  error?: string;
  success?: string;
  readOnly?: boolean;
}

export const Field: React.FC<FieldProps> = ({
  label,
  unit,
  help,
  error,
  success,
  readOnly = false,
  className = '',
  id,
  ...inputProps
}) => {
  const generatedId = id || `field-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

  return (
    <div className={`space-y-1.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label
          htmlFor={generatedId}
          className="text-xs font-bold text-slate-700 dark:text-slate-300 block font-sans"
        >
          {label}
        </label>
        {readOnly && (
          <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">
            Read-only
          </span>
        )}
      </div>

      <div className="relative rounded-xl shadow-2xs">
        <input
          id={generatedId}
          readOnly={readOnly}
          {...inputProps}
          className={`w-full px-3.5 py-2.5 rounded-xl border font-mono text-xs font-semibold text-slate-900 dark:text-white transition-all focus:outline-none ${
            unit ? 'pr-12' : 'pr-3.5'
          } ${
            error
              ? 'border-rose-400 bg-rose-50/30 text-rose-900 dark:text-rose-100 focus:ring-2 focus:ring-rose-500'
              : success
              ? 'border-emerald-400 bg-emerald-50/30 text-emerald-900 dark:text-emerald-100 focus:ring-2 focus:ring-emerald-500'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500'
          } ${readOnly ? 'bg-slate-50 dark:bg-slate-800/60 text-slate-500 cursor-not-allowed' : ''}`}
        />

        {unit && (
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500 font-sans text-xs font-semibold">
            {unit}
          </div>
        )}
      </div>

      {help && !error && !success && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
          {help}
        </p>
      )}

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400 font-medium">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {success && !error && (
        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{success}</span>
        </div>
      )}
    </div>
  );
};
