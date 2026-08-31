import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { uploadPrintFile, saveLocalAgency } from '../lib/orderService';
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

      // 2. Submit application into Supabase Auth & Profiles
      let authUserId = null;
      try {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          options: {
            data: {
              full_name: formData.full_name,
              mobile: formData.mobile,
            },
          },
        });
        if (!authError && authData?.user) {
          authUserId = authData.user.id;
        }
      } catch (authErr) {
        console.warn('Auth sign up notice:', authErr);
      }

      const recordId = authUserId || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `00000000-0000-4000-8000-${Date.now().toString(16).padStart(12, '0')}`);
      const baseRecord = {
        id: recordId,
        email: formData.email.trim().toLowerCase(),
        full_name: formData.full_name,
        company_name: formData.company_name,
        gst_number: formData.gst_number || null,
        business_address: formData.business_address,
        mobile: formData.mobile,
        visiting_card_url: visitingCardUrl,
        business_proof_url: businessProofUrl,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // A. Save to dedicated wholesale_applications table (without role/account_type)
      const { error: wError } = await supabase.from('wholesale_applications').upsert([baseRecord]);
      if (wError) {
        console.error('wholesale_applications save error:', wError);
      }

      // B. Save to profiles table (with role/account_type)
      const profileRecord = {
        ...baseRecord,
        account_type: 'wholesale',
        role: 'wholesale',
      };
      
      const { error: pErr } = await supabase.from('profiles').upsert([profileRecord]);
      if (pErr) {
        // Fallback if profiles insert fails (usually due to FK constraint for anon users)
        await supabase.from('profiles').upsert([{
          id: recordId,
          full_name: formData.full_name,
          company_name: formData.company_name,
          mobile: formData.mobile,
          business_details: JSON.stringify(profileRecord),
          created_at: profileRecord.created_at,
        }]).catch(() => {}); // catch network errors
      }

      // C. Save locally
      saveLocalAgency(profileRecord);

      // 4. Ensure user is logged out immediately so they must wait for admin approval
      await supabase.auth.signOut().catch(() => {});

      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Submission error');
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
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fee2e2', color: '#991b1b', padding: '6px 14px', borderRadius: 999, fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '0.04em' }}>
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>storefront</span>
            B2B & CORPORATE PORTAL
          </div>
          <h1 className="headline-lg wholesale-title" style={{ marginBottom: 8 }}>
            Apply for B2B Rates
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
            <div style={{ textAlign: 'center', padding: '40px 16px' }} className="animate-fade-in">
              <div style={{
                width: 80, height: 80, borderRadius: '50%', background: '#fef3c7', margin: '0 auto 24px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 0 0 12px rgba(245, 158, 11, 0.12)'
              }}>
                <span className="material-symbols-outlined icon-fill" style={{ fontSize: 44, color: '#d97706' }}>hourglass_top</span>
              </div>
              <h2 className="headline-sm" style={{ marginBottom: 12 }}>Application Submitted</h2>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 24 }}>
                Your B2B application for <strong>{formData.company_name}</strong> has been received by Winstar administration.
                <br /><br />
                Our team will review your business proof documents and approve your account shortly. <strong>You will be able to log in once your application is approved.</strong>
              </p>
              <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/auth" className="btn btn-primary btn-lg" style={{ minWidth: 200, justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>login</span>
                  Go to Login Page
                </Link>
                <Link to="/" className="btn btn-outline btn-lg" style={{ minWidth: 160, justifyContent: 'center' }}>
                  Back to Home
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} autoComplete="off" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {/* Section 1: Personal Info */}
              <div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--primary-container)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined">person</span> 1. Personal & Account Details
                </h3>
                <div className="responsive-form-grid" style={{ display: 'grid', gap: 16 }}>
                  <div className="form-group">
                    <label className="label">Full Name *</label>
                    <input
                      type="text" className="input" placeholder="e.g. John Doe" required autoComplete="off"
                      value={formData.full_name} onChange={e => setFormData(d => ({ ...d, full_name: e.target.value }))}
                    />
                  </div>
                  <div className="form-group">
                    <label className="label">Mobile Number *</label>
                    <input
                      type="tel" className="input" placeholder="e.g. 1234567890" required autoComplete="off"
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
                <div className="responsive-form-grid" style={{ display: 'grid', gap: 16, marginBottom: 16 }}>
                  <div className="form-group">
                    <label className="label">Company / Agency Name *</label>
                    <input
                      type="text" className="input" placeholder="e.g. Acme Corporation" required
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
                <div className="responsive-form-grid" style={{ display: 'grid', gap: 20 }}>
                  <div className="form-group">
                    <label className="label">Visiting Card Photo / PDF / CDR *</label>
                    <input
                      type="file"
                      className="input"
                      required
                      accept=".pdf,.jpg,.jpeg,.png,.cdr"
                      onChange={e => setVisitingCardFile(e.target.files?.[0])}
                    />
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                      Attach your business visiting card (PDF, JPG, PNG, CDR)
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="label">Business Proof (GST / Shop Act / ID / CDR)</label>
                    <input
                      type="file"
                      className="input"
                      accept=".pdf,.jpg,.jpeg,.png,.cdr"
                      onChange={e => setBusinessProofFile(e.target.files?.[0])}
                    />
                    <div style={{ fontSize: 12, color: 'var(--on-surface-variant)', marginTop: 4 }}>
                      GST certificate or trade license (PDF, JPG, PNG, CDR)
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
                    APPLY FOR B2B ACCOUNT
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
