-- ==============================================================================
-- Tennis Predictive Engine: SQLite Schema with Write-Ahead Logging (WAL) Mode
-- Designed for GitHub Actions & Mobile TrebEdit / Termux Runtimes
-- ==============================================================================

PRAGMA journal_mode = WAL;
PRAGMA busy_timeout = 5000;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = -64000;
PRAGMA foreign_keys = ON;

-- 1. Player Baselines (1st/2nd Serve Segmentation & The Geter Principle)
CREATE TABLE IF NOT EXISTS Player_Baselines (
    player_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    tour TEXT CHECK(tour IN ('ATP', 'WTA')) NOT NULL,
    rank INTEGER,
    handedness TEXT CHECK(handedness IN ('R', 'L', 'U')) DEFAULT 'R',
    first_serve_in_pct REAL NOT NULL DEFAULT 0.62,
    first_serve_win_pct REAL NOT NULL DEFAULT 0.72,
    second_serve_win_pct REAL NOT NULL DEFAULT 0.51,
    return_win_pct REAL NOT NULL DEFAULT 0.36,
    bp_save_pct REAL NOT NULL DEFAULT 0.60,
    bp_convert_pct REAL NOT NULL DEFAULT 0.40,
    clutch_rating REAL DEFAULT 1.0, -- The Geter Principle psychological leverage factor
    matches_sampled INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Surface-Specific Performance Modifiers
CREATE TABLE IF NOT EXISTS Surface_Modifiers (
    player_id TEXT NOT NULL,
    surface TEXT CHECK(surface IN ('Hard', 'Clay', 'Grass', 'Indoor Hard')) NOT NULL,
    serve_win_delta REAL DEFAULT 0.0,
    return_win_delta REAL DEFAULT 0.0,
    ace_rate_delta REAL DEFAULT 0.0,
    sample_size INTEGER DEFAULT 0,
    PRIMARY KEY (player_id, surface),
    FOREIGN KEY(player_id) REFERENCES Player_Baselines(player_id)
);

-- 3. Surface-Specific Weighted Elo (WElo) Ratings
CREATE TABLE IF NOT EXISTS Surface_Specific_WElo (
    player_id TEXT NOT NULL,
    surface TEXT NOT NULL,
    welo_rating REAL DEFAULT 1850.0,
    peak_welo REAL DEFAULT 1850.0,
    last_match_date DATE,
    matches_played INTEGER DEFAULT 0,
    PRIMARY KEY (player_id, surface),
    FOREIGN KEY(player_id) REFERENCES Player_Baselines(player_id)
);

-- 4. Player Fatigue Tracking (Rolling 72-Hour Court Load)
CREATE TABLE IF NOT EXISTS Player_Fatigue (
    player_id TEXT PRIMARY KEY,
    minutes_on_court_72h INTEGER DEFAULT 0,
    matches_played_72h INTEGER DEFAULT 0,
    last_match_ended TIMESTAMP,
    travel_km_last_7d REAL DEFAULT 0.0,
    fatigue_penalty_delta REAL DEFAULT 0.0,
    FOREIGN KEY(player_id) REFERENCES Player_Baselines(player_id)
);

-- 5. Match Forecasts (Strict Pre-Match State)
CREATE TABLE IF NOT EXISTS Match_Forecasts (
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
    best_value_market TEXT,
    edge_pct REAL DEFAULT 0.0,
    recommended_units REAL DEFAULT 0.0,
    market_status TEXT CHECK(market_status IN ('SCHEDULED', 'FORECASTED', 'IN_PLAY', 'FINISHED')) DEFAULT 'SCHEDULED',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(player1_id) REFERENCES Player_Baselines(player_id),
    FOREIGN KEY(player2_id) REFERENCES Player_Baselines(player_id)
);

-- 6. Post-Match Analysis (Zero-Leakage Post-Mortem Loop)
CREATE TABLE IF NOT EXISTS Post_Match_Analysis (
    match_id TEXT PRIMARY KEY,
    player1_id TEXT NOT NULL,
    player2_id TEXT NOT NULL,
    p1_win_prob_projected REAL NOT NULL,
    actual_winner_id TEXT,
    score_string TEXT,
    p1_actual_serve_won REAL,
    p2_actual_serve_won REAL,
    brier_score REAL,
    log_loss REAL,
    learning_applied INTEGER DEFAULT 0, -- 0 = pending evaluation, 1 = updated via EWMA
    match_completed_at TIMESTAMP,
    evaluated_at TIMESTAMP,
    FOREIGN KEY(match_id) REFERENCES Match_Forecasts(match_id)
);

-- Indices for rapid query routing
CREATE INDEX IF NOT EXISTS idx_forecast_status ON Match_Forecasts(market_status, scheduled_time);
CREATE INDEX IF NOT EXISTS idx_post_match_learning ON Post_Match_Analysis(learning_applied);
CREATE INDEX IF NOT EXISTS idx_player_tour ON Player_Baselines(tour, rank);
