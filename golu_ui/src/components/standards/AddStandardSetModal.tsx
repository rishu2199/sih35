import React, { useState } from 'react';
import { X, PlusCircle, Scale, ShieldCheck, Calendar, FileText, Upload } from 'lucide-react';
import { StandardWeightSet, WeightAccuracyClass } from './types';

interface AddStandardSetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddStandard: (newStandard: StandardWeightSet) => void;
}

export const AddStandardSetModal: React.FC<AddStandardSetModalProps> = ({
  isOpen,
  onClose,
  onAddStandard,
}) => {
  const [accuracyClass, setAccuracyClass] = useState<WeightAccuracyClass>('E2');
  const [id, setId] = useState<string>('E2-015');
  const [setName, setSetName] = useState<string>('Class E2 Standard Weight Set');
  const [massRange, setMassRange] = useState<string>('1 mg – 20 kg');
  const [certificateNumber, setCertificateNumber] = useState<string>('NABL-2026-02100');
  const [calibrationDate, setCalibrationDate] = useState<string>('04 Oct 2026');
  const [validUntilDate, setValidUntilDate] = useState<string>('04 Oct 2027');
  const [laboratory, setLaboratory] = useState<string>('Regional Reference Standards Laboratory (RRSL)');
  const [uncertainty, setUncertainty] = useState<string>('U = 0.03 mg (k = 2)');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newStandard: StandardWeightSet = {
      id: id.trim() || 'E2-015',
      accuracyClass,
      setName: setName.trim() || `Class ${accuracyClass} Standard Weight Set`,
      massRange: massRange.trim() || '1 mg – 20 kg',
      piecesCount: 24,
      piecesList: ['1 mg', '2 mg', '5 mg', '10 mg', '20 mg', '50 mg', '100 mg', '200 mg', '500 mg', '1 g', '2 g', '5 g', '10 g', '20 g', '50 g', '100 g', '200 g', '500 g', '1 kg', '2 kg', '5 kg', '10 kg', '20 kg'],
      certificateNumber: certificateNumber.trim() || 'NABL-2026-CERT',
      calibrationDate,
      validUntilDate,
      daysRemaining: 365,
      status: 'VALID',
      laboratory: laboratory.trim() || 'Regional Reference Standards Laboratory',
      accreditationBody: 'NABL ISO/IEC 17025',
      expandedUncertainty: uncertainty.trim() || 'U = 0.03 mg (k = 2)',
      isCurrentlyAssigned: false,
      assignedSessionsCount: 0,
      assignedSessionsList: [],
      usageHistory: [
        {
          date: '04 Oct',
          sessionId: 'SYSTEM-INIT',
          operator: 'Admin',
          result: 'PASS',
        },
      ],
    };

    onAddStandard(newStandard);
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-standard-title"
      className="fixed inset-0 z-50 bg-foundation-950/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 select-none animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-foundation-200 shadow-2xl overflow-hidden font-mono">
        {/* Header (§20) */}
        <div className="bg-foundation-900 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-foundation-800 flex items-center justify-center">
              <PlusCircle size={18} className="text-brand-400" />
            </div>
            <div>
              <h2 id="add-standard-title" className="text-base font-bold font-sans">
                Add Standard Weight Set
              </h2>
              <p className="text-[11px] text-foundation-300">
                Register a newly calibrated laboratory reference standard
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-foundation-800 text-foundation-400 hover:text-white transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-foundation-600 font-bold uppercase tracking-wider mb-1 font-sans">
                Standard Class
              </label>
              <select
                value={accuracyClass}
                onChange={(e) => setAccuracyClass(e.target.value as WeightAccuracyClass)}
                className="w-full bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              >
                <option value="E1">Class E1 (Primary)</option>
                <option value="E2">Class E2 (Secondary)</option>
                <option value="F1">Class F1 (Precision)</option>
                <option value="M1">Class M1 (Working / Heavy)</option>
              </select>
            </div>

            <div>
              <label className="block text-foundation-600 font-bold uppercase tracking-wider mb-1 font-sans">
                Set Identifier
              </label>
              <input
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. E2-015"
                required
                className="w-full bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-foundation-600 font-bold uppercase tracking-wider mb-1 font-sans">
              Set Description / Name
            </label>
            <input
              type="text"
              value={setName}
              onChange={(e) => setSetName(e.target.value)}
              placeholder="e.g. Class E2 Standard Weight Set"
              className="w-full bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-foundation-600 font-bold uppercase tracking-wider mb-1 font-sans">
                Nominal Mass Range
              </label>
              <input
                type="text"
                value={massRange}
                onChange={(e) => setMassRange(e.target.value)}
                placeholder="e.g. 1 mg – 20 kg"
                className="w-full bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-foundation-600 font-bold uppercase tracking-wider mb-1 font-sans">
                Calibration Certificate #
              </label>
              <input
                type="text"
                value={certificateNumber}
                onChange={(e) => setCertificateNumber(e.target.value)}
                placeholder="e.g. NABL-2026-02100"
                required
                className="w-full bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 font-bold focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-foundation-600 font-bold uppercase tracking-wider mb-1 font-sans">
                Calibration Date
              </label>
              <input
                type="text"
                value={calibrationDate}
                onChange={(e) => setCalibrationDate(e.target.value)}
                placeholder="04 Oct 2026"
                required
                className="w-full bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-foundation-600 font-bold uppercase tracking-wider mb-1 font-sans">
                Valid Until
              </label>
              <input
                type="text"
                value={validUntilDate}
                onChange={(e) => setValidUntilDate(e.target.value)}
                placeholder="04 Oct 2027"
                required
                className="w-full bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 font-bold text-emerald-700 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-foundation-600 font-bold uppercase tracking-wider mb-1 font-sans">
              Issuing Laboratory
            </label>
            <input
              type="text"
              value={laboratory}
              onChange={(e) => setLaboratory(e.target.value)}
              placeholder="Regional Reference Standards Laboratory"
              className="w-full bg-foundation-50 border border-foundation-200 rounded-lg px-3 py-2 text-foundation-900 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          {/* Certificate PDF Upload placeholder */}
          <div className="p-3 bg-foundation-50 rounded-lg border border-dashed border-foundation-300 flex items-center justify-between">
            <div className="flex items-center gap-2 text-foundation-600">
              <Upload size={16} />
              <span>Attach Calibration Certificate (PDF)</span>
            </div>
            <span className="text-[11px] bg-white border border-foundation-200 px-2 py-0.5 rounded font-bold text-foundation-700">
              Simulated PDF Attached
            </span>
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-foundation-200 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-foundation-200 text-foundation-700 hover:bg-foundation-50 font-bold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white font-bold transition-colors shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <PlusCircle size={14} />
              <span>Add Standard Set</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
