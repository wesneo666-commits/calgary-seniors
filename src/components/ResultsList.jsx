import { useEffect, useRef, useState } from 'react'
import ProgramCard from './ProgramCard.jsx'
import FilterChips from './FilterChips.jsx'
import Pagination from './Pagination.jsx'
import { QUADRANTS, serviceAreaLabel } from '../utils/constants.js'
import { PAGE_SIZE_OPTIONS, isFilterActive } from '../App.jsx'

function emptyMessage(filters) {
  const { query, quadrant } = filters
  const asList = (v) => (Array.isArray(v) ? v : v ? [v] : [])
  const serviceArea = asList(filters.serviceArea).length > 0
  const cost = asList(filters.cost).length > 0
  const qLabel = quadrant.length > 0
    ? quadrant.map((q) => QUADRANTS.find((qq) => qq.value === q)?.label ?? q).join(', ')
    : null
  const sLabel = serviceArea ? asList(filters.serviceArea).map(serviceAreaLabel).join(' or ') : null

  if (query && quadrant.length > 0) {
    return {
      heading: `No results for "${query}" in ${qLabel}`,
      hint: 'Try removing the location filter to search all of Calgary, or use different keywords.',
    }
  }
  if (query && serviceArea) {
    return {
      heading: `No "${sLabel}" services match "${query}"`,
      hint: 'Try different keywords, or clear the service type filter to broaden your search.',
    }
  }
  if (query && cost) {
    return {
      heading: `No results for "${query}" with that cost filter`,
      hint: 'Try removing the cost filter to see all services.',
    }
  }
  if (query) {
    return {
      heading: `No services found for "${query}"`,
      hint: 'Check your spelling, try a shorter keyword, or browse using the filters on the left.',
    }
  }
  if (quadrant.length > 0 && serviceArea) {
    return {
      heading: `No ${sLabel} services in ${qLabel}`,
      hint: 'Try selecting "All" under Location to see services city-wide, or choose a different service type.',
    }
  }
  if (quadrant.length > 0) {
    return {
      heading: `No services found in ${qLabel} matching your filters`,
      hint: 'Try selecting "All" under Location, or removing a filter.',
    }
  }
  return {
    heading: 'No services found matching your filters',
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
  pageSize,
  onPageSize,
  onClearSearch,
}) {
  const isFiltered = Object.values(filters).some(isFilterActive)
  const isEmpty = totalResults === 0
  const { heading, hint } = isEmpty ? emptyMessage(filters) : {}

  const rangeStart = totalResults === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, totalResults)
  const noun = totalResults === 1 ? 'service' : 'services'

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
      {/* A clear, visible confirmation that a search or filter has been
          applied (V5 S-05/F-09): the count leads, the search term follows
          with its own Clear link, and the block briefly highlights. */}
      <div
        className={`results-header${isFiltered ? ' results-header--filtered' : ''}${flash ? ' results-header--flash' : ''}`}
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="results-count">
          {isFiltered
            ? <><strong>{totalResults}</strong> {noun} found</>
            : <>All <strong>{totalCount}</strong> services</>}
          {filters.query && (
            <> for <span className="results-query">"{filters.query}"</span></>
          )}
        </p>
        {filters.query && (
          <button type="button" className="results-clear-search" onClick={onClearSearch}>
            Clear search
          </button>
        )}
      </div>

      <FilterChips filters={filters} onRemove={onRemove} />

      <div className="results-toolbar">
        <p className="results-summary">
          {totalPages > 1
            ? <>Showing <strong>{rangeStart}–{rangeEnd}</strong> of <strong>{totalResults}</strong></>
            : <>Showing <strong>{totalResults}</strong> {noun}</>}
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
                <option value="org-az">Organization (A–Z)</option>
                <option value="name-az">Service name (A–Z)</option>
              </select>
            </div>
            <div className="sort-control">
              <label htmlFor="page-size-select" className="sort-label">Show</label>
              <select
                id="page-size-select"
                className="sort-select page-size-select"
                value={pageSize}
                onChange={(e) => onPageSize(Number(e.target.value))}
              >
                {PAGE_SIZE_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n} per page</option>
                ))}
              </select>
            </div>
          </div>
        )}
      </div>

      {!isEmpty && totalResults <= 4 && (
        <div className="low-results-banner" role="status">
          Only {totalResults} {noun} {totalResults === 1 ? 'matches' : 'match'} your current filters — try removing a filter to see more.
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
