export default function Pagination({ page, totalPages, onPage }) {
  if (totalPages <= 1) return null

  return (
    <nav className="pagination" aria-label="Results pages">
      <button
        className="page-btn"
        onClick={() => onPage(page - 1)}
        disabled={page === 1}
        aria-label="Go to previous page"
      >
        ← Previous
      </button>

      <span className="page-indicator" aria-current="page">
        Page {page} of {totalPages}
      </span>

      <button
        className="page-btn"
        onClick={() => onPage(page + 1)}
        disabled={page === totalPages}
        aria-label="Go to next page"
      >
        Next →
      </button>
    </nav>
  )
}
