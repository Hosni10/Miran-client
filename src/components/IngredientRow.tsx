import React, { useState, useMemo } from "react";
import { ChevronDown, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import type {
  IngredientEntry,
  IngredientOption,
  SelectedKey,
} from "../types/recipe";

interface IngredientRowProps {
  entry: IngredientEntry;
  onPickedChange?: (entryId: number, picked: SelectedKey) => void;
}

export const IngredientRow: React.FC<IngredientRowProps> = ({
  entry,
  onPickedChange,
}) => {
  const { t } = useTranslation();
  const [showAlternatives, setShowAlternatives] = useState(false);

  // Get the currently picked ingredient
  const getCurrentIngredient = (): IngredientOption | null => {
    switch (entry.picked_ingredient) {
      case "first":
        return entry.first_ingredient;
      case "second":
        return entry.second_ingredient;
      case "third":
        return entry.third_ingredient;
      default:
        return entry.first_ingredient;
    }
  };

  // Get the unit size for the currently picked ingredient
  const getCurrentUnitSize = (): number => {
    switch (entry.picked_ingredient) {
      case "first":
        return entry.first_unit_size;
      case "second":
        return entry.second_unit_size || 0;
      case "third":
        return entry.third_unit_size || 0;
      default:
        return entry.first_unit_size;
    }
  };

  // Get all available alternatives (excluding null ones)
  const getAlternatives = (): Array<{
    key: SelectedKey;
    ingredient: IngredientOption;
    unitSize: number;
  }> => {
    const alternatives = [];

    alternatives.push({
      key: "first" as const,
      ingredient: entry.first_ingredient,
      unitSize: entry.first_unit_size,
    });

    if (entry.second_ingredient) {
      alternatives.push({
        key: "second" as const,
        ingredient: entry.second_ingredient,
        unitSize: entry.second_unit_size || 0,
      });
    }

    if (entry.third_ingredient) {
      alternatives.push({
        key: "third" as const,
        ingredient: entry.third_ingredient,
        unitSize: entry.third_unit_size || 0,
      });
    }

    return alternatives;
  };

  const currentIngredient = getCurrentIngredient();
  const currentUnitSize = getCurrentUnitSize();
  const alternatives = getAlternatives();
  const hasAlternatives = alternatives.length > 1;

  // Get current macros from the API pre-calculated values
  const currentMacros = useMemo(() => {
    // Use the static API values that are pre-calculated for this ingredient entry
    return {
      calories: entry.total_calories,
      protein: entry.total_protein,
      carbs: entry.total_carbs,
      fat: entry.total_fat,
    };
  }, [
    entry.total_calories,
    entry.total_protein,
    entry.total_carbs,
    entry.total_fat,
  ]);

  const handleAlternativeSelect = (picked: SelectedKey) => {
    onPickedChange?.(entry.id, picked);
    setShowAlternatives(false);
  };

  if (!currentIngredient) {
    return null;
  }

  return (
    <div className="relative">
      <div className="flex items-center justify-between py-3 px-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
        {/* Ingredient Info */}
        <div className="flex items-center gap-3 flex-1">
          {/* Ingredient Image */}
          <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
            {currentIngredient.image ? (
              <img
                src={currentIngredient.image}
                alt={currentIngredient.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">
                🥘
              </div>
            )}
          </div>

          {/* Ingredient Details */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <div>
                <h4
                  className="font-medium text-gray-900 dark:text-white truncate"
                  dir="auto"
                >
                  {currentIngredient.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {currentUnitSize} {currentIngredient.unit.title}
                </p>
              </div>

              {/* Alternatives Dropdown Button */}
              {hasAlternatives && (
                <button
                  onClick={() => setShowAlternatives(!showAlternatives)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  aria-label={t("Show alternatives for {{ingredient}}", {
                    ingredient: currentIngredient.title,
                  })}
                >
                  {alternatives.length} {t("options")}
                  <ChevronDown
                    className={`w-3 h-3 transition-transform ${showAlternatives ? "rotate-180" : ""}`}
                  />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Nutrition Info - Using static API values */}
        <div className="flex items-center gap-4 text-xs">
          <div className="text-center">
            <div className="text-rose-600 dark:text-rose-400 font-medium">
              {currentMacros.calories}
            </div>
            <div className="text-gray-500 dark:text-gray-400">{t("Cal")}</div>
          </div>
          <div className="text-center">
            <div className="text-purple-600 dark:text-purple-400 font-medium">
              {currentMacros.protein}g
            </div>
            <div className="text-gray-500 dark:text-gray-400">{t("P")}</div>
          </div>
          <div className="text-center">
            <div className="text-amber-600 dark:text-amber-400 font-medium">
              {currentMacros.carbs}g
            </div>
            <div className="text-gray-500 dark:text-gray-400">{t("C")}</div>
          </div>
          <div className="text-center">
            <div className="text-emerald-600 dark:text-emerald-400 font-medium">
              {currentMacros.fat}g
            </div>
            <div className="text-gray-500 dark:text-gray-400">{t("F")}</div>
          </div>
        </div>
      </div>

      {/* Alternatives Dropdown */}
      {showAlternatives && hasAlternatives && (
        <div className="absolute z-10 mt-1 left-0 right-0 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
          {alternatives.map((alt) => (
            <button
              key={alt.key}
              onClick={() => handleAlternativeSelect(alt.key)}
              className={`w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors flex items-center justify-between ${
                entry.picked_ingredient === alt.key
                  ? "bg-blue-50 dark:bg-blue-900/20 border-l-2 border-blue-500"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                  {alt.ingredient.image ? (
                    <img
                      src={alt.ingredient.image}
                      alt={alt.ingredient.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-sm">
                      🥘
                    </div>
                  )}
                </div>
                <div>
                  <div
                    className="font-medium text-gray-900 dark:text-white"
                    dir="auto"
                  >
                    {alt.ingredient.title}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {alt.unitSize} {alt.ingredient.unit.title}
                  </div>
                </div>
              </div>

              {entry.picked_ingredient === alt.key && (
                <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Backdrop for closing dropdown */}
      {showAlternatives && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowAlternatives(false)}
        />
      )}
    </div>
  );
};
