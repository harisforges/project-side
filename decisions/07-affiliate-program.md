# 07 — Affiliate program (TikTok Shop Affiliate Center)

Date: 13 Nov 2026 · Status: **DECIDED**. Start the day the listing is approved (Day 1).

## Decision

### Plans and rates
| Plan | Setting | Rate | Who |
|---|---|---|---|
| **Open collaboration** | All 3 variations | **15%** | Any eligible creator |
| **Targeted collaboration** | Invite-only | **20%** | The creators we pick (filter below) |
| **Shop Ads commission** | On (if offered in the plan) | **10%** | Creators whose videos we boost |
| **Top-performer tier** | Targeted plan edit | **22% → 25%** | Top 10% by orders (ladder below) |

### Free sample rules
- **Open plan:** samples **ON**, but **manual approval only** (no auto-approve).
- Approve only if **all** are true:
  1. **≥ 1,000 followers**
  2. **Posted pet/cat content in the last 14 days** (scroll their profile)
  3. Average views on their last 10 videos **≥ 500**
  4. **No** history of sample-hoarding: Affiliate Center shows their *fulfillment rate* where available; reject if < 50%
  5. Located in **Malaysia**
- **Cap:** max **10 samples/week** in Phase 1 (40 total = RM480 budget line). Each sample = 1 × 3-Step Kit.
- Sample shipping is through the platform's sample flow. Record each sample in the dashboard (Creators CRM → Sample sent, with date).

### Creator filter criteria (for targeted invites, 50/week)
Find them in Affiliate Center → **Find creators** → filter:
- Category: **Pets**
- Followers: **1k – 100k** (micro: cheaper, more willing, better trust)
- GMV tier: any (new creators welcome)
- Region: **Malaysia**
- Then open each profile and keep only those who:
  - have a **cat** (ideally long-haired) in at least 3 of their last 10 videos
  - posted within 14 days
  - speak **BM or EN** in captions

Priority order:
1. Long-haired cat owners
2. Cat-content creators who have sold any pet product
3. General cat creators

### Invite message (targeted collaboration, paste in the invitation "message" field)
**BM (default, most MY cat creators):**
```
Hai! Kucing bulu panjang awak comel sangat 😻 Kami Takusut — set dandanan 3 langkah untuk kucing bulu panjang (sikat self-cleaning + sisir besi + sisir muka). Nak cuba percuma? Komisen 20%, dan creator terbaik naik ke 25%. Sampel dihantar dalam 1 hari. Video idea: tunjuk bulu yang keluar selepas 5 minit sikat 😉
```
**EN:**
```
Hi! Your long-haired cat is adorable 😻 We're Takusut — a 3-step grooming kit for long-haired cats (self-cleaning slicker + steel comb + face comb). Want to try it free? 20% commission, top creators move up to 25%. Samples ship within 1 day. Video idea: show the fur pile after 5 minutes of brushing 😉
```

### One-line creator brief + 3 hooks (send after sample approval, in TikTok chat)
**Brief:**
```
Show the fur coming off your long-haired cat in 5 minutes, push the button so the fur drops off, then pin the Takusut product link. Hands-only is perfect — no need to show your face.
```
**Hooks** (first 3 seconds, on-screen text + voice):
1. `"Bulu kucing kusut? Tengok ni…"` → cut to the brush full of fur
2. `"5 minutes of brushing = THIS much fur 😳"` → reveal the fur pile
3. `"I stopped picking fur out of the brush"` → button press, fur drops

**Must-not-say list** (send with the brief): no "vet-recommended", no "cures/prevents hairballs", no "painless for every cat", no comparisons naming other brands. Product facts only.

### Follow-up message (10 days after sample delivered, if no video)
**BM:**
```
Hai! Harap kucing awak suka set Takusut 😊 Dah sempat cuba? Kalau perlukan idea video, boleh guna hook ni: "5 minit sikat = bulu sebanyak ni 😳". Komisen 20% masih aktif. Terima kasih!
```
**EN:**
```
Hi! Hope your cat is enjoying the Takusut kit 😊 Had a chance to try it? Quick video idea: "5 minutes of brushing = THIS much fur 😳". Your 20% commission is still active. Thank you!
```
- Second follow-up at **day 17**. Same message plus: `"Kalau tak sesuai, takpe — beritahu je ya 🙏"` (No pressure, just let me know).
- After day 21 with no post: mark **No response** in the CRM and send no more samples to that creator.

