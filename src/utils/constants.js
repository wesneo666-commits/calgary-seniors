// Service categories — Katherine's "Final EngAGE service types" framework
// (Oct 21, 2026) and her revised workbook. Each program carries its parent
// categories in `determinant` and its subcategories in `serviceArea`; the
// names below match the dataset exactly and are what users see.

export const DETERMINANTS = [
  'Stay Healthy',
  'Stay Connected',
  'Get Help',
  'Find Housing & Transportation',
  'Manage Money & Legal Matters',
  'Stay Safe',
]

// Grouped service areas for the filter dropdown.
// `value` must match the dataset exactly. `label` is what users see.
export const SERVICE_AREA_GROUPS = [
  {
    group: 'Stay Healthy',
    items: [
      { value: 'Addiction', label: 'Addiction' },
      { value: 'Brain health & memory', label: 'Brain health & memory' },
      { value: 'Exercise & physical activity', label: 'Exercise & physical activity' },
      { value: 'Food & meals', label: 'Food & meals' },
      { value: 'Grief & loss', label: 'Grief & loss' },
      { value: 'Mental health', label: 'Mental health' },
      { value: 'Outdoor recreation', label: 'Outdoor recreation' },
      { value: 'Physical health', label: 'Physical health' },
    ],
  },
  {
    group: 'Stay Connected',
    items: [
      { value: 'Arts & culture', label: 'Arts & culture' },
      { value: 'Dating & relationships', label: 'Dating & relationships' },
      { value: 'Learning & education', label: 'Learning & education' },
      { value: 'Social connection', label: 'Social connection' },
      { value: 'Volunteering', label: 'Volunteering' },
    ],
  },
  {
    group: 'Get Help',
    items: [
      { value: 'Home care', label: 'Home care' },
      { value: 'Home maintenance', label: 'Home maintenance' },
      { value: 'Language & communication', label: 'Language & communication' },
      { value: 'Moving & downsizing', label: 'Moving & downsizing' },
      { value: 'Pet care', label: 'Pet care' },
      { value: 'Respite', label: 'Respite' },
      { value: 'Service navigation', label: 'Service navigation' },
      { value: 'Technology', label: 'Technology' },
    ],
  },
  {
    group: 'Find Housing & Transportation',
    items: [
      { value: 'Emergency housing', label: 'Emergency housing' },
      { value: 'Housing', label: 'Housing' },
      { value: 'Transportation', label: 'Transportation' },
    ],
  },
  {
    group: 'Manage Money & Legal Matters',
    items: [
      { value: 'Advance care & future planning', label: 'Advance care & future planning' },
      { value: 'Employment', label: 'Employment' },
      { value: 'Financial assistance', label: 'Financial assistance' },
      { value: 'Legal assistance', label: 'Legal assistance' },
      { value: 'Money management', label: 'Money management' },
    ],
  },
  {
    group: 'Stay Safe',
    items: [
      { value: 'Abuse & mistreatment', label: 'Abuse & mistreatment' },
      { value: 'Crisis situations', label: 'Crisis situations' },
      { value: 'Personal safety', label: 'Personal safety' },
    ],
  },
];

// Flat list of all service areas — used for filter logic and chips
export const SERVICE_AREAS = SERVICE_AREA_GROUPS.flatMap((g) => g.items)

// Parent category icons — used by the landing-page icon navigation only
// (removed from program cards per REQ-051). Each group carries one color from
// the roadmap's botanical palette; the slug selects that color family in CSS.
export const GROUP_ICONS = {
  'Stay Healthy': { slug: 'health' },
  'Stay Connected': { slug: 'social' },
  'Get Help': { slug: 'home' },
  'Find Housing & Transportation': { slug: 'housing' },
  'Manage Money & Legal Matters': { slug: 'practical' },
  'Stay Safe': { slug: 'safety' },
}

// Petal slug for a service-area value (via its parent group) — colors the
// service badges on cards and the detail view.
const SERVICE_AREA_TO_SLUG = Object.fromEntries(
  SERVICE_AREA_GROUPS.flatMap((g) =>
    g.items.map((item) => [item.value, GROUP_ICONS[g.group]?.slug])
  )
)
export function serviceGroupSlug(value) {
  return SERVICE_AREA_TO_SLUG[value] ?? 'home'
}

// Display label for a filters.serviceArea value: '' | '_group_X' | item value
export function serviceAreaLabel(value) {
  if (!value) return 'All'
  if (value.startsWith('_group_')) return value.slice(7)
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

// 'City-wide' is not a selectable option here — a program tagged City-wide
// already matches every quadrant filter (see search.js), and leaving the
// selection empty already reads as "All of Calgary" (V4 Round 10, 2026-07-24).
export const QUADRANTS = [
  { value: 'NW', label: 'Northwest' },
  { value: 'NE', label: 'Northeast' },
  { value: 'SW', label: 'Southwest' },
  { value: 'SE', label: 'Southeast' },
  { value: 'Central', label: 'Central Calgary' },
]

// Full quadrant name for program-card/detail badges — abbreviations like "SW"
// read poorly for the target audience, so badges spell out "Southwest".
const QUADRANT_FULL_LABEL = { NW: 'Northwest', NE: 'Northeast', SW: 'Southwest', SE: 'Southeast', Central: 'Central Calgary' }
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
