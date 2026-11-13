// Minimal RFC-4180 CSV parser + header-alias mapping for TikTok / Shopee / tracker exports.

export function parseCSV(text) {
  const rows = [];
  let row = [], field = '', inQ = false;
  const s = text.replace(/^﻿/, '');
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (inQ) {
      if (c === '"') {
        if (s[i + 1] === '"') { field += '"'; i++; } else inQ = false;
      } else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',' || c === '\t') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && s[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
    } else field += c;
  }
  row.push(field);
  if (row.some((v) => v.trim() !== '')) rows.push(row);
  if (!rows.length) return [];
  const headers = rows[0].map((h) => h.trim());
  return rows.slice(1).map((r) => Object.fromEntries(headers.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const norm = (h) => h.toLowerCase().replace(/[^a-z0-9]/g, '');

// Column aliases. Export headers vary by version/language; extend these lists if an import misses a column.
const ORDER_ALIASES = {
  order_id: ['orderid', 'ordernumber', 'orderno', 'ordersn', 'nopesanan', 'idpesanan'],
  status: ['orderstatus', 'status', 'statuspesanan', 'ordersubstatus'],
  created_at: ['createdtime', 'ordercreationdate', 'ordercreatedtime', 'createtime', 'orderdate', 'paidtime', 'tarikhpesanan'],
  sku: ['sellersku', 'skureferenceno', 'skuid', 'sku', 'parentskureferenceno'],
  product: ['productname', 'namaproduk', 'product'],
  variation: ['variation', 'variationname', 'variasi', 'skuname'],
  qty: ['quantity', 'qty', 'kuantiti'],
  amount: ['orderamount', 'skusubtotalafterdiscount', 'totalamount', 'dealprice', 'grandtotal', 'productsubtotal', 'jumlah', 'amount'],
  creator: ['creatorusername', 'affiliatecreator', 'creator', 'creatorname'],
};
const KPI_ALIASES = {
  date: ['date', 'tarikh', 'day'],
  tiktok_orders: ['tiktokorders', 'ttorders', 'orderstiktok'],
  shopee_orders: ['shopeeorders', 'ordersshopee'],
  tiktok_gmv: ['tiktokgmv', 'ttgmv', 'gmvtiktok'],
  shopee_gmv: ['shopeegmv', 'gmvshopee'],
  ad_spend: ['adspend', 'ads', 'adsspend', 'spend'],
  videos_posted: ['videosposted', 'videos'],
  sample_requests: ['samplerequests', 'samples'],
  stock_kits: ['stock', 'stockkits', 'stockonhand'],
  notes: ['notes', 'note'],
};
const CREATOR_ALIASES = {
  handle: ['handle', 'creator', 'username', 'creatorusername', 'tiktokhandle'],
  followers: ['followers', 'followercount'],
  profile_url: ['profileurl', 'url', 'link'],
  status: ['status', 'stage'],
  invited_at: ['invitedat', 'inviteddate', 'invited'],
  sample_sent_at: ['samplesentat', 'samplesent', 'sampledate'],
  posted_at: ['postedat', 'posted', 'videodate'],
  orders: ['orders', 'ordersattributed'],
  commission: ['commission', 'commissionpct'],
  notes: ['notes', 'note'],
};

function mapRow(row, aliases) {
  const keys = Object.keys(row);
  const out = {};
  for (const [field, list] of Object.entries(aliases)) {
    const k = keys.find((h) => list.includes(norm(h)));
    if (k !== undefined && row[k] !== '') out[field] = row[k];
  }
  return out;
}

const money = (v) => {
  if (v === undefined || v === null || v === '') return 0;
  const n = Number(String(v).replace(/[^0-9.\-]/g, ''));
  return isNaN(n) ? 0 : n;
};
export function toISODate(v) {
  if (!v) return null;
  const s = String(v).trim();
  let m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})/);
  if (m) return `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
  m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})/); // DD/MM/YYYY (Malaysia)
  if (m) return `${m[3]}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  return null;
}

export function mapOrders(rows, platform) {
  const out = [];
  for (const r of rows) {
    const m = mapRow(r, ORDER_ALIASES);
    if (!m.order_id) continue;
    out.push({
      platform, order_id: m.order_id, sku: m.sku || m.variation || '',
      created_at: toISODate(m.created_at), status: m.status || '', product: m.product || '',
      variation: m.variation || '', qty: Math.max(1, Math.round(money(m.qty) || 1)), amount: money(m.amount), creator: m.creator || null,
    });
  }
  return out;
}
export function mapKpis(rows) {
  return rows.map((r) => mapRow(r, KPI_ALIASES)).filter((m) => toISODate(m.date)).map((m) => ({
    date: toISODate(m.date),
    tiktok_orders: money(m.tiktok_orders), shopee_orders: money(m.shopee_orders),
    tiktok_gmv: money(m.tiktok_gmv), shopee_gmv: money(m.shopee_gmv), ad_spend: money(m.ad_spend),
    videos_posted: money(m.videos_posted), sample_requests: money(m.sample_requests),
    stock_kits: m.stock_kits === undefined ? null : money(m.stock_kits), notes: m.notes || null,
  }));
}
export function mapCreators(rows) {
  return rows.map((r) => mapRow(r, CREATOR_ALIASES)).filter((m) => m.handle).map((m) => ({
    handle: String(m.handle).replace(/^@/, ''), followers: m.followers ? money(m.followers) : null,
    profile_url: m.profile_url || null, status: (m.status || 'invited').toLowerCase().replace(/\s+/g, '_'),
    invited_at: toISODate(m.invited_at), sample_sent_at: toISODate(m.sample_sent_at), posted_at: toISODate(m.posted_at),
    orders: money(m.orders), commission: m.commission ? money(m.commission) : 20, notes: m.notes || null,
  }));
}
