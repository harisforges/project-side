# 04 — Sourcing

Date: 13 Nov 2026 · Status: **DECIDED** · Owner of clicks: Haris

## Decision

1. **Buy on 1688 and ship through a Malaysian consolidation forwarder** with a Guangzhou/Yiwu warehouse. Use Taobao's official consolidation service (淘宝集运) only as backup.
2. **First order is smaller than the plan: 120 kits by air, not 200.** That is about RM1,700 instead of RM2,000. We buy the rest after we've seen real QC and the first two weeks of sales. A bad supplier then costs about RM1,100, not RM2,000.

   | Item | Qty | Why |
   |---|---|---|
   | Slicker brush (long-hair spec) | **150** | 120 kits + 10 for 2-cat kits/singles + 15 creator samples + 5 spare |
   | Two-sided steel comb, about 19 cm | **130** | 120 kits + 10 spare |
   | Face/flea comb, about 10 cm | **130** | 120 kits + 10 spare |

   Creator samples come out of the 120 kits. Plan 40 samples over Phase 1 and re-order before they run out.
3. **Two backup suppliers send samples only** (2 slickers each), packed in the same forwarder shipment. If supplier A fails QC, we switch without losing a week.
4. **Packaging is bought in Malaysia** (item 10): mailer boxes, insert cards, stickers. No packaging is imported.
5. **The local backup stock line (RM500) is not spent on non-spec local brushes.** Sending creators a different brush from the one we sell would be misleading. The RM500 becomes an **"air top-up reserve"**: spend it only if stock drops below 10 days of cover before a sea reorder lands.
6. **Reorders go by sea** once the 7-day average is 5 or more orders/day. Before that, a second air batch of 120 kits only if stock cover drops below 14 days. `/reorder` does the maths.
7. **The launch date follows stock.** If the air shipment lands after 26 Nov, **Day 1 = the day the listing goes live with stock in hand**, and all gate dates shift by the same number of days. The dashboard stores Day 1 as one editable setting.

## Supplier selection criteria (score each supplier, pick the highest; any ✗ on the must-haves = reject)

| # | Criterion | Must-have / score | Where on 1688 |
|---|---|---|---|
| 1 | **源头工厂 / 实力商家** (source factory / verified strength merchant) tag | Must-have: at least one | Badge under shop name |
| 2 | 诚信通 years ≥ 3 | Must-have | "X年" badge |
| 3 | 回头率 (repeat-buyer rate) ≥ 20% | Score: 20–29% = 1, ≥ 30% = 2 | Product page, near sales |
| 4 | 综合服务分 (service score) ≥ 4.0 | Must-have | Shop header |
| 5 | Product 成交/已售 (units sold, 90 days) ≥ 1,000 | Score: ≥ 1,000 = 1, ≥ 10,000 = 2 | Product page |
| 6 | Pin length **≥ 15 mm** stated, or confirmed in chat | Must-have | Spec table (参数) / chat |
| 7 | Pins **coated / ball-tipped** (针头圆珠/涂层) | Must-have | Photos + chat |
| 8 | **One-push full retraction** (一键退毛, no lever) | Must-have | Video on the product page |
| 9 | Head width 8.5–10 cm, weight ≤ 130 g | Must-have | Spec table / chat |
| 10 | MOQ ≤ 50 and replies in < 4 h | Score 1 each | Chat |
| 11 | Unit price ≤ ¥9 (slicker), ≤ ¥3 (each comb) | Score: within = 1 | Price tier at our qty |
| 12 | No brand logo on the product (white-label), or will remove it | Must-have | Photos / chat |

**Brand look-alike rule:** reject any brush whose shape or colourway copies Hertzko, Safari, FURminator or Pecute. Copied product photos are banned. We shoot our own (item 6).

## RFQ messages (send in 1688 chat, 旺旺/阿里旺旺)

### Slicker brush: Chinese (send this)
```
您好！我是马来西亚的电商卖家，想采购猫用自清洁针梳（长毛猫用）。
请确认以下规格：
1. 针长：15mm或以上（长毛猫用）
2. 针头：圆珠或涂层，不刮伤皮肤
3. 一键退毛，按一下针完全缩回（不要拨杆式）
4. 刷头宽度约9-10cm，整体重量130g以内
5. 不锈钢针，无品牌logo（白牌）
采购数量：首单150个，之后每月300-1000个（海运）。
请报价：150个单价、500个单价、1000个单价，以及发货到广州/义乌仓库的运费和发货时间。
可以先拍一段按键退毛的视频给我看吗？谢谢！
```

### Slicker brush: English (your reference copy)
```
Hello! I'm an e-commerce seller in Malaysia sourcing self-cleaning slicker brushes for long-haired cats.
Please confirm these specs:
1. Pin length 15 mm or longer (for long-haired cats)
2. Ball-tipped or coated pins that don't scratch skin
3. One-push retraction: pins fully retract with one press (no lever)
4. Head about 9–10 cm wide, total weight under 130 g
5. Stainless steel pins, no brand logo (white label)
Quantity: first order 150 pcs, then 300–1,000 pcs/month by sea.
Please quote unit prices for 150 / 500 / 1,000 pcs, plus shipping cost and dispatch time to a Guangzhou/Yiwu warehouse.
Could you send a short video showing the button retracting the pins? Thank you!
```

