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
  'are', 'is', 'any', 'please', 'calgary', 'help', 'with', 'and', 'get',
  'getting', 'free', 'about', 'would', 'like', 'can', 'you',
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

// Order matters: the first regex to match wins, so narrower categories are
// listed before broader catch-alls they share words with (e.g. Arts & culture
// before Learning & education so "art classes" isn't captured by "class").
const CATEGORY_SYNONYMS = [
  { re: /\barts?|paint|craft|music|danc|choir|singing|culture|cultural|theatre|theater|museum|pottery|drawing|knitting|quilt\b/, value: 'Arts & culture' },
  { re: /\boutdoor|outdoors|hiking|hike|nature|gardening|garden\b/, value: 'Outdoor recreation' },
  { re: /\benglish|esl|language|interpreter|translat\b/, value: 'Language & communication' },
  { re: /\bnavigat|case manage|case worker|find (the right )?service|finding service|where (do i|to) start|don'?t know where|referral|connect me\b/, value: 'Service navigation' },
  { re: /\bhome support|home maintenance|housekeeping|house cleaning|cleaning|yard work|snow removal|handyman|repairs?|chores|around the house|help around|lawn|shovel\b/, value: 'Home maintenance' },
  { re: /\bchronic|diabet|arthritis|cancer|copd|stroke|heart disease|disease|illness\b/, value: 'Physical health' },
  { re: /\baddiction|substance|alcohol|drinking|drugs?|sober\b/, value: 'Addiction' },
  { re: /\babuse|mistreat|neglect\b/, value: 'Abuse & mistreatment' },
  { re: /\bfinancial literacy|budgeting|budget|taxes|tax return|money management\b/, value: 'Money management' },
  { re: /\badvance care|advanced care|future planning|end of life|estate planning|power of attorney|advance directive\b/, value: 'Advance care & future planning' },
  { re: /\bmoving|downsizing|downsize|relocat\b/, value: 'Moving & downsizing' },
  { re: /\bdating|romance|intimacy|relationships?\b/, value: 'Dating & relationships' },
  { re: /\bshelters?|homeless|emergency housing\b/, value: 'Emergency housing' },
  { re: /\bintergenerational\b/, value: 'Social connection' },
  { re: /\bphysical health|wellness|health screening|blood pressure|foot care|nursing|flu shot|vaccin\b/, value: 'Physical health' },

  { re: /\bfitness|exercise|active|activit|walking\b/, value: 'Exercise & physical activity' },
  { re: /\bfood|meals?|nutrition|eating\b/, value: 'Food & meals' },
  { re: /\bmental health|counsell?ing|anxiety|depression\b/, value: 'Mental health' },
  { re: /\bhousing|apartment|rental|renting\b/, value: 'Housing' },
  { re: /\btransportation|transport|rides?|drive|getting around|get around|errands\b/, value: 'Transportation' },
  { re: /\bsocial|socializ|friends|companionship|connection|lonely|loneliness|isolat|meet (new )?people\b/, value: 'Social connection' },
  { re: /\blegal\b/, value: 'Legal assistance' },
  { re: /\bmoney|financial|income|benefits?\b/, value: 'Financial assistance' },
  { re: /\btechnology|computer|internet|digital\b/, value: 'Technology' },
  { re: /\bmemory|dementia|alzheimer'?s?|brain\b/, value: 'Brain health & memory' },
  { re: /\bgrief|loss|bereavement\b/, value: 'Grief & loss' },
  { re: /\bvolunteer\b/, value: 'Volunteering' },
  { re: /\bpet\b/, value: 'Pet care' },
  { re: /\bjob|employment|work\b/, value: 'Employment' },
  { re: /\bsafety\b/, value: 'Personal safety' },
  { re: /\bcrisis\b/, value: 'Crisis situations' },
  { re: /\blearning|education|class(es)?\b/, value: 'Learning & education' },
  { re: /\bhome care|in-home\b/, value: 'Home care' },
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
  let matchedCatRe = null
  for (const cat of CATEGORY_SYNONYMS) {
    if (cat.re.test(text)) {
      serviceAreaValue = cat.value
      serviceAreaLabel = SERVICE_AREAS.find((s) => s.value === cat.value)?.label ?? cat.value
      matchedCatRe = cat.re
      break
    }
  }

  const costFree = FREE_RE.test(text)

  // Remaining meaningful keywords: strip location phrases, the words that
  // triggered the category (so "getting around" doesn't also filter within
  // Transportation), and stopwords — leaving only genuinely extra terms like
  // "wheelchair". These narrow results only when they add real signal.
  let withoutPhrases = text
    .replace(/\bnorth\s*east\b|\bsouth\s*east\b|\bnorth\s*west\b|\bsouth\s*west\b/g, ' ')
    .replace(/\bnortheast\b|\bsoutheast\b|\bnorthwest\b|\bsouthwest\b/g, ' ')
    .replace(/\b(ne|nw|se|sw)\b/g, ' ')
    .replace(CENTRAL_PHRASE, ' ')
    .replace(/[.,!?]/g, ' ')
  if (matchedCatRe) {
    // Remove the whole word(s) that triggered the category — the synonyms match
    // prefixes ("paint", "diabet", "socializ"), so wrap each match in \w* to
    // take the entire word and avoid leaving fragments like "ing" or "ize".
    const inner = matchedCatRe.source.replace(/\\b/g, '')
    withoutPhrases = withoutPhrases.replace(new RegExp(`\\b\\w*(?:${inner})\\w*\\b`, 'gi'), ' ')
  }
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

  const what = parts.length > 0 ? parts.join(' ') : 'services'
  return `${what}${costText}${where}`.trim()
}
