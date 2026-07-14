import { postalToQuadrant } from './postal.js'
import { SERVICE_AREA_GROUPS } from './constants.js'
import { interpretQuery } from './mockAI.js'

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

  const queryNorm = query ? query.trim().toLowerCase() : ''

  // Detect postal code early so we can skip text search for it
  const detectedQuadrant = queryNorm ? postalToQuadrant(queryNorm) : null
  const isPostalQuery = !!detectedQuadrant

  const aiParsed = queryNorm && !isPostalQuery ? interpretQuery(queryNorm) : null
  const aiQuadrant = aiParsed?.quadrant ?? null

  // Location supports multiple simultaneous selections (e.g. NW + NE) — REQ-020.
  // Dropdown/postal/AI-detected quadrants are folded into the same selection set.
  const activeQuadrants = new Set(quadrant || [])
  if (detectedQuadrant) activeQuadrants.add(detectedQuadrant)
  if (aiQuadrant) activeQuadrants.add(aiQuadrant)

  // When the mock AI recognized something (a location phrase, category, or
  // "free"), search against its cleaned keyword list instead of the raw
  // sentence. Otherwise fall back to the raw query, unchanged from before.
  const textForTokens = aiParsed?.hasInterpretation ? aiParsed.cleanedKeywords : queryNorm
  const queryTokens = textForTokens && !isPostalQuery ? textForTokens.split(/\s+/).filter(Boolean) : []

  return programs.filter((p) => {
    // Text search across all relevant fields (skipped when query is a postal code)
    if (queryTokens.length > 0) {
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

      // Every token must appear somewhere (AND logic)
      if (!queryTokens.every((token) => normalized.includes(token))) return false
    }

    // Quadrant filter — one or more checkbox selections, postal code, or a
    // plain-language location phrase like "north east" typed in the search box.
    // A program matches if it carries any selected quadrant, or is tagged City-wide.
    if (activeQuadrants.size > 0 && !activeQuadrants.has('City-wide')) {
      const hasQuadrant =
        p.quadrant.some((q) => activeQuadrants.has(q)) || p.quadrant.includes('City-wide')
      if (!hasQuadrant) return false
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

    // Cost filter
    if (cost) {
      if (!p.cost.includes(cost)) return false
    }

    // Format filter
    if (format) {
      if (!p.format.includes(format)) return false
    }

    return true
  })
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
