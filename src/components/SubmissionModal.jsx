import { useEffect, useRef, useState } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

const SERVICE_TYPES = [
  'Getting help at home',
  'Health and wellness',
  'Social and community',
  'Practical support',
  'Safety and crisis',
  'Other or not sure',
]

export default function SubmissionModal({ onClose }) {
  const closeRef = useRef(null)
  const panelRef = useRef(null)
  const confirmationRef = useRef(null)
  const [captchaChecked, setCaptchaChecked] = useState(false)
  const [captchaError, setCaptchaError] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => { closeRef.current?.focus() }, [])

  useEffect(() => {
    function handleKey(event) {
      if (event.key === 'Escape') { onClose(); return }
      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = [...panelRef.current.querySelectorAll(FOCUSABLE)]
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [onClose])

  useEffect(() => {
    if (submitted) confirmationRef.current?.focus()
  }, [submitted])

  function handleSubmit(event) {
    event.preventDefault()
    if (!captchaChecked) {
      setCaptchaError(true)
      document.getElementById('mock-captcha')?.focus()
      return
    }
    setSubmitted(true)
  }

  return (
    <div
      className="detail-overlay submission-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="submission-title"
    >
      <div className="submission-panel" ref={panelRef}>
        <div className="submission-header">
          <div>
            <p className="submission-eyebrow">For organizations</p>
            <h2 id="submission-title">Submit a program or organization</h2>
          </div>
          <button ref={closeRef} className="detail-close-btn" onClick={onClose} aria-label="Close submission form">
            ✕ Close
          </button>
        </div>

        {submitted ? (
          <div className="submission-confirmation" role="status">
            <div className="submission-confirmation-icon" aria-hidden="true">✓</div>
            <h3 ref={confirmationRef} tabIndex="-1">Request ready for review</h3>
            <p>In the live directory, this request would be sent to the EngAGE team for review. Submitting a request would not guarantee that a listing is added.</p>
            <div className="submission-prototype-note">
              <strong>Prototype only:</strong> No information was stored or sent.
            </div>
            <button className="submission-primary-btn" onClick={onClose}>Close</button>
          </div>
        ) : (
          <>
            <p className="submission-intro">Tell us about a community program or service that could support older adults in Calgary. Every request is reviewed before anything appears in the directory, and submitting a request does not guarantee that a listing will be added.</p>
            <div className="submission-prototype-note submission-prototype-note--before-form">
              <strong>Prototype form:</strong> Information entered here will not be stored or sent.
            </div>
            <p className="submission-required-note"><span aria-hidden="true">*</span> Required fields</p>

            <form className="submission-form" onSubmit={handleSubmit}>
              <fieldset className="submission-fieldset">
                <legend>Organization and program</legend>
                <div className="submission-grid">
                  <div className="submission-field">
                    <label htmlFor="submission-organization">Organization name <span aria-hidden="true">*</span></label>
                    <input id="submission-organization" name="organizationName" autoComplete="organization" required />
                  </div>
                  <div className="submission-field">
                    <label htmlFor="submission-program">Program or service name <span aria-hidden="true">*</span></label>
                    <input id="submission-program" name="programName" required />
                  </div>
                  <div className="submission-field">
                    <label htmlFor="submission-service-type">Main service type <span aria-hidden="true">*</span></label>
                    <select id="submission-service-type" name="serviceType" defaultValue="" required>
                      <option value="" disabled>Select one</option>
                      {SERVICE_TYPES.map((type) => <option key={type} value={type}>{type}</option>)}
                    </select>
                  </div>
                  <div className="submission-field">
                    <label htmlFor="submission-website">Website</label>
                    <input id="submission-website" name="website" type="url" inputMode="url" placeholder="https://" />
                  </div>
                  <div className="submission-field submission-field--full">
                    <label htmlFor="submission-locations">Calgary locations or areas served</label>
                    <input id="submission-locations" name="locationsServed" placeholder="For example: city-wide, Northwest Calgary, or a street address" />
                  </div>
                  <div className="submission-field submission-field--full">
                    <label htmlFor="submission-description">Brief program description <span aria-hidden="true">*</span></label>
                    <textarea id="submission-description" name="description" rows="4" required aria-describedby="submission-description-help" />
                    <p id="submission-description-help" className="submission-help-text">Include who the program supports and what help it provides.</p>
                  </div>
                </div>
              </fieldset>

              <fieldset className="submission-fieldset">
                <legend>Your contact information</legend>
                <div className="submission-grid">
                  <div className="submission-field">
                    <label htmlFor="submission-contact-name">Your name</label>
                    <input id="submission-contact-name" name="contactName" autoComplete="name" />
                  </div>
                  <div className="submission-field">
                    <label htmlFor="submission-relationship">Your relationship to the program <span aria-hidden="true">*</span></label>
                    <select id="submission-relationship" name="relationship" defaultValue="" required>
                      <option value="" disabled>Select one</option>
                      <option>Staff member or volunteer</option>
                      <option>Program participant or caregiver</option>
                      <option>Community service provider</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="submission-field">
                    <label htmlFor="submission-email">Email address <span aria-hidden="true">*</span></label>
                    <input id="submission-email" name="contactEmail" type="email" inputMode="email" autoComplete="email" required />
                  </div>
                  <div className="submission-field">
                    <label htmlFor="submission-phone">Phone number</label>
                    <input id="submission-phone" name="contactPhone" type="tel" inputMode="tel" autoComplete="tel" />
                  </div>
                </div>
              </fieldset>

              <label className="submission-consent">
                <input type="checkbox" name="confirmation" required />
                <span>I confirm that this information is accurate to the best of my knowledge and that the EngAGE team may contact me about this request. <span aria-hidden="true">*</span></span>
              </label>

              <div className={`mock-captcha${captchaError ? ' mock-captcha--error' : ''}`}>
                <div className="mock-captcha-main">
                  <input
                    id="mock-captcha"
                    type="checkbox"
                    checked={captchaChecked}
                    aria-invalid={captchaError || undefined}
                    aria-describedby={captchaError ? 'mock-captcha-error mock-captcha-note' : 'mock-captcha-note'}
                    onChange={(event) => {
                      setCaptchaChecked(event.target.checked)
                      if (event.target.checked) setCaptchaError(false)
                    }}
                  />
                  <label htmlFor="mock-captcha">I’m not a robot</label>
                </div>
                <div className="mock-captcha-brand" aria-hidden="true">
                  <span>🍃</span>
                  <strong>Mock CAPTCHA</strong>
                </div>
                <p id="mock-captcha-note" className="mock-captcha-note"><strong>Mock CAPTCHA — prototype only:</strong> this demonstrates where spam protection would appear.</p>
                {captchaError && <p id="mock-captcha-error" className="submission-error" role="alert">Please complete the mock CAPTCHA.</p>}
              </div>

              <div className="submission-review-note">
                <strong>What happens next?</strong>
                <p>The EngAGE team would review the organization, confirm the information, and decide whether it meets the directory’s inclusion criteria.</p>
              </div>

              <div className="submission-actions">
                <button type="submit" className="submission-primary-btn">Send request for review</button>
                <button type="button" className="submission-secondary-btn" onClick={onClose}>Cancel</button>
              </div>
            </form>

          </>
        )}
      </div>
    </div>
  )
}
