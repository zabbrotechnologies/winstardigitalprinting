import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PrintWizard from '../components/PrintWizard';

export default function BulkOrder() {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 48, height: 48 }} />
      </div>
    );
  }

  const isApprovedWholesale = user && profile?.isWholesale && profile?.isApproved;
  const isPendingWholesale = user && profile?.isWholesale && !profile?.isApproved;

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'var(--surface)' }}>
      <Navbar />

      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '120px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            background: '#e0f2fe', color: '#0369a1', padding: '6px 16px',
            borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 700,
            marginBottom: 16, letterSpacing: '0.04em',
            maxWidth: '100%'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>local_shipping</span>
            WINSTAR B2B & WHOLESALE BULK ORDERING
          </div>
          <h1 className="wholesale-title" style={{ fontSize: 34, marginBottom: 8, lineHeight: 1.2 }}>
            Wholesale Printing Portal
          </h1>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: 580, margin: '0 auto' }}>
            High-volume print jobs for advertising agencies, photo studios, corporate firms, and resellers.
          </p>
        </div>

        {/* State 1: Guest or Regular User */}
        {!user && (
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 680, margin: '0 auto 40px', borderRadius: 'var(--radius-xl)' }}>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 56, color: 'var(--primary-container)', marginBottom: 16 }}>lock</span>
            <h2 className="headline-sm" style={{ marginBottom: 12 }}>Wholesale Account Required</h2>
            <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 28 }}>
              To access discounted volume rates, courier delivery, and tax invoicing, please log in with your verified wholesale account or submit an agency application.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/register-wholesale" className="btn btn-primary btn-lg">
                Apply for Wholesale Account
              </Link>
              <Link to="/auth" className="btn btn-outline btn-lg">
                Agency Login
              </Link>
            </div>
          </div>
        )}

        {/* State 2: Pending Approval */}
        {isPendingWholesale && (
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 680, margin: '0 auto 40px', borderRadius: 'var(--radius-xl)', background: '#fffbeb', border: '1px solid #fef3c7' }}>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 56, color: '#d97706', marginBottom: 16 }}>hourglass_top</span>
            <h2 className="headline-sm" style={{ marginBottom: 12, color: '#92400e' }}>Verification Under Review</h2>
            <p className="body-md" style={{ color: '#b45309', marginBottom: 20 }}>
              Your wholesale business registration for <strong>{profile?.company_name}</strong> is currently waiting for admin approval.
            </p>
            <p style={{ fontSize: 13, color: '#78350f' }}>
              You will gain access to wholesale volume rates immediately once the Winstar team verifies your documents.
            </p>
          </div>
        )}

        {/* State 3: Approved Wholesale Order Form */}
        {isApprovedWholesale && (
          <div>
            <div style={{
              background: '#dcfce7', border: '1px solid #bbf7d0', padding: '16px 20px',
              borderRadius: 'var(--radius-lg)', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              marginBottom: 32,
            }}>
              <div>
                <div style={{ fontWeight: 800, fontSize: 15, color: '#166534' }}>
                  ✅ WHOLESALE PRICING TIER ACTIVE ({profile?.company_name})
                </div>
                <div style={{ fontSize: 13, color: '#15803d' }}>
                  GST: {profile?.gst_number || 'N/A'} • Dispatch: {profile?.business_address || 'Store'}
                </div>
              </div>
              <span className="badge" style={{ background: '#16a34a', color: '#fff', padding: '6px 12px', borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                VERIFIED AGENCY
              </span>
            </div>

            <PrintWizard isWholesale={true} />
          </div>
        )}

        {/* If guest or normal user, also offer Quick Print option */}
        {!isApprovedWholesale && (
          <div style={{ marginTop: 60 }}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <h3 className="headline-sm" style={{ fontSize: 22 }}>Standard Retail Print Room</h3>
              <p style={{ color: 'var(--on-surface-variant)' }}>For retail orders without agency registration</p>
            </div>
            <PrintWizard isWholesale={false} />
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
