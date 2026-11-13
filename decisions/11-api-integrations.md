# 11 — TikTok Shop / Shopee API integration: verdict

Date: 13 Nov 2026 · Status: **DECIDED: don't build now.** Revisit after the Day-45 gate passes.

## Decision
- **No API integration in Phase 1–2.** Data comes in through the 2-minute daily form plus CSV order exports (already built).
- **Revisit TikTok Shop's in-house seller API** only when **both** are true: the Day-45 gate passes, **and** orders are above 20/day, so CSV exports take more than 10 minutes a day.
- **Shopee Open Platform:** don't apply. Its approval process is built for ERP vendors and companies with development teams.

## Why (data + reasoning)

### TikTok Shop Partner Center
Third-party guides describe an **in-house / seller developer** route. You verify with the shop's admin email and get approval quickly ("instantly" per one vendor; 2–3 business days for other developer types). An in-house app can only access your own shop, which is all we need.

It would still need:
- a hosted OAuth callback
- token refresh
- request signing
- order/finance endpoint mapping

That's about 1–2 days of build plus upkeep when TikTok changes versions. At under 20 orders/day, a CSV export is faster and has zero maintenance.

### Shopee Open Platform
Shopee's own request form sends sellers **without their own ERP + development team** to a third-party vendor. Direct apps need:
- a live HTTPS app profile
- a trial account for review
- an approval wait that guides describe as "a while"

Some regions also require a minimum order volume or seller tier. For a new 0-review shop, approval is unlikely and slow.

**Cost/benefit:** the CSV import already fills the KPI page and the packing list. An API saves about 5 minutes a day at our volume. It isn't worth Phase 1 build time or risk.

## Sources checked (13 Nov 2026)
- TikTok Shop app setup (in-house vs ISV, approval): https://developers.apideck.com/connectors/tiktok/docs/application_owner+oauth_credentials · https://unified.to/blog/how_to_setup_a_tiktok_shop_application.md · https://www.keyapi.ai/blog/tiktok-shop-api-integration-guide-sellers
- Shopee API request routing (own ERP vs vendor): https://docs.google.com/forms/d/e/1FAIpQLSeCSsRHQSoQvZccOSHIl5DZAPIkSnS4ivN0Z6rp6N7JIoofvQ/viewform · https://rollout.com/integration-guides/shopee/api-essentials · https://help.useresponse.com/hemi/knowledge-base/article/marketplaces-shopee-api-information-shopee_1
- **Not verified:** official Malaysia-specific eligibility pages for either platform (behind developer logins).

## Confidence
**Medium-high** that waiting is right. **Medium** on TikTok in-house approval speed.

## What would change this decision
- Orders > 20/day after Day 45 → build the TikTok in-house app (orders + settlements only) into the same Worker, with secrets in Cloudflare (never in the repo).
- A low-cost ERP that Haris already uses for EcomForges clients (e.g. BigSeller) offers free MY TikTok + Shopee sync with CSV/Sheets export → use its export instead of building anything.

## Haris: exact steps to execute
None now. Use **Data & settings → Import CSV** in the dashboard:
- **TikTok:** Seller Center → **Orders** → **Manage orders** → filter by date → **Export** → CSV → import as "TikTok Seller Center order export".
- **Shopee:** Seller Centre → **My Orders** → **Export** → choose the date range → download → open in Excel → **Save As CSV** → import as "Shopee order export".
