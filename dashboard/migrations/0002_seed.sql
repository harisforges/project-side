-- Seed data from CLAUDE.md §3 and decisions 01–10 (13 Nov 2026). Safe to run once on an empty DB.

INSERT OR IGNORE INTO settings (key, value) VALUES
  ('day1', '2026-11-26'),
  ('brand', 'TAKUSUT'),
  ('tiktok_shop_status', 'not applied'),
  ('shopee_shop_status', 'not applied');

INSERT OR IGNORE INTO unit_econ VALUES
  ('tiktok', 39.90, 11.00, 16.74, 3.78, 0.54, 15, 60, 12, 2.12, 3, 'Commission 16.74% = conservative assumption (post-31 Oct 2026). Replace with Seller Center rate card. Landed RM11 = assumption until quotes.'),
  ('shopee', 39.90, 11.00, 15.00, 3.78, 0.54, 0, 0, 10, 2.12, 3, 'Commission ~15% incl SST = assumption. Ads only after 10 reviews.');

INSERT OR IGNORE INTO inventory (sku, name, on_hand, updated_at) VALUES
  ('SLK', 'Self-cleaning slicker brush (long-hair spec)', 0, '2026-11-13'),
  ('COMB2', 'Two-sided steel comb 19cm', 0, '2026-11-13'),
  ('COMBF', 'Face comb 10cm', 0, '2026-11-13');

INSERT OR IGNORE INTO budget_plan (category, planned, notes) VALUES
  ('Stock – first air batch (120 kits)', 1780, 'Decision 04: 150 slickers + 130 + 130 combs, goods + air freight'),
  ('Stock – reserve / 2nd batch', 220, 'Rest of the RM2,000 stock line'),
  ('Ads – first 30 days', 900, 'Decision 08: starts after 20 orders or 5 videos'),
  ('Air top-up reserve', 500, 'Decision 04: replaces local backup stock; spend only if cover < 10 days'),
  ('Creator samples', 480, 'Sample shipping + replacement kits, max 40 samples Phase 1'),
  ('Packaging', 310, 'Decision 10: mailers, stickers, inserts, fill, labels, tape'),
  ('Label printer', 200, 'A6 thermal'),
  ('Supplier samples', 150, 'Backup suppliers B and C'),
  ('Canva / stand / light', 120, 'Photo setup + packing-video phone holder'),
  ('Domain takusut.com', 45, 'Decision 02, from buffer'),
  ('Buffer', 295, 'RM400 less packaging overrun and domain');

INSERT OR IGNORE INTO decisions (num, date, title, status, confidence, outcome, worked) VALUES
  ('01', '2026-11-13', 'Hero = long-hair self-cleaning slicker sold as a kit; glove dropped', 'Final (GO)', 'High demand / Med-low kit price', '240k units sold in commodity tier; premium ~666', ''),
  ('02', '2026-11-13', 'Brand TAKUSUT; TM after Day 45; buy takusut.com', 'Confirmed', 'High', 'All availability checks clear (13 Nov)', ''),
  ('03', '2026-11-13', 'Kit = slicker + 2-sided comb + face comb; RM39.90 / RM54.90 / RM24.90', 'Decided', 'Med / Low profit', 'RM8.48/kit at 16.74% commission', ''),
  ('04', '2026-11-13', '1688 + forwarder; first air order 120 kits; sea reorders; CNY cut-off 8 Jan', 'Decided', 'Med-low prices', '', ''),
  ('05', '2026-11-13', 'Shop setup TikTok + Shopee on spare SSM', 'Decided', 'High', '', ''),
  ('06', '2026-11-13', 'Listings copy, images, B-roll', 'Decided', 'High', '', ''),
  ('07', '2026-11-13', 'Affiliate 15/20/10, tiers 22→25, manual samples', 'Decided', 'Med-high', '', ''),
  ('08', '2026-11-13', 'GMV Max RM30, ROI 3.0, floor 2.6; Shopee ads after 10 reviews', 'Decided', 'Med-high', '', ''),
  ('09', '2026-11-13', 'CS auto-replies, 10 quick replies, refund rules', 'Decided', 'High', '', ''),
  ('10', '2026-11-13', 'Kraft mailer, A6 QR insert, grooming guide page', 'Decided', 'High', '', ''),
  ('11', '2026-11-13', 'No API integration now; CSV + daily form; revisit TikTok in-house API after Day 45', 'Decided', 'Med-high', '', '');

