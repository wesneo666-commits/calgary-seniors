import ProgramCard from './ProgramCard.jsx'
import FilterChips from './FilterChips.jsx'
import Pagination from './Pagination.jsx'
import { QUADRANTS, SERVICE_AREAS } from '../utils/constants.js'
import { PAGE_SIZE } from '../App.jsx'

function emptyMessage(filters) {
  const { query, quadrant, serviceArea, cost } = filters
  const qLabel = quadrant ? (QUADRANTS.find((q) => q.value === quadrant)?.label ?? quadrant) : null
  const sLabel = serviceArea ? (SERVICE_AREAS.find((s) => s.value === serviceArea)?.label ?? serviceArea) : null

  if (query && quadrant) {
    return {
      heading: `No results for "${query}" in ${qLabel}`,
      hint: 'Try removing the location filter to search all of Calgary, or use different keywords.',
    }
  }
  if (query && serviceArea) {
    return {
      heading: `No "${sLabel}" programs match "${query}"`,
      hint: 'Try different keywords, or clear the service type filter to broaden your search.',
    }
  }
  if (query && cost) {
    return {
      heading: `No results for "${query}" with that cost filter`,
      hint: 'Try removing the cost filter to see all programs.',
    }
  }
  if (query) {
    return {
      heading: `No programs found for "${query}"`,
      hint: 'Check your spelling, try a shorter keyword, or browse using the filters on the left.',
    }
  }
  if (quadrant && serviceArea) {
    return {
      heading: `No ${sLabel} programs in ${qLabel}`,
      hint: 'Try selecting "All of Calgary" to see programs city-wide, or choose a different service type.',
    }
  }
  if (quadrant) {
    return {
      heading: `No programs found in ${qLabel} matching your filters`,
      hint: 'Try selecting "All of Calgary" or removing a filter.',
    }
  }
  return {
    heading: 'No programs found matching your filters',
    hint: 'Try removing one or more filters to see more results.',
  }
}

export default function ResultsList({
  results,
  totalResults,
  totalCount,
  filters,
  onRemove,
  onSelect,
  page,
  totalPages,
  onPage,
  sort,
  onSort,
}) {
  const isFiltered = Object.values(filters).some((v) => v !== '')
  const isEmpty = totalResults === 0
  const { heading, hint } = isEmpty ? emptyMessage(filters) : {}

  const rangeStart = totalResults === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, totalResults)

  return (
    <div className="results-area">
      <FilterChips filters={filters} onRemove={onRemove} />

      <div className="results-toolbar">
        <p className="results-summary" aria-live="polite" aria-atomic="true">
          {isFiltered
            ? totalPages > 1
              ? <>Showing <strong>{rangeStart}–{rangeEnd}</strong> of <strong>{totalResults}</strong> matching programs</>
              : <>Showing <strong>{totalResults}</strong> of <strong>{totalCount}</strong> programs</>
            : totalPages > 1
              ? <>Showing <strong>{rangeStart}–{rangeEnd}</strong> of all <strong>{totalCount}</strong> programs</>
              : <>Showing all <strong>{totalCount}</strong> programs</>
          }
        </p>

        {!isEmpty && (
          <div className="sort-control">
            <label htmlFor="sort-select" className="sort-label">Sort by</label>
            <select
              id="sort-select"
              className="sort-select"
              value={sort}
              onChange={(e) => onSort(e.target.value)}
            >
              <option value="relevance">Best match</option>
              <option value="name-az">Program name (A–Z)</option>
              <option value="org-az">Organization (A–Z)</option>
            </select>
          </div>
        )}
      </div>

      {!isEmpty && totalResults <= 4 && (
        <div className="low-results-banner" role="status">
          Only {totalResults} program{totalResults === 1 ? '' : 's'} match your current filters — try removing a filter to see more.
        </div>
      )}

      {isEmpty ? (
        <div className="empty-state" role="status">
          <p className="empty-heading">{heading}</p>
          <p className="empty-hint">{hint}</p>
        </div>
      ) : (
        <>
          <ul className="results-list" role="list">
            {results.map((program) => (
              <li key={program.id} role="listitem">
                <ProgramCard program={program} onSelect={onSelect} />
              </li>
            ))}
          </ul>

          <Pagination page={page} totalPages={totalPages} onPage={onPage} />
        </>
      )}
    </div>
  )
}
