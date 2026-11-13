#!/usr/bin/env node
// Runs the dashboard rule engine against a backup JSON (Data & settings → Download backup).
// Usage: node scripts/rules-cli.mjs [backup.json] [--today YYYY-MM-DD] [--json]
// With no file, uses the newest takusut-backup-*.json in ../data/seed/.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { runAll, todayMYT, diffDays } from '../src/rules.js';

const here = dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const flag = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const asJson = args.includes('--json');
let file = args.find((a) => a.endsWith('.json'));
const seedDir = join(here, '..', '..', 'data', 'seed');
if (!file) {
  let files = [];
  try { files = readdirSync(seedDir).filter((f) => /^takusut-backup-.*\.json$/.test(f)).map((f) => join(seedDir, f)); } catch {}
  files.sort((a, b) => statSync(b).mtimeMs - statSync(a).mtimeMs || b.localeCompare(a));
  file = files[0];
}
const cfg = JSON.parse(readFileSync(join(here, '..', 'config', 'rules.json'), 'utf8'));
const today = flag('--today') || todayMYT();
let tables = {};
let backupInfo = 'NO BACKUP FOUND — using an empty dataset (plan defaults only).';
if (file) {
  const b = JSON.parse(readFileSync(file, 'utf8'));
  tables = b.tables || {};
  const age = b.exported_at ? diffDays(today, b.exported_at.slice(0, 10)) : null;
  backupInfo = `${file} (exported ${b.exported_at || 'unknown'}${age !== null ? `, ${age} day(s) old` : ''})${age !== null && age > 7 ? ' — WARNING: older than 7 days, numbers may be stale.' : ''}`;
}
const t = (name) => tables[name] || [];
const settings = Object.fromEntries(t('settings').map((r) => [r.key, r.value]));
const unitEcon = Object.fromEntries(t('unit_econ').map((r) => [r.channel, r]));
if (!unitEcon.tiktok) unitEcon.tiktok = { price: 39.9, landed: 11, commission_pct: 16.74, txn_pct: 3.78, psf: 0.54, affiliate_pct: 15, affiliate_share_pct: 60, ads_pct: 12, shipping: 2.12, returns_pct: 3 };
if (!unitEcon.shopee) unitEcon.shopee = { price: 39.9, landed: 11, commission_pct: 15, txn_pct: 3.78, psf: 0.54, affiliate_pct: 0, affiliate_share_pct: 0, ads_pct: 10, shipping: 2.12, returns_pct: 3 };
const out = runAll({
  cfg, today, settings, kpis: t('daily_kpis'), creators: t('creators'), adsLog: t('ads_log'), inventory: t('inventory'),
  purchaseOrders: t('purchase_orders'), gateState: t('gate_results'), tasks: t('tasks'), unitEcon,
});
out.backup = backupInfo;
out.cash = (() => {
  const cash = t('cash');
  const actual = cash.filter((x) => x.status !== 'pending');
  return {
    balance: +actual.reduce((a, x) => a + Number(x.amount || 0), 0).toFixed(2),
    spent: +(-actual.filter((x) => Number(x.amount) < 0 && x.category !== 'Transfer to EcomForges').reduce((a, x) => a + Number(x.amount), 0)).toFixed(2),
    pending: +cash.filter((x) => x.status === 'pending').reduce((a, x) => a + Number(x.amount || 0), 0).toFixed(2),
  };
})();
if (asJson) { console.log(JSON.stringify(out, null, 2)); process.exit(0); }
const m = out.metrics;
console.log(`# Rule engine — ${out.today} (Day ${out.day_number}, Day 1 = ${out.day1})`);
console.log(`Data: ${out.backup}\n`);
console.log(`Orders 7d avg ${m.orders_7d_avg}/day · GMV 7d RM${m.gmv_7d} · ad spend 7d RM${m.ad_spend_7d} · ROAS 7d ${m.roas_7d ?? '–'} · est profit 7d RM${m.profit_7d} (RM${m.profit_per_order_7d}/order)`);
console.log(`Creators ${m.invites_total} · samples ${m.samples_sent_total} · videos ${m.videos_total} · best video ${m.best_video_orders} orders`);
console.log(`Stock: ${out.reorder.kits_possible} kits · cover ${out.reorder.days_cover ?? '–'} days · incoming ${out.reorder.incoming_kits} · suggested ${out.reorder.suggested_kits} by ${out.reorder.mode}`);
console.log(`Cash: balance RM${out.cash.balance} · spent RM${out.cash.spent} of RM${cfg.cash.capital_cap} · pending RM${out.cash.pending}`);
console.log(`Unit economics: TikTok RM${out.unit_economics.tiktok.profit}/kit (BE ROAS ${out.unit_economics.tiktok.break_even_roas}) · Shopee RM${out.unit_economics.shopee.profit}/kit\n`);
console.log('## Gates');
for (const g of out.gates) console.log(`- ${g.id} ${g.date} [${g.status}] ${g.checks.map((c) => `${c.label}: ${c.actual}${c.pass ? ' ✓' : ' ✗'}`).join('; ')}`);
console.log('\n## Calls (priority order)');
out.calls.forEach((c, i) => console.log(`${i + 1}. [P${c.priority} ${c.area}] ${c.message}`));
