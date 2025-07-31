import React from "react";
import { Search, WifiOff } from "lucide-react";

interface UnifiedHeaderProps {
  // Content props
  title: string;
  description?: string;
  icon?: React.ReactNode;

  // Gradient color scheme
  gradientColors?: {
    from: string;
    via: string;
    to: string;
  };

  // Search functionality
  searchValue: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit?: (e: React.FormEvent) => void;
  onSearchKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  searchPlaceholder?: string;
  isSearching?: boolean;

  // Search buttons (for Food page style)
  showSearchButton?: boolean;
  showClearButton?: boolean;
  onClear?: () => void;

  // Action buttons
  actionButtons?: React.ReactNode;

  // Status indicators
  showDemoData?: boolean;
  demoDataText?: string;

  // Additional content
  children?: React.ReactNode;

  // Container styling
  className?: string;
}

const defaultGradientColors = {
  from: "from-pink-500",
  via: "via-fuchsia-600",
  to: "to-indigo-600",
};

export const UnifiedHeader: React.FC<UnifiedHeaderProps> = ({
  title,
  description,
  icon,
  gradientColors = defaultGradientColors,
  searchValue,
  onSearchChange,
  onSearchSubmit,
  onSearchKeyPress,
  searchPlaceholder = "Search...",
  isSearching = false,
  showSearchButton = false,
  showClearButton = false,
  onClear,
  actionButtons,
  showDemoData = false,
  demoDataText = "Demo Data",
  children,
  className = "",
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(e.target.value);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.(e);
  };

  const handleSearchKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    onSearchKeyPress?.(e);
  };

  const handleClear = () => {
    onClear?.();
  };

  return (
    <div
      className={`bg-gradient-to-br ${gradientColors.from} ${gradientColors.via} ${gradientColors.to} text-white mx-4 mt-4 rounded-2xl ${className}`}
    >
      <div className="container mx-auto px-4 py-8">
        {/* Header Row */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            {icon && <div className="text-white">{icon}</div>}
            <h1 className="text-3xl font-bold">{title}</h1>
          </div>

          <div className="flex items-center gap-3">
            {showDemoData && (
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                <WifiOff size={16} className="mr-2" />
                {demoDataText}
              </div>
            )}
            {actionButtons}
          </div>
        </div>

        {/* Description */}
        {description && <p className="text-white/80 mb-6">{description}</p>}

        {/* Search Bar */}
        <div className="max-w-md">
          <form onSubmit={handleSearchSubmit} className="relative">
            {showSearchButton || showClearButton ? (
              // Food page style with search and clear buttons
              <div className="relative flex">
                <div className="relative flex-1">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="search"
                    placeholder={searchPlaceholder}
                    value={searchValue}
                    onChange={handleSearchChange}
                    onKeyDown={handleSearchKeyPress}
                    className="w-full pl-10 pr-4 py-3 rounded-l-lg text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white/20"
                  />
                </div>

                {showSearchButton && (
                  <button
                    type="submit"
                    disabled={isSearching}
                    className="bg-white/20 hover:bg-white/30 disabled:bg-white/10 text-white px-6 py-3 font-medium transition-colors flex items-center gap-2 border-l border-white/20"
                  >
                    {isSearching ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <Search size={20} />
                    )}
                    Search
                  </button>
                )}

                {showClearButton && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-r-lg font-medium transition-colors"
                    title="Clear search"
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              // Simple search style (Trainers/Recipes page style)
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder={searchPlaceholder}
                  value={searchValue}
                  onChange={handleSearchChange}
                  onKeyDown={handleSearchKeyPress}
                  className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 border-0 focus:ring-2 focus:ring-white/20"
                />
                {isSearching && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Additional content */}
        {children}
      </div>
    </div>
  );
};
