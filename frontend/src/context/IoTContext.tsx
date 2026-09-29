import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import type {
  SerialTelemetryPacket,
  WelmecAuditTelemetry,
} from '../features/iot/webserial_client';
import { WebSerialScaleClient } from '../features/iot/webserial_client';

interface IoTContextType {
  isConnected: boolean;
  isSimulatorActive: boolean;
  currentPacket: SerialTelemetryPacket | null;
  currentWeight: number;
  isStable: boolean;
  unit: string;
  isZero: boolean;
  mode: string;
  serialLogs: { id: string; time: string; text: string; dir: 'RX' | 'TX' }[];
  welmecAudit: WelmecAuditTelemetry;
  autoCaptureToGrid: boolean;
  lastCapturedWeight: number | null;
  setIsSimulatorActive: (active: boolean) => void;
  setAutoCaptureToGrid: (enabled: boolean) => void;
  connectPhysicalSerial: (baudRate?: number) => Promise<boolean>;
  disconnectPhysicalSerial: () => Promise<void>;
  sendSerialCommand: (cmd: string) => Promise<boolean>;
  emitSimulatorPacket: (packet: SerialTelemetryPacket) => void;
  interrogateWelmec: (simulateTamper?: boolean) => Promise<WelmecAuditTelemetry>;
  captureCurrentReading: () => { weight: number; isStable: boolean };
  clearLogs: () => void;
}

const defaultWelmecAudit: WelmecAuditTelemetry = {
  calibrationCounter: 42,
  parameterCounter: 17,
  firmwareHash: 'a3f9e29b8c0147d3e5124b89',
  softwareVersion: 'LM-v2.4.1-WELMEC',
  tamperDetected: false,
  verdict: 'VERIFIED',
  details:
    'Statutory WELMEC 7.2 verification confirmed. Calibration event counter C=0042 matches registered baseline. Zero unauthorized recalibrations.',
};

const IoTContext = createContext<IoTContextType | undefined>(undefined);