### Combs: Chinese
```
您好！我想采购两款猫梳：
A. 不锈钢双排梳（一边宽齿一边密齿），长度约19cm，圆头齿不伤皮肤，无logo
B. 小号密齿梳（脸部/跳蚤梳），长度约10cm，无logo
首单各130个，之后每月300-1000个。请报价130/500/1000个单价、重量、发货时间和到广州/义乌仓库运费。谢谢！
```

### Combs: English
```
Hello! I'd like to buy two cat combs:
A. Stainless steel two-sided comb (wide teeth one side, fine teeth the other), about 19 cm, rounded tips, no logo
B. Small fine-tooth face/flea comb, about 10 cm, no logo
First order 130 pcs each, then 300–1,000/month. Please quote unit prices for 130 / 500 / 1,000 pcs, item weight, dispatch time and shipping to a Guangzhou/Yiwu warehouse. Thank you!
```

### Follow-up if no reply in 6 hours: Chinese
```
您好，请问今天可以报价吗？我们这周要下单。谢谢！
```

### Before paying: Chinese (locks in quality terms)
```
下单前确认：1）针长15mm以上，圆珠/涂层针头；2）一键完全退毛；3）每个独立包装（OPP袋）；4）发货前请拍5个随机产品的退毛视频给我。如果收到货有质量问题（针脱落、按键失灵），请同意补发或退款。可以吗？
```
(= "Confirm before order: pins ≥15 mm, coated; one-push full retraction; each unit in its own OPP bag; send a video of 5 random units retracting before dispatch; agree to replace/refund defects (pins falling out, button failure). OK?")

## QC checklist (on arrival, at home)

**First batch: function-test 100% of slickers** (about 25 min for 150 units), plus 20 random units of each comb.

| Check | Pass | Fail action |
|---|---|---|
| Button press fully retracts pins (3 presses each) | All pins below the pad surface | Set aside; claim from supplier |
| Pins: run across your inner forearm with light pressure | No scratch marks | Batch fail if > 2 of 20 scratch. Stop, contact supplier |
| Pin tips coated / balls present (look at 10 pins per brush) | No missing balls | > 5% missing = claim |
| Pin length (ruler, 3 brushes) | ≥ 14 mm | < 14 mm = renegotiate price or switch supplier |
| Head and handle: twist test, drop from 1 m onto the floor (3 brushes) | No cracks | Any crack = batch fail |
| Weight (kitchen scale, 3 units) | Slicker ≤ 135 g | Record; affects shipping |
| Comb teeth: run a fingernail along both sides | No burrs, no sharp tips | Remove; > 5% = claim |
| Smell (plastic/chemical) | None strong | Air out; claim if strong |
| No brand logos | None | Return if branded |

Record results in the dashboard: **Inventory → QC log** (date, batch, units checked, failures, notes). **Batch fail = more than 5% defects on any line.** Stop and tell `/decide sourcing`.

## Landed-cost calculator inputs (these go into the dashboard: Unit economics → Landed cost)

| Input | Value to enter | Source |
|---|---|---|
| Slicker unit price (¥) | from the chosen quote | 1688 |
| Comb A unit price (¥) | from quote | 1688 |
| Comb B unit price (¥) | from quote | 1688 |
| CNY→MYR rate | the rate on your payment receipt (about 0.62–0.66; **assumption**) | Bank / Alipay receipt |
| China domestic shipping to forwarder (¥ per order) | from quote, usually ¥0–30 | 1688 |
| Forwarder air rate (RM/kg) | from forwarder, expect RM18–22 | Forwarder site |
| Forwarder sea rate (RM per kg or per cbm) | from forwarder | Forwarder site |
| Chargeable weight | max(actual kg, L×W×H cm ÷ 6000) | Forwarder invoice |
| Import tax buffer | 10% of goods value (**assumption**: sales tax on imported low-value goods; confirm with the forwarder) | Forwarder |
| Local packaging per kit | mailer + insert + sticker + void fill, expect RM1.20–1.80 | Item 10 |

Formula used: `landed per kit = (Σ unit prices ¥ × FX) + (domestic ¥ × FX ÷ kits) + (rate × chargeable kg ÷ kits) + import buffer + local packaging`.

## Why (data + reasoning)
- **1688 + forwarder** is the cheapest route for small lots and gives factory pricing. Taobao retail is 30–60% higher.
- **Air freight about RM20–22/kg to West Malaysia.** 120 kits × about 0.2 kg + 30 extra slickers ≈ 28 kg ≈ RM600. Goods ≈ 150 × ¥8 + 260 × ¥2.5 = ¥1,850 ≈ RM1,180. **First batch ≈ RM1,780 all-in** (assumption until quotes). That leaves RM220 of the RM2,000 stock line as headroom.
- **Smaller first order:** no sales data yet, and the hero could still swap at Day 21. The 120 kits cover the 40 creator samples plus about 80 orders, about 3 weeks at the Day-21 pass rate.
- **Sea for reorders:** forwarder sea is typically 4–6x cheaper per kg than air (assumption). That cuts about RM1 or more off landed cost, which is the RM10-profit fix from item 3.
- **CNY:** 6–7 Feb 2027. Factories typically stop about 2 weeks before and restart about 2 weeks after (assumption). **The last sea order must be paid by 8 Jan 2027** to land before the shutdown bites. That is in `rules.json`.

