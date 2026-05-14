"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { FiX, FiCheckCircle, FiAlertTriangle, FiInfo } from "react-icons/fi";

const ToastContext = createContext({
  toast: () => {},
});

const ICONS = {
  success: <FiCheckCircle className="text-emerald-400" />,
  error: <FiAlertTriangle className="text-red-400" />,
  info: <FiInfo className="text-sky-400" />,
};

const BORDERS = {
  success: "border-emerald-700/50",
  error: "border-red-700/50",
  info: "border-sky-700/50",
};

let _counter = 0;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const toast = useCallback(
    (input) => {
      const id = ++_counter;
      const t =
        typeof input === "string"
          ? { id, type: "info", message: input, durationMs: 4000 }
          : { id, type: input.type || "info", message: input.message, durationMs: input.durationMs ?? 4000 };
      setToasts((prev) => [...prev, t]);
      if (t.durationMs > 0) {
        const timer = setTimeout(() => dismiss(id), t.durationMs);
        timers.current.set(id, timer);
      }
      return id;
    },
    [dismiss]
  );

  useEffect(() => {
    return () => {
      for (const timer of timers.current.values()) clearTimeout(timer);
      timers.current.clear();
    };
  }, []);

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-3 sm:bottom-6"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex items-center gap-2.5 max-w-md w-full sm:w-auto px-4 py-2.5 rounded-xl bg-neutral-900/95 backdrop-blur border ${BORDERS[t.type]} shadow-lg text-sm text-neutral-100`}
          >
            <span className="text-base shrink-0">{ICONS[t.type]}</span>
            <span className="flex-1 break-words">{t.message}</span>
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              className="shrink-0 p-1 -m-1 text-neutral-400 hover:text-white rounded"
              aria-label="Dismiss"
            >
              <FiX />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext).toast;
}

export function useToastContext() {
  return useContext(ToastContext);
}
