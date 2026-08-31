import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrder, uploadPrintFile } from '../lib/orderService';

const WINSTAR_PHONE = '919345046665'; // Winstar WhatsApp support number

const PRINT_TYPES = [
  { value: 'bw', label: 'B&W Printing', icon: 'description', price: 2.00, wholesalePrice: 1.20 },
  { value: 'color', label: 'Full HD Colour', icon: 'palette', price: 10.00, wholesalePrice: 6.00 },
  { value: 'business_card', label: 'Visiting / Business Cards', icon: 'badge', price: 250.00, wholesalePrice: 180.00 },
  { value: 'brochure', label: 'Brochures / Flyers', icon: 'auto_stories', price: 15.00, wholesalePrice: 9.00 },
  { value: 'photo', label: 'Photo Printing', icon: 'photo_library', price: 25.00, wholesalePrice: 16.00 },
  { value: 'xerox', label: 'Xerox / Photocopy', icon: 'print', price: 1.50, wholesalePrice: 0.90 },
  { value: 'lamination', label: 'Lamination', icon: 'layers', price: 15.00, wholesalePrice: 10.00 },
  { value: 'stickers', label: 'Stickers & Labels', icon: 'style', price: 25.00, wholesalePrice: 18.00 },
  { value: 'wide_format', label: 'Wide Format', icon: 'print', price: 150.00, wholesalePrice: 110.00 },
  { value: 'invitations', label: 'Invitations', icon: 'contact_mail', price: 40.00, wholesalePrice: 28.00 },
  { value: 'certificates', label: 'Certificates', icon: 'military_tech', price: 50.00, wholesalePrice: 35.00 },
  { value: 'id_cards', label: 'ID Cards', icon: 'badge', price: 60.00, wholesalePrice: 45.00 },
  { value: 'menu_cards', label: 'Menu Cards', icon: 'restaurant_menu', price: 35.00, wholesalePrice: 25.00 },
  { value: 'letter_head', label: 'Letter Head', icon: 'draft', price: 8.00, wholesalePrice: 5.00 },
  { value: 'magazines', label: 'Magazines', icon: 'menu_book', price: 200.00, wholesalePrice: 140.00 },
];

const PAPER_SIZES = ['A4', 'A3', 'A5', '12x18 (Digital)', 'Letter', 'Legal'];

const PAPER_SIZE_MULTS = {
  'A4': 1.0,
  'A3': 2.0, // A3 is double surface
  'A5': 0.6,
  '12x18 (Digital)': 2.4,
  'Letter': 1.0,
  'Legal': 1.2,
};

const SHEET_TYPES = [
  { value: 'bond', label: 'Standard Maplitho / Bond Paper', mult: 1.0 },
  { value: 'gloss_art', label: 'Gloss Art Sheet', mult: 1.25 },
  { value: 'matte_art', label: 'Matte Art Paper / Board', mult: 1.25 },
  { value: 'ivory_board', label: 'Heavy Ivory Board', mult: 1.5 },
  { value: 'metallic', label: 'Metallic / Pearl Board', mult: 2.0 },
  { value: 'sticker_sheet', label: 'Self-Adhesive Sticker Sheet', mult: 1.8 },
  { value: 'tracing', label: 'Tracing / Gateway Sheet', mult: 1.6 },
];

const GSM_OPTIONS = [
  { value: '70 GSM', label: '70 GSM (Economy)', mult: 1.0 },
  { value: '80 GSM', label: '80 GSM (Standard)', mult: 1.1 },
  { value: '100 GSM', label: '100 GSM (Executive)', mult: 1.3 },
  { value: '130 GSM', label: '130 GSM (Gloss/Matte Art)', mult: 1.6 },
  { value: '250 GSM', label: '250 GSM (Cardstock)', mult: 2.2 },
  { value: '300 GSM', label: '300 GSM (Premium Board)', mult: 2.6 },
];

