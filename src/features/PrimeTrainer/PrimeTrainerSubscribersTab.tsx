import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  Users,
  Crown,
  Calendar,
  Mail,
  Phone,
  RotateCcw,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  X,
  Clock,
} from "lucide-react";
import PaginationButtons from "../../components/PaginationButtons";
import {
  fetchPrimeSubscribers,
  isSubscriptionActive,
  formatSubscriptionDate,
  type Subscriber,
  type PaginatedSubscribers,
} from "../../api/primeTrainer";

const DEFAULT_PAGE_SIZE = 20;

// Props interface for the component
interface PrimeTrainerSubscribersTabProps {
  searchQuery?: string;
  onUpdateSearchParams?: (
    updates: Record<string, string | number | null>,
  ) => void;
}

const PrimeTrainerSubscribersTab: React.FC<PrimeTrainerSubscribersTabProps> = ({
  searchQuery = "",
  onUpdateSearchParams,
}) => {
  const [searchParams] = useSearchParams();

  // Get page from URL parameters, use searchQuery from props
  const page = parseInt(searchParams.get("page") || "1", 10);

  // Use React Query for data fetching with pagination
  const { data, isFetching, isError, error, refetch } = useQuery({
    queryKey: ["primeSubscribers", searchQuery, page],
    queryFn: async (): Promise<PaginatedSubscribers> => {
      // Calculate offset for pagination
      const offset = (page - 1) * DEFAULT_PAGE_SIZE;

      // Build URL with search parameters
      const params = new URLSearchParams();
      params.set("limit", DEFAULT_PAGE_SIZE.toString());
      params.set("offset", offset.toString());

      // Add search query if provided (backend search)
      if (searchQuery.trim()) {
        params.set("search", searchQuery.trim());
      }

      const url = `/miran_prime/prime_trainer_subscribers/for_prime_trainer?${params.toString()}`;

      if (window.__MIRAN_DEBUG) {
        console.info("[PrimeTrainer] Fetching page with backend search:", {
          page,
          offset,
          searchQuery: searchQuery.trim(),
          url,
          hasSearch: !!searchQuery.trim(),
        });
      }

      return await fetchPrimeSubscribers(url);
    },
    staleTime: 30000, // 30 seconds
    placeholderData: (previousData) => previousData,
  });

  const subscribers = data?.result || [];
  const totalCount = data?.count || 0;

  // Handle pagination - use passed function or fallback to URL manipulation
  const updateSearchParams = onUpdateSearchParams || (() => {});

  // Handle pagination
  const totalPages = Math.ceil(totalCount / DEFAULT_PAGE_SIZE);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  const handlePrevPage = () => {
    updateSearchParams({ page: Math.max(page - 1, 1) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNextPage = () => {
    updateSearchParams({ page: page + 1 });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePageClick = (newPage: number) => {
    updateSearchParams({ page: newPage });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle clear search - use passed function
  const handleClearSearch = () => {
    updateSearchParams({ search: null, page: null });
  };

  // Helper function to get badge styling for subscription status
  const getStatusBadge = (subscriber: Subscriber) => {
    const isActive = isSubscriptionActive(subscriber);

    if (isActive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-green-400 to-emerald-500 text-white shadow-lg shadow-green-400/30">
          <CheckCircle className="w-3 h-3 mr-1" />
          Active
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-400 to-rose-500 text-white shadow-lg shadow-red-400/30">
          <XCircle className="w-3 h-3 mr-1" />
          Expired
        </span>
      );
    }
  };

  // Helper function to get private coach badge
  const getPrivateCoachBadge = (subscriber: Subscriber) => {
    if (!subscriber.is_private_coach) return null;

    return (
      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/30">
        <Crown className="w-3 h-3 mr-1" />
        Private Coach
      </span>
    );
  };

  // Helper function to calculate days left in subscription
  const calculateDaysLeft = (
    endDate: string,
  ): { daysLeft: number; isActive: boolean } => {
    const end = new Date(endDate);
    const now = new Date();

    // Reset times to start of day for accurate comparison
    end.setHours(0, 0, 0, 0);
    now.setHours(0, 0, 0, 0);

    const timeDiff = end.getTime() - now.getTime();
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    return {
      daysLeft: Math.max(0, daysLeft), // Don't show negative days
      isActive: daysLeft >= 0,
    };
  };

  // Helper function to get a descriptive days left message
  const getDaysLeftMessage = (
    daysLeft: number,
    isActive: boolean,
  ): {
    text: string;
    color: string;
    urgency: "high" | "medium" | "low" | "expired";
  } => {
    if (!isActive || daysLeft === 0) {
      return {
        text: "Expired",
        color: "text-red-600 dark:text-red-400",
        urgency: "expired",
      };
    } else if (daysLeft === 1) {
      return {
        text: "1 day left",
        color: "text-red-600 dark:text-red-400",
        urgency: "high",
      };
    } else if (daysLeft <= 7) {
      return {
        text: `${daysLeft} days left`,
        color: "text-orange-600 dark:text-orange-400",
        urgency: "high",
      };
    } else if (daysLeft <= 30) {
      return {
        text: `${daysLeft} days left`,
        color: "text-yellow-600 dark:text-yellow-400",
        urgency: "medium",
      };
    } else {
      return {
        text: `${daysLeft} days left`,
        color: "text-green-600 dark:text-green-400",
        urgency: "low",
      };
    }
  };

  // Loading state for initial load
  if (isFetching && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
        <p className="text-gray-600 dark:text-gray-400">
          Loading subscribers...
        </p>
      </div>
    );
  }

  // Error state with retry option
  if (isError && !data) {
    return (
      <div className="flex flex-col items-center justify-center py-24">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          {error && (error as any).message?.includes("Session expired")
            ? "Session Expired"
            : "Failed to Load Subscribers"}
        </h3>
        <p className="text-gray-600 dark:text-gray-400 text-center mb-6 max-w-md">
          {error ? (error as any).message : "Unable to load subscribers"}
        </p>
        <button
          onClick={() => refetch()}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          role="button"
          aria-label="Retry loading subscribers"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Retry
        </button>
      </div>
    );
  }

  // Empty state
  if (!isFetching && subscribers.length === 0) {
    return (
      <div className="space-y-6">
        {/* Search Results Info (only if searching) */}
        {searchQuery && (
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="text-purple-700 dark:text-purple-300 font-medium">
                  Search Results for "{searchQuery}"
                </span>
              </div>
              <button
                onClick={handleClearSearch}
                className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-purple-600 dark:text-purple-400 text-sm mt-2">
              No subscribers found matching your search. Try different keywords.
            </p>
          </div>
        )}

        {/* Empty State */}
        <div className="flex flex-col items-center justify-center py-24">
          <div className="relative mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-indigo-100 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center shadow-xl">
              <Users className="w-12 h-12 text-purple-500 dark:text-purple-400" />
            </div>
            <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
              <Crown className="w-4 h-4 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
            {searchQuery ? "No subscribers found" : "No subscribers yet 👋"}
          </h3>
          <p className="text-gray-600 dark:text-gray-400 text-center max-w-md">
            {searchQuery
              ? `No subscribers match "${searchQuery}". Try a different search term.`
              : "Your subscriber list will appear here once you have active subscribers."}
          </p>
          {!searchQuery && (
            <div className="mt-6 flex items-center space-x-2 text-sm text-purple-600 dark:text-purple-400">
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
              <span>Ready to welcome new subscribers</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main content with subscribers list
  return (
    <div className="space-y-6">
      {/* Search Results Info */}
      {searchQuery && !isFetching && (
        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span className="text-purple-700 dark:text-purple-300 font-medium">
                Search Results for "{searchQuery}"
              </span>
            </div>
            <button
              onClick={handleClearSearch}
              className="text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          {subscribers.length === 0 ? (
            <p className="text-purple-600 dark:text-purple-400 text-sm mt-2">
              No subscribers found matching your search. Try different keywords.
            </p>
          ) : (
            <p className="text-purple-600 dark:text-purple-400 text-sm mt-2">
              Found {subscribers.length} subscriber
              {subscribers.length !== 1 ? "s" : ""} matching your search.
            </p>
          )}
        </div>
      )}

      {/* Header with count and pagination info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          {totalCount === 1
            ? "1 Subscriber"
            : `${totalCount.toLocaleString()} Subscribers`}
        </h2>

        {/* Results count */}
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          {searchQuery ? (
            <>
              Showing {subscribers.length} of {totalCount} results for "
              {searchQuery}"
            </>
          ) : (
            <>
              Showing {Math.min((page - 1) * DEFAULT_PAGE_SIZE + 1, totalCount)}
              -{Math.min(page * DEFAULT_PAGE_SIZE, totalCount)} of {totalCount}
            </>
          )}
        </p>

        {/* Debug info for pagination */}
        {window.__MIRAN_DEBUG && (
          <div className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-700 p-2 rounded">
            <div>
              Page: {page} / {totalPages}
            </div>
            <div>
              Loaded: {subscribers.length} / {totalCount}
            </div>
            <div>Has Next: {hasNext ? "Yes" : "No"}</div>
            <div>Has Prev: {hasPrev ? "Yes" : "No"}</div>
          </div>
        )}
      </div>

      {/* Subscribers Grid */}
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        role="list"
      >
        {subscribers.map((subscriber) => {
          const isActive = isSubscriptionActive(subscriber);
          const isPrivateCoach = subscriber.is_private_coach;
          const { daysLeft, isActive: calculatedActive } = calculateDaysLeft(
            subscriber.end_date,
          );
          const daysLeftInfo = getDaysLeftMessage(daysLeft, calculatedActive);

          // Dynamic card styling based on status and private coach
          const cardClasses = isActive
            ? isPrivateCoach
              ? "bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700"
              : "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-700"
            : "bg-gradient-to-br from-gray-50 to-slate-50 dark:from-gray-800/50 dark:to-slate-800/50 border-gray-200 dark:border-gray-600";

          return (
            <div
              key={subscriber.id}
              className={`${cardClasses} rounded-xl border-2 p-6 hover:shadow-xl hover:scale-105 transition-all duration-300 transform cursor-default group relative overflow-hidden`}
              role="listitem"
            >
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-0 right-0 w-32 h-32 bg-current rounded-full transform translate-x-16 -translate-y-16"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-current rounded-full transform -translate-x-12 translate-y-12"></div>
              </div>

              {/* Header with Avatar and Status */}
              <div className="relative z-10 flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {/* Avatar */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold text-lg shadow-lg ${
                      isActive
                        ? isPrivateCoach
                          ? "bg-gradient-to-br from-purple-500 to-indigo-600"
                          : "bg-gradient-to-br from-green-500 to-emerald-600"
                        : "bg-gradient-to-br from-gray-400 to-slate-500"
                    }`}
                  >
                    {subscriber.user.full_name ? (
                      subscriber.user.full_name.charAt(0).toUpperCase()
                    ) : (
                      <Users className="w-6 h-6" />
                    )}
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col gap-1">
                    {getStatusBadge(subscriber)}
                    {getPrivateCoachBadge(subscriber)}
                  </div>
                </div>

                {/* Action Indicator */}
                <div
                  className={`w-3 h-3 rounded-full ${
                    isActive
                      ? isPrivateCoach
                        ? "bg-purple-400 shadow-lg shadow-purple-400/50"
                        : "bg-green-400 shadow-lg shadow-green-400/50"
                      : "bg-gray-300"
                  }`}
                ></div>
              </div>

              {/* Subscriber Name */}
              <div className="relative z-10 mb-4">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {subscriber.user.full_name || "Anonymous User"}
                </h3>
                <div className="h-1 w-16 bg-gradient-to-r from-purple-400 to-indigo-400 rounded-full"></div>
              </div>

              {/* Contact Information */}
              <div className="relative z-10 space-y-3 mb-4">
                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                    <Phone className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                    {subscriber.user.mobile || "—"}
                  </span>
                </div>

                <div className="flex items-center space-x-2 text-sm">
                  <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <Mail className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <span className="text-gray-700 dark:text-gray-300 font-medium truncate">
                    {subscriber.user.email || "—"}
                  </span>
                </div>
              </div>

              {/* Subscription Dates */}
              <div className="relative z-10 bg-white/50 dark:bg-black/20 rounded-lg p-3 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      Start
                    </span>
                  </div>
                  <span className="text-gray-800 dark:text-gray-200 font-semibold">
                    {formatSubscriptionDate(subscriber.start_date)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3 h-3 text-gray-500" />
                    <span className="text-gray-600 dark:text-gray-400 font-medium">
                      End
                    </span>
                  </div>
                  <span
                    className={`font-semibold ${
                      isActive
                        ? "text-green-700 dark:text-green-400"
                        : "text-red-700 dark:text-red-400"
                    }`}
                  >
                    {formatSubscriptionDate(subscriber.end_date)}
                  </span>
                </div>

                {/* Days Left Indicator */}
                <div className="mt-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3 text-gray-500" />
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-xs">
                        Time Left
                      </span>
                    </div>
                    <div
                      className={`flex items-center space-x-1 ${daysLeftInfo.color}`}
                    >
                      {daysLeftInfo.urgency === "high" && (
                        <div className="w-2 h-2 bg-current rounded-full animate-pulse"></div>
                      )}
                      <span className="font-bold text-sm">
                        {daysLeftInfo.text}
                      </span>
                    </div>
                  </div>

                  {/* Additional context for active subscriptions */}
                  {calculatedActive && daysLeft > 0 && (
                    <div className="mt-1 text-xs text-gray-500 text-right">
                      {daysLeft <= 7
                        ? "⚠️ Expiring soon"
                        : daysLeft <= 30
                          ? "📅 Renewing soon"
                          : "✅ Active subscription"}
                    </div>
                  )}
                </div>
              </div>

              {/* Hover Effect Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none"></div>
            </div>
          );
        })}
      </div>

      {/* Loading indicator for pagination */}
      {isFetching && data && (
        <div className="flex justify-center mt-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

      {/* Error toast for API errors */}
      {isError && data && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-400 mr-2" />
            <span className="text-red-800 font-medium">
              Error loading data:
            </span>
          </div>
          <p className="text-red-700 mt-1">
            {error ? (error as any).message : "Unknown error"}
          </p>
          <button
            onClick={() => refetch()}
            className="mt-2 text-red-600 hover:text-red-800 underline"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
};

/*
✅ Done-Criteria Checklist:
✓ Fetches subscribers with token (handled by api.ts interceptor)
✓ Shows total count (pluralized in header)
✓ Active / Expired & Private Coach badges (with icons and color coding)
✓ Standard pagination with PaginationButtons component (same as Food/Recipes/Trainers)
✓ Search functionality integrated with unified header (no duplicate search bar)
✓ Loading, empty, and error states (comprehensive error handling)
✓ No regressions elsewhere (standalone component)
*/

export default PrimeTrainerSubscribersTab;
