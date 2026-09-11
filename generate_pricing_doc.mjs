import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  HeadingLevel,
  BorderStyle,
  ShadingType
} from 'docx';

import {
  WHOLESALE_PRICE_LIST,
  BW_PRINT_PRICING,
  COLOR_PRINT_PRICING,
  VISITING_CARD_QUANTITIES,
  VISITING_CARD_TYPES,
  VISITING_CARD_PRICES,
  BROCHURES_FLYERS_DATA,
  BINDING_PRICES,
  THERMAL_LAMINATION_PRICES,
  CUTTING_PRICES,
  STICKER_FINISHING_PRICES,
} from './client/src/lib/priceList.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Brand Theme Colors
const BRAND_PRIMARY = 'B70011'; // Winstar Red
const BRAND_NAVY = '121C2A';    // Deep Navy
const BRAND_DARK = '1E293B';    // Slate 800
const BRAND_MUTED = '64748B';   // Slate 500
const BG_HEADER = '121C2A';     // Table Header Navy
const BG_SUBHEADER = 'F1F5F9';  // Table Subheader Slate 100
const BORDER_COLOR = 'CBD5E1';  // Slate 300

const borderStyle = {
  style: BorderStyle.SINGLE,
  size: 4,
  color: BORDER_COLOR
};

const cellBorders = {
  top: borderStyle,
  bottom: borderStyle,
  left: borderStyle,
  right: borderStyle
};

function createCell(text, isHeader = false, isSubHeader = false, widthPercent = null, align = AlignmentType.LEFT) {
  return new TableCell({
    width: widthPercent ? { size: widthPercent, type: WidthType.PERCENTAGE } : undefined,
    shading: {
      type: ShadingType.CLEAR,
      fill: isHeader ? BG_HEADER : (isSubHeader ? BG_SUBHEADER : 'FFFFFF')
    },
    borders: cellBorders,
    margins: {
      top: 100,
      bottom: 100,
      left: 120,
      right: 120
    },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: String(text ?? '—'),
            bold: isHeader || isSubHeader,
            color: isHeader ? 'FFFFFF' : (isSubHeader ? BRAND_NAVY : BRAND_DARK),
            font: 'Arial',
            size: isHeader ? 18 : 16 // 9pt or 8pt
          })
        ]
      })
    ]
  });
}

function createSectionHeading(title, subtitle) {
  const elements = [
    new Paragraph({
      heading: HeadingLevel.HEADING_2,
      spacing: { before: 280, after: 80 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          color: BRAND_PRIMARY,
          font: 'Arial',
          size: 22
        })
      ]
    })
  ];
  if (subtitle) {
    elements.push(
      new Paragraph({
        spacing: { before: 0, after: 120 },
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            color: BRAND_MUTED,
            font: 'Arial',
            size: 16
          })
        ]
      })
    );
  }
  return elements;
}

