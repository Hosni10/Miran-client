import React from "react";

interface PaginationButtonsProps {
  previous?: string | null;
  next?: string | null;
  onLoadPage: (url: string | null) => void;
  loading?: boolean;
  // New props for page numbers
  currentPage?: number;
  totalPages?: number;
  onPageClick?: (page: number) => void;
}

const PaginationButtons: React.FC<PaginationButtonsProps> = React.memo(
  ({
    previous,
    next,
    onLoadPage,
    loading = false,
    currentPage = 1,
    totalPages = 1,
    onPageClick,
  }) => {
    if (!previous && !next && totalPages <= 1) {
      return null;
    }

    // Generate page numbers to display
    const generatePageNumbers = () => {
      const pages: (number | string)[] = [];
      const maxVisiblePages = 7; // Show up to 7 page numbers

      if (totalPages <= maxVisiblePages) {
        // Show all pages if total is small
        for (let i = 1; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Smart pagination with ellipsis
        if (currentPage <= 4) {
          // Show: 1, 2, 3, 4, 5, ..., last
          for (let i = 1; i <= 5; i++) {
            pages.push(i);
          }
          pages.push("...");
          pages.push(totalPages);
        } else if (currentPage >= totalPages - 3) {
          // Show: 1, ..., last-4, last-3, last-2, last-1, last
          pages.push(1);
          pages.push("...");
          for (let i = totalPages - 4; i <= totalPages; i++) {
            pages.push(i);
          }
        } else {
          // Show: 1, ..., current-1, current, current+1, ..., last
          pages.push(1);
          pages.push("...");
          pages.push(currentPage - 1);
          pages.push(currentPage);
          pages.push(currentPage + 1);
          pages.push("...");
          pages.push(totalPages);
        }
      }

      return pages;
    };

    const pageNumbers = generatePageNumbers();

    const handlePageClick = (page: number) => {
      if (onPageClick && page !== currentPage && !loading) {
        onPageClick(page);
      }
    };

    return (
      <div className="flex items-center justify-center space-x-2 py-6">
        {/* Previous Button */}
        <button
          onClick={() => onLoadPage(previous || null)}
          disabled={!previous || loading}
          className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${
            !previous || loading
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95"
          }
        `}
        >
          <span className="text-lg font-bold">«</span>
          <span className="hidden sm:inline">Previous</span>
        </button>

        {/* Page Numbers */}
        {totalPages > 1 && onPageClick && (
          <div className="flex items-center space-x-1">
            {pageNumbers.map((page, index) => (
              <React.Fragment key={index}>
                {page === "..." ? (
                  <span className="px-3 py-2 text-gray-500 dark:text-gray-400">
                    ...
                  </span>
                ) : (
                  <button
                    onClick={() => handlePageClick(page as number)}
                    disabled={loading}
                    className={`
                    min-w-[40px] h-10 px-3 py-2 rounded-lg font-medium transition-all duration-200 text-sm
                    ${
                      page === currentPage
                        ? "bg-indigo-600 dark:bg-indigo-700 text-white shadow-md"
                        : loading
                          ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 active:scale-95"
                    }
                  `}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Next Button */}
        <button
          onClick={() => onLoadPage(next || null)}
          disabled={!next || loading}
          className={`
          flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200
          ${
            !next || loading
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-indigo-600 dark:bg-indigo-700 text-white hover:bg-indigo-700 dark:hover:bg-indigo-600 active:scale-95"
          }
        `}
        >
          <span className="hidden sm:inline">Next</span>
          <span className="text-lg font-bold">»</span>
        </button>
      </div>
    );
  },
);

PaginationButtons.displayName = "PaginationButtons";

export default PaginationButtons;
