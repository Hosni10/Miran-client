import React, { useState, useEffect } from "react";
import { Search, Filter, Download, Plus, Info } from "lucide-react";
import { useUsers } from "../hooks/useUsers";
import { UsersTable } from "../components/users/UsersTable";

export const UsersPage: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [showMockDataNotice, setShowMockDataNotice] = useState(false);
  const { data, isLoading, error, refetch } = useUsers(currentPage);

  // Check if we're using mock data by looking at console logs
  useEffect(() => {
    const originalConsoleLog = console.log;
    console.log = (...args) => {
      if (
        args[0] === "🔧 All API endpoints failed, falling back to mock data"
      ) {
        setShowMockDataNotice(true);
      }
      originalConsoleLog.apply(console, args);
    };

    return () => {
      console.log = originalConsoleLog;
    };
  }, []);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleRetry = () => {
    refetch();
  };

  const users = data?.results || [];
  const totalCount = data?.count || 0;
  const hasNextPage = !!data?.next;
  const hasPreviousPage = !!data?.previous;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            User Management
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage and monitor your Miran app users
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex space-x-3">
          <button className="inline-flex items-center px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition-colors shadow-sm">
            <Plus className="w-4 h-4 mr-2" />
            Add User
          </button>
        </div>
      </div>

      {/* Mock Data Notice */}
      {showMockDataNotice && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200">
                Displaying Mock Data
              </h3>
              <p className="mt-1 text-sm text-blue-700 dark:text-blue-300">
                The users API endpoint is not available yet. Showing sample data
                for demonstration purposes. Once the correct API endpoint is
                configured, real user data will be displayed.
              </p>
            </div>
            <button
              onClick={() => setShowMockDataNotice(false)}
              className="ml-3 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-200"
            >
              <span className="sr-only">Dismiss</span>×
            </button>
          </div>
        </div>
      )}

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0 sm:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            />
          </div>

          {/* Filters */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select className="border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent">
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="trainer">Trainer</option>
                <option value="operation">Operation</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <UsersTable
        users={users}
        loading={isLoading}
        error={error}
        currentPage={currentPage}
        totalCount={totalCount}
        hasNextPage={hasNextPage}
        hasPreviousPage={hasPreviousPage}
        onPageChange={handlePageChange}
        onRetry={handleRetry}
      />
    </div>
  );
};
