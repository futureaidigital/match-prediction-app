interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      // Show pages around current page
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) {
          pages.push(i);
        }
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      // Always show last page
      if (!pages.includes(totalPages)) {
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <div className="flex items-center justify-center gap-2">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={!canGoPrevious}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
          canGoPrevious
            ? 'border border-gray-300 bg-white text-gray-600 hover:bg-gray-50'
            : 'border border-gray-200 bg-white text-gray-300 cursor-not-allowed'
        }`}
        aria-label="Previous page"
      >
        <img
          src="/arrow-down.svg"
          alt=""
          className="w-[15px] h-auto rotate-90"
          style={{ opacity: canGoPrevious ? 1 : 0.4 }}
        />
      </button>

      {/* Page Numbers */}
      {pageNumbers.map((page, index) => (
        page === '...' ? (
          <span
            key={`ellipsis-${index}`}
            className="w-10 h-10 flex items-center justify-center text-gray-400 text-sm"
          >
            ...
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`w-10 h-10 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
              currentPage === page
                ? 'border-2 border-[#091143] bg-white text-[#091143]'
                : 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            {page}
          </button>
        )
      ))}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={!canGoNext}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors ${
          canGoNext
            ? 'bg-[#091143] text-white hover:bg-[#0a1452]'
            : 'border border-gray-200 bg-white text-gray-300 cursor-not-allowed'
        }`}
        aria-label="Next page"
      >
        <img
          src="/arrow-down.svg"
          alt=""
          className="w-[15px] h-auto -rotate-90"
          style={{ filter: canGoNext ? 'brightness(0) invert(1)' : 'opacity(0.4)' }}
        />
      </button>
    </div>
  );
}
