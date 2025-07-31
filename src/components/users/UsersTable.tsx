import React from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { ApiUser } from "../../services/userService";

interface UsersTableProps {
  users: ApiUser[];
  loading: boolean;
  error: Error | null;
  currentPage: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  onPageChange: (page: number) => void;
  onRetry: () => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  loading,
  error,
  currentPage,
  totalCount,
  hasNextPage,
  hasPreviousPage,
  onPageChange,
  onRetry,
}) => {
  const getRoleBadge = (role: string) => {
    const roleClasses = {
      admin: "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400",
      trainer:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400",
      operation:
        "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400",
    };

    return (
      <span
        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          roleClasses[role as keyof typeof roleClasses] ||
          "bg-gray-100 text-gray-700"
        }`}
      >
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  // Error state
  if (error && !loading) {
    const isUnauthorized = error.message === "Unauthorized";

    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-8">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {isUnauthorized ? "Unauthorized Access" : "Error Loading Users"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {isUnauthorized
              ? "You do not have permission to view this data."
              : "There was an error loading the users list."}
          </p>
          <button
            onClick={onRetry}
            className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Email
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                Joined At
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              // Loading state
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-200 dark:bg-gray-600 rounded-full"></div>
                      <div className="ml-4">
                        <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-32"></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-48"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-6 bg-gray-200 dark:bg-gray-600 rounded w-16"></div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-20"></div>
                  </td>
                </tr>
              ))
            ) : users.length === 0 ? (
              // Empty state
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center">
                  <div className="text-gray-500 dark:text-gray-400">
                    <p className="text-lg font-medium mb-2">No users found</p>
                    <p className="text-sm">There are no users to display.</p>
                  </div>
                </td>
              </tr>
            ) : (
              // Data rows
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-medium">
                          {getInitials(user.first_name, user.last_name)}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.first_name} {user.last_name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.is_active ? "Active" : "Inactive"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {formatDate(user.date_joined)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {!loading && users.length > 0 && (
        <div className="bg-white dark:bg-gray-800 px-6 py-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing page <span className="font-medium">{currentPage}</span> of{" "}
              <span className="font-medium">{totalCount}</span> total users
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onPageChange(currentPage - 1)}
                disabled={!hasPreviousPage || loading}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="px-3 py-1 bg-primary-600 text-white rounded text-sm">
                {currentPage}
              </span>
              <button
                onClick={() => onPageChange(currentPage + 1)}
                disabled={!hasNextPage || loading}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading overlay for pagination */}
      {loading && users.length > 0 && (
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary-600" />
        </div>
      )}
    </div>
  );
};
