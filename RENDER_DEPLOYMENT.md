# 🚀 Deploying StaffPulse to Render (Complete Guide)

This guide walks you through deploying **StaffPulse** (React Frontend + FastAPI Backend + PostgreSQL Database) to [Render](https://render.com) with zero downtime.

---

## 🌟 Method 1: 1-Click Blueprint Deployment (Recommended)

Render can automatically provision the **PostgreSQL database**, the **FastAPI Backend**, and the **React Frontend** together using the included [`render.yaml`](file:///c:/Users/Admin/Desktop/task%20track/render.yaml) file.

### Step 1: Create the GitHub Repository & Push
1. Open your browser and create a new repository on GitHub:
   👉 **[https://github.com/new](https://github.com/new)**
   - **Repository name**: `staffpulse`
   - **Visibility**: Public (or Private)
   - Leave "Initialize with README" **unchecked** (we already have everything committed).
2. Push your project to GitHub (the remote has already been configured for you):
   ```bash
   git push -u origin main
   ```

### Step 2: Deploy on Render via Blueprint
1. Go to [dashboard.render.com](https://dashboard.render.com/) and sign in.
2. Click the **"New +"** button in the top right corner.
3. Select **"Blueprint"**.
4. Connect your `staffpulse` repository.
5. Render will detect [`render.yaml`](file:///c:/Users/Admin/Desktop/task%20track/render.yaml) and display:
   - **`staffpulse-db`** (Managed PostgreSQL Database)
   - **`staffpulse-backend`** (Python Web Service)
   - **`staffpulse-frontend`** (Static Site)
6. Click **"Apply"**.
7. Render will build and deploy all three services automatically!

---

## 🛠️ Method 2: Step-by-Step Manual Deployment on Render

If you prefer to configure each service manually in the Render dashboard:

### 1. Create the PostgreSQL Database
1. In Render Dashboard, click **"New +"** -> **"PostgreSQL"**.
2. Settings:
   - **Name**: `staffpulse-db`
   - **Database**: `staffpulse_db`
   - **User**: `postgres`
   - **Region**: Choose the region closest to you (e.g. *Oregon* or *Frankfurt*)
   - **Plan**: `Free`
3. Click **"Create Database"**.
4. Once created, copy the **Internal Database URL** (starts with `postgres://...`).

---

### 2. Create the FastAPI Backend Web Service
1. Click **"New +"** -> **"Web Service"**.
2. Connect your GitHub repository.
3. Settings:
   - **Name**: `staffpulse-backend`
   - **Region**: Same region as your database
   - **Runtime**: `Python`
   - **Build Command**:
     ```bash
     pip install --upgrade pip && pip install -r backend/requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
   - **Plan**: `Free`
4. Add Environment Variables:
   - `DATABASE_URL`: Paste the Internal Database URL from Step 1.
   - `PYTHON_VERSION`: `3.11.8`
5. Click **"Create Web Service"**.
6. Render will assign you a backend URL (e.g., `https://staffpulse-backend.onrender.com`).
   - You can test it by visiting: `https://staffpulse-backend.onrender.com/docs`

---

### 3. Create the React Frontend Static Site
1. Click **"New +"** -> **"Static Site"**.
2. Connect your GitHub repository.
3. Settings:
   - **Name**: `staffpulse-frontend`
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build
     ```
   - **Publish Directory**:
     ```bash
     ./frontend/dist
     ```
4. Add Environment Variable:
   - `VITE_API_URL`: `https://staffpulse-backend.onrender.com` (Your backend URL from step 2)
5. Add Redirect/Rewrite Rule (for Single Page App routing):
   - Go to **"Redirects/Rewrites"** in the sidebar.
   - Add rule:
     - **Type**: `Rewrite`
     - **Source**: `/*`
     - **Destination**: `/index.html`
6. Click **"Create Static Site"**.

---

## ⚡ Method 3: Single Unified Service (Easiest Free Tier)

Because [`backend/app/main.py`](file:///c:/Users/Admin/Desktop/task%20track/backend/app/main.py) is already configured to automatically serve the compiled frontend from `frontend/dist`, you can also deploy the entire full-stack app as **a single Render Web Service**:

1. Click **"New +"** -> **"Web Service"**.
2. Settings:
   - **Build Command**:
     ```bash
     cd frontend && npm install && npm run build && cd ../backend && pip install -r requirements.txt
     ```
   - **Start Command**:
     ```bash
     cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT
     ```
3. Set `DATABASE_URL` to your PostgreSQL database.
4. Your single URL will serve both the React web application and the `/api` endpoints!

---

## 🔍 Pre-Configured Render Compatibility Features

Your codebase already includes:
- ✅ **Automatic `postgres://` to `postgresql+psycopg2://` translation:** Render provides database URLs starting with `postgres://`, which SQLAlchemy 2.0 rejects. Our [`backend/app/config.py`](file:///c:/Users/Admin/Desktop/task%20track/backend/app/config.py) automatically converts this without any crashes.
- ✅ **Dynamic `$PORT` binding:** Uvicorn binds to `0.0.0.0:$PORT` as required by Render's routing mesh.
- ✅ **Automatic Database Migration & Seeding:** On startup, FastAPI executes `Base.metadata.create_all()` and seeds initial staff (Maya, Anita, Rahul, Suresh) if empty.
- ✅ **CORS Wildcard Configuration:** Handles requests between different `.onrender.com` subdomains smoothly.
- ✅ **Offline / LocalStorage Fallback:** If the free-tier backend is spinning up from cold sleep, the browser UI continues working seamlessly via `localStorage`!

