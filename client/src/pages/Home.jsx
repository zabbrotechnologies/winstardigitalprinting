import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import PrintWizard from '../components/PrintWizard';
import ServiceCard from '../components/ServiceCard';

const SERVICES = [
  { title: "Spiral Binding", icon: "auto_stories", image: "/images/services/spiral-binding.jpg", description: "Professional spiral binding for documents and reports." },
  { title: "Plan Printouts", icon: "print", image: "/images/services/plan-print-outs.jpg", description: "High quality large format plan printouts." },
  { title: "Visiting Cards", icon: "badge", image: "/images/services/business-cards.jpg", description: "Premium customized business cards." },
  { title: "A4 Printouts", icon: "file_copy", image: "/images/services/a4-printouts.jpg", description: "Crisp and clear A4 document printing." },
  { title: "Perfect Binding", icon: "menu_book", image: "/images/services/perfect-binding.webp", description: "Book-like perfect binding for a premium finish." },
  { title: "Brochures", icon: "import_contacts", image: "/images/services/brochures.webp", description: "Eye-catching tri-fold and bi-fold brochures." },
  { title: "Certificates", icon: "military_tech", image: "/images/services/certificates.jpg", description: "High-quality award and certificate printing." },
  { title: "Wiro Binding", icon: "library_books", image: "/images/services/wiro-binding.webp", description: "Durable and flexible wiro binding." },
  { title: "Soft Binding", icon: "book", image: "/images/services/soft-binding.webp", description: "Clean soft binding for presentations." },
  { title: "Document OCR", icon: "document_scanner", image: "/images/services/document-ocr.webp", description: "Scan and convert documents into editable text." },
  { title: "Rexin Binding", icon: "bookmark", image: "/images/services/rexin-binding.webp", description: "Classic rexin binding for thesis and reports." },
  { title: "Moroccan Hard Binding", icon: "book_4", image: "/images/services/moroccan-hard-binding.webp", description: "Premium Moroccan hard binding." },
  { title: "Hard Binding", icon: "library_books", image: "/images/services/hard-binding.webp", description: "Standard hard binding for maximum durability." }
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

      {/* Hero */}
      <section className="hero" style={{
        position: 'relative',
        backgroundImage: 'url("https://images.unsplash.com/photo-1562240020-ce31ccb0fa7d?q=80&w=2000&auto=format&fit=crop")', // commercial printing press
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        padding: '120px 0',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(248, 249, 255, 0.98) 0%, rgba(248, 249, 255, 0.85) 45%, rgba(183, 0, 17, 0.25) 100%)' }} />
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ maxWidth: 700 }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)',
              padding: '6px 16px', borderRadius: 'var(--radius-full)',
              fontSize: 13, fontWeight: 600, marginBottom: 24,
              letterSpacing: '0.04em',
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 16 }}>verified</span>
              Professional Printing · Same Day Pickup
            </div>
            <h1 className="display-lg" style={{ marginBottom: 24, color: 'var(--on-surface)' }}>
              Digital Printing,<br />
              <span style={{ color: 'var(--primary-container)' }}>Made Easy.</span>
            </h1>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: 560, marginBottom: 40 }}>
              Upload your files, configure your options, and get high-quality prints ready for pickup. Trusted by enterprise clients and creative professionals.
            </p>
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
              <a href="#quick-print" className="btn btn-primary btn-lg">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>print</span>
                Start Print
              </a>
              <Link to="/services" className="btn btn-outline btn-lg">
                <span className="material-symbols-outlined" style={{ fontSize: 20 }}>grid_view</span>
                Browse Services
              </Link>
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

      <Footer />
    </div>
  );
}
