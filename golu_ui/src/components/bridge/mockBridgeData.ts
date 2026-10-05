import { ScaleDevice, ScaleProtocol } from './types';

export const PROTOCOL_PRESETS: Record<ScaleProtocol, {
  name: string;
  manufacturer: string;
  model: string;
  defaultPort: string;
  baudRate: number;
  sampleFrame: string;
  unit: 'kg' | 'g';
  counterC: string;
  counterP: string;
  firmwareHash: string;
}> = {
  CAS: {
    name: 'CAS Protocol (22-Byte Continuous Stream)',
    manufacturer: 'CAS Corporation',
    model: 'CI-2001A Metrology Indicator',
    defaultPort: 'COM1 (USB-RS232 FTDI)',
    baudRate: 9600,
    sampleFrame: 'ST,GS,+  12.345kg',
    unit: 'kg',
    counterC: '12',
    counterP: '08',
    firmwareHash: 'a84f2e917b190c91c28d72f1c3a91b4e72c10b5039f1c93a8d4e9f7831b204c8',
  },
  METTLER_SICS: {
    name: 'Mettler SICS (Standard Interface Command Set)',
    manufacturer: 'Mettler-Toledo',
    model: 'XPR Analytical Micro-Balance',
    defaultPort: 'COM4 (USB-Serial)',
    baudRate: 9600,
    sampleFrame: 'S S   12.345 kg',
    unit: 'kg',
    counterC: '14',
    counterP: '08',
    firmwareHash: '8d72f1c3a91b4e72c10b5039f1c93a8d4e9f7831b204c8e71a04b86291a61e9b',
  },
  AVERY_SMA: {
    name: 'Avery SMA (Scale Manufacturers Association Level 2)',
    manufacturer: 'Avery Weigh-Tronix',
    model: 'ZM201 Retail Platform',
    defaultPort: 'COM3 (RS-232 DB9)',
    baudRate: 19200,
    sampleFrame: '<LF>W 12.345kg<CR>',
    unit: 'kg',
    counterC: '12',
    counterP: '08',
    firmwareHash: 'f1904b81920491820394182904819204819204819204128901bca09481920491',
  },
};

export const INITIAL_SCALE_DEVICE: ScaleDevice = {
  name: 'Virtual Scale Simulator',
  manufacturer: 'Avery Weigh-Tronix',
  model: 'ZM201 Retail Platform',
  serialNumber: 'AV-2026-8812',
  port: 'DEMO-COM',
  protocol: 'CAS',
  baudRate: 9600,
  isConnected: true,
  connectionType: 'VIRTUAL_SIMULATOR',
  connectedDuration: '00:06:18',
  packetsReceived: 382,
  latencyMs: 14,
  welmec: {
    counterC: '12',
    counterP: '08',
    firmwareHash: 'a84f2e917b190c91c28d72f1c3a91b4e72c10b5039f1c93a8d4e9f7831b204c8',
    state: 'VERIFIED',
    version: 'v2.4.1-OIML',
    lastChecked: '04 Oct 2026 • 18:42',
    welmecClause: 'WELMEC 7.2 Guide Section 2.1 & 3.2',
  },
};
