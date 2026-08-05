import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'

export default function HelpModal({ onClose }) {
  const closeRef = useRef(null)
  const overlayRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => { closeRef.current?.focus() }, [])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && panelRef.current) {
        const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)]
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  return (
    <div
      className="detail-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Help — how to use this directory"
    >
      <div className="help-panel" ref={panelRef}>
        <div className="help-header">
          <h2>How to use this directory</h2>
          <button ref={closeRef} className="detail-close-btn" onClick={onClose} aria-label="Close help">
            ✕ Close
          </button>
        </div>

        <div className="help-section">
          <div className="help-icon">🔍</div>
          <div>
            <h3>Search by keyword or postal code</h3>
            <p>Type a word that describes what you're looking for — like <strong>fitness</strong>, <strong>meals</strong>, or <strong>mental health</strong>. You can also type your postal code (e.g. <strong>T2N</strong>) to see programs in your area.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">🎙</div>
          <div>
            <h3>Search by voice</h3>
            <p>Press the <strong>Voice search</strong> button next to the search box and speak what you're looking for — like "fitness classes in the northwest." While it hears you, the page shows <strong>Listening…</strong> and the button changes to <strong>Stop listening</strong>. Press it when you're finished, or pause and it will stop on its own. You can type instead at any time.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">🗂</div>
          <div>
            <h3>Use filters to narrow results</h3>
            <p>On the left side, you'll find four filters: <strong>location</strong>, <strong>service type</strong>, <strong>cost</strong>, and <strong>service format</strong>. You can use any combination — location even lets you pick more than one area at once. Active filters show as tags at the top of your results — click the <strong>✕</strong> on any tag to remove it.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">📋</div>
          <div>
            <h3>Open a program for full details</h3>
            <p>Click or tap any card to see full information — including a description, eligibility, location, cost, and contact details. From there you can call, email, or visit the program's website.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">🖨</div>
          <div>
            <h3>Print or share a listing</h3>
            <p>Inside any program listing, use the <strong>Print</strong> button to print a clean copy, or the <strong>Share</strong> button to copy the link.</p>
          </div>
        </div>

        <button className="help-close-btn" onClick={onClose}>
          Got it — let's go!
        </button>
      </div>
    </div>
  )
}
