import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

export default function Navbar() {
  const { user, signOut, profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

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
          Xerox Digital Pro
        </Link>

        {/* Desktop Nav */}
        <nav>
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
                style={{ gap: 8 }}
                onClick={() => setUserMenuOpen(!userMenuOpen)}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>account_circle</span>
                {profile?.full_name?.split(' ')[0] || 'Account'}
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
                  minWidth: 180,
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
            <>
              <Link to="/auth" className="btn btn-outline btn-pill">
                Client Login
              </Link>
              <Link to="/#quick-print" className="btn btn-primary btn-pill">
                Start Project
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="btn btn-ghost"
            style={{ display: 'none', padding: '8px', minWidth: 0 }}
            id="mobile-menu-btn"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <span className="material-symbols-outlined">{mobileOpen ? 'close' : 'menu'}</span>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div style={{
          position: 'absolute',
          top: 72,
          left: 0,
          right: 0,
          background: 'var(--surface-container-lowest)',
          borderBottom: '1px solid var(--outline-variant)',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
          zIndex: 99,
        }}>
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              style={{ padding: '10px 16px', borderRadius: 'var(--radius)', fontSize: 14, fontWeight: 600, color: 'var(--on-surface)' }}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          {!user && (
            <Link to="/auth" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ marginTop: 8 }}>
              Client Login / Register
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
