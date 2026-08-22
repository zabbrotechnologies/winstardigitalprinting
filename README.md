# Xerox Digital Pro — Full Stack (React + Express + Appwrite)

A full-stack e-commerce print service built with **React + Vite** (frontend), **Express.js** (backend API / serverless), and **Appwrite** (Authentication, Databases, and Storage Buckets).

## 🗂️ Project Structure

```
winstar/
├── api/                        # Vercel Serverless Function entrypoint (api/index.js)
├── client/                     # React + Vite frontend SPA
├── server/                     # Express.js API server & Appwrite controllers
├── vercel.json                 # Vercel deployment configuration
├── .env.example                # Template for environment variables
├── appwrite_setup_guide.md     # Step-by-step Appwrite setup guide
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
| `APPWRITE_ENDPOINT` | Appwrite instance API endpoint | `https://cloud.appwrite.io/v1` |
| `APPWRITE_PROJECT_ID` | Appwrite project ID | `xerox-digital-pro` |
| `APPWRITE_API_KEY` | Server Secret API Key (from Appwrite console) | *Secret Key* |
| `APPWRITE_DATABASE_ID` | Database ID | `xerox_digital_pro` |
| `APPWRITE_USERS_COLLECTION_ID` | Users collection ID | `users_profile` |
| `APPWRITE_ORDERS_COLLECTION_ID` | Orders collection ID | `orders` |
| `APPWRITE_STORAGE_BUCKET_ID` | Print files storage bucket ID | `print_files` |
| `VITE_APPWRITE_ENDPOINT` | Appwrite endpoint for browser | `https://cloud.appwrite.io/v1` |
| `VITE_APPWRITE_PROJECT_ID` | Project ID for browser | `xerox-digital-pro` |
| `VITE_APPWRITE_DATABASE_ID` | Database ID for browser | `xerox_digital_pro` |
| `VITE_APPWRITE_USERS_COLLECTION_ID` | Users collection ID for browser | `users_profile` |
| `VITE_APPWRITE_ORDERS_COLLECTION_ID` | Orders collection ID for browser | `orders` |
| `VITE_APPWRITE_STORAGE_BUCKET_ID` | Storage bucket ID for browser | `print_files` |

5. Click **Deploy**!

---

## ⚡ Local Development

### 1. Set Up Appwrite
Follow [`appwrite_setup_guide.md`](./appwrite_setup_guide.md) to initialize your Appwrite cloud project.

### 2. Configure Environment Variables
```bash
cp .env.example .env
# Fill in your Appwrite keys in .env
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
| `/auth` | Login & Register (Appwrite Auth & User Profile) |
| `/dashboard` | Client Dashboard with stats + active order history |
| `/services` | Services catalogue + Public Order Tracking |
| `/bulk-order` | B2B Wholesale / Bulk Orders portal |
| `/register-wholesale` | B2B Agency verification registration |
| `/admin` | Winstar Master Admin Panel (Orders, Wholesale, Verifications) |