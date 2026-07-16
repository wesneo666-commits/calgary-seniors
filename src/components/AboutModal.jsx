import { useEffect, useRef } from 'react'
import programs from '../data/programs.json'

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
      aria-label="About this directory"
    >
      <div className="help-panel" ref={panelRef}>
        <div className="help-header">
          <h2>About this directory</h2>
          <button ref={closeRef} className="detail-close-btn" onClick={onClose} aria-label="Close">
            ✕ Close
          </button>
        </div>

        <div className="help-section">
          <div className="help-icon">📋</div>
          <div>
            <h3>What is this?</h3>
            <p>The <strong>Calgary Seniors Resource Directory</strong> is a free, easy-to-use online directory of programs and services for adults aged 55+ living in Calgary. It brings together reliable, up-to-date information in one place to help older adults, caregivers, and service providers find the supports they need.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">📊</div>
          <div>
            <h3>Where does the information come from?</h3>
            <p>The directory was created through a comprehensive scan of community-based programs and services across Calgary. It currently includes <strong>{programs.length} listings</strong> covering areas that support healthy aging.</p>
            <p>Information is reviewed and updated periodically. However, program details can change so contact the organization directly to confirm availability and eligibility.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">🔒</div>
          <div>
            <h3>Your privacy</h3>
            <p>You can use this directory without creating an account. We do not collect personal information, and your searches and filter preferences are not stored.</p>
          </div>
        </div>

        <div className="help-section">
          <div className="help-icon">🏢</div>
          <div>
            <h3>Who created this?</h3>
            <p>This directory was developed by organizations involved in Age-Friendly Calgary, including the University of Calgary Centre on Aging, Calgary Seniors' Resource Society, and Carya. It was created to improve access to information and help connect Calgary's growing older adult population with the supports they need.</p>
          </div>
        </div>

        <button className="help-close-btn" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  )
}
