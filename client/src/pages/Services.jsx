import { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ServiceCard from '../components/ServiceCard';
import { supabase } from '../lib/supabase';
import { getLocalOrders } from '../lib/orderService';

const ALL_SERVICES = [
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

const VISITING_CARD_TYPES = [
  {
    title: "Art Board",
    desc: "300 GSM Standard Card Board (Semi-gloss / Matte texture)",
    image: "https://images.unsplash.com/photo-1549221530-56276904e248?auto=format&fit=crop&q=80&w=800",
    prices: [
      { qty: 120, single: 130, double: 180 },
      { qty: 150, single: 150, double: 200 },
      { qty: 200, single: 175, double: 250 },
      { qty: 300, single: 225, double: 325 },
      { qty: 510, single: 340, double: 490 },
      { qty: 720, single: 450, double: 660 },
      { qty: 1020, single: 600, double: 900 }
    ]
  },
  {
    title: "Art Board with Lamination",
    desc: "Premium Laminated Art Board (Glossy or Matte finish for extra durability)",
    image: "https://images.unsplash.com/photo-1626785774573-4b799315345d?auto=format&fit=crop&q=80&w=800",
    prices: [
      { qty: 120, single: 180, double: 230 },
      { qty: 150, single: 200, double: 250 },
      { qty: 200, single: 225, double: 335 },
      { qty: 300, single: 285, double: 445 },
      { qty: 510, single: 450, double: 700 },
      { qty: 720, single: 600, double: 950 },
      { qty: 1020, single: 800, double: 1300 }
    ]
  },
  {
    title: "Metallic & Special Boards",
    desc: "Metallic Gold & Silver, Needle Point, Texture, Linen, and Special Boards",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
    prices: [
      { qty: 120, single: 190, double: 260 },
      { qty: 150, single: 225, double: 300 },
      { qty: 200, single: 275, double: 375 },
      { qty: 300, single: 375, double: 500 },
      { qty: 510, single: 575, double: 775 },
      { qty: 720, single: 785, double: 1055 },
      { qty: 1020, single: 1100, double: 1455 }
    ]
  },
  {
    title: "Synthetic White 125 Micron",
    desc: "Non-tearable Waterproof White Plastic Cards (Lightweight 125 mic)",
    image: "https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&q=80&w=800",
    prices: [
      { qty: 120, single: 200, double: 285 },
      { qty: 150, single: 235, double: 335 },
      { qty: 200, single: 305, double: 435 },
      { qty: 300, single: 410, double: 585 },
      { qty: 510, single: 655, double: 935 },
      { qty: 720, single: 900, double: 1285 },
      { qty: 1020, single: 1250, double: 1785 }
    ]
  },
  {
    title: "Syn. White 200 Mic / Syn. Gold & Silver 125 Mic",
    desc: "Thicker 200 Mic Synthetic White or Premium 125 Mic Metallic Gold & Silver",
    image: "https://images.unsplash.com/photo-1508289656422-b88a87f13c21?auto=format&fit=crop&q=80&w=800",
    prices: [
      { qty: 120, single: 290, double: 435 },
      { qty: 150, single: 345, double: 445 },
      { qty: 200, single: 455, double: 675 },
      { qty: 300, single: 620, double: 915 },
      { qty: 510, single: 1000, double: 1475 },
      { qty: 720, single: 1400, double: 2050 },
      { qty: 1020, single: 1950, double: 2850 }
    ]
  }
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
  const [selectedService, setSelectedService] = useState(null);

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
            {selectedService === 'Visiting Cards' ? "Visiting Card Material Range" : "13 Professional Services"}
          </div>
          <h1 className="display-lg-mobile" style={{ marginBottom: 16 }}>
            {selectedService === 'Visiting Cards' ? (
              <>Visiting Card <span style={{ color: 'var(--primary-container)' }}>Price List</span></>
            ) : (
              <>Our Printing <span style={{ color: 'var(--primary-container)' }}>Services</span></>
            )}
          </h1>
          <p className="body-lg" style={{ color: 'var(--on-surface-variant)', maxWidth: 520, margin: '0 auto' }}>
            {selectedService === 'Visiting Cards' 
              ? "Select from our premium selection of Art Boards, Metallic layers, and Synthetic waterproof options."
              : "From quick photocopies to premium photo prints — we cover all your document needs."
            }
          </p>
        </div>
      </section>

      {/* Dynamic Services / Visiting Cards Grid */}
      <section className="section">
        <div className="container">
          {selectedService === 'Visiting Cards' ? (
            <div>
              {/* Back Button */}
              <button 
                onClick={() => setSelectedService(null)}
                className="btn btn-outline"
                style={{ marginBottom: 32, gap: 8, display: 'inline-flex', alignItems: 'center' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_back</span>
                Back to All Services
              </button>

              {/* Visiting Cards Sub-Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 24 }}>
                {VISITING_CARD_TYPES.map(card => (
                  <div 
                    key={card.title} 
                    className="card animate-fade-in" 
                    style={{ 
                      padding: 24, 
                      borderRadius: 'var(--radius-xl)', 
                      backgroundImage: `linear-gradient(to bottom, rgba(255, 255, 255, 0.96), rgba(255, 255, 255, 0.98)), url(${card.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      boxShadow: 'var(--shadow-lg)',
                      border: '1px solid var(--outline-variant)',
                      display: 'flex',
                      flexDirection: 'column'
                    }}
                  >
                    <div style={{ marginBottom: 16 }}>
                      <h3 className="headline-sm" style={{ color: 'var(--primary)', marginBottom: 6, fontSize: 19 }}>{card.title}</h3>
                      <p style={{ fontSize: 12, color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>{card.desc}</p>
                    </div>

                    {/* Table */}
                    <div style={{ overflowX: 'auto', background: 'rgba(255, 255, 255, 0.7)', borderRadius: 'var(--radius-md)', padding: 12, border: '1px solid var(--surface-container)' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: '1.5px solid var(--outline)', textAlign: 'left', fontWeight: 700, color: 'var(--on-surface)' }}>
                            <th style={{ padding: '8px 4px' }}>Qty</th>
                            <th style={{ padding: '8px 4px' }}>Single Side</th>
                            <th style={{ padding: '8px 4px' }}>Front & Back</th>
                          </tr>
                        </thead>
                        <tbody>
                          {card.prices.map((p, idx) => (
                            <tr key={idx} style={{ borderBottom: '1px solid var(--surface-container)', color: 'var(--on-surface-variant)' }}>
                              <td style={{ padding: '8px 4px', fontWeight: 600 }}>{p.qty}</td>
                              <td style={{ padding: '8px 4px' }}>₹{p.single}</td>
                              <td style={{ padding: '8px 4px' }}>₹{p.double}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="services-grid">
              {ALL_SERVICES.map(service => (
                <ServiceCard 
                  key={service.title} 
                  {...service} 
                  onClick={() => service.title === 'Visiting Cards' ? setSelectedService('Visiting Cards') : null}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Pricing Banner */}
      <section style={{ background: 'var(--inverse-surface)', padding: '64px 40px', textAlign: 'center' }}>
        <div className="container">
          <h2 className="headline-md" style={{ color: 'var(--inverse-on-surface)', marginBottom: 12 }}>
            Transparent Pricing
          </h2>
          <p style={{ color: 'var(--surface-variant)', fontSize: 16, marginBottom: 40 }}>
            No hidden fees. Pay only for what you print.
          </p>
          <div className="pricing-grid" style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: 'B&W Print', price: '₹2/page', sub: 'A4 size' },
              { label: 'Color Print', price: '₹10/page', sub: 'A4 size' },
              { label: 'Photo Print', price: '₹25/page', sub: '4×6 glossy' },
              { label: 'Lamination', price: '₹15/page', sub: 'Matte or Gloss' },
              { label: 'Spiral Binding', price: '₹40/doc', sub: 'Up to 150 pages' },
            ].map(p => (
              <div key={p.label} style={{
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: 'var(--radius-lg)', padding: '24px 28px', minWidth: 140,
              }}>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 800, color: 'var(--secondary-container)', marginBottom: 4 }}>{p.price}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--inverse-on-surface)' }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--surface-variant)', marginTop: 2 }}>{p.sub}</div>
              </div>
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
                    <h3 className="headline-sm" style={{ fontSize: 18, marginBottom: 4 }}>{trackResult.file_name}</h3>
                    <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', fontFamily: 'monospace' }}>
                      #{trackResult.id.slice(0, 16)}…
                    </p>
                  </div>
                  <span className={`chip chip-${trackResult.status.toLowerCase()}`}>{trackResult.status}</span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  {[
                    { label: 'Type', value: trackResult.print_type },
                    { label: 'Copies', value: trackResult.copies },
                    { label: 'Size', value: trackResult.paper_size },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'var(--surface-container-low)', padding: '12px 14px', borderRadius: 'var(--radius)' }}>
                      <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--on-surface-variant)', marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 700, textTransform: 'capitalize' }}>{item.value}</div>
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
