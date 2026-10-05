import React from 'react';
import { WifiOff, AlertTriangle, Play, HelpCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface GlobalOverlaysProps {
  // Unsaved navigation guard (§32)
  pendingUnsavedTab: string | null;
  onCancelUnsavedNavigation: () => void;
  onConfirmUnsavedNavigation: () => void;

  // Offline banner (§33, §34)
  isOffline?: boolean;

  // Jury floating trigger (§28)
  onOpenJuryAssistant?: () => void;
  showJuryTrigger?: boolean;
}

/**
 * GlobalOverlays (§27, §28, §32, §34, §35)
 * Centralizes modal guards, offline banners, toast regions, and floating presentation cues
 */
export const GlobalOverlays: React.FC<GlobalOverlaysProps> = ({
  pendingUnsavedTab,
  onCancelUnsavedNavigation,
  onConfirmUnsavedNavigation,
  isOffline = false,
  onOpenJuryAssistant,
  showJuryTrigger = true,
}) => {
  return (
    <>
      {/* 1. Calm Offline Banner (§34) */}
      {isOffline && (
        <div className="fixed top-16 left-0 right-0 z-40 bg-slate-800 text-slate-100 px-4 py-2 text-xs flex items-center justify-between border-b border-slate-700 shadow-md">
          <div className="flex items-center gap-2.5 mx-auto max-w-5xl">
            <span className="w-2 h-2 rounded-full border border-slate-400 bg-transparent" />
            <span className="font-mono font-bold tracking-wider uppercase text-[10px] bg-slate-700 px-1.5 py-0.5 rounded">
              OFFLINE
            </span>
            <span className="text-slate-200">
              Changes are being stored locally and will sync when the connection is restored.
            </span>
          </div>
        </div>
      )}

      {/* 2. Unsaved Changes Navigation Guard Modal (§32) */}
      <Modal
        isOpen={!!pendingUnsavedTab}
        onClose={onCancelUnsavedNavigation}
        title="UNSAVED OBSERVATIONS"
        maxWidth="md"
        footer={
          <div className="flex items-center justify-end gap-2">
            <Button variant="secondary" onClick={onCancelUnsavedNavigation}>
              Stay on Page
            </Button>
            <Button variant="danger" onClick={onConfirmUnsavedNavigation}>
              Discard & Leave
            </Button>
          </div>
        }
      >
        <div className="space-y-3 py-2 text-slate-700 dark:text-slate-300 text-xs leading-relaxed">
          <div className="flex items-start gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-sm">
                You have unsaved observation data in this test workspace.
              </p>
              <p className="mt-1 text-slate-600 dark:text-slate-400">
                Leaving now will discard uncommitted turning-point readings and instrument tare observations. Are you sure you want to proceed?
              </p>
            </div>
          </div>
        </div>
      </Modal>

      {/* 3. Subtle Floating Jury Assistant Trigger (§28) */}
      {showJuryTrigger && onOpenJuryAssistant && (
        <button
          type="button"
          onClick={onOpenJuryAssistant}
          className="fixed bottom-10 right-6 z-40 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-900 text-amber-300 hover:text-amber-200 border border-amber-400/40 shadow-xl backdrop-blur-xs transition-all hover:scale-105 cursor-pointer font-mono text-xs"
          title="Open Presentation Control Center (Jury Demo Assistant)"
        >
          <Play className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span className="font-bold font-sans">Jury Guide</span>
          <span className="text-[10px] text-amber-400/80">?</span>
        </button>
      )}
    </>
  );
};
