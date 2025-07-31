import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFoodDetail } from "../api/foods";
import { buildImageUrl } from "../utils/imageUrl";
import { useAuth } from "../contexts/AuthContext";
import Modal, { ModalPanel } from "./ui/Modal";
import { StatusBadge } from "./ui/StatusBadge";
import { FoodDetail } from "../types/food";
import { FoodItem } from "../lib/api";
import { useSecondaryFoodMap } from "../hooks/useSecondaryFoodMap";
import { useUnitMap } from "../hooks/useUnitMap";
import { EditFoodModal } from "./EditFoodModal";

interface FoodDetailModalProps {
  id: number;
  foodItem?: FoodItem;
  open: boolean;
  onClose: () => void;
}

export const FoodDetailModal: React.FC<FoodDetailModalProps> = ({
  id,
  foodItem,
  open,
  onClose,
}) => {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [showEditModal, setShowEditModal] = useState(false);

  const secMap = useSecondaryFoodMap();
  const unitMap = useUnitMap();

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["food-detail", id],
    queryFn: () => fetchFoodDetail(id),
    enabled: open && !foodItem, // Only fetch if we don't have foodItem data
  });

  // Use foodItem if available, otherwise use fetched data
  const foodData = foodItem
    ? ({
        ...foodItem,
        description: undefined,
        is_product: undefined,
        code: undefined,
        private: undefined,
        private_code: undefined,
        private_nutritional_facts: undefined,
        is_ai_generated: undefined,
        creator: undefined,
      } as FoodDetail)
    : data;

  // Get mapped labels
  const secMeta =
    foodData && typeof foodData.secondary_food === "number"
      ? secMap[foodData.secondary_food]
      : undefined;
  const secLabel = secMeta?.title ?? String(foodData?.secondary_food ?? "—");
  const unitLabel =
    foodData && typeof foodData.unit === "number"
      ? (unitMap[foodData.unit] ?? foodData.unit)
      : String(foodData?.unit || "");

  if (!open) return null;

  // Calculate macro percentages for progress bars
  const totalMacros = foodData
    ? foodData.protein + foodData.carbs + foodData.fat
    : 0;
  const proteinPercentage =
    foodData && totalMacros > 0
      ? ((foodData.protein * 4) / (foodData.calories || 1)) * 100
      : 0;
  const carbPercentage =
    foodData && totalMacros > 0
      ? ((foodData.carbs * 4) / (foodData.calories || 1)) * 100
      : 0;
  const fatPercentage =
    foodData && totalMacros > 0
      ? ((foodData.fat * 9) / (foodData.calories || 1)) * 100
      : 0;

  // Calculate nutritional density scores
  const proteinDensity = foodData
    ? (foodData.protein / foodData.calories) * 100
    : 0;
  const caloriesPerGram = foodData ? foodData.calories / foodData.quantity : 0;

  return (
    <>
      <Modal open={open} onClose={onClose}>
        <ModalPanel className="w-full max-w-4xl max-h-[95vh] flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-96">
              <div className="flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                <p className="text-gray-600 dark:text-gray-400 font-medium">
                  Loading food details...
                </p>
              </div>
            </div>
          ) : isError ? (
            <div className="flex items-center justify-center h-96">
              <div className="text-center">
                <div className="text-red-500 text-6xl mb-4">⚠️</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Failed to load details
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Please try again later
                </p>
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          ) : foodData ? (
            <>
              {/* Header with Image and Close Button */}
              <div className="relative h-48 sm:h-64 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <img
                  src={buildImageUrl(foodData.image)}
                  alt={foodData.title}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/assets/placeholder_food.png";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"></div>

                {/* Floating Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-all duration-200"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Title and Badges Overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">
                    {foodData.title}
                  </h2>

                  <p className="text-white/90 text-sm flex items-center gap-2">
                    {secMeta?.icon && (
                      <img
                        src={buildImageUrl(secMeta.icon)}
                        alt=""
                        className="inline-block h-4 w-4 rounded object-cover"
                        onError={(e) =>
                          (e.currentTarget.style.display = "none")
                        }
                      />
                    )}
                    {secLabel}
                    {/* Status badges inline after secondary food label */}
                    <span className="text-white/60">·</span>
                    <StatusBadge
                      label="Product"
                      active={!!foodData.is_product}
                    />
                    <span className="text-white/60">·</span>
                    <StatusBadge
                      label="AI Generated"
                      active={!!foodData.is_ai_generated}
                    />
                    <span className="text-white/60">·</span>
                    <StatusBadge
                      label="Barcode"
                      active={Array.isArray(foodData.code) && foodData.code.length > 0}
                    />
                    {Array.isArray(foodData.code) && foodData.code.length > 0 && (
                      <>
                        <span className="text-gray-400"> · </span>
                        <span className="text-xs text-indigo-300">{foodData.code.join(', ')}</span>
                      </>
                    )}
                  </p>
                </div>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
                {/* Serving Size & Key Metrics */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-4 sm:p-6 rounded-xl border border-blue-200 dark:border-blue-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-blue-600 dark:text-blue-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Serving Information
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-blue-600">
                        {foodData.quantity}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {unitLabel}
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-2xl font-bold text-green-600">
                        {foodData.calories}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Calories</div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-lg font-bold text-purple-600">
                        {proteinDensity.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        Protein/Cal
                      </div>
                    </div>
                    <div className="text-center p-3 bg-white rounded-lg border border-blue-200">
                      <div className="text-lg font-bold text-orange-600">
                        {caloriesPerGram.toFixed(1)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Cal/g</div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Macro Information */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 sm:p-6 rounded-xl border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    Macronutrients
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {/* Protein */}
                    <div className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Protein
                        </span>
                        <span className="text-lg font-bold text-green-600">
                          {foodData.protein}g
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all duration-300"
                          style={{
                            width: `${Math.min(proteinPercentage, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {proteinPercentage.toFixed(1)}% of calories
                      </div>
                    </div>

                    {/* Carbs */}
                    <div className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Carbs
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {foodData.carbs}g
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(carbPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {carbPercentage.toFixed(1)}% of calories
                      </div>
                    </div>

                    {/* Fat */}
                    <div className="bg-white p-4 rounded-lg border border-green-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">
                          Fat
                        </span>
                        <span className="text-lg font-bold text-orange-600">
                          {foodData.fat}g
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(fatPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {fatPercentage.toFixed(1)}% of calories
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                {foodData.description && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 6h16M4 12h16M4 18h7"
                        />
                      </svg>
                      Description
                    </h4>
                    <p className="text-gray-700 leading-relaxed">
                      {foodData.description}
                    </p>
                  </div>
                )}

                {/* Additional Information */}
                {(foodData.code ||
                  foodData.private_code ||
                  foodData.private_nutritional_facts) && (
                  <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 sm:p-6 rounded-xl border border-gray-200">
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Additional Information
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                      {foodData.code && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-sm font-medium text-gray-700">
                            Product Code
                          </span>
                          <span className="font-mono text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-md text-gray-800">
                            {foodData.code}
                          </span>
                        </div>
                      )}
                      {foodData.private_code && (
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <span className="text-sm font-medium text-gray-700">
                            Private Code
                          </span>
                          <span className="font-mono text-sm bg-gray-100 px-2 sm:px-3 py-1 rounded-md text-gray-800">
                            {foodData.private_code}
                          </span>
                        </div>
                      )}
                      {foodData.private_nutritional_facts && (
                        <div className="md:col-span-2">
                          <a
                            href={
                              foodData.private_nutritional_facts || undefined
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200 group"
                          >
                            <span className="text-sm font-medium text-blue-700">
                              Private Nutritional Facts
                            </span>
                            <div className="flex items-center gap-2 text-blue-600 group-hover:text-blue-700">
                              <span className="text-sm">View Document</span>
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                                />
                              </svg>
                            </div>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Fixed Action Buttons at Bottom */}
              <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4 sm:p-6">
                <div className="flex justify-end">
                  <button
                    onClick={() => setShowEditModal(true)}
                    className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center gap-2 text-sm sm:text-base"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                    Edit Food
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </ModalPanel>
      </Modal>

      {/* Edit Food Modal */}
      {foodData && (
        <EditFoodModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          foodData={foodData}
          onSuccess={(updatedFood) => {
            // Refresh the current modal data
            queryClient.setQueryData(["food-detail", id], updatedFood);
            setShowEditModal(false);
          }}
        />
      )}
    </>
  );
};
