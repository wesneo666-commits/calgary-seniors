import { SERVICE_AREAS, serviceGroupSlug } from '../utils/constants.js'

function friendlyServiceLabel(value) {
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

export default function ProgramCard({ program, onSelect }) {
  const serviceTags = program.serviceArea
    .slice(0, 2)
    .map((value) => ({ label: friendlyServiceLabel(value), slug: serviceGroupSlug(value) }))

  return (
    <article>
      <button
        className="program-card"
        onClick={() => onSelect(program)}
        aria-label={`View details for ${program.programName}${program.organization !== program.programName ? `, offered by ${program.organization}` : ''}`}
      >
        <div className="card-name">{program.programName}</div>
        {program.organization !== program.programName && (
          <div className="card-org">{program.organization}</div>
        )}

        {serviceTags.length > 0 && (
          <div className="card-service-tags">
            {serviceTags.map(({ label, slug }) => (
              <span key={label} className={`badge badge-service badge-service--${slug}`}>{label}</span>
            ))}
            {program.serviceArea.length > 2 && (
              <span className="badge badge-service card-service-more">
                +{program.serviceArea.length - 2} more categories
              </span>
            )}
          </div>
        )}
      </button>
    </article>
  )
}
