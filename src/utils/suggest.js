import programs from '../data/programs.json'
import { SERVICE_AREAS } from './constants.js'

// Type-ahead suggestions for the search bar (V5 S-07). Built once from the
// friendly service-type labels, the dataset's keywords, and organization
// names — the three things people most often type. Service types rank first
// because they are the plainest language for older adults.
function buildIndex() {
  const seen = new Set()
  const entries = []
  function add(text, kind) {
    const clean = text.trim()
    const key = clean.toLowerCase()
    if (clean.length < 3 || seen.has(key)) return
    seen.add(key)
    entries.push({ text: clean, lower: key, kind })
  }
  SERVICE_AREAS.forEach((s) => add(s.label, 'type'))
  programs.forEach((p) => (p.keywords ?? []).forEach((k) => add(k, 'keyword')))
  programs.forEach((p) => add(p.organization, 'organization'))
  return entries
}

let index = null
const KIND_RANK = { type: 0, keyword: 1, organization: 2 }

export function suggestionsFor(input, limit = 6) {
  const q = input.trim().toLowerCase()
  if (q.length < 2) return []
  index ??= buildIndex()

  // Word-prefix match: "trans" finds "Transportation" and "Help with
  // transportation", but not "Christian" for "ian".
  const matches = index.filter((e) =>
    e.lower.startsWith(q) || e.lower.includes(` ${q}`)
  )
  matches.sort((a, b) =>
    (a.lower.startsWith(q) ? 0 : 1) - (b.lower.startsWith(q) ? 0 : 1)
    || KIND_RANK[a.kind] - KIND_RANK[b.kind]
    || a.text.length - b.text.length
  )
  return matches.slice(0, limit)
}
