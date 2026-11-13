import { useEffect, useRef } from 'react'

// Set this to the demo video's URL once Kate records it (V5 H-02); the
// button stays hidden until then.
const DEMO_VIDEO_URL = ''

const ASSET = import.meta.env.BASE_URL

// Line icons in the same style as the landing page filter buttons
const ICONS = {
  search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m15.5 15.5 5 5" /></>,
  voice: <><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21" /></>,
  filter: <><path d="M4 6h16M7 12h10M10 18h4" /></>,
  open: <><rect x="4" y="3" width="16" height="18" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /></>,
  share: <><path d="M7 9V3.5h10V9" /><rect x="3.5" y="9" width="17" height="8" rx="1.5" /><path d="M7 14.5h10V21H7z" /></>,
}

function Icon({ name }) {
  return (
    <svg className="help-topic-icon" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

// The client's copy (EngAGE Content.docx, H-01), unchanged. Each topic is a
// box that's always open: testers didn't open the drop-downs (V5 round 6,
// 2026-11-13). Each takes one of the logo's ring colours.
const TOPICS = [
  {
    id: 'search',
    icon: 'search',
    accent: 'slate',
    title: 'Search by keyword or postal code',
    body: <p>Type what you are looking for in your own words, such as "fitness classes in the northwest" or "help with transportation to appointments." You can also enter a postal code such as T2N to find services in your area.</p>,
  },
  {
    id: 'voice',
    icon: 'voice',
    accent: 'sage',
    title: 'Search by voice',
    body: <p>Select <strong>Voice search</strong> and say what you are looking for, such as "fitness classes in the northwest." The directory will search using your spoken words.</p>,
  },
  {
    id: 'filters',
    icon: 'filter',
    accent: 'plum',
    title: 'Use filters to narrow results',
    body: <p>Filters help you reduce the number of services shown on the screen. For example, you can choose a service type, location, cost, or format to see only the services that match your needs. You can use one filter or combine several filters.</p>,
  },
  {
    id: 'open',
    icon: 'open',
    accent: 'amber',
    title: 'Open a service for full details',
    body: <p>Select a service name to view more information, including its description, location, cost, and contact details. Some services include links to an organization website. These links open in a new browser tab and take you to an external website.</p>,
  },
  {
    id: 'share',
    icon: 'share',
    accent: 'ember',
    title: 'Print or share a service',
    body: <p>Within any service listing, use the <strong>Print</strong> button to print a copy or the <strong>Share</strong> button to copy a link to the service.</p>,
  },
]

// A side panel, not a modal (V5 H-03): no backdrop and no focus trap, so
// people can keep the instructions open and practise on the page beside
// them. On phones it fills the screen as a page of its own (V5 round 6). Escape or the close buttons dismiss it; focus returns to whatever
// opened it.
export default function HelpModal({ onClose, onStartTour }) {
  const closeRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement
    closeRef.current?.focus()
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <aside className="help-drawer" role="complementary" aria-labelledby="help-drawer-title">
      <div className="help-header">
        <img className="help-mark" src={`${ASSET}engage-mark.svg`} alt="" />
        <h2 id="help-drawer-title">How to Use This Directory</h2>
        {/* ✕ beside the panel on a computer; "← Back" on a phone, where the
            guide is a page of its own (V5 round 6). */}
        <button ref={closeRef} className="help-x" onClick={onClose} aria-label="Close how to use this directory">
          <span className="help-x-icon" aria-hidden="true">✕</span>
          <span className="help-x-back" aria-hidden="true">← Back</span>
        </button>
      </div>

      <div className="help-drawer-body">
        {onStartTour && (
          <button type="button" className="help-tour-btn" onClick={onStartTour}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5.5v13l10.5-6.5z" /></svg>
            Take the guided tour
          </button>
        )}

        <ul className="help-topics">
          {TOPICS.map((t) => (
            <li key={t.id} className={`help-topic help-accent--${t.accent}${t.id === 'voice' ? ' help-section--voice' : ''}`}>
              <div className="help-topic-box">
                <div className="help-topic-head">
                  <span className="help-topic-badge"><Icon name={t.icon} /></span>
                  <h3 className="help-topic-title">{t.title}</h3>
                </div>
                <div className="help-topic-body">{t.body}</div>
              </div>
            </li>
          ))}
        </ul>

        {DEMO_VIDEO_URL && (
          <a className="help-video-btn" href={DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer">
            ▶ Watch a video demo
          </a>
        )}
      </div>

      <div className="help-footer">
        {/* Kept low-key on purpose: available for people who are stuck,
            without becoming the first thing everyone reaches for (X-01). */}
        <p className="help-phone">
          Still need help using the directory? Call Calgary Seniors at{' '}
          <a href="tel:+14032666200">403-266-6200</a>.
        </p>
        <button className="help-close-btn" onClick={onClose}>
          Got it – let's go!
        </button>
      </div>
    </aside>
  )
}
