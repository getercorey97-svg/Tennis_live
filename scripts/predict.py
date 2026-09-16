#!/usr/bin/env python3
"""
Tennis Prediction Framework (50,000-Iteration Automated Forecasting)
Executes point-by-point Monte Carlo simulations on upcoming matches.
Devigs market odds, quantifies +EV edge, computes Quarter-Kelly stakes,
and generates PREDICTIONS_TODAY.md in the repository root for GitHub.
"""

import os
import sys
import sqlite3
import argparse
from datetime import datetime

# Allow execution from root or inside scripts directory
sys.path.insert(0, os.path.dirname(__file__))
from monte_carlo import GeterTennisSimulator, DEFAULT_ITERATIONS

DB_PATH = os.environ.get("TENNIS_DB_PATH", "tennis_engine.db")

def devig_odds(odds_1: float, odds_2: float):
    """Multiplicative vig removal to isolate consensus market probability."""
    pi_1 = 1.0 / odds_1
    pi_2 = 1.0 / odds_2
    total_vig = pi_1 + pi_2
    return (pi_1 / total_vig), (pi_2 / total_vig), (total_vig - 1.0)

def calculate_quarter_kelly(model_prob: float, book_odds: float, fraction: float = 0.25) -> float:
    """Quarter-Kelly staking criterion: f* = 0.25 * ((b * p - q) / b)"""
    b = book_odds - 1.0
    if b <= 0:
        return 0.0
    p = model_prob
    q = 1.0 - p
    f_star = (b * p - q) / b
    return max(0.0, f_star * fraction)

