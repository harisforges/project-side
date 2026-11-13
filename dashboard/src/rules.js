// Rule engine: pure functions shared by the Worker (dashboard) and scripts/rules-cli.mjs (/daily etc).
// All thresholds come from config/rules.json. Dates are 'YYYY-MM-DD' strings (Malaysia time).

export const DAY_MS = 86400000;

export function todayMYT(now = Date.now()) {
  return new Date(now + 8 * 3600000).toISOString().slice(0, 10);
}
export function addDays(date, n) {
  return new Date(Date.parse(date + 'T00:00:00Z') + n * DAY_MS).toISOString().slice(0, 10);
}
export function diffDays(a, b) {
  // a - b in whole days
  return Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / DAY_MS);
}
const num = (v) => (v === null || v === undefined || v === '' || isNaN(Number(v)) ? 0 : Number(v));
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// ---------- Unit economics ----------
// a: { price, landed, commission_pct, txn_pct, psf, affiliate_pct, affiliate_share_pct, ads_pct, shipping, returns_pct }
export function unitEconomics(a) {
  const price = num(a.price);
  const pct = (k) => num(a[k]) / 100;
  const commission = price * pct('commission_pct');
  const txn = price * pct('txn_pct');
  const affiliate = price * pct('affiliate_pct') * pct('affiliate_share_pct');
  const ads = price * pct('ads_pct');
  const returns = price * pct('returns_pct');
  const fixed = num(a.landed) + num(a.psf) + num(a.shipping);
  const profit = price - commission - txn - affiliate - ads - returns - fixed;
  const contributionNoAdsNoAff = price - commission - txn - returns - fixed;
  const breakEvenRoas = contributionNoAdsNoAff > 0 ? price / contributionNoAdsNoAff : null;
  const shopAdsAff = price * 0.10;
  const breakEvenRoasShopAds =
    contributionNoAdsNoAff - shopAdsAff > 0 ? price / (contributionNoAdsNoAff - shopAdsAff) : null;
  // variable share of GMV excluding ads, and fixed cost per order — used for daily profit estimates
  const varPctExAds = pct('commission_pct') + pct('txn_pct') + pct('affiliate_pct') * pct('affiliate_share_pct') + pct('returns_pct');
  return {
    lines: {
      landed: round(num(a.landed)), commission: round(commission), txn: round(txn), psf: round(num(a.psf)),
      affiliate: round(affiliate), ads: round(ads), shipping: round(num(a.shipping)), returns: round(returns),
    },
    profit: round(profit),
    margin_pct: price ? round((profit / price) * 100, 1) : 0,
    break_even_roas: breakEvenRoas ? round(breakEvenRoas) : null,
    break_even_roas_shop_ads: breakEvenRoasShopAds ? round(breakEvenRoasShopAds) : null,
    var_pct_ex_ads: varPctExAds,
    fixed_per_order: num(a.landed) + num(a.psf) + num(a.shipping),
    orders_needed: [10000, 20000, 30000].map((t) => ({
      target: t,
      per_month: profit > 0 ? Math.ceil(t / profit) : null,
      per_day: profit > 0 ? round(t / profit / 30, 1) : null,
    })),
  };
}

// Estimated profit for one day of KPIs, using per-channel unit economics.
export function dayProfit(k, ueTikTok, ueShopee) {
  const part = (orders, gmv, ue) => gmv - gmv * ue.var_pct_ex_ads - orders * ue.fixed_per_order;
  return (
    part(num(k.tiktok_orders), num(k.tiktok_gmv), ueTikTok) +
    part(num(k.shopee_orders), num(k.shopee_gmv), ueShopee) -
    num(k.ad_spend)
  );
}

