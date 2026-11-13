/* Takusut ops dashboard — vanilla JS, no build step. */
const TABS = [
  ['today', 'Today'], ['timeline', 'Timeline'], ['goals', 'Goals'], ['kpi', 'KPIs'], ['unit', 'Unit economics'],
  ['creators', 'Creators'], ['inventory', 'Inventory'], ['ads', 'Ads'], ['budget', 'Budget & cash'],
  ['close', 'Monthly close'], ['decisions', 'Decisions'], ['data', 'Data & settings'],
];
let S = null; // { state, computed, config }
let current = (location.hash || '#today').slice(1);
const charts = [];

// ---------- helpers ----------
const $ = (sel, root = document) => root.querySelector(sel);
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const n = (v) => (v === null || v === undefined || v === '' || isNaN(+v) ? 0 : +v);
const rm = (v, d = 2) => 'RM' + n(v).toLocaleString('en-MY', { minimumFractionDigits: d, maximumFractionDigits: d });
const fmt = (v, d = 0) => n(v).toLocaleString('en-MY', { maximumFractionDigits: d });
const todayMYT = () => new Date(Date.now() + 8 * 3600000).toISOString().slice(0, 10);
const addDays = (d, k) => new Date(Date.parse(d + 'T00:00:00Z') + k * 864e5).toISOString().slice(0, 10);
const diffDays = (a, b) => Math.round((Date.parse(a + 'T00:00:00Z') - Date.parse(b + 'T00:00:00Z')) / 864e5);

function toast(msg) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast._t); toast._t = setTimeout(() => t.classList.remove('show'), 2200);
}
async function api(path, opts = {}) {
  const res = await fetch('/api/' + path, opts);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}
