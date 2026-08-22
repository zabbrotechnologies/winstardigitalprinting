# WINSTAR DIGITAL PRINTING & XEROX
## End-to-End System Workflow & User Process Guide

---

## 1. Executive Summary & Architecture Overview

The **WINSTAR DIGITAL PRINTING & XEROX** platform is a high-performance, framework-free web application (built using HTML5, CSS3, Vanilla JavaScript, and Supabase Backend Services). 

The platform supports three distinct user experiences:
1. **Normal / Guest Customer**: Instant online file uploads and print configuration without requiring account registration.
2. **Wholesale Agency / Corporate Client**: Verified business accounts accessing wholesale volume pricing, courier delivery options, and application tracking.
3. **Administrator / Staff**: A secure management portal containing metrics and three dedicated tabs (**Normal Prints**, **Wholesale Orders**, and **Agency Verification**).

---

## 2. Comprehensive System Workflows

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                   PUBLIC WEBSITE                                       │
│                                (Winstar Platform)                                      │
└───────────┬───────────────────────────┬───────────────────────────┬────────────────────┘
            │                           │                           │
            ▼                           ▼                           ▼
 ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
 │  NORMAL CUSTOMER    │     │  WHOLESALE AGENCY   │     │  ADMINISTRATOR      │
 │  (No Login Required)│     │  (Account & Proof)  │     │  (Role Auth Guard)  │
 └──────────┬──────────┘     └──────────┬──────────┘     └──────────┬──────────┘
            │                           │                           │
            ▼                           ▼                           ▼
 ┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
 │  1. Select Service  │     │  1. Apply/Register  │     │  1. Unified Login   │
 │     or Quick Print  │     │     (GST & Proof)   │     │     (Admin Email)   │
 ├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
 │  2. Upload Document │     │  2. Admin Approval  │     │  2. Admin Portal    │
 │     / Print File    │     │     (Verification)  │     │     (3 Sec Tabs)    │
 ├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
 │  3. Dynamic Option  │     │  3. Wholesale Login │     │  3. Normal Prints   │
 │     Configuration   │     │     (Role Identified│     │     (View/Download) │
 ├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
 │  4. Real-time Price │     │  4. Wholesale Price │     │  4. Wholesale Orders│
 │     Calculation     │     │     Configurator    │     │     (Courier/Store) │
 ├─────────────────────┤     ├─────────────────────┤     ├─────────────────────┤
 │  5. Request ID      │     │  5. Order & Courier │     │  5. Agency Verification
 │     (WSR-XXXXXX)    │     │     Delivery        │     │     (Approve/Reject)│
 ├─────────────────────┤     └─────────────────────┘     └─────────────────────┘
 │  6. WhatsApp Auto   │
 │     Message Redirect│
 └─────────────────────┘
```

---

## 3. Flow A: Normal Customer Order Process (No Login Required)

### Step A1: Landing & Navigation
- The customer visits the home page ([`index.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/index.html)) or Services page ([`services.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/services.html)).
- They can choose:
  - **Quick Print Room** ([`quick-print.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/quick-print.html)): For fast document printouts (PDF/DOCX/JPG).
  - **Specific Service** ([`service.html?service=business-cards`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/service.html?service=business-cards)): For business cards, brochures, stickers, certificates, photo prints, lamination, or binding.

### Step A2: File Upload & Drag-and-Drop
- Customer clicks or drags their file into the **Upload Dropzone**.
- The system validates file size (max 50MB) and file extension (`.pdf`, `.png`, `.jpg`, `.psd`, `.ai`, `.docx`).
- Displays a visual file preview card with filename, file size, and remove/replace option.

### Step A3: Dynamic Specification Configuration
- The form dynamically renders input options specific to that service:
  - **Business Cards**: Quantity (100–2500), Card Size, Paper GSM (300/350/400 GSM), Finish (Gloss/Velvet Matte/Spot UV), Sides.
  - **Brochures**: Size (A4/A5/A3), Fold Type (Bi-fold, Tri-fold, Z-fold), Paper GSM, Colour, Sides, Quantity.
  - **Quick Print**: B&W or Full HD Colour, Single/Double Sided, Paper Size (A4/A3/A5), GSM (70/80/100/120 GSM), Copies, Binding (Staple/Spiral/Wiro/Hardcover).

### Step A4: Real-time Price Estimation
- The system automatically triggers `calculatePrice()` on every input change.
- Calculates per-page costs, GSM multipliers, binding add-ons, subtotal, 18% GST, and rounded grand total.
- Displays live breakdowns in the **Order Summary** sticky sidebar box.

### Step A5: Order Generation & Request ID
- Customer enters Name and WhatsApp Mobile Number.
- Clicks **SUBMIT PRINT ORDER & OPEN WHATSAPP**.
- The system:
  1. Generates a unique **Request ID** formatted as `WSR-XXXXXX` (e.g. `WSR-310163`).
  2. Uploads and links the file reference to storage bucket `order-files`.
  3. Stores the complete order in the database (`service_requests` / local storage).

### Step A6: WhatsApp Confirmation Modal
- An **ORDER DETAILS READY** modal pops up containing:
  - Request ID (`WSR-310163`)
  - Customer Name & Mobile
  - Service Name & File Uploaded
  - Estimated Total Amount (Incl. GST)
- Customer clicks **CONTINUE TO WHATSAPP →**.
- Opens WhatsApp (`wa.me/9345046665`) with pre-filled order specifications and Request ID.
- Winstar staff receives the WhatsApp message with the Request ID to locate and process the file.

---

## 4. Flow B: Wholesale Agency & Corporate Client Process

