import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertTriangle, X } from 'lucide-react';
import { getCurrentWindow } from '@tauri-apps/api/window';

export default function DesktopNotification() {
  const [visible, setVisible] = useState(true);
  const urlParams = new URLSearchParams(window.location.search);
  const title = urlParams.get('title') || 'Notification';
  const body = urlParams.get('body') || '';

  useEffect(() => {
    // Synthesize a pleasant "pop" sound using Web Audio API
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      
      oscillator.type = 'sine';
      oscillator.frequency.setValueAtTime(800, audioCtx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioCtx.currentTime + 0.1);
      
      gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.5, audioCtx.currentTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
      
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.start(audioCtx.currentTime);
      oscillator.stop(audioCtx.currentTime + 0.5);

      // Auto-close Window after 5 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 5000);

      return () => {
        clearTimeout(timer);
        if (audioCtx.state !== 'closed') {
          audioCtx.close();
        }
      };
    } catch(e) {
      console.error("Audio synthesis failed", e);
    }
  }, []);

  const handleClose = async () => {
    setVisible(false);
    setTimeout(async () => {
      try {
        await getCurrentWindow().close();
      } catch(e) {
        console.error(e);
        window.close();
      }
    }, 500); // Wait for exit animation
  };

  return (
    <div className="w-screen h-screen bg-transparent p-4 flex items-end justify-end pointer-events-none overflow-hidden text-zinc-100 font-sans">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 50, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="pointer-events-auto flex items-center gap-4 px-6 py-5 rounded-2xl border backdrop-blur-2xl shadow-2xl w-full bg-amber-950/80 border-amber-500/50 shadow-black/50"
          >
            <AlertTriangle className="w-10 h-10 text-amber-500 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-lg font-black text-white truncate drop-shadow-md">{title}</p>
              <p className="text-sm font-medium text-zinc-100 line-clamp-2 leading-snug mt-1">{body}</p>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors text-white hover:text-amber-200 self-start shrink-0 bg-white/5 border border-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
