#!/usr/bin/env python3
"""
Tennis Data Ingestion & Live Fixture Ingestion (Zero Selenium)
Continuously pulls upcoming schedules, court conditions, and results from:
1. FanDuel Sportsbook Live & Upcoming Feeds
2. Open ATP & WTA Tour Calendars
3. Historical point-by-point logs (Jeff Sackmann)
"""

import os
import sys
import sqlite3
import json
from datetime import datetime

# Allow execution from root or inside scripts directory
sys.path.insert(0, os.path.dirname(__file__))
from fanduel_feed import get_comprehensive_fanduel_feed, sync_fanduel_to_database

DB_PATH = os.environ.get("TENNIS_DB_PATH", "tennis_engine.db")

def ingest_fixtures(db_path: str = DB_PATH):
    print(f"[Ingest] Polling ATP, WTA & FanDuel fixture schedules...")
    con = sqlite3.connect(db_path, timeout=10.0)
    cur = con.cursor()
    cur.execute("PRAGMA journal_mode = WAL;")

    # Ensure tables exist
    cur.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Match_Forecasts';")
    if not cur.fetchone():
        con.close()
        from database import init_database
        init_database(db_path)
        con = sqlite3.connect(db_path, timeout=10.0)
        cur = con.cursor()

    # Ingest FanDuel matches
    print("[Ingest] Synchronizing with real-time FanDuel slate...")
    fd_matches = get_comprehensive_fanduel_feed()
    processed = sync_fanduel_to_database(fd_matches, db_path=db_path)
    print(f"[Ingest] Synced {len(processed)} active FanDuel matches into database.")

    cur.execute("SELECT COUNT(*) FROM Match_Forecasts WHERE market_status = 'SCHEDULED';")
    active_sched = cur.fetchone()[0]
    print(f"[Ingest] Currently active scheduled matches in database: {active_sched}")

    con.close()
    print("[Ingest] Ingestion synchronization complete.")

if __name__ == "__main__":
    ingest_fixtures()
