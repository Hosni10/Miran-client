import React, { useState } from "react";
import { FoodItem } from "../lib/api";
import { useSecondaryFoodMap } from "../hooks/useSecondaryFoodMap";
import { useUnitMap } from "../hooks/useUnitMap";
import { buildImageUrl } from "../utils/imageUrl";
import { FoodDetailModal } from "./FoodDetailModal";

interface FoodCardProps {
  item: FoodItem;
}

const FoodCard: React.FC<FoodCardProps> = React.memo(({ item }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const secMap = useSecondaryFoodMap();
  const unitMap = useUnitMap();

  const secMeta =
    typeof item.secondary_food === "number"
      ? secMap[item.secondary_food]
      : undefined;
  const secLabel = secMeta?.title ?? String(item.secondary_food ?? "—");

  const unitLabel =
    typeof item.unit === "number"
      ? (unitMap[item.unit] ?? String(item.unit))
      : String(item.unit);

  // Calculate macro percentages automatically
  const proteinPercentage =
    item.calories > 0 ? ((item.protein * 4) / item.calories) * 100 : 0;
  const carbPercentage =
    item.calories > 0 ? ((item.carbs * 4) / item.calories) * 100 : 0;
  const fatPercentage =
    item.calories > 0 ? ((item.fat * 9) / item.calories) * 100 : 0;

  return (
    <>
      <article
        onClick={() => setModalOpen(true)}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 hover:scale-[1.02] p-4 border border-gray-100 dark:border-gray-700 cursor-pointer"
      >
        {/* Food Image */}
        <div className="relative w-full h-32 mb-3 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700">
          <img
            className="w-full h-full object-cover"
            src={buildImageUrl(item.image)}
            alt={item.title}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.onerror = null;
              e.currentTarget.src = "/assets/placeholder_food.svg";
            }}
          />
        </div>

        {/* Food Info */}
        <div className="space-y-2">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-1">
              {item.title}
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-1 flex items-center">
              {secMeta?.icon && (
                <img
                  src={buildImageUrl(secMeta.icon)}
                  alt=""
                  className="inline-block h-3 w-3 mr-1 rounded object-cover"
                  onError={(e) => (e.currentTarget.style.display = "none")}
                />
              )}
              {secLabel}
            </p>
          </div>

          {/* Quantity and Unit */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>
              {item.quantity} {unitLabel}
            </span>
            <span className="font-medium text-indigo-600 dark:text-indigo-400">
              {item.calories} cal
            </span>
          </div>

          {/* Macros */}
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-green-600 dark:text-green-400">
                {item.protein}g
              </div>
              <div className="text-gray-500 dark:text-gray-400">Protein</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-blue-600 dark:text-blue-400">
                {item.carbs}g
              </div>
              <div className="text-gray-500 dark:text-gray-400">Carbs</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-orange-600 dark:text-orange-400">
                {item.fat}g
              </div>
              <div className="text-gray-500 dark:text-gray-400">Fat</div>
            </div>
          </div>

          {/* Macro Percentages */}
          <div className="flex space-x-1">
            <div
              className="h-1 bg-green-500 rounded-full"
              style={{ width: `${Math.min(proteinPercentage, 100)}%` }}
            />
            <div
              className="h-1 bg-blue-500 rounded-full"
              style={{ width: `${Math.min(carbPercentage, 100)}%` }}
            />
            <div
              className="h-1 bg-orange-500 rounded-full"
              style={{ width: `${Math.min(fatPercentage, 100)}%` }}
            />
          </div>
        </div>
      </article>

      <FoodDetailModal
        id={item.id}
        foodItem={item}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
});

FoodCard.displayName = "FoodCard";

export default FoodCard;
