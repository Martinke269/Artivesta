<?php
$config = require __DIR__ . '/config.php';
session_start();
if (!isset($_SERVER['PHP_AUTH_USER'])) {
  header('WWW-Authenticate: Basic realm="Admin"');
  header('HTTP/1.0 401 Unauthorized');
  echo 'Auth required';
  exit;
}
if ($_SERVER['PHP_AUTH_USER'] !== $config['admin_user'] || $_SERVER['PHP_AUTH_PW'] !== $config['admin_pass']) {
  header('HTTP/1.0 403 Forbidden'); echo 'Forbidden'; exit;
}
$db = new PDO('sqlite:' . $config['db_path']);
if ($_GET['action'] === 'verify' && isset($_GET['order'])) {
  $orderId = intval($_GET['order']);
  $db->prepare('UPDATE orders SET status="verified" WHERE id=?')->execute([$orderId]);
  $ord = $db->query("SELECT * FROM orders WHERE id=$orderId")->fetch(PDO::FETCH_ASSOC);
  $art = $db->query("SELECT * FROM artworks WHERE id=".$ord['artwork_id'])->fetch(PDO::FETCH_ASSOC);
  $commission = (int)ceil($ord['amount_cents'] * $config['commission_rate']);
  $seller_amount = $ord['amount_cents'] - $commission;
  $db->prepare('INSERT INTO payouts (order_id,seller_name,amount_cents,commission_cents,created_at) VALUES (?,?,?,?,datetime("now"))')
    ->execute([$orderId,$art['artist_name'],$seller_amount,$commission]);
  $db->prepare('UPDATE artworks SET status="sold" WHERE id=?')->execute([$ord['artwork_id']]);
  header('Location: admin.php?msg=verified');
  exit;
}
if ($_GET['action'] === 'capture' && isset($_GET['order'])) {
  $orderId = intval($_GET['order']);
  $ord = $db->query("SELECT * FROM orders WHERE id=$orderId")->fetch(PDO::FETCH_ASSOC);
  $ch = curl_init('https://api.stripe.com/v1/payment_intents/'.$ord['stripe_pi_id'].'/capture');
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_USERPWD, $config['stripe_secret'] . ':');
  curl_setopt($ch, CURLOPT_POST, true);
  $res = curl_exec($ch);
  curl_close($ch);
  $data = json_decode($res, true);
  if (isset($data['error'])) {
    header('Location: admin.php?msg=capture_error');
  } else {
    $db->prepare('UPDATE orders SET status="captured" WHERE id=?')->execute([$orderId]);
    header('Location: admin.php?msg=captured');
  }
  exit;
}
$orders = $db->query('SELECT o.*, a.title, a.artist_name FROM orders o JOIN artworks a ON o.artwork_id=a.id ORDER BY o.id DESC')->fetchAll(PDO::FETCH_ASSOC);
$payouts = $db->query('SELECT * FROM payouts ORDER BY id DESC')->fetchAll(PDO::FETCH_ASSOC);
?>
<!doctype html>
<html>
<head><meta charset="utf-8"><title>Admin</title>
<link rel="stylesheet" href="styles.css">
</head>
<body>
<h1>Admin Panel</h1>
<?php if(isset($_GET['msg'])): ?>
<p style="background:#dfd;padding:10px;border:1px solid #0a0;">Handling udført: <?=htmlspecialchars($_GET['msg'])?></p>
<?php endif; ?>
<h2>Orders</h2>
<table border="1" cellpadding="5">
<tr><th>ID</th><th>Artwork</th><th>Buyer</th><th>Amount</th><th>Status</th><th>PI ID</th><th>Actions</th></tr>
<?php foreach($orders as $o): ?>
<tr>
  <td><?=$o['id']?></td>
  <td><?=htmlspecialchars($o['title'])?> (<?=htmlspecialchars($o['artist_name'])?>)</td>
  <td><?=htmlspecialchars($o['buyer_email'])?></td>
  <td><?=number_format($o['amount_cents']/100,2)?> <?=htmlspecialchars($o['currency'])?></td>
  <td><?=htmlspecialchars($o['status'])?></td>
  <td><?=htmlspecialchars($o['stripe_pi_id'])?></td>
  <td>
    <?php if($o['status']==='deposited'): ?>
      <a href="?action=verify&order=<?=$o['id']?>">Verify</a> |
      <a href="?action=capture&order=<?=$o['id']?>">Capture</a>
    <?php endif; ?>
    <a href="invoice.php?order=<?=$o['id']?>">Invoice</a>
  </td>
</tr>
<?php endforeach; ?>
</table>

<h2>Payouts</h2>
<table border="1" cellpadding="5">
<tr><th>ID</th><th>Order</th><th>Seller</th><th>Amount</th><th>Commission</th><th>Status</th><th>Created</th></tr>
<?php foreach($payouts as $p): ?>
<tr>
  <td><?=$p['id']?></td>
  <td><?=$p['order_id']?></td>
  <td><?=htmlspecialchars($p['seller_name'])?></td>
  <td><?=number_format($p['amount_cents']/100,2)?></td>
  <td><?=number_format($p['commission_cents']/100,2)?></td>
  <td><?=htmlspecialchars($p['status'])?></td>
  <td><?=htmlspecialchars($p['created_at'])?></td>
</tr>
<?php endforeach; ?>
</table>

<p><a href="index.php">Tilbage til markedsplads</a></p>
</body>
</html>
