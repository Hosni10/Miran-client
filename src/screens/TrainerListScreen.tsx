import React, { useState, useCallback, useEffect } from "react";
import { Search, AlertCircle, RotateCcw, UserCheck, Plus } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import { fetchTrainerPage } from "../api/trainers";
import TrainerCard from "../components/TrainerCard";
import PaginationButtons from "../components/PaginationButtons";
import { UnifiedHeader } from "../components/ui/UnifiedHeader";
import { useAuth } from "../contexts/AuthContext";
import type { PaginatedTrainer, Trainer } from "../types/trainer";

const mockTrainerData: PaginatedTrainer = {
  count: 8,
  num_pages: 1,
  current_page: 1,
  result: [
    {
      id: 1,
      full_name: "Ahmed Al-Rashid",
      avatar: "trainers/ahmed_al_rashid.jpg",
      rating: 9.2,
      reviews: 156,
      available: true,
      nationality: { id: 1, name: "Saudi Arabia" },
      price: 450,
    },
    {
      id: 2,
      full_name: "Fatima Hassan",
      avatar: "trainers/fatima_hassan.jpg",
      rating: 9.8,
      reviews: 203,
      available: true,
      nationality: { id: 2, name: "Egypt" },
      price: 520,
      gender: "female",
    },
    {
      id: 3,
      full_name: "Omar Zaid",
      avatar: null,
      rating: 8.9,
      reviews: 89,
      available: false,
      nationality: { id: 3, name: "Jordan" },
      price: 380,
    },
    {
      id: 4,
      full_name: "Layla Abdel",
      avatar: "trainers/layla_abdel.jpg",
      rating: 9.4,
      reviews: 167,
      available: true,
      nationality: { id: 4, name: "UAE" },
      price: 680,
      gender: "female",
    },
    {
      id: 5,
      full_name: "Hassan Mahmoud",
      avatar: "trainers/hassan_mahmoud.jpg",
      rating: 9.1,
      reviews: 124,
      available: true,
      nationality: { id: 5, name: "Lebanon" },
      price: 495,
    },
    {
      id: 6,
      full_name: "Nour Abdallah",
      avatar: "trainers/nour_abdallah.jpg",
      rating: 9.5,
      reviews: 134,
      available: false,
      nationality: { id: 5, name: "Lebanon" },
      price: 579,
    },
    {
      id: 7,
      full_name: "Khalid Mansour",
      avatar: "trainers/khalid_mansour.jpg",
      rating: 9.3,
      reviews: 92,
      available: true,
      nationality: { id: 1, name: "Saudi Arabia" },
      price: 629,
    },
    {
      id: 8,
      full_name: "Rania Saeed",
      avatar: null,
      rating: 9.9,
      reviews: 245,
      available: true,
      nationality: { id: 2, name: "Egypt" },
      price: 749,
      gender: "female",
    },
  ],
};

