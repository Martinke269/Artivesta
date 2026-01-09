<?php
$config = require __DIR__ . '/config.php';
$db = new PDO('sqlite:' . $config['db_path']);
$orderId = intval($_GET['order'] ?? 0);
$ord = $db->query("SELECT o.*, a.title, a.artist_name, a.description FROM orders o JOIN artworks a ON o.artwork_id=a.id WHERE o.id=$orderId")->fetch(PDO::FETCH_ASSOC);
if (!$ord) { echo "Order ikke fundet"; exit; }
$commission = (int)ceil($ord['amount_cents'] * $config['commission_rate']);
$seller_amount = $ord['amount_cents'] - $commission;
?>
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Invoice #<?=$orderId?></title>
<style>
body { font-family: Arial, sans-serif; max-width: 800px; margin: 40px auto; padding: 20px; }
h1 { border-bottom: 2px solid #333; padding-bottom: 10px; }
table { width: 100%; border-collapse: collapse; margin: 20px 0; }
th, td { padding: 10px; text-align: left; border-bottom: 1px solid #ddd; }
th { background: #f5f5f5; }
.total { font-weight: bold; font-size: 1.2em; }
@media print { button { display: none; } }
</style>
</head>
<body>
<button onclick="window.print()">Print Invoice</button>

<h1>Invoice #<?=$orderId?></h1>

<p><strong>Date:</strong> <?=htmlspecialchars($ord['created_at'])?></p>
<p><strong>Status:</strong> <?=htmlspecialchars($ord['status'])?></p>
<p><strong>Buyer:</strong> <?=htmlspecialchars($ord['buyer_email'])?></p>

<h2>Artwork Details</h2>
<p><strong>Title:</strong> <?=htmlspecialchars($ord['title'])?></p>
<p><strong>Artist:</strong> <?=htmlspecialchars($ord['artist_name'])?></p>
<p><?=nl2br(htmlspecialchars($ord['description']))?></p>

<h2>Payment Breakdown</h2>
<table>
<tr><th>Description</th><th>Amount</th></tr>
<tr><td>Artwork Price</td><td><?=number_format($ord['amount_cents']/100,2)?> <?=htmlspecialchars($ord['currency'])?></td></tr>
<tr><td>Platform Commission (<?=($config['commission_rate']*100)?>%)</td><td><?=number_format($commission/100,2)?> <?=htmlspecialchars($ord['currency'])?></td></tr>
<tr><td>Artist Receives</td><td><?=number_format($seller_amount/100,2)?> <?=htmlspecialchars($ord['currency'])?></td></tr>
<tr class="total"><td>Total Paid</td><td><?=number_format($ord['amount_cents']/100,2)?> <?=htmlspecialchars($ord['currency'])?></td></tr>
</table>

<p><strong>Stripe Payment Intent ID:</strong> <?=htmlspecialchars($ord['stripe_pi_id'])?></p>

<p style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ddd; color: #666;">
Thank you for your purchase. For questions, contact support.
</p>

<p><a href="admin.php">Back to Admin</a></p>
</body>
</html>
