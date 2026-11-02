import { useEffect, useState } from 'react';
import { subscribe, dismissToast } from '../../lib/toast';

const TONE = {
  success: 'bg-emerald-600',
  error: 'bg-red-600',
  info: 'bg-slate-800',
};

/** Vùng hiển thị toast, gắn 1 lần ở App. */
export function Toaster() {
  const [toasts, setToasts] = useState([]);

  useEffect(() => subscribe(setToasts), []);

  useEffect(() => {
    const timers = toasts.map((t) =>
      setTimeout(() => dismissToast(t.id), t.duration),
    );
    return () => timers.forEach(clearTimeout);
  }, [toasts]);

  return (
    <div className="pointer-events-none fixed inset-x-0 top-4 z-50 flex flex-col items-center gap-2 px-4">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${TONE[t.type] ?? TONE.info}`}
        >
          <span className="flex-1">{t.message}</span>
          <button
            onClick={() => dismissToast(t.id)}
            className="shrink-0 text-white/80 hover:text-white"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
