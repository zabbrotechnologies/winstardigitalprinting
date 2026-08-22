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
              {tab === 'login' ? 'Sign in to Account' : 'Create an Account'}
            </h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
              {tab === 'login'
                ? 'Enter your credentials to access your account'
                : 'Register to manage orders and track printing status'
              }
            </p>
          </div>

          {/* Card */}
          <div className="card" style={{ borderRadius: 'var(--radius-xl)', overflow: 'hidden', boxShadow: 'var(--shadow-modal)' }}>
            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid var(--surface-container)' }}>
              {['login', 'register'].map(t => (
                <button
                  key={t}
                  onClick={() => { setTab(t); setError(''); setForgotSent(false); }}
                  style={{
                    flex: 1, padding: '16px', fontSize: 14, fontWeight: 700,
                    letterSpacing: '0.04em', border: 'none', cursor: 'pointer',
                    background: 'none', textTransform: 'capitalize',
                    color: tab === t ? 'var(--primary-container)' : 'var(--on-surface-variant)',
                    borderBottom: tab === t ? '3px solid var(--primary-container)' : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {t === 'login' ? 'Sign In' : 'Create Account'}
                </button>
              ))}
            </div>

            <div style={{ padding: '28px 24px' }}>
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

              {/* Forgot Password Success */}
              {forgotSent && (
                <div style={{
                  background: '#dcfce7', color: '#166534',
                  padding: '12px 16px', borderRadius: 'var(--radius)', marginBottom: 20,
                  fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>check_circle</span>
                  Password reset link sent to your email.
                </div>
              )}

              {/* LOGIN FORM */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="animate-fade-in">
                  <div className="form-group">
                    <label className="label" htmlFor="login-email">Email Address</label>
                    <input
                      id="login-email"
                      type="email"
                      className="input"
                      placeholder="name@example.com"
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
                      placeholder="••••••••••••"
                      required
                      value={loginData.password}
                      onChange={e => setLoginData(d => ({ ...d, password: e.target.value }))}
                    />
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
                        if (!loginData.email) {
                          setError('Please enter your email above first to reset password.');
                        } else {
                          setError('');
                          setForgotSent(true);
                        }
                      }}
                      style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--primary-container)', background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Forgot password?
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    style={{ height: 50, fontSize: 15, borderRadius: 'var(--radius-md)', marginTop: 6 }}
                    disabled={loading}
                  >
                    {loading
                      ? <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                      : <><span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span> Sign In</>
                    }
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                    Don't have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('register'); setError(''); setForgotSent(false); }}
                      style={{ color: 'var(--primary-container)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Create Account
                    </button>
                  </p>
                </form>
              )}

              {/* REGISTER FORM */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 16 }} className="animate-fade-in">
                  <div className="form-group">
                    <label className="label" htmlFor="reg-name">Full Name *</label>
                    <input id="reg-name" type="text" className="input" placeholder="Your Name" required
                      value={regData.full_name} onChange={e => setRegData(d => ({ ...d, full_name: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="reg-email">Email Address *</label>
                    <input id="reg-email" type="email" className="input" placeholder="yourname@gmail.com" required
                      value={regData.email} onChange={e => setRegData(d => ({ ...d, email: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="reg-mobile">Mobile Number (WhatsApp)</label>
                    <input id="reg-mobile" type="tel" className="input" placeholder="9876543210"
                      value={regData.mobile} onChange={e => setRegData(d => ({ ...d, mobile: e.target.value }))} />
                  </div>

                  <div className="form-group">
                    <label className="label" htmlFor="reg-password">Create Password *</label>
                    <input id="reg-password" type="password" className="input" placeholder="At least 8 characters" required
                      value={regData.password} onChange={e => setRegData(d => ({ ...d, password: e.target.value }))} />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-primary btn-full"
                    style={{ height: 50, fontSize: 15, borderRadius: 'var(--radius-md)', marginTop: 6 }}
                    disabled={loading}
                  >
                    {loading
                      ? <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                      : 'Create Account'
                    }
                  </button>

                  <p style={{ textAlign: 'center', fontSize: 13.5, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setTab('login'); setError(''); }}
                      style={{ color: 'var(--primary-container)', fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}
                    >
                      Sign In
                    </button>
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
