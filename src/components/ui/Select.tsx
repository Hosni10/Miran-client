import React, { useState, useMemo } from "react";
import { ChevronDown, Search } from "lucide-react";

export interface SelectOption {
  value: string | number;
  label: string;
  icon?: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string | number;
  onChange: (value: string | number) => void;
  placeholder?: string;
  searchable?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = "Select an option",
  searchable = false,
  disabled = false,
  error,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm) return options;
    return options.filter((option) =>
      option.label.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [options, searchTerm, searchable]);

  const handleSelect = (option: SelectOption) => {
    onChange(option.value);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setIsOpen(false);
      setSearchTerm("");
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full px-3 py-2 text-left bg-white dark:bg-gray-700 border rounded-lg 
          focus:ring-2 focus:ring-blue-500 focus:border-transparent
          flex items-center justify-between
          ${error ? "border-red-500" : "border-gray-300 dark:border-gray-600"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer hover:border-gray-400"}
          transition-colors
        `}
      >
        <span className="flex items-center gap-2">
          {selectedOption?.icon && (
            <img
              src={selectedOption.icon}
              alt=""
              className="w-4 h-4 rounded object-cover"
              onError={(e) => (e.currentTarget.style.display = "none")}
            />
          )}
          <span
            className={
              selectedOption
                ? "text-gray-900 dark:text-white"
                : "text-gray-500 dark:text-gray-400"
            }
          >
            {selectedOption?.label || placeholder}
          </span>
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg">
          {searchable && (
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  autoComplete="off"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Search..."
                  className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  autoFocus
                />
              </div>
            </div>
          )}

          <div className="max-h-60 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option)}
                  className={`
                    w-full px-3 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 
                    flex items-center gap-2 text-sm transition-colors
                    ${option.value === value ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400" : "text-gray-900 dark:text-white"}
                  `}
                >
                  {option.icon && (
                    <img
                      src={option.icon}
                      alt=""
                      className="w-4 h-4 rounded object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  )}
                  {option.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No options found
              </div>
            )}
          </div>
        </div>
      )}

      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}

      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};
