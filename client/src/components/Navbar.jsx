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
    { to: '/bulk-order', label: 'B2B' },
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
        <Link to="/" className="navbar-brand" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', height: '100%' }}>
          <img 
            src="/logo.png" 
            alt="WINSTAR Logo" 
            className="navbar-brand-logo"
            style={{ 
              height: 52, 
              maxHeight: 56, 
              width: 'auto', 
              objectFit: 'contain',
              display: 'block'
            }} 
            onError={(e) => { e.target.onerror = null; e.target.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23D4AF37"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>'; }} 
          />
          <div className="navbar-brand-text" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              width: '100%',
              fontFamily: 'var(--font-display)',
              fontSize: 25,
              fontWeight: 900,
              lineHeight: 1,
              color: '#F59E0B',
              background: 'linear-gradient(135deg, #FBBF24 0%, #F59E0B 40%, #D97706 70%, #B45309 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              textShadow: '0 1px 2px rgba(245, 158, 11, 0.2)',
            }}>
              <span>W</span>
              <span>I</span>
              <span>N</span>
              <span>S</span>
              <span>T</span>
              <span>A</span>
              <span>R</span>
            </div>
            <div style={{ 
              fontSize: 10, 
              fontWeight: 800, 
              color: 'var(--on-surface-variant)', 
              textTransform: 'uppercase', 
              letterSpacing: '0.04em',
              lineHeight: 1.1,
              marginTop: 3,
              whiteSpace: 'nowrap'
            }}>
              Digital Printing &amp; Xerox
            </div>
          </div>
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
            <div className="desktop-actions" style={{ position: 'relative' }}>
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
                    to={profile?.isAdmin ? '/admin' : '/dashboard'}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 16px', fontSize: 14, color: 'var(--on-surface)', borderBottom: '1px solid var(--surface-container)' }}
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>dashboard</span>
                    {profile?.isAdmin ? 'Management Panel' : 'My Dashboard'}
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
              <Link to="/auth" className="btn btn-outline btn-pill" style={{ padding: '8px 18px', fontSize: 13 }}>
                Login
              </Link>
              <Link to="/#quick-print" className="btn btn-primary btn-pill" style={{ padding: '8px 18px', fontSize: 13 }}>
                Start Print
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
                to={profile?.isAdmin ? '/admin' : '/dashboard'}
                className="mobile-nav-link"
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => setMobileOpen(false)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>dashboard</span>
                {profile?.isAdmin ? 'Management Panel' : 'My Dashboard'}
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
                Login / Register
              </Link>
              <Link to="/#quick-print" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ width: '100%', justifyContent: 'center' }}>
                Start Print
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
}

