import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Info, CheckCircle, AlertTriangle, AlertCircle } from 'lucide-react';
import { Notification, NotificationType } from '../types';

interface NotificationToastProps {
  notifications: Notification[];
  onRemove: (id: string) => void;
}

const icons: Record<NotificationType, React.ReactNode> = {
  info: <Info className="w-5 h-5 text-blue-400" />,
  success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
  warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
  error: <AlertCircle className="w-5 h-5 text-rose-400" />,
};

const bgColors: Record<NotificationType, string> = {
  info: 'bg-blue-500/10 border-blue-500/20',
  success: 'bg-emerald-500/10 border-emerald-500/20',
  warning: 'bg-amber-500/10 border-amber-500/20',
  error: 'bg-rose-500/10 border-rose-500/20',
};

export function NotificationToast({ notifications, onRemove }: NotificationToastProps) {
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {notifications.map((n) => (
          <motion.div
            key={n.id}
            initial={{ opacity: 0, x: 50, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.95 }}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-lg min-w-[300px] ${bgColors[n.type]}`}
          >
            {icons[n.type]}
            <p className="text-sm font-medium text-zinc-200 flex-1">{n.message}</p>
            <button
              onClick={() => onRemove(n.id)}
              className="p-1 rounded-lg hover:bg-white/5 transition-colors text-zinc-500 hover:text-zinc-300"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
