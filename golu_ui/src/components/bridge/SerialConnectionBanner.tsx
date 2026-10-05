import React from 'react';
import { Cable, Radio, Sliders, PowerOff, Play, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { ScaleDevice } from './types';

interface SerialConnectionBannerProps {
  device: ScaleDevice;
  isConnecting?: boolean;
  onConnectPhysical: () => void;
  onDisconnect: () => void;
  onToggleSimulator: () => void;
  onOpenPortConfig?: () => void;
}

export const SerialConnectionBanner: React.FC<SerialConnectionBannerProps> = ({
  device,
  isConnecting = false,
  onConnectPhysical,
  onDisconnect,
  onToggleSimulator,
  onOpenPortConfig,
}) => {
  // Case 1: Connecting State
  if (isConnecting) {
    return (
      <div className="rounded-3xl border border-brand-200 bg-brand-50/50 p-6 shadow-xs animate-pulse">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-brand-600 text-white flex items-center justify-center shrink-0">
            <Loader2 size={24} className="animate-spin" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-brand-600 animate-ping" />
              <span className="font-mono text-xs font-bold text-brand-900 tracking-wider">
                ○ CONNECTING TO SCALE...
              </span>
            </div>
            <p className="text-xs text-brand-700 mt-1 font-sans">
              Detecting serial interface on requested COM port. Handshaking protocol frames...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Disconnected State
  if (!device.isConnected) {
    return (
      <div className="rounded-3xl border border-dashed border-foundation-300 bg-foundation-50/70 p-7 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-foundation-200 text-foundation-600 flex items-center justify-center shrink-0">
              <Cable size={26} />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 font-mono text-xs font-bold text-foundation-600 mb-1">
                <span>○ NO SCALE CONNECTED</span>
              </div>
              <h3 className="text-base font-bold text-foundation-900 font-sans">
                Connect a physical scale using USB / RS-232
              </h3>
              <p className="text-xs text-foundation-500 font-sans mt-0.5">
                Plug in an OIML-compliant balance or use the virtual simulator for demonstration.
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onConnectPhysical}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
            >
              <Cable size={15} />
              <span>Connect Physical Scale</span>
            </button>

            <button
              type="button"
              onClick={onToggleSimulator}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-100 text-foundation-700 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} className="text-brand-600" />
              <span>Load Virtual Simulator</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Connected State (Distinguish Physical vs Simulator)
  const isSim = device.connectionType === 'VIRTUAL_SIMULATOR';

  return (
    <div className="rounded-3xl border border-foundation-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        {/* Left Side: Status & Identification */}
        <div className="flex items-start sm:items-center gap-4">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
              isSim ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'
            }`}
          >
            {isSim ? <Sparkles size={22} /> : <Cable size={22} />}
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-bold px-2.5 py-0.5 rounded-md uppercase tracking-wider ${
                  isSim
                    ? 'bg-indigo-100 text-indigo-900 border border-indigo-200'
                    : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isSim ? 'bg-indigo-600 animate-pulse' : 'bg-emerald-600 animate-pulse'
                  }`}
                />
                <span>{isSim ? '● SIMULATOR CONNECTED' : '● PHYSICAL SCALE CONNECTED'}</span>
              </span>

              <span className="text-xs font-mono text-foundation-500">
                Uptime {device.connectedDuration}
              </span>
            </div>

            <div className="mt-1 flex flex-wrap items-baseline gap-2">
              <h3 className="text-base font-bold text-foundation-900 font-sans tracking-tight">
                {isSim ? 'Virtual Balance Simulator' : `${device.manufacturer} ${device.model}`}
              </h3>
              <span className="text-xs font-mono text-foundation-500">
                ({isSim ? 'Software Packet Harness' : device.serialNumber})
              </span>
            </div>

            {/* Hardware Port & Protocol Details */}
            <div className="flex flex-wrap items-center gap-3 text-xs font-mono text-foundation-600 mt-1">
              <span>
                Port: <strong className="text-foundation-900 font-bold">{device.port}</strong>
              </span>
              <span>•</span>
              <span>
                Protocol: <strong className="text-foundation-900 font-bold">{device.protocol}</strong>
              </span>
              <span>•</span>
              <span>
                Baud: <strong className="text-foundation-900 font-bold">{device.baudRate} bps</strong>
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold">
                ● Receiving telemetry ({device.latencyMs} ms)
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Controls */}
        <div className="flex flex-wrap items-center gap-2.5 self-end lg:self-auto shrink-0">
          {onOpenPortConfig && (
            <button
              type="button"
              onClick={onOpenPortConfig}
              className="px-3.5 py-2 rounded-xl border border-foundation-200 bg-white hover:bg-foundation-50 text-xs font-semibold text-foundation-700 transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Sliders size={14} className="text-foundation-500" />
              <span>Port Config</span>
            </button>
          )}

          {isSim ? (
            <>
              <button
                type="button"
                onClick={onConnectPhysical}
                className="px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <Cable size={14} />
                <span>Connect Physical Scale</span>
              </button>
              <button
                type="button"
                onClick={onToggleSimulator}
                className="px-4 py-2 rounded-xl border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-900 text-xs font-semibold transition-colors flex items-center gap-1.5"
              >
                <PowerOff size={14} className="text-indigo-600" />
                <span>Stop Simulator</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={onDisconnect}
              className="px-4 py-2 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-semibold transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <PowerOff size={14} className="text-rose-600" />
              <span>Disconnect</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
