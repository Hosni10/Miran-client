import { create } from "zustand";
import { persist } from "zustand/middleware";

export type UserRole = "Admin" | "Trainer" | "Operation";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  profile_picture?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  accessToken: string | null;
  refreshToken: string | null;

  // Actions
  login: (user: User, tokens: { access: string; refresh: string }) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setTokens: (tokens: { access: string; refresh: string }) => void;

  // Role-based permissions
  hasPermission: (permission: Permission) => boolean;
  canAccess: (resource: Resource, action: Action) => boolean;
}

// Define permissions for different roles
export type Permission =
  | "manage_users"
  | "view_users"
  | "manage_products"
  | "view_products"
  | "manage_recipes"
  | "view_recipes"
  | "manage_workouts"
  | "view_workouts"
  | "manage_programs"
  | "view_programs"
  | "manage_trainers"
  | "view_trainers"
  | "manage_settings"
  | "view_analytics"
  | "manage_payments"
  | "view_reports";

export type Resource =
  | "users"
  | "products"
  | "recipes"
  | "workouts"
  | "programs"
  | "trainers"
  | "settings"
  | "analytics"
  | "payments";
export type Action = "create" | "read" | "update" | "delete" | "manage";

// Role permissions mapping
const rolePermissions: Record<UserRole, Permission[]> = {
  Admin: [
    "manage_users",
    "view_users",
    "manage_products",
    "view_products",
    "manage_recipes",
    "view_recipes",
    "manage_workouts",
    "view_workouts",
    "manage_programs",
    "view_programs",
    "manage_trainers",
    "view_trainers",
    "manage_settings",
    "view_analytics",
    "manage_payments",
    "view_reports",
  ],
  Trainer: [
    "view_users",
    "view_products",
    "view_recipes",
    "manage_workouts",
    "view_workouts",
    "manage_programs",
    "view_programs",
    "view_trainers",
    "view_analytics",
  ],
  Operation: [
    "view_users",
    "manage_products",
    "view_products",
    "manage_recipes",
    "view_recipes",
    "view_workouts",
    "view_programs",
    "view_trainers",
    "view_analytics",
    "view_reports",
  ],
};

// Resource-action to permission mapping
const resourceActionPermissions: Record<string, Permission> = {
  "users-create": "manage_users",
  "users-read": "view_users",
  "users-update": "manage_users",
  "users-delete": "manage_users",
  "users-manage": "manage_users",

  "products-create": "manage_products",
  "products-read": "view_products",
  "products-update": "manage_products",
  "products-delete": "manage_products",
  "products-manage": "manage_products",

  "recipes-create": "manage_recipes",
  "recipes-read": "view_recipes",
  "recipes-update": "manage_recipes",
  "recipes-delete": "manage_recipes",
  "recipes-manage": "manage_recipes",

  "workouts-create": "manage_workouts",
  "workouts-read": "view_workouts",
  "workouts-update": "manage_workouts",
  "workouts-delete": "manage_workouts",
  "workouts-manage": "manage_workouts",

  "programs-create": "manage_programs",
  "programs-read": "view_programs",
  "programs-update": "manage_programs",
  "programs-delete": "manage_programs",
  "programs-manage": "manage_programs",

  "trainers-create": "manage_trainers",
  "trainers-read": "view_trainers",
  "trainers-update": "manage_trainers",
  "trainers-delete": "manage_trainers",
  "trainers-manage": "manage_trainers",

  "settings-manage": "manage_settings",
  "analytics-read": "view_analytics",
  "payments-manage": "manage_payments",
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      refreshToken: null,

      login: (user: User, tokens: { access: string; refresh: string }) => {
        set({
          user,
          isAuthenticated: true,
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
        });

        // Store tokens in localStorage for API interceptors
        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
      },

      logout: () => {
        set({
          user: null,
          isAuthenticated: false,
          accessToken: null,
          refreshToken: null,
        });

        // Clear tokens from localStorage
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      },

      updateUser: (userData: Partial<User>) => {
        const currentUser = get().user;
        if (currentUser) {
          set({
            user: { ...currentUser, ...userData },
          });
        }
      },

      setTokens: (tokens: { access: string; refresh: string }) => {
        set({
          accessToken: tokens.access,
          refreshToken: tokens.refresh,
        });

        localStorage.setItem("access_token", tokens.access);
        localStorage.setItem("refresh_token", tokens.refresh);
      },

      hasPermission: (permission: Permission): boolean => {
        const { user } = get();
        if (!user) return false;

        const userPermissions = rolePermissions[user.role] || [];
        return userPermissions.includes(permission);
      },

      canAccess: (resource: Resource, action: Action): boolean => {
        const permissionKey = `${resource}-${action}`;
        const requiredPermission = resourceActionPermissions[permissionKey];

        if (!requiredPermission) return false;

        return get().hasPermission(requiredPermission);
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
      }),
    },
  ),
);

// Mock login function for development
export const mockLogin = (role: UserRole = "Admin") => {
  const mockUser: User = {
    id: 1,
    email: "admin@miran.com",
    first_name: "Admin",
    last_name: "User",
    role,
    is_active: true,
    profile_picture:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  };

  const mockTokens = {
    access: "mock-access-token",
    refresh: "mock-refresh-token",
  };

  useAuthStore.getState().login(mockUser, mockTokens);
};