## Sources checked (13 Nov 2026)
- Air freight China → West MY RM22/kg (Oct 2025 notice): https://www.wepost.com.my/en/amp/notices/air-freight-fee-adjustment-oct-2025
- Air freight RM15.50–20/kg tiered (GIM World, undated): https://gimworld.com/ship-from-china-to-malaysia-中国代运到马来西亚
- LCL sea USD 100–250/cbm, 10–21 days (FreightAmigo, Apr 2026): https://www.freightamigo.com/en/blog/popular-route/shipping-from-qingdao-to-malaysia/
- 1688 indicative pet brush prices (sourcing agents): https://sourcing.ship4wd.com/
- CNY 2027 dates (6–7 Feb): https://www.officeholidays.com/countries/malaysia/2027

## Confidence
- Route and spec: **high**.
- Prices and freight: **medium-low** until quotes arrive.
- Arrival by 26 Nov: **low-medium**. 1688 dispatch takes 1–3 days, plus 1–3 days domestic, plus 3–7 working days air. That is 5–13 days from payment on 15 Nov, so arrival between 20 Nov and 2 Dec.

## What would change this decision
| Finding | Action |
|---|---|
| No supplier meets pin ≥ 15 mm + coated + one-push | Accept 13–14 mm pins **if** coated and one-push; update listing claims to match the real spec |
| Best quote > ¥12/slicker | Re-check 3 more suppliers; if still > ¥12, landed > RM13 → raise kit to RM44.90 (item 3) |
| Supplier A batch fails QC | Switch to whichever backup sample passes QC; claim refund from A via 1688 dispute (退款/售后) |
| Air quote > RM25/kg | Ask Taobao 集运 (official consolidation) for a quote; use the cheaper one |

## Haris: exact steps to execute

**Day 1: Sat 14 Nov (about 90 min)**
1. **Create accounts:** go to `https://www.1688.com` → 免费注册 (register) with your phone. Install the **1688 app** and **Alipay** on your phone. Link your Malaysian card in Alipay (Alipay → 我的 → 银行卡 → 添加). If a card is declined, the forwarder can pay for you (代付), usually for a 3–5% fee.
2. **Pick a forwarder:** compare 2 Malaysian China-to-MY consolidators with a Guangzhou warehouse (search Google: `taobao 1688 forwarder Malaysia air sea`). Choose the one with:
   - published air rate ≤ RM22/kg to West Malaysia
   - door delivery to KL
   - insurance option
   - a WhatsApp reply in < 2 h

   Register, then copy **your personal warehouse address** (it includes your member code).
3. **In the 1688 app**, search each, then 筛选 (filter) → **源头工厂**, and sort by **销量** (sales):
   - `长毛猫 自清洁针梳 一键退毛`
   - `猫梳 不锈钢 双排梳`
   - `猫 跳蚤梳 小号 密齿`
4. Open the top 8 slicker listings, score them against the criteria table above, and keep the top 5. For combs, the top 3 each.
5. Send the **Chinese RFQ** (copy-paste from above) to all 5 slicker suppliers and 3 comb suppliers.
6. Paste the quotes into `research/04-supplier-quotes.csv` (template provided), or into chat with me.

**Day 2: Sun 15 Nov (about 45 min)**
7. Choose supplier A (highest score, all must-haves ✓) and backups B and C.
8. Send supplier A the **"Before paying"** message. Wait for 好的/可以 (OK).
9. **Place orders:**
   - **A:** 150 slickers
   - **Comb supplier:** 130 two-sided + 130 face combs
   - **B and C:** 2 slickers each (samples)

   Shipping address for all of them = **your forwarder warehouse address**. Put your member code in the 收货人 (recipient) name exactly as the forwarder instructs.
10. Pay with Alipay. Screenshot the payment receipts showing ¥ and RM. Record them in the dashboard **Budget & cash** (category: Stock, or Supplier samples).
11. Ask supplier A for the pre-dispatch video of 5 units.

**When parcels reach the forwarder (about 17–20 Nov)**
12. In the forwarder app: select all parcels → **consolidate** → **Air** → declare goods as "pet grooming brush and comb, plastic and stainless steel", value = real value → pay the freight. Record the cost in Budget & cash (Stock – freight).

**On arrival (about 20 Nov – 2 Dec)**
13. Run the **QC checklist** above and log it in the dashboard (Inventory → QC log).
14. Enter stock on hand in the dashboard: slickers, comb A, comb B.
15. Tell me "stock in": I'll confirm the Day 1 date and shift the gate dates if needed.
