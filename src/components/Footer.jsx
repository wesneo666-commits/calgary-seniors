export default function Footer() {
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
        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Calgary Seniors Resource Society</p>
        </div>
      </div>
    </footer>
  )
}
