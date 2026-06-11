import { useState, useMemo, useCallback, useEffect } from 'react'
import programs from './data/programs.json'
import SearchBar from './components/SearchBar.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import ResultsList from './components/ResultsList.jsx'
import ProgramDetail from './components/ProgramDetail.jsx'
import FontSizeControl from './components/FontSizeControl.jsx'
import { filterPrograms, sortResults } from './utils/search.js'
import Footer from './components/Footer.jsx'
import { useFontSize } from './hooks/useFontSize.js'

const EMPTY_FILTERS = {
  query: '',
  quadrant: '',
  serviceArea: '',
  cost: '',
  format: '',
}

export const PAGE_SIZE = 20

export default function App() {
  const { sizeIndex, setSizeIndex } = useFontSize()
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('relevance')

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const removeFilter = useCallback((key) => {
    setFilters((prev) => ({ ...prev, [key]: '' }))
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setSort('relevance')
  }, [])

  const allResults = useMemo(() => {
    const filtered = filterPrograms(programs, filters)
    const base = sortResults(filtered, filters.query)
    if (sort === 'name-az') return [...base].sort((a, b) => a.programName.localeCompare(b.programName))
    if (sort === 'org-az')  return [...base].sort((a, b) => a.organization.localeCompare(b.organization))
    return base
  }, [filters, sort])

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1)
  }, [filters])

  const totalPages = Math.ceil(allResults.length / PAGE_SIZE)
  const pageResults = allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = Object.values(filters).some((v) => v !== '')

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="site-header" role="banner">
        <div className="container">
          <div className="site-header-inner">
            <button
              className="site-logo-btn"
              onClick={clearFilters}
              aria-label="Calgary Seniors Resource Society — reset to home"
            >
              <img
                src="/logo.webp"
                alt=""
                className="site-logo"
              />
            </button>
            <div className="site-header-text">
              <h1>Calgary Seniors Resource Guide</h1>
              <p>Find Programs and Services in Calgary, Alberta!</p>
            </div>
            <FontSizeControl sizeIndex={sizeIndex} setSizeIndex={setSizeIndex} />
          </div>
        </div>
      </header>

      <div className="search-section" role="search">
        <div className="container">
          <SearchBar
            value={filters.query}
            onChange={(v) => setFilter('query', v)}
          />
        </div>
      </div>

      <main id="main-content" className="container">
        <div className="main-layout">
          <aside aria-label="Filters">
            <FilterPanel
              filters={filters}
              onFilterChange={setFilter}
              onClear={clearFilters}
              hasActive={hasActiveFilters}
            />
          </aside>

          <section aria-label="Search results" aria-live="polite">
            <ResultsList
              results={pageResults}
              totalResults={allResults.length}
              totalCount={programs.length}
              filters={filters}
              onRemove={removeFilter}
              onSelect={setSelectedProgram}
              page={page}
              totalPages={totalPages}
              onPage={(p) => {
                setPage(p)
                document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
              }}
              sort={sort}
              onSort={(s) => { setSort(s); setPage(1) }}
            />
          </section>
        </div>
      </main>

      <Footer />

      {selectedProgram && (
        <ProgramDetail
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}
    </>
  )
}
