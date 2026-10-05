import React, { useState } from 'react';
import { X, Scale, ArrowRight, Check, Sparkles } from 'lucide-react';
import { INSTRUMENT_PRESETS } from '../../mockData';
import { InstrumentPreset, AccuracyClass, TestSession } from '../../types';

interface NewSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateSession: (session: Partial<TestSession>) => void;
}

export const NewSessionModal: React.FC<NewSessionModalProps> = ({
  isOpen,
  onClose,
  onCreateSession,
}) => {
  const [activeTab, setActiveTab] = useState<'preset' | 'manual'>('preset');
  const [selectedPreset, setSelectedPreset] = useState<InstrumentPreset>(INSTRUMENT_PRESETS[0]);

  // Manual form fields
  const [manufacturer, setManufacturer] = useState('Avery Weigh-Tronix');
  const [model, setModel] = useState('ZM201');
  const [serialNumber, setSerialNumber] = useState('AV-2026-' + Math.floor(1000 + Math.random() * 9000));
  const [accuracyClass, setAccuracyClass] = useState<AccuracyClass>('CLASS_III');
  const [maxCapacity, setMaxCapacity] = useState('30 kg');
  const [verificationInterval, setVerificationInterval] = useState('e = 10 g');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (activeTab === 'preset') {
      onCreateSession({
        instrumentModel: selectedPreset.model,
        manufacturer: selectedPreset.manufacturer,
        serialNumber: 'SN-' + Math.floor(100000 + Math.random() * 900000),
        accuracyClass: selectedPreset.accuracyClass,
        maxCapacity: selectedPreset.maxCapacity,
        verificationInterval: selectedPreset.verificationInterval,
        currentStage: 'Visual Inspection',
        completedSteps: 0,
        totalSteps: selectedPreset.applicableTestsCount,
        progressPercent: 0,
        status: 'IN_TESTING',
        statusLabel: 'Testing',
        operatorName: 'R. K. Ramanathan',
        lastUpdated: 'Just now',
        steps: {
          visual: 'IN_PROGRESS',
          tare: 'PENDING',
          eccentricity: 'PENDING',
          weighing: 'PENDING',
          repeatability: 'PENDING',
          environment: 'PENDING',
          review: 'PENDING',
        },
      });
    } else {
      onCreateSession({
        instrumentModel: model,
        manufacturer,
        serialNumber,
        accuracyClass,
        maxCapacity,
        verificationInterval,
        currentStage: 'Visual Inspection',
        completedSteps: 0,
        totalSteps: 6,
        progressPercent: 0,
        status: 'IN_TESTING',
        statusLabel: 'Testing',
        operatorName: 'R. K. Ramanathan',
        lastUpdated: 'Just now',
        steps: {
          visual: 'IN_PROGRESS',
          tare: 'PENDING',
          eccentricity: 'PENDING',
          weighing: 'PENDING',
          repeatability: 'PENDING',
          environment: 'PENDING',
          review: 'PENDING',
        },
      });
    }

    onClose();
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foundation-900/60 backdrop-blur-xs"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-foundation-200 shadow-2xl max-w-xl w-full overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-foundation-200 flex items-center justify-between bg-foundation-50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-brand-600 text-white">
              <Scale size={18} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foundation-900">
                New Test Session
              </h3>
              <p className="text-xs text-foundation-500">
                Register non-automatic weighing instrument for OIML R 76-1 verification
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-foundation-400 hover:text-foundation-700 hover:bg-foundation-200 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Buttons */}
        <div className="px-6 pt-4 flex gap-4 border-b border-foundation-100">
          <button
            type="button"
            onClick={() => setActiveTab('preset')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'preset'
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-foundation-500 hover:text-foundation-800'
            }`}
          >
            Laboratory Presets (Fast)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('manual')}
            className={`pb-3 text-xs font-semibold uppercase tracking-wider transition-colors relative ${
              activeTab === 'manual'
                ? 'text-brand-600 border-b-2 border-brand-600'
                : 'text-foundation-500 hover:text-foundation-800'
            }`}
          >
            Manual Registration
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'preset' ? (
            <div className="space-y-3">
              <label className="text-xs font-medium text-foundation-600 block">
                Select predefined certified instrument specification:
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {INSTRUMENT_PRESETS.map((preset) => {
                  const isSelected = selectedPreset.id === preset.id;
                  return (
                    <div
                      key={preset.id}
                      onClick={() => setSelectedPreset(preset)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'border-brand-500 bg-brand-50/40 shadow-xs'
                          : 'border-foundation-200 hover:border-foundation-300 hover:bg-foundation-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-foundation-900">
                          {preset.name}
                        </span>
                        {isSelected && <Check size={14} className="text-brand-600" />}
                      </div>

                      <div className="text-xs text-foundation-700 mt-0.5 truncate">
                        {preset.model}
                      </div>

                      <div className="text-[11px] font-mono text-foundation-500 mt-1">
                        Cap: {preset.maxCapacity} · {preset.verificationInterval}
                      </div>

                      <div className="mt-2 text-[10px] text-foundation-400">
                        {preset.applicableTestsCount} standard tests
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="p-3 rounded-lg bg-foundation-50 border border-foundation-200 text-xs text-foundation-600 leading-relaxed">
                <strong>{selectedPreset.name}</strong> will initiate an official test record with pre-configured OIML tolerance bands.
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-medium text-foundation-700 block mb-1">
                  Manufacturer
                </label>
                <input
                  type="text"
                  value={manufacturer}
                  onChange={(e) => setManufacturer(e.target.value)}
                  className="w-full px-3 py-2 border border-foundation-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foundation-700 block mb-1">
                  Model Designation
                </label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 border border-foundation-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foundation-700 block mb-1">
                  Serial Number
                </label>
                <input
                  type="text"
                  value={serialNumber}
                  onChange={(e) => setSerialNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-foundation-300 rounded-lg text-xs font-mono focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foundation-700 block mb-1">
                  Accuracy Class
                </label>
                <select
                  value={accuracyClass}
                  onChange={(e) => setAccuracyClass(e.target.value as AccuracyClass)}
                  className="w-full px-3 py-2 border border-foundation-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                >
                  <option value="CLASS_I">Class I (Special Accuracy)</option>
                  <option value="CLASS_II">Class II (High Accuracy)</option>
                  <option value="CLASS_III">Class III (Medium Accuracy)</option>
                  <option value="CLASS_IIII">Class IIII (Ordinary Accuracy)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-medium text-foundation-700 block mb-1">
                  Maximum Capacity (Max)
                </label>
                <input
                  type="text"
                  value={maxCapacity}
                  onChange={(e) => setMaxCapacity(e.target.value)}
                  className="w-full px-3 py-2 border border-foundation-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-medium text-foundation-700 block mb-1">
                  Verification Interval (e)
                </label>
                <input
                  type="text"
                  value={verificationInterval}
                  onChange={(e) => setVerificationInterval(e.target.value)}
                  className="w-full px-3 py-2 border border-foundation-300 rounded-lg text-xs focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none"
                  required
                />
              </div>
            </div>
          )}

          {/* Footer Action: Rule 2 — One dominant action per screen: Register Instrument & Continue */}
          <div className="pt-4 border-t border-foundation-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-foundation-300 text-foundation-700 hover:bg-foundation-100 text-xs font-medium rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-lg shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>Register Instrument & Continue</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
