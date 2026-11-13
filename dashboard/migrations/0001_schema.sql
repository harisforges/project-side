-- Takusut ops dashboard schema (Cloudflare D1 / SQLite)

CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS daily_kpis (
  date TEXT PRIMARY KEY,
  tiktok_orders INTEGER DEFAULT 0,
  shopee_orders INTEGER DEFAULT 0,
  tiktok_gmv REAL DEFAULT 0,
  shopee_gmv REAL DEFAULT 0,
  ad_spend REAL DEFAULT 0,
  videos_posted INTEGER DEFAULT 0,
  sample_requests INTEGER DEFAULT 0,
  stock_kits INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS orders (
  platform TEXT NOT NULL,
  order_id TEXT NOT NULL,
  sku TEXT NOT NULL DEFAULT '',
  created_at TEXT,
  status TEXT,
  product TEXT,
  variation TEXT,
  qty INTEGER DEFAULT 1,
  amount REAL DEFAULT 0,
  creator TEXT,
  packed INTEGER DEFAULT 0,
  PRIMARY KEY (platform, order_id, sku)
);

CREATE TABLE IF NOT EXISTS creators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  handle TEXT UNIQUE NOT NULL,
  followers INTEGER,
  profile_url TEXT,
  status TEXT DEFAULT 'invited', -- invited | sample_requested | sample_sent | posted | top_performer | no_response
  invited_at TEXT,
  sample_requested_at TEXT,
  sample_sent_at TEXT,
  sample_delivered_at TEXT,
  posted_at TEXT,
  last_followup_at TEXT,
  orders INTEGER DEFAULT 0,
  best_video_orders INTEGER DEFAULT 0,
  gmv REAL DEFAULT 0,
  tier TEXT DEFAULT 'T1',
  commission REAL DEFAULT 20,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS inventory (
  sku TEXT PRIMARY KEY,
  name TEXT,
  on_hand INTEGER DEFAULT 0,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS purchase_orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  created_at TEXT,
  supplier TEXT,
  items TEXT,
  qty_kits INTEGER DEFAULT 0,
  cost_rm REAL DEFAULT 0,
  mode TEXT DEFAULT 'air', -- air | sea
  status TEXT DEFAULT 'ordered', -- ordered | at_forwarder | in_transit | received | cancelled
  eta TEXT,
  received_at TEXT,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS suppliers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  item TEXT,
  url TEXT,
  score INTEGER,
  unit_price_cny REAL,
  role TEXT, -- A | backup
  notes TEXT
);

CREATE TABLE IF NOT EXISTS qc_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  batch TEXT,
  item TEXT,
  checked INTEGER,
  failed INTEGER,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS ads_log (
  date TEXT PRIMARY KEY,
  spend REAL DEFAULT 0,
  gmv REAL DEFAULT 0,
  roi REAL,
  budget REAL,
  roi_target REAL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS cash (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  category TEXT,
  description TEXT,
  amount REAL, -- negative = money out, positive = money in
  status TEXT DEFAULT 'actual', -- actual | pending
  platform TEXT
);

CREATE TABLE IF NOT EXISTS budget_plan (
  category TEXT PRIMARY KEY,
  planned REAL,
  notes TEXT
);

CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  title TEXT,
  phase TEXT,
  decision TEXT,
  done INTEGER DEFAULT 0
);

CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT,
  end_date TEXT,
  title TEXT,
  type TEXT -- phase | campaign | holiday | payday
);

CREATE TABLE IF NOT EXISTS gate_results (
  id TEXT PRIMARY KEY, -- D7, D21, ...
  status TEXT, -- pass | fail
  note TEXT,
  recorded_at TEXT
);

CREATE TABLE IF NOT EXISTS monthly_close (
  month TEXT PRIMARY KEY, -- YYYY-MM
  revenue REAL,
  profit REAL,
  stock_reserve REAL,
  notes TEXT,
  closed_at TEXT
);

CREATE TABLE IF NOT EXISTS decisions (
  num TEXT PRIMARY KEY,
  date TEXT,
  title TEXT,
  status TEXT,
  confidence TEXT,
  outcome TEXT,
  worked TEXT -- yes | no | partly | ''
);

CREATE TABLE IF NOT EXISTS unit_econ (
  channel TEXT PRIMARY KEY, -- tiktok | shopee
  price REAL, landed REAL, commission_pct REAL, txn_pct REAL, psf REAL,
  affiliate_pct REAL, affiliate_share_pct REAL, ads_pct REAL, shipping REAL, returns_pct REAL,
  notes TEXT
);
