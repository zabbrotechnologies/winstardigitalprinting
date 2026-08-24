import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';
import StatCard from '../components/StatCard';
import OrderTable from '../components/OrderTable';
import PrintWizard from '../components/PrintWizard';

import { fetchUserOrders } from '../lib/orderService';

function formatCurrency(val) {
  return '₹' + parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Dashboard() {
  const { user, profile, loading: authLoading, getAccessToken } = useAuth();
  const [view, setView] = useState('overview');
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState(null);
  const [ordersLoading, setOrdersLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    loadDashboardData();
  }, [user]);

  async function loadDashboardData() {
    setOrdersLoading(true);
    try {
      const currentUserId = user?.id || user?.$id;
      const userOrders = await fetchUserOrders(currentUserId);
      setOrders(userOrders);

      // Compute stats
      let totalOrders = userOrders.length;
      let activeOrders = 0;
      let completedOrders = 0;
      let totalSpending = 0;

      userOrders.forEach(ord => {
        if (['Pending', 'Confirmed', 'Printing', 'Processing'].includes(ord.status)) activeOrders += 1;
        if (['Printed', 'Ready for Pickup', 'Delivered', 'Completed'].includes(ord.status)) completedOrders += 1;
        totalSpending += parseFloat(ord.total_price || 0);
      });

      setStats({ totalOrders, activeOrders, completedOrders, totalSpending });
    } catch (err) {
      console.error('Failed to load user orders:', err);
    } finally {
      setOrdersLoading(false);
    }
  }

  if (authLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  if (!user) return <Navigate to="/auth" replace />;

  // Since normal users do not have accounts, ANY user who logs into the Dashboard is an approved wholesale agency.
  const isApprovedWholesale = true;

  const statCards = [
    { icon: 'inventory', label: 'Total Orders', value: stats?.totalOrders ?? '—', iconBg: 'var(--primary-fixed)', iconColor: 'var(--primary-container)' },
    { icon: 'autorenew', label: 'Active Orders', value: stats?.activeOrders ?? '—', iconBg: 'var(--secondary-fixed)', iconColor: 'var(--on-secondary-fixed-variant)' },
    { icon: 'task_alt', label: 'Completed', value: stats?.completedOrders ?? '—', iconBg: '#dcfce7', iconColor: '#166534' },
    { icon: 'payments', label: 'Total Spending', value: stats ? formatCurrency(stats.totalSpending) : '—', iconBg: 'var(--surface-container-high)', iconColor: 'var(--on-surface)' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />
      <div style={{ display: 'flex', paddingTop: 72 }}>
        <Sidebar activeView={view} onViewChange={setView} />

        {/* Main content */}
        <main className="dashboard-main" style={{
          flex: 1,
          marginLeft: 256,
          padding: 'var(--margin-desktop)',
          minHeight: 'calc(100vh - 72px)',
          background: 'linear-gradient(135deg, #fff 0%, #fdf2f8 50%, #fff 100%)',
          position: 'relative',
          overflowY: 'auto',
        }}>
          {/* Overview View */}
          {view === 'overview' && (
            <div className="animate-fade-in">
              {/* Page header */}
              <div style={{ marginBottom: 40 }}>
                <h1 className="display-lg-mobile" style={{ marginBottom: 6 }}>
                  Welcome back, {profile?.full_name?.split(' ')[0] || 'there'} 👋
                </h1>
                <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                  Here is a summary of your recent printing activity.
                </p>
              </div>

              {/* Stats Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--gutter)', marginBottom: 48 }}>
                {statCards.map(card => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>

              {/* Recent Orders */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <h2 className="headline-sm" style={{ fontSize: 20 }}>Recent Orders</h2>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setView('orders')}
                  >
                    View All <span className="material-symbols-outlined" style={{ fontSize: 16 }}>arrow_forward</span>
                  </button>
                </div>
                <OrderTable orders={orders.slice(0, 5)} loading={ordersLoading} />
              </div>

              {/* Quick Actions */}
              <div style={{ marginTop: 40 }}>
                <h2 className="headline-sm" style={{ fontSize: 20, marginBottom: 20 }}>Quick Actions</h2>
                <div style={{ display: 'flex', gap: 16 }}>
                  {[
                    { icon: 'add_circle', label: 'New Print Request', desc: 'Upload and configure a new print job', action: () => setView('new_order') },
                    { icon: 'inventory_2', label: 'View All Orders', desc: 'Check status of all your orders', action: () => setView('orders') },
                    { icon: 'help', label: 'Get Support', desc: 'Contact us for help with your orders', action: () => {} },
                  ].map(qa => (
                    <button key={qa.label} onClick={qa.action} style={{
                      flex: 1, padding: '20px', background: 'var(--surface-container-lowest)',
                      border: '1px solid var(--surface-container-high)',
                      borderRadius: 'var(--radius-lg)', cursor: 'pointer',
                      textAlign: 'left', transition: 'var(--transition)',
                      boxShadow: 'var(--shadow-ambient)',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.boxShadow = 'var(--shadow-hover)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'var(--shadow-ambient)'; e.currentTarget.style.transform = ''; }}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: 24, color: 'var(--primary-container)', display: 'block', marginBottom: 10 }}>{qa.icon}</span>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4 }}>{qa.label}</div>
                      <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{qa.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Orders View */}
          {view === 'orders' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 32 }}>
                <h1 className="headline-md" style={{ marginBottom: 8 }}>All Orders</h1>
                <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                  {orders.length} total order{orders.length !== 1 ? 's' : ''}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
                {['All', 'Pending', 'Processing', 'Printed', 'Delivered'].map(status => (
                  <button key={status} className="btn btn-outline btn-sm btn-pill">
                    {status}
                  </button>
                ))}
                <div style={{ flex: 1 }} />
                <button className="btn btn-primary btn-sm" onClick={() => setView('new_order')}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16 }}>add</span>
                  New Order
                </button>
              </div>
              <OrderTable orders={orders} loading={ordersLoading} />
            </div>
          )}

          {/* Documents / Invoices placeholder views */}
          {(view === 'documents' || view === 'invoices') && (
            <div style={{ textAlign: 'center', padding: '80px 32px' }} className="animate-fade-in">
              <span className="material-symbols-outlined" style={{ fontSize: 64, color: 'var(--surface-container-high)', display: 'block', marginBottom: 24 }}>
                {view === 'documents' ? 'folder_open' : 'receipt_long'}
              </span>
              <h2 className="headline-sm" style={{ marginBottom: 12, textTransform: 'capitalize' }}>{view}</h2>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                This section is coming soon. Stay tuned!
              </p>
            </div>
          )}

          {/* New Order View (Embedded Print Wizard) */}
          {view === 'new_order' && (
            <div className="animate-fade-in">
              <div style={{ marginBottom: 32 }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  background: isApprovedWholesale ? '#dcfce7' : 'var(--primary-fixed)',
                  color: isApprovedWholesale ? '#166534' : 'var(--on-primary-fixed-variant)',
                  padding: '6px 16px', borderRadius: 'var(--radius-full)',
                  fontSize: 13, fontWeight: 700, marginBottom: 16,
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                    {isApprovedWholesale ? 'verified' : 'print'}
                  </span>
                  {isApprovedWholesale ? 'WHOLESALE PRICING ACTIVE' : 'STANDARD RETAIL PRINTING'}
                </div>
                <h1 className="headline-md" style={{ marginBottom: 8 }}>Create New Print Job</h1>
                <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
                  Upload your files and configure your print specifications.
                </p>
              </div>
              
              <div style={{ maxWidth: 1000 }}>
                <PrintWizard isWholesale={isApprovedWholesale} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