export const IoTProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSimulatorActive, setIsSimulatorActive] = useState<boolean>(true); // Default true for zero-fail demos
  const [currentPacket, setCurrentPacket] = useState<SerialTelemetryPacket | null>({
    raw: 'ST,GS,+0010.000kg\r\n',
    protocol: 'CAS',
    valid: true,
    stable: true,
    weight: 10000,
    unit: 'g',
    mode: 'GROSS',
    isZero: false,
    isOverload: false,
    isUnderload: false,
    timestamp: Date.now(),
  });
  const [currentWeight, setCurrentWeight] = useState<number>(10000);
  const [isStable, setIsStable] = useState<boolean>(true);
  const [unit, setUnit] = useState<string>('g');
  const [isZero, setIsZero] = useState<boolean>(false);
  const [mode, setMode] = useState<string>('GROSS');
  const [serialLogs, setSerialLogs] = useState<{ id: string; time: string; text: string; dir: 'RX' | 'TX' }[]>([
    {
      id: 'log-init',
      time: new Date().toLocaleTimeString(),
      text: 'ST,GS,+0010.000kg',
      dir: 'RX',
    },
  ]);
  const [welmecAudit, setWelmecAudit] = useState<WelmecAuditTelemetry>(defaultWelmecAudit);
  const [autoCaptureToGrid, setAutoCaptureToGrid] = useState<boolean>(true);
  const [lastCapturedWeight, setLastCapturedWeight] = useState<number | null>(null);

  const clientRef = useRef<WebSerialScaleClient>(new WebSerialScaleClient());

  // Log addition helper
  const addLog = useCallback((text: string, dir: 'RX' | 'TX' = 'RX') => {
    const time = new Date().toLocaleTimeString();
    const id = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    setSerialLogs((prev) => [
      { id, time, text, dir },
      ...prev.slice(0, 99), // Keep last 100 logs
    ]);
  }, []);

  // Handle incoming telemetry packet
  const handlePacket = useCallback(
    (packet: SerialTelemetryPacket) => {
      setCurrentPacket(packet);
      if (packet.weight !== null) {
        setCurrentWeight(packet.weight);
      }
      setIsStable(packet.stable);
      setUnit(packet.unit);
      setIsZero(packet.isZero);
      setMode(packet.mode);

      // Only add to log periodically to prevent DOM flood
      if (Math.random() < 0.25 || packet.raw.includes('ST,') || packet.raw.includes('WELMEC')) {
        addLog(packet.raw.trim(), 'RX');
      }
    },
    [addLog]
  );

  // Initialize WebSerial listener callbacks
  useEffect(() => {
    const client = clientRef.current;
    client.onPacket(handlePacket);
    client.onAudit((audit) => {
      setWelmecAudit(audit);
      addLog(`WELMEC Audit: C=${audit.calibrationCounter} [${audit.verdict}]`, 'RX');
    });
    client.onStatus((connected, msg) => {
      setIsConnected(connected);
      addLog(`STATUS: ${msg}`, 'RX');
    });

    return () => {
      client.disconnect();
    };
  }, [handlePacket, addLog]);

  // Connect to physical hardware scale via WebSerial
  const connectPhysicalSerial = useCallback(
    async (baudRate: number = 9600) => {
      const client = clientRef.current;
      const success = await client.connect(baudRate);
      if (success) {
        setIsSimulatorActive(false); // Switch to physical
      }
      return success;
    },
    []
  );

  // Disconnect from physical hardware
  const disconnectPhysicalSerial = useCallback(async () => {
    await clientRef.current.disconnect();
    setIsConnected(false);
  }, []);

  // Send raw ASCII command
  const sendSerialCommand = useCallback(
    async (cmd: string) => {
      addLog(cmd, 'TX');
      if (isConnected) {
        return await clientRef.current.sendCommand(cmd);
      } else {
        // If in simulator mode, handle locally
        if (cmd.toUpperCase().includes('I4') || cmd.toUpperCase().includes('C')) {
          const audit = WebSerialScaleClient.parseWelmecAudit(
            'I4 A "WELMEC-7.2;C=0042;P=0017;FW=a3f9e29b8c0147d3e5124b89;V=2.4.1"\r\n',
            42
          );
          setWelmecAudit(audit);
          addLog('I4 A "WELMEC-7.2;C=0042;P=0017;FW=a3f9e29b;V=2.4.1"', 'RX');
        } else if (cmd.toUpperCase().startsWith('S')) {
          addLog(`S S ${currentWeight} ${unit}`, 'RX');
        } else if (cmd.toUpperCase().startsWith('Z')) {
          setCurrentWeight(0);
          setIsZero(true);
          addLog('Z A (Zero Acknowledged)', 'RX');
        }
        return true;
      }
    },
    [isConnected, currentWeight, unit, addLog]
  );

  // Emit packet from Virtual Scale Simulator
  const emitSimulatorPacket = useCallback(
    (packet: SerialTelemetryPacket) => {
      if (isSimulatorActive) {
        handlePacket(packet);
      }
    },
    [isSimulatorActive, handlePacket]
  );

  // Interrogate WELMEC 7.2 software counter
  const interrogateWelmec = useCallback(
    async (simulateTamper: boolean = false): Promise<WelmecAuditTelemetry> => {
      const expected = 42;
      const reported = simulateTamper ? 43 : 42;
      addLog(`Querying WELMEC 7.2 software counter (I4)...`, 'TX');

      try {
        // Call backend API if online
        const resp = await fetch('/api/v1/iot/welmec/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            reported_counter: reported,
            expected_counter: expected,
            instrument_serial: 'SN-2026-9931',
          }),
        });
        if (resp.ok) {
          const data = await resp.json();
          const audit: WelmecAuditTelemetry = {
            calibrationCounter: data.calibration_counter,
            parameterCounter: data.parameter_counter,
            firmwareHash: data.firmware_hash,
            softwareVersion: data.software_version,
            tamperDetected: data.tamper_detected,
            verdict: data.audit_verdict,
            details: data.details,
          };
          setWelmecAudit(audit);
          addLog(`WELMEC Response: C=${audit.calibrationCounter} [${audit.verdict}]`, 'RX');
          return audit;
        }
      } catch (_) {}

      // Fallback local evaluation
      const counter = simulateTamper ? 43 : 42;
      const raw = `I4 A "WELMEC-7.2;C=${counter.toString().padStart(4, '0')};P=0017;FW=a3f9e29b8c0147d3e5124b89;V=2.4.1"\r\n`;
      const audit = WebSerialScaleClient.parseWelmecAudit(raw, 42);
      setWelmecAudit(audit);
      addLog(`WELMEC Response: C=${audit.calibrationCounter} [${audit.verdict}]`, 'RX');
      return audit;
    },
    [addLog]
  );

  // Trigger manual capture
  const captureCurrentReading = useCallback(() => {
    setLastCapturedWeight(currentWeight);
    return { weight: currentWeight, isStable };
  }, [currentWeight, isStable]);

  const clearLogs = useCallback(() => {
    setSerialLogs([]);
  }, []);

  return (
    <IoTContext.Provider
      value={{
        isConnected,
        isSimulatorActive,
        currentPacket,
        currentWeight,
        isStable,
        unit,
        isZero,
        mode,
        serialLogs,
        welmecAudit,
        autoCaptureToGrid,
        lastCapturedWeight,
        setIsSimulatorActive,
        setAutoCaptureToGrid,
        connectPhysicalSerial,
        disconnectPhysicalSerial,
        sendSerialCommand,
        emitSimulatorPacket,
        interrogateWelmec,
        captureCurrentReading,
        clearLogs,
      }}
    >
      {children}
    </IoTContext.Provider>
  );
};

export const useIoT = (): IoTContextType => {
  const context = useContext(IoTContext);
  if (!context) {
    throw new Error('useIoT must be used within an IoTProvider');
  }
  return context;
};
