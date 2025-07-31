import React, { useState, useRef, useEffect } from "react";
import { Search, User, Utensils, X, Loader2, ChefHat } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { searchFoods } from "../../api/foods";
import { fetchTrainerPage } from "../../api/trainers";
import { buildImageUrl } from "../../utils/imageUrl";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import type { FoodItem } from "../../lib/api";
import type { Trainer } from "../../types/trainer";
import type { RecipeShallow } from "../../types/recipe";

interface GlobalSearchProps {
  className?: string;
}

interface SearchResults {
  foods: FoodItem[];
  recipes: RecipeShallow[];
  trainers: Trainer[];
  isLoading: boolean;
  hasResults: boolean;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  className = "",
}) => {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Search food items
  const { data: foodResults, isFetching: isLoadingFoods } = useQuery({
    queryKey: ["global-search-foods", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { results: [] };
      const result = await searchFoods(debouncedQuery, 1, 5); // Limit to 5 results
      return result;
    },
    enabled: debouncedQuery.length > 2,
    staleTime: 30000, // 30 seconds
  });

  // Search recipes
  const { data: recipeResults, isFetching: isLoadingRecipes } = useQuery({
    queryKey: ["global-search-recipes", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { result: [] };
      const params = new URLSearchParams();
      params.set("title", debouncedQuery.trim());
      params.set("limit", "5"); // Limit to 5 results
      const response = await api.get<{ result: RecipeShallow[] }>(
        `/miran_prime/recipes/?${params.toString()}`,
      );
      return response.data;
    },
    enabled: debouncedQuery.length > 2,
    staleTime: 30000, // 30 seconds
  });

  // Search trainers (using the trainer list and filtering locally since there's no search API)
  const { data: trainerResults, isFetching: isLoadingTrainers } = useQuery({
    queryKey: ["global-search-trainers", debouncedQuery],
    queryFn: async () => {
      if (!debouncedQuery.trim()) return { data: { result: [] } };
      const result = await fetchTrainerPage(1, 50); // Get more trainers to search through

      // Filter trainers locally by name
      const filteredTrainers = result.data.result
        .filter((trainer: Trainer) =>
          trainer.full_name
            .toLowerCase()
            .includes(debouncedQuery.toLowerCase()),
        )
        .slice(0, 5); // Limit to 5 results

      return { data: { result: filteredTrainers } };
    },
    enabled: debouncedQuery.length > 2,
    staleTime: 30000, // 30 seconds
  });

  const searchResults: SearchResults = {
    foods: foodResults?.results || [],
    recipes: recipeResults?.result || [],
    trainers: trainerResults?.data.result || [],
    isLoading: isLoadingFoods || isLoadingRecipes || isLoadingTrainers,
    hasResults:
      (foodResults?.results?.length || 0) > 0 ||
      (recipeResults?.result?.length || 0) > 0 ||
      (trainerResults?.data.result?.length || 0) > 0,
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    setIsOpen(value.length > 0);
  };

  const handleClearSearch = () => {
    setQuery("");
    setDebouncedQuery("");
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleFoodClick = () => {
    setIsOpen(false);
    setQuery("");
    // Navigate to food page or show food detail modal
    navigate("/food");
    // You can extend this to pass the food ID or open a modal
  };

  const handleRecipeClick = () => {
    setIsOpen(false);
    setQuery("");
    // Navigate to recipes page
    navigate("/recipes");
    // You can extend this to pass the recipe ID or open a detail view
  };

  const handleTrainerClick = () => {
    setIsOpen(false);
    setQuery("");
    // Navigate to trainers page
    navigate("/trainers");
    // You can extend this to pass the trainer ID or open a detail view
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div ref={searchRef} className={`relative ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 ltr:left-0 rtl:right-0 ltr:pl-3 rtl:pr-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          name="search"
          autoComplete="off"
          placeholder="Search foods, recipes, trainers..."
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          className="w-64 lg:w-80 ltr:pl-10 rtl:pr-10 ltr:pr-10 rtl:pl-10 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
        />
        {query && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 ltr:right-0 rtl:left-0 ltr:pr-3 rtl:pl-3 flex items-center"
          >
            <X className="h-4 w-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      {isOpen && query.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
          {query.length <= 2 ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              Type at least 3 characters to search...
            </div>
          ) : searchResults.isLoading ? (
            <div className="p-4 text-center">
              <Loader2 className="h-5 w-5 animate-spin mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Searching...
              </p>
            </div>
          ) : !searchResults.hasResults ? (
            <div className="p-4 text-sm text-gray-500 dark:text-gray-400 text-center">
              No results found for "{query}"
            </div>
          ) : (
            <div className="py-2">
              {/* Food Results */}
              {searchResults.foods.length > 0 && (
                <div>
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                    Food Items ({searchResults.foods.length})
                  </div>
                  {searchResults.foods.map((food) => (
                    <button
                      key={`food-${food.id}`}
                      onClick={handleFoodClick}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {food.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {food.secondary_food} • {food.calories} cal •{" "}
                          {food.quantity}
                          {food.unit}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Recipe Results */}
              {searchResults.recipes.length > 0 && (
                <div
                  className={
                    searchResults.foods.length > 0
                      ? "border-t border-gray-100 dark:border-gray-700"
                      : ""
                  }
                >
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                    Recipes ({searchResults.recipes.length})
                  </div>
                  {searchResults.recipes.map((recipe) => (
                    <button
                      key={`recipe-${recipe.id}`}
                      onClick={handleRecipeClick}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="flex-shrink-0">
                        <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                          <ChefHat className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {recipe.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {recipe.meal_type ? `${recipe.meal_type} • ` : ""}
                          {recipe.time_to_make
                            ? `${recipe.time_to_make} min`
                            : "Recipe"}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* Trainers Results */}
              {searchResults.trainers.length > 0 && (
                <div
                  className={
                    searchResults.foods.length > 0 ||
                    searchResults.recipes.length > 0
                      ? "border-t border-gray-100 dark:border-gray-700"
                      : ""
                  }
                >
                  <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide border-b border-gray-100 dark:border-gray-700">
                    Trainers ({searchResults.trainers.length})
                  </div>
                  {searchResults.trainers.map((trainer) => (
                    <button
                      key={`trainer-${trainer.id}`}
                      onClick={handleTrainerClick}
                      className="w-full px-4 py-3 flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <div className="flex-shrink-0">
                        {trainer.avatar ? (
                          <img
                            src={buildImageUrl(trainer.avatar)}
                            alt={trainer.full_name}
                            className="w-10 h-10 rounded-full object-cover"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/assets/placeholder_avatar.svg";
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                            <User className="w-5 h-5 text-green-600 dark:text-green-400" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {trainer.full_name}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          ⭐ {trainer.rating?.toFixed(1) || "N/A"} •{" "}
                          {trainer.reviews} reviews
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
