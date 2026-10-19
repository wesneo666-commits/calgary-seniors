import { useEffect, useRef } from 'react'

// Set this to the demo video's URL once Kate records it (V5 H-02); the
// button stays hidden until then.
const DEMO_VIDEO_URL = ''

// A side panel, not a modal (V5 H-03): no backdrop and no focus trap, so
// people can keep the instructions open and practise on the page beside
// them. Escape or the close buttons dismiss it; focus returns to whatever
// opened it.
export default function HelpModal({ onClose }) {
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
        <h2 id="help-drawer-title">How to Use This Directory</h2>
        <button ref={closeRef} className="detail-close-btn" onClick={onClose} aria-label="Close how to use this directory">
          ✕ Close
        </button>
      </div>

      <div className="help-drawer-body">
        <div className="help-section">
          <div className="help-icon" aria-hidden="true">🔍</div>
          <div>
            <h3>Search by keyword or postal code</h3>
            <p>Type what you are looking for in your own words, such as "fitness classes in the northwest" or "help with transportation to appointments." You can also enter a postal code such as T2N to find services in your area.</p>
          </div>
        </div>

        <div className="help-section help-section--voice">
          <div className="help-icon" aria-hidden="true">🎙</div>
          <div>
            <h3>Search by voice</h3>
            <p>Select <strong>Voice search</strong> and say what you are looking for, such as "fitness classes in the northwest." The directory will search using your spoken words.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon" aria-hidden="true">🗂</div>
          <div>
            <h3>Use filters to narrow results</h3>
            <p>Filters help you reduce the number of services shown on the screen. For example, you can choose a service location, type, cost, or format to see only the services that match your needs. You can use one filter or combine several filters.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon" aria-hidden="true">📋</div>
          <div>
            <h3>Open a service for full details</h3>
            <p>Select a service name to view more information, including its description, location, cost, and contact details. Some services include links to an organization website. These links open in a new browser tab and take you to an external website.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon" aria-hidden="true">🖨</div>
          <div>
            <h3>Print or share a service</h3>
            <p>Within any service listing, use the <strong>Print</strong> button to print a copy or the <strong>Share</strong> button to copy a link to the service.</p>
          </div>
        </div>

        {DEMO_VIDEO_URL && (
          <a className="help-video-btn" href={DEMO_VIDEO_URL} target="_blank" rel="noopener noreferrer">
            ▶ Watch a video demo
          </a>
        )}

        <button className="help-close-btn" onClick={onClose}>
          Got it – let's go!
        </button>
      </div>
    </aside>
  )
}
