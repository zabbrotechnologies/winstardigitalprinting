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
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(4px)',
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
            borderRadius: '12px',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.2), 0 10px 10px -5px rgba(0, 0, 0, 0.1)',
            padding: '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '20px',
            position: 'relative'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, fontFamily: 'var(--font-display, inherit)' }}>
                Cookie Preferences
              </h3>
              <button
                type="button"
                onClick={() => setShowSettings(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: '#64748b',
                  display: 'flex',
                  alignItems: 'center',
                  padding: '4px'
                }}
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            <p style={{ margin: 0, fontSize: '14px', lineHeight: '1.6', color: '#475569' }}>
              We use cookies to enhance your browsing experience, provide personalized content, and analyze our traffic. You can customize your cookie preferences below.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Essential */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ paddingRight: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Strictly Necessary Cookies</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Required for the website to function properly (authentication, security, cart).
                  </div>
                </div>
                <span style={{ fontSize: '12px', fontWeight: 600, color: '#16a34a', background: '#dcfce7', padding: '4px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                  Always Active
                </span>
              </div>

              {/* Analytics */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ paddingRight: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Performance & Analytics</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Help us understand how visitors interact with the website to improve performance.
                  </div>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(e) => setPreferences({ ...preferences, analytics: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1d4ed8' }}
                  />
                </label>
              </div>

              {/* Marketing */}
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                padding: '12px 16px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ paddingRight: '16px' }}>
                  <div style={{ fontWeight: 600, fontSize: '14px', color: '#0f172a' }}>Marketing & Preferences</div>
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                    Used to deliver relevant offers and remember user preferences.
                  </div>
                </div>
                <label style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(e) => setPreferences({ ...preferences, marketing: e.target.checked })}
                    style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#1d4ed8' }}
                  />
                </label>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleRejectNonEssential}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #cbd5e1',
                  background: '#ffffff',
                  color: '#334155',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Reject Non-Essential
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                style={{
                  padding: '8px 18px',
                  borderRadius: '6px',
                  border: 'none',
                  background: '#1d4ed8',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer'
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
          style={{
            position: 'fixed',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: '#ffffff',
            borderTop: '1px solid #000000',
            boxShadow: '0 -4px 16px rgba(0, 0, 0, 0.08)',
            zIndex: 9999,
            padding: '18px 24px',
            color: '#111827',
            fontFamily: 'var(--font-body, system-ui, -apple-system, sans-serif)',
            display: 'flex',
            flexDirection: 'column',
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
            gap: '24px',
            flexWrap: 'wrap'
          }}>
            {/* Notice text */}
            <p style={{
              margin: 0,
              fontSize: '13.5px',
              lineHeight: '1.55',
              color: '#1f2937',
              flex: '1 1 500px',
              letterSpacing: '-0.01em'
            }}>
              This website uses cookies to provide the optimal experience to visitors as well as to gather insight on site usage. By clicking “Accept All Cookies” you agree to the storing of cookies on your device for the best performance of this website and to analyze site usage.
            </p>

            {/* Action buttons */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'nowrap',
              flexShrink: 0
            }}>
              <button
                type="button"
                onClick={() => setShowSettings(true)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#111827',
                  fontSize: '13.5px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  padding: '8px 12px',
                  textDecoration: 'none',
                  transition: 'color 0.2s',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
              >
                Cookies Settings
              </button>

              <button
                type="button"
                onClick={handleAcceptAll}
                style={{
                  backgroundColor: '#0c5adb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '2px',
                  fontSize: '13.5px',
                  fontWeight: 700,
                  padding: '10px 20px',
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                  transition: 'background-color 0.15s ease',
                  whiteSpace: 'nowrap'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#0945a8')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#0c5adb')}
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
      `}</style>
    </>
  );
}
