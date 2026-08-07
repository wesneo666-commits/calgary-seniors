import { QUADRANTS, COST_TYPES, FORMAT_TYPES } from '../utils/constants.js'
import ServiceTypeSelect from './ServiceTypeSelect.jsx'

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
    <div className="filter-panel" role="group" aria-label="Filter programs">
      <div className="filter-panel-header">
        <h2>Filter Programs</h2>
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

      <MultiCheckboxGroup
        label="Location"
        options={QUADRANTS}
        values={filters.quadrant}
        onChange={(v) => onFilterChange('quadrant', v)}
        allLabel="All of Calgary"
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
        allLabel="All costs"
      />

      <CheckboxGroup
        label="Service Format"
        options={FORMAT_TYPES}
        value={filters.format}
        onChange={(v) => onFilterChange('format', v)}
        allLabel="All formats"
      />

      {hasActive && (
        <button className="clear-filters-btn" onClick={onClear}>
          Clear all filters
        </button>
      )}

      <details className="filter-tips">
        <summary className="filter-tips-heading">How filters work</summary>
        <ul className="filter-tips-list">
          <li>Tap any option to filter results</li>
          <li>You can apply more than one filter at a time</li>
          <li>Active filters appear as tags above your results — click the ✕ on any tag to remove it</li>
        </ul>
      </details>

      {onCloseMobile && (
        <button type="button" className="filter-panel-mobile-apply" onClick={onCloseMobile}>
          Show {resultCount} program{resultCount === 1 ? '' : 's'}
        </button>
      )}
    </div>
  )
}
