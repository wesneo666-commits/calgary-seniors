import programs from '../data/programs.json'

export default function Footer({ onAbout }) {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-columns">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <img src="/logo.webp" alt="Calgary Seniors Resource Society" className="footer-logo" />
            </div>
            <p className="footer-tagline">Supporting older adults in Calgary, Alberta</p>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">About the directory</h2>
            <p>This directory lists <strong>{programs.length} programs and services</strong> available to seniors in Calgary.</p>
            <p>Information is sourced from the Calgary Seniors Resource Society Environmental Scan. Contact individual organizations to confirm current availability.</p>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">For organizations</h2>
            <p>Every listing is reviewed for credibility before it appears in the directory.</p>
            <ul className="footer-links">
              <li>
                <a href={`mailto:?subject=${encodeURIComponent('Suggest a correction — Calgary Seniors Resource Directory')}`}>
                  Suggest a correction
                </a>
              </li>
              <li>
                <a href={`mailto:?subject=${encodeURIComponent('Request to be added — Calgary Seniors Resource Directory')}`}>
                  Request to be added
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-funding">
          <div className="footer-funding-text">
            <p className="footer-funding-label">Funding acknowledgment</p>
            <p>The development of this directory was funded by the <strong>University of Calgary Centre on Aging</strong>, the <strong>Brenda Strafford Foundation Chair in Geriatric Medicine</strong>, and the <strong>Canadian Institutes of Health Research Betty Havens Prize for Knowledge Mobilization in Aging</strong>.</p>
          </div>
          <div className="footer-funding-logo-wrap">
            <img src="/coa-logo.png" alt="University of Calgary Centre on Aging" className="footer-funding-logo" />
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Calgary Seniors Resource Society</p>
          <button className="footer-about-btn" onClick={onAbout}>
            About this directory
          </button>
        </div>
      </div>
    </footer>
  )
}
