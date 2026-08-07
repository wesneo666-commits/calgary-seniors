import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import programs from './data/programs.json'
import SearchBar from './components/SearchBar.jsx'
import FilterPanel from './components/FilterPanel.jsx'
import ResultsList from './components/ResultsList.jsx'
import ProgramDetail from './components/ProgramDetail.jsx'
import HelpModal from './components/HelpModal.jsx'
import AboutModal from './components/AboutModal.jsx'
import SubmissionModal from './components/SubmissionModal.jsx'
import AccessibilityPanel from './components/AccessibilityPanel.jsx'
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
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [showHelp, setShowHelp] = useState(false)
  const [showAbout, setShowAbout] = useState(false)
  const [showSubmission, setShowSubmission] = useState(false)
  const [filters, setFilters] = useState(EMPTY_FILTERS)
  const [selectedProgram, setSelectedProgram] = useState(null)
  const [page, setPage] = useState(1)
  const [sort, setSort] = useState('name-az')
  const [landingMode, setLandingMode] = useState(PHASE_ONE_TEST_MODE ? 'direct' : 'wizard')
  const [sharedProgramId, setSharedProgramId] = useState(getSharedProgramId)
  const mobileMenuRef = useRef(null)
  const filterDrawerRef = useRef(null)
  const submissionTriggerRef = useRef(null)

  const closeSubmission = useCallback(() => {
    setShowSubmission(false)
    window.requestAnimationFrame(() => submissionTriggerRef.current?.focus())
  }, [])

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

  // Stable identities so useOverlayKeys' effect isn't torn down and rebuilt
  // on every render (an inline arrow here would change every time).
  const closeMobileMenu = useCallback(() => setShowMobileMenu(false), [])
  const closeMobileFilters = useCallback(() => setShowMobileFilters(false), [])

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

  useOverlayKeys(showMobileMenu, closeMobileMenu, mobileMenuRef)
  useOverlayKeys(showMobileFilters, closeMobileFilters, filterDrawerRef)

  const totalPages = Math.ceil(allResults.length / PAGE_SIZE)
  const pageResults = allResults.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasActiveFilters = Object.values(filters).some(isFilterActive)
  const showWizard = !PHASE_ONE_TEST_MODE && landingMode === 'wizard' && !hasActiveFilters

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
              onClick={clearFilters}
              aria-label="EngAGE — reset to home"
            >
              <img
                src="/engage-logo.svg"
                alt=""
                className="site-logo"
              />
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
            <button className="help-btn" onClick={() => setShowHelp(true)} aria-label="How to use this directory">
              How to use this
            </button>
            <div className="a11y-btn-wrap">
              <button
                className="a11y-toggle-btn"
                onClick={() => setShowA11y((v) => !v)}
                aria-expanded={showA11y}
                aria-label="Display settings"
              >
                ⚙ Display Settings ▾
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

            {/* Mobile-only: collapses "How to use this" and Display Settings behind
                a hamburger menu so the header row doesn't crowd the search area
                (V4 mobile P0, 2026-07-24). Desktop keeps the two buttons above. */}
            <div className="mobile-menu-wrap">
              <button
                type="button"
                className="mobile-menu-btn"
                onClick={() => setShowMobileMenu((v) => !v)}
                aria-expanded={showMobileMenu}
                aria-haspopup="menu"
                aria-label="More options"
              >
                <span aria-hidden="true">☰</span> Menu
              </button>
              {showMobileMenu && (
                <>
                  <div className="mobile-menu-backdrop" aria-hidden="true" onClick={() => setShowMobileMenu(false)} />
                  <div className="mobile-menu-panel" role="menu" aria-label="More options" ref={mobileMenuRef}>
                    <button
                      type="button"
                      role="menuitem"
                      className="mobile-menu-item"
                      onClick={() => { setShowHelp(true); setShowMobileMenu(false) }}
                    >
                      ❓ How to use this
                    </button>
                    <button
                      type="button"
                      role="menuitem"
                      className="mobile-menu-item"
                      onClick={() => { setShowA11y(true); setShowMobileMenu(false) }}
                    >
                      ⚙ Display Settings
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="search-section" role="search">
        <div className="container">
          <div className="search-row">
            <SearchBar
              value={filters.query}
              onChange={(v) => setFilter('query', v)}
            />
            {!showWizard && (
              <button
                type="button"
                className="mobile-filter-btn"
                onClick={() => setShowMobileFilters(true)}
                aria-haspopup="dialog"
                aria-expanded={showMobileFilters}
              >
                🗂 Filters{hasActiveFilters ? ` (${Object.values(filters).filter(isFilterActive).length})` : ''}
              </button>
            )}
          </div>
        </div>
      </div>

      <main id="main-content" className="container">
        {showWizard ? (
          <WizardLanding onPickGroup={(group) => setFilter('serviceArea', `_group_${group}`)} />
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
                hasActive={hasActiveFilters}
                onCloseMobile={() => setShowMobileFilters(false)}
                resultCount={allResults.length}
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
        )}
      </main>

      <Footer
        onAbout={() => setShowAbout(true)}
        onSubmitProgram={() => setShowSubmission(true)}
        submissionTriggerRef={submissionTriggerRef}
      />

      {selectedProgram && (
        <ProgramDetail
          program={selectedProgram}
          onClose={() => setSelectedProgram(null)}
        />
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showAbout && <AboutModal onClose={() => setShowAbout(false)} />}
      {showSubmission && <SubmissionModal onClose={closeSubmission} />}

      <ChatWidget onApplyFilters={applyChatFilters} />
    </>
  )
}
