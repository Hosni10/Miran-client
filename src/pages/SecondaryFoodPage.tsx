import React, { useState, useEffect } from "react";
import { Search, AlertCircle, Utensils, WifiOff, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { fetchSecondaryFood } from "../api/secondaryFood";
import { UnifiedHeader } from "../components/ui/UnifiedHeader";
import { useAuth } from "../contexts/AuthContext";
import { useAuthStore } from "../store/AuthStore";
import PaginationButtons from "../components/PaginationButtons";
import { DEFAULT_LIMIT } from "../constants/endpoints";
import type { SecondaryFood } from "../types/secondaryFood";
import { buildImageUrl } from "../utils/imageUrl";

// Mock pagination for secondary food since the API doesn't support it yet
const mockPaginatedSecondaryFood = (data: SecondaryFood[], page: number, limit: number) => {
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  return {
    count: data.length,
    next: endIndex < data.length ? `page-${page + 1}` : null,
    previous: page > 1 ? `page-${page - 1}` : null,
    result: data.slice(startIndex, endIndex),
  };
};

export const SecondaryFoodPage: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const { user: authStoreUser } = useAuthStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  // Check if user is super admin (Admin role)
  const isSuperAdmin = authStoreUser?.role === "Admin";

  // Get search query and page from URL parameters
  const searchQuery = searchParams.get("search") || "";
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Initialize search input from URL
  useEffect(() => {
    setQuery(searchQuery);
  }, [searchQuery]);

  // Use React Query for data fetching
  const { data: allSecondaryFood, isFetching, isError, error } = useQuery({
    queryKey: ["secondaryFood"],
    queryFn: fetchSecondaryFood,
    enabled: !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter and paginate data
  const filteredData = allSecondaryFood?.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const paginatedData = mockPaginatedSecondaryFood(filteredData, page, DEFAULT_LIMIT);

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
  const totalPages = Math.ceil((paginatedData.count || 0) / DEFAULT_LIMIT);
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

  // Loading state
  if (authLoading || (isFetching && !allSecondaryFood)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white/80">
              {authLoading ? "Initializing authentication..." : "Loading secondary food..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && !allSecondaryFood) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 text-white">
            <AlertCircle size={48} className="mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-white/80 text-center mb-4">
              {(error as any)?.response?.status === 401
                ? "Authentication required. Please log in again."
                : "Failed to load secondary food data. Please try again."}
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

  const secondaryFoodItems = paginatedData.result || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Unified Header */}
      <UnifiedHeader
        title="Secondary Food Database"
        description="Manage secondary food items and categories"
        searchValue={query}
        onSearchChange={setQuery}
        onSearchKeyPress={handleSearchKeyPress}
        searchPlaceholder="Search secondary food…"
        isSearching={searchLoading}
        showSearchButton={true}
        showClearButton={true}
        onSearchSubmit={handleSearch}
        onClear={handleClearSearch}
        actionButtons={
          isSuperAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Secondary Food
            </button>
          )
        }
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            {searchQuery ? (
              <>
                Showing {secondaryFoodItems.length} of {paginatedData.count || 0} results for "
                {searchQuery}"
              </>
            ) : (
              <>
                Showing {(page - 1) * DEFAULT_LIMIT + 1} of {paginatedData.count || 0}{" "}
                secondary food items
              </>
            )}
          </p>
        </div>

        {/* Secondary Food Grid */}
        {secondaryFoodItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Utensils
              size={64}
              className="text-gray-300 dark:text-gray-600 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchQuery ? "No secondary food found" : "No secondary food available"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {searchQuery
                ? `No secondary food items match "${searchQuery}". Try a different search term.`
                : "The secondary food database is currently empty."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {secondaryFoodItems.map((item) => (
              <div
                key={item.id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center justify-center mb-4">
                  <div className="ml-4">
                    <img
                      src={item.icon ? item.icon : buildImageUrl(null)}
                      alt={item.title}
                      className="w-12 h-12 rounded-lg object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!item.icon) {
                          target.src = buildImageUrl(null);
                        }
                      }}
                    />
                  </div>
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {item.title}
                  </h3>
                </div>


              </div>
            ))}
          </div>
        )}

        {/* Loading indicator for pagination */}
        {isFetching && allSecondaryFood && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}

        {/* Pagination */}
        {!searchQuery && totalPages > 1 && (
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

      {/* Add Secondary Food Modal - Placeholder for future implementation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Secondary Food
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This feature is coming soon. You'll be able to add new secondary food items here.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 