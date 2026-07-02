import { postalToQuadrant } from '../utils/postal.js'
import { interpretQuery, describeInterpretation } from '../utils/mockAI.js'

const QUADRANT_LABEL = { NW: 'Northwest', NE: 'Northeast', SW: 'Southwest', SE: 'Southeast' }

export default function SearchBar({ value, onChange }) {
  const detectedQuadrant = postalToQuadrant(value)

  // Only offer the "AI understood this as" hint for sentence-like input —
  // a single word like "fitness" should just look like a normal search.
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const aiResult = !detectedQuadrant && wordCount > 1 ? interpretQuery(value) : null
  const aiSummary = aiResult ? describeInterpretation(aiResult) : null

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
      ) : aiSummary ? (
        <p className="search-hint search-hint--ai" role="status">
          <span className="ai-hint-badge" aria-hidden="true">Mock AI</span> Searching for {aiSummary}
          {aiResult.centralRequested && ' — Calgary Centre isn’t tagged in our data yet, showing all of Calgary instead'}
          {' — '}<button className="hint-clear-btn" onClick={() => onChange('')} type="button">clear</button>
        </p>
      ) : (
        <p className="search-hint">
          Tip: Enter a postal code (e.g. <strong>T2N</strong>), or try a full sentence like "fitness in the north east"
        </p>
      )}
    </div>
  )
}
