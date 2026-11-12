import LineIcon from './LineIcon.jsx'
import { addressParts } from '../utils/streetAddress.js'

// Plain program text with its web and email addresses made clickable (V5
// usability, 2026-11-10): "How to access" and the other detail sections
// quote sign-up pages and forms that people couldn't open.
//
// Recognised: https://… and www.… addresses, bare site names on common
// endings (calgaryspeeddating.com), and email addresses. Punctuation that
// ends the sentence, or a closing bracket the address opened inside, is
// left out of the link.

const LINK_RE = new RegExp(
  [
    // email: name@domain.tld
    String.raw`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}`,
    // http(s):// or www. address
    String.raw`(?:https?:\/\/|www\.)[^\s<>"]+`,
    // bare site name on a common ending, optionally with a path
    String.raw`\b[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.(?:ca|com|org|net|info|gov)\b(?:\/[^\s<>"]*)?`,
  ].join('|'),
  'gi',
)

// Trim sentence punctuation and an unbalanced closing bracket off the end.
function trimEnd(raw) {
  let s = raw
  for (;;) {
    if (/[.,;:!?'"]$/.test(s)) { s = s.slice(0, -1); continue }
    if (s.endsWith(')') && (s.match(/\(/g) || []).length < (s.match(/\)/g) || []).length) { s = s.slice(0, -1); continue }
    return s
  }
}

// Web addresses are shown the way people say them: no https://, www. or
// trailing slash. Long ones (form links run to 150 characters) are cut to
// the site name and as much of the path as fits, dropping tracking codes,
// e.g. "forms.office.com/Pages/ResponsePage.aspx…". The link still goes to
// the full address, and print shows it in full.
const MAX_SHOWN = 40

export function shortLabel(address) {
  const bare = address.replace(/^https?:\/\//i, '').replace(/^www\./i, '')
  const tidy = bare.replace(/\/$/, '')
  if (tidy.length <= MAX_SHOWN) return tidy
  const [path, query] = [bare.split(/[?#]/)[0], /[?#]/.test(bare)]
  const [host, ...rest] = path.split('/')
  let label = host
  for (const segment of rest.filter(Boolean)) {
    if (label.length + segment.length + 1 > MAX_SHOWN) return `${label}/…`
    label += `/${segment}`
  }
  return query ? `${label}…` : label
}

export function linkParts(text) {
  const parts = []
  let last = 0
  for (const m of text.matchAll(LINK_RE)) {
    const shown = trimEnd(m[0])
    if (!shown) continue
    const start = m.index
    if (start > last) parts.push(text.slice(last, start))
    const isEmail = shown.includes('@') && !/^(https?:\/\/|www\.)/i.test(shown)
    const href = isEmail ? `mailto:${shown}` : /^https?:\/\//i.test(shown) ? shown : `https://${shown}`
    parts.push({ href, shown, isEmail, label: isEmail ? shown : shortLabel(shown) })
    last = start + shown.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}

// With `addresses`, street addresses in the plain text also open in Google
// Maps (the Address section), each with a small map pin.
function MapLinks({ text, keyPrefix }) {
  return addressParts(text).map((part, i) =>
    typeof part === 'string' ? (
      part
    ) : (
      <a
        key={`${keyPrefix}-${i}`}
        className="text-link map-link"
        href={part.href}
        target="_blank"
        rel="noopener noreferrer"
      >
        {/* Each comma-separated piece ("333 Shawnessey Bvld. SE", "Calgary
            AB T1Y 5E1") stays on one line, so a phone breaks at the commas
            rather than between a house number and its street. The pin
            rides with the first piece. */}
        {/* No regex lookbehind here: iOS Safari before 16.4 can't parse
            one, and it would stop the whole page loading. */}
        {part.address.split(/,\s*/).map((piece, j, all) => (j < all.length - 1 ? `${piece},` : piece)).map((piece, j) => (
          <span key={j} className="map-link-piece">
            {j === 0 && <LineIcon name="pin" size={18} className="map-link-icon" />}
            {piece}
          </span>
        )).reduce((acc, el, j) => (j ? [...acc, ' ', el] : [el]), [])}
        <span className="sr-only"> (opens in Google Maps)</span>
      </a>
    ),
  )
}

export default function LinkedText({ text, addresses = false }) {
  if (typeof text !== 'string') return text ?? null
  return linkParts(text).map((part, i) =>
    typeof part === 'string' ? (
      addresses ? <MapLinks key={i} text={part} keyPrefix={i} /> : part
    ) : (
      <a
        key={i}
        className={`text-link${part.label.endsWith('…') ? ' text-link--short' : ''}`}
        href={part.href}
        title={part.label.endsWith('…') ? part.shown : undefined}
        {...(part.isEmail ? {} : { target: '_blank', rel: 'noopener noreferrer' })}
      >
        {part.label}
        {!part.isEmail && <span className="sr-only"> (opens in a new tab)</span>}
      </a>
    ),
  )
}
