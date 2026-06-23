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
      { value: 'In-home care',              label: 'In-home care' },
      { value: 'Home support & maintenance', label: 'Home support & maintenance' },
      { value: 'Respite',                   label: 'Respite (caregiver relief)' },
      { value: 'Transportation',            label: 'Transportation' },
      { value: 'Moving & downsizing',       label: 'Moving & downsizing' },
    ],
  },
  {
    group: 'Health & wellness',
    items: [
      { value: 'Physical health',            label: 'Physical health' },
      { value: 'Fitness & physical activity',label: 'Fitness & physical activity' },
      { value: 'Outdoor recreation',         label: 'Outdoor recreation' },
      { value: 'Food & nutrition',           label: 'Food & nutrition' },
      { value: 'Mental health',              label: 'Mental health' },
      { value: 'Brain health & memory',      label: 'Brain health & memory' },
      { value: 'Chronic disease management', label: 'Chronic disease support' },
      { value: 'Grief & loss',               label: 'Grief & loss' },
      { value: 'Substance use & addictions', label: 'Addictions support' },
    ],
  },
  {
    group: 'Social & community',
    items: [
      { value: 'Social connection',            label: 'Social connection' },
      { value: 'Arts & culture',               label: 'Arts & culture' },
      { value: 'Intergenerational engagement', label: 'Intergenerational programs' },
      { value: 'Volunteerism',                 label: 'Volunteering' },
      { value: 'Intimacy & dating',            label: 'Intimacy & dating' },
      { value: 'Language & communication',     label: 'Language & communication' },
      { value: 'Lifelong learning & education',label: 'Lifelong learning' },
    ],
  },
  {
    group: 'Practical support',
    items: [
      { value: 'Housing',                              label: 'Housing' },
      { value: 'Income & financial assistance',        label: 'Financial assistance' },
      { value: 'Financial literacy',                   label: 'Financial literacy' },
      { value: 'Employment',                           label: 'Employment' },
      { value: 'Legal assistance',                     label: 'Legal assistance' },
      { value: 'Advanced care & future planning',      label: 'Advanced care planning' },
      { value: 'Digital literacy & technology',        label: 'Technology & internet help' },
      { value: 'Pet care',                             label: 'Pet care' },
      { value: 'Service navigation & case management', label: 'Help finding services' },
    ],
  },
  {
    group: 'Safety & crisis',
    items: [
      { value: 'Personal safety',            label: 'Personal safety' },
      { value: 'Abuse prevention & response',label: 'Abuse prevention & support' },
      { value: 'Crisis intervention',        label: 'Crisis support' },
      { value: 'Emergency shelters',         label: 'Emergency shelters' },
    ],
  },
]

// Flat list of all service areas — used for filter logic and chips
export const SERVICE_AREAS = SERVICE_AREA_GROUPS.flatMap((g) => g.items)

// Parent category icons for cards
export const GROUP_ICONS = {
  'Getting help at home': { emoji: '🏠', bg: '#e8f4fd', color: '#1a5276' },
  'Health & wellness':    { emoji: '🩺', bg: '#d4edda', color: '#1a6635' },
  'Social & community':   { emoji: '🤝', bg: '#ede7f6', color: '#4a148c' },
  'Practical support':    { emoji: '🔧', bg: '#fff3cd', color: '#7d4a00' },
  'Safety & crisis':      { emoji: '🛡️', bg: '#fde8ea', color: '#8b1a24' },
}

// Lookup: service area value → parent group name
export const SERVICE_AREA_TO_GROUP = Object.fromEntries(
  SERVICE_AREA_GROUPS.flatMap((g) => g.items.map((item) => [item.value, g.group]))
)

export const QUADRANTS = [
  { value: 'NW', label: 'NW – Northwest' },
  { value: 'NE', label: 'NE – Northeast' },
  { value: 'SW', label: 'SW – Southwest' },
  { value: 'SE', label: 'SE – Southeast' },
  { value: 'City-wide', label: 'City-wide' },
]

export const COST_TYPES = [
  { value: 'Free',    label: 'Free' },
  { value: 'At-cost', label: 'Paid' },
]

export const FORMAT_TYPES = [
  { value: 'In-person', label: 'In-person' },
  { value: 'Online',    label: 'Online' },
  { value: 'Phone',     label: 'By phone' },
]