const post = (table, body) => api(table, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
const del = (table, ...keys) => api(`${table}/${keys.map(encodeURIComponent).join('/')}`, { method: 'DELETE' });

async function load() {
  S = await api('state');
  render();
}
async function save(table, body, msg = 'Saved') {
  try { await post(table, body); toast(msg); await load(); } catch (e) { toast('Error: ' + e.message); }
}
function formData(form) {
  const o = {};
  for (const el of form.elements) {
    if (!el.name) continue;
    if (el.type === 'checkbox') o[el.name] = el.checked ? 1 : 0;
    else if (el.value !== '') o[el.name] = el.type === 'number' ? +el.value : el.value;
  }
  return o;
}
function field(name, label, { type = 'text', value = '', step = 'any', options = null, required = false } = {}) {
  if (options) {
    return `<label>${esc(label)}<select name="${name}">${options.map((o) => {
      const [v, t] = Array.isArray(o) ? o : [o, o];
      return `<option value="${esc(v)}" ${String(v) === String(value) ? 'selected' : ''}>${esc(t)}</option>`;
    }).join('')}</select></label>`;
  }
  return `<label>${esc(label)}<input name="${name}" type="${type}" ${type === 'number' ? `step="${step}"` : ''} value="${esc(value)}" ${required ? 'required' : ''}></label>`;
}
function table(cols, rows, { empty = 'Nothing yet.' } = {}) {
  if (!rows.length) return `<p class="muted">${esc(empty)}</p>`;
  return `<div class="table-wrap"><table><thead><tr>${cols.map((c) => `<th class="${c.num ? 'num' : ''}">${esc(c.label)}</th>`).join('')}</tr></thead><tbody>${rows
    .map((r) => `<tr>${cols.map((c) => `<td class="${c.num ? 'num' : ''}">${c.html ? c.html(r) : esc(c.fmt ? c.fmt(r[c.key], r) : r[c.key] ?? '')}</td>`).join('')}</tr>`)
    .join('')}</tbody></table></div>`;
}
function stat(label, value, sub = '') {
  return `<div class="card stat"><div class="label">${esc(label)}</div><div class="value">${esc(value)}</div>${sub ? `<div class="sub">${esc(sub)}</div>` : ''}</div>`;
}
function bindForm(id, handler) {
  const f = document.getElementById(id);
  if (f) f.addEventListener('submit', async (e) => { e.preventDefault(); await handler(formData(f), f); });
}
function onClick(selector, handler) {
  document.querySelectorAll(selector).forEach((b) => b.addEventListener('click', () => handler(b.dataset, b)));
}
function destroyCharts() { while (charts.length) charts.pop().destroy(); }
function css(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
function lineChart(canvasId, labels, datasets, yLabel) {
  if (!window.Chart) return;
  const el = document.getElementById(canvasId);
  if (!el) return;
  charts.push(new Chart(el, {
    type: 'line',
    data: { labels, datasets: datasets.map((d) => ({ tension: 0.25, pointRadius: 2, borderWidth: 2, fill: false, ...d })) },
    options: {
      responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
      plugins: { legend: { labels: { color: css('--muted'), boxWidth: 12 } } },
      scales: {
        x: { ticks: { color: css('--muted'), maxTicksLimit: 8 }, grid: { color: css('--line') } },
        y: { beginAtZero: true, title: { display: !!yLabel, text: yLabel, color: css('--muted') }, ticks: { color: css('--muted') }, grid: { color: css('--line') } },
      },
    },
  }));
}

// ---------- shell ----------
function renderTabs() {
  $('#tabs').innerHTML = TABS.map(([id, label]) => `<button data-tab="${id}" ${id === current ? 'aria-current="page"' : ''}>${label}</button>`).join('');
  onClick('#tabs button', (d) => { current = d.tab; location.hash = current; render(); window.scrollTo(0, 0); });
}
function render() {
  destroyCharts();
  renderTabs();
  const c = S.computed;
  $('#dayinfo').innerHTML = `${esc(c.today)} · ${c.day_number >= 1 ? `<strong>Day ${c.day_number}</strong>` : `${1 - c.day_number} days to launch`}`;
  const fn = VIEWS[current] || VIEWS.today;
  $('#view').innerHTML = fn.html();
  fn.bind && fn.bind();
  fn.charts && fn.charts();
}

// ---------- views ----------
const VIEWS = {};

VIEWS.today = {
  html() {
    const { computed: c, state: s } = S;
    const m = c.metrics, r = c.reorder;
    const toPack = s.orders.filter((o) => !o.packed && !/cancel|batal|complete|deliver|shipped|selesai|dihantar|in transit/i.test(o.status || ''));
    const tasks = s.tasks.filter((t) => !t.done && t.date <= c.today);
    return `
      <div class="card hero"><div class="label muted small">Most important action today</div>
        <div class="value">${esc(c.top_action ? c.top_action.message : 'Nothing urgent. Log yesterday\'s KPIs and send 10 creator invites.')}</div></div>
      <h2>Numbers</h2>
      <div class="grid">
        ${stat('Orders/day (7-day avg)', fmt(m.orders_7d_avg, 1), `${m.orders_7d} orders last 7 days`)}
        ${stat('Est. profit (7 days)', rm(m.profit_7d, 0), `${rm(m.profit_per_order_7d)} / order`)}
        ${stat('Blended ROAS (7d)', m.roas_7d ?? '–', `target ${S.config.kpi_targets.roas_target} · floor ${S.config.kpi_targets.roas_floor}`)}
        ${stat('Kits in stock', fmt(r.kits_possible), r.days_cover === null ? 'no sales rate yet' : `${r.days_cover} days of cover`)}
        ${stat('Creators', fmt(m.invites_total), `${m.samples_sent_total} samples · ${m.videos_total} videos`)}
      </div>
      <h2>Rule-engine calls</h2>
      ${c.calls.length ? `<ul class="calls">${c.calls.slice(0, 12).map((x) => `<li class="p${x.priority}"><span class="tag">${esc(x.area)}</span><span>${esc(x.message)}</span></li>`).join('')}</ul>` : '<p class="muted">No calls.</p>'}
      <h2>Orders to pack (${toPack.length})</h2>
      ${table([
        { label: 'Platform', key: 'platform' }, { label: 'Order', key: 'order_id' }, { label: 'Variation', html: (o) => esc(o.variation || o.sku) },
        { label: 'Qty', key: 'qty', num: true }, { label: 'Status', key: 'status' },
        { label: '', html: (o) => `<button class="link" data-pack="${esc(o.platform)}|${esc(o.order_id)}|${esc(o.sku)}">Packed ✓</button>` },
      ], toPack.slice(0, 50), { empty: 'No unpacked orders imported. Import the "To ship" order export on Data & settings, or pack straight from Seller Center.' })}
      <h2>Creator follow-ups due</h2>
      ${table([
        { label: 'Creator', html: (f) => '@' + esc(f.handle) }, { label: 'What', key: 'kind' }, { label: 'Due', key: 'due' },
        { label: '', html: (f) => f.kind === 'no_response'
          ? `<button class="link" data-noresp="${f.id}">Mark no response</button>`
          : `<button class="link" data-fu="${f.id}">Sent ✓</button>` },
      ], c.followups, { empty: 'None due.' })}
      <p class="small muted">Follow-up texts: decisions/07-affiliate-program.md.</p>
      <h2>Today's tasks</h2>
      ${tasks.length ? `<ul class="calls">${tasks.map((t) => `<li><input type="checkbox" data-task="${t.id}" aria-label="done"><span>${t.date < c.today ? '<strong class="fail">Overdue</strong> ' : ''}${esc(t.title)} <span class="muted small">(${esc(t.date)}${t.decision ? ' · decision ' + esc(t.decision) : ''})</span></span></li>`).join('')}</ul>` : '<p class="muted">No open tasks.</p>'}
    `;
  },
  bind() {
    onClick('[data-pack]', async (d) => { const [platform, order_id, sku] = d.pack.split('|'); await save('orders', { platform, order_id, sku, packed: 1 }, 'Packed'); });
    onClick('[data-fu]', async (d) => save('creators', { id: +d.fu, handle: S.state.creators.find((c) => c.id === +d.fu).handle, last_followup_at: S.computed.today }, 'Follow-up logged'));
    onClick('[data-noresp]', async (d) => save('creators', { id: +d.noresp, handle: S.state.creators.find((c) => c.id === +d.noresp).handle, status: 'no_response' }, 'Marked no response'));
    document.querySelectorAll('[data-task]').forEach((cb) => cb.addEventListener('change', async () => {
      const t = S.state.tasks.find((x) => x.id === +cb.dataset.task); await save('tasks', { ...t, done: 1 }, 'Task done');
    }));
  },
};

VIEWS.timeline = {
  html() {
    const { state: s, computed: c } = S;
    const start = '2026-11-13', end = '2027-03-15';
    const span = diffDays(end, start);
    const pos = (d) => Math.max(0, Math.min(100, (diffDays(d, start) / span) * 100));
    const todayLeft = pos(c.today);
    const row = (title, from, to, cls) => `<div class="tl-row"><div>${esc(title)} <span class="muted small">${esc(from.slice(5))}${to && to !== from ? '–' + esc(to.slice(5)) : ''}</span></div>
      <div class="tl-track"><span class="tl-seg tl-${cls}" style="left:${pos(from)}%;width:${Math.max(0.6, pos(addDays(to || from, 1)) - pos(from))}%"></span><span class="tl-today" style="left:${todayLeft}%"></span></div></div>`;
    const rows = [
      ...s.events.map((e) => ({ t: e.title, a: e.date, b: e.end_date, k: e.type })),
      ...c.gates.map((g) => ({ t: `${g.name}${g.status.startsWith('pass') ? ' ✓' : g.status.startsWith('fail') ? ' ✗' : ''}`, a: g.date, b: g.date, k: 'gate' })),
    ].sort((x, y) => x.a.localeCompare(y.a));
    const groups = ['Build', 'Phase 1', 'Phase 2', 'Phase 3', ''];
    return `
      <h2>90-day timeline</h2>
      <p class="small muted">Day 1 = ${esc(c.day1)} (change on Data & settings if stock arrives late; gates move with it). Line = today.
       Colours: <span class="tag" style="background:var(--accent);color:#fff">phase</span> <span class="tag" style="background:var(--info);color:#fff">campaign</span>
       <span class="tag" style="background:var(--good);color:#fff">payday</span> <span class="tag" style="background:var(--warn);color:#fff">holiday</span> <span class="tag" style="background:var(--bad);color:#fff">gate</span></p>
      <div class="card timeline">${rows.map((r) => row(r.t, r.a, r.b, r.k)).join('')}</div>
      <h2>Build plan & tasks</h2>
      ${groups.map((g) => {
        const ts = s.tasks.filter((t) => (t.phase || '') === g);
        if (!ts.length) return '';
        return `<h3>${esc(g || 'Other')}</h3><ul class="calls">${ts.map((t) => `<li><input type="checkbox" data-task="${t.id}" ${t.done ? 'checked' : ''} aria-label="done">
          <span class="${t.done ? 'done' : ''}">${esc(t.title)} <span class="muted small">${esc(t.date)}${t.decision ? ' · ' + esc(t.decision) : ''}</span></span></li>`).join('')}</ul>`;
      }).join('')}
      <h3>Add task</h3>
      <form id="f-task" class="entry">${field('date', 'Date', { type: 'date', value: c.today })}${field('title', 'Task', { required: true })}
        ${field('phase', 'Phase', { options: groups })}<button class="primary">Add</button></form>`;
  },
  bind() {
    document.querySelectorAll('[data-task]').forEach((cb) => cb.addEventListener('change', async () => {
      const t = S.state.tasks.find((x) => x.id === +cb.dataset.task); await save('tasks', { ...t, done: cb.checked ? 1 : 0 });
    }));
    bindForm('f-task', (d) => save('tasks', d, 'Task added'));
  },
};

VIEWS.goals = {
  html() {
    const { computed: c, config: cfg, state: s } = S;
    const m = c.metrics;
    const tgt = cfg.kpi_targets.orders_per_day.find((t) => c.day_number >= t.from_day && c.day_number <= t.to_day) || cfg.kpi_targets.orders_per_day[0];
    const month = c.today.slice(0, 7);
    const ue = c.unit_economics;
    const mtd = s.kpis.filter((k) => k.date.startsWith(month));
    const profitMtd = mtd.reduce((sum, k) => sum + dayProfit(k, ue), 0);
    const daysIn = new Date(+month.slice(0, 4), +month.slice(5, 7), 0).getDate();
    const runRate = mtd.length ? (profitMtd / mtd.length) * daysIn : 0;
    return `
      <h2>Targets vs actual</h2>
      <div class="grid">
        ${stat('Orders/day (7d avg)', fmt(m.orders_7d_avg, 1), `target ${tgt.target}/day (days ${tgt.from_day}–${tgt.to_day})`)}
        ${stat('Profit this month (est.)', rm(profitMtd, 0), `run-rate ${rm(runRate, 0)} / month`)}
        ${stat('Profit/order (7d)', rm(m.profit_per_order_7d), 'after ads, estimated')}
        ${stat('GMV total', rm(m.gmv_total, 0), `${fmt(m.orders_total)} orders`)}
      </div>
      <h3>Monthly profit run-rate vs goals</h3>
      <div class="card">${cfg.kpi_targets.profit_goals_monthly.map((g) => `<div class="row small" style="justify-content:space-between"><span>RM${fmt(g)}</span><span>${fmt(Math.max(0, (runRate / g) * 100))}%</span></div>
        <div class="bar" style="margin-bottom:10px"><i style="width:${Math.max(0, Math.min(100, (runRate / g) * 100))}%"></i></div>`).join('')}
        <p class="small muted">Run-rate = month-to-date estimated profit ÷ days logged × days in month. Estimates use the Unit economics assumptions.</p></div>
      <h2>Gates</h2>
      ${c.gates.map((g) => `<div class="card" style="margin-bottom:10px">
        <div class="row" style="justify-content:space-between"><strong>${esc(g.name)}</strong><span class="small muted">${esc(g.date)} · ${g.days_to > 0 ? `in ${g.days_to} days` : g.days_to === 0 ? 'today' : `${-g.days_to} days ago`}</span></div>
        <div class="small">Status: <span class="${g.status.startsWith('pass') ? 'pass' : g.status.startsWith('fail') ? 'fail' : 'muted'}">${esc(g.status.replace('_due', ' (not recorded)'))}</span> · needs ${g.logic === 'any' ? 'any one' : 'all'} of:</div>
        <ul class="small">${g.checks.map((ch) => `<li>${esc(ch.label)}: <strong>${esc(ch.actual)}</strong> ${ch.pass ? '<span class="pass">✓</span>' : '<span class="fail">✗</span>'}</li>`).join('')}</ul>
        <div class="small muted">If it fails: ${esc(g.fail_action)}</div>
        ${g.days_to <= 0 ? `<div class="row" style="margin-top:8px"><button class="ghost" data-gate="${g.id}" data-st="pass">Record PASS</button><button class="ghost" data-gate="${g.id}" data-st="fail">Record FAIL</button></div>` : ''}
        ${g.note ? `<div class="small">Note: ${esc(g.note)}</div>` : ''}</div>`).join('')}`;
  },
  bind() {
    onClick('[data-gate]', (d) => save('gate_results', { id: d.gate, status: d.st, recorded_at: S.computed.today }, `Gate ${d.gate}: ${d.st}`));
  },
};

function dayProfit(k, ue) {
  const part = (o, g, u) => g - g * u.var_pct_ex_ads - o * u.fixed_per_order;
  return part(n(k.tiktok_orders), n(k.tiktok_gmv), ue.tiktok) + part(n(k.shopee_orders), n(k.shopee_gmv), ue.shopee) - n(k.ad_spend);
}

VIEWS.kpi = {
  html() {
    const { state: s, computed: c } = S;
    const y = addDays(c.today, -1);
    const ex = s.kpis.find((k) => k.date === y) || {};
    const rows = [...s.kpis].reverse().slice(0, 30);
    return `
      <h2>Daily entry</h2>
      <p class="small muted">Enter yesterday's totals from Seller Center (2 minutes). Re-entering a date overwrites it.</p>
      <form id="f-kpi" class="entry card">
        ${field('date', 'Date', { type: 'date', value: y, required: true })}
        ${field('tiktok_orders', 'TikTok orders', { type: 'number', step: 1, value: ex.tiktok_orders ?? '' })}
        ${field('tiktok_gmv', 'TikTok GMV (RM)', { type: 'number', value: ex.tiktok_gmv ?? '' })}
        ${field('shopee_orders', 'Shopee orders', { type: 'number', step: 1, value: ex.shopee_orders ?? '' })}
        ${field('shopee_gmv', 'Shopee GMV (RM)', { type: 'number', value: ex.shopee_gmv ?? '' })}
        ${field('ad_spend', 'Ad spend (RM, all)', { type: 'number', value: ex.ad_spend ?? '' })}
        ${field('videos_posted', 'Creator videos posted', { type: 'number', step: 1, value: ex.videos_posted ?? '' })}
        ${field('sample_requests', 'Sample requests', { type: 'number', step: 1, value: ex.sample_requests ?? '' })}
        ${field('stock_kits', 'Kits in stock (end of day)', { type: 'number', step: 1, value: ex.stock_kits ?? '' })}
        ${field('notes', 'Notes', { value: ex.notes ?? '' })}
        <button class="primary">Save day</button>
      </form>
      <h2>Trends</h2>
      <div class="grid wide">
        <div class="card"><h3>Orders/day and 7-day average</h3><div class="chart-box"><canvas id="c-orders"></canvas></div></div>
        <div class="card"><h3>GMV (RM)</h3><div class="chart-box"><canvas id="c-gmv"></canvas></div></div>
        <div class="card"><h3>Blended ROAS vs target ${S.config.kpi_targets.roas_target} / floor ${S.config.kpi_targets.roas_floor}</h3><div class="chart-box"><canvas id="c-roas"></canvas></div></div>
        <div class="card"><h3>Estimated profit (RM/day)</h3><div class="chart-box"><canvas id="c-profit"></canvas></div></div>
      </div>
      <h2>Last 30 days</h2>
      ${table([
        { label: 'Date', key: 'date' }, { label: 'TT ord', key: 'tiktok_orders', num: true }, { label: 'SP ord', key: 'shopee_orders', num: true },
        { label: 'GMV', num: true, html: (k) => rm(n(k.tiktok_gmv) + n(k.shopee_gmv), 0) }, { label: 'Ads', num: true, html: (k) => rm(k.ad_spend, 0) },
        { label: 'Videos', key: 'videos_posted', num: true }, { label: 'Stock', key: 'stock_kits', num: true },
        { label: 'Est. profit', num: true, html: (k) => rm(dayProfit(k, S.computed.unit_economics), 0) },
      ], rows, { empty: 'No days logged yet.' })}`;
  },
  bind() { bindForm('f-kpi', (d) => save('daily_kpis', d, 'Day saved')); },
  charts() {
    const ks = S.state.kpis.slice(-60);
    if (!ks.length) return;
    const labels = ks.map((k) => k.date.slice(5));
    const orders = ks.map((k) => n(k.tiktok_orders) + n(k.shopee_orders));
    const avg = orders.map((_, i) => { const w = orders.slice(Math.max(0, i - 6), i + 1); return +(w.reduce((a, b) => a + b, 0) / w.length).toFixed(1); });
    const gmv = ks.map((k) => n(k.tiktok_gmv) + n(k.shopee_gmv));
    const roas = ks.map((k, i) => (n(k.ad_spend) > 0 ? +(gmv[i] / n(k.ad_spend)).toFixed(2) : null));
    const T = S.config.kpi_targets;
    lineChart('c-orders', labels, [{ label: 'Orders', data: orders, borderColor: css('--line'), backgroundColor: css('--line') }, { label: '7-day avg', data: avg, borderColor: css('--accent'), backgroundColor: css('--accent') }]);
    lineChart('c-gmv', labels, [{ label: 'GMV', data: gmv, borderColor: css('--accent'), backgroundColor: css('--accent') }], 'RM');
    lineChart('c-roas', labels, [
      { label: 'ROAS', data: roas, borderColor: css('--accent'), backgroundColor: css('--accent'), spanGaps: true },
      { label: 'Target', data: labels.map(() => T.roas_target), borderColor: css('--good'), borderDash: [6, 4], pointRadius: 0 },
      { label: 'Floor', data: labels.map(() => T.roas_floor), borderColor: css('--bad'), borderDash: [2, 4], pointRadius: 0 },
    ]);
    lineChart('c-profit', labels, [{ label: 'Est. profit', data: ks.map((k) => +dayProfit(k, S.computed.unit_economics).toFixed(0)), borderColor: css('--accent'), backgroundColor: css('--accent') }], 'RM');
  },
};

VIEWS.unit = {
  html() {
    const { state: s, computed: c } = S;
    const F = [['price', 'Price RM'], ['landed', 'Landed cost RM'], ['commission_pct', 'Commission %'], ['txn_pct', 'Transaction %'], ['psf', 'Platform support fee RM'],
      ['affiliate_pct', 'Affiliate %'], ['affiliate_share_pct', '% orders via affiliate'], ['ads_pct', 'Ads % of GMV'], ['shipping', 'Shipping subsidy RM (incl. SST)'], ['returns_pct', 'Returns/damage %']];
    const card = (ch, label) => {
      const a = s.unit_econ[ch] || {}; const u = c.unit_economics[ch];
      return `<div class="card"><h3>${label}</h3>
        <form id="f-ue-${ch}" class="entry">${F.map(([k, l]) => field(k, l, { type: 'number', value: a[k] ?? '' })).join('')}<input type="hidden" name="channel" value="${ch}"><button class="primary">Save</button></form>
        <p class="small muted">${esc(a.notes || '')}</p>
        ${table([{ label: 'Line', key: 'k' }, { label: 'RM', key: 'v', num: true }], Object.entries(u.lines).map(([k, v]) => ({ k, v: v.toFixed(2) })))}
        <div class="grid" style="margin-top:10px">${stat('Profit/order', rm(u.profit), `${u.margin_pct}% margin`)}${stat('Break-even ROAS', u.break_even_roas ?? '–', `with 10% Shop Ads aff: ${u.break_even_roas_shop_ads ?? '–'}`)}</div>
        <h3>Orders needed</h3>${table([{ label: 'Profit goal', html: (r) => rm(r.target, 0) }, { label: 'Orders/month', key: 'per_month', num: true }, { label: 'Orders/day', key: 'per_day', num: true }], u.orders_needed)}</div>`;
    };
    return `<h2>Unit economics (per kit)</h2><div class="grid wide">${card('tiktok', 'TikTok Shop')}${card('shopee', 'Shopee')}</div>
      <h2>Landed-cost calculator</h2>
      <form id="f-landed" class="entry card">
        ${field('slk', 'Slicker ¥/unit', { type: 'number', value: 8 })}${field('c2', 'Two-sided comb ¥', { type: 'number', value: 2.5 })}${field('cf', 'Face comb ¥', { type: 'number', value: 1.5 })}
        ${field('fx', 'CNY→MYR', { type: 'number', value: 0.64 })}${field('dom', 'China domestic ship ¥ (whole order)', { type: 'number', value: 20 })}
        ${field('kits', 'Kits in shipment', { type: 'number', value: 120 })}${field('rate', 'Freight RM/kg', { type: 'number', value: 21 })}
        ${field('kg', 'Chargeable kg (whole shipment)', { type: 'number', value: 28 })}${field('tax', 'Import tax buffer %', { type: 'number', value: 10 })}
        ${field('pack', 'Local packaging RM/kit', { type: 'number', value: 1.25 })}
        <button class="primary" type="submit">Calculate</button></form>
      <div id="landed-out" class="card" style="margin-top:10px"><span class="muted">Enter the real quotes and press Calculate.</span></div>`;
  },
  bind() {
    for (const ch of ['tiktok', 'shopee']) bindForm(`f-ue-${ch}`, (d) => save('unit_econ', d, 'Assumptions saved'));
    bindForm('f-landed', (d) => {
      const goods = (n(d.slk) + n(d.c2) + n(d.cf)) * n(d.fx);
      const per = goods + (n(d.dom) * n(d.fx)) / n(d.kits) + (n(d.rate) * n(d.kg)) / n(d.kits) + goods * (n(d.tax) / 100) + n(d.pack);
      $('#landed-out').innerHTML = `<div class="stat"><div class="label">Landed cost per kit</div><div class="value">${rm(per)}</div>
        <div class="sub">goods ${rm(goods)} · freight ${rm((n(d.rate) * n(d.kg)) / n(d.kits))} · tax ${rm(goods * n(d.tax) / 100)} · packaging ${rm(d.pack)}</div></div>
        <button class="ghost" id="apply-landed">Use ${rm(per)} as landed cost for both channels</button>`;
      $('#apply-landed').addEventListener('click', () => save('unit_econ', ['tiktok', 'shopee'].map((ch) => ({ channel: ch, landed: +per.toFixed(2) })), 'Landed cost updated'));
    });
  },
};

const STAGES = [['invited', 'Invited'], ['sample_requested', 'Sample requested'], ['sample_sent', 'Sample sent'], ['posted', 'Posted'], ['top_performer', 'Top performer'], ['no_response', 'No response']];
VIEWS.creators = {
  html() {
    const { state: s, computed: c } = S;
    const nextStage = { invited: 'sample_requested', sample_requested: 'sample_sent', sample_sent: 'posted', posted: 'top_performer' };
    return `
      <h2>Add creator</h2>
      <form id="f-creator" class="entry card">${field('handle', 'TikTok handle (no @)', { required: true })}${field('followers', 'Followers', { type: 'number', step: 1 })}
        ${field('profile_url', 'Profile link')}${field('invited_at', 'Invited on', { type: 'date', value: c.today })}<input type="hidden" name="status" value="invited">
        ${field('commission', 'Commission %', { type: 'number', value: 20 })}<button class="primary">Add</button></form>
      <h2>Pipeline</h2>
      <div class="kanban">${STAGES.map(([st, label]) => {
        const items = s.creators.filter((x) => x.status === st);
        return `<div class="card col"><h4>${label} (${items.length})</h4>${items.slice(0, 40).map((x) => `<div class="item"><strong>@${esc(x.handle)}</strong> <span class="muted">${x.followers ? fmt(x.followers) : ''}</span>
          ${nextStage[st] ? `<br><button class="link" data-adv="${x.id}" data-to="${nextStage[st]}">→ ${esc(STAGES.find((z) => z[0] === nextStage[st])[1])}</button>` : ''}</div>`).join('')}</div>`;
      }).join('')}</div>
      <h2>All creators</h2>
      ${table([
        { label: 'Creator', html: (x) => x.profile_url ? `<a href="${esc(x.profile_url)}" target="_blank" rel="noopener">@${esc(x.handle)}</a>` : '@' + esc(x.handle) },
        { label: 'Status', key: 'status' }, { label: 'Tier', key: 'tier' }, { label: '%', key: 'commission', num: true },
        { label: 'Sent', key: 'sample_sent_at' }, { label: 'Follow-up', key: 'last_followup_at' },
        { label: 'Orders', html: (x) => `<input type="number" style="width:70px" data-ord="${x.id}" value="${n(x.orders)}">`, num: true },
        { label: 'Best video', html: (x) => `<input type="number" style="width:70px" data-best="${x.id}" value="${n(x.best_video_orders)}">`, num: true },
        { label: '', html: (x) => `<button class="link" data-delc="${x.id}">Delete</button>` },
      ], s.creators)}
      <p class="small muted">Tiers: T1 20% → T2 22% (≥10 orders in 14 days) → T3 25% (top 10% and ≥30 orders in 30 days). /weekly tells you who moves.</p>`;
  },
  bind() {
    bindForm('f-creator', (d) => save('creators', { ...d, handle: String(d.handle).replace(/^@/, '') }, 'Creator added'));
    const byId = (id) => S.state.creators.find((x) => x.id === +id);
    onClick('[data-adv]', (d) => {
      const x = byId(d.adv); const t = S.computed.today;
      const stamp = { sample_requested: 'sample_requested_at', sample_sent: 'sample_sent_at', posted: 'posted_at' }[d.to];
      save('creators', { id: x.id, handle: x.handle, status: d.to, ...(stamp ? { [stamp]: t } : {}), ...(d.to === 'top_performer' ? { tier: 'T3', commission: 25 } : {}) }, 'Moved');
    });
    document.querySelectorAll('[data-ord],[data-best]').forEach((inp) => inp.addEventListener('change', () => {
      const id = inp.dataset.ord || inp.dataset.best; const x = byId(id);
      save('creators', { id: x.id, handle: x.handle, [inp.dataset.ord ? 'orders' : 'best_video_orders']: +inp.value }, 'Updated');
    }));
    onClick('[data-delc]', async (d) => { if (confirm('Delete this creator?')) { await del('creators', d.delc); toast('Deleted'); load(); } });
  },
};

VIEWS.inventory = {
  html() {
    const { state: s, computed: c } = S; const r = c.reorder;
    return `
      <h2>Stock</h2>
      <div class="grid">${stat('Kits possible', fmt(r.kits_possible), 'min of components')}${stat('Days of cover', r.days_cover ?? '–', `at ${r.orders_per_day} orders/day`)}
        ${stat('Incoming (open POs)', fmt(r.incoming_kits) + ' kits')}${stat('Suggested reorder', fmt(r.suggested_kits) + ' kits', `by ${r.mode}, lead ${r.lead_days} days`)}</div>
      ${r.alert ? `<ul class="calls" style="margin-top:10px"><li class="p${r.alert.priority}"><span class="tag">stock</span><span>${esc(r.alert.message)}</span></li></ul>` : ''}
      <p class="small muted">Last pre-CNY sea order must be paid by ${esc(r.cny_cutoff)}.</p>
      <h3>Components on hand</h3>
      <form id="f-inv" class="entry card">${s.inventory.map((i) => field(i.sku, `${i.sku} – ${i.name}`, { type: 'number', step: 1, value: i.on_hand })).join('')}<button class="primary">Update stock</button></form>
      <h2>Purchase orders</h2>
      <form id="f-po" class="entry card">${field('created_at', 'Date', { type: 'date', value: c.today })}${field('supplier', 'Supplier')}${field('items', 'Items')}
        ${field('qty_kits', 'Kits', { type: 'number', step: 1 })}${field('cost_rm', 'Cost RM (all-in)', { type: 'number' })}${field('mode', 'Mode', { options: ['air', 'sea'] })}
        ${field('status', 'Status', { options: ['ordered', 'at_forwarder', 'in_transit', 'received', 'cancelled'] })}${field('eta', 'ETA', { type: 'date' })}<button class="primary">Add PO</button></form>
      ${table([{ label: 'Date', key: 'created_at' }, { label: 'Supplier', key: 'supplier' }, { label: 'Kits', key: 'qty_kits', num: true }, { label: 'Cost', num: true, html: (p) => rm(p.cost_rm, 0) },
        { label: 'Mode', key: 'mode' }, { label: 'ETA', key: 'eta' },
        { label: 'Status', html: (p) => `<select data-po="${p.id}">${['ordered', 'at_forwarder', 'in_transit', 'received', 'cancelled'].map((o) => `<option ${o === p.status ? 'selected' : ''}>${o}</option>`).join('')}</select>` }], s.purchase_orders)}
      <h2>Suppliers</h2>
      <form id="f-sup" class="entry card">${field('name', 'Name')}${field('item', 'Item', { options: ['slicker', 'comb_two_sided', 'comb_face', 'packaging'] })}${field('url', 'Link')}
        ${field('score', 'Score', { type: 'number', step: 1 })}${field('unit_price_cny', '¥/unit', { type: 'number' })}${field('role', 'Role', { options: ['A', 'backup'] })}<button class="primary">Add supplier</button></form>
      ${table([{ label: 'Name', key: 'name' }, { label: 'Item', key: 'item' }, { label: 'Score', key: 'score', num: true }, { label: '¥', key: 'unit_price_cny', num: true }, { label: 'Role', key: 'role' },
        { label: 'Link', html: (x) => x.url ? `<a href="${esc(x.url)}" target="_blank" rel="noopener">open</a>` : '' }], s.suppliers)}
      <h2>QC log</h2>
      <form id="f-qc" class="entry card">${field('date', 'Date', { type: 'date', value: c.today })}${field('batch', 'Batch')}${field('item', 'Item', { options: ['slicker', 'comb_two_sided', 'comb_face'] })}
        ${field('checked', 'Units checked', { type: 'number', step: 1 })}${field('failed', 'Failed', { type: 'number', step: 1 })}${field('notes', 'Notes')}<button class="primary">Log QC</button></form>
      ${table([{ label: 'Date', key: 'date' }, { label: 'Batch', key: 'batch' }, { label: 'Item', key: 'item' }, { label: 'Checked', key: 'checked', num: true }, { label: 'Failed', key: 'failed', num: true },
        { label: 'Defect %', num: true, html: (q) => { const p = n(q.checked) ? (n(q.failed) / n(q.checked)) * 100 : 0; return `<span class="${p > 5 ? 'fail' : 'pass'}">${p.toFixed(1)}%</span>`; } }, { label: 'Notes', key: 'notes' }], s.qc_log)}
      <p class="small muted">Batch fail = more than 5% defects on any line → stop and run /decide sourcing.</p>`;
  },
  bind() {
    bindForm('f-inv', (d) => save('inventory', S.state.inventory.map((i) => ({ sku: i.sku, name: i.name, on_hand: n(d[i.sku]), updated_at: S.computed.today })), 'Stock updated'));
    bindForm('f-po', (d) => save('purchase_orders', d, 'PO added'));
    bindForm('f-sup', (d) => save('suppliers', d, 'Supplier added'));
    bindForm('f-qc', (d) => save('qc_log', d, 'QC logged'));
    document.querySelectorAll('[data-po]').forEach((sel) => sel.addEventListener('change', () => {
      const p = S.state.purchase_orders.find((x) => x.id === +sel.dataset.po);
      save('purchase_orders', { ...p, status: sel.value, ...(sel.value === 'received' ? { received_at: S.computed.today } : {}) }, 'PO updated');
    }));
  },
};

VIEWS.ads = {
  html() {
    const { state: s, computed: c, config: cfg } = S;
    const last = s.ads_log[s.ads_log.length - 1] || {};
    return `
      <div class="card hero"><div class="label muted small">Rule engine call (GMV Max)</div><div class="value">${esc(c.ads.message)}</div></div>
      <h2>Log yesterday</h2>
      <form id="f-ads" class="entry card">${field('date', 'Date', { type: 'date', value: addDays(c.today, -1) })}${field('spend', 'Spend RM', { type: 'number' })}
        ${field('gmv', 'GMV RM', { type: 'number' })}${field('roi', 'ROI (as shown)', { type: 'number' })}${field('budget', 'Daily budget RM', { type: 'number', value: last.budget ?? cfg.ads.start_budget })}
        ${field('roi_target', 'ROI target', { type: 'number', value: last.roi_target ?? cfg.ads.roi_target })}${field('notes', 'Notes')}<button class="primary">Save</button></form>
      <p class="small muted">Rules: start after ${cfg.ads.start_when_orders_total} orders or ${cfg.ads.start_when_videos_total} videos at RM${cfg.ads.start_budget}/day, ROI target ${cfg.ads.roi_target};
        +${cfg.ads.scale_up_pct}% after ${cfg.ads.scale_up_after_days_at_target} days ≥ target; −${cfg.ads.cut_pct}% after ${cfg.ads.cut_after_days_below_floor} days below floor ${cfg.ads.roi_floor}; never lower the target below ${cfg.ads.roi_floor}.</p>
      ${table([{ label: 'Date', key: 'date' }, { label: 'Spend', num: true, html: (a) => rm(a.spend) }, { label: 'GMV', num: true, html: (a) => rm(a.gmv) },
        { label: 'ROI', num: true, html: (a) => { const v = n(a.roi) || (n(a.spend) ? n(a.gmv) / n(a.spend) : 0); return `<span class="${v >= cfg.ads.roi_target ? 'pass' : v < cfg.ads.roi_floor ? 'fail' : ''}">${v.toFixed(2)}</span>`; } },
        { label: 'Budget', num: true, html: (a) => rm(a.budget, 0) }, { label: 'Target', key: 'roi_target', num: true }, { label: 'Notes', key: 'notes' }], [...s.ads_log].reverse())}`;
  },
  bind() { bindForm('f-ads', (d) => save('ads_log', d, 'Ads day saved')); },
};

VIEWS.budget = {
  html() {
    const { state: s, computed: c, config: cfg } = S;
    const actual = s.cash.filter((x) => x.status !== 'pending');
    const spentBy = (cat) => -actual.filter((x) => x.category === cat && n(x.amount) < 0).reduce((a, x) => a + n(x.amount), 0);
    const planned = s.budget_plan.reduce((a, b) => a + n(b.planned), 0);
    const spent = -actual.filter((x) => n(x.amount) < 0 && x.category !== 'Transfer to EcomForges').reduce((a, x) => a + n(x.amount), 0);
    const income = actual.filter((x) => n(x.amount) > 0 && x.category !== 'Capital in').reduce((a, x) => a + n(x.amount), 0);
    const capital = actual.filter((x) => x.category === 'Capital in').reduce((a, x) => a + n(x.amount), 0);
    const balance = actual.reduce((a, x) => a + n(x.amount), 0);
    const pending = s.cash.filter((x) => x.status === 'pending').reduce((a, x) => a + n(x.amount), 0);
    const cats = [...s.budget_plan.map((b) => b.category), 'Platform payout', 'Capital in', 'Transfer to EcomForges', 'Tax reserve', 'Other'];
    return `
      <h2>Cash position</h2>
      <div class="grid">${stat('Bank balance (business)', rm(balance, 0), 'sum of actual entries')}${stat('Capital spent', rm(spent, 0), `of RM${fmt(cfg.cash.capital_cap)} cap`)}
        ${stat('Platform payouts received', rm(income, 0))}${stat('Pending settlements', rm(pending, 0), 'platform balance not yet paid out')}</div>
      ${spent > cfg.cash.capital_cap ? `<ul class="calls" style="margin-top:10px"><li class="p1"><span class="tag">cash</span><span>Spending exceeds the RM${fmt(cfg.cash.capital_cap)} cap. Stop new spend until the Day-45 gate passes.</span></li></ul>` : ''}
      <h2>Plan vs actual (RM${fmt(planned)} plan)</h2>
      ${table([{ label: 'Category', key: 'category' }, { label: 'Planned', num: true, html: (b) => rm(b.planned, 0) }, { label: 'Spent', num: true, html: (b) => rm(spentBy(b.category), 0) },
        { label: 'Left', num: true, html: (b) => { const l = n(b.planned) - spentBy(b.category); return `<span class="${l < 0 ? 'fail' : ''}">${rm(l, 0)}</span>`; } }, { label: 'Notes', key: 'notes' }], s.budget_plan)}
      <h2>Add cash entry</h2>
      <form id="f-cash" class="entry card">${field('date', 'Date', { type: 'date', value: c.today })}${field('category', 'Category', { options: cats })}
        ${field('description', 'Description')}${field('amount', 'Amount RM (− out, + in)', { type: 'number', required: true })}${field('status', 'Status', { options: ['actual', 'pending'] })}
        ${field('platform', 'Platform', { options: ['', 'tiktok', 'shopee', 'bank', '1688', 'forwarder'] })}<button class="primary">Add</button></form>
      <p class="small muted">Record your RM5,000 as one "Capital in" entry (+5000). Money out is negative. Pending = settled by the platform but not yet paid out.</p>
      ${table([{ label: 'Date', key: 'date' }, { label: 'Category', key: 'category' }, { label: 'Description', key: 'description' }, { label: 'RM', num: true, html: (x) => `<span class="${n(x.amount) < 0 ? 'fail' : 'pass'}">${rm(x.amount)}</span>` },
        { label: 'Status', key: 'status' }, { label: '', html: (x) => `<button class="link" data-delcash="${x.id}">Delete</button>` }], s.cash.slice(0, 100))}`;
  },
  bind() {
    bindForm('f-cash', (d) => save('cash', d, 'Entry added'));
    onClick('[data-delcash]', async (d) => { if (confirm('Delete entry?')) { await del('cash', d.delcash); toast('Deleted'); load(); } });
  },
};

VIEWS.close = {
  html() {
    const { state: s, computed: c, config: cfg } = S;
    const months = [...new Set(s.kpis.map((k) => k.date.slice(0, 7)))].sort();
    const sel = VIEWS.close.month || c.today.slice(0, 7);
    if (!months.includes(sel)) months.push(sel);
    const saved = s.monthly_close.find((m) => m.month === sel) || {};
    const ks = s.kpis.filter((k) => k.date.startsWith(sel));
    const revenue = ks.reduce((a, k) => a + n(k.tiktok_gmv) + n(k.shopee_gmv), 0);
    const estProfit = ks.reduce((a, k) => a + dayProfit(k, c.unit_economics), 0);
    const profit = saved.profit !== undefined && saved.profit !== null ? n(saved.profit) : estProfit;
    const balance = s.cash.filter((x) => x.status !== 'pending').reduce((a, x) => a + n(x.amount), 0);
    const tax = Math.max(0, profit * cfg.cash.tax_reserve_pct / 100);
    const stockRes = n(saved.stock_reserve);
    const afterTax = profit - tax;
    const distributable = Math.max(0, Math.min(afterTax - stockRes, balance - tax - stockRes - cfg.cash.cash_floor));
    const noTransfer = cfg.cash.no_transfer_months.includes(sel);
    const pct = profit > 20000 ? cfg.cash.ecomforges_split_pct_above_20k : cfg.cash.ecomforges_split_pct;
    const toEF = noTransfer ? 0 : distributable * pct / 100;
    return `
      <h2>Monthly close</h2>
      <form id="f-month" class="row">${field('month', 'Month', { options: months, value: sel })}</form>
      <div class="grid" style="margin-top:10px">${stat('Revenue (GMV)', rm(revenue, 0))}${stat('Profit', rm(profit, 0), saved.profit != null ? 'actual (entered)' : 'estimated from KPIs')}${stat('Business bank balance', rm(balance, 0))}</div>
      <h3>Waterfall</h3>
      ${table([{ label: 'Step', key: 's' }, { label: 'RM', key: 'v', num: true }], [
        { s: `1. Tax reserve (${cfg.cash.tax_reserve_pct}%)`, v: rm(tax) },
        { s: '2. Stock reserve (next reorder)', v: rm(stockRes) },
        { s: `3. Keep cash floor RM${fmt(cfg.cash.cash_floor)} in the bank`, v: '—' },
        { s: '= Distributable', v: rm(distributable) },
        { s: noTransfer ? '4. Transfer to EcomForges (none: month 1–2 rule)' : `4. Transfer to EcomForges (${pct}%)`, v: rm(toEF) },
        { s: '5. Kept for growth', v: rm(distributable - toEF) },
      ])}
      <p class="small muted">Record each transfer as a capital contribution or director's loan into EcomForges, agreed in writing with your partner (CLAUDE.md §3).</p>
      <h3>Close the month</h3>
      <form id="f-close" class="entry card"><input type="hidden" name="month" value="${esc(sel)}">${field('revenue', 'Revenue RM', { type: 'number', value: saved.revenue ?? revenue.toFixed(2) })}
        ${field('profit', 'Actual profit RM (from payouts − costs)', { type: 'number', value: saved.profit ?? '' })}${field('stock_reserve', 'Stock reserve RM', { type: 'number', value: saved.stock_reserve ?? '' })}
        ${field('notes', 'Notes', { value: saved.notes ?? '' })}<input type="hidden" name="closed_at" value="${c.today}"><button class="primary">Save close</button></form>`;
  },
  bind() {
    $('#f-month select').addEventListener('change', (e) => { VIEWS.close.month = e.target.value; render(); });
    bindForm('f-close', (d) => save('monthly_close', d, 'Month closed'));
  },
};

VIEWS.decisions = {
  html() {
    return `<h2>Decisions log</h2><p class="small muted">Full reasoning: decisions/NN-*.md in the repo. Mark whether each one worked once the outcome is known.</p>
      ${table([{ label: '#', key: 'num' }, { label: 'Date', key: 'date' }, { label: 'Decision', key: 'title' }, { label: 'Status', key: 'status' }, { label: 'Confidence', key: 'confidence' },
        { label: 'Outcome', html: (d) => `<input data-dout="${esc(d.num)}" value="${esc(d.outcome || '')}">` },
        { label: 'Worked?', html: (d) => `<select data-dwk="${esc(d.num)}">${['', 'yes', 'partly', 'no'].map((o) => `<option ${o === (d.worked || '') ? 'selected' : ''}>${o}</option>`).join('')}</select>` }], S.state.decisions)}
      <h3>Add decision</h3><form id="f-dec" class="entry card">${field('num', 'Number', { required: true })}${field('date', 'Date', { type: 'date', value: S.computed.today })}${field('title', 'Decision')}
        ${field('status', 'Status', { value: 'Decided' })}${field('confidence', 'Confidence', { options: ['low', 'medium', 'high'] })}<button class="primary">Add</button></form>`;
  },
  bind() {
    const get = (num) => S.state.decisions.find((d) => d.num === num);
    document.querySelectorAll('[data-dout]').forEach((i) => i.addEventListener('change', () => save('decisions', { ...get(i.dataset.dout), outcome: i.value })));
    document.querySelectorAll('[data-dwk]').forEach((i) => i.addEventListener('change', () => save('decisions', { ...get(i.dataset.dwk), worked: i.value })));
    bindForm('f-dec', (d) => save('decisions', d, 'Decision added'));
  },
};

VIEWS.data = {
  html() {
    const st = S.state.settings;
    return `
      <h2>Settings</h2>
      <form id="f-set" class="entry card">${field('day1', 'Day 1 (launch date)', { type: 'date', value: st.day1 })}
        ${field('tiktok_shop_status', 'TikTok Shop status', { options: ['not applied', 'under review', 'approved', 'rejected'], value: st.tiktok_shop_status })}
        ${field('shopee_shop_status', 'Shopee status', { options: ['not applied', 'under review', 'approved', 'rejected'], value: st.shopee_shop_status })}
        <button class="primary">Save settings</button></form>
      <h2>Import CSV</h2>
      <div class="card">
        <form id="f-import" class="entry">${field('kind', 'What', { options: [['tiktok-orders', 'TikTok Seller Center order export'], ['shopee-orders', 'Shopee order export'], ['kpis', 'Tracker: Daily KPIs tab'], ['creators', 'Tracker: Creators tab']] })}
          <label>CSV file<input type="file" name="file" accept=".csv,text/csv"></label><button class="primary">Import</button></form>
        <p class="small muted">Order imports update that platform's daily orders + GMV on the KPI page (cancelled orders excluded) and fill "Orders to pack". Excel files: open them, then File → Save As → CSV first.</p>
        <div id="import-out" class="small"></div>
      </div>
      <h2>Backup</h2>
      <div class="card">
        <p>Weekly (Mondays): download a backup and save it to <code>data/seed/</code> in the repo (GitHub → Add file → Upload). That file is also what Claude reads for /daily, /weekly, /gate and /reorder.</p>
        <div class="row"><a class="btn" href="/api/export" download>Download backup (.json)</a></div>
        <h3>Restore</h3>
        <p class="small muted">Replaces ALL data with the backup file. Use only to recover.</p>
        <form id="f-restore" class="row"><input type="file" name="file" accept=".json,application/json"><button class="ghost">Restore</button></form>
      </div>`;
  },
  bind() {
    bindForm('f-set', (d) => save('settings', Object.entries(d).map(([key, value]) => ({ key, value })), 'Settings saved'));
    $('#f-import').addEventListener('submit', async (e) => {
      e.preventDefault();
      const f = e.target; const file = f.file.files[0];
      if (!file) return toast('Choose a CSV file');
      try {
        const r = await api('import/' + f.kind.value, { method: 'POST', headers: { 'content-type': 'text/csv' }, body: await file.text() });
        $('#import-out').textContent = `Imported ${r.imported} rows${r.kpi_days_updated ? `, updated ${r.kpi_days_updated} KPI days` : ''}.`;
        await load();
      } catch (err) { $('#import-out').textContent = 'Import failed: ' + err.message; }
    });
    $('#f-restore').addEventListener('submit', async (e) => {
      e.preventDefault();
      const file = e.target.file.files[0];
      if (!file || !confirm('Replace ALL dashboard data with this backup?')) return;
      try { await api('restore', { method: 'POST', headers: { 'content-type': 'application/json' }, body: await file.text() }); toast('Restored'); load(); }
      catch (err) { toast('Restore failed: ' + err.message); }
    });
  },
};

window.addEventListener('hashchange', () => { const h = location.hash.slice(1); if (h && h !== current && VIEWS[h]) { current = h; render(); } });
load().catch((e) => { $('#view').innerHTML = `<p class="fail">Could not load data: ${esc(e.message)}</p>`; });
