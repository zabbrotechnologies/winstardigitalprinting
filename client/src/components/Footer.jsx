import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="footer">
      <div style={{ maxWidth: 'var(--container-max)', margin: '0 auto', display: 'flex', flexWrap: 'wrap', gap: 48, justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {/* Brand */}
        <div style={{ maxWidth: 320 }}>
          <div className="footer-brand">
            <span className="material-symbols-outlined icon-fill" style={{ color: 'var(--primary-fixed-dim)', fontSize: 24, verticalAlign: 'middle', marginRight: 8 }}>print</span>
            Xerox Digital Pro
          </div>
          <p className="footer-desc" style={{ marginTop: 12 }}>
            © 2024 Xerox Digital Pro. Precision Printing Excellence.<br />
            Professional printing solutions for enterprise and creatives.
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
            <Link to="/auth" className="footer-link">Client Login</Link>
            <Link to="/dashboard" className="footer-link">Dashboard</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
