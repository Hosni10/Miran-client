import React, { useState } from "react";
import { Search, AlertCircle, Ruler, WifiOff, Plus, Edit, Trash2, Eye } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchUnits } from "../api/units";
import { UnifiedHeader } from "../components/ui/UnifiedHeader";
import { useAuth } from "../contexts/AuthContext";
import { useAuthStore } from "../store/AuthStore";
import type { Unit } from "../types/unit";

export const UnitsPage: React.FC = () => {
  const { loading: authLoading } = useAuth();
  const { user: authStoreUser } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  // Check if user is super admin (Admin role)
  const isSuperAdmin = authStoreUser?.role === "Admin";

  // Use React Query for data fetching
  const { data: units, isFetching, isError, error } = useQuery({
    queryKey: ["units"],
    queryFn: fetchUnits,
    enabled: !authLoading,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter units based on search term
  const filteredUnits = units?.filter((unit) =>
    unit.title.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Loading state
  if (authLoading || (isFetching && !units)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 text-white">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mb-4"></div>
            <p className="text-white/80">
              {authLoading ? "Initializing authentication..." : "Loading units..."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError && !units) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-500 via-fuchsia-600 to-indigo-600">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col items-center justify-center min-h-96 text-white">
            <AlertCircle size={48} className="mb-4" />
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-white/80 text-center mb-4">
              {(error as any)?.response?.status === 401
                ? "Authentication required. Please log in again."
                : "Failed to load units data. Please try again."}
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Unified Header */}
      <UnifiedHeader
        title="Units Management"
        description="Manage measurement units for food and nutrition tracking"
        searchValue={searchTerm}
        onSearchChange={setSearchTerm}
        searchPlaceholder="Search units…"
        showSearchButton={false}
        showClearButton={false}
        actionButtons={
          isSuperAdmin && (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Plus size={20} />
              Add Unit
            </button>
          )
        }
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-8 pb-32">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-600 dark:text-gray-400">
            Showing {filteredUnits.length} of {units?.length || 0} units
          </p>
        </div>

        {/* Units Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Unit Name
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredUnits.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center">
                        <Ruler
                          size={48}
                          className="text-gray-300 dark:text-gray-600 mb-4"
                        />
                        <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                          {searchTerm ? "No units found" : "No units available"}
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchTerm
                            ? `No units match "${searchTerm}". Try a different search term.`
                            : "The units database is currently empty."}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredUnits.map((unit) => (
                    <tr
                      key={unit.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">
                          {unit.title}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button className="p-2 text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                          {isSuperAdmin && (
                            <>
                              <button className="p-2 text-gray-400 hover:text-secondary-600 dark:hover:text-secondary-400 transition-colors">
                                <Edit className="w-4 h-4" />
                              </button>
                              <button className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Loading indicator */}
        {isFetching && units && (
          <div className="flex justify-center mt-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        )}
      </div>

      {/* Add Unit Modal - Placeholder for future implementation */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Add New Unit
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This feature is coming soon. You'll be able to add new measurement units here.
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