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

      <main className="b2b-main-content">
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#fef3c7', color: '#b45309', padding: '6px 16px', borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '0.04em' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>inventory_2</span>
            WINSTAR B2B BULK ORDERING
          </div>
          <h1 className="wholesale-title" style={{ fontSize: 34, marginBottom: 8, lineHeight: 1.2 }}>
            B2B Printing Portal
          </h1>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: 580, margin: '0 auto' }}>
            High-volume print jobs for advertising agencies, photo studios, corporate firms, and resellers.
          </p>
        </div>

        {/* State 1: Guest or Regular User */}
        {!user && (
          <div className="card" style={{ padding: 40, textAlign: 'center', maxWidth: 680, margin: '0 auto 40px', borderRadius: 'var(--radius-xl)' }}>
            <span className="material-symbols-outlined icon-fill" style={{ fontSize: 56, color: 'var(--primary-container)', marginBottom: 16 }}>lock</span>
            <h2 className="headline-sm" style={{ marginBottom: 12 }}>B2B Account Required</h2>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)', marginBottom: 24 }}>
              To access discounted volume rates, courier delivery, and tax invoicing, please log in with your verified B2B account or submit a B2B application.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
              <Link to="/register-wholesale" className="btn btn-primary btn-lg">
                Apply for B2B Account
              </Link>
              <Link to="/auth" className="btn btn-outline btn-lg">
                B2B Login
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
              Your B2B business registration for <strong>{profile?.company_name}</strong> is currently waiting for admin approval.
            </p>
            <p className="body-md" style={{ color: '#b45309' }}>
              You will gain access to B2B volume rates immediately once the Winstar team verifies your documents.
            </p>
          </div>
        )}

        {/* State 3: Approved B2B Agency Card */}
        {isApprovedWholesale && (
          <div className="card" style={{ padding: 36, textAlign: 'center', maxWidth: 720, margin: '0 auto 40px', borderRadius: 'var(--radius-xl)', background: '#f0fdf4', border: '1.5px solid #bbf7d0' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: '#16a34a', color: '#fff', padding: '6px 14px', borderRadius: 999, fontSize: 12, fontWeight: 800, marginBottom: 16 }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
              VERIFIED B2B AGENCY
            </div>
            <h2 className="headline-sm" style={{ marginBottom: 8, color: '#166534' }}>
              Welcome, {profile?.company_name || profile?.full_name}
            </h2>
            <p className="body-md" style={{ color: '#15803d', maxWidth: 540, margin: '0 auto 24px' }}>
              B2B bulk orders and special volume pricing are placed exclusively through your dedicated B2B Dashboard.
            </p>
            <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link to="/dashboard" className="btn btn-primary btn-lg" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <span className="material-symbols-outlined">dashboard</span>
                Go to B2B Dashboard to Place Orders
              </Link>
            </div>
          </div>
        )}

        {/* B2B Info Sections (benefits, how it works, how to apply - ALWAYS VISIBLE) */}
        <div style={{ marginTop: 48 }}>
          {/* Features Section */}
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <h2 className="headline-md" style={{ marginBottom: 12 }}>Wholesale Partnership Benefits</h2>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>Grow your business with premium printing, high discounts, and priority B2B fulfillment.</p>
          </div>

          <div className="services-grid" style={{ marginBottom: 56 }}>
            <div className="card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 40, color: 'var(--primary)', marginBottom: 16 }}>percent</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Lower Pricing Tiers</h3>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>Get access to bulk discounted rates for printing and copies that are significantly cheaper than retail rates.</p>
            </div>
            <div className="card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 40, color: 'var(--primary)', marginBottom: 16 }}>local_shipping</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Courier & Bulk Dispatch</h3>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>Courier dispatch and local doorstep delivery options are available for bulk orders to minimize logistics delays.</p>
            </div>
            <div className="card" style={{ padding: 24, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <span className="material-symbols-outlined icon-fill" style={{ fontSize: 40, color: 'var(--primary)', marginBottom: 16 }}>receipt_long</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Business Tax Invoicing</h3>
              <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>Get valid GST invoices for all print runs to claim business input tax credits easily.</p>
            </div>
          </div>

          {/* How It Works Section */}
          <div style={{ background: 'var(--surface-container-low)', padding: '56px 24px', borderRadius: 'var(--radius-xl)', marginBottom: 56 }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <h2 className="headline-md" style={{ marginBottom: 12 }}>How It Works</h2>
              <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>Get verified and start ordering bulk prints in minutes</p>
            </div>

            <div className="how-it-works-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
              {[
                { step: '01', title: 'Register Agency', icon: 'app_registration', desc: 'Apply online by providing your company info, business proof or visiting card.' },
                { step: '02', title: 'Verification Check', icon: 'verified', desc: 'The Winstar admin team verifies your submission details and activates your wholesale profile.' },
                { step: '03', title: 'Wholesale Ordering', icon: 'local_mall', desc: 'Login to the B2B Portal to configure bulk print jobs and submit orders with your exclusive pricing.' },
              ].map((item, i) => (
                <div key={item.step} style={{ textAlign: 'center', position: 'relative' }}>
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'var(--primary-fixed)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 16px',
                    boxShadow: '0 0 0 8px rgba(183,0,17,0.06)',
                  }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: 24 }}>{item.icon}</span>
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary-container)', marginBottom: 8, textTransform: 'uppercase' }}>Step {item.step}</div>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* How To Apply Section */}
          <div className="card" style={{ padding: 40, background: 'linear-gradient(135deg, var(--primary-fixed) 0%, var(--secondary-container) 100%)', color: 'var(--on-primary-fixed)', borderRadius: 'var(--radius-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
              <div style={{ flex: 1, minWidth: 280 }}>
                <h3 className="headline-sm" style={{ marginBottom: 8, color: 'var(--on-primary-fixed-variant)' }}>Ready to Join Winstar B2B?</h3>
                <p style={{ fontSize: 15, lineHeight: 1.6, opacity: 0.9 }}>
                  If you are an advertising agency, architect firm, design studio, or regular bulk printing customer, apply today. We require a valid business proof such as a company visiting card, GST Certificate, or shop registration document.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/register-wholesale" className="btn btn-primary" style={{ background: 'var(--primary-container)', color: 'var(--on-primary-container)', padding: '12px 24px' }}>
                  Register Business Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
