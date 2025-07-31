import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

export const RouteDebugger: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-3 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="font-bold mb-2">🔧 Route Debug</div>
      <div>
        <strong>Pathname:</strong> {location.pathname}
      </div>
      <div>
        <strong>Search:</strong> {location.search || "none"}
      </div>
      <div>
        <strong>Hash:</strong> {location.hash || "none"}
      </div>
      <div>
        <strong>State:</strong>{" "}
        {location.state ? JSON.stringify(location.state) : "none"}
      </div>
      <div>
        <strong>Full URL:</strong> {window.location.href}
      </div>
      <div className="mt-2 space-x-2">
        <button
          onClick={() => navigate("/login")}
          className="bg-blue-600 hover:bg-blue-700 px-2 py-1 rounded text-xs"
        >
          → Login
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          className="bg-green-600 hover:bg-green-700 px-2 py-1 rounded text-xs"
        >
          → Dashboard
        </button>
      </div>
    </div>
  );
};
