import React, { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { LoginForm } from "../components/auth/LoginForm";
import { ForgotPasswordForm } from "../components/auth/ForgotPasswordForm";
import { useAuth } from "../contexts/AuthContext";

export const LoginPage: React.FC = () => {
  console.log("🔧 LoginPage component rendered");

  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const { user, loading } = useAuth();

  console.log("🔧 LoginPage auth state:", {
    user: !!user,
    loading,
    currentPath: window.location.pathname,
    currentUrl: window.location.href,
  });

  // Redirect if already authenticated
  if (loading) {
    console.log("🔧 LoginPage: Showing loading spinner");
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (user) {
    console.log("🔧 LoginPage: User authenticated, redirecting to dashboard");
    return <Navigate to="/dashboard" replace />;
  }

  console.log("🔧 LoginPage: Rendering login form");

  return (
    <div className="min-h-screen flex">
      {/* Left side - Brand illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">Miran Dashboard</h1>
            <p className="text-xl mb-8 opacity-90">
              Empowering fitness professionals with comprehensive management
              tools
            </p>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">💪</div>
                <div className="font-semibold">Workout Management</div>
                <div className="opacity-80">Create and track workouts</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">👥</div>
                <div className="font-semibold">Client Management</div>
                <div className="opacity-80">Manage your clients</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">📊</div>
                <div className="font-semibold">Analytics</div>
                <div className="opacity-80">Track progress & metrics</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl mb-2">🥗</div>
                <div className="font-semibold">Nutrition</div>
                <div className="opacity-80">Meal planning & tracking</div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-lg"></div>
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white dark:bg-gray-900">
        <div className="w-full max-w-md">
          {/* Mobile brand header */}
          <div className="lg:hidden text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Miran Dashboard
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Fitness management platform
            </p>
          </div>

          {/* Form container */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
            {showForgotPassword ? (
              <ForgotPasswordForm
                onBackToLogin={() => setShowForgotPassword(false)}
              />
            ) : (
              <LoginForm onForgotPassword={() => setShowForgotPassword(true)} />
            )}
          </div>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
            <p>© 2024 Miran. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
