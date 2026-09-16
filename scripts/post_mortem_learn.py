#!/usr/bin/env python3
"""
Post-Match Micro-Evolution & Bayesian Shrinkage Engine
Updates player baselines based on forecast error with zero data leakage.
Executed automatically after every tournament round in GitHub Actions.
"""

import os
import sqlite3
import math

DB_PATH = os.environ.get("TENNIS_DB_PATH", "tennis_engine.db")
ALPHA_LEARNING_RATE = 0.05
SHRINKAGE_N0 = 10.0

TOUR_DEFAULTS = {
    'ATP': {'first_win': 0.725, 'second_win': 0.515, 'return_win': 0.355},
    'WTA': {'first_win': 0.645, 'second_win': 0.460, 'return_win': 0.440}
}

def apply_bayesian_shrinkage(raw_stat: float, tour_prior: float, sample_size: int, n0: float = SHRINKAGE_N0) -> float:
    """Empirical Bayes shrinkage: w = min(1.0, N / N0)"""
    w = min(1.0, float(sample_size) / n0)
    return (w * raw_stat) + ((1.0 - w) * tour_prior)

def run_post_match_learning(db_path: str = DB_PATH):
    print(f"[Micro-Evolution] Starting post-match analysis on '{db_path}'...")
    con = sqlite3.connect(db_path, timeout=10.0)
    cur = con.cursor()
    cur.execute("PRAGMA journal_mode = WAL;")

    # Strict Zero-Leakage Query: Only un-evaluated completed matches
    cur.execute("""
        SELECT match_id, player1_id, player2_id, p1_win_prob_projected, 
               actual_winner_id, p1_actual_serve_won, p2_actual_serve_won
        FROM Post_Match_Analysis
        WHERE learning_applied = 0
          AND actual_winner_id IS NOT NULL;
    """)
    unprocessed = cur.fetchall()
    print(f"[Micro-Evolution] Found {len(unprocessed)} matches ready for baseline learning.")

    for row in unprocessed:
        match_id, p1_id, p2_id, p1_proj, winner_id, p1_srv_won, p2_srv_won = row

        # Calculate Brier score for this single trial: (p - y)^2
        y_true = 1.0 if winner_id == p1_id else 0.0
        brier = (p1_proj - y_true) ** 2

        # 1. Update Player 1 Baseline via EWMA error
        if p1_srv_won is not None:
            cur.execute("SELECT tour, first_serve_win_pct, matches_sampled FROM Player_Baselines WHERE player_id = ?", (p1_id,))
            p1_data = cur.fetchone()
            if p1_data:
                tour, curr_s1, n = p1_data
                error = p1_srv_won - curr_s1
                # Gradient clipping to prevent outlier distortion
                clipped_error = max(-0.04, min(0.04, error))
                updated_s1 = curr_s1 + (ALPHA_LEARNING_RATE * clipped_error)
                new_n = n + 1
                
                # Apply Empirical Bayes shrinkage
                shrunk_s1 = apply_bayesian_shrinkage(updated_s1, TOUR_DEFAULTS.get(tour, TOUR_DEFAULTS['ATP'])['first_win'], new_n)

                cur.execute("""
                    UPDATE Player_Baselines 
                    SET first_serve_win_pct = ?, matches_sampled = ?, last_updated = CURRENT_TIMESTAMP
                    WHERE player_id = ?;
                """, (round(shrunk_s1, 4), new_n, p1_id))

        # Flag match as evaluated to guarantee single-touch execution
        cur.execute("""
            UPDATE Post_Match_Analysis 
            SET learning_applied = 1, brier_score = ?, evaluated_at = CURRENT_TIMESTAMP
            WHERE match_id = ?;
        """, (round(brier, 4), match_id))

    con.commit()
    con.close()
    print("[Micro-Evolution] Learning cycle completed successfully.")

if __name__ == "__main__":
    run_post_match_learning()
