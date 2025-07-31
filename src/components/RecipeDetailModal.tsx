import React, { useState } from "react";
import { Clock, Tag, Users, ChefHat, X, Edit3 } from "lucide-react";
import { useTranslation } from "react-i18next";
import Modal, { ModalPanel } from "./ui/Modal";
import type { RecipeShallow } from "../types/recipe";

interface RecipeDetailModalProps {
  recipe: RecipeShallow | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (recipe: RecipeShallow) => void;
}

export const RecipeDetailModal: React.FC<RecipeDetailModalProps> = ({
  recipe,
  open,
  onClose,
  onEdit,
}) => {
  const { t } = useTranslation();
  const [imageError, setImageError] = useState(false);

  if (!open || !recipe) return null;

  const handleImageError = () => {
    setImageError(true);
  };

  const formatTime = (minutes: number | null | undefined): string => {
    if (!minutes) return t("recipes.noTimeSpecified", "Time not specified");
    if (minutes < 60) {
      return t("recipes.minutesFormat", `${minutes} min`, { minutes });
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    if (remainingMinutes === 0) {
      return t("recipes.hoursFormat", `${hours}h`, { hours });
    }
    return t("recipes.hoursMinutesFormat", `${hours}h ${remainingMinutes}min`, {
      hours,
      minutes: remainingMinutes,
    });
  };

  const getMealTypeColor = (mealType: string | null | undefined): string => {
    if (!mealType)
      return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";

    switch (mealType.toLowerCase()) {
      case "breakfast":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
      case "lunch":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      case "dinner":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      case "snack":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
    }
  };

  const getMealTypeLabel = (mealType: string | null | undefined): string => {
    if (!mealType) return "";

    switch (mealType.toLowerCase()) {
      case "breakfast":
        return t("recipes.breakfast", "Breakfast");
      case "lunch":
        return t("recipes.lunch", "Lunch");
      case "dinner":
        return t("recipes.dinner", "Dinner");
      case "snack":
        return t("recipes.snack", "Snack");
      default:
        return mealType;
    }
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalPanel className="w-full max-w-4xl max-h-[90vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="relative">
          {/* Recipe Image */}
          <div className="relative h-64 md:h-80 bg-gray-100 dark:bg-gray-700">
            {!imageError && recipe.thumbnail ? (
              <img
                src={recipe.thumbnail}
                alt={recipe.title}
                className="w-full h-full object-cover"
                onError={handleImageError}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ChefHat className="w-24 h-24 text-gray-400" />
              </div>
            )}

            {/* Overlay Info */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-full text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Bottom Info */}
            <div className="absolute bottom-4 left-4 right-4">
              <div className="flex items-center justify-between">
                <div className="flex space-x-2">
                  {recipe.meal_type && (
                    <span
                      className={`
                      inline-flex items-center px-3 py-1 rounded-full text-sm font-medium
                      ${getMealTypeColor(recipe.meal_type)}
                    `}
                    >
                      <Tag className="w-4 h-4 mr-1" />
                      {getMealTypeLabel(recipe.meal_type)}
                    </span>
                  )}
                </div>

                {recipe.time_to_make && (
                  <div className="flex items-center bg-black/50 backdrop-blur-sm text-white px-3 py-1 rounded-full text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {formatTime(recipe.time_to_make)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {recipe.title}
            </h1>

            {/* Recipe Details Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Time & Meal Type */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Clock className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  {t("recipes.recipeDetails", "Recipe Details")}
                </h3>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {t("recipes.timeToMake", "Time to make")}
                    </span>
                    <span className="text-sm text-gray-900 dark:text-white font-semibold">
                      {formatTime(recipe.time_to_make)}
                    </span>
                  </div>

                  {recipe.meal_type && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        {t("recipes.mealType", "Meal type")}
                      </span>
                      <span
                        className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${getMealTypeColor(recipe.meal_type)}
                      `}
                      >
                        {getMealTypeLabel(recipe.meal_type)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                  {t("recipes.additionalInfo", "Additional Information")}
                </h3>

                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">
                    {t(
                      "recipes.moreDetailsComingSoon",
                      "More recipe details will be available soon, including ingredients, instructions, and nutritional information.",
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Instructions Placeholder */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <ChefHat className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
                {t("recipes.instructions", "Instructions")}
              </h3>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-6 text-center">
                <ChefHat className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 dark:text-gray-400">
                  {t(
                    "recipes.instructionsPlaceholder",
                    "Detailed cooking instructions will be displayed here when available from the API.",
                  )}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {t("recipes.recipeId", "Recipe ID")}: {recipe.id}
            </div>

            {onEdit && (
              <button
                onClick={() => onEdit(recipe)}
                className="
                  inline-flex items-center px-4 py-2 
                  border border-gray-300 dark:border-gray-600 
                  rounded-lg text-sm font-medium 
                  text-gray-700 dark:text-gray-300 
                  hover:bg-gray-50 dark:hover:bg-gray-700 
                  transition-colors
                "
              >
                <Edit3 className="w-4 h-4 mr-2" />
                {t("common.edit", "Edit")}
              </button>
            )}
          </div>
        </div>
      </ModalPanel>
    </Modal>
  );
};