### Step B1: Registration & Application Submission
- Agency visits Wholesale Registration page ([`register.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/register.html)).
- Submits:
  - **Personal Information**: Full Name, Mobile, Email, Password.
  - **Company Information**: Company Name, GST Number, Business Address.
  - **Verification Documents**: Visiting Card photo/PDF + Business Proof document.
- Clicks **APPLY FOR WHOLESALE**.
- Application status is set to `pending`.
- Displays modal: *"APPLICATION SUBMITTED. Your account is waiting for Winstar verification."*

### Step B2: Administration Verification
- Winstar Administrator logs into Admin Portal ([`admin.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/admin.html)).
- Opens Section 3 (**AGENCY VERIFICATION**).
- Reviews applicant details, GST, and opens uploaded Visiting Card & Business Proof files.
- Clicks **APPROVE ACCOUNT** (or **REJECT ACCOUNT**).
- Status updates to `approved` in the database.

### Step B3: Wholesale Login & Session Detection
- Approved wholesale client visits Login page ([`login.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/login.html)).
- Enters email and password.
- System authenticates and verifies `role = wholesale` and `status = approved`.
- Session is stored, and user is redirected to Bulk Order portal ([`bulk-order.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/bulk-order.html)).

### Step B4: Wholesale Order Placement
- Active wholesale session triggers wholesale rate tier (`pricing.wholesale`).
- Customer selects service and configures options.
- Pricing box displays **WHOLESALE RATE ACTIVE** badge with lower unit rates.
- Customer selects **Store Pickup** or **Courier Delivery** (collecting delivery address).
- Submits order, generating a wholesale Request ID and notification.

---

## 5. Flow C: Admin Portal Management Process

### Step C1: Secure Admin Authentication
- Administrator visits [`login.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/login.html).
- Enters admin credentials (`admin@winstardigital.com` / `admin`).
- System identifies `role = admin` and redirects to [`admin.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/admin.html).
- Route guard protects `admin.html` from unauthorized users.

### Step C2: Admin Dashboard Metrics
Top stat cards display:
- **Normal Print Orders**: Count of guest & retail print submissions.
- **Wholesale Orders**: Count of agency & corporate orders.
- **Pending Verifications**: Count of awaiting agency applications.

### Step C3: Management Tab 1 — NORMAL PRINTS
- Table displaying: Request ID, Customer Name, Phone, Service, File Name, Copies, Amount, Date, Status.
- **Search Bar**: Instant filter by Request ID or Customer Name.
- **Actions**:
  - **VIEW**: Opens modal with complete job configuration.
  - **DOWNLOAD**: Retrieves exact uploaded print file associated with Request ID.
  - **Status Dropdown**: Updates status (`Pending` → `Confirmed` → `Printing` → `Ready for Pickup` → `Completed`).

### Step C4: Management Tab 2 — WHOLESALE ORDERS
- Dedicated table displaying wholesale business orders.
- Tracks delivery method (Store Pickup vs Courier Delivery address).
- Provides file download and order status management.

### Step C5: Management Tab 3 — AGENCY VERIFICATION
- Queue of wholesale registration requests.
- Shows Company Name, Applicant Name, Phone, Email, Submission Date, and Status (`PENDING` / `APPROVED` / `REJECTED`).
- **VIEW DOCS**: Inspects visiting card and business proof documents.
- **APPROVE**: Grants wholesale pricing access to the user.
- **REJECT**: Updates account status to rejected.

---

## 6. Page-by-Page Feature & Route Reference

| Page File | Route / Purpose | Key Features |
|---|---|---|
| [`index.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/index.html) | Landing / Marketing | Reference Red & Yellow Geometric Hero, About Winstar, Why Winstar (6 cards), Services Preview grid, Quick Print CTA, Wholesale CTA, Contact & Location, Footer. |
| [`services.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/services.html) | Services Catalog | Catalog listing all print services (Business Cards, Brochures, Stickers, Certificates, Photos, Lamination, Binding) with "Order Now" links. |
| [`service.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/service.html) | Dynamic Configurator | Reusable order page (`?service=id`). Renders service-specific input fields, drag-and-drop file upload, live price calculator, Request ID generator, WhatsApp modal. |
| [`quick-print.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/quick-print.html) | Common Print Room | Fast upload for general B&W/Colour document printing, size, GSM, paper type, copies, binding options, and instant WhatsApp submission. |
| [`bulk-order.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/bulk-order.html) | Wholesale Portal | Business information, Login/Register CTAs, and active wholesale ordering catalog for verified accounts. |
| [`register.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/register.html) | Wholesale Registration | Form for personal info, company name, GST, address, and upload fields for Visiting Card & Business Proof documents. |
| [`login.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/login.html) | Unified Intelligent Login | Single sign-in portal for Admin and Wholesale accounts. Identifies account role and status (`admin` -> admin.html, `wholesale` -> bulk-order.html). |
| [`admin.html`](file:///c:/Users/MSI/Documents/client-project/winstardigitalprinting/admin.html) | Admin Management Portal | Dark dashboard with metrics and 3 tabs: **Normal Prints**, **Wholesale Orders**, **Agency Verification**. Search, file download, status updates. |

---

## 7. Storage & File Retrieval System

```
Uploaded Customer File (PDF/PNG/JPG)
         │
         ▼
Validate File Size & Type
         │
         ▼
Generate Request ID (e.g. WSR-310163)
         │
         ▼
Store File in Backend Storage Bucket (`order-files/WSR-310163/filename.pdf`)
         │
         ▼
Save Order Record in Database with Request ID & Storage Path
         │
         ▼
Generate Pre-filled WhatsApp Message containing Request ID
         │
         ▼
Staff opens WhatsApp Message → Reads Request ID (WSR-310163)
         │
         ▼
Admin opens Admin Portal → Searches Request ID (WSR-310163) → Clicks DOWNLOAD
```
