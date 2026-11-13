# 09 — Customer service

Date: 13 Nov 2026 · Status: **DECIDED** · Time budget: ≤ 15 min/day, light chat only

## Decision

### Auto-replies (paste into both platforms)

**Welcome / first message** (TikTok: Customer Service → Auto-reply → Welcome message; Shopee: Chat Assistant → Auto-reply):
```
Hi! 👋 Thanks for visiting Takusut — long-hair cat grooming. We reply within a few hours (9am–10pm). Orders ship from KL within 1 working day. 🐾
Hai! Terima kasih singgah Takusut. Kami balas dalam beberapa jam (9pg–10mlm). Pesanan dihantar dari KL dalam 1 hari bekerja.
```

**Off-hours** (Shopee Off-work auto-reply; TikTok "outside business hours" if available):
```
Thanks for your message! We're offline now and will reply after 9am. 🌙
Terima kasih! Kami akan balas selepas 9 pagi.
```

### 10 saved answers (TikTok: Quick replies; Shopee: Quick replies / Message shortcuts)

| # | Shortcut | When | Text |
|---|---|---|---|
| 1 | `/ship` | "When will it ship?" | `Orders ship within 1 working day from KL. You'll get the tracking number in the app once it's dispatched. 📦 / Dihantar dalam 1 hari bekerja dari KL.` |
| 2 | `/long` | "Is it OK for my long-haired / Persian cat?" | `Yes — it's made for long hair (Persian, Maine Coon, mixes). The 15mm coated pins reach the undercoat. Use light strokes in the direction of the fur. 😺` |
| 3 | `/short` | "Short-haired cat?" | `It works on short hair too, but the slicker is designed for long or thick coats. For short hair, use very light strokes and the fine comb side.` |
| 4 | `/mat` | "My cat has big mats" | `For small knots: brush gently around the knot, then work it loose with the wide comb side. Please don't pull on big, tight mats — those are best removed by a groomer or vet to avoid hurting the skin. 🙏` |
| 5 | `/clean` | "How does self-cleaning work?" | `After brushing, press the button on the back — the pins pull in and the fur slides off in one piece. Release the button to use again.` |
| 6 | `/kit` | "What's in the kit?" | `3-Step Kit: 1 self-cleaning slicker brush, 1 two-sided steel comb (19cm), 1 face comb (10cm) + grooming guide card. 2-Cat Kit adds an extra brush.` |
| 7 | `/howto` | "How often / how to use?" | `5 minutes, 2–3 times a week: 1) brush with light strokes, 2) comb to find hidden knots, 3) small comb for face and paws. Full guide: takusut.com/guide` |
| 8 | `/damaged` | Item damaged / missing / wrong | `So sorry about that! 🙏 Please send a photo of the item and the parcel label here. We'll sort it out right away — replacement or refund, your choice.` |
| 9 | `/scared` | "My cat doesn't like it" | `Totally normal at first! Try 1–2 minutes with treats, only on the back and cheeks, and stop before your cat gets annoyed. Most cats get used to it within a week. Use very light pressure.` |
| 10 | `/review` | After delivery / thank-you (only when the customer says they're happy) | `So glad it helps! 😻 If you have a moment, an honest review helps other cat owners find us. Thank you!` |

**Review rule:** #10 asks for an **honest** review only, with **no incentive, no discount, no free item in exchange**, and only after the customer says something positive unprompted. Never ask for 5 stars specifically. Incentivised or fake reviews are banned (hard limit).

### Refund / return decision rules (follow exactly; the platform rules override these if they conflict)

| Case | Evidence needed | Decision |
|---|---|---|
| Damaged / defective on arrival (bent pins, button doesn't retract, broken comb) | Photo or video | **Accept.** Offer a replacement (send the missing/broken item only if the platform lets you) or a full refund. No return needed if the item is < RM25 and the photo is clear |
| Missing item | Photo of the opened box contents + the packing video (you record one, see below) | Check the packing video. If the video shows the item packed → reply with a polite explanation and the video screenshot. If no video → **refund the missing item's share** |
| Wrong variation sent | Photo | **Accept.** Send the correct item; ask for the wrong one back only if it's the 2-Cat Kit |
| Change of mind / "cat doesn't like it" | — | Send `/scared` first. If they still want a refund, follow the platform's default return process. **Don't** refuse in a way that triggers a dispute |
| Not delivered (tracking stuck > 7 days) | — | Raise a courier case in Seller Center; tell the buyer you've done it |
| Claims of injury / skin scratch | Photo | Apologise, **refund in full**, ask for no return, log it in the QC log. **2 such claims in a batch → stop selling that batch and tell `/decide`** |
| Abusive / suspicious (repeat refund requests) | — | Follow the platform process; report the buyer through Seller Center; never argue in chat |

**Packing video habit:** prop the phone up and record each packed order (order number visible on the label). Keep 30 days. This is your evidence for "missing item" claims and costs nothing.

**Response time target:** reply within 12 h (platform metrics track it). The dashboard Today page reminds you at 9 am and 8 pm.

## Why
- Saved answers cover the questions that came up in item-1 reviews ("doesn't work", "broke", "not as described") and the main grooming FAQs.
- Generous on genuine defects, firm on evidence: on a RM40 item, a fast replacement protects shop ratings, which matter more than RM11 of product.
- The packing video stops "missing item" abuse at zero cost.

## Sources checked
- Item 1 complaint themes: `research/01-product-validation-template.csv`
- Platform review policies (incentivised reviews banned): TikTok Shop and Shopee seller policies (standard; also in CLAUDE.md hard limits)

## Confidence
**High.**

## What would change this decision
- Defect claims above 3% of orders in a batch → QC tighter (item 4) and a supplier claim.
- One question asked 5+ times a week that isn't covered → add saved answer #11 via `/decide cs`.

## Haris: exact steps to execute
1. **TikTok Seller Center → Customer Service → Settings → Auto-reply:** paste the welcome text → **Save**. Then **Quick replies → Add** each of the 10 (shortcut name = the `/word`).
2. **Shopee Seller Centre → Customer Service → Chat Assistant:** turn on **Auto-reply** (paste welcome) and **Off-work Auto-reply** (paste off-hours, set hours 22:00–09:00). Then **Quick Replies → Add** the 10 answers.
3. Set up the **packing video** stand at the packing table (a cheap phone holder from the RM120 photo budget).
