import { useEffect, useRef, useState } from 'react'
import LineIcon from './LineIcon.jsx'
import CostBadge from './CostBadge.jsx'
import ContactButtons from './ContactButtons.jsx'
import LinkedText from './LinkedText.jsx'
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

function InfoRow({ label, value, addresses = false }) {
  if (!value) return null
  return (
    <div className="detail-section">
      <span className="detail-label">{label}</span>
      <span className={`detail-value${addresses ? ' detail-value--lines' : ''}`}>
        <LinkedText text={value} addresses={addresses} />
      </span>
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

// Standard share (box with an up arrow) and printer icons (V5 SP-02).
function ShareIcon() {
  return (
    <svg className="detail-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 9H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-2" />
      <polyline points="8 6 12 2 16 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  )
}

function PrintIcon() {
  return (
    <svg className="detail-action-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="6 9 6 2 18 2 18 9" />
      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
      <rect x="6" y="14" width="12" height="8" />
    </svg>
  )
}

// Text-message and WhatsApp sharing only make sense on a phone (V5 SP-01).
function isPhone() {
  return window.matchMedia?.('(max-width: 768px) and (pointer: coarse)').matches ?? false
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

  // Older/non-secure-context Safari doesn't expose navigator.clipboard at
  // all — calling .writeText on it throws before the promise chain even
  // starts, so the button silently does nothing. Fall back to the
  // execCommand approach there (V4 mobile P0: "make Share actions usable
  // in mobile Safari", 2026-07-24).
  function copyText(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text)
    }
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea')
      textarea.value = text
      textarea.style.position = 'fixed'
      textarea.style.opacity = '0'
      document.body.appendChild(textarea)
      textarea.focus()
      textarea.select()
      try {
        document.execCommand('copy') ? resolve() : reject()
      } catch (err) {
        reject(err)
      } finally {
        document.body.removeChild(textarea)
      }
    })
  }

  function handleCopyUrl() {
    copyText(shareUrlFor(program)).then(
      () => {
        setCopied(true)
        setTimeout(() => setShareOpen(false), 700)
      },
      () => setCopied(false)
    )
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
  const shareMessage = `Take a look at this service on EngAGE: Calgary Directory for Aging Well:\n${shareUrlFor(program)}`
  const mailtoBody = encodeURIComponent(shareMessage)
  const onPhone = isPhone()

  return (
    <div
      className="detail-overlay"
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label={`Service details: ${program.programName}`}
    >
      <div className="detail-panel" ref={panelRef}>

        <div className="print-only-header">
          <span>EngAGE: Calgary Directory for Aging Well</span>
          <span>Printed {new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
        </div>

        {/* Top bar: close left, print/share right */}
        <div className="detail-top-bar">
          <button
            ref={closeRef}
            className="detail-close-btn"
            onClick={onClose}
            aria-label="Close service details"
          >
            {backLabel}
          </button>
          <div className="detail-actions">
            <button className="detail-action-btn" onClick={handlePrint} aria-label="Print this service">
              <PrintIcon /> Print
            </button>
            <div className="share-wrap" ref={shareRef}>
              <button
                className="detail-action-btn"
                onClick={() => { setShareOpen((o) => !o); setCopied(false) }}
                aria-haspopup="menu"
                aria-expanded={shareOpen}
                aria-label="Share this service"
              >
                <ShareIcon /> Share
              </button>
              {shareOpen && (
                <div className="share-menu" role="menu" aria-label="Share options">
                  <button className="share-menu-item" role="menuitem" onClick={handleCopyUrl}>
                    {copied ? <><LineIcon name="check" /> Copied!</> : <><LineIcon name="link" /> Copy URL</>}
                  </button>
                  <a
                    className="share-menu-item"
                    role="menuitem"
                    href={`mailto:?subject=${encodeURIComponent(`Take a look: ${program.programName}`)}&body=${mailtoBody}`}
                    onClick={() => setShareOpen(false)}
                  >
                    <LineIcon name="mail" /> Share by email
                  </a>
                  {onPhone && (
                    <>
                      <a
                        className="share-menu-item"
                        role="menuitem"
                        href={`sms:?&body=${mailtoBody}`}
                        onClick={() => setShareOpen(false)}
                      >
                        <LineIcon name="message" /> Share by text message
                      </a>
                      <a
                        className="share-menu-item"
                        role="menuitem"
                        href={`https://wa.me/?text=${mailtoBody}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setShareOpen(false)}
                      >
                        <LineIcon name="chat" /> Share on WhatsApp
                      </a>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Organization leads, as on the result cards; shown once when the
            names match. The service name stays the heading either way. */}
        <div>
          {program.organization !== program.programName ? (
            <>
              <div className="detail-org">{program.organization}</div>
              <h2 className="detail-name">{program.programName}</h2>
            </>
          ) : (
            <h2 className="detail-org">{program.programName}</h2>
          )}
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
          <p className="detail-value"><LinkedText text={program.description} /></p>
        </div>

        <InfoRow label="Who can participate" value={eligibility} />
        <InfoRow label="How to access"       value={program.howToAccess} />
        <InfoRow label="Cost details"        value={program.costDetails} />
        <InfoRow label="Important notes"     value={program.importantNotes} />
        <InfoRow label="Address"             value={program.address} addresses />

        <TagRow label="When offered"     values={program.cadence} />
        {population.length > 0 && (
          <TagRow label="Who this serves" values={population} />
        )}

        {program.lastUpdated && (
          <p className="card-updated detail-updated">Last updated: {program.lastUpdated}</p>
        )}

        <button
          className="detail-close-btn"
          onClick={onClose}
          aria-label="Close service details"
        >
          {backLabel}
        </button>
      </div>
    </div>
  )
}
