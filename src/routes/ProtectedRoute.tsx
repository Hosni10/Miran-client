import React, { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  console.log("🔧 ProtectedRoute rendered:", {
    user: !!user,
    loading,
    pathname: location.pathname,
    search: location.search,
    state: location.state,
  });

  // Show loading spinner while checking authentication
  if (loading) {
    console.log("🔧 ProtectedRoute: Showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    console.log(
      "🔧 ProtectedRoute: No user found, redirecting to login from:",
      location.pathname,
    );
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Render protected content
  console.log("🔧 ProtectedRoute: User authenticated, rendering children");
  return <>{children}</>;
};