### Tier ladder (reviewed every Monday in `/weekly`)
| Tier | Rule | Commission | Extras |
|---|---|---|---|
| T0 Open | any creator | 15% | — |
| T1 Targeted | invited, sample approved | 20% | free kit |
| T2 Proven | ≥ 10 orders attributed in 14 days | **22%** | 2nd kit for a 2nd cat/video, first look at new SKUs |
| T3 Top | top 10% by orders **and** ≥ 30 orders in 30 days | **25%** | Shop Ads boost on their best video (10% ads commission), monthly bonus kit |

**Rule:** never raise anyone above 25%. At 25% creator commission + 16.74% platform commission, the kit still makes about RM6.90 on a non-ads order (item 3 maths). That only makes sense because top creators bring volume with zero ad spend.

### Weekly quota (Phase 1)
- **50 targeted invites/week**, about 10/day, 15 min/day
- **≤ 10 samples/week**
- **Goal: 20+ videos by Day 30**

## Why
- Plan rates from CLAUDE.md §3 are kept. Third-party 2026 guides put open plans at 10–15% and targeted at 18–25%. Our 15/20 is competitive for a new shop without burning margin.
- **Manual approval** stops sample hoarders, the biggest leak in TikTok affiliate programs.
- **Micro creators (1k–100k):** they reply, post, and cost only the sample.
- **BM-first invites:** most MY cat-content creators post in BM.

## Sources checked (13 Nov 2026)
- Open vs targeted collaboration mechanics: https://www.makeinfluence.com/en/academy/tiktok-shop-open-collaboration-vs-target-collaboration-how-creators-get-matched
- Typical rate ranges (blogs, not TikTok policy): https://syncly.app/blog/tiktok-affiliate-marketing · https://www.advertisepurple.com/?p=11539
- Pet supplies affiliate median about 8.5% (lower than ours, so ours is attractive): https://medialabs-co.com/blog/tiktok-shop-affiliate-commission-rates
- Malaysia affiliate overview: https://www.bigseller.pro/blog/articleDetails/105/Complete-Guide-of-TikTok-Affiliate-Program-Malaysia.htm
- **Unverified:** the exact Affiliate Center field names and whether a follower minimum applies to open collaboration in MY (one source says 5,000+). Check at setup.

## Confidence
- Structure and rates: **medium-high**.
- Field labels: **medium**.
- Response rate (assumed 18–22% to invites): **low** until Day 7.

## What would change this decision
| Signal | Action |
|---|---|
| Day 7: < 18% invite acceptance | Targeted to 22%, add 50 more invites (gate table) |
| > 30% of samples unposted after 21 days | Tighten filter: ≥ 2,000 followers and ≥ 1,000 avg views |
| One creator drives > 40% of orders | Lock them at 25% and ask for 2 more videos; diversify invites |
| Affiliate share of orders > 80% | Lower open plan to 12% for new creators only; keep 20% targeted |

## Haris: exact steps to execute (from Day 1)
1. **Seller Center → Affiliate** (or **Marketing → Affiliate Center**) → **Open collaboration** → **Create** → add the listing (all variations) → commission **15%** → **Free samples: On**, **Approval: Manual** → **Submit**.
2. **Affiliate → Targeted collaboration → Create plan** → name `T1-Launch` → product: all variations → **20%** → validity: 90 days → message: paste the **BM invite** → save.
3. **Shop Ads commission** (if shown in the plan options): **10%** → save.
4. **Daily (15 min, before packing):**
   - **Find creators** → filters above → open profiles → for each that fits, **Invite** to `T1-Launch`
   - Target **10 invites**; log each in the dashboard (Creators → Add: handle, followers, link, status *Invited*, date)
5. **Sample requests (daily):** Affiliate → **Sample requests** → check the 5 approval rules → Approve/Reject → log in the CRM as *Sample requested* → *Sample sent* when dispatched.
6. **After approval, in TikTok chat:** send the brief + 3 hooks + must-not-say list.
7. **Follow-ups:** the dashboard **Today** page lists creators at day 10 and day 17. Paste the follow-up text.
8. **Mondays:** `/weekly` tells you which creators move up a tier. Edit their targeted plan rate (or create `T2-Proven 22%`, `T3-Top 25%` plans and move them over).
