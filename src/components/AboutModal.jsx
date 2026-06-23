import { useEffect, useRef } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])'

export default function AboutModal({ onClose }) {
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
      aria-label="About this guide"
    >
      <div className="help-panel" ref={panelRef}>
        <div className="help-header">
          <h2>About this guide</h2>
          <button ref={closeRef} className="detail-close-btn" onClick={onClose} aria-label="Close">
            ✕ Close
          </button>
        </div>

        <div className="help-section">
          <div className="help-icon">📋</div>
          <div>
            <h3>What is this?</h3>
            <p>The <strong>Calgary Seniors Resource Guide</strong> is a free, searchable directory of programs and services available to older adults living in Calgary, Alberta. It was created to make it easier for seniors, caregivers, and service navigators to find the right support — in one place.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">📊</div>
          <div>
            <h3>Where does the data come from?</h3>
            <p>All listings are sourced from the <strong>Calgary Seniors Resource Society Environmental Scan</strong> — a comprehensive survey of programs and services operating across Calgary. The directory currently includes <strong>688 programs</strong> across health, social connection, practical support, home care, and more.</p>
            <p style={{ marginTop: '8px' }}>Information is reviewed periodically. Always contact an organization directly to confirm current availability, hours, and eligibility.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">🔒</div>
          <div>
            <h3>Your privacy</h3>
            <p>This guide does not collect any personal information. No account is needed. Your searches and filter selections are not recorded or stored.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">🏢</div>
          <div>
            <h3>Who built this?</h3>
            <p>This guide was developed on behalf of the <strong>Calgary Seniors Resource Society</strong> as part of an ongoing effort to improve access to supports for Calgary's older adult community.</p>
          </div>
        </div>

        <button className="help-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
