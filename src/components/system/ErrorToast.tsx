import React from "react";
import { AlertTriangle } from "lucide-react";
import { useToast } from "../ui/ToastContainer";
import { getErrorMessage } from "../../utils/error";

interface ErrorToastType {
  error: (message?: string) => void;
}

export function useErrorToast(): ErrorToastType {
  const { showError } = useToast();

  const error = (message?: string) => {
    const errorMessage = message || "Unexpected error, please try again.";
    showError("Error", errorMessage);
  };

  return { error };
}

// Export a convenience hook that automatically extracts error messages
export function useAutoErrorToast() {
  const { error } = useErrorToast();

  return {
    showError: (err: unknown) => {
      const message = getErrorMessage(err);
      error(message);
    },
  };
}
