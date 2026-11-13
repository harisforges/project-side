---
description: Reorder check — quantity, air vs sea, cash needed vs available
---
Reorder check for Takusut.

1. `cd dashboard && node scripts/rules-cli.mjs --json` on the newest backup (flag staleness).
2. From `reorder` and `cash` in the output plus `dashboard/config/rules.json → inventory`:
   - current kits possible (min of SLK/COMB2/COMBF), orders/day (7d avg), days of cover, incoming POs;
   - **quantity**: rate × (lead days + 45 days cover after arrival) × 1.05 − on hand − incoming, rounded up to the supplier's next price tier if that is cheaper per unit; also list the per-component quantities (slickers include ~15% extra for 2-Cat Kits/singles);
   - **mode**: sea if 7d avg ≥ 5/day and cover > sea lead (35 days); air if cover < 14 days; the RM500 air top-up reserve only if cover < 10 days;
   - **CNY**: if today ≤ 2027-01-08, say whether this order must go now to beat the shutdown;
   - **cash needed** (use landed cost per kit from Unit economics × qty, split goods vs freight) vs **cash available** (balance − RM1,000 floor − tax reserve). Before the Day-45 gate passes, total spend must stay within RM5,000.
3. If buying: give the exact 1688 reorder message (Chinese + English, reuse decisions/04 templates with the new quantity), the forwarder steps, and what to log in the dashboard (PO with ETA, cash entry).
