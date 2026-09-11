const fs = require('fs');
const path = require('path');
const {
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
} = require('docx');

// Colors
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
      top: 120,
      bottom: 120,
      left: 150,
      right: 150
    },
    children: [
      new Paragraph({
        alignment: align,
        children: [
          new TextRun({
            text: text || '-',
            bold: isHeader || isSubHeader,
            color: isHeader ? 'FFFFFF' : (isSubHeader ? BRAND_NAVY : BRAND_DARK),
            font: 'Arial',
            size: isHeader ? 20 : 18
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
      spacing: { before: 300, after: 100 },
      children: [
        new TextRun({
          text: title,
          bold: true,
          color: BRAND_PRIMARY,
          font: 'Arial',
          size: 26
        })
      ]
    })
  ];
  if (subtitle) {
    elements.push(
      new Paragraph({
        spacing: { before: 0, after: 150 },
        children: [
          new TextRun({
            text: subtitle,
            italics: true,
            color: BRAND_MUTED,
            font: 'Arial',
            size: 18
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

// Data Sets
const b2cBlackAndWhiteData = [
  ['A4', 'Copier Paper', '70 GSM', '₹1.20', '₹0.80'],
  ['A4', 'Copier Paper', '80 GSM', '₹1.50', '₹1.00'],
  ['A4', 'Bond Paper', '100 GSM', '₹2.50', '₹2.00'],
  ['A4', 'Color Paper', '100 GSM', '₹2.50', '₹2.00'],
  ['A4', 'Ledger Paper', '80 GSM', '₹2.50', '₹2.00'],
  ['FS (Legal)', 'Copier Paper', '70 GSM', '₹2.00', '₹1.50'],
  ['FS (Legal)', 'Ledger Paper', '80 GSM', '₹3.00', '₹2.00'],
  ['A3', 'Copier Paper', '70 GSM', '₹5.00', '₹3.00'],
  ['A3', 'Bond Paper', '100 GSM', '₹6.00', '₹5.00'],
  ['A2', 'Standard Media', 'Plotter B&W', '₹50.00', '—'],
  ['A1', 'Standard Media', 'Plotter B&W', '₹100.00', '—'],
  ['A0', 'Standard Media', 'Plotter B&W', '₹200.00', '—'],
];

const b2cColorData = [
  ['A4', 'Copier / Bond', '100 GSM', '₹10.00', '₹20.00'],
  ['A4', 'Art Paper', '130 GSM', '₹15.00', '₹30.00'],
  ['A4', 'Art Paper', '170 GSM', '₹15.00', '₹30.00'],
  ['A4', 'Art Board', '250 GSM', '₹20.00', '₹40.00'],
  ['A4', 'Art Board', '300 GSM', '₹20.00', '₹40.00'],
  ['13 × 19 in', 'Art Paper', '130 GSM', '₹20.00', '₹40.00'],
  ['13 × 19 in', 'Art Paper', '170 GSM', '₹20.00', '₹40.00'],
  ['13 × 19 in', 'Art Board', '250 GSM', '₹25.00', '₹40.00'],
  ['13 × 19 in', 'Art Board', '300 GSM', '₹25.00', '₹50.00'],
  ['12 × 18 in', 'Art Paper / Board', 'Various', '₹20.00', '₹40.00'],
  ['12 × 17 in', 'Art Paper / Board', 'Various', '₹20.00', '₹40.00'],
  ['A3', 'Art Paper / Board', 'Various', '₹20.00', '₹40.00'],
  ['A2', 'Large Format Color', 'Poster Media', '₹350.00', '—'],
  ['A1', 'Large Format Color', 'Poster Media', '₹600.00', '—'],
  ['A0', 'Large Format Color', 'Poster Media', '₹800.00', '—'],
];

const visitingCardsData = [
  ['Art Board (Single / Both Side)', '120 Cards', '₹200 / ₹300', 'Standard 300 GSM Art Board'],
  ['Art Board (Single / Both Side)', '240 Cards', '₹300 / ₹500', 'Standard 300 GSM Art Board'],
  ['Art Board (Single / Both Side)', '500 Cards', '₹500 / ₹800', 'Standard 300 GSM Art Board'],
  ['Art Board (Single / Both Side)', '1,020 Cards', '₹900 / ₹1,400', 'Standard 300 GSM Art Board'],
  ['Art Board + Lamination (Gloss/Matt)', '120 Cards', '₹300 / ₹400', 'Single / Double Sided Lamination'],
  ['Art Board + Lamination (Gloss/Matt)', '240 Cards', '₹400 / ₹650', 'Single / Double Sided Lamination'],
  ['Art Board + Lamination (Gloss/Matt)', '500 Cards', '₹600 / ₹1,000', 'Single / Double Sided Lamination'],
  ['Art Board + Lamination (Gloss/Matt)', '1,020 Cards', '₹1,200 / ₹1,800', 'Single / Double Sided Lamination'],
  ['Metallic / Special Texture Boards', '120 Cards', '₹300 / ₹400', 'Gold, Silver, Metallic Finish'],
  ['Metallic / Special Texture Boards', '240 Cards', '₹500 / ₹700', 'Gold, Silver, Metallic Finish'],
  ['Metallic / Special Texture Boards', '500 Cards', '₹800 / ₹1,100', 'Gold, Silver, Metallic Finish'],
  ['Metallic / Special Texture Boards', '1,020 Cards', '₹1,500 / ₹2,100', 'Gold, Silver, Metallic Finish'],
  ['Synthetic Tear-Proof (125 / 200 Micron)', '120 Cards', '₹350 / ₹450', 'Waterproof & Tear-Resistant'],
  ['Synthetic Tear-Proof (125 / 200 Micron)', '240 Cards', '₹600 / ₹800', 'Waterproof & Tear-Resistant'],
  ['Synthetic Tear-Proof (125 / 200 Micron)', '500 Cards', '₹950 / ₹1,300', 'Waterproof & Tear-Resistant'],
  ['Synthetic Tear-Proof (125 / 200 Micron)', '1,020 Cards', '₹1,800 / ₹2,500', 'Waterproof & Tear-Resistant'],
  ['Gold / Silver Metallic Finish', '120 Cards', '₹350 / ₹450', 'Premium Metallic Card Stock'],
  ['Gold / Silver Metallic Finish', '240 Cards', '₹600 / ₹800', 'Premium Metallic Card Stock'],
  ['Gold / Silver Metallic Finish', '500 Cards', '₹950 / ₹1,300', 'Premium Metallic Card Stock'],
  ['Gold / Silver Metallic Finish', '1,020 Cards', '₹1,800 / ₹2,500', 'Premium Metallic Card Stock'],
];

const marketingBooksData = [
  ['Flyers / Pamphlets (A4 / 130 GSM)', '25 Copies', '₹160.00', 'Single Side Full Color'],
  ['Flyers / Pamphlets (A4 / 130 GSM)', '50 Copies', '₹200.00', 'Single Side Full Color'],
  ['Flyers / Pamphlets (A4 / 130 GSM)', '100 Copies', '₹300.00', 'Single Side Full Color'],
  ['Letterheads (100 GSM Alabaster)', '1 - 24 Pcs', '₹10.00 / sheet', 'Single Side Color'],
  ['Letterheads (100 GSM Alabaster)', '25 - 99 Pcs', '₹8.00 / sheet', 'Single Side Color'],
  ['Letterheads (100 GSM Alabaster)', '100+ Pcs', '₹7.00 / sheet', 'Single Side Color'],
  ['Executive Bond Letterheads', 'Pad of 100', '₹700.00 / pad', 'Premium Bond Paper'],
  ['Bill Books / Invoice Books', 'Book of 100', '₹700.00 / book', 'Carbonless/Standard Bond with Binding'],
];

const bindingsData = [
  ['Chat Binding (Stapled Strip)', 'A4 Size', '₹8.00 / unit'],
  ['Chat Binding (Stapled Strip)', 'FS (Legal) Size', '₹10.00 / unit'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'A4 (Up to 25 Pages)', '₹20.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'A4 (Up to 50 Pages)', '₹25.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'A4 (Up to 100 Pages)', '₹30.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'A4 (Up to 200 Pages)', '₹40.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'A4 (Up to 300 Pages)', '₹50.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'A4 (Up to 400 Pages)', '₹75.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'A4 (Up to 500 Pages)', '₹100.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'FS Legal (Up to 50 Pages)', '₹35.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'FS Legal (Up to 100 Pages)', '₹45.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'FS Legal (Up to 200 Pages)', '₹55.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'FS Legal (Up to 300 Pages)', '₹65.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'FS Legal (Up to 400 Pages)', '₹85.00 / book'],
  ['Spiral Binding (Clear Cover + Sheet Backing)', 'FS Legal (Up to 500 Pages)', '₹110.00 / book'],
];

const b2bMediaData = [
  ['1', '100 gsm Coated Paper', '12 × 18 in', '₹14.00', '₹13.00', '₹12.00'],
  ['2', '100 gsm Coated Paper', '13 × 19 in', '₹15.00', '₹14.00', '₹13.00'],
  ['3', '100 gsm Bond Paper (Royal)', '12 × 18 in', '₹16.00', '₹15.00', '₹14.00'],
  ['4', '130 gsm Art Paper', '12 × 18 in', '₹14.00', '₹13.00', '₹12.00'],
  ['5', '130 gsm Art Paper', '13 × 19 in', '₹15.00', '₹14.00', '₹13.00'],
  ['6', '170 gsm Art Paper', '12 × 18 in', '₹14.00', '₹13.00', '₹12.00'],
  ['7', '170 gsm Art Paper', '13 × 19 in', '₹15.00', '₹14.00', '₹13.00'],
  ['8', '210 gsm Art Board', '12 × 18 in', '₹15.00', '₹14.00', '₹13.00'],
  ['9', '210 gsm Art Board', '13 × 19 in', '₹16.00', '₹15.00', '₹14.00'],
  ['10', '250 gsm Art Board', '12 × 18 in', '₹15.00', '₹14.00', '₹13.00'],
  ['11', '250 gsm Art Board', '13 × 19 in', '₹16.00', '₹15.00', '₹14.00'],
  ['12', '300 gsm Art Board', '12 × 18 in', '₹15.00', '₹14.00', '₹13.00'],
  ['13', '300 gsm Art Board', '13 × 19 in', '₹16.00', '₹15.00', '₹14.00'],
  ['14', '350 gsm Art Board', '12 × 18 in', '₹20.00', '₹19.00', '₹18.00'],
  ['15', '350 gsm Art Board', '13 × 19 in', '₹20.00', '₹19.00', '₹18.00'],
  ['16', 'Special Size Art Board (300 gsm)', '13 × 30 in', '₹60.00', '₹55.00', '₹50.00'],
  ['17', 'Special Size Art Board (350 gsm)', '13 × 30 in', '₹70.00', '₹65.00', '₹60.00'],
  ['18', 'Matt Board (300 gsm)', '12 × 18 in', '₹20.00', '₹19.00', '₹18.00'],
  ['19', 'Matt Board (300 gsm)', '13 × 19 in', '₹22.00', '₹21.00', '₹20.00'],
  ['20', 'Matt Board (350 gsm)', '12 × 18 in', '₹25.00', '₹24.00', '₹23.00'],
  ['21', 'Matt Board (350 gsm)', '13 × 19 in', '₹28.00', '₹27.00', '₹26.00'],
  ['22', 'Mirror Board (Gold / Silver)', '12 × 18 in', '₹45.00', '₹42.00', '₹40.00'],
  ['23', 'Mirror Board (Gold / Silver)', '13 × 19 in', '₹50.00', '₹48.00', '₹45.00'],
  ['24', 'Metallic Board (300 gsm)', '12 × 18 in', '₹35.00', '₹32.00', '₹30.00'],
  ['25', 'Metallic Board (300 gsm)', '13 × 19 in', '₹40.00', '₹38.00', '₹35.00'],
  ['26', 'Texture Board - Linen', '12 × 18 in', '₹30.00', '₹28.00', '₹26.00'],
  ['27', 'Texture Board - Linen', '13 × 19 in', '₹35.00', '₹33.00', '₹30.00'],
  ['28', 'Texture Board - Natural Ivory', '12 × 18 in', '₹30.00', '₹28.00', '₹26.00'],
  ['29', 'Texture Board - Natural Ivory', '13 × 19 in', '₹35.00', '₹33.00', '₹30.00'],
  ['30', 'Texture Board - Needle / Embossed', '12 × 18 in', '₹32.00', '₹30.00', '₹28.00'],
  ['31', 'Texture Board - Needle / Embossed', '13 × 19 in', '₹37.00', '₹35.00', '₹32.00'],
  ['32', 'Texture Board - Stucco / Canvas', '12 × 18 in', '₹32.00', '₹30.00', '₹28.00'],
  ['33', 'Texture Board - Stucco / Canvas', '13 × 19 in', '₹37.00', '₹35.00', '₹32.00'],
  ['34', 'Synthetic Non-Tearable (125 Mic)', '12 × 18 in', '₹32.00', '₹30.00', '₹28.00'],
  ['35', 'Synthetic Non-Tearable (125 Mic)', '13 × 19 in', '₹35.00', '₹33.00', '₹30.00'],
  ['36', 'Synthetic Non-Tearable (200 Mic)', '12 × 18 in', '₹42.00', '₹40.00', '₹38.00'],
  ['37', 'Synthetic Non-Tearable (200 Mic)', '13 × 19 in', '₹45.00', '₹42.00', '₹40.00'],
  ['38', 'Transparent Synthetic Film', '12 × 18 in', '₹40.00', '₹38.00', '₹35.00'],
  ['39', 'Transparent Synthetic Film', '13 × 19 in', '₹45.00', '₹42.00', '₹40.00'],
];

const b2bFinishingData = [
  ['Thermal Lamination', 'Glossy Finish (Single Side)', '₹7.00 / sheet'],
  ['Thermal Lamination', 'Matt Finish (Single Side)', '₹7.00 / sheet'],
  ['Thermal Lamination', 'Velvet / Feather Touch Finish', '₹15.00 / sheet'],
  ['Thermal Lamination', '3D Holographic / Special Effect', '₹15.00 / sheet'],
  ['Precision Sheet Cutting', 'Edge Trimming (Per Job/Batch)', '₹40.00'],
  ['Precision Sheet Cutting', 'Cut to A4 Size (Per Batch)', '₹30.00'],
  ['Precision Sheet Cutting', 'Cut to A3 Size (Per Batch)', '₹40.00'],
  ['Precision Sheet Cutting', 'Visiting Card Cutting (Per Set)', '₹60.00'],
  ['Sticker Die & Scoring', 'Creasing / Scoring Line', '₹5.00 / sheet'],
  ['Sticker Die & Scoring', 'Perforation Line', '₹10.00 / sheet'],
  ['Sticker Die & Scoring', 'Custom Shape Half-Cut (Plotter)', '₹20.00 / sheet'],
];

// Document Construction
const doc = new Document({
  styles: {
    default: {
      document: {
        run: {
          font: 'Arial',
          size: 20
        }
      }
    }
  },
  sections: [
    {
      properties: {
        page: {
          margin: {
            top: 1000,
            right: 1000,
            bottom: 1000,
            left: 1000
          }
        }
      },
      children: [
        // Title Header
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 80 },
          children: [
            new TextRun({
              text: 'WINSTAR DIGITAL PRINTING',
              bold: true,
              color: BRAND_PRIMARY,
              font: 'Arial',
              size: 36
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({
              text: 'OFFICIAL PRICING & RATE LIST (QUICK PRINT & B2B WHOLESALE)',
              bold: true,
              color: BRAND_NAVY,
              font: 'Arial',
              size: 24
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 300 },
          children: [
            new TextRun({
              text: 'Complete Catalog for All Features, Media Stocks, Services & Post-Press Operations',
              italics: true,
              color: BRAND_MUTED,
              font: 'Arial',
              size: 20
            })
          ]
        }),

        // PART 1: QUICK PRINT (B2C / RETAIL)
        ...createSectionHeading('SECTION 1: QUICK PRINT (B2C) — BLACK & WHITE PRINTING', 'Standard document reproduction, technical drawings, and legal documentation'),
        createTable(
          ['Size', 'Media Type', 'Weight / GSM', 'Single Side (1st / Single)', 'Back to Back (Per Side)'],
          b2cBlackAndWhiteData,
          [15, 25, 20, 20, 20]
        ),

        ...createSectionHeading('SECTION 2: QUICK PRINT (B2C) — COLOR PRINTING & LARGE FORMAT', 'High-definition digital color prints, brochures, posters, and presentation sheets'),
        createTable(
          ['Size / Format', 'Media Type', 'Weight / GSM', 'Single Side (4+0)', 'Back to Back (4+4)'],
          b2cColorData,
          [18, 26, 18, 19, 19]
        ),

        ...createSectionHeading('SECTION 3: VISITING CARDS & CORPORATE BUSINESS CARDS', 'Premium digital visiting cards with multiple paper stocks, coatings, and finishing tiers'),
        createTable(
          ['Card Type & Substrate', 'Quantity Tier', 'Rate (Single / Both Side)', 'Details & Finishing'],
          visitingCardsData,
          [35, 18, 22, 25]
        ),

        ...createSectionHeading('SECTION 4: MARKETING MATERIALS, LETTERHEADS & BILL BOOKS', 'Office stationery, promotional flyers, invoice pads, and commercial print assets'),
        createTable(
          ['Service / Product Item', 'Batch Quantity / Tier', 'Price Rate', 'Specifications'],
          marketingBooksData,
          [35, 20, 20, 25]
        ),

        ...createSectionHeading('SECTION 5: BINDING & FINISHING SERVICES', 'Document finishing, binding covers, stapled chat binding, and spiral books'),
        createTable(
          ['Binding Style & Spec', 'Applicable Page / Size Tier', 'Rate (Per Unit)'],
          bindingsData,
          [45, 30, 25]
        ),

        // PART 2: B2B WHOLESALE
        ...createSectionHeading('SECTION 6: B2B WHOLESALE — 39 MEDIA SHEET RATE LIST', 'Bulk digital press sheet rates (Single & Both side printing) for registered wholesale partners'),
        createTable(
          ['#', 'Media Type & Substrate', 'Sheet Size', '1 - 25 Sheets', '26 - 100 Sheets', '100+ Sheets'],
          b2bMediaData,
          [6, 38, 16, 13, 13, 14]
        ),

        ...createSectionHeading('SECTION 7: B2B POST-PRESS FINISHING & ADD-ONS', 'Lamination, precision bulk guillotine trimming, creasing, and plotting services'),
        createTable(
          ['Category', 'Operation / Finishing Service', 'Wholesale Rate'],
          b2bFinishingData,
          [30, 45, 25]
        ),

        // Footer Note
        new Paragraph({
          spacing: { before: 400, after: 100 },
          children: [
            new TextRun({
              text: 'Note & Terms:',
              bold: true,
              color: BRAND_PRIMARY,
              font: 'Arial',
              size: 20
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: '1. All B2B rates apply exclusively to verified and approved B2B Partner accounts.',
              font: 'Arial',
              size: 18,
              color: BRAND_DARK
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: '2. Standard dispatch turnaround for B2B orders is same-day / next-day depending on job quantity and finishing requirements.',
              font: 'Arial',
              size: 18,
              color: BRAND_DARK
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 60 },
          children: [
            new TextRun({
              text: '3. GST and applicable shipping charges are calculated at checkout as per current tax regulations.',
              font: 'Arial',
              size: 18,
              color: BRAND_DARK
            })
          ]
        }),
        new Paragraph({
          spacing: { before: 0, after: 120 },
          children: [
            new TextRun({
              text: '4. For custom orders, specialty media stocks, or bulk contracts exceeding 1,000 sheets, please contact Winstar Digital Printing administration.',
              font: 'Arial',
              size: 18,
              color: BRAND_DARK
            })
          ]
        })
      ]
    }
  ]
});

async function main() {
  const outputPath = path.resolve(__dirname, 'WINSTAR_PRICING_RATE_LIST.docx');
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outputPath, buffer);
  console.log(`Document generated successfully at: ${outputPath}`);
}

main().catch(err => {
  console.error('Error generating document:', err);
  process.exit(1);
});
