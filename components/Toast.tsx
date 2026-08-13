"use client";

import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { CheckIcon, WarningIcon } from "@/components/icons";

interface ToastItem {
  id: number;
  message: string;
  type: "success" | "error";
}

interface ToastContextValue {
  showToast: (message: string, type?: "success" | "error") => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Provider ağacının dışında çağrılırsa (ör. bir bileşen yanlışlıkla Provider
// sarmalayıcısı olmayan bir sayfada kullanılırsa) no-op döner — bildirim
// gösterilmez ama uygulama çökmez.
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) return { showToast: () => {} };
  return ctx;
}

const AUTO_DISMISS_MS = 3000;

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, type: "success" | "error" = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, AUTO_DISMISS_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4">
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`pointer-events-auto flex w-full max-w-sm items-center gap-2.5 rounded-lg border-l-4 bg-white px-4 py-3 text-sm font-medium text-slate-800 shadow-lg ring-1 ring-slate-200 [animation:toast-in_0.2s_ease-out] ${
              t.type === "success" ? "border-green-500" : "border-red-500"
            }`}
          >
            {t.type === "success" ? (
              <CheckIcon className="h-4 w-4 shrink-0 text-green-600" />
            ) : (
              <WarningIcon className="h-4 w-4 shrink-0 text-red-600" />
            )}
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
