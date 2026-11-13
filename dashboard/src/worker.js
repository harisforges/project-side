import cfg from '../config/rules.json';
import { runAll, todayMYT } from './rules.js';
import { parseCSV, mapOrders, mapKpis, mapCreators } from './csv.js';
import { checkAccess } from './access.js';

// Whitelisted tables: primary key + writable columns. Anything else is rejected.
const TABLES = {
  settings: { pk: ['key'], cols: ['key', 'value'] },
  daily_kpis: { pk: ['date'], cols: ['date', 'tiktok_orders', 'shopee_orders', 'tiktok_gmv', 'shopee_gmv', 'ad_spend', 'videos_posted', 'sample_requests', 'stock_kits', 'notes'] },
  orders: { pk: ['platform', 'order_id', 'sku'], cols: ['platform', 'order_id', 'sku', 'created_at', 'status', 'product', 'variation', 'qty', 'amount', 'creator', 'packed'] },
  creators: { pk: ['id'], auto: true, cols: ['id', 'handle', 'followers', 'profile_url', 'status', 'invited_at', 'sample_requested_at', 'sample_sent_at', 'sample_delivered_at', 'posted_at', 'last_followup_at', 'orders', 'best_video_orders', 'gmv', 'tier', 'commission', 'notes'] },
  inventory: { pk: ['sku'], cols: ['sku', 'name', 'on_hand', 'updated_at'] },
  purchase_orders: { pk: ['id'], auto: true, cols: ['id', 'created_at', 'supplier', 'items', 'qty_kits', 'cost_rm', 'mode', 'status', 'eta', 'received_at', 'notes'] },
  suppliers: { pk: ['id'], auto: true, cols: ['id', 'name', 'item', 'url', 'score', 'unit_price_cny', 'role', 'notes'] },
  qc_log: { pk: ['id'], auto: true, cols: ['id', 'date', 'batch', 'item', 'checked', 'failed', 'notes'] },
  ads_log: { pk: ['date'], cols: ['date', 'spend', 'gmv', 'roi', 'budget', 'roi_target', 'notes'] },
  cash: { pk: ['id'], auto: true, cols: ['id', 'date', 'category', 'description', 'amount', 'status', 'platform'] },
  budget_plan: { pk: ['category'], cols: ['category', 'planned', 'notes'] },
  tasks: { pk: ['id'], auto: true, cols: ['id', 'date', 'title', 'phase', 'decision', 'done'] },
  events: { pk: ['id'], auto: true, cols: ['id', 'date', 'end_date', 'title', 'type'] },
  gate_results: { pk: ['id'], cols: ['id', 'status', 'note', 'recorded_at'] },
  monthly_close: { pk: ['month'], cols: ['month', 'revenue', 'profit', 'stock_reserve', 'notes', 'closed_at'] },
  decisions: { pk: ['num'], cols: ['num', 'date', 'title', 'status', 'confidence', 'outcome', 'worked'] },
  unit_econ: { pk: ['channel'], cols: ['channel', 'price', 'landed', 'commission_pct', 'txn_pct', 'psf', 'affiliate_pct', 'affiliate_share_pct', 'ads_pct', 'shipping', 'returns_pct', 'notes'] },
};

const json = (data, status = 200, headers = {}) =>
  new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...headers } });

async function all(db, table, order = '') {
  const { results } = await db.prepare(`SELECT * FROM ${table}${order ? ' ORDER BY ' + order : ''}`).all();
  return results;
}

async function loadState(db) {
  const [settingsRows, kpis, orders, creators, inventory, pos, suppliers, qc, ads, cash, budget, tasks, events, gates, closes, decisions, ue] = await Promise.all([
    all(db, 'settings'), all(db, 'daily_kpis', 'date'), all(db, 'orders', 'created_at DESC LIMIT 500'), all(db, 'creators', 'id DESC'),
    all(db, 'inventory', 'sku'), all(db, 'purchase_orders', 'id DESC'), all(db, 'suppliers', 'id'), all(db, 'qc_log', 'date DESC'),
    all(db, 'ads_log', 'date'), all(db, 'cash', 'date DESC, id DESC'), all(db, 'budget_plan'), all(db, 'tasks', 'date, id'),
    all(db, 'events', 'date'), all(db, 'gate_results'), all(db, 'monthly_close', 'month'), all(db, 'decisions', 'num'), all(db, 'unit_econ'),
  ]);
  const settings = Object.fromEntries(settingsRows.map((r) => [r.key, r.value]));
  const unitEcon = Object.fromEntries(ue.map((r) => [r.channel, r]));
  return { settings, kpis, orders, creators, inventory, purchase_orders: pos, suppliers, qc_log: qc, ads_log: ads, cash, budget_plan: budget, tasks, events, gate_results: gates, monthly_close: closes, decisions, unit_econ: unitEcon };
}

function compute(state, today) {
  return runAll({
    cfg, today, settings: state.settings, kpis: state.kpis, creators: state.creators, adsLog: state.ads_log,
    inventory: state.inventory, purchaseOrders: state.purchase_orders, gateState: state.gate_results,
    tasks: state.tasks, unitEcon: state.unit_econ,
  });
}

function upsertStmt(db, table, row) {
  const t = TABLES[table];
  const cols = t.cols.filter((c) => row[c] !== undefined && !(t.auto && c === 'id' && (row.id === null || row.id === '')));
  if (!cols.length) throw new Error('no valid columns');
  const updates = cols.filter((c) => !t.pk.includes(c));
  const conflict = t.auto && row.id == null ? '' :
    ` ON CONFLICT(${t.pk.join(',')}) DO ${updates.length ? 'UPDATE SET ' + updates.map((c) => `${c}=excluded.${c}`).join(',') : 'NOTHING'}`;
  const sql = `INSERT INTO ${table} (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')})${conflict}`;
  return db.prepare(sql).bind(...cols.map((c) => (row[c] === '' ? null : row[c])));
}

