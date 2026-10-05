import React, { useState } from 'react';
import { ComplianceData } from '../../types';

interface ComplianceOverviewPanelProps {
  data?: ComplianceData;
  onFilterSegment?: (segment: 'PASS' | 'FAIL' | 'WARNING') => void;
}

export const ComplianceOverviewPanel: React.FC<ComplianceOverviewPanelProps> = ({
  data,
  onFilterSegment,
}) => {
  const [hoveredSegment, setHoveredSegment] = useState<'PASS' | 'FAIL' | 'WARNING' | null>(null);

  // Exact statutory counts from specification: PASS 21, FAIL 2, WARNING 1, Total 24
  const passCount = data?.passCount ?? 21;
  const failCount = data?.failCount ?? 2;
  const warningCount = data?.warningCount ?? 1;
  const total = passCount + failCount + warningCount; // 24
  const passRate = data?.passRate ?? 94.2;

  // SVG calculations for circle r=40 (circumference = 2 * pi * 40 ~= 251.33)
  const radius = 40;
  const circumference = 2 * Math.PI * radius;

  const passDash = (passCount / total) * circumference;
  const warnDash = (warningCount / total) * circumference;
  const failDash = (failCount / total) * circumference;

  return (
    <div className="bg-white dark:bg-slate-900 border border-[#E4E8EF] dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between h-full relative">
      <div>
        <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="text-xs font-mono font-bold tracking-wider uppercase text-slate-800 dark:text-slate-200">
            Compliance Overview
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Last 24 hours verified sessions
          </p>
        </div>

        {/* Donut Visualization with Interactive Segments */}
        <div className="flex flex-col items-center justify-center my-6 relative">
          <div className="relative w-36 h-36 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="text-slate-100 dark:text-slate-800"
                strokeWidth="10"
                stroke="currentColor"
                fill="none"
              />

              {/* Pass Arc (Emerald) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`text-emerald-500 transition-all duration-200 cursor-pointer ${
                  hoveredSegment === 'PASS' ? 'stroke-[12]' : 'stroke-[10]'
                }`}
                strokeDasharray={`${passDash} ${circumference}`}
                strokeDashoffset="0"
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                onMouseEnter={() => setHoveredSegment('PASS')}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => onFilterSegment?.('PASS')}
              />

              {/* Warning Arc (Amber) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`text-amber-500 transition-all duration-200 cursor-pointer ${
                  hoveredSegment === 'WARNING' ? 'stroke-[12]' : 'stroke-[10]'
                }`}
                strokeDasharray={`${warnDash} ${circumference}`}
                strokeDashoffset={`-${passDash}`}
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                onMouseEnter={() => setHoveredSegment('WARNING')}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => onFilterSegment?.('WARNING')}
              />

              {/* Fail Arc (Rose) */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                className={`text-rose-500 transition-all duration-200 cursor-pointer ${
                  hoveredSegment === 'FAIL' ? 'stroke-[12]' : 'stroke-[10]'
                }`}
                strokeDasharray={`${failDash} ${circumference}`}
                strokeDashoffset={`-${passDash + warnDash}`}
                stroke="currentColor"
                fill="none"
                strokeLinecap="round"
                onMouseEnter={() => setHoveredSegment('FAIL')}
                onMouseLeave={() => setHoveredSegment(null)}
                onClick={() => onFilterSegment?.('FAIL')}
              />
            </svg>

            {/* Inner Center Label: 94.2% */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
              <span className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tracking-tight">
                {passRate}%
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 font-mono tracking-wider">
                Pass Rate
              </span>
            </div>
          </div>

          {/* Interactive Hover Tooltip (Section 8) */}
          <div className="h-6 mt-1 flex items-center justify-center">
            {hoveredSegment === 'PASS' && (
              <span className="text-[11px] font-mono font-bold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                PASS: {passCount} sessions ({((passCount / total) * 100).toFixed(1)}% of tests)
              </span>
            )}
            {hoveredSegment === 'WARNING' && (
              <span className="text-[11px] font-mono font-bold text-amber-700 dark:text-amber-300 animate-in fade-in">
                WARNING: {warningCount} session ({((warningCount / total) * 100).toFixed(1)}%)
              </span>
            )}
            {hoveredSegment === 'FAIL' && (
              <span className="text-[11px] font-mono font-bold text-rose-700 dark:text-rose-300 animate-in fade-in">
                FAIL: {failCount} sessions ({((failCount / total) * 100).toFixed(1)}%)
              </span>
            )}
            {!hoveredSegment && (
              <span className="text-[10px] text-slate-400 font-medium">
                Hover or click segments to inspect
              </span>
            )}
          </div>
        </div>

        {/* Breakdown Stats Rows */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div
            onClick={() => onFilterSegment?.('PASS')}
            onMouseEnter={() => setHoveredSegment('PASS')}
            onMouseLeave={() => setHoveredSegment(null)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">PASS</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{passCount}</span>
          </div>

          <div
            onClick={() => onFilterSegment?.('FAIL')}
            onMouseEnter={() => setHoveredSegment('FAIL')}
            onMouseLeave={() => setHoveredSegment(null)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">FAIL</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{failCount}</span>
          </div>

          <div
            onClick={() => onFilterSegment?.('WARNING')}
            onMouseEnter={() => setHoveredSegment('WARNING')}
            onMouseLeave={() => setHoveredSegment(null)}
            className="flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs"
          >
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <span className="font-semibold text-slate-700 dark:text-slate-300">WARNING</span>
            </div>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{warningCount}</span>
          </div>
        </div>
      </div>

      <div className="pt-3 mt-2 border-t border-slate-100 dark:border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <span>Total verified:</span>
        <span className="font-bold text-slate-700 dark:text-slate-300">{total} sessions</span>
      </div>
    </div>
  );
};
