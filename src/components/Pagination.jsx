export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Results pages">
      <span className="page-indicator" aria-current="page">
        Page {page} of {totalPages}
      </span>

      {/* Previous/Next always stay grouped on one row, with the page
          indicator on its own row above — V4 mobile P0, 2026-07-24. */}
      <div className="pagination-buttons">
        <button
          className="page-btn"
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          aria-label="Go to previous page"
        >
          ← Previous
        </button>

        <button
          className="page-btn"
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          aria-label="Go to next page"
        >
          Next →
        </button>
      </div>
    </nav>
  )
}
