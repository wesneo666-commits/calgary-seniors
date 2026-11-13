import { extractRegistrationUrl, parseContactEmail, parsePhones, websiteLinks } from '../utils/program.js'
import LineIcon from './LineIcon.jsx'

export default function ContactButtons({ program }) {
  const { programWebsite, orgWebsite, howToAccess } = program
  const phones = parsePhones(program.phone)
  const { address: email, contactFormUrl } = parseContactEmail(program.email)
  const registrationUrl = extractRegistrationUrl(howToAccess)
  // One button per link in the field, labelled with the words written
  // before it; the first is "Service page" when it has none.
  const serviceLinks = websiteLinks(programWebsite)
  const orgLink = websiteLinks(orgWebsite)[0]

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
      {/* A link again (2026-11-13): tapping it starts an email. It keeps
          the address written out in full, so people without an email app
          can still read or copy it. */}
      {email && (
        <a
          href={`mailto:${email}`}
          className="contact-email-plain contact-email-link"
          aria-label={`Email ${program.organization}: ${email}`}
        >
          <LineIcon name="mail" />
          <span className="contact-email-label">Email:</span>
          <span className="contact-email-value">{email}</span>
        </a>
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
      {serviceLinks.map((link, i) => {
        const label = link.label ?? (i === 0 ? 'Service page' : 'More information')
        return (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="contact-btn contact-btn-web"
            aria-label={`${label} for ${program.programName} (opens in new tab)`}
          >
            <LineIcon name="globe" /> {label}
          </a>
        )
      })}
      {orgLink && orgLink.href !== serviceLinks[0]?.href && (
        <a
          href={orgLink.href}
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
