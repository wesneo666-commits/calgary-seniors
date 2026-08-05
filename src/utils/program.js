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

const PHONE_NUMBER_RE = /\d[\d\s().-]{1,}\d|\d{3}/g

// Some numbers are written as a vanity mnemonic immediately followed by the
// digit equivalent, e.g. "403-266-HELP (403-266-4357)" — the plain regex
// above can't match letters, so it stops at "403-266" and silently drops the
// rest. Only treat that as a truncation (and look for a fuller candidate
// elsewhere in the string) when letters follow immediately or after a single
// joining dash, the same way "266-HELP" is formatted as part of one token.
// A period or space before the letters (e.g. "811. Tollfree: 1-866-...")
// means the short match already ended its own clause — that's a complete,
// legitimate number (Alberta's 811/211-style short codes), not a fragment.
function looksTruncatedByLetters(text, endIndex) {
  let i = endIndex
  if (text[i] === '-') i++
  return /[A-Za-z]/.test(text[i] ?? '')
}

// The line may list one number cleanly, or several alternates ("or 403-...",
// "(Toll-Free) 1-800-..."). Keep picking the first candidate as the primary
// number (unchanged behavior) unless it looks truncated, in which case
// prefer the first candidate that resolves to a complete 10/11-digit number.
function bestPhoneMatch(text) {
  const candidates = [...text.matchAll(PHONE_NUMBER_RE)]
  if (candidates.length === 0) return null
  const firstMatch = candidates[0]
  if (!looksTruncatedByLetters(text, firstMatch.index + firstMatch[0].length)) return firstMatch[0]
  const full = candidates.find((m) => {
    const digitCount = m[0].replace(/\D/g, '').length
    return digitCount === 10 || digitCount === 11
  })
  return (full ?? firstMatch)[0]
}

// Source data mixes 403-266-1234 / (403) 266-1234 / 403.266.1234 / etc, and
// the extraction regex above can't capture an opening "(" (it must start on
// a digit), so raw matches sometimes read as the visibly broken
// "403) 266-1234". Reformat standard 10/11-digit numbers to one consistent
// dashed form (V4 P1, "standardize phone-number formatting", 2026-07-24).
// Anything else (Alberta's short provincial codes like 310-xxxx, 3-digit
// lines like 211/811, or a genuinely truncated source value) is left as-is —
// there's no correct way to reformat a number that isn't 10/11 digits.
function formatPhoneDigits(raw) {
  const digits = raw.replace(/\D/g, '')
  if (digits.length === 11 && digits[0] === '1') {
    return `1-${digits.slice(1, 4)}-${digits.slice(4, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return raw.trim()
}

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
    const bestNumber = bestPhoneMatch(labelMatch ? labelMatch[2] : line)
    if (!bestNumber) continue
    entries.push({ label: labelMatch ? labelMatch[1].trim() : null, number: formatPhoneDigits(bestNumber.trim()) })
  }
  if (entries.length === 0) {
    const bestNumber = bestPhoneMatch(phone)
    if (bestNumber) entries.push({ label: null, number: formatPhoneDigits(bestNumber.trim()) })
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
