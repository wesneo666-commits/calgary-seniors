// Mock AI query interpreter — rule-based, not a real AI/LLM call.
// Demonstrates the UX described in Session 3 (2026-06-25): a plain-language
// search bar and a chatbot that both understand phrases like
// "fitness programs in NE Calgary" or "good food in central Calgary".
// A real implementation (with actual cost) is still a separate, blocked item.

import { SERVICE_AREAS } from './constants.js'

const STOPWORDS = new Set([
  'i', "i'm", 'im', 'a', 'an', 'the', 'for', 'in', 'of', 'to', 'at', 'near',
  'me', 'my', 'looking', 'look', 'find', 'show', 'want', 'need', 'some',
  'good', 'programs', 'program', 'services', 'service', 'around', 'that',
  'are', 'is', 'any', 'please', 'calgary', 'help', 'with',
])

const LOCATION_PHRASES = [
  { re: /\bnorth\s*east\b|\bnortheast\b|\bne\b/, quadrant: 'NE', label: 'Northeast' },
  { re: /\bnorth\s*west\b|\bnorthwest\b|\bnw\b/, quadrant: 'NW', label: 'Northwest' },
  { re: /\bsouth\s*east\b|\bsoutheast\b|\bse\b/, quadrant: 'SE', label: 'Southeast' },
  { re: /\bsouth\s*west\b|\bsouthwest\b|\bsw\b/, quadrant: 'SW', label: 'Southwest' },
  { re: /\bcentral\b|\bcentre\b|\bcenter\b|\bdowntown\b|\bbeltline\b/, quadrant: 'Central', label: 'Central' },
  { re: /\ball of calgary\b|\bcity[\s-]?wide\b|\banywhere\b/, quadrant: 'City-wide', label: 'all of Calgary' },
]

const CENTRAL_PHRASE = /\bcentral\b|\bcentre\b|\bcenter\b|\bdowntown\b|\bbeltline\b/

const CATEGORY_SYNONYMS = [
  { re: /\bfitness|exercise|active|walking\b/, value: 'Fitness & physical activity' },
  { re: /\bfood|meals?|nutrition|eating\b/, value: 'Food & nutrition' },
  { re: /\bmental health|counsell?ing|anxiety|depression\b/, value: 'Mental health' },
  { re: /\bhousing|apartment|downsizing\b/, value: 'Housing' },
  { re: /\btransportation|transport|rides?|drive\b/, value: 'Transportation' },
  { re: /\bsocial|friends|connection|lonely|loneliness\b/, value: 'Social connection' },
  { re: /\blegal\b/, value: 'Legal assistance' },
  { re: /\bmoney|financial|income|benefits?\b/, value: 'Income & financial assistance' },
  { re: /\btechnology|computer|internet|digital\b/, value: 'Digital literacy & technology' },
  { re: /\bmemory|dementia|alzheimer'?s?|brain\b/, value: 'Brain health & memory' },
  { re: /\bgrief|loss|bereavement\b/, value: 'Grief & loss' },
  { re: /\bvolunteer\b/, value: 'Volunteerism' },
  { re: /\bpet\b/, value: 'Pet care' },
  { re: /\bjob|employment|work\b/, value: 'Employment' },
  { re: /\bsafety|abuse\b/, value: 'Personal safety' },
  { re: /\bcrisis\b/, value: 'Crisis intervention' },
  { re: /\blearning|education|class(es)?\b/, value: 'Lifelong learning & education' },
  { re: /\bhome care|in-home\b/, value: 'In-home care' },
  { re: /\brespite\b/, value: 'Respite' },
]

const FREE_RE = /\bfree\b|\bno cost\b/

function stripStopwords(tokens) {
  return tokens.filter((t) => t && !STOPWORDS.has(t))
}

/**
 * Interpret a natural-language query into structured filter suggestions
 * plus a friendly summary, without calling any external AI service.
 */
export function interpretQuery(raw) {
  const text = (raw || '').toLowerCase().trim()
  if (!text) return null

  let quadrant = null
  let quadrantLabel = null
  for (const loc of LOCATION_PHRASES) {
    if (loc.re.test(text)) {
      quadrant = loc.quadrant
      quadrantLabel = loc.label
      break
    }
  }
  let serviceAreaValue = null
  let serviceAreaLabel = null
  for (const cat of CATEGORY_SYNONYMS) {
    if (cat.re.test(text)) {
      serviceAreaValue = cat.value
      serviceAreaLabel = SERVICE_AREAS.find((s) => s.value === cat.value)?.label ?? cat.value
      break
    }
  }

  const costFree = FREE_RE.test(text)

  // Remaining meaningful keywords, with location/category phrase words and
  // stopwords removed, used for a plain-text fallback search.
  const withoutPhrases = text
    .replace(/\bnorth\s*east\b|\bsouth\s*east\b|\bnorth\s*west\b|\bsouth\s*west\b/g, ' ')
    .replace(/\bnortheast\b|\bsoutheast\b|\bnorthwest\b|\bsouthwest\b/g, ' ')
    .replace(CENTRAL_PHRASE, ' ')
    .replace(/[.,!?]/g, ' ')
  const cleanedKeywords = stripStopwords(withoutPhrases.split(/\s+/)).join(' ').trim()

  const hasInterpretation = !!(quadrant || serviceAreaValue || costFree)

  return {
    hasInterpretation,
    quadrant,
    quadrantLabel,
    serviceAreaValue,
    serviceAreaLabel,
    costFree,
    cleanedKeywords,
  }
}

/**
 * Build a short, human-readable summary of what the mock AI understood —
 * used by both the search bar hint and the chat widget.
 */
export function describeInterpretation(result) {
  if (!result || !result.hasInterpretation) return null
  const parts = []
  if (result.serviceAreaLabel) parts.push(result.serviceAreaLabel.toLowerCase())
  else if (result.cleanedKeywords) parts.push(`"${result.cleanedKeywords}"`)

  let where = ''
  if (result.quadrant === 'City-wide') where = ' anywhere in Calgary'
  else if (result.quadrantLabel) where = ` in ${result.quadrantLabel} Calgary`

  const costText = result.costFree ? ' that are free' : ''

  const what = parts.length > 0 ? parts.join(' ') : 'programs'
  return `${what}${costText}${where}`.trim()
}
