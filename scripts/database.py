#!/usr/bin/env python3
"""
Tennis Predictive Engine - Database Initialization
Configures SQLite in Write-Ahead Logging (WAL) mode with busy_timeout for zero lock contention.
Seeds ATP and WTA baselines with The Geter Principle psychological leverage metrics.
"""

import sqlite3
import os

DB_PATH = os.environ.get("TENNIS_DB_PATH", "tennis_engine.db")

SEED_PLAYERS = [
    ('atp_alcaraz', 'Carlos Alcaraz', 'ATP', 3, 'R', 0.65, 0.76, 0.55, 0.42, 0.64, 0.45, 1.14, 48),
    ('atp_sinner', 'Jannik Sinner', 'ATP', 1, 'R', 0.63, 0.79, 0.57, 0.41, 0.67, 0.46, 1.12, 52),
    ('atp_djokovic', 'Novak Djokovic', 'ATP', 4, 'R', 0.66, 0.74, 0.58, 0.43, 0.68, 0.48, 1.20, 60),
    ('atp_medvedev', 'Daniil Medvedev', 'ATP', 5, 'R', 0.62, 0.75, 0.49, 0.40, 0.63, 0.43, 1.05, 45),
    ('atp_nadal', 'Rafael Nadal', 'ATP', 150, 'L', 0.67, 0.73, 0.56, 0.42, 0.69, 0.47, 1.18, 40),
    ('atp_zverev', 'Alexander Zverev', 'ATP', 2, 'R', 0.71, 0.78, 0.52, 0.36, 0.64, 0.38, 0.98, 55),
    ('atp_shelton', 'Ben Shelton', 'ATP', 15, 'L', 0.64, 0.81, 0.53, 0.31, 0.61, 0.34, 1.04, 38),
    ('wta_swiatek', 'Iga Swiatek', 'WTA', 1, 'R', 0.66, 0.68, 0.54, 0.51, 0.65, 0.54, 1.16, 50),
    ('wta_sabalenka', 'Aryna Sabalenka', 'WTA', 2, 'R', 0.62, 0.73, 0.49, 0.45, 0.62, 0.48, 1.10, 48),
    ('wta_gauff', 'Coco Gauff', 'WTA', 3, 'R', 0.61, 0.67, 0.45, 0.48, 0.60, 0.49, 1.08, 46),
    ('wta_rybakina', 'Elena Rybakina', 'WTA', 4, 'R', 0.63, 0.75, 0.49, 0.42, 0.63, 0.44, 1.06, 44),
    ('atp_qualifier', 'Challenger Qualifier', 'ATP', 185, 'R', 0.61, 0.68, 0.48, 0.33, 0.56, 0.35, 0.92, 3),
]

SURFACE_MODS = [
    ('atp_alcaraz', 'Clay', 0.025, 0.035, 0.005, 35),
    ('atp_alcaraz', 'Grass', 0.030, 0.015, 0.010, 20),
    ('atp_alcaraz', 'Hard', 0.010, 0.020, 0.005, 45),
    ('atp_sinner', 'Hard', 0.030, 0.020, 0.015, 50),
    ('atp_sinner', 'Indoor Hard', 0.040, 0.025, 0.020, 25),
    ('atp_sinner', 'Clay', 0.005, 0.015, 0.000, 30),
    ('atp_djokovic', 'Hard', 0.020, 0.030, 0.005, 75),
    ('atp_djokovic', 'Grass', 0.035, 0.025, 0.010, 60),
    ('atp_djokovic', 'Clay', 0.010, 0.025, 0.000, 65),
    ('wta_swiatek', 'Clay', 0.045, 0.055, 0.005, 45),
    ('wta_swiatek', 'Hard', 0.015, 0.030, 0.005, 40),
    ('wta_sabalenka', 'Hard', 0.035, 0.020, 0.020, 45),
]

def init_database(db_path=DB_PATH):
    print(f"[DB] Initializing SQLite database at '{db_path}'...")
    con = sqlite3.connect(db_path, timeout=10.0)
    cur = con.cursor()

    # Crucial PRAGMA settings for zero lock contention
    cur.execute("PRAGMA journal_mode = WAL;")
    cur.execute("PRAGMA busy_timeout = 5000;")
    cur.execute("PRAGMA synchronous = NORMAL;")
    cur.execute("PRAGMA cache_size = -64000;")
    cur.execute("PRAGMA foreign_keys = ON;")

    # Execute schema
    schema_path = os.path.join(os.path.dirname(__file__), "..", "schema.sql")
    if os.path.exists(schema_path):
        with open(schema_path, "r") as f:
            cur.executescript(f.read())
    else:
        # Inline fallback
        cur.execute("""
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
            clutch_rating REAL DEFAULT 1.0,
            matches_sampled INTEGER DEFAULT 0,
            last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        """)

    # Seed baseline players
    cur.executemany("""
        INSERT OR REPLACE INTO Player_Baselines 
        (player_id, name, tour, rank, handedness, first_serve_in_pct, first_serve_win_pct, 
         second_serve_win_pct, return_win_pct, bp_save_pct, bp_convert_pct, clutch_rating, matches_sampled)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, SEED_PLAYERS)

    # Seed surface modifiers
    cur.execute("""
        CREATE TABLE IF NOT EXISTS Surface_Modifiers (
            player_id TEXT NOT NULL,
            surface TEXT NOT NULL,
            serve_win_delta REAL DEFAULT 0.0,
            return_win_delta REAL DEFAULT 0.0,
            ace_rate_delta REAL DEFAULT 0.0,
            sample_size INTEGER DEFAULT 0,
            PRIMARY KEY (player_id, surface)
        );
    """)
    cur.executemany("""
        INSERT OR REPLACE INTO Surface_Modifiers
        (player_id, surface, serve_win_delta, return_win_delta, ace_rate_delta, sample_size)
        VALUES (?, ?, ?, ?, ?, ?)
    """, SURFACE_MODS)

    con.commit()
    con.close()
    print("[DB] SQLite database initialized successfully in WAL mode.")

if __name__ == "__main__":
    init_database()