// ---------- Metrics ----------
export function computeMetrics({ today, kpis = [], creators = [], ueTikTok, ueShopee }) {
  const byDate = [...kpis].sort((a, b) => a.date.localeCompare(b.date));
  const last7 = byDate.filter((k) => diffDays(today, k.date) >= 1 && diffDays(today, k.date) <= 7);
  const orders = (k) => num(k.tiktok_orders) + num(k.shopee_orders);
  const gmv = (k) => num(k.tiktok_gmv) + num(k.shopee_gmv);
  const sum = (arr, f) => arr.reduce((s, x) => s + f(x), 0);
  const orders7 = sum(last7, orders);
  const profit7 = ueTikTok && ueShopee ? sum(last7, (k) => dayProfit(k, ueTikTok, ueShopee)) : 0;
  const spend7 = sum(last7, (k) => num(k.ad_spend));
  const statusAtLeast = (c, s) => {
    const order = ['invited', 'sample_requested', 'sample_sent', 'posted', 'top_performer'];
    return order.indexOf(c.status) >= order.indexOf(s);
  };
  return {
    orders_total: sum(byDate, orders),
    gmv_total: round(sum(byDate, gmv)),
    orders_7d: orders7,
    orders_7d_avg: round(orders7 / 7, 1),
    gmv_7d: round(sum(last7, gmv)),
    ad_spend_7d: round(spend7),
    roas_7d: spend7 > 0 ? round(sum(last7, gmv) / spend7) : null,
    profit_7d: round(profit7),
    profit_per_order_7d: orders7 > 0 ? round(profit7 / orders7) : 0,
    videos_total: Math.max(
      sum(byDate, (k) => num(k.videos_posted)),
      creators.filter((c) => statusAtLeast(c, 'posted')).length
    ),
    invites_total: creators.length,
    samples_sent_total: creators.filter((c) => c.sample_sent_at).length,
    best_video_orders: creators.reduce((m, c) => Math.max(m, num(c.best_video_orders)), 0),
    days_logged: byDate.length,
  };
}

function check(op, a, b) {
  switch (op) {
    case '>=': return a >= b;
    case '>': return a > b;
    case '<=': return a <= b;
    case '<': return a < b;
    case '==': return a === b;
    default: return false;
  }
}

// ---------- Gates ----------
export function evaluateGates({ cfg, day1, today, metrics, gateState = [] }) {
  return cfg.gates.map((g) => {
    const date = addDays(day1, g.day - 1);
    const results = g.checks.map((c) => ({ ...c, actual: metrics[c.metric] ?? 0, pass: check(c.op, metrics[c.metric] ?? 0, c.value) }));
    const pass = g.logic === 'any' ? results.some((r) => r.pass) : results.every((r) => r.pass);
    const saved = gateState.find((s) => s.id === g.id) || {};
    const daysTo = diffDays(date, today);
    let status = 'upcoming';
    if (saved.status === 'pass' || saved.status === 'fail') status = saved.status;
    else if (daysTo <= 0) status = pass ? 'pass_due' : 'fail_due';
    return { id: g.id, day: g.day, name: g.name, date, days_to: daysTo, logic: g.logic, checks: results, pass_now: pass, status, fail_action: g.fail_action, note: saved.note || '' };
  });
}

// ---------- Ads ----------
export function adsCall({ cfg, adsLog = [], metrics, gates = [] }) {
  const A = cfg.ads;
  const log = [...adsLog].filter((r) => r.date).sort((a, b) => a.date.localeCompare(b.date));
  if (!log.length || log.every((r) => !num(r.spend))) {
    const ready = metrics.orders_total >= A.start_when_orders_total || metrics.videos_total >= A.start_when_videos_total;
    return ready
      ? { code: 'START', priority: 2, message: `GMV Max start condition met (${metrics.orders_total} orders, ${metrics.videos_total} videos). Create Product GMV Max: RM${A.start_budget}/day, ROI target ${A.roi_target}.` }
      : { code: 'WAIT', priority: 9, message: `Ads not started: need ${A.start_when_orders_total} orders (now ${metrics.orders_total}) or ${A.start_when_videos_total} creator videos (now ${metrics.videos_total}).` };
  }
  const last = log[log.length - 1];
  const budget = num(last.budget) || A.start_budget;
  const target = num(last.roi_target) || A.roi_target;
  // days since last budget/target change
  let changeIdx = 0;
  for (let i = 1; i < log.length; i++) {
    if (num(log[i].budget) !== num(log[i - 1].budget) || num(log[i].roi_target) !== num(log[i - 1].roi_target)) changeIdx = i;
  }
  const daysSinceChange = log.length - 1 - changeIdx + 1;
  const tail = (n) => log.slice(-n);
  const roiOf = (r) => (num(r.roi) ? num(r.roi) : num(r.spend) ? num(r.gmv) / num(r.spend) : 0);

  const failed30 = gates.find((g) => g.id === 'D30' && (g.status === 'fail' || g.status === 'fail_due'));
  if (failed30 && budget > A.gate_fail_budget)
    return { code: 'GATE_CUT', priority: 1, message: `Day-30 gate failed → set GMV Max budget to RM${A.gate_fail_budget}/day.`, new_budget: A.gate_fail_budget };

  if (tail(A.pause_after_days).length === A.pause_after_days && tail(A.pause_after_days).every((r) => roiOf(r) < A.pause_roi))
    return { code: 'PAUSE', priority: 1, message: `ROI below ${A.pause_roi} for ${A.pause_after_days} days → PAUSE GMV Max. Restart at RM${A.start_budget}/day after 5 new creator videos.` };

  const cutN = A.cut_after_days_below_floor;
  if (tail(cutN).length === cutN && tail(cutN).every((r) => roiOf(r) < A.roi_floor)) {
    const nb = Math.max(1, Math.round(budget * (1 - A.cut_pct / 100)));
    return { code: 'CUT', priority: 1, message: `ROI below floor ${A.roi_floor} for ${cutN} days → cut budget ${A.cut_pct}%: RM${budget} → RM${nb}/day.`, new_budget: nb };
  }

  if (daysSinceChange < A.min_days_between_changes)
    return { code: 'HOLD', priority: 6, message: `Hold GMV Max at RM${budget}/day, ROI target ${target} (changed ${daysSinceChange} day(s) ago; wait ${A.min_days_between_changes}).` };

  const upN = A.scale_up_after_days_at_target;
  if (tail(upN).length === upN && tail(upN).every((r) => roiOf(r) >= A.roi_target)) {
    const nb = Math.round(budget * (1 + A.scale_up_pct / 100));
    return { code: 'SCALE', priority: 2, message: `ROI ≥ ${A.roi_target} for ${upN} days → raise GMV Max budget to RM${nb}/day (+${A.scale_up_pct}%).`, new_budget: nb };
  }

  const usN = A.underspend_days;
  if (tail(usN).length === usN && tail(usN).every((r) => num(r.spend) < A.underspend_ratio * (num(r.budget) || budget))) {
    const nt = Math.max(A.roi_floor, round(target - A.underspend_target_step, 1));
    if (nt < target)
      return { code: 'LOWER_TARGET', priority: 3, message: `Budget under-spending for ${usN} days → lower ROI target ${target} → ${nt} (never below ${A.roi_floor}).`, new_target: nt };
  }
  return { code: 'HOLD', priority: 6, message: `Hold GMV Max at RM${budget}/day, ROI target ${target}. Last ROI ${round(roiOf(last))}.` };
}

