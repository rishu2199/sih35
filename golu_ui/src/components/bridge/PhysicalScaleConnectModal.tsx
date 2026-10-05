import React, { useState } from 'react';
import { X, Cable, Radio, Cpu, Check, AlertCircle } from 'lucide-react';
import { ScaleProtocol } from './types';

interface PhysicalScaleConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (config: {
    connectionType: 'USB_SERIAL' | 'RS232';
    baudRate: number;
    port: string;
    protocol: ScaleProtocol;
  }) => void;
}

export const PhysicalScaleConnectModal: React.FC<PhysicalScaleConnectModalProps> = ({
  isOpen,
  onClose,
  onConnect,
}) => {
  const [connectionType, setConnectionType] = useState<'USB_SERIAL' | 'RS232'>('USB_SERIAL');
  const [baudRate, setBaudRate] = useState<number>(9600);
  const [port, setPort] = useState<string>('COM3 (FTDI USB-Serial Converter)');
  const [protocol, setProtocol] = useState<ScaleProtocol>('METTLER_SICS');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConnect({
      connectionType,
      baudRate,
      port,
      protocol,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-foundation-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-foundation-200 overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="p-5 border-b border-foundation-100 flex items-center justify-between bg-foundation-50">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center shadow-xs">
              <Cable size={18} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foundation-900 font-sans">
                Connect Physical Scale
              </h3>
              <p className="text-[11px] font-mono text-foundation-500">
                WebSerial / Direct COM Interface
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs font-sans">
          {/* Connection Type */}
          <div className="space-y-2">
            <label className="font-bold text-foundation-800 uppercase tracking-wider font-mono text-[11px]">
              Connection Type
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  connectionType === 'USB_SERIAL'
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-semibold'
                    : 'border-foundation-200 hover:bg-foundation-50 text-foundation-700'
                }`}
              >
                <input
                  type="radio"
                  name="connType"
                  value="USB_SERIAL"
                  checked={connectionType === 'USB_SERIAL'}
                  onChange={() => setConnectionType('USB_SERIAL')}
                  className="accent-brand-600"
                />
                <span>USB / Serial</span>
              </label>

              <label
                className={`flex items-center gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                  connectionType === 'RS232'
                    ? 'border-brand-600 bg-brand-50/50 text-brand-900 font-semibold'
                    : 'border-foundation-200 hover:bg-foundation-50 text-foundation-700'
                }`}
              >
                <input
                  type="radio"
                  name="connType"
                  value="RS232"
                  checked={connectionType === 'RS232'}
                  onChange={() => setConnectionType('RS232')}
                  className="accent-brand-600"
                />
                <span>RS-232 (DB9)</span>
              </label>
            </div>
          </div>

          {/* Serial Configuration */}
          <div className="space-y-4 pt-2 border-t border-foundation-100">
            <span className="font-bold text-foundation-800 uppercase tracking-wider font-mono text-[11px] block">
              Serial Configuration
            </span>

            {/* Baud Rate */}
            <div className="space-y-1.5">
              <label className="text-foundation-600 font-medium">Baud Rate</label>
              <select
                value={baudRate}
                onChange={(e) => setBaudRate(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-foundation-200 bg-foundation-50 focus:bg-white focus:border-brand-600 focus:outline-none font-mono text-xs font-semibold"
              >
                <option value={4800}>4800 bps</option>
                <option value={9600}>9600 bps (Standard)</option>
                <option value={19200}>19200 bps</option>
                <option value={38400}>38400 bps</option>
                <option value={115200}>115200 bps (High Speed)</option>
              </select>
            </div>

            {/* Port */}
            <div className="space-y-1.5">
              <label className="text-foundation-600 font-medium">Available Hardware Port</label>
              <select
                value={port}
                onChange={(e) => setPort(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-foundation-200 bg-foundation-50 focus:bg-white focus:border-brand-600 focus:outline-none font-mono text-xs font-semibold"
              >
                <option value="COM3 (FTDI USB-Serial Converter)">COM3 - FTDI USB-Serial Converter</option>
                <option value="COM1 (Standard RS-232 DB9)">COM1 - Standard RS-232 DB9</option>
                <option value="COM4 (Mettler Balance Interface)">COM4 - Mettler Balance Interface</option>
                <option value="COM8 (CAS Metrology Scale)">COM8 - CAS Metrology Scale</option>
              </select>
            </div>

            {/* Protocol */}
            <div className="space-y-1.5">
              <label className="text-foundation-600 font-medium">Scale Protocol</label>
              <select
                value={protocol}
                onChange={(e) => setProtocol(e.target.value as ScaleProtocol)}
                className="w-full px-3 py-2 rounded-xl border border-foundation-200 bg-foundation-50 focus:bg-white focus:border-brand-600 focus:outline-none font-mono text-xs font-semibold"
              >
                <option value="METTLER_SICS">Mettler SICS (Standard Interface Command Set)</option>
                <option value="CAS">CAS Continuous Stream (22-Byte Frame)</option>
                <option value="AVERY_SMA">Avery SMA Level 2 Protocol</option>
              </select>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
            <AlertCircle size={15} className="text-amber-600 shrink-0 mt-0.5" />
            <span>
              Ensure scale is switched on and serial parity is set to 8-N-1 on the hardware indicator.
            </span>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-foundation-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-foundation-700 font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold transition-all shadow-xs flex items-center gap-1.5"
            >
              <Cable size={14} />
              <span>Connect</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
