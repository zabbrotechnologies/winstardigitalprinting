import { useState, useEffect } from 'react';

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [preferences, setPreferences] = useState({
    essential: true, // Always true & required
    analytics: true,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already accepted or configured cookies
    const savedConsent = localStorage.getItem('winstar_cookie_consent');
    if (!savedConsent) {
      // Show banner after a slight delay for smooth UX
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    } else {
      try {
        const parsed = JSON.parse(savedConsent);
        if (parsed && typeof parsed === 'object') {
          setPreferences(parsed);
        }
      } catch {
        // fallback
      }
    }

    // Global listener for "Cookie Settings" clicks (e.g. from Footer)
    const handleOpenSettings = () => {
      setShowSettings(true);
      setIsVisible(true);
    };

    window.addEventListener('open-cookie-settings', handleOpenSettings);
    return () => window.removeEventListener('open-cookie-settings', handleOpenSettings);
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = { essential: true, analytics: true, marketing: true, timestamp: new Date().toISOString() };
    localStorage.setItem('winstar_cookie_consent', JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleSavePreferences = () => {
    const customPreferences = { ...preferences, timestamp: new Date().toISOString() };
    localStorage.setItem('winstar_cookie_consent', JSON.stringify(customPreferences));
    setIsVisible(false);
    setShowSettings(false);
  };

  const handleRejectNonEssential = () => {
    const onlyEssential = { essential: true, analytics: false, marketing: false, timestamp: new Date().toISOString() };
    localStorage.setItem('winstar_cookie_consent', JSON.stringify(onlyEssential));
    setPreferences(onlyEssential);
    setIsVisible(false);
    setShowSettings(false);
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Settings Modal */}
      {showSettings && (
        <div style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          backdropFilter: 'blur(6px)',
          zIndex: 10001,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{
            background: '#ffffff',
            color: '#1a202c',
            maxWidth: '560px',
            width: '100%',
            maxHeight: 'calc(100vh - 32px)',
            borderRadius: '16px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Modal Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '20px 24px',
              borderBottom: '1px solid #f1f5f9',
              background: '#ffffff',
              position: 'sticky',
              top: 0,
              zIndex: 2
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="material-symbols-outlined" style={{ color: '#1d4ed8', fontSize: '24px' }}>cookie</span>
                <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, fontFamily: 'var(--font-display, inherit)' }}>
                  Cookie Preferences
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  fontSize: '18px',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  padding: 0
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div style={{
              padding: '20px 24px',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              flex: 1
            }}>
              <p style={{ margin: 0, fontSize: '13.5px', lineHeight: '1.6', color: '#475569' }}>
                We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic. You can customize your cookie preferences below.
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {/* Essential */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Strictly Necessary Cookies</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: '1.4' }}>
                      Required for website functionality, authentication, security, and print job submission.
                    </div>
                  </div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: '#16a34a', background: '#dcfce7', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    Always Active
                  </span>
                </div>

                {/* Analytics */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Performance & Analytics</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: '1.4' }}>
                      Help us analyze visitor traffic and calculate response performance to improve services.
                    </div>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}>
                    <input
                      type="checkbox"
                      checked={preferences.analytics}
                      onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#1d4ed8' }}
                    />
                  </label>
                </div>

                {/* Marketing */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: '12px',
                  padding: '14px 16px',
                  background: '#f8fafc',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#0f172a' }}>Marketing & Preferences</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '3px', lineHeight: '1.4' }}>
                      Used to deliver relevant offers, B2B wholesale rates, and remember user session preferences.
                    </div>
                  </div>
                  <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', flexShrink: 0, marginTop: '2px' }}>
                    <input
                      type="checkbox"
                      checked={preferences.marketing}
                      onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                      style={{ width: '20px', height: '20px', cursor: 'pointer', accentColor: '#1d4ed8' }}
                    />
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div style={{
              display: 'flex',
              gap: '10px',
              justifyContent: 'flex-end',
              padding: '16px 24px',
              borderTop: '1px solid #f1f5f9',
              background: '#ffffff',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                style={{
                  padding: '9px 16px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: '1 1 auto',
                  textAlign: 'center'
                }}
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  flex: '1 1 auto',
                  textAlign: 'center'
                }}
              >
                Save Preferences
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Sticky Cookie Banner */}
      {!showSettings && (
        <aside
          aria-label="Cookie Consent Banner"
          className="cookie-banner-wrapper"
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #e2e8f0',
            boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.12)',
            zIndex: 9999,
            padding: '16px 20px',
            color: '#111827',
            fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)',
            animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{
            maxWidth: '1280px',
            margin: '0 auto',
            width: '100%',
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap'
          }}>
            {/* Notice text */}
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              flex: '1 1 320px',
              minWidth: 0
            }}>
              <span className="material-symbols-outlined" style={{ color: '#1d4ed8', fontSize: '20px', flexShrink: 0, marginTop: '2px' }}>info</span>
              <p style={{
                margin: 0,
                fontSize: '13px',
                lineHeight: '1.5',
                color: '#334155',
                letterSpacing: '-0.01em'
              }}>
                We use cookies to ensure you get the best browsing experience, manage print specifications, and analyze site usage. By clicking “Accept All”, you agree to our cookie policy.
              </p>
            </div>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              flexWrap: 'wrap',
              flexShrink: 0,
              width: 'auto'
            }}
            className="cookie-banner-actions"
            >
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                style={{
                  background: 'transparent',
                  border: '1px solid #cbd5e1',
                  borderRadius: '6px',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 14px',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                Cookie Settings
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                style={{
                  backgroundColor: '#1d4ed8',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '13px',
                  fontWeight: 700,
                  padding: '9px 18px',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(29, 78, 216, 0.2)',
                  transition: 'background-color 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
              >
                Accept All Cookies
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* Keyframe animations */}
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @media (max-width: 600px) {
          .cookie-banner-actions {
            width: 100% !important;
            justifyContent: stretch !important;
          }
          .cookie-banner-actions button {
            flex: 1 1 calc(50% - 6px) !important;
            text-align: center !important;
            justify-content: center !important;
          }
        }
      `}</style>
    </>
  );
}
