import { SERVICE_AREA_GROUPS, GROUP_ICONS } from '../utils/constants.js'

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

export default function WizardLanding({ onPickGroup }) {
  return (
    <div className="wizard-landing" aria-label="Choose what you're looking for">
      <div className="wizard-welcome">
        <EngageGrowthLine />
        <div className="wizard-welcome-copy">
          <p className="wizard-welcome-title">
            Welcome to <span className="wizard-welcome-eng">Eng</span><span className="wizard-welcome-age">AGE</span>
          </p>
          <p className="wizard-welcome-text">
            Explore community programs, services, and supports for aging well in Calgary.
          </p>
        </div>
      </div>

      <h2 className="wizard-landing-title">What are you looking for today?</h2>
      <p className="wizard-landing-subtitle">
        Choose a category below. This directory covers non-medical, community-based supports only.
      </p>
      <div className="wizard-landing-grid">
        {SERVICE_AREA_GROUPS.map((group) => {
          const icon = GROUP_ICONS[group.group]
          return (
            <button
              key={group.group}
              type="button"
              className={`wizard-landing-card wizard-landing-card--${icon?.slug ?? 'home'}`}
              onClick={() => onPickGroup(group.group)}
            >
              <span className="wizard-landing-icon" aria-hidden="true">{icon?.emoji}</span>
              <span className="wizard-landing-label">{group.group}</span>
            </button>
          )
        })}
      </div>
      <p className="wizard-landing-helper">
        <strong>Not sure which category to choose?</strong> Search in your own words above, or try Voice search.
      </p>
    </div>
  )
}
