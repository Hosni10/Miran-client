import React, { useState, useEffect, useMemo } from "react";
import { X, Clock, Play, AlertCircle, RotateCcw, Tag } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useRecipeDetails } from "../hooks/useRecipeDetails";
import { IngredientRow } from "./IngredientRow";
import type {
  RecipeShallow,
  IngredientEntry,
  IngredientOption,
  SelectedKey,
} from "../types/recipe";

interface RecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialRecipe?: RecipeShallow;
}

// Calculate nutrition values based on ingredient option and unit size
function calculateNutritionForIngredient(
  option: IngredientOption,
  unitSize: number,
): {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  const ratio = unitSize / option.quantity; // option.quantity = base grams in DB
  return {
    calories: Math.round(option.calories * ratio),
    protein: Math.round(option.protein * ratio),
    carbs: Math.round(option.carbs * ratio),
    fat: Math.round(option.fat * ratio),
  };
}

const NutritionChip: React.FC<{
  label: string;
  value: number;
  unit: string;
  color: string;
}> = ({ label, value, unit, color }) => (
  <div className={`flex flex-col items-center p-3 rounded-lg ${color}`}>
    <div className="text-lg font-bold">
      {value}
      {unit}
    </div>
    <div className="text-xs opacity-75">{label}</div>
  </div>
);

