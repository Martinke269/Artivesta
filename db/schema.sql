-- ArtMarketplace MVP Database Schema
-- This file is for reference only - the actual schema is created by init_db.php

CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT,
  name TEXT,
  role TEXT
);

CREATE TABLE artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_name TEXT,
  title TEXT,
  description TEXT,
  price_cents INTEGER,
  currency TEXT DEFAULT 'DKK',
  status TEXT DEFAULT 'listed'
);

CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER,
  buyer_email TEXT,
  amount_cents INTEGER,
  currency TEXT,
  status TEXT DEFAULT 'pending',
  stripe_pi_id TEXT,
  created_at TEXT
);

CREATE TABLE payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER,
  seller_name TEXT,
  amount_cents INTEGER,
  commission_cents INTEGER,
  status TEXT DEFAULT 'pending',
  created_at TEXT
);
