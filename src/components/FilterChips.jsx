import { QUADRANTS, COST_TYPES, FORMAT_TYPES, serviceAreaLabel } from '../utils/constants.js'

function labelFor(key, value) {
  switch (key) {
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
  quadrant: 'Location',
  serviceArea: 'Service',
  cost: 'Cost',
  format: 'Service Format',
}

export default function FilterChips({ filters, onRemove }) {
  // Location supports multiple simultaneous values (REQ-020), so it expands
  // into one chip per selection instead of one chip for the whole filter.
  // The search term is shown in the results header, not as a filter tag —
  // tags are only for filters (V5 S-06).
  const activeChips = Object.entries(filters).filter(([key]) => key !== 'query').flatMap(([key, value]) => {
    if (Array.isArray(value)) return value.map((v) => ({ key, value: v }))
    return value !== '' ? [{ key, value }] : []
  })

  if (activeChips.length === 0) return null

  return (
    <div className="filter-chips" role="group" aria-label="Active filters">
      <span className="filter-chips-label">Active filters:</span>
      {activeChips.map(({ key, value }) => (
        <button
          key={`${key}-${value}`}
          className="filter-chip"
          onClick={() => onRemove(key, value)}
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
