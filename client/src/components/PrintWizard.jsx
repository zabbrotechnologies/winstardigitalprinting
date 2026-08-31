import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { createOrder, uploadPrintFile } from '../lib/orderService';
import { 
  WHOLESALE_PRICE_LIST, 
  NORMAL_PRINT_PRICES, 
  WIDE_FORMAT_PRICES, 
  BINDING_PRICES, 
  LAMINATION_PRICES, 
  FLAT_SERVICE_PRICES 
} from '../lib/priceList';

const WINSTAR_PHONE = '919345046665'; 

const TOP_LEVEL_SERVICES = [
  { value: 'printing', label: 'Document & Wide Format Printing', icon: 'print' },
  { value: 'lamination', label: 'Lamination', icon: 'layers' },
  { value: 'certificates', label: 'Certificates', icon: 'military_tech' },
  { value: 'visiting_cards', label: 'Visiting / Business Cards', icon: 'badge' },
  { value: 'brochures', label: 'Brochures / Flyers', icon: 'menu_book' },
];

const DOC_PRINT_SIZES = ['A4', 'FS', 'A3', 'A2', 'A1', 'A0'];
const SHEET_TYPES = ['Normal Sheet', 'Green Sheet'];
const COLOR_OPTIONS = ['B&W', 'Color'];
const BINDING_OPTIONS = ['No Binding', 'Chat Binding', 'Spiral Binding'];
const LAMINATION_SIZES = ['ID', 'A4', 'FS', 'A3'];

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
  const [successModalStep, setSuccessModalStep] = useState('details');
  const [paymentMethod, setPaymentMethod] = useState('online');
  const [error, setError] = useState('');

  const [customerName, setCustomerName] = useState(profile?.company_name || profile?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.mobile || profile?.phone || '');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.business_address || '');

  const [config, setConfig] = useState({
    service: 'printing',
    paper_size: 'A4',
    sheet_type: 'Normal Sheet',
    color: 'B&W',
    double_sided: false,
    pages: 1,
    copies: 1,
    binding: 'No Binding',
    lami_size: 'A4',
    
    // Visiting Card & custom message fields
    card_type: 'Art Board',
    card_side: 'Single Side',
    message_text: '',
    
    // Wholesale fields
    media: 'COATED',
    paper_gsm: '100',
  });

  const isWholesaleActive = isWholesale || (profile?.isWholesale && profile?.isApproved);

  // Sync B2B account details when profile loads
  useEffect(() => {
    if (isWholesaleActive && profile) {
      const name = profile.company_name || profile.full_name || '';
      const mobile = profile.mobile || profile.phone || '';
      const address = profile.business_address || '';
      if (name) setCustomerName(name);
      if (mobile) setCustomerPhone(mobile);
      if (address) setDeliveryAddress(address);
    }
  }, [isWholesaleActive, profile]);

  const availableWholesaleItems = WHOLESALE_PRICE_LIST.filter(item => item.media === config.media);
  const availableWholesaleSizes = [...new Set(availableWholesaleItems.map(item => item.size))];
  const availableWholesaleGsm = [...new Set(availableWholesaleItems.filter(item => item.size === config.paper_size).map(item => item.gsm))];

  const handleMediaChange = (newMedia) => {
    const items = WHOLESALE_PRICE_LIST.filter(i => i.media === newMedia);
    if (items.length > 0) {
      const newSize = items[0].size;
      const newGsmItems = items.filter(i => i.size === newSize);
      setConfig(c => ({ ...c, media: newMedia, paper_size: newSize, paper_gsm: newGsmItems.length > 0 ? newGsmItems[0].gsm : '' }));
    } else {
      setConfig(c => ({ ...c, media: newMedia }));
    }
  };

  const handleSizeChange = (newSize) => {
    const items = WHOLESALE_PRICE_LIST.filter(i => i.media === config.media && i.size === newSize);
    setConfig(c => ({ ...c, paper_size: newSize, paper_gsm: items.length > 0 ? items[0].gsm : '' }));
  };

  // UI Rules enforcement
  useEffect(() => {
    if (!isWholesaleActive && config.service === 'printing') {
      const isWideFormat = ['A0', 'A1', 'A2'].includes(config.paper_size);
      setConfig(c => {
        let newC = { ...c };
        if (isWideFormat) {
          newC.sheet_type = 'Normal Sheet';
          newC.binding = 'No Binding';
          newC.double_sided = false;
        } else if (c.paper_size === 'A3') {
          newC.sheet_type = 'Normal Sheet';
          newC.binding = 'No Binding';
        }
        return newC;
      });
    }
  }, [config.paper_size, config.service, isWholesaleActive]);

  useEffect(() => {
    if (!isWholesaleActive && config.paper_size === 'A4' && config.pages > 500 && config.binding === 'Spiral Binding') {
      setConfig(c => ({ ...c, binding: 'No Binding' }));
    }
  }, [config.pages, config.paper_size, isWholesaleActive, config.binding]);

  useEffect(() => {
    if (config.service === 'visiting_cards') {
      setConfig(c => ({
        ...c,
        card_type: c.card_type || 'Art Board',
        card_side: c.card_side || 'Single Side',
        copies: [120, 150, 200, 300, 510, 720, 1020].includes(c.copies) ? c.copies : 120
      }));
    }
  }, [config.service]);

  function getCalculatedPrice() {
    let subtotal = 0;
    let printingTotal = 0;
    let bindingTotal = 0;
    
    if (isWholesaleActive) {
      const item = WHOLESALE_PRICE_LIST.find(i => 
        i.media === config.media && 
        i.size === config.paper_size && 
        i.gsm === config.paper_gsm
      );
      if (item) {
        const isDouble = config.double_sided && item.double_1st !== null;
        const rate1st = isDouble ? item.double_1st : item.single_1st;
        const rateAdd = isDouble ? item.double_add : item.single_add;
        if (config.copies > 10) {
          subtotal = config.copies * rateAdd;
        } else {
          subtotal = rate1st + ((config.copies - 1) * rateAdd);
        }
      }
      printingTotal = subtotal;
    } else {
      if (config.service === 'printing') {
        const isWideFormat = ['A0', 'A1', 'A2'].includes(config.paper_size);
        let printRate = 0;
        let xeroxRate = 0;
        let bindingRate = 0;

        if (isWideFormat) {
          const rates = WIDE_FORMAT_PRICES[config.paper_size];
          if (rates) {
            printRate = config.color === 'Color' ? rates['Color'] : rates['B&W'];
            xeroxRate = config.color === 'Color' ? rates['Color_Xerox'] : rates['B&W_Xerox'];
          }
        } else {
          const sizeRates = NORMAL_PRINT_PRICES[config.paper_size];
          const typeRates = sizeRates?.[config.sheet_type] || sizeRates?.['Normal Sheet'];
          const sideKey = config.double_sided ? 'Front & Back' : 'Single Side';
          const rates = typeRates?.[sideKey] || typeRates?.['Single Side'];
          
          printRate = rates?.print || 0;
          xeroxRate = rates?.xerox || 0;

          if (config.binding === 'Chat Binding') {
            bindingRate = BINDING_PRICES['Chat Binding'][config.paper_size] || 0;
          } else if (config.binding === 'Spiral Binding') {
            const tiers = BINDING_PRICES['Spiral Binding'][config.paper_size] || [];
            const tier = tiers.find(t => config.pages >= t.min && config.pages <= t.max);
            bindingRate = tier ? tier.price : 0;
          }
        }

        const printingTotalVal = config.copies === 1 
          ? (config.pages * printRate) 
          : (config.pages * printRate) + (config.pages * xeroxRate * (config.copies - 1));
        
        const bindingTotalVal = bindingRate * config.copies;
        subtotal = printingTotalVal + bindingTotalVal;
        printingTotal = printingTotalVal;
        bindingTotal = bindingTotalVal;

      } else if (config.service === 'binding') {
        let bindingRate = 0;
        if (config.binding === 'Chat Binding') {
          bindingRate = BINDING_PRICES['Chat Binding'][config.paper_size] || 0;
        } else if (config.binding === 'Spiral Binding') {
          const tiers = BINDING_PRICES['Spiral Binding'][config.paper_size] || [];
          const tier = tiers.find(t => config.pages >= t.min && config.pages <= t.max);
          bindingRate = tier ? tier.price : 0;
        }
        subtotal = bindingRate * config.copies;
        bindingTotal = subtotal;

      } else if (config.service === 'lamination') {
        const rate = LAMINATION_PRICES[config.lami_size] || 0;
        subtotal = rate * config.pages * config.copies;
        printingTotal = subtotal;

      } else if (config.service === 'visiting_cards') {
        const cardPrices = {
          'Art Board': [
            { qty: 120, single: 130, double: 180 },
            { qty: 150, single: 150, double: 200 },
            { qty: 200, single: 175, double: 250 },
            { qty: 300, single: 225, double: 325 },
            { qty: 510, single: 340, double: 490 },
            { qty: 720, single: 450, double: 660 },
            { qty: 1020, single: 600, double: 900 }
          ],
          'Art Board with Lamination': [
            { qty: 120, single: 180, double: 230 },
            { qty: 150, single: 200, double: 250 },
            { qty: 200, single: 225, double: 335 },
            { qty: 300, single: 285, double: 445 },
            { qty: 510, single: 450, double: 700 },
            { qty: 720, single: 600, double: 950 },
            { qty: 1020, single: 800, double: 1300 }
          ],
          'Metallic & Special Boards': [
            { qty: 120, single: 190, double: 260 },
            { qty: 150, single: 225, double: 300 },
            { qty: 200, single: 275, double: 375 },
            { qty: 300, single: 375, double: 500 },
            { qty: 510, single: 575, double: 775 },
            { qty: 720, single: 785, double: 1055 },
            { qty: 1020, single: 1100, double: 1455 }
          ],
          'Synthetic White 125 Micron': [
            { qty: 120, single: 200, double: 285 },
            { qty: 150, single: 235, double: 335 },
            { qty: 200, single: 305, double: 435 },
            { qty: 300, single: 410, double: 585 },
            { qty: 510, single: 655, double: 935 },
            { qty: 720, single: 900, double: 1285 },
            { qty: 1020, single: 1250, double: 1785 }
          ],
          'Syn. White 200 Mic / Syn. Gold & Silver 125 Mic': [
            { qty: 120, single: 290, double: 435 },
            { qty: 150, single: 345, double: 445 },
            { qty: 200, single: 455, double: 675 },
            { qty: 300, single: 620, double: 915 },
            { qty: 510, single: 1000, double: 1475 },
            { qty: 720, single: 1400, double: 2050 },
            { qty: 1020, single: 1950, double: 2850 }
          ]
        };

        const typePrices = cardPrices[config.card_type] || cardPrices['Art Board'];
        const copiesVal = parseInt(config.copies) || 120;
        const priceObj = typePrices.find(p => p.qty === copiesVal) || typePrices[0];
        const baseRate = config.card_side === 'Front & Back' ? priceObj.double : priceObj.single;
        const cutoff = priceObj.qty <= 510 ? 60 : 120;
        
        subtotal = baseRate + cutoff;
        printingTotal = subtotal;

      } else {
        const keyMap = { 'certificates': 'Certificates', 'visiting_cards': 'Visiting Cards', 'brochures': 'Brochures' };
        const rates = FLAT_SERVICE_PRICES[keyMap[config.service]];
        if (rates) {
          subtotal = config.copies === 1 
            ? (rates.print) 
            : (rates.print) + (rates.xerox * (config.copies - 1));
        }
        printingTotal = subtotal;
      }
    }

    const gst = subtotal * 0.18;
    const grandTotal = Math.round(subtotal + gst);
    return { 
      subtotal: subtotal.toFixed(2), 
      gst: gst.toFixed(2), 
      grandTotal: grandTotal.toFixed(2),
      printingTotal: printingTotal.toFixed(2),
      bindingTotal: bindingTotal.toFixed(2)
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
    const effectiveName = isWholesaleActive
      ? (profile?.company_name || profile?.full_name || customerName || user?.user_metadata?.full_name || 'B2B Client')
      : customerName;
    const effectivePhone = isWholesaleActive
      ? (profile?.mobile || profile?.phone || customerPhone || user?.user_metadata?.mobile || '')
      : customerPhone;
    const effectiveEmail = isWholesaleActive
      ? (profile?.email || user?.email || '')
      : '';

    if (!isWholesaleActive && (!customerName || !customerPhone)) {
      setError('Please provide your Name and WhatsApp Mobile Number.');
      return;
    }

    const prices = getCalculatedPrice();
    if (prices.grandTotal <= 0) {
      setError('Price unavailable for this specification. Please check your inputs or contact support.');
      return;
    }

    if (!isWholesaleActive && config.paper_size === 'A4' && config.binding === 'Spiral Binding' && config.pages > 500) {
      setError('Spiral Binding is not available for documents over 500 pages.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const token = await getAccessToken();
      let serviceName = isWholesaleActive ? config.media : TOP_LEVEL_SERVICES.find(t => t.value === config.service)?.label;
      
      const payload = {
        customer_name: effectiveName,
        customer_phone: effectivePhone,
        customer_email: effectiveEmail,
        service_name: serviceName,
        file_name: uploadedFile?.fileName || file?.name || 'print-file.pdf',
        file_url: uploadedFile?.publicUrl || '',
        file_id: uploadedFile?.fileId || '',
        ...config,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'courier' ? deliveryAddress : '',
        order_type: isWholesaleActive ? 'wholesale' : 'normal',
        total_price: prices.grandTotal,
      };

      const data = await createOrder(payload, user, token);
      setCreatedOrder(data);
      setSuccessModalStep('details');
      setPaymentMethod('online');
    } catch (err) {
      setError(err.message || 'Order submission failed.');
    } finally {
      setSubmitting(false);
    }
  }

  function openWhatsApp(order) {
    const reqId = order.request_id || order.id || (isWholesaleActive ? 'WG-WSR-GEN' : 'WSR-GEN');
    let textStr = '';

    if (order.order_type === 'wholesale' || isWholesaleActive) {
      const agencyName = order.customer_name || profile?.company_name || profile?.full_name || 'B2B Client';
      const registeredEmail = order.customer_email || profile?.email || user?.email || 'N/A';
      const registeredPhone = order.customer_phone || profile?.mobile || 'N/A';

      textStr = `🖨️ *WINSTAR B2B PRINT ORDER* - *${reqId}*\n\n` +
        `🏢 *Agency / Client:* ${agencyName}\n` +
        `📧 *Registered Email:* ${registeredEmail}\n` +
        `📱 *Registered Phone:* ${registeredPhone}\n` +
        `📄 *Service / Media:* ${order.service_name}\n`;
    } else {
      textStr = `🖨️ *WINSTAR PRINT ORDER* - *${reqId}*\n\n` +
        `👤 *Customer:* ${order.customer_name} (${order.customer_phone})\n` +
        `📄 *Service:* ${order.service_name}\n`;
    }

    if (order.service === 'visiting_cards') {
      textStr += `🪪 *Card Type:* ${order.card_type}\n` +
                 `📐 *Side:* ${order.card_side}\n` +
                 `🔢 *Quantity:* ${order.copies} cards\n`;
    } else {
      let sizeDetails = isWholesaleActive ? `${order.paper_size} (${order.paper_gsm})` : order.service === 'lamination' ? order.lami_size : order.paper_size;
      textStr += `📂 *File:* ${order.file_name}\n` +
                 `🔢 *Copies:* ${order.copies} | *Pages:* ${order.pages} | *Size:* ${sizeDetails}\n` +
                 `🔗 *Binding:* ${order.binding}\n`;
    }

    if (order.message_text) {
      textStr += `📝 *Instructions:* ${order.message_text}\n`;
    }

    textStr += `🚚 *Delivery:* ${order.delivery_type === 'courier' ? 'Courier: ' + (order.delivery_address || deliveryAddress) : 'Store Pickup'}\n`;
    textStr += `💰 *Total Amount:* ₹${order.total_price} (Incl. 18% GST)\n\n`;
    
    textStr += `Please confirm my print job! Request ID: ${reqId}`;

    const text = encodeURIComponent(textStr);
    window.open(`https://wa.me/${WINSTAR_PHONE}?text=${text}`, '_blank');
  }

  const prices = getCalculatedPrice();

  return (
    <div id="quick-print" className="card animate-fade-in" style={{ padding: 32, borderRadius: 'var(--radius-xl)', boxShadow: 'var(--shadow-modal)' }}>
      {isWholesaleActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#dcfce7', color: '#166534', padding: '10px 16px',
          borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14, fontWeight: 700,
        }}>
          <span className="material-symbols-outlined">verified</span>
          WHOLESALE AGENCY RATE ACTIVE — Special Volume Pricing Applied
        </div>
      )}

      <div className="wizard-tabs" style={{ display: 'flex', gap: 12, marginBottom: 32, borderBottom: '1px solid var(--surface-container)' }}>
        {[
          { stepNum: 1, label: '1. Upload File', icon: 'cloud_upload' },
          { stepNum: 2, label: '2. Print Specs', icon: 'tune' },
          { stepNum: 3, label: '3. Customer & WhatsApp', icon: 'chat' },
        ].map(s => (
          <button
            key={s.stepNum}
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
        <div>
          {/* STEP 1 */}
          {step === 1 && (
            <div>
              <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>Step 1: Upload Your Print File</h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                Supports PDF, DOCX, CorelDRAW (.CDR), PSD, AI, JPG, and PNG up to 50MB.
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
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.psd,.ai,.cdr,application/x-cdr,application/cdr,application/vnd.corel-draw"
                  onChange={e => handleFileSelect(e.target.files?.[0])}
                />
                <span className="material-symbols-outlined icon-fill" style={{ fontSize: 54, color: 'var(--primary-container)', marginBottom: 12 }}>
                  cloud_upload
                </span>
                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                  {file ? file.name : 'Click to Browse or Drag & Drop File'}
                </div>
                <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  {uploading ? 'Uploading to Winstar Cloud...' : file ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • Click to replace` : 'Instant automatic file upload & validation (PDF, CDR, DOCX, Images)'}
                </div>
                {uploading && <div className="spinner" style={{ width: 24, height: 24, margin: '16px auto 0' }} />}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                <button className="btn btn-primary" onClick={() => setStep(2)}>
                  Next: Configure Print <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && (
            <div>
              <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 16 }}>Step 2: Specifications</h3>

              {isWholesaleActive ? (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label className="label">Select Media Type</label>
                    <select className="select" value={config.media} onChange={e => handleMediaChange(e.target.value)} style={{ padding: '14px', fontSize: 16 }}>
                      {[...new Set(WHOLESALE_PRICE_LIST.map(i => i.media))].map(media => (
                        <option key={media} value={media}>{media}</option>
                      ))}
                    </select>
                  </div>
                  <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="form-group">
                      <label className="label">Size</label>
                      <select className="select" value={config.paper_size} onChange={e => handleSizeChange(e.target.value)}>
                        {availableWholesaleSizes.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="label">GSM / Thickness</label>
                      <select className="select" value={config.paper_gsm} onChange={e => setConfig(c => ({ ...c, paper_gsm: e.target.value }))}>
                        {availableWholesaleGsm.map(g => <option key={g} value={g}>{g}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                    <div className="form-group">
                      <label className="label">Copies</label>
                      <input type="number" min="1" className="input" value={config.copies} onChange={e => setConfig(c => ({ ...c, copies: Math.max(1, parseInt(e.target.value) || 1) }))} />
                    </div>
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>
                      <input type="checkbox" checked={config.double_sided} onChange={e => setConfig(c => ({ ...c, double_sided: e.target.checked }))} style={{ width: 18, height: 18 }} />
                      Print on Both Sides
                    </label>
                  </div>
                </>
              ) : (
                <>
                  <div style={{ marginBottom: 20 }}>
                    <label className="label">Top-Level Service</label>
                    <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {TOP_LEVEL_SERVICES.map(ts => (
                        <button
                          key={ts.value}
                          type="button"
                          onClick={() => setConfig(c => ({ ...c, service: ts.value }))}
                          style={{
                            padding: '12px 14px', borderRadius: 'var(--radius-md)', textAlign: 'left',
                            border: config.service === ts.value ? '2px solid var(--primary-container)' : '1px solid var(--surface-container-high)',
                            background: config.service === ts.value ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                            cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                          }}
                        >
                          <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)' }}>{ts.icon}</span>
                          <div style={{ fontSize: 13, fontWeight: 700 }}>{ts.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {config.service === 'printing' && (
                    <>
                       <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Sheet Size</label>
                          <select className="select" value={config.paper_size} onChange={e => setConfig(c => ({ ...c, paper_size: e.target.value }))}>
                            {DOC_PRINT_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        {['A4', 'FS'].includes(config.paper_size) && (
                          <div className="form-group">
                            <label className="label">Sheet Type</label>
                            <select className="select" value={config.sheet_type} onChange={e => setConfig(c => ({ ...c, sheet_type: e.target.value }))}>
                              {SHEET_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                      
                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Color Mode</label>
                          <select className="select" value={config.color} onChange={e => setConfig(c => ({ ...c, color: e.target.value }))}>
                            {COLOR_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                          </select>
                        </div>
                        {!['A0', 'A1', 'A2'].includes(config.paper_size) && (
                          <div className="form-group">
                            <label className="label">Printing Side</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                                <input type="radio" checked={!config.double_sided} onChange={() => setConfig(c => ({ ...c, double_sided: false }))} />
                                Single Side
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                                <input type="radio" checked={config.double_sided} onChange={() => setConfig(c => ({ ...c, double_sided: true }))} />
                                Front & Back
                              </label>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {config.service === 'lamination' && (
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="label">Lamination Size</label>
                      <select className="select" value={config.lami_size} onChange={e => setConfig(c => ({ ...c, lami_size: e.target.value }))}>
                        {LAMINATION_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  )}

                  {config.service === 'visiting_cards' && (
                    <div className="animate-fade-in">
                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Card Type</label>
                          <select className="select" value={config.card_type} onChange={e => setConfig(c => ({ ...c, card_type: e.target.value }))}>
                            <option value="Art Board">Art Board</option>
                            <option value="Art Board with Lamination">Art Board with Lamination</option>
                            <option value="Metallic & Special Boards">Metallic & Special Boards</option>
                            <option value="Synthetic White 125 Micron">Synthetic White 125 Micron</option>
                            <option value="Syn. White 200 Mic / Syn. Gold & Silver 125 Mic">Syn. White 200 Mic / Syn. Gold & Silver 125 Mic</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Printing Side</label>
                          <select className="select" value={config.card_side} onChange={e => setConfig(c => ({ ...c, card_side: e.target.value }))}>
                            <option value="Single Side">Single Side</option>
                            <option value="Front & Back">Front & Back</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Quantity (Cards)</label>
                          <select className="select" value={config.copies} onChange={e => setConfig(c => ({ ...c, copies: parseInt(e.target.value) }))}>
                            <option value="120">120 cards</option>
                            <option value="150">150 cards</option>
                            <option value="200">200 cards</option>
                            <option value="300">300 cards</option>
                            <option value="510">510 cards</option>
                            <option value="720">720 cards</option>
                            <option value="1020">1020 cards</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}

                  {['printing', 'lamination'].includes(config.service) || config.service !== 'visiting_cards' ? (
                    <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      {['printing', 'lamination'].includes(config.service) && (
                        <div className="form-group">
                          <label className="label">Number of Pages</label>
                          <input type="number" min="1" className="input" value={config.pages} onChange={e => setConfig(c => ({ ...c, pages: Math.max(1, parseInt(e.target.value) || 1) }))} />
                        </div>
                      )}
                      {config.service !== 'visiting_cards' && (
                        <div className="form-group">
                          <label className="label">Number of Copies</label>
                          <input type="number" min="1" className="input" value={config.copies} onChange={e => setConfig(c => ({ ...c, copies: Math.max(1, parseInt(e.target.value) || 1) }))} />
                        </div>
                      )}
                    </div>
                  ) : null}

                  {config.service === 'printing' && ['A4', 'FS'].includes(config.paper_size) && (
                    <div className="form-group" style={{ marginBottom: 16 }}>
                      <label className="label">Binding Add-on</label>
                      <select className="select" value={config.binding} onChange={e => setConfig(c => ({ ...c, binding: e.target.value }))}>
                        {BINDING_OPTIONS.map(b => {
                          const disabled = b === 'Spiral Binding' && config.paper_size === 'A4' && config.pages > 500;
                          return (
                            <option key={b} value={b} disabled={disabled}>
                              {b} {disabled ? ' (Unavailable > 500 pages)' : ''}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {/* Optional Printing Instructions Message Box (Always Visible) */}
                  <div className="form-group animate-fade-in" style={{ marginBottom: 16 }}>
                    <label className="label">Special Instructions / Notes (Optional)</label>
                    <textarea 
                      className="textarea" 
                      rows={2} 
                      placeholder="e.g. Spiral binding request, print specific pages only, custom paper requirements..." 
                      value={config.message_text} 
                      onChange={e => setConfig(c => ({ ...c, message_text: e.target.value }))} 
                    />
                  </div>
                </>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 24 }}>
                <button className="btn btn-outline" onClick={() => setStep(1)}>Back</button>
                <button className="btn btn-primary" onClick={() => setStep(3)}>
                  Next: Delivery <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && (
            <div>
              <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>
                {isWholesaleActive ? 'Step 3: B2B Order & Delivery' : 'Step 3: Contact & Delivery'}
              </h3>
              <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                {isWholesaleActive 
                  ? 'Your authenticated B2B account details will be automatically attached to this order.' 
                  : 'No account required. An instant Request ID will be generated for WhatsApp tracking.'}
              </p>

              <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {isWholesaleActive ? (
                  <div style={{
                    background: 'var(--surface-container-low)',
                    border: '1px solid #bbf7d0',
                    borderRadius: 'var(--radius-lg)',
                    padding: '16px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#166534', fontWeight: 800, fontSize: 13.5 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18 }}>verified_user</span>
                      AUTHENTICATED B2B ACCOUNT DETAILS
                    </div>
                    <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, fontSize: 13 }}>
                      <div style={{ background: 'var(--surface-container-lowest)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-container-high)' }}>
                        <span style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Registered Agency</span>
                        <strong style={{ color: 'var(--on-surface)', wordBreak: 'break-word' }}>{profile?.company_name || profile?.full_name || customerName || 'B2B Agency'}</strong>
                      </div>
                      <div style={{ background: 'var(--surface-container-lowest)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-container-high)' }}>
                        <span style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Registered Email</span>
                        <strong style={{ color: 'var(--on-surface)', wordBreak: 'break-all' }}>{profile?.email || user?.email || 'N/A'}</strong>
                      </div>
                      <div style={{ background: 'var(--surface-container-lowest)', padding: '10px 12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-container-high)' }}>
                        <span style={{ color: 'var(--on-surface-variant)', display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', marginBottom: 2 }}>Registered Phone</span>
                        <strong style={{ color: 'var(--on-surface)' }}>{profile?.mobile || profile?.phone || customerPhone || user?.user_metadata?.mobile || 'N/A'}</strong>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="responsive-form-grid" style={{ display: 'grid', gap: 16 }}>
                    <div className="form-group">
                      <label className="label">Full Name *</label>
                      <input type="text" className="input" placeholder="e.g. John Doe" required value={customerName} onChange={e => setCustomerName(e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="label">WhatsApp Number *</label>
                      <input type="tel" className="input" placeholder="e.g. 1234567890" required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} />
                    </div>
                  </div>
                )}

                <div className="form-group">
                  <label className="label">Delivery Method</label>
                  <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="radio" name="delivery" checked={deliveryType === 'pickup'} onChange={() => setDeliveryType('pickup')} />
                      Store Pickup (Winstar Printing)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 14 }}>
                      <input type="radio" name="delivery" checked={deliveryType === 'courier'} onChange={() => setDeliveryType('courier')} />
                      Courier Delivery
                    </label>
                  </div>
                </div>

                {deliveryType === 'courier' && (
                  <div className="form-group animate-fade-in">
                    <label className="label">Complete Courier Address *</label>
                    <textarea className="textarea" rows={2} placeholder="Street, City, Postal Pin Code..." required value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} />
                  </div>
                )}

                <button
                  type="submit"
                  className="btn btn-primary btn-full"
                  disabled={submitting}
                  style={{ height: 'auto', minHeight: 52, padding: '12px 16px', fontSize: 15, background: '#25D366', borderColor: '#25D366', color: '#fff', marginTop: 8, whiteSpace: 'normal', lineHeight: 1.3 }}
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

        {/* RIGHT COLUMN */}
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
                <span style={{ fontWeight: 600 }}>{isWholesaleActive ? config.media : TOP_LEVEL_SERVICES.find(t => t.value === config.service)?.label}</span>
              </div>
              
              {config.service === 'visiting_cards' ? (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Card Type:</span>
                    <span style={{ fontWeight: 600 }}>{config.card_type}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Printing Side:</span>
                    <span style={{ fontWeight: 600 }}>{config.card_side}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Quantity:</span>
                    <span style={{ fontWeight: 600 }}>{config.copies} cards</span>
                  </div>
                </>
              ) : (
                <>
                  {!isWholesaleActive && config.service === 'printing' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>Type & Color:</span>
                      <span style={{ fontWeight: 600 }}>{config.sheet_type}, {config.color}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Size:</span>
                    <span style={{ fontWeight: 600 }}>{isWholesaleActive ? config.paper_size : config.service === 'lamination' ? config.lami_size : config.paper_size}</span>
                  </div>

                  {['printing', 'binding', 'lamination'].includes(config.service) && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--on-surface-variant)' }}>Pages:</span>
                      <span style={{ fontWeight: 600 }}>{config.pages}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Copies:</span>
                    <span style={{ fontWeight: 600 }}>{config.copies}</span>
                  </div>
                </>
              )}

              {config.message_text && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, background: 'var(--surface-container-high)', padding: '10px 14px', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--outline-variant)' }}>
                  <span style={{ color: 'var(--on-surface-variant)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase' }}>Special Notes:</span>
                  <span style={{ fontWeight: 600, fontSize: 12.5, color: 'var(--on-surface)', wordBreak: 'break-word', whiteSpace: 'pre-wrap', lineHeight: 1.3 }}>
                    {config.message_text}
                  </span>
                </div>
              )}
              
              {(config.service === 'printing' || config.service === 'binding') && config.binding !== 'No Binding' && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--on-surface-variant)' }}>Binding Add-on:</span>
                    <span style={{ fontWeight: 600, textTransform: 'capitalize' }}>{config.binding}</span>
                  </div>
                  {config.binding === 'Spiral Binding' && (
                    <div style={{
                      marginTop: 8, padding: 12, background: 'var(--surface-container-high)',
                      borderRadius: 'var(--radius-lg)', border: '1px solid var(--outline-variant)',
                      fontSize: 11.5, color: 'var(--on-surface-variant)', display: 'flex', flexDirection: 'column', gap: 4
                    }}>
                      <div style={{ fontWeight: 700, color: 'var(--primary)', marginBottom: 2 }}>
                        📖 {config.paper_size} Spiral Binding Rates:
                      </div>
                      {config.paper_size === 'A4' ? (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: config.pages >= 1 && config.pages <= 49 ? 1 : 0.6, fontWeight: config.pages >= 1 && config.pages <= 49 ? 700 : 400 }}>
                            <span>1–49 pages</span> <span>₹25</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: config.pages >= 50 && config.pages <= 99 ? 1 : 0.6, fontWeight: config.pages >= 50 && config.pages <= 99 ? 700 : 400 }}>
                            <span>50–99 pages</span> <span>₹30</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: config.pages >= 100 && config.pages <= 199 ? 1 : 0.6, fontWeight: config.pages >= 100 && config.pages <= 199 ? 700 : 400 }}>
                            <span>100–199 pages</span> <span>₹40</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: config.pages >= 200 && config.pages <= 299 ? 1 : 0.6, fontWeight: config.pages >= 200 && config.pages <= 299 ? 700 : 400 }}>
                            <span>200–299 pages</span> <span>₹50</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: config.pages >= 300 && config.pages <= 500 ? 1 : 0.6, fontWeight: config.pages >= 300 && config.pages <= 500 ? 700 : 400 }}>
                            <span>300–500 pages</span> <span>₹70</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: config.pages > 500 ? 1 : 0.6, fontWeight: config.pages > 500 ? 700 : 400, color: 'var(--error)' }}>
                            <span>501+ pages</span> <span>Not Available</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: config.pages >= 1 && config.pages <= 99 ? 1 : 0.6, fontWeight: config.pages >= 1 && config.pages <= 99 ? 700 : 400 }}>
                            <span>1–99 pages</span> <span>₹50</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', opacity: config.pages >= 100 ? 1 : 0.6, fontWeight: config.pages >= 100 ? 700 : 400 }}>
                            <span>100+ pages</span> <span>₹70</span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </>
              )}

              {file && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--on-surface-variant)' }}>File Attached:</span>
                  <span style={{ fontWeight: 600, color: 'var(--primary-container)' }}>{file.name.slice(0, 16)}…</span>
                </div>
              )}
            </div>

            <div style={{ borderTop: '1px dashed var(--surface-container-high)', paddingTop: 14, marginBottom: 16 }}>
              {Number(prices.printingTotal) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  <span>Printing Cost</span>
                  <span>₹{prices.printingTotal}</span>
                </div>
              )}
              {Number(prices.bindingTotal) > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                  <span>Binding Cost</span>
                  <span>₹{prices.bindingTotal}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                <span>Subtotal</span>
                <span>₹{prices.subtotal}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                <span>GST (18%)</span>
                <span>₹{prices.gst}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, fontWeight: 800, color: 'var(--on-surface)' }}>
                <span>Estimated Total</span>
                <span style={{ color: 'var(--primary-container)' }}>₹{prices.grandTotal}</span>
              </div>
            </div>
            
            {Number(prices.grandTotal) <= 0 && (
              <div style={{ fontSize: 12, color: 'var(--error-container)', textAlign: 'center', background: 'rgba(255,0,0,0.1)', padding: 8, borderRadius: 4, marginBottom: 8 }}>
                Price unavailable for this specification.
              </div>
            )}

            <div style={{ fontSize: 11, color: 'var(--on-surface-variant)', textAlign: 'center' }}>
              Final invoice and instant confirmation sent via WhatsApp.
            </div>
          </div>
        </div>
      </div>

      {createdOrder && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1100,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="card animate-fade-in" style={{ maxWidth: 520, width: '100%', padding: 28, borderRadius: 'var(--radius-xl)', textAlign: 'center', maxHeight: '90vh', overflowY: 'auto' }}>
            
            {successModalStep === 'details' ? (
              <>
                <div style={{
                  width: 60, height: 60, borderRadius: '50%', background: '#dcfce7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
                }}>
                  <span className="material-symbols-outlined icon-fill" style={{ color: '#16a34a', fontSize: 32 }}>task_alt</span>
                </div>
                <h3 className="headline-sm" style={{ marginBottom: 4 }}>ORDER DETAILS READY!</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 13, marginBottom: 12 }}>
                  Your unique print request ID has been created.
                </p>
                <div style={{
                  background: '#fffbeb', border: '1px dashed #f59e0b', color: '#b45309',
                  padding: '10px 14px', borderRadius: 'var(--radius-lg)', fontSize: 13,
                  marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  fontWeight: 600
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18 }}>screenshot</span>
                  <span>Please take a screenshot of these details for reference!</span>
                </div>
                <div style={{ background: 'var(--surface-container-low)', padding: 18, borderRadius: 'var(--radius-lg)', marginBottom: 20, textAlign: 'left' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--on-surface-variant)' }}>REQUEST ID</span>
                    <span style={{ fontFamily: 'monospace', fontSize: 15, fontWeight: 800, color: 'var(--primary-container)', background: 'var(--primary-fixed)', padding: '2px 8px', borderRadius: 4 }}>
                      {createdOrder.request_id || createdOrder.id}
                    </span>
                  </div>
                  <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div><strong>Customer / Agency:</strong> {createdOrder.customer_name} ({createdOrder.customer_phone})</div>
                    {createdOrder.customer_email && <div><strong>Email:</strong> {createdOrder.customer_email}</div>}
                    <div><strong>Service:</strong> {createdOrder.service_name}</div>
                    <div><strong>File:</strong> {createdOrder.file_name}</div>
                    <div><strong>Total Amount:</strong> ₹{createdOrder.total_price} (Incl. GST)</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    className="btn btn-primary btn-full"
                    onClick={() => setSuccessModalStep('payment')}
                    style={{ height: 48, fontWeight: 700, fontSize: 15, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <span>Proceed to Payment 💳</span>
                    <span className="material-symbols-outlined" style={{ fontSize: 18 }}>arrow_forward</span>
                  </button>
                  <button
                    className="btn btn-outline btn-full"
                    onClick={() => { setCreatedOrder(null); setStep(1); setFile(null); setUploadedFile(null); }}
                  >
                    Place Another Print Request
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3 className="headline-sm" style={{ marginBottom: 4 }}>CHOOSE PAYMENT METHOD</h3>
                <p style={{ color: 'var(--on-surface-variant)', fontSize: 13, marginBottom: 16 }}>
                  Select how you would like to pay for your print request.
                </p>

                {/* Toggles */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                  <button
                    onClick={() => setPaymentMethod('online')}
                    className="btn"
                    style={{
                      flex: 1,
                      border: paymentMethod === 'online' ? '2.5px solid var(--primary)' : '1px solid var(--outline-variant)',
                      background: paymentMethod === 'online' ? 'var(--primary-container)' : 'transparent',
                      color: paymentMethod === 'online' ? 'var(--on-primary-container)' : 'var(--on-surface)',
                      fontWeight: 700, fontSize: 13.5, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    Online UPI / Bank
                  </button>
                  <button
                    onClick={() => setPaymentMethod('cod')}
                    className="btn"
                    style={{
                      flex: 1,
                      border: paymentMethod === 'cod' ? '2.5px solid var(--primary)' : '1px solid var(--outline-variant)',
                      background: paymentMethod === 'cod' ? 'var(--primary-container)' : 'transparent',
                      color: paymentMethod === 'cod' ? 'var(--on-primary-container)' : 'var(--on-surface)',
                      fontWeight: 700, fontSize: 13.5, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}
                  >
                    Cash on Delivery
                  </button>
                </div>

                {/* Content based on toggle */}
                {paymentMethod === 'online' ? (
                  <div style={{ background: 'var(--surface-container-low)', padding: 16, borderRadius: 'var(--radius-lg)', marginBottom: 20, textAlign: 'left' }}>
                    <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                      <div style={{ flex: 1, minWidth: 200, fontSize: 13, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <div style={{ fontWeight: 800, fontSize: 14, color: 'var(--primary)', marginBottom: 4 }}>Account Details</div>
                        <div><strong>Name:</strong> WINSTAR</div>
                        <div><strong>A/C No:</strong> 1314 02 00 000 1510</div>
                        <div><strong>IFSC Code:</strong> IOBA0001314</div>
                        <div><strong>Bank:</strong> Indian Overseas Bank</div>
                        <div><strong>Branch:</strong> FORT BRANCH, DINDIGUL</div>
                      </div>
                      
                      {/* Exact QR Code */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 auto' }}>
                        <img src="/qr_code.png" alt="Winstar UPI QR Code" style={{ width: 100, height: 100, objectFit: 'contain', background: '#fff', padding: 6, border: '1px solid var(--outline-variant)', borderRadius: 6 }} />
                        <span style={{ fontSize: 10, color: 'var(--on-surface-variant)', marginTop: 4, fontWeight: 700 }}>Scan to Pay</span>
                      </div>
                    </div>

                    {/* Terms T&C */}
                    <div style={{ marginTop: 14, paddingTop: 10, borderTop: '1px dashed var(--outline-variant)', fontSize: 11, color: 'var(--on-surface-variant)', lineHeight: 1.4 }}>
                      <div style={{ fontWeight: 700, marginBottom: 4 }}>Terms & Conditions:</div>
                      <div>• 100% payment in advance.</div>
                      <div>• Packing and forwarding charges extra.</div>
                      <div>• Approved orders cannot be altered or changed.</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ background: 'var(--surface-container-low)', padding: 24, borderRadius: 'var(--radius-lg)', marginBottom: 20, textAlign: 'center' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 12 }}>store</span>
                    <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>Pay at Counter or Delivery</div>
                    <p style={{ fontSize: 13, color: 'var(--on-surface-variant)', lineHeight: 1.5 }}>
                      Please keep cash or payment ready for pickup at our Winstar Printing store or pay upon courier arrival.
                    </p>
                  </div>
                )}

                {/* Instruction Warning */}
                <div style={{
                  background: '#f1f5f9', border: '1px solid #e2e8f0', color: '#334155',
                  padding: '10px 14px', borderRadius: 'var(--radius-md)', fontSize: 12.5,
                  marginBottom: 20, textAlign: 'left', lineHeight: 1.4
                }}>
                  ℹ️ <strong>Instruction:</strong> Please send the <strong>payment screenshot</strong> along with your <strong>Request ID</strong> on WhatsApp to initiate your printing job.
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <button
                    className="btn btn-full"
                    onClick={() => openWhatsApp(createdOrder)}
                    style={{ height: 48, background: '#25D366', color: '#fff', fontWeight: 700, fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
                  >
                    <span className="material-symbols-outlined" style={{ color: '#fff' }}>chat</span> CONTINUE TO WHATSAPP 📲
                  </button>
                  <button
                    className="btn btn-outline btn-full"
                    onClick={() => setSuccessModalStep('details')}
                    style={{ height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    Back to Order Details
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
