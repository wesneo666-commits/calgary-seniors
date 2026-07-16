import { SERVICE_AREAS, serviceGroupSlug, quadrantFullLabel } from '../utils/constants.js'
import CostBadge from './CostBadge.jsx'

function friendlyServiceLabel(value) {
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

export default function ProgramCard({ program, onSelect }) {
  const serviceTags = program.serviceArea
    .slice(0, 2)
    .map((value) => ({ label: friendlyServiceLabel(value), slug: serviceGroupSlug(value) }))

  // "Check with provider" is detail-view material; on cards only a clear
  // Free/Paid signal earns the space
  const primaryCost = program.cost?.[0]
  const showCost = primaryCost === 'Free' || primaryCost === 'At-cost'

  const locationText = (program.quadrant ?? []).map(quadrantFullLabel).join(' · ')

  return (
    <article>
      <button className="program-card" onClick={() => onSelect(program)}>
        <div className="card-name">{program.programName}</div>
        {program.organization !== program.programName && (
          <div className="card-org">{program.organization}</div>
        )}

        {program.description && (
          <p className="card-description">{program.description}</p>
        )}

        {(showCost || serviceTags.length > 0) && (
          <div className="card-service-tags">
            {showCost && <CostBadge cost={program.cost} />}
            {serviceTags.map(({ label, slug }) => (
              <span key={label} className={`badge badge-service badge-service--${slug}`}>{label}</span>
            ))}
            {program.serviceArea.length > 2 && (
              <span className="card-service-more">+{program.serviceArea.length - 2} more</span>
            )}
          </div>
        )}

        <div className="card-footer">
          {locationText && <span className="card-location">{locationText}</span>}
          <span className="card-details-cue">Details<span aria-hidden="true"> →</span></span>
        </div>
      </button>
    </article>
  )
}
