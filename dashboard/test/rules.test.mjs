import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { unitEconomics, adsCall, evaluateGates, computeMetrics, creatorFollowups, reorderCheck, runAll, addDays } from '../src/rules.js';
import { parseCSV, mapOrders, toISODate } from '../src/csv.js';

const cfg = JSON.parse(readFileSync(new URL('../config/rules.json', import.meta.url)));
const TT = { price: 39.9, landed: 11, commission_pct: 16.74, txn_pct: 3.78, psf: 0.54, affiliate_pct: 15, affiliate_share_pct: 60, ads_pct: 12, shipping: 2.12, returns_pct: 3 };

test('unit economics matches decision 03', () => {
  const u = unitEconomics(TT);
  assert.equal(u.profit, 8.48);
  assert.equal(u.break_even_roas, 2.37);
  assert.equal(u.break_even_roas_shop_ads, 3.1);
  assert.equal(unitEconomics({ ...TT, commission_pct: 11.88 }).profit, 10.42);
});

test('ads: wait, start, scale, cut, hold', () => {
  const m0 = { orders_total: 5, videos_total: 1 };
  assert.equal(adsCall({ cfg, adsLog: [], metrics: m0 }).code, 'WAIT');
  assert.equal(adsCall({ cfg, adsLog: [], metrics: { orders_total: 20, videos_total: 0 } }).code, 'START');
  const d = (date, roi, budget = 30, spend = 30) => ({ date, roi, budget, roi_target: 3, spend, gmv: roi * spend });
  const scale = adsCall({ cfg, adsLog: [d('2026-12-01', 3.2), d('2026-12-02', 3.5), d('2026-12-03', 3.1)], metrics: m0 });
  assert.equal(scale.code, 'SCALE'); assert.equal(scale.new_budget, 36);
  const cut = adsCall({ cfg, adsLog: [d('2026-12-01', 3), d('2026-12-02', 2.5), d('2026-12-03', 2.2)], metrics: m0 });
  assert.equal(cut.code, 'CUT'); assert.equal(cut.new_budget, 21);
  const hold = adsCall({ cfg, adsLog: [d('2026-12-01', 3.2, 30), d('2026-12-02', 3.3, 36), d('2026-12-03', 3.4, 36)], metrics: m0 });
  assert.equal(hold.code, 'HOLD');
  const under = adsCall({ cfg, adsLog: [d('2026-12-01', 2.8, 30, 30), d('2026-12-02', 2.8, 30, 10), d('2026-12-03', 2.8, 30, 12)], metrics: m0 });
  assert.equal(under.code, 'LOWER_TARGET'); assert.equal(under.new_target, 2.8);
});

test('gates use day1 offsets and any/all logic', () => {
  const metrics = { invites_total: 31, samples_sent_total: 10, videos_total: 0, orders_7d_avg: 3.2, best_video_orders: 0, profit_per_order_7d: 0 };
  const g = evaluateGates({ cfg, day1: '2026-11-26', today: '2026-12-16', metrics });
  const d7 = g.find((x) => x.id === 'D7'); const d21 = g.find((x) => x.id === 'D21');
  assert.equal(d7.date, '2026-12-02'); assert.equal(d7.status, 'fail_due');
  assert.equal(d21.date, '2026-12-16'); assert.equal(d21.status, 'pass_due');
  assert.equal(g.find((x) => x.id === 'D45').date, '2027-01-09');
});

test('metrics: 7-day window excludes today', () => {
  const kpis = Array.from({ length: 10 }, (_, i) => ({ date: addDays('2026-12-01', i), tiktok_orders: 4, shopee_orders: 1, tiktok_gmv: 160, shopee_gmv: 40, ad_spend: 20 }));
  const m = computeMetrics({ today: '2026-12-10', kpis, creators: [], ueTikTok: unitEconomics(TT), ueShopee: unitEconomics({ ...TT, commission_pct: 15, affiliate_pct: 0, ads_pct: 10 }) });
  assert.equal(m.orders_7d, 35); assert.equal(m.orders_7d_avg, 5); assert.equal(m.roas_7d, 10);
});

test('creator follow-ups at day 10 / 17 / 21 after delivery', () => {
  const base = { id: 1, handle: 'cat', status: 'sample_sent', sample_sent_at: '2026-11-27' }; // delivered ~11-30
  assert.equal(creatorFollowups({ cfg, today: '2026-12-09', creators: [base] }).length, 0);
  assert.equal(creatorFollowups({ cfg, today: '2026-12-10', creators: [base] })[0].kind, 'followup_1');
  assert.equal(creatorFollowups({ cfg, today: '2026-12-17', creators: [{ ...base, last_followup_at: '2026-12-10' }] })[0].kind, 'followup_2');
  assert.equal(creatorFollowups({ cfg, today: '2026-12-21', creators: [base] })[0].kind, 'no_response');
});

test('reorder alert at 25 days cover, air vs sea', () => {
  const inv = [{ sku: 'SLK', on_hand: 100 }, { sku: 'COMB2', on_hand: 90 }, { sku: 'COMBF', on_hand: 95 }];
  const r = reorderCheck({ cfg, today: '2026-12-10', inventory: inv, purchaseOrders: [], metrics: { orders_7d_avg: 4 } });
  assert.equal(r.kits_possible, 90); assert.equal(r.days_cover, 22.5); assert.equal(r.mode, 'air'); assert.equal(r.alert.priority, 2);
  const r2 = reorderCheck({ cfg, today: '2026-12-10', inventory: inv, purchaseOrders: [], metrics: { orders_7d_avg: 6 } });
  assert.equal(r2.mode, 'sea');
});

test('runAll produces a top action', () => {
  const out = runAll({ cfg, today: '2026-11-14', settings: {}, kpis: [], creators: [], adsLog: [], inventory: [], purchaseOrders: [], gateState: [], tasks: [{ id: 1, date: '2026-11-14', title: 'Send RFQs', done: 0 }], unitEcon: { tiktok: TT, shopee: TT } });
  assert.ok(out.top_action);
  assert.equal(out.day_number, -11);
});

test('csv: quotes, BOM, DD/MM/YYYY, header aliases', () => {
  const rows = parseCSV('﻿Order ID,Order Status,Created Time,Seller SKU,Quantity,Order Amount\n"5770001","To ship","26/11/2026 10:00",TKS-KIT3,1,"RM39.90"\n');
  const o = mapOrders(rows, 'tiktok');
  assert.equal(o[0].order_id, '5770001'); assert.equal(o[0].created_at, '2026-11-26'); assert.equal(o[0].amount, 39.9); assert.equal(o[0].sku, 'TKS-KIT3');
  assert.equal(toISODate('2026-11-26 09:00'), '2026-11-26');
});
