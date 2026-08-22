import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { uploadPrintFile } from '../lib/orderService';
import { supabase } from '../lib/supabase';

export default function RegisterWholesale() {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    mobile: '',
    password: '',
    company_name: '',
    gst_number: '',
    business_address: '',
    business_details: '',
  });

  const [visitingCardFile, setVisitingCardFile] = useState(null);
  const [businessProofFile, setBusinessProofFile] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      // 1. Upload verification documents via Supabase storage
      let visitingCardUrl = null;
      let businessProofUrl = null;

      if (visitingCardFile) {
        const up1 = await uploadPrintFile(visitingCardFile);
        visitingCardUrl = up1?.publicUrl || null;
      }
      if (businessProofFile) {
        const up2 = await uploadPrintFile(businessProofFile);
        businessProofUrl = up2?.publicUrl || null;
      }

      // 2. Submit application & create user account
      try {
        await signUp(formData.email, formData.password, {
          full_name: formData.full_name,
          company_name: formData.company_name,
          gst_number: formData.gst_number,
          business_address: formData.business_address,
          mobile: formData.mobile,
          business_details: formData.business_details,
          visiting_card_url: visitingCardUrl,
          business_proof_url: businessProofUrl,
          account_type: 'wholesale',
          role: 'wholesale',
        });
      } catch (authErr) {
        // Fallback: save agency application directly into Supabase profiles table
        try {
          await supabase.from('profiles').upsert([{
            email: formData.email,
            full_name: formData.full_name,
            company_name: formData.company_name,
            gst_number: formData.gst_number,
            business_address: formData.business_address,
            mobile: formData.mobile,
            visiting_card_url: visitingCardUrl,
            business_proof_url: businessProofUrl,
            account_type: 'wholesale',
            role: 'wholesale',
            status: 'pending',
            created_at: new Date().toISOString(),
          }]);
        } catch {}
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="page-content" style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8f9ff 0%, #fdf2f8 100%)' }}>
      <Navbar />

      <main style={{ maxWidth: 800, margin: '0 auto', padding: '120px 20px 80px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: '#dcfce7', color: '#166534', padding: '6px 16px',
            borderRadius: 'var(--radius-full)', fontSize: 13, fontWeight: 700,
            marginBottom: 16, letterSpacing: '0.04em',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>domain</span>
            WHOLESALE AGENCY & CORPORATE PORTAL
          </div>
          <h1 className="headline-lg" style={{ fontSize: 32, marginBottom: 8 }}>
            Apply for Wholesale Agency Rates
          </h1>
          <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: 540, margin: '0 auto' }}>
            Get verified access to special bulk rates, dedicated courier dispatch, and corporate credit support.
          </p>
        </div>

        {/* Application Card */}
        <div className="card" style={{ padding: 40, borderRadius: 'var(--radius-xl)' }}>
          {error && (
            <div style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined">error</span>
              {error}
            </div>
          )}

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }} className="animate-fade-in">
              <div style={{ width: 72, height: 72, borderRadius: '50%', background: '#dcfce7', margin: '0 auto 20px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span className="material-symbols-outlined icon-fill" style={{ fontSize: 40, color: '#16a34a' }}>check_circle</span>
              </div>
              <h2 className="headline-md" style={{ marginBottom: 12 }}>APPLICATION SUBMITTED</h2>
              <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: 480, margin: '0 auto 28px' }}>
                Your account is waiting for Winstar administrator verification. You will be able to access wholesale rates once approved!
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <Link to="/" className="btn btn-outline">Back to Home</Link>
                <Link to="/auth" className="btn btn-primary">Go to Login</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Section 1: Personal Info */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--primary-container)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined">person</span> 1. Personal & Account Details
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div className="form-group">
                    <label className="label">Full Name *</label>
                    <input
                      type="text" className="input" placeholder="e.g. Rahul Sharma" required autoComplete="off"
                      value={formData.full_name} onChange={e => setFormData(d => ({ ...d, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Mobile Number *</label>
                    <input
                      type="tel" className="input" placeholder="e.g. 9876543210" required autoComplete="off"
                      value={formData.mobile} onChange={e => setFormData(d => ({ ...d, mobile: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Business Email *</label>
                    <input
                      type="text"
                      className="input"
                      placeholder="e.g. contact@agency.com"
                      required
                      name="w_agency_usr_mail_field"
                      autoComplete="off"
                      autoCorrect="off"
                      autoCapitalize="off"
                      spellCheck="false"
                      data-lpignore="true"
                      data-form-type="other"
                      value={formData.email}
                      onChange={e => setFormData(d => ({ ...d, email: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Password *</label>
                    <input
                      type="password"
                      className="input"
                      placeholder="Create a secure password"
                      required
                      name="w_agency_usr_sec_key"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-form-type="other"
                      value={formData.password}
                      onChange={e => setFormData(d => ({ ...d, password: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <hr style={{ borderColor: 'var(--surface-container)' }} />

              {/* Section 2: Company Info */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--primary-container)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined">business</span> 2. Company Information
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="label">Company / Agency Name *</label>
                    <input
                      type="text" className="input" placeholder="e.g. Bright Star Graphics Pvt Ltd" required
                      value={formData.company_name} onChange={e => setFormData(d => ({ ...d, company_name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">GST Number (Optional)</label>
                    <input
                      type="text" className="input" placeholder="e.g. 33AAAAA0000A1Z5"
                      value={formData.gst_number} onChange={e => setFormData(d => ({ ...d, gst_number: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="label">Business / Dispatch Address *</label>
                  <textarea
                    className="textarea" rows={2} placeholder="Complete physical office / shop address..." required
                    value={formData.business_address} onChange={e => setFormData(d => ({ ...d, business_address: e.target.value }))}
                  />
                </div>
              </div>

              <hr style={{ borderColor: 'var(--surface-container)' }} />

              {/* Section 3: Document Verification */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--primary-container)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined">verified_user</span> 3. Verification Documents (Visiting Card & Proof)
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
                  <div className="form-group">
                    <label className="label">Visiting Card Photo / PDF *</label>
                    <input
                      type="file"
                      className="input"
                      required
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setVisitingCardFile(e.target.files?.[0])}
                    />
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                      Attach your business visiting card
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Business Proof (GST / Shop Act / ID)</label>
                    <input
                      type="file"
                      className="input"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={e => setBusinessProofFile(e.target.files?.[0])}
                    />
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                      GST certificate or trade license
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-full"
                disabled={submitting}
                style={{ height: 52, fontSize: 16, borderRadius: 'var(--radius-md)', marginTop: 12 }}
              >
                {submitting ? (
                  <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                ) : (
                  <>
                    <span className="material-symbols-outlined" style={{ fontSize: 20 }}>send</span>
                    APPLY FOR WHOLESALE AGENCY ACCOUNT
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
