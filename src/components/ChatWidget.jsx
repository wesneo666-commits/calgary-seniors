import { useEffect, useRef, useState } from 'react'
import programs from '../data/programs.json'
import { filterPrograms } from '../utils/search.js'
import { interpretQuery, describeInterpretation } from '../utils/mockAI.js'

let nextMessageId = 1

const GREETING = {
  id: 0,
  from: 'bot',
  text: 'Hi! I\'m a mock AI assistant for testing this prototype — no real AI is connected yet. Try asking something like "I\'m looking for fitness programs in NE Calgary."',
}

// When a search matches more than this many programs and no location was given,
// the bot asks a location follow-up instead of dumping a huge, unhelpful list.
const BROAD_THRESHOLD = 25

const QUADRANT_OPTIONS = [
  { value: 'NE', label: 'Northeast' },
  { value: 'NW', label: 'Northwest' },
  { value: 'SE', label: 'Southeast' },
  { value: 'SW', label: 'Southwest' },
  { value: 'Central', label: 'Central' },
  { value: 'City-wide', label: 'Anywhere in Calgary' },
]

// Build a bot reply for a set of filters. If the result set is broad and the
// user hasn't picked a location yet, ask a location follow-up (with clickable
// quadrant chips) rather than listing dozens of programs.
function makeBotMessage(filters, summary, allowClarify = true) {
  const matches = filterPrograms(programs, filters)
  const noLocation = filters.quadrant.length === 0
  const clarify = allowClarify && noLocation && matches.length > BROAD_THRESHOLD

  let text
  if (matches.length === 0) {
    text = `I couldn't find any programs for ${summary}. Try a different phrase, or use the filters panel on the left.`
  } else if (clarify) {
    text = `I found ${matches.length} programs for ${summary} — that's a lot to look through. Whereabouts in the city would suit you?`
  } else {
    text = `I found ${matches.length} program${matches.length === 1 ? '' : 's'} for ${summary}. Here ${matches.length === 1 ? 'is' : 'are'} a few:`
  }

  return {
    id: nextMessageId++,
    from: 'bot',
    text,
    sample: clarify ? [] : matches.slice(0, 3),
    totalCount: matches.length,
    filters,
    clarify: clarify ? { baseFilters: filters, summary } : null,
  }
}

// Recognize conversational input (greetings, thanks, one-word replies, meta
// questions) so the bot answers instead of running a junk substring search
// that returns hundreds of unrelated programs. Returns a reply string, or null
// when the text should be treated as a real search.
function smallTalkReply(raw) {
  // Patterns are anchored to the whole message (allowing only trailing
  // punctuation / short greeting tails) so a real request that merely starts
  // with one of these words — e.g. "help getting around" — is still searched.
  const t = raw.toLowerCase().trim()
  if (/^(hi|hey|hello|hiya|howdy|yo|greetings|good (morning|afternoon|evening))( there| again| all| everyone)?[\s!.?]*$/.test(t)) {
    return 'Hi there! Tell me what you\'re looking for — for example, "social programs in the northeast" or "help with transportation".'
  }
  if (/^(thanks|thank you|thanks so much|thx|cheers|ty|much appreciated)[\s!.?]*$/.test(t)) {
    return "You're welcome! Anything else I can help you find?"
  }
  if (/^(help|what can you do|what can you help with|who are you|how does this work|what do you do)[\s!.?]*$/.test(t)) {
    return 'I can help you find seniors\' programs and services. Tell me a topic (like meals, transportation, or making friends) and, if you like, a part of the city — and I\'ll pull up matches.'
  }
  if (/^(yes|no|nope|yeah|yep|ok|okay|sure|maybe)[\s!.?]*$/.test(t)) {
    return 'Sorry, I only understand searches for programs. Try describing what you need, like "fitness classes" or "someone to talk to".'
  }
  return null
}

// True when the text carries no meaningful search term (only very short words),
// which otherwise produces a huge, useless substring match.
function isLowSignal(raw) {
  return raw.toLowerCase().split(/[^a-z0-9]+/).filter((w) => w.length >= 3).length === 0
}

