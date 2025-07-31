import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";
import { Tab } from "@headlessui/react";
import { Crown, Users, BarChart3, Settings } from "lucide-react";
import { UnifiedHeader } from "../components/ui/UnifiedHeader";
import PrimeSubscribersTab from "../features/PrimeSubscribers/PrimeSubscribersTab";

const PrimeSubscribersPage: React.FC = () => {
  const { t } = useTranslation();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchParams, setSearchParams] = useSearchParams();

  // Get search query from URL parameters
  const searchQuery = searchParams.get("search") || "";
  const [searchInput, setSearchInput] = useState(searchQuery);

  // Tab configuration - easily extendable for future tabs
  const tabs = [
    {
      id: "subscribers",
      label: "Subscribers",
      icon: Users,
      component: PrimeSubscribersTab,
    },
    // Future tabs can be added here:
    // {
    //   id: 'analytics',
    //   label: 'Analytics',
    //   icon: BarChart3,
    //   component: PrimeSubscribersAnalyticsTab,
    // },
    // {
    //   id: 'settings',
    //   label: 'Settings',
    //   icon: Settings,
    //   component: PrimeSubscribersSettingsTab,
    // },
  ];

  // Update URL search parameters
  const updateSearchParams = (
    updates: Record<string, string | number | null>,
  ) => {
    const newSearchParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "" || value === 1) {
        newSearchParams.delete(key);
      } else {
        newSearchParams.set(key, String(value));
      }
    });

    setSearchParams(newSearchParams);
  };

  // Search handlers - now integrated with URL state
  const handleSearchChange = (value: string) => {
    setSearchInput(value);
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    // Update URL with search query and reset page to 1
    updateSearchParams({ search: searchInput.trim(), page: null });
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    // Clear search from URL
    updateSearchParams({ search: null, page: null });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Unified Header */}
      <UnifiedHeader
        title="Prime Subscribers Dashboard"
        description="Manage your prime subscribers"
        icon={<Crown className="w-8 h-8 text-yellow-500" />}
        gradientColors={{
          from: "from-purple-500",
          via: "via-indigo-600",
          to: "to-blue-600",
        }}
        searchValue={searchInput}
        onSearchChange={handleSearchChange}
        onSearchSubmit={handleSearchSubmit}
        onSearchKeyPress={handleSearchKeyPress}
        onClear={handleClearSearch}
        searchPlaceholder="Search prime subscribers..."
        showSearchButton={true}
        showClearButton={!!searchInput}
      />

      {/* Content */}
      <div className="container mx-auto px-4 py-6">
        {/* Tabs Interface */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-soft border border-gray-200 dark:border-gray-700">
          <Tab.Group selectedIndex={selectedIndex} onChange={setSelectedIndex}>
            {/* Tab Navigation */}
            <div className="border-b border-gray-200 dark:border-gray-700">
              <nav className="flex space-x-8 px-6">
                <Tab.List className="flex space-x-8">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <Tab
                        key={tab.id}
                        className={({ selected }) =>
                          `py-4 px-1 border-b-2 font-medium text-sm transition-colors focus:outline-none flex items-center ${
                            selected
                              ? "border-yellow-500 text-yellow-600 dark:text-yellow-400"
                              : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                          }`
                        }
                      >
                        <Icon className="w-4 h-4 mr-2" />
                        {tab.label}
                      </Tab>
                    );
                  })}
                </Tab.List>
              </nav>
            </div>

            {/* Tab Content */}
            <Tab.Panels>
              {tabs.map((tab) => {
                const Component = tab.component;
                return (
                  <Tab.Panel key={tab.id} className="p-6">
                    {/* Pass search functionality to components */}
                    <Component
                      searchQuery={searchQuery}
                      onUpdateSearchParams={updateSearchParams}
                    />
                  </Tab.Panel>
                );
              })}
            </Tab.Panels>
          </Tab.Group>
        </div>
      </div>
    </div>
  );
};

export default PrimeSubscribersPage;
