import React from 'react';
import { Loader2 } from 'lucide-react';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'success' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-[#080c14] disabled:opacity-50 disabled:pointer-events-none select-none active:scale-[0.98] cursor-pointer';

  const sizeStyles: Record<ButtonSize, string> = {
    sm: 'text-xs px-3 py-1.5 gap-1.5 tracking-tight',
    md: 'text-xs sm:text-sm px-3.5 py-2 gap-2 tracking-tight',
    lg: 'text-sm sm:text-base px-5 py-2.5 gap-2.5 font-semibold tracking-tight',
  };

  const variantStyles: Record<ButtonVariant, string> = {
    primary:
      'bg-gradient-to-b from-brand-500 to-brand-600 hover:from-brand-400 hover:to-brand-500 active:from-brand-600 active:to-brand-700 text-white font-semibold border border-brand-400/25 shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_4px_12px_-1px_rgba(29,104,242,0.35)] focus:ring-brand-500',
    secondary:
      'bg-slate-100 text-slate-800 hover:bg-slate-200/80 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-700/80 border border-slate-200/90 dark:border-slate-700/80 shadow-subtle focus:ring-slate-400',
    outline:
      'border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 hover:border-slate-300 dark:hover:border-slate-700 shadow-subtle focus:ring-slate-400',
    danger:
      'bg-gradient-to-b from-rose-500 to-rose-600 hover:from-rose-400 hover:to-rose-500 active:from-rose-600 active:to-rose-700 text-white font-semibold border border-rose-400/25 shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_4px_12px_-1px_rgba(244,63,94,0.35)] focus:ring-rose-500',
    success:
      'bg-gradient-to-b from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 active:from-emerald-600 active:to-emerald-700 text-white font-semibold border border-emerald-400/25 shadow-[0_1px_2px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.2)] hover:shadow-[0_4px_12px_-1px_rgba(16,185,129,0.35)] focus:ring-emerald-500',
    ghost:
      'bg-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/70 hover:text-slate-900 dark:hover:text-slate-100 focus:ring-slate-400',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
      ) : (
        leftIcon && <span className="shrink-0">{leftIcon}</span>
      )}
      <span>{children}</span>
      {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
    </button>
  );
};
