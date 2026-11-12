// Street addresses inside a service's free-text Address field, so each can
// open in Google Maps (V5 usability, 2026-11-10).
//
// The field is written by hand: one address, several labelled locations
// ("Optimist Arena: 5020 26th Ave SW"), or prose ("Events hosted throughout
// the city"). Rather than link the whole box, this finds each street address
// — a house number, an optional numbered street, up to three name words, a
// street type and an optional quadrant, plus any "Calgary, AB T2E 8W1" that
// follows — and links just that.

const STREET_TYPES = [
  'Street', 'St', 'ST', 'Avenue', 'Ave', 'AVE', 'Road', 'Rd', 'RD', 'Drive', 'Dr', 'DR',
  'Boulevard', 'Blvd', 'Bvld', 'BLVD', 'Way', 'Crescent', 'Cres', 'Court', 'Ct', 'Trail', 'Trl', 'Tr',
  'Close', 'Place', 'Pl', 'Gate', 'Hill', 'Square', 'Sq', 'Lane', 'Ln', 'Highway', 'Hwy',
  'Parkway', 'Pkwy', 'Circle', 'Terrace', 'Green', 'Mews', 'Landing', 'Common', 'Heights',
  'Point', 'Rise', 'View', 'Link', 'Park', 'Plaza', 'Row', 'Ridge', 'Bay', 'Grove',
  'avenue', 'street',
].join('|')

const STREET_RE = new RegExp(
  // house number, then a space, dash or comma: 5020 , 2390- , 1122,
  // (so "106th Street Tower" isn't read as number 10 on 6th Street)
  String.raw`\b\d{1,6}[A-Z]?(?:\s+|\s*[-–,]\s*)` +
  String.raw`(?:\d{1,3}(?:st|nd|rd|th)?[A-Za-z]?\.?\s*)?` +   // numbered street: 26th, 11A, 16a, 84
  String.raw`(?:[A-Z][A-Za-z'.-]*\s+){0,3}` +                 // name words: Harvest Hills
  String.raw`(?:${STREET_TYPES})\b\.?` +                      // street type
  String.raw`(?:,?\s*(?:N\.?\s?W|N\.?\s?E|S\.?\s?W|S\.?\s?E)\b\.?)?` + // quadrant: NW, N.E.
  String.raw`(?:[,\s–-]+Calgary\b)?(?:,?\s+(?:Alberta|AB)\b)?` +       // city, province
  String.raw`(?:,?\s*[A-Z]\d[A-Z]\s?\d[A-Z]\d)?`,             // postal code
  'g',
)

// Other cities that turn up (an Edmonton head office); Calgary otherwise.
const OTHER_CITY_RE = /\b(Edmonton|Airdrie|Cochrane|Okotoks|Chestermere|Red Deer)\b/

// "https://www.google.com/maps/search/?api=1&query=…" opens the Maps app on
// phones and maps.google.com elsewhere, with no API key.
export function mapsUrl(query) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}

// Splits text into plain strings and { address, href } pieces.
export function addressParts(text) {
  const city = text.match(OTHER_CITY_RE)?.[1] ?? 'Calgary'
  const parts = []
  let last = 0
  for (const m of text.matchAll(STREET_RE)) {
    const address = m[0].replace(/[\s,–-]+$/, '')
    if (m.index > last) parts.push(text.slice(last, m.index))
    const hasCity = /\b(Calgary|Alberta|AB)\b/.test(address) || OTHER_CITY_RE.test(address)
    // "1122, 3rd St SE" searches better as "1122 3rd St SE".
    const query = address.replace(/^(\d+[A-Z]?)\s*,\s*/, '$1 ')
    parts.push({ address, href: mapsUrl(hasCity ? query : `${query}, ${city}, AB`) })
    last = m.index + address.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return parts
}
