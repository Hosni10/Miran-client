/**
 * Authentication Storage Utility
 * Centralized token management with consistent async/sync APIs
 */
import {
  TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  USER_KEY,
  LEGACY_TOKEN_KEYS,
} from "../constants/auth";

// Async versions (for React components)
export const saveToken = async (token: string): Promise<void> => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    // Clean up any legacy tokens to avoid confusion
    LEGACY_TOKEN_KEYS.forEach((key: string) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to save token:", error);
    throw error;
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && token !== "undefined") {
      return token;
    }

    // Fallback: check legacy keys and migrate if found
    for (const legacyKey of LEGACY_TOKEN_KEYS) {
      const legacyToken = localStorage.getItem(legacyKey);
      if (legacyToken && legacyToken !== "undefined") {
        console.warn(
          `🔧 Migrating token from legacy key: ${legacyKey} → ${TOKEN_KEY}`,
        );
        await saveToken(legacyToken);
        return legacyToken;
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to get token:", error);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    // Also clear legacy keys
    LEGACY_TOKEN_KEYS.forEach((key: string) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Failed to clear token:", error);
  }
};

// Synchronous versions (for axios interceptors and immediate needs)
export const saveTokenSync = (token: string): void => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    LEGACY_TOKEN_KEYS.forEach((key: string) => {
      if (localStorage.getItem(key)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Failed to save token (sync):", error);
  }
};

export const getTokenSync = (): string | null => {
  try {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && token !== "undefined") {
      return token;
    }

    // Fallback: check legacy keys and migrate if found
    for (const legacyKey of LEGACY_TOKEN_KEYS) {
      const legacyToken = localStorage.getItem(legacyKey);
      if (legacyToken && legacyToken !== "undefined") {
        console.warn(
          `🔧 Migrating token from legacy key: ${legacyKey} → ${TOKEN_KEY}`,
        );
        saveTokenSync(legacyToken);
        return legacyToken;
      }
    }

    return null;
  } catch (error) {
    console.error("Failed to get token (sync):", error);
    return null;
  }
};

export const clearTokenSync = (): void => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    LEGACY_TOKEN_KEYS.forEach((key: string) => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.error("Failed to clear token (sync):", error);
  }
};

// Utility to check if user is authenticated
export const isAuthenticated = (): boolean => {
  const token = getTokenSync();
  return !!token;
};

// Debug utility (dev only)
export const debugTokenState = (): void => {
  if (import.meta.env.DEV) {
    const token = getTokenSync();
    console.log("🔧 Token Debug State:", {
      hasToken: !!token,
      tokenKey: TOKEN_KEY,
      tokenPreview: token
        ? `${token.substring(0, 10)}...${token.substring(token.length - 10)}`
        : null,
      tokenLength: token?.length,
      isJWT: token?.split(".").length === 3,
      legacyTokensFound: LEGACY_TOKEN_KEYS.filter((key: string) =>
        localStorage.getItem(key),
      ).length,
    });
  }
};
