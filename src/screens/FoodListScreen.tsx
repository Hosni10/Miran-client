import React, { useState, useEffect } from "react";
import { Search, AlertCircle, Utensils, WifiOff, Plus, Ruler, ChefHat } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";
import { Outlet } from "react-router-dom";
import { fetchFoodPage, PaginatedFood, FoodItem } from "../lib/api";
import { searchFoods } from "../api/foods";
import { DEFAULT_LIMIT } from "../constants/endpoints";
import FoodCard from "../components/FoodCard";
import PaginationButtons from "../components/PaginationButtons";
import { AddFoodModal } from "../components/AddFoodModal";
import { UnifiedHeader } from "../components/ui/UnifiedHeader";
import { useAuth } from "../contexts/AuthContext";

export const FoodListScreen: React.FC = () => {
  const { loading: authLoading, token } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const location = useLocation();

  // Get search query and page from URL parameters
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Initialize search input from URL
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  // Use React Query for data fetching
  const { data, isFetching, isError, error } = useQuery({
    queryKey: ["foods", searchQuery, page],
    queryFn: async (): Promise<PaginatedFood> => {
      if (searchQuery.trim()) {
        // Use backend search
        const searchResult = await searchFoods(
          searchQuery,
          page,
          DEFAULT_LIMIT,
        );
        // Convert Paginated<FoodItem> to PaginatedFood format
        return {
          count: searchResult.count,
          next: searchResult.next || undefined,
          previous: searchResult.previous || undefined,
          result: searchResult.results,
        };
      } else {
        // Use regular food list endpoint
        const offset = (page - 1) * DEFAULT_LIMIT;
        const response = await fetchFoodPage(
          `/v1/resources/food_list?limit=${DEFAULT_LIMIT}&offset=${offset}`,
        );
        return response.data;
      }
    },
    enabled: !authLoading, // Only run when auth is ready
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });

  // Check if we're using mock data
  const usingMockData = data && data.count <= 10;

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
    updateSearchParams({ search: query, page: null });

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
    setQuery("");
    setSearchLoading(true);
    updateSearchParams({ search: null, page: null });

    // Reset search loading after a short delay
    setTimeout(() => setSearchLoading(false), 300);
  };

  // Handle pagination
  const totalPages = Math.ceil((data?.count || 0) / DEFAULT_LIMIT);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const handlePrevPage = () => {
    updateSearchParams({ page: Math.max(page - 1, 1) });
  };

  const handleNextPage = () => {
    updateSearchParams({ page: page + 1 });
  };

  const handlePageClick = (newPage: number) => {
    updateSearchParams({ page: newPage });
  };

  // Loading state - show loading if auth is loading OR if we're loading food data initially
  if (authLoading || (isFetching && !data)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white/80">
              {authLoading
                ? "Initializing authentication..."
                : "Loading food data..."}
            </p>
            {import.meta.env.DEV && (
              <div className="mt-4 text-xs text-white/60 text-center">
                <div>Auth Loading: {authLoading ? "Yes" : "No"}</div>
                <div>Token: {token ? `${token.slice(0, 8)}...` : "none"}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && !data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 text-white">
            <AlertCircle size={48} className="mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-white/80 text-center mb-4">
              {(error as any)?.response?.status === 401
                ? "Authentication required. Please log in again."
                : "Failed to load food data. Please try again."}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const foodItems = data?.result || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Unified Header - only show at /food */}
      {location.pathname === "/food" && (
        <UnifiedHeader
          title="Food Database"
          description={
            usingMockData
              ? "Showing sample nutrition data (API connection unavailable)"
              : "Explore our comprehensive nutrition database"
          }
          searchValue={query}
          onSearchChange={setQuery}
          onSearchKeyPress={handleSearchKeyPress}
          searchPlaceholder="Search foods…"
          isSearching={searchLoading}
          showSearchButton={true}
          showClearButton={true}
          onSearchSubmit={handleSearch}
          onClear={handleClearSearch}
          showDemoData={usingMockData}
          actionButtons={
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("units")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Ruler size={20} />
                Units
              </button>
              <button
                onClick={() => navigate("secondary-food")}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <ChefHat size={20} />
                Secondary Food
              </button>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
              >
                <Plus size={20} />
                Add Food
              </button>
            </div>
          }
        />
      )}

      {/* Only show FoodListScreen content if at /food, not at a child route */}
      {location.pathname === "/food" ? (
        <>
          <div className="container mx-auto px-4 py-8 pb-32">
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                {searchQuery ? (
                  <>
                    Showing {foodItems.length} of {data?.count || 0} results for "
                    {searchQuery}"
                  </>
                ) : (
                  <>
                    Showing {(page - 1) * DEFAULT_LIMIT + 1} of {data?.count || 0}{" "}
                    foods
                  </>
                )}
              </p>
            </div>

            {/* Food Grid - only show at /food */}
            {location.pathname === "/food" && (
              foodItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16">
                  <Utensils
                    size={64}
                    className="text-gray-300 dark:text-gray-600 mb-4"
                  />
                  <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                    {searchQuery ? "No foods found" : "No foods available"}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 text-center">
                    {searchQuery
                      ? `No foods match "${searchQuery}". Try a different search term.`
                      : "The food database is currently empty."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {foodItems.map((food) => (
                    <FoodCard key={food.id} item={food} />
                  ))}
                </div>
              )
            )}

            {/* Loading indicator for pagination - only show at /food */}
            {location.pathname === "/food" && isFetching && data && (
              <div className="flex justify-center mt-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
              </div>
            )}

            {/* Pagination - only show at /food */}
            {location.pathname === "/food" && !searchQuery && totalPages > 1 && (
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
                  loading={isFetching}
                />
              </div>
            )}
          </div>
          <AddFoodModal
            open={showAddModal}
            onClose={() => setShowAddModal(false)}
          />
        </>
      ) : (
        <Outlet />
      )}

      {/* Add Food Modal */}
      <AddFoodModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
};