// ---------- Creators ----------
export function creatorFollowups({ cfg, today, creators = [] }) {
  const C = cfg.creators;
  const out = [];
  for (const c of creators) {
    if (!c.sample_sent_at || ['posted', 'top_performer', 'no_response'].includes(c.status)) continue;
    const delivered = c.sample_delivered_at || addDays(c.sample_sent_at, C.delivery_days_assumed);
    const age = diffDays(today, delivered);
    const lastFu = c.last_followup_at;
    if (age >= C.no_response_days_after_delivery) {
      out.push({ id: c.id, handle: c.handle, kind: 'no_response', due: addDays(delivered, C.no_response_days_after_delivery), message: `@${c.handle}: ${age} days since sample delivery, no post → mark "No response", no more samples.` });
    } else if (age >= C.followup_2_days_after_delivery && (!lastFu || diffDays(lastFu, delivered) < C.followup_2_days_after_delivery)) {
      out.push({ id: c.id, handle: c.handle, kind: 'followup_2', due: addDays(delivered, C.followup_2_days_after_delivery), message: `@${c.handle}: send follow-up #2 (day ${age}).` });
    } else if (age >= C.followup_1_days_after_delivery && !lastFu) {
      out.push({ id: c.id, handle: c.handle, kind: 'followup_1', due: addDays(delivered, C.followup_1_days_after_delivery), message: `@${c.handle}: send follow-up #1 (day ${age}).` });
    }
  }
  return out;
}

