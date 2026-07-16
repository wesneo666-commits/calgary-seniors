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

export default function ChatWidget({ onApplyFilters }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([GREETING])
  const [input, setInput] = useState('')
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

  function handleSend(e) {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const parsed = interpretQuery(text)
    const derivedFilters = {
      query: parsed?.hasInterpretation ? parsed.cleanedKeywords : text,
      quadrant: parsed?.quadrant ? [parsed.quadrant] : [],
      serviceArea: '',
      cost: parsed?.costFree ? 'Free' : '',
      format: '',
    }
    const matches = filterPrograms(programs, derivedFilters)
    const summary = describeInterpretation(parsed) || `"${text}"`

    let replyText
    if (matches.length === 0) {
      replyText = `I couldn't find any programs for ${summary}. Try a different phrase, or use the filters panel on the left.`
    } else {
      replyText = `I found ${matches.length} program${matches.length === 1 ? '' : 's'} for ${summary}. Here ${matches.length === 1 ? 'is' : 'are'} a few:`
    }
    const userMsg = { id: nextMessageId++, from: 'user', text }
    const botMsg = {
      id: nextMessageId++,
      from: 'bot',
      text: replyText,
      sample: matches.slice(0, 3),
      totalCount: matches.length,
      filters: derivedFilters,
    }

    setMessages((m) => [...m, userMsg, botMsg])
    setInput('')
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
                {m.totalCount > 0 && (
                  <button type="button" className="chat-view-all-btn" onClick={() => viewAll(m.filters)}>
                    View all {m.totalCount} result{m.totalCount === 1 ? '' : 's'}
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

      <button
        type="button"
        className="chat-fab"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label={open ? 'Close chat assistant' : 'Open chat assistant (mock AI)'}
      >
        💬
      </button>
    </div>
  )
}
