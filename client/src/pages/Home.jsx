import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PrintWizard from '../components/PrintWizard';
import ServiceCard from '../components/ServiceCard';
import EquipmentCarousel from '../components/EquipmentCarousel';

const SERVICES = [
  { title: "Spiral Binding", icon: "auto_stories", image: "/images/services/spiral-binding.jpg", description: "Professional spiral binding for documents and reports." },
  { title: "Plan Printouts", icon: "print", image: "/images/services/plan-printouts.jpg", description: "High quality large format plan printouts." },
  { title: "Visiting Cards", icon: "badge", image: "/images/services/visiting-cards.png", description: "Premium customized business cards." },
  { title: "A4 Printouts", icon: "file_copy", image: "/images/services/a4-printouts.jpg", description: "Crisp and clear A4 document printing." },
  { title: "Perfect Binding", icon: "menu_book", image: "/images/services/perfect-binding.jpg", description: "Book-like perfect binding for a premium finish." },
  { title: "Brochures", icon: "import_contacts", image: "/images/services/brochures.jpg", description: "Eye-catching tri-fold and bi-fold brochures." },
  { title: "Certificates", icon: "military_tech", image: "/images/services/certificates.jpg", description: "High-quality award and certificate printing." },
  { title: "Wiro Binding", icon: "library_books", image: "/images/services/wiro-binding.jpg", description: "Durable and flexible wiro binding." },
  { title: "Soft Binding", icon: "book", image: "/images/services/soft-binding.jpg", description: "Clean soft binding for presentations." },
  { title: "Document OCR", icon: "document_scanner", image: "/images/services/document-ocr.webp", description: "Scan and convert documents into editable text." },
  { title: "Rexin Binding", icon: "bookmark", image: "/images/services/rexin-binding.jpg", description: "Classic rexin binding for thesis and reports." },
  { title: "Moroccan Hard Binding", icon: "book_4", image: "/images/services/moroccan-hard-binding.jpg", description: "Premium Moroccan hard binding." },
  { title: "Hard Binding", icon: "library_books", image: "/images/services/hard-binding.jpg", description: "Standard hard binding for maximum durability." }
];

const HOW_IT_WORKS = [
  { step: '01', icon: 'cloud_upload', title: 'Upload Your File', desc: 'Drag & drop or browse for your PDF, DOCX, CorelDRAW (.CDR), PSD, AI, or image file.' },
  { step: '02', icon: 'tune', title: 'Configure Options', desc: 'Choose paper size, quantity, binding, and finish type.' },
  { step: '03', icon: 'shopping_cart', title: 'Place Your Order', desc: 'Review pricing and confirm your print job online.' },
  { step: '04', icon: 'local_shipping', title: 'Ready for Pickup', desc: 'Get notified when your prints are ready.' },
];

