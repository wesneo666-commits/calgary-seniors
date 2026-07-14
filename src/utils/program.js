export function cleanPopulationTags(values) {
  if (!values) return []
  return values
    .filter((v) => v !== 'None (general population)')
    .map((v) => (v === 'Older adults (no age specified)' ? 'Older adults' : v))
}

// Some "how to access" entries embed a registration/booking URL inline
// (e.g. "Book online: https://…"). Surface it as a clickable button — REQ-047.
export function extractRegistrationUrl(howToAccess) {
  if (!howToAccess) return null
  const match = howToAccess.match(/https?:\/\/\S+/)
  return match ? match[0].replace(/[.,)]+$/, '') : null
}

const PHONE_NUMBER_RE = /\d[\d\s().-]{1,}\d|\d{3}/

// The "Phone" field is free text — usually one number, but some orgs list
// multiple locations/departments separated by newlines (e.g.
// "Bowmont Commons: 403-286-1811\nVillage Commons: 403-536-6558"). Split
// those into individual entries so each can render its own button, falling
// back to Primary/Secondary labels when the source doesn't supply its own.
export function parsePhones(phone) {
  if (!phone) return []
  const lines = phone.split('\n').map((line) => line.trim()).filter(Boolean)
  const entries = []
  for (const line of lines) {
    const labelMatch = line.match(/^([^:]{1,40}):\s*(.+)$/)
    const numberMatch = (labelMatch ? labelMatch[2] : line).match(PHONE_NUMBER_RE)
    if (!numberMatch) continue
    entries.push({ label: labelMatch ? labelMatch[1].trim() : null, number: numberMatch[0].trim() })
  }
  if (entries.length === 0) {
    const numberMatch = phone.match(PHONE_NUMBER_RE)
    if (numberMatch) entries.push({ label: null, number: numberMatch[0].trim() })
  }
  if (entries.length > 1) {
    entries.forEach((entry, i) => {
      if (!entry.label) entry.label = i === 0 ? 'Primary' : 'Secondary'
    })
  }
  return entries
}

const EMAIL_RE = /[\w.+-]+@[\w-]+\.[\w.-]+/

// The "Email" field sometimes isn't an email at all — it's a note pointing
// to a contact form on the org's site (e.g. "Contact form: https://…"), or
// it's an address plus a form link. Split those apart so each can be
// offered as its own contact option instead of a broken mailto: link.
export function parseContactEmail(email) {
  if (!email) return { address: null, contactFormUrl: null }
  const addressMatch = email.match(EMAIL_RE)
  const urlMatch = email.match(/https?:\/\/\S+/)
  return {
    address: addressMatch ? addressMatch[0].replace(/[.,)]+$/, '') : null,
    contactFormUrl: urlMatch ? urlMatch[0].replace(/[.,)]+$/, '') : null,
  }
}
