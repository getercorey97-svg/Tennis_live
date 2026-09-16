# 🎾 Tennis Predictive Engine (ATP & WTA)

[![Automated 50,000-Iteration Engine](https://img.shields.io/badge/Monte%20Carlo-50%2C000%20Iterations-blue.svg)](https://github.com)
[![GitHub Actions CI/CD](https://img.shields.io/badge/GitHub%20Actions-24%2F7%20Automated-brightgreen.svg)](.github/workflows/tennis_predictive_engine.yml)
[![Database](https://img.shields.io/badge/SQLite-WAL%20Mode-orange.svg)](schema.sql)
[![Render Deployable](https://img.shields.io/badge/Render-Deploy%20Ready-46E3B7.svg)](RENDER_DEPLOYMENT.md)

A fully automated, dependency-light, high-frequency Tennis Predictive Engine and Backtesting Framework built natively for **Render Cloud** and **GitHub Actions 24/7 CI/CD**.

Every match forecast and backtesting replay runs **50,000 Monte Carlo iterations** under **The Geter Principle**, calculating exact point-by-point game states, court pace dynamics (CPI), barometric altitude drag, and player clutch differentials.

---

## ⚡ Key Highlights

- **Native 50,000 Iterations**: The 50,000 Monte Carlo simulation volume is hardcoded as the core baseline for both the **Prediction Framework** and the **Backtesting Replay Framework**.
- **Render Ready**: Includes a native `render.yaml` blueprint for 1-click deployment on Render as a global static web application or Python FastAPI service.
- **100% GitHub Actions Orchestrated**: Runs on a cron schedule (`0 */3 * * *` every 3 hours) and supports 1-tap manual triggers via `workflow_dispatch`.
- **Auto-Committed Markdown Reports**:
  - [`PREDICTIONS_TODAY.md`](PREDICTIONS_TODAY.md) — Real-time ATP/WTA match win probabilities, fair odds, expected games, exact set distributions, and Quarter-Kelly recommended stakes with date & time stamps.
  - [`FANDUEL_LIVE_RADAR.md`](FANDUEL_LIVE_RADAR.md) — Continuous FanDuel sportsbook in-play live tracking and +EV edge detection with real-time timestamps.
  - [`BACKTEST_REPORT.md`](BACKTEST_REPORT.md) — Zero-lookahead historical replay calibration, Brier Score benchmarking, and Closing Line Value (CLV) beat rates against Pinnacle closing odds.
- **Centralized SQLite in WAL Mode**: Employs Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) and `PRAGMA busy_timeout = 5000;` to guarantee zero lock contention during automated GitHub Actions runs.
- **Lightweight Architecture**: Built strictly with the Python standard library (`math`, `random`, `sqlite3`, `urllib`) + `requests` and `fastapi`. Operates without requiring heavy C compilers, Selenium, or Chromium.

---

## 📁 Repository Structure

```tree
.
├── .github/
│   └── workflows/
│       ├── tennis_predictive_engine.yml   # 24/7 cron & manual pipeline (50k predictions + learning)
│       └── backtest_engine.yml            # Deterministic historical backtest replay (50k iterations)
├── scripts/
│   ├── monte_carlo.py                    # 50,000-iteration Point Markov simulator (The Geter Principle)
│   ├── predict.py                        # Automated prediction pipeline & PREDICTIONS_TODAY.md generator
│   ├── backtest.py                       # Chronological replay engine & BACKTEST_REPORT.md generator
│   ├── database.py                       # SQLite WAL initialization & baseline player ratings
│   ├── fetch_data.py                     # ATP/WTA fixtures & Jeff Sackmann dataset ingestion
│   └── post_mortem_learn.py              # EWMA learning & Empirical Bayes shrinkage
├── schema.sql                            # Complete SQLite relational schema (WAL mode)
├── run_pipeline.py                       # Master CLI runner
├── requirements.txt                      # Zero-bloat lightweight dependencies
├── PREDICTIONS_TODAY.md                  # Auto-generated daily prediction report
├── BACKTEST_REPORT.md                    # Auto-generated backtest calibration report
└── README.md                             # Technical documentation & mobile setup
```

---

## 🚀 Running via GitHub Actions

### 1. Automated 24/7 Schedule
The primary workflow `.github/workflows/tennis_predictive_engine.yml` runs automatically every 3 hours:
1. Ingests fresh tournament schedules and live results.
2. Applies post-match micro-evolution (EWMA serve/return calibration).
3. Executes **50,000 Monte Carlo iterations** per scheduled match.
4. Devigs bookmaker closing odds and identifies +EV value discrepancies.
5. Updates [`PREDICTIONS_TODAY.md`](PREDICTIONS_TODAY.md).
6. Automatically commits and pushes changes back to `main`.

### 2. Manual 1-Tap Trigger (GitHub Mobile / Web)
You can trigger either workflow manually anytime:
1. Open the repository on **GitHub Mobile** or desktop.
2. Tap the **Actions** tab.
3. Select **Tennis Predictive Engine** or **Tennis Backtesting Framework**.
4. Tap **Run workflow**, optionally customize the Monte Carlo iteration count (default: `50000`), and tap **Run**.

---

## 🚀 Deploying on Render

This repository can be deployed directly to [Render](https://render.com) using the included `render.yaml`:

1. **Deploy Frontend (Static Site)**:
   - In Render, create a new **Static Site** from your repository.
   - Set **Build Command**: `npm install && npm run build`
   - Set **Publish Directory**: `dist`
   - Add a rewrite rule for SPA routing: `/*` -> `/index.html`

2. **1-Click Render Blueprint**:
   - In Render, click **New +** -> **Blueprint**.
   - Select this repository to automatically provision the static web frontend and optional FastAPI engine backend.
   - For full details, see [`RENDER_DEPLOYMENT.md`](RENDER_DEPLOYMENT.md).

3. **Execute Engine CLI Locally or in Container**:
   ```bash
   pip install -r requirements.txt
   # Run 50,000 iterations prediction framework
   python run_pipeline.py --mode predict --iterations 50000

   # Run historical backtest framework
   python run_pipeline.py --mode backtest --iterations 50000 --backtest-matches 50

   # Run FastAPI server for LiveTennisAPI search and autonomous tracking
   python scripts/live_engine.py --serve
   ```

---

## 📐 Mathematical Foundations

### 1. The Geter Principle
The Geter Principle governs point leverage dynamics, psychological momentum, and multi-regime variance transitions:
$$L(s) = \begin{cases} 0.95 & \text{Break Point (Crisis Regime)} \\ 0.80 & \text{Deuce} \\ 0.70 & \text{30-30} \\ 0.20 & \text{0-0 (Peaceful Regime)} \end{cases}$$
Momentum transitions dynamically: $M_t = \gamma M_{t-1} + \eta_t$, adjusting effective serve win probabilities without runaway variance cascades.

### 2. Environmental Physics Modifiers
- **Court Pace Index (CPI)**: $\Delta_{\text{serve}} = (\text{CPI} - 35) \times 0.0035$
- **Barometric Altitude**: $\Delta_{\text{alt}} = (h / 1000) \times 0.012$
- **Player 72h Fatigue Load**: $\text{Penalty} = \max(0, \text{Court Hours} - 4.5) \times 0.008$
- **Southpaw Asymmetry**: Left-handed server slicing wide on Ad-court gains $+0.024$ edge.

### 3. Empirical Bayes Shrinkage
To prevent overfitting on small-sample qualifiers or injured returning players, statistics shrink toward tour priors:
$$w_i = \min\left(1.0, \frac{N_i}{N_0}\right), \quad \theta_{\text{shrunk}} = w_i \cdot \theta_{\text{sample}} + (1 - w_i) \cdot \theta_{\text{prior}}$$

---

## 📄 License
MIT License. Built for rigorous quantitative tennis analysis.
