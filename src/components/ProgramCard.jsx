import CostBadge from './CostBadge.jsx'
import { SERVICE_AREAS, GROUP_ICONS, SERVICE_AREA_TO_GROUP } from '../utils/constants.js'
import { cleanPopulationTags } from '../utils/program.js'

function friendlyServiceLabel(value) {
  return SERVICE_AREAS.find((s) => s.value === value)?.label ?? value
}

export default function ProgramCard({ program, onSelect }) {
  const serviceLabels = program.serviceArea.map(friendlyServiceLabel).slice(0, 2)
  const population = cleanPopulationTags(program.intendedPopulation)

  const parentGroups = [...new Set(
    program.serviceArea.map((sa) => SERVICE_AREA_TO_GROUP[sa]).filter(Boolean)
  )].slice(0, 3)

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
          {parentGroups.length > 0 && (
            <div className="card-icons">
              {parentGroups.map((group) => {
                const icon = GROUP_ICONS[group]
                return icon ? (
                  <span
                    key={group}
                    className="card-icon-badge"
                    style={{ background: icon.bg }}
                    title={group}
                    aria-hidden="true"
                  >
                    {icon.emoji}
                  </span>
                ) : null
              })}
            </div>
          )}
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
          <div className="card-info-col">
            <CostBadge cost={program.cost} />
          </div>
          <div className="card-info-col">
            {program.quadrant.map((q) => (
              <span key={q} className="badge badge-quad">{q}</span>
            ))}
          </div>
          <div className="card-info-col">
            {program.format.map((f) => (
              <span key={f} className="badge badge-format">{f}</span>
            ))}
          </div>
          <div className="card-info-col">
            {population.length > 0 && (
              <span className="badge badge-population">{population[0]}</span>
            )}
          </div>
        </div>
      </button>
    </article>
  )
}
