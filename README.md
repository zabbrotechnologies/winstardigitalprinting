# Xerox Digital Pro — Full Stack (React + Express + Supabase)

A full-stack e-commerce print service built with **React + Vite** (frontend), **Express.js** (backend API / serverless), and **Supabase** (Authentication, PostgreSQL Database, and Storage Buckets).

## 🗂️ Project Structure

```
winstar/
├── api/                        # Vercel Serverless Function entrypoint (api/index.js)
├── client/                     # React + Vite frontend SPA
├── server/                     # Express.js API server & Appwrite controllers
├── vercel.json                 # Vercel deployment configuration
├── .env.example                # Template for environment variables
├── supabase_schema.sql         # Supabase SQL schema definitions
└── WINSTAR_PLATFORM_WORKFLOW_AND_PROCESS_GUIDE.md # Workflow and processes guide
```

---

## 🚀 Deploy to Vercel

1. **Import Repository** into your [Vercel Dashboard](https://vercel.com).
2. **Framework Preset**: Vercel will automatically detect Vite / Node using `vercel.json`.
3. **Root Directory**: Leave as `./` (the root of the repo).
4. **Environment Variables**: In your Vercel Project Settings ➔ **Environment Variables**, add:

| Variable | Description | Sample / Default |
|---|---|---|
| `SUPABASE_URL` | Supabase instance API URL | `https://your-project-ref.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server Secret API Key (from Supabase console) | *Secret Key* |
| `SUPABASE_ANON_KEY` | Public Anon API Key | *Public Key* |
| `VITE_SUPABASE_URL` | Supabase URL for browser | `https://your-project-ref.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Public Anon API Key for browser | *Public Key* |

5. Click **Deploy**!

---

## ⚡ Local Development

### 1. Set Up Supabase
Run the `supabase_schema.sql` file in your Supabase SQL Editor to initialize your database and storage buckets.

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Fill in your Supabase keys in .env
```

### 3. Install & Run
```bash
npm run install:all
npm run dev
```

- **Frontend**: http://localhost:5173
- **API Server**: http://localhost:5000

---

## 📄 Routes & Pages

| Route | Description |
|---|---|
| `/` | Home — Hero, Features, & Quick Print Wizard |
| `/auth` | Login & Register (Supabase Auth & User Profile) |
| `/dashboard` | Client Dashboard with stats + active order history |
| `/services` | Services catalogue + Public Order Tracking |
| `/bulk-order` | B2B Wholesale / Bulk Orders portal |
| `/register-wholesale` | B2B Agency verification registration |
| `/admin` | Winstar Master Admin Panel (Orders, Wholesale, Verifications) |