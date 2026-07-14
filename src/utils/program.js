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
