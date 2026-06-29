# 🚀 The Rising Stars - Complete Click-by-Click Deployment Guide

Project runs under the **Example 1** folder structure:
```text
The rising star/
  ├── index.html        (Frontend Home)
  ├── track.html         (Parent Map Tracking)
  ├── admin.html         (Admin Dashboard & GPS console)
  ├── js/
  ├── css/
  └── backend/           (Node.js + Express API + Prisma)
```

---

## 🛠️ Step 1: Initializing and Pushing to GitHub

Since Git is installed, open **Command Prompt** or **PowerShell** inside `The rising star` folder and run:

```bash
# 1. Set your identity (if not already set globally)
git config user.name "Shashank"
git config user.email "your-email@example.com"

# 2. Initialize and commit
git init
git add .
git commit -m "Initial commit - The Rising Stars v1.5 with Live GPS Tracking"
git branch -M main

# 3. Create a blank repository named "therisingstars" on github.com
# Then, connect and push:
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/therisingstars.git
git push -u origin main
```

---

## 🐘 Step 2: Create Neon PostgreSQL Database

1. Go to [Neon.tech](https://neon.tech/) and sign up / log in.
2. Click **Create Project**. Name it `therisingstars` and select your nearest region.
3. Once created, copy the connection string under **Connection Details** (make sure **Prisma** or **PostgreSQL** is selected).
   - It will look like: `postgresql://neondb_owner:PASSWORD@ep-random-string.us-east-2.aws.neon.tech/neondb?sslmode=require`
   - Keep this URL safe!

---

## 🚃 Step 3: Deploy Backend on Railway

1. Go to [Railway.app](https://railway.app/) and log in.
2. Click **New Project** ➔ **Deploy from GitHub repo** ➔ Select `therisingstaradventure`.
3. Before it builds, click on the newly created card and go to **Settings**:
   - Scroll down to the **Root Directory** setting.
   - Change it from `/` to `/backend`. (This tells Railway to ignore the frontend code and build the Node/Express server inside the `backend` folder).
4. Go to **Variables** tab and click **New Variable** to add:
   - `DATABASE_URL` = *(Your Neon PostgreSQL connection string from Step 2)*
   - `JWT_SECRET` = `therisingstars_ultra_secure_premium_adventure_jwt_token_key_2026`
   - `NODE_ENV` = `production`
   - `PORT` = `5000`
5. Go to **Settings** tab, scroll down to **Environment / Custom Domains**, and click **Add Domain** to connect: `api.therisingstarsadventures.org`.
6. Click **Deploy**.

---

## ⚡ Step 4: Deploy Frontend on Vercel

1. Go to [Vercel.com](https://vercel.com/) and log in.
2. Click **Add New** ➔ **Project** ➔ Import the `therisingstaradventure` repository from GitHub.
3. In the project setup screen:
   - **Framework Preset**: Leave as `Other` (or static HTML/CSS).
   - **Root Directory**: Keep as `./` (the root).
   - Under Build & Development settings, keep everything blank.
4. Click **Deploy**.
5. Once deployment is complete, go to project settings, click **Domains**, and add your custom domain: `therisingstarsadventures.org` (and `www.therisingstarsadventures.org`).

---

## 🌐 Step 5: Configure GoDaddy DNS Records

Log in to GoDaddy, open the DNS Management panel for `therisingstarsadventures.org`, and configure these records:

| Type  | Name  | Value / Target | TTL |
| :---: | :---: | :--- | :---: |
| **A** | `@` | `76.76.21.21` *(Vercel IP Address)* | 1 Hour |
| **CNAME** | `www` | `cname.vercel-dns.com` *(Vercel DNS)* | 1 Hour |
| **CNAME** | `api` | `therisingstarsadventure-production.up.railway.app` *(Your Railway default URL)* | 1 Hour |

*(Note: If you get a duplicate/invalid error on GoDaddy for A record `@`, edit the existing default "Parked" record instead of adding a new one, and change its value to `76.76.21.21`)*
