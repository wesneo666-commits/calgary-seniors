import { useEffect, useId, useRef, useState } from 'react'
import { postalToQuadrant } from '../utils/postal.js'
import { interpretQuery, describeInterpretation } from '../utils/mockAI.js'
import { suggestionsFor } from '../utils/suggest.js'
import { useSpeechToText } from '../hooks/useSpeechToText.js'

const QUADRANT_LABEL = { NW: 'Northwest', NE: 'Northeast', SW: 'Southwest', SE: 'Southeast', Central: 'Central Calgary' }

const KIND_LABEL = { type: 'Service type', keyword: 'Topic', organization: 'Organization' }

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

function SearchIcon({ className }) {
  return (
    <svg
      className={className}
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="10.5" cy="10.5" r="6.5" />
      <line x1="15.5" y1="15.5" x2="21" y2="21" />
    </svg>
  )
}

// The search only runs when the person submits — Enter, the Search button,
// a tapped suggestion, or the end of voice input (V5 S-02). `value` is the
// submitted query; the text box keeps its own draft until then.
export default function SearchBar({ value, onSubmit }) {
  const [draft, setDraft] = useState(value)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(-1)
  const listId = useId()
  const wrapRef = useRef(null)
  const inputRef = useRef(null)

  // Keep the box in step when the query is changed elsewhere (logo reset,
  // "Clear search" in the results header, a landing-page search).
  useEffect(() => { setDraft(value) }, [value])

  const { supported, listening, error: voiceError, start, stop, clearError } = useSpeechToText(setDraft)

  // Voice input submits as soon as recognition ends with words in the box.
  const wasListening = useRef(false)
  useEffect(() => {
    if (wasListening.current && !listening && draft.trim()) submit(draft)
    wasListening.current = listening
  }, [listening]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const suggestions = open && draft !== value ? suggestionsFor(draft) : []
  const showList = suggestions.length > 0

  const detectedQuadrant = postalToQuadrant(value)
  // Only offer the "AI understood this as" hint for sentence-like input —
  // a single word like "fitness" should just look like a normal search.
  const wordCount = value.trim() ? value.trim().split(/\s+/).length : 0
  const aiResult = !detectedQuadrant && wordCount > 1 ? interpretQuery(value) : null
  const aiSummary = aiResult ? describeInterpretation(aiResult) : null

  function submit(text) {
    setDraft(text)
    setOpen(false)
    setActive(-1)
    onSubmit(text.trim())
  }

  function handleTyping(next) {
    if (voiceError) clearError()
    setDraft(next)
    setOpen(true)
    setActive(-1)
  }

  function handleKeyDown(e) {
    if (!showList) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((i) => (i + 1) % suggestions.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((i) => (i <= 0 ? suggestions.length - 1 : i - 1))
    } else if (e.key === 'Escape') {
      setOpen(false)
      setActive(-1)
    }
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    submit(active >= 0 && showList ? suggestions[active].text : draft)
  }

  function clearAll() {
    setDraft('')
    onSubmit('')
    inputRef.current?.focus()
  }

  return (
    <div className="search-bar-outer">
      <form className="search-bar-wrap" onSubmit={handleFormSubmit} ref={wrapRef}>
        <label htmlFor="search-input" className="sr-only">
          Search services by keyword, organization, or postal code
        </label>
        <div className="search-input-wrap">
          <SearchIcon className="search-input-icon" />
          <input
            id="search-input"
            ref={inputRef}
            type="search"
            className="search-input"
            placeholder="What are you looking for?"
            value={draft}
            onChange={(e) => handleTyping(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setOpen(true)}
            autoComplete="off"
            enterKeyHint="search"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={showList}
            aria-controls={listId}
            aria-activedescendant={showList && active >= 0 ? `${listId}-${active}` : undefined}
          />
          {draft && (
            <button
              className="search-clear-btn"
              onClick={clearAll}
              aria-label="Clear search"
              type="button"
            >
              ✕
            </button>
          )}
          {showList && (
            <ul className="search-suggest" id={listId} role="listbox" aria-label="Search suggestions">
              {suggestions.map((s, i) => (
                <li
                  key={s.text}
                  id={`${listId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`search-suggest-item${i === active ? ' search-suggest-item--active' : ''}`}
                  // mousedown, not click — fires before the input's blur so
                  // the list is still there to be tapped.
                  onMouseDown={(e) => { e.preventDefault(); submit(s.text) }}
                >
                  <SearchIcon className="search-suggest-icon" />
                  <span className="search-suggest-text">{s.text}</span>
                  <span className="search-suggest-kind">{KIND_LABEL[s.kind]}</span>
                </li>
              ))}
            </ul>
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
            <span className="voice-btn-label">{listening ? 'Stop listening' : 'Voice search'}</span>
          </button>
        )}
        <button type="submit" className="search-btn">
          <SearchIcon className="search-btn-icon" />
          <span>Search</span>
        </button>
      </form>
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
          Showing services in <strong>{QUADRANT_LABEL[detectedQuadrant]}{detectedQuadrant !== 'Central' && ` (${detectedQuadrant})`}</strong> — <button className="hint-clear-btn" onClick={clearAll} type="button">clear</button>
        </p>
      ) : aiSummary ? (
        <p className="search-hint search-hint--ai" role="status">
          <span className="ai-hint-badge" aria-hidden="true">Mock AI</span> Searching for {aiSummary}
          {' — '}<button className="hint-clear-btn" onClick={clearAll} type="button">clear</button>
        </p>
      ) : (
        <p className="search-hint">
          <strong>Tip:</strong> Describe what you are looking for in your own words, such as "fitness classes in the northwest" or "help with transportation to appointments." You can also enter a postal code such as <strong>T2N</strong> to find services in your area.
        </p>
      )}
    </div>
  )
}