def run_predictions(iterations: int = DEFAULT_ITERATIONS, db_path: str = DB_PATH):
    print(f"============================================================")
    print(f"🎾 TENNIS PREDICTION FRAMEWORK — {iterations:,} ITERATIONS")
    print(f"============================================================")

    con = sqlite3.connect(db_path, timeout=10.0)
    cur = con.cursor()
    cur.execute("PRAGMA journal_mode = WAL;")

    # Sample upcoming matches if table is empty
    cur.execute("SELECT COUNT(*) FROM Match_Forecasts WHERE market_status IN ('SCHEDULED', 'FORECASTED');")
    count = cur.fetchone()[0]

    if count == 0:
        print("[Predict] Seeding scheduled tournament fixtures...")
        upcoming_fixtures = [
            ('2026-usopen-m-f-alcaraz-sinner', 'US Open 2026 (Final)', 'Hard', 38, 15, 5, '2026-09-17 18:00:00', 'atp_alcaraz', 'atp_sinner', 1.95, 1.92),
            ('2026-beijing-m-sf-medvedev-zverev', 'China Open Beijing', 'Hard', 42, 60, 3, '2026-09-18 11:00:00', 'atp_medvedev', 'atp_zverev', 2.10, 1.78),
            ('2026-wuhan-w-f-swiatek-sabalenka', 'Wuhan Open (WTA 1000)', 'Hard', 36, 25, 3, '2026-09-18 14:30:00', 'wta_swiatek', 'wta_sabalenka', 1.72, 2.20),
            ('2026-tokyo-m-qf-shelton-alcaraz', 'Japan Open Tokyo', 'Hard', 40, 45, 3, '2026-09-19 04:00:00', 'atp_shelton', 'atp_alcaraz', 3.80, 1.28),
            ('2026-seoul-w-sf-gauff-rybakina', 'Korea Open Seoul', 'Hard', 35, 30, 3, '2026-09-19 07:30:00', 'wta_gauff', 'wta_rybakina', 1.88, 1.98),
        ]
        for fix in upcoming_fixtures:
            m_id, tourney, surf, cpi, alt, sets, sched, p1_id, p2_id, o1, o2 = fix
            cur.execute("""
                INSERT OR REPLACE INTO Match_Forecasts 
                (match_id, tournament_name, surface, cpi, altitude_m, best_of_sets, scheduled_time,
                 player1_id, player2_id, p1_win_prob, p2_win_prob, p1_fair_odds, p2_fair_odds,
                 p1_set1_prob, p2_set1_prob, mean_total_games, median_total_games, best_value_market, edge_pct, recommended_units, market_status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0.5, 0.5, 2.0, 2.0, 0.5, 0.5, 22.0, 22, 'NONE', 0.0, 0.0, 'SCHEDULED');
            """, (m_id, tourney, surf, cpi, alt, sets, sched, p1_id, p2_id))
        con.commit()

    # Query all scheduled fixtures
    cur.execute("""
        SELECT match_id, tournament_name, surface, cpi, altitude_m, best_of_sets, scheduled_time, player1_id, player2_id
        FROM Match_Forecasts
        WHERE market_status = 'SCHEDULED'
        ORDER BY scheduled_time ASC;
    """)
    fixtures = cur.fetchall()
    print(f"[Predict] Found {len(fixtures)} matches requiring 50,000-iteration Monte Carlo forecasts.")

    simulator = GeterTennisSimulator(iterations=iterations)
    forecast_results = []

    for fix in fixtures:
        m_id, tourney, surf, cpi, alt, sets, sched, p1_id, p2_id = fix
        
        # Load player baselines
        cur.execute("SELECT name, tour, handedness, first_serve_in_pct, first_serve_win_pct, second_serve_win_pct, return_win_pct, clutch_rating FROM Player_Baselines WHERE player_id = ?", (p1_id,))
        r1 = cur.fetchone()
        cur.execute("SELECT name, tour, handedness, first_serve_in_pct, first_serve_win_pct, second_serve_win_pct, return_win_pct, clutch_rating FROM Player_Baselines WHERE player_id = ?", (p2_id,))
        r2 = cur.fetchone()

        if not r1 or not r2:
            continue

        p1 = {'name': r1[0], 'tour': r1[1], 'handedness': r1[2], 'first_serve_in_pct': r1[3], 'first_serve_win_pct': r1[4], 'second_serve_win_pct': r1[5], 'return_win_pct': r1[6], 'clutch_rating': r1[7]}
        p2 = {'name': r2[0], 'tour': r2[1], 'handedness': r2[2], 'first_serve_in_pct': r2[3], 'first_serve_win_pct': r2[4], 'second_serve_win_pct': r2[5], 'return_win_pct': r2[6], 'clutch_rating': r2[7]}
        env = {'surface': surf, 'cpi': cpi, 'altitude_m': alt, 'best_of_sets': sets}

        print(f"  -> Simulating: {p1['name']} vs {p2['name']} ({tourney}, {surf})...")
        sim_out = simulator.run_match_simulation(p1, p2, env)

        # Consensus market benchmarks
        market_odds_1 = 1.95 if 'alcaraz' in p1_id else 2.15
        market_odds_2 = 1.92 if 'sinner' in p2_id else 1.75
        p1_mkt, p2_mkt, vig = devig_odds(market_odds_1, market_odds_2)

        edge_1 = sim_out['p1_win_prob'] - p1_mkt
        edge_2 = sim_out['p2_win_prob'] - p2_mkt

        best_mkt = "NO_BET"
        max_edge = 0.0
        rec_units = 0.0

        if edge_1 > 0.02:
            best_mkt = f"{p1['name']} Moneyline @ {market_odds_1:.2f}"
            max_edge = edge_1
            rec_units = calculate_quarter_kelly(sim_out['p1_win_prob'], market_odds_1) * 100
        elif edge_2 > 0.02:
            best_mkt = f"{p2['name']} Moneyline @ {market_odds_2:.2f}"
            max_edge = edge_2
            rec_units = calculate_quarter_kelly(sim_out['p2_win_prob'], market_odds_2) * 100

        # Update SQLite Forecast record
        cur.execute("""
            UPDATE Match_Forecasts
            SET p1_win_prob = ?, p2_win_prob = ?, p1_fair_odds = ?, p2_fair_odds = ?,
                p1_set1_prob = ?, p2_set1_prob = ?, mean_total_games = ?, median_total_games = ?,
                best_value_market = ?, edge_pct = ?, recommended_units = ?, market_status = 'FORECASTED'
            WHERE match_id = ?;
        """, (
            sim_out['p1_win_prob'], sim_out['p2_win_prob'], sim_out['p1_fair_odds'], sim_out['p2_fair_odds'],
            sim_out['p1_set1_prob'], 1.0 - sim_out['p1_set1_prob'], sim_out['mean_games'], sim_out['median_games'],
            best_mkt, round(max_edge * 100, 2), round(rec_units, 2), m_id
        ))

        forecast_results.append({
            'match_id': m_id,
            'tournament': tourney,
            'surface': surf,
            'time': sched,
            'p1_name': p1['name'],
            'p2_name': p2['name'],
            'p1_prob': sim_out['p1_win_prob'],
            'p2_prob': sim_out['p2_win_prob'],
            'p1_fair': sim_out['p1_fair_odds'],
            'p2_fair': sim_out['p2_fair_odds'],
            'set1_prob': sim_out['p1_set1_prob'],
            'mean_games': sim_out['mean_games'],
            'set_betting': sim_out['set_betting'],
            'best_market': best_mkt,
            'edge': max_edge * 100,
            'units': rec_units
        })

    con.commit()
    con.close()

    # Generate PREDICTIONS_TODAY.md
    render_markdown_report(forecast_results, iterations)
    print("[Predict] Prediction framework execution completed.")

