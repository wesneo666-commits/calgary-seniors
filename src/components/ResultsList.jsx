import { useEffect, useRef, useState } from 'react'
import ProgramCard from './ProgramCard.jsx'
import FilterChips from './FilterChips.jsx'
import Pagination from './Pagination.jsx'
import { QUADRANTS, SERVICE_AREAS } from '../utils/constants.js'
import { PAGE_SIZE, isFilterActive } from '../App.jsx'

function emptyMessage(filters) {
  const { query, quadrant, serviceArea, cost } = filters
  const qLabel = quadrant.length > 0
    ? quadrant.map((q) => QUADRANTS.find((qq) => qq.value === q)?.label ?? q).join(', ')
    : null
  const sLabel = serviceArea ? (SERVICE_AREAS.find((s) => s.value === serviceArea)?.label ?? serviceArea) : null

  if (query && quadrant.length > 0) {
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
  if (quadrant.length > 0 && serviceArea) {
    return {
      heading: `No ${sLabel} programs in ${qLabel}`,
      hint: 'Try selecting "All of Calgary" to see programs city-wide, or choose a different service type.',
    }
  }
  if (quadrant.length > 0) {
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
  const isFiltered = Object.values(filters).some(isFilterActive)
  const isEmpty = totalResults === 0
  const { heading, hint } = isEmpty ? emptyMessage(filters) : {}

  const rangeStart = totalResults === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, totalResults)

  // Visible (not just screen-reader) confirmation that results actually
  // changed after a filter/search edit — a brief highlight, not just the
  // aria-live announcement below (V4 mobile P0, 2026-07-24).
  const [flash, setFlash] = useState(false)
  const isFirstRender = useRef(true)
  useEffect(() => {
    if (isFirstRender.current) { isFirstRender.current = false; return }
    setFlash(true)
    const t = setTimeout(() => setFlash(false), 900)
    return () => clearTimeout(t)
  }, [totalResults])

  return (
    <div className="results-area">
      <FilterChips filters={filters} onRemove={onRemove} />

      <div className="results-toolbar">
        <p
          className={`results-summary${flash ? ' results-summary--flash' : ''}`}
          aria-live="polite"
          aria-atomic="true"
        >
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
          <div className="toolbar-right">
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
