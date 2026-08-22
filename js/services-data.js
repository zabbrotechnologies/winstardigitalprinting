/* js/services-data.js - Centralized Printing Services & Dynamic Form Configurations */

export const SERVICES_CONFIG = {
    "business-cards": {
        id: "business-cards",
        name: "Business Cards",
        category: "business",
        shortDesc: "Premium professional visiting cards with spot UV, gloss/matte lamination, and custom GSM choices.",
        description: "Make a powerful first impression with high-resolution digital business cards. Available in multiple paper GSM, single/double sided printing, rounded corners, and luxury finishes.",
        icon: "💳",
        image: "assets/images/hero.png",
        allowedFileTypes: [".pdf", ".jpg", ".png", ".psd", ".ai"],
        fields: [
            { id: "quantity", label: "Quantity", type: "select", options: [
                { label: "100 Cards", value: "100" },
                { label: "250 Cards", value: "250" },
                { label: "500 Cards", value: "500" },
                { label: "1000 Cards", value: "1000" },
                { label: "2500 Cards", value: "2500" }
            ], default: "250" },
            { id: "cardSize", label: "Card Size", type: "select", options: [
                { label: "Standard (3.5 x 2.0 inches)", value: "standard" },
                { label: "Square (2.5 x 2.5 inches)", value: "square" },
                { label: "Slim / Mini (3.5 x 1.5 inches)", value: "slim" }
            ], default: "standard" },
            { id: "paperGsm", label: "Paper GSM", type: "select", options: [
                { label: "300 GSM Art Card (Standard)", value: "300gsm" },
                { label: "350 GSM Heavy Premium", value: "350gsm" },
                { label: "400 GSM Ultra Thick Velvet", value: "400gsm" }
            ], default: "300gsm" },
            { id: "paperType", label: "Paper Type", type: "select", options: [
                { label: "Gloss Art Board", value: "gloss" },
                { label: "Matte Art Board", value: "matte" },
                { label: "Textured Specialty Board", value: "textured" },
                { label: "Metallic Pearl Board", value: "metallic" }
            ], default: "matte" },
            { id: "printSides", label: "Printing Sides", type: "select", options: [
                { label: "Single Sided", value: "single" },
                { label: "Double Sided", value: "double" }
            ], default: "double" },
            { id: "finishing", label: "Finish Coating", type: "select", options: [
                { label: "None", value: "none" },
                { label: "Gloss Lamination", value: "glossLamination" },
                { label: "Velvet Matte Lamination", value: "matteLamination" },
                { label: "Spot UV + Matte Lamination", value: "spotUv" }
            ], default: "matteLamination" }
        ]
    },

    "brochures": {
        id: "brochures",
        name: "Brochures & Pamphlets",
        category: "business",
        shortDesc: "High-impact bi-fold and tri-fold corporate marketing brochures.",
        description: "Showcase your company profile, products, or promotional events with crisp color-calibrated brochure printing on premium gloss or matte paper.",
        icon: "📄",
        image: "assets/images/hero.png",
        allowedFileTypes: [".pdf", ".jpg", ".png", ".ai"],
        fields: [
            { id: "size", label: "Brochure Size", type: "select", options: [
                { label: "A4 (8.27 x 11.69 inches)", value: "A4" },
                { label: "A5 (5.83 x 8.27 inches)", value: "A5" },
                { label: "A3 (11.69 x 16.54 inches)", value: "A3" }
            ], default: "A4" },
            { id: "foldType", label: "Fold Type", type: "select", options: [
                { label: "No Fold (Single Sheet)", value: "none" },
                { label: "Bi-Fold (Half Fold)", value: "bifold" },
                { label: "Tri-Fold (C-Fold)", value: "trifold" },
                { label: "Z-Fold", value: "zfold" }
            ], default: "trifold" },
            { id: "paperGsm", label: "Paper GSM", type: "select", options: [
                { label: "130 GSM Gloss Paper", value: "130gsm" },
                { label: "170 GSM Premium Gloss", value: "170gsm" },
                { label: "250 GSM Cardstock", value: "250gsm" }
            ], default: "170gsm" },
            { id: "printType", label: "Colour Type", type: "select", options: [
                { label: "Full HD Colour", value: "colour" },
                { label: "Black & White Crisp", value: "bw" }
            ], default: "colour" },
            { id: "printSides", label: "Sides", type: "select", options: [
                { label: "Double Sided", value: "double" },
                { label: "Single Sided", value: "single" }
            ], default: "double" },
            { id: "quantity", label: "Quantity", type: "number", min: 50, step: 50, default: 100 }
        ]
    },

    "stickers": {
        id: "stickers",
        name: "Stickers & Product Labels",
        category: "branding",
        shortDesc: "Custom die-cut, waterproof vinyl, and paper product labels.",
        description: "Precision kiss-cut and die-cut custom stickers for product packaging, branding, jar labels, and promotional giveaways.",
        icon: "🏷️",
        image: "assets/images/hero.png",
        allowedFileTypes: [".pdf", ".png", ".jpg", ".psd"],
        fields: [
            { id: "stickerType", label: "Sticker Type", type: "select", options: [
                { label: "Waterproof Vinyl (Indoor/Outdoor)", value: "vinyl" },
                { label: "Standard Gloss Paper Sticker", value: "paper" },
                { label: "Transparent / Clear Vinyl", value: "transparent" },
                { label: "Metallic Gold / Silver Vinyl", value: "metallic" }
            ], default: "vinyl" },
            { id: "stickerShape", label: "Shape", type: "select", options: [
                { label: "Custom Die-Cut (Around Logo)", value: "diecut" },
                { label: "Circle / Oval", value: "circle" },
                { label: "Rectangle / Square", value: "rectangle" }
            ], default: "diecut" },
            { id: "stickerSize", label: "Sticker Size", type: "select", options: [
                { label: "2 x 2 inches (Small)", value: "2x2" },
                { label: "3 x 3 inches (Medium)", value: "3x3" },
                { label: "4 x 4 inches (Large)", value: "4x4" },
                { label: "A4 Sheet Stickers", value: "A4" }
            ], default: "2x2" },
            { id: "finishing", label: "Lamination", type: "select", options: [
                { label: "Gloss Waterproof Lamination", value: "glossLamination" },
                { label: "Matte Soft Lamination", value: "matteLamination" },
                { label: "Unlaminated", value: "none" }
            ], default: "glossLamination" },
            { id: "quantity", label: "Quantity (Stickers)", type: "number", min: 50, step: 50, default: 100 }
        ]
    },

    "certificates": {
        id: "certificates",
        name: "Certificates & Diplomas",
        category: "corporate",
        shortDesc: "Official institution certificates on gold-foil or textured board.",
        description: "High-grade certificate printing for schools, colleges, institutions, corporate awards, and training completion with crisp security detail.",
        icon: "🏆",
        image: "assets/images/hero.png",
        allowedFileTypes: [".pdf", ".jpg", ".png", ".ai"],
        fields: [
            { id: "size", label: "Certificate Size", type: "select", options: [
                { label: "A4 (Standard 8.27 x 11.69 in)", value: "A4" },
                { label: "A3 (Large 11.69 x 16.54 in)", value: "A3" }
            ], default: "A4" },
            { id: "paperGsm", label: "Paper GSM & Board", type: "select", options: [
                { label: "250 GSM Fine Textured Paper", value: "250gsm" },
                { label: "300 GSM Heavy Ivory Board", value: "300gsm" },
                { label: "350 GSM Parchment Premium", value: "350gsm" }
            ], default: "300gsm" },
            { id: "printType", label: "Colour Type", type: "select", options: [
                { label: "Full HD Colour", value: "colour" },
                { label: "Black & Gold Accent", value: "goldAccent" }
            ], default: "colour" },
            { id: "finishing", label: "Embellishment", type: "select", options: [
                { label: "None", value: "none" },
                { label: "Gold Foil Stamp Border", value: "goldFoil" },
                { label: "Embossed Seal Area", value: "embossed" }
            ], default: "none" },
            { id: "quantity", label: "Quantity", type: "number", min: 10, step: 10, default: 50 }
        ]
    },

    "photo-print": {
        id: "photo-print",
        name: "High-Res Photo Printing",
        category: "personal",
        shortDesc: "Studio quality HD photo prints on Fujifilm/Kodak archival photo paper.",
        description: "Preserve memories with vivid colour reproduction, high dynamic range, and long-lasting photo print papers.",
        icon: "🖼️",
        image: "assets/images/hero.png",
        allowedFileTypes: [".jpg", ".jpeg", ".png", ".tiff", ".pdf"],
        fields: [
            { id: "photoSize", label: "Photo Size", type: "select", options: [
                { label: "4 x 6 inches (Standard Album)", value: "4x6" },
                { label: "5 x 7 inches (Desk Frame)", value: "5x7" },
                { label: "8 x 10 inches (Enlargement)", value: "8x10" },
                { label: "A4 Photo Size (8.27 x 11.69 in)", value: "A4" },
                { label: "A3 Poster Photo (11.69 x 16.54 in)", value: "A3" }
            ], default: "4x6" },
            { id: "paperType", label: "Photo Finish", type: "select", options: [
                { label: "High Gloss Archival", value: "glossy" },
                { label: "Satin Matte Non-Reflective", value: "matte" },
                { label: "Metallic Pearl Ultra HD", value: "metallic" }
            ], default: "glossy" },
            { id: "quantity", label: "Copies / Quantity", type: "number", min: 1, step: 1, default: 5 }
        ]
    },

    "lamination": {
        id: "lamination",
        name: "Lamination Services",
        category: "finishing",
        shortDesc: "Pouch and thermal roll lamination for document protection.",
        description: "Protect legal documents, IDs, menus, posters, and certificates from moisture, dust, and tears with crystal clear lamination.",
        icon: "🛡️",
        image: "assets/images/hero.png",
        allowedFileTypes: [".pdf", ".jpg", ".png"],
        fields: [
            { id: "documentSize", label: "Document Size", type: "select", options: [
                { label: "ID Card / Badge Size", value: "ID" },
                { label: "A4 Document Size", value: "A4" },
                { label: "A3 Poster Size", value: "A3" },
                { label: "A2 / A1 Wide Format", value: "wide" }
            ], default: "A4" },
            { id: "laminationType", label: "Lamination Thickness & Finish", type: "select", options: [
                { label: "Pouch Hard Lamination (125 Micron)", value: "hardPouch" },
                { label: "Thermal Soft Gloss Lamination", value: "softGloss" },
                { label: "Thermal Matte Anti-Glare", value: "softMatte" }
            ], default: "hardPouch" },
            { id: "quantity", label: "Document Count", type: "number", min: 1, step: 1, default: 1 }
        ]
    },

    "binding": {
        id: "binding",
        name: "Book & Report Binding",
        category: "finishing",
        shortDesc: "Spiral, Wiro, Hardcover, Softcover rexin binding for thesis and manuals.",
        description: "Professional document assembly and book binding solutions for project reports, company catalog manuals, thesis books, and ledger books.",
        icon: "📚",
        image: "assets/images/hero.png",
        allowedFileTypes: [".pdf", ".docx"],
        fields: [
            { id: "paperSize", label: "Document Paper Size", type: "select", options: [
                { label: "A4 (Standard Book)", value: "A4" },
                { label: "A5 (Handbook / Booklet)", value: "A5" },
                { label: "A3 (Architectural Portfolio)", value: "A3" }
            ], default: "A4" },
            { id: "bindingType", label: "Binding Style", type: "select", options: [
                { label: "Spiral Plastic Binding", value: "spiral" },
                { label: "Twin Loop Wire-O (Wiro)", value: "wiro" },
                { label: "Softcover Perfect Thermal", value: "soft" },
                { label: "Hardcover Book Binding", value: "hard" },
                { label: "Golden Embossed Rexin Hardcover", value: "rexin" }
            ], default: "spiral" },
            { id: "coverType", label: "Front Cover Sheet", type: "select", options: [
                { label: "Transparent OHP Sheet + Black Backing", value: "ohp" },
                { label: "300 GSM Full Color Custom Cover Card", value: "customCard" },
                { label: "Cloth / Rexin Engraved Front", value: "engraved" }
            ], default: "ohp" },
            { id: "quantity", label: "Number of Books", type: "number", min: 1, step: 1, default: 1 }
        ]
    }
};
