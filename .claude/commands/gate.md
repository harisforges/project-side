---
description: Gate check — pass/fail with numbers and the gate-table action
---
Run the gate check for Takusut. Argument (optional): gate id (D7, D21, D30, D45, D60). Default = the gate due today or most recently due.

1. `cd dashboard && node scripts/rules-cli.mjs --json` on the newest backup (flag staleness > 7 days). Gate dates are Day 1 + offset from Settings → Day 1.
2. For the gate: list each check (needed vs actual), state **PASS** or **FAIL** plainly (logic any/all per `dashboard/config/rules.json`).
3. Give the action:
   - FAIL → the exact `fail_action` from rules.json, turned into numbered click steps (e.g. Affiliate Center commission edits, GMV Max budget change, hero swap via `/decide hero-swap`). D45 FAIL means: no new stock, sell-through plan to Day 60, then close — say so without softening.
   - PASS → what unlocks next (e.g. D45 pass unlocks: MyIPO filing class 21, more stock beyond the RM5,000 cap from profits).
4. Tell Haris to record it: dashboard → Goals → Record PASS/FAIL. Log the gate outcome in `decisions/00-decisions-log.md` and commit.
