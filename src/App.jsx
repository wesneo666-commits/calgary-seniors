import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import programs from './data/programs.json'
import SearchBar from './components/SearchBar.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import ResultsList from './components/ResultsList.jsx'
import ProgramDetail from './components/ProgramDetail.jsx'
import HelpModal from './components/HelpModal.jsx'
import AboutPage from './components/AboutPage.jsx'
import SubmissionModal from './components/SubmissionModal.jsx'
import AccessibilityPanel from './components/AccessibilityPanel.jsx'
import WizardLanding from './components/WizardLanding.jsx'
import GuidedTour from './components/GuidedTour.jsx'
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

export const PAGE_SIZE_OPTIONS = [10, 20, 30, 50]
const DEFAULT_PAGE_SIZE = 20

// Phase 1 tests focus on search, filters, and display settings. Keep the
// product landing page code available for Phase 2, but start test participants
// directly in the searchable directory without a competing mode switch.
const PHASE_ONE_TEST_MODE = true

// Same focus-trap pattern used by HelpModal/AboutModal/ProgramDetail — kept
// here too rather than pulled into a shared util, consistent with how those
// components each define their own copy.
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])'

function getSharedProgramId() {
  return new URLSearchParams(window.location.search).get('program')
}

// ?view=about shows the About page (V5 A-01).
function getView() {
  return new URLSearchParams(window.location.search).get('view') === 'about' ? 'about' : 'directory'
}

// Landing A/B layout (V5 L-04): ?layout=b puts filters above search.
function getLandingLayout() {
  return new URLSearchParams(window.location.search).get('layout') === 'b' ? 'b' : 'a'
}

// Guided tour demo (2026-10-20 review, B-04): only on ?tour links for now,
// so the UAT prototype is unchanged until the team approves it. It starts on
// every load there so reviewers always see it; once approved, switch it to
// first visit only using TOUR_SEEN_KEY.
const TOUR_DEMO = new URLSearchParams(window.location.search).has('tour')
const TOUR_SEEN_KEY = 'csrg-tour-seen'

function GearIcon() {
  // Long-toothed gear so it reads unmistakably as settings (V5 DS-03). Eight
  // evenly spaced teeth around the centre; the old hand-drawn path was
  // shorter at the bottom, so it looked cut off (2026-10-20 review, Q-04).
  return (
    <svg className="a11y-gear-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <path d="M9.75 4.64L10.37 1.73L13.63 1.73L14.25 4.64L15.61 5.2L18.11 3.59L20.41 5.89L18.8 8.39L19.36 9.75L22.27 10.37L22.27 13.63L19.36 14.25L18.8 15.61L20.41 18.11L18.11 20.41L15.61 18.8L14.25 19.36L13.63 22.27L10.37 22.27L9.75 19.36L8.39 18.8L5.89 20.41L3.59 18.11L5.2 15.61L4.64 14.25L1.73 13.63L1.73 10.37L4.64 9.75L5.2 8.39L3.59 5.89L5.89 3.59L8.39 5.2Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

// Keep the Phase 1 directory-first test intact while giving reviewers a
// stable, direct URL for the retained landing experience.
function isLandingPreview() {
  return new URLSearchParams(window.location.search).get('view') === 'landing'
}

// Escape-to-close plus the same Tab focus-trap used by the other overlays in
// this app (HelpModal/AboutModal/ProgramDetail) — without it, a keyboard user
// tabbing through (especially the filter drawer's many checkbox buttons) can
// tab straight out into the page underneath.
function useOverlayKeys(open, onClose, panelRef) {
  useEffect(() => {
    if (!open) return
    function handleKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)]
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose, panelRef])

  useEffect(() => {
    if (open) panelRef.current?.querySelector(FOCUSABLE)?.focus()
  }, [open, panelRef])
}

