# 🚀 Deploying Tennis Predictive Engine on Render

This repository is pre-configured for seamless, zero-friction deployment on [Render](https://render.com).

---

## 🌟 Method 1: 1-Click Render Blueprint (Recommended)

Render Blueprints allow you to provision both the **Vite React Frontend** and the **FastAPI Python Backend** automatically using the included `render.yaml`.

1. Push this repository to your **GitHub** account.
2. Sign in to your [Render Dashboard](https://dashboard.render.com).
3. Click **New +** in the top navigation and select **Blueprint**.
4. Connect your GitHub repository.
5. Render will automatically parse `render.yaml` and configure:
   - **`tennis-predictive-engine`**: Static Site for the React web application (free, lightning-fast CDN, automatic SSL).
   - **`tennis-engine-api`**: Python Web Service for the live engine API and Two-Track endpoints.
6. (Optional) In the environment variables section, set:
   - `LIVETENNISAPI_KEY`: Your LiveTennisAPI key for Track 1 targeted player searches.
   - `THE_ODDS_API_KEY`: For live FanDuel bookmaker odds.
7. Click **Apply**. Render will build and deploy the app in under 60 seconds!

---

## ⚡ Method 2: Manual Static Site on Render (Frontend Only)

If you only want to host the web interface on Render's global CDN:

1. In Render Dashboard, click **New +** -> **Static Site**.
2. Select your repository.
3. Configure settings:
   - **Name:** `tennis-predictive-engine`
   - **Branch:** `main`
   - **Root Directory:** *(leave blank for repository root)*
   - **Build Command:** `npm install && npm run build`
   - **Publish Directory:** `dist`
4. Expand **Advanced** -> **Redirects / Rewrites**:
   - Click **Add Rule**
   - **Type:** `Rewrite`
   - **Source:** `/*`
   - **Destination:** `/index.html`
   *(This ensures client-side routing works smoothly across refreshes).*
5. Click **Create Static Site**.

---

## 🐍 Method 3: Python Web Service on Render (FastAPI Backend)

To deploy the Python Two-Track Live Tennis Engine API:

1. In Render Dashboard, click **New +** -> **Web Service**.
2. Select your repository.
3. Configure settings:
   - **Runtime:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python scripts/live_engine.py --serve`
4. Set Environment Variables:
   - `PORT`: (Render sets this automatically, default: `10000` or `8000`)
   - `LIVETENNISAPI_KEY`: *(Your key)*
   - `THE_ODDS_API_KEY`: *(Optional)*
5. Click **Create Web Service**.

The API endpoints will be accessible at:
- `GET /api/matches/search?player={name}` — Track 1 Targeted Search via LiveTennisAPI
- `GET /api/track2/picks` — Track 2 Autonomous Picks
- `POST /api/track2/feedback` — Continuous Model Refinement

---

## ⏱️ GitHub Actions 24/7 Automated Engine

Render works in perfect harmony with GitHub Actions:
- GitHub Actions handles the heavy 50,000-iteration Monte Carlo math and polls feeds on schedule (`.github/workflows/dual_live_engine_master.yml`).
- Render hosts the live dashboard and API, pulling updates or serving static assets with instantaneous cache invalidation on Git pushes.
