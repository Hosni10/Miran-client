import React, { useState } from "react";
import { requestReset } from "../../services/authService";
import { useToast } from "../ui/ToastContainer";

interface ForgotPasswordFormProps {
  onBackToLogin: () => void;
}

export const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({
  onBackToLogin,
}) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const { showSuccess, showError } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    try {
      await requestReset(email);
      const successMessage =
        "Password reset instructions have been sent to your email address.";
      setMessage(successMessage);
      showSuccess("Reset Link Sent", successMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to send reset email";
      setError(errorMessage);
      showError("Reset Failed", errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e as any);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
          Reset your password
        </h2>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your
          password
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded-lg">
            {message}
          </div>
        )}

        <div>
          <label
            htmlFor="reset-email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
          >
            Email address
          </label>
          <input
            id="reset-email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            required
            className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-800 dark:text-white"
            placeholder="Enter your email"
            disabled={loading}
          />
        </div>

        <div className="space-y-4">
          <button
            type="submit"
            disabled={loading || !email}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Sending...
              </div>
            ) : (
              "Send reset link"
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            disabled={loading}
          >
            Back to sign in
          </button>
        </div>
      </form>
    </div>
  );
};
