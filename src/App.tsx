import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { I18nextProvider } from "react-i18next";
import DashboardLayout from "./components/layout/DashboardLayout";
import DirectionProvider from "./components/DirectionProvider";
import Overview from "./routes/Overview";
import { UsersPage } from "./pages/UsersPage";
import Workouts from "./routes/Workouts";
import Programs from "./routes/Programs";
import Settings from "./routes/Settings";
import { FoodListScreen } from "./screens/FoodListScreen";
import { TrainerListScreen } from "./screens/TrainerListScreen";
import { RecipesList } from "./pages/RecipesList";
import { LoginPage } from "./pages/LoginPage";
import { NotFoundPage } from "./pages/NotFoundPage";
import PrimeSubscribersPage from "./pages/PrimeSubscribersPage";
import { UnitsPage } from "./pages/UnitsPage";
import { SecondaryFoodPage } from "./pages/SecondaryFoodPage";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import { ToastProvider, useToast } from "./components/ui/ToastContainer";
import { RouteDebugger } from "./components/RouteDebugger";
import { useThemeStore } from "./store/ThemeStore";
import { queryClient } from "./lib/queryClient";
import { setGlobalErrorHandler } from "./lib/api";
import i18n from "./lib/i18n";

// Inner app component that has access to toast context
function AppContent() {
  const { isDark } = useThemeStore();
  const { showError } = useToast();

  // Apply dark mode class to document
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDark]);

  // Set up global error handler
  useEffect(() => {
    setGlobalErrorHandler((message: string) => {
      showError("Error", message);
    });
  }, [showError]);

  console.log("🔧 App component rendered");

  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Overview />} />
            <Route path="dashboard" element={<Overview />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="food" element={<FoodListScreen />} />
            <Route path="units" element={<UnitsPage />} />
            <Route path="secondary-food" element={<SecondaryFoodPage />} />
            <Route path="recipes" element={<RecipesList />} />
            <Route path="workouts" element={<Workouts />} />
            <Route path="programs" element={<Programs />} />
            <Route path="trainers" element={<TrainerListScreen />} />
            <Route
              path="prime-subscribers"
              element={<PrimeSubscribersPage />}
            />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* Catch-all route - show 404 page for debugging */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>

        {/* Route debugger - only shows in development */}
        {/* <RouteDebugger /> */}
      </Router>
    </AuthProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nextProvider i18n={i18n}>
        <DirectionProvider>
          <ToastProvider>
            <AppContent />
          </ToastProvider>
        </DirectionProvider>
      </I18nextProvider>
    </QueryClientProvider>
  );
}

export default App;
