import { useState } from 'react'
import { QUADRANTS, COST_TYPES, FORMAT_TYPES } from '../utils/constants.js'
import ServiceTypeSelect from './ServiceTypeSelect.jsx'

const INTRO_KEY = 'csrg-filter-intro-dismissed'

// Closable one-time explainer at the top of the panel (V5 F-02), dismissed
// the same way as the old chatbot hint — remembered in localStorage.
function FilterIntro() {
  const [dismissed, setDismissed] = useState(() => {
    try { return localStorage.getItem(INTRO_KEY) === '1' } catch { return false }
  })
  if (dismissed) return null

  function dismiss() {
    try { localStorage.setItem(INTRO_KEY, '1') } catch { /* private mode */ }
    setDismissed(true)
  }

  return (
    <div className="filter-intro" role="note">
      <p>
        <strong>Show only relevant results.</strong> Choose a location, type, cost, or format to narrow your search. Use one filter or combine several.
      </p>
      <button type="button" className="filter-intro-close" onClick={dismiss} aria-label="Dismiss filter tip">
        <span aria-hidden="true">✕</span>
      </button>
    </div>
  )
}

function CheckboxGroup({ label, options, value, onChange, allLabel }) {
  return (
    <div className={`filter-group${value ? ' filter-group--active' : ''}`}>
      <span className="filter-group-label">{label}{value ? ' ✓' : ''}</span>
      <div className="checkbox-options">
        <button
          className={`checkbox-option checkbox-option--all${!value ? ' checkbox-option--active' : ''}`}
          onClick={() => onChange('')}
          aria-pressed={!value}
        >
          {allLabel}
        </button>
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`checkbox-option${value === opt.value ? ' checkbox-option--active' : ''}`}
            onClick={() => onChange(value === opt.value ? '' : opt.value)}
            aria-pressed={value === opt.value}
          >
            {value === opt.value ? '✓ ' : ''}{opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// Location supports selecting more than one quadrant at once (e.g. NW + NE) — REQ-020.
function MultiCheckboxGroup({ label, options, values, onChange, allLabel }) {
  const hasSelection = values.length > 0

  function toggle(optValue) {
    onChange(
      values.includes(optValue)
        ? values.filter((v) => v !== optValue)
        : [...values, optValue]
    )
  }

  return (
    <div className={`filter-group filter-group--location${hasSelection ? ' filter-group--active' : ''}`}>
      <span className="filter-group-label">{label}{hasSelection ? ' ✓' : ''}</span>
      <div className="checkbox-options">
        <button
          className={`checkbox-option checkbox-option--all${!hasSelection ? ' checkbox-option--active' : ''}`}
          onClick={() => onChange([])}
          aria-pressed={!hasSelection}
        >
          {allLabel}
        </button>
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`checkbox-option${values.includes(opt.value) ? ' checkbox-option--active' : ''}`}
            onClick={() => toggle(opt.value)}
            aria-pressed={values.includes(opt.value)}
          >
            {values.includes(opt.value) ? '✓ ' : ''}{opt.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function FilterPanel({ filters, onFilterChange, onClear, hasActive, onCloseMobile, resultCount }) {
  return (
    <div className="filter-panel" role="group" aria-label="Filter services">
      <div className="filter-panel-header">
        <h2>Filter to Find Services</h2>
        {hasActive && (
          <button type="button" className="clear-filters-btn clear-filters-btn--top" onClick={onClear}>
            Clear filters
          </button>
        )}
        {onCloseMobile && (
          <button
            type="button"
            className="filter-panel-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close filters"
          >
            ✕
          </button>
        )}
      </div>

      <FilterIntro />

      <MultiCheckboxGroup
        label="Location"
        options={QUADRANTS}
        values={filters.quadrant}
        onChange={(v) => onFilterChange('quadrant', v)}
        allLabel="All"
      />

      <div className={`filter-group${filters.serviceArea ? ' filter-group--active' : ''}`}>
        <label id="filter-service-label">
          Select service type{filters.serviceArea ? ' ✓' : ''}
        </label>
        <ServiceTypeSelect
          value={filters.serviceArea}
          onChange={(v) => onFilterChange('serviceArea', v)}
          labelledBy="filter-service-label"
        />
      </div>

      <CheckboxGroup
        label="Cost"
        options={COST_TYPES}
        value={filters.cost}
        onChange={(v) => onFilterChange('cost', v)}
        allLabel="All"
      />

      <CheckboxGroup
        label="Service Format"
        options={FORMAT_TYPES}
        value={filters.format}
        onChange={(v) => onFilterChange('format', v)}
        allLabel="All"
      />


      {onCloseMobile && (
        <button type="button" className="filter-panel-mobile-apply" onClick={onCloseMobile}>
          Show {resultCount} service{resultCount === 1 ? '' : 's'}
        </button>
      )}
    </div>
  )
}