export const TrainerListScreen: React.FC = () => {
  const { loading: authLoading, token } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [trainerData, setTrainerData] = useState<PaginatedTrainer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [usingMockData, setUsingMockData] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const pageSize = 10;

  // Get search query and page from URL parameters
  const searchQuery = searchParams.get("search") || "";
  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Initialize search input from URL
  useEffect(() => {
    setSearch(searchQuery);
  }, [searchQuery]);

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

  const loadTrainerData = useCallback(async (page_num = 1) => {
    try {
      setLoading(true);
      setError(null);

      if (process.env.NODE_ENV !== "production") {
        console.debug("[Trainer API] page=", page_num, "token OK");
      }

      const response = await fetchTrainerPage(page_num, pageSize);

      // If we get here, we successfully connected to the API
      setUsingMockData(false);

      console.log("🔧 TrainerListScreen API success:", {
        resultCount: response.data.result.length,
        totalCount: response.data.count,
        currentPage: response.data.current_page,
        totalPages: response.data.num_pages,
        usingMockData: false,
      });

      setTrainerData(response.data);
    } catch (err: unknown) {
      console.error("🔧 TrainerListScreen API error:", {
        errorMessage: err instanceof Error ? err.message : "Unknown error",
        errorResponse: (err as any)?.response?.data,
        errorStatus: (err as any)?.response?.status,
      });

      if ((err as any)?.response?.status === 401) {
        setError("Authentication required. Please log in again.");
      } else {
        // Fallback to mock data on API error
        setUsingMockData(true);
        setTrainerData(mockTrainerData);
        console.log("🔧 Using mock trainer data due to API error");
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load - wait for auth to finish loading
  useEffect(() => {
    if (!authLoading) {
      console.log("🔧 TrainerListScreen: Auth ready, loading trainer data", {
        hasToken: !!token,
        tokenPreview: token ? `${token.substring(0, 10)}...` : null,
      });
      loadTrainerData(currentPage);
    }
  }, [authLoading, token, loadTrainerData, currentPage]);

  // Handle search button click
  const handleSearch = () => {
    setSearchLoading(true);
    updateSearchParams({ search: search, page: null });

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
    setSearch("");
    setSearchLoading(true);
    updateSearchParams({ search: null, page: null });

    // Reset search loading after a short delay
    setTimeout(() => setSearchLoading(false), 300);
  };

  // Handle search form submit
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  // Handle pagination
  const handlePageChange = useCallback(
    (page: number) => {
      if (
        !usingMockData &&
        page >= 1 &&
        page <= (trainerData?.num_pages || 1)
      ) {
        updateSearchParams({ page });
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    },
    [usingMockData, trainerData?.num_pages, updateSearchParams],
  );

  // Handle trainer card click
  const handleTrainerClick = useCallback((trainerId: number) => {
    console.log("🔧 Trainer clicked:", trainerId);
    // TODO: navigate('TrainerDetail', { id: trainerId })
  }, []);

  // Handle add trainer click
  const handleAddTrainer = () => {
    // TODO: Implement add trainer functionality
    console.log("Add Trainer clicked");
  };

  // Filter trainers based on search
  const filteredTrainers = React.useMemo(() => {
    if (!trainerData?.result || !searchQuery.trim()) {
      return trainerData?.result || [];
    }

    return trainerData.result.filter(
      (trainer) =>
        trainer.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        trainer.nationality?.name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()),
    );
  }, [trainerData?.result, searchQuery]);

  // Loading state - show loading if auth is loading OR if we're loading trainer data
  if ((authLoading || loading) && !trainerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white/80">
              {authLoading
                ? "Initializing authentication..."
                : "Loading trainers..."}
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
  if (error && !trainerData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 text-white">
            <AlertCircle size={48} className="mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-white/80 text-center mb-4">{error}</p>
            <button
              onClick={() => loadTrainerData(1)}
              className="bg-white text-indigo-600 px-6 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Unified Header */}
      <UnifiedHeader
        title="Trainers"
        description={
          usingMockData
            ? "Showing sample trainer data (API connection unavailable)"
            : "Browse our certified fitness trainers"
        }
        searchValue={search}
        onSearchChange={setSearch}
        onSearchKeyPress={handleSearchKeyPress}
        onSearchSubmit={handleSearchSubmit}
        onClear={handleClearSearch}
        searchPlaceholder="Search trainers..."
        isSearching={searchLoading}
        showSearchButton={true}
        showClearButton={true}
        showDemoData={usingMockData}
        actionButtons={
          <button
            onClick={handleAddTrainer}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <Plus size={20} />
            Add Trainer
          </button>
        }
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-32">
        {filteredTrainers.length === 0 ? (
          // Empty state
          <div className="flex flex-col items-center justify-center py-16">
            <UserCheck
              size={64}
              className="text-gray-300 dark:text-gray-600 mb-4"
            />
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
              {searchQuery ? "No trainers found" : "No trainers available"}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-center">
              {searchQuery
                ? `No trainers match "${searchQuery}". Try a different search term.`
                : "The trainer database is currently empty."}
            </p>
          </div>
        ) : (
          <>
            {/* Results count */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-gray-600 dark:text-gray-400">
                Showing {filteredTrainers.length} of {trainerData?.count || 0}{" "}
                trainers
                {searchQuery && ` matching "${searchQuery}"`}
              </p>
            </div>

            {/* Trainer Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTrainers.map((trainer) => (
                <TrainerCard
                  key={trainer.id}
                  trainer={trainer}
                  onCardClick={handleTrainerClick}
                />
              ))}
            </div>

            {/* Pagination - only show if not using mock data and not searching */}
            {!usingMockData &&
              !searchQuery &&
              trainerData &&
              trainerData.num_pages > 1 && (
                <div className="mt-8">
                  <PaginationButtons
                    previous={
                      currentPage > 1 ? `page-${currentPage - 1}` : null
                    }
                    next={
                      currentPage < trainerData.num_pages
                        ? `page-${currentPage + 1}`
                        : null
                    }
                    currentPage={currentPage}
                    totalPages={trainerData.num_pages}
                    onLoadPage={(url) => {
                      if (url?.includes("page-")) {
                        const newPage = parseInt(url.split("page-")[1]);
                        handlePageChange(newPage);
                      }
                    }}
                    onPageClick={(newPage) => {
                      handlePageChange(newPage);
                    }}
                    loading={loading}
                  />
                </div>
              )}
          </>
        )}
      </div>
    </div>
  );
};
