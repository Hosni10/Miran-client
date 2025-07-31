// API Configuration for different environments
export const API_CONFIG = {
  // Use environment variable first, then fallback based on environment
  BASE_URL:
    import.meta.env.VITE_API_URL ||
    (import.meta.env.DEV
      ? "/api" // Vite proxy path for development
      : "/api"), // Netlify proxy for production

  MEDIA_BASE_URL: "https://testing.miranapp.com/media",

  // Default headers for all requests
  DEFAULT_HEADERS: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },

  // Request timeout
  TIMEOUT: 10000,

  // Use mock data as fallback when API is not available
  USE_MOCK_DATA_DEFAULT: false,
};

// Helper function to get full API URL
export const getApiUrl = (endpoint: string): string => {
  const baseUrl = API_CONFIG.BASE_URL;
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  const fullUrl = `${baseUrl}${cleanEndpoint}`;

  // Debug logging in development
  if (import.meta.env.DEV) {
    console.log("🔧 API URL:", { baseUrl, endpoint: cleanEndpoint, fullUrl });
  }

  return fullUrl;
};

// Helper function to get media URL
export const getMediaUrl = (path: string | null): string => {
  if (!path) return "";
  return `${API_CONFIG.MEDIA_BASE_URL}/${path}`;
};

// Helper function to get auth headers
export const getAuthHeaders = (): HeadersInit => {
  const token =
    localStorage.getItem("userTokenSaved") ||
    localStorage.getItem("access_token");

  const headers: HeadersInit = {
    ...API_CONFIG.DEFAULT_HEADERS,
  };

  if (token) {
    headers.Authorization = `Token ${token}`;
  }

  return headers;
};