const BINDINGS = [
  { value: 'none', label: 'No Binding', price: 0 },
  { value: 'staple', label: 'Corner Staple (+₹5)', price: 5 },
  { value: 'spiral', label: 'Spiral Binding (+₹35)', price: 35 },
  { value: 'wiro', label: 'Wiro Binding (+₹50)', price: 50 },
  { value: 'hardcover', label: 'Hardcover Book (+₹150)', price: 150 },
];

const CUTTING_CHARGES = {
  business_card: 50, // ₹50 cutting charges for visiting cards
};

const COURIER_CHARGE = 30; // ₹30 courier charge

export default function PrintWizard({ isWholesale = false }) {
  const { user, profile, getAccessToken } = useAuth();
  const fileInputRef = useRef(null);

  const [step, setStep] = useState(1);
  const [file, setFile] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [error, setError] = useState('');

  const isWholesaleActive = isWholesale || (profile?.isWholesale && profile?.isApproved);

  // Customer contact info (auto-filled for B2B or guest entered)
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState('');

  const [config, setConfig] = useState({
    print_type: 'bw',
    copies: 1,
    paper_size: 'A4',
    paper_gsm: '80 GSM',
    sheet_type: 'bond',
    binding: 'none',
    double_sided: false,
    finish: 'Standard',
  });

  // Sync profile details when available (especially for B2B / Wholesale)
  useEffect(() => {
    if (isWholesaleActive && profile) {
      const b2bName = profile.company_name
        ? `${profile.company_name} (${profile.full_name || 'Agency'})`
        : profile.full_name || '';
      setCustomerName(b2bName);
      setCustomerPhone(profile.mobile || '');
      setDeliveryAddress(profile.business_address || '');
    } else if (profile) {
      if (!customerName) setCustomerName(profile.full_name || '');
      if (!customerPhone) setCustomerPhone(profile.mobile || '');
      if (!deliveryAddress) setDeliveryAddress(profile.business_address || '');
    }
  }, [profile, isWholesaleActive]);

  function getCalculatedPrice() {
    const item = PRINT_TYPES.find(t => t.value === config.print_type) || PRINT_TYPES[0];
    const baseUnitRate = isWholesaleActive ? item.price * 0.75 : item.price;
    const sizeMult = PAPER_SIZE_MULTS[config.paper_size] || 1.0;
    const gsmMult = GSM_OPTIONS.find(g => g.value === config.paper_gsm)?.mult || 1.0;
    const sheetMult = SHEET_TYPES.find(s => s.value === config.sheet_type)?.mult || 1.0;
    const sideMult = config.double_sided ? 1.8 : 1.0;
    const bindingCost = BINDINGS.find(b => b.value === config.binding)?.price || 0;

    // Cutting charges for visiting card
    const cuttingCost = config.print_type === 'business_card' ? (CUTTING_CHARGES.business_card || 50) : 0;

    // Courier charges: ₹30 if courier selected, ₹0 if pickup
    const courierCost = deliveryType === 'courier' ? COURIER_CHARGE : 0;

    // Base printing subtotal
    const printingSubtotal = (baseUnitRate * sizeMult * gsmMult * sheetMult * sideMult * config.copies) + bindingCost;
    const subtotal = printingSubtotal + cuttingCost;

    let gst = 0;
    let grandTotal = 0;

    if (isWholesaleActive) {
      // B2B Wholesale
      gst = subtotal * 0.18;
      grandTotal = Math.round(subtotal + gst + courierCost);
    } else {
      // Normal Print: GST must NOT be applied (GST = 0)
      // Final Amount = Subtotal + Courier Charges (if selected)
      gst = 0;
      grandTotal = Math.round(subtotal + courierCost);
    }

    return {
      printingSubtotal: printingSubtotal.toFixed(2),
      cuttingCost: cuttingCost.toFixed(2),
      courierCost: courierCost.toFixed(2),
      subtotal: subtotal.toFixed(2),
      gst: gst.toFixed(2),
      grandTotal: grandTotal.toFixed(2),
    };
  }

  async function handleFileSelect(selectedFile) {
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setUploading(true);

    try {
      const uploaded = await uploadPrintFile(selectedFile);
      setUploadedFile(uploaded);
    } catch (err) {
      console.warn('Upload error:', err);
    } finally {
      setUploading(false);
    }
  }

  async function handlePlaceOrder(e) {
    e?.preventDefault();

    const finalName = customerName || (isWholesaleActive ? (profile?.company_name || profile?.full_name || 'B2B Wholesale Agency') : '');
    const finalPhone = customerPhone || (isWholesaleActive ? (profile?.mobile || '') : '');

    if (!finalName || !finalPhone) {
      setError('Please provide your Name and WhatsApp Mobile Number.');
      return;
    }

    if (deliveryType === 'courier' && !deliveryAddress) {
      setError('Please provide a complete courier dispatch address.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const token = await getAccessToken();
      const prices = getCalculatedPrice();

      const sheetTypeObj = SHEET_TYPES.find(s => s.value === config.sheet_type);

      const payload = {
        customer_name: finalName,
        customer_phone: finalPhone,
        customer_email: profile?.email || user?.email || '',
        service_name: PRINT_TYPES.find(t => t.value === config.print_type)?.label,
        file_name: uploadedFile?.fileName || file?.name || 'print-file.pdf',
        file_url: uploadedFile?.publicUrl || '',
        file_id: uploadedFile?.fileId || '',
        ...config,
        sheet_type_label: sheetTypeObj?.label || config.sheet_type,
        cutting_charges: prices.cuttingCost,
        courier_charges: prices.courierCost,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'courier' ? deliveryAddress : '',
        order_type: isWholesaleActive ? 'wholesale' : 'normal',
        total_price: prices.grandTotal,
      };

      const data = await createOrder(payload, user, token);
      setCreatedOrder(data);
    } catch (err) {
      setError(err.message || 'Order submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function openWhatsApp(order) {
    const reqId = order.request_id || order.id || 'WSR-GEN';
    const sheetLabel = SHEET_TYPES.find(s => s.value === config.sheet_type)?.label || config.sheet_type;
    const isB2B = order.order_type === 'wholesale' || isWholesaleActive;

    let text = '';
    if (isB2B) {
      text = encodeURIComponent(
        `🏢 *WINSTAR B2B WHOLESALE ORDER* - *${reqId}*\n\n` +
        `🏢 *Agency:* ${order.customer_name}\n` +
        `📞 *Phone:* ${order.customer_phone}\n` +
        `📄 *Service:* ${order.service_name || order.print_type}\n` +
        `📂 *File:* ${order.file_name}\n` +
        `🔢 *Copies:* ${order.copies} | *Size:* ${order.paper_size} (${order.paper_gsm})\n` +
        `📑 *Sheet Type:* ${sheetLabel}\n` +
        (order.print_type === 'business_card' ? `✂️ *Cutting Charges:* ₹${CUTTING_CHARGES.business_card || 50}\n` : '') +
        `🔗 *Binding:* ${order.binding}\n` +
        `🚚 *Delivery:* ${order.delivery_type === 'courier' ? 'Courier Delivery (+₹30): ' + order.delivery_address : 'Store Pickup'}\n` +
        `💰 *Wholesale Total:* ₹${order.total_price} (Incl. GST)\n\n` +
        `Please confirm my wholesale print job! Request ID: ${reqId}`
      );
    } else {
      text = encodeURIComponent(
        `🖨️ *WINSTAR PRINT ORDER* - *${reqId}*\n\n` +
        `👤 *Customer:* ${order.customer_name} (${order.customer_phone})\n` +
        `📄 *Service:* ${order.service_name || order.print_type}\n` +
        `📂 *File:* ${order.file_name}\n` +
        `🔢 *Copies:* ${order.copies} | *Size:* ${order.paper_size} (${order.paper_gsm})\n` +
        `📑 *Sheet Type:* ${sheetLabel}\n` +
        (order.print_type === 'business_card' ? `✂️ *Cutting Charges:* ₹${CUTTING_CHARGES.business_card || 50}\n` : '') +
        `🔗 *Binding:* ${order.binding}\n` +
        `🚚 *Delivery:* ${order.delivery_type === 'courier' ? 'Courier Delivery (+₹30): ' + order.delivery_address : 'Store Pickup (₹0)'}\n` +
        `💰 *Final Amount:* ₹${order.total_price}\n\n` +
        `Please confirm my print job! Request ID: ${reqId}`
      );
    }

    window.open(`https://wa.me/${WINSTAR_PHONE}?text=${text}`, '_blank');
  }

  const prices = getCalculatedPrice();

  return (
    <div id="quick-print" className="card animate-fade-in" style={{ padding: 32, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-modal)' }}>
      {/* Wholesale Banner if active */}
      {isWholesaleActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#dcfce7', color: '#166534', padding: '12px 18px',
          borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14, fontWeight: 700,
        }}>
          <span className="material-symbols-outlined">verified</span>
          <span>WHOLESALE AGENCY RATE ACTIVE — Special Volume Pricing & Registered Details Applied</span>
        </div>
      )}

      {/* Step Tabs */}
      <div className="wizard-tabs" style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid var(--surface-container)' }}>
        {[
          { stepNum: 1, label: '1. Upload File', icon: 'cloud_upload' },
          { stepNum: 2, label: '2. Print Specs', icon: 'tune' },
          { stepNum: 3, label: '3. Contact & Delivery', icon: 'whatsapp' },
        ].map(s => (
          <button
            key={s.stepNum}
            type="button"
            onClick={() => setStep(s.stepNum)}
            style={{
              padding: '12px 18px', border: 'none', background: 'none', cursor: 'pointer',
              fontWeight: 700, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8,
              color: step === s.stepNum ? 'var(--primary-container)' : 'var(--on-surface-variant)',
              borderBottom: step === s.stepNum ? '2.5px solid var(--primary-container)' : '2.5px solid transparent',
              transition: 'all 0.2s',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>{s.icon}</span>
            {s.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="print-wizard-grid" style={{ display: 'grid', gridTemplateColumns: '1.6fr 1fr', gap: 32 }}>
        {/* LEFT COLUMN: STEPS */}
        <div>
          {/* STEP 1: Upload */}
          {step === 1 && (
            <div>
              <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>Step 1: Upload Your Print File</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                Supports PDF, DOCX, JPG, PNG, PSD, AI, and CorelDRAW (.cdr) up to 50MB.
              </p>

              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={e => {
                  e.preventDefault();
                  setDragOver(false);
                  if (e.dataTransfer.files?.[0]) handleFileSelect(e.dataTransfer.files[0]);
                }}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: dragOver ? '2px dashed var(--primary-container)' : '2px dashed var(--surface-container-high)',
                  borderRadius: 'var(--radius-lg)', padding: '48px 24px', textAlign: 'center',
                  background: dragOver ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.psd,.ai,.cdr"
                  onChange={e => handleFileSelect(e.target.files?.[0])}
                />
                <span className="material-symbols-outlined icon-fill" style={{ fontSize: 54, color: 'var(--primary-container)', marginBottom: 12 }}>
                  cloud_upload
                </span>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {file ? file.name : 'Click to Browse or Drag & Drop File'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  {uploading ? 'Uploading to Winstar Cloud...' : file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace` : 'Instant automatic file upload & validation (CDR, PDF, Images supported)'}
                </div>
                {uploading && <div className="spinner" style={{ width: 24, height: 24, margin: '16px auto 0' }} />}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button type="button" className="btn btn-primary" onClick={() => setStep(2)}>
                  Next: Configure Print <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Configure Specs */}
          {step === 2 && (
            <div>
              <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 16 }}>Step 2: Print Specifications</h3>

              {/* Service Type Selection */}
              <div style={{ marginBottom: 20 }}>
                <label className="label">Print Type / Service</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  {PRINT_TYPES.map(pt => (
                    <button
                      key={pt.value}
                      type="button"
                      onClick={() => setConfig(c => ({ ...c, print_type: pt.value }))}
                      style={{
                        padding: '12px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                        border: config.print_type === pt.value ? '2px solid var(--primary-container)' : '1px solid var(--surface-container-high)',
                        background: config.print_type === pt.value ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                      }}
                    >
                      <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>{pt.icon}</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 700 }}>{pt.label}</div>
                        <div style={{ fontSize: 11, color: 'var(--on-surface-variant)' }}>
                          {isWholesaleActive ? (
                            <>
                              <span style={{ textDecoration: 'line-through', color: 'var(--error)', marginRight: 4 }}>
                                ₹{pt.price.toFixed(2)}
                              </span>
                              <span style={{ color: '#166534', fontWeight: 800 }}>
                                ₹{(pt.price * 0.75).toFixed(2)} / unit
                              </span>
                            </>
                          ) : (
                            `₹${pt.price.toFixed(2)} / unit`
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Size & GSM */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="label">Paper Size (A4, A3, etc.)</label>
                  <select className="select" value={config.paper_size} onChange={e => setConfig(c => ({ ...c, paper_size: e.target.value }))}>
                    {PAPER_SIZES.map(s => (
                      <option key={s} value={s}>
                        {s} {s === 'A3' ? '(2x Size)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Paper Weight / GSM</label>
                  <select className="select" value={config.paper_gsm} onChange={e => setConfig(c => ({ ...c, paper_gsm: e.target.value }))}>
                    {GSM_OPTIONS.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Sheet Type & Copies */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="label">Sheet / Paper Type</label>
                  <select className="select" value={config.sheet_type} onChange={e => setConfig(c => ({ ...c, sheet_type: e.target.value }))}>
                    {SHEET_TYPES.map(st => (
                      <option key={st.value} value={st.value}>
                        {st.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="label">Number of Copies / Quantity</label>
                  <input
                    type="number"
                    min="1"
                    className="input"
                    value={config.copies}
                    onChange={e => setConfig(c => ({ ...c, copies: Math.max(1, parseInt(e.target.value) || 1) }))}
                  />
                </div>
              </div>

              {/* Binding & Double Sided */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                <div className="form-group">
                  <label className="label">Binding Option</label>
                  <select className="select" value={config.binding} onChange={e => setConfig(c => ({ ...c, binding: e.target.value }))}>
                    {BINDINGS.map(b => <option key={b.value} value={b.value}>{b.label}</option>)}
                  </select>
                </div>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: 24 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                    <input
                      type="checkbox"
                      checked={config.double_sided}
                      onChange={e => setConfig(c => ({ ...c, double_sided: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: 'var(--primary-container)' }}
                    />
                    Print Double-Sided (Both Sides)
                  </label>
                </div>
              </div>

              {config.print_type === 'business_card' && (
                <div style={{
                  background: '#fef3c7', color: '#92400e', padding: '10px 14px',
                  borderRadius: 'var(--radius-md)', marginBottom: 20, fontSize: 13, fontWeight: 600,
                  display: 'flex', alignItems: 'center', gap: 8
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>content_cut</span>
                  <span>Visiting Card includes precision machine cutting (+₹50 cutting charges).</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <button type="button" className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>
                  Next: Contact & Delivery <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Customer Info & Submission */}
          {step === 3 && (
            <div>
              <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>Step 3: Contact & Delivery</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                {isWholesaleActive
                  ? 'Using your registered Wholesale Agency account details for instant order routing.'
                  : 'No account required. An instant Request ID will be generated for WhatsApp tracking.'}
              </p>

              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {/* B2B Wholesale Registered Details Auto-Filled Box */}
                {isWholesaleActive ? (
                  <div style={{
                    background: '#f0fdf4', border: '1px solid #bbf7d0', padding: 18,
                    borderRadius: 'var(--radius-md)', display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 800, fontSize: 14 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>domain</span>
                      REGISTERED WHOLESALE AGENCY ACCOUNT
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, fontSize: 13, color: '#14532d', marginTop: 4 }}>
                      <div><strong>Agency / Name:</strong> {customerName || profile?.company_name || profile?.full_name}</div>
                      <div><strong>Registered Phone:</strong> {customerPhone || profile?.mobile}</div>
                      <div><strong>Registered Email:</strong> {profile?.email || user?.email || 'Registered'}</div>
                      <div><strong>GST Number:</strong> {profile?.gst_number || 'N/A'}</div>
                    </div>
                  </div>
                ) : (
                  <div className="responsive-form-grid" style={{ display: 'grid', gap: 16 }}>
                    <div className="form-group">
                      <label className="label">Full Name *</label>
                      <input
                        type="text"
                        className="input"
                        placeholder="e.g. Gowshigan"
                        required
                        value={customerName}
                        onChange={e => setCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="label">WhatsApp Number *</label>
                      <input
                        type="tel"
                        className="input"
                        placeholder="e.g. 9876543210"
                        required
                        value={customerPhone}
                        onChange={e => setCustomerPhone(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Delivery Method</label>
                  <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14,
                      padding: '10px 16px', borderRadius: 'var(--radius-md)',
                      border: deliveryType === 'pickup' ? '2px solid var(--primary-container)' : '1px solid var(--surface-container-high)',
                      background: deliveryType === 'pickup' ? 'var(--primary-fixed)' : 'transparent',
                    }}>
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryType === 'pickup'}
                        onChange={() => setDeliveryType('pickup')}
                        style={{ accentColor: 'var(--primary-container)' }}
                      />
                      <span>Store Pickup (₹0)</span>
                    </label>

                    <label style={{
                      display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14,
                      padding: '10px 16px', borderRadius: 'var(--radius-md)',
                      border: deliveryType === 'courier' ? '2px solid var(--primary-container)' : '1px solid var(--surface-container-high)',
                      background: deliveryType === 'courier' ? 'var(--primary-fixed)' : 'transparent',
                    }}>
                      <input
                        type="radio"
                        name="delivery"
                        checked={deliveryType === 'courier'}
                        onChange={() => setDeliveryType('courier')}
                        style={{ accentColor: 'var(--primary-container)' }}
                      />
                      <span>Courier Delivery (+₹30)</span>
                    </label>
                  </div>
                </div>

                {deliveryType === 'courier' && (
                  <div className="form-group animate-fade-in">
                    <label className="label">Complete Courier Dispatch Address *</label>
                    <textarea
                      className="textarea"
                      rows={2}
                      placeholder="Street, City, Postal Pin Code..."
                      required
                      value={deliveryAddress}
                      onChange={e => setDeliveryAddress(e.target.value)}
                    />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={submitting}
                  style={{
                    height: 'auto', minHeight: 52, padding: '12px 16px', fontSize: 15,
                    background: '#25D366', borderColor: '#25D366', color: '#fff',
                    marginTop: 8, whiteSpace: 'normal', lineHeight: 1.3,
                  }}
                >
                  {submitting ? (
                    <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                  ) : (
                    <>
                      <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>chat</span>
                      <span><span className="hide-on-compact">SUBMIT PRINT ORDER & </span>OPEN WHATSAPP</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY ORDER SUMMARY BOX */}
        <div>
          <div style={{
            background: 'var(--surface-container-low)', padding: 24,
            borderRadius: 'var(--radius-lg)', position: 'sticky', top: 96,
            border: '1px solid var(--surface-container-high)',
          }}>
            <h4 className="headline-sm" style={{ fontSize: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>receipt</span>
              Order Estimation Summary
            </h4>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Service:</span>
                <span style={{ fontWeight: 600 }}>{PRINT_TYPES.find(t => t.value === config.print_type)?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Size & GSM:</span>
                <span style={{ fontWeight: 600 }}>{config.paper_size} • {config.paper_gsm}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Sheet Type:</span>
                <span style={{ fontWeight: 600, fontSize: 13 }}>{SHEET_TYPES.find(s => s.value === config.sheet_type)?.label}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Quantity / Copies:</span>
                <span style={{ fontWeight: 600 }}>{config.copies}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Binding:</span>
                <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{config.binding}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--on-surface-variant)' }}>Delivery:</span>
                <span style={{ fontWeight: 600, color: deliveryType === 'courier' ? '#0369a1' : 'inherit' }}>
                  {deliveryType === 'courier' ? 'Courier (+₹30)' : 'Store Pickup (₹0)'}
                </span>
              </div>
              {file && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--on-surface-variant)' }}>File Attached:</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary-container)' }}>{file.name.slice(0, 16)}…</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed var(--surface-container-high)', paddingTop: 14, marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                <span>Printing Subtotal</span>
                <span>₹{prices.printingSubtotal}</span>
              </div>

              {config.print_type === 'business_card' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#92400e', fontWeight: 600 }}>
                  <span>Cutting Charges</span>
                  <span>+₹{prices.cuttingCost}</span>
                </div>
              )}

              {deliveryType === 'courier' && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: '#0369a1', fontWeight: 600 }}>
                  <span>Courier Charges</span>
                  <span>+₹{prices.courierCost}</span>
                </div>
              )}

              {isWholesaleActive && parseFloat(prices.gst) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  <span>GST (18%)</span>
                  <span>₹{prices.gst}</span>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: 'var(--on-surface)', marginTop: 8 }}>
                <span>Final Total</span>
                <span style={{ color: 'var(--primary-container)' }}>₹{prices.grandTotal}</span>
              </div>
            </div>

            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
              Final invoice and instant confirmation sent via WhatsApp.
            </div>
          </div>
        </div>
      </div>

      {/* WHATSAPP CONFIRMATION POPUP MODAL */}
      {createdOrder && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: 520, width: '100%', padding: 32, borderRadius: 'var(--radius-xl)', textAlign: 'center' }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%', background: '#dcfce7',
              display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
            }}>
              <span className="material-symbols-outlined icon-fill" style={{ color: '#16a34a', fontSize: 36 }}>task_alt</span>
            </div>

            <h3 className="headline-sm" style={{ marginBottom: 4 }}>ORDER DETAILS READY!</h3>
            <p style={{ color: 'var(--on-surface-variant)', fontSize: 14, marginBottom: 20 }}>
              Your unique print request ID has been created.
            </p>

            <div style={{ background: 'var(--surface-container-low)', padding: 18, borderRadius: 'var(--radius-lg)', marginBottom: 24, textAlign: 'left' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--on-surface-variant)' }}>REQUEST ID</span>
                <span style={{ fontFamily: 'monospace', fontSize: 16, fontWeight: 800, color: 'var(--primary-container)', background: 'var(--primary-fixed)', padding: '2px 8px', borderRadius: 4 }}>
                  {createdOrder.request_id || createdOrder.id}
                </span>
              </div>
              <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <div><strong>Customer:</strong> {createdOrder.customer_name} ({createdOrder.customer_phone})</div>
                <div><strong>Service:</strong> {createdOrder.service_name}</div>
                <div><strong>File:</strong> {createdOrder.file_name}</div>
                <div><strong>Delivery:</strong> {createdOrder.delivery_type === 'courier' ? 'Courier Delivery (+₹30)' : 'Store Pickup (₹0)'}</div>
                <div><strong>Total Amount:</strong> ₹{createdOrder.total_price}</div>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                type="button"
                className="btn btn-full"
                onClick={() => openWhatsApp(createdOrder)}
                style={{ height: 48, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 15 }}
              >
                <span className="material-symbols-outlined">chat</span> CONTINUE TO WHATSAPP 📲
              </button>
              <button
                type="button"
                className="btn btn-outline btn-full"
                onClick={() => { setCreatedOrder(null); setStep(1); setFile(null); setUploadedFile(null); }}
              >
                Place Another Print Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
