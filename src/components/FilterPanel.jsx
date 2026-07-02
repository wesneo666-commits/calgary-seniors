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

export default function FilterPanel({ filters, onFilterChange, onClear, hasActive }) {
  return (
    <div className="filter-panel" role="group" aria-label="Filter programs">
      <div className="filter-panel-header">
        <h2>Filter Programs</h2>
      </div>

      <CheckboxGroup
        label="Location"
        options={QUADRANTS}
        value={filters.quadrant}
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
        label="Format"
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

      <div className="filter-tips">
        <p className="filter-tips-heading">How filters work</p>
        <ul className="filter-tips-list">
          <li>Tap any option to filter results</li>
          <li>You can apply more than one filter at a time</li>
          <li>Active filters appear as tags above your results — click the ✕ on any tag to remove it</li>
        </ul>
      </div>
    </div>
  )
}
