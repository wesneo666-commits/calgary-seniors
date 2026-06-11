import { SERVICE_AREA_GROUPS, QUADRANTS, COST_TYPES, FORMAT_TYPES } from '../utils/constants.js'

export default function FilterPanel({ filters, onFilterChange, onClear, hasActive }) {
  return (
    <div className="filter-panel" role="group" aria-label="Filter programs">
      <h2>Filter Programs</h2>

      <div className={`filter-group${filters.quadrant ? ' filter-group--active' : ''}`}>
        <label htmlFor="filter-quadrant">Location</label>
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
        <label htmlFor="filter-service">Type of Service</label>
        <select
          id="filter-service"
          className="filter-select"
          value={filters.serviceArea}
          onChange={(e) => onFilterChange('serviceArea', e.target.value)}
        >
          <option value="">All types</option>
          {SERVICE_AREA_GROUPS.map((group) => (
            <optgroup key={group.group} label={group.group}>
              {group.items.map((item) => (
                <option key={item.value} value={item.value}>{item.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div className={`filter-group${filters.cost ? ' filter-group--active' : ''}`}>
        <label htmlFor="filter-cost">Cost</label>
        <select
          id="filter-cost"
          className="filter-select"
          value={filters.cost}
          onChange={(e) => onFilterChange('cost', e.target.value)}
        >
          <option value="">Any cost</option>
          {COST_TYPES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>

      <div className={`filter-group${filters.format ? ' filter-group--active' : ''}`}>
        <label htmlFor="filter-format">Format</label>
        <select
          id="filter-format"
          className="filter-select"
          value={filters.format}
          onChange={(e) => onFilterChange('format', e.target.value)}
        >
          <option value="">Any format</option>
          {FORMAT_TYPES.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>
      </div>

      {hasActive && (
        <button className="clear-filters-btn" onClick={onClear}>
          Clear all filters
        </button>
      )}
    </div>
  )
}
