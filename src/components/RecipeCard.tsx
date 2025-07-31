import React from "react";
import { Clock, Play } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { RecipeShallow } from "../types/recipe";

interface RecipeCardProps {
  recipe: RecipeShallow;
  onClick: (recipe: RecipeShallow) => void;
}

const getMealTypeColor = (mealType: string): string => {
  switch (mealType.toLowerCase()) {
    case "breakfast":
      return "bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400";
    case "lunch":
      return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400";
    case "dinner":
      return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400";
    case "snack":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400";
  }
};

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onClick }) => {
  const { t } = useTranslation();

  const handleClick = () => {
    onClick(recipe);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onClick(recipe);
    }
  };

  return (
    <div
      className="group relative bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-gray-300 dark:hover:border-gray-600"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="button"
      aria-label={t("Open recipe details for {{title}}", {
        title: recipe.title,
      })}
    >
      {/* Thumbnail Container */}
      <div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-gray-700">
        {recipe.thumbnail ? (
          <img
            src={recipe.thumbnail}
            alt={recipe.title}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
            <div className="text-6xl">🍽️</div>
          </div>
        )}

        {/* Overlay gradient for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Time badge */}
        <div className="absolute top-3 right-3 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 backdrop-blur-sm">
          <Clock className="w-3 h-3" />
          <span>
            {recipe.time_to_make} {t("min")}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3
          className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200"
          dir="auto"
        >
          {recipe.title}
        </h3>

        {/* Meal type badge */}
        <div className="flex items-center justify-between">
          <span
            className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getMealTypeColor(
              recipe.meal_type,
            )}`}
          >
            {t(recipe.meal_type)}
          </span>

          {/* Hover arrow indicator */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Play className="w-4 h-4 text-gray-400 dark:text-gray-500 rotate-0" />
          </div>
        </div>
      </div>

      {/* Focus ring */}
      <div className="absolute inset-0 rounded-xl ring-2 ring-transparent group-focus:ring-blue-500 dark:group-focus:ring-blue-400 pointer-events-none" />
    </div>
  );
};
