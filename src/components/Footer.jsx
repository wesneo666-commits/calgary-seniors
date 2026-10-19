export default function Footer({ onAbout, onSubmitProgram, submissionTriggerRef }) {
  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <div className="footer-columns">
          <div className="footer-brand">
            <div className="footer-logo-wrap">
              <img src="/engage-logo.svg" alt="EngAGE: Calgary Directory for Aging Well" className="footer-logo" />
            </div>
            <p className="footer-tagline">Calgary Directory for Aging Well</p>
          </div>

          <div className="footer-col">
            <h2 className="footer-heading">For Organizations</h2>
            <p>Every listing is reviewed before it appears in the directory.</p>
            <ul className="footer-links">
              <li>
                <a href={`mailto:?subject=${encodeURIComponent('Suggest a correction — EngAGE')}`}>
                  Suggest a correction
                </a>
              </li>
              <li>
                <button ref={submissionTriggerRef} className="footer-link-btn" onClick={onSubmitProgram}>
                  Submit a service
                </button>
              </li>
              <li>
                <a href="?view=about" onClick={onAbout}>
                  Learn about the directory
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="footer-funding">
          <div className="footer-funding-text">
            <p className="footer-funding-label">Funding Acknowledgement</p>
            <p>The development of this directory was funded by the <strong>University of Calgary Centre on Aging</strong>, the <strong>University of Calgary Brenda Strafford Foundation Chair in Geriatric Medicine</strong>, and the <strong>Canadian Institutes of Health Research Betty Havens Prize for Knowledge Mobilization in Aging</strong>.</p>
          </div>
          <div className="footer-funding-logo-wrap">
            <img src="/coa-logo.png" alt="University of Calgary Centre on Aging" className="footer-funding-logo" />
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Calgary Seniors Resource Society</p>
        </div>
      </div>
    </footer>
  )
}
