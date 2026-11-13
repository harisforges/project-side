# Takusut: operator brain + internal dashboard

A long-hair cat grooming brand on TikTok Shop MY and Shopee MY. `CLAUDE.md` holds the operating brief; `decisions/` holds every commercial decision.

```
CLAUDE.md                 operating brief (read by every Claude session)
decisions/                00-decisions-log.md + one file per decision (01–11)
research/                 validation data, supplier quote template
site/guide/               public one-page grooming guide (QR on the insert card)
dashboard/                internal ops dashboard (Cloudflare Worker + D1)
  config/rules.json       ALL thresholds: gates, ads rules, follow-ups, reorder, cash waterfall
  src/rules.js            rule engine (used by the dashboard AND the slash commands)
  migrations/             database schema + seed (plan data, build tasks, calendar, budget)
  public/                 the UI (no build step)
  scripts/rules-cli.mjs   runs the rule engine on a backup file
data/seed/                weekly backups (takusut-backup-YYYY-MM-DD.json): what /daily etc. read
.claude/commands/         /daily /weekly /gate /reorder /decide
```

## Slash commands (in Claude Code, in this repo)
| Command | When | Reads |
|---|---|---|
| `/daily` | every morning | newest `data/seed/takusut-backup-*.json` + `rules.json` |
| `/weekly` | Mondays | same |
| `/gate` | on gate dates (Day 7, 21, 30, 45, 60) | same |
| `/reorder` | when the dashboard shows a stock alert | same |
| `/decide <topic>` | any new decision | decisions/ + data |

Claude can only see data you put in the repo. Upload a fresh backup to `data/seed/` before running these. You can also paste the day's numbers into chat.

---

## Dashboard: deploy (one time, about 30 min, all in the browser, RM0)

You need a free Cloudflare account. Sign up at dash.cloudflare.com with the takusut Gmail.

### 1. Create the database
1. Cloudflare dashboard → **Storage & Databases → D1 SQL Database → Create** → name `takusut` → **Create**.
2. Copy the **Database ID** shown on the database page.
3. Open the database → **Console** tab:
   - paste the whole content of `dashboard/migrations/0001_schema.sql` → **Execute**
   - paste `dashboard/migrations/0002_seed.sql` → **Execute**

### 2. Put the IDs into the repo (GitHub web editor)
1. On GitHub, open `dashboard/wrangler.toml` → ✏️ edit.
2. Replace `REPLACE_WITH_ID_FROM_wrangler_d1_create` with the Database ID.
3. Commit. Leave the two `ACCESS_…` lines for step 4.

### 3. Deploy the Worker from GitHub
1. Cloudflare → **Workers & Pages → Create → Import a repository** → connect GitHub → choose `project-side`.
2. Settings:
   - **Root directory:** `dashboard`
   - **Build command:** *(empty)*
   - **Deploy command:** `npx wrangler deploy`
   - **Production branch:** the branch these files are on
3. **Deploy.**
4. Note the URL, e.g. `takusut-ops.<you>.workers.dev`. It shows "403 Forbidden: Access not configured" until step 4. That's expected: it fails closed.

### 4. Lock it with Cloudflare Access (email one-time code)
1. Cloudflare → **Zero Trust**. The first time, pick a team name (e.g. `takusut`) and the **Free** plan. Cloudflare may ask for a card even on the free plan.
2. Easiest path: **Workers & Pages → takusut-ops → Settings → Domains & Routes → workers.dev → Enable Cloudflare Access**. This creates the Access application for you.
   Otherwise: **Zero Trust → Access → Applications → Add an application → Self-hosted** with the `takusut-ops.<you>.workers.dev` hostname (or `ops.takusut.com` once the domain is on Cloudflare).
3. In **Zero Trust → Access → Applications**, open that application:
   - **Policies:** **Allow**, Include → **Emails** → your takusut Gmail (+ your personal email); remove any broader rule
   - **Login methods:** **One-time PIN**
   - **Overview:** copy the **Application Audience (AUD) Tag**
4. On GitHub edit `dashboard/wrangler.toml`:
   - `ACCESS_TEAM_DOMAIN = "https://<team>.cloudflareaccess.com"`
   - `ACCESS_AUD = "<the AUD tag>"`

   Commit. Cloudflare redeploys automatically.
5. Open the URL on PC and phone → enter your email → type the 6-digit code. On the phone: browser menu → **Add to Home screen**.

### Public grooming guide (takusut.com/guide)
1. Cloudflare → **Workers & Pages → Create → Pages → Connect to Git** → same repo:
   - Build command: *(empty)*
   - Build output directory: `site`
2. After the domain is bought: Pages project → **Custom domains** → add `takusut.com`. Check that `https://takusut.com/guide/` loads, then make the QR code.

### Updating thresholds
Edit `dashboard/config/rules.json` on GitHub → commit → Cloudflare redeploys in about 1 minute. `/daily` etc. read the same file.

---

## Daily use (at the packing table)
1. **Today:** most important action, rule-engine calls, orders to pack, creator follow-ups, tasks.
2. **KPIs:** enter yesterday's totals (2 min), or import order CSVs on **Data & settings**.
3. **Ads:** log yesterday's GMV Max spend/GMV/ROI and do what the call says.
4. **Creators:** add invites; move them along the pipeline.

## Backups (weekly, Mondays)
1. Dashboard → **Data & settings → Download backup** → `takusut-backup-YYYY-MM-DD.json`.
2. GitHub → `data/seed/` → **Add file → Upload files** → commit.

That file is the offline copy and what Claude reads. A second safety net: D1 keeps 30 days of point-in-time history (Cloudflare → D1 → your DB → **Time Travel**).

**Restore:** Data & settings → Restore → choose a backup file. This replaces everything.

## CSV import formats
- **TikTok:** Seller Center → Orders → Export (CSV). Recognised headers include `Order ID`, `Order Status`, `Created Time`, `Seller SKU`, `Variation`, `Quantity`, `Order Amount`.
- **Shopee:** My Orders → Export (xlsx → Save As CSV). Recognised headers include `Order ID`, `Order Status`, `Order Creation Date`, `SKU Reference No.`, `Variation Name`, `Quantity`, `Deal Price` / `Total Amount`.
- **Tracker tabs:** Daily KPIs (`Date, TikTok orders, Shopee orders, TikTok GMV, Shopee GMV, Ad spend, Videos, Samples, Stock`), Creators (`Handle, Followers, Status, Invited, Sample sent, Posted, Orders`).

If an import says "No rows recognised", it lists the headers it saw. Add the missing alias in `dashboard/src/csv.js`, or ask Claude to.

## Local development (optional, needs Node 20+)
```bash
cd dashboard
```
```bash
npm install
```
```bash
cp .dev.vars.example .dev.vars
```
```bash
npm run db:init:local
```
```bash
npm run dev
```
```bash
npm test
```
`.dev.vars` turns off the Access check locally. It's git-ignored; never set `DEV_NO_AUTH` in Cloudflare.

## Secrets
There are none in this repo. The Access AUD and team domain are public identifiers, and the Worker verifies the signed Access token on every request. If an API integration is ever added (decision 11), its keys go into Cloudflare secrets (`wrangler secret put`), never into git. `.env*` and `.dev.vars` are git-ignored.
