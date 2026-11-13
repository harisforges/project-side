---
description: Make and log a new decision — /decide <topic>
argument-hint: <topic>
---
Make a new commercial decision on: $ARGUMENTS

1. Read CLAUDE.md, `decisions/00-decisions-log.md`, the related decision files, and the newest backup via `cd dashboard && node scripts/rules-cli.mjs --json` if numbers matter.
2. Research anything that depends on current fees, policies or dates (web search) and label unverified items as assumptions.
3. Write `decisions/NN-<topic>.md` (next free number) with exactly: **Decision** · **Why (data + reasoning)** · **Sources checked (with dates)** · **Confidence (low/med/high)** · **What would change this decision** · **Haris: exact steps to execute** (numbered click paths, copy-paste text).
4. Decide — don't offer a menu. Only ask Haris (A–D, recommended first) if it spends unrecoverable money, risks the shop account, or has legal/tax consequences.
5. Append a row to `decisions/00-decisions-log.md`, tell Haris to add it in the dashboard → Decisions (number, title, status, confidence), commit and push.
Respect hard limits: no fake orders/reviews, no incentivised reviews, no misleading claims, no copied images or look-alikes, RM5,000 cap and gates.
