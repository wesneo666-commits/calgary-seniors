import { useEffect, useRef } from 'react'

// Full About page (V5 A-01), replacing the old About modal. One page, two
// sections — About EngAGE and How We Select Services — with jump links,
// rather than splitting ~650 words across two pages.
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

      <h2 className="about-title" ref={headingRef} tabIndex={-1}>About EngAGE</h2>

      <nav className="about-toc" aria-label="On this page">
        <p className="about-toc-label">On this page</p>
        <ul>
          <li><a href="#about-why">Why the directory was created</a></li>
          <li><a href="#about-name">What EngAGE means</a></li>
          <li><a href="#about-developed">How the directory was developed</a></li>
          <li><a href="#about-select">How we select services</a></li>
          <li><a href="#about-current">How we keep information current</a></li>
        </ul>
      </nav>

      <section className="about-section" aria-labelledby="about-title-intro">
        <h3 id="about-title-intro" className="sr-only">Overview</h3>
        <p>EngAGE is a research-driven online directory designed to help people find trusted services in Calgary as they age. The directory brings together information that is often scattered across multiple websites and organizations, making it easier to find support in one place.</p>
        <p>The directory focuses on non-medical, community-based services that support aging well. It is designed for people navigating the opportunities and challenges that can arise with aging, as well as family members, caregivers, and service providers who help connect others with community resources.</p>
      </section>

      <section className="about-section" id="about-why">
        <h3>Why the Directory Was Created</h3>
        <p>Finding accurate and trustworthy information can be difficult. Research conducted with Calgary adults aged 55 and older found that many people:</p>
        <ul>
          <li>Do not know where to look for information.</li>
          <li>Find information spread across multiple sources.</li>
          <li>Are uncertain which information sources they can trust.</li>
        </ul>
        <p>EngAGE was created to address these challenges by providing a centralized, easy-to-use source of information about services that support people as they age.</p>
      </section>

      <section className="about-section" id="about-name">
        <h3>What EngAGE Means</h3>
        <p>The name EngAGE reflects the goal of helping people stay informed, connected, and engaged with their communities as they age. The directory is intended to make it easier to discover services and supports that promote health, well-being, independence, safety, and social connection. This aligns with Calgary's broader efforts to create an age-friendly city where people can age well and remain connected to their communities.</p>
      </section>

      <section className="about-section" id="about-developed">
        <h3>How the Directory Was Developed</h3>
        <p>The directory was developed through a multi-phase research project led by the University of Calgary Centre on Aging in collaboration with Calgary Seniors' Resource Society and Carya.</p>
        <p>Project activities included:</p>
        <ul>
          <li>Surveying Calgary adults aged 55 and older to understand how they search for information and the barriers they experience.</li>
          <li>Building a comprehensive database of community-based services.</li>
          <li>Designing, testing, and refining the directory based on feedback from users to ensure it is easy to use.</li>
        </ul>
        <p>Calgary Seniors' Resource Society oversees the ongoing management and maintenance of the directory to help keep information current and relevant.</p>
      </section>

      <section className="about-section about-section--major" id="about-select">
        <h2>How We Select Services</h2>
        <p>Our goal is to make EngAGE a trusted source of information for people as they age, as well as for family members, caregivers, and service providers. To support this goal, every organization included in the directory is reviewed before its services are published.</p>

        <h3>What Types of Services Are Included</h3>
        <p>The directory focuses on:</p>
        <ul>
          <li>Non-medical, community-based services.</li>
          <li>Services that support people as they age.</li>
          <li>Services available to people living in Calgary.</li>
          <li>Supports that promote health, well-being, independence, safety, and social connection.</li>
        </ul>

        <h3>How Services Are Evaluated</h3>
        <p>Services are reviewed using a credibility assessment framework developed as part of this project. The review considers factors such as:</p>
        <ul>
          <li>The legitimacy of the organization.</li>
          <li>The availability and transparency of organizational information.</li>
          <li>Evidence that information is current and maintained.</li>
          <li>The organization's connection to the community and the services it provides.</li>
        </ul>

        <h3>Why Some Services May Not Be Included</h3>
        <p>Not all services are eligible for inclusion. Examples of services that may not be included are:</p>
        <ul>
          <li>Medical services that require referral through the healthcare system.</li>
          <li>Services for which equivalent free or low-cost community-based support is already available through non-profit organizations.</li>
          <li>Services that do not meet the directory's credibility standards.</li>
          <li>Services with insufficient information for verification.</li>
        </ul>
      </section>

      <section className="about-section" id="about-current">
        <h3>How We Keep Information Current</h3>
        <p>We make every effort to maintain accurate and up-to-date information. Calgary Seniors' Resource Society periodically reviews and updates the listings, but services may change over time. Users should contact organizations directly to confirm current availability, eligibility requirements, costs, and other service details. If you notice information that appears incorrect or outdated, please use the <a href={`mailto:?subject=${encodeURIComponent('Suggest a correction — EngAGE')}`}>suggest a correction</a> feature to let us know.</p>
      </section>

      <button type="button" className="about-back-btn about-back-btn--bottom" onClick={onBack}>
        ← Back to the directory
      </button>
    </article>
  )
}