async function handleApi(request, env, url) {
  const db = env.DB;
  const parts = url.pathname.replace(/^\/api\/?/, '').split('/').filter(Boolean);
  const method = request.method;
  const today = url.searchParams.get('today') || todayMYT();

  if (parts[0] === 'state' && method === 'GET') {
    const state = await loadState(db);
    return json({ state, computed: compute(state, today), config: cfg });
  }

  if (parts[0] === 'export' && method === 'GET') {
    const out = { exported_at: new Date().toISOString(), version: 1, tables: {} };
    for (const t of Object.keys(TABLES)) out.tables[t] = await all(db, t);
    return json(out, 200, { 'content-disposition': `attachment; filename="takusut-backup-${today}.json"` });
  }

  if (parts[0] === 'restore' && method === 'POST') {
    const body = await request.json();
    if (!body || !body.tables) return json({ error: 'not a backup file' }, 400);
    const stmts = [];
    for (const [t, rows] of Object.entries(body.tables)) {
      if (!TABLES[t] || !Array.isArray(rows)) continue;
      stmts.push(db.prepare(`DELETE FROM ${t}`));
      for (const r of rows) stmts.push(upsertStmt(db, t, r));
    }
    await db.batch(stmts);
    return json({ ok: true, statements: stmts.length });
  }

  if (parts[0] === 'import' && method === 'POST') {
    const kind = parts[1];
    const rows = parseCSV(await request.text());
    let mapped = [], table;
    if (kind === 'tiktok-orders' || kind === 'shopee-orders') { mapped = mapOrders(rows, kind.split('-')[0]); table = 'orders'; }
    else if (kind === 'kpis') { mapped = mapKpis(rows); table = 'daily_kpis'; }
    else if (kind === 'creators') { mapped = mapCreators(rows); table = 'creators'; }
    else return json({ error: 'unknown import kind' }, 400);
    if (!mapped.length) return json({ error: 'No rows recognised. Check the header names (see README → CSV import).', headers: rows[0] ? Object.keys(rows[0]) : [] }, 400);
    if (table === 'creators') {
      const stmts = mapped.map((m) => {
        const cols = Object.keys(m).filter((c) => m[c] !== null && m[c] !== undefined);
        return db.prepare(`INSERT INTO creators (${cols.join(',')}) VALUES (${cols.map(() => '?').join(',')}) ON CONFLICT(handle) DO UPDATE SET ${cols.filter((c) => c !== 'handle').map((c) => `${c}=excluded.${c}`).join(',')}`).bind(...cols.map((c) => m[c]));
      });
      await db.batch(stmts);
    } else {
      await db.batch(mapped.map((m) => upsertStmt(db, table, m)));
    }
    let rolled = 0;
    if (table === 'orders') rolled = await rollupOrdersToKpis(db, mapped);
    return json({ ok: true, imported: mapped.length, kpi_days_updated: rolled });
  }

  const table = parts[0];
  if (!TABLES[table]) return json({ error: 'unknown endpoint' }, 404);
  if (method === 'POST') {
    const body = await request.json();
    const rows = Array.isArray(body) ? body : [body];
    const res = await db.batch(rows.map((r) => upsertStmt(db, table, r)));
    return json({ ok: true, id: res[0]?.meta?.last_row_id });
  }
  if (method === 'DELETE') {
    const t = TABLES[table];
    const keyVals = parts.slice(1).map(decodeURIComponent);
    if (keyVals.length !== t.pk.length) return json({ error: 'need primary key' }, 400);
    await db.prepare(`DELETE FROM ${table} WHERE ${t.pk.map((k) => `${k}=?`).join(' AND ')}`).bind(...keyVals).run();
    return json({ ok: true });
  }
  if (method === 'GET') return json(await all(db, table));
  return json({ error: 'method not allowed' }, 405);
}

// After an order CSV import: recompute that platform's orders + GMV per day from the orders table
// (excluding cancelled), so the KPI page stays consistent. Manual fields (ads, videos) are untouched.
async function rollupOrdersToKpis(db, mapped) {
  const platform = mapped[0].platform;
  const dates = [...new Set(mapped.map((m) => m.created_at).filter(Boolean))];
  if (!dates.length) return 0;
  const o = platform === 'tiktok' ? 'tiktok_orders' : 'shopee_orders';
  const g = platform === 'tiktok' ? 'tiktok_gmv' : 'shopee_gmv';
  const stmts = dates.map((d) =>
    db.prepare(
      `INSERT INTO daily_kpis (date, ${o}, ${g})
       SELECT ?, COUNT(DISTINCT order_id), COALESCE(SUM(amount),0) FROM orders
       WHERE platform=? AND created_at=? AND LOWER(COALESCE(status,'')) NOT LIKE '%cancel%' AND LOWER(COALESCE(status,'')) NOT LIKE '%batal%'
       ON CONFLICT(date) DO UPDATE SET ${o}=excluded.${o}, ${g}=excluded.${g}`
    ).bind(d, platform, d)
  );
  await db.batch(stmts);
  return dates.length;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const auth = await checkAccess(request, env);
    if (!auth.ok) return new Response(`Forbidden: ${auth.reason}`, { status: 403 });
    if (url.pathname.startsWith('/api/')) {
      try {
        return await handleApi(request, env, url);
      } catch (e) {
        return json({ error: String(e.message || e) }, 500);
      }
    }
    return env.ASSETS.fetch(request);
  },
};
