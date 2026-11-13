---
description: Monday review — numbers vs targets, what worked, odds update, decisions for the week
---
Weekly review for Takusut (run on Mondays). Read CLAUDE.md first.

1. Run `cd dashboard && node scripts/rules-cli.mjs --json` on the newest backup in `data/seed/`. Flag if older than 7 days.
2. Report, in this order:
   - **Numbers vs targets:** orders/day (7d avg) vs `kpi_targets` in `dashboard/config/rules.json`; GMV; ad spend; blended ROAS vs 3.0/floor; est. profit/order and run-rate vs RM10k/20k/30k; cash spent vs RM5,000 cap.
   - **Gates:** the next gate, its date, each check with actual vs needed.
   - **What worked / what didn't:** creators (who drove orders, sample → post rate), ads calls taken, listing/price changes. Use data only.
   - **Creator tiers:** list who moves to T2 (≥10 orders in 14 days → 22%) or T3 (top 10% and ≥30 in 30 days → 25%), with the exact Affiliate Center steps.
   - **Honest odds update:** base case and the probability of RM10k+/month by Day 90, compared with last week's; say what changed it.
   - **Decisions for this week:** max 3, each logged with `/decide` format if it changes a prior decision.
3. Update `decisions/00-decisions-log.md` "Outcome / did it work" for any decision whose result is now known, and commit.
