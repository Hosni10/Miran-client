// TODO: Replace with actual API implementation once backend is ready
// This is a placeholder for future Miran API integration

import axios, { AxiosInstance, AxiosResponse } from "axios";
import {
  getTokenSync,
  clearTokenSync,
  debugTokenState,
} from "../utils/authStorage";

// Types for API responses
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: "Admin" | "Trainer" | "Operation";
  is_active: boolean;
  date_joined: string;
  profile_picture?: string;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  image_url?: string;
  is_active: boolean;
  created_at: string;
}

export interface Workout {
  id: number;
  title: string;
  description: string;
  duration: number;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  category: string;
  video_url?: string;
  thumbnail_url?: string;
  created_at: string;
}

// New types for Food API based on the provided documentation
export interface Unit {
  id?: number;
  name?: string;
}

// Updated FoodItem interface to match API specification
export interface FoodItem {
  id: number;
  title: string;
  secondary_food: string;
  quantity: number;
  unit: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  protein_percentage: number;
  carb_percentage: number;
  fat_percentage: number;
  image: string | null;
}

export interface Trainer {
  id: number;
  full_name: string;
  avatar: string | null;
  rating: number;
  reviews: number;
  available: boolean;
  available_for_renew: boolean;
  chat_uid: string | null;
  nationality: { id?: number; name?: string };
  price: number;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// Paginated response interface for food API
export interface PaginatedFood {
  count: number;
  next?: string;
  previous?: string;
  result: FoodItem[];
}

export interface PresignedUrlResponse {
  upload_url: string;
  file_url: string;
}

// Environment-aware base URL configuration
const getBaseURL = (): string => {
  // Always use proxy path - let Netlify handle the redirection
  return "/api";
};

// Create Axios instance
export const api = axios.create({
  baseURL: getBaseURL(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  responseType: "json",
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = getTokenSync();

    if (import.meta.env.DEV) {
      console.log("🔧 API Request Interceptor:", {
        url: config.url,
        baseURL: config.baseURL,
        fullUrl: `${config.baseURL}${config.url}`,
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 10)}...` : null,
        headers: config.headers,
      });
      debugTokenState();
    }

    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("🔧 API Request Interceptor Error:", error);
    return Promise.reject(error);
  },
);

// Global error toast handler - will be set by App component
let globalErrorHandler: ((message: string) => void) | null = null;

export function setGlobalErrorHandler(handler: (message: string) => void) {
  globalErrorHandler = handler;
}

// Response interceptor to enforce JSON responses and handle errors
api.interceptors.response.use(
  (response) => {
    // Check if response is JSON
    const contentType = response.headers["content-type"] ?? "";
    if (!contentType.includes("application/json")) {
      const error = new Error("Non-JSON response from API");
      (error as any).response = response;
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log("🔧 API Response Success:", {
        status: response.status,
        url: response.config.url,
        dataType: typeof response.data,
        hasResults: response.data?.results?.length,
      });
    }
    return response;
  },
  (error) => {
    console.error("🔧 API Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    // Show error toast for user-facing errors
    if (globalErrorHandler && error.response?.status !== 401) {
      import("../utils/error").then(({ getErrorMessage }) => {
        const message = getErrorMessage(error);
        if (globalErrorHandler) {
          globalErrorHandler(message);
        }
      });
    }

    if (error.response?.status === 401) {
      // Handle unauthorized access - clear tokens but don't redirect
      // Let components handle the error gracefully
      console.log("🔧 API: 401 Unauthorized - clearing tokens");
      clearTokenSync();
      // Don't redirect automatically - let components handle it
      // window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);

// API Helper Functions

// Users
export const getUsers = async (params?: {
  page?: number;
  search?: string;
  role?: string;
}): Promise<ApiResponse<User>> => {
  const response: AxiosResponse<ApiResponse<User>> = await api.get("/users/", {
    params,
  });
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response: AxiosResponse<User> = await api.get(`/users/${id}/`);
  return response.data;
};

export const createUser = async (userData: Partial<User>): Promise<User> => {
  const response: AxiosResponse<User> = await api.post("/users/", userData);
  return response.data;
};

export const updateUser = async (
  id: number,
  userData: Partial<User>,
): Promise<User> => {
  const response: AxiosResponse<User> = await api.patch(
    `/users/${id}/`,
    userData,
  );
  return response.data;
};

export const deleteUser = async (id: number): Promise<void> => {
  await api.delete(`/users/${id}/`);
};

// Products/Nutrition
export const getProducts = async (params?: {
  page?: number;
  search?: string;
  category?: string;
}): Promise<ApiResponse<Product>> => {
  const response: AxiosResponse<ApiResponse<Product>> = await api.get(
    "/products/",
    { params },
  );
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response: AxiosResponse<Product> = await api.get(`/products/${id}/`);
  return response.data;
};

export const createProduct = async (
  productData: Partial<Product>,
): Promise<Product> => {
  const response: AxiosResponse<Product> = await api.post(
    "/products/",
    productData,
  );
  return response.data;
};

export const updateProduct = async (
  id: number,
  productData: Partial<Product>,
): Promise<Product> => {
  const response: AxiosResponse<Product> = await api.patch(
    `/products/${id}/`,
    productData,
  );
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await api.delete(`/products/${id}/`);
};

// Workouts
export const getWorkouts = async (params?: {
  page?: number;
  search?: string;
  category?: string;
  difficulty?: string;
}): Promise<ApiResponse<Workout>> => {
  const response: AxiosResponse<ApiResponse<Workout>> = await api.get(
    "/workouts/",
    { params },
  );
  return response.data;
};

export const getWorkout = async (id: number): Promise<Workout> => {
  const response: AxiosResponse<Workout> = await api.get(`/workouts/${id}/`);
  return response.data;
};

export const createWorkout = async (
  workoutData: Partial<Workout>,
): Promise<Workout> => {
  const response: AxiosResponse<Workout> = await api.post(
    "/workouts/",
    workoutData,
  );
  return response.data;
};

export const updateWorkout = async (
  id: number,
  workoutData: Partial<Workout>,
): Promise<Workout> => {
  const response: AxiosResponse<Workout> = await api.patch(
    `/workouts/${id}/`,
    workoutData,
  );
  return response.data;
};

export const deleteWorkout = async (id: number): Promise<void> => {
  await api.delete(`/workouts/${id}/`);
};

// File Upload Helpers
export const getPresignedUrl = async (
  fileName: string,
  fileType: string,
): Promise<PresignedUrlResponse> => {
  const response: AxiosResponse<PresignedUrlResponse> = await api.post(
    "/upload/presigned-url/",
    {
      file_name: fileName,
      file_type: fileType,
    },
  );
  return response.data;
};

export const uploadFile = async (url: string, file: File): Promise<void> => {
  await axios.put(url, file, {
    headers: {
      "Content-Type": file.type,
    },
  });
};

// Combined upload function
export const uploadViaPresigned = async (file: File): Promise<string> => {
  const { upload_url, file_url } = await getPresignedUrl(file.name, file.type);
  await uploadFile(upload_url, file);
  return file_url;
};

// Authentication
export const login = async (
  email: string,
  password: string,
): Promise<{
  access: string;
  refresh: string;
  user: User;
}> => {
  const response = await api.post("/auth/login/", { email, password });
  return response.data;
};

export const refreshToken = async (
  refresh: string,
): Promise<{ access: string }> => {
  const response = await api.post("/auth/refresh/", { refresh });
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/auth/logout/");
};

// Food API functions matching the specification
export const fetchFoodPage = async (
  url?: string,
  limit = 50,
): Promise<AxiosResponse<PaginatedFood>> => {
  try {
    // Convert full API URLs to proxy-compatible relative URLs
    let apiUrl: string;

    if (url) {
      // If it's a full URL from the API, convert it to use the proxy
      if (url.startsWith("https://testing.miranapp.com/api/")) {
        // Extract the path after the API base URL
        apiUrl = url.replace("https://testing.miranapp.com/api/", "/");
      } else if (url.startsWith("https://testing.miranapp.com/")) {
        // Handle URLs that might not have /api/ prefix
        apiUrl = url.replace("https://testing.miranapp.com/", "/");
      } else if (url.startsWith("/api/")) {
        // Already properly formatted for proxy
        apiUrl = url.replace("/api/", "/");
      } else if (url.startsWith("/")) {
        // Relative URL, use as-is
        apiUrl = url;
      } else {
        // Fallback: assume it's a relative path
        apiUrl = `/${url}`;
      }
    } else {
      // Default first page URL
      apiUrl = `/v1/resources/food_list?limit=${limit}`;
    }

    console.log("🔧 fetchFoodPage: Converting URL", {
      originalUrl: url,
      convertedUrl: apiUrl,
      isFirstPage: !url,
    });

    const response = await api.get<PaginatedFood>(apiUrl);
    return response;
  } catch (error) {
    console.log("�� API request failed:", error);
    throw error;
  }
};

// Legacy function for backward compatibility
export const getFoodItems = async (params?: {
  search?: string;
  ordering?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<FoodItem>> => {
  const response = await fetchFoodPage(undefined, params?.limit || 50);

  // Transform to legacy format
  return {
    count: response.data.count,
    next: response.data.next || null,
    previous: response.data.previous || null,
    results: response.data.result,
  };
};

export default api;
