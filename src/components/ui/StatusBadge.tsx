import React from "react";
import { CheckCircle, XCircle } from "lucide-react";

interface StatusBadgeProps {
  label: string;
  active: boolean;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ label, active }) => {
  return (
    <span className="inline-flex items-center gap-1 text-xs font-medium">
      {active ? (
        <CheckCircle className="h-4 w-4 text-emerald-500" />
      ) : (
        <XCircle className="h-4 w-4 text-rose-500" />
      )}
      {label}
    </span>
  );
};
