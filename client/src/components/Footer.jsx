import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Brand */}
        <div style={{ maxWidth: 320 }}>
          <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <img src="/logo.png" alt="WINSTAR Logo" style={{ height: 42, width: 42, objectFit: 'contain' }} onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23b70011"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'; }} />
            <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.1 }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--primary)', letterSpacing: '0.02em' }}>WINSTAR</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--on-surface-variant)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Digital Printing & Xerox</span>
            </div>
          </div>
          <p className="footer-desc" style={{ marginTop: 16 }}>
            © {new Date().getFullYear()} WINSTAR Digital Printing & Xerox.<br />
            ONE STOP SHOP FOR ALL YOUR PRINTING & ADVERTISING NEEDS.<br />
            Since January 27, 2010.
          </p>
        </div>

        {/* Links */}
        <div style={{ display: 'flex', gap: 48 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--primary-fixed-dim)' }}>Services</span>
            <Link to="/services" className="footer-link">All Services</Link>
            <Link to="/" className="footer-link">Quick Print</Link>
            <Link to="/services#tracking" className="footer-link">Track Order</Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--primary-fixed-dim)' }}>Legal</span>
            <a href="#" className="footer-link">Privacy Policy</a>
            <a href="#" className="footer-link">Terms of Service</a>
            <a href="#" className="footer-link">Cookie Settings</a>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--primary-fixed-dim)' }}>Account</span>
            <Link to="/auth" className="footer-link">Login / Register</Link>
            <Link to="/dashboard" className="footer-link">My Account</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
