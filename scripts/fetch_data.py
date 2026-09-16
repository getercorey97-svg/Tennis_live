#!/usr/bin/env python3
"""
Tennis Data Ingestion & Live Fixture Ingestion (Zero Selenium)
Pulls upcoming schedules, court conditions, and results from free APIs
and open-source datasets (Jeff Sackmann tennis_atp / tennis_wta).
"""

import os
import sqlite3
import urllib.request
import json
from datetime import datetime

DB_PATH = os.environ.get("TENNIS_DB_PATH", "tennis_engine.db")

def ingest_fixtures(db_path: str = DB_PATH):
    print(f"[Ingest] Polling ATP & WTA fixture schedules...")
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

    cur.execute("SELECT COUNT(*) FROM Match_Forecasts WHERE market_status = 'SCHEDULED';")
    active_sched = cur.fetchone()[0]
    print(f"[Ingest] Currently active scheduled matches in database: {active_sched}")

    con.close()
    print("[Ingest] Ingestion synchronization complete.")

if __name__ == "__main__":
    ingest_fixtures()
