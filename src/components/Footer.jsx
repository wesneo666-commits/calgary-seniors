export default function Footer({ onAbout }) {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-inner">
          <div className="footer-brand">
            <img src="/logo.webp" alt="Calgary Seniors Resource Society" className="footer-logo" />
            <p className="footer-tagline">Supporting older adults in Calgary, Alberta</p>
          </div>
          <div className="footer-meta">
            <p>This directory lists <strong>688 programs and services</strong> available to seniors in Calgary.</p>
            <p className="footer-note">Information is sourced from the Calgary Seniors Resource Society Environmental Scan. Contact individual organizations to confirm current availability.</p>
          </div>
        </div>

        <div className="footer-org-links">
          <div className="footer-org-link">
            <p className="footer-org-link-label">Is your organization's listing out of date?</p>
            <a
              className="footer-org-link-action"
              href={`mailto:?subject=${encodeURIComponent('Suggest a correction — Calgary Seniors Resource Directory')}`}
            >
              ✏ Suggest a correction
            </a>
          </div>
          <div className="footer-org-link">
            <p className="footer-org-link-label">
              Represent an organization that isn't listed yet? Every program is reviewed for credibility before it's added.
            </p>
            <a
              className="footer-org-link-action"
              href={`mailto:?subject=${encodeURIComponent('Request to be added — Calgary Seniors Resource Directory')}`}
            >
              🏢 Request to be added
            </a>
          </div>
        </div>

        <div className="footer-funding">
          <p className="footer-funding-label">Funding acknowledgment</p>
          <p>The development of this directory was funded by the <strong>University of Calgary Centre on Aging</strong>, the <strong>Brenda Strafford Foundation Chair in Geriatric Medicine</strong>, and the <strong>Canadian Institutes of Health Research Betty Havens Prize for Knowledge Mobilization in Aging</strong>.</p>
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
