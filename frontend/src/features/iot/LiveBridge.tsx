import React, { useState, useEffect } from 'react';
import {
  Radio,
  Zap,
  Terminal,
  ArrowRight,
  Wifi,
  WifiOff,
  RotateCw,
  Send,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { useIoT } from '../../context/IoTContext';
import { VirtualScaleSimulator } from './VirtualScaleSimulator';
import { WelmecAuditPanel } from './WelmecAuditPanel';

interface LiveBridgeProps {
  onNavigateToTesting?: () => void;
  className?: string;
}

export const LiveBridge: React.FC<LiveBridgeProps> = ({
  onNavigateToTesting,
  className = '',
}) => {
  const {
    isConnected,
    isSimulatorActive,
    currentWeight,
    isStable,
    unit,
    isZero,
    mode,
    serialLogs,
    autoCaptureToGrid,
    setIsSimulatorActive,
    setAutoCaptureToGrid,
    connectPhysicalSerial,
    disconnectPhysicalSerial,
    sendSerialCommand,
    emitSimulatorPacket,
    interrogateWelmec,
    captureCurrentReading,
    clearLogs,
  } = useIoT();

  const [baudRate, setBaudRate] = useState<number>(9600);
  const [commandInput, setCommandInput] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [captureFlash, setCaptureFlash] = useState<boolean>(false);

  // Keyboard shortcut: Spacebar captures weight
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && (e.target as HTMLElement).tagName !== 'INPUT') {
        e.preventDefault();
        handleManualCapture();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentWeight, isStable]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectPhysicalSerial(baudRate);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSendCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;
    await sendSerialCommand(commandInput.trim());
    setCommandInput('');
  };

  const handleManualCapture = () => {
    captureCurrentReading();
    setCaptureFlash(true);
    setTimeout(() => setCaptureFlash(false), 800);
  };

  return (
    <div className={`space-y-6 max-w-7xl mx-auto ${className}`}>
      {/* Top Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
              <Radio className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 font-display">
                  Scale Telemetry Gateway
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  {isConnected ? 'Hardware Serial Link' : 'Virtual Simulator Link'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Direct RS-232 / USB scale connection with statutory WELMEC 7.2 software verification.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {onNavigateToTesting && (
            <Button
              variant="outline"
              size="sm"
              onClick={onNavigateToTesting}
              className="text-xs font-medium cursor-pointer"
            >
              Back to Worksheet
              <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
            </Button>
          )}
        </div>
      </div>

      {/* Main Grid: Digital Indicator Readout + Physical Serial Connect Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Industrial Digital Readout & Controls (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Industrial Digital Indicator Laboratory Enclosure */}
          <div
            className={`rounded-xl border transition-all p-5 shadow-sm ${
              captureFlash
                ? 'border-brand-500 ring-2 ring-brand-500/40 bg-slate-950'
                : 'border-slate-800 bg-[#080d19]'
            }`}
          >
            {/* Recessed VFD Display Screen */}
            <div className="rounded-lg border border-slate-800/90 bg-[#030712] p-5">
              {/* Display Top Status Annunciators */}
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3 mb-4 font-mono text-xs">
                <div className="flex items-center gap-2">
                  {/* STABLE Annunciator */}
                  <span
                    className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                      isStable
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                        : 'bg-amber-950/80 text-amber-400 border border-amber-500/40 animate-pulse'
                    }`}
                  >
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isStable ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                      }`}
                    />
                    {isStable ? 'STABLE (ST)' : 'MOTION (US)'}
                  </span>

                  {/* ZERO Annunciator */}
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-mono font-semibold transition-all ${
                      isZero
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-500/40'
                        : 'text-slate-600 border border-slate-800/60'
                    }`}
                  >
                    CENTER OF ZERO
                  </span>

                  {/* NET / GROSS */}
                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-900 text-slate-300 border border-slate-700">
                    {mode === 'GROSS' ? 'GROSS (GS)' : 'NET (NT)'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
                  <span>SRC:</span>
                  <span className="text-slate-300 font-semibold">
                    {isSimulatorActive ? 'VIRTUAL LOAD CELL' : 'HARDWARE SERIAL'}
                  </span>
                </div>
              </div>

              {/* High-Precision Digital Digits */}
              <div className="text-center py-5 px-3">
                <div className="inline-flex items-baseline justify-center">
                  <span
                    className="font-mono text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-emerald-400 select-all [text-shadow:0_0_10px_rgba(52,211,153,0.35)]"
                    style={{ fontVariantNumeric: 'tabular-nums' }}
                  >
                    {currentWeight.toLocaleString(undefined, {
                      minimumFractionDigits: unit === 'kg' ? 3 : 1,
                      maximumFractionDigits: 3,
                    })}
                  </span>
                  <span className="text-xl sm:text-2xl font-mono font-medium text-emerald-500/70 ml-2.5">
                    {unit}
                  </span>
                </div>
              </div>

              {/* Display Bottom Action Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-800/80">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-400 hover:text-slate-300">
                  <input
                    type="checkbox"
                    checked={autoCaptureToGrid}
                    onChange={(e) => setAutoCaptureToGrid(e.target.checked)}
                    className="rounded border-slate-700 text-brand-500 focus:ring-brand-500 bg-slate-900"
                  />
                  <span>Auto-stream stable readings to observation worksheet</span>
                </label>

                <div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleManualCapture}
                    disabled={!isStable}
                    className={`text-xs font-semibold cursor-pointer ${
                      isStable
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                        : 'opacity-40 cursor-not-allowed bg-slate-800 text-slate-500 border border-slate-700'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 mr-1 text-amber-300" />
                    {isStable ? 'Capture Reading (Spacebar)' : 'Waiting for Stability...'}
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Virtual Scale Simulator Module */}
          <VirtualScaleSimulator
            isActive={isSimulatorActive}
            onToggleActive={setIsSimulatorActive}
            onEmitPacket={emitSimulatorPacket}
            onCaptureReading={handleManualCapture}
          />
        </div>

        {/* Right Column: Physical WebSerial Manager, Terminal, & WELMEC (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Physical Serial Port Manager Card */}
          <div className="rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-[#0c121e] p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div
                  className={`p-2 rounded-lg ${
                    isConnected
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                  }`}
                >
                  {isConnected ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">
                    Physical Serial Link (COM / USB)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {isConnected ? 'Hardware Scale Connected' : 'No Physical Scale Connected'}
                  </p>
                </div>
              </div>

              <span
                className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                  isConnected
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                }`}
              >
                {isConnected ? 'ONLINE' : 'STANDBY'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Baud Rate (8-N-1)
                </label>
                <select
                  value={baudRate}
                  onChange={(e) => setBaudRate(parseInt(e.target.value, 10))}
                  disabled={isConnected}
                  className="w-full text-xs font-mono rounded-md border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-2.5 py-1.5 text-slate-900 dark:text-slate-100 focus:outline-none focus:border-brand-500"
                >
                  <option value={9600}>9600 baud (Standard)</option>
                  <option value={4800}>4800 baud</option>
                  <option value={19200}>19200 baud</option>
                  <option value={38400}>38400 baud</option>
                  <option value={115200}>115200 baud (High-Speed)</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Hardware Port
                </label>
                {isConnected ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={disconnectPhysicalSerial}
                    className="w-full text-xs font-medium text-rose-600 hover:text-rose-700 border-rose-200 dark:border-rose-900/50 cursor-pointer"
                  >
                    Disconnect
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleConnect}
                    disabled={isConnecting}
                    className="w-full text-xs font-medium cursor-pointer"
                  >
                    {isConnecting ? (
                      <RotateCw className="w-3.5 h-3.5 animate-spin mr-1" />
                    ) : (
                      <Radio className="w-3.5 h-3.5 mr-1" />
                    )}
                    Select COM Port
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Real-Time Serial Monitor / Terminal Console */}
          <div className="rounded-xl border border-slate-800 bg-slate-950 shadow-sm overflow-hidden font-mono text-xs">
            <div className="flex items-center justify-between px-3.5 py-2 bg-slate-900/90 border-b border-slate-800 text-slate-300">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-semibold text-[11px]">Serial Monitor & Telemetry Bus</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-500 font-mono">
                  {serialLogs.length} frames
                </span>
                <button
                  onClick={clearLogs}
                  className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title="Clear Console"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Scrollable Packet Log */}
            <div className="p-3 h-48 overflow-y-auto space-y-1 font-mono text-[11px] leading-tight select-text">
              {serialLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-2">
                  <span className="text-slate-600 text-[10px] flex-shrink-0">{log.time}</span>
                  <span
                    className={`font-bold flex-shrink-0 text-[10px] ${
                      log.dir === 'RX' ? 'text-emerald-500' : 'text-cyan-400'
                    }`}
                  >
                    [{log.dir}]
                  </span>
                  <span className="text-slate-200 break-all">{log.text}</span>
                </div>
              ))}
              {serialLogs.length === 0 && (
                <div className="text-slate-600 text-center py-8 text-xs font-sans">
                  No telemetry packets received yet.
                </div>
              )}
            </div>

            {/* Quick Command Presets Ribbon */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto text-[10px] font-mono">
              <span className="text-slate-400 mr-0.5">Quick Commands:</span>
              <button
                type="button"
                onClick={() => sendSerialCommand('S')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                Read (S)
              </button>
              <button
                type="button"
                onClick={() => sendSerialCommand('Z')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                Zero (Z)
              </button>
              <button
                type="button"
                onClick={() => sendSerialCommand('T')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:text-white transition-colors cursor-pointer"
              >
                Tare (T)
              </button>
              <button
                type="button"
                onClick={() => sendSerialCommand('I4')}
                className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 hover:text-emerald-300 transition-colors cursor-pointer"
              >
                Audit (I4)
              </button>
            </div>

            {/* Command Send Bar */}
            <form
              onSubmit={handleSendCommand}
              className="flex items-center gap-2 p-2 border-t border-slate-800/80 bg-slate-900/90"
            >
              <input
                type="text"
                value={commandInput}
                onChange={(e) => setCommandInput(e.target.value)}
                placeholder="Send ASCII Command (e.g. S, I4, Z, T, C)..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-brand-500 font-mono"
              />
              <Button type="submit" variant="primary" size="sm" className="text-xs font-mono cursor-pointer">
                <Send className="w-3 h-3" />
              </Button>
            </form>
          </div>

          {/* WELMEC 7.2 Software Audit Panel */}
          <WelmecAuditPanel onInterrogate={interrogateWelmec} />
        </div>
      </div>
    </div>
  );
};
