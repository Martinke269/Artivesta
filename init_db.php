<?php
$config = require __DIR__ . '/config.php';
$dbPath = $config['db_path'];
if (file_exists($dbPath)) {
  echo "DB findes allerede: $dbPath\n";
  exit;
}
@mkdir(dirname($dbPath), 0755, true);
$db = new PDO('sqlite:' . $dbPath);
$db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec("
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT, name TEXT, role TEXT
);
CREATE TABLE artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_name TEXT, title TEXT, description TEXT, price_cents INTEGER, currency TEXT DEFAULT 'DKK', status TEXT DEFAULT 'listed'
);
CREATE TABLE orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER, buyer_email TEXT, amount_cents INTEGER, currency TEXT, status TEXT DEFAULT 'pending', stripe_pi_id TEXT, created_at TEXT
);
CREATE TABLE payouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER, seller_name TEXT, amount_cents INTEGER, commission_cents INTEGER, status TEXT DEFAULT 'pending', created_at TEXT
);
");
$db->exec("
INSERT INTO artworks (artist_name,title,description,price_cents) VALUES
('Anna Artist','Blå Horizon','Original maleri 70x50 cm',150000),
('Bjørn B','Nordlys','Fotografi, limited edition',50000);
");
echo "DB oprettet: $dbPath\n";
