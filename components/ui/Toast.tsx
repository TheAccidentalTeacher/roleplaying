'use client';

import { useEffect } from 'react';

interface ToastData {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastContainerProps {
  toasts: ToastData[];
  onRemove: (id: string) => void;
}

const typeStyles = {
  info: 'border-sky-500/40 bg-sky-500/10 text-sky-300',
  success: 'border-green-500/40 bg-green-500/10 text-green-300',
  warning: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
  error: 'border-red-500/40 bg-red-500/10 text-red-300',
};

const typeIcons = {
  info: 'ℹ️',
  success: '✓',
  warning: '⚠️',
  error: '✕',
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: ToastData;
  onRemove: (id: string) => void;
}) {
  useEffect(() => {
    const timeout = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
    return () => clearTimeout(timeout);
  }, [toast, onRemove]);

  return (
    <div
      className={`flex items-center gap-3 px-4 py-3 rounded-lg border backdrop-blur-sm shadow-lg animate-slideUp ${typeStyles[toast.type]}`}
    >
      <span>{typeIcons[toast.type]}</span>
      <span className="text-sm">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="ml-auto text-slate-500 hover:text-white text-xs"
      >
        ✕
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col gap-2 max-w-sm">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onRemove={onRemove} />
      ))}
    </div>
  );
}
