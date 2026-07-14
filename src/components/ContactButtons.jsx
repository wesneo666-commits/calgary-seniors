import { extractRegistrationUrl } from '../utils/program.js'

export default function ContactButtons({ program }) {
  const { phone, email, programWebsite, orgWebsite, howToAccess } = program
  const registrationUrl = extractRegistrationUrl(howToAccess)

  if (!phone && !email && !programWebsite && !orgWebsite && !registrationUrl) return null

  return (
    <div className="contact-buttons">
      {phone && (
        <a
          href={`tel:${phone.replace(/\s/g, '')}`}
          className="contact-btn contact-btn-phone"
          aria-label={`Call ${program.organization}: ${phone}`}
        >
          <span aria-hidden="true">📞</span> Call: {phone}
        </a>
      )}
      {email && (
        <a
          href={`mailto:${email}`}
          className="contact-btn contact-btn-email"
          aria-label={`Email ${program.organization}: ${email}`}
        >
          <span aria-hidden="true">✉️</span> Email: {email}
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
