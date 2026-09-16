# 🎾 Tennis Predictive Engine (ATP & WTA)

[![Automated 50,000-Iteration Engine](https://img.shields.io/badge/Monte%20Carlo-50%2C000%20Iterations-blue.svg)](https://github.com)
[![GitHub Actions CI/CD](https://img.shields.io/badge/GitHub%20Actions-24%2F7%20Automated-brightgreen.svg)](.github/workflows/tennis_predictive_engine.yml)
[![Database](https://img.shields.io/badge/SQLite-WAL%20Mode-orange.svg)](schema.sql)
[![Mobile Tested](https://img.shields.io/badge/Mobile-TrebEdit%20%7C%20S26%20Ultra-purple.svg)](#-mobile-workflow-trebedit-on-samsung-galaxy-s26-ultra)

A fully automated, dependency-light, high-frequency Tennis Predictive Engine and Backtesting Framework built natively for **GitHub Actions** and **Samsung Galaxy S26 Ultra (TrebEdit)**.

Every match forecast and backtesting replay runs **50,000 Monte Carlo iterations** under **The Geter Principle**, calculating exact point-by-point game states, court pace dynamics (CPI), barometric altitude drag, and player clutch differentials.

---

## ⚡ Key Highlights

- **Native 50,000 Iterations**: The 50,000 Monte Carlo simulation volume is hardcoded as the core baseline for both the **Prediction Framework** and the **Backtesting Replay Framework**.
- **100% GitHub Actions Orchestrated**: Runs on a cron schedule (`0 */3 * * *` every 3 hours) and supports 1-tap manual triggers via `workflow_dispatch` from the GitHub Mobile app.
- **Auto-Committed Markdown Reports**:
  - [`PREDICTIONS_TODAY.md`](PREDICTIONS_TODAY.md) — Real-time ATP/WTA match win probabilities, fair odds, expected games, exact set distributions, and Quarter-Kelly recommended stakes.
  - [`BACKTEST_REPORT.md`](BACKTEST_REPORT.md) — Zero-lookahead historical replay calibration, Brier Score benchmarking, and Closing Line Value (CLV) beat rates against Pinnacle closing odds.
- **Centralized SQLite in WAL Mode**: Employs Write-Ahead Logging (`PRAGMA journal_mode = WAL;`) and `PRAGMA busy_timeout = 5000;` to guarantee zero lock contention during automated GitHub Actions runs.
- **Zero Heavy C-Extensions**: Built strictly with the Python standard library (`math`, `random`, `sqlite3`, `urllib`) + `requests`. Runs natively in TrebEdit or Termux on Android without requiring C compilers, Selenium, or Chromium.

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

## 📱 Mobile Workflow (TrebEdit on Samsung Galaxy S26 Ultra)

This repository is optimized for mobile development:
1. **Clone in TrebEdit / Termux**:
   ```bash
   git clone https://github.com/<your-username>/tennis-predictive-engine.git
   cd tennis-predictive-engine
   pip install -r requirements.txt
   ```
2. **Execute Locally on Mobile**:
   ```bash
   # Run 50,000 iterations prediction framework
   python run_pipeline.py --mode predict --iterations 50000

   # Run historical backtest framework
   python run_pipeline.py --mode backtest --iterations 50000 --backtest-matches 50

   # Run full orchestration cycle
   python run_pipeline.py --mode all --iterations 50000
   ```
3. **Commit & Push from Mobile**:
   ```bash
   git add .
   git commit -m "Update model tuning from TrebEdit"
   git push origin main
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
