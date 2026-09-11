import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function Auth() {
  const { user, profile, signIn, signUp } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [forgotSent, setForgotSent] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login form state (Simple Email & Password with Remember Me)
  const [loginData, setLoginData] = useState({ email: '', password: '', remember: false });

  // Register form state (Simple Name, Email, Password, Mobile)
  const [regData, setRegData] = useState({
    full_name: '', email: '', mobile: '', password: '',
  });

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
      const isAdminLogin = loginData.email.toLowerCase().includes('admin') ||
        loggedUser?.email?.toLowerCase().includes('admin') ||
        loggedUser?.labels?.includes('admin');

      if (isAdminLogin) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Invalid email or password. Please try again.');
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
        mobile: regData.mobile,
      });

      if (regData.email.toLowerCase().includes('admin')) {
        navigate('/admin');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Please verify your details.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #fdf2f8 100%)' }}>
      <Navbar />

      <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '120px 16px 80px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{
              width: 56, height: 56, borderRadius: '50%',
              background: 'var(--primary-fixed)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px',
              boxShadow: '0 0 0 10px rgba(183,0,17,0.06)',
            }}>
              <span className="material-symbols-outlined icon-fill" style={{ color: 'var(--primary-container)', fontSize: 28 }}>
                lock
              </span>
            </div>
            <h1 className="headline-md" style={{ marginBottom: 6 }}>
              Sign In to Account
            </h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
              Enter your registered email and password to access your dashboard
            </p>
          </div>

          {/* Card */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-modal)' }}>
            <div style={{ padding: '32px 28px' }}>
              {/* Error Banner */}
              {error && (
                <div style={{
                  background: 'var(--error-container)', color: 'var(--on-error-container)',
                  padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20,
                  fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
                  {error}
                </div>
              )}

              {/* LOGIN FORM */}
              <form onSubmit={handleLogin} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="animate-fade-in">
                <div className="form-group">
                  <label className="label" htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    name="w_client_email_input_field"
                    type="text"
                    className="input"
                    placeholder="name@example.com"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck="false"
                    data-lpignore="true"
                    data-form-type="other"
                    required
                    value={loginData.email}
                    onChange={e => setLoginData(d => ({ ...d, email: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="label" htmlFor="login-password">Password</label>
                  <div className="password-input-wrapper">
                    <input
                      id="login-password"
                      name="w_client_secret_input_field"
                      type={showPassword ? 'text' : 'password'}
                      className="input"
                      placeholder="••••••••••••"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      required
                      value={loginData.password}
                      onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      className="password-toggle-btn"
                      onClick={() => setShowPassword(prev => !prev)}
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 20 }}>
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13.5 }}>
                    <input
                      type="checkbox"
                      style={{ width: 16, height: 16, cursor: 'pointer' }}
                      checked={loginData.remember}
                      onChange={e => setLoginData(d => ({ ...d, remember: e.target.checked }))}
                    />
                    <span style={{ color: 'var(--on-surface-variant)' }}>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setError('');
                      setShowForgotModal(true);
                    }}
                    style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary-container)', background: 'none', border: 'none', cursor: 'pointer' }}
                  >
                    Forgot password?
                  </button>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  style={{ height: 50, fontSize: 15, borderRadius: 'var(--radius-md)', marginTop: 8 }}
                  disabled={loading}
                >
                  {loading
                    ? <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                    : <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span> Sign In</>
                  }
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>

      {/* THEMED CONTACT ADMIN / FORGOT PASSWORD MODAL */}
      {showForgotModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(18, 28, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowForgotModal(false);
          }}
        >
          <div
            className="card animate-fade-in"
            style={{
              width: '100%',
              maxWidth: 480,
              borderRadius: 'var(--radius-xl, 24px)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-modal, 0 24px 48px rgba(0,0,0,0.2))',
              background: 'var(--surface-container-lowest, #ffffff)',
              border: '1px solid var(--outline-variant, #e6bdb8)',
              padding: '32px 28px',
              position: 'relative',
            }}
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setShowForgotModal(false)}
              style={{
                position: 'absolute',
                top: 18,
                right: 18,
                background: 'var(--surface-container, #e6eeff)',
                border: 'none',
                borderRadius: '50%',
                width: 36,
                height: 36,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--on-surface, #121c2a)',
                transition: 'background 0.2s ease',
              }}
              aria-label="Close modal"
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>close</span>
            </button>

            {/* Modal Header */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  background: 'var(--primary-fixed, #ffdad6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 0 10px rgba(183,0,17,0.06)',
                }}
              >
                <span className="material-symbols-outlined icon-fill" style={{ color: 'var(--primary, #b70011)', fontSize: 28 }}>
                  lock_reset
                </span>
              </div>
              <h2 className="headline-md" style={{ fontSize: 22, fontWeight: 800, marginBottom: 6, color: 'var(--on-surface, #121c2a)' }}>
                Password Reset Assistance
              </h2>
              <p className="body-md" style={{ color: 'var(--on-surface-variant, #5c403c)', fontSize: 13.5, lineHeight: 1.5 }}>
                For account verification and security, password resets are handled directly by Winstar Administration.
              </p>
            </div>

            {/* Info Box */}
            <div
              style={{
                background: 'var(--surface-container-low, #eff4ff)',
                border: '1px solid var(--surface-container-highest, #d9e3f6)',
                borderRadius: 'var(--radius-lg, 16px)',
                padding: '16px',
                marginBottom: 20,
                display: 'flex',
                flexDirection: 'column',
                gap: 6,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontWeight: 700, color: 'var(--primary, #b70011)' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>support_agent</span>
                <span>Contact Admin to Reset</span>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: 'var(--on-surface, #121c2a)', lineHeight: 1.5 }}>
                Reach out to our team with your registered email
                {loginData.email ? <strong style={{ color: 'var(--primary, #b70011)' }}> ({loginData.email})</strong> : ''} to quickly update your password.
              </p>
            </div>

            {/* Action Channels */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {/* WhatsApp Direct */}
              <a
                href={`https://wa.me/919345046665?text=${encodeURIComponent(
                  `Hello Winstar Admin, I need assistance resetting my password${loginData.email ? ` for my registered email: ${loginData.email}` : ''}.`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-full"
                style={{
                  height: 48,
                  background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
                  color: '#ffffff',
                  borderRadius: 'var(--radius-md, 12px)',
                  fontWeight: 700,
                  fontSize: 14,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(37, 211, 102, 0.28)',
                }}
              >
                <svg viewBox="0 0 32 32" width="20" height="20" fill="#ffffff">
                  <path d="M16 2.5C8.544 2.5 2.5 8.544 2.5 16c0 2.657.772 5.13 2.102 7.218L3 29l6.004-1.574A13.435 13.435 0 0 0 16 29.5c7.456 0 13.5-6.044 13.5-13.5S23.456 2.5 16 2.5zm7.848 18.96c-.328.92-1.636 1.764-2.678 1.988-.71.152-1.638.274-4.757-1.02-3.985-1.654-6.55-5.69-6.748-5.955-.194-.264-1.616-2.15-1.616-4.1 0-1.95 1.02-2.91 1.382-3.308.362-.398.79-.498 1.054-.498.264 0 .528.002.76.014.246.012.576-.094.9.686.33.794 1.124 2.74 1.222 2.94.098.2.164.432.032.696-.13.264-.196.43-.39.66-.196.23-.41.512-.586.688-.196.196-.4.41-.172.802.228.392 1.014 1.672 2.176 2.708 1.494 1.332 2.754 1.744 3.146 1.94.392.196.622.164.852-.1.23-.264.984-1.15 1.248-1.544.264-.394.528-.328.888-.196.36.132 2.296 1.082 2.692 1.28.396.198.66.296.758.462.098.166.098.96-.23 1.88z"/>
                </svg>
                Contact Admin on WhatsApp
              </a>

              {/* Call Direct */}
              <a
                href="tel:+919345046665"
                className="btn btn-outline btn-full"
                style={{
                  height: 44,
                  borderRadius: 'var(--radius-md, 12px)',
                  fontWeight: 600,
                  fontSize: 13.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  textDecoration: 'none',
                  borderColor: 'var(--outline-variant, #e6bdb8)',
                  color: 'var(--on-surface, #121c2a)',
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18, color: 'var(--primary, #b70011)' }}>call</span>
                Call Admin (+91 93450 46665)
              </a>

              {/* Back to Login */}
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="btn btn-ghost btn-full"
                style={{
                  height: 40,
                  borderRadius: 'var(--radius-md, 12px)',
                  fontWeight: 600,
                  fontSize: 13.5,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--on-surface-variant, #5c403c)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                  marginTop: 2,
                }}
              >
                Back to Sign In
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
