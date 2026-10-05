import React, { useState } from 'react';
import { X, Flag, Check } from 'lucide-react';

export interface EnvironmentalAuditComment {
  id: string;
  subTest: 'tare' | 'temperature' | 'chamber';
  tag: string;
  comment: string;
  author: string;
  timestamp: string;
}

interface EnvironmentalAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  subTest: 'tare' | 'temperature' | 'chamber';
  currentComment?: EnvironmentalAuditComment | null;
  onSaveComment: (comment: EnvironmentalAuditComment) => void;
  userRole: string;
}

export const EnvironmentalAuditModal: React.FC<EnvironmentalAuditModalProps> = ({
  isOpen,
  onClose,
  subTest,
  currentComment,
  onSaveComment,
  userRole,
}) => {
  if (!isOpen) return null;

  const [selectedTag, setSelectedTag] = useState<string>(
    currentComment?.tag || 'Thermal Drift Warning'
  );
  const [text, setText] = useState<string>(currentComment?.comment || '');

  const presetTags = [
    { label: 'Thermal Drift Warning', defaultText: 'Observed span error shows elevated thermal sensitivity near temperature boundary.' },
    { label: 'Soak Duration Incomplete', defaultText: 'Instrument thermal stabilization was recorded prior to the statutory 20-minute minimum soak window.' },
    { label: 'Tare Register Creep', defaultText: 'Subtractive tare indication shifted outside ±0.25e after repeated load cycles.' },
    { label: 'Environmental Anomaly', defaultText: 'Laboratory barometric pressure or humidity deviated from acceptable test parameters.' },
    { label: 'Other', defaultText: '' },
  ];

  const handleSelectPreset = (tag: string, defaultComment: string) => {
    setSelectedTag(tag);
    if (!text.trim() || presetTags.some((p) => p.defaultText === text)) {
      setText(defaultComment);
    }
  };

  const handleSave = () => {
    if (!text.trim()) return;
    onSaveComment({
      id: currentComment?.id || `env-audit-${Date.now()}`,
      subTest,
      tag: selectedTag,
      comment: text.trim(),
      author: userRole,
      timestamp: 'Just now',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-foundation-950/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-xl border border-foundation-200 shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95">
        {/* Header */}
        <div className="p-4 border-b border-foundation-100 flex items-center justify-between bg-foundation-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Flag size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
                ENVIRONMENTAL AUDIT COMMENT
              </h3>
              <p className="text-[11px] font-mono text-foundation-500 uppercase">
                Section: {subTest} testing
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-foundation-400 hover:text-foundation-700 p-1 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-4 space-y-4 text-xs font-mono">
          {/* Preset Buttons */}
          <div>
            <label className="block text-[10px] font-bold text-foundation-500 uppercase mb-2">
              Select Audit Tag Preset
            </label>
            <div className="flex flex-wrap gap-1.5">
              {presetTags.map((p) => (
                <button
                  key={p.label}
                  type="button"
                  onClick={() => handleSelectPreset(p.label, p.defaultText)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold border transition-all cursor-pointer ${
                    selectedTag === p.label
                      ? 'bg-amber-100 border-amber-300 text-amber-950 ring-1 ring-amber-400'
                      : 'bg-foundation-50 border-foundation-200 text-foundation-700 hover:bg-foundation-100'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Comment Textarea */}
          <div>
            <label className="block text-[10px] font-bold text-foundation-500 uppercase mb-1">
              Supervisory Auditor Note
            </label>
            <textarea
              rows={4}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter technical justification or environmental observation note..."
              className="w-full p-2.5 rounded-lg border border-foundation-300 text-xs font-mono text-foundation-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-foundation-500 pt-1">
            <span>Author Persona: <strong className="text-foundation-800">{userRole}</strong></span>
            <span>Appended to Statutory Dossier</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 bg-foundation-50 border-t border-foundation-100 flex items-center justify-end gap-2 font-mono text-xs">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg border border-foundation-200 text-foundation-700 hover:bg-foundation-100 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!text.trim()}
            onClick={handleSave}
            className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 disabled:bg-foundation-300 text-white font-bold cursor-pointer flex items-center gap-1.5"
          >
            <Check size={13} />
            <span>Save Audit Note</span>
          </button>
        </div>
      </div>
    </div>
  );
};
