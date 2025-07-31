import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/api";
import type { RecipeState, RecipeListResponse } from "../types/recipe";

export const useRecipes = (
  query: string = "",
  page: number = 1,
  pageSize: number = 20,
) => {
  const [state, setState] = useState<RecipeState>({
    items: [],
    next: null,
    previous: null,
    loading: false,
    error: null,
    hasMore: true,
  });

  const [totalCount, setTotalCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);
  const isInitialLoad = useRef(true);

  // Cancel previous request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Fetch recipes with optional search query and pagination
  const fetchRecipes = useCallback(
    async (targetPage = 1, append = false) => {
      cancelRequest();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const params: Record<string, string | number> = {
          limit: pageSize,
          offset: (targetPage - 1) * pageSize,
        };

        if (query.trim()) {
          params.title = query;
        }

        const response = await api.get<RecipeListResponse>(
          "/miran_prime/recipes/",
          {
            params,
            signal: controller.signal,
          },
        );

        const { result, next, previous, count } = response.data;

        setState((prev) => ({
          items: append ? [...prev.items, ...result] : result,
          next,
          previous,
          loading: false,
          error: null,
          hasMore: !!next,
        }));

        setTotalCount(count || 0);
        isInitialLoad.current = false;
      } catch (error) {
        if (error instanceof Error && error.name === "AbortError") {
          return; // Request was cancelled, don't update state
        }

        setState((prev) => ({
          ...prev,
          loading: false,
          error:
            error instanceof Error
              ? error.message
              : "Failed to fetch recipes. Please try again.",
        }));
      }
    },
    [query, pageSize, cancelRequest],
  );

  // Load more recipes using next URL (for backward compatibility)
  const loadMore = useCallback(() => {
    if (state.next && !state.loading) {
      // Extract page number from next URL for consistency
      const url = new URL(state.next, window.location.origin);
      const offset = parseInt(url.searchParams.get("offset") || "0");
      const nextPage = Math.floor(offset / pageSize) + 1;
      fetchRecipes(nextPage, true);
    }
  }, [state.next, state.loading, fetchRecipes, pageSize]);

  // Load specific page (new function for pagination)
  const loadPage = useCallback(
    (targetPage: number) => {
      fetchRecipes(targetPage, false);
    },
    [fetchRecipes],
  );

  // Retry on error
  const retry = useCallback(() => {
    fetchRecipes(page);
  }, [fetchRecipes, page]);

  // Fetch recipes when query or page changes
  useEffect(() => {
    const timeoutId = setTimeout(
      () => {
        fetchRecipes(page);
      },
      isInitialLoad.current ? 0 : 300,
    ); // No delay on initial load, 300ms debounce on search

    return () => {
      clearTimeout(timeoutId);
    };
  }, [fetchRecipes, page]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  // Calculate pagination info
  const totalPages = Math.ceil(totalCount / pageSize);
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    ...state,
    totalCount,
    totalPages,
    currentPage: page,
    hasNext,
    hasPrev,
    loadMore, // Keep for backward compatibility
    loadPage, // New function for direct page loading
    retry,
    refetch: () => fetchRecipes(page),
  };
};
