import { useEffect, useRef } from 'react'

// Full About page (V5 A-01), redesigned with the EngAGE brand (V5 round 3).
// The client's copy is unchanged; it's laid out as a peach hero, colour-coded
// jump links, cards for the research findings and selection criteria, and a
// numbered timeline for how the directory was built. Each section takes one
// of the five ring colours, in the logo's order.

const ASSET = import.meta.env.BASE_URL

const ICONS = {
  compass: <><circle cx="12" cy="12" r="9.5" /><path d="m15.5 8.5-2 5-5 2 2-5z" /></>,
  scatter: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="5" width="7" height="7" rx="1.5" /><rect x="6" y="14" width="7" height="7" rx="1.5" /></>,
  question: <><circle cx="12" cy="12" r="9.5" /><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17.2v.1" /></>,
  check: <><circle cx="12" cy="12" r="9.5" /><path d="m7.5 12.5 3 3 6-6.5" /></>,
  shield: <><path d="M12 2.5 4 5.5v6c0 5 3.4 8.6 8 10 4.6-1.4 8-5 8-10v-6z" /><path d="m8.5 12 2.5 2.5 4.5-5" /></>,
  minus: <><circle cx="12" cy="12" r="9.5" /><path d="M7.5 12h9" /></>,
  refresh: <><path d="M20 11a8 8 0 0 0-14.3-4.8L4 8" /><path d="M4 3.5V8h4.5" /><path d="M4 13a8 8 0 0 0 14.3 4.8L20 16" /><path d="M20 20.5V16h-4.5" /></>,
}

