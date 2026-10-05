import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, AlertTriangle, ShieldCheck, Cpu, Play, Check } from 'lucide-react';
import { TestSession } from '../../types';

interface TestingWorkspaceViewProps {
  session?: any;
  onBackToDashboard: () => void;
  onSessionUpdate?: (updated: any) => void;
}

export const TestingWorkspaceView: React.FC<TestingWorkspaceViewProps> = ({
  session,
  onBackToDashboard,
  onSessionUpdate,
}) => {
  const [activeStep, setActiveStep] = useState<'eccentricity' | 'weighing' | 'tare'>('eccentricity');
  const [liveReading, setLiveReading] = useState('10.000 kg');
  const [isStable, setIsStable] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState<number>(4);

  const instrumentTitle = session?.instrumentModel || session?.instrument || 'Avery Class III Retail';
  const sessionNum = session?.sessionNumber || session?.id || 'VR-2026-00418';
  const serialNum = session?.serialNumber || 'AV-2026-8812';
  const capacity = session?.maxCapacity || '30 kg';
  const intervalVal = session?.verificationInterval || session?.interval || 'e = 0.005 kg';
  const operator = session?.operatorName || 'Metrologist';

  // Position readings for Eccentricity (1/3 Max = 10 kg)
  const [positions, setPositions] = useState([
    { pos: 1, name: 'Center', target: '10.000 kg', reading: '10.001 kg', error: '+0.1 g', mpe: '±5.0 g', status: 'PASS' },
    { pos: 2, name: 'Front-Left', target: '10.000 kg', reading: '9.998 kg', error: '-0.2 g', mpe: '±5.0 g', status: 'PASS' },
    { pos: 3, name: 'Rear-Left', target: '10.000 kg', reading: '10.002 kg', error: '+0.2 g', mpe: '±5.0 g', status: 'PASS' },
    { pos: 4, name: 'Rear-Right', target: '10.000 kg', reading: '9.9938 kg', error: '-6.2 g', mpe: '±5.0 g', status: 'FAIL' },
    { pos: 5, name: 'Front-Right', target: '10.000 kg', reading: '10.001 kg', error: '+0.1 g', mpe: '±5.0 g', status: 'PASS' },
  ]);

  const handleCaptureReading = () => {
    setPositions((prev) =>
      prev.map((p) =>
        p.pos === selectedPosition
          ? { ...p, reading: liveReading, error: '+0.2 g', status: 'PASS' }
          : p
      )
    );
  };

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-foundation-200">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-lg border border-foundation-200 hover:bg-foundation-100 text-foundation-600 transition-colors"
            title="Return to Dashboard"
          >
            <ArrowLeft size={16} />
          </button>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-foundation-100 text-foundation-700">
                {sessionNum}
              </span>
              <h1 className="text-xl font-bold text-foundation-900 tracking-tight">
                {instrumentTitle}
              </h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 font-semibold border border-brand-200">
                OIML Class III
              </span>
            </div>
            <p className="text-xs text-foundation-500 mt-0.5 font-mono">
              SN: {serialNum} · Max: {capacity} · {intervalVal} · Operator: {operator}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-foundation-200 text-xs">
            <Cpu size={14} className="text-brand-600" />
            <span className="font-mono text-foundation-700">RS-232 COM3 Connected</span>
          </div>

          <button
            onClick={onBackToDashboard}
            className="px-4 py-2 border border-foundation-300 text-foundation-700 hover:bg-foundation-100 text-xs font-semibold rounded-lg transition-colors"
          >
            Save & Exit
          </button>
        </div>
      </div>

      {/* Stepper Rail (from 1306.md) */}
      <div className="bg-white border border-foundation-200 rounded-xl p-3 shadow-xs flex items-center justify-between overflow-x-auto text-xs font-medium">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">✓</span>
          <span className="text-foundation-700 font-semibold">1. Visual & Sealing</span>
        </div>
        <span className="text-foundation-300">→</span>
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[11px]">✓</span>
          <span className="text-foundation-700 font-semibold">2. Tare & Zero</span>
        </div>
        <span className="text-foundation-300">→</span>
        <div className="flex items-center gap-2 bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-200">
          <span className="w-5 h-5 rounded-full bg-brand-600 text-white flex items-center justify-center font-bold text-[11px]">3</span>
          <span className="text-brand-800 font-bold">3. Eccentricity (Current)</span>
        </div>
        <span className="text-foundation-300">→</span>
        <div className="flex items-center gap-2 opacity-50">
          <span className="w-5 h-5 rounded-full bg-foundation-200 text-foundation-600 flex items-center justify-center font-bold text-[11px]">4</span>
          <span>4. Weighing Linearity</span>
        </div>
        <span className="text-foundation-300">→</span>
        <div className="flex items-center gap-2 opacity-50">
          <span className="w-5 h-5 rounded-full bg-foundation-200 text-foundation-600 flex items-center justify-center font-bold text-[11px]">5</span>
          <span>5. Repeatability</span>
        </div>
        <span className="text-foundation-300">→</span>
        <div className="flex items-center gap-2 opacity-50">
          <span className="w-5 h-5 rounded-full bg-foundation-200 text-foundation-600 flex items-center justify-center font-bold text-[11px]">6</span>
          <span>6. Review & Sign-Off</span>
        </div>
      </div>

      {/* Main Testing Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Live Scale Telemetry & Dominant Action */}
        <div className="lg:col-span-5 space-y-6">
          {/* Big Live Scale Display */}
          <div className="bg-foundation-900 text-white rounded-2xl p-6 shadow-md border border-foundation-800">
            <div className="flex items-center justify-between text-xs text-foundation-400 pb-3 border-b border-foundation-800">
              <span className="uppercase tracking-wider font-semibold">Live Instrument Indicator</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-emerald-400 font-bold">STABLE [S]</span>
              </div>
            </div>

            <div className="py-6 text-center">
              <div className="text-5xl font-mono font-bold tracking-tight text-emerald-400 tabular-nums">
                {liveReading}
              </div>
              <p className="text-xs text-foundation-400 font-mono mt-2">
                Standard Test Load: 10.000 kg (1/3 Max Capacity)
              </p>
            </div>

            {/* Dominant Action for Weighing: Capture Stable Reading */}
            <button
              onClick={handleCaptureReading}
              className="w-full py-3 bg-brand-600 hover:bg-brand-500 active:bg-brand-700 text-white font-bold rounded-xl text-sm shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>Capture Stable Reading</span>
            </button>
          </div>

          {/* Technical Formula Reveal (Rule 3 — Technical complexity stays underneath) */}
          <div className="bg-white border border-foundation-200 rounded-xl p-4 shadow-xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-foundation-600 mb-2">
              Metrological Formula (OIML R 76-1 Cl 3.5.3)
            </h4>
            <div className="p-3 bg-foundation-50 rounded-lg font-mono text-xs text-foundation-800 space-y-1">
              <div>True Error: <strong className="text-brand-700">E = P - L</strong></div>
              <div>Turning point: <span className="text-foundation-600">P = I + 0.5e - ΔL</span></div>
              <div>Maximum Permissible Error (MPE): <strong className="text-foundation-900">±5.0 g</strong></div>
            </div>
          </div>
        </div>

        {/* Right Column: Eccentricity Platform Inspection Grid */}
        <div className="lg:col-span-7 bg-white border border-foundation-200 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-foundation-100">
            <div>
              <h3 className="text-sm font-bold text-foundation-900 uppercase tracking-wider">
                Eccentricity 5-Position Verification
              </h3>
              <p className="text-xs text-foundation-500 mt-0.5">
                Load 10 kg test weight onto each specified platform zone (OIML 3.6.2)
              </p>
            </div>

            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
              1 Corner Out of Tolerance
            </span>
          </div>

          {/* Table of Readings */}
          <div className="mt-4 overflow-hidden border border-foundation-200 rounded-xl">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-foundation-50 text-foundation-500 font-semibold uppercase tracking-wider border-b border-foundation-200">
                  <th className="py-2.5 px-3">Pos</th>
                  <th className="py-2.5 px-3">Location</th>
                  <th className="py-2.5 px-3">Target</th>
                  <th className="py-2.5 px-3">Captured</th>
                  <th className="py-2.5 px-3">Error (E)</th>
                  <th className="py-2.5 px-3">MPE</th>
                  <th className="py-2.5 px-3 text-right">Verdict</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-foundation-100 font-mono">
                {positions.map((p) => {
                  const isFail = p.status === 'FAIL';
                  const isSelected = selectedPosition === p.pos;

                  return (
                    <tr
                      key={p.pos}
                      onClick={() => setSelectedPosition(p.pos)}
                      className={`cursor-pointer transition-colors ${
                        isSelected
                          ? 'bg-brand-50/60 font-semibold'
                          : 'hover:bg-foundation-50'
                      }`}
                    >
                      <td className="py-2.5 px-3 font-bold text-foundation-900">{p.pos}</td>
                      <td className="py-2.5 px-3 font-sans text-foundation-800">{p.name}</td>
                      <td className="py-2.5 px-3 text-foundation-600">{p.target}</td>
                      <td className="py-2.5 px-3 font-bold text-foundation-900">{p.reading}</td>
                      <td className={`py-2.5 px-3 font-bold ${isFail ? 'text-rose-600' : 'text-foundation-700'}`}>
                        {p.error}
                      </td>
                      <td className="py-2.5 px-3 text-foundation-500">{p.mpe}</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isFail
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Action Note */}
          <div className="mt-5 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
            <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Observation on Corner 4 (Rear-Right):</strong>
              <p className="mt-0.5 leading-relaxed text-amber-800">
                Recorded error -6.2 g exceeds permissible limit of ±5.0 g. You may re-zero and re-take reading, or submit session for supervisory remand note.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
