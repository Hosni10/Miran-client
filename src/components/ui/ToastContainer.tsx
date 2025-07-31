import React, { createContext, useContext, useState, useCallback } from "react";
import { Toast, ToastProps } from "./Toast";

interface ToastContextType {
  showToast: (toast: Omit<ToastProps, "id" | "onClose">) => void;
  showSuccess: (title: string, message: string) => void;
  showError: (title: string, message: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: React.ReactNode;
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastProps[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<ToastProps, "id" | "onClose">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newToast: ToastProps = {
        ...toast,
        id,
        onClose: removeToast,
      };
      setToasts((prev) => [...prev, newToast]);
    },
    [removeToast],
  );

  const showSuccess = useCallback(
    (title: string, message: string) => {
      showToast({ type: "success", title, message });
    },
    [showToast],
  );

  const showError = useCallback(
    (title: string, message: string) => {
      showToast({ type: "error", title, message });
    },
    [showToast],
  );

  const value: ToastContextType = {
    showToast,
    showSuccess,
    showError,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-container">
        {toasts.map((toast) => (
          <Toast key={toast.id} {...toast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};
