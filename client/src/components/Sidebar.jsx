import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: 'dashboard', label: 'Overview', view: 'overview' },
  { icon: 'inventory_2', label: 'Orders', view: 'orders' },
  { icon: 'description', label: 'Documents', view: 'documents' },
  { icon: 'receipt_long', label: 'Invoices', view: 'invoices' },
];

export default function Sidebar({ activeView, onViewChange }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <aside className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="sidebar-title">Enterprise Portal</div>
        <div className="sidebar-subtitle">{profile?.company_name || 'Business Account'}</div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.view}
            className={`sidebar-link ${activeView === item.view ? 'active' : ''}`}
            onClick={() => onViewChange(item.view)}
          >
            <span
              className="material-symbols-outlined"
              style={activeView === item.view ? { fontVariationSettings: "'FILL' 1" } : {}}
            >
              {item.icon}
            </span>
            {item.label}
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginBottom: 8 }}
          onClick={() => navigate('/bulk-order')}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 18 }}>add</span>
          New Print Request
        </button>
        <button className="sidebar-link" style={{ color: 'var(--error)' }} onClick={handleSignOut}>
          <span className="material-symbols-outlined">logout</span>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
