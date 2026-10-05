import React, { createContext, useContext, useState, useEffect } from 'react';
import { emitAuditEvent } from '../lib/audit/auditEvents';

export interface ScalePacket {
  raw: string;
  weight: number;
  unit: string;
  isStable: boolean;
  isZero: boolean;
  timestamp: string;
}

interface IoTContextType {
  scaleConnected: boolean;
  isSimulatorActive: boolean;
  currentWeight: number;
  unit: string;
  isStable: boolean;
  isZero: boolean;
  mode: 'GROSS' | 'NET';
  scaleModel: string;
  baudRate: number;
  port: string;
  serialLogs: string[];
  welmecAuditLogs: string[];
  lastCapturedWeight: number | null;
  autoCaptureToGrid: boolean;

  // Actions (§17, §39, §40)
  connectScale: () => void;
  disconnectScale: () => void;
  toggleSimulator: () => void;
  setSimulatorWeight: (weight: number) => void;
  tare: () => void;
  zero: () => void;
  toggleGrossNet: () => void;
  captureCurrentReading: () => { weight: number; unit: string; isStable: boolean };
  setAutoCaptureToGrid: (active: boolean) => void;
}

const IoTContext = createContext<IoTContextType | null>(null);

export const IoTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [scaleConnected, setScaleConnected] = useState<boolean>(true);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(true);
  const [currentWeight, setCurrentWeight] = useState<number>(10.0);
  const [unit, setUnit] = useState<string>('kg');
  const [isStable, setIsStable] = useState<boolean>(true);
  const [isZero, setIsZero] = useState<boolean>(false);
  const [mode, setMode] = useState<'GROSS' | 'NET'>('GROSS');
  const [scaleModel, setScaleModel] = useState<string>('Avery ZM201 (COM3)');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [port, setPort] = useState<string>('COM3');
  const [serialLogs, setSerialLogs] = useState<string[]>([
    '[INIT] Virtual WebSerial Bridge instantiated on COM3 @ 9600-8-N-1',
    '[OK] Avery ZM201 continuous broadcast detected: ST,GS,+00010.000,kg',
  ]);
  const [welmecAuditLogs, setWelmecAuditLogs] = useState<string[]>([
    '[WELMEC 7.2] Software separation verified - Metrological core immutable',
    '[WELMEC 7.2] Event counter: 14 matches instrument physical e-prom audit trail',
  ]);
  const [lastCapturedWeight, setLastCapturedWeight] = useState<number | null>(null);
  const [autoCaptureToGrid, setAutoCaptureToGrid] = useState<boolean>(false);

  // Micro jitter simulator when simulator is active to mimic physical load cell
  useEffect(() => {
    if (!isSimulatorActive || !scaleConnected) return;

    const interval = setInterval(() => {
      const jitter = (Math.random() - 0.5) * 0.0005;
      const base = currentWeight;
      const rounded = Number((base + jitter).toFixed(4));
      setIsStable(Math.random() > 0.12);
    }, 1200);

    return () => clearInterval(interval);
  }, [isSimulatorActive, scaleConnected, currentWeight]);

  const connectScale = () => {
    setScaleConnected(true);
    const log = `[CONNECT] Scale connected on ${port} at ${new Date().toLocaleTimeString()}`;
    setSerialLogs((prev) => [...prev.slice(-25), log]);
    emitAuditEvent({ action: 'SCALE_CONNECTED', metadata: { port, baudRate } });
  };

  const disconnectScale = () => {
    setScaleConnected(false);
    const log = `[DISCONNECT] Port closed at ${new Date().toLocaleTimeString()}`;
    setSerialLogs((prev) => [...prev.slice(-25), log]);
    emitAuditEvent({ action: 'SCALE_DISCONNECTED', metadata: { port } });
  };

  const toggleSimulator = () => {
    setIsSimulatorActive((prev) => !prev);
  };

  const setSimulatorWeight = (w: number) => {
    setCurrentWeight(w);
    setIsStable(true);
    setIsZero(w === 0);
    const log = `[SIM] Platter weight set to ${w} ${unit}`;
    setSerialLogs((prev) => [...prev.slice(-25), log]);
  };

  const tare = () => {
    setCurrentWeight(0.0);
    setIsZero(true);
    setIsStable(true);
    setMode('NET');
    const log = `[COMMAND] TARE sent -> scale tare executed successfully`;
    setSerialLogs((prev) => [...prev.slice(-25), log]);
    emitAuditEvent({ action: 'SCALE_TARE_COMMAND', metadata: { mode: 'NET' } });
  };

  const zero = () => {
    setCurrentWeight(0.0);
    setIsZero(true);
    setIsStable(true);
    setMode('GROSS');
    const log = `[COMMAND] ZERO sent -> gross zero confirmed`;
    setSerialLogs((prev) => [...prev.slice(-25), log]);
    emitAuditEvent({ action: 'SCALE_ZERO_COMMAND', metadata: { mode: 'GROSS' } });
  };

  const toggleGrossNet = () => {
    setMode((prev) => (prev === 'GROSS' ? 'NET' : 'GROSS'));
  };

  const captureCurrentReading = () => {
    setLastCapturedWeight(currentWeight);
    emitAuditEvent({
      action: 'LIVE_WEIGHT_CAPTURED',
      metadata: { weight: currentWeight, unit, isStable, mode },
    });
    return {
      weight: currentWeight,
      unit,
      isStable,
    };
  };

  return (
    <IoTContext.Provider
      value={{
        scaleConnected,
        isSimulatorActive,
        currentWeight,
        unit,
        isStable,
        isZero,
        mode,
        scaleModel,
        baudRate,
        port,
        serialLogs,
        welmecAuditLogs,
        lastCapturedWeight,
        autoCaptureToGrid,
        connectScale,
        disconnectScale,
        toggleSimulator,
        setSimulatorWeight,
        tare,
        zero,
        toggleGrossNet,
        captureCurrentReading,
        setAutoCaptureToGrid,
      }}
    >
      {children}
    </IoTContext.Provider>
  );
};

export const useIoT = () => {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used within an IoTProvider');
  }
  return context;
};
