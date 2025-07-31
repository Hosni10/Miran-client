import axios from "axios";

// Direct API instance for Prime Subscribers (bypasses Netlify proxy for this specific API)
const primeSubscribersApi = axios.create({
  baseURL: "https://testing.miranapp.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor to add authorization token
primeSubscribersApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userTokenSaved");
    if (token) {
      config.headers.Authorization = `Token ${token.trim()}`;
    }

    if (window.__MIRAN_DEBUG) {
      console.info("[PrimeSubscribers API] Request:", {
        method: config.method?.toUpperCase(),
        url: config.url,
        hasToken: !!token,
        headers: config.headers,
      });
    }

    return config;
  },
  (error) => {
    if (window.__MIRAN_DEBUG) {
      console.error("[PrimeSubscribers API] Request error:", error);
    }
    return Promise.reject(error);
  },
);

// Response interceptor for error handling
primeSubscribersApi.interceptors.response.use(
  (response) => {
    if (window.__MIRAN_DEBUG) {
      console.info("[PrimeSubscribers API] Response:", {
        status: response.status,
        url: response.config.url,
        dataKeys: Object.keys(response.data || {}),
      });
    }
    return response;
  },
  (error) => {
    if (window.__MIRAN_DEBUG) {
      console.error("[PrimeSubscribers API] Response error:", {
        status: error.response?.status,
        message: error.message,
        url: error.config?.url,
        data: error.response?.data,
      });
    }
    return Promise.reject(error);
  },
);

// Types
export interface Subscriber {
  id: number;
  start_date: string; // ISO date string
  end_date: string; // ISO date string
  is_private_coach: boolean;
  user: {
    id: number;
    full_name: string | null;
    mobile: string | null;
    email: string | null;
  };
  plan_subscription?: any; // Optional field from API
}

export interface PaginatedSubscribers {
  count: number;
  next: string | null;
  previous: string | null;
  result: Subscriber[];
}

// API endpoint constant
export const PRIME_SUBSCRIBERS_ENDPOINT =
  "/miran_prime/prime_trainer_subscribers/for_prime_trainer/";

// Main fetch function
export const fetchPrimeSubscribers = async (
  url?: string,
): Promise<PaginatedSubscribers> => {
  try {
    const response = await primeSubscribersApi.get<PaginatedSubscribers>(
      url || PRIME_SUBSCRIBERS_ENDPOINT,
    );

    if (window.__MIRAN_DEBUG) {
      console.info("[PrimeSubscribers] Raw API response:", {
        status: response.status,
        count: response.data.count,
        resultLength: response.data.result?.length,
        hasNext: !!response.data.next,
        hasPrevious: !!response.data.previous,
        firstSubscriber: response.data.result?.[0],
      });
    }

    return response.data;
  } catch (error: any) {
    if (window.__MIRAN_DEBUG) {
      console.error("[PrimeSubscribers] Fetch error:", {
        message: error.message,
        status: error.response?.status,
        data: error.response?.data,
      });
    }

    // Enhanced error handling
    if (error.response?.status === 401) {
      throw new Error("Session expired – please sign in again.");
    } else if (error.response?.status === 403) {
      throw new Error(
        "Access denied. You do not have permission to view subscribers.",
      );
    } else if (error.response?.status === 404) {
      throw new Error(
        "Subscribers endpoint not found. Please contact support.",
      );
    } else if (error.response?.status >= 500) {
      throw new Error("Server error. Please try again later.");
    } else if (
      error.code === "NETWORK_ERROR" ||
      error.code === "ECONNABORTED"
    ) {
      throw new Error(
        "Network error. Please check your connection and try again.",
      );
    } else {
      throw new Error(
        error.response?.data?.message ||
          error.message ||
          "Failed to load subscribers",
      );
    }
  }
};

// Helper function to check if subscription is active
export const isSubscriptionActive = (subscriber: Subscriber): boolean => {
  const endDate = new Date(subscriber.end_date);
  const now = new Date();

  // Reset times to start of day for accurate comparison
  endDate.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);

  return endDate >= now;
};

// Helper function to format subscription dates
export const formatSubscriptionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

// Export the API instance for potential direct use
export { primeSubscribersApi };
