import { useEffect, useRef, useState } from 'react'
import CostBadge from './CostBadge.jsx'
import ContactButtons from './ContactButtons.jsx'
import { SERVICE_AREAS, quadrantFullLabel, serviceGroupSlug } from '../utils/constants.js'
import { cleanPopulationTags, extractRegistrationUrl, parseContactEmail, parsePhones } from '../utils/program.js'

function friendlyServiceLabel(value) {
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

function normalizeEligibility(value) {
  if (!value) return null
  const trimmed = value.trim()
  if (trimmed === '' || trimmed.toLowerCase() === 'n/a') return 'Open to anyone'
  return trimmed
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

function shareUrlFor(program) {
  return `${window.location.origin}${window.location.pathname}?program=${encodeURIComponent(program.id)}`
}

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

export default function ProgramDetail({ program, onClose, backLabel = '← Back to results' }) {
  const closeRef = useRef(null)
  const overlayRef = useRef(null)
  const panelRef = useRef(null)
  const shareRef = useRef(null)
  const [shareOpen, setShareOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => { closeRef.current?.focus() }, [program])

  useEffect(() => {
    function handleKey(e) {
      if (e.key === 'Escape') {
        if (shareOpen) { setShareOpen(false); return }
        onClose()
        return
      }

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
  }, [onClose, shareOpen])

  useEffect(() => {
    function handleClick(e) {
      if (shareOpen && shareRef.current && !shareRef.current.contains(e.target)) setShareOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [shareOpen])

  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) onClose()
  }

  function handlePrint() {
    window.print()
  }

  function handleCopyUrl() {
    navigator.clipboard.writeText(shareUrlFor(program)).catch(() => {})
    setCopied(true)
    setTimeout(() => setShareOpen(false), 700)
  }

  const friendlyServiceAreas = program.serviceArea.map((value) => ({
    label: friendlyServiceLabel(value),
    slug: serviceGroupSlug(value),
  }))
  const population = cleanPopulationTags(program.intendedPopulation)
  const eligibility = normalizeEligibility(program.eligibility)
  const { address: contactEmail, contactFormUrl } = parseContactEmail(program.email)
  const hasContactInfo = !!(
    parsePhones(program.phone).length > 0
    || contactEmail
    || contactFormUrl
    || program.programWebsite
    || program.orgWebsite
    || extractRegistrationUrl(program.howToAccess)
  )
  const mailtoBody = encodeURIComponent(`Take a look at this program on the Calgary Seniors Resource Directory:\n${shareUrlFor(program)}`)

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

        <div className="print-only-header">
          <span>Calgary Seniors Resource Directory</span>
          <span>Printed {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        {/* Top bar: close left, print/share right */}
        <div className="detail-top-bar">
          <button
            ref={closeRef}
            className="detail-close-btn"
            onClick={onClose}
            aria-label="Close program details"
          >
            {backLabel}
          </button>
          <div className="detail-actions">
            <button className="detail-action-btn" onClick={handlePrint} aria-label="Print this resource">
              🖨 Print
            </button>
            <div className="share-wrap" ref={shareRef}>
              <button
                className="detail-action-btn"
                onClick={() => { setShareOpen((o) => !o); setCopied(false) }}
                aria-haspopup="menu"
                aria-expanded={shareOpen}
                aria-label="Share this resource"
              >
                🔗 Share
              </button>
              {shareOpen && (
                <div className="share-menu" role="menu" aria-label="Share options">
                  <button className="share-menu-item" role="menuitem" onClick={handleCopyUrl}>
                    {copied ? '✓ Copied!' : '📋 Copy URL'}
                  </button>
                  <a
                    className="share-menu-item"
                    role="menuitem"
                    href={`mailto:?subject=${encodeURIComponent(`Take a look: ${program.programName}`)}&body=${mailtoBody}`}
                    onClick={() => setShareOpen(false)}
                  >
                    ✉️ Share by email
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="detail-org">{program.organization}</div>
          <h2 className="detail-name">{program.programName}</h2>
        </div>

        {/* Header: service area type tags (most scannable identity info) */}
        {friendlyServiceAreas.length > 0 && (
          <div className="detail-badges">
            {friendlyServiceAreas.map(({ label, slug }) => (
              <span key={label} className={`badge badge-service badge-service--${slug}`}>{label}</span>
            ))}
          </div>
        )}

        <hr className="detail-divider" />

        {/* Cost / location / format */}
        <div className="detail-section">
          <span className="detail-label">Cost, location & format</span>
          <div className="detail-badges">
            <CostBadge cost={program.cost} />
            {program.quadrant.map((q) => (
              <span key={q} className="badge badge-quad">{quadrantFullLabel(q)}</span>
            ))}
            {program.format.map((f) => (
              <span key={f} className="badge badge-format">{f}</span>
            ))}
          </div>
        </div>

        {/* Get in touch moved up, directly under cost/location/format — REQ-039 */}
        {hasContactInfo && (
          <>
            <div className="detail-section">
              <span className="detail-label">Get in touch</span>
              <ContactButtons program={program} />
            </div>
            <hr className="detail-divider" />
          </>
        )}

        <div className="detail-section">
          <span className="detail-label">About this resource</span>
          <p className="detail-value">{program.description}</p>
        </div>

        <InfoRow label="Who can participate" value={eligibility} />
        <InfoRow label="How to access"       value={program.howToAccess} />
        <InfoRow label="Cost details"        value={program.costDetails} />
        <InfoRow label="Important notes"     value={program.importantNotes} />
        <InfoRow label="Address"             value={program.address} />

        <TagRow label="When offered"     values={program.cadence} />
        {population.length > 0 && (
          <TagRow label="Who this serves" values={population} />
        )}

        <button
          className="detail-close-btn"
          onClick={onClose}
          aria-label="Close program details"
        >
          {backLabel}
        </button>
      </div>
    </div>
  )
}
