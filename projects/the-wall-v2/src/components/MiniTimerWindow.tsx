import { useEffect, useState, useCallback } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { emit, listen } from '@tauri-apps/api/event';
import { Play, Pause, X, Maximize2, Move } from 'lucide-react';

// Payload shape synced from the main window
export type TimerState = {
  timeLeft: number;
  totalDuration: number;
  isActive: boolean;
  displayType: 'work' | 'break';
};

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function MiniTimerWindow() {
  const [state, setState] = useState<TimerState>({
    timeLeft: 25 * 60,
    totalDuration: 25 * 60,
    isActive: false,
    displayType: 'work',
  });

  useEffect(() => {
    // Ask the main window to push its current state
    emit('mini-timer-ready', {});

    const unlistenState = listen<TimerState>('timer-state-update', (e) => {
      setState(e.payload);
    });

    return () => {
      unlistenState.then((fn) => fn());
    };
  }, []);

  // Close this window directly — don't rely on the (possibly suspended) main window
  const handleClose = useCallback(async () => {
    try {
      await getCurrentWindow().close();
    } catch (e) {
      console.error('Failed to close mini window', e);
    }
  }, []);

  // Show main window directly by label, then close this window
  const handleMaximize = useCallback(async () => {
    try {
      const { WebviewWindow } = await import('@tauri-apps/api/webviewWindow');
      // getByLabel returns WebviewWindow | null (synchronous)
      const mainWin = await WebviewWindow.getByLabel('main');
      if (mainWin) {
        await (mainWin as { show(): Promise<void>; setFocus(): Promise<void> }).show();
        await (mainWin as { show(): Promise<void>; setFocus(): Promise<void> }).setFocus();
      }
    } catch (e) {
      // Fallback: tell main via event
      emit('mini-timer-control', { action: 'maximize' });
    } finally {
      try { await getCurrentWindow().close(); } catch {}
    }
  }, []);

  // Toggle still routes through main window (it owns the timer state)
  const handleToggle = useCallback(() => {
    emit('mini-timer-control', { action: 'toggle' });
  }, []);

  const denom = state.totalDuration || 1;
  const progress = ((denom - state.timeLeft) / denom) * 100;
  const isWork = state.displayType === 'work';

  return (
    // Use fixed viewport units so the widget fills the 280×160 OS window
    // regardless of whether html/body have explicit heights set.
    <div
      className="text-white flex flex-col items-center justify-center relative overflow-hidden rounded-2xl border border-zinc-800/50 shadow-2xl cursor-move select-none"
      style={{
        width: '100vw',
        height: '100vh',
        background: 'rgba(9, 9, 11, 0.85)',
        backdropFilter: 'blur(24px)',
      }}
      onMouseDown={(e) => {
        if ((e.target as HTMLElement).closest('button')) return;
        getCurrentWindow().startDragging();
      }}
    >
      {/* Progress fill */}
      <div
        className="absolute bottom-0 left-0 right-0 transition-all duration-1000 ease-linear z-0 pointer-events-none"
        style={{
          height: `${progress}%`,
          backgroundColor: isWork ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
        }}
      />

      {/* Header controls */}
      <div className="absolute top-2 right-2 flex items-center gap-1.5 z-20">
        <button
          onClick={handleMaximize}
          className="p-1 bg-zinc-900/40 hover:bg-zinc-700/60 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
          title="Restore full app"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={handleClose}
          className="p-1 bg-zinc-900/40 hover:bg-rose-500/30 rounded-lg text-zinc-400 hover:text-rose-400 transition-colors cursor-pointer"
          title="Hide to tray"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Drag hint */}
      <div className="absolute top-3 left-3 z-20 text-zinc-700 pointer-events-none">
        <Move className="w-3.5 h-3.5" />
      </div>

      {/* Timer display */}
      <div className="relative z-10 flex flex-col items-center gap-0 pointer-events-none mt-2">
        <div className={`text-[10px] font-bold uppercase tracking-[0.2em] mb-1 ${isWork ? 'text-emerald-500/80' : 'text-amber-500/80'}`}>
          {isWork ? 'Focus' : 'Break'}
        </div>
        <div className={`text-4xl font-black tabular-nums tracking-tighter ${isWork ? 'text-white' : 'text-amber-400'}`}>
          {formatTime(state.timeLeft)}
        </div>
      </div>

      {/* Play/pause */}
      <div className="absolute bottom-3 right-3 z-20">
        <button
          onClick={handleToggle}
          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all shadow-xl active:scale-95 ${
            state.isActive
              ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-rose-500/20'
              : 'bg-emerald-500 hover:bg-emerald-400 text-zinc-950 shadow-emerald-500/20'
          }`}
        >
          {state.isActive
            ? <Pause className="w-4 h-4" />
            : <Play className="w-4 h-4 ml-0.5" />}
        </button>
      </div>
    </div>
  );
}
