<?php
$config = require __DIR__ . '/config.php';
$db = new PDO('sqlite:' . $config['db_path']);
$artwork_id = intval($_POST['artwork_id'] ?? 0);
$buyer_email = trim($_POST['buyer_email'] ?? '');
$art = $db->prepare('SELECT * FROM artworks WHERE id=?');
$art->execute([$artwork_id]);
$a = $art->fetch(PDO::FETCH_ASSOC);
if (!$a) { echo "Artwork ikke fundet"; exit; }
$amount = intval($a['price_cents']);
$currency = $a['currency'];
$ch = curl_init('https://api.stripe.com/v1/payment_intents');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_USERPWD, $config['stripe_secret'] . ':');
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
  'amount' => $amount,
  'currency' => strtolower($currency),
  'payment_method_types[]' => 'card',
  'capture_method' => 'manual',
  'metadata[artwork_id]' => $artwork_id,
  'metadata[buyer_email]' => $buyer_email
]));
$res = curl_exec($ch);
curl_close($ch);
$data = json_decode($res, true);
if (isset($data['error'])) { echo "Stripe error: " . htmlspecialchars($data['error']['message']); exit; }
$stmt = $db->prepare('INSERT INTO orders (artwork_id,buyer_email,amount_cents,currency,status,stripe_pi_id,created_at) VALUES (?,?,?,?,?,?,datetime("now"))');
$stmt->execute([$artwork_id,$buyer_email,$amount,$currency,'deposited',$data['id']]);
$orderId = $db->lastInsertId();
?>
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Betaling reserveret</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<h2>Betaling reserveret</h2>
<p>Order ID: <?=$orderId?></p>
<p>Stripe PaymentIntent oprettet (test). I testmode kan du bruge kort: <strong>4242 4242 4242 4242</strong>.</p>
<p>For fuld checkout skal Stripe Elements eller Checkout integreres.</p>
<p><a href="index.php">Tilbage til markedsplads</a></p>
</body>
</html>
