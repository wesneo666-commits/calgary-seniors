import { postalToQuadrant } from './postal.js'
import { SERVICE_AREA_GROUPS } from './constants.js'
import { interpretQuery } from './mockAI.js'

/**
 * Two words match if the shorter is a prefix of the longer, provided the
 * shared prefix is at least 5 characters. This tolerates common morphological
 * variants (transport/transportation, access/accessible) without pulling in
 * short-word false positives. Short tokens still match via plain substring.
 */
function prefixMatch(a, b) {
  const [short, long] = a.length <= b.length ? [a, b] : [b, a]
  return short.length >= 5 && long.startsWith(short)
}

/**
 * Normalizes well-known spelling variants before the query reaches the
 * structured parser or the text matcher. Keep this narrow and explicit so
 * users get a reliable result without broad, surprising substitutions.
 */
export function normalizeSearchQuery(query) {
  return query.trim().toLowerCase().replace(/\bageing\b/g, 'aging')
}

/**
 * Returns programs matching the given filters.
 * All filters are AND-combined; empty/null values skip that filter.
 * Multi-word queries use AND logic per token so "fitness northwest" finds
 * programs that contain both "fitness" AND "northwest" (or "nw") anywhere.
 *
 * Plain-language queries (e.g. "I'm looking for fitness programs in NE
 * Calgary") are interpreted via the mock AI parser: recognized location
 * phrases become an effective quadrant filter, and filler words are
 * stripped before the AND-token text match so the sentence doesn't fail
 * to match just because "i'm" or "looking" never appears in program text.
 */
export function filterPrograms(programs, filters) {
  const { query, quadrant, serviceArea, cost, format } = filters

  const queryNorm = query ? normalizeSearchQuery(query) : ''

  // Detect postal code early so we can skip text search for it
  const detectedQuadrant = queryNorm ? postalToQuadrant(queryNorm) : null
  const isPostalQuery = !!detectedQuadrant

  const aiParsed = queryNorm && !isPostalQuery ? interpretQuery(queryNorm) : null
  const aiQuadrant = aiParsed?.quadrant ?? null

  // Location supports multiple simultaneous UI selections (e.g. NW + NE) —
  // REQ-020. A location expressed in the query is a separate constraint so it
  // remains AND-combined with the selected filters like every other dimension.
  const selectedQuadrants = new Set(quadrant || [])
  const queryQuadrant = detectedQuadrant || aiQuadrant

  // When the mock AI recognized something (a location phrase, category, or
  // "free"), search against its cleaned keyword list instead of the raw
  // sentence. Otherwise fall back to the raw query, unchanged from before.
  const textForTokens = aiParsed?.hasInterpretation ? aiParsed.cleanedKeywords : queryNorm
  const queryTokens = textForTokens && !isPostalQuery ? textForTokens.split(/\s+/).filter(Boolean) : []

  const runFilter = (includeQueryTokens) => programs.filter((p) => {
    // Text search across all relevant fields (skipped when query is a postal code)
    if (includeQueryTokens && queryTokens.length > 0) {
      const searchable = [
        p.organization,
        p.programName,
        p.description,
        p.eligibility,
        p.keywords.join(' '),
        p.serviceArea.join(' '),
        p.intendedPopulation.join(' '),
        p.quadrant.join(' '),
        p.determinant.join(' '),
        p.address,
      ]
        .join(' ')
        .toLowerCase()

      // Map common location words to quadrant abbreviations
      const normalized = searchable
        .replace(/\bnorthwest\b/g, 'nw northwest')
        .replace(/\bnortheast\b/g, 'ne northeast')
        .replace(/\bsouthwest\b/g, 'sw southwest')
        .replace(/\bsoutheast\b/g, 'se southeast')

      // Every token must appear somewhere (AND logic). A token matches either
      // as a plain substring, or as a stem/prefix of a word in the text — so
      // "transportation" finds "transport" and "accessible" finds "access"
      // (e.g. the SE-tagged "Wheelchair Access Transport" program).
      const textWords = normalized.split(/[^a-z0-9]+/).filter(Boolean)
      const tokenMatches = (token) =>
        normalized.includes(token) || textWords.some((w) => prefixMatch(w, token))
      if (!queryTokens.every(tokenMatches)) return false
    }

    // Multiple selected locations are OR-combined within the Location filter.
    // City-wide programs remain eligible for every specific location.
    if (selectedQuadrants.size > 0 && !selectedQuadrants.has('City-wide')) {
      const matchesSelected =
        p.quadrant.some((q) => selectedQuadrants.has(q)) || p.quadrant.includes('City-wide')
      if (!matchesSelected) return false
    }

    // Postal-code and natural-language locations constrain the UI selection
    // rather than expanding it. "Anywhere" / City-wide adds no restriction.
    if (
      queryQuadrant
      && queryQuadrant !== 'City-wide'
      && !p.quadrant.includes(queryQuadrant)
      && !p.quadrant.includes('City-wide')
    ) {
      return false
    }

    // Service area filter — supports both sub-category and parent group selection
    if (serviceArea) {
      if (serviceArea.startsWith('_group_')) {
        const groupName = serviceArea.slice(7)
        const groupValues = SERVICE_AREA_GROUPS.find((g) => g.group === groupName)?.items.map((i) => i.value) ?? []
        if (!p.serviceArea.some((sa) => groupValues.includes(sa))) return false
      } else {
        if (!p.serviceArea.includes(serviceArea)) return false
      }
    }

    // Natural-language category intent uses the same structured field as the
    // Service Type control. The parser removes recognized category words from
    // the remaining text tokens, so this check is what makes phrases such as
    // "fitness programs in northeast Calgary" actually filter to fitness.
    if (aiParsed?.serviceAreaValue && !p.serviceArea.includes(aiParsed.serviceAreaValue)) {
      return false
    }

    // Cost filter
    if (cost) {
      if (!p.cost.includes(cost)) return false
    }

    // Apply "free" recognized in a natural-language query. Keep this separate
    // from the explicit Cost control so a contradictory query/filter pair
    // correctly produces no matches instead of silently overriding either one.
    if (aiParsed?.costFree && !p.cost.includes('Free')) return false

    // Format filter
    if (format) {
      if (!p.format.includes(format)) return false
    }

    return true
  })

  const matches = runFilter(true)

  // Keep both AI entry points consistent: if the parser found meaningful
  // structured intent but an extra word is too specific for this dataset,
  // fall back to the recognized category/location/cost rather than showing an
  // empty result. The chatbot already uses this structured-intent fallback.
  if (matches.length === 0 && aiParsed?.hasInterpretation && queryTokens.length > 0) {
    return runFilter(false)
  }

  return matches
}

/**
 * Sort results: exact name matches first, then org matches, then rest.
 */
export function sortResults(programs, query) {
  if (!query) return programs
  const q = query.trim().toLowerCase()
  return [...programs].sort((a, b) => {
    const aNameMatch = a.programName.toLowerCase().includes(q) ? 0 : 1
    const bNameMatch = b.programName.toLowerCase().includes(q) ? 0 : 1
    if (aNameMatch !== bNameMatch) return aNameMatch - bNameMatch
    const aOrgMatch = a.organization.toLowerCase().includes(q) ? 0 : 1
    const bOrgMatch = b.organization.toLowerCase().includes(q) ? 0 : 1
    return aOrgMatch - bOrgMatch
  })
}
