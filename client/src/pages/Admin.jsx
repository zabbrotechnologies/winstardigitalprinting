import { useState, useEffect } from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import StatCard from '../components/StatCard';

import { fetchAllAdminOrders } from '../lib/orderService';
import { databases, DATABASE_ID, ORDERS_COLLECTION_ID, USERS_COLLECTION_ID } from '../lib/appwrite';
import { Query } from 'appwrite';

const STATUSES = ['Pending', 'Confirmed', 'Printing', 'Processing', 'Ready for Pickup', 'Delivered', 'Completed', 'Cancelled'];

function formatCurrency(val) {
  return '₹' + parseFloat(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export default function Admin() {
  const { user, profile, loading: authLoading, getAccessToken } = useAuth();
  const [activeTab, setActiveTab] = useState('normal'); // 'normal' | 'wholesale' | 'agencies'
  const [orders, setOrders] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    if (!user) return;
    fetchAdminData();
  }, [user]);

  async function fetchAdminData() {
    setLoading(true);
    try {
      const token = await getAccessToken();
      const allOrders = await fetchAllAdminOrders(token);
      setOrders(allOrders);

      // Load agencies
      try {
        const agenciesRes = await databases.listDocuments(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          [Query.equal('account_type', 'wholesale'), Query.limit(100)]
        );
        setAgencies(agenciesRes.documents.map(d => ({ id: d.$id, ...d })));
      } catch {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiUrl}/api/auth/agencies`, { headers }).catch(() => ({ ok: false }));
        if (res.ok) setAgencies(await res.json());
      }

      // Compute admin stats
      let totalOrders = allOrders.length;
      let normalOrders = 0;
      let wholesaleOrders = 0;
      let pendingOrders = 0;
      let processingOrders = 0;
      let completedOrders = 0;
      let totalRevenue = 0;

      allOrders.forEach(doc => {
        if (doc.order_type === 'wholesale') wholesaleOrders += 1;
        else normalOrders += 1;
        if (doc.status === 'Pending') pendingOrders += 1;
        if (doc.status === 'Printing' || doc.status === 'Processing') processingOrders += 1;
        if (['Printed', 'Ready for Pickup', 'Delivered', 'Completed'].includes(doc.status)) completedOrders += 1;
        totalRevenue += parseFloat(doc.total_price || 0);
      });

      setStats({
        totalOrders,
        normalOrders,
        wholesaleOrders,
        pendingOrders,
        processingOrders,
        completedOrders,
        totalRevenue,
        pendingAgencies: agencies.filter(a => a.status === 'pending').length,
      });
    } catch (err) {
      console.error('Admin data fetch notice:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId, newStatus) {
    setUpdatingId(orderId);
    try {
      // 1. Try Direct Appwrite DB
      try {
        await databases.updateDocument(
          DATABASE_ID,
          ORDERS_COLLECTION_ID,
          orderId,
          { status: newStatus, updated_at: new Date().toISOString() }
        );
      } catch {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = await getAccessToken();
        await fetch(`${apiUrl}/api/orders/admin/${orderId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error('Status update notice:', err);
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAgencyVerify(agencyId, newStatus) {
    setUpdatingId(agencyId);
    try {
      try {
        await databases.updateDocument(
          DATABASE_ID,
          USERS_COLLECTION_ID,
          agencyId,
          { status: newStatus, verified_at: new Date().toISOString() }
        );
      } catch {
        const apiUrl = import.meta.env.VITE_API_URL || '';
        const token = await getAccessToken();
        await fetch(`${apiUrl}/api/auth/agencies/${agencyId}/verify`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          body: JSON.stringify({ status: newStatus }),
        });
      }

      setAgencies(prev => prev.map(a => (a.id === agencyId ? { ...a, status: newStatus } : a)));
    } catch (err) {
      console.error('Agency status update notice:', err);
    } finally {
      setUpdatingId(null);
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

  const normalOrders = orders.filter(o => o.order_type !== 'wholesale');
  const wholesaleOrders = orders.filter(o => o.order_type === 'wholesale');

  const currentList = activeTab === 'normal' ? normalOrders : activeTab === 'wholesale' ? wholesaleOrders : agencies;

  const filteredItems = currentList.filter(item => {
    if (activeTab === 'agencies') {
      const matchesSearch =
        searchQuery === '' ||
        item.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.mobile?.includes(searchQuery);
      return matchesSearch;
    }

    const matchesStatus = filterStatus === 'All' || item.status === filterStatus;
    const matchesSearch =
      searchQuery === '' ||
      item.request_id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.file_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.customer_phone?.includes(searchQuery) ||
      item.client?.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const statCards = [
    { icon: 'print', label: 'Normal Print Orders', value: stats?.normalOrders ?? '—', iconBg: 'var(--primary-fixed)', iconColor: 'var(--primary-container)' },
    { icon: 'inventory_2', label: 'Wholesale Orders', value: stats?.wholesaleOrders ?? '—', iconBg: '#e0f2fe', iconColor: '#0284c7' },
    { icon: 'verified_user', label: 'Pending Verifications', value: stats?.pendingAgencies ?? '—', iconBg: '#fef3c7', iconColor: '#b45309' },
    { icon: 'payments', label: 'Total Revenue', value: stats ? formatCurrency(stats.totalRevenue) : '—', iconBg: '#dcfce7', iconColor: '#166534' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />

      <main style={{ paddingTop: 96, paddingBottom: 64, maxWidth: 1440, margin: '0 auto', paddingLeft: 24, paddingRight: 24 }}>
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 }}>
          <div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fee2e2', color: '#991b1b', padding: '4px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700, marginBottom: 8, letterSpacing: '0.04em' }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>admin_panel_settings</span>
              WINSTAR ADMIN MASTER PANEL
            </div>
            <h1 className="display-lg-mobile" style={{ fontSize: 32 }}>Operations & Print Order Management</h1>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>
              Manage Normal Prints, Wholesale Orders, and Agency Document Verifications in one master dashboard.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-outline btn-sm" onClick={fetchAdminData}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>refresh</span> Refresh Data
            </button>
          </div>
        </div>

        {/* Stat Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
          {statCards.map(c => (
            <StatCard key={c.label} {...c} />
          ))}
        </div>

        {/* 3 Master Flow Tabs */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, borderBottom: '2px solid var(--surface-container)' }}>
          {[
            { id: 'normal', label: `1. NORMAL PRINTS (${normalOrders.length})`, icon: 'print' },
            { id: 'wholesale', label: `2. WHOLESALE ORDERS (${wholesaleOrders.length})`, icon: 'inventory_2' },
            { id: 'agencies', label: `3. AGENCY VERIFICATION (${agencies.length})`, icon: 'domain_verification' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => { setActiveTab(t.id); setFilterStatus('All'); }}
              style={{
                padding: '14px 20px', border: 'none', background: 'none', cursor: 'pointer',
                fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
                color: activeTab === t.id ? 'var(--primary-container)' : 'var(--on-surface-variant)',
                borderBottom: activeTab === t.id ? '3px solid var(--primary-container)' : '3px solid transparent',
                marginBottom: -2, transition: 'all 0.2s',
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 20 }}>{t.icon}</span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Filter / Search bar */}
        <div className="card" style={{ padding: '16px 20px', marginBottom: 20, display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center', justifyContent: 'space-between' }}>
          {activeTab !== 'agencies' ? (
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {['All', ...STATUSES].map(st => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '6px 14px', borderRadius: 'var(--radius-full)',
                    border: filterStatus === st ? '1.5px solid var(--primary-container)' : '1px solid var(--surface-container-high)',
                    background: filterStatus === st ? 'var(--primary-container)' : 'var(--surface-container-lowest)',
                    color: filterStatus === st ? 'var(--on-primary)' : 'var(--on-surface)',
                    fontSize: 12, fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--on-surface)' }}>
              Wholesale Business Applications
            </div>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 320 }}>
            <span className="material-symbols-outlined" style={{ color: 'var(--on-surface-variant)', fontSize: 20 }}>search</span>
            <input
              type="text" className="input" style={{ height: 38, fontSize: 13 }}
              placeholder={activeTab === 'agencies' ? "Search agency or applicant name..." : "Search by Request ID (WSR-...), customer, file..."}
              value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Tab 1 & 2: Orders Tables */}
        {(activeTab === 'normal' || activeTab === 'wholesale') && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <div className="spinner" style={{ width: 36, height: 36, margin: '0 auto 16px' }} />
                <p style={{ color: 'var(--on-surface-variant)' }}>Loading orders...</p>
              </div>
            ) : filteredItems.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--surface-container-high)', marginBottom: 12 }}>inbox</span>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>No orders found</h3>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)' }}>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Request ID & Date</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Customer / Phone</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Service & Specs</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>File / Document</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Delivery</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Amount</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Status</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)', textTransform: 'uppercase' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(ord => (
                      <tr key={ord.id} style={{ borderBottom: '1px solid var(--surface-container-low)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 800, fontSize: 14, fontFamily: 'monospace', color: 'var(--primary-container)' }}>
                            {ord.request_id || ord.id.slice(0, 10)}
                          </div>
                          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 2 }}>
                            {new Date(ord.created_at || ord.$createdAt).toLocaleDateString()}
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 700, fontSize: 14 }}>{ord.customer_name || ord.client?.full_name || 'Customer'}</div>
                          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{ord.customer_phone || ord.client?.mobile || 'N/A'}</div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{ord.service_name || ord.print_type}</div>
                          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>
                            {ord.copies} copy(ies) • {ord.paper_size} ({ord.paper_gsm || 'Standard'})
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          {ord.file_url ? (
                            <a
                              href={ord.file_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="btn btn-outline btn-sm"
                              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, padding: '6px 12px' }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>download</span>
                              DOWNLOAD
                            </a>
                          ) : (
                            <span style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{ord.file_name}</span>
                          )}
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-block', padding: '4px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                            background: ord.delivery_type === 'courier' ? '#fef3c7' : '#f1f5f9',
                            color: ord.delivery_type === 'courier' ? '#b45309' : '#334155',
                          }}>
                            {ord.delivery_type === 'courier' ? 'Courier Delivery' : 'Store Pickup'}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 800, fontSize: 15 }}>{formatCurrency(ord.total_price)}</div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <select
                            value={ord.status}
                            disabled={updatingId === ord.id}
                            onChange={e => handleStatusChange(ord.id, e.target.value)}
                            style={{
                              padding: '6px 10px', borderRadius: 'var(--radius-md)',
                              border: '1.5px solid var(--surface-container-high)', fontWeight: 700, fontSize: 12,
                              background: 'var(--surface-container-lowest)', cursor: 'pointer',
                            }}
                          >
                            {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(ord)}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>visibility</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Agency Verification Table */}
        {activeTab === 'agencies' && (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {agencies.length === 0 ? (
              <div style={{ padding: 60, textAlign: 'center' }}>
                <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--surface-container-high)', marginBottom: 12 }}>verified</span>
                <h3 style={{ fontSize: 18, fontWeight: 700 }}>No Wholesale Applications Yet</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 14 }}>When businesses register on the wholesale portal, their verification documents will show up here.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ background: 'var(--surface-container-low)', borderBottom: '1px solid var(--surface-container)' }}>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>COMPANY / AGENCY</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>APPLICANT & CONTACT</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>GST & ADDRESS</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>VERIFICATION DOCUMENTS</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>STATUS</th>
                      <th style={{ padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>DECISION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredItems.map(ag => (
                      <tr key={ag.id} style={{ borderBottom: '1px solid var(--surface-container-low)' }}>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 800, fontSize: 14 }}>{ag.company_name || 'Agency'}</div>
                          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>Applied: {new Date(ag.created_at || ag.$createdAt).toLocaleDateString()}</div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontWeight: 600, fontSize: 13 }}>{ag.full_name}</div>
                          <div style={{ fontSize: 12, color: 'var(--on-surface-variant)' }}>{ag.email} • {ag.mobile}</div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ fontSize: 12, fontWeight: 600 }}>GST: {ag.gst_number || 'None'}</div>
                          <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', maxWidth: 200 }}>{ag.business_address || 'No address provided'}</div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {ag.visiting_card_url ? (
                              <a href={ag.visiting_card_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ fontSize: 11, padding: '4px 8px' }}>
                                Visiting Card
                              </a>
                            ) : (
                              <span style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>No card</span>
                            )}
                            {ag.business_proof_url && (
                              <a href={ag.business_proof_url} target="_blank" rel="noopener noreferrer" className="btn btn-outline btn-sm" style={{ fontSize: 11, padding: '4px 8px' }}>
                                Proof Doc
                              </a>
                            )}
                          </div>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <span style={{
                            display: 'inline-block', padding: '4px 10px', borderRadius: 999, fontSize: 11, fontWeight: 800, textTransform: 'uppercase',
                            background: ag.status === 'approved' ? '#dcfce7' : ag.status === 'rejected' ? '#fee2e2' : '#fef3c7',
                            color: ag.status === 'approved' ? '#166534' : ag.status === 'rejected' ? '#991b1b' : '#b45309',
                          }}>
                            {ag.status || 'pending'}
                          </span>
                        </td>

                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ background: '#16a34a', borderColor: '#16a34a', fontSize: 12, padding: '4px 10px' }}
                              disabled={updatingId === ag.id || ag.status === 'approved'}
                              onClick={() => handleAgencyVerify(ag.id, 'approved')}
                            >
                              APPROVE
                            </button>
                            <button
                              className="btn btn-outline btn-sm"
                              style={{ color: '#dc2626', borderColor: '#fee2e2', fontSize: 12, padding: '4px 10px' }}
                              disabled={updatingId === ag.id || ag.status === 'rejected'}
                              onClick={() => handleAgencyVerify(ag.id, 'rejected')}
                            >
                              REJECT
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Modal: View Details */}
        {selectedOrder && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
          }}
          onClick={() => setSelectedOrder(null)}
          >
            <div className="card animate-fade-in" style={{ maxWidth: 640, width: '100%', padding: 32, borderRadius: 'var(--radius-xl)' }} onClick={e => e.stopPropagation()}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--primary-container)', textTransform: 'uppercase' }}>
                    JOB CONFIGURATION & DETAILS
                  </div>
                  <h2 className="headline-sm" style={{ fontSize: 22 }}>{selectedOrder.request_id || selectedOrder.id}</h2>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedOrder(null)}>
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 24 }}>
                <div style={{ background: 'var(--surface-container-low)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)' }}>CUSTOMER</div>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{selectedOrder.customer_name} ({selectedOrder.customer_phone})</div>
                </div>
                <div style={{ background: 'var(--surface-container-low)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)' }}>TOTAL ESTIMATED AMOUNT</div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--primary-container)' }}>{formatCurrency(selectedOrder.total_price)}</div>
                </div>
                <div style={{ background: 'var(--surface-container-low)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)' }}>PRINT SPECIFICATION</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedOrder.service_name} • {selectedOrder.copies} copies • {selectedOrder.paper_size}</div>
                </div>
                <div style={{ background: 'var(--surface-container-low)', padding: 12, borderRadius: 'var(--radius-md)' }}>
                  <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)' }}>DELIVERY TYPE</div>
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{selectedOrder.delivery_type === 'courier' ? 'Courier: ' + selectedOrder.delivery_address : 'Store Pickup'}</div>
                </div>
              </div>

              {selectedOrder.file_url && (
                <div style={{ marginBottom: 20 }}>
                  <a
                    href={selectedOrder.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary btn-full"
                    style={{ height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <span className="material-symbols-outlined">download</span> Download Original Client File ({selectedOrder.file_name})
                  </a>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-outline" onClick={() => setSelectedOrder(null)}>Close</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
