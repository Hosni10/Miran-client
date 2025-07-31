import React, { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  className = "",
}) => {
  // Handle escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal content */}
      <div className={`relative z-10 ${className}`}>{children}</div>
    </div>,
    document.body,
  );
};

// Modal Panel component for consistent styling
interface ModalPanelProps {
  children: React.ReactNode;
  className?: string;
}

export const ModalPanel: React.FC<ModalPanelProps> = ({
  children,
  className = "w-full max-w-lg rounded-xl bg-white shadow-lg",
}) => {
  return <div className={className}>{children}</div>;
};

export default Modal;
