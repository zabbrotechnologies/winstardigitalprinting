# 🚀 Appwrite Setup Guide for Xerox Digital Pro

This guide helps you set up your Appwrite instance (either on **Appwrite Cloud** `https://cloud.appwrite.io` or Self-Hosted Appwrite) for Xerox Digital Pro.

---

## 1. Create a Project

1. Log into your Appwrite Console.
2. Click **Create Project**.
3. Name: `Xerox Digital Pro` (or custom name).
4. Project ID: `xerox-digital-pro` (or note down your custom Project ID).

---

## 2. Configure Web Platform

1. In your Project Overview, under **Add a Platform**, select **Web App**.
2. Name: `Xerox Digital Pro Web`.
3. Hostname: `localhost` (and your production domain if deploying).

---

## 3. Create Database & Collections

1. Go to **Databases** → **Create Database**.
   - Database Name: `Xerox Digital Pro`
   - Database ID: `xerox_digital_pro`

### Collection 1: `users_profile`
- Collection Name: `Users Profile`
- Collection ID: `users_profile`
- **Permissions**:
  - `Users` (Role: Any authenticated user) → Read, Create, Update
  - `Any` (Role: Guests) → Read

**Attributes**:
| Attribute Key | Type | Size / Format | Required | Default |
|---|---|---|---|---|
| `userId` | String | 255 | Yes | - |
| `email` | Email | - | Yes | - |
| `full_name` | String | 255 | Yes | - |
| `company_name` | String | 255 | No | `null` |
| `mobile` | String | 50 | No | `null` |
| `business_details` | String | 2000 | No | `null` |
| `created_at` | String | 100 | No | `null` |

**Indexes**:
- Key: `userId_idx`, Type: `Unique` or `Key`, Attributes: `userId`

---

### Collection 2: `orders`
- Collection Name: `Orders`
- Collection ID: `orders`
- **Permissions**:
  - `Users` (Role: Any authenticated user) → Read, Create, Update
  - `Any` (Role: Guests) → Read (for public order tracking)

**Attributes**:
| Attribute Key | Type | Size / Format | Required | Default |
|---|---|---|---|---|
| `user_id` | String | 255 | Yes | - |
| `file_name` | String | 255 | Yes | - |
| `file_url` | URL / String | 2000 | No | `null` |
| `file_id` | String | 255 | No | `null` |
| `print_type` | String | 50 | Yes | - |
| `copies` | Integer | - | Yes | 1 |
| `paper_size` | String | 50 | Yes | `A4` |
| `binding` | String | 50 | No | `none` |
| `total_price` | Float | - | Yes | 0.0 |
| `status` | String | 50 | Yes | `Pending` |
| `created_at` | String | 100 | Yes | - |
| `updated_at` | String | 100 | No | `null` |

**Indexes**:
- Key: `user_id_idx`, Type: `Key`, Attributes: `user_id`
- Key: `created_at_idx`, Type: `Key`, Attributes: `created_at` (DESC)

---

## 4. Create Storage Bucket

1. Go to **Storage** → **Create Bucket**.
   - Bucket Name: `Print Files`
   - Bucket ID: `print_files`
2. **Settings**:
   - Maximum File Size: `50MB`
   - Allowed File Extensions: `pdf, doc, docx, jpg, jpeg, png`
   - Permissions:
     - `Users` (Role: Any authenticated user) → Create, Read, Update, Delete
     - `Any` (Role: Guests) → Read (for file previews)

---

## 5. Generate Server API Key

1. Go to **Project Settings** → **API Keys** → **Create API Key**.
2. Name: `Xerox Server Key`.
3. Select Scopes:
   - `users.read`, `users.write`
   - `databases.read`, `databases.write`
   - `files.read`, `files.write`
4. Copy the Secret Key and paste it into `.env` as `APPWRITE_API_KEY`.

---

## 6. Update `.env`

In your root `.env` file:
```env
APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
APPWRITE_PROJECT_ID=xerox-digital-pro
APPWRITE_API_KEY=your_copied_secret_key
APPWRITE_DATABASE_ID=xerox_digital_pro
APPWRITE_USERS_COLLECTION_ID=users_profile
APPWRITE_ORDERS_COLLECTION_ID=orders
APPWRITE_STORAGE_BUCKET_ID=print_files
```
