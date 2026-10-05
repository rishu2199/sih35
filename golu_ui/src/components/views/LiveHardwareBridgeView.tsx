import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Cable,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Lock,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  ScaleDevice,
  WeightReading,
  ScaleProtocol,
  CapturedReadingLog,
} from '../bridge/types';
import {
  INITIAL_SCALE_DEVICE,
  PROTOCOL_PRESETS,
} from '../bridge/mockBridgeData';
import { SerialConnectionBanner } from '../bridge/SerialConnectionBanner';
import { LiveWeightIndicator } from '../bridge/LiveWeightIndicator';
import { WelmecExaminationCard } from '../bridge/WelmecExaminationCard';
import { LiveCommunicationStream } from '../bridge/LiveCommunicationStream';
import { VirtualScaleSimulator } from '../bridge/VirtualScaleSimulator';
import { WelmecDetailDrawer } from '../bridge/WelmecDetailDrawer';
import { PhysicalScaleConnectModal } from '../bridge/PhysicalScaleConnectModal';

interface LiveHardwareBridgeViewProps {
  onBackToDashboard: () => void;
  activeSession?: any;
  onUseReadingInTest?: (weight: number, unit: string) => void;
  userRole?: string;
}

export const LiveHardwareBridgeView: React.FC<LiveHardwareBridgeViewProps> = ({
  onBackToDashboard,
  activeSession,
  onUseReadingInTest,
  userRole = 'Metrologist',
}) => {
  const isReadOnly = userRole === 'Reviewer' || userRole === 'Director' || userRole === 'Auditor';

  // Device & Protocol State
  const [device, setDevice] = useState<ScaleDevice>(INITIAL_SCALE_DEVICE);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnectModalOpen, setIsConnectModalOpen] = useState(false);

  const [activeProtocol, setActiveProtocol] = useState<ScaleProtocol>('CAS');
  const [activeGrossNetMode, setActiveGrossNetMode] = useState<'GROSS' | 'NET'>('GROSS');
  const [tareWeight, setTareWeight] = useState<number>(0.0);
  const [targetWeight, setTargetWeight] = useState<number>(12.345);
  const [isSimulatingUnstable, setIsSimulatingUnstable] = useState<boolean>(false);
  const [isSimulatingActive, setIsSimulatingActive] = useState<boolean>(true);
  const [autoCapture, setAutoCapture] = useState<boolean>(false);
  const [lastCaptured, setLastCaptured] = useState<CapturedReadingLog | null>(null);

  // WELMEC Drawer & Tamper Simulation State (§19)
  const [isWelmecDrawerOpen, setIsWelmecDrawerOpen] = useState(false);
  const [isTampered, setIsTampered] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Standard Weights Traceability Gate State (§28)
  const [isTraceabilityValid, setIsTraceabilityValid] = useState<boolean>(true);

  // Live Serial Logs (§22, §23)
  const [commLogs, setCommLogs] = useState<Array<{
    id: string;
    time: string;
    direction: 'RX' | 'TX';
    rawPayload: string;
    hexBytes?: string;
    parsedSummary: string;
  }>>([
    {
      id: 'log-1',
      time: '18:42:08',
      direction: 'TX',
      rawPayload: 'READ',
      hexBytes: '52 45 41 44 0D 0A',
      parsedSummary: 'Command Request',
    },
    {
      id: 'log-2',
      time: '18:42:09',
      direction: 'RX',
      rawPayload: 'US,GS,12.351kg',
      hexBytes: '55 53 2C 47 53 2C 31 32 2E 33 35 31 6B 67',
      parsedSummary: 'WT 12.351 kg UNSTABLE',
    },
    {
      id: 'log-3',
      time: '18:42:10',
      direction: 'RX',
      rawPayload: 'ST,GS,12.345kg',
      hexBytes: '53 54 2C 47 53 2C 31 32 2E 33 34 35 6B 67',
      parsedSummary: 'WT 12.345 kg STABLE',
    },
    {
      id: 'log-4',
      time: '18:42:11',
      direction: 'RX',
      rawPayload: 'ST,GS,12.345kg',
      hexBytes: '53 54 2C 47 53 2C 31 32 2E 33 34 35 6B 67',
      parsedSummary: 'WT 12.345 kg STABLE',
    },
  ]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3200);
  };

  // Computations
  const currentNet = Math.max(0, targetWeight);
  const currentGross = currentNet + tareWeight;
  const isStable = !isSimulatingUnstable && device.isConnected;

  const currentReading: WeightReading = {
    grossWeight: currentGross,
    netWeight: currentNet,
    tareWeight: tareWeight,
    unit: 'kg',
    displayWeight: activeGrossNetMode === 'GROSS' ? currentGross.toFixed(3) : currentNet.toFixed(3),
    isStable: isStable,
    isZero: targetWeight === 0.0 || Math.abs(targetWeight) < 0.0005,
    timestamp: 'Just now',
    rawString: PROTOCOL_PRESETS[activeProtocol].sampleFrame,
  };

  // Continuous Telemetry Stream & Auto-Capture Loop (§33, §34)
  useEffect(() => {
    if (!device.isConnected || !isSimulatingActive) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      // Add slight jitter if simulating unstable
      if (isSimulatingUnstable) {
        const jitter = (Math.random() - 0.5) * 0.006;
        setTargetWeight((prev) => Math.max(0, parseFloat((prev + jitter).toFixed(3))));
      }

      // Generate authentic packet based on selected protocol
      const preset = PROTOCOL_PRESETS[activeProtocol];
      let frame = '';
      if (activeProtocol === 'CAS') {
        frame = `${isStable ? 'ST' : 'US'},GS,+  ${targetWeight.toFixed(3)}kg`;
      } else if (activeProtocol === 'METTLER_SICS') {
        frame = `S ${isStable ? 'S' : 'D'}   ${targetWeight.toFixed(3)} kg`;
      } else {
        frame = `<LF>W ${targetWeight.toFixed(3)}kg<CR>`;
      }

      const newLog = {
        id: `log-${Date.now()}`,
        time: timeStr,
        direction: 'RX' as const,
        rawPayload: frame,
        hexBytes: '53 54 2C 47 53 2C 31 32 2E 33 34 35 6B 67',
        parsedSummary: `WT ${targetWeight.toFixed(3)} kg ${isStable ? 'STABLE' : 'UNSTABLE'}`,
      };

      setCommLogs((prev) => [...prev.slice(-25), newLog]);
      setDevice((d) => ({
        ...d,
        packetsReceived: d.packetsReceived + 1,
      }));

      // Auto-capture execution if enabled and stable (§13, §14)
      if (autoCapture && isStable && !isReadOnly && isTraceabilityValid) {
        const autoLog: CapturedReadingLog = {
          id: `cap-${Date.now()}`,
          weight: targetWeight.toFixed(3),
          unit: 'kg',
          mode: activeGrossNetMode,
          isStable: true,
          timestamp: timeStr,
          protocol: activeProtocol,
          device: device.name,
        };
        setLastCaptured(autoLog);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [
    device.isConnected,
    isSimulatingActive,
    isSimulatingUnstable,
    activeProtocol,
    targetWeight,
    isStable,
    autoCapture,
    activeGrossNetMode,
    isReadOnly,
    isTraceabilityValid,
    device.name,
  ]);

  // Handlers
  const handleProtocolChange = (proto: ScaleProtocol) => {
    setActiveProtocol(proto);
    const p = PROTOCOL_PRESETS[proto];
    setDevice((prev) => ({
      ...prev,
      protocol: proto,
      name: `${p.manufacturer} (${p.defaultPort.split(' ')[0]})`,
      manufacturer: p.manufacturer,
      model: p.model,
      port: p.defaultPort.split(' ')[0],
      baudRate: p.baudRate,
      welmec: {
        ...prev.welmec,
        counterC: p.counterC,
        counterP: p.counterP,
        firmwareHash: p.firmwareHash,
      },
    }));
    showToast(`Switched protocol to ${proto} (${p.name})`);
  };

  const handleCaptureReading = () => {
    if (!isStable) {
      showToast('Wait for a stable reading before capture.');
      return;
    }
    if (!isTraceabilityValid) {
      showToast('Standard weights traceability gate is locked.');
      return;
    }

    const log: CapturedReadingLog = {
      id: `cap-${Date.now()}`,
      weight: currentReading.displayWeight,
      unit: currentReading.unit,
      mode: activeGrossNetMode,
      isStable: true,
      timestamp: new Date().toLocaleTimeString(),
      protocol: activeProtocol,
      device: `${device.manufacturer} ${device.model}`,
    };

    setLastCaptured(log);
    showToast(`Captured ${log.weight} ${log.unit} (${log.mode})`);
  };

  const handleZero = () => {
    setTargetWeight(0.0);
    showToast('Scale zeroed (>0< command executed)');
  };

  const handleTare = () => {
    setTareWeight(targetWeight);
    showToast(`Tare calibrated to ${targetWeight.toFixed(3)} kg (>T< executed)`);
  };

  const handleDisconnect = () => {
    setDevice((d) => ({
      ...d,
      isConnected: false,
      connectionType: 'DISCONNECTED',
    }));
    showToast('Scale bridge disconnected');
  };

  const handleConnectPhysicalScale = (config: {
    connectionType: 'USB_SERIAL' | 'RS232';
    baudRate: number;
    port: string;
    protocol: ScaleProtocol;
  }) => {
    setIsConnecting(true);
    setTimeout(() => {
      setIsConnecting(false);
      const p = PROTOCOL_PRESETS[config.protocol];
      setDevice((d) => ({
        ...d,
        name: `${p.manufacturer} ${p.model}`,
        manufacturer: p.manufacturer,
        model: p.model,
        serialNumber: 'PHYS-2026-9041',
        port: config.port.split(' ')[0],
        baudRate: config.baudRate,
        protocol: config.protocol,
        isConnected: true,
        connectionType: 'PHYSICAL_SERIAL',
        connectedDuration: '00:00:12',
      }));
      setActiveProtocol(config.protocol);
      showToast(`Physical scale connected on ${config.port.split(' ')[0]}`);
    }, 900);
  };

  const handleLoadSimulator = () => {
    setDevice(INITIAL_SCALE_DEVICE);
    setIsSimulatingActive(true);
    showToast('Virtual Scale Simulator loaded (CAS protocol active)');
  };

  const handleUseCapturedInTest = () => {
    if (!lastCaptured) return;
    if (onUseReadingInTest) {
      onUseReadingInTest(parseFloat(lastCaptured.weight), lastCaptured.unit);
      showToast(`Reading inserted into active test session!`);
    } else {
      showToast(`Reading ${lastCaptured.weight} kg inserted into active observation grid!`);
    }
  };

  const handleSimulateTamper = () => {
    setIsTampered(true);
    setDevice((d) => ({
      ...d,
      welmec: {
        ...d.welmec,
        counterC: '13',
        counterP: '09',
        firmwareHash: 'deadbeef7b190c91c28d72f1c3a91b4e72c10b5039f1c93a8d4e9f7831b204c8',
        state: 'ATTENTION_REQUIRED',
      },
    }));
    showToast('Demo Mode: Software Integrity Issue Simulated');
  };

  const handleResetTamper = () => {
    setIsTampered(false);
    const p = PROTOCOL_PRESETS[activeProtocol];
    setDevice((d) => ({
      ...d,
      welmec: {
        ...d.welmec,
        counterC: p.counterC,
        counterP: p.counterP,
        firmwareHash: p.firmwareHash,
        state: 'VERIFIED',
      },
    }));
    showToast('Software integrity restored to VERIFIED');
  };

  return (
    <div className="space-y-6 pb-20 relative font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-20 right-8 z-50 bg-foundation-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-foundation-700 text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* 1. Page Header (§4) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-foundation-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-100 text-foundation-600 transition-colors shadow-xs cursor-pointer"
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-100 text-brand-800 border border-brand-200">
                SCREEN 15
              </span>
              <h1 className="text-xl font-bold text-foundation-900 tracking-tight font-sans">
                Live Scale Bridge
              </h1>
            </div>
            <p className="text-xs text-foundation-500 mt-0.5 font-sans">
              Connect a weighing instrument and capture stable readings directly into the active test.
            </p>
          </div>
        </div>

        {/* Top-right Status Pill (§4, §26) */}
        <div className="flex items-center gap-2">
          {!device.isConnected ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-foundation-100 text-foundation-700 text-xs font-mono font-bold border border-foundation-200">
              <span className="w-2 h-2 rounded-full bg-foundation-400" />
              <span>● DISCONNECTED</span>
            </div>
          ) : device.connectionType === 'VIRTUAL_SIMULATOR' ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-indigo-100 text-indigo-900 border border-indigo-200 text-xs font-mono font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>● SIMULATOR ({activeProtocol})</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-emerald-100 text-emerald-900 border border-emerald-300 text-xs font-mono font-bold shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <span>● CONNECTED (PHYSICAL SCALE)</span>
            </div>
          )}
        </div>
      </div>

      {/* 2. Traceability Gate Indicator (§28) & Active Session Context (§27) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Active Test Session Context */}
        <div className="p-4 rounded-2xl bg-white border border-foundation-200 shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-brand-50 text-brand-700 flex items-center justify-center font-bold">
              <Layers size={18} />
            </div>
            <div>
              <span className="text-[10px] font-bold text-foundation-400 uppercase tracking-wider font-mono">
                ACTIVE TEST SESSION
              </span>
              <div className="text-xs font-bold text-foundation-900">
                Avery ZM201 • AV-2026-8812 • Class III • 30 kg
              </div>
              <div className="text-[11px] font-mono text-foundation-500">
                Current test: <strong className="text-foundation-800">Weighing (Observation Grid)</strong>
              </div>
            </div>
          </div>

          <button
            type="button"
            disabled={!lastCaptured || !isStable || isReadOnly}
            onClick={handleUseCapturedInTest}
            className="px-3.5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer shrink-0"
          >
            <span>Capture → Active Test</span>
            <ArrowRight size={13} />
          </button>
        </div>

        {/* Traceability Gate State */}
        <div
          className={`p-4 rounded-2xl border shadow-xs flex items-center justify-between ${
            isTraceabilityValid
              ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950'
              : 'bg-rose-50 border-rose-200 text-rose-950'
          }`}
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${
                isTraceabilityValid
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-rose-100 text-rose-700'
              }`}
            >
              {isTraceabilityValid ? <ShieldCheck size={18} /> : <Lock size={18} />}
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider font-mono opacity-70">
                STANDARD WEIGHTS
              </span>
              <div className="text-xs font-bold font-mono">
                {isTraceabilityValid ? '✓ F1 FW-24-018 VALID' : '🔒 TEST INPUT LOCKED'}
              </div>
              <div className="text-[11px] font-sans opacity-80">
                {isTraceabilityValid
                  ? 'Metrological calibration valid until 18 Nov 2026'
                  : 'Required standard weight traceability is not valid.'}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsTraceabilityValid(!isTraceabilityValid)}
            className="text-[11px] font-mono underline opacity-70 hover:opacity-100 shrink-0"
          >
            {isTraceabilityValid ? 'Simulate Expired' : 'Re-verify Standard'}
          </button>
        </div>
      </div>

      {/* 3. Serial COM Status Banner (§5, §26) */}
      <SerialConnectionBanner
        device={device}
        isConnecting={isConnecting}
        onConnectPhysical={() => setIsConnectModalOpen(true)}
        onDisconnect={handleDisconnect}
        onToggleSimulator={handleLoadSimulator}
        onOpenPortConfig={() => setIsConnectModalOpen(true)}
      />

      {/* 4. Hero Section: Live Weight Display (7 cols) + WELMEC 7.2 Card (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column (7 cols): Hero 7-Segment Live Weight Indicator */}
        <div className="lg:col-span-7 flex flex-col">
          <LiveWeightIndicator
            reading={currentReading}
            isConnected={device.isConnected}
            onCapture={handleCaptureReading}
            onZero={handleZero}
            onTare={handleTare}
            onToggleGrossNet={setActiveGrossNetMode}
            activeMode={activeGrossNetMode}
            lastCaptured={lastCaptured}
            onUseInTest={handleUseCapturedInTest}
            autoCapture={autoCapture}
            onToggleAutoCapture={setAutoCapture}
            isReadOnly={isReadOnly}
          />
        </div>

        {/* Right Column (5 cols): WELMEC 7.2 Software Examination Card */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <WelmecExaminationCard
            welmec={device.welmec}
            onOpenDrawer={() => setIsWelmecDrawerOpen(true)}
            onShowToast={showToast}
            onSimulateTamper={handleSimulateTamper}
            onResetTamper={handleResetTamper}
            isTampered={isTampered}
          />
        </div>
      </div>

      {/* 5. Collapsible Serial / Telemetry Log Console (§22, §23, §24) */}
      <LiveCommunicationStream
        logs={commLogs}
        onClearLogs={() => setCommLogs([])}
        protocolName={PROTOCOL_PRESETS[activeProtocol].name}
      />

      {/* 6. Virtual Scale Simulator Workbench (§20, §21, §33, §34, §35) */}
      <VirtualScaleSimulator
        activeProtocol={activeProtocol}
        onChangeProtocol={handleProtocolChange}
        targetWeight={targetWeight}
        onSetTargetWeight={setTargetWeight}
        isSimulatingUnstable={isSimulatingUnstable}
        onToggleUnstable={() => setIsSimulatingUnstable(!isSimulatingUnstable)}
        isSimulatingActive={isSimulatingActive}
        onToggleSimulatorActive={() => setIsSimulatingActive(!isSimulatingActive)}
        onResetZero={() => setTargetWeight(0.0)}
      />

      {/* 7. Modals and Drawers */}
      <PhysicalScaleConnectModal
        isOpen={isConnectModalOpen}
        onClose={() => setIsConnectModalOpen(false)}
        onConnect={handleConnectPhysicalScale}
      />

      <WelmecDetailDrawer
        isOpen={isWelmecDrawerOpen}
        onClose={() => setIsWelmecDrawerOpen(false)}
        welmec={device.welmec}
      />
    </div>
  );
};
