# 🚀 RentalHub — Render.com Deployment Guide

Complete step-by-step guide to deploy **RentalHub** on [Render](https://render.com) (100% Free Tier compatible).

---

## 📋 Architecture on Render

```
Client Browser
     │
     ├──► Frontend: Static Site (React 19 + Vite) ───► https://rentalhub-frontend.onrender.com
     │
     └──► Backend:  Web Service (Express 5 + Socket.IO) ──► https://rentalhub-backend.onrender.com
                          │
                          └──► Database: MongoDB Atlas Cluster (Cloud NoSQL)
```

---

## ⚡ Pre-Deployment Checklist (Important!)

Before deploying on Render, ensure your **MongoDB Atlas** database accepts connections from Render:
1. Go to [MongoDB Atlas Console](https://cloud.mongodb.com/).
2. Select your project → Click **Network Access** in the left sidebar.
3. Click **Add IP Address**.
4. Click **Allow Access from Anywhere** (`0.0.0.0/0`).
5. Click **Confirm**. *(Render free services use dynamic outbound IP addresses, so 0.0.0.0/0 is required).*
6. In **Database Access**, make sure you know your database username and password.

---

## 🛠️ Deployment Methods

You have two options on Render:
- **Method 1 (Recommended & Fastest):** 1-Click Blueprint using `render.yaml`
- **Method 2:** Manual Dashboard Setup (step-by-step)

---

### Method 1: 1-Click Blueprint Deployment (Using `render.yaml`)

We have already configured `render.yaml` in the root of your repository.

1. **Push your code to GitHub/GitLab:**
   ```bash
   git add .
   git commit -m "Configure project for Render deployment"
   git push origin main
   ```
2. Log in to [dashboard.render.com](https://dashboard.render.com).
3. Click **New +** (top right) → Select **Blueprint**.
4. Connect your **RentalHub** GitHub repository.
5. Render will automatically detect `render.yaml` and configure:
   - `rentalhub-backend` (Node.js Web Service)
   - `rentalhub-frontend` (Static Site with SPA rewrite rules)
6. Render will prompt you for `MONGO_URI`:
   - Paste your Atlas connection string (e.g., `mongodb+srv://user:pass@cluster0.xxx.mongodb.net/rentalhub?retryWrites=true&w=majority`).
7. Click **Apply**.
8. Render will build and deploy both services automatically!

---

### Method 2: Manual Dashboard Setup (Step-by-Step)

If you prefer setting up the services manually via the Render UI:

#### Step 1: Deploy Backend (Web Service)
1. On Render Dashboard, click **New +** → **Web Service**.
2. Connect your repository.
3. Configure settings:
   - **Name:** `rentalhub-backend`
   - **Region:** Choose nearest (e.g. `Oregon` or `Frankfurt`)
   - **Root Directory:** `backend`
   - **Runtime:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan Type:** `Free`
4. Add **Environment Variables** (under *Environment* tab):

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `NODE_ENV` | `production` | Enables production mode |
   | `PORT` | `5000` | Render port |
   | `MONGO_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | `any_random_32_character_string` | E.g. generate one or use strong string |
   | `FRONTEND_URL` | *(Leave blank initially)* | Add your frontend URL here after Step 2 |

5. Click **Deploy Web Service**.
6. Once deployed, copy your backend URL (e.g., `https://rentalhub-backend.onrender.com`).
7. Verify backend: Open `https://rentalhub-backend.onrender.com/api/health` in your browser. It should return:
   ```json
   { "status": "ok", "uptime": 12.3, "timestamp": "..." }
   ```

---

#### Step 2: Deploy Frontend (Static Site)
1. On Render Dashboard, click **New +** → **Static Site**.
2. Connect your repository.
3. Configure settings:
   - **Name:** `rentalhub-frontend`
   - **Root Directory:** `frontend`
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Add **Environment Variable**:

   | Key | Value | Notes |
   | :--- | :--- | :--- |
   | `VITE_API_URL` | `https://rentalhub-backend.onrender.com` | Your backend URL from Step 1 (NO trailing slash) |

5. Configure **Redirects / Rewrites** (under *Redirects/Rewrites* tab):
   *Crucial for React Router SPA (prevents 404 on page refresh!)*
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
6. Click **Create Static Site**.
7. Once deployed, copy your frontend URL (e.g., `https://rentalhub-frontend.onrender.com`).

---

#### Step 3: Link Frontend URL back to Backend CORS
1. Go back to your `rentalhub-backend` Web Service on Render.
2. Go to **Environment** tab.
3. Set `FRONTEND_URL` to your frontend URL:
   ```
   FRONTEND_URL=https://rentalhub-frontend.onrender.com
   ```
4. Click **Save Changes** (Render will automatically re-deploy the backend with updated CORS).

---

## 🔑 Environment Variables Cheat Sheet

### Backend (`rentalhub-backend`)
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.a82h2.mongodb.net/rentalhub?retryWrites=true&w=majority
JWT_SECRET=your_super_strong_random_secret_key_at_least_32_chars
FRONTEND_URL=https://rentalhub-frontend.onrender.com
```

### Frontend (`rentalhub-frontend`)
```env
VITE_API_URL=https://rentalhub-backend.onrender.com
```

---

## ❓ Troubleshooting Common Render Issues

### 1. Backend Cold Starts (Free Tier)
Render free Web Services go to sleep after 15 minutes of inactivity. When a request arrives, it takes ~45–50 seconds to spin back up.
- *Fix:* Wait 45 seconds on first access, or use a free monitoring service like [UptimeRobot](https://uptimerobot.com) to ping `https://your-backend.onrender.com/api/health` every 10 minutes.

### 2. CORS Error on API Calls
- Make sure `FRONTEND_URL` in the backend environment variables exactly matches your frontend URL without trailing slashes.
- Our updated `server.js` automatically allows all `*.onrender.com` domains, so this is pre-configured.

### 3. Page Refresh Shows 404 (Not Found)
- In Render Frontend Static Site settings, ensure the **Rewrite** rule is added:
  - Source: `/*`
  - Destination: `/index.html`
  - Action: `Rewrite`

