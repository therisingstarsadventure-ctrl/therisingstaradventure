# 🚀 The Rising Stars - Complete Click-by-Click Deployment Guide

Project runs under the following structure:
```text
The rising star/
  ├── index.html        (Frontend Home)
  ├── treks.html        (Adventure Activity Marketplace)
  ├── track.html        (Parent Map Telemetry & SOS Overlay)
  ├── admin.html        (Admin Dashboard & departures Schedule)
  ├── leader.html       (Mobile Leader Console - GPS Broadcaster, attendance checklist, SOS alerts, memories uploader)
  ├── js/
  ├── css/
  └── backend/           (Node.js + Express API + Prisma + Neon PostgreSQL)
```

---

## 🛠️ Step 1: Initializing and Pushing to GitHub

Since Git is installed, open **Command Prompt** or **PowerShell** inside `The rising star` folder and run:

```bash
# 1. Initialize and commit
git init
git add .
git commit -m "Upgrade to v2.0 - Adventure Marketplace, Leader App, SOS Alert system, Live Telemetry"
git branch -M main

# 2. Push to your repository:
git remote add origin https://github.com/therisingstarsadventure-ctrl/therisingstaradventure.git
git push -u origin main
```

---

## 🐘 Step 2: Configure Neon PostgreSQL & Migrations

1. Go to [Neon.tech](https://neon.tech/) and log in.
2. Under Connection Details, copy the database connection URL.
3. In `backend/.env`, configure the variable:
   ```env
   DATABASE_URL="postgresql://neondb_owner:PASSWORD@ep-random-string.us-east-2.aws.neon.tech/neondb?sslmode=require"
   JWT_SECRET="therisingstars_ultra_secure_premium_adventure_jwt_token_key_2026"
   PORT=5000
   ```
4. Run migrations and seed data locally (ensure nodemon is stopped first to avoid DLL locks):
   ```bash
   cd backend
   # Sync Neon database schema
   npx prisma db push
   
   # Populate seeded default mock users, 21 packages, departures, reviews
   node src/utils/seed.js
   ```

### Seeded Credentials:
- **Admin**: `admin@risingstars.com` | Password: `adminpassword`
- **Leader**: `leader@risingstars.com` | Password: `leaderpassword`
- **Customer**: `rahul@gmail.com` | Password: `customerpassword`

---

## 🚃 Step 3: Deploy Backend on Railway

1. Go to [Railway.app](https://railway.app/) and log in.
2. Click **New Project** ➔ **Deploy from GitHub repo** ➔ Select `therisingstaradventure`.
3. In service **Settings**:
   - Change **Root Directory** from `/` to `/backend`.
4. Under **Variables**, add:
   - `DATABASE_URL` = *(Your Neon PostgreSQL connection string)*
   - `JWT_SECRET` = `therisingstars_ultra_secure_premium_adventure_jwt_token_key_2026`
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
5. Go to **Settings** tab, scroll to **Environment / Custom Domains**, and click **Add Domain**: `api.therisingstarsadventures.org`.

---

## ⚡ Step 4: Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com/) and log in.
2. Click **Add New** ➔ **Project** ➔ Import the `therisingstaradventure` repository.
3. In the project setup screen, keep root directory as `./` (root).
4. Click **Deploy**.
5. Once complete, go to project settings, click **Domains**, and add your custom domain: `therisingstarsadventures.org` (and `www.therisingstarsadventures.org`).

---

## 🌐 Step 5: Configure GoDaddy DNS Records

Log in to GoDaddy, open the DNS Management panel for `therisingstarsadventures.org`, and configure these records:

| Type  | Name  | Value / Target | TTL |
| :---: | :---: | :--- | :---: |
| **A** | `@` | `76.76.21.21` *(Vercel IP Address)* | 1 Hour |
| **CNAME** | `www` | `cname.vercel-dns.com` *(Vercel DNS)* | 1 Hour |
| **CNAME** | `api` | `therisingstarsadventure-production.up.railway.app` *(Your Railway default URL)* | 1 Hour |

*(Note: If you get a duplicate/invalid error on GoDaddy for A record `@`, edit the existing default "Parked" record instead of adding a new one, and change its value to `76.76.21.21`)*
