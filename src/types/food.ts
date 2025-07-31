import { FoodItem } from "../lib/api";

/**
 * Extended FoodItem interface with additional fields from FoodSerializer v1
 */
export interface FoodDetail
  extends Omit<
    FoodItem,
    "protein_percentage" | "carb_percentage" | "fat_percentage"
  > {
  /* Added from FoodSerializer v1 */
  description?: string;
  description_ar?: string; // Arabic description
  title_ar?: string; // Arabic title
  is_product?: boolean;
  code?: string | null;
  private?: boolean;
  private_code?: string | null;
  private_nutritional_facts?: string | null; // URL
  is_ai_generated?: boolean | null;
  creator?: number | null;
}
