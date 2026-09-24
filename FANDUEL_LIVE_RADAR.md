# 📡 FanDuel Live Radar: 24/7 Real-Time Tennis Monitor

> **Execution Environment:** GitHub Actions Continuous Runner (Round-The-Clock Automation)
> **Simulation Engine:** The Geter Principle 50,000-Iteration Monte Carlo
> **Last Updated:** `2026-09-24 12:28:20 UTC`

---

## 🔴 LIVE ON FANDUEL RIGHT NOW (In-Play Opportunities)

| Tournament | Matchup & Live Score | FanDuel Live Line | 50k Fair Odds | Model Win% | Live +EV Edge | Stake (Quarter-Kelly) |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **US Open 2026 (Championship)** | **Carlos Alcaraz** vs **Jannik Sinner**<br>🟢 `Set 3 (6-4, 4-6, 3-2) • Sinner Serving 30-15` | Carlos Alcaraz `2.25` (+125)<br>Jannik Sinner `1.68` (-147) | `2.36 / 1.74` | **Carlos Alcaraz:** 42.4%<br>**Jannik Sinner:** 57.6% | Fair | _No Bet_ |
| **Wuhan Open (WTA 1000 Live)** | **Iga Swiatek** vs **Aryna Sabalenka**<br>🟢 `Set 2 (6-3, 2-4) • Swiatek Serving 40-30` | Iga Swiatek `1.82` (-122)<br>Aryna Sabalenka `2.05` (+105) | `1.35 / 3.86` | **Iga Swiatek:** 74.1%<br>**Aryna Sabalenka:** 25.9% | **+21.11%** | `10.62u` on Iga Swiatek FanDuel ML @ 1.82 (-122) |

---

## ⏳ UPCOMING MATCHES ON FANDUEL (All Day & Night Slate)

| Tournament | Matchup & Schedule | FanDuel Open → Current | 50k Fair Odds | +EV Edge | Best Market | Recommendation |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **China Open Beijing (FanDuel Featured)** | **Daniil Medvedev** vs **Alexander Zverev**<br>🕒 Upcoming • Today 19:00 ET | Daniil Medvedev: `2.10` → `2.15`<br>Alexander Zverev: `1.78` → `1.75` | `2.33 / 1.75` | 0.00% | `NO_BET` | _Pass_ |
| **Japan Open Tokyo (FanDuel Board)** | **Ben Shelton** vs **Carlos Alcaraz**<br>🕒 Upcoming • Tonight 23:00 ET | Ben Shelton: `3.80` → `3.75`<br>Carlos Alcaraz: `1.28` → `1.30` | `4.77 / 1.26` | **+4.79%** | `Carlos Alcaraz FanDuel ML @ 1.30 (-333)` | `2.30u` |
| **Korea Open Seoul (FanDuel Board)** | **Coco Gauff** vs **Elena Rybakina**<br>🕒 Upcoming • Tomorrow 03:30 ET | Coco Gauff: `1.88` → `1.90`<br>Elena Rybakina: `1.98` → `1.96` | `2.35 / 1.74` | **+8.18%** | `Elena Rybakina FanDuel ML @ 1.96 (-104)` | `3.26u` |
| **Shanghai Masters (ATP 1000 FanDuel Board)** | **Novak Djokovic** vs **Challenger Qualifier**<br>🕒 Upcoming • Tomorrow 06:00 ET | Novak Djokovic: `1.09` → `1.08`<br>Challenger Qualifier: `8.20` → `8.50` | `1.01 / 97.09` | **+10.24%** | `Novak Djokovic FanDuel ML @ 1.08 (-1250)` | `21.52u` |

---

## ⚡ 24/7 GitHub Actions Feed Configuration

- **Primary Feed:** Direct FanDuel Sportsbook Content Managed API (`sbapi.nj.sportsbook.fanduel.com`)
- **Secondary Feed:** The Odds API (`bookmakers=fanduel`, regions=`us`)
- **Execution Workflow:** Render Web Service & `.github/workflows/fanduel_live_watchdog.yml`
- **Execution Frequency:** Every 10 minutes via cron + real-time 30-second live in-play polling loops.
- **Dedicated Cloud Architecture:** Runs entirely in high-availability cloud container environments with zero manual intervention.
