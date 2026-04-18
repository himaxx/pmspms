import { useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

/* ─── Individual Toast ─────────────────────────────────────────────────────── */
function Toast({ id, message, type = 'error', onDismiss }) {
  const bg = {
    error:   'bg-red-600',
    success: 'bg-green-600',
    info:    'bg-gray-800',
  }[type] ?? 'bg-gray-800';

  const icon = {
    error:   '⚠️',
    success: '✅',
    info:    'ℹ️',
  }[type] ?? 'ℹ️';

  return (
    <div
      role="alert"
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-white text-sm
                  font-medium max-w-[92vw] ${bg}`}
      style={{ animation: 'slideUp 260ms cubic-bezier(0.22,1,0.36,1) both' }}
    >
      <span className="shrink-0 text-base">{icon}</span>
      <span className="flex-1 leading-snug">{message}</span>
      <button
        onClick={() => onDismiss(id)}
        aria-label="Dismiss"
        className="shrink-0 opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
          <path d="M5.28 4.22a.75.75 0 00-1.06 1.06L6.94 8l-2.72 2.72a.75.75 0 101.06 1.06L8 9.06l2.72 2.72a.75.75 0 101.06-1.06L9.06 8l2.72-2.72a.75.75 0 00-1.06-1.06L8 6.94 5.28 4.22z" />
        </svg>
      </button>
    </div>
  );
}

/* ─── Toast Container (portal) ─────────────────────────────────────────────── */
export function ToastContainer({ toasts, onDismiss }) {
  if (!toasts.length) return null;
  return createPortal(
    <div className="fixed bottom-20 inset-x-0 z-[60] flex flex-col items-center gap-2 px-4 pointer-events-none">
      {toasts.map((t) => (
        <div key={t.id} className="pointer-events-auto w-full flex justify-center">
          <Toast {...t} onDismiss={onDismiss} />
        </div>
      ))}
    </div>,
    document.body
  );
}

/* ─── useToast hook ────────────────────────────────────────────────────────── */
let _idCounter = 0;

export function useToast() {
  const [toasts, setToasts] = useState([]);
  const timersRef = useRef({});

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timersRef.current[id]);
    delete timersRef.current[id];
  }, []);

  const addToast = useCallback((message, type = 'error', duration = 3000) => {
    const id = ++_idCounter;
    setToasts((prev) => [...prev, { id, message, type }]);
    timersRef.current[id] = setTimeout(() => dismiss(id), duration);
  }, [dismiss]);

  // Cleanup on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => Object.values(timers).forEach(clearTimeout);
  }, []);

  return { toasts, addToast, dismiss };
}
