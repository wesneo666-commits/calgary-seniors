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
        <div className="footer-funding">
          <p className="footer-funding-label">Funding acknowledgment</p>
          <p>This resource guide was made possible with support from the <strong>City of Calgary</strong> and <strong>the Province of Alberta</strong>. We acknowledge the traditional territories of the peoples of the Treaty 7 region.</p>
        </div>
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Calgary Seniors Resource Society</p>
          <button className="footer-about-btn" onClick={onAbout}>
            About this guide
          </button>
        </div>
      </div>
    </footer>
  )
}
