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
                  <input
                    id="login-password"
                    name="w_client_secret_input_field"
                    type="password"
                    className="input"
                    placeholder="••••••••••••"
                    autoComplete="new-password"
                    data-lpignore="true"
                    data-form-type="other"
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

      <Footer />
    </div>
  );
}