function Icon({ name, size = 28 }) {
  return (
    <svg className="about-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  )
}

const TOC = [
  { id: 'about-why', label: 'Why the directory was created', accent: 'slate' },
  { id: 'about-name', label: 'What EngAGE means', accent: 'sage' },
  { id: 'about-developed', label: 'How the directory was developed', accent: 'plum' },
  { id: 'about-select', label: 'How we select services', accent: 'amber' },
  { id: 'about-current', label: 'How we keep information current', accent: 'ember' },
]

// The five things EngAGE supports, one per ring colour
const VALUES = [
  ['Health', 'slate'],
  ['Well-being', 'sage'],
  ['Independence', 'plum'],
  ['Safety', 'amber'],
  ['Social connection', 'ember'],
]

export default function AboutPage({ onBack }) {
  const headingRef = useRef(null)

  useEffect(() => {
    window.scrollTo(0, 0)
    headingRef.current?.focus()
  }, [])

  return (
    <article className="about-page">
      <button type="button" className="about-back-btn" onClick={onBack}>
        ← Back to the directory
      </button>

      {/* ─── Hero ─── */}
      <header className="about-hero">
        <div className="about-hero-text">
          <p className="about-eyebrow">About the directory</p>
          <h2 className="about-title" ref={headingRef} tabIndex={-1}>About EngAGE</h2>
          <p className="about-lead">EngAGE is a research-driven online directory designed to help people find trusted services in Calgary as they age. The directory brings together information that is often scattered across multiple websites and organizations, making it easier to find support in one place.</p>
          <p>The directory focuses on non-medical, community-based services that support aging well. It is designed for people navigating the opportunities and challenges that can arise with aging, as well as family members, caregivers, and service providers who help connect others with community resources.</p>
        </div>
        <img className="about-hero-mark" src={`${ASSET}engage-mark.svg`} alt="" />
      </header>

      {/* ─── On this page ─── */}
      <nav className="about-toc" aria-label="On this page">
        <p className="about-toc-label">On this page</p>
        <ol>
          {TOC.map((t, i) => (
            <li key={t.id}>
              <a href={`#${t.id}`} className={`about-toc-link about-accent--${t.accent}`}>
                <span className="about-toc-num" aria-hidden="true">{i + 1}</span>
                {t.label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      {/* ─── Why ─── */}
      <section className="about-section about-accent--slate" id="about-why" aria-labelledby="about-why-h">
        <h3 id="about-why-h" className="about-section-title">Why the Directory Was Created</h3>
        <p>Finding accurate and trustworthy information can be difficult. Research conducted with Calgary adults aged 55 and older found that many people:</p>
        <ul className="about-cards about-cards--3">
          <li className="about-card about-accent--slate">
            <Icon name="compass" />
            <p>Do not know where to look for information.</p>
          </li>
          <li className="about-card about-accent--plum">
            <Icon name="scatter" />
            <p>Find information spread across multiple sources.</p>
          </li>
          <li className="about-card about-accent--ember">
            <Icon name="question" />
            <p>Are uncertain which information sources they can trust.</p>
          </li>
        </ul>
        <p className="about-callout">EngAGE was created to address these challenges by providing a centralized, easy-to-use source of information about services that support people as they age.</p>
      </section>

      {/* ─── Name ─── */}
      <section className="about-section about-accent--sage" id="about-name" aria-labelledby="about-name-h">
        <h3 id="about-name-h" className="about-section-title">What EngAGE Means</h3>
        <div className="about-name">
          <img className="about-name-logo" src={`${ASSET}engage-logo-stacked.svg`} alt="" />
          <div>
            <p>The name EngAGE reflects the goal of helping people stay informed, connected, and engaged with their communities as they age. The directory is intended to make it easier to discover services and supports that promote health, well-being, independence, safety, and social connection. This aligns with Calgary's broader efforts to create an age-friendly city where people can age well and remain connected to their communities.</p>
            <ul className="about-values" aria-label="What the directory supports">
              {VALUES.map(([label, accent]) => (
                <li key={label} className={`about-value about-accent--${accent}`}>{label}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Developed ─── */}
      <section className="about-section about-accent--plum" id="about-developed" aria-labelledby="about-developed-h">
        <h3 id="about-developed-h" className="about-section-title">How the Directory Was Developed</h3>
        <p>The directory was developed through a multi-phase research project led by the University of Calgary Centre on Aging in collaboration with Calgary Seniors' Resource Society and Carya.</p>
        <p>Project activities included:</p>
        <ol className="about-steps">
          <li className="about-step about-accent--slate">Surveying Calgary adults aged 55 and older to understand how they search for information and the barriers they experience.</li>
          <li className="about-step about-accent--sage">Building a comprehensive database of community-based services.</li>
          <li className="about-step about-accent--plum">Designing, testing, and refining the directory based on feedback from users to ensure it is easy to use.</li>
        </ol>
        <p className="about-callout">Calgary Seniors' Resource Society oversees the ongoing management and maintenance of the directory to help keep information current and relevant.</p>
      </section>

      {/* ─── Select ─── */}
      <section className="about-section about-section--band about-accent--amber" id="about-select" aria-labelledby="about-select-h">
        <h3 id="about-select-h" className="about-section-title">How We Select Services</h3>
        <p className="about-lead">Our goal is to make EngAGE a trusted source of information for people as they age, as well as for family members, caregivers, and service providers. To support this goal, every organization included in the directory is reviewed before its services are published.</p>

        <div className="about-cards about-cards--3">
          <div className="about-card about-card--list about-accent--sage">
            <Icon name="check" />
            <h4>What Types of Services Are Included</h4>
            <p>The directory focuses on:</p>
            <ul>
              <li>Non-medical, community-based services.</li>
              <li>Services that support people as they age.</li>
              <li>Services available to people living in Calgary.</li>
              <li>Supports that promote health, well-being, independence, safety, and social connection.</li>
            </ul>
          </div>
          <div className="about-card about-card--list about-accent--slate">
            <Icon name="shield" />
            <h4>How Services Are Evaluated</h4>
            <p>Services are reviewed using a credibility assessment framework developed as part of this project. The review considers factors such as:</p>
            <ul>
              <li>The legitimacy of the organization.</li>
              <li>The availability and transparency of organizational information.</li>
              <li>Evidence that information is current and maintained.</li>
              <li>The organization's connection to the community and the services it provides.</li>
            </ul>
          </div>
          <div className="about-card about-card--list about-accent--ember">
            <Icon name="minus" />
            <h4>Why Some Services May Not Be Included</h4>
            <p>Not all services are eligible for inclusion. Examples of services that may not be included are:</p>
            <ul>
              <li>Medical services that require referral through the healthcare system.</li>
              <li>Services for which equivalent free or low-cost community-based support is already available through non-profit organizations.</li>
              <li>Services that do not meet the directory's credibility standards.</li>
              <li>Services with insufficient information for verification.</li>
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Current ─── */}
      <section className="about-section about-accent--ember" id="about-current" aria-labelledby="about-current-h">
        <div className="about-current">
          <Icon name="refresh" size={40} />
          <div>
            <h3 id="about-current-h" className="about-section-title">How We Keep Information Current</h3>
            <p>We make every effort to maintain accurate and up-to-date information. Calgary Seniors' Resource Society periodically reviews and updates the listings, but services may change over time. Users should contact organizations directly to confirm current availability, eligibility requirements, costs, and other service details. If you notice information that appears incorrect or outdated, please use the suggest a correction feature to let us know.</p>
            <a className="about-correction-btn" href={`mailto:?subject=${encodeURIComponent('Suggest a correction — EngAGE')}`}>
              Suggest a correction
            </a>
          </div>
        </div>
      </section>

      <button type="button" className="about-back-btn about-back-btn--bottom" onClick={onBack}>
        ← Back to the directory
      </button>
    </article>
  )
}