export default function Home() {
  return (
    <div className="page-content">
      <Navbar />

      {/* Hero Section (CMYK Print Production Layout) */}
      <section className="hero" style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #ffffff 0%, #f8faff 50%, #fdf2f8 100%)',
        padding: '110px 0 64px',
        overflow: 'hidden',
        borderBottom: '1px solid var(--surface-container-high)',
      }}>
        {/* Subtle Decorative Ambient Splashes */}
        <div style={{
          position: 'absolute', top: -40, right: -40, width: 340, height: 340,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none', filter: 'blur(30px)'
        }} />
        <div style={{
          position: 'absolute', bottom: -40, left: -40, width: 340, height: 340,
          borderRadius: '50%', background: 'radial-gradient(circle, rgba(2,132,199,0.1) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none', filter: 'blur(30px)'
        }} />

        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div className="hero-cmyk-grid">
            {/* Left Content */}
            <div>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: '#fef3c7', color: '#b45309',
                padding: '6px 16px', borderRadius: 'var(--radius-full)',
                fontSize: 13, fontWeight: 700, marginBottom: 20,
                letterSpacing: '0.04em',
              }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
                High-Volume Production Press · Same Day Pickup
              </div>

              <h1 style={{
                marginBottom: 20,
                textTransform: 'uppercase',
                lineHeight: 1,
              }}>
                <div style={{
                  fontSize: 'clamp(28px, 3.6vw, 44px)',
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}>
                  DIGITAL
                </div>
                <div style={{
                  fontSize: 'clamp(52px, 7vw, 92px)',
                  fontWeight: 900,
                  lineHeight: 0.95,
                  letterSpacing: '-0.03em',
                  background: 'linear-gradient(90deg, #009FE3 0%, #0072CE 18%, #7B2CBF 36%, #E6007E 54%, #FF0055 70%, #FF6B00 86%, #FFB600 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                  margin: '4px 0',
                }}>
                  PRINTING
                </div>
                <div style={{
                  fontSize: 'clamp(28px, 3.6vw, 44px)',
                  fontWeight: 900,
                  color: '#0F172A',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1,
                }}>
                  MADE EASY
                </div>
              </h1>

              {/* Sub-headline line */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                flexWrap: 'wrap',
                fontSize: 'clamp(14px, 1.4vw, 17px)',
                fontWeight: 700,
                color: '#475569',
                marginBottom: 24,
              }}>
                <span>High Quality Printing</span>
                <span style={{ color: '#0284c7', fontSize: 18 }}>•</span>
                <span>Fast Service</span>
                <span style={{ color: '#ec4899', fontSize: 18 }}>•</span>
                <span>Best Price</span>
              </div>

              <p className="body-md" style={{ color: 'var(--on-surface-variant)', maxWidth: 500, marginBottom: 32, lineHeight: 1.6 }}>
                Upload your files, configure your options, and get commercial-grade prints, binding, visiting cards, and plans ready on time.
              </p>

              {/* Action Buttons (WhatsApp Us + Start Print + View Our Services) */}
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', alignItems: 'center' }}>
                <a
                  href="https://wa.me/919345046665"
                  target="_blank"
                  rel="noreferrer"
                  className="btn"
                  style={{
                    background: '#25D366', color: '#ffffff',
                    padding: '13px 24px', fontSize: 15, fontWeight: 700,
                    borderRadius: 'var(--radius-full)', display: 'inline-flex',
                    alignItems: 'center', gap: 8, boxShadow: '0 4px 14px rgba(37,211,102,0.3)',
                    border: 'none'
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>chat</span>
                  WhatsApp Us
                </a>

                <a
                  href="#quick-print"
                  className="btn btn-primary"
                  style={{
                    padding: '13px 24px', fontSize: 15, fontWeight: 700,
                    borderRadius: 'var(--radius-full)', display: 'inline-flex',
                    alignItems: 'center', gap: 8,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>print</span>
                  Start Print
                </a>

                <Link
                  to="/services"
                  className="btn btn-outline"
                  style={{
                    padding: '13px 22px', fontSize: 15, fontWeight: 700,
                    borderRadius: 'var(--radius-full)', display: 'inline-flex',
                    alignItems: 'center', gap: 8,
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span>
                  View Our Services
                </Link>
              </div>
            </div>

            {/* Right Side: High Quality Production Press & Print Products Image */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'relative',
                borderRadius: 'var(--radius-xl)',
                overflow: 'hidden',
                boxShadow: '0 20px 40px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.05)',
                border: '1px solid rgba(226,232,240,0.8)',
                background: '#ffffff',
                transition: 'transform 0.3s ease',
              }}>
                <img
                  src="/images/hero-production-press.jpg"
                  alt="Winstar Digital Production Press Machine & Book Samples"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    objectFit: 'cover',
                  }}
                />
              </div>

              {/* Floating Quality Badge */}
              <div style={{
                position: 'absolute', bottom: -14, right: 16,
                background: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(8px)',
                padding: '8px 16px',
                borderRadius: 'var(--radius-full)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                border: '1px solid #e2e8f0',
                display: 'flex', alignItems: 'center', gap: 8,
                fontSize: 12.5, fontWeight: 700, color: '#0F172A',
              }}>
                <span className="material-symbols-outlined" style={{ color: '#ec4899', fontSize: 17 }}>auto_awesome</span>
                <span>Commercial Digital Press · Crisp 2400 DPI</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section" style={{ background: 'var(--surface-container-low)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 56 }}>
            <h2 className="headline-md" style={{ marginBottom: 12 }}>How It Works</h2>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>From upload to pickup in 4 simple steps</p>
          </div>
          <div className="how-it-works-grid">
            {HOW_IT_WORKS.map((item, i) => (
              <div key={item.step} style={{ textAlign: 'center', position: 'relative' }}>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hide-on-compact" style={{
                    position: 'absolute', top: 28, left: '60%', width: '80%',
                    height: 2, background: 'linear-gradient(90deg, var(--primary-container), var(--secondary-container))',
                    opacity: 0.3,
                  }} />
                )}
                <div style={{
                  width: 56, height: 56, borderRadius: '50%',
                  background: 'var(--primary-fixed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px',
                  boxShadow: '0 0 0 8px rgba(183,0,17,0.06)',
                }}>
                  <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: 24 }}>{item.icon}</span>
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', color: 'var(--primary-container)', marginBottom: 8, textTransform: 'uppercase' }}>{item.step}</div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: 'var(--on-surface-variant)', lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Quick Print Wizard */}
      <section id="quick-print" className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="headline-md" style={{ marginBottom: 12 }}>Quick Print</h2>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>Upload, configure, and order — all in one place</p>
          </div>
          <div style={{ maxWidth: 800, margin: '0 auto' }}>
            <PrintWizard />
          </div>
        </div>
      </section>

      {/* Services Preview */}
      <section className="section" style={{ background: 'linear-gradient(135deg, #fff 0%, #fdf2f8 100%)' }}>
        <div className="container">
          <div className="services-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
            <div>
              <h2 className="headline-md" style={{ marginBottom: 8 }}>Quick Pick</h2>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)' }}>Everything you need under one roof</p>
            </div>
            <Link to="/services" className="btn btn-outline">
              View All <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
            </Link>
          </div>
          <div className="services-grid">
            {SERVICES.map(s => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      {/* State-of-the-Art Machinery Carousel (Auto Next) */}
      <EquipmentCarousel />

      <Footer />
    </div>
  );
}
