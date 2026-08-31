import { useState } from 'react';

const WINSTAR_PHONE = '919345046665';

export default function FloatingWhatsApp() {
  const [hovered, setHovered] = useState(false);

  const handleClick = () => {
    const text = encodeURIComponent(
      'Hello Winstar Digital Printing & Xerox! I would like to inquire about your printing services and custom orders.'
    );
    window.open(`https://wa.me/${WINSTAR_PHONE}?text=${text}`, '_blank');
  };

  return (
    <div
      className="floating-whatsapp-container"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9998,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}
    >
      {/* Tooltip / Label */}
      <span
        style={{
          background: '#1f2937',
          color: '#ffffff',
          padding: '6px 12px',
          borderRadius: '20px',
          fontSize: '13px',
          fontWeight: 600,
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          whiteSpace: 'nowrap',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateX(0)' : 'translateX(10px)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          display: 'none',
        }}
        className="whatsapp-tooltip"
      >
        Chat on WhatsApp
      </span>

      {/* Floating Button */}
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        aria-label="Contact Winstar on WhatsApp"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#25D366',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4), 0 2px 6px rgba(0,0,0,0.15)',
          transform: hovered ? 'scale(1.08) translateY(-2px)' : 'scale(1)',
          transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
          position: 'relative',
        }}
      >
        {/* SVG WhatsApp Logo */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="#ffffff"
        >
          <path d="M16 2C8.268 2 2 8.268 2 16c0 2.766.804 5.342 2.193 7.514L2.24 29.76l6.452-1.898A13.924 13.924 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.64c-2.316 0-4.48-.68-6.3-1.85l-.45-.29-4.22 1.24 1.25-4.11-.3-.47A11.583 11.583 0 0 1 4.36 16c0-6.42 5.22-11.64 11.64-11.64 6.42 0 11.64 5.22 11.64 11.64 0 6.42-5.22 11.64-11.64 11.64zm6.44-8.77c-.35-.18-2.09-1.03-2.41-1.15-.33-.12-.56-.18-.8.18s-.92 1.15-1.13 1.38c-.21.24-.42.27-.77.09s-1.48-.55-2.82-1.74c-1.04-.93-1.74-2.08-1.95-2.43-.21-.36-.02-.55.15-.72.16-.16.35-.42.53-.63.18-.21.24-.36.36-.6.12-.24.06-.45-.03-.63-.09-.18-.8-1.93-1.1-2.64-.29-.7-.59-.6-.8-.61h-.69c-.24 0-.63.09-.96.45-.33.36-1.26 1.23-1.26 3 0 1.77 1.29 3.48 1.47 3.72.18.24 2.54 3.88 6.16 5.44.86.37 1.53.59 2.06.76.87.28 1.66.24 2.28.15.7-.1 2.09-.85 2.38-1.68.3-.82.3-1.53.21-1.68-.09-.15-.33-.24-.68-.42z" />
        </svg>

        {/* Online indicator */}
        <span
          style={{
            position: 'absolute',
            top: '2px',
            right: '2px',
            width: '12px',
            height: '12px',
            backgroundColor: '#10b981',
            borderRadius: '50%',
            border: '2px solid #ffffff',
          }}
        />
      </button>

      <style>{`
        @media (min-width: 768px) {
          .whatsapp-tooltip {
            display: block !important;
          }
        }
        @media (max-width: 480px) {
          .floating-whatsapp-container {
            bottom: 20px !important;
            right: 16px !important;
          }
        }
      `}</style>
    </div>
  );
}