export default function ChatWidget({ onApplyFilters }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
  // Remembers the last unanswered location follow-up, so a typed location
  // (not just a chip click) can be combined with the pending search.
  const [pending, setPending] = useState(null)
  // The "Ask our AI assistant" label beside the bubble, hidden once opened
  // or dismissed so it doesn't nag.
  const [hintDismissed, setHintDismissed] = useState(false)
  const listRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight
  }, [messages, open])

  useEffect(() => {
    function handleClick(e) {
      if (open && panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('.chat-fab')) {
        setOpen(false)
      }
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [open])

  function addExchange(userText, botMsg, nextPending = null) {
    const userMsg = { id: nextMessageId++, from: 'user', text: userText }
    setMessages((m) => [...m, userMsg, botMsg])
    setPending(nextPending)
    setInput('')
  }

  function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const parsed = interpretQuery(text)

    // If the bot just asked "whereabouts?" and the user typed a bare location
    // (rather than clicking a chip), answer the pending search with it instead
    // of starting a brand-new, category-less location search. Strip leftover
    // location filler ("se", "anywhere", …) the parser doesn't remove itself.
    const leftover = (parsed?.cleanedKeywords || '')
      .replace(/\b(se|sw|ne|nw|anywhere|city\s*-?\s*wide|area)\b/g, '')
      .trim()
    if (
      pending &&
      parsed?.quadrant &&
      !parsed.serviceAreaValue &&
      !parsed.costFree &&
      leftover === ''
    ) {
      const label = parsed.quadrant === 'City-wide' ? 'Anywhere in Calgary' : parsed.quadrantLabel
      const narrowed = {
        ...pending.baseFilters,
        quadrant: parsed.quadrant === 'City-wide' ? [] : [parsed.quadrant],
      }
      const locSummary =
        parsed.quadrant === 'City-wide' ? pending.summary : `${pending.summary} in ${label} Calgary`
      addExchange(text, makeBotMessage(narrowed, locSummary, false))
      return
    }

    // Conversational input (greetings, thanks, one-word replies) that isn't a
    // real search — reply instead of dumping a huge substring match.
    if (!parsed?.hasInterpretation) {
      const canned = smallTalkReply(text)
      if (canned) {
        addExchange(text, { id: nextMessageId++, from: 'bot', text: canned })
        return
      }
      if (isLowSignal(text)) {
        addExchange(text, {
          id: nextMessageId++,
          from: 'bot',
          text: 'Could you say a bit more about what you\'re looking for? For example a topic like meals, transportation, or social activities.',
        })
        return
      }
    }

    let derivedFilters
    if (parsed?.hasInterpretation) {
      // Apply what the mock AI recognized (category, quadrant, cost) as real
      // filters instead of relying on a strict word-for-word text match. First
      // keep the leftover keywords too, so specific terms like "wheelchair"
      // still narrow the results.
      const structured = {
        query: '',
        quadrant: parsed.quadrant ? [parsed.quadrant] : [],
        serviceArea: parsed.serviceAreaValue || '',
        cost: parsed.costFree ? 'Free' : '',
        format: '',
      }
      const withKeywords = { ...structured, query: parsed.cleanedKeywords }
      // The leftover words may just be conversational filler (e.g. "meet new
      // people and socialize") that the category already captured — fall back
      // to the structured filters so we return the recognized category instead
      // of nothing.
      derivedFilters = filterPrograms(programs, withKeywords).length > 0 ? withKeywords : structured
    } else {
      // Nothing recognized — plain text search on the raw input.
      derivedFilters = { query: text, quadrant: [], serviceArea: '', cost: '', format: '' }
    }

    const summary = describeInterpretation(parsed) || `"${text}"`
    const botMsg = makeBotMessage(derivedFilters, summary)
    addExchange(text, botMsg, botMsg.clarify)
  }

  // The user picked a location chip from a follow-up question — narrow the
  // pending search by that quadrant ("Anywhere" clears the location filter).
  function chooseLocation(baseFilters, summary, option) {
    const narrowed = {
      ...baseFilters,
      quadrant: option.value === 'City-wide' ? [] : [option.value],
    }
    const locSummary =
      option.value === 'City-wide' ? summary : `${summary} in ${option.label} Calgary`
    addExchange(option.label, makeBotMessage(narrowed, locSummary, false))
  }

  function viewAll(filters) {
    onApplyFilters(filters)
    setOpen(false)
  }

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel" role="dialog" aria-label="Mock AI assistant" ref={panelRef}>
          <div className="chat-panel-header">
            <span>Ask about programs <span className="chat-mock-badge">Mock AI</span></span>
            <button type="button" className="chat-close-btn" onClick={() => setOpen(false)} aria-label="Close chat">✕</button>
          </div>

          <div className="chat-messages" ref={listRef}>
            {messages.map((m) => (
              <div key={m.id} className={`chat-msg chat-msg--${m.from}`}>
                <p>{m.text}</p>
                {m.sample && m.sample.length > 0 && (
                  <ul className="chat-sample-list">
                    {m.sample.map((p) => (
                      <li key={p.id}>
                        <strong>{p.programName}</strong> — {p.organization}
                      </li>
                    ))}
                  </ul>
                )}
                {m.clarify && (
                  <div className="chat-loc-chips">
                    {QUADRANT_OPTIONS.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        className="chat-loc-chip"
                        onClick={() => chooseLocation(m.clarify.baseFilters, m.clarify.summary, opt)}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
                {m.totalCount > 0 && (
                  <button type="button" className="chat-view-all-btn" onClick={() => viewAll(m.filters)}>
                    {m.clarify ? `Show all ${m.totalCount} anyway` : `View all ${m.totalCount} result${m.totalCount === 1 ? '' : 's'}`}
                  </button>
                )}
              </div>
            ))}
          </div>

          <form className="chat-input-row" onSubmit={handleSend}>
            <label htmlFor="chat-input" className="sr-only">Ask a question</label>
            <input
              id="chat-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='e.g. "fitness in NE Calgary"'
              autoComplete="off"
            />
            <button type="submit" aria-label="Send message">➤</button>
          </form>
        </div>
      )}

      {!open && !hintDismissed && (
        <div className="chat-fab-hint">
          <button
            type="button"
            className="chat-fab-hint-label"
            onClick={() => { setOpen(true); setHintDismissed(true) }}
          >
            <span className="chat-fab-hint-title">👋 Ask our AI assistant</span>
            <span className="chat-fab-hint-sub">Chat to find a program</span>
          </button>
          <button
            type="button"
            className="chat-fab-hint-close"
            onClick={() => setHintDismissed(true)}
            aria-label="Dismiss assistant hint"
          >
            ✕
          </button>
        </div>
      )}

      <button
        type="button"
        className="chat-fab"
        onClick={() => { setOpen((o) => !o); setHintDismissed(true) }}
        aria-expanded={open}
        aria-label={open ? 'Close chat assistant' : 'Open AI chat assistant'}
      >
        💬
      </button>
    </div>
  )
}
