import { useState } from 'react'
import SearchBar from './SearchBar.jsx'
import ServiceTypeSelect from './ServiceTypeSelect.jsx'
import { QUADRANTS, COST_TYPES, FORMAT_TYPES } from '../utils/constants.js'

const EMPTY_SELECTION = { serviceArea: [], quadrant: [], cost: [], format: [] }

// One numbered card per filter, always open, in the directory's order
// (Joel's landing mockup, 2026-11-26, with Service Type kept first). Each
// chip filter allows several choices and starts on its "All" chip.
const CHIP_FILTERS = [
  { key: 'quadrant', question: 'Which part of Calgary?', allLabel: 'All of Calgary', options: QUADRANTS },
  { key: 'cost', question: 'Free or paid?', allLabel: 'All costs', options: COST_TYPES },
  { key: 'format', question: 'How would you like to take part?', allLabel: 'All formats', options: FORMAT_TYPES },
]

// Each card takes the next ring colour from the logo, in the order the
// guided tour and the how-to guide use (2026-11-27).
const ACCENTS = ['slate', 'sage', 'plum', 'amber']

function FilterCard({ number, question, children }) {
  const id = `landing-card-${number}`
  return (
    <section className={`landing-card landing-card--${ACCENTS[number - 1]}`} aria-labelledby={id}>
      <span className="landing-card-num" aria-hidden="true">{number}</span>
      <h3 className="landing-card-question" id={id}>{question}</h3>
      <div className="landing-card-body">{children}</div>
    </section>
  )
}

// Choices are held here and only applied with GO!, which opens the
// directory with them (or with everything, when nothing is chosen).
function FilterCards({ title, onApplyFilters, countMatches }) {
  const [selection, setSelection] = useState(EMPTY_SELECTION)
  const chosen = Object.values(selection).some((v) => v.length > 0)
  const matchCount = chosen ? countMatches(selection) : 0

  const setKey = (key, value) => setSelection((prev) => ({ ...prev, [key]: value }))
  function toggle(key, value) {
    const cur = selection[key]
    setKey(key, cur.includes(value) ? cur.filter((x) => x !== value) : [...cur, value])
  }

  return (
    <div className="landing-filters">
      <h2 className="landing-section-title">{title}</h2>
      <div className="landing-card-row">
        <FilterCard number={1} question="What kind of service?">
          <ServiceTypeSelect
            value={selection.serviceArea}
            onChange={(v) => setKey('serviceArea', v)}
            labelledBy="landing-card-1"
          />
          <p className="landing-card-hint">Pick one or more. You can also type to search.</p>
        </FilterCard>
        {CHIP_FILTERS.map((f, i) => {
          const values = selection[f.key]
          return (
            <FilterCard key={f.key} number={i + 2} question={f.question}>
              <div className="landing-chip-grid" role="group" aria-labelledby={`landing-card-${i + 2}`}>
                <button
                  type="button"
                  aria-pressed={values.length === 0}
                  className={`landing-chip landing-chip--all${values.length === 0 ? ' landing-chip--on' : ''}`}
                  onClick={() => setKey(f.key, [])}
                >
                  {f.allLabel}
                </button>
                {f.options.map((opt) => {
                  const on = values.includes(opt.value)
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      aria-pressed={on}
                      className={`landing-chip${on ? ' landing-chip--on' : ''}`}
                      onClick={() => toggle(f.key, opt.value)}
                    >
                      {opt.label}
                    </button>
                  )
                })}
              </div>
            </FilterCard>
          )
        })}
        <div className="landing-go">
          <button type="button" className="landing-go-btn" onClick={() => onApplyFilters(selection)}>
            GO!
          </button>
          <p className="landing-go-count" aria-live="polite">
            {chosen
              ? <>{matchCount} service{matchCount === 1 ? '' : 's'} match.{' '}
                  <button type="button" className="landing-go-clear" onClick={() => setSelection(EMPTY_SELECTION)}>Clear</button></>
              : 'Make your choices, then select GO!'}
          </p>
        </div>
      </div>
    </div>
  )
}

// Landing page (V5 L-01…L-05). Two layouts for A/B testing (L-04):
//   A — search bar above the filter cards (default, ?layout=a)
//   B — filter cards above the search bar (?layout=b)
// Styled to Joel's EngAGE mockups (Calgary Seniors asset package, Nov 2026):
// the hero logo lives in the header, the search sits in a peach band.
export default function WizardLanding({ layout = 'a', onSearch, onApplyFilters, countMatches, onBrowseAll, onAbout }) {
  const search = (
    <div className="landing-search">
      <h2 className="landing-section-title">{layout === 'b' ? 'Or search the directory:' : 'Search the directory:'}</h2>
      <div className="landing-search-band">
        <SearchBar value="" onSubmit={(q) => q && onSearch(q)} />
      </div>
    </div>
  )
  const filters = (
    <FilterCards
      title={layout === 'b' ? 'Find services by:' : 'Or find services by:'}
      onApplyFilters={onApplyFilters}
      countMatches={countMatches}
    />
  )

  return (
    <div className={`wizard-landing wizard-landing--${layout}`}>
      <div className="wizard-welcome">
        {/* Same copy, split so the first sentence reads as the page's
            headline (design review 2026-11-06). */}
        <p className="wizard-welcome-lead">
          EngAGE is a <span className="wizard-brush">trusted</span> online directory of <span className="nowrap">non-medical,</span> <span className="nowrap">community-based</span> services in Calgary.
        </p>
        <p className="wizard-welcome-text">
          Operated by Calgary Seniors' Resource Society, it helps people find reliable information about local supports as they age, all in one place. The directory can also be used by family members, caregivers, and service providers.
        </p>
      </div>

      {layout === 'b' ? <>{filters}{search}</> : <>{search}{filters}</>}

      <div className="landing-browse">
        <button type="button" className="landing-browse-btn" onClick={onBrowseAll}>
          Or Browse Full Directory
        </button>
        <p className="landing-browse-text">View all services in the directory.</p>
      </div>

      <p className="landing-about">
        Looking for more information about the directory and how services are selected? <a href="?view=about" onClick={onAbout}>Visit our About page</a>.
      </p>
    </div>
  )
}
