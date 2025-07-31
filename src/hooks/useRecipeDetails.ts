import { useState, useEffect, useCallback, useRef } from "react";
import { api } from "../lib/api";
import type { RecipeDetailsState, RecipeFull } from "../types/recipe";

export const useRecipeDetails = (id: number | null) => {
  const [state, setState] = useState<RecipeDetailsState>({
    data: null,
    loading: false,
    error: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  // Cancel previous request
  const cancelRequest = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Fetch recipe details
  const fetchRecipeDetails = useCallback(
    async (recipeId: number) => {
      cancelRequest();

      const controller = new AbortController();
      abortControllerRef.current = controller;

      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
      }));

      try {
        const response = await api.get<RecipeFull>(
          `/miran_prime/recipes/${recipeId}/`,
          {
            signal: controller.signal,
          },
        );

        setState({
          data: response.data,
          loading: false,
          error: null,
        });
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
              : "Failed to fetch recipe details. Please try again.",
        }));
      }
    },
    [cancelRequest],
  );

  // Retry on error
  const retry = useCallback(() => {
    if (id) {
      fetchRecipeDetails(id);
    }
  }, [id, fetchRecipeDetails]);

  // Fetch recipe details when id changes
  useEffect(() => {
    if (id) {
      fetchRecipeDetails(id);
    } else {
      // Clear data when id is null
      setState({
        data: null,
        loading: false,
        error: null,
      });
    }
  }, [id, fetchRecipeDetails]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancelRequest();
    };
  }, [cancelRequest]);

  return {
    ...state,
    retry,
    refetch: () => id && fetchRecipeDetails(id),
  };
};
