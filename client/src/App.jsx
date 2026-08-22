import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Services from './pages/Services';
import Admin from './pages/Admin';
import BulkOrder from './pages/BulkOrder';
import RegisterWholesale from './pages/RegisterWholesale';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/services" element={<Services />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/bulk-order" element={<BulkOrder />} />
          <Route path="/register-wholesale" element={<RegisterWholesale />} />
          {/* 404 fallback */}
          <Route path="*" element={
            <div style={{
              minHeight: '100vh', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
              background: 'var(--background)',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 72, color: 'var(--surface-container-high)' }}>error</span>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 32, fontWeight: 700 }}>Page Not Found</h1>
              <p style={{ color: 'var(--on-surface-variant)' }}>The page you're looking for doesn't exist.</p>
              <a href="/" className="btn btn-primary btn-lg" style={{ marginTop: 8 }}>Go Home</a>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
