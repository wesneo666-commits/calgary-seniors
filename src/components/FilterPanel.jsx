import { useState } from 'react'
import { SERVICE_AREA_GROUPS, QUADRANTS, COST_TYPES, FORMAT_TYPES } from '../utils/constants.js'

function CheckboxGroup({ label, options, value, onChange, allLabel }) {
  return (
    <div className={`filter-group${value ? ' filter-group--active' : ''}`}>
      <span className="filter-group-label">{label}{value ? ' ✓' : ''}</span>
      <div className="checkbox-options">
        <button
          className={`checkbox-option${!value ? ' checkbox-option--active' : ''}`}
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

const SERVICE_GROUP_OPTIONS = SERVICE_AREA_GROUPS.map((g) => ({
  value: `_group_${g.group}`,
  label: g.group,
}))

export default function FilterPanel({ filters, onFilterChange, onClear, hasActive }) {
  const [mode, setMode] = useState('dropdown')
  const isCheckbox = mode === 'checkbox'

  return (
    <div className="filter-panel" role="group" aria-label="Filter programs">
      <div className="filter-panel-header">
        <h2>Filter Programs</h2>
        <div className="demo-toggle" role="group" aria-label="Filter style">
          <button
            className={`demo-toggle-btn${!isCheckbox ? ' demo-toggle-btn--active' : ''}`}
            onClick={() => setMode('dropdown')}
            aria-pressed={!isCheckbox}
          >
            Dropdowns
          </button>
          <button
            className={`demo-toggle-btn${isCheckbox ? ' demo-toggle-btn--active' : ''}`}
            onClick={() => setMode('checkbox')}
            aria-pressed={isCheckbox}
          >
            Checkboxes
          </button>
        </div>
      </div>

      {isCheckbox ? (
        <>
          <CheckboxGroup
            label="Location"
            options={QUADRANTS}
            value={filters.quadrant}
            onChange={(v) => onFilterChange('quadrant', v)}
            allLabel="All of Calgary"
          />
          <CheckboxGroup
            label="Service type"
            options={SERVICE_GROUP_OPTIONS}
            value={filters.serviceArea}
            onChange={(v) => onFilterChange('serviceArea', v)}
            allLabel="All types"
          />
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
        </>
      ) : (
        <>
          <div className={`filter-group${filters.quadrant ? ' filter-group--active' : ''}`}>
            <label htmlFor="filter-quadrant">
              Search by location{filters.quadrant ? ' ✓' : ''}
            </label>
            <select
              id="filter-quadrant"
              className="filter-select"
              value={filters.quadrant}
              onChange={(e) => onFilterChange('quadrant', e.target.value)}
            >
              <option value="">All of Calgary</option>
              {QUADRANTS.map((q) => (
                <option key={q.value} value={q.value}>{q.label}</option>
              ))}
            </select>
          </div>

          <div className={`filter-group${filters.serviceArea ? ' filter-group--active' : ''}`}>
            <label htmlFor="filter-service">
              Select service type{filters.serviceArea ? ' ✓' : ''}
            </label>
            <select
              id="filter-service"
              className="filter-select"
              value={filters.serviceArea}
              onChange={(e) => onFilterChange('serviceArea', e.target.value)}
            >
              <option value="">All types</option>
              {SERVICE_AREA_GROUPS.map((group) => (
                <optgroup key={group.group} label={group.group}>
                  <option value={`_group_${group.group}`}>All — {group.group}</option>
                  {group.items.map((item) => (
                    <option key={item.value} value={item.value}>&nbsp;&nbsp;{item.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className={`filter-group${filters.cost ? ' filter-group--active' : ''}`}>
            <label htmlFor="filter-cost">
              Filter by cost{filters.cost ? ' ✓' : ''}
            </label>
            <select
              id="filter-cost"
              className="filter-select"
              value={filters.cost}
              onChange={(e) => onFilterChange('cost', e.target.value)}
            >
              <option value="">All costs</option>
              {COST_TYPES.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>

          <div className={`filter-group${filters.format ? ' filter-group--active' : ''}`}>
            <label htmlFor="filter-format">
              Filter by format{filters.format ? ' ✓' : ''}
            </label>
            <select
              id="filter-format"
              className="filter-select"
              value={filters.format}
              onChange={(e) => onFilterChange('format', e.target.value)}
            >
              <option value="">All formats</option>
              {FORMAT_TYPES.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {hasActive && (
        <button className="clear-filters-btn" onClick={onClear}>
          Clear all filters
        </button>
      )}

      <div className="filter-tips">
        <p className="filter-tips-heading">How filters work</p>
        <ul className="filter-tips-list">
          <li>{isCheckbox ? 'Tap any option to filter results' : 'Choose from any dropdown to narrow your results'}</li>
          <li>You can apply more than one filter at a time</li>
          <li>Active filters appear as tags above your results — click the ✕ on any tag to remove it</li>
        </ul>
      </div>
    </div>
  )
}
