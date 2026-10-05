import React, { useState } from 'react';
import {
  Camera,
  Video,
  Upload,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  Maximize2,
  Sparkles,
  Check,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';

interface CameraInspectionCardProps {
  onCaptureEvidence: (category: string, filename: string) => void;
  evidenceCount: number;
  isReadOnly?: boolean;
}

export const CameraInspectionCard: React.FC<CameraInspectionCardProps> = ({
  onCaptureEvidence,
  evidenceCount,
  isReadOnly = false,
}) => {
  // Camera state (§5 & §6): 'IDLE' | 'LIVE' | 'CAPTURED'
  const [cameraState, setCameraState] = useState<'IDLE' | 'LIVE' | 'CAPTURED'>('CAPTURED');
  const [evidenceType, setEvidenceType] = useState<string>('Overall Condition');
  const [exposureLevel, setExposureLevel] = useState<number>(0);
  const [focusMode, setFocusMode] = useState<'AUTO' | 'MANUAL'>('AUTO');
  const [capturedAt, setCapturedAt] = useState<string>('04 Oct 2026 · 15:08 IST');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const samplePhotoUrl =
    'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=1000&auto=format&fit=crop&q=80';

  const handleCapture = () => {
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' IST';
    setCapturedAt(`04 Oct 2026 · ${timeStr}`);
    setCameraState('CAPTURED');
    onCaptureEvidence(evidenceType, `inspection_${Date.now()}.jpg`);
    setToastMessage('Evidence frame captured & SHA-256 hashed');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between space-y-4">
      {/* Card Header & Evidence Type Selector (§8) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <Camera className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white">
              CAMERA / PHOTO INSPECTOR (§5–8)
            </h3>
            <span className="text-[11px] text-slate-500 font-mono">
              Digital Evidence Capture Station
            </span>
          </div>
        </div>

        {/* Evidence Category Selector (§8) */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
            Evidence Type:
          </span>
          <select
            value={evidenceType}
            onChange={(e) => setEvidenceType(e.target.value)}
            disabled={isReadOnly}
            className="p-1.5 px-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs text-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <option value="Overall Condition">Overall Condition</option>
            <option value="Level">Level (Spirit Bubble)</option>
            <option value="Security Seal">Security Seal</option>
            <option value="Identification Plate">Identification Plate</option>
            <option value="Other Finding">Other Finding</option>
          </select>
        </div>
      </div>

      {/* Main Viewport */}
      {cameraState === 'IDLE' ? (
        /* State 1: No image loaded (§5) */
        <div className="aspect-video w-full rounded-2xl bg-slate-100 dark:bg-slate-800/60 border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center p-6 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500">
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">
              No inspection image loaded
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mt-0.5">
              Connect the live laboratory inspection camera or upload physical audit photographs.
            </p>
          </div>
          {!isReadOnly && (
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCameraState('LIVE')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Video className="w-4 h-4" />
                <span>Open Camera</span>
              </button>
              <button
                type="button"
                onClick={() => setCameraState('CAPTURED')}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold hover:bg-slate-50 transition-all cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Photo</span>
              </button>
            </div>
          )}
        </div>
      ) : cameraState === 'LIVE' ? (
        /* State 2: Camera active feed (§6) */
        <div className="aspect-video w-full rounded-2xl bg-slate-950 relative overflow-hidden flex flex-col justify-between p-4 shadow-inner">
          <img
            src={samplePhotoUrl}
            alt="Live inspection feed"
            className="absolute inset-0 w-full h-full object-cover opacity-90 filter contrast-105"
            style={{ filter: `brightness(${1 + exposureLevel * 0.1})` }}
          />

          {/* Top Live Bar */}
          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-red-600/90 text-white backdrop-blur-xs shadow-sm">
              <span className="w-2 h-2 rounded-full bg-white animate-ping" />
              LIVE INSPECTION FEED
            </span>
            <span className="font-mono text-[11px] text-white/90 bg-black/50 px-2 py-0.5 rounded backdrop-blur-xs">
              1080p · 60fps · Calibrated Lens
            </span>
          </div>

          {/* Central Target Grid Crosshairs */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
            <div className="w-24 h-24 border border-white/40 rounded-xl border-dashed" />
            <div className="absolute w-2 h-2 bg-blue-400 rounded-full" />
          </div>

          {/* Bottom Live Controls Bar (§6) */}
          <div className="relative z-10 bg-slate-900/80 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex flex-wrap items-center justify-between gap-3 text-white text-xs">
            <div className="flex items-center gap-4 font-mono text-[11px]">
              <div className="flex items-center gap-2">
                <span>Exposure:</span>
                <input
                  type="range"
                  min="-2"
                  max="2"
                  value={exposureLevel}
                  onChange={(e) => setExposureLevel(parseInt(e.target.value))}
                  className="w-16 accent-blue-500 cursor-pointer"
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span>Focus:</span>
                <button
                  type="button"
                  onClick={() => setFocusMode(focusMode === 'AUTO' ? 'MANUAL' : 'AUTO')}
                  className="px-2 py-0.5 rounded bg-white/20 font-bold"
                >
                  {focusMode}
                </button>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCapture}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              <Camera className="w-4 h-4" />
              <span>Capture Evidence</span>
            </button>
          </div>
        </div>
      ) : (
        /* State 3: Evidence captured (§7) */
        <div className="aspect-video w-full rounded-2xl bg-slate-950 relative overflow-hidden flex flex-col justify-between p-4 shadow-inner group">
          <img
            src={samplePhotoUrl}
            alt="Captured inspection photo"
            className="absolute inset-0 w-full h-full object-cover"
          />

          <div className="relative z-10 flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-600/90 text-white backdrop-blur-xs">
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              EVIDENCE CAPTURED
            </span>
            <span className="font-mono text-[11px] text-white/90 bg-black/60 px-2.5 py-1 rounded-lg backdrop-blur-xs">
              {capturedAt}
            </span>
          </div>

          <div className="relative z-10 bg-slate-900/85 backdrop-blur-md p-3 rounded-2xl border border-white/10 flex items-center justify-between text-white text-xs">
            <div className="space-y-0.5">
              <div className="font-bold text-white flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{evidenceType} Record</span>
              </div>
              <div className="font-mono text-[10px] text-slate-400">
                SHA-256: 9a8b7c6d5e4f...3120 · Tamper-evident
              </div>
            </div>

            {!isReadOnly && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setCameraState('LIVE')}
                  className="px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold transition-colors cursor-pointer"
                >
                  Retake
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setToastMessage('Photo marked as primary audit evidence');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Mark as Evidence ✓
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <div className="p-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs font-mono font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-blue-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
