import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Auth() {
  const { user, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Login form state
  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });

  // Register form state
  const [regData, setRegData] = useState({
    full_name: '', company_name: '', email: '', mobile: '', password: '', business_details: '',
  });

  const [portalType, setPortalType] = useState('client'); // 'client' | 'admin'

  if (user) {
    if (profile?.isAdmin || user?.email?.toLowerCase().includes('admin')) {
      return <Navigate to="/admin" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  async function handleLogin(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await signIn(loginData.email, loginData.password);
      const isAdminLogin = portalType === 'admin' ||
        loginData.email.toLowerCase().includes('admin') ||
        loggedUser?.email?.toLowerCase().includes('admin');

      if (isAdminLogin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const createdUser = await signUp(regData.email, regData.password, {
        full_name: regData.full_name,
        company_name: regData.company_name,
        mobile: regData.mobile,
        business_details: regData.business_details,
      });
      if (regData.email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #fdf2f8 100%)' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 16px 80px' }}>
        <div style={{ width: '100%', maxWidth: 520 }}>
          {/* Portal Switcher (Client vs Admin) */}
          <div style={{
            display: 'flex',
            background: 'var(--surface-container-high)',
            padding: 4,
            borderRadius: 'var(--radius-full)',
            marginBottom: 28,
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.06)',
          }}>
            <button
              type="button"
              onClick={() => { setPortalType('client'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                background: portalType === 'client' ? 'var(--surface-container-lowest)' : 'transparent',
                color: portalType === 'client' ? 'var(--on-surface)' : 'var(--on-surface-variant)',
                boxShadow: portalType === 'client' ? 'var(--shadow-ambient)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>person</span>
              Client Portal
            </button>
            <button
              type="button"
              onClick={() => { setPortalType('admin'); setError(''); }}
              style={{
                flex: 1,
                padding: '10px 16px',
                borderRadius: 'var(--radius-full)',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 13,
                background: portalType === 'admin' ? 'var(--primary-container)' : 'transparent',
                color: portalType === 'admin' ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                boxShadow: portalType === 'admin' ? '0 2px 8px rgba(183,0,17,0.3)' : 'none',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>shield_person</span>
              Admin Master
            </button>
          </div>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: portalType === 'admin' ? '#fee2e2' : 'var(--primary-fixed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: portalType === 'admin' ? '0 0 0 12px rgba(220,38,38,0.1)' : '0 0 0 12px rgba(183,0,17,0.06)',
            }}>
              <span className="material-symbols-outlined icon-fill" style={{ color: portalType === 'admin' ? '#dc2626' : 'var(--primary-container)', fontSize: 32 }}>
                {portalType === 'admin' ? 'admin_panel_settings' : 'lock'}
              </span>
            </div>
            <h1 className="headline-md" style={{ marginBottom: 6 }}>
              {portalType === 'admin' ? 'Admin Master Portal' : 'Client Portal'}
            </h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
              {portalType === 'admin'
                ? 'Sign in with administrator credentials to manage orders & clients'
                : tab === 'login' ? 'Sign in to manage your print orders' : 'Create a business account for enhanced features'
              }
            </p>
          </div>

          {/* Card */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-container)' }}>
              {['login', 'register'].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); }}
                  style={{
                    flex: 1, padding: '16px', fontSize: 14, fontWeight: 600,
                    letterSpacing: '0.04em', border: 'none', cursor: 'pointer',
                    background: 'none', textTransform: 'capitalize',
                    color: tab === t ? 'var(--primary-container)' : 'var(--on-surface-variant)',
                    borderBottom: tab === t ? '2.5px solid var(--primary-container)' : '2.5px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {t === 'login' ? 'Login' : 'Register'}
                </button>
              ))}
            </div>

            <div style={{ padding: '32px' }}>
              {/* Error Banner */}
              {error && (
                <div style={{
                  background: 'var(--error-container)', color: 'var(--on-error-container)',
                  padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 24,
                  fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
                  <div className="form-group">
                    <label className="label" htmlFor="login-email">Email Address</label>
                    <input
                      id="login-email"
                      type="email"
                      className="input"
                      placeholder="jane@company.com"
                      required
                      value={loginData.email}
                      onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label" htmlFor="login-password">Password</label>
                    <input
                      id="login-password"
                      type="password"
                      className="input"
                      placeholder="••••••••••"
                      required
                      value={loginData.password}
                      onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                    />
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input
                        type="checkbox"
                        style={{ width: 16, height: 16 }}
                        checked={loginData.remember}
                        onChange={e => setLoginData(d => ({ ...d, remember: e.target.checked }))}
                      />
                      <span style={{ color: 'var(--on-surface-variant)' }}>Remember me</span>
                    </label>
                    <a href="#" style={{ fontSize: 14, fontWeight: 600, color: 'var(--primary-container)' }}>
                      Forgot password?
                    </a>
                  </div>
                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    style={{ height: 52, fontSize: 16, borderRadius: 'var(--radius-md)', marginTop: 8 }}
                    disabled={loading}
                  >
                    {loading
                      ? <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                      : <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span> Login to Portal</>
                    }
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => setTab('register')}
                      style={{ color: 'var(--primary-container)', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Create one
                    </button>
                  </p>
                </form>
              )}

              {/* REGISTER FORM */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="animate-fade-in">
                  <div style={{
                    background: 'var(--surface-container-low)', padding: '12px 16px',
                    borderRadius: 'var(--radius)', fontSize: 14, color: 'var(--on-surface-variant)',
                    display: 'flex', alignItems: 'flex-start', gap: 8,
                  }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary-container)', flexShrink: 0 }}>info</span>
                    Registration unlocks order history, reordering, and enterprise discounts.
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="label" htmlFor="reg-name">Full Name *</label>
                      <input id="reg-name" type="text" className="input" placeholder="Jane Doe" required
                        value={regData.full_name} onChange={e => setRegData(d => ({ ...d, full_name: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="reg-company">Company</label>
                      <input id="reg-company" type="text" className="input" placeholder="Acme Corp"
                        value={regData.company_name} onChange={e => setRegData(d => ({ ...d, company_name: e.target.value }))} />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div className="form-group">
                      <label className="label" htmlFor="reg-email">Work Email *</label>
                      <input id="reg-email" type="email" className="input" placeholder="jane@acme.com" required
                        value={regData.email} onChange={e => setRegData(d => ({ ...d, email: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label className="label" htmlFor="reg-mobile">Mobile</label>
                      <input id="reg-mobile" type="tel" className="input" placeholder="+1 (555) 000-0000"
                        value={regData.mobile} onChange={e => setRegData(d => ({ ...d, mobile: e.target.value }))} />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="reg-password">Password *</label>
                    <input id="reg-password" type="password" className="input" placeholder="Create a strong password" required
                      value={regData.password} onChange={e => setRegData(d => ({ ...d, password: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="reg-details">Business Details</label>
                    <textarea id="reg-details" className="textarea" rows={3}
                      placeholder="Describe your typical printing volume or specific needs..."
                      value={regData.business_details}
                      onChange={e => setRegData(d => ({ ...d, business_details: e.target.value }))}
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-full"
                    style={{
                      height: 52, fontSize: 16, borderRadius: 'var(--radius-md)',
                      background: 'var(--inverse-surface)', color: 'var(--inverse-on-surface)',
                    }}
                    disabled={loading}
                  >
                    {loading
                      ? <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                      : 'Create Business Account'
                    }
                  </button>
                  <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--on-surface-variant)' }}>
                    By registering you agree to our{' '}
                    <a href="#" style={{ color: 'var(--primary-container)' }}>Terms of Service</a>
                    {' '}and{' '}
                    <a href="#" style={{ color: 'var(--primary-container)' }}>Privacy Policy</a>.
                  </p>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
