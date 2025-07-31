import { FoodDetail } from "../types/food";
import { getApiUrl, getAuthHeaders } from "../config/api";
import { FoodItem, api } from "../lib/api";
import { unwrap } from "./helpers";
import {
  FOOD_SEARCH_ENDPOINT,
  SEARCH_PARAM_KEY,
  PAGE_PARAM_KEY,
  LIMIT_PARAM_KEY,
  DEFAULT_LIMIT,
} from "../constants/endpoints";

export interface Paginated<T> {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: T[];
}

export interface FoodEditPayload {
  title: string;
  title_ar?: string;
  description?: string;
  description_ar?: string;
  unit: number;
  quantity: number;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
  secondary_food?: number;
  is_product: boolean;
  code?: string;
  private: boolean;
  private_code?: string;
  is_ai_generated: boolean;
  image?: File | string;
}

/**
 * Update a food item
 * @param id - Food item ID
 * @param payload - Food update data
 * @returns Promise<FoodDetail>
 */
export const updateFood = async (
  id: number,
  payload: FoodEditPayload,
): Promise<FoodDetail> => {
  console.log("🔧 updateFood called:", { id, payload });

  const formData = new FormData();

  // Add all fields to FormData
  Object.entries(payload).forEach(([key, value]) => {
    if (key === "image") {
      if (value instanceof File) {
        formData.append("image", value);
      }
    } else if (value !== undefined && value !== null) {
      if (typeof value === "boolean") {
        formData.append(key, value.toString());
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Use the correct endpoint format for meal updates
  const endpoint = `/v1/resources/meal/${id}/update`;

  // Use the proxy baseURL consistently for all environments
  const requestBaseURL = api.defaults.baseURL; // Always use configured proxy

  console.log("🔧 updateFood PUT request details:", {
    endpoint,
    defaultBaseURL: api.defaults.baseURL,
    requestBaseURL,
    fullURL: `${requestBaseURL}${endpoint}`,
    formDataKeys: Array.from(formData.keys()),
    hostname: window.location.hostname,
    reason: "Using configured proxy for consistent API handling",
  });

  const response = await api.put(endpoint, formData, {
    // Let axios automatically set the Content-Type with boundary for multipart/form-data
    baseURL: requestBaseURL,
  });

  console.log("🔧 updateFood success:", response.data);
  return response.data as FoodDetail;
};

/**
 * Search foods with backend API using hardened Axios instance
 * @param query - Search query string
 * @param page - Page number (1-based)
 * @param limit - Number of items per page
 * @returns Promise<Paginated<FoodItem>>
 */
export const searchFoods = async (
  query: string,
  page = 1,
  limit = DEFAULT_LIMIT,
): Promise<Paginated<FoodItem>> => {
  // Convert page number to offset (page 1 = offset 0, page 2 = offset 50, etc.)
  const offset = (page - 1) * limit;

  const endpoint =
    `${FOOD_SEARCH_ENDPOINT}` +
    `?${SEARCH_PARAM_KEY}=${encodeURIComponent(query)}` +
    `&${PAGE_PARAM_KEY}=${offset}` +
    `&${LIMIT_PARAM_KEY}=${limit}`;

  console.log("🔧 searchFoods called:", {
    query,
    page,
    offset,
    limit,
    endpoint,
  });

  const data = (await unwrap(api.get(endpoint))) as any;

  console.log("🔧 searchFoods raw response:", data);

  // Handle different possible response structures
  let normalizedData: Paginated<FoodItem>;

  if (data.results) {
    // Standard paginated format
    normalizedData = data;
  } else if (data.result) {
    // Alternative format with 'result' instead of 'results'
    normalizedData = {
      count: data.count || data.totalCount || 0,
      next: data.next,
      previous: data.previous,
      results: data.result,
    };
  } else if (Array.isArray(data)) {
    // Direct array response
    normalizedData = {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    };
  } else {
    // Unknown format, log and return empty
    console.error("🔧 Unknown API response format:", data);
    normalizedData = {
      count: 0,
      next: null,
      previous: null,
      results: [],
    };
  }

  console.log("🔧 searchFoods normalized:", {
    resultCount: normalizedData.results?.length,
    totalCount: normalizedData.count,
    structure: normalizedData,
  });

  return normalizedData;
};

/**
 * Fetch detailed food information by ID
 * @param id - Food item ID
 * @returns Promise<FoodDetail>
 */
export const fetchFoodDetail = async (id: number): Promise<FoodDetail> => {
  console.log("🔧 fetchFoodDetail called with ID:", id);

  // First, try the meal detail endpoint which should have complete information including descriptions
  const mealDetailEndpoints = [
    `/v1/resources/meal/${id}/`,
    `/v1/resources/meal/${id}/detail/`,
    `/v1/resources/food/${id}/detail/`,
    `/v1/resources/food/${id}/`,
  ];

  for (const endpoint of mealDetailEndpoints) {
    try {
      console.log("🔧 Trying meal detail endpoint:", endpoint);

      const data = await unwrap(api.get(endpoint));
      console.log("🔧 fetchFoodDetail success from meal endpoint:", data);

      // This should have complete food details including description fields
      return data as FoodDetail;
    } catch (error: any) {
      console.log(`🔧 fetchFoodDetail error with endpoint ${endpoint}:`, error);

      // If it's a 404, try the next endpoint
      if (error?.response?.status === 404) {
        console.log(`🔧 Endpoint ${endpoint} not found, trying next...`);
        continue;
      }

      // For other errors (401, 500, etc.), continue to try other endpoints
      console.log(
        `🔧 Endpoint ${endpoint} failed with status ${error?.response?.status}, trying next...`,
      );
      continue;
    }
  }

  // Fallback: try to get basic data from food list and merge with any available detail
  console.log(
    "🔧 Meal detail endpoints failed, trying food list as fallback...",
  );

  try {
    const data = await unwrap(api.get("/v1/resources/food_list?limit=1000"));
    console.log("🔧 Food list data:", data);

    const foodListData = data as any;

    // Find the specific food item by ID
    const foodItem = foodListData.result?.find((item: any) => item.id === id);

    if (foodItem) {
      console.log("🔧 Found food item in list:", foodItem);

      // Convert FoodItem to FoodDetail and try to get additional details
      const foodDetail: FoodDetail = {
        ...foodItem,
        description: foodItem.description || "", // Include description if available
        description_ar: foodItem.description_ar || "", // Include Arabic description if available
        title_ar: foodItem.title_ar || "", // Include Arabic title if available
        is_product: foodItem.is_product || false,
        code: foodItem.code || null,
        private: foodItem.private || false,
        private_code: foodItem.private_code || null,
        private_nutritional_facts: foodItem.private_nutritional_facts || null,
        is_ai_generated: foodItem.is_ai_generated || false,
        creator: foodItem.creator || null,
        carb_percentage: foodItem.carb_percentage || 0,
        fat_percentage: foodItem.fat_percentage || 0,
        protein_percentage: foodItem.protein_percentage || 0,
      };

      return foodDetail;
    }

    console.log(
      "🔧 Food item not found in food list, trying legacy endpoints...",
    );
  } catch (error) {
    console.log("🔧 Food list failed, trying legacy endpoints...", error);
  }

  // Try other legacy endpoints as last resort
  const legacyEndpoints = [
    `/v1/resources/food_detail/${id}/`,
    `/v1/resources/food?id=${id}`,
  ];

  for (const endpoint of legacyEndpoints) {
    try {
      console.log("🔧 Trying legacy endpoint:", endpoint);

      const data = await unwrap(api.get(endpoint));
      console.log("🔧 fetchFoodDetail success from legacy endpoint:", data);
      return data as FoodDetail;
    } catch (error: any) {
      console.log(
        `🔧 fetchFoodDetail error with legacy endpoint ${endpoint}:`,
        error,
      );
      continue;
    }
  }

  // If all else fails, create a basic food detail with the ID
  console.log("🔧 All endpoints failed, creating basic food detail...");

  const basicFoodDetail: FoodDetail = {
    id: id,
    title: `Food Item ${id}`,
    secondary_food: "Details not available",
    quantity: 0,
    unit: "g",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    image: null,
    description: "Food details are not available at this time.",
    description_ar: "",
    title_ar: "",
    is_product: false,
    code: null,
    private: false,
    private_code: null,
    private_nutritional_facts: null,
    is_ai_generated: false,
    creator: null,
  };

  return basicFoodDetail;
};
