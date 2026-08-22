import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/services', label: 'Services' },
    { to: '/bulk-order', label: 'Wholesale B2B' },
    { to: '/services#tracking', label: 'Track Order' },
  ];

  const isActive = (to) => location.pathname === to;

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <Link to="/" className="navbar-brand">
          <span className="material-symbols-outlined icon-fill" style={{ color: 'var(--primary-container)', fontSize: 28 }}>print</span>
          <span>Xerox Digital Pro</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="desktop-nav">
          <ul className="navbar-nav">
            {navLinks.map(link => (
              <li key={link.to}>
                <Link
                  to={link.to}
                  className={isActive(link.to) ? 'active' : ''}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Actions */}
        <div className="navbar-actions">
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                className="btn btn-outline btn-pill"
                style={{ gap: 6, padding: '6px 14px', fontSize: 13 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_circle</span>
                <span className="hide-on-compact">{profile?.full_name?.split(' ')[0] || 'Account'}</span>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>expand_more</span>
              </button>
              {userMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  right: 0,
                  background: 'var(--surface-container-lowest)',
                  border: '1px solid var(--outline-variant)',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: 'var(--shadow-modal)',
                  minWidth: 190,
                  zIndex: 200,
                  overflow: 'hidden',
                }}>
                  <Link
                    to="/dashboard"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: 'var(--on-surface)', borderBottom: '1px solid var(--surface-container)' }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>dashboard</span>
                    Dashboard
                  </Link>
                  <Link
                    to="/admin"
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: 'var(--primary-container)', fontWeight: 600, borderBottom: '1px solid var(--surface-container)' }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>admin_panel_settings</span>
                    Admin Panel
                  </Link>
                  <button
                    onClick={() => { setUserMenuOpen(false); handleSignOut(); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: 'var(--error)', background: 'none', border: 'none', width: '100%', cursor: 'pointer' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="desktop-actions" style={{ display: 'flex', gap: 8 }}>
              <Link to="/auth" className="btn btn-outline btn-pill" style={{ padding: '8px 16px', fontSize: 13 }}>
                Login
              </Link>
              <Link to="/#quick-print" className="btn btn-primary btn-pill" style={{ padding: '8px 16px', fontSize: 13 }}>
                Start Project
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu button */}
          <button
            className="btn btn-ghost mobile-toggle-btn"
            aria-label="Toggle navigation menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 26 }}>{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileOpen && (
        <div className="mobile-menu-drawer animate-fade-in">
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`mobile-nav-link ${isActive(link.to) ? 'active' : ''}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}

          <hr style={{ borderColor: 'var(--surface-container)', margin: '4px 0' }} />

          {user ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <Link
                to="/dashboard"
                className="mobile-nav-link"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => setMobileOpen(false)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>dashboard</span>
                Dashboard
              </Link>
              <Link
                to="/admin"
                className="mobile-nav-link"
                style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary-container)', fontWeight: 700 }}
                onClick={() => setMobileOpen(false)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>admin_panel_settings</span>
                Admin Panel
              </Link>
              <button
                onClick={() => { setMobileOpen(false); handleSignOut(); }}
                className="btn btn-outline"
                style={{ color: 'var(--error)', borderColor: 'var(--error-container)', marginTop: 4, width: '100%', justifyContent: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>logout</span>
                Sign Out ({profile?.full_name || 'Account'})
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 4 }}>
              <Link to="/auth" className="btn btn-outline" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
                Client Login / Register
              </Link>
              <Link to="/#quick-print" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
                Start Print Job
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

