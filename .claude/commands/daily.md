---
description: Today's ops card — max 7 actions with exact clicks/copy-paste
---
Produce today's ops card for the Takusut business (see CLAUDE.md).

1. Run the rule engine on the newest dashboard backup:
   `cd dashboard && node scripts/rules-cli.mjs` (add `--json` if you need detail). If Haris pasted numbers in chat instead, use those and say so.
2. If the backup line says it is older than 7 days or none was found, say that first in one line and ask Haris to download a fresh backup (Data & settings → Download backup → upload it to `data/seed/`).
3. Output **max 7 actions in priority order**. Each action must have:
   - what to do and why in one line (cite the rule or gate),
   - the exact click path in Seller Center / Shopee / dashboard, or the exact copy-paste text (pull texts from `decisions/07`, `08`, `09`),
   - the value to type (budget, commission %, quantity).
   Always include: log yesterday's KPIs if missing; creator follow-ups due; the ads call; stock/reorder alert; overdue timeline tasks.
4. End with one honest line on trajectory vs the current gate (numbers, no motivation).
Keep it short enough to read at the packing table on a phone.
