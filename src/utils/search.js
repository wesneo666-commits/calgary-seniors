import { postalToQuadrant } from './postal.js'

/**
 * Returns programs matching the given filters.
 * All filters are AND-combined; empty/null values skip that filter.
 * Multi-word queries use AND logic per token so "fitness northwest" finds
 * programs that contain both "fitness" AND "northwest" (or "nw") anywhere.
 */
export function filterPrograms(programs, filters) {
  const { query, quadrant, serviceArea, cost, format } = filters

  const queryNorm = query ? query.trim().toLowerCase() : ''
  const queryTokens = queryNorm ? queryNorm.split(/\s+/).filter(Boolean) : []

  return programs.filter((p) => {
    // Text search across all relevant fields
    if (queryTokens.length > 0) {
      const searchable = [
        p.organization,
        p.programName,
        p.description,
        p.eligibility,
        p.keywords.join(' '),
        p.serviceArea.join(' '),
        p.intendedPopulation.join(' '),
        p.quadrant.join(' '),       // "NW" matches "northwest" token? No — but "nw" matches "nw"
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

    // Quadrant dropdown filter — also detects postal code typed in search box
    const activeQuadrant = quadrant || (queryNorm ? postalToQuadrant(queryNorm) : null)
    if (activeQuadrant && activeQuadrant !== 'City-wide') {
      const hasQuadrant =
        p.quadrant.includes(activeQuadrant) || p.quadrant.includes('City-wide')
      if (!hasQuadrant) return false
    }

    // Service area filter
    if (serviceArea) {
      if (!p.serviceArea.includes(serviceArea)) return false
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
