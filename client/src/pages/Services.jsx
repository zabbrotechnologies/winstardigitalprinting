import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { supabase } from '../lib/supabase';
import { getLocalOrders } from '../lib/orderService';

const ALL_SERVICES = [
  { title: "Certificates", icon: "military_tech", image: "/images/services/certificates.jpg", description: "High-quality award and certificate printing." },
  { title: "Spiral Binding", icon: "auto_stories", image: "/images/services/spiral-binding.jpg", description: "Professional spiral binding for documents and reports." },
  { title: "Plan Printouts", icon: "print", image: "/images/services/plan-printouts.jpg", description: "High quality large format plan printouts." },
  { title: "Visiting Cards", icon: "badge", image: "/images/services/visiting-cards.png", description: "Premium customized business cards." },
  { title: "A4 Printouts", icon: "file_copy", image: "/images/services/a4-printouts.jpg", description: "Crisp and clear A4 document printing." },
  { title: "Perfect Binding", icon: "menu_book", image: "/images/services/perfect-binding.jpg", description: "Book-like perfect binding for a premium finish." },
  { title: "Brochures", icon: "import_contacts", image: "/images/services/brochures.jpg", description: "Eye-catching tri-fold and bi-fold brochures." },
  { title: "Wiro Binding", icon: "library_books", image: "/images/services/wiro-binding.jpg", description: "Durable and flexible wiro binding." },
  { title: "Soft Binding", icon: "book", image: "/images/services/soft-binding.jpg", description: "Clean soft binding for presentations." },
  { title: "Document OCR", icon: "document_scanner", image: "/images/services/document-ocr.png", description: "Scan and convert documents into editable text." },
  { title: "Rexin Binding", icon: "bookmark", image: "/images/services/rexin-binding.jpg", description: "Classic rexin binding for thesis and reports." },
  { title: "Moroccan Hard Binding", icon: "book_4", image: "/images/services/moroccan-hard-binding.jpg", description: "Premium Moroccan hard binding." },
  { title: "Hard Binding", icon: "library_books", image: "/images/services/hard-binding.jpg", description: "Standard hard binding for maximum durability." }
];

const STATUS_TIMELINE = [
  { status: 'Pending', icon: 'pending', desc: 'Order received and queued for processing' },
  { status: 'Processing', icon: 'autorenew', desc: 'Your job is being printed' },
  { status: 'Printed', icon: 'check_circle', desc: 'Print job complete — quality checked' },
  { status: 'Delivered', icon: 'local_shipping', desc: 'Ready for pickup / delivered' },
];