-- 14-day build plan (13–26 Nov 2026)
INSERT INTO tasks (date, title, phase, decision) VALUES
  ('2026-11-13', 'Brand checks: MyIPO TAKUSUT/KUSUT/TAKU, TikTok handle, Shopee, domain; create takusut Gmail + IG + FB page', 'Build', '02'),
  ('2026-11-14', 'Create 1688 + Alipay accounts; pick forwarder; send RFQs to 5 slicker + 3 comb suppliers', 'Build', '04'),
  ('2026-11-14', 'Create @takusut TikTok business account; apply for TikTok Shop with SSM', 'Build', '05'),
  ('2026-11-14', 'Apply for Shopee shop with SSM; shipping + addresses + bank', 'Build', '05'),
  ('2026-11-15', 'Choose supplier A + backups; send "before paying" message; place orders; pay; log in Budget', 'Build', '04'),
  ('2026-11-15', 'Buy takusut.com on Cloudflare (only if MyIPO check is clean)', 'Build', '02'),
  ('2026-11-16', 'Order mailers, label printer, labels, tape, fill on Shopee', 'Build', '10'),
  ('2026-11-16', 'Design logo sticker + A6 insert card in Canva; order prints', 'Build', '10'),
  ('2026-11-17', 'Deploy dashboard + grooming guide (README steps)', 'Build', 'dashboard'),
  ('2026-11-18', 'Ask accountant: e-invoice exemption + how to record EcomForges transfers', 'Build', '05'),
  ('2026-11-18', 'Set chat auto-replies + 10 quick replies on both shops (once approved)', 'Build', '09'),
  ('2026-11-19', 'Item-1 snapshot 2: sold + rating_count for the same listings', 'Build', '01'),
  ('2026-11-19', 'Screenshot TikTok + Shopee commission rate cards and new-seller waivers', 'Build', '03'),
  ('2026-11-20', 'Forwarder: consolidate parcels, ship by air, pay freight; log cost', 'Build', '04'),
  ('2026-11-21', 'Build 9 Canva image templates; shortlist 30 cat creators on TikTok', 'Build', '06'),
  ('2026-11-23', 'Stock arrives (target): run QC checklist; log QC + stock on hand', 'Build', '04'),
  ('2026-11-24', 'Shoot product photos + 10 B-roll clips; finish 9 images', 'Build', '06'),
  ('2026-11-25', 'Create listings on TikTok Shop + Shopee (3 variations); send links to Claude', 'Build', '06'),
  ('2026-11-25', 'Set up Affiliate: open 15% (manual samples), targeted T1-Launch 20%, Shop Ads 10%', 'Build', '07'),
  ('2026-11-26', 'LAUNCH (Day 1): listings live, launch voucher RM5 off min RM39 (300 claims), first 10 creator invites', 'Phase 1', '03'),
  ('2026-11-27', 'Daily from now: 10 invites, approve samples, log KPIs, pack + drop off', 'Phase 1', '07'),
  ('2026-12-07', 'Prepare 12.12 offer: RM6 off min RM39 (10–12 Dec)', 'Phase 1', '03'),
  ('2026-12-28', 'Phase 2: raise top creators to 22%; plan 2nd SKU', 'Phase 2', '07'),
  ('2027-01-05', 'Pay last pre-CNY sea reorder by 8 Jan (run /reorder)', 'Phase 2', '04'),
  ('2027-01-25', 'Phase 3: pre-Ramadan/Raya content angle; hire packer if > 50 orders/day', 'Phase 3', '');

INSERT INTO events (date, end_date, title, type) VALUES
  ('2026-11-13', '2026-11-25', 'Build (14 days)', 'phase'),
  ('2026-11-26', '2026-12-25', 'Phase 1 – Ignite', 'phase'),
  ('2026-12-26', '2027-01-24', 'Phase 2 – Scale', 'phase'),
  ('2027-01-25', '2027-02-23', 'Phase 3 – Systemise', 'phase'),
  ('2026-11-25', '2026-11-28', 'Payday (25th)', 'payday'),
  ('2026-11-26', '2026-12-09', 'Launch voucher RM5 off', 'campaign'),
  ('2026-12-10', '2026-12-12', '12.12 (test)', 'campaign'),
  ('2026-12-25', '2026-12-28', 'Payday (25th)', 'payday'),
  ('2027-01-01', '2027-01-01', '1.1 sale', 'campaign'),
  ('2027-01-08', '2027-01-08', 'Last pre-CNY sea order paid', 'campaign'),
  ('2027-01-25', '2027-01-28', 'Payday (25th)', 'payday'),
  ('2027-02-02', '2027-02-02', '2.2 sale', 'campaign'),
  ('2027-02-06', '2027-02-08', 'Chinese New Year (6–7 Feb; 8 Feb holiday)', 'holiday'),
  ('2027-02-08', '2027-03-09', 'Ramadan (starts ~8 Feb, unconfirmed)', 'holiday'),
  ('2027-02-25', '2027-02-28', 'Payday (25th)', 'payday'),
  ('2027-03-10', '2027-03-11', 'Hari Raya Aidilfitri (~10–11 Mar, unconfirmed)', 'holiday');
