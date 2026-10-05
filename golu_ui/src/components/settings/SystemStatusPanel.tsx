import React from 'react';
import {
  Server,
  Activity,
  CheckCircle2,
  Clock,
  Building,
  Database,
  Wifi,
} from 'lucide-react';
import { SystemStatusInfo } from './types';

interface SystemStatusPanelProps {
  status: SystemStatusInfo;
}

export const SystemStatusPanel: React.FC<SystemStatusPanelProps> = ({ status }) => {
  return (
    <div className="pt-6">
      <div className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 sm:p-7 shadow-2xs space-y-4">
        {/* Header (§26) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-black uppercase tracking-wider text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              SECTION §26
            </span>
            <h3 className="text-xs font-mono font-bold tracking-widest uppercase text-slate-700 dark:text-slate-300">
              SYSTEM STATUS
            </h3>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            ALL METROLOGICAL SUBSYSTEMS OPERATIONAL
          </span>
        </div>

        {/* 5 Statutory Metric Cards (§26) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5 pt-1">
          {/* 1. Application Version */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Application
            </div>
            <div className="text-xs font-black font-mono text-slate-900 dark:text-white mt-1">
              {status.version}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              METROLOGIX-76 Core
            </div>
          </div>

          {/* 2. Connection */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Connection
            </div>
            <div className="text-xs font-black font-mono text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              {status.connectionStatus === 'ONLINE' ? '● Online' : status.connectionStatus}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              WebSocket &amp; Serial Bridge
            </div>
          </div>

          {/* 3. Data Sync */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Data Sync
            </div>
            <div className="text-xs font-black font-mono text-indigo-600 dark:text-indigo-400 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
              {status.dataSyncStatus === 'SYNCHRONIZED' ? '✓ Synchronized' : status.dataSyncStatus}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">
              Local SQLite ↔ Cloud Postgres
            </div>
          </div>

          {/* 4. Laboratory Node */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Laboratory
            </div>
            <div className="text-xs font-black font-mono text-slate-900 dark:text-white mt-1">
              RRSL-BLR
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 truncate" title={status.activeNode}>
              Bengaluru Regional Node
            </div>
          </div>

          {/* 5. Last Configuration Save */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-mono uppercase text-slate-400 font-bold tracking-wider">
              Last Config Save
            </div>
            <div className="text-[11px] font-bold font-mono text-slate-800 dark:text-slate-200 mt-1">
              {status.lastSavedTimestamp.replace(' IST', '')}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>Cryptographic Timestamp</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
