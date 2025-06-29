"use client";
import {
  createContext,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

interface ToastData {
  id: string;
  message: string;
  type: "success" | "error";
}

interface ToastContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

function ToastContainer({
  toasts,
  removeToast,
}: {
  toasts: ToastData[];
  removeToast: (id: string) => void;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div
      className="fixed top-4 left-1/2 z-50 space-y-2"
      style={{
        position: "fixed",
        top: "1rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        pointerEvents: "none",
      }}
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`px-4 py-3 rounded-lg shadow-lg text-white text-base font-medium cursor-pointer transition-all duration-300 max-w-sm text-center ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
          style={{
            pointerEvents: "auto",
          }}
          onClick={() => removeToast(toast.id)}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  const showSuccess = (message: string) => {
    const id = Date.now().toString();
    const newToast: ToastData = { id, message, type: "success" };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 3 seconds
    setTimeout(() => removeToast(id), 3000);
  };

  const showError = (message: string) => {
    const id = Date.now().toString();
    const newToast: ToastData = { id, message, type: "error" };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove after 5 seconds
    setTimeout(() => removeToast(id), 5000);
  };

  return (
    <ToastContext.Provider value={{ showSuccess, showError }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
}
