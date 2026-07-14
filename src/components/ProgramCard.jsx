import CostBadge from './CostBadge.jsx'
import { SERVICE_AREAS, quadrantFullLabel } from '../utils/constants.js'
import { cleanPopulationTags } from '../utils/program.js'

function friendlyServiceLabel(value) {
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

export default function ProgramCard({ program, onSelect }) {
  const serviceLabels = program.serviceArea.map(friendlyServiceLabel).slice(0, 2)
  const population = cleanPopulationTags(program.intendedPopulation)

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

        <p className="card-description">{program.description}</p>

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

        <div className="card-info-grid">
          <div className="card-info-line">
            <CostBadge cost={program.cost} />
          </div>
          <div className="card-info-line">
            {program.quadrant.map((q) => (
              <span key={q} className="badge badge-quad">{quadrantFullLabel(q)}</span>
            ))}
          </div>
          <div className="card-info-line">
            {program.format.map((f) => (
              <span key={f} className="badge badge-format">{f}</span>
            ))}
          </div>
          {population.length > 0 && (
            <div className="card-info-line">
              <span className="badge badge-population">{population[0]}</span>
            </div>
          )}
        </div>
      </button>
    </article>
  )
}
