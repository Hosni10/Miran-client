/**
 * Authentication constants
 * Single source of truth for token storage keys
 */
export const TOKEN_KEY = "userTokenSaved" as const;
export const REFRESH_TOKEN_KEY = "refresh_token" as const;
export const USER_KEY = "auth_user" as const;
export const TOKEN_HEADER_PREFIX = "Token" as const;

// Legacy keys for cleanup
export const LEGACY_TOKEN_KEYS = [
  "access_token",
  "auth_token",
  "jwt_token",
  "token",
] as const;