export default function App() {
  const { prefs, set, reset: resetA11y } = useAccessibility()
  const [showA11y, setShowA11y] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [view, setView] = useState(getView)
  const [showSubmission, setShowSubmission] = useState(false)
  const [showTour, setShowTour] = useState(TOUR_DEMO)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE)
  // Alphabetical by organization by default (V5 D-01).
  const [sort, setSort] = useState('org-az')
  const [landingMode, setLandingMode] = useState(
    isLandingPreview() || !PHASE_ONE_TEST_MODE ? 'wizard' : 'direct'
  )
  const [sharedProgramId, setSharedProgramId] = useState(getSharedProgramId)
  const filterDrawerRef = useRef(null)
  const submissionTriggerRef = useRef(null)

  const closeSubmission = useCallback(() => {
    setShowSubmission(false)
    window.requestAnimationFrame(() => submissionTriggerRef.current?.focus())
  }, [])

  // A copied/shared program link (?program=<id>) loads straight into a
  // single-card view instead of the full app backdrop — REQ-042.
  const sharedProgram = sharedProgramId ? programs.find((p) => p.id === sharedProgramId) : null

  // Opening a card puts its own link in the address bar (V5 SP-04), so
  // copying the URL shares that service; Back closes the card.
  const openProgram = useCallback((program) => {
    window.history.pushState({ program: program.id }, '', `?program=${encodeURIComponent(program.id)}`)
    setSelectedProgram(program)
  }, [])

  const closeProgram = useCallback(() => {
    if (window.history.state?.program) window.history.back()
    else setSelectedProgram(null)
  }, [])

  const openAbout = useCallback((e) => {
    e?.preventDefault()
    window.history.pushState({ view: 'about' }, '', '?view=about')
    setView('about')
  }, [])

  const closeAbout = useCallback(() => {
    if (window.history.state?.view === 'about') window.history.back()
    else {
      window.history.replaceState({}, '', window.location.pathname)
      setView('directory')
    }
  }, [])

  // Browser Back/Forward: keep the open card and the About page in step
  // with the address bar.
  useEffect(() => {
    function handlePop() {
      const id = getSharedProgramId()
      setSelectedProgram(id ? programs.find((p) => p.id === id) ?? null : null)
      setView(getView())
    }
    window.addEventListener('popstate', handlePop)
    return () => window.removeEventListener('popstate', handlePop)
  }, [])

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

  // Stable identities so useOverlayKeys' effect isn't torn down and rebuilt
  // on every render (an inline arrow here would change every time).
  const closeMobileFilters = useCallback(() => setShowMobileFilters(false), [])
  const closeHelp = useCallback(() => setShowHelp(false), [])

  const closeTour = useCallback(() => {
    try { localStorage.setItem(TOUR_SEEN_KEY, '1') } catch { /* private mode */ }
    setShowTour(false)
  }, [])

  const startTour = useCallback(() => {
    setShowHelp(false)
    setShowA11y(false)
    window.scrollTo(0, 0)
    setShowTour(true)
  }, [])

  const clearFilters = useCallback(() => {
    setFilters((prev) => ({ ...EMPTY_FILTERS, query: prev.query }))
  }, [])

  const resetHome = useCallback(() => {
    setFilters(EMPTY_FILTERS)
    setSort('org-az')
    setLandingMode(isLandingPreview() || !PHASE_ONE_TEST_MODE ? 'wizard' : 'direct')
    if (view === 'about') closeAbout()
  }, [view, closeAbout])

  // Bring the results into view after a search or filter is applied, so the
  // change is visible — especially on phones (V5 S-05/F-09).
  const scrollToResults = useCallback(() => {
    window.requestAnimationFrame(() => {
      document.getElementById('results-top')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }, [])

  const submitSearch = useCallback((q) => {
    setFilters((prev) => ({ ...prev, query: q }))
    setLandingMode('direct')
    if (q) scrollToResults()
  }, [scrollToResults])

  const applyLandingFilter = useCallback((key, value) => {
    setFilters({ ...EMPTY_FILTERS, [key]: value })
    setLandingMode('direct')
  }, [])

  const allResults = useMemo(() => {
    const filtered = filterPrograms(programs, filters)
    const base = sortResults(filtered, filters.query)
    if (sort === 'name-az') return [...base].sort((a, b) => a.programName.localeCompare(b.programName))
    if (sort === 'org-az')  return [...base].sort((a, b) =>
      a.organization.localeCompare(b.organization) || a.programName.localeCompare(b.programName))
    return base
  }, [filters, sort])

  // Reset to page 1 whenever filters or page size change
  useEffect(() => {
    setPage(1)
  }, [filters, pageSize])

  // Auto-switch sort: relevance when searching, organization A-Z when browsing
  useEffect(() => {
    if (filters.query && sort === 'org-az') setSort('relevance')
    else if (!filters.query && sort === 'relevance') setSort('org-az')
  }, [filters.query])

  useOverlayKeys(showMobileFilters, closeMobileFilters, filterDrawerRef)

  const totalPages = Math.ceil(allResults.length / pageSize)
  const pageResults = allResults.slice((page - 1) * pageSize, page * pageSize)

  const hasActiveFilters = Object.values(filters).some(isFilterActive)
  // Filters only — the search term has its own Clear in the results header.
  const activeFilterCount = Object.entries(filters)
    .filter(([key, value]) => key !== 'query' && isFilterActive(value)).length
  const showWizard = (isLandingPreview() || !PHASE_ONE_TEST_MODE) && landingMode === 'wizard' && !hasActiveFilters

  if (sharedProgram) {
    return (
      <ProgramDetail
        program={sharedProgram}
        onClose={exitSharedView}
        backLabel="← Back to EngAGE"
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
              onClick={resetHome}
              aria-label="EngAGE — reset to home"
            >
              {/* Narrow screens get a stacked cut of the same artwork — wordmark
                  centred, skyline-and-leaves underneath — so the wordmark can
                  run full width instead of sharing the row with the motif. */}
              <picture className="site-logo-picture">
                <source media="(max-width: 640px)" srcSet={`${import.meta.env.BASE_URL}engage-logo-stacked.svg`} />
                <img
                  src={`${import.meta.env.BASE_URL}engage-logo.svg`}
                  alt=""
                  className="site-logo"
                />
              </picture>
            </button>
            <div className="site-header-text">
              <h1 className="sr-only">EngAGE: Calgary Directory for Aging Well</h1>
              <p>Calgary Directory for Aging Well</p>
            </div>
            {!PHASE_ONE_TEST_MODE && (
              <div className="landing-mode-toggle" role="group" aria-label="Choose how to find a program">
                <button
                  type="button"
                  className={`landing-mode-btn${landingMode === 'direct' ? ' landing-mode-btn--active' : ''}`}
                  onClick={() => setLandingMode('direct')}
                  aria-pressed={landingMode === 'direct'}
                >
                  Direct Search
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
            )}
            {/* display:contents on desktop, so this wrapper changes nothing there;
                on mobile it becomes the right-aligned action row under the
                centred logo (replacing the old hamburger menu). */}
            <div className="site-header-actions">
              {/* Visible About link alongside the other header controls; the
                  footer one was easy to miss (2026-10-20 review, Q-05). */}
              <a
                href="?view=about"
                className="about-btn"
                onClick={openAbout}
                aria-current={view === 'about' ? 'page' : undefined}
              >
                {/* Non-breaking space: the button is a flex box, which drops
                    a plain space before the span. */}
                About<span className="about-btn-long">&nbsp;EngAGE</span>
              </a>
              <button
                className="help-btn"
                onClick={() => setShowHelp((v) => !v)}
                aria-expanded={showHelp}
                aria-label="How to use this directory"
              >
                How to use this
              </button>
              <div className="a11y-btn-wrap">
                <button
                  className="a11y-toggle-btn"
                  onClick={() => setShowA11y((v) => !v)}
                  aria-expanded={showA11y}
                  aria-label="Text and display settings"
                >
                  <GearIcon /> Text &amp; Display ▾
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
        </div>
      </header>

      {view === 'directory' && !showWizard && (
      <div className="search-section" role="search">
        <div className="container">
          <div className="search-row">
            <SearchBar
              value={filters.query}
              onSubmit={submitSearch}
            />
            {!showWizard && (
              <button
                type="button"
                className="mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
                aria-haspopup="dialog"
                aria-expanded={showMobileFilters}
              >
                {/* On phones the full-width button says what filters are for,
                    since the panel is hidden behind it (2026-10-20 review, Q-07). */}
                🗂 <span className="mobile-filter-label-long">Narrow your search with filters</span>
                <span className="mobile-filter-label-short">Filters</span>
                {activeFilterCount ? ` (${activeFilterCount})` : ''}
              </button>
            )}
          </div>
        </div>
      </div>
      )}

      <main id="main-content" className="container">
        {view === 'about' ? (
          <AboutPage onBack={closeAbout} />
        ) : showWizard ? (
          <WizardLanding
            layout={getLandingLayout()}
            onSearch={submitSearch}
            onApplyFilter={applyLandingFilter}
            onBrowseAll={() => setLandingMode('direct')}
            onAbout={openAbout}
          />
        ) : (
          <div className="main-layout">
            {showMobileFilters && (
              <div className="mobile-filter-backdrop" aria-hidden="true" onClick={() => setShowMobileFilters(false)} />
            )}
            <aside
              aria-label="Filters"
              role={showMobileFilters ? 'dialog' : undefined}
              aria-modal={showMobileFilters ? 'true' : undefined}
              className={`filter-aside${showMobileFilters ? ' filter-aside--open' : ''}`}
              ref={filterDrawerRef}
            >
              <FilterPanel
                filters={filters}
                onFilterChange={setFilter}
                onClear={clearFilters}
                hasActive={activeFilterCount > 0}
                onCloseMobile={() => { setShowMobileFilters(false); scrollToResults() }}
                resultCount={allResults.length}
              />
            </aside>

            <section aria-label="Search results" id="results-top">
              <ResultsList
                results={pageResults}
                totalResults={allResults.length}
                totalCount={programs.length}
                filters={filters}
                onRemove={removeFilter}
                onSelect={openProgram}
                page={page}
                totalPages={totalPages}
                onPage={(p) => {
                  setPage(p)
                  document.getElementById('main-content')?.scrollIntoView({ behavior: 'smooth' })
                }}
                sort={sort}
                onSort={(s) => { setSort(s); setPage(1) }}
                pageSize={pageSize}
                onPageSize={setPageSize}
                onClearSearch={() => submitSearch('')}
              />
            </section>
          </div>
        )}
      </main>

      <Footer
        onAbout={openAbout}
        onSubmitProgram={() => setShowSubmission(true)}
        submissionTriggerRef={submissionTriggerRef}
      />

      {selectedProgram && (
        <ProgramDetail
          program={selectedProgram}
          onClose={closeProgram}
        />
      )}

      {showHelp && <HelpModal onClose={closeHelp} onStartTour={TOUR_DEMO ? startTour : undefined} />}
      {/* The tour points at directory controls, so it waits until the
          directory is what's on screen. */}
      {showTour && view === 'directory' && !showWizard && !selectedProgram && (
        <GuidedTour onClose={closeTour} />
      )}
      {showSubmission && <SubmissionModal onClose={closeSubmission} />}

      {/* Chatbot removed for V5 (C-01); ChatWidget.jsx is kept so it can return. */}
    </>
  )
}
