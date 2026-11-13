# 08 — Ads (TikTok GMV Max + Shopee later)

Date: 13 Nov 2026 · Status: **DECIDED**. Thresholds live in `dashboard/config/rules.json`. The dashboard and `/daily` apply them automatically.

## Decision

### Start condition (don't spend before this)
GMV Max starts only when **either** is true:
- **≥ 20 orders** in total, or
- **≥ 5 creator videos** posted with our product link

Until then, the RM900 ads line stays untouched. Affiliates come first.

### GMV Max setup values
| Field | Value |
|---|---|
| Campaign type | **Product GMV Max** (not LIVE) |
| Product | The Takusut listing (all variations) |
| Optimisation | **Gross revenue / ROI target** |
| **Daily budget** | **RM30** |
| **ROI target** | **3.0** |
| Creative | **Auto + authorised creator videos.** Authorise every creator video with ≥ 1 order via Affiliate → content authorisation |
| Schedule | Always on (no end date). Review daily |
| Campaign name | `TKS-GMVMAX-KIT-v1` |

### Daily rule set (applied by `/daily` from the Ads log)
Uses yesterday's numbers. "ROI" is GMV Max ROI as reported by TikTok.

| Rule | Condition | Action |
|---|---|---|
| R1 Scale | ROI ≥ 3.0 for the last 3 days **and** ≥ 3 days since the last change | Budget **+20%** (RM30 → 36 → 43 → 52 …) |
| R2 Under-spend | Spend < 70% of budget for 2 days | Lower the ROI target by **0.2**, but **never below 2.6** (floor, item 3) |
| R3 Cut | ROI < floor (**2.6**) for 2 days in a row | Budget **−30%** |
| R4 Pause | ROI < 2.0 for 3 days, or 7-day ROI < floor | **Pause** the campaign; check creative and price; restart at RM30 after 5 new creator videos |
| R5 Cap | Ads spend in the month > budget line (Phase 1: RM900 total) | Hold budget flat; don't scale until Day 30 gate |
| R6 Gate link | Day 30 gate fails | Budget to **RM15/day** (gate table) |
| R7 Hold | Fewer than 3 days since the last change | No change (let the algorithm learn) |

*Floor 2.6 because worst-case break-even ROAS is 2.37 at 16.74% commission (item 3). If the Seller Center shows 11.88%, set the floor back to 2.4 in rules.json.*

### Weekly rules (`/weekly`)
- Blended ROAS (total GMV ÷ total ad spend) **< 4** while ads > 15% of GMV → ads are buying orders affiliates would have brought anyway. Cut the budget 20%.
- Top 3 creator videos by GMV → request **Spark/authorisation codes** and check they're in GMV Max creative.
- A video with CTR < 1% after 2,000 impressions (where shown) → exclude it.

### Shopee ads (later)
**Start:** only after **10 reviews** on the Shopee listing.
| Field | Value |
|---|---|
| Type | **Search Ads → Product Search Ads**, manual keywords |
| Daily budget | **RM10**, rising to RM20 when ROAS ≥ 4 for 7 days |
| Keywords (exact or broad) | `sikat kucing bulu panjang`, `cat brush long hair`, `self cleaning brush cat`, `sikat kucing`, `slicker brush cat`, `sikat persian`, `cat grooming kit` |
| Bid | Shopee suggested bid × 0.8 to start |
| Target ROAS | 4.0 (Shopee ROAS excludes affiliate commission, so the bar is higher) |
| Negative / avoid | `dog`, `anjing`, `glove`, `sarung tangan`, `electric`, `vacuum` |
| Rule | Pause any keyword with RM15 spend and 0 orders |

### Budget line
RM900 for the first 30 days after the start condition. At RM30/day with no scaling, that's 30 days. Scaling uses Phase 2 profit, not new capital (CLAUDE.md capital cap).

## Why
- **Affiliates first:** creator videos are the creative GMV Max needs. Without them it shows weak auto-generated ads and burns budget.
- **ROI 3.0 target with a 2.6 floor:** the target gives a margin buffer; the floor sits above worst-case break-even (2.37) so we never knowingly run at a loss.
- **+20% every 3 days:** a small step keeps the algorithm in learning without resetting it. This rule is from the plan.

## Sources checked (13 Nov 2026)
- Break-even maths: `decisions/03-bundle-pricing.md` (TikTok commission 16.74% assumption)
- Plan rules: CLAUDE.md §3 Traffic rules
- **Unverified:** current GMV Max UI field names in TikTok Seller Center MY (not accessible from this session).

## Confidence
- Rules: **medium-high**. Field labels: **medium**. ROI achievable: **low** until there are creator videos.

## What would change this decision
- Commission confirmed ≤ 12% → floor 2.4.
- GMV Max ROI stays below 2.6 for 7 days despite 5+ videos → stop ads entirely and put the money into samples (+20 creator kits).

## Haris: exact steps to execute
1. **Don't start yet.** The dashboard Today page shows "GMV Max start condition met" when it's time.
2. When it does: Seller Center → **Marketing** (or **Ads**) → **GMV Max** → **Create campaign** → **Product GMV Max** → select the Takusut listing → budget **30** → ROI target **3.0** → name `TKS-GMVMAX-KIT-v1` → **Publish**.
3. Every day, before 10 am: open TikTok Ads/GMV Max → copy **yesterday's spend, GMV and ROI** into the dashboard → **Ads log** → the dashboard shows the rule's call (e.g. "Raise budget to RM36/day"). Do exactly that.
4. **Shopee (after 10 reviews):** Seller Centre → **Marketing Centre → Shopee Ads → Create New Ads → Search Ads → Product** → choose the listing → **Manual keyword** → add the keywords above → daily budget **10** → ROAS target **4.0** (if shown) → **Publish**.
