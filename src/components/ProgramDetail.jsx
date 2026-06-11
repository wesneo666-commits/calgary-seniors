import { useEffect, useRef } from 'react'
import CostBadge from './CostBadge.jsx'
import ContactButtons from './ContactButtons.jsx'
import { SERVICE_AREAS } from '../utils/constants.js'

function friendlyServiceLabel(value) {
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

function cleanPopulationTags(values) {
  return values
    .filter((v) => v !== 'None (general population)')
    .map((v) => (v === 'Older adults (no age specified)' ? 'Older adults' : v))
}

function InfoRow({ label, value }) {
  if (!value) return null
  return (
    <div className="detail-section">
      <span className="detail-label">{label}</span>
      <span className="detail-value">{value}</span>
    </div>
  )
}

function TagRow({ label, values }) {
  if (!values || values.length === 0) return null
  return (
    <div className="detail-section">
      <span className="detail-label">{label}</span>
      <div className="detail-badges">
        {values.map((v) => (
          <span key={v} className="badge badge-format">{v}</span>
        ))}
      </div>
    </div>
  )
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function ProgramDetail({ program, onClose }) {
  const closeRef = useRef(null)
  const overlayRef = useRef(null)
  const panelRef = useRef(null)

  useEffect(() => { closeRef.current?.focus() }, [program])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') { onClose(); return }

      // Focus trap: keep Tab inside the panel
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

  const friendlyServiceAreas = program.serviceArea.map(friendlyServiceLabel)
  const population = cleanPopulationTags(program.intendedPopulation)

  return (
    <div
      className="detail-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Program details: ${program.programName}`}
    >
      <div className="detail-panel" ref={panelRef}>
        <button
          ref={closeRef}
          className="detail-close-btn"
          onClick={onClose}
          aria-label="Close program details"
        >
          ← Back to results
        </button>

        <div>
          <div className="detail-org">{program.organization}</div>
          <h2 className="detail-name">{program.programName}</h2>
        </div>

        <div className="detail-badges">
          <CostBadge cost={program.cost} />
          {program.quadrant.map((q) => (
            <span key={q} className="badge badge-quad">{q}</span>
          ))}
          {program.format.map((f) => (
            <span key={f} className="badge badge-format">{f}</span>
          ))}
        </div>

        <hr className="detail-divider" />

        <div className="detail-section">
          <span className="detail-label">About this program</span>
          <p className="detail-value">{program.description}</p>
        </div>

        <InfoRow label="Who can participate" value={program.eligibility} />
        <InfoRow label="How to access"       value={program.howToAccess} />
        <InfoRow label="Cost details"        value={program.costDetails} />
        <InfoRow label="Important notes"     value={program.importantNotes} />
        <InfoRow label="Address"             value={program.address} />

        <TagRow label="When offered"    values={program.cadence} />
        <TagRow label="Type of service" values={friendlyServiceAreas} />
        {population.length > 0 && (
          <TagRow label="Who this serves" values={population} />
        )}

        {(program.phone || program.email || program.programWebsite || program.orgWebsite) && (
          <>
            <hr className="detail-divider" />
            <div className="detail-section">
              <span className="detail-label">Get in touch</span>
              <ContactButtons program={program} />
            </div>
          </>
        )}

        <button
          className="detail-close-btn"
          onClick={onClose}
          aria-label="Close program details"
        >
          ← Back to results
        </button>
      </div>
    </div>
  )
}