const Skeleton: React.FC<{ className?: string }> = ({ className = "" }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded ${className}`}
  />
);

export const RecipeModal: React.FC<RecipeModalProps> = ({
  isOpen,
  onClose,
  initialRecipe,
}) => {
  const { t } = useTranslation();
  const [ingredientEntries, setIngredientEntries] = useState<IngredientEntry[]>(
    [],
  );

  const {
    data: recipe,
    loading,
    error,
    retry,
  } = useRecipeDetails(isOpen ? initialRecipe?.id || null : null);

  // Update local ingredient state when recipe changes and calculate initial totals
  useEffect(() => {
    if (recipe?.ingredients) {
      const entriesWithCalculatedTotals = recipe.ingredients.map((entry) => {
        // Calculate nutrition values based on the currently picked ingredient
        let currentIngredient: IngredientOption | null = null;
        let currentUnitSize = 0;

        switch (entry.picked_ingredient) {
          case "first":
            currentIngredient = entry.first_ingredient;
            currentUnitSize = entry.first_unit_size;
            break;
          case "second":
            currentIngredient = entry.second_ingredient;
            currentUnitSize = entry.second_unit_size || 0;
            break;
          case "third":
            currentIngredient = entry.third_ingredient;
            currentUnitSize = entry.third_unit_size || 0;
            break;
          default:
            currentIngredient = entry.first_ingredient;
            currentUnitSize = entry.first_unit_size;
        }

        if (currentIngredient) {
          const nutrition = calculateNutritionForIngredient(
            currentIngredient,
            currentUnitSize,
          );
          return {
            ...entry,
            total_calories: nutrition.calories,
            total_protein: nutrition.protein,
            total_carbs: nutrition.carbs,
            total_fat: nutrition.fat,
          };
        }

        return entry;
      });

      setIngredientEntries(entriesWithCalculatedTotals);
    }
  }, [recipe]);

  // Handle ingredient alternative selection
  const handleIngredientChange = (entryId: number, picked: SelectedKey) => {
    setIngredientEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;

        // Get the new ingredient and unit size
        let newIngredient: IngredientOption | null = null;
        let newUnitSize = 0;

        switch (picked) {
          case "first":
            newIngredient = entry.first_ingredient;
            newUnitSize = entry.first_unit_size;
            break;
          case "second":
            newIngredient = entry.second_ingredient;
            newUnitSize = entry.second_unit_size || 0;
            break;
          case "third":
            newIngredient = entry.third_ingredient;
            newUnitSize = entry.third_unit_size || 0;
            break;
          default:
            newIngredient = entry.first_ingredient;
            newUnitSize = entry.first_unit_size;
        }

        // Calculate new nutrition values
        if (newIngredient) {
          const nutrition = calculateNutritionForIngredient(
            newIngredient,
            newUnitSize,
          );
          return {
            ...entry,
            picked_ingredient: picked,
            total_calories: nutrition.calories,
            total_protein: nutrition.protein,
            total_carbs: nutrition.carbs,
            total_fat: nutrition.fat,
          };
        }

        return {
          ...entry,
          picked_ingredient: picked,
        };
      }),
    );
  };

  // Compute global nutrition totals from updated entry totals
  const nutritionTotals = useMemo(() => {
    return ingredientEntries.reduce(
      (acc, entry) => {
        acc.calories += entry.total_calories;
        acc.protein += entry.total_protein;
        acc.carbs += entry.total_carbs;
        acc.fat += entry.total_fat;
        return acc;
      },
      { calories: 0, protein: 0, carbs: 0, fat: 0 },
    );
  }, [ingredientEntries]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-4xl max-h-[90vh] bg-white dark:bg-slate-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800">
          <h2
            className="text-xl font-bold text-gray-900 dark:text-white"
            dir="auto"
          >
            {recipe?.title || initialRecipe?.title || t("Recipe Details")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label={t("Close modal")}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[70vh] overflow-y-auto">
          {loading && (
            <div className="p-6 space-y-6">
              {/* Hero Skeleton */}
              <div className="space-y-4">
                <Skeleton className="w-full h-64" />
                <div className="flex gap-4">
                  <Skeleton className="h-8 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>

              {/* Content Skeletons */}
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-6 w-24" />
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-16 w-full" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6 text-center">
              <div className="flex flex-col items-center gap-4">
                <AlertCircle className="w-12 h-12 text-red-500" />
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    {t("Failed to load recipe")}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    {error}
                  </p>
                  <button
                    onClick={retry}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    {t("Retry")}
                  </button>
                </div>
              </div>
            </div>
          )}

          {recipe && (
            <div className="p-6 space-y-6">
              {/* Hero Section */}
              <div className="relative">
                <div className="relative w-full h-64 rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700">
                  {recipe.thumbnail ? (
                    <img
                      src={recipe.thumbnail}
                      alt={recipe.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-6xl">
                      🍽️
                    </div>
                  )}

                  {/* Video overlay if video exists */}
                  {recipe.video && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                      <div className="flex items-center justify-center w-16 h-16 bg-white/90 rounded-full">
                        <Play className="w-6 h-6 text-gray-800 ml-1" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Recipe Details */}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 rounded-full text-sm">
                    <Clock className="w-4 h-4" />
                    <span>
                      {recipe.time_to_make} {t("min")}
                    </span>
                  </div>

                  <div className="px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 rounded-full text-sm">
                    {t(recipe.meal_type)}
                  </div>

                  {recipe.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 rounded text-xs"
                    >
                      <Tag className="w-3 h-3" />
                      <span>{tag}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* About Meal */}
              {recipe.about_meal && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t("About this meal")}
                  </h3>
                  <p
                    className="text-gray-700 dark:text-gray-300 leading-relaxed"
                    dir="auto"
                  >
                    {recipe.about_meal}
                  </p>
                </div>
              )}

              {/* Ingredients */}
              {ingredientEntries.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t("Ingredients")}
                  </h3>
                  <div className="space-y-3">
                    {ingredientEntries.map((entry) => (
                      <IngredientRow
                        key={entry.id}
                        entry={entry}
                        onPickedChange={handleIngredientChange}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Preparation Steps */}
              {recipe.preparation && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                    {t("Preparation")}
                  </h3>
                  <div
                    className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line"
                    dir="auto"
                  >
                    {recipe.preparation}
                  </div>
                </div>
              )}

              {/* Nutrition Totals - Using calculated totals */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  {t("Nutrition Information")}
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <NutritionChip
                    label={t("Calories")}
                    value={nutritionTotals.calories}
                    unit=""
                    color="bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400"
                  />
                  <NutritionChip
                    label={t("Protein")}
                    value={nutritionTotals.protein}
                    unit="g"
                    color="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
                  />
                  <NutritionChip
                    label={t("Carbs")}
                    value={nutritionTotals.carbs}
                    unit="g"
                    color="bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400"
                  />
                  <NutritionChip
                    label={t("Fat")}
                    value={nutritionTotals.fat}
                    unit="g"
                    color="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
