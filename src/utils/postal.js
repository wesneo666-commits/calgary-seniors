// Map postal code prefix → Calgary quadrant
// Source: City of Calgary postal code boundaries
const POSTAL_QUADRANT_MAP = {
  // NW
  T2K: 'NW', T2L: 'NW', T2M: 'NW', T2N: 'NW', T3A: 'NW', T3B: 'NW',
  T3G: 'NW', T3K: 'NW', T3L: 'NW', T3P: 'NW', T3R: 'NW',
  // NE
  T1Y: 'NE', T2A: 'NE', T2B: 'NE', T2C: 'NE', T2E: 'NE',
  // SW
  T2S: 'SW', T2T: 'SW', T2V: 'SW', T2W: 'SW', T2X: 'SW', T2Y: 'SW',
  T2Z: 'SW', T3C: 'SW', T3E: 'SW', T3H: 'SW', T3Z: 'SW',
  // SE
  T1H: 'SE', T1J: 'SE', T1K: 'SE', T2G: 'SE', T2H: 'SE', T2J: 'SE',
}

export function postalToQuadrant(postal) {
  if (!postal) return null
  const prefix = postal.trim().toUpperCase().slice(0, 3)
  return POSTAL_QUADRANT_MAP[prefix] || null
}
