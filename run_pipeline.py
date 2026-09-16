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

def main():
    parser = argparse.ArgumentParser(description="Tennis Predictive Engine Master Runner")
    parser.add_argument("--mode", choices=["all", "predict", "backtest", "learn", "fanduel", "watch"], default="all",
                        help="Execution mode: all | predict | backtest | learn | fanduel | watch")
    parser.add_argument("--iterations", type=int, default=50000,
                        help="Monte Carlo iterations per match (default: 50,000)")
    parser.add_argument("--backtest-matches", type=int, default=100,
                        help="Number of historical matches for backtesting (default: 100)")
    parser.add_argument("--min-edge", type=float, default=0.025,
                        help="Minimum edge (+EV) threshold (default: 0.025 / 2.5%%)")
    parser.add_argument("--poll-interval", type=int, default=30,
                        help="FanDuel live polling interval in seconds (default: 30)")
    parser.add_argument("--watch-duration", type=int, default=300,
                        help="Duration in seconds for live watch mode (default: 300)")
    
    args = parser.parse_args()

    print(f"============================================================")
    print(f"🚀 TENNIS PREDICTIVE ENGINE PIPELINE (Mode: {args.mode.upper()})")
    print(f"   Monte Carlo Iterations: {args.iterations:,}")
    print(f"============================================================")

    # Step 1: Initialize Database
    init_database()

    # Step 2: Ingest FanDuel Feeds & Schedules
    if args.mode in ["all", "fanduel"]:
        ingest_fixtures()

    # Step 3: 24/7 Live Watchdog Mode (for GitHub Actions)
    if args.mode == "watch":
        run_fanduel_watchdog(poll_interval=args.poll_interval, max_duration=args.watch_duration)
        return

    # Step 4: Post-Match Micro-Evolution
    if args.mode in ["all", "learn"]:
        run_post_match_learning()

    # Step 5: 50,000-Iteration Predictions
    if args.mode in ["all", "predict"]:
        run_predictions(iterations=args.iterations)

    # Step 6: 50,000-Iteration Backtest
    if args.mode in ["all", "backtest"]:
        run_backtest(iterations=args.iterations, sample_size=args.backtest_matches, min_edge=args.min_edge)

    print("\n✅ All workflow steps completed successfully!")

if __name__ == "__main__":
    main()
