import { useState } from 'react'
import SearchBar from './SearchBar.jsx'
import { SERVICE_AREA_GROUPS, GROUP_ICONS, QUADRANTS, COST_TYPES, FORMAT_TYPES } from '../utils/constants.js'

function EngageGrowthLine() {
  return (
    <svg
      className="wizard-welcome-mark"
      viewBox="920 160 640 185"
      aria-hidden="true"
      focusable="false"
    >
      <g className="wizard-welcome-art" fill="none" strokeLinecap="round" strokeLinejoin="round">
        <path className="wizard-welcome-stroke" d="M928 296 C1001 338 1104 341 1194 305 C1273 274 1340 242 1450 225" />
        <path className="wizard-welcome-stroke" d="M1065 327 L1065 272 L1101 272 L1101 313 L1131 313 L1131 249 L1168 249 L1168 313 L1206 313 L1206 268 L1241 268 L1241 297" />
        <path className="wizard-welcome-stroke" d="M1149 249 L1149 212 L1164 199 L1179 212 L1179 249" />
        <path className="wizard-welcome-stroke" d="M1164 199 L1164 173 M1155 184 L1164 173 L1173 184" />
        <g className="wizard-welcome-leaves">
          <path className="wizard-welcome-leaf" d="M1382 249 C1427 200 1481 177 1535 184 C1520 239 1464 270 1382 249 Z" />
          <path className="wizard-welcome-stroke" d="M1388 250 C1430 231 1469 211 1514 194" />
          <path className="wizard-welcome-stroke" d="M1436 225 L1445 200 M1471 211 L1492 218" />
          <path className="wizard-welcome-leaf" d="M1449 226 C1494 239 1527 273 1537 316 C1481 321 1433 290 1404 256" />
          <path className="wizard-welcome-stroke" d="M1412 255 C1451 269 1487 285 1522 307" />
          <path className="wizard-welcome-stroke" d="M1461 278 L1474 301 M1495 294 L1515 287" />
        </g>
      </g>
      <path
        className="wizard-welcome-trace"
        pathLength="1"
        d="M928 296 C1001 338 1104 341 1194 305 C1273 274 1340 242 1450 225"
      />
      <circle className="wizard-welcome-dot" cx="1302" cy="274" r="9" />
    </svg>
  )
}

// Line icons for the four filter buttons (V5 L-03), replacing the old
// per-category emoji.
const ICON_PATHS = {
  location: <><path d="M12 22s7-6.2 7-12a7 7 0 0 0-14 0c0 5.8 7 12 7 12z" /><circle cx="12" cy="10" r="2.5" /></>,
  type: <><rect x="3" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="3" width="7.5" height="7.5" rx="1.5" /><rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" /><rect x="13.5" y="13.5" width="7.5" height="7.5" rx="1.5" /></>,
  cost: <><circle cx="12" cy="12" r="9.5" /><path d="M15 8.5c-.6-1-1.7-1.5-3-1.5-1.8 0-3 .9-3 2.3 0 3.2 6 1.8 6 5 0 1.4-1.3 2.4-3 2.4-1.4 0-2.6-.6-3.2-1.6M12 5.5v13" /></>,
  format: <><rect x="2.5" y="4" width="19" height="12.5" rx="1.5" /><path d="M8 20.5h8M12 16.5v4" /></>,
}

function FilterIcon({ name }) {
  return (
    <svg className="landing-filter-icon" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICON_PATHS[name]}
    </svg>
  )
}

const FILTERS = [
  {
    key: 'quadrant',
    icon: 'location',
    label: 'Location',
    prompt: 'Which part of Calgary?',
    options: QUADRANTS,
  },
  {
    key: 'serviceArea',
    icon: 'type',
    label: 'Type',
    prompt: 'What kind of service?',
    options: SERVICE_AREA_GROUPS.map((g) => ({
      value: `_group_${g.group}`,
      label: g.group,
      slug: GROUP_ICONS[g.group]?.slug,
    })),
  },
  {
    key: 'cost',
    icon: 'cost',
    label: 'Cost',
    prompt: 'Free or paid?',
    options: COST_TYPES,
  },
  {
    key: 'format',
    icon: 'format',
    label: 'Format',
    prompt: 'How would you like to take part?',
    options: FORMAT_TYPES,
  },
]

function FilterButtons({ onApplyFilter }) {
  const [openKey, setOpenKey] = useState(null)
  const open = FILTERS.find((f) => f.key === openKey)

  return (
    <div className="landing-filters">
      <h2 className="landing-section-title">Find services by</h2>
      <div className="landing-filter-grid">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            type="button"
            className={`landing-filter-btn${openKey === f.key ? ' landing-filter-btn--open' : ''}`}
            aria-expanded={openKey === f.key}
            aria-controls="landing-filter-options"
            onClick={() => setOpenKey(openKey === f.key ? null : f.key)}
          >
            <FilterIcon name={f.icon} />
            <span className="landing-filter-label">{f.label}</span>
          </button>
        ))}
      </div>
      {open && (
        <div className="landing-filter-options" id="landing-filter-options" role="group" aria-label={open.prompt}>
          <p className="landing-filter-prompt">{open.prompt}</p>
          <div className="landing-filter-option-grid">
            {open.options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`landing-filter-option${opt.slug ? ` landing-filter-option--${opt.slug}` : ''}`}
                onClick={() => onApplyFilter(open.key, open.key === 'quadrant' ? [opt.value] : opt.value)}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// Landing page (V5 L-01…L-05). Two layouts for A/B testing (L-04):
//   A — search bar above the filter buttons (default, ?layout=a)
//   B — filter buttons above the search bar (?layout=b)
// Interim styling; Joel's mockup will set the final look.
export default function WizardLanding({ layout = 'a', onSearch, onApplyFilter, onBrowseAll, onAbout }) {
  const search = (
    <div className="landing-search">
      <h2 className="landing-section-title">Search the directory</h2>
      <SearchBar value="" onSubmit={(q) => q && onSearch(q)} />
    </div>
  )
  const filters = <FilterButtons onApplyFilter={onApplyFilter} />

  return (
    <div className={`wizard-landing wizard-landing--${layout}`}>
      <div className="wizard-welcome">
        <EngageGrowthLine />
        <div className="wizard-welcome-copy">
          <p className="wizard-welcome-title">
            Welcome to <span className="wizard-welcome-eng">Eng</span><span className="wizard-welcome-age">AGE</span>
          </p>
          <p className="wizard-welcome-text">
            EngAGE is a trusted online directory of non-medical, community-based services in Calgary. Operated by Calgary Seniors' Resource Society, it helps people find reliable information about local supports as they age, all in one place. The directory can also be used by family members, caregivers, and service providers.
          </p>
          <p className="wizard-welcome-text">
            Looking for more information about the directory and how services are selected? <a href="?view=about" onClick={onAbout}>Visit our About page</a>.
          </p>
        </div>
      </div>

      {layout === 'b' ? <>{filters}{search}</> : <>{search}{filters}</>}

      <div className="landing-browse">
        <button type="button" className="landing-browse-btn" onClick={onBrowseAll}>
          Browse Full Directory
        </button>
        <p className="landing-browse-text">View all services in the directory.</p>
      </div>
    </div>
  )
}
