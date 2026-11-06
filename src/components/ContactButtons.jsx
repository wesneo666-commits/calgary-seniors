import { extractRegistrationUrl, parseContactEmail, parsePhones } from '../utils/program.js'
import LineIcon from './LineIcon.jsx'

export default function ContactButtons({ program }) {
  const { programWebsite, orgWebsite, howToAccess } = program
  const phones = parsePhones(program.phone)
  const { address: email, contactFormUrl } = parseContactEmail(program.email)
  const registrationUrl = extractRegistrationUrl(howToAccess)

  const hasAnyContact = phones.length > 0 || email || contactFormUrl || programWebsite || orgWebsite || registrationUrl
  if (!hasAnyContact) return null

  return (
    <div className="contact-buttons">
      {phones.map((entry, i) => (
        <a
          key={`${entry.number}-${i}`}
          href={`tel:${entry.number.replace(/\s/g, '')}`}
          className="contact-btn contact-btn-phone"
          aria-label={`Call ${program.organization}${entry.label ? ` (${entry.label})` : ''}: ${entry.number}`}
        >
          <LineIcon name="phone" /> {entry.label ? `${entry.label}: ` : 'Call: '}{entry.number}
        </a>
      ))}
      {email && (
        <div
          className="contact-email-plain"
          aria-label={`Email ${program.organization}: ${email}`}
        >
          <LineIcon name="mail" />
          <span className="contact-email-label">Email:</span>
          <span className="contact-email-value">{email}</span>
        </div>
      )}
      {contactFormUrl && (
        <a
          href={contactFormUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn contact-btn-form"
          aria-label={`Open contact form for ${program.organization} (opens in new tab)`}
        >
          <LineIcon name="form" /> Contact form
        </a>
      )}
      {registrationUrl && (
        <a
          href={registrationUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn contact-btn-register"
          aria-label={`Register or book online for ${program.programName} (opens in new tab)`}
        >
          <LineIcon name="register" /> Register / book online
        </a>
      )}
      {programWebsite && (
        <a
          href={programWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn contact-btn-web"
          aria-label={`Visit program page for ${program.programName} (opens in new tab)`}
        >
          <LineIcon name="globe" /> Service page
        </a>
      )}
      {orgWebsite && orgWebsite !== programWebsite && (
        <a
          href={orgWebsite}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn contact-btn-web-org"
          aria-label={`Visit ${program.organization} website (opens in new tab)`}
        >
          <LineIcon name="building" /> Organization website
        </a>
      )}
    </div>
  )
}
