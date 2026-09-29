import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  RotateCw,
  Cpu,
  KeyRound,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { WelmecAuditTelemetry } from './webserial_client';
import { WebSerialScaleClient } from './webserial_client';

interface WelmecAuditPanelProps {
  onInterrogate?: (simulatedTamper: boolean) => Promise<WelmecAuditTelemetry>;
  className?: string;
}

export const WelmecAuditPanel: React.FC<WelmecAuditPanelProps> = ({
  onInterrogate,
  className = '',
}) => {
  const [simulateTamper, setSimulateTamper] = useState<boolean>(false);
  const [isInterrogating, setIsInterrogating] = useState<boolean>(false);
  const [auditRecord, setAuditRecord] = useState<WelmecAuditTelemetry>({
    calibrationCounter: 42,
    parameterCounter: 17,
    firmwareHash: 'a3f9e29b8c0147d3e5124b89',
    softwareVersion: 'LM-v2.4.1-WELMEC',
    tamperDetected: false,
    verdict: 'VERIFIED',
    details:
      'Statutory WELMEC 7.2 verification confirmed. Calibration event counter C=0042 matches registered baseline. Zero unauthorized recalibrations.',
  });

  const handleRunInterrogation = async () => {
    setIsInterrogating(true);
    try {
      if (onInterrogate) {
        const record = await onInterrogate(simulateTamper);
        setAuditRecord(record);
      } else {
        // Fallback client simulation
        const counter = simulateTamper ? 43 : 42;
        const raw = `I4 A "WELMEC-7.2;C=${counter.toString().padStart(4, '0')};P=0017;FW=a3f9e29b8c0147d3e5124b89;V=2.4.1"\r\n`;
        const record = WebSerialScaleClient.parseWelmecAudit(raw, 42);
        setAuditRecord(record);
      }
    } finally {
      setIsInterrogating(false);
    }
  };

  return (
    <div
      className={`rounded-xl border border-slate-200/90 dark:border-white/[0.08] bg-white dark:bg-[#0f1728] shadow-xs dark:shadow-card card-sheen relative overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold tracking-tight text-slate-900 dark:text-slate-100">
                WELMEC 7.2 Software Audit Counter Interrogation
              </h3>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                Guide 7.2 Type P
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Live serial command inquiry (<code className="font-mono font-bold text-brand-600 dark:text-brand-400">I4 / C</code>) verifying non-resettable event counters and cryptographic firmware hash.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRunInterrogation}
            disabled={isInterrogating}
            className="text-xs font-medium cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 mr-1.5 ${isInterrogating ? 'animate-spin' : ''}`} />
            Query Audit Counter (I4)
          </Button>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Statutory Integrity Mode Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40">
          <div>
            <div className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-brand-500" />
              Statutory Integrity Verification Mode: Electronic Seal Security
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              Simulate verification of electronic audit counters against uncertified field recalibrations under Legal Metrology Act, 2009.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSimulateTamper(false);
                const raw = 'I4 A "WELMEC-7.2;C=0042;P=0017;FW=a3f9e29b8c0147d3e5124b89;V=2.4.1"\r\n';
                setAuditRecord(WebSerialScaleClient.parseWelmecAudit(raw, 42));
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                !simulateTamper
                  ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Baseline: C = 0042 (Compliant)
            </button>
            <button
              onClick={() => {
                setSimulateTamper(true);
                const raw = 'I4 A "WELMEC-7.2;C=0043;P=0017;FW=a3f9e29b8c0147d3e5124b89;V=2.4.1"\r\n';
                setAuditRecord(WebSerialScaleClient.parseWelmecAudit(raw, 42));
              }}
              className={`px-3 py-1.5 rounded-md text-xs font-semibold border transition-all cursor-pointer ${
                simulateTamper
                  ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
              }`}
            >
              Tampered: C = 0043 (Violated)
            </button>
          </div>
        </div>

        {/* Counter Display Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Calibration Counter C */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between transition-all ${
              auditRecord.tamperDetected
                ? 'border-rose-400 dark:border-rose-800 bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-100 ring-2 ring-rose-500/30'
                : 'border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-100'
            }`}
          >
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider opacity-80 flex items-center justify-between">
                <span>Calibration Counter (C)</span>
                {auditRecord.tamperDetected ? (
                  <ShieldAlert className="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                )}
              </div>
              <div className="text-2xl font-mono font-bold mt-2">
                C = {auditRecord.calibrationCounter.toString().padStart(4, '0')}
              </div>
            </div>
            <div className="text-[10px] mt-2 opacity-75 font-mono">
              Expected: C = 0042
            </div>
          </div>

          {/* Parameter Counter P */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] text-slate-800 dark:text-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Parameter Counter (P)
              </div>
              <div className="text-2xl font-mono font-bold mt-2 text-slate-900 dark:text-white">
                P = {auditRecord.parameterCounter.toString().padStart(4, '0')}
              </div>
            </div>
            <div className="text-[10px] mt-2 text-slate-400 font-mono">
              Gravity / Filter settings
            </div>
          </div>

          {/* Firmware SHA-256 Hash */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] text-slate-800 dark:text-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Firmware Hash (Type P)
              </div>
              <div className="text-sm font-mono font-bold mt-2 truncate text-brand-600 dark:text-brand-400" title={auditRecord.firmwareHash}>
                {auditRecord.firmwareHash.slice(0, 16)}...
              </div>
            </div>
            <div className="text-[10px] mt-2 text-slate-400 font-mono">
              SHA-256 Legally Relevant
            </div>
          </div>

          {/* Software Version */}
          <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] text-slate-800 dark:text-slate-200 flex flex-col justify-between">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Legal Software Version
              </div>
              <div className="text-sm font-mono font-bold mt-2 text-slate-900 dark:text-white">
                {auditRecord.softwareVersion}
              </div>
            </div>
            <div className="text-[10px] mt-2 text-emerald-600 dark:text-emerald-400 font-mono font-semibold">
              ● WELMEC 7.2 Guide Issue 6
            </div>
          </div>
        </div>

        {/* Audit Status Banner */}
        <div
          className={`p-4 rounded-xl border border-l-4 transition-all ${
            auditRecord.tamperDetected
              ? 'border-rose-200 dark:border-rose-900/60 border-l-rose-600 bg-rose-50/70 dark:bg-rose-950/20 text-rose-900 dark:text-rose-200'
              : 'border-emerald-200 dark:border-emerald-900/60 border-l-emerald-600 bg-emerald-50/60 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
          }`}
        >
          <div className="flex items-start gap-3">
            {auditRecord.tamperDetected ? (
              <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
            )}
            <div className="space-y-1">
              <div className="text-xs font-bold uppercase tracking-wide">
                {auditRecord.tamperDetected
                  ? 'CRITICAL STATUTORY ALERT: UNREGISTERED RECALIBRATION DETECTED'
                  : 'STATUTORY AUDIT PASSED: ZERO RECALIBRATION TAMPERING'}
              </div>
              <p className="text-xs leading-relaxed opacity-90">{auditRecord.details}</p>
              {auditRecord.tamperDetected && (
                <div className="mt-2 pt-2 border-t border-rose-200 dark:border-rose-800/80 text-[11px] font-mono text-rose-800 dark:text-rose-200">
                  Statutory Rule: Section 24 of Legal Metrology Act, 2009 prescribes penalty and seizure if verification seal or electronic audit counter indicates uncertified calibration alterations.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
