import React, { useState } from 'react';
import { X, Flag, Check } from 'lucide-react';
import { EccentricityPosition } from './PlatterVisualizer';

export interface EccentricityAuditComment {
  id: string;
  positionId: string;
  tag: string;
  comment: string;
  author: string;
  timestamp: string;
}

interface EccentricityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
  position: EccentricityPosition | null;
  currentComment?: EccentricityAuditComment | null;
  onSaveComment: (comment: EccentricityAuditComment) => void;
  userRole: string;
}

export const EccentricityAuditModal: React.FC<EccentricityAuditModalProps> = ({
  isOpen,
  onClose,
  position,
  currentComment,
  onSaveComment,
  userRole,
}) => {
  if (!isOpen || !position) return null;

  const [selectedTag, setSelectedTag] = useState<string>(
    currentComment?.tag || 'Mechanical Sag'
  );
  const [text, setText] = useState<string>(currentComment?.comment || '');

  // Presets specified in §27: [ Mechanical Sag ] [ Load Placement Concern ] [ Re-test Required ] [ Other ]
  const presetTags = [
    { label: 'Mechanical Sag', defaultText: 'Corner exhibits mechanical flexure or load cell cantilever tilt under 1/3 Max load.' },
    { label: 'Load Placement Concern', defaultText: 'Standard test weight placed close to platter outer rim. Re-centering advised.' },
    { label: 'Re-test Required', defaultText: 'Reading variance observed across consecutive placements. Re-test recommended.' },
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
      id: currentComment?.id || `audit-${Date.now()}`,
      positionId: position.id,
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
        {/* Header per §27 */}
        <div className="p-4 border-b border-foundation-100 flex items-center justify-between bg-foundation-50/80">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
              <Flag size={14} />
            </div>
            <div>
              <h3 className="text-sm font-bold text-foundation-900 tracking-tight font-sans">
                ECCENTRICITY AUDIT COMMENT
              </h3>
              <p className="text-[11px] font-mono text-foundation-500">
                {position.name} ({position.targetLoad.toFixed(3)} kg)
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

        {/* Position Details Strip per §27 */}
        <div className="p-4 bg-foundation-50/50 border-b border-foundation-100 grid grid-cols-3 gap-2 text-xs font-mono">
          <div>
            <span className="text-foundation-400 block text-[10px]">Position</span>
            <span className="font-bold text-foundation-900">{position.name}</span>
          </div>
          <div>
            <span className="text-foundation-400 block text-[10px]">Observed reading</span>
            <span className="font-bold text-foundation-900">
              {position.observedReading !== undefined ? `${position.observedReading.toFixed(3)} kg` : '—'}
            </span>
          </div>
          <div>
            <span className="text-foundation-400 block text-[10px]">Result</span>
            <span
              className={`font-bold ${
                position.status === 'PASS'
                  ? 'text-emerald-700'
                  : position.status === 'MARGINAL'
                  ? 'text-amber-700'
                  : 'text-rose-700'
              }`}
            >
              {position.status}
            </span>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-bold text-foundation-700 uppercase font-mono mb-2">
              Preset Category
            </label>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              {presetTags.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => handleSelectPreset(preset.label, preset.defaultText)}
                  className={`p-2 rounded-lg border text-xs font-semibold transition-colors cursor-pointer text-left ${
                    selectedTag === preset.label
                      ? 'bg-amber-100 border-amber-300 text-amber-950 font-bold'
                      : 'bg-foundation-50 border-foundation-200 text-foundation-700 hover:bg-foundation-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-foundation-700 uppercase font-mono mb-1.5">
              Comment
            </label>
            <textarea
              rows={3}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter audit remark regarding position response..."
              className="w-full text-xs font-mono p-3 rounded-lg border border-foundation-300 bg-white text-foundation-950 focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-foundation-50 border-t border-foundation-100 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 rounded-lg border border-foundation-200 text-foundation-600 hover:bg-foundation-100 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!text.trim()}
            onClick={handleSave}
            className={`px-4 py-2 rounded-lg text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm cursor-pointer ${
              text.trim()
                ? 'bg-brand-600 hover:bg-brand-700'
                : 'bg-foundation-300 cursor-not-allowed'
            }`}
          >
            <Check size={14} />
            <span>Add Comment</span>
          </button>
        </div>
      </div>
    </div>
  );
};
