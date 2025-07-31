/**
 * Authentication token utility
 * Provides helper functions to get stored JWT tokens
 */

export const getAuthToken = async (): Promise<string | null> => {
  const KEY = "userTokenSaved"; // Primary key used by the login flow
  const FALLBACK_KEY = "access_token"; // Fallback key for compatibility

  try {
    // Try primary key first
    const token = localStorage.getItem(KEY);
    if (token && token !== "undefined") {
      return token;
    }

    // Fallback to secondary key
    const fallbackToken = localStorage.getItem(FALLBACK_KEY);
    if (fallbackToken && fallbackToken !== "undefined") {
      return fallbackToken;
    }

    return null;
  } catch {
    // Silent fail for localStorage access issues
    return null;
  }
};

/**
 * Synchronous version for immediate access
 */
export const getAuthTokenSync = (): string | null => {
  const KEY = "userTokenSaved";
  const FALLBACK_KEY = "access_token";

  try {
    const token = localStorage.getItem(KEY);
    if (token && token !== "undefined") {
      return token;
    }

    const fallbackToken = localStorage.getItem(FALLBACK_KEY);
    if (fallbackToken && fallbackToken !== "undefined") {
      return fallbackToken;
    }

    return null;
  } catch {
    // Silent fail for localStorage access issues
    return null;
  }
};
