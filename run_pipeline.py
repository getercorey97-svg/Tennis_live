#!/usr/bin/env python3
"""
Tennis Predictive Engine - Master Orchestration Runner
Executes the full pipeline: DB Init -> Fixture Ingest -> Micro-Evolution -> 50k Predictions -> 50k Backtest.
Can be triggered manually or orchestrated via GitHub Actions workflows.
"""

import sys
import os
import argparse
from scripts.database import init_database
from scripts.fetch_data import ingest_fixtures
from scripts.post_mortem_learn import run_post_match_learning
from scripts.predict import run_predictions
from scripts.backtest import run_backtest

def main():
    parser = argparse.ArgumentParser(description="Tennis Predictive Engine Master Runner")
    parser.add_argument("--mode", choices=["all", "predict", "backtest", "learn"], default="all",
                        help="Execution mode: all | predict | backtest | learn")
    parser.add_argument("--iterations", type=int, default=50000,
                        help="Monte Carlo iterations per match (default: 50,000)")
    parser.add_argument("--backtest-matches", type=int, default=100,
                        help="Number of historical matches for backtesting (default: 100)")
    parser.add_argument("--min-edge", type=float, default=0.025,
                        help="Minimum edge (+EV) threshold (default: 0.025 / 2.5%%)")
    
    args = parser.parse_args()

    print(f"============================================================")
    print(f"🚀 TENNIS PREDICTIVE ENGINE PIPELINE (Mode: {args.mode.upper()})")
    print(f"   Monte Carlo Iterations: {args.iterations:,}")
    print(f"============================================================")

    # Step 1: Initialize Database
    init_database()

    # Step 2: Fetch Schedules
    ingest_fixtures()

    # Step 3: Post-Match Micro-Evolution
    if args.mode in ["all", "learn"]:
        run_post_match_learning()

    # Step 4: 50,000-Iteration Predictions
    if args.mode in ["all", "predict"]:
        run_predictions(iterations=args.iterations)

    # Step 5: 50,000-Iteration Backtest
    if args.mode in ["all", "backtest"]:
        run_backtest(iterations=args.iterations, sample_size=args.backtest_matches, min_edge=args.min_edge)

    print("\n✅ All workflow steps completed successfully!")

if __name__ == "__main__":
    main()