export default function Services() {
  const trackingRef = useRef(null);
  const [orderId, setOrderId] = useState('');
  const [trackResult, setTrackResult] = useState(null);
  const [trackLoading, setTrackLoading] = useState(false);
  const [trackError, setTrackError] = useState('');

  // Scroll to tracking section if #tracking hash
  useEffect(() => {
    if (window.location.hash === '#tracking' && trackingRef.current) {
      setTimeout(() => trackingRef.current.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, []);

  async function handleTrack(e) {
    e.preventDefault();
    const query = orderId.trim();
    if (!query) return;
    setTrackLoading(true);
    setTrackError('');
    setTrackResult(null);

    try {
      // 1. Try Supabase Orders query
      try {
        const { data: matchedDoc } = await supabase
          .from('orders')
          .select('*')
          .or(`request_id.eq.${query.toUpperCase()},request_id.eq.${query}`)
          .maybeSingle();

        if (matchedDoc) {
          setTrackResult(matchedDoc);
          setTrackLoading(false);
          return;
        }
      } catch (dbErr) {
        console.warn('Supabase tracking lookup notice:', dbErr);
      }

      // 2. Try Local Storage Orders
      const localOrders = getLocalOrders();
      const matched = localOrders.find(
        o => o.id === query || o.request_id?.toUpperCase() === query.toUpperCase()
      );

      if (matched) {
        setTrackResult(matched);
        setTrackLoading(false);
        return;
      }

      throw new Error(`Order "${query}" not found. Please verify your Request ID.`);
    } catch (err) {
      setTrackError(err.message || 'Order not found.');
    } finally {
      setTrackLoading(false);
    }
  }

  const currentStatusIndex = trackResult
    ? STATUS_TIMELINE.findIndex(t => t.status === trackResult.status)
    : -1;

  return (
    <div className="page-content">
      <Navbar />

      {/* Page Header */}
      <section style={{
        paddingTop: 'calc(72px + 64px)', paddingBottom: 64,
        background: 'linear-gradient(135deg, #fff 0%, #fdf2f8 100%)',
        textAlign: 'center',
      }}>
        <div className="container">
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'var(--primary-fixed)', color: 'var(--on-primary-fixed-variant)',
            padding: '6px 16px', borderRadius: 'var(--radius-full)',
            fontSize: 13, fontWeight: 600, marginBottom: 20, letterSpacing: '0.04em',
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: 16 }}>grid_view</span>
            13 Professional Services
          </div>
          <h1 className="display-lg-mobile" style={{ marginBottom: 16 }}>
            Our Printing <span style={{ color: 'var(--primary-container)' }}>Services</span>
          </h1>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: 520, margin: '0 auto' }}>
            From quick photocopies to premium business cards and plan prints — we cover all your document and advertising needs.
          </p>
        </div>
      </section>

      {/* Services Grid (13 Professional Services including Visiting Cards) */}
      <section className="section">
        <div className="container">
          <div className="services-grid">
            {ALL_SERVICES.map(service => (
              <ServiceCard 
                key={service.title} 
                {...service} 
              />
            ))}
          </div>
        </div>
      </section>

      {/* Order Tracking */}
      <section id="tracking" ref={trackingRef} className="section" style={{ background: 'linear-gradient(135deg, #f8f9ff 0%, #fdf2f8 100%)' }}>
        <div className="container" style={{ maxWidth: 680 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="headline-md" style={{ marginBottom: 12 }}>Track Your Order</h2>
            <p className="body-lg" style={{ color: 'var(--on-surface-variant)' }}>
              Enter your Order ID to see real-time status
            </p>
          </div>

          {/* Search */}
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: 12, marginBottom: 40 }}>
            <input
              type="text"
              className="input"
              placeholder="Enter Order ID (e.g., 3a4b5c6d-...)"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit" className="btn btn-primary" disabled={trackLoading} style={{ minWidth: 120 }}>
              {trackLoading
                ? <div className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }} />
                : <><span className="material-symbols-outlined" style={{ fontSize: 18 }}>search</span> Track</>
              }
            </button>
          </form>

          {trackError && (
            <div style={{
              background: 'var(--error-container)', color: 'var(--on-error-container)',
              padding: '14px 18px', borderRadius: 'var(--radius)', marginBottom: 24,
              fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>error</span>
              {trackError}
            </div>
          )}

          {/* Result */}
          {trackResult && (
            <div className="card animate-fade-in" style={{ padding: 32 }}>
              {/* Order info */}
              <div style={{ marginBottom: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                  <div>
                    <h3 className="headline-sm" style={{ fontSize: 18, marginBottom: 4 }}>{trackResult.service_name || trackResult.file_name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--primary-container)', fontFamily: 'monospace', fontWeight: 700 }}>
                      ID: {trackResult.request_id || trackResult.id}
                    </p>
                  </div>
                  <span className={`chip chip-${(trackResult.status || 'pending').toLowerCase()}`}>{trackResult.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 12 }}>
                  {[
                    { label: 'File', value: trackResult.file_name },
                    { label: 'Specification', value: `${trackResult.print_type || 'Standard'} • ${trackResult.paper_size} (${trackResult.paper_gsm || ''})` },
                    { label: 'Copies', value: `${trackResult.copies} copy(ies)` },
                    { label: 'Finishing / Binding', value: trackResult.binding || 'None' },
                    { label: 'Delivery', value: trackResult.delivery_type === 'courier' ? 'Courier Delivery' : 'Store Pickup' },
                    { label: 'Total Amount', value: `₹${parseFloat(trackResult.total_price || 0).toFixed(2)}` },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--surface-container-low)', padding: '12px 14px', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 14, fontWeight: 700 }}>{item.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Status timeline */}
              <div>
                <h4 style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                  Progress
                </h4>
                <div style={{ position: 'relative' }}>
                  {/* Track line */}
                  <div style={{
                    position: 'absolute', left: 20, top: 20, bottom: 20, width: 2,
                    background: 'var(--surface-container-high)',
                  }}>
                    <div style={{
                      position: 'absolute', top: 0, left: 0, right: 0,
                      height: `${(currentStatusIndex / (STATUS_TIMELINE.length - 1)) * 100}%`,
                      background: 'var(--primary-container)',
                      transition: 'height 0.6s ease',
                    }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                    {STATUS_TIMELINE.map((item, i) => {
                      const done = i <= currentStatusIndex;
                      return (
                        <div key={item.status} style={{ display: 'flex', alignItems: 'flex-start', gap: 20, paddingLeft: 0 }}>
                          <div style={{
                            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                            background: done ? 'var(--primary-container)' : 'var(--surface-container-high)',
                            color: done ? 'var(--on-primary)' : 'var(--on-surface-variant)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: done ? '0 0 0 4px rgba(183,0,17,0.12)' : 'none',
                            transition: 'all 0.4s ease',
                            position: 'relative', zIndex: 1,
                          }}>
                            <span className="material-symbols-outlined" style={{ fontSize: 18, fontVariationSettings: done ? "'FILL' 1" : "'FILL' 0" }}>{item.icon}</span>
                          </div>
                          <div style={{ paddingTop: 8 }}>
                            <div style={{ fontSize: 15, fontWeight: 700, color: done ? 'var(--on-surface)' : 'var(--on-surface-variant)', marginBottom: 2 }}>{item.status}</div>
                            <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>{item.desc}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
