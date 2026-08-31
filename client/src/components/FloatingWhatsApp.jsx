import { useState } from 'react';

const WINSTAR_PHONE = '919345046665';

export default function FloatingWhatsApp() {
  const [hovered, setHovered] = useState(false);

  const defaultMessage = encodeURIComponent(
    'Hello Winstar Digital Printing, I have an inquiry regarding printing services.'
  );
  const whatsappUrl = `https://wa.me/${WINSTAR_PHONE}?text=${defaultMessage}`;

  return (
    <aside aria-label="Floating WhatsApp Action">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat with Winstar on WhatsApp"
        className="floating-whatsapp-btn"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 999,
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
          color: '#ffffff',
          borderRadius: '50px',
          padding: hovered ? '12px 20px 12px 14px' : '14px',
          boxShadow: '0 8px 24px rgba(37, 211, 102, 0.4), 0 2px 8px rgba(0,0,0,0.12)',
          textDecoration: 'none',
          cursor: 'pointer',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: hovered ? 'scale(1.05) translateY(-2px)' : 'scale(1)',
        }}
      >
        {/* WhatsApp Official SVG Logo */}
        <svg
          viewBox="0 0 32 32"
          width="32"
          height="32"
          fill="#ffffff"
          style={{ flexShrink: 0 }}
        >
          <path d="M16 2.5C8.544 2.5 2.5 8.544 2.5 16c0 2.657.772 5.13 2.102 7.218L3 29l6.004-1.574A13.435 13.435 0 0 0 16 29.5c7.456 0 13.5-6.044 13.5-13.5S23.456 2.5 16 2.5zm7.848 18.96c-.328.92-1.636 1.764-2.678 1.988-.71.152-1.638.274-4.757-1.02-3.985-1.654-6.55-5.69-6.748-5.955-.194-.264-1.616-2.15-1.616-4.1 0-1.95 1.02-2.91 1.382-3.308.362-.398.79-.498 1.054-.498.264 0 .528.002.76.014.246.012.576-.094.9.686.33.794 1.124 2.74 1.222 2.94.098.2.164.432.032.696-.13.264-.196.43-.39.66-.196.23-.41.512-.586.688-.196.196-.4.41-.172.802.228.392 1.014 1.672 2.176 2.708 1.494 1.332 2.754 1.744 3.146 1.94.392.196.622.164.852-.1.23-.264.984-1.15 1.248-1.544.264-.394.528-.328.888-.196.36.132 2.296 1.082 2.692 1.28.396.198.66.296.758.462.098.166.098.96-.23 1.88z"/>
        </svg>

        {/* Expandable text label on hover */}
        <span
          style={{
            fontWeight: 700,
            fontSize: '14px',
            whiteSpace: 'nowrap',
            letterSpacing: '0.02em',
            display: hovered ? 'inline-block' : 'none',
            transition: 'opacity 0.2s ease',
          }}
        >
          Chat with Us
        </span>
      </a>
    </aside>
  );
}
