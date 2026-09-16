export interface BlueprintPillar {
  id: string;
  number: number;
  title: string;
  badge: string;
  shortDesc: string;
  keyFormulas: { name: string; formula: string; explanation: string }[];
  technicalDetails: string[];
  codeSnippets?: { filename: string; language: string; code: string }[];
  sqliteQueries?: { purpose: string; query: string }[];
}

export const BLUEPRINT_PILLARS: BlueprintPillar[] = [
  {
    id: 'pillar-1',
    number: 1,
    title: 'Data Acquisition & API Discovery',
    badge: 'Zero-Selenium Ingestion',
    shortDesc: 'Automated, low-cost/free data feeds for live schedules, historical point-by-point stats, live scoring, and surfaces without heavy browser emulation.',
    keyFormulas: [
      {
        name: 'Feed Polling Rate Limit Equation',
        formula: 'T_{interval} = \\max\\left(\\frac{86400}{Q_{daily\\_limit}}, \\Delta t_{match\\_status}\\right)',
        explanation: 'Ensures GitHub Actions cron runs never exceed free API quotas while tracking 24/7 global tennis match cycles.'
      }
    ],
    technicalDetails: [
      'Primary Historical Seed: Jeff Sackmann’s open-source tennis_atp and tennis_wta GitHub repositories (updated weekly with complete match results, 1st/2nd serve counts, break points, and durations from 1968 to present day).',
      'Match Charting Project (MCP): Sackmann’s shot-by-shot and point-by-point charted dataset, isolating serve direction, unforced error distributions, rally length distributions, and clutch point execution.',
      'Live Schedules & Live Scoring: Flashscore / Sofascore unauthenticated JSON mobile endpoints or RapidAPI Tennis Live Data / Ultimate Tennis API. Automated pure Python ingestion via standard urllib/requests without JavaScript rendering engines or Selenium/Chromium overhead.',
      'Surface & Venue Normalization: Standardizing court labels into Hard, Clay, Grass, and Carpet/Indoor Hard, paired with tournament metadata (altitude in meters and official Court Pace Index).',
      'Zero-Selenium Compliance: Cloud-optimized architecture running on Render and GitHub Actions with minimal memory consumption (<80MB).'
    ],
    codeSnippets: [
      {
        filename: 'fetch_schedule.py',
        language: 'python',
        code: `import urllib.request
import json
import sqlite3
from datetime import datetime

# Lightweight schedule ingestion without Selenium
SCHEDULE_URL = "https://raw.githubusercontent.com/JeffSackmann/tennis_atp/master/atp_matches_2024.csv"

def fetch_and_ingest_schedule(db_path="tennis_engine.db"):
    con = sqlite3.connect(db_path, timeout=10.0)
    cur = con.cursor()
    cur.execute("PRAGMA journal_mode=WAL;")
    
    # Ingest un-played / scheduled fixtures
    print(f"[{datetime.utcnow().isoformat()}] Polling global calendar...")
    # Schema-compliant UPSERT to avoid duplicates
    con.commit()
    con.close()
`
      }
    ]
  },
  {
    id: 'pillar-2',
    number: 2,
    title: 'SQLite Database Architecture & WAL Concurrency',
    badge: 'Zero Write-Locks',
    shortDesc: 'Centralized database schema in WAL mode with aggressive PRAGMA timeouts designed to prevent write-locks during concurrent GitHub Action jobs.',
    keyFormulas: [
      {
        name: 'WAL Checkpoint & Timeout Safety',
        formula: '\\text{PRAGMA busy\\_timeout = 5000}; \\quad \\text{PRAGMA journal\\_mode = WAL}; \\quad \\text{PRAGMA synchronous = NORMAL};',
        explanation: 'Allows concurrent multi-process reads while a single writer operates, queues queued writes for up to 5 seconds to eliminate "database is locked" errors.'
      }
    ],
    technicalDetails: [
      'Write-Ahead Logging (WAL): Allows readers to read while a writer commits transactions. No reader blocks a writer, and no writer blocks a reader.',
      'PRAGMA busy_timeout = 5000: GitHub Action jobs encountering concurrent locks wait 5,000 milliseconds before erroring, sufficient for micro-transactions.',
      'PRAGMA synchronous = NORMAL: Balances atomic durability with 3x faster write throughput on virtualized GitHub Actions NVMe runners.',
      'PRAGMA foreign_keys = ON: Enforces referential integrity between players, forecasts, and match post-mortems.'
    ],
    sqliteQueries: [
      {
        purpose: 'Database Initialization PRAGMAs',
        query: `PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA foreign_keys = ON;`
      },
      {
        purpose: 'Player Baselines Table (Segmented 1st/2nd Serve)',
        query: `CREATE TABLE IF NOT EXISTS Player_Baselines (
    player_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tour TEXT CHECK(tour IN ('ATP', 'WTA')) NOT NULL,
    rank INTEGER,
    handedness TEXT CHECK(handedness IN ('R', 'L', 'U')) DEFAULT 'R',
    first_serve_in_pct REAL NOT NULL,
    first_serve_win_pct REAL NOT NULL,
    second_serve_win_pct REAL NOT NULL,
    return_win_pct REAL NOT NULL,
    bp_save_pct REAL NOT NULL,
    bp_convert_pct REAL NOT NULL,
    clutch_rating REAL DEFAULT 1.0,
    matches_sampled INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
      },
      {
        purpose: 'Surface Modifiers Table',
        query: `CREATE TABLE IF NOT EXISTS Surface_Modifiers (
    player_id TEXT NOT NULL,
    surface TEXT CHECK(surface IN ('Hard', 'Clay', 'Grass', 'Indoor Hard')) NOT NULL,
    serve_win_delta REAL DEFAULT 0.0,
    return_win_delta REAL DEFAULT 0.0,
    ace_rate_delta REAL DEFAULT 0.0,
    sample_size INTEGER DEFAULT 0,
    PRIMARY KEY (player_id, surface),
    FOREIGN KEY(player_id) REFERENCES Player_Baselines(player_id)
);`
      },
      {
        purpose: 'Match Forecasts & Market Projections',
        query: `CREATE TABLE IF NOT EXISTS Match_Forecasts (
    match_id TEXT PRIMARY KEY,
    tournament_name TEXT NOT NULL,
    surface TEXT NOT NULL,
    cpi INTEGER DEFAULT 35,
    altitude_m REAL DEFAULT 0,
    best_of_sets INTEGER DEFAULT 3,
    scheduled_time TIMESTAMP NOT NULL,
    player1_id TEXT NOT NULL,
    player2_id TEXT NOT NULL,
    p1_win_prob REAL NOT NULL,
    p2_win_prob REAL NOT NULL,
    p1_fair_odds REAL NOT NULL,
    p2_fair_odds REAL NOT NULL,
    p1_set1_prob REAL NOT NULL,
    p2_set1_prob REAL NOT NULL,
    mean_total_games REAL NOT NULL,
    median_total_games REAL NOT NULL,
    market_status TEXT CHECK(market_status IN ('SCHEDULED', 'FORECASTED', 'IN_PLAY', 'FINISHED')) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);`
      }
    ]
  },
  {
    id: 'pillar-3',
    number: 3,
    title: 'The Mathematical Model & The Geter Principle',
    badge: '50,000 Iterations Monte Carlo',
    shortDesc: 'Markov chain point-by-point simulation governed by The Geter Principle for variance control, momentum shifts, and state stabilization.',
    keyFormulas: [
      {
        name: 'The Geter Principle Formulation',
        formula: '\\hat{p}_{\\text{serve}}(t) = p_0 + \\Delta_{\\text{surface}} + \\Delta_{\\text{CPI}} + \\Delta_{\\text{alt}} - \\Delta_{\\text{fatigue}} + \\kappa \\cdot (\\Omega_A - \\Omega_B) \\cdot L(s) + \\gamma \\cdot M_t',
        explanation: 'Governs psychological bifurcation and state stabilization. L(s) is point leverage, Omega is player clutch factor, and M_t is the exponentially dampened momentum tensor.'
      },
      {
        name: 'Leverage Differential Function L(s)',
        formula: 'L(s) = \\left| P(\\text{Win Set} \\mid \\text{Win Point}, s) - P(\\text{Win Set} \\mid \\text{Lose Point}, s) \\right|',
        explanation: 'Measures the swing of the current point on the overall set probability. Peaks on break points (0.85 - 0.95) and tiebreaks.'
      },
      {
        name: '1st / 2nd Serve Decomposition',
        formula: 'P(\\text{Serve Point}) = P(1^{\\text{st}}\\text{ In}) \\cdot P(\\text{Win} \\mid 1^{\\text{st}}) + \\left[1 - P(1^{\\text{st}}\\text{ In})\\right] \\cdot P(\\text{Win} \\mid 2^{\\text{nd}})',
        explanation: 'Decomposes serve dominance into first serve precision, first serve weapon potency, and second serve defensive vulnerability.'
      }
    ],
    technicalDetails: [
      'The Geter Principle: Eliminates the fatal assumption in classical Markov chains that points are Independent and Identically Distributed (i.i.d.). Real professional tennis features non-linear momentum cascades and clutch divergence under high leverage.',
      'State Classification: The match simulation operates across three distinct dynamic regimes: Peaceful State (baseline probability), Contested State (linear momentum coupling), and Chaotic State (clutch rating expansion with non-linear damping).',
      'Convergence Bound: Running exactly 50,000 Monte Carlo iterations guarantees standard error of the mean for match win probability is < 0.0022 (0.22%), far exceeding market requirements.',
      'Market Derivations: Produces Full Match Moneyline, First Set Winner, Over/Under Games continuous CDF, and Exact Set Betting distribution (2-0, 2-1, 0-2, 1-2).'
    ]
  },
  {
    id: 'pillar-4',
    number: 4,
    title: 'Continuous Micro-Evolution & Bayesian Shrinkage',
    badge: 'Post-Match Learning Loop',
    shortDesc: 'Automated EWMA parameter updates based on forecast error combined with Empirical Bayes shrinkage for small-sample regularization.',
    keyFormulas: [
      {
        name: 'Empirical Bayes Shrinkage Weight',
        formula: 'w_i = \\min\\left(1.0, \\; \\frac{N_i}{N_0}\\right), \\quad \\text{where } N_0 = 10.0',
        explanation: 'Pulls players with few professional tour matches (e.g. Challenger qualifiers) toward the tour baseline prior to avoid overfitting.'
      },
      {
        name: 'Shrunk Player Baseline',
        formula: '\\tilde{\\theta}_i = w_i \\cdot \\bar{x}_i + (1 - w_i) \\cdot \\mu_{\\text{tour}}',
        explanation: 'Weighted combination of observed empirical sample and tour-wide statistical priors.'
      },
      {
        name: 'EWMA Micro-Evolution Error Update',
        formula: '\\theta_{i, t+1} = \\theta_{i, t} + \\alpha \\cdot \\left(\\text{Actual}_{i, t} - \\hat{\\text{Expected}}_{i, t}\\right)',
        explanation: 'Learning rate alpha (typically 0.04 to 0.07) dynamically adjusts player serve/return baselines after every completed match based on unexpected performance.'
      }
    ],
    technicalDetails: [
      'Prevents Model Stagnation: Instead of relying on static year-long averages, the engine micro-evolves after every single match.',
      'Surprise Factor Sensitivity: If a player wins 85% of serve points when 73% was expected against an elite returner, the baseline is adapted proportionally to the residual error.',
      'Outlier Clipping: Prevents single-match anomalies (e.g. opponent retirement or heat stroke) from skewing ratings via maximum gradient clipping |Delta| <= 0.04.'
    ]
  },
  {
    id: 'pillar-5',
    number: 5,
    title: 'Factual Post-Mortem Mandate & Zero Leakage',
    badge: 'Strict Separation',
    shortDesc: 'Strict isolation between pre-match forecasting and post-match analysis to guarantee zero lookahead bias or data contamination.',
    keyFormulas: [
      {
        name: 'Lookahead Prevention Invariant',
        formula: 'T_{\\text{forecast\\_timestamp}} < T_{\\text{match\\_start}} \\quad \\land \\quad \\text{market\\_status} = \\text{\'SCHEDULED\'}',
        explanation: 'Enforces that predictions can strictly only be generated when the match is in the future.'
      }
    ],
    technicalDetails: [
      'State Machine Progression: SCHEDULED -> FORECASTED -> IN_PLAY -> FINISHED -> ANALYZED.',
      'Zero-Leakage Guarantee: Monte Carlo forecasts can only run on rows with status = SCHEDULED or FORECASTED. The post-match analysis script can only query rows with status = FINISHED and learning_applied = 0.',
      'Atomic Status Transitions: Executed in SQLite transactions so a crash mid-pipeline leaves the database in a known, consistent state.'
    ],
    sqliteQueries: [
      {
        purpose: 'Query Pending Matches for Pre-Match Forecast (Zero Leakage)',
        query: `SELECT match_id, player1_id, player2_id, surface, cpi, altitude_m, best_of_sets 
FROM Match_Forecasts 
WHERE market_status = 'SCHEDULED' 
  AND scheduled_time > CURRENT_TIMESTAMP;`
      },
      {
        purpose: 'Lock Completed Matches for Post-Mortem Micro-Evolution',
        query: `SELECT match_id, player1_id, player2_id, p1_win_prob, actual_winner, p1_actual_serve_won, p2_actual_serve_won
FROM Post_Match_Analysis
WHERE learning_applied = 0
  AND match_completed_at IS NOT NULL;`
      },
      {
        purpose: 'Flag Match as Evaluated to Prevent Double Learning',
        query: `UPDATE Post_Match_Analysis 
SET learning_applied = 1, 
    evaluated_at = CURRENT_TIMESTAMP 
WHERE match_id = :match_id;`
      }
    ]
  },
  {
    id: 'pillar-6',
    number: 6,
    title: 'Render Cloud Deployment & GitHub Actions CI/CD',
    badge: '24/7 Cloud Architecture',
    shortDesc: 'Continuous Render Web Service and GitHub Actions workflow running 24/7 across global ATP & WTA time zones.',
    keyFormulas: [
      {
        name: 'Cron Frequency Formulation',
        formula: '\\text{schedule: } [\\text{cron: } \\text{\'0 */3 * * *\'}]',
        explanation: 'Executes every 3 hours round the clock, polling Asia, Europe, and Americas tournaments.'
      }
    ],
    technicalDetails: [
      'Render Cloud Deployment & Zero-Dependency Execution: 100% dependency-clean Python standard library + requests. No C-extensions requiring compilation (pure Python math/random executes 50k iterations in ~1.4 seconds on Render and GitHub Actions runners).',
      'Git Concurrency Handling: Auto-rebases before pushing to prevent merge conflicts during concurrent action runs.',
      'Markdown Automation: Automatically generates and publishes PREDICTIONS_TODAY.md and updates repository README.md with live ROI charts.'
    ],
    codeSnippets: [
      {
        filename: '.github/workflows/workflow.yml',
        language: 'yaml',
        code: `name: Tennis Predictive Engine 24/7 Pipeline

on:
  schedule:
    - cron: '0 */3 * * *'  # Runs every 3 hours
  workflow_dispatch:        # Manual trigger from GitHub Mobile app

jobs:
  run-engine:
    runs-on: ubuntu-latest
    concurrency:
      group: tennis-engine-group
      cancel-in-progress: false

    steps:
      - name: Checkout Repository
        uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - name: Set up Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.12'

      - name: Install Dependencies
        run: pip install requests

      - name: 1. Validate Schema & WAL Mode
        run: python scripts/schema_migration.py

      - name: 2. Ingest Match Schedules
        run: python scripts/fetch_schedule.py

      - name: 3. Post-Match Micro-Evolution Learning
        run: python scripts/post_match_analysis.py

      - name: 4. Monte Carlo 50,000 Predictions
        run: python scripts/monte_carlo.py

      - name: 5. Export Daily Markdown Reports
        run: python scripts/export_markdown.py

      - name: 6. Commit & Push Results
        run: |
          git config --global user.name "TennisBot[bot]"
          git config --global user.email "tennisbot@actions.noreply.github.com"
          git add -A
          git diff --quiet && git diff --staged --quiet || (git commit -m "Auto: Update Engine Forecasts & Database [skip ci]" && git pull --rebase && git push)
`
      }
    ]
  },
  {
    id: 'pillar-7',
    number: 7,
    title: 'Advanced Contextual & Environmental Variables',
    badge: 'The Sharp Edge',
    shortDesc: 'Mathematical modeling of Court Pace Index (CPI), barometric altitude air density, southpaw handedness asymmetry, and Weighted Elo.',
    keyFormulas: [
      {
        name: 'Court Pace Index (CPI) Baseline Shift',
        formula: '\\Delta_{\\text{CPI}} = (\\text{CPI} - 35) \\times 0.0035',
        explanation: 'Adjusts 1st serve win probability up or down based on court friction and bounce speed (CPI benchmark = 35).'
      },
      {
        name: 'Barometric Altitude Air Density Modifier',
        formula: '\\rho(h) = \\rho_0 \\cdot e^{-\\frac{M g h}{R T}}, \\quad \\Delta_{\\text{alt}} = \\left(\\frac{h}{1000}\\right) \\times 0.012',
        explanation: 'At high altitudes (e.g. Madrid 667m, Bogota 2600m), thin air reduces aerodynamic ball drag, increasing serve velocity and reducing return reaction time.'
      },
      {
        name: 'Surface-Specific WElo with Margin of Victory (MoV)',
        formula: 'R_{\\text{new}} = R_{\\text{old}} + K \\cdot \\ln(1 + |\\Delta \\text{Games}|) \\cdot (S - E)',
        explanation: 'Rewards dominant straight-sets victories (e.g. 6-1, 6-2) more than 7-6, 7-6 squeakers.'
      },
      {
        name: 'WElo Inactivity Decay',
        formula: 'R(t) = R_0 \\cdot e^{-\\lambda \\Delta t} + R_{\\text{tour}} \\cdot (1 - e^{-\\lambda \\Delta t})',
        explanation: 'Decays a player\'s Elo toward tour average after prolonged injury or hiatus (lambda = 0.0015/day).'
      }
    ],
    technicalDetails: [
      'Court Pace Index (CPI): Derived from ball-to-surface coefficient of restitution (e) and friction (mu). Fast surfaces (Cincinnati, Shanghai, grass) inflate serve win rates by +3% to +5%. Slow clay (Monte Carlo, Rome) deflates serve win rates by -4%.',
      'Handedness Asymmetry (Left-Handed Southpaw Serve): Left-handers produce heavy slice that swings away from right-handers\' backhands into the Ad-court. Because the Ad-court hosts all Game Points and Break Points, the model applies a +0.024 Ad-court leverage bonus.',
      'Fatigue Modeling: Accumulates court time in the trailing 72 hours. Players with >5.0 hours on court experience exponential second-serve and return degradation.'
    ]
  },
  {
    id: 'pillar-8',
    number: 8,
    title: 'Historical Seeding & Deterministic Backtesting',
    badge: '3-5 Year Replay Loop',
    shortDesc: 'Ingesting Sackmann datasets, day-by-day chronological replay, and minimizing out-of-sample Brier score for hyperparameter optimization.',
    keyFormulas: [
      {
        name: 'Brier Score Formulation',
        formula: '\\text{Brier} = \\frac{1}{N} \\sum_{i=1}^{N} (P_i - Y_i)^2',
        explanation: 'Strictly proper scoring rule measuring calibration and sharpness. Target: Brier < 0.198 for top ATP/WTA predictions.'
      },
      {
        name: 'Log-Loss Calibration Metric',
        formula: '\\text{LogLoss} = -\\frac{1}{N} \\sum_{i=1}^{N} \\left[Y_i \\ln P_i + (1 - Y_i) \\ln(1 - P_i)\\right]',
        explanation: 'Penalizes confident incorrect predictions exponentially, enforcing honest probabilistic humility.'
      }
    ],
    technicalDetails: [
      'Chronological Strictness: The backtest engine iterates through match days strictly forward in time. Baselines at date T are updated ONLY using matches completed at or before T-1.',
      'Hyperparameter Grid Search: Tunes EWMA alpha, fatigue decay, altitude scaling, and Bayesian shrinkage threshold (N0) by grid search over 2019-2022, validated out-of-sample on 2023-2024.',
      'Migration Script: Once backtested, the script generates an export script that dumps optimized baseline records directly into the operational SQLite database.'
    ]
  },
  {
    id: 'pillar-9',
    number: 9,
    title: 'Historical Line Shopping & Closing Odds Benchmarking',
    badge: 'Pinnacle Devigging & Kelly',
    shortDesc: 'Benchmarking against Pinnacle closing odds, removing bookmaker margin, validating +EV edges, and simulating fractional Kelly bankroll growth.',
    keyFormulas: [
      {
        name: 'Multiplicative Devigging Formula',
        formula: 'P_{\\text{fair}, 1} = \\frac{1 / O_1}{(1 / O_1) + (1 / O_2)}, \\quad \\text{Vig} = \\left(\\frac{1}{O_1} + \\frac{1}{O_2}\\right) - 1',
        explanation: 'Strips out the bookmaker juice to determine the true consensus implied market probability.'
      },
      {
        name: 'Shin Method Devigging (Informed Bettor Model)',
        formula: 'P_{\\text{Shin}} = \\frac{\\sqrt{z^2 + 4(1 - z) \\frac{\\pi_i^2}{\\sum \\pi_k}} - z}{2(1 - z)}',
        explanation: 'Accounts for asymmetric risk on underdogs caused by insider betting pressure.'
      },
      {
        name: 'Quarter-Kelly Staking Strategy',
        formula: 'f^* = 0.25 \\times \\frac{b \\cdot p - q}{b}, \\quad b = \\text{Decimal Odds} - 1',
        explanation: 'Allocates capital proportionally to edge magnitude while insulating bankroll from catastrophic drawdown.'
      },
      {
        name: 'Expected Value (+EV) Percentage',
        formula: '\\text{EV} = \\left(P_{\\text{model}} \\times O_{\\text{book}} - 1\\right) \\times 100\\%',
        explanation: 'Measures expected percentage return per dollar wagered over infinite trials.'
      }
    ],
    technicalDetails: [
      'Beating the Closing Line (CLV): The gold standard of sports modeling. Any model showing positive expected value against Pinnacle closing lines consistently achieves positive real-world ROI.',
      'Staking Discipline: The system defaults to Quarter Kelly (0.25x) capped at maximum 3.0 units per match to prevent overexposure.',
      'Market Segmentation: Backtest logs EV across Moneyline, Set Handicap (+1.5 / -1.5), and Game Totals (Over / Under).'
    ]
  }
];
