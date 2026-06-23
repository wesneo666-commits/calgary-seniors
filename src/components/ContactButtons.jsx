export default function ContactButtons({ program }) {
  const { phone, email, programWebsite, orgWebsite } = program

  if (!phone && !email && !programWebsite && !orgWebsite) return null

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
          aria-label={`Email ${program.organization}`}
        >
          <span aria-hidden="true">✉️</span> Email
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
    </div>
  )
}
