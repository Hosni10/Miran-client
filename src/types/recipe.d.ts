export type SelectedKey = "first" | "second" | "third";

export interface Unit {
  id: number;
  title: string;
  title_ar: string;
}

export interface IngredientOption {
  id: number;
  title: string;
  title_ar: string;
  image: string | null;
  unit: Unit;
  quantity: number;
  calories: number;
  fat: number;
  protein: number;
  carbs: number;
}

export interface IngredientEntry {
  id: number;
  first_ingredient: IngredientOption;
  first_unit_size: number;
  second_ingredient: IngredientOption | null;
  second_unit_size: number | null;
  third_ingredient: IngredientOption | null;
  third_unit_size: number | null;
  picked_ingredient: "first" | "second" | "third";
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface RecipeShallow {
  id: number;
  title: string;
  thumbnail: string | null;
  time_to_make: number;
  meal_type: string;
}

export interface RecipeFull extends RecipeShallow {
  video: string | null;
  tags: string[];
  about_meal: string;
  preparation: string;
  ingredients: IngredientEntry[];
  total_calories: number;
  total_protein: number;
  total_carbs: number;
  total_fat: number;
}

export interface RecipeListResponse {
  count: number;
  next: string | null;
  previous: string | null;
  result: RecipeShallow[];
}

export interface RecipeState {
  items: RecipeShallow[];
  next: string | null;
  previous: string | null;
  loading: boolean;
  error: string | null;
  hasMore: boolean;
}

export interface RecipeDetailsState {
  data: RecipeFull | null;
  loading: boolean;
  error: string | null;
}
