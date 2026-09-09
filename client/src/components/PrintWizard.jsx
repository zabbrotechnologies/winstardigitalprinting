import { useState, useRef, useEffect } from 'react';
import JSZip from 'jszip';
import { useAuth } from '../context/AuthContext';
import { createOrder, uploadPrintFile } from '../lib/orderService';
import { 
  WHOLESALE_PRICE_LIST, 
  BW_DOC_SIZES,
  BW_PRINT_PRICING,
  COLOR_DOC_SIZES,
  COLOR_PRINT_PRICING,
  VISITING_CARD_QUANTITIES,
  VISITING_CARD_TYPES,
  VISITING_CARD_PRICES,
  BROCHURES_FLYERS_DATA,
  BINDING_PRICES, 
  THERMAL_LAMINATION_PRICES,
  CUTTING_PRICES,
  STICKER_FINISHING_PRICES,
  THERMAL_LAMINATION_OPTIONS,
  CUTTING_OPTIONS,
  STICKER_OPTIONS,
  B2B_MEDIA_TYPES,
  B2B_MEDIA_TREE,
  B2B_CATEGORY_PRICE_MAP,
  getB2BCategories,
  getB2BSizes,
  getB2BGSMs,
  getBWPapers,
  getBWGSMs,
  getBWRow,
  getColorPapers,
  getColorGSMs,
  getColorRow,
  calculateB2BPrice,
  formatINR
} from '../lib/priceList';

const WINSTAR_PHONE = '919345046665'; 

const TOP_LEVEL_SERVICES = [
  { value: 'bw_print', label: 'Black & White / Grayscale Printout', icon: 'print' },
  { value: 'color_print', label: 'Colour Print', icon: 'palette' },
  { value: 'visiting_cards', label: 'Visiting / Business Cards', icon: 'badge' },
  { value: 'brochures_flyers', label: 'Brochures / Flyers / Bill Books', icon: 'menu_book' },
];

const BINDING_OPTIONS = ['No Binding', 'Chat Binding', 'Spiral Binding'];

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
  const [mobileSummaryOpen, setMobileSummaryOpen] = useState(false);

  const [customerName, setCustomerName] = useState(profile?.company_name || profile?.full_name || '');
  const [customerPhone, setCustomerPhone] = useState(profile?.mobile || profile?.phone || '');
  const [deliveryType, setDeliveryType] = useState('pickup');
  const [deliveryAddress, setDeliveryAddress] = useState(profile?.business_address || '');

  // B2B specific states
  const [b2bMediaType, setB2bMediaType] = useState('');
  const [b2bMediaCategory, setB2bMediaCategory] = useState('');
  const [b2bSize, setB2bSize] = useState('');
  const [b2bGsm, setB2bGsm] = useState('');
  const [b2bBothSides, setB2bBothSides] = useState(false);
  const [b2bThermalLamination, setB2bThermalLamination] = useState(false);
  const [b2bThermalLaminationType, setB2bThermalLaminationType] = useState('');
  const [b2bCutting, setB2bCutting] = useState(false);
  const [b2bCuttingType, setB2bCuttingType] = useState('');
  const [b2bSticker, setB2bSticker] = useState(false);
  const [b2bStickerType, setB2bStickerType] = useState('');
  const [b2bCopies, setB2bCopies] = useState(1);
  const [b2bInstructions, setB2bInstructions] = useState('');
  const [b2bPages, setB2bPages] = useState(null);
  const [uploadStatus, setUploadStatus] = useState('IDLE'); // 'IDLE' | 'SELECTED' | 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'ERROR'
  const [uploadError, setUploadError] = useState('');

  const [config, setConfig] = useState({
    service: 'bw_print',
    
    // Black & White fields
    bw_size: 'A4',
    bw_paper: 'Copier',
    bw_gsm: '70GSM',
    bw_side: 'Single Side',

    // Colour Print fields
    color_size: 'A4',
    color_paper: 'Paper',
    color_gsm: '100G',
    color_side: 'Single Side',
    
    // Visiting Card fields
    card_type: 'Art Board',
    card_side: 'Single Side',
    card_copies: 120,

    // Brochures / Flyers / Bill Books fields
    bf_product: 'Flyers',
    flyer_qty: 25,
    letterhead_paper: '100gsm',
    letterhead_sheets: 1,
    letterhead_pads: 1,
    billbook_pads: 1,

    // Common fields
    pages: 1,
    copies: 1,
    binding: 'No Binding',
    message_text: '',
    
    // Wholesale fields
    media: 'COATED',
    paper_gsm: '100',
  });

  // Only activate wholesale mode when explicitly passed via prop (e.g. inside Dashboard)
  const isWholesaleActive = Boolean(isWholesale);

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

  const handleB2BMediaTypeSelect = (typeLabel) => {
    setB2bMediaType(typeLabel);
    setB2bMediaCategory('');
    setB2bSize('');
    setB2bGsm('');
    setError('');
  };

  const handleB2BMediaCategoryChange = (category) => {
    setB2bMediaCategory(category);
    setB2bSize('');
    setB2bGsm('');
    setError('');
  };

  const handleB2BSizeChange = (sz) => {
    setB2bSize(sz);
    setB2bGsm('');
    setError('');
  };

  const handleB2BGsmChange = (gsm) => {
    setB2bGsm(gsm);
    setError('');
  };

  // Cascading handler for Black & White
  const handleBWSizeChange = (newSize) => {
    const papers = getBWPapers(newSize);
    const newPaper = papers.includes(config.bw_paper) ? config.bw_paper : papers[0] || 'Copier';
    const gsms = getBWGSMs(newSize, newPaper);
    const newGsm = gsms.includes(config.bw_gsm) ? config.bw_gsm : gsms[0] || '';
    const row = getBWRow(newSize, newPaper, newGsm);
    const newSide = (row?.fb === null) ? 'Single Side' : config.bw_side;
    const newBinding = ['A4', 'FS'].includes(newSize) ? config.binding : 'No Binding';

    setConfig(c => ({
      ...c,
      bw_size: newSize,
      bw_paper: newPaper,
      bw_gsm: newGsm,
      bw_side: newSide,
      binding: newBinding,
    }));
  };

  const handleBWPaperChange = (newPaper) => {
    const gsms = getBWGSMs(config.bw_size, newPaper);
    const newGsm = gsms.includes(config.bw_gsm) ? config.bw_gsm : gsms[0] || '';
    const row = getBWRow(config.bw_size, newPaper, newGsm);
    const newSide = (row?.fb === null) ? 'Single Side' : config.bw_side;

    setConfig(c => ({
      ...c,
      bw_paper: newPaper,
      bw_gsm: newGsm,
      bw_side: newSide,
    }));
  };

  const handleBWGsmChange = (newGsm) => {
    const row = getBWRow(config.bw_size, config.bw_paper, newGsm);
    const newSide = (row?.fb === null) ? 'Single Side' : config.bw_side;

    setConfig(c => ({
      ...c,
      bw_gsm: newGsm,
      bw_side: newSide,
    }));
  };

  // Cascading handler for Colour Printing
  const handleColorSizeChange = (newSize) => {
    const papers = getColorPapers(newSize);
    const newPaper = papers.includes(config.color_paper) ? config.color_paper : papers[0] || 'Paper';
    const gsms = getColorGSMs(newSize, newPaper);
    const newGsm = gsms.includes(config.color_gsm) ? config.color_gsm : gsms[0] || '';
    const row = getColorRow(newSize, newPaper, newGsm);
    const newSide = (row?.fb === null) ? 'Single Side' : config.color_side;
    const newBinding = newSize === 'A4' ? config.binding : 'No Binding';

    setConfig(c => ({
      ...c,
      color_size: newSize,
      color_paper: newPaper,
      color_gsm: newGsm,
      color_side: newSide,
      binding: newBinding,
    }));
  };

  const handleColorPaperChange = (newPaper) => {
    const gsms = getColorGSMs(config.color_size, newPaper);
    const newGsm = gsms.includes(config.color_gsm) ? config.color_gsm : gsms[0] || '';
    const row = getColorRow(config.color_size, newPaper, newGsm);
    const newSide = (row?.fb === null) ? 'Single Side' : config.color_side;

    setConfig(c => ({
      ...c,
      color_paper: newPaper,
      color_gsm: newGsm,
      color_side: newSide,
    }));
  };

  const handleColorGsmChange = (newGsm) => {
    const row = getColorRow(config.color_size, config.color_paper, newGsm);
    const newSide = (row?.fb === null) ? 'Single Side' : config.color_side;

    setConfig(c => ({
      ...c,
      color_gsm: newGsm,
      color_side: newSide,
    }));
  };

  // Enforce binding limits
  useEffect(() => {
    if (!isWholesaleActive) {
      const currentSize = config.service === 'bw_print' ? config.bw_size : (config.service === 'color_print' ? config.color_size : '');
      if (currentSize === 'A4' && config.pages > 500 && config.binding === 'Spiral Binding') {
        setConfig(c => ({ ...c, binding: 'No Binding' }));
      }
    }
  }, [config.pages, config.service, config.bw_size, config.color_size, isWholesaleActive, config.binding]);

