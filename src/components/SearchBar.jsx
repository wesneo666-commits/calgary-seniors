import { postalToQuadrant } from '../utils/postal.js'

const QUADRANT_LABEL = { NW: 'Northwest', NE: 'Northeast', SW: 'Southwest', SE: 'Southeast' }

export default function SearchBar({ value, onChange }) {
  const detectedQuadrant = postalToQuadrant(value)

  return (
    <div className="search-bar-outer">
      <div className="search-bar-wrap">
        <label htmlFor="search-input" className="sr-only">
          Search programs by keyword, organization, or postal code
        </label>
        <div className="search-input-wrap">
          <input
            id="search-input"
            type="search"
            className="search-input"
            placeholder="Search by keyword, program name, or organization…"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            autoComplete="off"
            aria-label="Search programs"
          />
          {value && (
            <button
              className="search-clear-btn"
              onClick={() => onChange('')}
              aria-label="Clear search"
              type="button"
            >
              ✕
            </button>
          )}
        </div>
      </div>
      {detectedQuadrant ? (
        <p className="search-hint search-hint--detected" role="status">
          Showing programs in <strong>{QUADRANT_LABEL[detectedQuadrant]} ({detectedQuadrant})</strong> — <button className="hint-clear-btn" onClick={() => onChange('')} type="button">clear</button>
        </p>
      ) : (
        <p className="search-hint">
          Tip: Enter a postal code (e.g. <strong>T2N</strong>) to find programs near you
        </p>
      )}
    </div>
  )
}
