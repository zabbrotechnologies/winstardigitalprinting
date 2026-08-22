# Xerox Digital Pro — MERN + Appwrite

A full-stack e-commerce print service built with **React + Vite** (frontend), **Express.js** (backend), and **Appwrite** (Appwrite Authentication, Databases, and Storage Buckets).

## 🗂️ Project Structure

```
xerox-digital-pro/
├── client/                     # React + Vite frontend (port 5173)
├── server/                     # Express.js API server (port 5000)
├── .env.example                # Template for Appwrite environment variables
├── appwrite_setup_guide.md     # Step-by-step Appwrite database & bucket setup
└── WINSTAR_PLATFORM_WORKFLOW_AND_PROCESS_GUIDE.md # Workflow and processes guide
```

## ⚡ Quick Start

### 1. Set Up Appwrite

Follow the detailed instructions in [`appwrite_setup_guide.md`](./appwrite_setup_guide.md):
1. Create a project on [Appwrite Cloud](https://cloud.appwrite.io) or self-hosted instance.
2. Add a Web platform (`localhost`).
3. Create `xerox_digital_pro` Database and Collections: `users_profile` & `orders`.
4. Create `print_files` Storage Bucket.
5. Create an API Key in Project Settings and set in `.env`.

### 2. Configure Environment Variables

```bash
cp .env.example .env
# Fill in your Appwrite configuration keys
```

### 3. Install & Run

```bash
# Run both client and server simultaneously
npm run dev
```

- **Frontend:** http://localhost:5173
- **API Server:** http://localhost:5000

## 📄 Pages

| Route | Description |
|---|---|
| `/` | Home — Hero + How It Works + Quick Print Wizard |
| `/auth` | Login & Register (Appwrite Auth & User Profile) |
| `/dashboard` | Client dashboard with stats + order management |
| `/services` | Services catalogue + Public Order Tracking |
| `/bulk-order` | Bulk / Wholesale orders |
| `/admin` | Admin management portal |