// ---------- Inventory / reorder ----------
export function reorderCheck({ cfg, today, inventory = [], purchaseOrders = [], metrics }) {
  const I = cfg.inventory;
  const onHand = (sku) => num((inventory.find((r) => r.sku === sku) || {}).on_hand);
  const kitsPossible = Math.min(...Object.entries(I.components_per_kit).map(([sku, n]) => Math.floor(onHand(sku) / n)));
  const rate = Math.max(metrics.orders_7d_avg, 0);
  const daysCover = rate > 0 ? round(kitsPossible / rate, 1) : null;
  const open = purchaseOrders.filter((p) => !['received', 'cancelled'].includes(p.status));
  const incomingKits = open.reduce((s, p) => s + num(p.qty_kits), 0);
  const mode = metrics.orders_7d_avg >= I.sea_switch_when_orders_7d_avg ? 'sea' : 'air';
  const lead = mode === 'sea' ? I.sea_lead_days : I.air_lead_days;
  const needKits = Math.max(0, Math.ceil(rate * (lead + I.cover_target_days_after_arrival) * (1 + I.spare_pct / 100) - kitsPossible - incomingKits));
  const daysToCnyCutoff = diffDays(I.last_sea_order_before_cny, today);
  let alert = null;
  if (daysCover !== null && daysCover <= I.air_top_up_below_days_cover && incomingKits === 0)
    alert = { priority: 1, message: `Stock covers only ${daysCover} days (${kitsPossible} kits). Air top-up now (air top-up reserve). Run /reorder.` };
  else if (daysCover !== null && daysCover <= I.reorder_at_days_cover && incomingKits === 0)
    alert = { priority: 2, message: `Reorder: ${daysCover} days of cover left (≤ ${I.reorder_at_days_cover}). Suggested ${needKits} kits by ${mode}. Run /reorder.` };
  else if (daysToCnyCutoff >= 0 && daysToCnyCutoff <= 14)
    alert = { priority: 3, message: `CNY: last sea order must be paid by ${I.last_sea_order_before_cny} (${daysToCnyCutoff} days). Run /reorder.` };
  return {
    kits_possible: kitsPossible, components: Object.keys(I.components_per_kit).map((sku) => ({ sku, on_hand: onHand(sku) })),
    orders_per_day: rate, days_cover: daysCover, incoming_kits: incomingKits, mode, lead_days: lead,
    suggested_kits: needKits, cny_cutoff: I.last_sea_order_before_cny, alert,
  };
}

// ---------- Today ----------
export function runAll(input) {
  const { cfg, today, settings = {}, kpis, creators, adsLog, inventory, purchaseOrders, gateState, tasks = [], unitEcon = {} } = input;
  const day1 = settings.day1 || cfg.launch.day1_default;
  const ueTikTok = unitEconomics(unitEcon.tiktok || {});
  const ueShopee = unitEconomics(unitEcon.shopee || {});
  const metrics = computeMetrics({ today, kpis, creators, ueTikTok, ueShopee });
  const gates = evaluateGates({ cfg, day1, today, metrics, gateState });
  const ads = adsCall({ cfg, adsLog, metrics, gates });
  const followups = creatorFollowups({ cfg, today, creators });
  const reorder = reorderCheck({ cfg, today, inventory, purchaseOrders, metrics });
  const dayNumber = diffDays(today, day1) + 1;

  const calls = [];
  for (const g of gates) {
    if (g.status === 'fail_due') calls.push({ priority: 1, area: 'gate', message: `${g.name} (${g.date}) FAILED → ${g.fail_action}` });
    else if (g.status === 'pass_due') calls.push({ priority: 4, area: 'gate', message: `${g.name} (${g.date}) PASSED. Record it on the Goals page.` });
    else if (g.status === 'upcoming' && g.days_to <= cfg.gate_warning_days)
      calls.push({ priority: 3, area: 'gate', message: `${g.name} in ${g.days_to} day(s) (${g.date}). Now: ${g.checks.map((c) => `${c.label} → ${c.actual}${c.pass ? ' ✓' : ' ✗'}`).join('; ')}` });
  }
  if (reorder.alert) calls.push({ area: 'stock', ...reorder.alert });
  if (ads.code !== 'WAIT') calls.push({ priority: ads.priority, area: 'ads', message: ads.message });
  for (const f of followups) calls.push({ priority: f.kind === 'no_response' ? 5 : 3, area: 'creators', message: f.message });

  // Weekly creator quota
  const weekAgo = addDays(today, -7);
  const invites7 = creators.filter((c) => c.invited_at && c.invited_at > weekAgo).length;
  if (dayNumber >= 1 && dayNumber <= 60 && invites7 < cfg.creators.weekly_invite_target)
    calls.push({ priority: 4, area: 'creators', message: `Invites this week: ${invites7}/${cfg.creators.weekly_invite_target}. Send ${Math.min(10, cfg.creators.weekly_invite_target - invites7)} targeted invites today.` });

  const todaysTasks = tasks.filter((t) => !t.done && t.date <= today).sort((a, b) => a.date.localeCompare(b.date));
  for (const t of todaysTasks.slice(0, 5))
    calls.push({ priority: t.date < today ? 2 : 3, area: 'timeline', message: `${t.date < today ? 'OVERDUE ' : ''}${t.title}` });

  if (!kpis.some((k) => k.date === addDays(today, -1)) && dayNumber > 1)
    calls.push({ priority: 2, area: 'data', message: `Yesterday's KPIs not logged. Enter them on the KPI page (2 min).` });

  calls.sort((a, b) => a.priority - b.priority);
  return { today, day1, day_number: dayNumber, metrics, gates, ads, followups, reorder, unit_economics: { tiktok: ueTikTok, shopee: ueShopee }, calls, top_action: calls[0] || null };
}
