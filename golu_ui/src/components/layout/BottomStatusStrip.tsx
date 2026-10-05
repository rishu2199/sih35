import React from 'react';
import { Wifi, Check, Cpu, HardDrive, RotateCw } from 'lucide-react';

export interface BottomStatusStripProps {
  standardsValid?: boolean;
  scaleConnected?: boolean;
  scaleModel?: string;
  autoSaveTime?: string;
  connectionStatus?: 'online' | 'syncing' | 'offline';
  activeLabCode?: string;
}

/**
 * BottomStatusStrip (§33, §34)
 * Provides persistent background system health, telemetry connection, and standards status
 */
export const BottomStatusStrip: React.FC<BottomStatusStripProps> = ({
  standardsValid = true,
  scaleConnected = true,
  scaleModel = 'Avery ZM201 (COM3)',
  autoSaveTime = 'just now',
  connectionStatus = 'online',
  activeLabCode = 'RRSL-BLR',
}) => {
  return (
    <footer className="h-7 bg-white dark:bg-slate-900 border-t border-[#E4E8EF] dark:border-slate-800 px-4 flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400 select-none z-10 shrink-0">
      {/* Left: System Status & Lab Node */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-medium">
          {connectionStatus === 'online' && (
            <>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-slate-900 dark:text-slate-200 font-semibold">Online</span>
            </>
          )}
          {connectionStatus === 'syncing' && (
            <>
              <RotateCw className="w-2.5 h-2.5 text-amber-500 animate-spin" />
              <span className="text-amber-700 dark:text-amber-400 font-semibold">Syncing</span>
            </>
          )}
          {connectionStatus === 'offline' && (
            <>
              <span className="w-2 h-2 rounded-full border border-slate-400 bg-transparent" />
              <span className="text-slate-600 dark:text-slate-400 font-semibold">Offline</span>
            </>
          )}
          <span className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-mono text-slate-500 dark:text-slate-400">{activeLabCode}</span>
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <Check size={13} className={standardsValid ? 'text-emerald-600' : 'text-rose-500'} />
          <span className="font-mono text-[10px]">
            Standards: {standardsValid ? 'E2 & F1 Sets Valid' : 'Calibration Warning'}
          </span>
        </div>
      </div>

      {/* Middle: Data sync and legal standard */}
      <div className="hidden lg:flex items-center gap-4">
        <div className="flex items-center gap-1.5">
          <HardDrive size={13} className="text-slate-400" />
          <span>Auto-save active ({autoSaveTime})</span>
        </div>
        <span className="text-slate-300 dark:text-slate-700">|</span>
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-slate-700 dark:text-slate-300 font-bold">OIML R 76-1:2006</span>
          <span className="text-slate-400">Verified</span>
        </div>
      </div>

      {/* Right: Scale Hardware & Latency */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5">
          <Cpu size={13} className={scaleConnected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'} />
          <span className="font-mono truncate max-w-[160px]">
            {scaleConnected ? scaleModel : 'No Scale Connected'}
          </span>
        </div>

        <span className="text-slate-300 dark:text-slate-700">|</span>

        <div className="flex items-center gap-1 font-mono text-slate-500 dark:text-slate-400">
          <Wifi size={12} className={connectionStatus === 'online' ? 'text-emerald-600' : 'text-slate-400'} />
          <span>{connectionStatus === 'online' ? '12ms' : '--'}</span>
        </div>
      </div>
    </footer>
  );
};
