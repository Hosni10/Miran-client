import React, { useState, useEffect } from "react";
import {
  Search,
  Loader2,
  AlertCircle,
  RotateCcw,
  ChefHat,
  Plus,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { useDebounce } from "../hooks/useDebounce";
import { useRecipes } from "../hooks/useRecipes";
import { RecipeCard } from "../components/RecipeCard";
import { RecipeModal } from "../components/RecipeModal";
import { UnifiedHeader } from "../components/ui/UnifiedHeader";
import PaginationButtons from "../components/PaginationButtons";
import type { RecipeShallow } from "../types/recipe";

const RecipeCardSkeleton: React.FC = () => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
    <div className="animate-pulse">
      <div className="w-full aspect-video bg-gray-200 dark:bg-gray-700" />
      <div className="p-4 space-y-3">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
  </div>
);

export const RecipesList: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchInput, setSearchInput] = useState("");
  const [selectedRecipe, setSelectedRecipe] = useState<RecipeShallow | null>(
    null,
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Get search query and page from URL parameters
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Initialize search input from URL
  useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // Debounce search input by 300ms
  const debouncedQuery = useDebounce(searchQuery, 300);

  // Fetch recipes with debounced search and pagination
  const {
    items,
    loading,
    error,
    totalCount,
    totalPages,
    hasNext,
    hasPrev,
    retry,
  } = useRecipes(debouncedQuery, page, 20);

  // Update URL search parameters
  const updateSearchParams = (
    updates: Record<string, string | number | null>,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === 1) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    });

    setSearchParams(newSearchParams);
  };

  // Handle search button click
  const handleSearch = () => {
    setSearchLoading(true);
    updateSearchParams({ search: searchInput, page: null });

    // Reset search loading after a short delay to show feedback
    setTimeout(() => setSearchLoading(false), 500);
  };

  // Handle Enter key press in search input
  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Handle clear search
  const handleClearSearch = () => {
    setSearchInput("");
    setSearchLoading(true);
    updateSearchParams({ search: null, page: null });

    // Reset search loading after a short delay
    setTimeout(() => setSearchLoading(false), 300);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle pagination
  const handlePrevPage = () => {
    updateSearchParams({ page: Math.max(page - 1, 1) });
  };

  const handleNextPage = () => {
    updateSearchParams({ page: page + 1 });
  };

  const handlePageClick = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  const handleCardClick = (recipe: RecipeShallow) => {
    setSelectedRecipe(recipe);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRecipe(null);
  };

  const handleAddRecipe = () => {
    // TODO: Implement add recipe functionality
    console.log("Add Recipe clicked");
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Unified Header */}
      <UnifiedHeader
        title={t("Recipes")}
        description="Discover delicious and nutritious recipes"
        icon={<ChefHat className="w-8 h-8" />}
        searchValue={searchInput}
        onSearchChange={setSearchInput}
        onSearchKeyPress={handleSearchKeyPress}
        onSearchSubmit={handleSearchSubmit}
        onClear={handleClearSearch}
        searchPlaceholder={t("Search recipes...")}
        isSearching={searchLoading}
        showSearchButton={true}
        showClearButton={true}
        actionButtons={
          <button
            onClick={handleAddRecipe}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Recipe
          </button>
        }
      />

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <AlertCircle className="w-12 h-12 text-red-500" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {t("Failed to load recipes")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
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

        {/* Loading State (Initial) */}
        {loading && items.length === 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <RecipeCardSkeleton key={index} />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && items.length === 0 && (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-4">
              <ChefHat className="w-16 h-16 text-gray-300 dark:text-gray-600" />
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {debouncedQuery
                    ? t("No recipes found")
                    : t("No recipes available")}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {debouncedQuery
                    ? t("Try adjusting your search terms")
                    : t("Check back later for new recipes")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Recipes Grid */}
        {items.length > 0 && (
          <>
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {debouncedQuery ? (
                  <>
                    Showing {items.length} of {totalCount} results for "
                    {debouncedQuery}"
                  </>
                ) : (
                  <>
                    Showing {(page - 1) * 20 + 1}-
                    {Math.min(page * 20, totalCount)} of {totalCount} recipes
                  </>
                )}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  onClick={() => handleCardClick(recipe)}
                />
              ))}
            </div>

            {/* Loading indicator for pagination */}
            {loading && items.length > 0 && (
              <div className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8">
                <PaginationButtons
                  previous={hasPrev ? `page-${page - 1}` : null}
                  next={hasNext ? `page-${page + 1}` : null}
                  currentPage={page}
                  totalPages={totalPages}
                  onLoadPage={(url) => {
                    if (url?.includes("page-")) {
                      const newPage = parseInt(url.split("page-")[1]);
                      if (newPage === page + 1) handleNextPage();
                      else if (newPage === page - 1) handlePrevPage();
                    }
                  }}
                  onPageClick={(newPage) => {
                    handlePageClick(newPage);
                  }}
                  loading={loading}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Recipe Modal */}
      <RecipeModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        initialRecipe={selectedRecipe || undefined}
      />
    </div>
  );
};
