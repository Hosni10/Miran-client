import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { useToast } from "../ui/ToastContainer";
import { getApiUrl } from "../../config/api";

interface LoginFormProps {
  onForgotPassword: () => void;
}

// Create request config helper for this component
const createRequestConfig = (options: RequestInit = {}): RequestInit => {
  return {
    mode: "cors" as RequestMode,
    credentials: "omit" as RequestCredentials,
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  };
};

export const LoginForm: React.FC<LoginFormProps> = ({ onForgotPassword }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);

  const { login } = useAuth();
  const { showSuccess, showError } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || "/dashboard";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      showSuccess(
        "Login Successful",
        "Welcome back! You have been successfully logged in.",
      );
      navigate(from, { replace: true });
    } catch (err) {
      let errorMessage = "Login failed";
      let toastTitle = "Login Failed";

      if (err instanceof Error) {
        errorMessage = err.message;

        // Handle specific error types
        if (err.message.includes("Invalid credentials")) {
          toastTitle = "Invalid Credentials";
          errorMessage =
            "The email or password you entered is incorrect. Please check your credentials and try again.";
        } else if (err.message.includes("Invalid input")) {
          toastTitle = "Invalid Input";
          errorMessage = "Please check your email and password format.";
        } else if (
          err.message.includes("Network error") ||
          err.message.includes("Unable to connect")
        ) {
          toastTitle = "Connection Error";
          errorMessage =
            "Unable to connect to the server. Please check your internet connection and try again.";
        } else if (err.message.includes("All connection attempts failed")) {
          toastTitle = "Connection Error";
          errorMessage = "Unable to reach the server. Please try again later.";
        }
      }

      showError(toastTitle, errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  const testConnection = async () => {
    setTestingConnection(true);
    setError("");

    try {
      const url = getApiUrl("/user/trainer-login");
      const config = createRequestConfig({
        method: "POST",
        body: JSON.stringify({ email: "test@test.com", password: "test" }),
      });

      const response = await fetch(url, config);

      if (response.status === 422) {
        // 422 means the API is working but credentials are invalid (expected for test data)
        showSuccess(
          "Connection Test Successful",
          "API is responding correctly. Ready for real login.",
        );
        setError(
          `✅ Connection test successful! API is responding correctly (Status: ${response.status}). Ready for real login.`,
        );
      } else if (response.ok) {
        showSuccess(
          "Connection Test Successful",
          `API connection successful (Status: ${response.status})`,
        );
        setError(`✅ Connection test successful! Status: ${response.status}`);
      } else {
        const errorText = await response.text();
        showError(
          "Connection Test Failed",
          `Failed with status ${response.status}. Check console for details.`,
        );
        setError(
          `❌ Connection test failed with status ${response.status}. Check console for details.`,
        );
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      showError("Connection Test Failed", errorMessage);
      setError(`❌ Connection test failed: ${errorMessage}`);
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Welcome back
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Sign in to your account
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email address
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            placeholder="Enter your email"
            disabled={loading || testingConnection}
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            placeholder="Enter your password"
            disabled={loading || testingConnection}
          />
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onForgotPassword}
            className="text-sm text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded"
            disabled={loading || testingConnection}
          >
            Forgot your password?
          </button>

          <button
            type="button"
            onClick={testConnection}
            className="text-sm text-gray-600 hover:text-gray-500 dark:text-gray-400 dark:hover:text-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 rounded"
            disabled={loading || testingConnection}
          >
            {testingConnection ? "Testing..." : "Test Connection"}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || testingConnection || !email || !password}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Signing in...
            </div>
          ) : (
            "Sign in"
          )}
        </button>
      </form>
    </div>
  );
};
