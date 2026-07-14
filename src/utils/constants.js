// Actual taxonomy from the programs dataset

export const DETERMINANTS = [
  'Built & Service Environment',
  'Community & Care Supports',
  'Health & Wellbeing',
  'Safety, Security & Rights',
  'Social Participation & Engagement',
]

// Grouped service areas for the filter dropdown.
// `value` must match the dataset exactly. `label` is what users see.
export const SERVICE_AREA_GROUPS = [
  {
    group: 'Getting help at home',
    items: [
      { value: 'Home support & maintenance', label: 'Home support & maintenance' },
      { value: 'In-home care',              label: 'In-home care' },
      { value: 'Moving & downsizing',       label: 'Moving & downsizing' },
      { value: 'Respite',                   label: 'Respite (caregiver relief)' },
      { value: 'Transportation',            label: 'Transportation' },
    ],
  },
  {
    group: 'Health & wellness',
    items: [
      { value: 'Substance use & addictions', label: 'Addictions support' },
      { value: 'Brain health & memory',      label: 'Brain health & memory' },
      { value: 'Chronic disease management', label: 'Chronic disease support' },
      { value: 'Fitness & physical activity',label: 'Fitness & physical activity' },
      { value: 'Food & nutrition',           label: 'Food & nutrition' },
      { value: 'Grief & loss',               label: 'Grief & loss' },
      { value: 'Mental health',              label: 'Mental health' },
      { value: 'Outdoor recreation',         label: 'Outdoor recreation' },
      { value: 'Physical health',            label: 'Physical health' },
    ],
  },
  {
    group: 'Social & community',
    items: [
      { value: 'Arts & culture',               label: 'Arts & culture' },
      { value: 'Intergenerational engagement', label: 'Intergenerational programs' },
      { value: 'Intimacy & dating',            label: 'Intimacy & dating' },
      { value: 'Language & communication',     label: 'Language & communication' },
      { value: 'Lifelong learning & education',label: 'Lifelong learning' },
      { value: 'Social connection',            label: 'Social connection' },
      { value: 'Volunteerism',                 label: 'Volunteering' },
    ],
  },
  {
    group: 'Practical support',
    items: [
      { value: 'Advanced care & future planning',      label: 'Advanced care planning' },
      { value: 'Employment',                           label: 'Employment' },
      { value: 'Income & financial assistance',        label: 'Financial assistance' },
      { value: 'Financial literacy',                   label: 'Financial literacy' },
      { value: 'Service navigation & case management', label: 'Help finding services' },
      { value: 'Housing',                              label: 'Housing' },
      { value: 'Legal assistance',                     label: 'Legal assistance' },
      { value: 'Pet care',                             label: 'Pet care' },
      { value: 'Digital literacy & technology',        label: 'Technology & internet help' },
    ],
  },
  {
    group: 'Safety & crisis',
    items: [
      { value: 'Abuse prevention & response',label: 'Abuse prevention & support' },
      { value: 'Crisis intervention',        label: 'Crisis support' },
      { value: 'Emergency shelters',         label: 'Emergency shelters' },
      { value: 'Personal safety',            label: 'Personal safety' },
    ],
  },
]

// Flat list of all service areas — used for filter logic and chips
export const SERVICE_AREAS = SERVICE_AREA_GROUPS.flatMap((g) => g.items)

// Parent category icons — used by the landing-page icon navigation only
// (removed from program cards per REQ-051)
export const GROUP_ICONS = {
  'Getting help at home': { emoji: '🏠', bg: '#e8f4fd', color: '#1a5276' },
  'Health & wellness':    { emoji: '🩺', bg: '#d4edda', color: '#1a6635' },
  'Social & community':   { emoji: '🤝', bg: '#ede7f6', color: '#4a148c' },
  'Practical support':    { emoji: '🔧', bg: '#fff3cd', color: '#7d4a00' },
  'Safety & crisis':      { emoji: '🛡️', bg: '#fde8ea', color: '#8b1a24' },
}

// Display label for a filters.serviceArea value: '' | '_group_X' | item value
export function serviceAreaLabel(value) {
  if (!value) return 'All types'
  if (value.startsWith('_group_')) return value.slice(7)
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

export const QUADRANTS = [
  { value: 'NW', label: 'NW – Northwest' },
  { value: 'NE', label: 'NE – Northeast' },
  { value: 'SW', label: 'SW – Southwest' },
  { value: 'SE', label: 'SE – Southeast' },
  { value: 'City-wide', label: 'City-wide' },
]

// Full quadrant name for program-card/detail badges — abbreviations like "SW"
// read poorly for the target audience, so badges spell out "Southwest".
const QUADRANT_FULL_LABEL = { NW: 'Northwest', NE: 'Northeast', SW: 'Southwest', SE: 'Southeast' }
export function quadrantFullLabel(value) {
  return QUADRANT_FULL_LABEL[value] ?? value
}

export const COST_TYPES = [
  { value: 'Free',    label: 'Free' },
  { value: 'At-cost', label: 'Paid' },
]

export const FORMAT_TYPES = [
  { value: 'In-person', label: 'In-person' },
  { value: 'Online',    label: 'Online' },
  { value: 'Phone',     label: 'By phone' },
]
