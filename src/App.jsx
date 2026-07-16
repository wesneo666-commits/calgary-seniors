import { useState, useMemo, useCallback, useEffect } from 'react'
import programs from './data/programs.json'
import SearchBar from './components/SearchBar.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import ResultsList from './components/ResultsList.jsx'
import ProgramDetail from './components/ProgramDetail.jsx'
import HelpModal from './components/HelpModal.jsx'
import AboutModal from './components/AboutModal.jsx'
import AccessibilityPanel from './components/AccessibilityPanel.jsx'
import HeroGuidance from './components/HeroGuidance.jsx'
import WizardLanding from './components/WizardLanding.jsx'
import ChatWidget from './components/ChatWidget.jsx'
import { filterPrograms, sortResults } from './utils/search.js'
import Footer from './components/Footer.jsx'
import { useAccessibility } from './hooks/useAccessibility.js'

const EMPTY_FILTERS = {
  query: '',
  quadrant: [],
  serviceArea: '',
  cost: '',
  format: '',
}

export function isFilterActive(value) {
  return Array.isArray(value) ? value.length > 0 : value !== ''
}

export const PAGE_SIZE = 20

function getSharedProgramId() {
  return new URLSearchParams(window.location.search).get('program')
}

export default function App() {
  const { prefs, set, reset: resetA11y } = useAccessibility()
  const [showA11y, setShowA11y] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('name-az')
  const [layout, setLayout] = useState('2col')
  const [landingMode, setLandingMode] = useState('direct') // 'direct' | 'wizard' — A/B toggle for UAT (Session 3, 2026-06-25)
  const [sharedProgramId, setSharedProgramId] = useState(getSharedProgramId)

  // A copied/shared program link (?program=<id>) loads straight into a
  // single-card view instead of the full app backdrop — REQ-042.
  const sharedProgram = sharedProgramId ? programs.find((p) => p.id === sharedProgramId) : null

  const exitSharedView = useCallback(() => {
    window.history.pushState({}, '', window.location.pathname)
    setSharedProgramId(null)
  }, [])

  const setFilter = useCallback((key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const removeFilter = useCallback((key, value) => {
    setFilters((prev) => {
      if (Array.isArray(prev[key])) {
        return { ...prev, [key]: prev[key].filter((v) => v !== value) }
      }
      return { ...prev, [key]: '' }
    })
  }, [])

  const clearFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setSort('relevance')
  }, [])

  const applyChatFilters = useCallback((chatFilters) => {
    setFilters({ ...EMPTY_FILTERS, ...chatFilters })
    setLandingMode('direct')
    document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
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

  // Auto-switch sort: relevance when searching, A-Z when browsing
  useEffect(() => {
    if (filters.query && sort === 'name-az') setSort('relevance')
    else if (!filters.query && sort === 'relevance') setSort('name-az')
  }, [filters.query])

  const totalPages = Math.ceil(allResults.length / PAGE_SIZE)
  const pageResults = allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = Object.values(filters).some(isFilterActive)
  const showWizard = landingMode === 'wizard' && !hasActiveFilters

  if (sharedProgram) {
    return (
      <ProgramDetail
        program={sharedProgram}
        onClose={exitSharedView}
        backLabel="← Back to Calgary Seniors Resource Directory"
      />
    )
  }

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
              <h1>Calgary Seniors Resource Directory</h1>
              <p>Find Programs and Services in Calgary, Alberta!</p>
            </div>
            <div className="landing-mode-toggle" role="group" aria-label="Landing page style (UAT testing)">
              <button
                type="button"
                className={`landing-mode-btn${landingMode === 'direct' ? ' landing-mode-btn--active' : ''}`}
                onClick={() => setLandingMode('direct')}
                aria-pressed={landingMode === 'direct'}
              >
                Direct search
              </button>
              <button
                type="button"
                className={`landing-mode-btn${landingMode === 'wizard' ? ' landing-mode-btn--active' : ''}`}
                onClick={() => setLandingMode('wizard')}
                aria-pressed={landingMode === 'wizard'}
              >
                Directory
              </button>
            </div>
            <button className="help-btn" onClick={() => setShowHelp(true)} aria-label="How to use this directory">
              How to use this
            </button>
            <div className="a11y-btn-wrap">
              <button
                className="a11y-toggle-btn"
                onClick={() => setShowA11y((v) => !v)}
                aria-expanded={showA11y}
                aria-label="Website display settings"
              >
                Website Display Settings ▾
              </button>
              {showA11y && (
                <>
                  <div className="a11y-backdrop" aria-hidden="true" />
                  <AccessibilityPanel
                    prefs={prefs}
                    set={set}
                    reset={resetA11y}
                    onClose={() => setShowA11y(false)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="search-section" role="search">
        <div className="container">
          <SearchBar
            value={filters.query}
            onChange={(v) => setFilter('query', v)}
          />
          <HeroGuidance />
        </div>
      </div>

      <main id="main-content" className="container">
        {showWizard ? (
          <WizardLanding onPickGroup={(group) => setFilter('serviceArea', `_group_${group}`)} />
        ) : (
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
                layout={layout}
                onLayout={setLayout}
              />
            </section>
          </div>
        )}
      </main>

      <Footer onAbout={() => setShowAbout(true)} />

      {selectedProgram && (
        <ProgramDetail
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}

      <ChatWidget onApplyFilters={applyChatFilters} />
    </>
  )
}
