import { useState, useEffect, useCallback } from "react";

export interface PaginatedData<T> {
  count: number;
  next: string | null;
  previous: string | null;
  result: T[];
}

export interface UsePaginatedFetchReturn<T> {
  data: T[];
  count: number;
  loading: boolean;
  loadMore: () => void;
  hasMore: boolean;
  error: string | null;
  retry: () => void;
}

export function usePaginatedFetch<T>(
  fetchFunction: (url?: string) => Promise<PaginatedData<T>>,
): UsePaginatedFetchReturn<T> {
  const [data, setData] = useState<T[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [nextUrl, setNextUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetchFunction();

      setData(response.result);
      setCount(response.count);
      setNextUrl(response.next);

      console.log("🔧 usePaginatedFetch: Initial data loaded", {
        itemCount: response.result.length,
        totalCount: response.count,
        hasNext: !!response.next,
      });
    } catch (err: any) {
      console.error("🔧 usePaginatedFetch: Error loading initial data", err);

      // Handle different error types
      if (err?.response?.status === 401) {
        setError("Session expired – please sign in again.");
      } else if (err?.response?.status === 403) {
        setError(
          "Access denied. This feature may be restricted to Prime Trainer accounts only.",
        );
      } else if (err?.response?.status >= 500 || err?.name === "NetworkError") {
        setError("Can't load subscribers. Check connection.");
      } else {
        setError(
          err?.response?.data?.message || err?.message || "Failed to load data",
        );
      }

      setData([]);
      setCount(0);
      setNextUrl(null);
    } finally {
      setLoading(false);
    }
  }, [fetchFunction]);

  const loadMore = useCallback(async () => {
    if (!nextUrl || loadingMore) {
      return;
    }

    try {
      setLoadingMore(true);
      setError(null);

      const response = await fetchFunction(nextUrl);

      setData((prevData) => [...prevData, ...response.result]);
      setNextUrl(response.next);

      console.log("🔧 usePaginatedFetch: More data loaded", {
        newItemCount: response.result.length,
        totalItemsNow: data.length + response.result.length,
        hasMoreNext: !!response.next,
      });
    } catch (err: any) {
      console.error("🔧 usePaginatedFetch: Error loading more data", err);

      // Handle different error types for load more
      if (err?.response?.status === 401) {
        setError("Session expired – please sign in again.");
      } else if (err?.response?.status === 403) {
        setError(
          "Access denied. This feature may be restricted to Prime Trainer accounts only.",
        );
      } else {
        setError("Can't load more subscribers. Check connection.");
      }
    } finally {
      setLoadingMore(false);
    }
  }, [nextUrl, loadingMore, data.length, fetchFunction]);

  const retry = useCallback(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Load initial data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  return {
    data,
    count,
    loading: loading || loadingMore,
    loadMore,
    hasMore: !!nextUrl,
    error,
    retry,
  };
}
