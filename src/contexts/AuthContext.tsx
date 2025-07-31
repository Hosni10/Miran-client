import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  login as apiLogin,
  LoginResponse,
  createAuthenticatedFetch,
} from "../services/authService";
import { saveToken, getToken, clearToken } from "../utils/authStorage";
import { TOKEN_KEY, USER_KEY } from "../constants/auth";
import { storage } from "../utils/storage";
import { useAuthStore } from "../store/AuthStore";

// Update User interface to match what the API actually returns
interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  authFetch: (url: string, options?: RequestInit) => Promise<Response>;
  mockLogin: () => void; // Add mock login for development
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Token keys are now imported from constants

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  console.log("🔧 AuthProvider initialized");

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Get AuthStore methods to sync the two auth systems
  const authStore = useAuthStore();

  // Mock login function for development
  const mockLogin = () => {
    console.log("🔧 AuthProvider: Mock login triggered");
    const mockUser: User = {
      id: "1",
      email: "admin@miran.com",
      name: "Admin User",
      role: "admin",
      first_name: "Admin",
      last_name: "User",
    };

    const mockToken = "mock-token-for-development";

    // Store in AuthContext state
    setUser(mockUser);
    setToken(mockToken);

    // Store in localStorage
    storage.setJSON(USER_KEY, mockUser);
    storage.setItem(TOKEN_KEY, mockToken);

    // CRITICAL: Also update AuthStore for role-based permissions
    const mockStoreUser = {
      id: 1,
      email: "admin@miran.com",
      first_name: "Admin",
      last_name: "User",
      role: "Admin" as const, // This matches the AuthStore UserRole type
      is_active: true,
      profile_picture:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    };

    authStore.login(mockStoreUser, {
      access: mockToken,
      refresh: "mock-refresh-token",
    });

    console.log("🔧 AuthProvider: Mock login completed", {
      contextUser: mockUser,
      storeUser: mockStoreUser,
      storeAuthenticated: authStore.isAuthenticated,
    });
  };

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      console.log("🔧 AuthProvider useEffect running...");

      try {
        const storedToken = await getToken();
        const storedUser = storage.getJSON<User>(USER_KEY);

        console.log("🔧 AuthProvider initialization:", {
          storedToken: !!storedToken,
          storedUser: !!storedUser,
          tokenKey: TOKEN_KEY,
          userKey: USER_KEY,
          currentPath: window.location.pathname,
          currentUrl: window.location.href,
          storedUserData: storedUser,
        });

        if (storedToken && storedUser) {
          console.log("🔧 AuthProvider: Using stored credentials", {
            tokenExists: !!storedToken,
            userData: storedUser,
          });
          setToken(storedToken);
          setUser(storedUser);

          // Also sync to AuthStore
          let storeRole: "Admin" | "Trainer" | "Operation" = "Operation";
          if (storedUser.role === "admin") storeRole = "Admin";
          else if (storedUser.role === "trainer") storeRole = "Trainer";

          const storeUser = {
            id: parseInt(storedUser.id) || 1,
            email: storedUser.email,
            first_name:
              storedUser.first_name || storedUser.name?.split(" ")[0] || "User",
            last_name:
              storedUser.last_name ||
              storedUser.name?.split(" ").slice(1).join(" ") ||
              "",
            role: storeRole,
            is_active: true,
            profile_picture: storedUser.profile_picture,
          };

          authStore.login(storeUser, {
            access: storedToken,
            refresh: "placeholder-refresh-token",
          });
        } else {
          console.log(
            "🔧 AuthProvider: No stored credentials found, checking for dev mode",
          );

          // In development, auto-login with mock user if no auth found
          if (import.meta.env.DEV && window.location.pathname !== "/login") {
            console.log("🔧 AuthProvider: Development mode - auto mock login");
            mockLogin();
          }
        }
      } catch (error) {
        console.error("🔧 AuthProvider: Error during initialization:", error);

        // In development, fallback to mock login on error
        if (import.meta.env.DEV && window.location.pathname !== "/login") {
          console.log("🔧 AuthProvider: Error fallback - using mock login");
          mockLogin();
        }
      } finally {
        setLoading(false);
        console.log("🔧 AuthProvider: Loading set to false");
      }
    };

    initializeAuth();
  }, []);

  // Debug state changes
  useEffect(() => {
    console.log("🔧 AuthProvider state changed:", {
      user: !!user,
      userName: user?.name,
      userRole: user?.role,
      token: !!token,
      loading,
      currentPath: window.location.pathname,
    });
  }, [user, token, loading]);

  const login = async (email: string, password: string): Promise<void> => {
    console.log("🔧 AuthContext login called", { email, password: "***" });
    setLoading(true);
    try {
      const response: LoginResponse = await apiLogin(email, password);

      console.log("🔧 AuthContext received response:", {
        hasToken: !!response.token,
        hasUser: !!response.user,
        user: response.user,
        tokenFormat: response.token
          ? {
              length: response.token.length,
              firstChars: response.token.substring(0, 20) + "...",
              lastChars:
                "..." + response.token.substring(response.token.length - 10),
              startsWithBearer: response.token.startsWith("Bearer "),
              containsDot: response.token.includes("."),
              isJWT: response.token.split(".").length === 3,
            }
          : null,
      });

      // Store token and user data using the unified storage
      await saveToken(response.token);
      storage.setJSON(USER_KEY, response.user);

      setToken(response.token);
      setUser(response.user);

      // Also update AuthStore for role-based permissions
      let storeRole: "Admin" | "Trainer" | "Operation" = "Operation";
      if (response.user.role === "admin") storeRole = "Admin";
      else if (response.user.role === "trainer") storeRole = "Trainer";

      const storeUser = {
        id: parseInt(response.user.id) || 1,
        email: response.user.email,
        first_name: response.user.name?.split(" ")[0] || "User",
        last_name: response.user.name?.split(" ").slice(1).join(" ") || "",
        role: storeRole,
        is_active: true,
        profile_picture: response.user.profile_picture,
      };

      authStore.login(storeUser, {
        access: response.token,
        refresh: "placeholder-refresh-token",
      });

      console.log("🔧 AuthContext state updated:", {
        token: !!response.token,
        user: response.user,
        storeAuthenticated: authStore.isAuthenticated,
        storedInLocalStorage: {
          token: !!storage.getItem(TOKEN_KEY),
          user: !!storage.getJSON(USER_KEY),
        },
      });
    } catch (error) {
      console.error("🔧 Login failed:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    console.log("🔧 AuthContext logout called");
    // Clear all tokens using unified storage
    await clearToken();
    setToken(null);
    setUser(null);

    // Also clear AuthStore
    authStore.logout();

    console.log("🔧 AuthContext logout completed - both systems cleared");
  };

  // Authenticated fetch wrapper
  const authFetch = async (
    url: string,
    options: RequestInit = {},
  ): Promise<Response> => {
    if (!token) {
      throw new Error("No authentication token available");
    }

    const authenticatedFetch = createAuthenticatedFetch(token);
    return authenticatedFetch(url, options);
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    login,
    logout,
    authFetch,
    mockLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
