# Winstar Digital Printing & Xerox - Complete Production Application

Premium Online Digital Printing, Document Service, Copying, and Wholesale Business Platform.

---

## Architecture & Technology Stack

### Backend
- **Runtime**: Node.js (v18+) & Express.js
- **Architecture**: Modular REST API (Controllers, Services, Middlewares, Routes)
- **Database**: Supabase PostgreSQL database
- **Authentication**: Supabase Auth + Server-side JWT Verification
- **Storage**: Supabase Storage (`print-files` bucket for uploaded document PDFs/Images)
- **Email System**: Transactional Email Transporter (SMTP / Nodemailer with HTML templates)
- **WhatsApp Flow**: Integrated WhatsApp Click-to-Chat pre-filled order system

### Frontend
- Pure HTML5, Vanilla CSS3 (Winstar Dark Plum & Glassmorphism Design Token System), Vanilla ES Modules.
- REST Client (`js/api.js`) for smooth asynchronous integration without page reloads.

---

## ⚡ Quick Start Guide

### 1. Install Backend Dependencies
```bash
cd backend
npm install
```

### 2. Environment Variables Setup
Copy `.env.example` to `.env` inside `backend/`:
```bash
cp .env.example .env
```

Configure your secrets:
```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

EMAIL_PROVIDER=smtp
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM="Winstar Digital Printing" <noreply@winstardigital.com>

WHATSAPP_BUSINESS_NUMBER=9345046665
FRONTEND_URL=http://localhost:3000
```

### 3. Database & Storage Setup (Supabase)
Run the migration script located at `supabase/schema.sql` in your Supabase SQL Editor:
- Creates `profiles`, `companies`, and `service_requests` tables.
- Sets up Row Level Security (RLS) policies.
- Creates storage bucket `print-files` for document attachments.

### 4. Create First Administrator Account
Execute the CLI admin seed script:
```bash
cd backend
npm run seed:admin admin@winstardigital.com AdminPass123! "Master Administrator"
```

### 5. Launch Backend API Server
```bash
cd backend
npm run dev
```
The server will start at `http://localhost:5000`.

---

## 🔐 Core User Flows & Security Architecture

### FLOW A — Business / Wholesale Company Customer
1. **Registration**: User fills personal, company, GST, and address details at `signup.html`.
2. **Pending Approval**: Account is created with `status = pending`. An email notice is sent to the customer informing them that their account is awaiting administrator approval.
3. **Strict Login Blocking**: If a pending or rejected user attempts to log in at `login.html`, access is strictly blocked at the backend with a clear approval status message.
4. **Admin Approval**: Admin reviews registration in `admin.html` and clicks **Approve**. Status changes to `approved` and an approval email with login button is dispatched.
5. **Dashboard Access**: Approved customer logs in and gets access to `dashboard.html` and bulk order features.

### FLOW B — Ordinary Customer ("Print Instantly")
1. **No Registration Needed**: Guest customer visits `quick-print.html`.
2. **File Upload & Config**: Customer uploads document, configures print type (B&W/Color), sides, GSM, copies, and binding options.
3. **Database & Storage Save**: Order request is saved to `service_requests` table in Supabase and the document file is stored in Supabase Storage (`print-files`).
4. **WhatsApp Chat Launch**: A formatted WhatsApp message is generated containing the Request ID, customer details, print specs, and estimated total, opening WhatsApp click-to-chat with `WHATSAPP_BUSINESS_NUMBER`.

---

## 📡 REST API Documentation

### Authentication Endpoints
- `POST /api/auth/register`: Register company user (`status = pending`).
- `POST /api/auth/login`: Authenticate email/password & return JWT + user profile.
- `GET /api/auth/me`: Get current authenticated profile.
- `POST /api/auth/logout`: Terminate session.

### User Endpoints
- `GET /api/users/me`: Fetch authenticated profile & company info.
- `PUT /api/users/me`: Update profile details.
- `GET /api/users/me/requests`: Fetch user's print request history.

### Admin Endpoints (Requires `role = admin`)
- `GET /api/admin/dashboard`: Fetch overview metrics (total users, pending, approved, rejected, requests).
- `GET /api/admin/users`: List users with filtering (`?status=pending|approved|rejected`) and sorting (`?sort=newest|oldest|name_asc`).
- `PATCH /api/admin/users/:id/approve`: Approve user account & trigger email.
- `PATCH /api/admin/users/:id/reject`: Reject user account & trigger email with reason.
- `GET /api/admin/service-requests`: List all Print Instantly service requests.
- `PATCH /api/admin/service-requests/:id/status`: Update job status (`pending`, `processing`, `completed`, `cancelled`).

### Service Endpoints
- `POST /api/services/print-request`: Submit Print Instantly order with document file attachment.
- `GET /api/services/requests/:id`: Fetch specific request details.

---

## 📍 Contact & Support
- **Address**: Suganya Lodge Complex, Near Bus Stand, Dindigul - 624001, Tamil Nadu.
- **Primary WhatsApp**: 93450 46665
- **Phone Lines**: 97860 89001 / 83009 70451
