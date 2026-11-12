# Dashboard setup decisions (answered 12 Nov 2026)

| Topic | Choice |
|---|---|
| Hosting + stack | Cloudflare Pages + Workers + D1 (SQLite), TypeScript. RM0/month free tier. |
| Access | Cloudflare Access, email one-time code, owner email only (add packer later). |
| Data entry | 2-minute daily mobile form + CSV upload of TikTok Seller Center and Shopee order exports. |
| Backups | Manual "Download backup" button, weekly. Haris saves the file into `data/seed/` (or Drive). Claude reads data only from files placed in the repo. |

Consequence of manual backups: `/daily`, `/weekly`, `/gate` read the latest export in `data/seed/` or `data/imports/`. If the newest file is older than 7 days, the command says so before giving advice. D1 time-travel (30 days) is the second line of recovery.

Build is NOT started yet. Order of work: Decisions Pack items one at a time on "next"; dashboard build slots in when Haris asks.
