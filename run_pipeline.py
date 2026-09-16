#!/usr/bin/env python3
"""
Tennis Predictive Engine - Master Orchestration Runner
Executes the full pipeline:
1. DB Init (WAL mode)
2. Ingest FanDuel Live & Upcoming Feeds
3. Post-Match Micro-Evolution & Shrinkage
4. 50,000-Iteration Predictions
5. 50,000-Iteration Backtest
6. 24/7 GitHub Actions Live Watchdog
"""

import sys
import os
import argparse
from scripts.database import init_database
from scripts.fetch_data import ingest_fixtures
from scripts.post_mortem_learn import run_post_match_learning
from scripts.predict import run_predictions
from scripts.backtest import run_backtest
from scripts.fanduel_feed import run_fanduel_watchdog
from scripts.live_engine import run_cli_demo, background_worker

def main():
    parser = argparse.ArgumentParser(description="Tennis Predictive Engine Master Runner")
    parser.add_argument("--mode", choices=["all", "both", "dual", "predict", "backtest", "learn", "fanduel", "watch", "two-track", "live-engine"], default="both",
                        help="Execution mode: both | dual | all | predict | backtest | learn | fanduel | watch | two-track | live-engine")
    parser.add_argument("--iterations", type=int, default=50000,
                        help="Monte Carlo iterations per match (default: 50,000)")
    parser.add_argument("--backtest-matches", type=int, default=100,
                        help="Number of historical matches for backtesting (default: 100)")
    parser.add_argument("--min-edge", type=float, default=0.025,
                        help="Minimum edge (+EV) threshold (default: 0.025 / 2.5%%)")
    parser.add_argument("--poll-interval", type=int, default=30,
                        help="FanDuel live polling interval in seconds (default: 30)")
    parser.add_argument("--watch-duration", type=int, default=180,
                        help="Duration in seconds for live watch mode (default: 180s, 0 for single pass)")
    
    args = parser.parse_args()

    print(f"============================================================")
    print(f"🚀 TENNIS PREDICTIVE ENGINE PIPELINE (Mode: {args.mode.upper()})")
    print(f"   Monte Carlo Iterations: {args.iterations:,}")
    print(f"============================================================")

    # Step 1: Initialize Database
    init_database()

    # Step 2: Ingest FanDuel Feeds & Schedules
    if args.mode in ["all", "both", "dual", "fanduel"]:
        ingest_fixtures()

    # Step 3: Two-Track Live Engine (Track 1: Targeted Search, Track 2: Autonomous Engine)
    if args.mode in ["all", "both", "dual", "two-track", "live-engine"]:
        print("\n--- [WORKFLOW 1/2] Two-Track Live Tennis Engine (Search + ESPN Free Feed) ---")
        run_cli_demo()
        if args.mode in ["two-track", "live-engine"]:
            return

    # Step 4: FanDuel Real-Time Watchdog & In-Play Radar
    if args.mode in ["all", "both", "dual", "watch"]:
        print("\n--- [WORKFLOW 2/2] FanDuel Live In-Play Radar & Line Watchdog ---")
        duration = args.watch_duration if args.mode == "watch" else 0
        run_fanduel_watchdog(poll_interval=args.poll_interval, max_duration=duration)
        if args.mode == "watch":
            return

    # Step 5: Post-Match Micro-Evolution
    if args.mode in ["all", "both", "dual", "learn"]:
        run_post_match_learning()

    # Step 6: 50,000-Iteration Predictions
    if args.mode in ["all", "both", "dual", "predict"]:
        run_predictions(iterations=args.iterations)

    # Step 7: 50,000-Iteration Backtest
    if args.mode in ["all", "backtest"]:
        run_backtest(iterations=args.iterations, sample_size=args.backtest_matches, min_edge=args.min_edge)

    print("\n✅ Both workflows and pipeline steps completed successfully!")

if __name__ == "__main__":
    main()