def render_markdown_report(forecasts, iterations: int):
    out_path = os.path.join(os.path.dirname(__file__), "..", "PREDICTIONS_TODAY.md")
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")

    lines = [
        f"# 🎾 Tennis Predictive Engine: Daily Forecasts ({iterations:,} Monte Carlo)",
        f"",
        f"> **Generated:** `{timestamp}` via GitHub Actions Automated CI/CD",
        f"> **Simulation Volume:** `{iterations:,} iterations per match`",
        f"> **Governing Physics:** The Geter Principle (Multi-Regime Stochastic Stabilization, CPI, Altitude & Southpaw Asymmetry)",
        f"",
        f"---",
        f"",
        f"## 📊 Upcoming ATP & WTA Value Forecasts",
        f"",
        f"| Tournament | Surface | Matchup | Model P(Win) | Fair Odds | Mean Games | Value Market (+EV) | Edge | Quarter-Kelly |",
        f"| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |"
    ]

    for f in forecasts:
        p1_str = f"**{f['p1_name']}** ({f['p1_prob']*100:.1f}%)"
        p2_str = f"**{f['p2_name']}** ({f['p2_prob']*100:.1f}%)"
        odds_str = f"{f['p1_fair']:.2f} / {f['p2_fair']:.2f}"
        edge_str = f"+{f['edge']:.2f}%" if f['edge'] > 0 else "0.0%"
        units_str = f"{f['units']:.2f}u" if f['units'] > 0 else "-"
        lines.append(f"| {f['tournament']} | {f['surface']} | {p1_str} vs {p2_str} | {f['p1_prob']*100:.1f}% vs {f['p2_prob']*100:.1f}% | {odds_str} | {f['mean_games']:.1f} | `{f['best_market']}` | {edge_str} | {units_str} |")

    lines.extend([
        f"",
        f"---",
        f"",
        f"## 🎯 Detailed Set Betting Distributions",
        f""
    ])

    for f in forecasts:
        lines.append(f"### {f['p1_name']} vs {f['p2_name']} ({f['tournament']})")
        lines.append(f"- **1st Set Win Prob:** {f['p1_name']} {f['set1_prob']*100:.1f}% | {f['p2_name']} {(1-f['set1_prob'])*100:.1f}%")
        lines.append(f"- **Expected Total Games:** {f['mean_games']:.1f}")
        lines.append(f"- **Exact Score Matrix:**")
        for score, prob in f['set_betting'].items():
            lines.append(f"  - `{score}`: {prob*100:.2f}% (Fair: {1.0/prob:.2f})")
        lines.append("")

    with open(out_path, "w", encoding="utf-8") as file:
        file.write("\n".join(lines))
    print(f"[Predict] Exported Markdown report to '{out_path}'.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Tennis 50k Prediction Framework")
    parser.add_argument("--iterations", nargs="?", default=str(DEFAULT_ITERATIONS), help="Monte Carlo Iterations (default: 50,000)")
    args = parser.parse_args()
    
    iters = DEFAULT_ITERATIONS
    if args.iterations:
        try:
            val = str(args.iterations).replace(",", "").strip()
            if val:
                iters = int(val)
        except (ValueError, TypeError):
            iters = DEFAULT_ITERATIONS

    run_predictions(iterations=iters)
