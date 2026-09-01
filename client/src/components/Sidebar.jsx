import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const navItems = [
  { icon: 'dashboard', label: 'Overview', view: 'overview' },
  { icon: 'inventory_2', label: 'Orders', view: 'orders' },
  { icon: 'description', label: 'Documents', view: 'documents' },
  { icon: 'receipt_long', label: 'Invoices', view: 'invoices' },
];

export default function Sidebar({ activeView, onViewChange, isOpen, onClose }) {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  async function handleSignOut() {
    if (onClose) onClose();
    await signOut();
    navigate('/');
  }

  function handleSelect(view) {
    if (onViewChange) onViewChange(view);
    if (onClose) onClose();
  }

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="sidebar-backdrop animate-fade-in" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${isOpen ? 'sidebar-mobile-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="sidebar-title">Enterprise Portal</div>
            <div className="sidebar-subtitle">{profile?.company_name || 'Business Account'}</div>
          </div>
          <button
            className="sidebar-close-btn"
            onClick={onClose}
            aria-label="Close sidebar menu"
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--on-surface-variant)',
              cursor: 'pointer',
              padding: 4,
              borderRadius: 'var(--radius-sm)',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 22 }}>close</span>
          </button>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          {navItems.map(item => (
            <button
              key={item.view}
              className={`sidebar-link ${activeView === item.view ? 'active' : ''}`}
              onClick={() => handleSelect(item.view)}
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
            onClick={() => {
              if (onViewChange) handleSelect('new_order');
              else {
                if (onClose) onClose();
                navigate('/bulk-order');
              }
            }}
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
    </>
  );
}
