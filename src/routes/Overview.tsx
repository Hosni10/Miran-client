import React, { useEffect, useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Activity,
  DollarSign,
  Heart,
  Zap,
  Award,
  Calendar,
  Utensils,
  Database,
  ChefHat,
} from "lucide-react";
import StatsCard from "../components/ui/StatsCard";
import { dashboardStats, recentActivity } from "../lib/mockData";
import { WithRole } from "../components/withRole";
import { fetchFoodPage } from "../lib/api";
import { fetchTrainerPage } from "../api/trainers";
import type { FoodItem } from "../lib/api";
import type { Trainer } from "../types/trainer";
import type { RecipeShallow } from "../types/recipe";
import { buildImageUrl } from "../utils/imageUrl";
import { api } from "../lib/api";

export default function Overview() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  // State for API data
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [totalFoodCount, setTotalFoodCount] = useState<number>(0);
  const [secondaryFoodCount, setSecondaryFoodCount] = useState<number>(0);
  const [recipes, setRecipes] = useState<RecipeShallow[]>([]);
  const [totalRecipeCount, setTotalRecipeCount] = useState<number>(0);
  const [trainers, setTrainers] = useState<Trainer[]>([]);
  const [loadingFoods, setLoadingFoods] = useState(true);
  const [loadingRecipes, setLoadingRecipes] = useState(true);
  const [loadingTrainers, setLoadingTrainers] = useState(true);
  const [showAllTrainers, setShowAllTrainers] = useState(false);

  // Cache keys and expiration times (30 minutes)
  const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
  const CACHE_VERSION = "v2"; // Increment this to invalidate old cache
  const FOOD_CACHE_KEY = `overview_food_data_${CACHE_VERSION}`;
  const RECIPES_CACHE_KEY = `overview_recipes_data_${CACHE_VERSION}`;
  const TRAINER_CACHE_KEY = "overview_trainer_data";

  // Cache utility functions
  const getCachedData = (key: string) => {
    try {
      const cached = localStorage.getItem(key);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (error) {
      console.error("Error reading cache:", error);
    }
    return null;
  };

  const setCachedData = (key: string, data: any) => {
    try {
      localStorage.setItem(
        key,
        JSON.stringify({
          data,
          timestamp: Date.now(),
        }),
      );
    } catch (error) {
      console.error("Error setting cache:", error);
    }
  };

  // Fetch food data
  useEffect(() => {
    const fetchFoodData = async () => {
      try {
        setLoadingFoods(true);

        // Check cache first
        const cachedData = getCachedData(FOOD_CACHE_KEY);
        if (
          cachedData &&
          cachedData.foods &&
          typeof cachedData.totalCount === "number"
        ) {
          setFoods(cachedData.foods);
          setTotalFoodCount(cachedData.totalCount);
          setSecondaryFoodCount(cachedData.secondaryCount || 0);
          setLoadingFoods(false);
          return;
        }

        // Get accurate count first, then fetch data
        const countResponse = await fetchFoodPage(
          "/v1/resources/food_list?limit=1&offset=0",
        );
        const totalCount = countResponse.data.count || 0;

        // Fetch a reasonable sample or use the count
        const limitToFetch = Math.min(totalCount, 1000); // Fetch up to 1000 for detailed analysis
        const response = await fetchFoodPage(
          `/v1/resources/food_list?limit=${limitToFetch}&offset=0`,
        );
        const foodData = response.data.result || [];

        // Set the food data and store total count for display
        setFoods(foodData);
        setTotalFoodCount(totalCount);

        // Store real total count separately for display
        if (totalCount !== foodData.length) {
          console.log(
            `📊 Overview: Showing ${foodData.length} food items out of ${totalCount} total`,
          );
        }

        // Count secondary foods (items with secondary_food property)
        const secondaryCount = foodData.filter(
          (food: FoodItem) => food.secondary_food,
        ).length;
        setSecondaryFoodCount(secondaryCount);

        // Cache the data with total count
        setCachedData(FOOD_CACHE_KEY, {
          foods: foodData,
          totalCount,
          secondaryCount,
        });
      } catch (error) {
        console.error("Error fetching food data:", error);
        setFoods([]);
        setTotalFoodCount(0);
        setSecondaryFoodCount(0);
      } finally {
        setLoadingFoods(false);
      }
    };

    fetchFoodData();
  }, []);

  // Fetch recipes data
  useEffect(() => {
    const fetchRecipesData = async () => {
      try {
        setLoadingRecipes(true);

        // Check cache first
        const cachedData = getCachedData(RECIPES_CACHE_KEY);
        if (
          cachedData &&
          cachedData.recipes &&
          typeof cachedData.totalCount === "number"
        ) {
          setRecipes(cachedData.recipes);
          setTotalRecipeCount(cachedData.totalCount);
          setLoadingRecipes(false);
          return;
        }

        // Get total count first, then fetch reasonable sample
        const countResponse = await api.get<{
          result: RecipeShallow[];
          count: number;
        }>("/miran_prime/recipes/?limit=1&offset=0");
        const totalRecipes = countResponse.data.count || 0;

        // Fetch up to 100 recipes for analysis but show real total count
        const response = await api.get<{
          result: RecipeShallow[];
          count: number;
        }>("/miran_prime/recipes/?limit=100");
        const recipesData = response.data.result || [];
        setRecipes(recipesData);
        setTotalRecipeCount(totalRecipes);

        if (totalRecipes !== recipesData.length) {
          console.log(
            `📊 Overview: Showing ${recipesData.length} recipes out of ${totalRecipes} total`,
          );
        }

        // Cache the data with total count
        setCachedData(RECIPES_CACHE_KEY, {
          recipes: recipesData,
          totalCount: totalRecipes,
        });
      } catch (error) {
        console.error("Error fetching recipes data:", error);
        setRecipes([]);
        setTotalRecipeCount(0);
      } finally {
        setLoadingRecipes(false);
      }
    };

    fetchRecipesData();
  }, []);

  // Fetch trainer data
  useEffect(() => {
    const fetchTrainerData = async () => {
      try {
        setLoadingTrainers(true);

        // Check cache first
        const cachedData = getCachedData(TRAINER_CACHE_KEY);
        if (cachedData) {
          setTrainers(cachedData);
          setLoadingTrainers(false);
          return;
        }

        const response = await fetchTrainerPage(1, 50); // Get all trainers
        const trainerData = response.data.result || [];
        setTrainers(trainerData);

        // Cache the data
        setCachedData(TRAINER_CACHE_KEY, trainerData);
      } catch (error) {
        console.error("Error fetching trainer data:", error);
        setTrainers([]);
      } finally {
        setLoadingTrainers(false);
      }
    };

    fetchTrainerData();
  }, []);

  // Memoized display values
  const displayValues = useMemo(() => {
    try {
      const actualTotalFoods = Math.max(0, totalFoodCount || foods.length || 0);
      const actualSecondaryCount = Math.max(0, secondaryFoodCount || 0);
      const actualRecipeCount = Math.max(
        0,
        totalRecipeCount || recipes.length || 0,
      );
      const FOOD_LIMIT = 10000;
      const isAtFoodLimit = actualTotalFoods >= FOOD_LIMIT;

      return {
        totalFoods: isAtFoodLimit
          ? `${actualTotalFoods.toLocaleString()}+`
          : actualTotalFoods.toLocaleString(),
        secondaryFoods: actualSecondaryCount.toLocaleString(),
        genericFoods: Math.max(
          0,
          actualTotalFoods - actualSecondaryCount,
        ).toLocaleString(),
        totalRecipes: actualRecipeCount.toLocaleString(),
        isAtFoodLimit,
      };
    } catch (error) {
      console.error("Error calculating display values:", error);
      return {
        totalFoods: "0",
        secondaryFoods: "0",
        genericFoods: "0",
        totalRecipes: "0",
        isAtFoodLimit: false,
      };
    }
  }, [
    totalFoodCount,
    foods.length,
    secondaryFoodCount,
    totalRecipeCount,
    recipes.length,
  ]);

  const visibleTrainers = useMemo(() => {
    return showAllTrainers ? trainers : trainers.slice(0, 4);
  }, [trainers, showAllTrainers]);

  const stats = [
    {
      title: t("overview.totalUsers"),
      value: dashboardStats.totalUsers.toLocaleString(), // TODO: Replace with real users endpoint when available
      change: "+12.5%",
      trend: "up" as const,
      icon: Users,
      color: "primary" as const,
    },
    {
      title: t("overview.activeUsers"),
      value: dashboardStats.activeUsers.toLocaleString(), // TODO: Replace with real users endpoint when available
      change: "+8.2%",
      trend: "up" as const,
      icon: Activity,
      color: "secondary" as const,
    },
    {
      title: t("overview.revenue"),
      value: `$${(dashboardStats.monthlyRevenue / 1000).toFixed(0)}k`,
      change: "+15.3%",
      trend: "up" as const,
      icon: DollarSign,
      color: "accent" as const,
    },
    {
      title: t("overview.trainers"),
      value: trainers.length.toLocaleString(),
      change: loadingTrainers
        ? "..."
        : `${trainers.filter((t) => t.available).length} available`,
      trend: "up" as const,
      icon: Users,
      color: "primary" as const,
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <Heart className="w-8 h-8 text-red-500 mr-3 animate-pulse" />
            {t("overview.title")}
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            {t("overview.subtitle")}
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <WithRole resource="users" action="create">
            <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-primary-700 hover:from-primary-700 hover:to-primary-800 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <Users className="w-4 h-4 mr-2" />
              {t("overview.addUser")}
            </button>
          </WithRole>
          <WithRole resource="workouts" action="create">
            <button className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105">
              <Zap className="w-4 h-4 mr-2" />
              {t("overview.createWorkout")}
            </button>
          </WithRole>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={stat.title}
            className="animate-slide-up"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <StatsCard {...stat} />
          </div>
        ))}
      </div>

      {/* Food & Trainer Stats Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Food & Recipes Stats */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl shadow-soft border border-blue-200 dark:border-blue-800 p-6 animate-slide-up hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Utensils className="w-5 h-5 text-blue-600 mr-2" />
            Content Database
          </h3>

          {loadingFoods || loadingRecipes ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400">
                {t("common.loading")}
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Main Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Total Foods */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-blue-100 dark:border-blue-800 hover:shadow-md transition-all duration-200 group">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <Utensils className="w-7 h-7" />
                    </div>
                    <div className="space-y-1 overflow-hidden">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white text-clip overflow-hidden">
                        {displayValues.totalFoods}
                      </p>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">
                        Food Items
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {displayValues.isAtFoodLimit
                          ? "Max limit reached"
                          : "Database entries"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total Recipes */}
                <div className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-orange-100 dark:border-orange-800 hover:shadow-md transition-all duration-200 group">
                  <div className="text-center">
                    <div className="w-14 h-14 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white shadow-lg mx-auto mb-3 group-hover:scale-110 transition-transform">
                      <ChefHat className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {displayValues.totalRecipes}
                      </p>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">
                        Recipes
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {recipes.filter((recipe) => recipe.meal_type).length}{" "}
                        categorized
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 space-y-3">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                  Breakdown
                </h4>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center">
                      <Award className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Secondary Foods
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {displayValues.secondaryFoods}
                    </span>
                    <span className="text-xs text-green-600 dark:text-green-400 ml-2">
                      {secondaryFoodCount > 0
                        ? Math.round((secondaryFoodCount / foods.length) * 100)
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center">
                      <Database className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Generic Items
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {displayValues.genericFoods}
                    </span>
                    <span className="text-xs text-purple-600 dark:text-purple-400 ml-2">
                      {foods.length > 0
                        ? Math.round(
                            ((foods.length - secondaryFoodCount) /
                              foods.length) *
                              100,
                          )
                        : 0}
                      %
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-amber-500 to-amber-600 rounded-lg flex items-center justify-center">
                      <ChefHat className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Recipe Categories
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-gray-900 dark:text-white">
                      {
                        new Set(
                          recipes
                            .filter((r) => r.meal_type)
                            .map((r) => r.meal_type),
                        ).size
                      }
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 ml-2">
                      types
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/food")}
                  className="flex items-center justify-center px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <Utensils className="w-4 h-4 mr-2" />
                  Browse Foods
                </button>
                <button
                  onClick={() => navigate("/recipes")}
                  className="flex items-center justify-center px-4 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  <ChefHat className="w-4 h-4 mr-2" />
                  View Recipes
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Trainer List */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl shadow-soft border border-green-200 dark:border-green-800 p-6 animate-slide-up hover:shadow-lg transition-all duration-300">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
            <Users className="w-5 h-5 text-green-600 mr-2" />
            {t("overview.trainers")}
          </h3>

          <div className="space-y-3">
            {loadingTrainers ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-3"></div>
                <p className="text-gray-500 dark:text-gray-400">
                  {t("common.loading")}
                </p>
              </div>
            ) : trainers.length > 0 ? (
              visibleTrainers.map((trainer, index) => (
                <div
                  key={trainer.id}
                  className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-green-100 dark:border-green-800 hover:shadow-md transition-all duration-200 group"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={buildImageUrl(trainer.avatar)}
                        alt={trainer.full_name}
                        className="w-14 h-14 rounded-full object-cover border-2 border-green-200 dark:border-green-700 shadow-sm group-hover:border-green-300 dark:group-hover:border-green-600 transition-colors"
                        onError={(e) => {
                          e.currentTarget.src =
                            "/assets/placeholder_avatar.svg";
                        }}
                      />
                      <div
                        className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-gray-800 ${
                          trainer.available ? "bg-green-500" : "bg-red-500"
                        }`}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                        {trainer.full_name}
                      </h4>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          {trainer.nationality?.name || "International"}
                        </span>
                        <span className="text-xs text-gray-400">•</span>
                        <div className="flex items-center space-x-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                            {trainer.rating ? trainer.rating.toFixed(2) : "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                        ${trainer.price || 0}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        SAR
                      </p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">
                  No trainers available
                </p>
              </div>
            )}
          </div>

          {trainers.length > 0 && (
            <div className="mt-6 pt-4 border-t border-green-200 dark:border-green-800 space-y-3">
              {trainers.length > 4 && (
                <button
                  onClick={() => setShowAllTrainers(!showAllTrainers)}
                  className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md flex items-center justify-center"
                >
                  {showAllTrainers ? (
                    <>
                      Show Less
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 15l7-7 7 7"
                        />
                      </svg>
                    </>
                  ) : (
                    <>
                      Show All Trainers ({trainers.length - 4} more)
                      <svg
                        className="w-4 h-4 ml-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </>
                  )}
                </button>
              )}
              <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md">
                View all trainers ({trainers.length})
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity - Full Width */}
      <div className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 rounded-xl shadow-soft border border-indigo-200 dark:border-indigo-800 p-6 animate-slide-up hover:shadow-lg transition-all duration-300">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
          <Calendar className="w-5 h-5 text-indigo-600 mr-2" />
          {t("overview.recentActivity")}
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentActivity.slice(0, 6).map((activity, index) => (
            <div
              key={activity.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-indigo-100 dark:border-indigo-800 hover:shadow-md transition-all duration-200 group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-start space-x-3">
                <img
                  src={activity.avatar}
                  alt={activity.user}
                  className="w-10 h-10 rounded-full object-cover border-2 border-indigo-200 dark:border-indigo-700 shadow-sm"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {activity.user}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
                    {activity.action}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500 dark:text-gray-500">
                      {activity.time}
                    </p>
                    <div
                      className={`w-2 h-2 rounded-full ${
                        activity.type === "workout"
                          ? "bg-green-500"
                          : activity.type === "achievement"
                            ? "bg-yellow-500"
                            : "bg-blue-500"
                      }`}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 pt-4 border-t border-indigo-200 dark:border-indigo-800 text-center">
          <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-sm hover:shadow-md">
            View all activity
          </button>
        </div>
      </div>
    </div>
  );
}
