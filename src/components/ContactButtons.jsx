import { extractRegistrationUrl, parseContactEmail, parsePhones } from '../utils/program.js'

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
          <span aria-hidden="true">📞</span> {entry.label ? `${entry.label}: ` : 'Call: '}{entry.number}
        </a>
      ))}
      {email && (
        <a
          href={`mailto:${email}`}
          className="contact-btn contact-btn-email"
          aria-label={`Email ${program.organization}: ${email}`}
        >
          <span aria-hidden="true">✉️</span> Email: {email}
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
          <span aria-hidden="true">📋</span> Contact form
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
          <span aria-hidden="true">📝</span> Register / book online
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
          <span aria-hidden="true">🌐</span> Program page
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
          <span aria-hidden="true">🏢</span> Organization website
        </a>
      )}
      {email && (
        <p className="contact-email-plain">
          Email (copyable): <span className="contact-email-plain-value">{email}</span>
        </p>
      )}
    </div>
  )
}
