import { QUADRANTS, COST_TYPES, FORMAT_TYPES, serviceAreaLabel } from '../utils/constants.js'

function labelFor(key, value) {
  switch (key) {
    case 'query':
      return `"${value}"`
    case 'quadrant':
      return QUADRANTS.find((q) => q.value === value)?.label ?? value
    case 'serviceArea':
      return serviceAreaLabel(value)
    case 'cost':
      return COST_TYPES.find((c) => c.value === value)?.label ?? value
    case 'format':
      return FORMAT_TYPES.find((f) => f.value === value)?.label ?? value
    default:
      return value
  }
}

const KEY_PREFIX = {
  query: 'Search',
  quadrant: 'Location',
  serviceArea: 'Service',
  cost: 'Cost',
  format: 'Format',
}

export default function FilterChips({ filters, onRemove }) {
  const activeChips = Object.entries(filters).filter(([, v]) => v !== '')

  if (activeChips.length === 0) return null

  return (
    <div className="filter-chips" role="group" aria-label="Active filters">
      <span className="filter-chips-label">Active filters:</span>
      {activeChips.map(([key, value]) => (
        <button
          key={key}
          className="filter-chip"
          onClick={() => onRemove(key)}
          aria-label={`Remove filter: ${KEY_PREFIX[key]} ${labelFor(key, value)}`}
        >
          <span className="chip-prefix">{KEY_PREFIX[key]}:</span>
          <span className="chip-value">{labelFor(key, value)}</span>
          <span className="chip-remove" aria-hidden="true">✕</span>
        </button>
      ))}
    </div>
  )
}
