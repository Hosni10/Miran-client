/**
 * @deprecated This component has been replaced by FoodListScreen which uses real API data.
 * This file is kept for reference but is no longer used in the application.
 * The new component is located at src/screens/FoodListScreen.tsx
 */
import React, { useState } from "react";
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
} from "lucide-react";

export default function Food() {
  const [activeTab, setActiveTab] = useState<"products" | "ingredients">(
    "products",
  );
  const [searchTerm, setSearchTerm] = useState("");

  const products = [
    {
      id: 1,
      name: "Grilled Chicken Breast",
      category: "Protein",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      status: "active",
    },
    {
      id: 2,
      name: "Brown Rice",
      category: "Carbs",
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      status: "active",
    },
    {
      id: 3,
      name: "Avocado",
      category: "Healthy Fats",
      calories: 234,
      protein: 2.9,
      carbs: 12,
      fat: 21,
      status: "active",
    },
    {
      id: 4,
      name: "Greek Yogurt",
      category: "Protein",
      calories: 100,
      protein: 17,
      carbs: 6,
      fat: 0.4,
      status: "inactive",
    },
  ];

  const ingredients = [
    {
      id: 1,
      name: "Chicken Breast",
      unit: "100g",
      calories: 165,
      protein: 31,
      carbs: 0,
      fat: 3.6,
      fiber: 0,
    },
    {
      id: 2,
      name: "Brown Rice",
      unit: "100g",
      calories: 216,
      protein: 5,
      carbs: 45,
      fat: 1.8,
      fiber: 1.8,
    },
    {
      id: 3,
      name: "Spinach",
      unit: "100g",
      calories: 23,
      protein: 2.9,
      carbs: 3.6,
      fat: 0.4,
      fiber: 2.2,
    },
    {
      id: 4,
      name: "Olive Oil",
      unit: "1 tbsp",
      calories: 119,
      protein: 0,
      carbs: 0,
      fat: 13.5,
      fiber: 0,
    },
  ];

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const filteredIngredients = ingredients.filter((ingredient) =>
    ingredient.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      active:
        "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
      inactive: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClasses[status as keyof typeof statusClasses]}`}
      >
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Food Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage food products and ingredients for nutrition tracking
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add {activeTab === "products" ? "Product" : "Ingredient"}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab("products")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "products"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab("ingredients")}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "ingredients"
                  ? "border-primary-500 text-primary-600 dark:text-primary-400"
                  : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
              }`}
            >
              Ingredients ({ingredients.length})
            </button>
          </nav>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            <div className="relative flex-1 max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option>All Categories</option>
                <option>Protein</option>
                <option>Carbs</option>
                <option>Healthy Fats</option>
                <option>Vegetables</option>
              </select>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-x-auto">
          {activeTab === "products" ? (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nutrition (per 100g)
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {product.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 dark:bg-primary-900/20 dark:text-primary-400">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="grid grid-cols-4 gap-2 text-xs">
                          <div>
                            <span className="font-medium">
                              {product.calories}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              cal
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {product.protein}g
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              P
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {product.carbs}g
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              C
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">{product.fat}g</span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              F
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(product.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Ingredient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unit
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Nutrition Facts
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredIngredients.map((ingredient) => (
                  <tr
                    key={ingredient.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {ingredient.name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {ingredient.unit}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        <div className="grid grid-cols-5 gap-2 text-xs">
                          <div>
                            <span className="font-medium">
                              {ingredient.calories}
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              cal
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {ingredient.protein}g
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              P
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {ingredient.carbs}g
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              C
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {ingredient.fat}g
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              F
                            </span>
                          </div>
                          <div>
                            <span className="font-medium">
                              {ingredient.fiber}g
                            </span>
                            <span className="text-gray-500 dark:text-gray-400 ml-1">
                              Fiber
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors">
                          <Edit className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
