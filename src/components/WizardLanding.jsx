import { useState } from 'react'
import SearchBar from './SearchBar.jsx'
import { SERVICE_AREA_GROUPS, GROUP_ICONS, QUADRANTS, COST_TYPES, FORMAT_TYPES } from '../utils/constants.js'

// Line icons for the four filter buttons (V5 L-03), replacing the old
// per-category emoji.
const ICON_PATHS = {
  location: <><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  type: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></>,
  cost: <><circle cx="12" cy="12" r="9.5" /><path d="M15 8.5c-.6-1-1.7-1.5-3-1.5-1.8 0-3 .9-3 2.3 0 3.2 6 1.8 6 5 0 1.4-1.3 2.4-3 2.4-1.4 0-2.6-.6-3.2-1.6M12 5.5v13" /></>,
  format: <><rect x="2.5" y="4" width="19" height="12.5" rx="1.5" /><path d="M8 20.5h8M12 16.5v4" /></>,
}

function FilterIcon({ name }) {
  return (
    <svg className="landing-filter-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

// Service type comes first (V5 round 3), matching the directory's filter panel.
const FILTERS = [
  {
    key: 'serviceArea',
    icon: 'type',
    label: 'Service Type',
    prompt: 'What kind of service?',
    options: SERVICE_AREA_GROUPS.map((g) => ({
      value: `_group_${g.group}`,
      label: g.group,
      slug: GROUP_ICONS[g.group]?.slug,
    })),
  },
  {
    key: 'quadrant',
    icon: 'location',
    label: 'Location',
    prompt: 'Which part of Calgary? Choose one or more.',
    multi: true,
    options: QUADRANTS,
  },
  {
    key: 'cost',
    icon: 'cost',
    label: 'Cost',
    prompt: 'Free or paid?',
    options: COST_TYPES,
  },
  {
    key: 'format',
    icon: 'format',
    label: 'Format',
    prompt: 'How would you like to take part?',
    options: FORMAT_TYPES,
  },
]

const EMPTY_SELECTION = { quadrant: [], serviceArea: '', cost: '', format: '' }

function selectedLabels(f, selection) {
  const v = selection[f.key]
  const values = f.multi ? v : v ? [v] : []
  return values.map((val) => f.options.find((o) => o.value === val)?.label).filter(Boolean)
}

// People can pick from several filters before going to the directory
// (V5 round 3): choices are held here and only applied with "Apply filters".
// Location allows several areas; the other filters take one choice each,
// the same as the directory's filter panel.
function FilterButtons({ onApplyFilters, countMatches }) {
  const [openKey, setOpenKey] = useState(null)
  const [selection, setSelection] = useState(EMPTY_SELECTION)
  const open = FILTERS.find((f) => f.key === openKey)
  const chosen = FILTERS.flatMap((f) => selectedLabels(f, selection))
  const matchCount = chosen.length ? countMatches(selection) : 0

  function toggle(f, value) {
    setSelection((prev) => {
      const cur = prev[f.key]
      if (f.multi) {
        return { ...prev, [f.key]: cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value] }
      }
      return { ...prev, [f.key]: cur === value ? '' : value }
    })
  }

  function isSelected(f, value) {
    return f.multi ? selection[f.key].includes(value) : selection[f.key] === value
  }

  return (
    <div className="landing-filters">
      <h2 className="landing-section-title">Find services by</h2>
      <div className="landing-filter-grid">
        {FILTERS.map((f) => {
          const count = selectedLabels(f, selection).length
          return (
            <button
              key={f.key}
              type="button"
              className={`landing-filter-btn${openKey === f.key ? ' landing-filter-btn--open' : ''}${count ? ' landing-filter-btn--chosen' : ''}`}
              aria-expanded={openKey === f.key}
              aria-controls="landing-filter-options"
              onClick={() => setOpenKey(openKey === f.key ? null : f.key)}
            >
              <FilterIcon name={f.icon} />
              <span className="landing-filter-label">{f.label}</span>
              {count > 0 && (
                <span className="landing-filter-count">
                  <span aria-hidden="true">✓ </span>{count} selected
                </span>
              )}
            </button>
          )
        })}
      </div>
      {open && (
        <div className="landing-filter-options" id="landing-filter-options" role="group" aria-label={open.prompt}>
          <p className="landing-filter-prompt">{open.prompt}</p>
          <div className="landing-filter-option-grid">
            {open.options.map((opt) => {
              const on = isSelected(open, opt.value)
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={on}
                  className={`landing-filter-option${opt.slug ? ` landing-filter-option--${opt.slug}` : ''}${on ? ' landing-filter-option--on' : ''}`}
                  onClick={() => toggle(open, opt.value)}
                >
                  {on && <span aria-hidden="true">✓ </span>}{opt.label}
                </button>
              )
            })}
          </div>
        </div>
      )}
      <div className="landing-apply" aria-live="polite">
        {chosen.length > 0 ? (
          <>
            <p className="landing-apply-summary">
              <strong>Your choices:</strong> {chosen.join(', ')}.{' '}
              {matchCount} service{matchCount === 1 ? '' : 's'} match.
            </p>
            <div className="landing-apply-actions">
              <button type="button" className="landing-apply-btn" onClick={() => onApplyFilters(selection)}>
                Apply filters
              </button>
              <button type="button" className="landing-apply-clear" onClick={() => { setSelection(EMPTY_SELECTION); setOpenKey(null) }}>
                Clear choices
              </button>
            </div>
          </>
        ) : (
          <p className="landing-apply-hint">Choose one or more, then select Apply filters.</p>
        )}
      </div>
    </div>
  )
}

// Landing page (V5 L-01…L-05). Two layouts for A/B testing (L-04):
//   A — search bar above the filter buttons (default, ?layout=a)
//   B — filter buttons above the search bar (?layout=b)
// Styled to Joel's EngAGE mockups (Calgary Seniors asset package, Nov 2026):
// the hero logo lives in the header, the search sits in a peach band.
export default function WizardLanding({ layout = 'a', onSearch, onApplyFilters, countMatches, onBrowseAll, onAbout }) {
  const search = (
    <div className="landing-search">
      <h2 className="landing-section-title">Search the directory</h2>
      <div className="landing-search-band">
        <SearchBar value="" onSubmit={(q) => q && onSearch(q)} />
      </div>
    </div>
  )
  const filters = <FilterButtons onApplyFilters={onApplyFilters} countMatches={countMatches} />

  return (
    <div className={`wizard-landing wizard-landing--${layout}`}>
      <div className="wizard-welcome">
        <p className="wizard-welcome-text">
          EngAGE is a trusted online directory of non-medical, community-based services in Calgary. Operated by Calgary Seniors' Resource Society, it helps people find reliable information about local supports as they age, all in one place. The directory can also be used by family members, caregivers, and service providers.
        </p>
      </div>

      {layout === 'b' ? <>{filters}{search}</> : <>{search}{filters}</>}

      <div className="landing-browse">
        <button type="button" className="landing-browse-btn" onClick={onBrowseAll}>
          Browse Full Directory
        </button>
        <p className="landing-browse-text">View all services in the directory.</p>
      </div>

      <p className="landing-about">
        Looking for more information about the directory and how services are selected? <a href="?view=about" onClick={onAbout}>Visit our About page</a>.
      </p>
    </div>
  )
}
