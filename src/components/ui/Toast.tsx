import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, X } from "lucide-react";

export interface ToastProps {
  id: string;
  type: "success" | "error";
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

export const Toast: React.FC<ToastProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    const timer = setTimeout(() => setIsVisible(true), 10);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300);
  };

  const baseClasses =
    "fixed top-4 right-4 z-50 max-w-sm w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg border transform transition-all duration-300 ease-in-out";
  const visibilityClasses =
    isVisible && !isLeaving
      ? "translate-x-0 opacity-100"
      : "translate-x-full opacity-0";

  const typeClasses =
    type === "success"
      ? "border-green-200 dark:border-green-700"
      : "border-red-200 dark:border-red-700";

  return (
    <div className={`${baseClasses} ${visibilityClasses} ${typeClasses}`}>
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {type === "success" ? (
              <CheckCircle className="h-6 w-6 text-green-400" />
            ) : (
              <XCircle className="h-6 w-6 text-red-400" />
            )}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {message}
            </p>
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              className="bg-white dark:bg-gray-800 rounded-md inline-flex text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={handleClose}
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