function createTable(headers, rows, widths = null) {
  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h, i) => createCell(h, true, false, widths ? widths[i] : null, AlignmentType.LEFT))
  });

  const dataRows = rows.map(r => {
    return new TableRow({
      children: r.map((c, i) => createCell(c, false, false, widths ? widths[i] : null, AlignmentType.LEFT))
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [headerRow, ...dataRows]
  });
}

// 1. Transform BW Data directly from BW_PRINT_PRICING
const b2cBWRows = [];
for (const [size, papers] of Object.entries(BW_PRINT_PRICING)) {
  for (const [paper, gsmList] of Object.entries(papers)) {
    for (const item of gsmList) {
      b2cBWRows.push([
        size,
        paper,
        item.gsm,
        `₹${item.ss.toFixed(2)}`,
        item.fb !== null ? `₹${item.fb.toFixed(2)}` : '— (N/A)'
      ]);
    }
  }
}

// 2. Transform Color Data directly from COLOR_PRINT_PRICING
const b2cColorRows = [];
for (const [size, papers] of Object.entries(COLOR_PRINT_PRICING)) {
  for (const [paper, gsmList] of Object.entries(papers)) {
    for (const item of gsmList) {
      b2cColorRows.push([
        size,
        paper,
        item.gsm,
        `₹${item.single.toFixed(2)}`,
        item.fb !== null ? `₹${item.fb.toFixed(2)}` : '— (N/A)'
      ]);
    }
  }
}

// 3. Transform Visiting Cards with SEPARATE COLUMNS FOR PRINTING COST, CUTTING CHARGE, AND TOTALS
const visitingCardRows = [];
for (const [cardType, list] of Object.entries(VISITING_CARD_PRICES)) {
  for (const item of list) {
    const cuttingFee = item.qty <= 510 ? 60 : 120;
    const totalSingle = item.single + cuttingFee;
    const totalDouble = item.double + cuttingFee;
    visitingCardRows.push([
      cardType,
      `${item.qty} Cards`,
      `₹${item.single.toFixed(2)}`,
      `₹${item.double.toFixed(2)}`,
      `₹${cuttingFee.toFixed(2)}`,
      `₹${totalSingle.toFixed(2)}`,
      `₹${totalDouble.toFixed(2)}`
    ]);
  }
}

// 4. Transform Marketing & Books directly from BROCHURES_FLYERS_DATA
const marketingRows = [];
// Flyers
for (const item of BROCHURES_FLYERS_DATA.Flyers.quantities) {
  marketingRows.push([
    'Flyers / Pamphlets (A4, 130 GSM)',
    item.label,
    `₹${item.price.toFixed(2)}`,
    '—',
    `₹${item.price.toFixed(2)}`,
    'Single Side Full Color'
  ]);
}
// Letterhead 100gsm
for (const tier of BROCHURES_FLYERS_DATA['Letter Head']['100gsm'].tiers) {
  const range = tier.max === Infinity ? `${tier.min}+ Sheets` : `${tier.min} - ${tier.max} Sheets`;
  marketingRows.push([
    'Letterhead (100 GSM Alabaster)',
    range,
    `₹${tier.unitPrice.toFixed(2)} / sheet`,
    '—',
    `₹${tier.unitPrice.toFixed(2)} / sheet`,
    'Single Side Full Color'
  ]);
}
// Letterhead Executive Bond
marketingRows.push([
  'Executive Bond Letterheads',
  `Pad of ${BROCHURES_FLYERS_DATA['Letter Head']['Executive Bond 100gsm'].padSize} Sheets`,
  `₹${BROCHURES_FLYERS_DATA['Letter Head']['Executive Bond 100gsm'].pricePerPad.toFixed(2)}`,
  '—',
  `₹${BROCHURES_FLYERS_DATA['Letter Head']['Executive Bond 100gsm'].pricePerPad.toFixed(2)} / pad`,
  'Premium Executive Bond Pad'
]);
// Bill Book
marketingRows.push([
  'Bill Books / Invoice Books',
  `Book of ${BROCHURES_FLYERS_DATA['Bill Book']['Executive Bond 100gsm'].padSize} Sheets`,
  `₹${BROCHURES_FLYERS_DATA['Bill Book']['Executive Bond 100gsm'].pricePerPad.toFixed(2)}`,
  '—',
  `₹${BROCHURES_FLYERS_DATA['Bill Book']['Executive Bond 100gsm'].pricePerPad.toFixed(2)} / book`,
  'Executive Bond Bound Book'
]);

// 5. Transform Bindings directly from BINDING_PRICES
const bindingRows = [];
// Chat Binding
for (const [size, price] of Object.entries(BINDING_PRICES['Chat Binding'])) {
  bindingRows.push([
    'Chat Binding (Stapled Strip)',
    size,
    'Standard Document Pages',
    `₹${price.toFixed(2)} / unit`
  ]);
}
// Spiral Binding A4
for (const tier of BINDING_PRICES['Spiral Binding']['A4']) {
  bindingRows.push([
    'Spiral Binding (Clear Front + Opaque Back)',
    'A4 Size',
    `Up to ${tier.max} Pages`,
    `₹${tier.price.toFixed(2)} / book`
  ]);
}
// Spiral Binding FS
for (const tier of BINDING_PRICES['Spiral Binding']['FS']) {
  bindingRows.push([
    'Spiral Binding (Clear Front + Opaque Back)',
    'FS (Legal) Size',
    `Up to ${tier.max} Pages`,
    `₹${tier.price.toFixed(2)} / book`
  ]);
}

// 6. Transform B2B 39 Media Sheet Rates directly from WHOLESALE_PRICE_LIST
const b2bMediaRows = WHOLESALE_PRICE_LIST.map(item => {
  return [
    String(item.id),
    item.media,
    item.gsm,
    item.size,
    `₹${item.single_1st.toFixed(2)}`,
    `₹${item.single_add.toFixed(2)}`,
    item.double_1st !== null ? `₹${item.double_1st.toFixed(2)}` : '—',
    item.double_add !== null ? `₹${item.double_add.toFixed(2)}` : '—'
  ];
});

// 7. Transform B2B Finishing directly from THERMAL_LAMINATION_PRICES, CUTTING_PRICES, STICKER_FINISHING_PRICES
const b2bFinishingRows = [];
for (const [opt, price] of Object.entries(THERMAL_LAMINATION_PRICES)) {
  b2bFinishingRows.push([
    'Thermal Lamination',
    `${opt} Finish`,
    'Per Page / Side',
    `₹${price.toFixed(2)} / side`
  ]);
}
for (const [opt, price] of Object.entries(CUTTING_PRICES)) {
  b2bFinishingRows.push([
    'Precision Sheet Cutting',
    opt,
    'Per Batch / Set',
    `₹${price.toFixed(2)}`
  ]);
}
for (const [opt, price] of Object.entries(STICKER_FINISHING_PRICES)) {
  b2bFinishingRows.push([
    'Sticker Finishing',
    `${opt} (Plotter/Scoring)`,
    'Per Sheet',
    `₹${price.toFixed(2)} / sheet`
  ]);
}
b2bFinishingRows.push([
  'Delivery Option',
  'Courier Dispatch (Door Delivery)',
  'Per Order',
  '₹30.00 flat rate'
]);

// Build Document
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Arial',
          size: 18
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 800,
            right: 800,
            bottom: 800,
            left: 800
          }
        }
      },
      children: [
        // Title Header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: 'WINSTAR DIGITAL PRINTING',
              bold: true,
              color: BRAND_PRIMARY,
              font: 'Arial',
              size: 32
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 80 },
          children: [
            new TextRun({
              text: 'COMPLETE LIVE RATE LIST — QUICK PRINT (B2C) & WHOLESALE (B2B)',
              bold: true,
              color: BRAND_NAVY,
              font: 'Arial',
              size: 20
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 200 },
          children: [
            new TextRun({
              text: 'All base print rates, separate finishing charges (cutting, lamination), and total estimated costs synchronized with live website database',
              italics: true,
              color: BRAND_MUTED,
              font: 'Arial',
              size: 16
            })
          ]
        }),

        // SECTION 1: B2C B&W PRINTING
        ...createSectionHeading('SECTION 1: QUICK PRINT (B2C) — BLACK & WHITE / GRAYSCALE PRINTING', 'Single side (SS) and Front & Back (FB per side) rates by document size, paper type, and GSM'),
        createTable(
          ['Document Size', 'Paper Type', 'GSM Weight', 'Single Side (SS)', 'Front & Back (FB / side)'],
          b2cBWRows,
          [20, 25, 20, 18, 17]
        ),

        // SECTION 2: B2C COLOR PRINTING
        ...createSectionHeading('SECTION 2: QUICK PRINT (B2C) — DIGITAL COLOUR PRINTING & POSTERS', 'Full color digital reproduction across commercial sheet sizes and large format poster media'),
        createTable(
          ['Document / Sheet Size', 'Paper / Media Type', 'GSM Weight', 'Single Side (4+0)', 'Front & Back (4+4)'],
          b2cColorRows,
          [22, 25, 18, 18, 17]
        ),

        // SECTION 3: VISITING CARDS (WITH SEPARATE PRINTING COST, CUTTING CHARGE & TOTALS)
        ...createSectionHeading('SECTION 3: VISITING CARDS — COMPLETE PRICE BREAKDOWN', 'Individual columns for Print Cost, Separate Cutting Charge (+₹60 for ≤510, +₹120 for >510), and Final Estimated Totals'),
        createTable(
          ['Card Substrate', 'Quantity', 'Print (Single)', 'Print (Double)', 'Cutting Charge', 'Total (Single)', 'Total (Double)'],
          visitingCardRows,
          [28, 12, 12, 12, 12, 12, 12]
        ),

        // SECTION 4: MARKETING MATERIALS & BOOKS
        ...createSectionHeading('SECTION 4: MARKETING MATERIALS, LETTERHEADS & BILL BOOKS', 'Promotional flyers, commercial letterheads, and corporate bill books'),
        createTable(
          ['Product / Service Item', 'Quantity / Tier Range', 'Base Print Rate', 'Extra Charges', 'Total Rate', 'Details'],
          marketingRows,
          [28, 16, 15, 10, 15, 16]
        ),

        // SECTION 5: BINDINGS
        ...createSectionHeading('SECTION 5: DOCUMENT BINDING & FINISHING SERVICES', 'Chat stapled binding and spiral wire binding with clear protective front and opaque backing'),
        createTable(
          ['Binding Style', 'Document Size', 'Page Range Tier', 'Price Rate (Per Book)'],
          bindingRows,
          [38, 18, 24, 20]
        ),

        // SECTION 6: B2B WHOLESALE (39 ITEMS)
        ...createSectionHeading('SECTION 6: B2B WHOLESALE — 39 MEDIA SHEET RATE LIST', 'Exact wholesale digital press sheet rates (1st copy sheet & additional copy sheet rates)'),
        createTable(
          ['ID', 'Media Stock Substrate', 'GSM', 'Size', 'Single 1st', 'Single Add', 'FB 1st', 'FB Add'],
          b2bMediaRows,
          [6, 30, 12, 12, 10, 10, 10, 10]
        ),

        // SECTION 7: B2B FINISHING ADD-ONS
        ...createSectionHeading('SECTION 7: B2B POST-PRESS FINISHING & ADD-ONS', 'Thermal lamination, guillotine cutting, creasing, scoring, and shape cutting'),
        createTable(
          ['Finishing Category', 'Service / Operation Description', 'Unit Basis', 'Wholesale Price Rate'],
          b2bFinishingRows,
          [25, 35, 20, 20]
        ),

        // SECTION 8: PLATFORM FORMULAS & RULES
        ...createSectionHeading('SECTION 8: EXACT CALCULATION RULES & PRICING FORMULAS', 'System logic applied on web calculation engine'),
        new Paragraph({
          spacing: { before: 100, after: 60 },
          children: [
            new TextRun({
              text: '• Visiting Cards Calculation Formula: ',
              bold: true,
              color: BRAND_NAVY,
              size: 18
            }),
            new TextRun({
              text: 'Total Amount = Base Print Rate (by Substrate & Single/Double Side) + Cutting Charge (₹60.00 for 120, 150, 200, 300, 510 cards; ₹120.00 for 720, 1,020 cards).',
              size: 17,
              color: BRAND_DARK
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: '• B2B Printing Total Formula: ',
              bold: true,
              color: BRAND_NAVY,
              size: 18
            }),
            new TextRun({
              text: 'For Single Side: Physical Sheets = Pages; Rate = First Copy Rate + [Add Rate × (Copies - 1)]; Total = Physical Sheets × Rate. For Front & Back: Physical Sheets = ⌈Pages / 2⌉; Rate = FB First + [FB Add × (Copies - 1)]; Total = Physical Sheets × Rate.',
              size: 17,
              color: BRAND_DARK
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: '• B2B Lamination Formula: ',
              bold: true,
              color: BRAND_NAVY,
              size: 18
            }),
            new TextRun({
              text: 'Lamination Price Per Side × Total Document Pages × Number of Copies.',
              size: 17,
              color: BRAND_DARK
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 60, after: 60 },
          children: [
            new TextRun({
              text: '• B2B Cutting / Sticker Finishing: ',
              bold: true,
              color: BRAND_NAVY,
              size: 18
            }),
            new TextRun({
              text: 'Selected Finishing Price × Number of Copies.',
              size: 17,
              color: BRAND_DARK
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 60, after: 120 },
          children: [
            new TextRun({
              text: '• Delivery Option: ',
              bold: true,
              color: BRAND_NAVY,
              size: 18
            }),
            new TextRun({
              text: 'Store Pickup = ₹0.00; Direct Courier Delivery = ₹30.00 Flat Rate.',
              size: 17,
              color: BRAND_DARK
            })
          ]
        })
      ]
    }
  ]
});

async function main() {
  const buffer = await Packer.toBuffer(doc);
  
  const filesToTry = [
    'WINSTAR_CURRENT_PRICING_RATE_LIST.docx',
    'WINSTAR_OFFICIAL_PRICING_RATE_LIST.docx',
    'WINSTAR_PRICING_RATE_LIST.docx'
  ];

  for (const fileName of filesToTry) {
    const outPath = path.resolve(__dirname, fileName);
    try {
      fs.writeFileSync(outPath, buffer);
      console.log(`Saved document successfully to: ${fileName}`);
    } catch (e) {
      console.warn(`Could not overwrite ${fileName}: ${e.message}`);
    }
  }
}

main().catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});
