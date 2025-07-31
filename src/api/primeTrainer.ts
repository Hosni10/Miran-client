import axios from "axios";
import { getTokenSync } from "../utils/authStorage";
import { mockPaginatedSubscribers } from "../lib/mockData";

// DEBUG flag – enable in devtools with: window.__MIRAN_DEBUG = true
declare global {
  interface Window {
    __MIRAN_DEBUG?: boolean;
  }
}

// Create a direct Axios instance for Prime Trainer API to bypass proxy issues
const primeTrainerApi = axios.create({
  baseURL: "https://testing.miranapp.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor to include authorization token
primeTrainerApi.interceptors.request.use(
  (config) => {
    const token = getTokenSync();
    if (token) {
      config.headers.Authorization = `Token ${token.trim()}`;
    }

    if (window.__MIRAN_DEBUG) {
      console.info("[PrimeTrainer] requesting:", {
        url: config.url,
        baseURL: config.baseURL,
        fullUrl: `${config.baseURL}${config.url}`,
        authHeader: config.headers.Authorization,
        hasToken: !!token,
      });
    }

    return config;
  },
  (error) => {
    console.error("🔧 Prime Trainer API Request Error:", error);
    return Promise.reject(error);
  },
);

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
  plan_subscription: any; // This field is in the API response but appears to be null
}

export interface PaginatedSubscribers {
  count: number;
  next: string | null;
  previous: string | null;
  result: Subscriber[];
}

// ——— CONSTANT ———
const PRIME_SUBSCRIBERS_ENDPOINT =
  "/miran_prime/prime_trainer_subscribers/for_prime_trainer"; // Try without trailing slash for 404 debugging

// Paginated fetch function for Prime Trainer subscribers
export const fetchPrimeSubscribers = async (
  url?: string,
): Promise<PaginatedSubscribers> => {
  // --- PRODUCTION MODE: Actual API call ---
  const finalUrl = url ?? PRIME_SUBSCRIBERS_ENDPOINT;

  if (window.__MIRAN_DEBUG) {
    console.info(
      "[PrimeTrainer] fetchPrimeSubscribers called with endpoint:",
      finalUrl,
    );
  }

  try {
    const response = await primeTrainerApi.get<PaginatedSubscribers>(finalUrl);

    if (window.__MIRAN_DEBUG) {
      console.info("[PrimeTrainer] ✅ SUCCESS - Response received:", {
        status: response.status,
        dataCount: response.data.result?.length,
        totalCount: response.data.count,
        hasNext: !!response.data.next,
        hasPrevious: !!response.data.previous,
        rawResponse: response.data,
        firstSubscriber: response.data.result?.[0],
      });
    }

    return response.data;
  } catch (error: any) {
    if (window.__MIRAN_DEBUG) {
      console.error("[PrimeTrainer] ❌ ERROR:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        url: error.config?.url,
        fullUrl: `${error.config?.baseURL}${error.config?.url}`,
        data: error.response?.data,
      });
    }
    throw error;
  }
};

// Helper function to check if a subscription is active
export const isSubscriptionActive = (subscriber: Subscriber): boolean => {
  const today = new Date();
  const endDate = new Date(subscriber.end_date);
  return today <= endDate;
};

// Helper function to format date in DD MMM YYYY format
export const formatSubscriptionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};
