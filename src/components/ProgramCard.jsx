import { SERVICE_AREAS } from '../utils/constants.js'

function friendlyServiceLabel(value) {
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

export default function ProgramCard({ program, onSelect }) {
  const serviceLabels = program.serviceArea.map(friendlyServiceLabel).slice(0, 2)

  return (
    <article>
      <button
        className="program-card"
        onClick={() => onSelect(program)}
        aria-label={`${program.programName} by ${program.organization}. Press Enter for details.`}
      >
        <div className="card-header">
          <div className="card-header-text">
            <div className="card-org">{program.organization}</div>
            <div className="card-name">{program.programName}</div>
          </div>
        </div>

        {serviceLabels.length > 0 && (
          <div className="card-service-tags">
            {serviceLabels.map((label) => (
              <span key={label} className="badge badge-service">{label}</span>
            ))}
            {program.serviceArea.length > 2 && (
              <span className="card-service-more">+{program.serviceArea.length - 2} more</span>
            )}
          </div>
        )}
      </button>
    </article>
  )
}
