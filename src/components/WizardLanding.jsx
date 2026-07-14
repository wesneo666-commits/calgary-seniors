import { SERVICE_AREA_GROUPS, GROUP_ICONS } from '../utils/constants.js'

export default function WizardLanding({ onPickGroup }) {
  return (
    <div className="wizard-landing" aria-label="Choose what you're looking for">
      <h2 className="wizard-landing-title">What are you looking for today?</h2>
      <p className="wizard-landing-subtitle">
        Choose a category below, or use the search bar above to look for something specific.
        This directory covers non-medical, community-based supports only.
      </p>
      <div className="wizard-landing-grid">
        {SERVICE_AREA_GROUPS.map((group) => {
          const icon = GROUP_ICONS[group.group]
          return (
            <button
              key={group.group}
              type="button"
              className="wizard-landing-card"
              style={{ '--wizard-card-bg': icon?.bg, '--wizard-card-color': icon?.color }}
              onClick={() => onPickGroup(group.group)}
            >
              <span className="wizard-landing-icon" aria-hidden="true">{icon?.emoji}</span>
              <span className="wizard-landing-label">{group.group}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
