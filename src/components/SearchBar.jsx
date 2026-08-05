import { postalToQuadrant } from '../utils/postal.js'
import { interpretQuery, describeInterpretation } from '../utils/mockAI.js'
import { useSpeechToText } from '../hooks/useSpeechToText.js'

const QUADRANT_LABEL = { NW: 'Northwest', NE: 'Northeast', SW: 'Southwest', SE: 'Southeast', Central: 'Central Calgary' }

function MicIcon() {
  return (
    <svg
      className="voice-btn-icon"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3z" />
      <path d="M19 10v1a7 7 0 0 1-14 0v-1" />
      <line x1="12" y1="18" x2="12" y2="22" />
    </svg>
  )
}

export default function SearchBar({ value, onChange }) {
  const { supported, listening, error: voiceError, start, stop, clearError } = useSpeechToText(onChange)
  const detectedQuadrant = postalToQuadrant(value)

  // Only offer the "AI understood this as" hint for sentence-like input —
  // a single word like "fitness" should just look like a normal search.
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const aiResult = !detectedQuadrant && wordCount > 1 ? interpretQuery(value) : null
  const aiSummary = aiResult ? describeInterpretation(aiResult) : null

  function handleTyping(next) {
    if (voiceError) clearError()
    onChange(next)
  }

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
            onChange={(e) => handleTyping(e.target.value)}
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
        {supported && (
          <button
            type="button"
            className={`voice-btn${listening ? ' voice-btn--listening' : ''}`}
            onClick={listening ? stop : start}
            aria-pressed={listening}
            aria-label={listening ? 'Stop listening' : 'Search by voice'}
          >
            <MicIcon />
            {listening ? 'Stop listening' : 'Voice search'}
          </button>
        )}
      </div>
      {/* Announces listening state to screen readers without moving focus */}
      <span className="sr-only" role="status">
        {listening ? 'Listening. Speak your search now.' : ''}
      </span>
      {voiceError ? (
        <p className="search-hint search-hint--error" role="alert">
          {voiceError}
        </p>
      ) : listening ? (
        <p className="search-hint search-hint--detected" role="status">
          Listening… Speak now, then press <strong>Stop listening</strong> when finished.
        </p>
      ) : detectedQuadrant ? (
        <p className="search-hint search-hint--detected" role="status">
          Showing programs in <strong>{QUADRANT_LABEL[detectedQuadrant]}{detectedQuadrant !== 'Central' && ` (${detectedQuadrant})`}</strong> — <button className="hint-clear-btn" onClick={() => onChange('')} type="button">clear</button>
        </p>
      ) : aiSummary ? (
        <p className="search-hint search-hint--ai" role="status">
          <span className="ai-hint-badge" aria-hidden="true">Mock AI</span> Searching for {aiSummary}
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