// Helper to analyze and extract page/slide count from uploaded documents (PDF, Word DOCX/DOC, PowerPoint PPTX/PPT)
async function detectFilePages(file) {
  if (!file) return 1;
  const fileName = file.name ? file.name.toLowerCase() : '';
  const fileType = file.type ? file.type.toLowerCase() : '';

  const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
  const isDocx = fileName.endsWith('.docx') || fileType.includes('wordprocessingml');
  const isDoc = fileName.endsWith('.doc') || fileType === 'application/msword';
  const isPptx = fileName.endsWith('.pptx') || fileType.includes('presentationml');
  const isPpt = fileName.endsWith('.ppt') || fileType === 'application/vnd.ms-powerpoint';

  // 1. PDF Page Detection
  if (isPdf) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const text = new TextDecoder('latin1').decode(bytes);

      // Method 1: Look for /Type /Pages /Count (\d+)
      const countMatches = [...text.matchAll(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/g)];
      if (countMatches.length > 0) {
        const counts = countMatches.map(m => parseInt(m[1], 10)).filter(n => !isNaN(n) && n > 0);
        if (counts.length > 0) {
          return Math.max(...counts);
        }
      }

      // Method 2: Count distinct /Type /Page objects (excluding /Type /Pages)
      const pageMatches = text.match(/\/Type\s*\/Page\b(?!\s*s)/g);
      if (pageMatches && pageMatches.length > 0) {
        return pageMatches.length;
      }

      // Method 3: Fallback /Count (\d+)
      const generalCounts = [...text.matchAll(/\/Count\s+(\d+)/g)];
      if (generalCounts.length > 0) {
        const counts = generalCounts.map(m => parseInt(m[1], 10)).filter(n => !isNaN(n) && n > 0);
        if (counts.length > 0) {
          return Math.max(...counts);
        }
      }
    } catch (e) {
      console.warn('Could not parse PDF page count:', e);
    }
  }

  // 2. DOCX Word Document Page Detection
  if (isDocx) {
    try {
      const zip = await JSZip.loadAsync(file);

      let appPages = 0;
      let appWords = 0;

      // A. Check docProps/app.xml for <Pages>N</Pages> and <Words>N</Words>
      const appXmlFile = zip.file('docProps/app.xml') || zip.file(/[dD]oc[pP]rops\/app\.xml/i)?.[0];
      if (appXmlFile) {
        const appXmlText = await appXmlFile.async('text');
        const pagesMatch = appXmlText.match(/<(?:\w+:)?Pages>(\d+)<\/(?:\w+:)?Pages>/i);
        if (pagesMatch && parseInt(pagesMatch[1], 10) > 0) {
          appPages = parseInt(pagesMatch[1], 10);
        }
        const wordsMatch = appXmlText.match(/<(?:\w+:)?Words>(\d+)<\/(?:\w+:)?Words>/i);
        if (wordsMatch && parseInt(wordsMatch[1], 10) > 0) {
          appWords = parseInt(wordsMatch[1], 10);
        }
      }

      // B. Check word/document.xml for rendered page breaks, manual page breaks & sections
      let docBreaks = 0;
      const docXmlFile = zip.file('word/document.xml') || zip.file(/[wW]ord\/document\.xml/i)?.[0];
      if (docXmlFile) {
        const docXmlText = await docXmlFile.async('text');
        const lastRenderedBreaks = (docXmlText.match(/<w:lastRenderedPageBreak\b/g) || []).length;
        const manualPageBreaks = (docXmlText.match(/<w:br\b[^>]*?w:type="page"/g) || []).length;
        const sectionBreaks = (docXmlText.match(/<w:sectPr\b/g) || []).length;
        
        docBreaks = lastRenderedBreaks + manualPageBreaks;
        if (docBreaks > 0) {
          return Math.max(appPages, docBreaks + 1);
        }
        if (sectionBreaks > 1) {
          return Math.max(appPages, sectionBreaks);
        }
      }

      if (appPages > 0) {
        return appPages;
      }

      if (appWords > 350) {
        return Math.ceil(appWords / 350);
      }
    } catch (e) {
      console.warn('Could not parse DOCX page count:', e);
    }
  }

  // 3. PPTX PowerPoint Presentation Slide Detection
  if (isPptx) {
    try {
      const zip = await JSZip.loadAsync(file);

      // A. Check docProps/app.xml for <Slides>N</Slides>
      const appXmlFile = zip.file('docProps/app.xml') || zip.file(/[dD]oc[pP]rops\/app\.xml/i)?.[0];
      if (appXmlFile) {
        const appXmlText = await appXmlFile.async('text');
        const slidesMatch = appXmlText.match(/<(?:\w+:)?Slides>(\d+)<\/(?:\w+:)?Slides>/i);
        if (slidesMatch && parseInt(slidesMatch[1], 10) > 0) {
          return parseInt(slidesMatch[1], 10);
        }
      }

      // B. Count individual slide XML files in ppt/slides/
      const slideFiles = Object.keys(zip.files).filter(k => /^ppt\/slides\/slide\d+\.xml$/i.test(k));
      if (slideFiles.length > 0) {
        return slideFiles.length;
      }
    } catch (e) {
      console.warn('Could not parse PPTX slide count:', e);
    }
  }

  // 4. Legacy .DOC or .PPT Binary Fallback Parsing
  if (isDoc || isPpt) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      const text = new TextDecoder('latin1').decode(bytes);

      const pagesMatch = text.match(/<(?:\w+:)?Pages>(\d+)<\/(?:\w+:)?Pages>/i) ||
                         text.match(/<(?:\w+:)?Slides>(\d+)<\/(?:\w+:)?Slides>/i);
      if (pagesMatch && parseInt(pagesMatch[1], 10) > 0) {
        return parseInt(pagesMatch[1], 10);
      }
    } catch (e) {
      console.warn('Could not parse legacy binary document count:', e);
    }
  }

  return 1;
}

  const b2bPriceResult = calculateB2BPrice({
    mediaCategory: b2bMediaCategory,
    gsm: b2bGsm,
    size: b2bSize,
    bothSides: b2bBothSides,
    lamination: b2bThermalLamination,
    laminationType: b2bThermalLaminationType,
    cutting: b2bCutting,
    cuttingType: b2bCuttingType,
    sticker: b2bSticker,
    stickerType: b2bStickerType,
    deliveryType: deliveryType,
    copies: b2bCopies,
    pages: b2bPages,
    fileUploaded: Boolean(uploadedFile && uploadStatus === 'COMPLETED' && b2bPages && Number(b2bPages) > 0),
  });

  // Strict Sequential Validation for B2B Flow
  const isB2BStep1Valid = Boolean(
    b2bMediaType &&
    b2bMediaCategory &&
    b2bSize &&
    b2bGsm &&
    b2bCopies &&
    parseInt(b2bCopies, 10) >= 1 &&
    (!b2bThermalLamination || b2bThermalLaminationType) &&
    (!b2bCutting || b2bCuttingType) &&
    (!b2bSticker || b2bStickerType) &&
    b2bPriceResult.isPriceAvailable
  );

  const isB2BStep3Allowed = Boolean(
    isB2BStep1Valid &&
    file &&
    uploadedFile &&
    uploadStatus === 'COMPLETED' &&
    b2bPages !== null &&
    b2bPages !== undefined &&
    Number(b2bPages) > 0 &&
    !uploading &&
    !uploadError
  );

  function getCalculatedPrice() {
    let subtotal = 0;
    let printingTotal = 0;
    let bindingTotal = 0;
    let cuttingTotal = 0;
    
    if (isWholesaleActive) {
      return { 
        subtotal: (b2bPriceResult.printingPrice + b2bPriceResult.laminationPrice + b2bPriceResult.cuttingPrice + b2bPriceResult.stickerPrice).toFixed(2), 
        gst: '0.00', 
        grandTotal: b2bPriceResult.totalAmount.toFixed(2),
        printingTotal: b2bPriceResult.printingPrice.toFixed(2),
        bindingTotal: (b2bPriceResult.laminationPrice + b2bPriceResult.cuttingPrice + b2bPriceResult.stickerPrice).toFixed(2),
        cuttingTotal: b2bPriceResult.cuttingPrice.toFixed(2),
        courierCharge: b2bPriceResult.courierCharge.toFixed(2)
      };
    } else {
      const pages = Math.max(1, parseInt(config.pages) || 1);
      const copies = Math.max(1, parseInt(config.copies) || 1);

      if (config.service === 'bw_print') {
        const row = getBWRow(config.bw_size, config.bw_paper, config.bw_gsm);
        const isFB = config.bw_side === 'Front & Back' && row?.fb !== null;
        const rate = isFB ? (row?.fb ?? 0) : (row?.ss ?? 0);
        
        printingTotal = pages * rate * copies;

        let bindingRate = 0;
        if (['A4', 'FS'].includes(config.bw_size)) {
          if (config.binding === 'Chat Binding') {
            bindingRate = BINDING_PRICES['Chat Binding'][config.bw_size] || 0;
          } else if (config.binding === 'Spiral Binding') {
            const tiers = BINDING_PRICES['Spiral Binding'][config.bw_size] || [];
            const tier = tiers.find(t => pages >= t.min && pages <= t.max);
            bindingRate = tier ? tier.price : 0;
          }
        }
        bindingTotal = bindingRate * copies;

      } else if (config.service === 'color_print') {
        const row = getColorRow(config.color_size, config.color_paper, config.color_gsm);
        const isFB = config.color_side === 'Front & Back' && row?.fb !== null;
        
        if (isFB) {
          const rate = row?.fb ?? 0;
          const sheets = Math.ceil(pages / 2);
          printingTotal = sheets * rate * copies;
        } else {
          const rate = row?.single ?? 0;
          printingTotal = pages * rate * copies;
        }

        let bindingRate = 0;
        if (config.color_size === 'A4') {
          if (config.binding === 'Chat Binding') {
            bindingRate = BINDING_PRICES['Chat Binding']['A4'] || 8;
          } else if (config.binding === 'Spiral Binding') {
            const tiers = BINDING_PRICES['Spiral Binding']['A4'] || [];
            const tier = tiers.find(t => pages >= t.min && pages <= t.max);
            bindingRate = tier ? tier.price : 0;
          }
        }
        bindingTotal = bindingRate * copies;

      } else if (config.service === 'visiting_cards') {
        const typePrices = VISITING_CARD_PRICES[config.card_type] || VISITING_CARD_PRICES['Art Board'];
        const cardQty = parseInt(config.card_copies) || 120;
        const priceObj = typePrices.find(p => p.qty === cardQty) || typePrices[0];
        const baseRate = config.card_side === 'Front & Back' ? priceObj.double : priceObj.single;
        const cutoff = cardQty <= 510 ? 60 : 120;

        printingTotal = baseRate;
        cuttingTotal = cutoff;

      } else if (config.service === 'brochures_flyers') {
        if (config.bf_product === 'Flyers') {
          const flyerQty = parseInt(config.flyer_qty) || 25;
          const flyerOption = BROCHURES_FLYERS_DATA['Flyers'].quantities.find(q => q.qty === flyerQty) || BROCHURES_FLYERS_DATA['Flyers'].quantities[0];
          printingTotal = flyerOption.price * copies;
        } else if (config.bf_product === 'Letter Head') {
          if (config.letterhead_paper === '100gsm') {
            const sheets = Math.max(1, parseInt(config.letterhead_sheets) || 1);
            const tiers = BROCHURES_FLYERS_DATA['Letter Head']['100gsm'].tiers;
            const tier = tiers.find(t => sheets >= t.min && sheets <= t.max) || tiers[0];
            printingTotal = sheets * tier.unitPrice;
          } else {
            const pads = Math.max(1, parseInt(config.letterhead_pads) || 1);
            printingTotal = pads * 700;
          }
        } else if (config.bf_product === 'Bill Book') {
          const pads = Math.max(1, parseInt(config.billbook_pads) || 1);
          printingTotal = pads * 700;
        }
      }

      const courierCharge = deliveryType === 'courier' ? 30 : 0;
      const grandTotal = Math.round(printingTotal + bindingTotal + cuttingTotal + courierCharge);
      return { 
        subtotal: (printingTotal + bindingTotal + cuttingTotal).toFixed(2), 
        gst: '0.00', 
        grandTotal: grandTotal.toFixed(2),
        printingTotal: printingTotal.toFixed(2),
        bindingTotal: bindingTotal.toFixed(2),
        cuttingTotal: cuttingTotal.toFixed(2),
        courierCharge: courierCharge.toFixed(2)
      };
    }
  }

  const prices = getCalculatedPrice();

  // B2C Sequential Step Validations
  const isB2CStep1Complete = Boolean(
    file &&
    uploadedFile &&
    uploadStatus === 'COMPLETED' &&
    !uploading &&
    !uploadError &&
    config.pages > 0
  );

  const b2cCurrentSize = config.service === 'bw_print' ? config.bw_size : (config.service === 'color_print' ? config.color_size : '');
  const isB2CBindOverLimit = b2cCurrentSize === 'A4' && config.binding === 'Spiral Binding' && config.pages > 500;

  const isB2CStep2Complete = Boolean(
    isB2CStep1Complete &&
    parseFloat(prices.grandTotal) > 0 &&
    !isB2CBindOverLimit
  );

  async function handleFileSelect(selectedFile) {
    if (!selectedFile) return;
    setError('');
    setUploadError('');

    const fileName = (selectedFile.name || '').toLowerCase();
    const fileType = (selectedFile.type || '').toLowerCase();

    // Rejection for audio & video file types
    const isAudio = fileType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|aac|flac|wma|opus|amr|aiff|alac|mid|midi)$/i.test(fileName);
    const isVideo = fileType.startsWith('video/') || /\.(mp4|mkv|avi|mov|wmv|flv|webm|3gp|m4v|mpg|mpeg|ts|vob|ogv)$/i.test(fileName);

    if (isAudio || isVideo) {
      setFile(null);
      setUploadedFile(null);
      setB2bPages(null);
      setUploadStatus('ERROR');
      const errText = 'Audio and Video files are not supported. Please upload printable documents or images (PDF, CorelDRAW .CDR, DOCX, PSD, AI, JPG, PNG).';
      setUploadError(errText);
      setError(errText);
      return;
    }

    setFile(selectedFile);
    setUploadedFile(null);
    setB2bPages(null);
    setUploadStatus('UPLOADING');
    setUploading(true);

    try {
      // 1. Analyze and extract page count from uploaded document
      setUploadStatus('PROCESSING');
      const detectedPages = await detectFilePages(selectedFile);
      const safePages = (detectedPages && detectedPages > 0) ? detectedPages : 1;

      // 2. Upload file to backend
      const uploaded = await uploadPrintFile(selectedFile);
      if (!uploaded) {
        throw new Error('Upload failed. Please try again.');
      }

      setB2bPages(safePages);
      setConfig(c => ({ 
        ...c, 
        pages: safePages,
        letterhead_sheets: safePages
      }));
      setUploadedFile(uploaded);
      setUploadStatus('COMPLETED');
      setError('');
      setUploadError('');
    } catch (err) {
      console.warn('Upload / analysis error:', err);
      setUploadStatus('ERROR');
      const msg = err.message || 'Unable to analyze the file. Please upload another file.';
      setUploadError(msg);
      setError(msg);
      setUploadedFile(null);
      setB2bPages(null);
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

    if (isWholesaleActive) {
      if (!isB2BStep1Valid) {
        setError('Please complete all required Print Specification fields.');
        return;
      }
      if (!isB2BStep3Allowed || !uploadedFile || !b2bPages || uploadStatus !== 'COMPLETED') {
        setError('Please complete the file upload before submitting the order.');
        return;
      }
      if (!b2bPriceResult.isPriceAvailable || (!b2bPriceResult.waitingForFile && b2bPriceResult.totalAmount <= 0)) {
        setError(b2bPriceResult.errorMessage || 'Price unavailable for this specification. Please check your inputs or contact support.');
        return;
      }
    } else {
      if (!isB2CStep1Complete || !uploadedFile || uploadStatus !== 'COMPLETED') {
        setError('Please upload and complete file processing before submitting the order.');
        return;
      }
      if (!isB2CStep2Complete) {
        setError('Please complete your print specifications.');
        return;
      }
      if (parseFloat(prices.grandTotal) <= 0) {
        setError('Price unavailable for this specification. Please check your inputs or contact support.');
        return;
      }
    }

    if (!isWholesaleActive && isB2CBindOverLimit) {
      setError('Spiral Binding is not available for documents over 500 pages.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      const token = await getAccessToken();
      let serviceName = isWholesaleActive 
        ? `${b2bMediaType || 'B2B Printing'}${b2bMediaCategory ? ' - ' + b2bMediaCategory : ''}`
        : TOP_LEVEL_SERVICES.find(t => t.value === config.service)?.label;
      
      let normalPaperSize = config.paper_size;
      let normalPaperGsm = config.paper_gsm;
      let normalDoubleSided = config.double_sided;
      let normalCopies = config.copies;

      if (!isWholesaleActive) {
        if (config.service === 'bw_print') {
          normalPaperSize = config.bw_size;
          normalPaperGsm = `${config.bw_paper} ${config.bw_gsm}`;
          normalDoubleSided = config.bw_side === 'Front & Back';
          normalCopies = config.copies;
        } else if (config.service === 'color_print') {
          normalPaperSize = config.color_size;
          normalPaperGsm = `${config.color_paper} ${config.color_gsm}`;
          normalDoubleSided = config.color_side === 'Front & Back';
          normalCopies = config.copies;
        } else if (config.service === 'visiting_cards') {
          normalPaperSize = 'Standard Card';
          normalPaperGsm = config.card_type;
          normalDoubleSided = config.card_side === 'Front & Back';
          normalCopies = config.card_copies;
        } else if (config.service === 'brochures_flyers') {
          normalPaperSize = config.bf_product;
          normalPaperGsm = config.bf_product === 'Flyers' ? `${config.flyer_qty} pieces` : (config.bf_product === 'Letter Head' ? config.letterhead_paper : 'Executive Bond 100gsm');
          normalDoubleSided = false;
          normalCopies = config.bf_product === 'Flyers' ? config.copies : (config.bf_product === 'Letter Head' ? (config.letterhead_paper === '100gsm' ? config.letterhead_sheets : config.letterhead_pads) : config.billbook_pads);
        }
      }

      const payload = {
        customer_name: effectiveName,
        customer_phone: effectivePhone,
        customer_email: effectiveEmail,
        service_name: serviceName,
        media_type: isWholesaleActive ? b2bMediaType : '',
        media_category: isWholesaleActive ? b2bMediaCategory : '',
        paper_size: isWholesaleActive ? b2bSize : normalPaperSize,
        paper_gsm: isWholesaleActive ? b2bGsm : normalPaperGsm,
        double_sided: isWholesaleActive ? b2bBothSides : normalDoubleSided,
        pages: isWholesaleActive ? (b2bPages || 1) : config.pages,
        copies: isWholesaleActive ? b2bCopies : normalCopies,
        message_text: isWholesaleActive ? b2bInstructions : config.message_text,
        lamination: (isWholesaleActive && b2bThermalLamination && b2bThermalLaminationType) ? {
          enabled: true,
          type: b2bThermalLaminationType,
          price_per_side: THERMAL_LAMINATION_PRICES[b2bThermalLaminationType] || 0,
          total_price: b2bPriceResult.laminationPrice,
        } : null,
        thermal_lamination: (isWholesaleActive && b2bThermalLamination && b2bThermalLaminationType) ? {
          enabled: true,
          type: b2bThermalLaminationType,
          price_per_side: THERMAL_LAMINATION_PRICES[b2bThermalLaminationType] || 0,
          total_price: b2bPriceResult.laminationPrice,
        } : null,
        cutting: (isWholesaleActive && b2bCutting && b2bCuttingType) ? {
          enabled: true,
          type: b2bCuttingType,
          price: CUTTING_PRICES[b2bCuttingType] || 0,
          total_price: b2bPriceResult.cuttingPrice,
        } : (!isWholesaleActive && config.service === 'visiting_cards') ? {
          enabled: true,
          type: 'Visiting Card Cutting',
          price: prices.cuttingTotal,
        } : null,
        sticker: (isWholesaleActive && b2bSticker && b2bStickerType) ? {
          enabled: true,
          type: b2bStickerType,
          price: STICKER_FINISHING_PRICES[b2bStickerType] || 0,
          total_price: b2bPriceResult.stickerPrice,
        } : null,
        printing_price: isWholesaleActive ? b2bPriceResult.printingPrice : prices.printingTotal,
        lamination_price: isWholesaleActive ? b2bPriceResult.laminationPrice : 0,
        cutting_price: isWholesaleActive ? b2bPriceResult.cuttingPrice : prices.cuttingTotal,
        sticker_price: isWholesaleActive ? b2bPriceResult.stickerPrice : 0,
        file_name: uploadedFile?.fileName || file?.name || 'print-file.pdf',
        file_url: uploadedFile?.publicUrl || '',
        file_id: uploadedFile?.fileId || '',
        ...(!isWholesaleActive ? config : {}),
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'courier' ? deliveryAddress : '',
        courier_charge: isWholesaleActive ? b2bPriceResult.courierCharge : (deliveryType === 'courier' ? 30 : 0),
        order_type: isWholesaleActive ? 'wholesale' : 'normal',
        total_price: isWholesaleActive ? b2bPriceResult.totalAmount : prices.grandTotal,
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

      const thermLamType = order.thermal_lamination?.type || order.lamination?.type || (b2bThermalLamination ? b2bThermalLaminationType : '');
      const cuttingType = order.cutting?.type || (b2bCutting ? b2bCuttingType : '');
      const stickerType = order.sticker?.type || (b2bSticker ? b2bStickerType : '');
      const orderPages = order.pages || b2bPages || 1;
      const orderCopies = order.copies || b2bCopies || 1;
      const isCourier = (order.delivery_type || deliveryType) === 'courier';
      const courierCharge = order.courier_charge ?? (isCourier ? 30 : 0);
      const pPrice = order.printing_price ?? b2bPriceResult.printingPrice;
      const lPrice = order.lamination_price ?? b2bPriceResult.laminationPrice;
      const cPrice = order.cutting_price ?? b2bPriceResult.cuttingPrice;
      const sPrice = order.sticker_price ?? b2bPriceResult.stickerPrice;
      const tPrice = order.total_price ?? b2bPriceResult.totalAmount;

      textStr = `🖨️ *WINSTAR B2B PRINT ORDER* - *${reqId}*\n\n` +
        `🏢 *Agency / Client:* ${agencyName}\n` +
        `📧 *Registered Email:* ${registeredEmail}\n` +
        `📱 *Registered Phone:* ${registeredPhone}\n` +
        `📦 *Media Type:* ${order.media_type || b2bMediaType}\n` +
        `📄 *Media Category:* ${order.media_category || b2bMediaCategory}\n` +
        `📐 *Size:* ${order.paper_size || b2bSize}\n` +
        `⚖️ *GSM:* ${order.paper_gsm || b2bGsm} GSM\n` +
        `🔄 *Print Side:* ${(order.double_sided ?? b2bBothSides) ? 'Front & Back' : 'Single Side'}\n` +
        `📑 *Pages:* ${orderPages}\n` +
        `🔢 *Copies:* ${orderCopies}\n` +
        (thermLamType ? `✨ *Lamination:* ${thermLamType} (${formatINR(lPrice)})\n` : '') +
        (cuttingType ? `✂️ *Cutting:* ${cuttingType} (${formatINR(cPrice)})\n` : '') +
        (stickerType ? `🏷️ *Sticker Finishing:* ${stickerType} (${formatINR(sPrice)})\n` : '') +
        `🚚 *Delivery Method:* ${isCourier ? 'Courier Delivery' : 'Store Pickup'}\n` +
        (order.file_name ? `📂 *File Attached:* ${order.file_name}\n` : '') +
        ((order.message_text || b2bInstructions) ? `📝 *Customer Instructions:* ${order.message_text || b2bInstructions}\n` : '') +
        `\n💰 *PRICE ESTIMATION BREAKDOWN*\n` +
        `• Printing: ${formatINR(pPrice)}\n` +
        `• Lamination: ${formatINR(lPrice)}\n` +
        `• Cutting: ${formatINR(cPrice)}\n` +
        `• Sticker: ${formatINR(sPrice)}\n` +
        `• Courier: ${formatINR(courierCharge)}\n` +
        `\n💵 *TOTAL AMOUNT:* ${formatINR(tPrice)}\n\n` +
        `Please confirm my print job! Request ID: ${reqId}`;
    } else {
      textStr = `🖨️ *WINSTAR PRINT ORDER* - *${reqId}*\n\n` +
        `👤 *Customer:* ${order.customer_name} (${order.customer_phone})\n` +
        `📄 *Service:* ${order.service_name || TOP_LEVEL_SERVICES.find(t => t.value === config.service)?.label}\n`;
    }

    if (!isWholesaleActive) {
      if (order.service === 'bw_print' || config.service === 'bw_print') {
        textStr += `📂 *File:* ${order.file_name || file?.name || 'document.pdf'}\n` +
                   `📐 *Size:* ${config.bw_size}\n` +
                   `📄 *Paper:* ${config.bw_paper} (${config.bw_gsm})\n` +
                   `🔄 *Side:* ${config.bw_side}\n` +
                   `🔢 *Pages:* ${config.pages} | *Copies:* ${config.copies}\n` +
                   (config.binding && config.binding !== 'No Binding' ? `🔗 *Binding:* ${config.binding}\n` : '');
      } else if (order.service === 'color_print' || config.service === 'color_print') {
        textStr += `📂 *File:* ${order.file_name || file?.name || 'document.pdf'}\n` +
                   `📐 *Size:* ${config.color_size}\n` +
                   `📄 *Paper:* ${config.color_paper} (${config.color_gsm})\n` +
                   `🔄 *Side:* ${config.color_side}\n` +
                   `🔢 *Pages:* ${config.pages} | *Copies:* ${config.copies}\n` +
                   (config.binding && config.binding !== 'No Binding' ? `🔗 *Binding:* ${config.binding}\n` : '');
      } else if (order.service === 'visiting_cards' || config.service === 'visiting_cards') {
        textStr += `🪪 *Card Type:* ${config.card_type}\n` +
                   `📐 *Side:* ${config.card_side}\n` +
                   `🔢 *Quantity:* ${config.card_copies} cards\n` +
                   `✂️ *Cutting Charge:* ₹${prices.cuttingTotal}\n`;
      } else if (order.service === 'brochures_flyers' || config.service === 'brochures_flyers') {
        textStr += `📦 *Product:* ${config.bf_product}\n`;
        if (config.bf_product === 'Flyers') {
          textStr += `🔢 *Quantity:* ${config.flyer_qty} pieces (x${config.copies} sets)\n`;
        } else if (config.bf_product === 'Letter Head') {
          textStr += `📄 *Paper:* ${config.letterhead_paper}\n` +
                     `🔢 *Quantity:* ${config.letterhead_paper === '100gsm' ? `${config.letterhead_sheets} sheets` : `${config.letterhead_pads} pads (100 sheets/pad)`}\n`;
        } else if (config.bf_product === 'Bill Book') {
          textStr += `📄 *Paper:* Executive Bond 100gsm\n` +
                     `🔢 *Quantity:* ${config.billbook_pads} pads (100 sheets/pad)\n`;
        }
        if (order.file_name || file?.name) textStr += `📂 *File:* ${order.file_name || file?.name}\n`;
      }

      if (order.message_text || config.message_text) {
        textStr += `📝 *Instructions:* ${order.message_text || config.message_text}\n`;
      }
    }

    textStr += `🚚 *Delivery:* ${order.delivery_type === 'courier' ? 'Courier: ' + (order.delivery_address || deliveryAddress) : 'Store Pickup'}\n`;
    textStr += (order.order_type === 'wholesale' || isWholesaleActive)
      ? `💰 *Total Amount:* ${formatINR(order.total_price || b2bPriceResult.totalAmount)}\n\n`
      : `💰 *Total Amount:* ₹${order.total_price}\n\n`;
    
    textStr += `Please confirm my print job! Request ID: ${reqId}`;

    const text = encodeURIComponent(textStr);
    window.open(`https://wa.me/${WINSTAR_PHONE}?text=${text}`, '_blank');
  }

  return (
    <div id="quick-print" className="card print-wizard-card animate-fade-in">
      {isWholesaleActive && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          background: '#dcfce7', color: '#166534', padding: '10px 16px',
          borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14, fontWeight: 700,
        }}>
          <span className="material-symbols-outlined">verified</span>
          B2B PRINTING ORDER PORTAL — High Quality Commercial Press
        </div>
      )}

      <div className="wizard-tabs">
        {(isWholesaleActive ? [
          { stepNum: 1, label: '1. Print Spec.', icon: 'tune' },
          { stepNum: 2, label: '2. Upload', icon: 'cloud_upload' },
          { stepNum: 3, label: '3. WhatsApp', icon: 'chat' },
        ] : [
          { stepNum: 1, label: '1. Upload File', icon: 'cloud_upload' },
          { stepNum: 2, label: '2. Print Specs', icon: 'tune' },
          { stepNum: 3, label: '3. Customer & WhatsApp', icon: 'chat' },
        ]).map(s => {
          let isLocked = false;
          if (isWholesaleActive) {
            if (s.stepNum === 2 && !isB2BStep1Valid) isLocked = true;
            if (s.stepNum === 3 && !isB2BStep3Allowed) isLocked = true;
          } else {
            if (s.stepNum === 2 && !isB2CStep1Complete) isLocked = true;
            if (s.stepNum === 3 && !isB2CStep2Complete) isLocked = true;
          }

          return (
            <button
              key={s.stepNum}
              className={`wizard-tab-btn ${isLocked ? 'is-locked' : ''}`}
              disabled={isLocked}
              onClick={() => {
                if (isWholesaleActive) {
                  if (s.stepNum === 2 && !isB2BStep1Valid) {
                    if (!b2bMediaType) setError('Please select a Media Type.');
                    else if (!b2bMediaCategory) setError('Please select a Media Category.');
                    else if (!b2bSize) setError('Please select a Size.');
                    else if (!b2bGsm) setError('Please select a GSM.');
                    else if (b2bThermalLamination && !b2bThermalLaminationType) setError('Please select a lamination type.');
                    else if (b2bCutting && !b2bCuttingType) setError('Please select a cutting option.');
                    else if (b2bSticker && !b2bStickerType) setError('Please select a sticker finishing option.');
                    else if (!b2bPriceResult.isPriceAvailable) setError('Price unavailable for this selection.');
                    return;
                  }
                  if (s.stepNum === 3 && !isB2BStep3Allowed) {
                    if (!isB2BStep1Valid) {
                      setError('Please complete the Print Specification before proceeding to WhatsApp.');
                    } else if (uploading || uploadStatus === 'UPLOADING' || uploadStatus === 'PROCESSING') {
                      setError('Please wait for document upload and analysis to complete.');
                    } else if (!uploadedFile || !b2bPages || uploadStatus !== 'COMPLETED') {
                      setError('Please complete the file upload before continuing to WhatsApp.');
                    }
                    return;
                  }
                } else {
                  if (s.stepNum === 2 && !isB2CStep1Complete) {
                    if (uploading || uploadStatus === 'UPLOADING' || uploadStatus === 'PROCESSING') {
                      setError('Please wait for document upload and analysis to complete.');
                    } else {
                      setError('Please upload and complete file processing before continuing to Print Specs.');
                    }
                    return;
                  }
                  if (s.stepNum === 3 && !isB2CStep2Complete) {
                    if (!isB2CStep1Complete) {
                      setError('Please upload and complete file processing first.');
                    } else if (isB2CBindOverLimit) {
                      setError('Spiral Binding is not available for documents over 500 pages.');
                    } else {
                      setError('Please complete your print specifications before continuing to WhatsApp.');
                    }
                    return;
                  }
                }
                setStep(s.stepNum);
                setError('');
              }}
              style={{
                color: step === s.stepNum ? 'var(--primary-container)' : isLocked ? 'var(--outline)' : 'var(--on-surface-variant)',
                borderBottom: step === s.stepNum ? '2.5px solid var(--primary-container)' : '2.5px solid transparent',
                cursor: isLocked ? 'not-allowed' : 'pointer',
                opacity: isLocked ? 0.55 : 1,
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 18 }}>
                {isLocked && s.stepNum > 1 ? 'lock' : s.icon}
              </span>
              <span>{s.label}</span>
              {isLocked && (
                <span className="material-symbols-outlined" style={{ fontSize: 14, marginLeft: 2, verticalAlign: 'middle' }}>
                  lock
                </span>
              )}
            </button>
          );
        })}
      </div>

      {error && (
        <div style={{ background: 'var(--error-container)', color: 'var(--on-error-container)', padding: '12px 16px', borderRadius: 'var(--radius-md)', marginBottom: 24, fontSize: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      <div className="print-wizard-grid">
        <div style={{ minWidth: 0 }}>
          {/* ========================================================================= */}
          {/* B2B FLOW: 1. Print Spec. -> 2. Upload -> 3. WhatsApp                      */}
          {/* ========================================================================= */}
          {isWholesaleActive ? (
            <>
              {/* B2B STEP 1: PRINT SPECIFICATION */}
              {step === 1 && (
                <div className="animate-fade-in">
                  <div style={{ marginBottom: 20 }}>
                    <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 4, color: 'var(--on-surface)' }}>
                      Step 1: Print Specifications
                    </h3>
                    <p className="body-sm" style={{ color: 'var(--on-surface-variant)' }}>
                      Configure your media type, category, size, and print options.
                    </p>
                  </div>

                  {/* 1. MEDIA TYPE (3x2 Visual Tiles Grid) */}
                  <div style={{ marginBottom: 24 }}>
                    <label className="label" style={{ fontWeight: 700, fontSize: 14, marginBottom: 10, display: 'block' }}>
                      1. Media Type <span style={{ color: 'var(--primary-container)' }}>*</span>
                    </label>
                    <div className="b2b-media-grid">
                      {B2B_MEDIA_TYPES.map(type => {
                        const isSelected = b2bMediaType === type.label;
                        return (
                          <button
                            key={type.id}
                            type="button"
                            className="b2b-media-tile"
                            onClick={() => handleB2BMediaTypeSelect(type.label)}
                            style={{
                              border: isSelected ? '2px solid var(--primary-container)' : '1.5px solid var(--surface-container-high)',
                              background: isSelected ? 'var(--primary-fixed)' : 'var(--surface-container-lowest)',
                              color: isSelected ? 'var(--on-primary-fixed-variant)' : 'var(--on-surface)',
                              boxShadow: isSelected ? '0 4px 14px rgba(183,0,17,0.12)' : 'var(--shadow-card)',
                            }}
                          >
                            {isSelected && (
                              <span
                                className="material-symbols-outlined icon-fill"
                                style={{
                                  position: 'absolute',
                                  top: 8,
                                  right: 8,
                                  fontSize: 18,
                                  color: 'var(--primary-container)',
                                }}
                              >
                                check_circle
                              </span>
                            )}
                            <span
                              className="material-symbols-outlined"
                              style={{
                                fontSize: 28,
                                color: isSelected ? 'var(--primary-container)' : 'var(--on-surface-variant)',
                              }}
                            >
                              {type.icon}
                            </span>
                            <span style={{ fontSize: 13.5, fontWeight: isSelected ? 800 : 600, lineHeight: 1.25 }}>
                              {type.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. MEDIA CATEGORY (Horizontal Dropdown below tiles) */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="label" style={{ fontWeight: 700 }}>
                      2. Select Media <span style={{ color: 'var(--primary-container)' }}>*</span>
                    </label>
                    <select
                      className="select"
                      disabled={!b2bMediaType}
                      value={b2bMediaCategory}
                      onChange={e => handleB2BMediaCategoryChange(e.target.value)}
                      style={{
                        padding: '13px 14px',
                        fontSize: 15,
                        background: !b2bMediaType ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
                        cursor: !b2bMediaType ? 'not-allowed' : 'pointer',
                        opacity: !b2bMediaType ? 0.6 : 1,
                      }}
                    >
                      <option value="">Select Media</option>
                      {getB2BCategories(b2bMediaType).map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* 3. SIZE (Conditional Dropdown) */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="label" style={{ fontWeight: 700 }}>
                      3. Select Size <span style={{ color: 'var(--primary-container)' }}>*</span>
                    </label>
                    <select
                      className="select"
                      disabled={!b2bMediaCategory}
                      value={b2bSize}
                      onChange={e => handleB2BSizeChange(e.target.value)}
                      style={{
                        padding: '13px 14px',
                        fontSize: 15,
                        background: !b2bMediaCategory ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
                        cursor: !b2bMediaCategory ? 'not-allowed' : 'pointer',
                        opacity: !b2bMediaCategory ? 0.6 : 1,
                      }}
                    >
                      <option value="">Select Size</option>
                      {getB2BSizes(b2bMediaType, b2bMediaCategory).map(sz => (
                        <option key={sz} value={sz}>{sz}</option>
                      ))}
                    </select>
                  </div>

                  {/* 4. GSM (Conditional Dropdown directly below Size) */}
                  <div className="form-group" style={{ marginBottom: 20 }}>
                    <label className="label" style={{ fontWeight: 700 }}>
                      4. Select GSM <span style={{ color: 'var(--primary-container)' }}>*</span>
                    </label>
                    <select
                      className="select"
                      disabled={!b2bSize}
                      value={b2bGsm}
                      onChange={e => handleB2BGsmChange(e.target.value)}
                      style={{
                        padding: '13px 14px',
                        fontSize: 15,
                        background: !b2bSize ? 'var(--surface-container-low)' : 'var(--surface-container-lowest)',
                        cursor: !b2bSize ? 'not-allowed' : 'pointer',
                        opacity: !b2bSize ? 0.6 : 1,
                      }}
                    >
                      <option value="">Select GSM</option>
                      {getB2BGSMs(b2bMediaType, b2bMediaCategory, b2bSize).map(gsm => (
                        <option key={gsm} value={gsm}>{gsm} GSM</option>
                      ))}
                    </select>
                  </div>

                  {/* 5. PRINT ON BOTH SIDES */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14.5, fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={b2bBothSides}
                        onChange={e => setB2bBothSides(e.target.checked)}
                        style={{ width: 18, height: 18, accentColor: 'var(--primary-container)', cursor: 'pointer' }}
                      />
                      <span>Print on Both Sides</span>
                    </label>
                  </div>

                  {/* 6. LAMINATION */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14.5, fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={b2bThermalLamination}
                        onChange={e => {
                          const checked = e.target.checked;
                          setB2bThermalLamination(checked);
                          if (!checked) {
                            setB2bThermalLaminationType('');
                          }
                          setError('');
                        }}
                        style={{ width: 18, height: 18, accentColor: 'var(--primary-container)', cursor: 'pointer' }}
                      />
                      <span>Lamination</span>
                    </label>

                    {b2bThermalLamination && (
                      <div className="form-group animate-fade-in" style={{ marginTop: 10, marginLeft: 28, maxWidth: 360 }}>
                        <select
                          className="select"
                          value={b2bThermalLaminationType}
                          onChange={e => {
                            setB2bThermalLaminationType(e.target.value);
                            setError('');
                          }}
                          style={{ padding: '11px 14px', fontSize: 14 }}
                        >
                          <option value="">Select Lamination</option>
                          {THERMAL_LAMINATION_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>
                              {opt} (₹{THERMAL_LAMINATION_PRICES[opt]}/side)
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 7. CUTTING */}
                  <div style={{ marginBottom: 16 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14.5, fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={b2bCutting}
                        onChange={e => {
                          const checked = e.target.checked;
                          setB2bCutting(checked);
                          if (!checked) {
                            setB2bCuttingType('');
                          }
                          setError('');
                        }}
                        style={{ width: 18, height: 18, accentColor: 'var(--primary-container)', cursor: 'pointer' }}
                      />
                      <span>Cutting</span>
                    </label>

                    {b2bCutting && (
                      <div className="form-group animate-fade-in" style={{ marginTop: 10, marginLeft: 28, maxWidth: 360 }}>
                        <select
                          className="select"
                          value={b2bCuttingType}
                          onChange={e => {
                            setB2bCuttingType(e.target.value);
                            setError('');
                          }}
                          style={{ padding: '11px 14px', fontSize: 14 }}
                        >
                          <option value="">Select Cutting</option>
                          {CUTTING_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>
                              {opt} (₹{CUTTING_PRICES[opt]})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 8. STICKER */}
                  <div style={{ marginBottom: 20 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14.5, fontWeight: 600 }}>
                      <input
                        type="checkbox"
                        checked={b2bSticker}
                        onChange={e => {
                          const checked = e.target.checked;
                          setB2bSticker(checked);
                          if (!checked) {
                            setB2bStickerType('');
                          }
                          setError('');
                        }}
                        style={{ width: 18, height: 18, accentColor: 'var(--primary-container)', cursor: 'pointer' }}
                      />
                      <span>Sticker</span>
                    </label>

                    {b2bSticker && (
                      <div className="form-group animate-fade-in" style={{ marginTop: 10, marginLeft: 28, maxWidth: 360 }}>
                        <select
                          className="select"
                          value={b2bStickerType}
                          onChange={e => {
                            setB2bStickerType(e.target.value);
                            setError('');
                          }}
                          style={{ padding: '11px 14px', fontSize: 14 }}
                        >
                          <option value="">Select Sticker</option>
                          {STICKER_OPTIONS.map(opt => (
                            <option key={opt} value={opt}>
                              {opt} (₹{STICKER_FINISHING_PRICES[opt]})
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  {/* 9. NUMBER OF COPIES (Numeric quantity with increment/decrement) */}
                  <div className="form-group" style={{ marginBottom: 20, maxWidth: 260 }}>
                    <label className="label" style={{ fontWeight: 700 }}>
                      9. Number of Copies <span style={{ color: 'var(--primary-container)' }}>*</span>
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setB2bCopies(prev => Math.max(1, (parseInt(prev) || 1) - 1))}
                        style={{ width: 44, height: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, borderRadius: 'var(--radius-md)' }}
                      >
                        –
                      </button>
                      <input
                        type="number"
                        min="1"
                        className="input"
                        value={b2bCopies}
                        onChange={e => {
                          const val = parseInt(e.target.value);
                          setB2bCopies(isNaN(val) || val < 1 ? 1 : val);
                        }}
                        style={{ textAlign: 'center', height: 42, fontSize: 16, fontWeight: 700 }}
                      />
                      <button
                        type="button"
                        className="btn btn-outline"
                        onClick={() => setB2bCopies(prev => (parseInt(prev) || 1) + 1)}
                        style={{ width: 44, height: 42, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, borderRadius: 'var(--radius-md)' }}
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* 10. CUSTOMER INSTRUCTIONS (max 200 chars with live counter) */}
                  <div className="form-group" style={{ marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                      <label className="label" style={{ fontWeight: 700, margin: 0 }}>
                        10. Customer Instructions
                      </label>
                      <span style={{ fontSize: 12, color: b2bInstructions.length >= 200 ? 'var(--error)' : 'var(--on-surface-variant)', fontWeight: 600 }}>
                        {b2bInstructions.length} / 200
                      </span>
                    </div>
                    <textarea
                      className="textarea"
                      rows={3}
                      maxLength={200}
                      placeholder="Enter any special printing instructions..."
                      value={b2bInstructions}
                      onChange={e => setB2bInstructions(e.target.value.slice(0, 200))}
                    />
                  </div>

                  {/* NEXT BUTTON */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 28 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!isB2BStep1Valid}
                      onClick={() => {
                        if (!b2bMediaType) {
                          setError('Please select a Media Type.');
                          return;
                        }
                        if (!b2bMediaCategory) {
                          setError('Please select a Media Category.');
                          return;
                        }
                        if (!b2bSize) {
                          setError('Please select a Size.');
                          return;
                        }
                        if (!b2bGsm) {
                          setError('Please select a GSM.');
                          return;
                        }
                        if (!b2bCopies || parseInt(b2bCopies) < 1) {
                          setError('Please enter a valid Number of Copies (minimum 1).');
                          return;
                        }
                        if (b2bThermalLamination && !b2bThermalLaminationType) {
                          setError('Please select a lamination type.');
                          return;
                        }
                        if (b2bCutting && !b2bCuttingType) {
                          setError('Please select a cutting option.');
                          return;
                        }
                        if (b2bSticker && !b2bStickerType) {
                          setError('Please select a sticker finishing option.');
                          return;
                        }
                        if (!b2bPriceResult.isPriceAvailable) {
                          setError('Price unavailable for this selection.');
                          return;
                        }
                        setError('');
                        setStep(2);
                      }}
                      style={{
                        padding: '12px 24px', fontSize: 15, fontWeight: 700,
                        opacity: !isB2BStep1Valid ? 0.6 : 1,
                        cursor: !isB2BStep1Valid ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next: Upload <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* B2B STEP 2: FILE UPLOAD */}
              {step === 2 && (
                <div>
                  <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>Step 2: Upload Your Print File</h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                    Supports PDF, Word (.DOCX, .DOC), PowerPoint (.PPTX, .PPT), CorelDRAW (.CDR), PSD, AI, JPG, and PNG up to 50MB.
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
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.psd,.ai,.cdr,application/x-cdr,application/cdr,application/vnd.corel-draw,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.ms-powerpoint"
                      onChange={e => handleFileSelect(e.target.files?.[0])}
                    />
                    <span className="material-symbols-outlined icon-fill" style={{ fontSize: 54, color: 'var(--primary-container)', marginBottom: 12 }}>
                      cloud_upload
                    </span>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                      {file ? file.name : 'Click to Browse or Drag & Drop File'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                      {uploading || uploadStatus === 'PROCESSING' || uploadStatus === 'UPLOADING'
                        ? 'Analyzing document pages & uploading...'
                        : (uploadStatus === 'COMPLETED' && file && uploadedFile && b2bPages)
                          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • ${b2bPages} Page${b2bPages > 1 ? 's' : ''} detected • Upload complete • Click to replace`
                          : (uploadStatus === 'ERROR')
                            ? 'Upload failed. Please click to try again.'
                            : 'Instant automatic file upload & page count analysis (PDF, Word, PPT, Images)'}
                    </div>
                    {(uploading || uploadStatus === 'UPLOADING' || uploadStatus === 'PROCESSING') && (
                      <div className="spinner" style={{ width: 24, height: 24, margin: '16px auto 0' }} />
                    )}
                  </div>

                  {error && (
                    <div className="animate-fade-in" style={{
                      marginTop: 16, padding: '14px 16px', borderRadius: 'var(--radius-md)',
                      background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b',
                      fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <span className="material-symbols-outlined icon-fill" style={{ color: '#ef4444', fontSize: 22, flexShrink: 0 }}>error</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <div className="wizard-nav-actions">
                    <button className="btn btn-outline" onClick={() => setStep(1)}>
                      <span className="material-symbols-outlined">arrow_back</span> Back to Print Spec
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={!isB2BStep3Allowed}
                      onClick={() => {
                        if (!isB2BStep3Allowed) {
                          if (uploading || uploadStatus === 'UPLOADING' || uploadStatus === 'PROCESSING') {
                            setError('Please wait for document upload and analysis to complete.');
                          } else {
                            setError('Please complete the file upload before continuing to WhatsApp.');
                          }
                          return;
                        }
                        setError('');
                        setStep(3);
                      }}
                      style={{
                        opacity: !isB2BStep3Allowed ? 0.6 : 1,
                        cursor: !isB2BStep3Allowed ? 'not-allowed' : 'pointer'
                      }}
                    >
                      Next: WhatsApp <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* B2B STEP 3: WHATSAPP & ORDER PLACEMENT */}
              {step === 3 && (
                <div>
                  <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>Step 3: WhatsApp Order Submission</h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                    Your authenticated B2B account details will be attached to this order and submitted via WhatsApp.
                  </p>

                  <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                    <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>
                        <span className="material-symbols-outlined">arrow_back</span> Back
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ flex: 1, height: 'auto', minHeight: 52, padding: '12px 16px', fontSize: 15, background: '#25D366', borderColor: '#25D366', color: '#fff', whiteSpace: 'normal', lineHeight: 1.3 }}
                      >
                        {submitting ? (
                          <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                        ) : (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>chat</span>
                            <span>SUBMIT B2B ORDER & OPEN WHATSAPP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          ) : (
            /* ========================================================================= */
            /* RETAIL FLOW: 1. Upload File -> 2. Print Specs -> 3. Customer & WhatsApp   */
            /* ========================================================================= */
            <>
              {/* RETAIL STEP 1 */}
              {step === 1 && (
                <div>
                  <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>Step 1: Upload Your Print File</h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                    Supports PDF, Word (.DOCX, .DOC), PowerPoint (.PPTX, .PPT), CorelDRAW (.CDR), PSD, AI, JPG, and PNG up to 50MB.
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
                      accept=".pdf,.doc,.docx,.ppt,.pptx,.png,.jpg,.jpeg,.psd,.ai,.cdr,application/x-cdr,application/cdr,application/vnd.corel-draw,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.presentationml.presentation,application/msword,application/vnd.ms-powerpoint"
                      onChange={e => handleFileSelect(e.target.files?.[0])}
                    />
                    <span className="material-symbols-outlined icon-fill" style={{ fontSize: 54, color: 'var(--primary-container)', marginBottom: 12 }}>
                      cloud_upload
                    </span>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>
                      {file ? file.name : 'Click to Browse or Drag & Drop File'}
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--on-surface-variant)' }}>
                      {uploading || uploadStatus === 'PROCESSING' || uploadStatus === 'UPLOADING'
                        ? 'Analyzing document pages & uploading...'
                        : (uploadStatus === 'COMPLETED' && file && uploadedFile)
                          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB • ${config.pages} Page${config.pages > 1 ? 's' : ''} detected • Upload complete • Click to replace`
                          : (uploadStatus === 'ERROR')
                            ? 'Upload failed. Please click to try again.'
                            : 'Instant automatic file upload & page count analysis (PDF, Word, PowerPoint, Images)'}
                    </div>
                    {(uploading || uploadStatus === 'UPLOADING' || uploadStatus === 'PROCESSING') && (
                      <div className="spinner" style={{ width: 24, height: 24, margin: '16px auto 0' }} />
                    )}
                  </div>

                  {error && (
                    <div className="animate-fade-in" style={{
                      marginTop: 16, padding: '14px 16px', borderRadius: 'var(--radius-md)',
                      background: '#fee2e2', border: '1px solid #f87171', color: '#991b1b',
                      fontSize: 14, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 10
                    }}>
                      <span className="material-symbols-outlined icon-fill" style={{ color: '#ef4444', fontSize: 22, flexShrink: 0 }}>error</span>
                      <span>{error}</span>
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
                    <button
                      type="button"
                      className="btn btn-primary"
                      disabled={!isB2CStep1Complete}
                      onClick={() => {
                        if (!isB2CStep1Complete) {
                          if (uploading || uploadStatus === 'UPLOADING' || uploadStatus === 'PROCESSING') {
                            setError('Please wait for document upload and analysis to complete.');
                          } else {
                            setError('Please upload and complete file processing before continuing to Print Specs.');
                          }
                          return;
                        }
                        setError('');
                        setStep(2);
                      }}
                      style={{
                        opacity: !isB2CStep1Complete ? 0.6 : 1,
                        cursor: !isB2CStep1Complete ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next: Configure Print <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* RETAIL STEP 2 */}
              {step === 2 && (
                <div>
                  <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 16 }}>Step 2: Specifications</h3>

                  {/* 1. TOP-LEVEL SERVICE SELECTOR (2x2 mini-box layout) */}
                  <div style={{ marginBottom: 20 }}>
                    <label className="label">Top-Level Service</label>
                    <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                      {TOP_LEVEL_SERVICES.map(ts => (
                        <button
                          key={ts.value}
                          type="button"
                          onClick={() => {
                            setConfig(c => {
                              let next = { ...c, service: ts.value };
                              if (ts.value === 'bw_print') {
                                next.bw_size = 'A4';
                                next.bw_paper = 'Copier';
                                next.bw_gsm = '70GSM';
                                next.bw_side = 'Single Side';
                              } else if (ts.value === 'color_print') {
                                next.color_size = 'A4';
                                next.color_paper = 'Paper';
                                next.color_gsm = '100G';
                                next.color_side = 'Single Side';
                              } else if (ts.value === 'visiting_cards') {
                                next.card_type = 'Art Board';
                                next.card_side = 'Single Side';
                                next.card_copies = 120;
                              } else if (ts.value === 'brochures_flyers') {
                                next.bf_product = 'Flyers';
                                next.flyer_qty = 25;
                              }
                              return next;
                            });
                          }}
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

                  {/* 2. BLACK & WHITE / GRAYSCALE PRINTING */}
                  {config.service === 'bw_print' && (
                    <div className="animate-fade-in">
                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Sheet Size</label>
                          <select className="select" value={config.bw_size} onChange={e => handleBWSizeChange(e.target.value)}>
                            {BW_DOC_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Paper Type</label>
                          <select className="select" value={config.bw_paper} onChange={e => handleBWPaperChange(e.target.value)}>
                            {getBWPapers(config.bw_size).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">GSM / Thickness</label>
                          {getBWGSMs(config.bw_size, config.bw_paper).length > 1 ? (
                            <select className="select" value={config.bw_gsm} onChange={e => handleBWGsmChange(e.target.value)}>
                              {getBWGSMs(config.bw_size, config.bw_paper).map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="input"
                              value={config.bw_gsm || getBWGSMs(config.bw_size, config.bw_paper)[0] || 'Standard GSM'}
                              disabled
                              readOnly
                              style={{ background: 'var(--surface-container-low)', cursor: 'not-allowed', opacity: 0.85 }}
                            />
                          )}
                        </div>
                        <div className="form-group">
                          <label className="label">Printing Side</label>
                          {getBWRow(config.bw_size, config.bw_paper, config.bw_gsm)?.fb !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="bw_side"
                                  checked={config.bw_side === 'Single Side'}
                                  onChange={() => setConfig(c => ({ ...c, bw_side: 'Single Side' }))}
                                />
                                Single Side
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="bw_side"
                                  checked={config.bw_side === 'Front & Back'}
                                  onChange={() => setConfig(c => ({ ...c, bw_side: 'Front & Back' }))}
                                />
                                Front & Back
                              </label>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                              Single Side Only
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Number of Pages</label>
                          <input
                            type="number"
                            min="1"
                            className="input"
                            value={config.pages}
                            onChange={e => setConfig(c => ({ ...c, pages: Math.max(1, parseInt(e.target.value) || 1) }))}
                          />
                        </div>
                        <div className="form-group">
                          <label className="label">Number of Copies</label>
                          <input
                            type="number"
                            min="1"
                            className="input"
                            value={config.copies}
                            onChange={e => setConfig(c => ({ ...c, copies: Math.max(1, parseInt(e.target.value) || 1) }))}
                          />
                        </div>
                      </div>

                      {['A4', 'FS'].includes(config.bw_size) && (
                        <div className="form-group" style={{ marginBottom: 16 }}>
                          <label className="label">Binding Add-on</label>
                          <select className="select" value={config.binding} onChange={e => setConfig(c => ({ ...c, binding: e.target.value }))}>
                            {BINDING_OPTIONS.map(b => {
                              const disabled = b === 'Spiral Binding' && config.bw_size === 'A4' && config.pages > 500;
                              return (
                                <option key={b} value={b} disabled={disabled}>
                                  {b} {disabled ? ' (Unavailable > 500 pages)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      <div className="form-group animate-fade-in" style={{ marginBottom: 16 }}>
                        <label className="label">Special Instructions / Notes (Optional)</label>
                        <textarea 
                          className="textarea" 
                          rows={2} 
                          placeholder="e.g. Spiral binding request, print specific pages only, custom instructions..." 
                          value={config.message_text} 
                          onChange={e => setConfig(c => ({ ...c, message_text: e.target.value }))} 
                        />
                      </div>
                    </div>
                  )}

                  {/* 3. COLOUR PRINTING */}
                  {config.service === 'color_print' && (
                    <div className="animate-fade-in">
                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Sheet Size</label>
                          <select className="select" value={config.color_size} onChange={e => handleColorSizeChange(e.target.value)}>
                            {COLOR_DOC_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                        </div>
                        <div className="form-group">
                          <label className="label">Paper Type</label>
                          <select className="select" value={config.color_paper} onChange={e => handleColorPaperChange(e.target.value)}>
                            {getColorPapers(config.color_size).map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">GSM / Thickness</label>
                          {getColorGSMs(config.color_size, config.color_paper).length > 1 ? (
                            <select className="select" value={config.color_gsm} onChange={e => handleColorGsmChange(e.target.value)}>
                              {getColorGSMs(config.color_size, config.color_paper).map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              className="input"
                              value={config.color_gsm || getColorGSMs(config.color_size, config.color_paper)[0] || 'Standard GSM'}
                              disabled
                              readOnly
                              style={{ background: 'var(--surface-container-low)', cursor: 'not-allowed', opacity: 0.85 }}
                            />
                          )}
                        </div>
                        <div className="form-group">
                          <label className="label">Printing Side</label>
                          {getColorRow(config.color_size, config.color_paper, config.color_gsm)?.fb !== null ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: '100%' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="color_side"
                                  checked={config.color_side === 'Single Side'}
                                  onChange={() => setConfig(c => ({ ...c, color_side: 'Single Side' }))}
                                />
                                Single Side
                              </label>
                              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, cursor: 'pointer' }}>
                                <input
                                  type="radio"
                                  name="color_side"
                                  checked={config.color_side === 'Front & Back'}
                                  onChange={() => setConfig(c => ({ ...c, color_side: 'Front & Back' }))}
                                />
                                Front & Back
                              </label>
                            </div>
                          ) : (
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', fontSize: 14, color: 'var(--on-surface-variant)' }}>
                              Single Side Only
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Number of Pages</label>
                          <input
                            type="number"
                            min="1"
                            className="input"
                            value={config.pages}
                            onChange={e => setConfig(c => ({ ...c, pages: Math.max(1, parseInt(e.target.value) || 1) }))}
                          />
                        </div>
                        <div className="form-group">
                          <label className="label">Number of Copies</label>
                          <input
                            type="number"
                            min="1"
                            className="input"
                            value={config.copies}
                            onChange={e => setConfig(c => ({ ...c, copies: Math.max(1, parseInt(e.target.value) || 1) }))}
                          />
                        </div>
                      </div>

                      {config.color_size === 'A4' && (
                        <div className="form-group" style={{ marginBottom: 16 }}>
                          <label className="label">Binding Add-on</label>
                          <select className="select" value={config.binding} onChange={e => setConfig(c => ({ ...c, binding: e.target.value }))}>
                            {BINDING_OPTIONS.map(b => {
                              const disabled = b === 'Spiral Binding' && config.pages > 500;
                              return (
                                <option key={b} value={b} disabled={disabled}>
                                  {b} {disabled ? ' (Unavailable > 500 pages)' : ''}
                                </option>
                              );
                            })}
                          </select>
                        </div>
                      )}

                      <div className="form-group animate-fade-in" style={{ marginBottom: 16 }}>
                        <label className="label">Special Instructions / Notes (Optional)</label>
                        <textarea 
                          className="textarea" 
                          rows={2} 
                          placeholder="e.g. Color profile requirements, glossy finish note..." 
                          value={config.message_text} 
                          onChange={e => setConfig(c => ({ ...c, message_text: e.target.value }))} 
                        />
                      </div>
                    </div>
                  )}

                  {/* 4. VISITING / BUSINESS CARDS */}
                  {config.service === 'visiting_cards' && (
                    <div className="animate-fade-in">
                      <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                        <div className="form-group">
                          <label className="label">Card Type</label>
                          <select className="select" value={config.card_type} onChange={e => setConfig(c => ({ ...c, card_type: e.target.value }))}>
                            {VISITING_CARD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
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
                          <select className="select" value={config.card_copies} onChange={e => setConfig(c => ({ ...c, card_copies: parseInt(e.target.value) }))}>
                            {VISITING_CARD_QUANTITIES.map(q => (
                              <option key={q} value={q}>{q} cards</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-group animate-fade-in" style={{ marginBottom: 16 }}>
                        <label className="label">Special Instructions / Notes (Optional)</label>
                        <textarea 
                          className="textarea" 
                          rows={2} 
                          placeholder="e.g. Rounded corner cutting, matte lamination note..." 
                          value={config.message_text} 
                          onChange={e => setConfig(c => ({ ...c, message_text: e.target.value }))} 
                        />
                      </div>
                    </div>
                  )}

                  {/* 5. BROCHURES / FLYERS / BILL BOOKS */}
                  {config.service === 'brochures_flyers' && (
                    <div className="animate-fade-in">
                      <div className="form-group" style={{ marginBottom: 16 }}>
                        <label className="label">Product Category</label>
                        <select
                          className="select"
                          value={config.bf_product}
                          onChange={e => setConfig(c => ({
                            ...c,
                            bf_product: e.target.value,
                            flyer_qty: 25,
                            letterhead_paper: '100gsm',
                            letterhead_sheets: 1,
                            letterhead_pads: 1,
                            billbook_pads: 1
                          }))}
                        >
                          <option value="Flyers">Flyers</option>
                          <option value="Letter Head">Letter Head</option>
                          <option value="Bill Book">Bill Book</option>
                        </select>
                      </div>

                      {config.bf_product === 'Flyers' && (
                        <div className="responsive-form-grid animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                          <div className="form-group">
                            <label className="label">Quantity (Pieces)</label>
                            <select className="select" value={config.flyer_qty} onChange={e => setConfig(c => ({ ...c, flyer_qty: parseInt(e.target.value) }))}>
                              {BROCHURES_FLYERS_DATA['Flyers'].quantities.map(q => (
                                <option key={q.qty} value={q.qty}>{q.label} — ₹{q.price}</option>
                              ))}
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="label">Number of Sets</label>
                            <input
                              type="number"
                              min="1"
                              className="input"
                              value={config.copies}
                              onChange={e => setConfig(c => ({ ...c, copies: Math.max(1, parseInt(e.target.value) || 1) }))}
                            />
                          </div>
                        </div>
                      )}

                      {config.bf_product === 'Letter Head' && (
                        <div className="animate-fade-in">
                          <div className="responsive-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            <div className="form-group">
                              <label className="label">Paper Type</label>
                              <select className="select" value={config.letterhead_paper} onChange={e => setConfig(c => ({ ...c, letterhead_paper: e.target.value }))}>
                                <option value="100gsm">100gsm Paper</option>
                                <option value="Executive Bond 100gsm">Executive Bond 100gsm (100-sheet pad)</option>
                              </select>
                            </div>
                            <div className="form-group">
                              {config.letterhead_paper === '100gsm' ? (
                                <>
                                  <label className="label">Number of Sheets</label>
                                  <input
                                    type="number"
                                    min="1"
                                    className="input"
                                    value={config.letterhead_sheets}
                                    onChange={e => setConfig(c => ({ ...c, letterhead_sheets: Math.max(1, parseInt(e.target.value) || 1) }))}
                                  />
                                  <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', display: 'block', marginTop: 4 }}>
                                    1–10: ₹10/ea • 11–50: ₹8/ea • 51+: ₹7/ea
                                  </span>
                                </>
                              ) : (
                                <>
                                  <label className="label">Number of 100-Sheet Pads</label>
                                  <input
                                    type="number"
                                    min="1"
                                    className="input"
                                    value={config.letterhead_pads}
                                    onChange={e => setConfig(c => ({ ...c, letterhead_pads: Math.max(1, parseInt(e.target.value) || 1) }))}
                                  />
                                  <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', display: 'block', marginTop: 4 }}>
                                    ₹700 per 100-sheet pad
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      )}

                      {config.bf_product === 'Bill Book' && (
                        <div className="responsive-form-grid animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                          <div className="form-group">
                            <label className="label">Paper Type</label>
                            <input
                              type="text"
                              className="input"
                              value="Executive Bond 100gsm"
                              disabled
                              readOnly
                              style={{ background: 'var(--surface-container-low)', cursor: 'not-allowed', opacity: 0.85 }}
                            />
                          </div>
                          <div className="form-group">
                            <label className="label">Number of 100-Sheet Pads</label>
                            <input
                              type="number"
                              min="1"
                              className="input"
                              value={config.billbook_pads}
                              onChange={e => setConfig(c => ({ ...c, billbook_pads: Math.max(1, parseInt(e.target.value) || 1) }))}
                            />
                            <span style={{ fontSize: 11, color: 'var(--on-surface-variant)', display: 'block', marginTop: 4 }}>
                              ₹700 per 100-sheet pad
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="form-group animate-fade-in" style={{ marginBottom: 16 }}>
                        <label className="label">Special Instructions / Notes (Optional)</label>
                        <textarea 
                          className="textarea" 
                          rows={2} 
                          placeholder="e.g. Numbering starting from 001, perforation note..." 
                          value={config.message_text} 
                          onChange={e => setConfig(c => ({ ...c, message_text: e.target.value }))} 
                        />
                      </div>
                    </div>
                  )}

                  <div className="wizard-nav-actions">
                    <button className="btn btn-outline" onClick={() => setStep(1)}>
                      <span className="material-symbols-outlined">arrow_back</span> Back
                    </button>
                    <button
                      className="btn btn-primary"
                      disabled={!isB2CStep2Complete}
                      onClick={() => {
                        if (!isB2CStep2Complete) {
                          if (!isB2CStep1Complete) {
                            setError('Please upload and complete file processing first.');
                          } else if (isB2CBindOverLimit) {
                            setError('Spiral Binding is not available for documents over 500 pages.');
                          } else {
                            setError('Please complete your print specifications before continuing to WhatsApp.');
                          }
                          return;
                        }
                        setError('');
                        setStep(3);
                      }}
                      style={{
                        opacity: !isB2CStep2Complete ? 0.6 : 1,
                        cursor: !isB2CStep2Complete ? 'not-allowed' : 'pointer',
                      }}
                    >
                      Next: Delivery <span className="material-symbols-outlined">arrow_forward</span>
                    </button>
                  </div>
                </div>
              )}

              {/* RETAIL STEP 3 */}
              {step === 3 && (
                <div>
                  <h3 className="headline-sm" style={{ fontSize: 20, marginBottom: 8 }}>Step 3: Contact & Delivery</h3>
                  <p className="body-md" style={{ color: 'var(--on-surface-variant)', marginBottom: 20 }}>
                    No account required. An instant Request ID will be generated for WhatsApp tracking.
                  </p>

                  <form onSubmit={handlePlaceOrder} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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

                    <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-outline" onClick={() => setStep(2)}>
                        <span className="material-symbols-outlined">arrow_back</span> Back
                      </button>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={submitting}
                        style={{ flex: 1, height: 'auto', minHeight: 52, padding: '12px 16px', fontSize: 15, background: '#25D366', borderColor: '#25D366', color: '#fff', whiteSpace: 'normal', lineHeight: 1.3 }}
                      >
                        {submitting ? (
                          <div className="spinner" style={{ width: 22, height: 22, borderWidth: 2 }} />
                        ) : (
                          <>
                            <span className="material-symbols-outlined" style={{ fontSize: 20, flexShrink: 0 }}>chat</span>
                            <span>SUBMIT PRINT ORDER & OPEN WHATSAPP</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ minWidth: 0 }}>
          <div className={`print-wizard-summary-card ${mobileSummaryOpen ? 'mobile-expanded' : ''}`}>
            <div 
              className="print-wizard-summary-header"
              onClick={() => setMobileSummaryOpen(prev => !prev)}
              role="button"
              tabIndex={0}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setMobileSummaryOpen(prev => !prev); } }}
              aria-expanded={mobileSummaryOpen}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0, flex: 1 }}>
                <span className="material-symbols-outlined" style={{ color: 'var(--primary-container)', fontSize: 20, flexShrink: 0 }}>receipt</span>
                <h4 className="headline-sm" style={{ fontSize: 15, margin: 0, fontWeight: 800, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isWholesaleActive ? 'B2B Order Specification' : 'Order Estimation Summary'}
                </h4>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span className="summary-mobile-badge">
                  {isWholesaleActive 
                    ? (b2bPriceResult.isPriceAvailable && !b2bPriceResult.waitingForFile && b2bPriceResult.totalAmount > 0 
                        ? formatINR(b2bPriceResult.totalAmount) 
                        : (b2bMediaType ? `${b2bMediaType.split(' ')[0]} • ${b2bCopies}x` : 'Specifications')) 
                    : `₹${prices.grandTotal}`}
                </span>
                <span className="material-symbols-outlined summary-collapse-icon" style={{
                  transform: mobileSummaryOpen ? 'rotate(180deg)' : 'rotate(0deg)'
                }}>
                  expand_more
                </span>
              </div>
            </div>

            <div className={`print-wizard-summary-body ${mobileSummaryOpen ? 'is-open' : ''}`}>
              {isWholesaleActive ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Media Type:</span>
                    <span style={{ fontWeight: 700, textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{b2bMediaType || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Category:</span>
                    <span style={{ fontWeight: 700, textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{b2bMediaCategory || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Size:</span>
                    <span style={{ fontWeight: 700, textAlign: 'right', wordBreak: 'break-word' }}>{b2bSize || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>GSM:</span>
                    <span style={{ fontWeight: 700, textAlign: 'right', wordBreak: 'break-word' }}>{b2bGsm ? `${b2bGsm} GSM` : '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Print Side:</span>
                    <span style={{ fontWeight: 700, textAlign: 'right' }}>{b2bBothSides ? 'Front & Back' : 'Single Side'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Pages:</span>
                    <span style={{ fontWeight: 700, textAlign: 'right' }}>
                      {uploading || uploadStatus === 'PROCESSING' || uploadStatus === 'UPLOADING'
                        ? 'Analyzing...'
                        : (uploadedFile && uploadStatus === 'COMPLETED' && b2bPages ? b2bPages : '—')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Copies:</span>
                    <span style={{ fontWeight: 700, textAlign: 'right' }}>{b2bCopies}</span>
                  </div>
                  {b2bThermalLamination && b2bThermalLaminationType && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Lamination:</span>
                      <span style={{ fontWeight: 700, color: 'var(--on-surface)', textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{b2bThermalLaminationType}</span>
                    </div>
                  )}
                  {b2bCutting && b2bCuttingType && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Cutting:</span>
                      <span style={{ fontWeight: 700, color: 'var(--on-surface)', textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{b2bCuttingType}</span>
                    </div>
                  )}
                  {b2bSticker && b2bStickerType && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Sticker:</span>
                      <span style={{ fontWeight: 700, color: 'var(--on-surface)', textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{b2bStickerType}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Delivery:</span>
                    <span style={{ fontWeight: 700, textAlign: 'right', wordBreak: 'break-word' }}>
                      {deliveryType === 'courier' ? 'Courier Delivery' : 'Store Pickup'}
                    </span>
                  </div>
                  {file && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>File Attached:</span>
                      <span style={{ fontWeight: 700, color: 'var(--primary-container)', fontSize: 13, wordBreak: 'break-all', textAlign: 'right', maxWidth: '65%' }}>
                        {file.name.length > 20 ? file.name.slice(0, 18) + '...' : file.name}
                      </span>
                    </div>
                  )}
                  {b2bInstructions && (
                    <div style={{ marginTop: 6, padding: '8px 10px', background: 'var(--surface-container-lowest)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-container-high)', fontSize: 12.5 }}>
                      <span style={{ fontWeight: 700, color: 'var(--on-surface-variant)', display: 'block', marginBottom: 2 }}>Instructions:</span>
                      <span style={{ color: 'var(--on-surface)', wordBreak: 'break-word', lineHeight: 1.3 }}>{b2bInstructions}</span>
                    </div>
                  )}

                  {/* PRICE ESTIMATION BREAKDOWN */}
                  <div style={{ borderTop: '1px dashed var(--surface-container-high)', paddingTop: 14, marginTop: 6 }}>
                    <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.05em', color: 'var(--on-surface-variant)', textTransform: 'uppercase', marginBottom: 10 }}>
                      PRICE ESTIMATION
                    </div>

                    {!b2bPriceResult.isPriceAvailable ? (
                      <div style={{ fontSize: 12.5, color: '#b91c1c', background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 12px', borderRadius: 'var(--radius-md)', fontWeight: 600, textAlign: 'center', marginBottom: 8 }}>
                        Price unavailable for this selection.
                      </div>
                    ) : (
                      <>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5, color: 'var(--on-surface)' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Printing:</span>
                          <span style={{ fontWeight: 700 }}>
                            {b2bPriceResult.waitingForFile ? (b2bPriceResult.isValidSelection ? 'Waiting for file' : '—') : formatINR(b2bPriceResult.printingPrice)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5, color: 'var(--on-surface)' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Lamination:</span>
                          <span style={{ fontWeight: 700 }}>
                            {!b2bThermalLamination ? '₹0' : (b2bPriceResult.waitingForFile ? 'Waiting for file' : formatINR(b2bPriceResult.laminationPrice))}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5, color: 'var(--on-surface)' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Cutting:</span>
                          <span style={{ fontWeight: 700 }}>
                            {!b2bCutting ? '₹0' : formatINR(b2bPriceResult.cuttingPrice)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5, color: 'var(--on-surface)' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Sticker:</span>
                          <span style={{ fontWeight: 700 }}>
                            {!b2bSticker ? '₹0' : formatINR(b2bPriceResult.stickerPrice)}
                          </span>
                        </div>

                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13.5, color: 'var(--on-surface)' }}>
                          <span style={{ color: 'var(--on-surface-variant)' }}>Courier:</span>
                          <span style={{ fontWeight: 700 }}>
                            {formatINR(b2bPriceResult.courierCharge)}
                          </span>
                        </div>

                        <div style={{ 
                          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          marginTop: 12, paddingTop: 12, 
                          borderTop: '1px solid var(--surface-container-high)', 
                          fontWeight: 800, fontSize: 17, color: 'var(--primary-container)' 
                        }}>
                          <span>TOTAL AMOUNT:</span>
                          <span>
                            {b2bPriceResult.waitingForFile ? (b2bPriceResult.isValidSelection ? 'Waiting for file' : '—') : formatINR(b2bPriceResult.totalAmount)}
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 14, marginBottom: 16 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Service:</span>
                    <span style={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>
                      {TOP_LEVEL_SERVICES.find(t => t.value === config.service)?.label}
                    </span>
                  </div>
                  
                  {config.service === 'bw_print' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Size:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.bw_size}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Paper / GSM:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{config.bw_paper} ({config.bw_gsm})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Print Side:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.bw_side}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Pages:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.pages}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Copies:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.copies}</span>
                      </div>
                      {['A4', 'FS'].includes(config.bw_size) && config.binding !== 'No Binding' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Binding Add-on:</span>
                          <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.binding}</span>
                        </div>
                      )}
                    </>
                  )}

                  {config.service === 'color_print' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Size:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.color_size}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Paper / GSM:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{config.color_paper} ({config.color_gsm})</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Print Side:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.color_side}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Pages:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.pages}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Copies:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.copies}</span>
                      </div>
                      {config.color_size === 'A4' && config.binding !== 'No Binding' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Binding Add-on:</span>
                          <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.binding}</span>
                        </div>
                      )}
                    </>
                  )}

                  {config.service === 'visiting_cards' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Card Type:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{config.card_type}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Printing Side:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.card_side}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Quantity:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.card_copies} cards</span>
                      </div>
                    </>
                  )}

                  {config.service === 'brochures_flyers' && (
                    <>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                        <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Product:</span>
                        <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.bf_product}</span>
                      </div>
                      {config.bf_product === 'Flyers' && (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                          <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Quantity:</span>
                          <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.flyer_qty} pieces (x{config.copies} sets)</span>
                        </div>
                      )}
                      {config.bf_product === 'Letter Head' && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Paper:</span>
                            <span style={{ fontWeight: 600, textAlign: 'right', wordBreak: 'break-word', maxWidth: '65%' }}>{config.letterhead_paper}</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Quantity:</span>
                            <span style={{ fontWeight: 600, textAlign: 'right' }}>
                              {config.letterhead_paper === '100gsm' ? `${config.letterhead_sheets} sheets` : `${config.letterhead_pads} pads (100 sheets/pad)`}
                            </span>
                          </div>
                        </>
                      )}
                      {config.bf_product === 'Bill Book' && (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Paper:</span>
                            <span style={{ fontWeight: 600, textAlign: 'right' }}>Executive Bond 100gsm</span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                            <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>Quantity:</span>
                            <span style={{ fontWeight: 600, textAlign: 'right' }}>{config.billbook_pads} pads (100 sheets/pad)</span>
                          </div>
                        </>
                      )}
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

                  {file && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                      <span style={{ color: 'var(--on-surface-variant)', flexShrink: 0 }}>File Attached:</span>
                      <span style={{ fontWeight: 600, color: 'var(--primary-container)', textAlign: 'right', wordBreak: 'break-all', maxWidth: '65%' }}>{file.name.slice(0, 16)}…</span>
                    </div>
                  )}
                </div>
              )}

              {!isWholesaleActive && (
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
                  {Number(prices.cuttingTotal) > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                      <span>Cutting Charge</span>
                      <span>₹{prices.cuttingTotal}</span>
                    </div>
                  )}
                  {deliveryType === 'courier' && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 13, color: 'var(--on-surface-variant)' }}>
                      <span>Courier Charge</span>
                      <span>₹{prices.courierCharge}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--surface-container-high)', fontWeight: 800, fontSize: 18, color: 'var(--primary-container)' }}>
                    <span>Estimated Total</span>
                    <span>₹{prices.grandTotal}</span>
                  </div>
                </div>
              )}
              
              {!isWholesaleActive && Number(prices.grandTotal) <= 0 && (
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
                    <div><strong>Total Amount:</strong> {formatINR(createdOrder.total_price)}</div>
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
