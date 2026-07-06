interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

function getVisiblePages(page: number, totalPages: number): number[] {
  const maxButtons = 5;
  const startPage = Math.max(1, Math.min(page - 2, totalPages - maxButtons + 1));
  const endPage = Math.min(totalPages, startPage + maxButtons - 1);

  return Array.from({ length: Math.max(0, endPage - startPage + 1) }, (_, index) => startPage + index);
}

export function Pagination({ page, totalPages, totalItems, pageSize, onPageChange }: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages(page, totalPages);
  const startItem = (page - 1) * pageSize + 1;
  const endItem = Math.min(totalItems, page * pageSize);

  return (
    <nav className="pagination" aria-label="Task pagination">
      <p className="pagination-copy">
        Showing {startItem}-{endItem} of {totalItems} tasks
      </p>

      <div className="pagination-controls">
        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
        >
          Previous
        </button>

        <div className="page-number-group">
          {visiblePages.map((pageNumber) => (
            <button
              key={pageNumber}
              type="button"
              className={`page-number ${pageNumber === page ? 'page-number-active' : ''}`}
              onClick={() => onPageChange(pageNumber)}
              aria-current={pageNumber === page ? 'page' : undefined}
            >
              {pageNumber}
            </button>
          ))}
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
        >
          Next
        </button>
      </div>
    </nav>
  );
}
