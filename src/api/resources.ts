import { FoodItem, PaginatedFood, api } from "../lib/api";
import { unwrap } from "./helpers";
import { getMediaUrl } from "../config/api";

// Helper function to get image URL
export const getFoodImageUrl = (image: string | null): string => {
  if (image) {
    return getMediaUrl(image);
  }
  // Return placeholder image path - you can replace this with actual placeholder
  return "/assets/placeholder_food.png";
};

// Generic helper for cursor-based fetch using hardened Axios
export const fetchFoodList = async (url?: string): Promise<PaginatedFood> => {
  const endpoint = url || "/v1/resources/food_list?limit=50";

  console.log("🔧 fetchFoodList called with endpoint:", endpoint);

  const data = await unwrap(api.get(endpoint));

  console.log("🔧 fetchFoodList success data:", data);

  return data as PaginatedFood;
};
