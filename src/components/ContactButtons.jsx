export default function ContactButtons({ program }) {
  const { phone, email, programWebsite, orgWebsite } = program
  const website = programWebsite || orgWebsite

  if (!phone && !email && !website) return null

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
      {website && (
        <a
          href={website}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-btn contact-btn-web"
          aria-label={`Visit website for ${program.programName} (opens in new tab)`}
        >
          <span aria-hidden="true">🌐</span> Visit Website
        </a>
      )}
    </div>
  )
}
