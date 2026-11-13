# 10 — Packaging & insert card

Date: 13 Nov 2026 · Status: **DECIDED**. Budget line: packaging RM250, label printer RM200.

## Decision

### Mailer spec
| Item | Spec | Qty (first order) | Est. cost (assumption) |
|---|---|---|---|
| **Mailer box** | Kraft corrugated **E-flute** tuck-front mailer, inner **24 × 13 × 5 cm** (fits the 19 cm comb with room), **plain kraft**, no print | 200 | RM0.70–1.00 each → ~RM180 |
| **Logo sticker** | Round **5 cm**, matte white, black "TAKUSUT" wordmark + "Tak kusut lagi." | 500 | ~RM40 (local sticker printer on Shopee) |
| **Insert card** | **A6 (10.5 × 14.8 cm)**, 300 gsm, single-sided colour, matte | 300 | ~RM30–45 |
| Void fill | Crinkle kraft paper shred, 1 kg | 1 | ~RM15 |
| Courier label | Thermal **A6 (100 × 150 mm)** labels for the label printer | 500 roll | ~RM25 |
| **Label printer** | Any **A6 thermal** printer that supports TikTok Shop + Shopee AWB printing (USB + Bluetooth) | 1 | ≤ RM200 |
| Tape | Kraft paper tape | 2 rolls | ~RM10 |

**Total ≈ RM300–315** (packaging ~RM100 over its RM250 line; the overrun comes from the RM400 buffer). With the label printer the total is about RM500 against RM450 budgeted.
**Per-kit packaging cost ≈ RM1.25** (box ~0.85 + sticker 0.08 + card 0.12 + fill 0.10 + label 0.05 + tape 0.05). This is inside the RM11 landed cost.

**Parcel weight check:** box ~55 g + tools ~190 g + card 5 g + fill 10 g ≈ **260 g**. Declare **0.25–0.30 kg** after weighing the first real packed kit. The 2-Cat Kit is about 380 g → declare **0.40 kg**.

**Pack order (30 seconds/kit):** fill on the bottom → slicker (in its OPP bag) → comb → face comb → insert card on top, **QR facing up** → close → logo sticker on the flap seal → thermal label on the top face.

### Insert card copy (A6, front only)
```
┌───────────────────────────────────────┐
│ TAKUSUT                                │
│ Tak kusut lagi.                        │
│                                        │
│ YOUR 5-MINUTE ROUTINE                  │
│ 2–3x a week                            │
│                                        │
│ 1  BRUSH   Light strokes, direction    │
│            of the fur. Press the       │
│            button — fur slides off.    │
│ 2  COMB    Wide side first. If it      │
│            catches, brush that spot.   │
│ 3  FINISH  Small comb for face,        │
│            paws and behind the ears.   │
│                                        │
│ Never pull a tight mat.                │
│                                        │
│ [ QR ]  Full guide + video:            │
│         takusut.com/guide              │
│                                        │
│ Something wrong with your order?       │
│ Chat with us in the app — we'll fix    │
│ it fast. 🐾                            │
└───────────────────────────────────────┘
```
- **Fonts:** one sans (Canva "Inter" or "Poppins"). Colours from item 6: bg `#F6F1EA`, text `#2E2A26`, accent `#C9744A`.
- **QR:** points to `https://takusut.com/guide`. Make it in Canva (Apps → QR code). Test-scan it with 2 phones before printing.
- **Not on the card** (platform rules):
  - no request for reviews in exchange for anything
  - no off-platform discount codes
  - no WhatsApp numbers or links that pull buyers off TikTok/Shopee
  - no "5-star" requests

### One-page grooming guide
Written and built: **`site/guide/index.html`** (mobile-first, no tracking, loads fast). It is deployed with the public site on Cloudflare Pages at `takusut.com/guide`; the deployment steps are in `README.md`. Contents:
- the 3 steps in more detail
- how often by coat type
- handling knots safely
- getting a nervous cat used to brushing
- cleaning the tools
- when to see a groomer or vet
- BM summary

## Why
- **Plain kraft + sticker:** no MOQ and no 2-week print lead time. Printed boxes can wait until reorders exceed 500/month.
- **E-flute mailer instead of a poly bag:** combs and pins bend in soft bags, and "item received broken" was a top complaint in the item-1 research.
- **QR guide:**
  - helps the cat get used to brushing, which means fewer "cat doesn't like it" refunds
  - gives the buyer a reason to keep the card
  - gives us a page we control
  - it collects no data and has no off-platform sales links, so it is policy-safe

## Sources checked (13 Nov 2026)
- Item 1 complaints ("item received broken", "bad packing"): `research/01-product-validation-template.csv`
- Packaging prices: **assumptions** from typical Shopee MY packaging listings. Verify at checkout.

## Confidence
**High** on spec. **Medium** on prices.

## What would change this decision
- First real packed kit weighs > 300 g → move to a lighter B-flute-free mailer or drop the void fill.
- Box damage claims > 2% → upgrade to B-flute (stiffer, about +RM0.30).

## Haris: exact steps to execute
1. **Order on Shopee MY** (search terms in brackets; pick sellers with ≥ 4.8★ and ≥ 1k sold, shipping from MY):
   - Mailer box `kraft mailer box 24x13x5` (or the closest size ≥ 23 × 12 × 4.5), qty 200
   - Thermal printer `thermal printer A6 shopee tiktok` ≤ RM200, then thermal labels `A6 thermal sticker 100x150` × 500
   - Kraft tape and crinkle paper
2. **Stickers + insert cards:** design both in Canva (copy above) → order from a Shopee MY printing seller (`sticker printing custom round 5cm`, `flyer printing A6 300gsm`). Upload the PDF exported from Canva (**PDF Print**, crop marks on).
3. **Domain + guide:** after buying takusut.com (item 2), deploy the guide (README → "Deploy the public guide"). Then scan the QR.
4. Record all packaging purchases in the dashboard → **Budget & cash** (category: Packaging / Label printer).
